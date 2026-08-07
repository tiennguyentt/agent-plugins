# test-ui — vision review rubric

The standard a fresh-context reviewer grades one screenshot against. `test-ui` hands this file
and the capture to the reviewer; the reviewer never sees the gate numbers from step 4/5 or the
conversation that ran the test — a rendering defect must be visible in the pixels, not inferred
from what the deterministic gate already said.

## What one unit of grading is

One screenshot capture, for one viewport, from one `test-ui` run. Grade the image as it is —
never as it is described to you.

## The verdicts, exact strings

- `RENDERED` — the viewport shows content consistent with a working screen: no blank region
  where content was expected, no obvious layout break, no stuck loading state, no raw
  error/stack text on screen.
- `DEFECT` — a visible problem: blank/empty where content should be, overlapping or clipped
  elements, text truncated in a way that loses meaning, a loading spinner with nothing behind
  it, an unstyled fallback, a crash dialog, or content that contradicts what the gate step
  claimed was present (e.g. the gate reported `identifiers=6` but the image shows none of that
  content on screen).
- `UNVERIFIABLE` — the capture itself is unusable for judgment: wrong window captured, image
  corrupt or unreadable, resolution too low to see the region in question, or the capture step
  itself reported a failure (in which case there is nothing to grade).

## Evidence each verdict requires

- `RENDERED` — a one-line description of what is visible that supports the verdict (what
  content, roughly where).
- `DEFECT` — the specific visible symptom, described in enough detail that someone who has not
  seen the image would recognize it (not "looks off" — "the right panel is entirely blank
  below the header, viewport 1280×800").
- `UNVERIFIABLE` — the specific reason the image cannot be judged.

## Tie-break

**Default to `DEFECT` when uncertain whether something visible is intentional** (an empty
state, a deliberately minimal screen) versus broken. An empty state that IS intentional is
cheap for a human to wave off; a broken screen misread as fine is not. Do not resolve
ambiguity in favor of the run that produced the capture.

## What the reviewer must not treat as evidence

- Its own memory of what this screen "usually" looks like.
- The gate's `elements=`/`identifiers=`/`with_press=` counts from step 4/5 — those measure the
  Accessibility tree, not the pixels, and a passing gate does not make a blank screenshot
  `RENDERED`.
- Anything the run's own narration claims about the image, if the image itself does not show
  it.
