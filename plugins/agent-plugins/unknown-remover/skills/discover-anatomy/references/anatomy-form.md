# The anatomy form

**A domain map.** An anatomy names the parts a system is made of and shows how they fit together,
so a reader who has never opened the system can say what is inside it and which piece does what.

This form is not in Thariq's five-document chain and not among Anthropic's eleven published
artifacts. It was distilled from three documents that already existed and one skill that no longer
does; §6 names every source.

---

## 1 · What separates it from an explainer

The two are neighbours and the boundary is one question: **is the unknown depth or breadth?**

| | Explainer | Anatomy |
|---|---|---|
| The unknown it retires | *"I don't understand how this works"* | *"I don't understand what this is made of"* |
| Its subject | one object | several parts and their relationships |
| What it leaves the reader | vocabulary to prompt with | a map to locate things on |
| Its payload | edge cases and failure modes that are not in the README | the parts list, and where the seams are |
| How it ends | the reader can talk about the object | the reader can point at the piece they mean |

**The corpus wrote this distinction down before the form had a name.** One anatomy document carries
a sibling link to its own explainer, labelled: *"a separate type: vocabulary, not domain map."*
Vocabulary against domain map is the whole difference, in the corpus's own words.

**Both may be needed for one subject, and neither replaces the other.** The pair that exists on
disk was written on the same day about the same system: the anatomy taught what a personal OS
consists of, the explainer converted that into terms to prompt with, and the explainer opens by
saying so.

## 2 · The overlap that will trip you

One of the three anatomies opens: *"A working tour of what Claude Code is actually made of … and
the format failure modes that don't appear in the README."*

That sentence is the chain's **explainer** definition, word for word — *"A working tour of X… and
the failure modes that don't appear in the README."* The document reused the neighbouring type's
defining line for itself.

**So a lede is not evidence of type.** Read what the document does. That one goes on to catalogue
nine parts — plugin, agent, skill, command, workflow, hook, `settings.json`, `CLAUDE.md`,
marketplace — and to say which is wrong where. It is a map, whatever its first sentence borrowed.

**When writing one, do not borrow that sentence.** A map that opens like an explainer will be filed
as one.

## 3 · What an anatomy contains

- **The parts, enumerated.** Not a survey — a list a reader can count. Three or more; a
  two-part system is one object with a detail.
- **How the parts fit.** The relationships are the payload. A list of parts with no seams between
  them is a glossary.
- **What is *not* a part**, where the boundary is easy to get wrong. This is the section that stops
  the map growing to fit whatever the reader already believed.
- **Where the seams fail.** Qualitative, not measured. Measured failures belong to implementation
  notes and re-research.
- **No decision.** An anatomy licenses the research document; it does not make the research
  document's pick. One of the three says this outright: *"This teaches the shapes; it does not
  decide tien-os's layout (that's the spec's job)."*

## 4 · Where it sits

**Research stage.** The repository this form comes from names eight research forms — explainer,
anatomy, blindspot pass, brainstorm, design directions, diagram, semantics map, ranked research —
and treats research as many forms rather than one document. The address for that rule is in §6; it
is not read at run time. An anatomy licenses the research document exactly as an explainer
does, and it is kept on disk exactly as every planning document is.

**It never absorbs its sibling and is never absorbed.** Where both exist for one subject, each
cites the other by filename.

## 5 · How it fails

- **The glossary.** Parts listed, no relationships. The reader learns names and still cannot say
  how anything connects.
- **The borrowed lede.** Opens with the explainer's defining sentence and gets filed as an
  explainer. §2 is the specimen.
- **The decision that leaked in.** A map that ends by recommending a layout has become a research
  document with no ranking, which is the worst of both.
- **The unbounded map.** No *"what is not a part"* section, so the map grows until it describes
  everything and locates nothing.
- **One object dressed as a system.** The commonest miss. If the parts turn out to be one thing's
  features, the request wanted an explainer.

## 6 · Provenance

Distilled 2026-07-31 from five sources, none of them portable method:

- `artifacts/workspace/pre-implementation/2026-07-24-anatomy-block-formats.html` — nine parts of
  Claude Code, and §2's borrowed lede.
- `artifacts/workspace/pre-implementation/2026-07-24-anatomy-personal-os.html` — the five parts of
  a personal OS, and the *"vocabulary, not domain map"* sibling label.
- `artifacts/workspace/pre-implementation/2026-07-29-anatomy-how-tien-os-moves-work.html` — five
  parts of one workflow and the failure modes between them.
- `control-plane/GUARDRAILS.md` §6 — the eight research forms named in §4.
- `control-plane/DECISION-LOG.md`, 2026-07-26 — the account of a `thariq-os-anatomy` skill that
  produced the three documents above and was restructured into the seven-section format at 199
  lines. **That file and its checksummed backup are both gone.** This distillation is informed by
  the record of its shape, not copied from it.

**Every path in this section is provenance, not runtime.** Nothing in this file is read from them at run
time, and a copy of this package outside `tien-os` resolves none of them and needs none of them.
