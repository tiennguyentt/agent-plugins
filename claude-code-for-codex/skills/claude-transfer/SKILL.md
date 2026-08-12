---
name: claude-transfer
description: >
  Transfer the current Codex session into a resumable Claude Code session and print the
  `claude --resume <session-id>` command to continue it. Use when a debugging or implementation
  conversation started in Codex and should continue with the same context directly in Claude Code
  — "move this conversation to Claude Code", "continue this in Claude", or "hand this session
  over." Takes an optional `--source <path>` override. Do NOT use for delegating a fresh task with
  no prior context — that is `claude-rescue`.
---

# claude-transfer

Creates a resumable Claude Code session from the current Codex session and prints a
`claude --resume <session-id>` command.

## What to do

```bash
node "${PLUGIN_ROOT}/scripts/claude-companion.mjs" transfer "$ARGUMENTS"
```

Present the command output to the user exactly as returned. Preserve the resulting Claude Code
session ID and the `claude --resume <session-id>` command.

## Argument handling

- `--source <path>` overrides the Codex session file to read from. Without it, the runtime resolves
  the current session automatically (mirrors upstream's `CODEX_TRANSCRIPT_PATH_ENV` /
  `SessionStart`-hook-supplied path, inverted to read the Codex side: `TRANSCRIPT_PATH_ENV` /
  `resolveCodexSessionPath(cwd, options)`).
- The source must resolve to a real Codex session under `~/.codex/sessions/` (indexed by
  `~/.codex/session_index.jsonl`) — confirmed present on this machine (`ls ~/.codex/sessions`,
  `~/.codex/session_index.jsonl`).

## How this differs from `claude import`

`claude import codex` is a real, separate command (`claude import --help`) — it imports *config*
(AGENTS.md, hooks, settings) from Codex into Claude Code's own configuration, not a session
transcript, and it never produces a resumable session ID. This skill does not use it. The transfer
this skill performs is the inverse of upstream's Claude→Codex transcript import: it reads the
Codex session transcript directly and constructs an equivalent Claude Code session using the
`--session-id <uuid>` / `-r, --resume [value]` machinery Claude Code exposes for its own sessions
(`claude --help`).

## Verified vs not

Verified: `claude --session-id <uuid>` and `-r, --resume [value]` exist (`claude --help`);
`claude import codex --dry-run` exists and imports configuration only, confirmed by running it —
it reported importable AGENTS.md/hooks/config items, not a session transcript, and wrote nothing.
NOT VERIFIED: the `claude-companion.mjs transfer` subcommand's exact read/write behavior and
whether Claude Code has any native mechanism to import a foreign transcript's turns as its own
session history beyond `--session-id` assignment — this is built elsewhere in this plugin
(`lib/codex-session-transfer.mjs`).
