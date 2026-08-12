#!/usr/bin/env node

import fs from "node:fs";
import process from "node:process";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { getClaudeAvailability } from "./lib/claude.mjs";
import { loadPromptTemplate, interpolateTemplate } from "./lib/prompts.mjs";
import { getConfig, listJobs } from "./lib/state.mjs";
import { sortJobsNewestFirst } from "./lib/job-control.mjs";
import { SESSION_ID_ENV } from "./lib/tracked-jobs.mjs";
import { resolveWorkspaceRoot } from "./lib/workspace.mjs";

const STOP_REVIEW_TIMEOUT_MS = 15 * 60 * 1000;
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const STOP_REVIEW_TASK_MARKER = "Run a stop-gate review of the previous Codex turn.";

// Two callers, two payload shapes.
//
// Codex has NO `Stop` hook event. Its hook vocabulary is exactly PreToolUse, PermissionRequest,
// PostToolUse, PreCompact, PostCompact, SessionStart, SessionEnd, UserPromptSubmit,
// SubagentStart, SubagentStop — verified against the `codex` binary. The only turn-complete
// signal Codex offers is the `notify` program in ~/.codex/config.toml, which is invoked with a
// JSON argv argument:
//   {"type":"agent-turn-complete","thread-id":…,"turn-id":…,"cwd":…,
//    "input-messages":[…],"last-assistant-message":"…"}
// Note the hyphenated keys — they differ from the snake_case a Claude Code Stop hook sends on
// stdin. We accept both so the same script serves either host.
function normalizeNotifyPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  if (payload.type !== "agent-turn-complete") {
    return payload;
  }
  return {
    ...payload,
    cwd: payload.cwd,
    session_id: payload["thread-id"] ?? payload.session_id ?? null,
    last_assistant_message: payload["last-assistant-message"] ?? payload.last_assistant_message ?? ""
  };
}

function readHookInput() {
  // Codex `notify` hands the payload as argv; a Stop hook pipes it on stdin.
  const argvPayload = process.argv.slice(2).find((arg) => arg.trim().startsWith("{"));
  if (argvPayload) {
    try {
      return normalizeNotifyPayload(JSON.parse(argvPayload));
    } catch {
      // Fall through to stdin rather than dying on an unparseable argument.
    }
  }
  let raw = "";
  try {
    raw = fs.readFileSync(0, "utf8").trim();
  } catch {
    return {};
  }
  if (!raw) {
    return {};
  }
  return normalizeNotifyPayload(JSON.parse(raw));
}

function emitDecision(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function logNote(message) {
  if (!message) {
    return;
  }
  process.stderr.write(`${message}\n`);
}

function filterJobsForCurrentSession(jobs, input = {}) {
  const sessionId = input.session_id || process.env[SESSION_ID_ENV] || null;
  if (!sessionId) {
    return jobs;
  }
  return jobs.filter((job) => job.sessionId === sessionId);
}

function buildStopReviewPrompt(input = {}) {
  const lastAssistantMessage = String(input.last_assistant_message ?? "").trim();
  const template = loadPromptTemplate(ROOT_DIR, "stop-review-gate");
  const codexResponseBlock = lastAssistantMessage
    ? ["Previous Codex response:", lastAssistantMessage].join("\n")
    : "";
  return interpolateTemplate(template, {
    CODEX_RESPONSE_BLOCK: codexResponseBlock
  });
}

function buildSetupNote(cwd) {
  const availability = getClaudeAvailability(cwd);
  if (availability.available) {
    return null;
  }

  const detail = availability.detail ? ` ${availability.detail}.` : "";
  return `Claude Code is not set up for the review gate.${detail} Run $claude-setup.`;
}

function parseStopReviewOutput(rawOutput) {
  const text = String(rawOutput ?? "").trim();
  if (!text) {
    return {
      ok: false,
      reason:
        "The stop-time Claude review task returned no final output. Run $claude-review --wait manually or bypass the gate."
    };
  }

  const firstLine = text.split(/\r?\n/, 1)[0].trim();
  if (firstLine.startsWith("ALLOW:")) {
    return { ok: true, reason: null };
  }
  if (firstLine.startsWith("BLOCK:")) {
    const reason = firstLine.slice("BLOCK:".length).trim() || text;
    return {
      ok: false,
      reason: `Claude stop-time review found issues that still need fixes before ending the session: ${reason}`
    };
  }

  return {
    ok: false,
    reason:
      "The stop-time Claude review task returned an unexpected answer. Run $claude-review --wait manually or bypass the gate."
  };
}

function runStopReview(cwd, input = {}) {
  const scriptPath = path.join(SCRIPT_DIR, "claude-companion.mjs");
  const prompt = buildStopReviewPrompt(input);
  const childEnv = {
    ...process.env,
    ...(input.session_id ? { [SESSION_ID_ENV]: input.session_id } : {})
  };
  const result = spawnSync(process.execPath, [scriptPath, "task", "--json", prompt], {
    cwd,
    env: childEnv,
    encoding: "utf8",
    timeout: STOP_REVIEW_TIMEOUT_MS
  });

  if (result.error?.code === "ETIMEDOUT") {
    return {
      ok: false,
      reason:
        "The stop-time Claude review task timed out after 15 minutes. Run $claude-review --wait manually or bypass the gate."
    };
  }

  if (result.status !== 0) {
    const detail = String(result.stderr || result.stdout || "").trim();
    return {
      ok: false,
      reason: detail
        ? `The stop-time Claude review task failed: ${detail}`
        : "The stop-time Claude review task failed. Run $claude-review --wait manually or bypass the gate."
    };
  }

  try {
    const payload = JSON.parse(result.stdout);
    return parseStopReviewOutput(payload?.rawOutput);
  } catch {
    return {
      ok: false,
      reason:
        "The stop-time Claude review task returned invalid JSON. Run $claude-review --wait manually or bypass the gate."
    };
  }
}

function main() {
  const input = readHookInput();
  // The Codex hook payload carries `cwd` directly — verified: the `codex` binary emits `cwd`
  // alongside `last_assistant_message` on turn-complete. Neither CODEX_PROJECT_DIR nor
  // CLAUDE_PROJECT_DIR appears anywhere in that binary, so there is no env fallback to try;
  // process.cwd() is the only real backstop.
  const cwd = input.cwd || process.cwd();
  const workspaceRoot = resolveWorkspaceRoot(cwd);
  const config = getConfig(workspaceRoot);

  const jobs = sortJobsNewestFirst(filterJobsForCurrentSession(listJobs(workspaceRoot), input));
  const runningJob = jobs.find((job) => job.status === "queued" || job.status === "running");
  const runningTaskNote = runningJob
    ? `Claude task ${runningJob.id} is still running. Check $claude-status and use $claude-cancel ${runningJob.id} if you want to stop it before ending the session.`
    : null;

  if (!config.stopReviewGate) {
    logNote(runningTaskNote);
    return;
  }

  const setupNote = buildSetupNote(cwd);
  if (setupNote) {
    logNote(setupNote);
    logNote(runningTaskNote);
    return;
  }

  const review = runStopReview(cwd, input);
  if (!review.ok) {
    emitDecision({
      decision: "block",
      reason: runningTaskNote ? `${runningTaskNote} ${review.reason}` : review.reason
    });
    return;
  }

  logNote(runningTaskNote);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
