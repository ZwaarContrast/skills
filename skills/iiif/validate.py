#!/usr/bin/env python3
"""Check a IIIF document against its specification.

    python3 validate.py https://example.org/iiif/book1/manifest
    python3 validate.py manifest.json info.json
    python3 validate.py --local manifest.json     # no network, no document sent

Two passes. The local pass applies the rules this skill can check without help:
required properties per resource type (Presentation 3.0 appendix A), the shape
of a language map, and the Image API's info.json table. The remote pass hands
the document to iiif.io's own validator, which is the authority — it runs the
full JSON Schema and is maintained alongside the spec.

Passing a URL is the better test of an endpoint: the validator fetches it
itself, so a manifest that is correct on disk but served with the wrong
content-type or an unreachable id still fails.

Sending a document to the hosted validator publishes it to a third party.
Use --local for anything unpublished.
"""
import argparse, json, os, sys, urllib.error, urllib.parse, urllib.request

PREZ_VALIDATOR = "https://presentation-validator.iiif.io/validate"
IMAGE_VALIDATOR = "https://image-validator.iiif.io/"

# Presentation 3.0, appendix A. `docs/api/presentation/3.0.md`, section
# "A. Summary of Property Requirements", holds the full matrix including
# RECOMMENDED and NOT ALLOWED; these are only the hard requirements.
REQUIRED = {
    "Collection": ["id", "type", "label", "items"],
    "Manifest": ["id", "type", "label", "items"],
    "Canvas": ["id", "type"],
    "Range": ["id", "type"],
    "AnnotationPage": ["id", "type"],
    "Annotation": ["id", "type", "motivation", "target"],
    "AnnotationCollection": ["id", "type"],
}
LANG_MAP = ["label", "summary"]
INFO_REQUIRED = ["@context", "id", "type", "protocol", "profile", "width", "height"]
CHILDREN = {"items", "structures", "annotations", "body", "start",
            "placeholderCanvas", "accompanyingCanvas"}


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
    if doc.get("type") in REQUIRED or doc.get("@type"):
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
    """The requirements a document must meet whatever else it does."""
    out = []
    if prez_version(doc) != "3":
        return [f"note: local rules cover Presentation 3.0; this is {prez_version(doc)}.x "
                f"— see docs/api/presentation/{prez_version(doc)}.0.md"]
    for path, res in walk(doc):
        t = res.get("type")
        for prop in REQUIRED.get(t, []):
            if prop not in res:
                out.append(f"{path} ({t}): missing required property `{prop}`")
        for prop in LANG_MAP:
            v = res.get(prop)
            if v is None:
                continue
            if not (isinstance(v, dict) and v and all(
                    isinstance(vals, list) and all(isinstance(s, str) for s in vals)
                    for vals in v.values())):
                out.append(f"{path} ({t}): `{prop}` must be a language map "
                           f"— {{\"en\": [\"...\"]}}, or \"none\" as the language")
        if t == "Canvas" and not (("height" in res and "width" in res) or "duration" in res):
            out.append(f"{path} (Canvas): needs height and width, or duration, or both")
    return out


def check_info(doc):
    out = [f"$: missing required property `{p}`" for p in INFO_REQUIRED if p not in doc]
    if doc.get("type") not in (None, "ImageService3"):
        out.append(f"$: `type` must be \"ImageService3\", not {doc['type']!r}")
    if doc.get("profile") not in (None, "level0", "level1", "level2"):
        out.append(f"$: `profile` must be level0, level1 or level2, not {doc['profile']!r}")
    return out


def hosted(doc, url):
    """iiif.io's validator — the authority on whether this is a valid document."""
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
    except urllib.error.URLError as e:
        return [f"note: could not reach {PREZ_VALIDATOR} ({e}); local rules only"]
    if res.get("okay"):
        return ["ok: iiif.io validator reports no errors"] + \
               [f"warning: {w}" for w in res.get("warnings", [])]
    out = [f"error: {res['error']}"] if res.get("error") else []
    for e in res.get("errorList", []):
        out.append("error: " + " ".join(str(e.get(k, "")) for k in ("title", "detail")).strip())
    return out or ["error: iiif.io validator rejected the document"]


def validate(src, local_only):
    doc, url = load(src)
    k = kind(doc)
    if k == "presentation":
        found = check_prez(doc)
        if not local_only:
            found += hosted(doc, url)
    elif k == "image-info":
        found = check_info(doc) or ["ok: info.json has every required property"]
        if not local_only and url:
            found.append(f"note: for a full compliance run against the live service, see "
                         f"{IMAGE_VALIDATOR}list_tests and docs/api/image/validator.md")
    else:
        # ponytail: no validator service exists for Auth, Search, Discovery or
        # Content State — read the spec section instead of guessing.
        found = ["note: not a Presentation or Image API document; "
                 "check it against its spec in docs/api/ by hand"]
    return k, found


def self_test():
    bad = {"@context": "http://iiif.io/api/presentation/3/context.json",
           "id": "https://x/m", "type": "Manifest", "label": "Not a language map",
           "items": [{"id": "https://x/c1", "type": "Canvas"}]}
    found = check_prez(bad)
    assert any("`label` must be a language map" in f for f in found), found
    assert any("Canvas): needs height and width" in f for f in found), found

    good = {"@context": "http://iiif.io/api/presentation/3/context.json",
            "id": "https://x/m", "type": "Manifest", "label": {"en": ["A"]},
            "items": [{"id": "https://x/c1", "type": "Canvas", "height": 1, "width": 1}]}
    assert check_prez(good) == [], check_prez(good)
    assert kind(good) == "presentation"

    info = {"@context": "http://iiif.io/api/image/3/context.json", "id": "https://x/i",
            "type": "ImageService3", "protocol": "http://iiif.io/api/image",
            "profile": "level9", "width": 1}
    assert kind(info) == "image-info"
    found = check_info(info)
    assert any("`height`" in f for f in found) and any("level9" in f for f in found), found
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

    failed = False
    for src in args.target:
        k, found = validate(src, args.local)
        print(f"\n{src}  [{k}]")
        for f in found:
            print(f"  {f}")
        failed |= any(f.startswith(("error", "$", "$.")) or "missing required" in f
                      or "must be" in f or "needs height" in f for f in found)
    sys.exit(1 if failed else 0)
