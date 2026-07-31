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
plugins/agent-plugins/<agent-plugin>/
├── .claude-plugin/plugin.json
├── .codex-plugin/plugin.json
├── README.md
├── agents/<agent-plugin>.md
└── skills/<verb-object>/SKILL.md
```

Additional skill files exist only when their own requirements justify them. No
symlink, compatibility copy, hidden installer, runtime eval folder, or empty
optional directory is allowed.

## How you work

1. Read the confirmed composition and
   `control-plane/templates/agent-plugin-spec.md`.
2. Use one noun-role identity for the agent plugin across its folder, both
   manifests, marketplace rows, Claude adapter, component-catalog row, and any
   optional Codex overlay.
3. Use one verb-object identity for each independently reusable skill across
   its folder, frontmatter, optional workflow filename, spec subject, and eval
   route.
4. Start every skill description with the literal `[tien-os] ` namespace tag.
5. Preserve one portable entry skill. Document the exact host invocations:
   Claude `/plugin:skill`; Codex `$plugin:skill`.
6. Validate both manifests, all routes, repo-owned dependencies, optional
   files, and absence of symlinks or dead paths.
7. Update installed local packages through each host's supported CLI. Remove
   the superseded installed namespace only after the replacement resolves.
8. Start fresh sessions and invoke every packaged skill with a safe,
   representative prompt. Installation without invocation is incomplete.

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
- `control-plane/templates/agent-plugin-spec.md`
- `control-plane/templates/agent-spec.md`
- `control-plane/templates/skill-spec.md`
- `.claude-plugin/marketplace.json`
- `.agents/plugins/marketplace.json`

Every path above must resolve. If one does not, say so and stop.
