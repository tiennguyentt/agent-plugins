# Agent Plugin Spec — <name>

> **How to use this.** Use this template when the deliverable is an installable
> agent plugin: exactly one logical agent composing one or more licensed
> reusable skills.
> Copy it to
> `archive-v1/artifact-plane/workspace/pre-implementation/<YYYY-MM-DD>-spec-<name>.html`, retitle
> the H1 in plain English, and fill every field. Use `N/A — <reason>` where a
> component is intentionally absent.
>
> **It goes in `studio/workspace/`, not `studio/evaluation/<name>/`.**
> `CORE/GUARDRAILS.md` §6 gives planning exactly two homes —
> `studio/projects/<name>/` for a product and `studio/workspace/` for the
> workspace — and a capability of this workspace is the second.
> `studio/evaluation/<name>/` holds retained evidence only: the
> `evaluation/` cases and run records, which is all
> `studio/evaluation/agent-builder/` has ever contained. This line said
> `studio/evaluation/` until Tiên moved a spec out of it on 2026-07-31.
>
> **The spec ships as HTML, not Markdown.** This template is Markdown because
> every file in `control-plane/` is; the document it produces is not.
> the signature rule (`CORE/GUARDRAILS.md` §1.2) fixes the `Confirmed:` line inside a
> `<pre>` and points at `archive-v1/artifact-plane/workspace/pre-implementation/2026-07-25-spec-tien-os.html:542`
> as the specimen, so the law's own worked example of a spec is an HTML file.
> Every confirmed spec on disk is one. This line said `.md` until 2026-07-31 and
> produced one Markdown spec before it was caught
> (`records/DECISION-LOG.md`, same date). Open `surfaces/DESIGN.md`
> and the exemplar at
> `engine/agent-plugins/unknown-remover/skills/write-chain-document/references/html-effectiveness-main/unknowns/08-implementation-plan.html`
> before writing it.
>
> A plugin is a packaging and composition boundary, not a second implementation
> of a capability. Its **portable core** stays in `skills/` and includes one
> portable entry skill that can run the capability without either host's custom
> agent adapter. Host-specific adapters improve routing or orchestration without
> owning the only implementation.
>
> The spec must end with `End of spec. Ready to build on confirmation.` A build
> is licensed only when a later line reads `Confirmed: <date> — Tien`, written by
> Tien. No model originates it; an agent may transcribe it only citing a valid `approval` trace event (`CORE/GUARDRAILS.md` §1.2).
>
> **The closing block never renders a signable line.** Write what approving
> means and what each alternative would change; do not put a copyable
> `Confirmed: … — Tien` in it. A rendered signature is Claude authoring the
> wording of her approval, and a pasted one is void either way — `CLAUDE.md`,
> *How a `Confirmed:` line gets written*. The empty `Confirmed:` at column 1
> inside a `<pre>` stays; that is the slot her click fills.
>
> Deliver the spec with the decision it needs from Tiên stated plainly. Do not raise an
> `AskUserQuestion` merely as an approval gate; `CORE/GUARDRAILS.md` §3 delegation permits it only for genuine ambiguity.

## 1. Plugin outcome

- **Name:** a lowercase kebab-case noun role for the logical agent, such as
  `agent-builder` or `earnings-reviewer`:
- **Recurring job this package supports:**
- **Who installs it:**
- **Why packaging is needed now:**
- **Non-goals:**

## 2. Composition model

This template is only for the reference architecture used by
`engine/agent-plugins/`:

- **Logical agent:** required, exactly one logical agent. Use a standalone
  skill instead when the job does not need dedicated context, delegation,
  session-wide tool bounds, or stable orchestration.
- **Skills:** one or more licensed skills. Add multiple only when the confirmed
  plugin composition or each skill's own confirmed spec licenses several
  independently reusable jobs or knowledge modules; never invent a filler
  skill to satisfy cardinality. Each may be invoked without the agent.
- **Naming:** the plugin and logical agent use the noun-role identity. Every
  skill uses a distinct verb-object identity such as `create-capability`,
  `evaluate-capability`, or `package-plugin`. Every skill description begins
  with the literal `[tien-os] ` selector tag.
- **Portable entry skill:** required, exactly one of the licensed skills. It
  owns the cross-host procedure and composition route that both installed
  plugins can execute. A Claude agent or optional Codex project overlay may
  route it, but neither may replace it.
- **Workflow script:** optional per skill. It is an executable orchestration
  adapter, not a requirement for being a skill.
- **Rubric:** optional per skill. It externalizes grading criteria so a separate
  verifier can judge the output.

### Agent-to-skill map

| Logical agent | Runtime job | Claude packaged adapter | Codex project overlay | Shared skill | Portable entry? | Why this is a separate skill |
|---|---|---|---|---|---|---|
| `<noun-role>` | | `engine/agent-plugins/<noun-role>/agents/<noun-role>.md` | `.codex/agents/<noun-role>.toml` — OPTIONAL project overlay | `<verb-object-a>` | yes | |
| `<noun-role>` | | same Claude adapter | same optional overlay | `<verb-object-b>` — only when independently licensed | no | |

Do not merge several recurring jobs into one large `SKILL.md` merely because one
agent uses them. A skill remains independently routable, testable, and reusable.

### Boundaries against the plugins that already exist

Before writing any description, read the other installed plugins' skill and agent
descriptions and answer:

- **Which existing skill could also plausibly answer this plugin's requests?**
- **What single distinction separates them?**
- **Where is that distinction written — in both descriptions?**

A cross-plugin collision is silent: nothing errors, two skills simply both look right and
the router picks one. Audited 2026-08-07, twelve skills across four plugins held exactly
**one** cross-plugin reference in total, so four pairs collided unrouted. Every new plugin
adds a boundary to every existing one; `engine/templates/skill-spec.md` carries the
rule for the description field itself. This is convention, not a check — no automated rule
can tell a real distinction from a forced one.

## 3. Control-plane and installed trees

Include only components the spec licenses; do not create empty placeholder
directories.

```text
<repo>/
├── .codex/
│   └── agents/
│       └── <agent>.toml            OPTIONAL project overlay; not installed by plugin
└── engine/agent-plugins/<noun-role>/
    ├── plugin.json                  REQUIRED — the portable Agent Plugins 1.0.0 manifest
    ├── .claude-plugin/
    │   └── plugin.json
    ├── .codex-plugin/
    │   └── plugin.json
    ├── mcp.json                     OPTIONAL — only when the plugin ships MCP servers
    ├── README.md                    distribution mode + portable entry skill
    ├── agents/
    │   └── <noun-role>.md          REQUIRED — exactly one Claude agent definition
    └── skills/                     portable core shared across Claude and Codex
        ├── <verb-object-a>/          REQUIRED — portable entry skill
        │   └── SKILL.md
        └── <verb-object-b>/          OPTIONAL — only when explicitly licensed
            ├── SKILL.md
            ├── <skill-b>.workflow.js   OPTIONAL for this skill
            └── rubric.md               OPTIONAL for this skill
```

The Claude Markdown file is the one packaged agent component. If the repo also
provides a same-named Codex TOML, it is an optional project overlay representing
the same logical role. Another logical agent gets another independent sibling
plugin, not another file in this plugin's `agents/` directory. Skills stay
beside the agent because they remain independently discoverable, invocable,
testable, and reusable.

Codex supports custom agents, but its project agent contract lives at
`.codex/agents/*.toml`; the Codex plugin manifest currently packages shared
skills, not project custom-agent definitions. A bare Codex plugin install must
therefore work through the portable entry skill. Never call the optional TOML a
required plugin component, never copy it during installation, and never use it
as the only Codex probe.

Additional directories such as `hooks/`, `scripts/`, `commands/`, `references/`,
or `assets/` exist only when the confirmed requirements need their documented
runtime behavior. `evals/` and run records are development evidence unless the
host's installable contract explicitly requires them; for `tien-os`, they stay
under `studio/evaluation/<name>/evaluation/`.

## 4. Host contract

| Concern | Claude Code | Codex |
|---|---|---|
| Manifest | `.claude-plugin/plugin.json` | `.codex-plugin/plugin.json` |
| Shared capability | discovers portable core in `skills/` | manifest exposes the same `./skills/` |
| Explicit skill invocation | `/plugin:skill` | `$plugin:skill` |
| Agent definition | packaged adapter at `engine/agent-plugins/<plugin>/agents/<agent>.md` | no current installable plugin component |
| Optional custom-agent overlay | N/A | project configuration at `.codex/agents/<agent>.toml` |
| Multi-skill orchestration | portable entry skill; agent frontmatter may preload several skills | portable entry skill; optional project overlay may route several skills |
| Skill-local workflow JS | runs only through the documented Claude adapter that calls it | use the shared procedure and a Codex-native equivalent; do not assume the JS is portable |
| Governance | remains outside the installed plugin | remains outside the installed plugin |

The Claude agent and optional Codex project agent are adapters, not owners of
duplicated procedure text. The portable entry `SKILL.md` owns the cross-host
execution route; the remaining `SKILL.md` files own their reusable jobs.

### Distribution mode

Choose exactly one and copy the declarations into the plugin README:

| Mode | Use when | Required proof |
|---|---|---|
| `standalone` | every runtime dependency ships inside the plugin | install and invoke the portable entry skill from a copy with no tien-os control plane |
| `repo-bound` | the capability intentionally consumes named project-owned files | README lists every runtime dependency; both host probes run in the target repo; missing dependencies produce an explicit stop |

Required README declarations:

```text
Distribution mode: standalone | repo-bound
Portable core: `skills/`
Portable entry skill: `<skill>`
Runtime dependencies: `<paths>`       # repo-bound only
Codex project agent: optional overlay # only when the repo supplies one
```

## 5. Manifests

Three manifests, one identity. The portable one is the source; the two host manifests are
adapters that must not disagree with it.

### `plugin.json` — the portable manifest

Agent Plugins 1.0.0 (<https://agent-plugins.org/specification>), adopted 2026-08-07 so a client
that speaks neither `.claude-plugin` nor `.codex-plugin` can still read the package.

> **Credit.** The format is **Agent Plugins 1.0.0**, an open, vendor-neutral standard from the
> Agent Plugins project — spec <https://agent-plugins.org/specification>, repository
> <https://github.com/agentplugins/agent-plugins-spec>. **Its specification text is licensed
> CC-BY-4.0 and its schemas Apache-2.0**, so the sentences quoted below and in
> `engine/checks/check.py` carry an attribution requirement, not a courtesy. tien-os
> reached it through Google's announcement of the format,
> <https://developers.googleblog.com/agent-plugins-package-your-skills-tools-and-more/>, which is
> the source Tiên pointed at. tien-os conforms to the standard and vendors none of its files;
> nothing here is authored by that project.

| Field | Value |
|---|---|
| `$schema` | `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json` — REQUIRED, exact |
| `name` | REQUIRED, byte-identical to the folder and both host manifests |
| `version` | semantic version, byte-identical to both host manifests |
| `description` | byte-identical to both host manifests |
| `author` | only `name`, `email`, `url` — the schema allows no other key |
| `license`, `keywords`, `homepage`, `repository` | optional |
| `extensions` | client-specific data, keyed by reverse-domain namespace |

**The schema is `additionalProperties: false`.** A key it does not name is a validation failure at
the client, not a private extension — anything host-specific goes under `extensions`, as
`com.anthropic.claude-code` and `com.openai.codex`. Every path value inside `extensions` begins
`./` and resolves inside the plugin root.

**What the spec does NOT define, and what therefore does not move.** Agent Plugins 1.0.0 has
exactly two portable component types: `skills/` and `mcp.json`. It has no notion of an agent, a
rubric, or a workflow adapter. Adopting it is additive:

- `agents/<noun-role>.md` stays at the plugin root — Claude Code discovers it there.
- `rubric.md` and `<verb-object>.workflow.js` stay beside their `SKILL.md`, visible, exactly as
  §2 licenses them. The spec's `SKILL.md` / `scripts/` / `references/` layout is a floor, not a
  ceiling, and is not a reason to hide or relocate either file.
- Both host manifests keep their own directories.

A conformant client discovers each immediate child of `skills/` that holds a `SKILL.md` and
**must not** search deeper — a skill one level too far down is invisible to it and silent on disk.

### `.claude-plugin/plugin.json`

| Field | Value |
|---|---|
| `name` | |
| `version` | semantic version |
| `description` | what the installed plugin enables |
| `author.name` | |

### `.codex-plugin/plugin.json`

| Field | Value |
|---|---|
| `name` | byte-identical to the Claude manifest |
| `version` | byte-identical to the Claude manifest |
| `description` | same capability boundary |
| `skills` | `./skills/` |

Record any additional manifest field and the official host contract that
licenses it. Do not invent a cross-host field by copying it from the other
manifest.

## 6. Agent shell

Complete `agent-spec.md` once for the required logical agent. Produce the
Claude packaged adapter. Produce a Codex project overlay only when the target
repo needs a stable custom-agent configuration beyond the portable entry
skill. Also fill this composition summary:

- **Why a dedicated context is required:**
- **Session-wide `tools:` bounds:**
- **Claude skills preloaded in frontmatter:**
- **Portable entry skill:**
- **Codex bare-plugin route through that skill:**
- **Optional Codex project overlay and why it is needed:**
- **Why each preloaded skill is needed at startup:**
- **Procedure owned by the agent instead of a skill:**

The last answer should be limited to host-specific routing and handoff rules.
All orchestration required for cross-host behavior belongs in the portable
entry skill.

## 7. Skill inventory

License every row explicitly in this confirmed composition and use a separate
confirmed `skill-spec.md` whenever the job has a standalone lifecycle outside
the plugin. The workflow and rubric decisions are independent for every skill.
Every row must resolve to its own evaluation route; folder count is not
evidence that a skill is legitimate.

| Skill | Confirmed skill spec | Evaluation route | Job | Portable entry? | `SKILL.md` | Workflow JS? Host? Why? | `rubric.md`? Why? | Standalone trigger |
|---|---|---|---|---|---|---|---|---|
| `<verb-object-a>` | | `studio/evaluation/<plugin>/evaluation/<verb-object-a>/` | | yes | required | no — | no — | |
| `<verb-object-b>` | | `studio/evaluation/<plugin>/evaluation/<verb-object-b>/` | | no | required | yes / no — | yes / no — | |

## 8. Runtime and safety

- **Read tools:**
- **Write or side-effect tools:**
- **External/untrusted input:**
- **Private data:**
- **Communication capability:**
- **Host-specific behavior that needs a safe probe:**
- **Distribution mode:**
- **Portable entry skill:**
- **Repo-owned runtime dependencies, or N/A — standalone:**
- **Failure path when a required skill or file cannot load:**
- **Re-run/idempotency behavior:**

If private data, untrusted content, and external communication meet in one
component, split the design. A plugin boundary does not neutralize the lethal
trifecta.

## 9. Validation

Every item needs an exact command and expected observable result:

1. Both manifests parse and pass their host validators.
2. Claude lists the expected skills and optional agents from a copy outside the
   repo.
3. Codex lists the plugin and invokes the portable entry skill without reading
   `.codex/agents/<agent>.toml`.
4. Exactly one packaged Claude agent exists at
   `engine/agent-plugins/<plugin>/agents/<agent>.md`. If an optional Codex
   project overlay exists, parse and probe it separately after the bare-plugin
   check.
5. Every agent skill name or route resolves to exactly one
   `engine/agent-plugins/<plugin>/skills/<name>/SKILL.md`; the plugin has one
   or more licensed skills, and each resolves to an explicit confirmed
   composition row or confirmed skill spec plus its own evaluation route.
   Every skill folder/frontmatter name is verb-object kebab-case and every
   description starts with `[tien-os] `.
6. Every workflow named by a skill resolves by relative path, states its host
   contract, and has the corresponding safe runtime probe. A Claude Workflow
   script is not portable merely because it sits beside a shared skill.
7. Every rubric is consumed by a verifier other than the producer.
8. No dead path, compatibility stub, duplicate canonical file, or symlink
   remains.
9. No empty optional directory ships.
10. README declares distribution mode, portable core, portable entry skill,
    and every repo-owned runtime dependency.
11. Fresh sessions invoke every skill as `/plugin:skill` in Claude and
    `$plugin:skill` in Codex; selector labels expose the `[tien-os]` prefix.

## 10. Build order

Start with a disposable bare-plugin probe of the riskiest host assumption.
Then build the portable entry skill, the remaining licensed shared skills, the
Claude adapter, both manifests, and packaging validation. Add an optional Codex
project overlay only after the Codex plugin already works through its entry
skill. Add a second skill only when the confirmed plugin composition or that
skill's own confirmed spec licenses it and its distinct evaluation route
exists. Add a second agent only as a new sibling plugin. Mark user-only steps
explicitly.

## 10a. Public mirror

Fill this only when the plugin ships to `tiennguyentt/agent-plugins`, the public consumer
surface (local clone `~/projects/agent-plugins`). Changes flow one way; canonical is
`engine/agent-plugins/<name>/`.

- **Ships to the mirror:** yes / no —
- **Runs with no `tien-os` checkout:** yes / no — this is the distribution mode from §4, and
  the mirror's README must state it as a prerequisite the reader sees before installing.
- **Evaluation evidence to publish verbatim:** cases run / NOT RUN —

The mirror's layout is **flat: one directory per plugin at the repo root**, catalog `source`
and `path` values of `./<name>`, nothing wrapping them. The four plugins are peers. Do not
reintroduce a containing directory unless a real sibling distinction appears; the mirror
carried `plugins/agent-plugins/<name>/` until 2026-08-07 and that level meant nothing.

Two rules that outlive any one plugin:

1. **Nothing public is named after the private workspace.** A consumer installing one plugin
   does not know what `tien-os` is. This is why the repo is `agent-plugins`, not
   `tien-os-marketplace`, and why `exce-plugin` was rejected for the canonical folder.
2. **The mirror's README is product copy, not a record.** Say what the reader gets and what
   they need. Never narrate a correction or a date. Keep honesty by writing requirements as
   prerequisites, never as confessions — and never drop the verification table.

`engine/agent-plugins/agent-builder/skills/package-plugin/SKILL.md` owns the export
procedure and its checklist. A push to the mirror is public and is Tiên's alone.

## 11. Done and retirement

- **Done means:**
- **Evidence retained at:**
- **Rollback:**
- **Retire the plugin when:**

---

End of spec. Ready to build on confirmation.

Confirmed:
