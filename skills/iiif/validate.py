#!/usr/bin/env python3
"""Check a IIIF document against its specification.

    python3 validate.py https://example.org/iiif/book1/manifest
    python3 validate.py manifest.json info.json
    python3 validate.py --local manifest.json     # no network, no document sent

Two passes. The local pass applies docs/REQUIREMENTS.tsv, which refresh.py reads
straight out of Presentation 3.0 appendix A, plus the shape of a language map and
the Image API's info.json table. The remote pass hands the document to iiif.io's
own validator, which is the authority — it runs the full JSON Schema and is
maintained alongside the spec.

Both passes always say what they checked. A local-only run reports that it was
local-only, and an unreachable validator is a failure rather than a pass, so a
clean exit never means "the network was down". Exit status: 0 checked and clean,
1 errors found, 2 no rule in this skill applied.

Passing a URL is the better test of an endpoint: the validator fetches it
itself, so a manifest that is correct on disk but served with the wrong
content-type or an unreachable id still fails.

Sending a document to the hosted validator publishes it to a third party.
Use --local for anything unpublished.
"""
import argparse, json, os, sys, urllib.error, urllib.parse, urllib.request

PREZ_VALIDATOR = "https://presentation-validator.iiif.io/validate"
IMAGE_VALIDATOR = "https://image-validator.iiif.io/"

DOCS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "docs")

# The resource types whose rules are safe to apply by `type` alone. A reference
# stub (partOf, seeAlso) and the polymorphic wrappers (SpecificResource, Choice)
# are deliberately absent: they legitimately carry almost nothing.
CHECKED = ["Collection", "Manifest", "Canvas", "Range",
           "Annotation", "AnnotationPage", "AnnotationCollection"]
LANG_MAP = ["label", "summary"]
INFO_REQUIRED = ["@context", "id", "type", "protocol", "profile", "width", "height"]
CHILDREN = {"items", "structures", "annotations", "body", "start",
            "placeholderCanvas", "accompanyingCanvas"}


def rules():
    """{type: {property: requirement}} from docs/REQUIREMENTS.tsv."""
    path = os.path.join(DOCS, "REQUIREMENTS.tsv")
    if not os.path.exists(path):
        return {}
    out = {}
    for line in open(path, encoding="utf-8").read().splitlines()[1:]:
        t, prop, level = line.split("\t")
        out.setdefault(t, {})[prop] = level
    return out


def load(src):
    """(document, url-or-None). A URL is kept so the validator can fetch it too."""
    if src.startswith(("http://", "https://")):
        req = urllib.request.Request(src, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8")), src
    with open(src, encoding="utf-8") as f:
        return json.load(f), None


def prez_version(doc):
    ctx = doc.get("@context", "")
    ctx = " ".join(ctx) if isinstance(ctx, list) else str(ctx)
    return next((v for v in ("4", "3", "2") if f"/presentation/{v}/" in ctx), "3")


def kind(doc):
    if str(doc.get("protocol", "")).startswith("http://iiif.io/api/image") \
            or str(doc.get("type", "")).startswith("ImageService"):
        return "image-info"
    if doc.get("type") in CHECKED or doc.get("@type"):
        return "presentation"
    return "unknown"


def walk(doc, path="$"):
    """Every typed resource in the tree, with the JSON path that reaches it."""
    if isinstance(doc, dict):
        if "type" in doc:
            yield path, doc
        for k, v in doc.items():
            if k in CHILDREN:
                yield from walk(v, f"{path}.{k}")
    elif isinstance(doc, list):
        for i, v in enumerate(doc):
            yield from walk(v, f"{path}[{i}]")


def check_prez(doc):
    """Every rule in appendix A that a single document can be held to."""
    version = prez_version(doc)
    if version != "3":
        held = {"2": "2.1", "4": "4.0"}.get(version)
        where = f"docs/api/presentation/{held}.md" if held else "docs/api/presentation/"
        return None, [f"local rules cover Presentation 3.0; this document is {version}.x "
                      f"— read {where} and check it by hand"]

    spec = rules()
    if not spec:
        return ["error: docs/REQUIREMENTS.tsv is missing — run `python3 refresh.py`"], []

    errors, warnings = [], []
    for path, res in walk(doc):
        t = res.get("type")
        if t not in CHECKED:
            continue
        for prop, level in spec.get(t, {}).items():
            if prop.startswith("behavior:"):
                if level == "NOT ALLOWED" and prop[9:] in as_list(res.get("behavior")):
                    errors.append(f"{path} ({t}): behavior `{prop[9:]}` is not allowed on {t}")
            elif level == "REQUIRED" and prop not in res:
                errors.append(f"{path} ({t}): missing required property `{prop}`")
            elif level == "NOT ALLOWED" and prop in res:
                errors.append(f"{path} ({t}): `{prop}` is not allowed on {t}")
            elif level == "RECOMMENDED" and prop not in res:
                warnings.append(f"{path} ({t}): no `{prop}` — recommended, and viewers use it")
        for prop in LANG_MAP:
            v = res.get(prop)
            if v is not None and not is_lang_map(v):
                errors.append(f"{path} ({t}): `{prop}` must be a language map "
                              f"— {{\"en\": [\"...\"]}}, or \"none\" as the language")
        # Presentation 3.0 section 5.6: the Canvas URI *must* be repeated in
        # `target`. Appendix A does not tabulate it, so it is stated here.
        if t == "Annotation" and "target" not in res:
            errors.append(f"{path} (Annotation): missing required property `target`")
        # Presentation 3.0 section 3.2 `id`: an HTTP(S) URI, not a bare string.
        # Appendix A only says the property must be present.
        if not str(res.get("id", "http")).startswith(("http://", "https://")):
            errors.append(f"{path} ({t}): `id` must be an http(s) URI, not {res['id']!r}")
        if t == "Canvas" and not (("height" in res and "width" in res) or "duration" in res):
            errors.append(f"{path} (Canvas): needs height and width, or duration, or both")
    return errors, warnings


def as_list(v):
    return v if isinstance(v, list) else [] if v is None else [v]


def is_lang_map(v):
    return isinstance(v, dict) and bool(v) and all(
        isinstance(vals, list) and all(isinstance(s, str) for s in vals) for vals in v.values())


def check_info(doc):
    errors = [f"$: missing required property `{k}`" for k in INFO_REQUIRED if k not in doc]
    if doc.get("type") not in (None, "ImageService3"):
        errors.append(f"$: `type` must be \"ImageService3\", not {doc['type']!r}")
    if doc.get("profile") not in (None, "level0", "level1", "level2"):
        errors.append(f"$: `profile` must be level0, level1 or level2, not {doc['profile']!r}")
    return errors, []


def hosted(doc, url):
    """iiif.io's validator — the authority on whether this is a valid document.

    Unreachable counts as an error: a clean exit has to mean the document was
    checked, never that the network was down.
    """
    version = prez_version(doc) + ".0"
    try:
        if url:
            q = urllib.parse.urlencode({"url": url, "version": version})
            with urllib.request.urlopen(f"{PREZ_VALIDATOR}?{q}", timeout=60) as r:
                res = json.loads(r.read())
        else:
            req = urllib.request.Request(
                f"{PREZ_VALIDATOR}?version={version}",
                data=json.dumps(doc).encode(), headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=60) as r:
                res = json.loads(r.read())
    except (urllib.error.URLError, OSError, ValueError) as e:
        return [f"could not reach {PREZ_VALIDATOR} ({e}) — nothing here is confirmed; "
                f"fix the connection, or re-run with --local to accept local rules only"], []
    if res.get("okay"):
        return [], [f"iiif.io validator: {w}" for w in res.get("warnings", [])]
    errors = [res["error"]] if res.get("error") else []
    for e in res.get("errorList", []):
        errors.append("iiif.io validator: " + " ".join(
            str(e.get(k, "")) for k in ("title", "detail")).strip())
    return errors or ["iiif.io validator rejected the document"], []


def validate(src, local_only):
    """(kind, errors, warnings, what-was-checked, nothing-was-checked)."""
    doc, url = load(src)
    k = kind(doc)
    checked, unchecked = [], False
    if k == "presentation":
        errors, warnings = check_prez(doc)
        if errors is None:                            # a version the rules do not cover
            errors, unchecked = [], True
            checked.append("nothing locally — see the note below")
        else:
            checked.append(f"local rules from docs/REQUIREMENTS.tsv ({len(rules())} types)")
        if local_only:
            checked.append("iiif.io validator SKIPPED (--local): no JSON Schema check ran")
        else:
            e, w = hosted(doc, url)
            errors += e
            warnings += w
            checked.append("iiif.io validator" + (" against the live URL" if url else " (document posted)"))
    elif k == "image-info":
        errors, warnings = check_info(doc)
        checked.append("Image API 3.0 info.json required properties")
        if not local_only and url:
            checked.append(f"for a full compliance run against the live service see "
                           f"{IMAGE_VALIDATOR}list_tests and docs/api/image/validator.md")
    else:
        # ponytail: no validator service exists for Auth, Search, Discovery or
        # Content State — read the spec section instead of guessing.
        return k, [], [], ["nothing: not a Presentation or Image API document — "
                           "check it against its spec in docs/api/ by hand"], True
    return k, errors, warnings, checked, unchecked


def self_test():
    assert os.path.exists(os.path.join(DOCS, "REQUIREMENTS.tsv")), "run refresh.py first"
    spec = rules()
    assert spec["Range"]["items"] == "REQUIRED", "appendix A says Range requires items"
    assert "motivation" not in spec["Annotation"], "appendix A does not require motivation"
    assert spec["Canvas"]["behavior:paged"] == "NOT ALLOWED"

    def prez(**kw):
        return dict({"@context": "http://iiif.io/api/presentation/3/context.json",
                     "id": "https://x/m", "type": "Manifest", "label": {"en": ["A"]},
                     "items": [{"id": "https://x/c1", "type": "Canvas",
                                "height": 1, "width": 1}]}, **kw)

    assert check_prez(prez())[0] == [], check_prez(prez())[0]

    e, _ = check_prez(prez(label="not a language map"))
    assert any("must be a language map" in x for x in e), e

    e, _ = check_prez(prez(structures=[{"id": "https://x/r", "type": "Range"}]))
    assert any("Range): missing required property `items`" in x for x in e), e

    e, _ = check_prez(prez(items=[{"id": "https://x/c", "type": "Canvas",
                                   "height": 1, "width": 1, "behavior": ["paged"]}]))
    assert any("behavior `paged` is not allowed on Canvas" in x for x in e), e

    e, _ = check_prez(prez(items=[{"id": "https://x/c", "type": "Canvas"}]))
    assert any("needs height and width" in x for x in e), e

    anno = {"id": "https://x/a", "type": "Annotation", "body": {"id": "https://x/i", "type": "Image"}}
    e, _ = check_prez(prez(items=[{"id": "https://x/c", "type": "Canvas", "height": 1, "width": 1,
                                   "items": [{"id": "https://x/p", "type": "AnnotationPage",
                                              "items": [anno]}]}]))
    assert any("missing required property `target`" in x for x in e), e
    assert not any("motivation" in x for x in e), e

    _, w = check_prez(prez())
    assert any("`thumbnail`" in x for x in w), w

    info = {"@context": "http://iiif.io/api/image/3/context.json", "id": "https://x/i",
            "type": "ImageService3", "protocol": "http://iiif.io/api/image",
            "profile": "level9", "width": 1}
    assert kind(info) == "image-info"
    e, _ = check_info(info)
    assert any("`height`" in x for x in e) and any("level9" in x for x in e), e

    v2 = {"@context": "http://iiif.io/api/presentation/2/context.json",
          "@id": "https://x/m", "@type": "sc:Manifest"}
    errors, notes = check_prez(v2)
    assert errors is None, "a version the rules do not cover reports no verdict"
    assert os.path.exists(os.path.join(DOCS, "api/presentation/2.1.md"))
    assert any("2.1.md" in n for n in notes), notes
    print("self-test ok")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("target", nargs="*", help="path or URL of a IIIF document")
    ap.add_argument("--local", action="store_true",
                    help="skip the hosted validator; send nothing off this machine")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        self_test()
        sys.exit()
    if not args.target:
        ap.error("give at least one path or URL")

    failed = unchecked_any = False
    for src in args.target:
        k, errors, warnings, checked, unchecked = validate(src, args.local)
        print(f"\n{src}  [{k}]")
        for c in checked:
            print(f"  checked: {c}")
        for e in errors:
            print(f"  ERROR    {e}")
        for w in warnings:
            print(f"  warning  {w}")
        if errors:
            pass
        elif unchecked:
            print("  UNCHECKED no rule in this skill applies — read the spec named above")
        else:
            print(f"  PASS     no errors from the checks above"
                  + (" — local rules only" if args.local and k == "presentation" else ""))
        failed |= bool(errors)
        unchecked_any |= unchecked and not errors
    # 0 checked and clean, 1 errors found, 2 no rule applied — so a caller
    # cannot mistake "nothing was checked" for "nothing was wrong"
    sys.exit(1 if failed else 2 if unchecked_any else 0)
