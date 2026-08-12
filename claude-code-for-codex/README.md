# Claude Code plugin for Codex

Use Claude Code from inside Codex for code reviews or to delegate tasks to Claude Code.

This is the inverse of OpenAI's [Codex plugin for Claude Code](https://github.com/openai/codex-plugin-cc):
same architecture, opposite direction of delegation. It is a port of that plugin, not an
independent design — see `NOTICE.md` for attribution and the Apache-2.0 terms it inherits.

## What you get

Codex invokes skills with a `$` prefix:

- `$claude-review` — a read-only Claude Code review of your changes
- `$claude-adversarial-review` — a steerable challenge review
- `$claude-rescue` — hand a substantial task to Claude Code
- `$claude-transfer` — hand the current Codex session across
- `$claude-status`, `$claude-result`, `$claude-cancel` — manage background jobs
- `$claude-setup` — check the runtime and toggle the stop-time review gate

Three knowledge skills back them: `claude-cli-runtime` (how to call the CLI),
`claude-result-handling` (how to present what comes back), and `opus-5-prompting` (how to write
the delegated prompt).

## Requirements

- **Claude Code CLI**, installed and authenticated. Usage counts against your Claude plan or API
  key.
- **Node.js 18.18 or later.**

## Install

Add this repository as a Codex marketplace, then install:

```bash
codex plugin marketplace add <path-or-url-to-agent-plugins>
codex plugin add claude-code-for-codex@agent-plugins
codex plugin list
```

`codex plugin list` must show the plugin as installed. An `enabled = true` line in
`~/.codex/config.toml` is not an install.

Then run `$claude-setup` in a Codex session to verify the runtime.

## Optional: the rescue subagent

`agents/claude-rescue.toml` is a Codex **project overlay**, not a plugin component — Codex plugin
manifests cannot ship subagents. To use it, copy it into a repository's `.codex/agents/`
directory:

```bash
mkdir -p <repo>/.codex/agents
cp agents/claude-rescue.toml <repo>/.codex/agents/
```

Without it, `$claude-rescue` still works; the overlay only adds stable repo-local routing.

## Optional: the stop-time review gate

Upstream hangs its review gate off Claude Code's `Stop` hook. **Codex has no `Stop` event** — its
hook vocabulary is `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PreCompact`, `PostCompact`,
`SessionStart`, `SessionEnd`, `UserPromptSubmit`, `SubagentStart`, `SubagentStop`. So the gate is
deliberately *not* wired in `hooks/hooks.json`; a `Stop` entry there would be a dead entry that
looks live.

Codex's equivalent turn-complete signal is the `notify` program. To opt in, add to
`~/.codex/config.toml`:

```toml
notify = ["node", "<plugin-root>/scripts/stop-review-gate-hook.mjs"]
```

Codex invokes it with the payload as a JSON argument
(`{"type":"agent-turn-complete","thread-id":…,"cwd":…,"last-assistant-message":…}`); the script
accepts that shape as well as a stdin Stop-hook payload.

One behavioral difference you should expect: `notify` is a notification, not a gate. It cannot
block or re-run a turn the way Claude Code's `Stop` hook can, so the review lands as feedback
after the turn ends rather than holding it open. For a blocking review, call `$claude-review`
directly.

## How it works

`scripts/claude-companion.mjs` is the single entrypoint every skill shells into. It drives the
`claude` CLI in headless streaming mode (`claude -p --output-format stream-json`), tracks
foreground and background jobs under `.claude-companion/` in the workspace, and renders results
for the calling Codex session. `hooks/hooks.json` wires the optional stop-time review gate.

## Structure

```
plugin.json                 agent-plugins.org 1.0.0 manifest, both host extensions
.codex-plugin/plugin.json   what Codex reads: skills, hooks, interface
.claude-plugin/plugin.json  Claude Code manifest (skills only)
skills/                     the 11 skills — the invocation surface in Codex
scripts/claude-companion.mjs  CLI dispatcher
scripts/lib/                transport, state, jobs, git, rendering
hooks/hooks.json            session lifecycle + stop-time review gate
prompts/, schemas/          review templates and the review output schema
agents/claude-rescue.toml   optional Codex project overlay (copy to .codex/agents/)
```
