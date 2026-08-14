# eval-writer plugin

One independent agent plugin in the `agent-plugins` marketplace:

```text
Distribution mode: dual
Standalone entry: `write-success-criteria` runs on any LLM-based task, product or feature using its two bundled forms; nothing else required
Portable core: `skills/`
Portable entry skill: `write-success-criteria`
Bundled equivalents: `references/forms/skill-spec.md` -> `skills/write-success-criteria/references/forms/skill-spec.md`, `references/forms/agent-spec.md` -> `skills/write-success-criteria/references/forms/agent-spec.md`

Codex project agent: not licensed
```

```text
eval-writer/
├── plugin.json                  portable manifest — Agent Plugins 1.0.0
├── .claude-plugin/plugin.json   Claude Code adapter
├── .codex-plugin/plugin.json    Codex adapter
├── NOTICE.md                    third-party attribution — read before redistributing
├── agents/
│   └── eval-writer.md           exactly one Claude agent definition
└── skills/
    └── write-success-criteria/  portable entry — and the only skill
        ├── SKILL.md
        ├── rubric.md            producer-independent grading standard
        └── references/          the source procedure this skill corrects
```

## One part of a bigger system, shared on purpose

This is one of several agent plugins in this repository, where agent teams do
the work end to end. It is published on its own because a part that only runs inside the repo
that grew it is not a part — it is a dependency.

**Built for a team, not for a demo.** One skill with one job, invocable without the agent. Its
grading standard is a `rubric.md` file read by an agent that did *not* produce the work — which
is exactly what makes a cheaper, independent verifier viable. The packaging is checked by
machine: `plugin.json` conforms to Agent Plugins 1.0.0, and a contract check fails the build
when the manifests, the entry skill, or the routes drift apart.

**What is not measured says so.** The golden set holds 17 cases and **none of them has run** —
recorded as a skeleton, never reported as a pass.

**Dual, and the common case needs nothing.** Designing an evaluation for any LLM-based task,
product or feature requires nothing else installed. The two `references/forms/` sections the
skill reads when its subject is specifically a capability now travel with it, bundled at
`skills/write-success-criteria/references/forms/` and compared to their source on every check run
(check 15). This block said "repo-bound" until 2026-08-07, when those two files were vendored.

## Package format

This package follows **Agent Plugins 1.0.0**, an open, vendor-neutral standard from the Agent
Plugins project — specification <https://agent-plugins.org/specification>, repository
<https://github.com/agentplugins/agent-plugins-spec>. Specification text is licensed CC-BY-4.0,
its schemas Apache-2.0. this repository adopted it on 2026-08-07 after Google's announcement of the
format, <https://developers.googleblog.com/agent-plugins-package-your-skills-tools-and-more/>.

The package *conforms to* that standard and vendors none of its files: `plugin.json` is written
here, and `$schema` is a URL pointing at theirs. Nothing in this plugin is authored by the Agent
Plugins project — for what this plugin *does* bundle from elsewhere, read `NOTICE.md`.

No optional Codex project overlay exists for this plugin. The bare portable skill is the whole Codex
route: `$eval-writer:write-success-criteria`.

The plugin has exactly one logical role, one packaged Claude agent adapter, and one licensed skill.
`write-success-criteria` is both the portable entry skill and the only skill — a second skill was not
invented to look symmetrical with `agent-builder`'s three
(the consuming repo's own rules file, when it has one).

`SKILL.md` is required, as always. `rubric.md` is written because the skill's output is a set of
graded claims (SMART criteria, a chosen regime, a grading method) that the skill that produced them is
the worst party to confirm. No `write-success-criteria.workflow.js` exists: the procedure is one
continuous contextual pass per subject, with no repeated fan-out, no pipeline stage, and no per-stage
model tier to name. The full reasoning is in this capability's spec, §7.

The skill has two modes, decided before anything else runs. When a real basis for a target exists (a
benchmark, a prior measurement, a stated expert judgment), it produces SMART success criteria and an
eval design. When none exists, it produces a discovery kit instead — real inputs to sort into good,
bad, and unsure, with reasons recorded for every "bad," rather than an invented number.

## Runtime boundary

The portable `write-success-criteria` skill owns the entire cross-host procedure. The Claude agent
adds only a session-wide `tools:` bound (`Read`, `Grep`, `Glob`, `Write` — no `Bash`, no `Edit`) and a
pointer to the skill; it holds no procedure of its own. This makes `eval-writer` an explicitly
repo-bound plugin when its subject is a capability — it opens
`references/forms/skill-spec.md` §7 and `references/forms/agent-spec.md` §10 for the
10–30-case regime in that case — and a general-purpose one otherwise, falling back to the reference
material's own volume-over-quality guidance when the subject is not a capability or those
files do not resolve.

The plugin has no MCP server, command, monitor, hook, or eval-execution runtime. It designs
evaluations; it does not run them.

## Evaluation boundary

Evaluation is not a hook. The golden cases and any run records for this skill's own behavior remain
development evidence at `.agent-builder/evaluation/eval-writer/`, outside the installable
plugin — the same boundary `agent-builder` uses.

## Host compatibility

Claude Code reads `.claude-plugin/plugin.json`, the shared `skills/`, and the packaged definition
under `agents/`. Codex reads `.codex-plugin/plugin.json` and the same shared `skills/`. No Codex
project custom-agent TOML is licensed for this plugin; bare-plugin compatibility through the shared
entry skill is the whole Codex contract.
