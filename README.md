# tien-os-marketplace

Three installable agent plugins for Claude Code and Codex, published from the private
`tien-os` workspace. This repository is the clean consumer surface: plugins and their
licences only — no workspace, no personal state.

**v1.2.0 · Claude-verified.** `unknown-remover` has run all twelve of its evaluation
cases on Claude Code (2026-07-31) and passed. `agent-builder` has 8 of its 12 cases
run and passing (2026-07-26, before it gained standalone mode); none has re-run since.
`eval-writer` is licensed and installed but has never been invoked — its 17 golden
cases have not run. No completed Codex invocation exists for any of the three; the
Codex manifests are present and untested in a live host. Installed is not proven.

## Install

Claude Code:

```
/plugin marketplace add tiennguyentt/tien-os-marketplace
/plugin install unknown-remover@tien-os-marketplace
/plugin install eval-writer@tien-os-marketplace
/plugin install agent-builder@tien-os-marketplace
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
| `agent-builder` 2.3.0 | Creates, evaluates, and packages confirmed capabilities as one-agent-with-licensed-skills plugins | `/agent-builder:create-capability`, `:evaluate-capability`, `:package-plugin` |

`unknown-remover` and `eval-writer` are genuinely standalone: each reads only its own
bundled files. `agent-builder` used to refuse to run outside the `tien-os` workspace;
it joined this marketplace once it gained a standalone mode — vendored spec forms and
its own `Confirmed:`-gate script, detected at the start of every invocation. See its own
`README.md` for what each of the two modes does and does not grant.

## Licensing

The repository `LICENSE` (MIT, © 2026 Tien Nguyen) covers Tiên's work. Third-party
material is declared per plugin and travels with every copy:

- `plugins/agent-plugins/unknown-remover/NOTICE.md` — the bundled method corpus:
  Thariq's method (credited; published openly at
  <https://thariqs.github.io/html-effectiveness/unknowns/>, whose repository is
  Apache-2.0) and the Apache-2.0 exemplar corpus with its own `LICENSE` file.
- `plugins/agent-plugins/eval-writer/NOTICE.md` — one reproduced Anthropic
  documentation page, declared in full.
- `plugins/agent-plugins/agent-builder/skills/no-ai-slop/NOTICE.md` — the
  `no-ai-slop` editing skill, written by Peter G Yang and published under the
  MIT licence at <https://github.com/petergyang/no-ai-slop>; not Tiên's work
  and not covered by the repository `LICENSE`.

Do not remove the NOTICE files when redistributing.

## Provenance

The source of truth is the private `tien-os` workspace; changes flow one way, from
there to here. This export contains no evaluation evidence — the run records and
grading files live with the workspace.
