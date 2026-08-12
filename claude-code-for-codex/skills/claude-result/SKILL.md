---
name: claude-result
description: >
  Show the stored final output for a FINISHED Claude Code job in this repository — the completed
  verdict, summary, findings, and next steps of a rescue, review, or adversarial-review run. Use
  for "what did Claude Code find", "show me the review results", or "get the output of that
  rescue task." Takes an optional job ID. Do NOT use this to check whether a job is still running
  (`claude-status`) or to stop one (`claude-cancel`) — this only fetches output for a job that has
  already completed.
---

# claude-result

Shows the final stored output for a finished Claude Code job through the claude-companion runtime.

## What to do

```bash
node "${PLUGIN_ROOT}/scripts/claude-companion.mjs" result "$ARGUMENTS"
```

Present the full command output to the user. Do not summarize or condense it. Preserve all
details, including:

- Job ID and status
- The complete result payload — verdict, summary, findings, details, artifacts, next steps
- File paths and line numbers exactly as reported
- Any error messages or parse errors
- Follow-up commands such as `claude-status <id>` and `claude-review`

## When to use vs. its siblings

- `claude-result` — the finished payload. If the job is still running, this returns nothing useful
  — check `claude-status` first.
- `claude-status` — is the job running, and how far along.
- `claude-cancel` — stop a job. Never fetches output.

## Verified vs not

NOT VERIFIED: the `claude-companion.mjs result` subcommand's exact output shape — the script is
built elsewhere in this plugin.
