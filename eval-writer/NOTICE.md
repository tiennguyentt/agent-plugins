# Third-party material in this plugin

One bundled file reproduces someone else's documentation:

`skills/write-success-criteria/references/ref-define-success-criteria-and-build-evaluations.md`
is **Anthropic's published documentation page** *"Define success criteria and build evaluations"*,
supplied by the user on 2026-07-31. The prose is reproduced intact; the multi-language code samples
were reduced to Python only — the source page repeats each of six eval recipes across Python,
TypeScript, C#, Go, Java, PHP and Ruby. Nothing else was cut, reworded, or added. The file's own
header carries the same provenance block.

**What that means for anyone reading the package:**

- The repository `LICENSE` (MIT, © 2026 the user Nguyen) covers the user's work in this plugin — the
  skill, its rubric, the agent adapter, `README.md`, both manifests, and this notice. **It does not
  cover that reference file**, which remains Anthropic's documentation under Anthropic's terms.
- The file is reference material the skill reads, never binding law:
  `CORE/GUARDRAILS.md` §9 rule 3.
- Redistributing this plugin redistributes that page. It was kept because the skill's procedure
  cites it; anyone uncomfortable carrying it can delete the file — the skill falls back to its own
  procedure text, though that fallback has not been evaluated (no golden case has run against it,
  or against anything else in this plugin yet).
