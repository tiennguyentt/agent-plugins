# Claude Prompt Anti-Patterns

Avoid these when prompting Claude Code (Opus 5 / Sonnet 5).

## Vague task framing

Bad:

```text
Take a look at this and let me know what you think.
```

Better:

```xml
<task>
Review this change for material correctness and regression risks.
</task>
```

## Missing output contract

Bad:

```text
Investigate and report back.
```

Better:

```xml
<structured_output_contract>
Return:
1. root cause
2. evidence
3. smallest safe next step
</structured_output_contract>
```

## No follow-through default

Bad:

```text
Debug this failure.
```

Better:

```xml
<default_follow_through_policy>
Keep going until you have enough evidence to identify the root cause confidently.
</default_follow_through_policy>
```

## "Done" left undefined

Claude will treat the first plausible-looking fix as the finish line unless told otherwise — this
is a different failure mode from vague task framing above; the task can be perfectly clear and
still stop early because nothing said what "done" means.

Bad:

```text
Fix the bug.
```

Better:

```xml
<completeness_contract>
The task is not done until the originally reported symptom is verified gone, not just until the
code looks correct. Re-run the check that caught the bug before reporting completion.
</completeness_contract>
```

## An unguarded pass/fail signal

Bad:

```text
Make the tests pass.
```

This invites a model to satisfy the letter of the request — special-case the test's input,
hard-code its expected output, or quietly weaken the assertion — instead of fixing the underlying
behavior.

Better:

```xml
<anti_shortcut_rules>
Fix the root cause in the source, not the check.
Do not special-case the test's specific input or hard-code its expected output.
</anti_shortcut_rules>
```

## Asking for more reasoning instead of a better contract

Bad:

```text
Think harder and be very smart.
```

Better:

```xml
<verification_loop>
Before finalizing, verify that the answer matches the observed evidence and task requirements.
</verification_loop>
```

Reach for `--effort high` or `--effort xhigh` only after the contract itself has been tightened —
a vague prompt run at higher effort is still a vague prompt.

## A review prompt that only asks for confirmation

Bad:

```text
Does this look good to ship?
```

A prompt shaped as a yes/no confirmation tends to get a yes/no confirmation. Claude will surface a
real objection, but only if the prompt makes room for one.

Better:

```xml
<candor_rules>
State what is wrong with this approach, not only what is right about it.
Do not soften a finding to make it more agreeable.
</candor_rules>
```

## Mixing unrelated jobs into one run

Bad:

```text
Review this diff, fix the bug you find, update the docs, and suggest a roadmap.
```

Better:
- Run review first.
- Run a separate fix prompt if needed.
- Use a third run for docs or roadmap work.

## Unsupported certainty

Bad:

```text
Tell me exactly why production failed.
```

Better:

```xml
<grounding_rules>
Ground every claim in the provided context or tool outputs.
If a point is an inference, label it clearly.
</grounding_rules>
```

## Independent lookups issued one at a time

Bad — sending five separate single-file read requests in sequence when the five files don't depend
on each other, burning turns on latency that parallel calls would avoid.

Better:

```xml
<tool_persistence_rules>
When multiple reads or lookups are independent of each other, issue them together rather than one
at a time.
</tool_persistence_rules>
```
