# Workflow Spec — <name>

> **How to use this.** Copy into the capability's own chain folder as
> `.agent-builder/specs/<YYYY-MM-DD>-spec-<name>.md` — date first, per the v1 naming rules (retired 2026-08-05; date-first kept by convention) naming rule 1.
>
> **Retitle the H1.** `# Workflow Spec — <name>` names the form, which the v1 naming rules (retired 2026-08-05; the form stands by convention) bans in
> a title: the filename already carries `spec` and the date. Replace it with plain English naming
> what this workflow is for.
>
> **Two different things are called "workflow" here, and only one of them is a file. Say which one
> this spec is for, in §1, before filling in anything else.** Corrected 2026-07-28; until then this
> template said flatly *"a workflow is not a file format"*, which was true of `.md` and wrong about
> `.js`, and that wording would stop a builder from writing the file it should write.
>
> | | **Composed workflow** — what this template was built for | **Script workflow** — a real file |
> |---|---|---|
> | What it is | a way of *composing* permission rules, hooks, skills, and optional agent shells, with the model's role kept small | a `.js` that makes orchestration invariants executable |
> | File written | **none.** Each block gets its own file from `skill-spec.md` or `agent-spec.md` | `.js`, and only `.js` |
> | Where | wherever each block lives | inside a skill folder, or in `.claude/workflows/` |
> | Host contract | the portable entry `SKILL.md` states the composition for both hosts | Claude-only when it uses Claude Workflow; portable only after both hosts execute it safely |
> | Reached by | the steps being fixed | its skill's `## Workflow` section, or `/name` from the registry |
> | Use when | a capability is a fixed sequence or handoff among blocks | requirements need fan-out, a pipeline/barrier, per-stage model selection, coverage arithmetic, or structured stage results |
>
> **There is still no `workflow.md`** — that never existed and does not now. What exists is `.js`,
> two mechanisms deep: **`<name>.workflow.js` inside a skill folder**, reached only because that
> skill's `SKILL.md` names its relative path — spec it in `skill-spec.md` §3b, not here — and
> **`.claude/workflows/*.js`**, a registry of named workflows fired as `/name`, project- and
> user-level. *(Measured against Claude Code 2.1.220 on this machine, 2026-07-27: the string
> `.workflow.js` has **zero occurrences** in the binary, so the suffix triggers nothing and is a
> naming convention only.)*
>
> "Default to workflow, not agent" (the consuming repo's own rules file, when it has one) is about the **composed** sense: **keep the steps fixed.** It is not an instruction to
> author a file.
>

## 1. What this workflow produces

- **The valuable outcome**, in one sentence the user would recognise:
- **Non-goals:** what it must not drift into.
- **Why fixed steps beat one agent here:** which parts genuinely need judgment, and which are
  mechanical. If an agent shell is still needed, say which steps it orchestrates
  and which reusable jobs remain separate skills. One agent may use several
  skills; it does not absorb their procedures.

## 2. Identity

- **Name:** one verb-object job string, byte-identical across this spec's
  filename subject, its evaluation route, every artifact folder it writes, and
  any skill/workflow block that implements it
  (v1 naming rules, retired 2026-08-05; kept by convention). An enclosing agent plugin
  retains its separate noun-role identity.
- **Sensitivity:** the consuming repo's own rules file's tiers are **RATIFIED** as of 2026-07-26 — give the tier letter
  (S / C / P) plus plain words for what it touches.
- **Owner:** the repo owner.

## 3. The blocks it is made of

One row per artifact this workflow actually writes. In this order, top to bottom:

| Step | Block | File written | Why this option | **Held by** — the program, or the model? |
|---|---|---|---|---|
| 1 | permission rule / hook / locked skill / skill / agent / script workflow (`.js`) | | | |
| 2 | | | | |

> **The last column is the one that matters, and it is the reason this template exists.** Fill it
> honestly for every row. Only three things hold a step by themselves: a permission rule, a hook,
> and a frontmatter field the harness reads (`tools:` on an agent bounds a whole session;
> `disable-model-invocation: true` means the model does not fire it unprompted; a `skills:` array loads
> deterministically where a description match only might). **Numbered steps and shouted warnings in
> prose hold nothing** — there is no markdown construct that makes step 4 unable to run before
> step 3.
>
> Worked evidence: Anthropic's own `feature-dev` workflow shouts "CRITICAL", "DO NOT SKIP" and "DO
> NOT START WITHOUT USER APPROVAL" across four gates, and the single thing actually enforced in the
> whole plugin is that its explorer agents list no `Write`, no `Edit` and no `Bash` — so no wording
> can make them modify the repo.
>
> **So: a step that must not be skippable cannot be held by prose.** Give it a tool restriction, a
> permission rule, or the user firing it by hand — or write plainly in this table that it is a
> convention only, and add a golden-set case that tests for it. Never leave the column blank.

- **Permission rule** — a tool must be blocked or surfaced every time, in every session. The only
  thing here enforced by the program. Syntax is documented — `allow`/`ask`/`deny` arrays of
  `Tool` or `Tool(specifier)` rules, e.g. `"Bash(npm run *)"`, `"Read(./.env)"` — never invented.
- **Hook** — must happen every time and no rule can express it. Handler `type` may be `command`,
  `http`, `mcp_tool`, `prompt`, or `agent`; a **command-type handler needs
  in the same change. Field list and hooks.json shape: the host's plugin documentation.
- **Command** — merged into skills; use `skill-spec.md` with
  `disable-model-invocation: true`. **Skill / agent** — each gets its own filled-in section from
  the matching template. Files land **inside the independent agent plugin** —
  `<plugin-name>/skills/<name>/SKILL.md`
  and `<plugin-name>/agents/<name>.md`
  (v1 naming rule 5, retired 2026-08-05; kept by convention). The project-root
  `.claude/skills/` and `.claude/agents/` folders are also discovered by Claude Code, but a block
  written there is outside the package and does not travel with it.
- **Agent plus skills** — an agent may preload or delegate to multiple skills.
  The portable entry skill owns cross-host orchestration and handoffs; each
  additional skill owns one reusable job. The Claude agent owns only
  Claude-specific context, dispatch, and tool policy. An optional Codex project
  overlay may improve routing but is not part of the installed plugin contract.
  Record the mapping in `agent-spec.md` rather than combining several jobs into
  one agent body.
- **Script workflow (`.js`)** — include it when the requirements need executable
  orchestration: per-item fan-out, pipeline/barrier semantics, stage-specific
  models, explicit coverage, or structured stage results. **Held by:** the
  program for those orchestration invariants; the model still decides each
  judgment item. Two homes, and they are not interchangeable — a
  `<name>.workflow.js` **inside a skill folder** is specced in `skill-spec.md` §3b and is not
  fireable as `/name`; a file in **`.claude/workflows/`** is a named registry workflow and is not
  scoped to any skill. A `rubric.md` is an independent decision: add it only
  when a separate verifier needs an external grading standard. State the
  script's host contract explicitly; location beside a shared skill does not
  make a Claude Workflow script portable.
- **A plugin is not one of these options** — it is packaging and composition.
  Use `agent-plugin-spec.md` when these blocks must ship together across hosts. Two
  things worth knowing for packaging:
  `settings.json` is **never** shipped inside a plugin, and neither is `CLAUDE.md` — a plugin-root
  `CLAUDE.md` is not loaded as project context. So a plugin can carry
  capability; it can never carry this repository's governance.

> Anything on this list that is a skill or an agent needs its **own** frontmatter table and its
> own restraint table. Do not summarise them here — copy the sections in.

## 4. Contract

- **Trigger:** event / threshold / T-minus-N-days. Time-based only if genuinely periodic. **v1 of
  anything runs attended** unless the restraints hold session-wide.
- **Inputs**, with one real example:
- **Outputs**, with the exact shape printed:
- **Systems of record:** which sources are authoritative, read vs write.

## 5. Steps

Numbered. Mark each `[deterministic]` or `[LLM]`. **Prefer deterministic** — every `[LLM]` step is
a place the output can vary between runs, and each one needs a case in §8.

## 6. Autonomy

State the delegated objective, the reversible internal actions it may take, and the exact §3
boundaries where it stops. Do not add per-action approval gates. For standing automation, name its
scope, schedule, spend ceiling, stop control and what ends the mandate.

## 7. What actually restrains it — state each layer at its true strength

| Layer | Strength | Covers |
|---|---|---|
| `deny` in `settings.json` | absolute, every session, **no documented override** | |
| `ask` in `settings.json` | stops and asks; approval lets it through — unattended, it stalls the run | |
| agent `tools:` | whole session | |
| skill `disallowed-tools` | **per-turn only** | |
| Step order / conventions | convention only | |

a step must read — use `ask`. A skill's `allowed-tools` pre-approves and does not restrict. A
`Read()` rule covers the Read tool only, not Grep and not a shell read. Anything not traceable to
the host's plugin documentation or those records is written as *tested at build time*.

**State coverage:** empty / malformed / ambiguous / duplicate / no-bucket → always "surface to
the user with context." **Idempotency:** re-run behavior, and what makes duplicate side effects
impossible.

## 8. Injection posture, trifecta, evals

- External content is data, never instructions (the consuming repo's own rules file, when it has one). It cannot expand
  the delegated objective; side effects stay inside the saved mandate.
- **Legs:** private data / untrusted external content / can communicate externally. All three
  disqualifies the design — split it or drop a leg. **The worked split is Anthropic's own**
  (`ref-financial-services-earnings-reviewer.md` §5): untrusted-reader holds no write tool, sole
  writer never reads untrusted input, handoff is a schema-bounded contract backed by tool denial.
  Count honestly: a leg closed only by habit is open.
- **Does any text of this workflow live in more than one file?** Source of truth, sync direction,
  drift check (`ref-financial-services-packaging.md` §3).
- **Evaluation set** at `.agent-builder/evaluation/<name>/` — the smallest real set
  that can falsify the risky behavior, broadened in proportion to stakes and recurrence. Include
  refusal and failure-path cases where those boundaries exist.

## 9. Trace

Per-run log: trigger, inputs seen, every tool call, output, claims vs verified actions. Where it
is written, and whether it is gitignored.

## 10. Build order

Numbered, independently checkable, **step 1 a declared throwaway**. Mark the steps only the user can
do. Every step asserting harness behavior carries its own verification and a pre-written fallback.

## 11. Done-criteria and retirement

Ships able to complete its delegated internal objective. Unattended use begins only after its
standing mandate and failure path are tested. **Retirement condition:** what makes this get deleted?

---

End of spec.

