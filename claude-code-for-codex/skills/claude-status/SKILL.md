---
name: claude-status
description: >
  Show active and recent Claude Code jobs for this repository, including review-gate status —
  running, queued, or recently finished rescue/review/adversarial-review jobs and their phase.
  Use for "is Claude Code still working", "what jobs are running", "check progress on the
  background review", or "show me the last few Claude Code runs." Takes an optional job ID,
  `--wait`, `--timeout-ms <ms>`, and `--all`. This is a status LIST/POLL only — it never returns a
  finished job's stored output (`claude-result`) and never stops a job (`claude-cancel`).
---

# claude-status

Shows running and recent Claude Code jobs for the current repository through the claude-companion
runtime.

## What to do

```bash
node "${PLUGIN_ROOT}/scripts/claude-companion.mjs" status "$ARGUMENTS"
```

If the user did not pass a job ID:

- Render the output as a single compact Markdown table of current and past runs in this session.
- Do not include progress blocks or extra prose outside the table.
- Preserve the actionable fields: job ID, kind, status, phase, elapsed or duration, summary, and
  follow-up commands.

If the user did pass a job ID:

- Present the full command output to the user. Do not summarize or condense it.

## When to use vs. its siblings

- `claude-status` — is a job running, and how far along is it. Never the finished payload.
- `claude-result` — the finished job's stored output. Use once `claude-status` shows the job as
  done.
- `claude-cancel` — stop an active job. Use when the user wants to abort, not to check on it.

## Verified vs not

NOT VERIFIED: the `claude-companion.mjs status` subcommand's exact output shape and job-tracking
fields — the script is built elsewhere in this plugin.
