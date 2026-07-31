# Agent Plugin Spec — <name>

> **How to use this.** Use this template when the deliverable is an installable
> agent plugin: exactly one logical agent composing one or more licensed
> reusable skills.
> Copy it to
> `artifacts/workspace/pre-implementation/<YYYY-MM-DD>-spec-<name>.html`, retitle
> the H1 in plain English, and fill every field. Use `N/A — <reason>` where a
> component is intentionally absent.
>
> **It goes in `artifacts/workspace/`, not `artifacts/capabilities/<name>/`.**
> `control-plane/GUARDRAILS.md` §6 gives planning exactly two homes —
> `artifacts/projects/<name>/` for a product and `artifacts/workspace/` for the
> workspace — and a capability of this workspace is the second.
> `artifacts/capabilities/<name>/` holds retained evidence only: the
> `evaluation/` cases and run records, which is all
> `artifacts/capabilities/agent-builder/` has ever contained. This line said
> `artifacts/capabilities/` until Tiên moved a spec out of it on 2026-07-31.
>
> **The spec ships as HTML, not Markdown.** This template is Markdown because
> every file in `control-plane/` is; the document it produces is not.
> `control-plane/GUARDRAILS.md` §9 rule 9 fixes the `Confirmed:` line inside a
> `<pre>` and points at `artifacts/workspace/pre-implementation/2026-07-25-spec-tien-os.html:542`
> as the specimen, so the law's own worked example of a spec is an HTML file.
> Every confirmed spec on disk is one. This line said `.md` until 2026-07-31 and
> produced one Markdown spec before it was caught
> (`control-plane/DECISION-LOG.md`, same date). Open `control-plane/DESIGN.md`
> and the exemplar at
> `plugins/agent-plugins/unknown-remover/skills/write-chain-document/references/html-effectiveness-main/unknowns/08-implementation-plan.html`
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
> Tien. No model writes that line.
>
> **The closing block never renders a signable line.** Write what approving
> means and what each alternative would change; do not put a copyable
> `Confirmed: … — Tien` in it. A rendered signature is Claude authoring the
> wording of her approval, and a pasted one is void either way — `CLAUDE.md`,
> *How a `Confirmed:` line gets written*. The empty `Confirmed:` at column 1
> inside a `<pre>` stays; that is the slot her click fills.
>
> **Deliver the spec and its `AskUserQuestion` in the same turn.** The chain
> asks a document to exit with a pasteable next message, and for a spec that
> next message is an approval the paste cannot carry. The question is the
> spec's real exit.

## 1. Plugin outcome

- **Name:** a lowercase kebab-case noun role for the logical agent, such as
  `agent-builder` or `earnings-reviewer`:
- **Recurring job this package supports:**
- **Who installs it:**
- **Why packaging is needed now:**
- **Non-goals:**

## 2. Composition model

This template is only for the reference architecture used by
`plugins/agent-plugins/`:

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
| `<noun-role>` | | `plugins/agent-plugins/<noun-role>/agents/<noun-role>.md` | `.codex/agents/<noun-role>.toml` — OPTIONAL project overlay | `<verb-object-a>` | yes | |
| `<noun-role>` | | same Claude adapter | same optional overlay | `<verb-object-b>` — only when independently licensed | no | |

Do not merge several recurring jobs into one large `SKILL.md` merely because one
agent uses them. A skill remains independently routable, testable, and reusable.

## 3. Control-plane and installed trees

Include only components the spec licenses; do not create empty placeholder
directories.

```text
<repo>/
├── .codex/
│   └── agents/
│       └── <agent>.toml            OPTIONAL project overlay; not installed by plugin
└── plugins/agent-plugins/<noun-role>/
    ├── .claude-plugin/
    │   └── plugin.json
    ├── .codex-plugin/
    │   └── plugin.json
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
under `artifacts/capabilities/<name>/evaluation/`.

## 4. Host contract

| Concern | Claude Code | Codex |
|---|---|---|
| Manifest | `.claude-plugin/plugin.json` | `.codex-plugin/plugin.json` |
| Shared capability | discovers portable core in `skills/` | manifest exposes the same `./skills/` |
| Explicit skill invocation | `/plugin:skill` | `$plugin:skill` |
| Agent definition | packaged adapter at `plugins/agent-plugins/<plugin>/agents/<agent>.md` | no current installable plugin component |
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
| `<verb-object-a>` | | `artifacts/capabilities/<plugin>/evaluation/<verb-object-a>/` | | yes | required | no — | no — | |
| `<verb-object-b>` | | `artifacts/capabilities/<plugin>/evaluation/<verb-object-b>/` | | no | required | yes / no — | yes / no — | |

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
   `plugins/agent-plugins/<plugin>/agents/<agent>.md`. If an optional Codex
   project overlay exists, parse and probe it separately after the bare-plugin
   check.
5. Every agent skill name or route resolves to exactly one
   `plugins/agent-plugins/<plugin>/skills/<name>/SKILL.md`; the plugin has one
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

## 11. Done and retirement

- **Done means:**
- **Evidence retained at:**
- **Rollback:**
- **Retire the plugin when:**

---

End of spec. Ready to build on confirmation.

Confirmed:
