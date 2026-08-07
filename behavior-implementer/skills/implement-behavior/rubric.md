# implement-behavior · grading rubric

Read by a verifier that did not write the code. Read the **whole change set** — scenarios,
step definitions, production diff, and the recorded red runs — before grading any single
behavior; sampling one file punishes work that cites once and misses vacuous steps.

**One unit of grading:** one implemented behavior — its scenario, its steps, its production
code, and its red-run record, together.

**Verdicts — exact strings:**

| Verdict | It means |
|---|---|
| `CONFIRMED` | a red run is recorded, failing for the scenario's stated reason; every step exercises production code; assertions match the contract |
| `NO-RED-EVIDENCE` | no recorded failing run exists for this scenario, or the recorded failure is not the stated one (e.g. an import crash) |
| `VACUOUS-STEP` | a step definition passes without exercising production code or without asserting an observation |
| `CONTRACT-WEAKENED` | an assertion was loosened, a `Then` dropped, or an exception clause broadened to reach green |

**Evidence each verdict requires:** `CONFIRMED` quotes the red-run record and one step's
production call. The three failing verdicts quote the offending line or name the record that
is absent — and for absence, name where you searched (commit messages, run log, transcript).

**Tie-break:** when uncertain whether a red run is recorded, default to `NO-RED-EVIDENCE` —
the sceptical verdict. Doubt resolved in the work's favour reproduces the self-grading bias
this file exists to remove.

**Not evidence:** the implementer's own report of green, the verifier's memory of a
previous review, or a test run the verifier did not see the output of.
