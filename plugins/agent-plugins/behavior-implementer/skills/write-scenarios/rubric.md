# write-scenarios · grading rubric

Read by a verifier that did not write the scenarios. Read the **whole scenario set and the
feature request** before grading any single scenario — a set is also graded on what it
refuses to cover.

**One unit of grading:** one scenario (the set as a whole gets one additional verdict on
coverage).

**Verdicts — exact strings:**

| Verdict | It means |
|---|---|
| `PASS` | domain language, one `When`, observable `Then`, failure observation stated |
| `CODE-COUPLED` | the scenario names code structure: a method, selector, column, endpoint, payload shape |
| `UNFALSIFIABLE` | the `Then` cannot be observed or checked, or no `# fails when:` line exists |
| `INVENTED` | the behavior traces to no line of the feature request and no demonstrable domain rule |
| `NO-REFUSALS` | set-level only: no scenario in the set exercises an edge, refusal, or boundary |

**Evidence each verdict requires:** quote the offending (or passing) scenario line, plus —
for `INVENTED` — the absence after searching the request; name what you searched.

**Tie-break:** when uncertain whether wording is domain language or code structure, default
to `CODE-COUPLED` — the sceptical verdict. A verifier that resolves doubt in favour of the
work reproduces the bias this file exists to remove.

**Not evidence:** the verifier's own memory of the request, a scenario it did not read in
full, or the writer's summary of the set.
