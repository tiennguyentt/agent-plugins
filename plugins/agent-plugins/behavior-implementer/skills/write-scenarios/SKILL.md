---
name: write-scenarios
description: >
  Use before implementing any new behavior, when the user asks to "write scenarios for X",
  "spec this feature as Given/When/Then", "viết scenario cho tính năng này", "define the
  behavior before we code it", or when implement-behavior finds a requested behavior with no
  scenario covering it. Writes natural-language Given/When/Then scenarios that stay ignorant
  of code structure, and defines what each one must observe to fail honestly.
---

# write-scenarios

You turn a requested behavior into Given/When/Then scenarios that a runner can execute and a
non-programmer can read. Scenarios are the contract the implementation will be held to — they
come first, and they outlive the code they specify.

## Key insight

The wrong path this skill exists to prevent is writing scenarios that mirror the code. A
scenario that names a method, a CSS selector, a database column, or a JSON field is a unit
test wearing a costume: it breaks on every refactor and specifies nothing a user could
observe. Keep the scenario in the language of the domain — what a user or caller does, and
what they can see happen. The glue code (implement-behavior's job) is where domain language
meets code structure; the scenario itself never does.

## Procedure

1. **Name the behavior, one sentence, from the outside.** Who does what, and what changes
   that they can observe. If you cannot say it without naming code, you do not understand the
   behavior yet — ask, or read the surrounding domain, before writing anything.

2. **Write the happy path first, as Given/When/Then.**
   - *Given* — the world before the action: state, not setup code.
   - *When* — one action by one actor. One `When` per scenario; a second action is a second
     scenario.
   - *Then* — an observable outcome. Something a user, caller, or downstream system can see —
     never "the flag is set" or "the method returns".

3. **Then write the scenarios that can fail.** For each happy path add the edges that earn
   their place: the empty input, the duplicate, the unauthorized actor, the boundary value.
   A scenario set where nothing refuses anything is decoration, not a specification.

4. **Keep the language natural and consistent.** Reuse the same phrasing for the same concept
   across scenarios — a small, stable vocabulary is what makes the glue layer thin. Plain
   files, one behavior per file, in the project's scenario directory (`features/`,
   `scenarios/`, or wherever the project already keeps them; create `scenarios/` if none
   exists).

5. **For every scenario, state its failure observation.** One line beneath it: what the
   runner must observe for this scenario to fail before implementation. A scenario nobody has
   defined failure for will be "passed" by a no-op step. implement-behavior will demand this
   line — write it now, while the behavior is fresh.

6. **Stop.** Scenario writing ends before implementation begins. Hand the scenario files
   over; do not write step definitions, glue, or production code here — that is
   implement-behavior's job, and it starts by watching your scenarios fail.

## What you never do

1. **Never name code structure in a scenario** — no method names, selectors, table names,
   endpoints, or payload shapes. Domain language only.
2. **Never write a scenario that cannot fail** — every `Then` must be observable and
   checkable, or it does not ship.
3. **Never batch several actions into one scenario.** One `When` each; sequences become
   separate scenarios with richer `Given`s.
4. **Never invent requirements.** A scenario encodes what was asked or what the domain
   demonstrably requires; if you are guessing, ask instead — an invented scenario grades the
   system against fiction.
