# tien-os-marketplace

Two installable agent plugins for Claude Code and Codex, published from the private
`tien-os` workspace. This repository is the clean consumer surface: plugins and their
licences only — no workspace, no personal state.

**v1.0.0 · Claude-verified.** `unknown-remover` has run all twelve of its evaluation
cases on Claude Code (2026-07-31) and passed. `eval-writer` is licensed and installed
but has never been invoked — its 17 golden cases have not run. No completed Codex
invocation exists for either plugin; the Codex manifests are present and untested in a
live host. Installed is not proven.

## Install

Claude Code:

```
/plugin marketplace add tiennguyentt/tien-os-marketplace
/plugin install unknown-remover@tien-os-marketplace
/plugin install eval-writer@tien-os-marketplace
```

Codex:

```
codex plugin marketplace add https://github.com/tiennguyentt/tien-os-marketplace
codex plugin add unknown-remover@tien-os-marketplace
```

## The plugins

| Plugin | Job | Invoke |
|---|---|---|
| `unknown-remover` 1.1.0 | Classifies what you don't know, picks the artifact form that retires it, and writes one planning document at a time from a five-document chain | `/unknown-remover:classify-unknown`, `:choose-artifact-form`, `:write-chain-document`, `:discover-anatomy` |
| `eval-writer` 1.0.0 | Defines measurable success criteria and designs evaluations for any LLM task; refuses to invent targets nothing has measured | `/eval-writer:write-success-criteria` |

Both are genuinely standalone: they read only their own bundled files. A third plugin
in the source workspace, `agent-builder`, is deliberately absent — it refuses to run
without its governing control-plane documents, so shipping it here would ship a
refusal.

## Licensing

The repository `LICENSE` (MIT, © 2026 Tien Nguyen) covers Tiên's work. Third-party
material is declared per plugin and travels with every copy:

- `plugins/agent-plugins/unknown-remover/NOTICE.md` — the bundled method corpus:
  Thariq's method (credited; published openly at
  <https://thariqs.github.io/html-effectiveness/unknowns/>, whose repository is
  Apache-2.0) and the Apache-2.0 exemplar corpus with its own `LICENSE` file.
- `plugins/agent-plugins/eval-writer/NOTICE.md` — one reproduced Anthropic
  documentation page, declared in full.

Do not remove the NOTICE files when redistributing.

## Provenance

The source of truth is the private `tien-os` workspace; changes flow one way, from
there to here. This export contains no evaluation evidence — the run records and
grading files live with the workspace.
