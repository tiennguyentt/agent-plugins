# Third-party material in this plugin

**Most of `references/` is not the user's work — and one file in it is.** Two outside authors, two
licensing positions. The manifests name the user Nguyen as author of `unknown-remover`; that claim covers the four `SKILL.md`
files, both `rubric.md` files, repo-authored `skills/discover-anatomy/references/anatomy-form.md`,
the agent adapter, `README.md`, both manifests, this notice, **and
`skills/write-chain-document/references/lessons.md`** — its own header records that §§1–9 came from the user's machine running
links 1–3 of one chain end to end on 2026-07-23, n = 1. An earlier version of this notice
over-attributed that file to the corpus. The authorship claim does not extend to the rest of the
bundled corpus.

Everything below sits under `skills/write-chain-document/references/`. Bare filenames in the
tables are relative to that folder; a few rows spell the path out in full where it is less obvious. The corpus lives in one
folder because its files cite each other by bare filename, and splitting them breaks those citations
silently.

## 1 · The method — Thariq, via `thariq-os`

The five-document chain, the four quadrants, the unknown-removal framing, and the forms map are
**not the user's invention.** They were reconstructed from primary sources by **Thariq (Claude Code
team)**: two recorded conversations, his published post on context engineering, and 34 screenshots
of his own documents. The reconstruction lived in a folder of method notes on this machine. **That
folder was deleted on 2026-07-31 once this mirror was committed to git**, so the copy here is now
the only one.

**The whole folder travelled**, byte-identical and verified with `diff -rq` before the source was
removed. It was a complete mirror when taken; later the same day the pure-provenance files moved
out of the distributable (§3 records the addresses that broke). What sits where now:

| File | What it is | Where it is now |
|---|---|---|
| `mental-model.md` | the thinking layer — unknown removal, the four quadrants, where unknowns live | `references/`, in this package |
| `chain.md` | the five document types and the feature-ownership table | `references/`, in this package |
| `toolkit.md` | the eleven prompt-printing forms, mapped onto the five | `references/`, in this package |
| `lessons.md` | what broke when the chain was run for real — the user's own file, see above | `references/`, in this package |
| `html-effectiveness-main/` | the Apache-2.0 corpus — see §2 | `references/`, in this package |
| `method.html` | the rendered reference | same, outside the package |
| `source-transcript.md`, `source-transcript-fireside-qa.md` | the two recorded conversations the method was reconstructed from | same, outside the package |
| `ingest/` | the blog extract and the five `thariq-demo/` files | same, outside the package |

**Why the whole folder travelled first, and why part of it then left.** A selection was tried
before the mirror and it broke the corpus's own citations: `mental-model.md` cites both
transcripts, `chain.md` cites the demo essay, and every one of those addresses died at the folder
boundary. So the whole folder came over. On 2026-07-31 the trade was re-made the other way for
distribution: 240K of provenance nothing at runtime reads moved to
rather than edited away, and what installs is only what the skills read.

**The licence position, decided by the user on 2026-07-31** (recorded in
before, and the CLOSE on spec §12·D4 that rule came from). Thariq publishes the method openly at
<https://thariqs.github.io/html-effectiveness/unknowns/>, and that site's repository,
`github.com/thariqs/html-effectiveness`, is **Apache License 2.0** — the same corpus bundled in §2
with its `LICENSE` file travelling. The three method files above are not copies from that
repository: they are reconstructions written on this machine from his public talks, his published
post, and screenshots, carrying short attributed quotes, and `lessons.md` is the user's own. On that
basis attribution is the licence: **Thariq is credited here, this notice travels with every copy of
the package, and it may not be removed from it.** The residual risk stays named rather than
cleared: the reconstruction drew on 34 screenshots of his own documents, which sits closer to
copying than to note-taking — low, not nil. The material credit does not cure — the two
conversation transcripts and the ingested copies of his post and demo files — does not travel with

**One contaminated block was removed upstream before this copy was taken.** `mental-model.md`
carried a ``-tagged sentence naming **the user or Mew** as who confirms a stage, against the
folder's own first line — *"Copy this folder into any project. Nothing in it is about you or about
personal-os"* — and against its Provenance rule. "Mew" was additionally the pre-2026-07-26 name for
Claude. It was deleted from the source `mental-model.md` on 2026-07-31 and the file re-copied here before
the folder itself was removed. Nothing was lost: the `[CORE]` paragraph above it already states the non-doer rule
in full.

**They no longer drift, because there is nothing to drift from.** The source folder was deleted on
2026-07-31 once this mirror was committed to git, so these files are the copy of record. That
removes the one-way sync and the `diff -rq` check that went with it, and it removes the failure mode
they existed to catch: a bundled copy quietly falling behind an upstream nobody re-diffed.

**What it costs.** A correction to any of these files is now a correction to a third party's
document with no upstream to make it in. Make it here, say so in this notice, and stop promising
byte-identity for the file you changed.

## 2 · The artifact corpus — Anthropic, Apache 2.0

The whole of `html-effectiveness-main/` travelled, unmodified: twenty numbered `.html` examples at
the top level, eleven more under `unknowns/`, both index pages, and the repository's own
`README.md`, `CODE_OF_CONDUCT.md` and `SECURITY.md`.

The licence travels with the copy at `html-effectiveness-main/LICENSE` — **Apache License 2.0,
Copyright 2026 Anthropic PBC**. It sits at the repository root, which is where upstream keeps it; an
earlier draft of this package moved it inside `unknowns/`, which misdescribed its scope.

Nothing here was edited. The folder is a byte-identical copy verified with `diff -rq` — no exceptions; upstream's copy of
this folder carried no `.DS_Store` to strip.

**Only the eleven under `unknowns/` print their exact prompt.** The twenty at the top level print
none, so they carry structure and nothing else. Both sets are bundled: the eleven for their prompts,
the twenty because several of them are the named exemplar for a chain document type.

## 3 · Addresses that do not resolve inside this package

The citations between the four method files and `toolkit.md`'s reference to
`html-effectiveness-main/unknowns/` all resolve as written.

**Four do not.** Two stopped resolving on 2026-07-31, when the provenance was moved out of this
neither citing file may be edited to say so. That is the measured price of taking 240K out of the
distributable.

| Cited by | Address | Where it went |
|---|---|---|
| `mental-model.md` | `ingest/blog-context-engineering.md` | `…/provenance/ingest/` in the repository that owns this plugin |
| `chain.md` | `ingest/thariq-demo/essay-anatomy-of-a-transcript.md` | same |
| `mental-model.md` | `source-transcript.md`, `source-transcript-fireside-qa.md` | `…/provenance/` |

**Two more never could resolve, here or anywhere:**

| Cited by | Address | Why it is missing |
|---|---|---|
| `chain.md`, `toolkit.md` | `matte-implementation-notes.html` | Thariq's own artifact. It has never existed in this corpus |
| `chain.md` | `text-behind-research.html` | Thariq's own artifact. Same |

The source quotes both by filename as examples of how the chain's documents cite each other, not as
retrievable files. They are absent upstream too.

**And the demo provenance cites its author's own project**, which never existed here. Two files
under `skills/write-chain-document/references/ingest/thariq-demo/` — the AI-video-editor chain
documents and the doc-structures report — reference that project's own source files: four Python
scripts under its scripts directory, and a transcript JSON under its transcript directory. Those
documents are worked examples of Thariq's video editor, and the addresses are his repository's
`references/ingest/` and this paragraph is where they are reported instead.

The method files and the
exemplars beside them are **not** skipped — they are swept like anything else and they all resolve.

**Nothing here is edited.** Fixing an address means altering a third party's document, and the
byte-identical promise above exists precisely so a second source of truth never starts.
