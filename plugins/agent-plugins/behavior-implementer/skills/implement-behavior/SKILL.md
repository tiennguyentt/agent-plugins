---
name: implement-behavior
description: >
  The entry skill. Use when the user asks to "implement this feature", "build X test-first",
  "làm tính năng này", "code cái này theo TDD", "make these scenarios pass", or hands over any
  feature request that will become production code. Runs the full loop: scenarios first (via
  write-scenarios), every scenario seen failing, then the three laws of TDD until green, with
  gate-commit before anything is committed.
---

# implement-behavior

You implement behaviors, not files. The unit of work is one Given/When/Then scenario taken
from red to green through real production code. This skill owns the loop; `write-scenarios`
(sibling) writes the contract before you start, and `gate-commit` (sibling) stands between
green and any commit.

## Key insight

The wrong path this skill exists to prevent is code before red. Production code written ahead
of a failing test has no evidence it is needed, and a step definition that returns without
exercising production code turns a scenario green while testing nothing — the mutation
literature calls these always-green tests, and they are defects wearing coverage's clothes.
The discipline is one rule seen from two sides: **nothing goes green that was not first seen
red, and nothing red goes green except through production code.**

## Procedure

### 0 · Scenarios exist, or you stop and write them

Every behavior you are about to implement must have a scenario from `write-scenarios`
(sibling skill: `../write-scenarios/SKILL.md`), each with its failure observation stated. A
feature request with no scenarios starts there — never here.

### 1 · See every scenario fail

Run the scenario suite before writing any production code. Every new scenario must fail, and
fail **for its stated reason** — a missing-import crash is not the failure the scenario
defined. Record the failing run (test output in the commit message or the project's run log):
a red run nobody can point to later is a claim, not evidence.

### 2 · Glue: connect scenario language to production code

Steps are matched to code by a thin glue layer — a parser/runner connecting the scenario
vocabulary to production calls.

- **Reuse the project's existing runner** if one exists (behave, pytest-bdd, cucumber-js, a
  house-grown one). Extend its step table; do not add a second framework beside it.
- **When none exists, write a small custom parser/runner** — typically under a hundred lines:
  read the scenario files, match each step against a table of phrase → function, run them in
  order, report per scenario. Prefer this over adopting a heavyweight BDD framework for one
  project; the glue is yours and stays inspectable.
- **Every step definition exercises real production code and asserts a real observation.**
  No `pass`, no `pending`, no `# TODO`, no step that only touches test fixtures. An
  unimplemented step must make its scenario fail loudly, never skip quietly.

### 3 · The three laws, until green

Work one scenario at a time, smallest useful increments:

1. Write no production code except to make a failing test pass.
2. Write no more of a test than is sufficient to fail — and compilation failures count as
   failing.
3. Write no more production code than is sufficient to pass the currently failing test.

Between increments, run the tests. The rhythm is minutes, not hours: red → the least code
that earns green → refactor → red again.

### 4 · Refactor on green, with the quality bar

Only refactor while the suite is green, and hold the bar as you go:

- **Functions stay small** — cyclomatic complexity no greater than five where practical.
  When a function grows past that, extract; the name of the extracted function is
  documentation the compiler checks.
- **Tests couple to a testing API, not to internals.** As tests get more specific, code gets
  more generic: tests reach production behavior through the same surface real callers use,
  so a refactor that preserves behavior never breaks them.
- **Write lean code.** Say it once, name it well, delete what nothing calls. Token-lean code
  is cheaper for every future reader — human or model — but never at the cost of a
  load-bearing comment: a comment stating a constraint the code cannot show survives; noise
  does not.
- **Match the house style.** Idiom, naming, and comment density follow the surrounding code,
  not your habits.

### 5 · Gate, then commit

When the behavior's scenarios are green and the full suite passes, run `gate-commit`
(sibling skill: `../gate-commit/SKILL.md`) before any commit. Its verdict is the commit
license. **Never push without asking first — every time, no standing exception.**

## What you never do

1. **Never write production code ahead of a red test.** No "obvious" helpers, no speculative
   structure. The failing test is the license.
2. **Never create, keep, or tolerate a no-op, pending, or skeleton step definition.** Every
   step exercises production code and was seen to fail first.
3. **Never weaken an assertion to get to green.** A substring check where an exact match
   belongs, a broadened exception clause, a deleted `Then` — each is the test surrendering
   to the code. The code moves, not the contract.
4. **Never mock what you own** just to avoid designing a testing API — mock at boundaries
   you don't control (network, clock, filesystem), design seams for everything else.
5. **Never claim green from memory.** Every "passes" names the run that showed it; a suite
   you did not run is NOT RUN, and you say so.
6. **Never commit around the gate, and never push without explicit approval.**
