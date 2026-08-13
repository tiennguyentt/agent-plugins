#!/usr/bin/env python3
"""The standalone-mode `Confirmed:`-gate — the vendored twin of
`evaluation-plane/checks/check.py --confirmed` in the workspace.

    python3 check-confirmed.py <spec-file-or-capability-name>

Exit 0 and a `PASS` line mean the named spec under `.agent-builder/specs/` in the CONSUMER'S
OWN project root (a `<YYYY-MM-DD>-spec-<name>.*` file, date first) carries a valid `Confirmed:`
line. Exit 1 means it does not — treat that exactly like "no spec exists": refuse the build and
let `create-capability`'s standalone branch write the scaffold instead.

Same acceptance rule as workspace mode's check 2 / `--confirmed`, same regex
(`policy-plane/GUARDRAILS.md` §9 rule 9: `Confirmed: <YYYY-MM-DD> — <signature>`, column 1 of
its own line) — but this file is the standalone copy, not an import of the workspace one.
**It imports nothing from `workspace/scripts/` or `workspace/control-plane/` on purpose**: this
script ships inside the plugin and must run in a consumer's project that has neither directory.
Standard library only, so it works with no install step, exactly like the script it mirrors.

Licensed by
archive-v1/artifact-plane/workspace/pre-implementation/2026-07-31-spec-agent-builder-standalone.html §6, §11
step 4. If this file and `workspace/evaluation-plane/checks/check.py`'s `check_confirmed()` / `CONFIRMED_LINE_RE`
ever disagree, that is drift to fix by hand — there is no shared source at runtime, by design,
because a standalone consumer cannot resolve a path back into this workspace.
"""

import re
import sys
from pathlib import Path

# Byte-identical to CONFIRMED_LINE_RE in workspace/evaluation-plane/checks/check.py. Column 1 of its own line —
# policy-plane/GUARDRAILS.md §9 rule 9 fixes this as the one accepted format.
CONFIRMED_LINE_RE = re.compile(r"^Confirmed: 20\d\d-\d\d-\d\d", re.M)

# Where a standalone consumer's specs live — D1 of the licensing spec: a dot-prefixed,
# plugin-named folder at the consumer's own project root, unambiguously owned by this plugin
# and assuming nothing about the consumer's own layout.
SPEC_DIR = Path(".agent-builder/specs")


def _read(p):
    try:
        return open(p, encoding="utf-8").read()
    except OSError:
        return None


def check_confirmed(arg):
    p = Path(arg)
    looks_like_name = "/" not in arg and "\\" not in arg
    if not p.is_file():
        if not looks_like_name:
            print(f"FAIL · no spec file at `{arg}`")
            return 1
        matches = sorted(SPEC_DIR.glob(f"*-spec-{arg}.*"))
        if len(matches) == 1:
            p = matches[0]
        elif len(matches) > 1:
            print(f"FAIL · more than one spec matches `{arg}`: "
                  + ", ".join(str(m) for m in matches))
            return 1
        else:
            print(f"FAIL · no spec file at `{arg}` and no "
                  f"{SPEC_DIR}/*-spec-{arg}.* on disk")
            return 1
    text = _read(str(p))
    if text is None:
        print(f"FAIL · cannot read {p}")
        return 1
    if CONFIRMED_LINE_RE.search(text):
        print(f"PASS · {p} carries a Confirmed: line")
        return 0
    print(f"FAIL · {p} carries no Confirmed: line")
    return 1


def main():
    if len(sys.argv) != 2:
        print("usage: python3 check-confirmed.py <spec-file-or-capability-name>")
        return 1
    return check_confirmed(sys.argv[1])


if __name__ == "__main__":
    sys.exit(main())
