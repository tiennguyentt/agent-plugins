# Mental model — problem solving as unknown-removal

`[observed]` — **the refined layer; this file is what the repo distills *to*.** Everything else is
raw fuel or scaffolding. Raw sources are an **open, growing pool** — mined here, cited for
traceability, never restated. Each source earns its own citation tag so any claim stays checkable:

- `source-transcript.md` — the founder / Claude Code walkthrough — **bare timestamps** (`00:11:55`)
- `source-transcript-fireside-qa.md` — the fireside Q&A — **`[QA]`**
- `ingest/blog-context-engineering.md` — his published post on context engineering for Claude 5,
  2026-07-24 — **`[CE]`**
- `ingest/` — demo evidence, cited by filename

**No source is canonical and none is privileged by being newest.** Each arrival is one more tagged
text; more will follow. The blog is the first *written* source here — the two transcripts are him
talking, so where it agrees with them it does not add a claim, it raises the evidence grade. Where it
disagrees, both stay, tagged and dated, because a reversal is data about how fast this ages.

`chain.md`, `toolkit.md`, `lessons.md` and this file **complement each other** — the mechanics of
the five documents, the artifact forms, the observed failures, and the thinking beneath them. Not
four territories so much as four cuts of one thing: *the process of thinking to solve a problem.*
One owner per claim keeps them from repeating each other; this file holds the thinking layer and
cites the rest, it does not restate.

## How to read this file — two shelf-lives

Every section carries one of two tags, because the sources themselves split cleanly in two and the
split is the most useful thing in here:

- **`[CORE]`** — about the human, the problem, and the chain. **Nothing has moved it yet.** Three
  sources spanning the arrival of a model generation, and every claim in these sections survived.
- **`[DATED · <date>]`** — about steering the model: how much to write, what to forbid, what to show
  it. **This is the shelf that turns over**, and the date is the newest evidence behind it, not an
  expiry. Dated does not mean wrong; it means re-check when the model changes.

**The evidence for the split is the split itself.** Exactly one section is `[DATED]` — *How he
instructs agents* — and it is the one the blog rewrote: 80% of a system prompt deleted, examples
reversed from best practice to anti-pattern, repetition explained away as a property of an older
reader `[CE]`. Over the same period nothing in the `[CORE]` sections was contradicted. So the tag is
a prediction with a track record: **the half of your knowledge that is about your own thinking is
the durable half.** That is also why the file grows rather than gets replaced — a new source adds
evidence to `[CORE]` and turns over `[DATED]`.

**Nothing is deleted when a source disagrees.** Both readings stay, tagged and dated, and the open
ones are collected in *What is dated, and what conflicts* at the end. The rule for closing one is
**decide by fine-tune date**: ask which model generation each reading was true of, and whether the
one you are running now is on the near or far side of it. Two conflicts have already been closed
this way and are kept in place as worked examples — plan mode under *The reframe*, and evals under
*Verification is designed at planning time*. Neither deleted a claim; each dated one.

## The reframe everything else follows from `[CORE]`

"Planning" is his word for something narrower: **removing unknowns until execution is safe.**

> "Me sort of doing planning, but really it's like me discovering my unknowns." — 00:11:25
>
> "I like to say: getting rid of your unknowns. Whenever you have a task, almost always there's a
> lot that you don't know — either you don't know how things work, or what you want. And it's
> very, very iterative." — 00:11:55
>
> "I feel like the word 'plan' is maybe too broad." — 00:11:55

A task is a pile of unknowns. The work is choosing which unknown to retire next and the cheapest
instrument that retires it. The plan document is a side effect: "planning is more of this
iterative process of exploring, investigating, finding out what you don't know, what you want"
(00:08:31) — "it's not just like you write it all down once and then you implement it" (00:11:55).

The fireside shows what this reframe survives. The model-side half of planning is dying as models
improve — plan mode "was kind of an Opus-poor feature… now a lot of us on the team have stopped
using plan mode because the model just thinks correctly" — yet the problem remains: "if the model's
that smart, why is it not perfect? …there's a lot of ambiguity" `[QA 00:08:58–00:09:58]`.
Plan-for-the-model was scaffolding, and it got deleted. What planning is *for* after that is exactly
the narrower thing above: removing the human's unknowns.

## Why the human's model is the artifact `[CORE]`

Two transcripts, one bet: the leverage is in the operator's head, not the tool. "It's more
important to educate humans than improve the agent UX sometimes… how do you build a mental model of
how to prompt Claude is… maybe more valuable… than doing more product work" `[QA 00:04:18]`. The
reason is *capability overhang* — the model is already smarter than the harness or the user lets it
express `[QA 00:07:35]`. **The blog sharpens where that suppression sits: not only in what the harness
fails to expose, but in what it actively holds down** — his word for it is "overconstraining" `[CE]`,
and the files it named are quoted under *How he instructs agents*, where the fix lives. Two of the
three are written by the operator, so a share of the overhang is self-inflicted and locally fixable.
The gap is real enough that when a questioner cites research putting the
power-user gap at 7× *(the questioner's figure, not his)*, his answer disputes nothing and splits
the fix in two: improve the agent UX *and* teach the humans — "there's a lot of work to do in both
ways" `[QA 00:39:01]`. And the human side is worth a model generation: "if you're good enough at
prompting maybe the previous generation of models can do it, but the next generation just does it
automatically" `[QA 00:05:48]`. The mental model is the lever that closes the gap; this file is that
lever written down.

## The unknowns taxonomy — classify first, then pick the instrument `[CORE]`

The first transcript splits unknowns into two kinds and gives each its own tool:

| Species | Instrument | Evidence |
|---|---|---|
| **How the world works** | explainer centered on edge cases | "I want to explain whisper to me and understand what the edge cases are" — 00:10:25 |
| **What I want** | rendered variations to react to | "create a HTML artifact for exploring different designs… I'm not a designer, so I really just only know it when I see it" — 00:09:08, 00:15:50 |

The fireside transcript shows this is a truncation. His full frame is **four quadrants**, and the
first move on any task is to *classify* each unknown — because the class dictates the instrument:

> "you have like known knowns… but maybe is it in the prompt or not, did you write it down? Then
> you have unknown knowns… you think you want it, but you don't know it until you see it. And then
> you have unknown unknowns where you just don't know that this is possible… And then you have known
> unknowns where you're like, I don't know how this works, but I would like to figure it out."
> `[QA 00:18:12]`

| Quadrant | Retired by |
|---|---|
| **Known known** — you want it, but did you write it down? | prompt hygiene — get it out of your head into the prompt (the "interview me" move, below) |
| **Unknown known** — you'll know it when you see it | rendered variations to react to `00:09:08` |
| **Known unknown** — you know you don't know how it works | the explainer — learn the domain `00:10:25` |
| **Unknown unknown** — you don't know it's possible | the explainer's edge-case payload — it surfaces what you didn't know to ask `00:11:25` |

"for every problem, analyzing it along those dimensions… helps me pull out okay, this is how I
should prompt the model" `[QA 00:19:09]`. The two species above are the two **middle** rows — the
front-of-chain instruments. The outer rows are the failure and the payload: a known-known is a
prompt you failed to write; an unknown-unknown is why the explainer's *edge cases* matter more than
its explanations. Misclassify and you reach for the wrong tool — building an explainer when you only
failed to write down what you already knew.

Both middle-row instruments get grounded in a real object, never a description: "one of the
important things I'm doing is I'm giving it a reference — when I give it your website, it can now
fetch the HTML" (00:09:57).

These are forms of the **same chain link**: stage 1 (explainer) is **multi-form**, not one document
shape — in his own words, discovering unknowns "can take a lot of different shapes. It can be
learning, it can be technical specs… it can be mock-ups and exploration" (00:11:25). The stage is
defined by the unknown it retires, not by a single artifact — so more than one document can live at
stage 1, and which forms appear depends on which quadrant the task's unknowns fall in.

**And he runs them concurrently, not in sequence.** He fires the design exploration, then turns to
the explainer while it works: "this is sort of like a plan that will run **while I sort of go over
the other kind of things I do when I'm planning**" (00:09:57) — the next sentence begins the Whisper
explainer. The two middle-row instruments answer *different* unknowns, so neither waits on the
other; what serialises stage 1 is the operator's attention, not the work. One consequence worth
naming: the cheap what-do-I-want artifact is the one to launch first, because it is the one that
runs unattended while you read.

## Where unknowns live: model, harness, user, world `[CORE]`

The quadrants say what *kind* of unknown you hold; his widest frame says *where it sits*. "The
model is very complicated. It's not just model and harness. It's model, harness, user and the world
as well… what is possible? What codebase are you operating in? What does the user know? And how
does the user model both the world and the harness?" `[QA 00:40:25]` — which he calls "one of the
biggest problems in AI right now." The user is a live variable, not a constant: the same clarifying
question that helps him is wasted on Boris, who "knows the codebase in and out" `[QA 00:40:05]`. An
unknown is fully placed only when both are named — its kind, and which of the four places it lives.

## Failure modes are the payload, learned before building `[CORE]`

What he asks the explainer for is not how Whisper works — it is how Whisper breaks:

> "Silence can become 'thanks for watching'… a word can be split into two chunks… it doesn't
> have speaker recognition." — 00:10:56

> "Having these edge cases and knowing what the limits are upfront really helped me avoid this
> case where I build this complicated workflow around Whisper and then I realize there are
> things going wrong and I sort of didn't have these unknown unknowns." — 00:11:25

Limits first, build second. `chain.md` standing rule 4 is this mechanized: failure modes enter as
adjectives and upgrade to measurements after a run — "that transition is the whole method."

## The explainer is ordered, not emergent — and spent upfront, not saved for last `[CORE]`

Two points the 2026-07-24 ingest settled (`ingest/thariq-demo/`, audited against the transcript):

- **He orders it.** "This is something I prompted it in the plan was like I want to explain whisper
  to me and understand what the edge cases are" (00:10:25). The agent produces it — "cloud code
  sort of put this explainer together which is honestly like kind of amazing" — but as a direct
  request written into the plan, not a byproduct that falls out of running research. The
  load-bearing phrase in that order is *"and understand what the edge cases are"*: Anthropic's own
  explainer prompt (`toolkit.md` → `02`) asks only for teaching, vocabulary, and unknown unknowns,
  and its output has no failure-mode section. The edge-case clause is what turns a primer into an
  explainer.
- **Its job is a capability map of a domain he doesn't know, consumed early.** "What is possible,
  how is it doing it right now, how good could it be" (00:38:12); "knowing what the limits are
  upfront" (00:11:25). Nothing in the transcript has him re-reading it as a final gate before
  acting — *upfront* is the observed timing. The confidence it builds ("helped me build a
  confidence in using whisper" — 00:10:56) is spent when the workflow is shaped.

What the full specimen actually contains — richer than "failure modes" alone, including capability
chips and a practice playbook — is `chain.md`'s to own; its EXPLAINER section was corrected the
same day.

## Advance by the cheapest artifact that retires the next unknown `[CORE]`

> "What's the smallest step you can take to prove out the concept… you prove out the spec more."
> — 00:18:04
>
> "These are like prototypes of the design. If we like it, then we can do the more expensive
> version — instead of HTML, we can do it in React." — 00:17:41

Cheap-first is sequencing, not thrift: the HTML variant exists to retire a what-do-I-want unknown
before paying React prices. The fireside transcript generalizes the move past UI — "what's the
cheapest way to figure out is this the thing I want" applies to backend endpoints and tests too
`[QA 00:20:17]`; what you're dodging is the wiring, since an HTML button "is just a button," but the
same button in the app is "a new route, a new… reducer, all of this… stuff" `[QA 00:20:44]`. And a
research pass may end in nothing: "I ended up finding that
there wasn't something reliable enough here for me to use" (00:14:03) — the kill exit gets used
in practice, not just printed on gates.

## A stage is a draft until a non-doer confirms it `[CORE]`

Advancement between links is gated, not automatic — a stage's output stays a draft until someone
who did not produce it signs off. Two observed anchors: the human judgment call that clears
exploration for execution ("the user indicating: I've done enough spec and exploration… just go
execute" — 00:01:50), backed by the read itself ("make sure it's something that you really do read…
people still glaze over the plans and explainers" — 00:12:48); and the standing rule that the doer
never grades itself ("a separate Claude coordinating the work… and then verifying" — 00:29:52). The
confirmer is always a **non-doer** — a human read, or an independent verifier — never the agent that
wrote the stage.

## Execute when unknowns are low — and expect the build to mint new ones `[CORE]`

Execution starts on a judgment call, not a document count. His framing of /goal: "the user
indicating: I've done enough spec and exploration, I understand the problem space — just go
execute on it, and if you run into something, fill it in" (00:01:50).

The fireside supplies the matching red light: he prefers "somewhat shorter tasks unless there's
something clearly ambitious… that I can spec out all up front," and reads people hitting usage
limits as "turning things into long-running tasks when maybe they don't need to be… or not
interrogating — hey, do I know everything about this problem?" `[QA 00:24:59–00:25:30]`. Autonomy
is earned by unknown-removal: run length should track how thoroughly the unknowns are retired, not
appetite.

Building is itself an unknown-generator, so the loop closes instead of handing off:

> "I don't think of spec'ing just happening at the start… the agent does some technical
> exploration, comes back, maybe you do some mockups, some explainers trying to understand your
> unknowns. You refine that, give it to the agent again, it might start implementing. I ask it to
> keep implementation notes as it goes so that it finds out what are things that we weren't
> expecting — and once we have that we can actually respec if we need to. Much less one handoff
> of spec to implementation, more this back-and-forth process." — 00:16:39–00:17:41

## Verification is designed at planning time, never hoped for `[CORE]`

Two moves, both about signal strength:

1. **Pick the strongest checkable signal available.** "If it has a spec that it can verify — if
   it's a Figma file, you use the Figma MCP and make sure the rendered design matches. That's a
   lot easier than a screenshot. If it's more squishy… a rubric that you're evaluating against,
   and a verification agent." — 00:03:44. The ladder: deterministic check > rubric with a
   verifier > eyeballing.
2. **Never let the doer grade itself.** "We call it self-referential bias — when a model prefers
   its own outputs it's going to be more lenient at verifying it… a separate Claude coordinating
   the work, each one doing the work, and then verifying." — 00:29:52–00:30:21

The general shape he gives workflows: "taking a non-deterministic task and breaking it down
roughly into a deterministic task" (00:02:17).

This coexists with the fireside's warning that "evals are not a zero-to-one thing… a lot of
startups maybe should not be making evals and just… be iterating fast and building intuition"
`[QA 00:13:58]`. The boundary: what is designed upfront is the **per-task** check — the signal, the
rubric, the verifier. Institutional eval suites are a late instrument — legibility over a system
that already works, "kind of an art quite late into the process" `[QA 00:14:26–00:14:54]` — and
they arrive on the same clock as skills: after the loop stabilizes.

## The jobs he keeps for the human `[CORE]`

- **Actually read.** "You really just want to make sure it's something that you really do read…
  one failure mode I see is that people still glaze over the plans and explainers." — 00:12:48.
  `lessons.md` §9 is the same failure seen from the gate's side: silent approval.
- **Refuse the lazy prompt.** "The prompt box can definitely just be a lazy button… but usually
  you end up paying for that — taking the lazy step at each way, it'll end up taking longer,
  maybe costing longer too." — 00:13:13. His own time accounting agrees: "the thing that cost me
  the most time is when I'm maybe a little bit lazy… I do a lazy prompt and then I'm like, oh,
  I've wasted this time now." — 00:32:10 The antidote he reaches for is to turn the lazy prompt into
  a structured extraction: "interview me about this problem… using the ask user question tool, and
  then I'll answer" `[QA 00:19:09]` — the model pulls the known-knowns out of your head.
- **One focus.** "I try to have like one project I'm focusing on… even if there are other things
  that I just need to get unblocked." — 00:31:40
- **Learn constraints, on purpose.** "The goal of learning to be more technical is to know my
  unknown unknowns… I'm trying to learn the constraints of the system: what is possible, how is
  it doing it right now, how good could it be, what if we did something else." — 00:37:43,
  00:38:12. "Claude can often brainstorm and teach you this if you push it — but you really do
  have to push it… education should feel like work." — 00:38:39
- **Decide the direction, and carry it.** Cheap creation widens the funnel, not the choice: "it
  still takes a lot of tenacity to make something… it's cheaper to make things but now you have to
  get buy-in… it should increase your exploration phase but you're the one who has to decide — hey,
  I think this is it" `[QA 00:33:41–00:34:33]`.
- **Know who the tidiness is for.** "Organization is often more for me than the agent — to make me
  feel better about this repository… if I'm only caring about the outputs" (00:33:25). The agents
  "are very persistent and they'll figure it out," and for output work "maybe the quality of the
  code matters less" — the quality bar tracks what the thing is *for*; workspace order is bought
  for human comfort, not agent performance.

## How he instructs agents `[DATED · 2026-07-24]`

- **Reasons over prohibitions.** "When you say never, you really mean… most of the time don't do
  this. And if you give it the reason you don't want to do it instead, that can be more effective
  than the 'don't do this' constraint." — 00:35:00

  The blog prints the worked pair. A prohibition with a hard number in it — never multi-paragraph
  docstrings, one short line max — became *"Write code that reads like the surrounding code: match
  its comment density, naming, and idiom"* `[CE]`. Not a softened rule: **it names the outcome and
  hands back the decision**, payable only because "newer models have better judgement and can handle
  these decisions well without explicit rules" `[CE]`. **The upgrade path for any rule you already
  wrote:** find the outcome it was protecting and write *that* — the rule was a compression of a
  standard you never stated.
- **Hard constraints stay hard; preferences stay soft.** The tweet example: 280 characters "does
  need to happen"; "I'd prefer it to be one tweet" leaves room for the two-tweet thread that is
  better. — 00:36:21–00:36:49
- **Lean instructions.** "We cut down the Claude Code system prompt by 80%… as the models have
  gotten smarter, they need less direction, fewer constraints, and fewer examples… the models
  just need more room to run." — 00:34:25–00:35:57

  The blog is the same 80% with its condition attached — removed "with no measurable loss on our
  coding evaluations" `[CE]`. **That is `chain.md` standing rule 4 running on this repo's own
  material:** a spoken adjective becomes a claim with a stated check, and only the second version
  earns the right to change how you write. It also fixes the transcript reading twice — the cut was
  diagnosed as *overconstraint*, not verbosity, so deleting by word count misses; and it landed on
  three files, "our system prompt and in our CLAUDE.md files and skills" `[CE]`, two of which the
  operator writes.

  **The floor, so this is not read as delete-everything:** what stayed was the guardrail against
  irreversible harm — "worst case scenarios, such as deleting files" `[CE]`. Judgment absorbs style
  and process; it does not absorb blast radius. Same asymmetry as *hard constraints stay hard*,
  reached from the other side.

- **Examples now constrain — specify the interface instead.** A reversal, not a trim: giving examples
  "was the number one rule for tool usage", and with the newest models it "actually constrains them
  to a certain exploration space" `[CE]`. What replaces them is the shape of the thing — parameter
  design and a clear spec — because an example is a *path*, and the model can now find better ones.
  `[inferred — not in the source]` An example teaches by demonstration, and the quadrants put
  demonstration on *unknown knowns* — retiring **your** uncertainty about what you want, not the
  model's about what to do. Pointed at the model, it caps the ceiling at what you already imagined.

- **Load context progressively; do not disclose it upfront.** Claude Code "has gotten very competent
  at using progressive disclosure" — loading the right context at the right time `[CE]`, which is why
  skills and deferred tool definitions exist instead of one long prompt. **An instruction's cost is
  not its length but how often it loads when irrelevant**, so the question about any paragraph you
  wrote is which trigger should pull it in.

- **One owner per instruction.** Repetition was a workaround for how older models read their own
  context — they "could sometimes need repeated instructions", or attend more to the end of the
  window than the start `[CE]`. That was a property of the reader, and the reader changed. A line
  duplicated across a system prompt and a tool description now buys drift, not emphasis: the copies
  age apart and the model gets a contradiction. Say it once, in the layer that owns it.
- **Codify only after the loop stabilizes.** "Right now I don't have a skill. One of the things I
  try and do first is really figure out what I want before I turn it into a skill." — 00:06:37 And
  the reverse holds as the model improves — delete scaffolding it has outgrown: "it's good to build
  scaffolding, but… deleting stuff is really important… okay, the model is good at this now"
  `[QA 00:24:00]`. Bespoke context-search rigs (rag) are now often an anti-pattern you replace with
  grep `[QA 00:24:31]`.

  **Deletion has since been given an instrument** — `/doctor`, to "rightsize your skills, and
  CLAUDE.md files" `[CE]`. That matters more than the convenience: deciding *what the model has
  outgrown* was the judgment call gating the whole rule, and it is the call an operator is worst
  placed to make, because the scaffolding to be deleted is theirs. A scheduled audit is the delete
  rule freed from having to notice. Auto-memory is the same motion one layer down `[CE]`, with the
  hand-maintained `CLAUDE.md` entry as the scaffolding that got absorbed.
- **When it does become a skill, the whole loop ships in the folder.** The observed shape is three
  files, not one: *"this can also be a skill. So you can package a skill with the workflow… the
  workflow is just a JS file and you can… save the JS file into the skill and now you have this
  reusable skill that you can use"* (00:28:44). His own published example is
  `~/.claude/skills/deep-verify/` holding `SKILL.md`, `verify-claims.workflow.js` and `rubric.md`,
  where `SKILL.md` carries a `## Workflow` section naming the script by relative path. Two things
  the folder buys that a prompt cannot:
  - **The workflow buys per-item attention.** One subagent per item, rather than the model handling
    several at once and putting less into each: *"each clip has a maximum amount of compute put into
    it… versus if you're doing two or three simultaneously sometimes… Claude might verify or put
    less work into any individual clip"* (00:28:13).
  - **The rubric is where the standard lives, so a non-doer can apply it.** This is the
    self-referential-bias rule under *Verification is designed at planning time* given a runtime —
    *"a verification agent that reads the rubric"*, and *"a separate cloud doing the work versus
    verifying the work"* (00:29:16–00:30:21).

  `[inferred — not in the source]` Writing the standard to a **file** rather than into the
  verifier's prompt is also what makes a *cheaper* verifier viable: the criteria stop living in the
  checker's reasoning. Thariq gives only the bias argument; the cost argument is this repo's, and it
  is untested.

  `[measured 2026-07-27]` The `.workflow.js` suffix is a human naming convention, not a harness
  trigger — the string has zero occurrences in the Claude Code 2.1.220 binary. It resolves because
  `SKILL.md` names the path. This is a different mechanism from `.claude/workflows/*.js`, which is
  the registry for named workflows invoked as `/name`; both are real and they are not the same thing.
- **Plan for outcomes, not process.** Capability arrives "in these spiky, non-intuitive ways" — the
  2024 thesis said giant context windows would solve coding; the actual answer was models building
  their own context `[QA 00:08:06–00:08:58]`. So aim plans at outcomes: "you can plan for the
  outcomes to get better even though you don't know exactly how that process will work"
  `[QA 00:11:29]` — staying on the frontier means continually rewriting your own harness. The
  delete-scaffolding rule above is this principle pointed backwards.

### Where an instruction lives `[DATED · 2026-07-24]`

The counterpart to *where unknowns live*, above. That frame places a question you are holding; this
one places a sentence you have decided to keep. Both exist because the failure is the same shape —
an item in the wrong place looks correct and does nothing. Four layers `[CE]`:

| Layer | Owns | The test |
|---|---|---|
| **System prompt** | product and operating context — "what product it's operating in and what it's doing" | true of every session in this product |
| **`CLAUDE.md`** | repo gotchas. Describe the repo briefly, then "spend most of the tokens on gotchas inside of the codebase" | true of this repo, and surprising |
| **Skills** | "lightweight guides to let Claude find information when needed" | true only sometimes — so it needs a trigger |
| **References** | the depth, @-mentioned — "in-depth information about the current plan" | too long to carry, and only this task needs it |

Read down the *test* column and the ladder is one variable: **how often the line is true.** So the
layers are a compression scheme, not a filing system — and moving a line down a layer is usually the
fix that "make it shorter" was groping for. `[inferred — not in the source]` The chain's economics
again: pay for context when it retires an unknown, not before.

Two cautions. Correct placement does not make a paragraph worth keeping — the blog's cut hit
`CLAUDE.md` and skills too. And **the reference layer is the one growing** `[CE]`, which is *reasons
over prohibitions* seen from outside: steering shifts from rules you wrote to material you point at.

## Where the five documents come from `[CORE]`

The chain is this loop written onto the filesystem — one unknown species per link:

| Link | Unknown it retires |
|---|---|
| 1 · Explainer | how the world works, including how it breaks — **multi-form**: edge-case explainer for *how it works*, rendered variations for *what I want* |
| 2 · Research | which approach — retired by ranking, exactly one default |
| 3 · Spec | what exactly to build — remaining unknowns pinned as §12 tagged defaults |
| 4 · Impl notes | what the build minted that nobody expected |
| 5 · Re-research | whether one measured, shaped failure reopens one question |

Mechanics in `chain.md`; forms and exits in `toolkit.md`; observed ways this goes wrong in
`lessons.md`.

## What is dated, and what conflicts

**The intake loop.** Each new source runs the same four steps, which is what keeps this a working
system instead of a growing pile:

1. **Tag it** in the source pool at the top. It never becomes canonical, however new it is.
2. **Route each claim.** Does it describe the human's thinking, or how to steer the model? The first
   goes to a `[CORE]` section, the second to a `[DATED]` one.
3. **Agreement raises the grade; it does not add a claim.** A spoken line confirmed in writing gets
   the citation, not a new paragraph. That is what stops the file doubling per source.
4. **Disagreement gets a row here.** Nothing is overwritten and nothing is deleted.

**Closed, kept in place as worked examples.** Both were resolved the same way — by asking which model
generation each reading was true of, then dating the loser instead of deleting it.

| The tension | How it closed |
|---|---|
| Plan mode is dying `[QA 00:08:58]` vs. this whole file being about planning | Planning had two halves. Plan-*for-the-model* was scaffolding and got deleted; plan-*for-the-human* is what remains and is `[CORE]`. Kept under *The reframe*. |
| "Startups maybe should not be making evals" `[QA 00:13:58]` vs. verification designed upfront | Different instruments on different clocks: the **per-task** check is designed at plan time, **institutional eval suites** arrive after the loop stabilizes. Kept under *Verification is designed at planning time*. |

**Open — decide by fine-tune date.** Left undecided on purpose; each names what evidence would close
it.

| The tension | The two readings | What decides it |
|---|---|---|
| **This repo's own density** vs. the overconstraint finding | The blog's cut hit "CLAUDE.md files and skills" `[CE]`, and the `thariq-os` skill is long and rule-dense → cut it. But the reference layer is the one *growing* `[CE]` → keep it. | Which is this file mostly doing — **forbidding** or **explaining**? Prohibitions are the depreciating half; material you point at is the growing half. A `/doctor` pass over the skill would answer it with evidence rather than taste. |
| **Examples constrain** `[CE]` vs. the method's own specimens | The chain runs on demonstration — print the object, gate on a rendered object, keep the embarrassing specific. The blog says examples cap the exploration space. | **Who the specimen is for.** For a human reader they retire an *unknown known* and stay `[CORE]`. If the reader is an agent executing this file, they are the same thing the blog warns about. Unresolved because both readers are real. |
| **Prefer shorter tasks** `[QA 00:24:59]` | True of that generation's reliability, and he pairs it with "unless there's something clearly ambitious that I can spec out all up front". | Whether long-run failures still track *unretired unknowns* rather than model drift. If drift stops being the limit, the preference moves and the unknown-removal reason stays. |
| **`.workflow.js` is a naming convention** `[measured 2026-07-27]` | Measured against Claude Code 2.1.220 — a version pin, not a principle. | Re-measure on the current binary. Cheapest row here, and the first to rot silently. |

`couldn't judge ·` no source states this two-shelf split; it is this repo's reading of three sources,
and one model generation is a short track record. The honest status is a hypothesis that has not been
falsified yet — not a law.
