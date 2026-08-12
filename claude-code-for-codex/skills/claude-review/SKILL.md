---
name: claude-review
description: >
  Run a read-only Claude Code review against local git state — uncommitted changes or a branch
  diff against a base ref. Review-only: never fixes issues or applies patches. Use for "review my
  changes", "have Claude Code review this before I ship", or "review this branch against main".
  Takes `--wait`/`--background` and `--base <ref>`; does not take custom focus text or staged/
  unstaged-only scope. Do NOT use for a challenge review that questions the approach or design
  (`claude-adversarial-review`), and do NOT use this to check on a review already running
  (`claude-status`) or fetch one already finished (`claude-result`).
---

# claude-review

Runs a Claude Code review through the shared claude-companion runtime. This is a plain,
non-steerable review of correctness and regression risk in the current working tree or branch
diff — the Claude-Code-driven equivalent of upstream's native Codex review.

## Core constraint

This skill is review-only.

- Do not fix issues, apply patches, or suggest that you are about to make changes.
- Your only job is to run the review and return Claude Code's output verbatim to the user.

## Execution mode

- Raw arguments include `--wait` → do not ask, run in the foreground.
- Raw arguments include `--background` → do not ask, run as a background job.
- Otherwise, estimate the review size before asking:
  - Working-tree review: check `git status --short --untracked-files=all`, and both
    `git diff --shortstat --cached` and `git diff --shortstat`.
  - Base-branch review: check `git diff --shortstat <base>...HEAD`.
  - Treat untracked files or directories as reviewable work even when `git diff --shortstat` is
    empty.
  - Only conclude there is nothing to review when the relevant scope is actually empty.
  - Recommend waiting only when the change is clearly tiny (roughly 1-2 files, no sign of a
    broader directory-sized change). Recommend background in every other case, including when the
    size is unclear.
  - When in doubt, run the review instead of declaring there is nothing to review.
- Ask the user once which mode to use, recommended option first: "Wait for results" vs. "Run in
  background."

## Argument handling

- Preserve the user's arguments exactly. Do not strip `--wait` or `--background` yourself, and do
  not add extra review instructions or rewrite the user's intent.
- This skill supports working-tree review and branch review with `--base <ref>`. It does not
  support staged-only or unstaged-only scope, and it does not take extra focus text — that is
  `claude-adversarial-review`.

## Foreground flow

```bash
node "${PLUGIN_ROOT}/scripts/claude-companion.mjs" review "$ARGUMENTS"
```

Return the command's stdout verbatim. Do not paraphrase, summarize, or add commentary before or
after it. Do not fix any issues the review surfaces.

## Background flow

Launch the review as a background job:

```bash
node "${PLUGIN_ROOT}/scripts/claude-companion.mjs" review "$ARGUMENTS"
```

Do not wait for it to complete or poll its output in this turn. After launching, tell the user:
"Claude Code review started in the background. Check `claude-status` for progress."

## Verified vs not

NOT VERIFIED: the `claude-companion.mjs review` subcommand's exact flag parsing — the script is
built elsewhere in this plugin. What is confirmed is the transport it must sit on top of: `claude
-p --output-format json` for a one-shot run (`claude --help`, `-p/--print` and `--output-format`
entries).
