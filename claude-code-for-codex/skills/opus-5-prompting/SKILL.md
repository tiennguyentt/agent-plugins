---
name: opus-5-prompting
description: >
  Internal guidance for composing Claude Code prompts (Opus 5 / Sonnet 5) for coding, review,
  diagnosis, and research tasks delegated from Codex. Not a user-invocable command — used by the
  `claude-rescue` agent to tighten a raw request into a Claude-Code-ready prompt before the single
  `task` call.
user-invocable: false
---

# Opus 5 / Sonnet 5 Prompting

Use this skill when `claude-rescue` needs to ask Claude Code for help.

Prompt Claude like an operator, not a collaborator. Keep prompts compact and block-structured with
XML tags — Claude parses multi-part instructions more reliably when each part has a stable tag,
the same reason this works for GPT-class models. State the task, the output contract, the
follow-through defaults, and the small set of extra constraints that matter. Everything below is
about what is actually true of prompting Claude specifically, not a relabeled copy of GPT-5.4
advice: where Claude's failure modes differ from GPT-5.4's, the blocks differ too.

## Core rules

- Prefer one clear task per Claude Code run. Split unrelated asks into separate runs.
- Tell Claude what done looks like, explicitly. Claude models tend to stop at the first plausible
  fix rather than push through to full resolution unless told the task isn't finished until a
  named condition holds — say the condition, not just "keep going."
- State desired behavior positively, not only as a list of prohibitions. "Fix the root cause in
  the source file" lands better than "don't just patch the test."
- Add explicit grounding and verification rules for any task where an unsupported guess would hurt
  quality — Claude will fill a context gap with a plausible-sounding answer if not told to say what
  it doesn't know instead.
- For coding and fix tasks, add an explicit anti-shortcut rule. Left unconstrained, a model
  optimizing for "tests pass" can special-case a test's exact input, hard-code an expected output,
  or quietly weaken/skip a failing assertion instead of fixing the underlying code. Naming this
  outcome as unacceptable, not just asking for "a correct fix," measurably reduces it.
- Prefer better prompt contracts over raising reasoning effort or adding long natural-language
  explanations. Claude Code's effort lever is `--effort <low|medium|high|xhigh|max>`
  (`claude --help`) — reach for a tighter contract before reaching for a higher tier.
- When the task has several independent read-only lookups (multiple files, multiple greps), tell
  Claude it may issue them in parallel rather than one at a time — Claude Code batches independent
  tool calls when a prompt makes clear they don't depend on each other.
- Use XML tags consistently so the prompt has stable internal structure.

## Default prompt recipe

- `<task>`: the concrete job and the relevant repository or failure context.
- `<structured_output_contract>` or `<compact_output_contract>`: exact shape, ordering, and
  brevity requirements.
- `<default_follow_through_policy>`: what Claude should do by default instead of asking routine
  questions.
- `<completeness_contract>` and `<verification_loop>`: required for debugging, implementation, or
  risky fixes — this is where Claude most needs an explicit "not done yet" bar.
- `<anti_shortcut_rules>`: required for any task with a pass/fail signal (tests, a build, a lint
  gate) that a model could satisfy by gaming rather than fixing.
- `<grounding_rules>` or `<citation_rules>`: required for review, research, or anything that could
  drift into unsupported claims.

## When to add blocks

- Coding or debugging: add `completeness_contract`, `verification_loop`, `anti_shortcut_rules`, and
  `missing_context_gating`.
- Review or adversarial review: add `grounding_rules`, `structured_output_contract`,
  `dig_deeper_nudge`, and `candor_rules` — ask explicitly for disagreement and named assumptions,
  not just defect-spotting.
- Research or recommendation tasks: add `research_mode` and `citation_rules`.
- Write-capable tasks: add `action_safety` so Claude stays narrow and avoids unrelated refactors.

## How to choose prompt shape

- Use the built-in `review` or `adversarial-review` subcommands when the job is reviewing local
  git changes. Those prompts already carry the review contract.
- Use `task` when the task is diagnosis, planning, research, or implementation and the prompt needs
  more direct control.
- Use `task --resume-last` for follow-up instructions on the same Claude Code session. Send only
  the delta instruction instead of restating the whole prompt unless the direction changed
  materially — Claude Code's session already carries the prior turns.

## Working rules

- Prefer explicit prompt contracts over vague nudges ("be careful", "think harder").
- Use stable XML tag names that match the block names from the reference file.
- Do not raise reasoning effort or complexity first. Tighten the prompt and verification rules
  before escalating `--effort`.
- Ask Claude for brief, outcome-based progress updates only when the task is long-running or
  tool-heavy.
- Keep claims anchored to observed evidence. If something is a hypothesis, say so — and ask Claude
  to do the same in its answer.
- Do not ask Claude to suppress genuine disagreement to be agreeable. A prompt that only asks for
  confirmation gets a confirmation; a prompt that explicitly invites pushback gets the pushback
  that catches a bad premise before it ships.

## Prompt assembly checklist

1. Define the exact task and scope in `<task>`.
2. Choose the smallest output contract that still makes the answer easy to use.
3. Decide whether Claude should keep going by default or stop for missing high-risk details.
4. Add verification, grounding, anti-shortcut, and safety tags only where the task needs them.
5. Remove redundant instructions before sending the prompt.

Reusable blocks live in [references/prompt-blocks.md](references/prompt-blocks.md).
Concrete end-to-end templates live in
[references/claude-prompt-recipes.md](references/claude-prompt-recipes.md).
Common failure modes to avoid live in
[references/claude-prompt-antipatterns.md](references/claude-prompt-antipatterns.md).

## Verified vs not

Verified: `claude --effort <level>` accepts `low, medium, high, xhigh, max` (`claude --help`).
The claims about Claude's specific failure modes (stopping early, test-gaming shortcuts,
sycophantic agreement, benefiting from parallel independent tool calls, XML-tag structure) reflect
Anthropic's own published prompting guidance for Claude 4/Opus/Sonnet-class models and this
session's own operating rules (`~/.claude/CLAUDE.md`'s critical-thinking clause is one live
instance of the candor pattern), not a measurement run on this machine. NOT VERIFIED: no live
`claude -p` prompt comparison was run to confirm these deltas on this specific plugin's use cases.
