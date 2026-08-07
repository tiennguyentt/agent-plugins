# rubric — is this document the type its position calls for

**For a verifier who did not write the document.** You do not need to know the subject. Every
criterion below is answerable by reading the document and counting, and where it is not, the
criterion says so and asks you to record `cannot judge` rather than guess.

**What this grades.** One thing: whether the document carries the features its own type owns and
none that belong to another type. `references/chain.md`, *Features belong to types*, is the source —
open it; this file is that table turned into checks, not a replacement for it.

**What this does not grade.** Whether the content is correct, whether the recommendation is good, or
whether the writing is pleasant. It also does not replace the paste test, which runs after delivery
and asks whether a message came out. A document can pass here and still fail there.

---

## Step 1 · Establish the type without asking the author

Do not accept the document's own label. Derive the type, then compare.

| Evidence in the document | Type it indicates |
|---|---|
| Ends `End of spec. Ready to build on confirmation.` | spec |
| Carries `NEW` / `EDIT` / `REGENERATED` per file | implementation notes |
| Cites a measurement by filename and reopens one question | re-research |
| Ranked options with ranking tags exiting in one decision | research |
| A catalogue of the domain's own objects with severity-graded pitfalls | explainer |

**If the derived type and the stated type disagree, that is a FAIL on its own.** Record both and
stop; the rest of the rubric grades against the wrong table otherwise.

If two rows match, record `CANNOT JUDGE` and name the two.

If **no** row matches, the document is not one of the five. Record `CANNOT JUDGE`, say which
features it does carry, and stop — the feature table below only grades documents that have a type.

---

## Step 2 · Features present that the type owns

Score each row: `present` / `absent` / `n/a`.

**`n/a` means the row's *Owned by* column excludes the derived type**, so the feature could not
legitimately appear. `absent` means the type may carry it and the document does not. Only `absent`
on a required row is a failure; `n/a` rows leave the denominator.

**Which rows are required, by type** — taken from `chain.md`'s *Contains* list for each of the five,
not from the *Owned by* column, which only says where a feature is permitted:

| Type | Required rows |
|---|---|
| explainer | 2, 4, 5, 2a, 2b |
| research | 1, 2, 6, 7 |
| spec | 8, 9, 10, 11 |
| implementation notes | 3, 12, 13 |
| re-research | 3, 14 |

Row 1 is deliberately absent from implementation notes: `scope:` is *permitted* there and
`chain.md`'s contents list does not require it, so an impl-notes document with no scope line passes.

| # | Feature | Owned by | Check |
|---|---|---|---|
| 1 | `scope:` line naming exact files | research, implementation notes | A literal scope line exists and names files, not areas |
| 2 | Failure modes, qualitative | explainer, research | Described, not measured — no numbers |
| 3 | Failure modes, **measured** | implementation notes, re-research | A number **produced by a run**. `chain.md`'s examples are both run-derived (*"identity loss around frame 90+"*, *"~5 min per 5s clip on MPS"*), and its standing rule 4 defines this feature as the post-run upgrade from adjectives. A version number, a vendor-documented percentage, or any figure the document marks unverified is **not** a measurement — score `absent` |
| 4 | Severity tags `HIGH` `MED` `LOW` | explainer | Attached to pitfalls, and the list is capped |
| 5 | Capability chips `FLAGSHIP` `RECOMMENDED` | explainer | Attached to the **domain's** catalogue |
| 6 | Ranked options + ranking tags, one exit decision | research | Exactly one option is recommended |
| 7 | One recommendation **and** its escape hatch | research | Both present; a recommendation alone is a fail |
| 8 | "Already built — do not touch" | spec | A named section marks what the build may not change |
| 9 | Open decisions as tagged defaults | spec | Each states default, alternative, and why the default won |
| 10 | Build order, independently testable | spec | Numbered, and each step names its own verification |
| 11 | The declared throwaway first step | spec | Step 1 says in the document that it is disposable |
| 12 | `NEW` / `EDIT` / `REGENERATED` per file | implementation notes | Per file, not per section |
| 13 | The embarrassing specific, verbatim | implementation notes | A detail nobody would have guessed, quoted |
| 14 | Citing a measurement by filename | re-research | The number and the file that produced it |
| 2a | The object printed rather than described | explainer | A real captured artifact — a transcript, a terminal session, actual output. Reconstructed or documentation-derived output the document itself flags is **absent**, and say so |
| 2b | What the page is **not** | explainer | A named section or line stating what the document does not cover |

**A row is required only when `references/chain.md` says that type contains it.** The *Owned by*
column answers "may this feature appear here", which is an exclusion rule; it does not by itself
make the feature mandatory. Before failing a document for a missing owned feature, open
`chain.md`'s *"Contains:"* list for that type and confirm it is actually required there. The known
trap: `scope:` line is owned by research **and** implementation notes, but `chain.md`'s
implementation-notes contents list does not include one, so an impl-notes document written exactly
to the corpus has no scope line and must not fail for it.

**A required feature that is missing is a fail, not a style note.** Record which corpus line made
it required.

---

## Step 3 · Features present that the type does NOT own

This is where the method actually fails, so read for it deliberately. Any row from Step 2 marked
`present` whose *Owned by* column excludes the derived type is a **transplant**.

**Score the body only. The closing block is out of scope for this step.** The closing block is the
message commissioning the *next* document, so it will correctly contain that document's vocabulary —
an explainer's closing block asking for one `RECOMMENDED DEFAULT` with an escape hatch is the
closing block doing its job, not a research feature transplanted into an explainer. Step 4 grades
the closing block on its own terms.

**Each transplant is a FAIL.** Name the feature, the type that owns it, and quote the line.

The two transplants seen most often:

- **A structure named in a research document.** Structure is the spec's, and naming one earlier
  means the choice was already made while the document still presents itself as open.
- **A ranked options table in an explainer.** An explainer that ends in options has taught nothing.

**The tag test, when a chip is ambiguous.** Ask what the tag is attached to. A chip on the
*domain's own catalogue* teaches and belongs to the explainer. A chip on the *project's options*
decides and belongs to research — and only that second kind earns a scope line and an escape hatch.

---

## Step 4 · Chain integrity

| # | Check | Fail when |
|---|---|---|
| 15 | Opens with `Recap from <predecessor filename>.` | Absent, or names a file that does not exist. **`n/a` when this is the first document in its chain** — an explainer written when nothing preceded it has no predecessor to name |
| 16 | Exactly one document was produced | Two or more documents in one delivery |
| 16a | The document is an HTML artifact | It is Markdown, and the target repo's naming law was not cited as requiring it |
| 17 | No predecessor was edited or deleted | Any earlier chain document changed in the same delivery |
| 18 | Closes with literal pasteable text | The closing block describes the next message instead of writing it |
| 19 | The closing block stands alone | A reader who skipped the body could not act on it. Referring back is fine when each reference is glossed in place — *"pitfall 8, the writer starvation one"* stands alone; a bare *"see pitfall 8"* does not |
| 20 | Reject is as cheap as accept | No pre-written reply that flips a decision the document itself tagged |

Row 20 applies to specs. For other types record `n/a`.

---

## Step 5 · Two gates the type-check cannot see

Both gates are type-conditional. **Record `n/a` when the type is not the one the gate names** — the
first applies only to a spec, the second only to a re-research. Otherwise record a verdict or
`cannot judge`, and do not guess.

- **Spec written on an unranked predecessor.** A spec commits, so it is licensed only by a research
  document ending in one named approach with the escape hatch built. If the predecessor is
  unreadable to you, record `cannot judge` and say why.
- **Re-research written on a scattered failure.** The trigger is a failure that is measured,
  reproducible, and repeating with **one shape**. Four of five failures sharing a shape is a
  trigger; five unrelated misses is a bug list.

---

## Verdict

```
type · <derived> (stated: <stated>)
required features · <n present> / <n required>
transplants · <count, each named>
chain integrity · <rows failed, by number>
step 5 gates · <verdict on each, or n/a>
contains-quote · <one line from chain.md's Contains list for this type>
cannot judge · <every item you could not verify, and why>
verdict · PASS | FAIL | CANNOT JUDGE
```

**The verdict is exactly one of three strings**, spelled as written:

- `PASS` — derived type matches stated, every required feature present, zero transplants, no failed
  row in Step 4, **and Step 5's gates answered without a violation**. A document that fails a Step 5
  gate cannot pass, whatever Steps 1-4 said.
- `FAIL` — any one of those is not met.
- `CANNOT JUDGE` — the type could not be derived, or a check you could not run would decide the
  verdict either way. Prefer this to a guess. A wrong `PASS` costs more than a `CANNOT JUDGE`,
  because the whole point of handing this file to somebody else is that the author already believed
  the document was fine.

## What is not evidence

- **Your memory of `references/chain.md`.** Open it. The corpus is amended, and a rubric applied
  from memory grades against a version that may no longer exist. **Your verdict block must quote one
  line from `chain.md`'s *Contains* list for the derived type.** Steps 1–4 are self-contained enough
  that a verdict can be produced without ever opening the corpus, which was measured on 2026-07-31 —
  the quote is what stops that.
- **A citation you did not follow.** If the document cites a predecessor, open the predecessor. A
  `Recap from` line naming a file you never checked is an unverified claim, not a passed row.
- **The document's own label.** Step 1 exists because a document that calls itself a spec is making
  a claim, not stating a fact.
- **The author's explanation.** If the person who wrote it tells you why a feature is missing, that
  is an input to `cannot judge`, never to `PASS`.

**`cannot judge ·` is never empty.** A rubric returning a clean verdict with nothing unverifiable is
reporting on a document it did not read closely, and that is the failure this file exists to make
visible.
