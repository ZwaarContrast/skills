#!/usr/bin/env python3
"""Build references/RULES.tsv (id, file, start, end, topic, text, check) and check the rulebook.

Usage: python3 index.py [--check | --selftest]
"""
import pathlib
import re
import sys
import tempfile

SKILL = pathlib.Path(__file__).resolve().parent
PREFIX = {"a11y.md": "A11Y", "agents.md": "AGENT", "android.md": "AND", "apple.md": "IOS",
          "content.md": "TEXT", "desktop.md": "DESK", "laws.md": "LAW", "touch.md": "TOUCH",
          "visual.md": "VIS", "web.md": "WEB"}
RULE = re.compile(r"^- \*\*([A-Z0-9]+)-(\d+)\*\* (.*)")
NEAR = re.compile(r"^\s*[-*+]\s*\*\*\s*[A-Za-z0-9]+-\d+")   # catches near-miss bullets RULE skips
REF = re.compile(r"\b(" + "|".join(sorted(PREFIX.values(), key=len, reverse=True)) + r")-(\d+)\b")
CITE = re.compile(r"\[(\d+(?:\s*,\s*\d+)*)\]")


def cites(text):
    return {int(n) for g in CITE.findall(text) for n in re.split(r"\s*,\s*", g)}


def parse(path):
    lines = path.read_text(encoding="utf-8").split("\n")
    rows, errors, topic, cur = [], [], "", None
    want = PREFIX.get(path.name)
    if want is None:
        errors.append(f"{path.name}: no ID prefix registered for this file in index.py PREFIX")
    src_at = next((i for i, l in enumerate(lines) if l.strip() == "## Sources"), None)
    if src_at is None:
        errors.append(f"{path.name}: no '## Sources' section")
        src_at = len(lines)
    sources = {int(m.group(1)) for l in lines[src_at:] if (m := re.match(r"^\[(\d+)\]", l))}

    def close(end):
        if cur:
            text = " ".join(l.strip() for l in lines[cur["start"] - 1:end])
            if not re.search(r"(^|\s)Check: \S", text):
                errors.append(f"{path.name}:{cur['start']} {cur['id']} has no Check line")
            cur["end"] = end
            cur["cites"] = cites(text)
            body = RULE.match(text).group(3)
            body, check = (re.split(r"(?:^|\s)Check:", body, maxsplit=1) + [""])[:2]
            cur["text"] = re.sub(r"\s+", " ", CITE.sub("", body)).strip()
            cur["check"] = re.sub(r"\s+", " ", CITE.sub("", check)).strip()
            rows.append(cur)

    for i, line in enumerate(lines[:src_at], 1):
        if line.startswith("## "):
            close(i - 1); cur = None
            topic = line[3:].strip()
        elif m := RULE.match(line):
            close(i - 1)
            if m.group(1) != want:
                errors.append(f"{path.name}:{i} {m.group(1)}-{m.group(2)}: prefix must be {want}")
            cur = {"id": f"{m.group(1)}-{m.group(2)}", "prefix": m.group(1), "n": int(m.group(2)),
                   "file": path.name, "start": i, "topic": topic}
        elif NEAR.match(line):
            close(i - 1); cur = None
            errors.append(f"{path.name}:{i} malformed rule line (write '- **PREFIX-n** text'): {line.strip()[:60]}")
        elif cur and not line.strip():
            nxt = next((l for l in lines[i:src_at] if l.strip()), "")
            if nxt.startswith((" ", "\t")):   # indented text after a blank = rule split in two
                errors.append(f"{path.name}:{i} blank line inside {cur['id']}; a rule is one block")
            close(i - 1); cur = None
        elif cur and not line.startswith((" ", "\t")):
            errors.append(f"{path.name}:{i} line after {cur['id']} is not indented; indent continuations, "
                          "or leave a blank line before prose")
            close(i - 1); cur = None
    close(src_at)

    ns = [r["n"] for r in rows]
    if ns != list(range(1, len(ns) + 1)):
        errors.append(f"{path.name}: rule numbers not 1..{len(ns)} in order")
    body = "\n".join(lines[:src_at])   # Measure prose cites sources too
    cited = cites(body)
    if cited - sources:
        errors.append(f"{path.name}: cites missing sources {sorted(cited - sources)}")
    if sources - cited:
        errors.append(f"{path.name}: sources never cited {sorted(sources - cited)}")
    for r in rows:
        if not r["cites"]:
            errors.append(f"{path.name}:{r['start']} {r['id']} cites no source")
    return rows, errors


def build(skill):
    refs = skill / "references"
    rows, errors = [], []
    for path in sorted(p for p in refs.glob("*.md") if p.name != "NOTICE.md"):
        r, e = parse(path)
        rows += r; errors += e
    seen = {}
    for r in rows:
        if r["id"] in seen:
            errors.append(f"{r['id']} defined in {seen[r['id']]} and {r['file']}")
        seen[r["id"]] = r["file"]
    for path in sorted(refs.glob("*.md")) + [p for p in [skill / "SKILL.md"] if p.exists()]:
        for i, line in enumerate(path.read_text(encoding="utf-8").split("\n"), 1):
            for m in REF.finditer(line):
                if m.group(0) not in seen:
                    errors.append(f"{path.name}:{i} refers to {m.group(0)}, which does not exist")
    tsv = "id\tfile\tstart\tend\ttopic\ttext\tcheck\n" + "".join(
        f"{r['id']}\t{r['file']}\t{r['start']}\t{r['end']}\t{r['topic']}\t{r['text'].replace(chr(9), ' ')}"
        f"\t{r['check'].replace(chr(9), ' ')}\n"
        for r in rows)
    return rows, errors, tsv


def selftest():
    good = ("# T\n\n## Topic\n\n- **LAW-1** First rule.\n  Check: axe `target-size`. [1]\n"
            "- **LAW-2** Second rule, see LAW-1.\n  Check: look again. [1]\n\n## Sources\n\n[1] S\n")
    cases = {
        "clean": (good, None),
        "check grepable": (good, "TSV"),
        "colon after ID": (good.replace("**LAW-2**", "**LAW-2:**"), "malformed rule line"),
        "star bullet": (good.replace("- **LAW-2**", "* **LAW-2**"), "malformed rule line"),
        "two spaces": (good.replace("- **LAW-2**", "-  **LAW-2**"), "malformed rule line"),
        "wrong prefix": (good.replace("LAW-2", "WEB-2").replace("see WEB-2", "see LAW-1"), "prefix must be LAW"),
        "no Check": (good.replace("  Check: look again.", "  look again."), "has no Check line"),
        "blank inside": (good.replace("[1]\n- **LAW-2**", "[1]\n\n  - Example.\n- **LAW-2**"),
                         "blank line inside LAW-1"),
        "unindented wrap": (good.replace("  Check: look again.", "Check: look again."), "is not indented"),
        "dangling ref": (good.replace("see LAW-1", "see LAW-99"), "refers to LAW-99"),
    }
    failed = 0
    for name, (text, want) in cases.items():
        with tempfile.TemporaryDirectory() as d:
            (pathlib.Path(d) / "references").mkdir()
            (pathlib.Path(d) / "references" / "laws.md").write_text(text, encoding="utf-8")
            rows, errors, tsv = build(pathlib.Path(d))
        if want == "TSV":   # an axe id that appears only in a Check line must be in its row
            hit = [l for l in tsv.splitlines() if "target-size" in l]
            cols = hit[0].split("\t") if len(hit) == 1 else []
            ok = cols[6:] == ["axe `target-size`."] and "target-size" not in cols[5]
        else:
            ok = (not errors and len(rows) == 2) if want is None else any(want in e for e in errors)
        print(f"{'ok  ' if ok else 'FAIL'} {name}: {errors or f'{len(rows)} rules'}")
        failed += not ok
    print(f"selftest: {len(cases) - failed}/{len(cases)} passed")
    sys.exit(1 if failed else 0)


def main():
    if "--selftest" in sys.argv:
        selftest()
    rows, errors, tsv = build(SKILL)
    out = SKILL / "references" / "RULES.tsv"
    if "--check" in sys.argv:
        if not out.exists() or out.read_text(encoding="utf-8") != tsv:
            errors.append("RULES.tsv is stale: run python3 index.py")
    else:
        out.write_text(tsv, encoding="utf-8")
    for e in errors:
        print(e, file=sys.stderr)
    print(f"{len(rows)} rules in {len({r['file'] for r in rows})} files, {len(errors)} problems")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
