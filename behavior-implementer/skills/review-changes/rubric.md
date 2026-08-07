# review-changes · grading rubric

Read by a verifier that did not write the review. Read the **whole diff, the whole scenario
set, and the whole findings report** before grading — a review checked hunk by hunk in
isolation cannot be judged for what it silently skipped.

**One unit of grading:** the review report as a whole; each individual finding also gets its own
evidence check.

**Verdicts — exact strings:**

| Verdict | It means |
|---|---|
| `COMPLETE` | every changed hunk in the diff has a finding or an explicit `clean ·` note, and every finding cites file:line |
| `MISSED-HUNK` | a changed hunk in the diff has neither a finding nor a `clean ·` note — the review is silent on it |
| `SEVERITY-FILTERED` | a low-confidence or low-severity issue was visibly present in the diff but not reported — the review filtered when it should not have |
| `REPAIR-PRESCRIBED` | a finding names the fix instead of only what is wrong — the review did the implementer's job |
| `SEAT-VIOLATION` | the reviewing session or agent is the same one that produced the diff, and the review proceeded instead of refusing |

**Evidence each verdict requires:** quote the diff hunk plus the report's line, or its absence,
for `COMPLETE`/`MISSED-HUNK`; quote the omitted issue and where in the diff it sits for
`SEVERITY-FILTERED`; quote the finding's repair language for `REPAIR-PRESCRIBED`; cite the
session/provenance record for `SEAT-VIOLATION`.

**Tie-break:** when uncertain whether a hunk was actually addressed, default to `MISSED-HUNK` —
the sceptical verdict. Doubt resolved in the work's favour reproduces the self-grading bias this
file exists to remove.

**Not evidence:** the reviewer's own summary that "everything was covered," a hunk the verifier
did not personally diff, or the reviewing session's own word on its seat check.
