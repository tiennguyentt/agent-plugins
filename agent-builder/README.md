# agent-builder plugin

One independent agent plugin in the `agent-plugins` marketplace:

Distribution mode: dual
Standalone entry: `create-capability` walks for a `.git` root, finds no `CORE/GUARDRAILS.md`, and runs its refuse-and-scaffold path off the four bundled forms
Portable core: `skills/`
Portable entry skill: `create-capability`
Bundled equivalents: `engine/templates/agent-spec.md` -> `skills/create-capability/references/forms/agent-spec.md`, `engine/templates/skill-spec.md` -> `skills/create-capability/references/forms/skill-spec.md`, `engine/templates/workflow-spec.md` -> `skills/create-capability/references/forms/workflow-spec.md`, `engine/templates/agent-plugin-spec.md` -> `skills/create-capability/references/forms/agent-plugin-spec.md`
Workspace-mode extras: `CLAUDE.md`, `CORE/`, `engine/`, `records/`, `state/`, `studio/`
Codex project agent: optional overlay

The last three joined the list on 2026-08-07. They were always used — `CORE/GUARDRAILS.md`
for the law a build may not cross, `evaluation-plane/` for the eval route a capability owes, and
`graph-plane/` for the trace a run has to land in — but the declaration named only the first three,
so three real runtime dependencies travelled undeclared.

```text
engine/agent-plugins/agent-builder/
├── plugin.json                  portable manifest — Agent Plugins 1.0.0
├── .claude-plugin/plugin.json   Claude Code adapter
├── .codex-plugin/plugin.json    Codex and ChatGPT adapter
├── NOTICE.md                    third-party attribution — read before redistributing
├── agents/
│   └── agent-builder.md         exactly one Claude agent definition
└── skills/
    ├── create-capability/       portable entry + Claude workflow adapter
    │   ├── SKILL.md
    │   ├── create-capability.workflow.js   the Claude orchestration adapter
    │   ├── references/forms/    the four spec templates it fills
    │   └── scripts/             the `Confirmed:` gate it runs
    ├── evaluate-capability/     independent review
    │   ├── SKILL.md
    │   └── rubric.md            read by a verifier that did not produce the work
    ├── package-plugin/          dual-host packaging procedure
    │   └── SKILL.md
    └── no-ai-slop/              third-party — see NOTICE.md
        ├── SKILL.md
        ├── NOTICE.md
        └── references/
```

## One part of a bigger system, shared on purpose

This is one of four agent plugins in **the workspace**, a governed-agent where governed agent teams do
the work end to end. It is published on its own because a part that only runs inside the repo
that grew it is not a part — it is a dependency.

**Built for a team, not for a demo.** Four skills, one job each, each independently invocable
without the agent. Grading standards live in `rubric.md` files read by an agent that did *not*
produce the work. The packaging is checked by machine: `plugin.json` conforms to Agent Plugins
1.0.0, and a contract check fails the build when the manifests, the entry skill, or the routes
drift apart.

**Dual, and it proves it rather than promising it.** `create-capability` walks for a `.git`
root; if no `CORE/GUARDRAILS.md` is there, it runs standalone off the four spec forms
bundled at `skills/create-capability/references/forms/` — byte-identical copies of
`engine/templates/`, compared on every check run (check 15) so they cannot drift. Inside
a `the suite` checkout it switches to workspace mode and also reads that workspace's law, records
and evaluation routes. Those deliberately do NOT travel: `CORE/GUARDRAILS.md` is the law
of the workspace that ratifies it, and shipping a copy would be shipping someone else's rules.

This paragraph said "repo-bound … making it standalone is real work and is not done" until
2026-08-07. The standalone work had in fact been done on 2026-07-31, forms and all; the README
was describing a plugin that no longer existed, and a launch slide inherited the error.

## Package format

This package follows **Agent Plugins 1.0.0**, an open, vendor-neutral standard from the Agent
Plugins project — specification <https://agent-plugins.org/specification>, repository
<https://github.com/agentplugins/agent-plugins-spec>. Specification text is licensed CC-BY-4.0,
its schemas Apache-2.0. the workspace adopted it on 2026-08-07 after Google's announcement of the
format, <https://developers.googleblog.com/agent-plugins-package-your-skills-tools-and-more/>.

The package *conforms to* that standard and vendors none of its files: `plugin.json` is written
here, and `$schema` is a URL pointing at theirs. Nothing in this plugin is authored by the Agent
Plugins project.

The repository control plane also supplies an optional Codex custom-agent
overlay:

```text
.codex/agents/agent-builder.toml
```

The plugin has exactly one logical role, one packaged Claude agent adapter, and
three approved shared jobs. `create-capability` is the portable entry skill;
`evaluate-capability` and `package-plugin` remain independently invocable.
Claude and Codex can run all three from the installed plugin without a Codex
project TOML.

Every skill requires `SKILL.md`. `rubric.md` and `<name>.workflow.js` are
independent optional components chosen from that skill's requirements.
`create-capability` owns the Claude-only workflow adapter,
`evaluate-capability` owns the producer-independent rubric, and
`package-plugin` needs neither.

## Runtime boundary

The portable `create-capability` skill owns cross-host orchestration. The Claude agent
adds Claude-specific dispatch and context. The optional Codex project overlay
adds stable project routing but is not installed by the plugin and is not
required for Codex execution. The sibling skills expose evaluation and
packaging as independently callable recurring jobs without duplicating the
portable entry procedure.

`engine/templates/` remains the sole authority for the four capability-spec forms;
`create-capability` vendors byte-identical, read-only copies at
`skills/create-capability/references/forms/` so the plugin can scaffold and gate a build with no
`the suite` control plane present. A drift check inside the workspace that produces this plugin
(`engine/checks/check.py` check 15) keeps the two copies honest — the copy travels, the authority does
not move.

`create-capability` detects its own mode at the start of every invocation: inside a project whose
nearest `.git` root has a `CORE/GUARDRAILS.md`, it runs exactly as it always has —
repo-bound, gated by `python3 engine/checks/check.py --confirmed`, against `engine/templates/`
and `studio/evaluation/<name>/`. Outside one, it runs standalone — gated by its own vendored
`skills/create-capability/scripts/check-confirmed.py`, against the vendored forms and
`.agent-builder/specs/` in the consumer's own project — refusing any build ahead of a spec the
consumer signs themselves, and scaffolding that spec rather than stopping bare. Neither mode
grants autonomy or loosens the `Confirmed:` gate; only its authority and file locations move.

The plugin has no MCP server, command, monitor, hook, or runtime template copy.

## Evaluation boundary

Evaluation is not a hook. `evaluate-capability` is an on-demand skill; its
golden cases and historical run records remain development evidence at
`studio/evaluation/agent-builder/evaluation/`, outside the installable
plugin.

Claude Code can run native plugin eval suites when an `evals/` directory is
shipped, but this plugin deliberately does not ship that development surface.
The current Codex plugin manifest contract does not define an eval component,
and neither reference plugin repository used for this layout ships one.

## Host compatibility

Claude Code reads `.claude-plugin/plugin.json`, the shared `skills/`, and the
packaged definition under `agents/`. Codex reads `.codex-plugin/plugin.json`
and the same shared `skills/`. Codex plugin packaging does not currently
install project custom-agent TOML, so `.codex/agents/agent-builder.toml` is a separate
optional overlay owned by the cloned control plane. Bare-plugin compatibility
is proved through the shared entry skill before that overlay is probed.
