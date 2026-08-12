---
name: claude-adversarial-review
description: >
  Run a steerable Claude Code review that challenges the chosen implementation, design tradeoffs,
  and assumptions — not just a stricter pass over defects. Use for "pressure-test this design",
  "challenge whether this was the right approach", "review this for race conditions and question
  the caching strategy", or any review that should take custom focus text. Takes `--wait`/
  `--background`, `--base <ref>`, and free-text focus after the flags; does not support staged/
  unstaged-only scope. Do NOT use for a plain non-steerable review with no focus text
  (`claude-review`), and do NOT use this to check on or fetch a review already dispatched
  (`claude-status`, `claude-result`).
---

# claude-adversarial-review

Runs a challenge review through the shared claude-companion runtime. Position it as questioning
the chosen implementation, design choices, tradeoffs, and assumptions — not merely a stricter scan
for defects.

## Core constraint

This skill is review-only.

- Do not fix issues, apply patches, or suggest that you are about to make changes.
- Your only job is to run the review and return Claude Code's output verbatim to the user.
- Keep the framing on whether the current approach is the right one, what assumptions it depends
  on, and where the design could fail under real-world conditions.

## Execution mode

- Raw arguments include `--wait` → run in the foreground, do not ask.
- Raw arguments include `--background` → run as a background job, do not ask.
- Otherwise, estimate the review size before asking, using the same working-tree/base-branch checks
  as `claude-review`:
  - Treat untracked files or directories as reviewable work even when `git diff --shortstat` is
    empty.
  - Only conclude there is nothing to review when the relevant scope is actually empty.
  - Recommend waiting only when the scoped review is clearly tiny (roughly 1-2 files, no sign of a
    broader directory-sized change). Recommend background otherwise, including when the size is
    unclear.
  - When in doubt, run the review instead of declaring there is nothing to review.
- Ask the user once which mode to use, recommended option first: "Wait for results" vs. "Run in
  background."

## Argument handling

- Preserve the user's arguments exactly. Do not strip `--wait` or `--background`, and do not
  weaken the adversarial framing or rewrite the user's focus text.
- Uses the same review-target selection as `claude-review`: working-tree review, branch review, and
  `--base <ref>`. It does not support `--scope staged` or `--scope unstaged`.
- Unlike `claude-review`, this skill takes free-text focus after the flags — pass it through
  unmodified.

## Foreground flow

```bash
node "${PLUGIN_ROOT}/scripts/claude-companion.mjs" adversarial-review "$ARGUMENTS"
```

Return the command's stdout verbatim. Do not paraphrase, summarize, or add commentary before or
after it. Do not fix any issues the review surfaces.

## Background flow

Launch as a background job:

```bash
node "${PLUGIN_ROOT}/scripts/claude-companion.mjs" adversarial-review "$ARGUMENTS"
```

Do not wait for it to complete or poll its output in this turn. After launching, tell the user:
"Claude Code adversarial review started in the background. Check `claude-status` for progress."

## Verified vs not

NOT VERIFIED: the `claude-companion.mjs adversarial-review` subcommand's exact flag parsing — the
script is built elsewhere in this plugin.
