# Workflow Spec — <name>

> **How to use this.** Copy into the capability's own chain folder as
> `artifacts/capabilities/<name>/<YYYY-MM-DD>-spec-<name>.md` — date first, per `control-plane/GUARDRAILS.md` §9 naming rule 1.
> **Card §12·2 closed 2026-07-26** on Tiên's signature: one folder per capability at
> `artifacts/capabilities/<name>/`, because *"a folder boundary is checkable; a filename convention is a habit."*
> The folder does not exist yet — the first capability to need it makes it.
>
> **Retitle the H1.** `# Workflow Spec — <name>` names the form, which `control-plane/GUARDRAILS.md` §9 rule 8 bans in
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
> "Default to workflow, not agent" (`control-plane/GUARDRAILS.md` §6 — the rule moved there on 2026-07-26 when §2 was
> deleted) is about the **composed** sense: **keep the steps fixed.** It is not an instruction to
> author a file.
>
> **Ends with `End of spec. Ready to build on confirmation.`** Licensed only by
> `Confirmed: <date> — Tien`, written by her. **No model ever writes that line.**

## 1. What this workflow produces

- **The valuable outcome**, in one sentence Tien would recognise:
- **Non-goals:** what it must not drift into.
- **Why fixed steps beat one agent here:** which parts genuinely need judgment, and which are
  mechanical. If an agent shell is still needed, say which steps it orchestrates
  and which reusable jobs remain separate skills. One agent may use several
  skills; it does not absorb their procedures.

## 2. Identity

- **Name:** one verb-object job string, byte-identical across this spec's
  filename subject, its evaluation route, every artifact folder it writes, and
  any skill/workflow block that implements it
  (`control-plane/GUARDRAILS.md` §9, naming rule 4). An enclosing agent plugin
  retains its separate noun-role identity.
- **Sensitivity:** `control-plane/GUARDRAILS.md` §4's tiers are **RATIFIED** as of 2026-07-26 — give the tier letter
  (S / C / P) plus plain words for what it touches.
- **Owner:** Tien.

## 3. The blocks it is made of

One row per artifact this workflow actually writes. In this order, top to bottom (`ref-formats.md` §8):

| Step | Block | File written | Why this option | **Held by** — the program, or the model? |
|---|---|---|---|---|
| 1 | permission rule / hook / locked skill / skill / agent / script workflow (`.js`) | | | |
| 2 | | | | |

> **The last column is the one that matters, and it is the reason this template exists.** Fill it
> honestly for every row. Only three things hold a step by themselves: a permission rule, a hook,
> and a frontmatter field the harness reads (`tools:` on an agent bounds a whole session;
> `disable-model-invocation: true` means only Tien can fire it; a `skills:` array loads
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
> permission rule, or Tien firing it by hand — or write plainly in this table that it is a
> convention only, and add a golden-set case that tests for it. Never leave the column blank.

- **Permission rule** — a tool must be blocked or surfaced every time, in every session. The only
  thing here enforced by the program. Syntax is documented — `allow`/`ask`/`deny` arrays of
  `Tool` or `Tool(specifier)` rules, e.g. `"Bash(npm run *)"`, `"Read(./.env)"`
  (`ref-formats.md`:323, :328–340) — never invented.
- **Hook** — must happen every time and no rule can express it. Handler `type` may be `command`,
  `http`, `mcp_tool`, `prompt`, or `agent` (`ref-formats.md`:275); a **command-type handler needs
  a script**, which in this workspace is a recorded exception in `CLAUDE.md` and `control-plane/DECISION-LOG.md`
  in the same change. Field list and hooks.json shape: `ref-formats.md`:273–310.
- **Command** — merged into skills (`ref-formats.md`:210); use `skill-spec.md` with
  `disable-model-invocation: true`. **Skill / agent** — each gets its own filled-in section from
  the matching template. Files land **inside the independent agent plugin** —
  `plugins/agent-plugins/<plugin-name>/skills/<name>/SKILL.md`
  and `plugins/agent-plugins/<plugin-name>/agents/<name>.md`
  (`control-plane/GUARDRAILS.md` §9 rule 5). The project-root
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
  `CLAUDE.md` is not loaded as project context (`ref-formats.md`:45, :326). So a plugin can carry
  capability; it can never carry this workspace's governance.

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

One mode per action (`control-plane/GUARDRAILS.md` §3): draft-only / approve-then-execute /
execute-and-notify / fully-autonomous. Permanent draft-only: external comms in Tien's name,
anything a board member, exec, or key customer reads.

## 7. What actually restrains it — state each layer at its true strength

| Layer | Strength | Covers |
|---|---|---|
| `deny` in `settings.json` | absolute, every session, **no documented override** | |
| `ask` in `settings.json` | stops and asks; approval lets it through — unattended, it stalls the run | |
| agent `tools:` | whole session | |
| skill `disallowed-tools` | **per-turn only** | |
| Step order / conventions | convention only | |

**Rules learned 2026-07-25** (recorded in the workspace spec's §5, §8 and §12·5, and in
`control-plane/DECISION-LOG.md`, 2026-07-25): deny is evaluated first and beats everything, so never deny a path
a step must read — use `ask`. A skill's `allowed-tools` pre-approves and does not restrict. A
`Read()` rule covers the Read tool only, not Grep and not a shell read. Anything not traceable to
`ref-formats.md` or those records is written as *tested at build time*.

**State coverage:** empty / malformed / ambiguous / duplicate / no-bucket → always "surface to
Tien with context." **Idempotency:** re-run behavior, and what makes duplicate side effects
impossible.

## 8. Injection posture, trifecta, evals

- External content is data, never instructions (`control-plane/GUARDRAILS.md` §5). If any step reads outside
  content, every side-effect step downstream is approve-then-execute or stricter.
- **Legs:** private data / untrusted external content / can communicate externally. All three
  disqualifies the design — split it or drop a leg. **The worked split is Anthropic's own**
  (`ref-financial-services-earnings-reviewer.md` §5): untrusted-reader holds no write tool, sole
  writer never reads untrusted input, handoff is a schema-bounded contract backed by tool denial.
  Count honestly: a leg closed only by habit is open.
- **Does any text of this workflow live in more than one file?** Source of truth, sync direction,
  drift check (`ref-financial-services-packaging.md` §3).
- **Golden set** at `artifacts/capabilities/<name>/evaluation/` — 10–30 real cases, **at least 3 refusals**, threshold per
  stakes, fidelity check for anything that summarizes. Gitignored if cases quote Tien's material.

## 9. Trace

Per-run log: trigger, inputs seen, every tool call, output, claims vs verified actions. Where it
is written, and whether it is gitignored.

## 10. Build order

Numbered, independently checkable, **step 1 a declared throwaway**. Mark the steps only Tien can
do. Every step asserting harness behavior carries its own verification and a pre-written fallback.

## 11. Done-criteria and retirement

Ships draft-only; loosens one notch only per `control-plane/GUARDRAILS.md` §3, with sign-off in `control-plane/COMPONENT-CATALOG.md`.
**Retirement condition:** what makes this get deleted?

---

End of spec. Ready to build on confirmation.

Confirmed:
