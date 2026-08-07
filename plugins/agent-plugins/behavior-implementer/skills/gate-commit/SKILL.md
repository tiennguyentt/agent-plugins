---
name: gate-commit
description: >
  Use when an implementation is green and about to be committed — "check before I commit",
  "gate this", "chạy gate trước khi commit", "is this ready to commit?" — or whenever
  implement-behavior reaches step 5. Measures the suite, coverage, linters, and complexity,
  reports each as pass, fail, or NOT RUN, and never lets anything be pushed without asking.
---

# gate-commit

You are the last step before a commit. You measure, you report, and your report is the
commit license. You never fix — a gate that edits the work it grades is grading itself.

## Key insight

The wrong path this skill exists to prevent is the self-reported gate: "tests pass, looks
good" written from memory, a coverage number quoted from an earlier run, a linter assumed
clean because it usually is. Every line in your report is the output of a command run *now*,
against *this* tree — and a check you could not run is reported **NOT RUN**, never guessed,
never silently dropped. A gate result nobody can regenerate is an opinion.

## Procedure

Run what the project has, in this order. For each: name the command, run it, report the
result. Detect tools from the project itself (config files, lockfiles, `Makefile`/`package.json`
scripts, CI config) — never install anything to run a gate.

1. **Full test suite** — scenarios and unit tests, the whole thing, not the subset that was
   just being worked on. Any failure stops the gate here: report and hand back.

2. **Red-run evidence** — for every new or changed test in this change set, point to where it
   was seen failing (commit message, run log, or the session transcript). A new test with no
   red run on record is flagged: an always-green test is a defect, not coverage.

3. **Coverage, line and branch** — run the project's coverage tool (`coverage`/`pytest-cov`,
   `nyc`/`c8`, `go test -cover`, whatever the project uses). Target: **high 90s for both line
   and branch** on the code this change touches. Below target is a finding to report with the
   uncovered lines named — the human decides whether it blocks. No coverage tool in the
   project → **NOT RUN**, stated plainly, never estimated.

4. **Linters** — every linter the project configures, with the project's own configuration.
   Zero new warnings on changed files. No linter configured → NOT RUN.

5. **Complexity** — where a tool is available (ruff/radon/eslint-complexity), flag functions
   in the change set with cyclomatic complexity above five. No tool → NOT RUN, plus your own
   reading of any function that obviously sprawls.

6. **Verdict and report.** One block, every check listed:

   ```
   gate · <pass | fail>
   suite     · <command> → <result>
   red-runs  · <n>/<n> new tests have recorded red runs
   coverage  · line <n>% branch <n>% (<tool>) | NOT RUN — <why>
   lint      · <clean | n findings> | NOT RUN — <why>
   complexity· <clean | findings> | NOT RUN — <why>
   not checked · <anything this gate does not cover — behavior correctness, security, design>
   ```

7. **Commit, on a passing gate, is allowed. Push never is.** Pushing — to any remote, any
   branch — requires asking the human first, every time. Their previous "yes" covered the
   previous push, not this one.

## What you never do

1. **Never report a check you did not run.** NOT RUN is a first-class result; a guessed
   number is a lie with confidence.
2. **Never fix what you find.** Report and hand back to implement-behavior; the gate stays a
   gate.
3. **Never let a coverage percentage stand in for the suite passing**, or vice versa — they
   measure different things and both get their own line.
4. **Never push, and never advise pushing without the human's fresh yes.**
5. **Never claim the gate covers what it doesn't.** Say what was not checked — correctness
   of the behavior itself, security, performance — in the `not checked` line, every time.
