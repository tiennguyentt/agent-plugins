---
name: claude-setup
description: >
  Check whether the local `claude` CLI is installed, on PATH, and authenticated, and optionally
  toggle the stop-time review gate. Use for "is Claude Code set up", "check whether Claude Code is
  ready", "install Claude Code", or "turn on/off the review gate". This is a diagnostic and
  configuration skill only — it never runs a review, a rescue task, or any other job. Run this
  first whenever another claude-* skill reports Claude Code missing or unauthenticated.
---

# claude-setup

Checks whether Claude Code is ready to be driven by this plugin, and can toggle the optional
stop-time review gate.

## What to do

Run:

```bash
node "${PLUGIN_ROOT}/scripts/claude-companion.mjs" setup --json $ARGUMENTS
```

If the result says Claude Code is unavailable and `npm` is available:

- Ask the user once whether Codex should install Claude Code now, recommended option first:
  "Install Claude Code (Recommended)" vs. "Skip for now."
- If the user chooses install, run:

  ```bash
  npm install -g @anthropic-ai/claude-code
  ```

- Then rerun:

  ```bash
  node "${PLUGIN_ROOT}/scripts/claude-companion.mjs" setup --json $ARGUMENTS
  ```

If Claude Code is already installed or `npm` is unavailable, do not ask about installation.

## Output rules

- Present the final setup output to the user.
- If installation was skipped, present the original setup output.
- If Claude Code is installed but not authenticated, preserve the guidance to run `claude auth
  login` (verified: `claude auth` has `login`, `logout`, and `status` subcommands — `claude auth
  --help`).

## Review gate

```bash
node "${PLUGIN_ROOT}/scripts/claude-companion.mjs" setup --json --enable-review-gate
node "${PLUGIN_ROOT}/scripts/claude-companion.mjs" setup --json --disable-review-gate
```

This flag only sets the plugin's own config. It does not wire anything by itself, because
**Codex has no `Stop` hook event** — its hook vocabulary is `PreToolUse`, `PermissionRequest`,
`PostToolUse`, `PreCompact`, `PostCompact`, `SessionStart`, `SessionEnd`, `UserPromptSubmit`,
`SubagentStart`, `SubagentStop`. Upstream's gate depended on `Stop`, which does not exist here.

For the gate to actually fire, the user must also add a `notify` program to
`~/.codex/config.toml`, as documented in the plugin README:

```toml
notify = ["node", "<plugin-root>/scripts/stop-review-gate-hook.mjs"]
```

Tell the user this explicitly when they enable the gate — otherwise they will believe a review is
running when nothing is wired.

Even wired, `notify` is a notification rather than a gate: it cannot block or re-run a turn the
way Claude Code's `Stop` hook can, so the review arrives as feedback after the turn ends. For a
blocking review, use `$claude-review`. Enabling it still spends real Claude Code usage on every
completed turn — only enable it when the user plans to monitor the session.

## Verified vs not

Verified: `claude` resolves on PATH, version `2.1.226`
(`claude --version`); the installable npm package is `@anthropic-ai/claude-code`, and `npm view
@anthropic-ai/claude-code version` resolves to `2.1.226`, matching the installed binary; `claude
auth` exposes `login`, `logout`, and `status --json|--text` (`claude auth --help`, `claude auth
status --help`). NOT RUN: `claude auth status` and `claude auth login` were not executed by this
skill file — they touch credentials/session state and were out of scope for writing this
documentation. NOT VERIFIED: the `claude-companion.mjs setup` subcommand's exact JSON shape and
the review-gate hook wiring — both are built elsewhere in this plugin.
