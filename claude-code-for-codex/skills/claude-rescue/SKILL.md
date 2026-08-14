---
name: claude-rescue
description: >
  Hand a substantial coding task to Claude Code through the claude-companion runtime — an
  investigation, an explicit fix request, or a follow-up on a task Claude Code already started.
  Use when Codex is stuck, wants a second implementation or diagnosis pass from a different model
  family, or should delegate a multi-step debugging or implementation job outright. Takes
  `--background`/`--wait`, `--resume`/`--fresh`, `--model`, and `--effort`. Do NOT use this to poll
  a job already running (`claude-status`), to fetch a finished job's stored output
  (`claude-result`), or to stop one (`claude-cancel`) — those act on a rescue this skill already
  started, they never start one themselves.
---

# claude-rescue

Hands a task to Claude Code through the `claude-rescue` agent (`agents/claude-rescue.toml`), which is
a thin forwarder around the claude-companion runtime. Do not do the task yourself and do not
inspect the repository first — forward the raw request and return what comes back.

## When to use

- "investigate why the tests started failing"
- "fix the failing test with the smallest safe patch"
- "continue the last Claude Code task" / "apply the top fix" / "dig deeper"
- "have Claude Code take a pass at this"
- Codex itself is stuck on a multi-step debugging or implementation job and should hand it off to
  a different model family for a second pass.

**Do NOT use if:** the user wants to check on a job that is already running or finished — that is
`claude-status` (running/recent jobs) or `claude-result` (a finished job's stored output). Do NOT
use to stop a job — that is `claude-cancel`. Do NOT use for a plain review of existing changes —
that is `claude-review` or `claude-adversarial-review`.

## What to do

1. Take the raw user request as-is.
2. Determine execution mode:
   - `--background` in the request → run the `claude-rescue` agent in the background.
   - `--wait` in the request → run it in the foreground.
   - Neither flag → default to foreground for a small, clearly bounded request; prefer background
     when the task looks complicated, open-ended, multi-step, or likely to run Claude Code for a
     long time.
3. `--effort` is a runtime-selection flag: preserve it for the forwarded call, but strip it out of
   the natural-language task text so it is not treated as part of the prompt. Leave it unset unless
   the user explicitly asks for a value.
   Do not pass `--model`. This plugin is pinned to Opus 5 (`claude-opus-5`) and the runtime
   resolves every request to it, so there is no cheaper or faster tier to select. Strip `--model`
   from the task text, and if the user asks for a different model, say the plugin is pinned rather
   than running something else silently.
4. `--resume` / `--fresh` are routing flags, not task text:
   - `--resume` present → do not ask whether to continue; add `--resume` when forwarding.
   - `--fresh` present → do not ask; add `--fresh` when forwarding.
   - Neither present → check for a resumable rescue thread first:

     ```bash
     node "${PLUGIN_ROOT}/scripts/claude-companion.mjs" task-resume-candidate --json
     ```

     If it reports `available: true`, ask the user once whether to continue the current Claude
     Code thread or start a new one, before routing. If the request reads as a follow-up
     ("continue", "keep going", "resume", "apply the top fix", "dig deeper"), put continuing first
     as the recommended choice; otherwise put starting fresh first. If it reports
     `available: false`, do not ask — route normally.
5. Dispatch the `claude-rescue` agent with the raw request (minus the routing flags) as its prompt.
   The agent is the only thing that talks to `claude-companion.mjs task`; this skill never calls the
   script directly.
6. Return the agent's output verbatim. Do not paraphrase, summarize, rewrite, or add commentary
   before or after it.
7. If the runtime reports Claude Code is missing or unauthenticated, stop and point the user at
   `claude-setup`. Do not improvise an alternate way to reach Claude.

## What you never do

- Never inspect the repository, read files, or do independent analysis outside shaping the
  forwarded prompt text — that work belongs to `claude-cli-runtime` and the agent, not this skill.
- Never poll status, fetch results, or cancel a job from inside this flow.
- Never turn a failed or incomplete Claude Code run into a Codex-side implementation attempt.

## Verified vs not

Verified: the `claude` binary on PATH (version 2.1.226) supports
`-p/--print`, `--session-id <uuid>`, `-r/--resume [value]`, `--fork-session`, `--output-format`,
`--input-format`, and `--include-partial-messages` (`claude --help`). NOT VERIFIED: the exact
`claude-companion.mjs task-resume-candidate` and `task` subcommand behavior — the script itself is
built elsewhere in this plugin, not by this skill file.
