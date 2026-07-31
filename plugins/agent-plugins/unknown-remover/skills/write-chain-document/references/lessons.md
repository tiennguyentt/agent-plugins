# Lessons from running the chain

`[observed]` — §§1–9 from writing links 1–3 of one chain end to end, 2026-07-23. **n = 1.** §10 has a
different provenance: maintaining these files rather than running the chain, 2026-07-25. These are
specific ways to be wrong that were hard to see from the inside, not laws. Each is written so it
survives without the project it came from; if an entry needs that project's numbers to make sense, it
does not belong here. **Entries are append-only** — other files cite them by number.

---

## 1 · A research doc is allowed to overturn its explainer, and often should

The explainer's job is discovering unknowns; it is written before any arithmetic exists. So the
candidate it leaves you leaning toward is a *hunch with a tour attached*. When the research doc ranks
properly, that hunch can lose — and if it never loses, the ranking is decorative.

**The tell that a ranking is decorative:** the recommendation matches the previous document and the
table's job was to agree.

---

## 2 · Rank by dependent-step count before ranking by appeal

Count the steps that must each succeed for the candidate to deliver, then take `0.95^n`. The spread
between a three-step candidate and an eight-step one is large enough to swamp any quality argument
you can make in prose, and it is the only comparison in a research doc that needs no domain
expertise to check.

It also reorders things counterintuitively: the most *interesting* candidate is usually the one with
the most dependent steps, because interesting means it does more.

---

## 3 · Autonomy level and oversight model are two axes, not one

How much the thing decides on its own (L0–L5) and who is watching (human in / on / out of the loop)
vary independently. Low autonomy with nobody watching can be perfectly safe; high autonomy with a
human nominally in the loop is where the damage lives, because the human approves without reading.

Collapsing them into one "how autonomous" slider is how a design ends up with the wrong safeguard.

---

## 4 · Compute the acceptance test from the specified rule, not from the story

The near-miss worth remembering: a spec described a past failure, then wrote an acceptance test
asserting the detector "would have fired" on the date the failure *began*. But the rule as specified
had a second condition, and under that rule the fire date was weeks later.

**A correctly-built implementation would have failed that test.** The test would then have been
"fixed" by weakening the rule — the failure propagating backwards from the test into the design.

Whenever a spec claims a replay outcome, derive the outcome by hand-executing the spec's own rule
against the data. Do not derive it from the narrative that motivated the rule. Those two answers
diverge quietly and only in the direction that looks right.

---

## 5 · Tag invented vocabulary as invented

Coined phrases are the most repeatable part of a good document, which means unmarked ones escape and
get repeated in rooms where the reader assumes they are field terminology. Mark them, and where a
real term exists, name it alongside: *"I call this X; the published term is Y."*

The cost of not doing this is paid by the reader in a meeting, not by the writer.

---

## 6 · Precision is the tell for invention

Invented figures come out *more* precise than sourced ones, because a real measurement carries its
own caveats and a fabricated one has nothing to blunt it. When auditing a document for unsourced
claims, sort by specificity and start at the top — the confident, exact, unattributed number is the
one to check first.

---

## 7 · A reference path outside the folder is not portable

A method folder that cites `~/something/` is portable only until it is copied somewhere that path is
missing — and then it keeps *looking* fine, because nothing checks a path in prose. Observed here:
several documents cited a directory that had been deleted, and one of the claims about its contents
turned out to be **false the moment the files were actually available to check.**

Bundle what you cite, or accept that the citation is decoration.

---

## 8 · For accumulation tripwires, count files — never bytes

A byte figure recorded inside the file that reports it changes every time that file is edited, so it
is wrong by the time anyone reads it, and each correction looks like drift in the thing being
measured. File count is stable, cheap, and verifiable by one command.

Related: **if you later exclude something from the count, record the exclusion and the pre-exclusion
number in the same place.** Amending a tripwire after it fires is the exact behaviour the tripwire
exists to catch, and the only defence is that the amendment is visible.

---

## 9 · The spec gate fails by silent approval, not rejection

By the time a spec exists, the reader has agreed to the framing three documents running. Acceptance
is the path of least resistance and it looks identical to genuine agreement.

Two mitigations, both cheap:

- **§12 must tag at least one decision `CLOSE`** and pre-write the reply that flips it, so accepting
  as written is visibly a choice rather than a default.
- **Treat two consecutive accept-as-written replies as a signal, not a result.** From a reader who
  normally pushes back, the second unmodified accept means they have stopped reading closely — stop
  and check rather than proceeding faster.

---

## 10 · The distiller invents more than the source does

`[observed 2026-07-25]` — from maintaining the method files, not from running the chain. §6 says
precision is the tell for invention. Two claims were checked against their sources on one day of
maintenance, and **both failures were introduced by the person summarising, not carried in from the
source:**

- A "7× more capability for power users" figure, stated as the author's own finding. In the transcript
  it is an *audience questioner's* framing; the author's reply neither confirms the number nor uses it.
- "The published explainer prompt never asks for unknown unknowns" — written while explaining why that
  sample under-delivers. The prompt asks for them **outright.** The true finding was sharper: asking
  as a *goal* returns vocabulary, asking for a *deliverable* returns failure modes.

Both were fluent, both fit the argument, and neither would have been caught by rereading the summary —
only by reopening the source. So the audit target is not the source's reliability but **your own most
quotable sentence.** The claim that best serves the point you are making is the one to verify first;
a summary is most dangerous exactly where it is most useful.

**Corollary — verification is where the good version comes from,** not damage control. Both times
above, the corrected claim carried a distinction the invented one had flattened.

**Corollary — numbered entries are append-only once anything cites them.** This entry was first
drafted as §9, which silently renumbered the existing §9 that `mental-model.md` cites by number. A
numbered list that other files reference cannot be inserted into, only extended.
