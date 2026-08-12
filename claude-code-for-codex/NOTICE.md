# NOTICE

`claude-code-for-codex` is a derivative work of **codex-plugin-cc**, OpenAI's Codex plugin for
Claude Code (<https://github.com/openai/codex-plugin-cc>), ported at upstream commit `db52e28`.

Upstream is licensed under the Apache License, Version 2.0. This plugin inherits that license;
`LICENSE` in this directory is the Apache-2.0 text, and it governs this directory regardless of
the MIT license covering the rest of the `agent-plugins` repository.

```
Copyright 2026 OpenAI

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

## What changed in the port

Upstream is a Claude Code plugin that drives Codex. This is a Codex plugin that drives Claude
Code — the same architecture with the direction of delegation reversed.

- The transport is rewritten. Upstream speaks JSON-RPC to `codex app-server`; this plugin speaks
  newline-delimited streaming JSON to `claude -p --output-format stream-json`.
- Upstream's eight slash commands become eight Codex skills. Codex plugins have no `commands/`
  directory — skills are the invocation surface there, reached as `$skill-name`.
- Upstream's `gpt-5-4-prompting` skill becomes `opus-5-prompting`, rewritten for Claude rather
  than translated.
- Session transfer is inverted: upstream reads a Claude Code transcript to hand to Codex; this
  reads a Codex session to hand to Claude Code.

Modifications are Copyright 2026 Tien Nguyen, released under the same Apache-2.0 terms.
