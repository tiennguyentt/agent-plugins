/**
 * Transport-facing logic for driving the `claude` CLI the way upstream's lib/codex.mjs drove
 * `codex app-server`.
 *
 * UPSTREAM SHAPE (kept): the same exported surface (availability, auth, session runtime,
 * interrupt, review, transfer, turn, thread discovery, prompt/thread-name helpers, output
 * parsing) with the same result field names the rest of this plugin's tree reads.
 *
 * WHAT ACTUALLY CHANGED (forced by the transport substitution):
 * - Upstream configured each thread over JSON-RPC after connecting (`thread/start` params:
 *   model, sandbox, serviceName). The `claude` CLI bakes model, effort, permission mode,
 *   session id, display name, and JSON schema into process startup flags — there is no
 *   post-connect "configure this turn" call (see lib/app-server.mjs's buildClaudeArgs). So
 *   every run here connects DIRECTLY (`disableBroker: true`) with the full per-run argv.
 *   The shared broker child (spawned by app-server-broker.mjs with no options) exists only
 *   as the shared session that `interruptTurn` targets; a broker-mediated run would silently
 *   lose the pinned model, the JSON schema, and the session identity, so runs never go
 *   through it.
 * - There is no `serviceName` equivalent: claude has no app-server "service" concept, so the
 *   upstream SERVICE_NAME is dropped.
 * - Upstream's native `codex review` was an app-server RPC. Claude Code's built-in reviewer
 *   is the `/code-review` skill (present in the 2.1.226 binary); `runReview` drives it as a
 *   one-shot stream-json turn with a read-only tool whitelist.
 * - Upstream's transfer imported the Claude transcript into Codex over an RPC migration API.
 *   `claude import codex` imports CONFIG, not transcripts (verified: `claude import --help`
 *   says "Import config from another AI coding agent"), so `importExternalAgentSession`
 *   feeds the Codex rollout content into a fresh Claude session as its first user message
 *   and returns that session id for `claude --resume`.
 * - Upstream's `findLatestTaskThread` asked the app-server for a thread list. There is no
 *   such listing command in claude; instead the session transcript records the `--name`
 *   value as `{"type":"custom-title",...}` / `{"type":"agent-name",...}` on the FIRST lines
 *   of `~/.claude/projects/<slug>/<sessionId>.jsonl` (verified on this machine from the
 *   probe-name run, transcript 570A5AA6-...), so the finder scans those transcripts.
 * - Interrupt: upstream sent a JSON-RPC `turn/interrupt`. The claude stream-json control
 *   channel supports `{"type":"control_request","request_id":<uuid>,"request":
 *   {"subtype":"interrupt"}}` (verified live by the transport port — see lib/app-server.mjs
 *   header and the probe-interrupt.mjs record in the scratchpad). lib/claude.mjs calls the
 *   transport's `request("turn/interrupt")`, which performs that exact write; nothing is
 *   invented here. When no shared runtime is running there is nothing to interrupt, so the
 *   call reports `attempted: false` and the consumer's cancel falls back to
 *   `terminateProcessTree` (which claude-companion.mjs already does).
 */
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { readJsonFile, safeReadFile } from "./fs.mjs";
import { BROKER_ENDPOINT_ENV, ClaudeStreamClient } from "./app-server.mjs";
import { loadBrokerSession } from "./broker-lifecycle.mjs";
import { binaryAvailable, formatCommandFailure, runCommand } from "./process.mjs";

const TASK_THREAD_PREFIX = "Claude Companion Task";
const DEFAULT_CONTINUE_PROMPT =
  "Continue from the current thread state. Pick the next highest-value step and follow through until the task is resolved.";
const CLAUDE_PROJECTS_DIR = path.join(os.homedir(), ".claude", "projects");
const IMPORT_MAX_TRANSCRIPT_BYTES = 512 * 1024;

// Read-only tool whitelist for native reviews: git reads plus the file-inspection tools.
// Everything else (Edit/Write/Bash-in-general/Web*) is unavailable to a review session.
const REVIEW_ALLOWED_TOOLS = ["Bash(git *)", "Read", "Grep", "Glob"];

function cleanClaudeStderr(stderr) {
  return String(stderr ?? "")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line && line.trim())
    .join("\n");
}

/** @returns {Array<{ type: "text", text: string, text_elements: [] }>} */
function buildTurnInput(prompt) {
  return [{ type: "text", text: prompt, text_elements: [] }];
}

function shorten(text, limit = 72) {
  const normalized = String(text ?? "").trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "";
  }
  if (normalized.length <= limit) {
    return normalized;
  }
  return `${normalized.slice(0, limit - 3)}...`;
}

function buildTaskThreadName(prompt) {
  const excerpt = shorten(prompt, 56);
  return excerpt ? `${TASK_THREAD_PREFIX}: ${excerpt}` : TASK_THREAD_PREFIX;
}

function normalizeReasoningText(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

function extractReasoningSections(value) {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    const normalized = normalizeReasoningText(value);
    return normalized ? [normalized] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => extractReasoningSections(entry));
  }

  if (typeof value === "object") {
    if (typeof value.text === "string") {
      return extractReasoningSections(value.text);
    }
    if ("summary" in value) {
      return extractReasoningSections(value.summary);
    }
    if ("content" in value) {
      return extractReasoningSections(value.content);
    }
    if ("parts" in value) {
      return extractReasoningSections(value.parts);
    }
  }

  return [];
}

function mergeReasoningSections(existingSections, nextSections) {
  const merged = [];
  for (const section of [...existingSections, ...nextSections]) {
    const normalized = normalizeReasoningText(section);
    if (!normalized || merged.includes(normalized)) {
      continue;
    }
    merged.push(normalized);
  }
  return merged;
}

function emitProgress(onProgress, message, phase = null, extra = {}) {
  if (!onProgress || !message) {
    return;
  }
  if (!phase && Object.keys(extra).length === 0) {
    onProgress(message);
    return;
  }
  onProgress({ message, phase, ...extra });
}

function emitLogEvent(onProgress, options = {}) {
  if (!onProgress) {
    return;
  }

  onProgress({
    message: options.message ?? "",
    phase: options.phase ?? null,
    stderrMessage: options.stderrMessage ?? null,
    logTitle: options.logTitle ?? null,
    logBody: options.logBody ?? null
  });
}

// Claude has no sandbox flag; the closest verified lever is --permission-mode
// (`claude --help`, choices: acceptEdits, auto, bypassPermissions, manual, dontAsk, plan).
// The exact denial semantics of these modes were NOT live-verified (auth is not available
// on this machine), so the mapping is deliberate and documented:
//   - read-only -> "dontAsk": in non-interactive -p mode this is Claude's deny-by-default
//     posture (anything that would need permission is refused instead of prompting).
//   - workspace-write -> "auto": automatically accept tool permissions, matching Codex's
//     workspace-write approval policy.
// Native reviews override this to "auto" on purpose: the review session already restricts
// its tool set with REVIEW_ALLOWED_TOOLS, and "dontAsk" would deny even the whitelisted
// Bash(git *) reads the /code-review skill needs.
function permissionModeForSandbox(sandbox) {
  return sandbox === "workspace-write" ? "auto" : "dontAsk";
}

/**
 * Builds the connect() options for a run. Everything here lands in the spawned child's argv
 * (see lib/app-server.mjs buildClaudeArgs), which is why runs always connect direct.
 */
function buildClientOptions(options) {
  const clientOptions = {
    model: options.model ?? null,
    effort: options.effort ?? null,
    permissionMode: options.permissionMode ?? permissionModeForSandbox(options.sandbox),
    allowedTools: options.allowedTools ?? null,
    appendSystemPrompt: options.appendSystemPrompt ?? null,
    addDir: options.addDir ?? null,
    outputSchema: options.outputSchema ?? null,
    threadName: options.persistThread && options.threadName ? options.threadName : null,
    env: options.env ?? null
  };

  if (options.resumeThreadId) {
    clientOptions.resumeSessionId = options.resumeThreadId;
  } else {
    clientOptions.sessionId = crypto.randomUUID();
  }

  return clientOptions;
}

function createTurnCaptureState(options = {}) {
  return {
    sessionId: options.sessionId ?? null,
    turnId: null,
    lastAgentMessage: "",
    reviewText: "",
    reasoningSummary: [],
    touchedFiles: [],
    error: null,
    completed: false,
    onProgress: options.onProgress ?? null,
    assistantMessages: new Map(),
    processedAssistantMessages: new Set(),
    toolUses: new Map()
  };
}

function extractThinkingSections(block) {
  if (typeof block.thinking === "string" && block.thinking.trim()) {
    return [block.thinking];
  }
  if (Array.isArray(block.summary)) {
    return block.summary.flatMap((entry) => extractReasoningSections(entry));
  }
  return [];
}

function extractToolUse(block) {
  if (block?.type !== "tool_use" || !block.name) {
    return null;
  }
  const input = block.input && typeof block.input === "object" ? block.input : {};
  return {
    id: block.id ?? null,
    name: block.name,
    filePath:
      typeof input.file_path === "string"
        ? input.file_path
        : typeof input.notebook_path === "string"
          ? input.notebook_path
          : null
  };
}

function isEditTool(name) {
  return ["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(name);
}

function recordToolUse(state, toolUse) {
  if (!toolUse?.name || state.toolUses.has(toolUse.id)) {
    return;
  }
  state.toolUses.set(toolUse.id, toolUse);

  if (isEditTool(toolUse.name)) {
    if (toolUse.filePath) {
      state.touchedFiles.push(toolUse.filePath);
    }
    emitProgress(state.onProgress, `Applying ${toolUse.name} file change.`, "editing");
    return;
  }

  emitProgress(state.onProgress, `Running tool: ${toolUse.name}.`, "investigating");
}

function recordAssistantMessage(state, message) {
  const isPartial = message.is_partial === true;
  const uuid = typeof message.uuid === "string" ? message.uuid : null;

  if (uuid) {
    if (state.processedAssistantMessages.has(uuid)) {
      return;
    }
    state.assistantMessages.set(uuid, message);
    if (isPartial) {
      // A partial snapshot will be replaced by the complete message with the same uuid.
      return;
    }
    state.processedAssistantMessages.add(uuid);
  }

  const blocks = message.message?.content;
  if (!Array.isArray(blocks)) {
    return;
  }

  let text = "";
  const nextSections = [];
  for (const block of blocks) {
    if (block?.type === "text" && typeof block.text === "string") {
      text += block.text;
    } else if (block?.type === "thinking") {
      nextSections.push(...extractThinkingSections(block));
    } else if (block?.type === "tool_use") {
      recordToolUse(state, extractToolUse(block));
    }
  }

  if (text) {
    state.lastAgentMessage = text;
    emitLogEvent(state.onProgress, {
      message: `Assistant message captured: ${shorten(text, 96)}`,
      stderrMessage: null,
      phase: null,
      logTitle: "Assistant message",
      logBody: text
    });
  }

  if (nextSections.length > 0) {
    state.reasoningSummary = mergeReasoningSections(state.reasoningSummary, nextSections);
    emitLogEvent(state.onProgress, {
      message: `Reasoning summary captured: ${shorten(nextSections[0], 96)}`,
      stderrMessage: null,
      logTitle: "Reasoning summary",
      logBody: nextSections.map((section) => `- ${section}`).join("\n")
    });
  }
}

function handleStreamMessage(state, message) {
  if (!message || typeof message !== "object") {
    return;
  }

  if (message.type === "assistant") {
    recordAssistantMessage(state, message);
    return;
  }

  if (message.type === "stream_event") {
    // With --include-partial-messages, tool_use blocks also arrive as content_block_start
    // events. Deltas are ignored for text (the complete assistant message carries the final
    // text); tool uses are deduped by id so the event path cannot double-report.
    if (message.event?.type === "content_block_start" && message.event.content_block?.type === "tool_use") {
      recordToolUse(state, extractToolUse(message.event.content_block));
    }
    return;
  }

  if (message.type === "result" && message.session_id) {
    state.sessionId = state.sessionId ?? message.session_id;
  }
}

function finalMessageFor(result, state) {
  const structured = typeof result?.result === "string" && result.result.trim() ? result.result.trim() : "";
  if (structured) {
    return structured;
  }
  return state.lastAgentMessage;
}

function buildTurnFailureDescription(result, stderr) {
  const parts = [];
  if (result?.subtype && result.subtype !== "success") {
    parts.push(result.subtype);
  }
  const text = typeof result?.result === "string" ? result.result.trim() : "";
  if (text) {
    parts.push(shorten(text, 300));
  }
  const cleanStderr = cleanClaudeStderr(stderr);
  if (cleanStderr) {
    parts.push(shorten(cleanStderr, 300));
  }
  return parts.join(": ") || "Claude turn failed.";
}

/**
 * Runs one native stream-json turn on the given client and captures everything the run needs:
 * progress events (with the contract prefixes "starting claude", "session ready", "turn
 * started", "turn completed", "claude error:", "failed:") and the assistant/reasoning/tool
 * state that the result objects read back.
 */
async function captureClaudeTurn(client, sessionId, prompt, onProgress) {
  const state = createTurnCaptureState({ sessionId, onProgress });

  client.setNotificationHandler((message) => {
    if (message?.method === "claude/streamEvent") {
      handleStreamMessage(state, message.params?.message);
    }
  });

  emitProgress(onProgress, "turn started", "starting", { claudeSessionId: sessionId });

  let response;
  try {
    response = await client.request("turn/start", {
      threadId: sessionId,
      input: buildTurnInput(prompt)
    });
  } catch (error) {
    emitProgress(
      onProgress,
      `failed: ${error instanceof Error ? error.message : String(error)}`,
      "failed"
    );
    throw error;
  }

  state.turnId = response.turn?.id ?? null;
  state.sessionId = response.turn?.sessionId ?? state.sessionId ?? sessionId;
  const failed = response.turn?.status === "failed";

  if (failed) {
    const description = buildTurnFailureDescription(response.result, client.stderr);
    state.error = new Error(description);
    emitProgress(onProgress, `claude error: ${description}`, "failed");
  } else {
    emitProgress(onProgress, "turn completed", "finalizing");
  }

  return { response, state };
}

async function withClaudeStream(cwd, options, fn) {
  const client = await ClaudeStreamClient.connect(cwd, { ...options, disableBroker: true });
  try {
    return await fn(client);
  } finally {
    await client.close().catch(() => {});
  }
}

function buildNativeReviewPrompt(target) {
  if (target?.type === "baseBranch") {
    return `Run the built-in /code-review skill on the branch diff against ${target.branch}. Review only the changes in that diff, not the whole repository.`;
  }
  if (target?.type === "uncommittedChanges") {
    return "Run the built-in /code-review skill on the current uncommitted working-tree changes. Review only those changes, not the whole repository.";
  }
  throw new Error(`Unsupported review target: ${target?.type ?? "missing"}`);
}

export function getClaudeAvailability(cwd) {
  const versionStatus = binaryAvailable("claude", ["--version"], { cwd });
  if (!versionStatus.available) {
    return versionStatus;
  }

  const helpStatus = binaryAvailable("claude", ["--help"], { cwd });
  if (!helpStatus.available || !helpStatus.detail.includes("--output-format")) {
    return {
      available: false,
      detail: `${versionStatus.detail}; streaming runtime unavailable: claude --help does not list --output-format`
    };
  }

  return {
    available: true,
    detail: `${versionStatus.detail}; streaming runtime available`
  };
}

export function getSessionRuntimeStatus(env = process.env, cwd = process.cwd()) {
  const endpoint = env?.[BROKER_ENDPOINT_ENV] ?? loadBrokerSession(cwd)?.endpoint ?? null;
  if (endpoint) {
    return {
      mode: "shared",
      label: "shared session",
      detail: "This Codex session is configured to reuse one shared Claude runtime.",
      endpoint
    };
  }

  return {
    mode: "direct",
    label: "direct startup",
    detail: "No shared Claude runtime is active yet. Task and review runs spawn a dedicated Claude session per run.",
    endpoint: null
  };
}

function buildAuthStatus(fields = {}) {
  return {
    available: true,
    loggedIn: false,
    detail: "not authenticated",
    source: "unknown",
    authMethod: null,
    verified: null,
    requiresAnthropicAuth: null,
    provider: null,
    ...fields
  };
}

function parseClaudeAuthStatusOutput(result) {
  // `claude auth status --json` prints one JSON object and exits non-zero when logged out
  // (verified on this machine: `{loggedIn:false, authMethod:"none", apiProvider:"firstParty"}`
  // with exit 1). Status output contains no credential material; only booleans and method
  // names are read, never echoed to logs.
  const stdout = String(result.stdout ?? "").trim();
  if (!stdout) {
    return null;
  }
  try {
    const parsed = JSON.parse(stdout);
    if (parsed && typeof parsed === "object" && typeof parsed.loggedIn === "boolean") {
      return parsed;
    }
  } catch {
    // Not JSON (e.g. an older CLI's plain-text status); the caller falls back to the error path.
  }
  return null;
}

export async function getClaudeAuthStatus(cwd, options = {}) {
  const availability = getClaudeAvailability(cwd);
  if (!availability.available) {
    return {
      available: false,
      loggedIn: false,
      detail: availability.detail,
      source: "availability",
      authMethod: null,
      verified: null,
      requiresAnthropicAuth: null,
      provider: null
    };
  }

  const result = runCommand("claude", ["auth", "status", "--json"], {
    cwd,
    env: options.env ?? process.env
  });
  const parsed = parseClaudeAuthStatusOutput(result);
  const source = "claude-auth-status";

  if (parsed?.loggedIn === true) {
    const authMethod = typeof parsed.authMethod === "string" && parsed.authMethod ? parsed.authMethod : null;
    const provider = typeof parsed.apiProvider === "string" && parsed.apiProvider ? parsed.apiProvider : null;
    return buildAuthStatus({
      loggedIn: true,
      detail: `Logged in${authMethod ? ` via ${authMethod}` : ""}${provider ? ` (${provider})` : ""}`,
      source,
      authMethod,
      verified: true,
      requiresAnthropicAuth: false,
      provider
    });
  }

  if (parsed?.loggedIn === false) {
    return buildAuthStatus({
      loggedIn: false,
      detail: "Not logged in to Anthropic. Run `claude auth login` to authenticate.",
      source,
      authMethod: typeof parsed.authMethod === "string" ? parsed.authMethod : null,
      verified: false,
      requiresAnthropicAuth: true,
      provider: typeof parsed.apiProvider === "string" ? parsed.apiProvider : null
    });
  }

  return buildAuthStatus({
    loggedIn: false,
    detail: result.error ? result.error.message : formatCommandFailure(result),
    source
  });
}

export async function interruptTurn(cwd, { threadId, turnId }) {
  const availability = getClaudeAvailability(cwd);
  if (!availability.available) {
    return {
      attempted: false,
      interrupted: false,
      transport: null,
      detail: availability.detail
    };
  }

  let client = null;
  try {
    // The interrupt control channel (`control_request` subtype "interrupt", verified live in
    // lib/app-server.mjs) can only address the live turn of a running shared session. A fresh
    // direct child has no turn in flight, so only an existing shared runtime is targeted.
    client = await ClaudeStreamClient.connect(cwd, { reuseExistingBroker: true });
    if (client.transport !== "broker") {
      return {
        attempted: false,
        interrupted: false,
        transport: client.transport,
        detail: threadId
          ? `No shared Claude runtime is running the session ${threadId}.`
          : "No shared Claude runtime is active to interrupt."
      };
    }
    await client.request("turn/interrupt", { threadId: threadId ?? null, turnId: turnId ?? null });
    return {
      attempted: true,
      interrupted: true,
      transport: client.transport,
      detail: threadId
        ? `Interrupted the active Claude turn on ${threadId}.`
        : "Interrupted the active Claude turn."
    };
  } catch (error) {
    return {
      attempted: true,
      interrupted: false,
      transport: client?.transport ?? null,
      detail: error instanceof Error ? error.message : String(error)
    };
  } finally {
    await client?.close().catch(() => {});
  }
}

export async function runReview(cwd, options = {}) {
  const availability = getClaudeAvailability(cwd);
  if (!availability.available) {
    throw new Error("Claude Code CLI is not installed or is missing required runtime support. Install it with `npm install -g @anthropic-ai/claude-code`, then rerun `$claude-setup`.");
  }

  const prompt = buildNativeReviewPrompt(options.target);
  const clientOptions = buildClientOptions({
    ...options,
    sandbox: "read-only",
    permissionMode: "auto",
    allowedTools: REVIEW_ALLOWED_TOOLS,
    outputSchema: null,
    persistThread: false
  });
  const sessionId = clientOptions.resumeSessionId ?? clientOptions.sessionId;

  return withClaudeStream(cwd, clientOptions, async (client) => {
    emitProgress(options.onProgress, "starting claude", "starting");
    emitProgress(options.onProgress, "session ready", "starting", { claudeSessionId: sessionId });

    const { response, state } = await captureClaudeTurn(client, sessionId, prompt, options.onProgress);

    return {
      status: response.turn?.status === "completed" ? 0 : 1,
      threadId: sessionId,
      sourceThreadId: sessionId,
      turnId: state.turnId,
      reviewText: finalMessageFor(response.result, state),
      reasoningSummary: state.reasoningSummary,
      turn: response.turn ?? null,
      error: state.error,
      stderr: cleanClaudeStderr(client.stderr)
    };
  });
}

export async function importExternalAgentSession(cwd, options = {}) {
  const availability = getClaudeAvailability(cwd);
  if (!availability.available) {
    throw new Error("Claude Code CLI is not installed or is missing required runtime support. Install it with `npm install -g @anthropic-ai/claude-code`, then rerun `$claude-setup`.");
  }
  if (!options.sourcePath) {
    throw new Error("A Codex session source path is required.");
  }

  const sourcePath = options.sourcePath;
  const rawTranscript = fs.readFileSync(sourcePath, "utf8");
  const byteLength = Buffer.byteLength(rawTranscript, "utf8");
  const truncated = byteLength > IMPORT_MAX_TRANSCRIPT_BYTES;
  let transcript = rawTranscript;
  if (truncated) {
    // Keep the most recent events (the tail of a Codex rollout is the current state) and
    // cut at a newline so the first kept line is complete.
    const tail = rawTranscript.slice(-IMPORT_MAX_TRANSCRIPT_BYTES);
    const newlineIndex = tail.indexOf("\n");
    transcript = newlineIndex === -1 ? tail : tail.slice(newlineIndex + 1);
  }

  const prompt = [
    "Continue this Codex session in Claude Code. Pick up where Codex left off.",
    "",
    "Codex session transcript (JSONL, oldest first):",
    "```jsonl",
    transcript,
    "```",
    truncated ? "[The transcript was truncated to its most recent portion because of its size.]" : ""
  ]
    .filter(Boolean)
    .join("\n");

  emitProgress(options.onProgress, "Importing Codex session into Claude.", "transferring");

  const result = await runTurn(cwd, {
    ...options,
    prompt,
    sandbox: "read-only",
    persistThread: false,
    threadName: null,
    outputSchema: null
  });

  emitProgress(options.onProgress, `Codex session imported (${result.threadId}).`, "completed", {
    claudeSessionId: result.threadId
  });

  return {
    threadId: result.threadId,
    stderr: result.stderr
  };
}

export async function runTurn(cwd, options = {}) {
  const availability = getClaudeAvailability(cwd);
  if (!availability.available) {
    throw new Error("Claude Code CLI is not installed or is missing required runtime support. Install it with `npm install -g @anthropic-ai/claude-code`, then rerun `$claude-setup`.");
  }

  const prompt = options.prompt?.trim() || options.defaultPrompt || "";
  if (!prompt) {
    throw new Error("A prompt is required for this Claude run.");
  }

  const clientOptions = buildClientOptions(options);
  const sessionId = clientOptions.resumeSessionId ?? clientOptions.sessionId;

  return withClaudeStream(cwd, clientOptions, async (client) => {
    emitProgress(options.onProgress, "starting claude", "starting");
    if (options.resumeThreadId) {
      emitProgress(options.onProgress, `Resuming Claude session ${options.resumeThreadId}.`, "starting");
    }
    emitProgress(options.onProgress, "session ready", "starting", { claudeSessionId: sessionId });

    const { response, state } = await captureClaudeTurn(client, sessionId, prompt, options.onProgress);

    const failed = response.turn?.status === "failed";
    return {
      status: failed ? 1 : 0,
      threadId: sessionId,
      turnId: state.turnId,
      finalMessage: finalMessageFor(response.result, state),
      reasoningSummary: state.reasoningSummary,
      turn: response.turn ?? null,
      error: state.error,
      stderr: cleanClaudeStderr(client.stderr),
      // Claude's stream has no item-level fileChange/commandExecution events; touchedFiles is
      // derived from Edit/Write/MultiEdit/NotebookEdit tool uses.
      fileChanges: [],
      touchedFiles: state.touchedFiles,
      commandExecutions: []
    };
  });
}

function deriveClaudeProjectSlug(cwd) {
  // Observed on this machine: every ~/.claude/projects/<slug> dir is "-" plus the session
  // cwd with "/" replaced by "-" (e.g. /Users/tiennguyen/workspace -> -Users-tiennguyen-workspace,
  // /private/tmp/.../scratchpad -> -private-tmp-...-scratchpad). Backslashes are normalized
  // for Windows parity.
  return `-${String(cwd).replace(/[\\/]/g, "-")}`;
}

function readTaskThreadTitle(filePath) {
  const content = safeReadFile(filePath);
  const newlineIndex = content.indexOf("\n");
  const firstLine = (newlineIndex === -1 ? content : content.slice(0, newlineIndex)).trim();
  if (!firstLine) {
    return null;
  }
  try {
    const parsed = JSON.parse(firstLine);
    const title = parsed?.customTitle ?? parsed?.agentName ?? null;
    return typeof title === "string" && title.trim() ? title.trim() : null;
  } catch {
    return null;
  }
}

export function findLatestTaskThread(cwd) {
  const availability = getClaudeAvailability(cwd);
  if (!availability.available) {
    throw new Error("Claude Code CLI is not installed or is missing required runtime support. Install it with `npm install -g @anthropic-ai/claude-code`, then rerun `$claude-setup`.");
  }

  const projectDir = path.join(CLAUDE_PROJECTS_DIR, deriveClaudeProjectSlug(path.resolve(cwd)));
  let entries;
  try {
    entries = fs.readdirSync(projectDir, { withFileTypes: true });
  } catch {
    return null;
  }

  let best = null;
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".jsonl")) {
      continue;
    }
    const title = readTaskThreadTitle(path.join(projectDir, entry.name));
    if (!title || !title.startsWith(TASK_THREAD_PREFIX)) {
      continue;
    }
    let mtimeMs = 0;
    try {
      mtimeMs = fs.statSync(path.join(projectDir, entry.name)).mtimeMs;
    } catch {
      continue;
    }
    if (!best || mtimeMs > best.mtimeMs) {
      best = {
        id: entry.name.slice(0, -".jsonl".length),
        name: title,
        mtimeMs
      };
    }
  }

  return best ? { id: best.id, name: best.name } : null;
}

export function buildPersistentTaskThreadName(prompt) {
  return buildTaskThreadName(prompt);
}

export function parseStructuredOutput(rawOutput, fallback = {}) {
  if (!rawOutput) {
    return {
      parsed: null,
      parseError: fallback.failureMessage ?? "Claude did not return a final structured message.",
      rawOutput: rawOutput ?? "",
      ...fallback
    };
  }

  try {
    return {
      parsed: JSON.parse(rawOutput),
      parseError: null,
      rawOutput,
      ...fallback
    };
  } catch (error) {
    return {
      parsed: null,
      parseError: error.message,
      rawOutput,
      ...fallback
    };
  }
}

export function readOutputSchema(schemaPath) {
  return readJsonFile(schemaPath);
}

export { DEFAULT_CONTINUE_PROMPT, TASK_THREAD_PREFIX };
