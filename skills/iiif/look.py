#!/usr/bin/env python3
"""Find a section in docs/ and print it, without reading the whole spec.

    python3 look.py behavior              # where is it defined?
    python3 look.py behavior --read       # print those sections
    python3 look.py language --file presentation/3.0

Searches the heading column of docs/SECTIONS.tsv. A property, a resource type
and a registry term are all headings, so most lookups are one call.

The term is matched literally, so `^max` and `w,h` find themselves rather than
being read as a regex. Pass --regex when you want one.
"""
import argparse, os, re, sys

DOCS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "docs")


def sections():
    with open(os.path.join(DOCS, "SECTIONS.tsv"), encoding="utf-8") as f:
        for line in f.read().splitlines()[1:]:
            path, start, end, depth, heading = line.split("\t")
            yield path, int(start), int(end), int(depth), heading


BIG = 200


def find(term, file_filter=None, as_regex=False):
    """Exact heading matches first — `behavior` should not be buried under
    `Values for behavior`."""
    pat = re.compile(term if as_regex else re.escape(term), re.I)
    exact, loose = [], []
    for row in sections():
        if file_filter and file_filter not in row[0]:
            continue
        if pat.search(row[4]):
            (exact if row[4].lower() == term.lower() else loose).append(row)
    return exact + loose


def body(path, start, end):
    with open(os.path.join(DOCS, path), encoding="utf-8") as f:
        return "\n".join(f.read().splitlines()[start - 1:end])


def self_test():
    assert os.path.exists(os.path.join(DOCS, "SECTIONS.tsv")), "run refresh.py first"
    hits = find("behavior", "presentation/3.0")
    assert hits and hits[0][4] == "behavior", hits[:3]
    text = body(*hits[0][:3])
    assert text.startswith("##### behavior") and "auto-advance" in text, text[:200]
    assert find("zzzznope") == []
    print("self-test ok")


def subsections(path, start, end):
    return [r for r in sections()
            if r[0] == path and start < r[1] <= end]


def self_test():
    assert os.path.exists(os.path.join(DOCS, "SECTIONS.tsv")), "run refresh.py first"
    hits = find("behavior", "presentation/3.0")
    assert hits and hits[0][4] == "behavior", hits[:3]
    text = body(*hits[0][:3])
    assert text.startswith("##### behavior") and "auto-advance" in text, text[:200]
    assert find("zzzznope") == []
    # a term full of regex metacharacters is a term, not a pattern
    assert find("C++") == [], "literal by default"
    assert find("C++", as_regex=True) != [], "--regex still available"
    print("self-test ok")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("term", nargs="?", help="heading to look for (literal text)")
    ap.add_argument("--file", help="only sections in paths containing this")
    ap.add_argument("--read", action="store_true", help="print the sections, not just their locations")
    ap.add_argument("--regex", action="store_true", help="treat the term as a regular expression")
    ap.add_argument("--all", action="store_true",
                    help=f"print sections over {BIG} lines in full instead of listing their parts")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        self_test()
        sys.exit()
    if not args.term:
        ap.error("give a heading to look for")

    hits = find(args.term, args.file, args.regex)
    if not hits:
        elsewhere = find(args.term, None, args.regex) if args.file else []
        if elsewhere:
            print(f"{args.term!r} matches {len(elsewhere)} headings, none under {args.file!r}:")
            for path, start, end, _, heading in elsewhere[:10]:
                print(f"  {path}:{start}-{end}  {heading}")
        else:
            print(f"no heading matches {args.term!r}; grep the file that owns the term instead")
        sys.exit(1)

    for path, start, end, _, heading in hits:
        size = end - start + 1
        print(f"\n=== {path}:{start}-{end}  ({size} lines)  {heading}")
        if not args.read:
            continue
        parts = subsections(path, start, end)
        if size > BIG and parts and not args.all:
            # dumping 500 lines is the thing this skill exists to avoid
            print(f"    {size} lines — pick a part, or pass --all:")
            for p2, s2, e2, _, h2 in parts:
                print(f"    {p2}:{s2}-{e2}  ({e2 - s2 + 1} lines)  {h2}")
        else:
            print(body(path, start, end))
