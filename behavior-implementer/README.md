# behavior-implementer

A dual-host agent plugin (Claude Code + Codex) that implements features **behavior-first**:
natural-language Given/When/Then scenarios written before any code, every scenario seen
failing before it may pass, the three laws of TDD during implementation, and a measured
coverage/lint/complexity gate before every commit. It never pushes without asking.

```text
Distribution mode: standalone
Portable core: `skills/`
Portable entry skill: `implement-behavior`
Codex project agent: none
```

Standalone is measured, not asserted: no file in `agents/` or `skills/` names a repo-owned
plane, so the package carries every rule it enforces.

## One part of a bigger system, shared on purpose

This is one of several agent plugins in this repository, where agent teams do
the work end to end. It is published on its own because a part that only runs inside the repo
that grew it is not a part — it is a dependency.

**Built for a team, not for a demo.** Five skills, one job each, each independently invocable
without the agent — the BDD/TDD loop (`write-scenarios`, `implement-behavior`, `gate-commit`)
plus two more seats the agent does not preload: the mutation seat (`strengthen-tests`) and the
review seat (`review-changes`). Grading standards live in `rubric.md` files read by an agent
that did *not* produce the work, because a maker's own "looks good" is not evidence. The
packaging is checked by machine: `plugin.json` conforms to Agent Plugins 1.0.0, and a contract
check fails the build when the manifests, the entry skill, or the routes drift apart.

**What is not measured says so.** This plugin has a golden set of **zero cases run** — the
evaluation routes exist and are marked NOT BUILT / NOT RUN, not quietly left blank. Nothing here
claims a pass it did not earn.

**It runs beside nothing else.** `implement-behavior` is the whole route on both hosts, no
this repository checkout required. That is measured above, not asserted — and among the four plugins,
this is currently the only one where it is true.

## Package layout

```text
behavior-implementer/
├── plugin.json                  portable manifest — Agent Plugins 1.0.0
├── .claude-plugin/plugin.json   Claude Code adapter
├── .codex-plugin/plugin.json    Codex adapter
├── README.md                    this file
├── agents/
│   └── behavior-implementer.md  exactly one Claude agent definition
└── skills/                      the portable core, shared by both hosts
    ├── write-scenarios/
    │   ├── SKILL.md
    │   └── rubric.md            scenario quality, judged by a separate verifier
    ├── implement-behavior/      portable entry
    │   ├── SKILL.md
    │   └── rubric.md            loop discipline, judged by a non-maker
    ├── gate-commit/
    │   └── SKILL.md
    ├── strengthen-tests/        the mutation seat — not preloaded by the agent
    │   ├── SKILL.md
    │   └── rubric.md            triage soundness, judged by a separate verifier
    └── review-changes/          the review seat — not preloaded by the agent
        ├── SKILL.md
        └── rubric.md            review completeness, judged by a separate verifier
```

## Package format

This package follows **Agent Plugins 1.0.0**, an open, vendor-neutral standard from the Agent
Plugins project — specification <https://agent-plugins.org/specification>, repository
<https://github.com/agentplugins/agent-plugins-spec>. Specification text is licensed CC-BY-4.0,
its schemas Apache-2.0. this repository adopted it on 2026-08-07 after Google's announcement of the
format, <https://developers.googleblog.com/agent-plugins-package-your-skills-tools-and-more/>.

The package *conforms to* that standard and vendors none of its files: `plugin.json` is written
here, and `$schema` is a URL pointing at theirs. Nothing in this plugin is authored by the Agent
Plugins project.

## The loop

```
feature request
   │
   ▼
write-scenarios      Given/When/Then, domain language only,
   │                 each scenario's failure observation stated
   ▼
implement-behavior   see every scenario fail → glue steps that exercise
   │                 real code → three laws of TDD until green → refactor
   ▼
gate-commit          suite · red-run evidence · coverage (line+branch,
   │                 high-90s target) · linters · complexity ≤5
   ▼
commit               push only after a fresh, explicit yes — every time
```

## Two more seats, outside the loop

`strengthen-tests` (the mutation seat) and `review-changes` (the review seat) are licensed
skills in this plugin, invoked on their own — the agent does not preload either into every run
of the loop above.

- **`strengthen-tests`** takes a module and its green suite, runs mutation testing in a fresh
  sandbox (never a prior run's cache — that is evidence, not a scratchpad), triages every
  survivor into accepted-with-a-written-reason or a real hole, and drafts exact-match killing
  tests for the real holes. Reports both the raw kill rate and the meaningful-subset rate, with
  the population counted. Its killing tests are drafts — they never enter the real suite
  without passing through a handoff review.
- **`review-changes`** takes a diff and the scenario set it claims to satisfy, and reports every
  finding at file:line — including low-confidence and low-severity ones — never the repair.
  **The seat rule: the reviewer is never the maker of the diff.** If the same session or agent
  wrote the diff, `review-changes` refuses and says so.

## Skills

| Skill | Phase | Job |
|---|---|---|
| `write-scenarios` | before code | Turn a behavior into Given/When/Then scenarios that stay ignorant of code structure and can each be seen to fail |
| `implement-behavior` | during — **the entry skill** | Red first, thin glue (reuse the project's runner or write a small custom one), three laws of TDD, refactor on green |
| `gate-commit` | before commit | Measure suite/coverage/lint/complexity against the current tree; every check pass, fail, or NOT RUN — never guessed |
| `strengthen-tests` | on request — the mutation seat | Mutation-test a module in a fresh sandbox, triage every survivor, draft exact-match killing tests for real holes |
| `review-changes` | on request — the review seat | Review a diff against the scenarios it claims to satisfy; every finding at file:line, never the repair; refuses to review its own maker's diff |

Invoke on Claude Code: `/behavior-implementer:implement-behavior` (or `:write-scenarios`,
`:gate-commit`, `:strengthen-tests`, `:review-changes`), or dispatch the bundled
`behavior-implementer` agent.
Invoke on Codex: `$behavior-implementer:implement-behavior`.

## The rules it holds, in one place

**BDD/TDD**

- Given/When/Then scenarios for all new behaviors, in natural language, ignorant of code
  structure.
- Every scenario is seen to fail before it is implemented — and fails for its stated reason.
- Glue is a thin parser/runner connecting scenario language to production code: reuse the
  project's runner if it has one, write a small custom one when it doesn't.
- The three laws of TDD govern every increment.
- No no-op, pending, or skeleton step definitions — ever. An always-green test is a defect.

**Code quality**

- Functions small; cyclomatic complexity no greater than five where practical.
- Tests decouple from production code through a testing API: as tests get more specific,
  code gets more generic.
- Line and branch coverage held in the high 90s on touched code — measured, never estimated.
- The project's own linters, with the project's own config, zero new warnings.
- Lean, token-conscious code — say it once, name it well — never at the cost of a
  load-bearing comment.

**Git**

- The gate runs before every commit; its report is the commit license.
- **Never push without asking first.** Every push needs its own fresh yes.

## Optional files, decided per skill

Per the house skill template, `rubric.md` and `<name>.workflow.js` are independent per-skill
decisions:

| Skill | `rubric.md` | `workflow.js` |
|---|---|---|
| `write-scenarios` | **yes** — scenario quality is judged; a separate verifier gets the standard as a file | N/A — no fan-out or staged orchestration |
| `implement-behavior` | **yes** — loop discipline (red evidence, vacuous steps, weakened contracts) is judged by a non-maker | N/A — the loop is sequential by design |
| `gate-commit` | N/A — its report is verified by re-running the named commands, a deterministic check | N/A — plain command runs, no orchestration |
| `strengthen-tests` | **yes** — triage soundness (a survivor wrongly accepted, a weakened kill) is judged by a non-maker | N/A — one module, one sandbox, sequential triage; no fan-out, pipeline, or per-stage model tier the requirements call for |
| `review-changes` | **yes** — review completeness (a missed hunk, a filtered finding, a prescribed repair, a seat violation) is judged by a non-maker | N/A — one diff read whole against one scenario set in a single pass; no fan-out the requirements call for |

A rubric is read by an agent that did not produce the work; the skills point their verifier
at it and never self-grade.

## Standalone by design

The plugin reads only its own bundled files. It detects the target project's own tooling
(test runner, coverage tool, linters) from the project itself and never installs anything to
run a gate — a check whose tool is absent is reported **NOT RUN**, not skipped silently.

## Honest limits

- The gate measures what its tools measure. Behavior correctness beyond the scenarios,
  security, and performance are named as `not checked` in every gate report — reviewing
  those is a separate job for a reviewer that is not the implementer.
- The agent's own green suite is evidence, not a verdict; pair it with independent review.
- `strengthen-tests` only reports what the mutation instrument can generate for the target
  language and module; a kill rate is a floor on this repository's strength, not a ceiling on its
  correctness.
- `review-changes` reports what is wrong, never the fix, and refuses outright if it cannot
  confirm it is not grading its own diff — a review with no seat check behind it is not this
  skill's output.
