# unknown-remover plugin

One independent agent plugin in the `agent-plugins` marketplace. It plans by removing unknowns: it names
which unknown you are holding, picks the artifact form that retires it, and writes one planning
document at a time.

```text
Distribution mode: dual
Standalone entry: `write-chain-document` writes a planning document anywhere, styling it from the bundled `glass.css` and the 31 bundled worked examples
Portable core: `skills/`
Portable entry skill: `write-chain-document`
Bundled equivalents: none
Codex project agent: none
```

This block read `Distribution mode: standalone` / `Runtime dependencies: none` until 2026-08-07.
The **corpus** does ship inside the package, which is what that line was reaching for — but
decision behind a choice and to the repo's own artifact folder for where the document lands. A plugin that names
repo-owned paths at runtime is repo-bound; the standalone claim was one the package could not
keep outside a plugin checkout.

Two corrections on 2026-08-12. `glass.css` moved from **Bundled equivalents** to plugin-owned:
its source was deleted that day, and a "bundled equivalent" with no source is not a copy
of anything — it is simply this plugin's file now, which is why it also left check 15's drift
table. And the extras list still named `control-plane/`, the repo's own artifact folder, `evaluation-plane/`,
three directories renamed out of existence on 2026-08-07; a declaration that names nothing on
disk cannot be checked, so it now names the epoch-2 rooms that actually exist.

```text
unknown-remover/
├── plugin.json                  portable manifest — Agent Plugins 1.0.0
├── .claude-plugin/plugin.json   Claude Code adapter
├── .codex-plugin/plugin.json    Codex and ChatGPT adapter
├── README.md                    this file
├── NOTICE.md                    third-party attribution — read before redistributing
├── agents/
│   └── unknown-remover.md       exactly one Claude agent definition
└── skills/
    ├── write-chain-document/    portable entry — the five document types
    │   ├── SKILL.md
    │   ├── rubric.md            is the document the type its position calls for
    │   └── references/          the whole bundled corpus, shared by the other skills
    ├── classify-unknown/        the four quadrants, and when no document is needed
    │   └── SKILL.md
    ├── choose-artifact-form/    thirty-one published forms, and which are wrong where
    │   └── SKILL.md
    └── discover-anatomy/        maps a whole system's parts, not one object
        ├── SKILL.md
        ├── rubric.md            is this a map, or an explainer wearing its name
        └── references/          anatomy-form.md — suite-authored, not vendored
```

**The corpus sits in one folder, under the entry skill.** Its files cite each other by bare
filename, so splitting them across three sibling `references/` folders breaks those citations and
breaks them silently. `references/` holds the four method files, the two `ingest/` sources they
cite, and the whole of `html-effectiveness-main/` — 31 examples, both index pages, and the Apache
2.0 `LICENSE`.

## One part of a bigger system, shared on purpose

This is one of several agent plugins in this repository, where agent teams do
the work end to end. It is published on its own because a part that only runs inside the repo
that grew it is not a part — it is a dependency.

**Built for a team, not for a demo.** Four skills, one job each, each independently invocable
without the agent. Two carry a `rubric.md` read by an agent that did *not* write the document.
The packaging is checked by machine: `plugin.json` conforms to Agent Plugins 1.0.0, and a
contract check fails the build when the manifests, the entry skill, or the routes drift apart.

**Dual, and the gap that made it repo-bound is closed.** The method and the whole 31-example
corpus always shipped inside the package. The one thing that did not was the theme:
`write-chain-document` sent the writer to a retired document, which lived only
in this repository. That file is now bundled at `skills/write-chain-document/references/glass.css`
gets the same theme as one written inside it. Repo-side records like
are provenance, not inputs.

The history is worth keeping: this block said "standalone", was corrected to "repo-bound" on
2026-08-07 because the claim outran the package, and is now dual because the package caught up.

## Package format

This package follows **Agent Plugins 1.0.0**, an open, vendor-neutral standard from the Agent
Plugins project — specification <https://agent-plugins.org/specification>, repository
<https://github.com/agentplugins/agent-plugins-spec>. Specification text is licensed CC-BY-4.0,
its schemas Apache-2.0. It was adopted on 2026-08-07 after Google's announcement of the
format, <https://developers.googleblog.com/agent-plugins-package-your-skills-tools-and-more/>.

The package *conforms to* that standard and vendors none of its files: `plugin.json` is written
here, and `$schema` is a URL pointing at theirs. Nothing in this plugin is authored by the Agent
Plugins project — the bundled corpus has its own authors, and `NOTICE.md` is where they are named.

## Jobs

Invoke as `/unknown-remover:<skill>` in Claude, `$unknown-remover:<skill>` in Codex.

| Skill | Job | Entry? |
|---|---|---|
| `write-chain-document` | Write the one document the chain position calls for, and exit with pasteable text | yes |
| `classify-unknown` | Name the quadrant and the instrument, including the answer that no document is needed | no |
| `choose-artifact-form` | Pick the form, name the exemplar, say which of the eleven prompt-printing forms are actively wrong at that link | no |
| `discover-anatomy` | Map a system's parts and how they fit, for breadth rather than depth | no |

One logical role, one packaged Claude agent adapter, three licensed shared jobs. There is no Codex
project TOML for this role and plugin use does not depend on one.

## Optional files, and why each decision went the way it did

**No workflow script, on any of the three.** Each job is one contextual pass over a short reference:
no fan-out, no pipeline barrier, no per-stage model selection, no staging invariant that prose
cannot hold.

**Two rubrics.** `skills/write-chain-document/rubric.md` grades whether a document
carries the features its own type owns and none belonging to another type — the feature-ownership
table from the bundled `chain.md`, turned into criteria a verifier who did not write the document can
apply. `skills/discover-anatomy/rubric.md` grades against its own bundled anatomy-form reference instead, because
anatomy is not one of the five chain positions and `chain.md`'s feature table does not cover it.

The other two skills have none: `classify-unknown` returns one of four named quadrants and
`choose-artifact-form` returns a table match, so in both cases a lookup decides correctness and a
grading standard has nothing to add.

**The rubric does not replace the paste test.** The rubric runs before delivery and asks whether the
document is the right type. The paste test runs after and asks whether a message came out. They
answer different questions.

No evaluation evidence ships inside the plugin: golden cases and run records are development
evidence and stay in the repository that owns the plugin.

## Runtime boundary

`write-chain-document` owns the cross-host procedure. The Claude agent adds dispatch and context and
owns no procedure — it preloads only `classify-unknown`, because preloading injects a skill's full
body at startup on every run.

**Standalone means it needs no file from the repository it was copied out of.** The folder these
files were mirrored from was deleted on 2026-07-31 once the mirror was committed, so there is no
upstream to drift from and no `diff -rq` to run. The copy here is the copy of record — see
`NOTICE.md` for what that costs.

The package contains no MCP server, command, monitor, or hook.

## Host compatibility, and what has not been observed

Claude Code reads `.claude-plugin/plugin.json`, the shared `skills/`, and the packaged definition
under `agents/`. Codex reads `.codex-plugin/plugin.json` and the same shared `skills/`. A bare Codex
install is meant to run through `write-chain-document` without any project overlay.

**What was observed.** At 1.1.0 on 2026-07-31, the package was installed at user scope on both hosts.
On Claude Code, all three then-existing skills were invoked headless from a directory outside the
repository — each resolved the bundled corpus and cited it by line. On Codex, `codex plugin add`
cached the package with the corpus intact and a probe read `mental-model.md` back before the run hit
a usage limit. On 2026-08-05, 1.1.1 fixed host-specific reference reading in all four skills; both
host CLIs report 1.1.1 enabled and both installed `skills/` trees compare byte-for-byte with source.

**What was not observed.** A completed fresh-thread Codex 1.1.1 invocation. `claude plugin eval`, which the CLI reports
is in early access. `rubric.md` handed to a separate verifier — every probe correctly refused, so no
document existed to grade. Treat the Codex half of the compatibility claim above as design intention
until a completed probe says otherwise.

## Attribution

The method is Thariq's and the exemplars are Anthropic's. **The four method files carry no licence
at all.** Read `NOTICE.md` before redistributing this package, publishing it, or pushing
it to a public remote.
