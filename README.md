# Agent plugins — the working parts of TienOS

**TienOS is an autonomous workspace: agent teams that plan, decide, build, and check
their own work, with every step visible.** These four plugins are the part of it you can
install today, in Claude Code or Codex, without the rest of the system.

They cover the work that surrounds code and usually goes undone — figuring out what to
build, deciding what "working" means, giving your agent a new capability, and writing code
that earns its green.

Each is a specialist with one job. They are peers: install one, install all four, in any
order. None depends on another.

## Quickstart

**Claude Code**

```
/plugin marketplace add tiennguyentt/agent-plugins
/plugin install behavior-implementer@agent-plugins
```

**Codex**

```
codex plugin marketplace add https://github.com/tiennguyentt/agent-plugins
```

Or browse everything with `/plugin` and pick.

## Which one do you need?

| If you're about to… | Use | Start with |
|---|---|---|
| Write code for a new feature | **behavior-implementer** | `/behavior-implementer:implement-behavior` |
| Figure out what to build, or where to start | **unknown-remover** | `/unknown-remover:classify-unknown` |
| Judge whether an AI feature actually works | **eval-writer** | `/eval-writer:write-success-criteria` |
| Give your agent a new capability | **agent-builder** | `/agent-builder:create-capability` |

Used together they run a full cycle — plan, define success, build the capability, write the
code. Each is useful on its own.

---

### behavior-implementer `1.1.0`

**Code that earns its green.** Describe a feature in plain language; get Given/When/Then
scenarios back before a line is written. Every scenario is run and *seen to fail* first, so
a passing test means something. Implementation follows the three laws of TDD. Before any
commit, a gate measures your suite, coverage, linters, and complexity — and reports a check
it couldn't run as `NOT RUN` rather than passing it.

It never pushes without asking. Every time.

*Skills:* `write-scenarios` · `implement-behavior` · `gate-commit`

### unknown-remover `1.2.0`

**For when you don't know where to start.** It names which kind of unknown you're actually
holding, picks the document that retires it, and writes exactly one — never a stack of
documents you didn't ask for, never one out of order. Ships with 31 worked examples of what
good looks like.

*Skills:* `classify-unknown` · `choose-artifact-form` · `discover-anatomy` ·
`write-chain-document`

### eval-writer `1.1.0`

**"Is this LLM feature good?" — answered properly.** Turns a vague sense of quality into
measurable criteria, an evaluation design, real test cases, and a recommendation on how to
grade them. If there's no benchmark or prior measurement to anchor a target, it will not
invent a number — it hands you a discovery kit and says so.

*Skills:* `write-success-criteria`

### agent-builder `2.4.0`

**Capabilities that stay governed.** Checks whether your request needs an agent at all —
most don't — then writes the specs, the skill files, and an evaluation skeleton. It builds
drafts and never grants itself autonomy.

*Skills:* `create-capability` · `evaluate-capability` · `package-plugin` · `no-ai-slop`

---

## Before you install

**`behavior-implementer` works in any repository.** It carries every rule it applies and
detects your project's own test runner, linters, and coverage tools rather than assuming
them.

**The other three read files from the TienOS workspace** — templates, design tokens,
evaluation routes. They install anywhere, but outside that workspace they will stop and
name the file they're missing instead of guessing at it. If you want them fully portable,
that's a fair thing to open an issue about.

## What TienOS believes, and what these inherit

The plugins are opinionated because the system is. These are the rules they enforce on
themselves as much as on your work:

- **One agent, one job.** Every plugin is a specialist. None is a general-purpose helper,
  and none quietly answers a question another one owns.
- **Say what you need.** A plugin either carries its rules or names the file it can't find.
  It never fills a gap with a guess.
- **Evidence, not self-report.** Skills tell you what a command actually printed. A check
  that didn't run says `NOT RUN`. A maker never grades its own work — that's what the
  `rubric.md` beside a skill is for, and a different reviewer reads it.
- **Nothing irreversible without you.** No plugin pushes, publishes, signs off, or grants
  itself permission.
- **Visible while it works.** You see the step, not just the result. Work that runs dark
  doesn't count as working.
- **Two hosts, one procedure.** Claude Code and Codex read the same skill files, so behavior
  doesn't drift between them.
- **Portable by standard.** Every package follows
  [Agent Plugins 1.0.0](https://agent-plugins.org/specification), an open vendor-neutral
  format, so a client that speaks neither host's manifest can still read them.

## How much of this is proven?

These plugins ask you to report what a command actually printed. Same rule here — so
instead of a badge, here is where each one honestly stands.

| Plugin | Where it stands |
|---|---|
| `unknown-remover` | Passes all 12 of its test scenarios. The most exercised of the four. |
| `agent-builder` | Passed 8 of 12 at its last run, and hasn't been re-tested since. |
| `eval-writer` | 17 test cases written; none run yet. |
| `behavior-implementer` | The newest. Used daily; its own test cases aren't written yet. |

**Both hosts.** All four ship a Claude Code manifest and a Codex manifest, and read the same
skill files, so a procedure behaves the same on either. On Codex we've installed and used
`unknown-remover` so far; the other three are packaged and catalogued but not yet put
through a Codex session.

## What's in here

```
agent-plugins/
├── .claude-plugin/marketplace.json   Claude Code catalog
├── .agents/plugins/marketplace.json  Codex catalog
├── agent-builder/                    ┐
├── behavior-implementer/             │ four plugins, peers,
├── eval-writer/                      │ one directory each
├── unknown-remover/                  ┘
├── LICENSE
└── README.md
```

Inside a plugin, the shape is always the same:

```
<plugin>/
├── plugin.json                 portable manifest (Agent Plugins 1.0.0)
├── .claude-plugin/plugin.json  Claude Code manifest
├── .codex-plugin/plugin.json   Codex manifest
├── README.md                   what it does and what it needs
├── agents/<plugin>.md          the dispatch wrapper
└── skills/<job>/
    ├── SKILL.md                the procedure — always present
    ├── rubric.md               where a separate reviewer grades the output
    ├── <job>.workflow.js       where the job needs staged orchestration
    ├── scripts/                deterministic checks
    └── references/             bundled material the skill reads
```

Everything below `SKILL.md` appears only where that job earns it.

## License

The repository [LICENSE](LICENSE) (MIT, © 2026 Tien Nguyen) covers Tiên's work. Third-party
material is declared per plugin and travels with every copy — **please keep the `NOTICE.md`
files when you redistribute**:

- [`unknown-remover/NOTICE.md`](unknown-remover/NOTICE.md) — Thariq's planning method
  (credited; published openly, repository Apache-2.0) and the Apache-2.0 exemplar corpus.
- [`eval-writer/NOTICE.md`](eval-writer/NOTICE.md) — one reproduced Anthropic documentation
  page, declared in full.
- [`agent-builder/NOTICE.md`](agent-builder/NOTICE.md) — the `no-ai-slop` editing skill by
  [Peter G Yang](https://github.com/petergyang/no-ai-slop), MIT; not Tiên's work.

The Agent Plugins format is used under its own terms: specification text CC-BY-4.0, schemas
Apache-2.0, from the [Agent Plugins project](https://github.com/agentplugins/agent-plugins-spec).

## Where these come from

TienOS is built and used daily as a private workspace. These four plugins are published
from it, and changes flow one way — from there to here. This repository is the consumer
surface: plugins and their licenses, no workspace state, no internal run records.
