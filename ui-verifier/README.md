# ui-verifier

A dual-host agent plugin (Claude Code + Codex) that tests a macOS app's UI **hands-free**: the
operator's screen is never touched, no mouse moves, no window is raised. It launches a target
app off-screen, waits on Accessibility conditions instead of fixed sleeps, gates on content and
pressable elements counted per viewport, captures a screenshot per viewport with an honest
two-cause failure message when one is missing, hands every capture to a fresh vision review,
and can baseline a golden Accessibility-tree snapshot per fixture world for regression across
app states. It never advertises a press it did not confirm, and it never reports a number it
did not just measure.

```text
Distribution mode: dual
Portable core: `skills/`
Portable entry skill: `test-ui`
Standalone entry: runs test-ui and snapshot-ui-state entirely from the vendored references/ax-dump.swift, ax-actions.swift, and window-shot.swift plus the steps written into each SKILL.md — no workspace file is required for either skill's core procedure.
Workspace-mode extras: `a retired tien-os gate` (a tien-os workspace's own world runner that automates snapshot-ui-state's fixture loop across many fixtures at once; snapshot-ui-state uses it when the path exists in the current repo and falls back to its own manual loop otherwise), and — outside any repo-owned plane, so not a dependency of this plugin's own runtime text — the a project repository repo's own workspace wrapper scripts (e2e-eye.sh, eye-prep.sh, test-gate.sh, check-module-boundaries.sh) that call the same three tools this plugin vendors
Codex project agent: none
```

Standalone behavior is measured, not asserted: both skills' own procedures run to completion
using only the three vendored tools and the steps written in `SKILL.md`; the workspace-mode
extras above are read only when found, and their absence changes nothing about what either
skill can do.

## One part of a bigger system, shared on purpose

This is the fifth of tien-os's agent plugins — a workspace OS where governed agent teams do the
work end to end. It is published on its own because a UI-testing eye that only runs inside the
repo that grew it is not a part — it is a dependency. The three tools it drives were built for
one macOS app (TienOS.app) but take a pid/owner-name/identifier-prefix as arguments, not a
hardcoded target — nothing about them is specific to that app.

**Built for a team, not for a demo.** One agent, two skills, each independently invocable
without the agent. The vision-review standard lives in `rubric.md`, read by a fresh reviewer
that never sees the deterministic gate's own numbers — a maker's own "looks fine" is not
evidence, and neither is a gate that only measured the Accessibility tree grading what the
pixels show. The packaging is checked by machine: `plugin.json` conforms to Agent Plugins
1.0.0, and a contract check fails the build when the manifests, the entry skill, or the routes
drift apart.

**What is not measured says so.** This plugin has a golden set of **zero cases run** — the
evaluation routes exist and are marked NOT BUILT / NOT RUN, not quietly left blank.

## Package layout

```text
ui-verifier/
├── plugin.json                  portable manifest — Agent Plugins 1.0.0
├── .claude-plugin/plugin.json   Claude Code adapter
├── .codex-plugin/plugin.json    Codex adapter
├── README.md                    this file
├── agents/
│   └── ui-verifier.md           exactly one Claude agent definition
└── skills/                      the portable core, shared by both hosts
    ├── test-ui/                 portable entry
    │   ├── SKILL.md
    │   ├── rubric.md            vision-review standard, judged by a reviewer that did not run the gate
    │   └── references/          the vendored, app-agnostic tools
    │       ├── ax-dump.swift        golden/live Accessibility-tree walk, deterministic stringification
    │       ├── ax-actions.swift     content+pressable count, and the only way a press is confirmed
    │       └── window-shot.swift    off-screen window capture via ScreenCaptureKit
    └── snapshot-ui-state/
        └── SKILL.md              drives test-ui/references/ax-dump.swift from its sibling folder
```

## Vendored tools

`references/ax-dump.swift`, `references/ax-actions.swift`, and `references/window-shot.swift`
are verbatim copies of the same three files at a project repository/tools/` — that project's own
copies are the maintained originals; these are the portable core this plugin ships so it runs
with no a project repository checkout. Each already takes its target as an argument (pid, bundle id,
owner name, or identifier prefix), not a hardcoded app, which is what makes them app-agnostic
rather than TienOS-specific:

- `ax-dump.swift <pid> | --bundle-id <id> [--press <identifier>]` — walks the Accessibility
  tree and prints one deterministic, diffable line per element; the file header explains why a
  naive `"\(value)"` interpolation would leak a pointer address into every dump and break every
  diff.
- `ax-actions.swift <pid> <identifier-prefix> [--do <AXAction>]` — counts elements carrying an
  identifier with the given prefix and which of them expose an accessibility action; with
  `--do`, performs that action on the first match and reports whether it actually succeeded.
- `window-shot.swift <owner-name> <out.png>` — captures a named app's window via
  ScreenCaptureKit without raising it or stealing focus, and warns (rather than guesses) when
  the largest visible window is small enough that a collapsed window and a missing Screen
  Recording grant become indistinguishable from the outside.

## Package format

This package follows **Agent Plugins 1.0.0**, an open, vendor-neutral standard from the Agent
Plugins project — specification <https://agent-plugins.org/specification>, repository
<https://github.com/agentplugins/agent-plugins-spec>. Specification text is licensed CC-BY-4.0,
its schemas Apache-2.0. tien-os adopted it 2026-08-07 after Google's announcement of the
format, <https://developers.googleblog.com/agent-plugins-package-your-skills-tools-and-more/>.

The package *conforms to* that standard and vendors none of its files: `plugin.json` is written
here, and `$schema` is a URL pointing at theirs. Nothing in this plugin is authored by the Agent
Plugins project.

## The loop

```
target app running or launchable
   │
   ▼
test-ui              clean state → launch off-screen → AX-condition wait →
   │                 gate (content+pressable, per viewport) → confirmed presses →
   │                 screenshot per viewport → fresh vision review
   ▼
report               every number measured; zero-match gate is a named failure;
                      NOT RUN stated, never guessed

(separately, for regression across more than one app state)

snapshot-ui-state    drive fixture world → capture (ax-dump.swift) → normalize
   │                 (wall-clock redaction + sibling-order sort) → bootstrap,
   │                 match, cited re-baseline, or unexplained finding
   ▼
double-run byte-stability   the acceptance test for the normalization itself
```

## Skills

| Skill | Job |
|---|---|
| `test-ui` | **the entry skill** — a single hands-free pass: environment prep, off-screen launch, AX-condition wait, gate, confirmed presses, screenshot capture, vision review |
| `snapshot-ui-state` | Golden Accessibility-tree snapshot per fixture world, normalized and diffed for regression across app states; drives `test-ui`'s vendored `ax-dump.swift` |

Invoke on Claude Code: `/ui-verifier:test-ui` (or `:snapshot-ui-state`), or dispatch the bundled
`ui-verifier` agent. Invoke on Codex: `$ui-verifier:test-ui`.

## Boundaries against the plugins already in this marketplace

- **vs `behavior-implementer:gate-commit`** — gate-commit measures a project's own source
  (suite, coverage, lint, complexity) via deterministic commands; `test-ui` measures a
  *running app's rendered UI* via the Accessibility API and a screenshot. Neither substitutes
  for the other, and a UI pass proves nothing about code quality or vice versa.
- **vs `eval-writer:write-success-criteria`** — eval-writer designs what should be measured,
  as a document, before anything is built; `test-ui` executes a live pass against a running app
  and reports what it observed. Design first, then verify — this plugin is the second half.
- **vs `unknown-remover:discover-anatomy`** — discover-anatomy is a planning instrument that
  maps a system conceptually for a human reader; `snapshot-ui-state`'s output is a
  byte-comparable Accessibility-tree dump for machine diffing, never a narrative document.
- **vs `agent-builder:evaluate-capability`** — evaluate-capability grades whether an agent or
  skill complies with tien-os law, its own spec, and evaluation evidence; `ui-verifier` tests a
  macOS application's UI and has no opinion about agent/skill compliance.

## Optional files, decided per skill

Per the house skill template, `rubric.md` and `<name>.workflow.js` are independent per-skill
decisions:

| Skill | `rubric.md` | `workflow.js` |
|---|---|---|
| `test-ui` | **yes** — the vision review of a screenshot is a judgment call (does the capture show a working screen), and a standard externalized to a file lets a fresh reviewer grade it blind to the deterministic gate that produced the same run's numbers | N/A — the procedure is a bounded, sequential pass (prep → launch → wait → gate → press → capture → one vision review); no repeated fan-out over many items and no staged model-tier orchestration the requirements actually need |
| `snapshot-ui-state` | N/A — acceptance is double-run byte-stability, a deterministic comparison, and the bootstrap-vs-drift call is a procedural rule stated in `SKILL.md`, not a graded output; a grading file would add nothing a byte diff doesn't already decide | N/A — the fixture loop is a plain per-fixture capture/normalize/compare with no LLM judgment inside the loop itself; nothing here needs isolated per-item agent context or coverage arithmetic beyond what the report shape already states |

A rubric is read by a reviewer that did not produce the capture it grades; `test-ui` points its
vision-review step at the file and never grades its own screenshot.

## Standalone by design, workspace-aware when present

Both skills read only their own vendored tools and the target app's own state. The dual
distribution mode above is honest about the one place this plugin is *aware* of a tien-os
workspace without depending on it: `snapshot-ui-state` will use
`a retired tien-os gate` to automate its fixture loop when that file is
present, and runs its own manual loop identically well when it is not.

## Honest limits

- `test-ui`'s vision review judges what a screenshot shows; it does not replace a project's own
  functional or accessibility test suite, and it does not check anything the gate's identifier
  prefix and the tested viewports don't cover.
- The two-cause capture warning (collapsed window vs. missing Screen Recording) is a limit of
  ScreenCaptureKit's own API surface, not something this plugin can resolve on its own — it can
  only carry both possibilities forward honestly instead of guessing.
- Neither skill's own green report is a verdict; pair it with independent review, the same as
  every other plugin in this marketplace.
