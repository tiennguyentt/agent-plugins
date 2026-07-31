# Third-party skill

`no-ai-slop` is **not Tiên's work.** It was written by **Peter G Yang** and published at
<https://github.com/petergyang/no-ai-slop> under the **MIT licence**, stated in this folder's
`README.md`.

It is redistributed inside this package because `CLAUDE.md` "Before you act" rule 5 requires running
it over anything Tiên will read, and the skill previously lived only at `~/.claude/skills/`, outside
this repo and outside git. A wipe of the host would have left that rule pointing at nothing.

**What that means for anyone reading the package:**

- The repository `LICENSE` (MIT, © 2026 Tien Nguyen) covers Tiên's work. **It does not cover this
  folder.** This folder is MIT under its original author's copyright.
- The plugin manifests name Tien Nguyen as author of `agent-builder`. That authorship claim does
  **not** extend to this skill.
- `README.md` in this folder is the upstream author's, kept intact as the attribution. Its line
  *"Install this skill globally"* describes the upstream install route and does not apply here,
  because the skill now ships inside this package.

**What tien-os changed, and when.** MIT permits modification; this list exists so a reader can tell
the upstream author's work from Tiên's.

1. **2026-07-30 — the `description:` line in `SKILL.md`**, to carry the `[tien-os] ` prefix every
   installed skill in this package uses so it is identifiable in the selector.
2. **2026-07-31 — a "Sentence and paragraph length" section in `SKILL.md`**, five matching checks in
   `references/eval.md`, and `references/prose-metrics.py`. Tiên asked for a length standard after
   reading drafts whose sentences ran long. The numbers were set by measuring this repo, not
   imported from upstream. The script is Tiên's work, MIT under the repository `LICENSE`.

Every other rule, word list and pattern in `SKILL.md` is the upstream author's, unchanged.

**The upstream notice, verbatim** (fetched from
`https://raw.githubusercontent.com/petergyang/no-ai-slop/main/LICENSE` on 2026-07-31 — MIT requires
this text travel with the copy, which closes the gap an earlier version of this file named):

```text
MIT License

Copyright (c) 2026 Peter Yang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
