#!/usr/bin/env python3
"""Standalone-mode spec check: does a usable spec exist for this capability?

    python3 check-spec.py <spec-file-or-capability-name>

Exit 0 and a `PASS` line mean the named spec was found under `.agent-builder/specs/` in the
consumer's own project root (a `<YYYY-MM-DD>-spec-<name>.*` file, date first) and carries the
closing marker that means it is finished rather than a half-written draft.

Exit 1 means no spec was found, or the one found is still open. Neither answer waits on a
human: `create-capability`'s standalone branch writes the missing spec from the matching
template and then builds what it specifies.

This script ships inside the plugin and imports nothing beyond the standard library, so it runs
in any consumer project with no install step.
"""

import sys
from pathlib import Path

# A finished spec ends with this marker. A spec still being drafted does not have it yet.
END_MARKER = "End of spec."

# Where a standalone consumer's specs live: a dot-prefixed, plugin-named folder at the
# consumer's own project root, unambiguously owned by this plugin and assuming nothing about
# the consumer's own layout.
SPEC_DIR = Path(".agent-builder/specs")


def _read(p):
    try:
        return open(p, encoding="utf-8").read()
    except OSError:
        return None


def check_spec(arg):
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
    if END_MARKER in text:
        print(f"PASS · {p} is a finished spec")
        return 0
    print(f"FAIL · {p} is still open — it does not end with `{END_MARKER}`")
    return 1


def main():
    if len(sys.argv) != 2:
        print("usage: python3 check-spec.py <spec-file-or-capability-name>")
        return 1
    return check_spec(sys.argv[1])


if __name__ == "__main__":
    sys.exit(main())
