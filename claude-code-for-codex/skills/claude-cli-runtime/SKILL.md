---
name: claude-cli-runtime
description: >
  Internal helper contract for calling the claude-companion runtime from Codex. Not a
  user-invocable command — the `claude-rescue` agent is the only caller. Defines which
  claude-companion subcommand to use, how to strip routing flags before forwarding, and what the
  agent is and is not allowed to do beyond that single call.
user-invocable: false
---

# Claude Runtime

Use this skill only inside the `claude-rescue` agent.

Primary helper:

- `node "${PLUGIN_ROOT}/scripts/claude-companion.mjs" task "<raw arguments>"`

## Execution rules

- The rescue agent is a forwarder, not an orchestrator. Its only job is to invoke `task` once and
  return that stdout unchanged.
- Prefer the helper over hand-rolled `git`, direct `claude` CLI strings, or any other shell
  activity.
- Do not call `setup`, `review`, `adversarial-review`, `status`, `result`, `cancel`, or `transfer`
  from `claude-rescue`.
- Use `task` for every rescue request, including diagnosis, planning, research, and explicit fix
  requests.
- Use the `opus-5-prompting` skill to rewrite the user's request into a tighter Claude Code prompt
  before the single `task` call.
- That prompt drafting is the only Codex-side work allowed. Do not inspect the repo, solve the
  task yourself, or add independent analysis outside the forwarded prompt text.
- Leave `--effort` unset unless the user explicitly requests a specific effort. Claude Code's
  matching lever is `--effort <level>` — confirmed values `low, medium, high, xhigh, max`
  (`claude --help`), not the six-value scale upstream's Codex `task` uses. Pass through whatever
  value the user gave; do not remap it silently to a different scale.
- This plugin runs on **Opus 5 only**. `claude-opus-5` is pinned as the default and is the only
  model the runtime will resolve to; there is no cheaper or faster tier to select.
- Do not pass `--model`. It is unnecessary — an absent, empty, or unrecognized value all resolve
  to `claude-opus-5`. If the user asks for a different model, tell them the plugin is pinned to
  Opus 5 rather than silently running something else.
- Default to a write-capable Claude Code run unless the user explicitly asks for read-only
  behavior or only wants review, diagnosis, or research without edits. The write/no-write lever on
  the runtime side is the sandbox and permission configuration `claude-companion.mjs` passes to the
  underlying `claude -p` invocation, not a CLI flag this skill invents here.

## Command selection

- Use exactly one `task` invocation per rescue handoff.
- If the forwarded request includes `--background` or `--wait`, treat that as Codex-side execution
  control only. Strip it before calling `task`; do not treat it as part of the natural-language
  task text.
- If the forwarded request includes `--model`, strip it. The runtime pins `claude-opus-5`
  regardless, so passing it through only creates the impression of a choice that does not exist.
- If the forwarded request includes `--effort`, pass it through to `task`.
- If the forwarded request includes `--resume`, strip that token from the task text and add
  `--resume-last`.
- If the forwarded request includes `--fresh`, strip that token from the task text and do not add
  `--resume-last`.
- `--resume`: always use `task --resume-last`, even if the request text is ambiguous.
- `--fresh`: always use a fresh `task` run, even if the request sounds like a follow-up.
- `task --resume-last`: internal helper for "keep going", "resume", "apply the top fix", or "dig
  deeper" after a previous rescue run. Resuming is Claude Code's own `--session-id` /
  `-r, --resume [value]` machinery underneath (`claude --help`), addressed by whatever session
  identifier `claude-companion.mjs` tracked from the prior run.

## Safety rules

- Default to write-capable Claude Code work in `claude-rescue` unless the user explicitly asks for
  read-only behavior.
- Preserve the user's task text as-is apart from stripping routing flags.
- Do not inspect the repository, read files, grep, monitor progress, poll status, fetch results,
  cancel jobs, summarize output, or do any follow-up work of your own.
- Return the stdout of the `task` command exactly as-is.
- If the Bash call fails or Claude Code cannot be invoked, return nothing.

## Verified vs not

Verified: `claude --effort <level>` accepts `low, medium, high, xhigh, max`; `--session-id <uuid>`
and `-r, --resume [value]` exist for session continuation (`claude --help`). NOT VERIFIED: the
`claude-companion.mjs task` and `task --resume-last` subcommands' exact argument parsing and how
they map onto the underlying `claude -p --output-format stream-json ...` invocation — the script is
built elsewhere in this plugin.
