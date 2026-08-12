import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ensureAbsolutePath } from "./fs.mjs";

// Upstream's env var is CODEX_COMPANION_TRANSCRIPT_PATH (naming map: CODEX_COMPANION_* ->
// CLAUDE_COMPANION_*). The contract for this file names the env var explicitly, so it is
// spelled out here rather than derived mechanically.
export const TRANSCRIPT_PATH_ENV = "CLAUDE_COMPANION_TRANSCRIPT_PATH";

const CODEX_SESSIONS_DIR = path.join(os.homedir(), ".codex", "sessions");

function resolveUserPath(cwd, value) {
  if (value === "~") {
    return os.homedir();
  }
  if (String(value).startsWith("~/")) {
    return path.join(os.homedir(), String(value).slice(2));
  }
  return ensureAbsolutePath(cwd, value);
}

// Recursively collect every *.jsonl rollout file under ~/.codex/sessions/.
//
// Observed layout on this machine (`find ~/.codex/sessions -maxdepth 4 -type d`, 2026-08-10):
//   ~/.codex/sessions/<YYYY>/<MM>/<DD>/rollout-<YYYY-MM-DDTHH-MM-SS>-<uuid>.jsonl
// 172 files total (`find ~/.codex/sessions -type f -name "*.jsonl" | wc -l`), spanning
// 2026-07-31 through 2026-08-10. No file elsewhere in ~/.codex/ matched this shape.
function listCodexSessionFiles(dir) {
  const results = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listCodexSessionFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
      results.push(entryPath);
    }
  }
  return results;
}

// Read only the first line of a rollout file and parse it as the session_meta event.
//
// Verified against ALL 172 rollout files on this machine (not just a sample): every file's
// first line is `{"type":"session_meta","payload":{...}}`, and `payload` always carries a
// `cwd` string and a `timestamp` ISO string. `payload.id` is the rollout's own id (matches
// the filename's uuid); `payload.session_id` is the id of the ORIGINATING session and can
// differ from the filename for a forked/subagent thread (observed on
// rollout-2026-08-10T17-59-17-019feb53-....jsonl, whose payload.session_id points at its
// parent thread while payload.id matches the filename) — so `id` is what identifies this
// specific rollout, not `session_id`.
function readSessionMeta(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
  const newlineIndex = raw.indexOf("\n");
  const firstLine = newlineIndex === -1 ? raw : raw.slice(0, newlineIndex);
  if (!firstLine.trim()) {
    return null;
  }
  let parsed;
  try {
    parsed = JSON.parse(firstLine);
  } catch {
    return null;
  }
  if (parsed?.type !== "session_meta" || !parsed.payload || typeof parsed.payload !== "object") {
    return null;
  }
  return parsed.payload;
}

// Discover the most recently updated Codex rollout recorded against `targetCwd`.
//
// ~/.codex/session_index.jsonl is NOT a general session index: it only lists threads that
// were given a custom `thread_name` (9 of 172 rollout files on this machine, all named
// "Codex Companion Task: ..."), verified by matching every index id against the rollout
// filenames on disk. It cannot answer "what is the latest session for this directory", so
// discovery scans the rollout files' session_meta directly instead of trusting the index.
function discoverLatestCodexSessionPath(targetCwd) {
  const files = listCodexSessionFiles(CODEX_SESSIONS_DIR);
  let best = null;
  for (const filePath of files) {
    const meta = readSessionMeta(filePath);
    if (!meta || meta.cwd !== targetCwd) {
      continue;
    }
    const timestamp = typeof meta.timestamp === "string" ? meta.timestamp : "";
    if (!best || timestamp > best.timestamp) {
      best = { filePath, timestamp };
    }
  }
  return best ? best.filePath : null;
}

export function resolveCodexSessionPath(cwd, options = {}) {
  const requestedPath = options.source || process.env[TRANSCRIPT_PATH_ENV];

  if (requestedPath) {
    const sourcePath = resolveUserPath(cwd, requestedPath);
    if (path.extname(sourcePath) !== ".jsonl") {
      throw new Error(`Codex session source must be a JSONL file: ${sourcePath}`);
    }

    let source;
    let sessionsRoot;
    try {
      source = fs.realpathSync(sourcePath);
      sessionsRoot = fs.realpathSync(CODEX_SESSIONS_DIR);
    } catch {
      throw new Error(`Codex session file not found: ${sourcePath}`);
    }
    const relative = path.relative(sessionsRoot, source);
    if (relative === "" || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error(`Claude can import Codex sessions only from ${CODEX_SESSIONS_DIR}: ${source}`);
    }
    return source;
  }

  // No explicit --source and no env override: discover the latest rollout recorded against
  // this cwd. Returns null (never a guess) when no rollout matches — the caller is
  // responsible for telling the user to pass --source explicitly in that case.
  const targetCwd = ensureAbsolutePath(cwd, cwd);
  return discoverLatestCodexSessionPath(targetCwd);
}
