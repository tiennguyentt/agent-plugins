# Agent plugins — the working parts of workspace

**workspace is an autonomous workspace: agent teams that plan, decide, build, and check
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

### unknown-remover `1.3.0`

**For when you don't know where to start.** It names which kind of unknown you're actually
holding, picks the document that retires it, and writes exactly one — never a stack of
documents you didn't ask for, never one out of order. Ships with 31 worked examples of what
good looks like.

*Skills:* `classify-unknown` · `choose-artifact-form` · `discover-anatomy` ·
`write-chain-document`

### eval-writer `1.2.0`

**"Is this LLM feature good?" — answered properly.** Turns a vague sense of quality into
measurable criteria, an evaluation design, real test cases, and a recommendation on how to
grade them. If there's no benchmark or prior measurement to anchor a target, it will not
invent a number — it hands you a discovery kit and says so.

*Skills:* `write-success-criteria`

### agent-builder `2.5.0`

**Capabilities that stay governed.** Checks whether your request needs an agent at all —
most don't — then writes the specs, the skill files, and an evaluation skeleton. It builds
drafts and never grants itself autonomy.

*Skills:* `create-capability` · `evaluate-capability` · `package-plugin` · `no-ai-slop`

---

## Works in your repo, not just ours

**All four run anywhere.** Each carries the files it needs — the spec forms, the theme, the
31 worked examples — inside the package. Nothing asks you to clone a workspace first.

`agent-builder` and `unknown-remover` will *also* pick up a workspace checkout's templates and
records if they happen to find one, and quietly skip them if they don't. What deliberately does
not ship is workspace's own law and evaluation routes: those are the rules of one workspace, and
handing you someone else's rules would be worse than shipping nothing.

## What workspace believes, and what these inherit

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

That table is the product working. These plugins refuse to report a check they didn't run —
and the rule doesn't get suspended for their own README. If you'd rather have a green badge
than a true one, this isn't the toolkit for you.

**Both hosts.** All four ship a Claude Code manifest and a Codex manifest, and read the same
skill files, so a procedure behaves the same on either. On Codex we've installed and used
`unknown-remover` so far; the other three are packaged and catalogued but not yet put
through a Codex session.

## Fork it — it's all just Markdown

No build step, no SDK, nothing to compile. A plugin is a folder of text: `SKILL.md` is the
procedure the agent follows, `rubric.md` is the standard a separate reviewer grades it
against. You can read every rule these apply in about ten minutes, and change any of them
with a text editor.

Worth forking for:

- **Your definition of done.** `behavior-implementer/skills/gate-commit/SKILL.md` is the
  commit gate. Move the coverage target, add your linter, delete a check you don't run.
- **Your house style.** `unknown-remover` writes from a five-document chain and ships 31
  worked examples. Swap in your own and it writes like your team does.
- **Your review bar.** Every `rubric.md` is a file, not a prompt buried in code — which is
  exactly what makes a cheaper, faster model viable as the reviewer.

```
git clone https://github.com/tiennguyentt/agent-plugins
/plugin marketplace add /full/path/to/agent-plugins
```

A marketplace can be added from a directory, so your fork installs exactly the way this repo
does — no republishing, no waiting on us to merge. That's not a theory: it's how these are
loaded while they're being built.

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

workspace is a private workspace where agent teams plan, build and check their own work with
every step visible. These four plugins are the part of it that stands on its own, and
**this repository is where they are maintained** — edits land here directly. What stays
behind is workspace state and internal run records, nothing you'd want in your repo anyway.

## Found something wrong?

[Open an issue.](https://github.com/tiennguyentt/agent-plugins/issues) The most useful ones
name the file and quote what it told you to do — these are procedures, so a bad instruction
is a reproducible bug, not a matter of taste.

Pull requests are welcome on any of the four. If you fork one and bend it to your team, that
counts as it working; if you send the change back, everyone else gets it too.
