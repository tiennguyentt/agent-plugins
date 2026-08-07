---
name: package-plugin
description: >
  [tien-os] Use when a confirmed tien-os logical agent and its licensed skills
  must be packaged, renamed, installed, or validated as one dual-host agent
  plugin for Claude Code and Codex.
---

# package-plugin

Package one logical agent and its licensed reusable jobs for both hosts. This
skill owns distribution shape and runtime validation; it does not invent
capabilities.

## Key insight

The wrong path this skill exists to prevent is packaging by copying whatever is on disk into a
plugin folder. The package is the licensed composition — one logical agent, exactly its licensed
skills, both host manifests — not a convenience bundle of nearby files; vendoring a filler skill, a
private template, or a development eval into the runtime plugin, or renaming any piece outside the
confirmed identity, breaks the dual-host checks that keep the Claude folder, the Codex manifest, and
the marketplace rows referring to the same thing. Do not use this skill before the logical agent and
every included skill are already licensed — packaging is a distribution step on confirmed work,
never a way to assemble a capability that has not been licensed yet.

## Host adapter

- **Claude Code:** invoke `/agent-builder:package-plugin`.
- **Codex:** invoke `$agent-builder:package-plugin`.

Both hosts consume the same `skills/` tree. Claude additionally packages one
Markdown agent adapter. A Codex project TOML is an optional repo overlay, not an
installable plugin component.

## When to use

Use for requests such as:

- "Package this confirmed agent for Claude and Codex."
- "Rename this plugin without leaving the old namespace installed."
- "Validate both manifests and marketplace routes."
- "Prove the installed skill works in fresh sessions."

Do not use before the logical agent and every included skill are licensed. Do
not use for capability design or output-quality review.

## What you produce

One physical package:

```text
engine/agent-plugins/<agent-plugin>/
├── plugin.json                          portable — Agent Plugins 1.0.0
├── .claude-plugin/plugin.json
├── .codex-plugin/plugin.json
├── README.md
├── agents/<agent-plugin>.md
└── skills/<verb-object>/
    ├── SKILL.md
    ├── rubric.md                        when that skill's spec licenses one
    └── <verb-object>.workflow.js        when that skill's spec licenses one
```

Additional skill files exist only when their own requirements justify them. No
symlink, compatibility copy, hidden installer, runtime eval folder, or empty
optional directory is allowed.

## The portable manifest

`plugin.json` at the plugin root is Agent Plugins 1.0.0 — an open, vendor-neutral standard
from the Agent Plugins project (<https://agent-plugins.org/specification>, repository
<https://github.com/agentplugins/agent-plugins-spec>), specification text CC-BY-4.0 and
schemas Apache-2.0. Adopted by tien-os 2026-08-07. It carries the identity
once — `$schema`, `name`, `version`, `description`, `author`, `license`, `keywords` — and
declares each host's files under a reverse-domain `extensions` namespace
(`com.anthropic.claude-code`, `com.openai.codex`). Its schema is `additionalProperties: false`:
a key the schema does not name fails validation at the client, so nothing host-specific goes
at the top level. `version` and `description` must be byte-identical across all three manifests.

**It is a layer under the package, never a replacement for one.** The spec defines two portable
component types, `skills/` and `mcp.json`, and knows nothing about agents, rubrics, or workflow
adapters. So `agents/<agent-plugin>.md` stays at the root, and `rubric.md` and
`<verb-object>.workflow.js` stay beside their `SKILL.md` where they can be seen. Never move,
bury, or drop either one to look more like the spec's example tree — the spec's layout is a
floor. Write `mcp.json` only when the plugin actually ships MCP servers; an empty one is an
empty optional file, which this skill forbids.

## How you work

1. Read the confirmed composition and
   `engine/templates/agent-plugin-spec.md` — §5 owns the three-manifest
   contract, including the portable one.
2. Use one noun-role identity for the agent plugin across its folder, both
   manifests, marketplace rows, Claude adapter, component-catalog row, and any
   optional Codex overlay.
3. Use one verb-object identity for each independently reusable skill across
   its folder, frontmatter, optional workflow filename, spec subject, and eval
   route.
4. Start every skill description with the literal `[tien-os] ` namespace tag.
5. Preserve one portable entry skill. Document the exact host invocations:
   Claude `/plugin:skill`; Codex `$plugin:skill`.
6. Validate all three manifests, all routes, repo-owned dependencies, optional
   files, and absence of symlinks or dead paths. Run
   `python3 engine/checks/test-plugin-contract.py`; check 10b in
   `engine/checks/check.py` is the same contract against the real tree.
7. Update installed local packages through each host's supported CLI. Remove
   the superseded installed namespace only after the replacement resolves.
8. Start fresh sessions and invoke every packaged skill with a safe,
   representative prompt. Installation without invocation is incomplete.

## The public mirror

`tiennguyentt/agent-plugins` (local clone `~/projects/agent-plugins`) is the public
consumer surface. Changes flow one way — canonical is
`engine/agent-plugins/<name>/`, the mirror is a copy and never a source.

**Its layout is flat, and the four plugins are peers:**

```text
agent-plugins/
├── .claude-plugin/marketplace.json   Claude Code catalog, `source: ./<name>`
├── .agents/plugins/marketplace.json  Codex catalog, `path: ./<name>`
├── <plugin>/                         one directory per plugin, at the root
├── LICENSE
└── README.md
```

Nothing wraps the plugins. The mirror carried `plugins/agent-plugins/<name>/` until
2026-08-07, a level that said "plugins/plugins" and implied a hierarchy that does not
exist — Tiên's ruling: *"all the 4 plugin này là ngang nhau, nothing is root."* Wrap only
when there is a real sibling distinction to encode, as `anthropics/claude-plugins-official`
has with `external_plugins/`; `anthropics/knowledge-work-plugins` wraps nothing because it
has nothing to distinguish, and neither does this.

**Never name a public thing after the private workspace.** `tien-os-marketplace` was
renamed to `agent-plugins` the same day for that reason: a consumer installing one plugin
has no idea what `tien-os` is, and the packages already conform to a standard called Agent
Plugins. The same test killed `exce-plugin` for the canonical folder.

**The mirror's README is customer-facing writing, not an internal record.** State what a
reader gets and what they must have; never narrate a correction, a date, or what a sentence
used to say. Honesty is kept by stating requirements as prerequisites — *"the other three
read files from the `tien-os` workspace"* — never by confessing. The verification table
stays: two of four plugins have never had an evaluation case run, and that is stated.

**The export is a script, not a copy by hand:**

```bash
python3 engine/export-agent-plugins.py --check   # report drift, write nothing
python3 engine/export-agent-plugins.py           # copy and regenerate catalogs
```

It copies every plugin fresh so deletions propagate, and regenerates both catalogs from each
`plugin.json` so a version cannot drift — the published `unknown-remover` sat at 1.1.0 while
canonical was 1.1.1 because the rows were hand-edited and nothing compared them. Run
`--check` before any push, and again after editing anything under `agent-builder/`: the
mirror silently went stale the first time, within an hour, when this very file changed.

Then `claude plugin validate` the marketplace and each plugin at its new path. The script
never runs git. **A push to this repo is public: Tiên's alone.**

**One release, one commit, version first.** The mirror is tagged with repo-level semver
(`v1.0.0` … `v2.0.0`), and its commit subject leads with that version:
`v2.0.0 — Agent Plugins 1.0.0, flat layout, new repo name`. GitHub prints the last commit
touching each file beside it, so a narrative subject fills that column with prose that says
nothing about what changed — Tiên rejected exactly that view on 2026-08-07. Squash a
release into one commit, put the per-plugin version moves in the body as a table, mark a
changed install command or layout `BREAKING`, then tag. One commit touching everything also
makes the file listing legible in one read.

## What you never do

- Never add a filler skill to satisfy a folder count.
- Never put private templates or development evals inside the runtime plugin.
- Never claim Claude's agent Markdown is a Codex agent package.
- Never require an optional `.codex/agents/*.toml` file for bare-plugin use.
- Never hand-edit host registries when the supported plugin CLI owns the update.

## How you answer Tien

Report the final namespace, exact Claude and Codex invocations, installed
versions, E2E results, and any remaining blocker. Do not dump full logs.

## What you read

- the confirmed agent-plugin and skill specifications
- `engine/templates/agent-plugin-spec.md`
- `engine/templates/agent-spec.md`
- `engine/templates/skill-spec.md`
- `.claude-plugin/marketplace.json`
- `.agents/plugins/marketplace.json`

Every path above must resolve. If one does not, say so and stop.
