# agent-builder plugin

One independent agent plugin in the `tien-os` marketplace:

Distribution mode: repo-bound
Portable core: `skills/`
Portable entry skill: `create-capability`
Runtime dependencies: `CLAUDE.md`, `control-plane/`, `artifacts/`
Codex project agent: optional overlay

```text
plugins/agent-plugins/agent-builder/
├── .claude-plugin/plugin.json   Claude Code adapter
├── .codex-plugin/plugin.json    Codex and ChatGPT adapter
├── agents/
│   └── agent-builder.md         exactly one Claude agent definition
└── skills/
    ├── create-capability/       portable entry + Claude workflow adapter
    ├── evaluate-capability/     independent review + rubric
    └── package-plugin/          dual-host packaging procedure
```

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

`control-plane/templates/` remains the sole authority for the four capability-spec forms;
`create-capability` vendors byte-identical, read-only copies at
`skills/create-capability/references/forms/` so the plugin can scaffold and gate a build with no
`tien-os` control plane present. A drift check inside the workspace that produces this plugin
(`scripts/check.py` check 15) keeps the two copies honest — the copy travels, the authority does
not move.

`create-capability` detects its own mode at the start of every invocation: inside a project whose
nearest `.git` root has a `control-plane/GUARDRAILS.md`, it runs exactly as it always has —
repo-bound, gated by `python3 scripts/check.py --confirmed`, against `control-plane/templates/`
and `artifacts/capabilities/<name>/`. Outside one, it runs standalone — gated by its own vendored
`skills/create-capability/scripts/check-confirmed.py`, against the vendored forms and
`.agent-builder/specs/` in the consumer's own project — refusing any build ahead of a spec the
consumer signs themselves, and scaffolding that spec rather than stopping bare. Neither mode
grants autonomy or loosens the `Confirmed:` gate; only its authority and file locations move.

The plugin has no MCP server, command, monitor, hook, or runtime template copy.

## Evaluation boundary

Evaluation is not a hook. `evaluate-capability` is an on-demand skill; its
golden cases and historical run records remain development evidence at
`artifacts/capabilities/agent-builder/evaluation/`, outside the installable
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
