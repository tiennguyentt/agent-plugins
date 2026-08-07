# rubric — is this an anatomy, or an explainer wearing its name

**For a verifier who did not write the document.** You do not need to know the subject. Every
criterion is answerable by reading the document and counting.

**What this grades.** Whether the document maps a system's parts and their fit, and whether it
stayed out of the neighbouring types. `references/anatomy-form.md` is the source — open it. This
file is that document turned into checks, not a replacement for it.

**What this does not grade.** Whether the parts list is correct, whether the system was worth
mapping, or whether the writing is pleasant. It also does not replace the paste test, which runs
after delivery and asks whether a message came out.

---

## Step 1 · Is it a map at all

| # | Check | Fail when |
|---|---|---|
| 1 | Three or more parts are enumerated | Fewer than three, or the "parts" are one object's features |
| 2 | The parts are countable | The document surveys a topic instead of listing components |
| 3 | Each part is named, not gestured at | A part appears only inside prose about something else |

**Fail any of 1–3 and stop.** The rest of the rubric grades a map, and this is not one. Record
which check failed and what the document is instead.

---

## Step 2 · Is the payload present

| # | Check | Fail when |
|---|---|---|
| 4 | Relationships between parts are stated | Parts listed with no seams — this is a glossary |
| 5 | For touching parts, what crosses the boundary is named | Adjacency asserted with no traffic across it |
| 6 | A *what is not a part* boundary exists | Absent, so nothing stops the map growing |
| 7 | Seam failures are given, qualitative | Absent, or given as measured numbers |

Row 7's two failure directions are different defects. Absent means the map has no seams worth
knowing about. Measured means the document borrowed from implementation notes or re-research, which
own measured failure.

---

## Step 3 · Did it stay out of its neighbours

**This is where the form actually fails, so read for it deliberately.**

| # | Check | Fail when |
|---|---|---|
| 8 | No decision is made | The document recommends a part, a layout, or an approach |
| 9 | No ranked options table | Ranking with tags belongs to research only |
| 10 | No structure is named for the thing being built | Naming a structure is the spec's first privilege |
| 11 | The opening does not borrow the explainer's defining line | It opens *"A working tour of X… and the failure modes that don't appear in the README"* or a close paraphrase |
| 12 | No `scope:` line, no build order, no per-file change tags | Each belongs to another type |

**Row 11 has a recorded specimen.** `anatomy-form.md` §2 names one document that opened with the
explainer's defining sentence and has read as an explainer ever since. Quote the opening line when
you fail this row; a paraphrase counts.

**Row 8 is the one most often failed politely.** A closing block that commissions the research
document is correct. A closing block that says which part to build on is a decision.

---

## Step 4 · Chain integrity

| # | Check | Fail when |
|---|---|---|
| 13 | Opens with `Recap from <filename>.` | Absent, or names a file that does not exist. **`n/a` when this is the first document in its chain** |
| 14 | Exactly one document was produced | An anatomy and its explainer in one delivery |
| 14a | The document is an HTML artifact | It is Markdown, and the target repo's naming law was not cited as requiring it |
| 15 | No predecessor was edited or deleted | Any earlier document changed in the same delivery |
| 16 | Closes with literal pasteable text | The closing block describes the next message instead of writing it |
| 17 | The closing block stands alone | A reader who skipped the body could not act on it. Referring back is fine when each reference is glossed in place |

---

## Step 5 · The question the checks cannot see

Record a verdict or `cannot judge`. Do not guess.

**Was this breadth or depth?** If the parts turn out to be one object's features, the request wanted
an explainer and this document answered the wrong question — every row above can pass while the
document is the wrong type. The test from `anatomy-form.md`: could three of the named parts be
swapped out independently? If you cannot tell from the document, record `cannot judge` and say what
would settle it.

---

## Verdict

```
parts enumerated · <n>
payload · <rows 4-7 failed, by number>
neighbour bleed · <rows 8-12 failed, by number>
chain integrity · <rows 13-17 failed, by number>
form-quote · <one line from references/anatomy-form.md you are grading against>
cannot judge · <every item you could not verify, and why>
verdict · PASS | FAIL | CANNOT JUDGE
```

**The verdict is exactly one of three strings**, spelled as written:

- `PASS` — Steps 1–4 clean, and Step 5 answered breadth.
- `FAIL` — any row failed, or Step 5 answered depth.
- `CANNOT JUDGE` — Step 5 could not be answered, or a check you could not run would decide it
  either way. Prefer this to a guess.

## What is not evidence

- **Your memory of `references/anatomy-form.md`.** Open it. **Your verdict block must quote one
  line from it** — that is what stops a verdict being produced from this file alone.
- **The document's title.** A document titled *"The anatomy of X"* is making a claim, not stating a
  fact. Step 1 exists because of that.
- **The document's opening sentence.** Row 11 exists because one specimen's opening belongs to the
  neighbouring type while its body is a map.
- **The author's explanation.** If the writer tells you why a section is missing, that is an input
  to `cannot judge`, never to `PASS`.
