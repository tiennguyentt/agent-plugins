# The chain — five documents

`[observed]` throughout. Quotes are from Thariq's own documents and the transcript.

## The five

| # | Type | Defining line | Licenses |
| --- | --- | --- | --- |
| 1 | **EXPLAINER** | *"A working tour of X… and the failure modes that don't appear in the README"* | the research doc |
| 2 | **RESEARCH**, pre-decision | *"…which model to reach for… and the half-dozen decisions worth making before writing code"* | the spec |
| 3 | **SPEC** | ends *"End of spec."* | the build |
| 4 | **IMPLEMENTATION NOTES** | *"What got built, where it deviates from the research doc, and what you need to do once to light it up"* | re-research — or nothing |
| 5 | **RE-RESEARCH**, after measured failure | *"…the drift problem SAM 2 hits around frame 90 on your podium clip"* | a respec, or a drop |

```
explainer → research → spec → BUILD → implementation notes → MEASURED failure
   ↑                                                              ↓
   └───────────── re-research, citing those measurements ─────────┘
                              ↓
                     respec — or drop it
```

From the transcript: *"I ask it to keep implementation notes as it goes so that it finds out what
are things that we weren't expecting… and once we have that we can actually respec if we need to."*

**They cite each other by filename.** `Cutie & DEVA` §01 opens *"Recap from
`matte-implementation-notes.html`."* The matte notes open *"Translating `text-behind-research.html`
into working code."*

Two consequences worth more than any single document:

- **Position is not chosen — it is defined by the last document written.** No list to consult, no
  state to maintain. This is why a chain does not become bureaucracy the way a framework does.
- **An orphan is visibly an orphan.** A document nothing cites has failed, and you can see that from
  the filesystem.

---

## Features belong to types

**The most important table here.** A feature used outside its home document is an error, not an
improvement. Flattening these into a general checklist is the standard failure.

| Feature | Owned by | Quoted from |
| --- | --- | --- |
| `scope:` line naming exact files | research, impl-notes | *"scope: new scripts/matte.py · new src/primitives/TextBehind.tsx"* |
| Failure modes, **qualitative** | explainer, research | *"visible fringing on hair against bright text"* |
| Failure modes, **measured** | impl-notes, re-research | *"identity loss around frame 90+"* · *"~5 min per 5s clip on MPS"* |
| Severity tags on failure modes | **explainer** | `HIGH` `MED` `LOW` on the twelve pitfall cards — grades how much a failure matters, ranks nothing |
| Capability chips inside the domain's own catalogue | **explainer** | `FLAGSHIP` `RECOMMENDED` on the Whisper size table — the domain's shelf, not the project's options |
| Ranked options exiting in one decision + ranking tags | **research only** | `RECOMMENDED DEFAULT` `STRONG ALT` `PROTOTYPE ONLY` `FLICKERS` `AVOID` |
| One RECOMMENDATION + escape hatch | **research only** | *"SAM 2 as the primary path with a CLI flag to swap to RVM"* |
| "Already built — do not touch" | **spec only, §3** | *"Asset pipeline (already built)… Unchanged by this spec"* |
| Open decisions as tagged defaults | **spec only, §12** | *"Things picked as defaults; flip any of them if you disagree"* |
| Build order, independently testable | **spec only, §11** | *"Each step is independently testable"* |
| The declared throwaway step | **spec only, §11 step 3** | *"Hand-write a compositions.generated.ts with one demo composition to prove the render pipeline"* |
| `NEW` / `EDIT` / `REGENERATED` per file | **impl-notes only** | §01 of the matte notes |
| The embarrassing specific | **impl-notes only** | *"two torso points produced a clean cutout of two floating shirts"* |
| Citing a measurement by filename | **re-research only** | *"Recap from matte-implementation-notes.html"* |

**Status tags appear everywhere, but the vocabulary changes per document.** Explainer grades
severity (`HIGH`/`MED`/`LOW`) and shelf-status within the domain (`FLAGSHIP`). Research ranks
(`AVOID`). Spec marks state (`already built`). Impl-notes report (`VERIFIED END-TO-END`,
`INSTALL BUG FIXED`, `KEY LESSON`). Same idea, different axis.

**The tag test that separates explainer from research:** ask what the tag is attached to. A chip on
the *domain's own catalogue* ("which Whisper size") teaches; a chip on the *project's options*
("SAM 2 vs RVM") decides. The essay's `RECOMMENDED` on `large-v3-turbo` is the first kind; the
research doc's `RECOMMENDED DEFAULT` on SAM 2 is the second, and only the second needs a scope line
and an escape hatch.

---

## The five in detail

### 1 · EXPLAINER

**Job:** build a working model of **one concrete object**, and map the capability envelope of a
domain the operator does not know — what is possible, what breaks, what it costs — with the failure
modes that aren't in the docs as the payload. Thariq's tours a real Whisper transcript — not
"transcription" in the abstract.

From the transcript: *"I want to explain whisper to me and understand what the edge cases are… me
sort of doing planning, but really it's like me discovering my unknowns."* **It is ordered, not
emergent** — he prompted for it in the plan; it did not fall out of a research pass on its own. And
it is read **upfront**: *"knowing what the limits are upfront really helped me avoid this case where
I build this complicated workflow around Whisper"* — the confidence it builds is spent early, when
the workflow is shaped, not re-checked at the end.

**Licensed by** — which unknown you are holding. The four quadrants are `mental-model.md`'s to own;
what belongs here is that **stage 1 answers exactly two of them**, and the split is why the failure
modes, not the explanations, are the payload:

| The unknown you hold | What this document owes it |
| --- | --- |
| **Known unknown** — *"I don't know how this works"* | the tour — the object printed, its catalogue, its vocabulary. **You can name what you want explained**, so asking is enough. |
| **Unknown unknown** — *"I didn't know that could happen"* | the failure modes — **unrequestable by definition.** They arrive unasked or not at all. |
| Unknown known — *"I'll know it when I see it"* | not this document. Rendered variations, the other stage-1 form. |
| Known known — *"I want it, and never wrote it down"* | **no document at all.** Write the prompt; have the model interview you to extract it. |

Two mechanical consequences:

- **Row 2 has to be ordered as a section — naming it is not enough.** `[measured 2026-07-25]` The
  published explainer prompt (`html-effectiveness-main/unknowns/02`) asks for row 2 *outright*:
  *"Teach me color grading well enough that I understand my unknown unknowns and can prompt you with
  real vocabulary."* The page it produced has **no failure-mode section** — its headings run *Teach
  me my unknowns* → *Color grading in one sitting* → *Prompts you couldn't have written an hour ago*,
  and the only failure content on it is one clause inside a glossary definition (*"Mixed lighting is
  the classic gotcha"*). Thariq's clause asks for a **deliverable** instead — *"understand what the
  edge cases are"* — and gets twelve severity-tagged cards. So the request must name the artifact,
  not the goal: *"unknown unknowns"* as an aspiration returns vocabulary, because vocabulary is what
  a teaching prompt optimizes for.
- **Stage 1 holds more than one document, and rows 3–4 are how it gets written wrong.** An explainer
  commissioned when the real unknown was *what do I want* produces a tour nobody needed; one
  commissioned for a known known produces a page that teaches you what you already knew. Check the
  row before commissioning the page — that check costs one sentence and is the cheapest defence
  against an apparatus that grows faster than the thing being planned.

**The full specimen** (`ingest/thariq-demo/essay-anatomy-of-a-transcript.md`, read 2026-07-24) is
richer than this section originally recorded: a capability catalogue **with status chips**
(`FLAGSHIP`, `RECOMMENDED` — chips that stay inside the domain's own shelf, "which Whisper size,"
never the project's options); twelve severity-tagged failure cards (`HIGH`/`MED`/`LOW`) each
carrying the object's misbehavior **printed verbatim** (*"Thanks for watching. Don't forget to like
and subscribe."* on 8 s of silence); a practice playbook; a glossary; and an exit **thesis**, not a
decision — *"Whisper is a language model that happens to be conditioned on audio."*

- **Contains:** the object printed rather than described; a hard-capped list of qualitative failure
  modes, severity-graded; capability tables chipped within the domain's catalogue; what the page is
  *not*.
- **Must not contain:** a scope line, a structure, or a **ranked exit decision**. *(Correction
  2026-07-24: this line previously read "a recommendation, options" — too narrow. The type specimen
  itself ranks Whisper's catalogue and prescribes eight practice rules. What actually separates it
  from research: it never names a project file, never commits the project to one path, and ends by
  explaining rather than choosing.)* **No scope line is visible on the explainer** — an explainer
  that names files has already decided. An explainer that ends in four choices has taught nothing.
- **The observed leak, kept honest:** the specimen's §05 stack note (*"for a video editor,
  consider: faster-whisper…"*) is project-scoped — research-flavored content germinating inside the
  explainer, and its `RECOMMENDED` chip quietly reappears as the default in the code block. The
  boundary is a gradient in practice: the explainer ends holding a *soft default* that the research
  doc later hardens into the one scoped RECOMMENDATION. Expect the gradient; police the scope line.
- **Dies when** the research doc it licensed is written.

### 2 · RESEARCH, pre-decision

**Job:** rank real alternatives and make the decisions worth making before code.

- **Contains:** a `scope:` line naming files; failure modes; **a ranked table with status tags**;
  **exactly one `RECOMMENDED DEFAULT` with the escape hatch pre-built.**
- **Must not contain:** unranked options. *"Here are five, you choose"* offloads the work onto the
  person least equipped to do it.
- **Exits with:** one approach named.
- **Dies when** the spec is written. Only the decision survives.

### 3 · SPEC

**Job:** commit. Twelve sections, ending *"End of spec."* A build is licensed the moment the spec
exists and is cited — there is no confirmation step to wait for (Tien removed the signing ceremony
2026-08-12).

**This is where a structure is finally allowed to exist.** It is banned in every earlier document;
naming it is this document's job.

- **§3 already built — do not touch.** The agent needs to know what not to touch as much as what to build.
- **§11 build order.** Numbered, independently testable, **step 1 a declared throwaway.**
- **§12 open decisions.** Each states the default, the alternative, and **why the default won**:
  > *Codegen registry (vs hand-maintained)* — writes `compositions.generated.ts` from folder
  > structure. Alternative is editing a list by hand on every new project. Codegen is 30 lines; the
  > hand-maintained version is just a different 30 lines plus a recurring chore.
- **The gate here is weak by nature — the failure mode is silent approval, not rejection.**
  Mitigation: one pre-written reply must flip a decision the spec itself tags CLOSE, so accepting as
  written is visibly a choice.
- **Survives** the build; dies at respec.

### 4 · IMPLEMENTATION NOTES

**Job:** *"What got built, where it deviates from the research doc, and what you need to do once to
light it up."* **Deviation is the payload.**

- **Contains:** every file tagged `NEW` / `EDIT` / `REGENERATED`; measured numbers; **the
  embarrassing specifics, verbatim.**
- **Has no gate.** It reports; it does not ask. This is the one step whose value depends on the
  operator doing nothing for several hours.
- **Survives.** It is the evidence base for re-research.

> *"My first podium run with two torso points produced a clean cutout of two floating shirts;
> adding head points fixed it."*
>
> The floating shirts stayed in the document. That specificity is what makes the doc worth more than
> the code — nobody would guess it, and it changes how you prompt forever.

### 5 · RE-RESEARCH, after measured failure

**Job:** reopen exactly one question, seeded by a number.

Thariq's title is `Cutie & DEVA` — **the names of the two candidate models, not "the identity drift
doc."** Named after the alternatives, not the problem.

- **Trigger, strict.** The failure must be (a) measured, (b) reproducible, and (c) **shaped** —
  repeating across runs rather than scattered. *4 of 5 failures sharing one shape is a trigger. 5
  unrelated misses is a bug list.*
- **Exits with** re-research, respec, **or kill — on the same card.**
- **The danger:** re-research becoming a restart wearing a lab coat. The trigger above is the only
  defence. No shaped failure, no re-research.

---

## Standing rules `[observed]`

1. **The chain is the unit.** No document without the one before it, each naming its predecessor.
2. **Features belong to types.** Do not transplant.
3. **Decide, don't ask** — but only in the spec, where §12 lives. A default before research is
   picking blind.
4. **Failure modes are a section**, and they upgrade from adjectives to measurements after a run.
   *That transition is the whole method.* The first version lets you start; the second earns the
   right to change direction.
5. **Mark what is already built and must not be touched.**
6. **Keep the embarrassing specifics.**
7. **Build order is a section**, and each step must be independently verifiable.
