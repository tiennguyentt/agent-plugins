# behavior-implementer

A dual-host agent plugin (Claude Code + Codex) that implements features **behavior-first**:
natural-language Given/When/Then scenarios written before any code, every scenario seen
failing before it may pass, the three laws of TDD during implementation, and a measured
coverage/lint/complexity gate before every commit. It never pushes without asking.

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

## Skills

| Skill | Phase | Job |
|---|---|---|
| `write-scenarios` | before code | Turn a behavior into Given/When/Then scenarios that stay ignorant of code structure and can each be seen to fail |
| `implement-behavior` | during — **the entry skill** | Red first, thin glue (reuse the project's runner or write a small custom one), three laws of TDD, refactor on green |
| `gate-commit` | before commit | Measure suite/coverage/lint/complexity against the current tree; every check pass, fail, or NOT RUN — never guessed |

Invoke on Claude Code: `/behavior-implementer:implement-behavior` (or `:write-scenarios`,
`:gate-commit`), or dispatch the bundled `behavior-implementer` agent.
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

## Standalone by design

The plugin reads only its own bundled files. It detects the target project's own tooling
(test runner, coverage tool, linters) from the project itself and never installs anything to
run a gate — a check whose tool is absent is reported **NOT RUN**, not skipped silently.

## Honest limits

- The gate measures what its tools measure. Behavior correctness beyond the scenarios,
  security, and performance are named as `not checked` in every gate report — reviewing
  those is a separate job for a reviewer that is not the implementer.
- The agent's own green suite is evidence, not a verdict; pair it with independent review.
