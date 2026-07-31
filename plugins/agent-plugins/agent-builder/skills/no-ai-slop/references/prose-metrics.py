#!/usr/bin/env python3
"""Measure sentence and paragraph length in a draft.

The length rules in SKILL.md are numbers, so they are checkable. This prints the
numbers. It does not judge voice, and it cannot: a draft can pass every count
here and still read like a machine wrote it.

    python3 prose-metrics.py FILE [FILE ...]

Reads .md, .html and plain text. Skips code, style, script and pre blocks,
fenced code, table rows and headings, because none of those are prose the rules
apply to. Exit 1 if any file breaks a hard limit.
"""

import html
import re
import statistics
import sys

HARD_SENTENCE_WORDS = 45
TARGET_MEDIAN = 20
TARGET_P90 = 40
PARA_SENTENCES = 4
PARA_WORDS = 100

_TAGGED_BLOCK = re.compile(
    r"<(style|script|pre|code)\b[^>]*>.*?</\1>", re.S | re.I
)
_TAG = re.compile(r"<[^>]+>")
# A list item, a table cell and a heading each end a unit of prose. Without this
# the tag stripper glues a whole table row into one 120-word "sentence" and the
# report is nonsense.
_BLOCK_END = re.compile(
    r"</?(p|li|td|th|tr|div|h[1-6]|section|blockquote|figcaption|br)\b[^>]*>",
    re.I,
)
_LIST_ITEM = re.compile(r"^[ \t]*(?:[-*+]|\d+\.)[ \t]+", re.M)
_FENCE = re.compile(r"```.*?```", re.S)
_INLINE_CODE = re.compile(r"`[^`\n]*`")
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])[\s ]+(?=[A-ZÀ-ỹ\"“(])")


def strip_non_prose(text, is_html):
    if is_html:
        text = _TAGGED_BLOCK.sub(" ", text)
        text = _BLOCK_END.sub("\n\n", text)
        text = _TAG.sub(" ", text)
        text = html.unescape(text)
    else:
        text = _FENCE.sub(" ", text)
        # Each list item stands alone, the way a reader meets it.
        text = _LIST_ITEM.sub("\n\n", text)
    text = _INLINE_CODE.sub("x", text)
    return text


def paragraphs(text):
    for block in re.split(r"\n[ \t]*\n", text):
        block = block.strip()
        if not block:
            continue
        if block.startswith("#") or block.startswith("|"):
            continue
        yield re.sub(r"\s+", " ", block)


def is_enumeration(sentence):
    """An enumerated list of terms is exempt, and this is how it is spotted.

    "Banned outright: delve, foster, leverage, ..." is a list wearing a full
    stop. One comma per four words or denser is the tell.
    """
    words = len(sentence.split())
    return words >= 12 and sentence.count(",") * 4 >= words


def sentences(paragraph):
    return [
        s.strip()
        for s in _SENTENCE_SPLIT.split(paragraph)
        if len(s.split()) > 2 and not is_enumeration(s)
    ]


def measure(path):
    with open(path, encoding="utf-8") as fh:
        raw = fh.read()
    text = strip_non_prose(raw, path.endswith((".html", ".htm")))

    lengths, long_ones, fat_paras = [], [], []
    for para in paragraphs(text):
        sents = sentences(para)
        if not sents:
            continue
        for s in sents:
            n = len(s.split())
            lengths.append(n)
            if n > HARD_SENTENCE_WORDS:
                long_ones.append((n, s))
        words = len(para.split())
        if len(sents) > PARA_SENTENCES or words > PARA_WORDS:
            fat_paras.append((len(sents), words, para[:90]))

    if not lengths:
        print(f"{path}\n  no prose found")
        return True

    lengths.sort()
    n = len(lengths)
    median = lengths[n // 2]
    p90 = lengths[min(n - 1, int(n * 0.9))]
    over40 = sum(1 for x in lengths if x > TARGET_P90)

    ok = median <= TARGET_MEDIAN and p90 <= TARGET_P90 and not long_ones
    print(f"{path}")
    print(
        f"  sentences={n}  median={median}  p90={p90}  max={lengths[-1]}"
        f"  mean={statistics.mean(lengths):.1f}"
    )
    print(f"  over {TARGET_P90}w: {over40} ({100 * over40 / n:.0f}%)")
    print(
        f"  median<={TARGET_MEDIAN}: {'ok' if median <= TARGET_MEDIAN else 'FAIL'}"
        f"   p90<={TARGET_P90}: {'ok' if p90 <= TARGET_P90 else 'FAIL'}"
        f"   none over {HARD_SENTENCE_WORDS}w: {'ok' if not long_ones else 'FAIL'}"
    )
    for count, words, head in fat_paras[:5]:
        print(f"  fat paragraph ({count} sentences, {words} words): {head}...")
    for count, sent in sorted(long_ones, reverse=True)[:5]:
        print(f"  {count}w: {sent[:110]}...")
    return ok


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    return 0 if all([measure(p) for p in argv]) else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
