# strengthen-tests · grading rubric

Read by a verifier that did not run this mutation pass. Read the **whole mutation report, every
survivor's triage note, and every killing test** before grading any single survivor — a set is
also graded on what it wrongly waved through.

**One unit of grading:** one survivor's triage decision (the run as a whole gets one additional
verdict on the reported rates).

**Verdicts — exact strings:**

| Verdict | It means |
|---|---|
| `SOUND-ACCEPT` | the survivor was accepted-with-reason, and the reason holds: an equivalent mutant, dead or unreachable code, or a change genuinely outside the module's contract |
| `UNSOUND-ACCEPT` | the survivor was accepted-with-reason, but the reason does not hold — a real hole was rubber-stamped away |
| `WEAK-KILL` | a killing test exists for the survivor, but its assertion is substring/`in`-style rather than exact-match, or it does not actually exercise the mutated line |
| `MISCOUNTED-RATE` | the reported raw or meaningful-subset rate does not match the population and counts stated in the report |

**Evidence each verdict requires:** for the two accept verdicts, quote the survivor's mutation
description and the triage note; for `WEAK-KILL`, quote the killing test's assertion line; for
`MISCOUNTED-RATE`, recompute the rate from the report's own stated counts and show the mismatch.

**Tie-break:** when uncertain whether an accepted survivor's reason is real, default to
`UNSOUND-ACCEPT` — the sceptical verdict. Doubt resolved in the work's favour reproduces the
self-grading bias this file exists to remove.

**Not evidence:** the writer's summary that a survivor was "handled," a rate quoted without its
population, or the verifier's memory of a similar mutant seen elsewhere.
