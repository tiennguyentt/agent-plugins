# agent-plugins — repo law

This repo holds the working parts of the suite as installable agent plugins. The global
law is one file at `~/.agents/CONDUCT.md` (symlinked at `~/AGENTS.md`); it wins on
conflict. This file only adds what is specific to this repository.

## What this repo is

Six versioned Claude Code plugins, each in its own directory, published as the
`agent-plugins` marketplace (root: `.agents/plugins/marketplace.json`, remote:
`github.com/tiennguyentt/agent-plugins`):

- `agent-builder` 2.6.0 — creates agents, skills, workflows
- `behavior-implementer` 1.3.0 — scenario-first TDD implementation, gated commits
- `eval-writer` 1.3.0 — success criteria and eval design for LLM output
- `unknown-remover` 1.4.0 — names the unknown, writes exactly one document
- `ui-verifier` 1.1.0 — hands-free macOS app UI testing, dual-host
- `claude-code-for-codex` 1.0.1 — Claude Code delegation from Codex

## Rules specific to this repo

- Skills are the product. Every behavior ships as a skill under `<plugin>/skills/`
  with a SKILL.md, and every skill's claims stay measurable per the global honesty
  floor; ui-verifier never grades its own UI claims.
- Versioning is the contract. A change to a plugin bumps its version in
  `<plugin>/.claude-plugin/plugin.json` and the matching entry in
  `.agents/plugins/marketplace.json`; installed copies update from the marketplace.
- Dual host by default. Plugins live in Claude Code and are ported to Codex
  (`claude-code-for-codex` is the delegation bridge). A plugin meant for both hosts
  ships both; macOS-only tooling (ui-verifier's AX/vision stack) is declared as such.
- Third-party code keeps its attribution. `claude-code-for-codex` is a port of
  OpenAI's codex-plugin-cc and inherits Apache-2.0 via its NOTICE.md; ports state
  their provenance.
- Each plugin is a peer. None depends on another; install one or all in any order.
