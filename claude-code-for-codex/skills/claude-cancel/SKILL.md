---
name: claude-cancel
description: >
  Cancel an ACTIVE background Claude Code job in this repository — stop a rescue, review, or
  adversarial-review run that is still in progress. Use for "stop that review", "cancel the
  rescue job", or "kill the background Claude Code run." Takes an optional job ID. Do NOT use this
  to check whether a job is running (`claude-status`) or to read a finished job's output
  (`claude-result`) — this only terminates, it never reports.
---

# claude-cancel

Cancels an active background Claude Code job through the claude-companion runtime.

## What to do

```bash
node "${PLUGIN_ROOT}/scripts/claude-companion.mjs" cancel "$ARGUMENTS"
```

Present the command output to the user as-is.

## When to use vs. its siblings

- `claude-cancel` — stops a running job. Nothing to cancel if the job already finished; check
  `claude-status` first if unsure.
- `claude-status` — reports whether a job is running, never stops it.
- `claude-result` — reads a finished job's stored output, never stops or reports on a running one.

## Verified vs not

NOT VERIFIED: the `claude-companion.mjs cancel` subcommand's exact behavior against a job the
`ClaudeStreamClient` transport is mid-turn on — the script is built elsewhere in this plugin.
