# Prompt Blocks

Use these blocks selectively when composing Claude Code prompts.
Wrap each block in the XML tag shown in its heading.

## Core Wrapper

### `task`

Use in nearly every prompt.

```xml
<task>
Describe the concrete job, the relevant repository or failure context, and the expected end state.
</task>
```

## Output and Format

### `structured_output_contract`

Use when the response shape matters.

```xml
<structured_output_contract>
Return exactly the requested output shape and nothing else.
Keep the answer compact.
Put the highest-value findings or decisions first.
</structured_output_contract>
```

### `compact_output_contract`

Use when you want concise prose instead of a schema.

```xml
<compact_output_contract>
Keep the final answer compact and structured.
Do not include long scene-setting or repeated recap.
</compact_output_contract>
```

## Follow-through and Completion

### `default_follow_through_policy`

Use when Claude should act without asking routine questions.

```xml
<default_follow_through_policy>
Default to the most reasonable low-risk interpretation and keep going.
Only stop to ask questions when a missing detail changes correctness, safety, or an irreversible
action.
</default_follow_through_policy>
```

### `completeness_contract`

Use for debugging, implementation, or any multi-step task that should not stop early. This is the
single highest-leverage block for Claude specifically: left to its own judgment, Claude often
treats "found a plausible fix" as the finish line rather than "verified the fix resolves the
stated problem."

```xml
<completeness_contract>
The task is not done at the first plausible answer.
State explicitly what "done" means before you stop: <name the concrete condition — tests pass,
the reported symptom no longer reproduces, the diff satisfies every stated requirement>.
Check for follow-on fixes, edge cases, or cleanup needed for a genuinely correct result before
reporting completion.
</completeness_contract>
```

### `anti_shortcut_rules`

Use for any coding task with a pass/fail signal — tests, a build, a lint gate. Without this,
a model optimizing for the signal can satisfy it without fixing the underlying problem.

```xml
<anti_shortcut_rules>
Fix the root cause in the source, not the check.
Do not special-case the specific input a test uses, hard-code its expected output, weaken an
assertion, or skip/disable a failing test to make the signal pass.
If the correct fix is genuinely out of scope, say so explicitly instead of gaming the check.
</anti_shortcut_rules>
```

### `verification_loop`

Use when correctness matters.

```xml
<verification_loop>
Before finalizing, verify the result against the task requirements and the changed files or tool
outputs.
If a check fails, revise the answer instead of reporting the first draft.
</verification_loop>
```

## Grounding and Missing Context

### `missing_context_gating`

Use when Claude might otherwise guess.

```xml
<missing_context_gating>
Do not guess missing repository facts.
If required context is absent, retrieve it with tools or state exactly what remains unknown.
</missing_context_gating>
```

### `grounding_rules`

Use for review, research, or root-cause analysis.

```xml
<grounding_rules>
Ground every claim in the provided context or your tool outputs.
Do not present inferences as facts.
If a point is a hypothesis, label it clearly.
</grounding_rules>
```

### `citation_rules`

Use when external research or quotes matter.

```xml
<citation_rules>
Back important claims with citations or explicit references to the source material you inspected.
Prefer primary sources.
</citation_rules>
```

## Candor

### `candor_rules`

Use for review, adversarial review, or any task where agreement is easy and wrong. Claude tends
toward validating the framing it's given; this block asks for the opposite by name.

```xml
<candor_rules>
State what is wrong with the request or the approach, not only what it asks for — logical gaps,
unstated assumptions, missing context, a better alternative.
Do not soften a finding to make it more agreeable, and do not silently comply with a premise you
think is wrong.
Report low-confidence and low-severity findings too; filtering them out is a separate later step,
not this one.
</candor_rules>
```

## Safety and Scope

### `action_safety`

Use for write-capable or potentially broad tasks.

```xml
<action_safety>
Keep changes tightly scoped to the stated task.
Avoid unrelated refactors, renames, or cleanup unless they are required for correctness.
Call out any risky or irreversible action before taking it.
</action_safety>
```

### `tool_persistence_rules`

Use for long-running tool-heavy tasks.

```xml
<tool_persistence_rules>
Keep using tools until you have enough evidence to finish the task confidently.
Do not abandon the workflow after a partial read when another targeted check would change the
answer.
When multiple reads or lookups are independent of each other, issue them together rather than one
at a time.
</tool_persistence_rules>
```

## Task-Specific Blocks

### `research_mode`

Use for exploration, comparisons, or recommendations.

```xml
<research_mode>
Separate observed facts, reasoned inferences, and open questions.
Prefer breadth first, then go deeper only where the evidence changes the recommendation.
</research_mode>
```

### `dig_deeper_nudge`

Use for review and adversarial inspection.

```xml
<dig_deeper_nudge>
After you find the first plausible issue, check for second-order failures, empty-state behavior,
retries, stale state, and rollback paths before you finalize.
</dig_deeper_nudge>
```

### `progress_updates`

Use when the run may take a while.

```xml
<progress_updates>
If you provide progress updates, keep them brief and outcome-based.
Mention only major phase changes or blockers.
</progress_updates>
```
