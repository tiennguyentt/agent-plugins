# tien-os marketplace

**Agent plugins for [Claude Code](https://claude.com/claude-code) and Codex — plan
rigorously, define success before building, build capabilities that stay governed, and
implement code test-first.**

Four plugins, each a single specialist agent with its own skills. Every plugin is
**standalone**: it reads only its own bundled files, works in any repository, and needs no
part of the private workspace it was developed in.

## Quickstart

Claude Code:

```
/plugin marketplace add tiennguyentt/tien-os-marketplace
```

Codex:

```
codex plugin marketplace add https://github.com/tiennguyentt/tien-os-marketplace
```

Then pick any plugin from `/plugin` (Claude Code) or install one directly:
`/plugin install behavior-implementer@tien-os-marketplace`.

## Repository layout

```
tien-os-marketplace/
├── .claude-plugin/
│   └── marketplace.json            Claude Code catalog
├── .agents/
│   └── plugins/
│       └── marketplace.json        Codex catalog
├── plugins/
│   └── agent-plugins/
│       ├── unknown-remover/        plan by removing unknowns
│       ├── eval-writer/            success criteria before building
│       ├── agent-builder/          build governed agent capabilities
│       └── behavior-implementer/   scenario-first BDD/TDD coding
│           ├── .claude-plugin/     Claude Code manifest
│           ├── .codex-plugin/      Codex manifest
│           ├── agents/             the dispatch wrapper
│           ├── skills/             the portable procedures
│           └── README.md           what it does
├── LICENSE                         MIT, Tiên's work
└── README.md                       this introduction
```

Every plugin follows the same anatomy shown expanded under `behavior-implementer`.

## Catalog

| Plugin | One job | Entry point |
|---|---|---|
| [`unknown-remover`](plugins/agent-plugins/unknown-remover) `1.1.0` | Plan by removing unknowns — one document at a time | `/unknown-remover:classify-unknown` |
| [`eval-writer`](plugins/agent-plugins/eval-writer) `1.0.0` | Define measurable success criteria before you build | `/eval-writer:write-success-criteria` |
| [`agent-builder`](plugins/agent-plugins/agent-builder) `2.3.0` | Build new agent capabilities, spec-first and eval-gated | `/agent-builder:create-capability` |
| [`behavior-implementer`](plugins/agent-plugins/behavior-implementer) `1.0.0` | Implement features scenario-first with BDD/TDD discipline | `/behavior-implementer:implement-behavior` |

Together they cover a build cycle: **plan** (unknown-remover) → **define success**
(eval-writer) → **assemble the capability** (agent-builder) → **implement the code**
(behavior-implementer). Each also stands alone.

### unknown-remover — planning by unknown-removal

Classifies what you don't know into four quadrants, picks the artifact form that retires
that unknown, and writes exactly one planning document at a time from a five-document
chain — never two, never out of order.

*Skills:* `classify-unknown` · `choose-artifact-form` · `discover-anatomy` ·
`write-chain-document`

### eval-writer — success criteria before code

Turns "how do I know if this works?" into SMART criteria, an evaluation design, example
test cases, and a grading-method recommendation. When nobody has a basis for a target yet,
it refuses to invent numbers and issues a discovery kit instead.

*Skills:* `write-success-criteria`

### agent-builder — capabilities that stay governed

Creates, evaluates, and packages one-agent-with-licensed-skills plugins. Runs an
architecture check (simplest adequate mechanism first — most requests don't need an agent),
writes the spec set, and refuses to build anything a signed spec hasn't licensed. Outside
its home workspace it runs in standalone mode with vendored spec forms and its own
confirmation gate.

*Skills:* `create-capability` · `evaluate-capability` · `package-plugin` · `no-ai-slop`

### behavior-implementer — code, test-first

Implements features behavior-first: natural-language Given/When/Then scenarios written
before any code, every scenario seen failing before it may pass, the three laws of TDD
during implementation, and a measured coverage/lint/complexity gate before every commit.
It never pushes without asking.

*Skills:* `write-scenarios` · `implement-behavior` · `gate-commit`

## Design principles

- **One agent, one job.** Every plugin is a specialist; none is a general-purpose helper.
- **Standalone by construction.** A plugin reads only its own bundled files and detects the
  host project's tooling instead of assuming any.
- **Evidence over self-report.** Skills report what a command actually printed; a check
  that was not run is reported `NOT RUN`, never guessed.
- **Nothing irreversible without a human.** No plugin pushes, publishes, signs off, or
  grants autonomy on its own.
- **Dual-host.** Each plugin ships both a Claude Code manifest (`.claude-plugin/`) and a
  Codex manifest (`.codex-plugin/`); the procedures live in shared skill files both hosts
  read.

## Verification status

Reported per plugin, honestly — installed is not proven.

| Plugin | Evaluation evidence |
|---|---|
| `unknown-remover` | 12/12 cases passing on Claude Code (2026-07-31) |
| `eval-writer` | licensed and installed; its 17 golden cases have not been run |
| `agent-builder` | 8/12 cases passing (2026-07-26, before standalone mode); not re-run since |
| `behavior-implementer` | new — no evaluation cases run yet |
| all four on Codex | manifests present; no completed live Codex invocation recorded |

## License

The repository [LICENSE](LICENSE) (MIT, © 2026 Tien Nguyen) covers Tiên's work.
Third-party material is declared per plugin and travels with every copy:

- `unknown-remover/NOTICE.md` — Thariq's method (credited; published openly, repository
  Apache-2.0) and the Apache-2.0 exemplar corpus with its own `LICENSE`.
- `eval-writer/NOTICE.md` — one reproduced Anthropic documentation page, declared in full.
- `agent-builder/skills/no-ai-slop/NOTICE.md` — the `no-ai-slop` editing skill by
  [Peter G Yang](https://github.com/petergyang/no-ai-slop), MIT; not Tiên's work.

Do not remove the NOTICE files when redistributing.

## Provenance

These plugins are developed in a private workspace (`tien-os`) and published here; changes
flow one way, from there to here. This repository is the clean consumer surface — plugins
and their licenses only, no workspace state and no evaluation run records.
