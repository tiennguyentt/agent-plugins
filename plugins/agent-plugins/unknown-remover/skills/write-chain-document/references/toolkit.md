# The toolkit — eleven forms, mapped onto the five

Source: `html-effectiveness-main/unknowns/`, Anthropic's published sample repo, **bundled in this
folder** so the eleven travel with the method. **Each of the eleven prints its exact prompt near the
bottom of the page** — read the prompt, not the design.

**Only these eleven print a prompt** `[measured 2026-07-23]`. The twenty examples in
`html-effectiveness-main/` one level up print none, so for those there is nothing to read but the
design — which is the opposite of how this folder says to use a reference. Check before you assume a
page will hand you its prompt.

## The weld

**The five and the eleven are different axes that meet at one point.**

- **Thariq's five are defined by their exit to the NEXT DOCUMENT.** *"End of spec. Ready to build on
  confirmation."* *"Recap from `matte-implementation-notes.html`."*
- **Anthropic's eleven are defined by their exit to the READER'S CLIPBOARD.** Each converts one
  species of ignorance into one pasteable message, and the page above it is demoted to justification
  for that message.

**Three of the eleven carry Thariq's type names outright.** `09-implementation-notes` and his *Matte
implementation notes* are not analogous — **they are the same object under the same name**, one
published with its prompt printed.

**The toolkit does not tile the five, and the distribution is the proof.** Anthropic's own index
reads *"Pre-implementation 8 / During implementation 1 / Post-implementation 2."* Eight of eleven
crowd into one link of the chain.

## The map

| Link | Reach for | Actively wrong here |
| --- | --- | --- |
| **Explainer** | `02-color-grading-explainer`, `01-blindspot-pass` | `08` commits before a model exists · `03`/`04` are choice devices, and an explainer ending in options has taught nothing |
| **Research** | `03-design-directions`, `04-toolbar-mock`, `07-reference-port` | `08-implementation-plan` — *the single worst placement*: a tweakable plan at research stage looks like a comparison but has already picked |
| **Spec** | `08-implementation-plan`, `07-reference-port` | `01-blindspot-pass` — *seven things you didn't know*, handed to someone mid-spec, is a restart generator · `03`, `04` |
| **Impl-notes** | `09-implementation-notes` — **only** | every other form: they all need attention during the one step whose value depends on its absence |
| **Re-research** | `01-blindspot-pass`, `03-design-directions` | `09` — a log with no run is a template · `08` — measured failure licenses a *research doc*, not a direct respec |

## The mechanics worth stealing

| Form | Its load-bearing move |
| --- | --- |
| `02-explainer` | every term paired to a sub-100-char **"say this"** line — treats knowledge as a means to a prompt, not as knowledge · **but take its vocabulary machinery, not its coverage:** its prompt asks for "unknown unknowns" and the page still ships no failure-mode section `[measured 2026-07-25]`. Add the edge-case clause yourself — see `chain.md` → EXPLAINER, *Licensed by*. |
| `03-design-directions` | **steal/skip chips composing one shared reply** — turns N options into a parts bin rather than a beauty contest |
| `04-toolbar-mock` | **one corpus rendered as N variants**, same markup repositioned — the move a ranking table implies but never performs |
| `08-implementation-plan` | every flagged decision **rendered twice** — pick and discarded alternative both fully written, toggle swapping the diagram in lockstep |
| `09-implementation-notes` | *"If you hit an edge case that forces you to deviate, pick the conservative option, log it under Deviations, and keep going"* |
| `01-blindspot-pass` | **one finding is permitted to be "do not run the rest of this pipeline"** — and if it lands, stopping is the success case |

## The one that fits nowhere

`10-pitch-doc` takes three of the five as **input**: *"Package the prototype, the spec, and the
implementation notes into a single doc I can drop in Slack to get buy-in."* It is a compiler over
the chain, not a link in it.

It is also **the only artifact in either system that requires an external reader.** If a project has
no second reader, nothing else in either system will ever tell it that it has died.

## The rule the eleven add that the five do not

> **The artifact's product is not the artifact. It is the reader's next message.**

Three consequences:

1. **It makes a document falsifiable** — did a message come out of it, or not? That check requires
   zero domain knowledge.
2. **It makes skimming defensible.** The final block must stand alone, so a skimming reader becomes
   a design assumption rather than a problem.
3. **It makes the document disposable.** A page whose entire value is on the clipboard can be
   deleted the moment it is copied, and should be. This is the only structural defence against a
   workspace where every document survives, accumulates, and becomes governance.

**Corollary — reject must be cheaper than accept.** Exposing a flip grants *permission* to disagree.
Pre-writing the flip as a copyable sentence supplies a *mechanism* for disagreeing. Not `no` —
`no, do X instead`.
