#!/usr/bin/env python3
"""Ask a published IIIF document to keep the promises it makes.

    python3 follow.py https://example.org/iiif/manifest
    python3 follow.py https://example.org/iiif/collection --reachable
    python3 follow.py https://example.org/iiif/manifest --expect-restricted

`validate.py` asks whether a document is shaped correctly. This asks whether the
world it describes exists. Every defect it looks for passes both validators:

    a thumbnail that answers 401 to the reader it was published for
    a partOf naming a parent nobody can fetch
    a painting body whose id is an image service base, so it returns HTML
    an info.json advertising sizes the server will not serve
    a service declaring ImageService3 over an Image API 1.1 server

It fetches as an anonymous reader, never as the owner: the owner can read
everything, so the owner's view proves nothing about a published document.

A refusal is a result, not a failure. 401 and 403 are reported as REFUSED and
count as findings only under --expect-restricted, which inverts them: there, a
200 on restricted content is the finding.

What it deliberately does not check is printed under EXEMPT, and a URI it has no
probe for is a finding rather than a silent pass — a gap in the check must read
as a gap, not as a clean run.
"""
import argparse, json, math, os, re, struct, sys, urllib.error, urllib.parse, urllib.request

TIMEOUT = 30
# Presentation 3.0 section `id`: "If the resource with the `id` property is
# embedded, it may also be dereferenceable. If the resource is referenced, it
# must be dereferenceable." A resource is embedded when the document handed its
# content over — it carries `items`, a `body`, or, for navPlace, `features`.
# Everything else carrying an `id` is a reference and has to answer.
CONTENT = ("items", "body", "features")
IMAGE_SERVICE = re.compile(r"^ImageService\d$")


class Probe:
    """Every fetch this run made, so the report can be built from evidence."""

    def __init__(self, budget=400):
        self.seen, self.budget, self.spent = {}, budget, 0

    def get(self, url, want_json=False, head=False):
        if url in self.seen:
            return self.seen[url]
        if self.spent >= self.budget:
            return {"status": 0, "type": "", "body": b"", "url": url, "over_budget": True,
                    "error": "request budget reached"}
        self.spent += 1
        req = urllib.request.Request(url, method="HEAD" if head else "GET")
        req.add_header("Accept", "application/json" if want_json else "*/*")
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                body = b"" if head else r.read(2_000_000)
                out = {"status": r.status, "type": r.headers.get("Content-Type", ""),
                       "body": body, "url": r.url}
        except urllib.error.HTTPError as e:
            out = {"status": e.code, "type": e.headers.get("Content-Type", ""),
                   "body": b"", "url": url}
        except Exception as e:
            out = {"status": 0, "type": "", "body": b"", "url": url, "error": str(e)}
        self.seen[url] = out
        return out


def pixels(blob):
    """(width, height) from the file's own header. A 200 carrying the wrong
    dimensions is invisible to a status check, and is what makes a deep-zoom
    viewer tile crookedly."""
    if blob[:8] == b"\x89PNG\r\n\x1a\n" and blob[12:16] == b"IHDR":
        return struct.unpack(">II", blob[16:24])
    if blob[:2] == b"\xff\xd8":                                  # JPEG: find SOFn
        i = 2
        while i + 9 < len(blob):
            if blob[i] != 0xFF:
                i += 1
                continue
            marker, size = blob[i + 1], struct.unpack(">H", blob[i + 2:i + 4])[0]
            if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
                h, w = struct.unpack(">HH", blob[i + 5:i + 9])
                return w, h
            i += 2 + size
    if blob[:6] in (b"GIF87a", b"GIF89a"):
        return struct.unpack("<HH", blob[6:10])
    if blob[:4] == b"RIFF" and blob[8:12] == b"WEBP" and blob[12:16] == b"VP8 ":
        w, h = struct.unpack("<HH", blob[26:30])
        return w & 0x3FFF, h & 0x3FFF
    return None


def walk(doc, path="$", inside_content=False):
    """Every resource carrying an `id`, and whether the document embedded it."""
    if isinstance(doc, dict):
        if "id" in doc or "@id" in doc:
            yield path, doc, any(k in doc for k in CONTENT)
        for k, v in doc.items():
            if isinstance(v, (dict, list)):
                yield from walk(v, f"{path}.{k}", inside_content or k in CONTENT)
    elif isinstance(doc, list):
        for i, v in enumerate(doc):
            yield from walk(v, f"{path}[{i}]", inside_content)


def rid(res):
    return res.get("id") or res.get("@id")


def same_host(a, b):
    return urllib.parse.urlparse(a).netloc == urllib.parse.urlparse(b).netloc


class Report:
    def __init__(self):
        self.rows = []

    def add(self, verdict, where, detail):
        self.rows.append((verdict, where, detail))

    def of(self, *verdicts):
        return [r for r in self.rows if r[0] in verdicts]


def check_image_service(svc, path, probe, rep):
    """A service is a promise about roughly twenty distinct requests. Fetch what
    its info.json advertises and measure what comes back."""
    base = rid(svc).rstrip("/")
    info_url = base + "/info.json"
    r = probe.get(info_url, want_json=True)
    if r.get("over_budget"):
        rep.add("EXEMPT", path, f"{info_url} not fetched — request budget reached, raise --budget")
        return
    if r["status"] in (401, 403):
        rep.add("REFUSED", path, f"{info_url} -> {r['status']}")
        return
    if r["status"] != 200:
        rep.add("FAIL", path, f"info.json unreachable: {info_url} -> {r['status'] or r.get('error')}")
        return
    try:
        info = json.loads(r["body"])
    except Exception:
        rep.add("FAIL", path, f"{info_url} returned {r['type'] or 'no content-type'}, not JSON")
        return

    declared = svc.get("type") or svc.get("@type") or ""
    ctx = json.dumps(info.get("@context", ""))
    actual = ("ImageService3" if "/image/3/" in ctx else
              "ImageService2" if "/image/2/" in ctx else
              "ImageService1" if "/image/1/" in ctx or "@context" not in info else None)
    if actual and declared and declared != actual:
        rep.add("FAIL", path, f"declared {declared} but the service answers as {actual} "
                              f"— viewers will build the wrong URL syntax")
    version = actual or declared
    full, quality = (("max", "default") if version == "ImageService3" else
                     ("full", "native") if version == "ImageService1" else ("full", "default"))

    # `sizes` promises full-region requests at those pixel dimensions; `tiles`
    # promises a region request per scale factor, which is what deep zoom issues
    iw, ih = info.get("width", 0), info.get("height", 0)
    want = [(f"full/{s['width']},{s['height']}", (s["width"], s["height"]))
            for s in info.get("sizes", []) if "width" in s and "height" in s]
    for t in info.get("tiles", []):
        tw, th = t.get("width", 512), t.get("height", t.get("width", 512))
        for sf in t.get("scaleFactors", []):
            rw, rh = min(tw * sf, iw), min(th * sf, ih)
            if rw <= 0 or rh <= 0:
                continue
            want.append((f"0,0,{rw},{rh}/{math.ceil(rw / sf)},{math.ceil(rh / sf)}",
                         (math.ceil(rw / sf), math.ceil(rh / sf))))

    checked = 0
    for spec, expect in want[:8]:                      # a sample, not the whole pyramid
        url = f"{base}/{spec}/0/{quality}.jpg"
        img = probe.get(url)
        if img.get("over_budget"):
            rep.add("EXEMPT", path, f"{url} not fetched — request budget reached")
            continue
        if img["status"] in (401, 403):
            rep.add("REFUSED", path, f"{url} -> {img['status']}")
            continue
        if img["status"] != 200:
            rep.add("FAIL", path, f"info.json advertises {spec} but {url} -> "
                                  f"{img['status'] or img.get('error')}")
            continue
        got = pixels(img["body"])
        if got is None:
            rep.add("FAIL", path, f"{url} returned {img['type'] or 'no content-type'}, not an image")
        elif got != expect:
            rep.add("FAIL", path, f"{url} should be {expect[0]}x{expect[1]} "
                                  f"but returned {got[0]}x{got[1]}")
        else:
            checked += 1
    rep.add("OK", path, f"{version} at {base}: info.json plus {checked} of "
                        f"{min(len(want), 8)} advertised request(s) served at the right size")
    if not want:
        rep.add("EXEMPT", path, f"{base} advertises no sizes or tiles — only info.json was checked")


def check_document(url, probe, rep, label=""):
    """`label` prefixes every path, so a finding across twenty manifests says
    which one it is in."""
    r = probe.get(url, want_json=True)
    if r.get("over_budget"):
        rep.add("EXEMPT", label + "$", f"{url} not fetched — request budget reached")
        return None
    if r["status"] != 200:
        rep.add("FAIL", label + "$", f"{url} -> {r['status'] or r.get('error')}")
        return None
    try:
        doc = json.loads(r["body"])
    except Exception:
        rep.add("FAIL", label + "$", f"{url} returned {r['type'] or 'no content-type'}, not JSON")
        return None

    # A reference to something this document already handed over elsewhere is
    # not asking the world for anything: a Range's items name Canvases the
    # Manifest embeds, and those Canvas URIs are usually not separately served.
    handed_over = {rid(r) for _, r, emb in walk(doc) if emb and rid(r)}

    for path, res, embedded in walk(doc):
        path = label + path
        i = rid(res)
        t = res.get("type") or res.get("@type") or ""
        if not isinstance(i, str) or not i.startswith(("http://", "https://")):
            continue
        if IMAGE_SERVICE.match(str(t)) or "/service" in path:
            if IMAGE_SERVICE.match(str(t)):
                check_image_service(res, path, probe, rep)
            else:
                rep.add("EXEMPT", path, f"{t or 'service'} at {i}: no probe written for this "
                                        f"service type — check it by hand")
            continue
        if not same_host(i, url):
            rep.add("EXEMPT", path, f"{i} is on another host — not fetched")
            continue
        if embedded:
            rep.add("EXEMPT", path, f"{t or 'resource'} embedded; its id need not resolve")
            continue
        if i in handed_over:
            rep.add("EXEMPT", path, f"{t or 'resource'} {i} is embedded elsewhere in this "
                                    f"document; the link resolves within it")
            continue

        # a reference, so section `id` says it must be dereferenceable
        got = probe.get(i, want_json=True)
        if got.get("over_budget"):
            rep.add("EXEMPT", path, f"{i} not fetched — request budget reached, raise --budget")
            continue
        if got["status"] in (401, 403):
            rep.add("REFUSED", path, f"{t or 'resource'} {i} -> {got['status']}")
            continue
        if got["status"] != 200:
            rep.add("FAIL", path, f"{t or 'resource'} {i} -> {got['status'] or got.get('error')}"
                                  f" — a referenced resource must be dereferenceable")
            continue
        fmt = res.get("format")
        ctype = got["type"].split(";")[0].strip()
        if fmt and ctype and fmt != ctype:
            rep.add("FAIL", path, f"{i} declares format {fmt} but the server returned {ctype}")
        elif fmt and fmt.startswith("image/") and pixels(got["body"]) is None:
            rep.add("FAIL", path, f"{i} declares {fmt} but the bytes are not an image "
                                  f"— an image service base is not an image request")
        else:
            rep.add("OK", path, f"{t or 'resource'} {i} -> 200")
    return doc


def check_reachable(url, probe, rep):
    """A document nothing links to from the root is not published, whatever its
    visibility flag says: the only way anyone finds it is by being told the URL."""
    seen, queue, manifests = set(), [url], []
    while queue:
        u = queue.pop(0)
        if u in seen or not same_host(u, url):
            continue
        seen.add(u)
        r = probe.get(u, want_json=True)
        if r["status"] != 200:
            rep.add("FAIL", "reach", f"{u} -> {r['status'] or r.get('error')}")
            continue
        try:
            doc = json.loads(r["body"])
        except Exception:
            continue
        for entry in doc.get("items", []):
            if not isinstance(entry, dict):
                continue
            t, i = entry.get("type") or entry.get("@type"), rid(entry)
            if t == "Collection" and i:
                queue.append(i)
            elif t == "Manifest" and i:
                manifests.append(i)
    rep.add("OK", "reach", f"{len(manifests)} manifest(s) reachable by crawling from {url}")
    return manifests


def _fixture_server():
    """A server that reproduces the defects this checker exists to find:
    a thumbnail nobody can fetch, a partOf naming a route that does not exist,
    a painting body whose id is a service base so it answers HTML while
    declaring image/jpeg, and a restricted resource that refuses."""
    import http.server, threading, socketserver

    PNG = (b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
           + struct.pack(">II", 60, 40) + b"\x08\x02\x00\x00\x00")

    class H(http.server.BaseHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def do_GET(self):
            host = f"http://{self.headers['Host']}"
            routes = {
                "/manifest": (200, "application/json", json.dumps({
                    "id": f"{host}/manifest", "type": "Manifest",
                    "thumbnail": [{"id": f"{host}/gone.jpg", "type": "Image",
                                   "format": "image/jpeg"}],
                    "partOf": [{"id": f"{host}/no-such-collection", "type": "Collection"}],
                    "structures": [{"id": f"{host}/range", "type": "Range", "label": {"en": ["r"]},
                                    "items": [{"id": f"{host}/c1", "type": "Canvas"}]}],
                    "items": [{"id": f"{host}/c1", "type": "Canvas", "height": 40, "width": 60,
                               "items": [{"id": f"{host}/p1", "type": "AnnotationPage", "items": [
                                   {"id": f"{host}/a1", "type": "Annotation", "motivation": "painting",
                                    "target": f"{host}/c1",
                                    "body": {"id": f"{host}/svc", "type": "Image",
                                             "format": "image/jpeg"}}]}]}],
                }).encode()),
                "/good.png": (200, "image/png", PNG),
                "/svc": (200, "text/html", b"<!DOCTYPE html><html>service base</html>"),
                "/locked.jpg": (401, "text/plain", b"no"),
            }
            code, ctype, body = routes.get(self.path, (404, "text/plain", b"not found"))
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    srv = socketserver.TCPServer(("127.0.0.1", 0), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}"


def self_test():
    doc = {"id": "https://h/m", "type": "Manifest",
           "items": [{"id": "https://h/c", "type": "Canvas",
                      "items": [{"id": "https://h/p", "type": "AnnotationPage",
                                 "items": [{"id": "https://h/a", "type": "Annotation",
                                            "body": {"id": "https://h/i.jpg", "type": "Image",
                                                     "format": "image/jpeg"},
                                            "target": "https://h/c"}]}]}],
           "thumbnail": [{"id": "https://h/t.jpg", "type": "Image", "format": "image/jpeg"}],
           "partOf": [{"id": "https://h/coll", "type": "Collection"}]}
    got = {p: emb for p, res, emb in walk(doc)}
    # the document handed these over, so their ids need not resolve
    for p in ("$", "$.items[0]", "$.items[0].items[0]", "$.items[0].items[0].items[0]"):
        assert got[p] is True, (p, got[p])
    # these are links, and section `id` says a link must be dereferenceable
    for p in ("$.thumbnail[0]", "$.partOf[0]",
              "$.items[0].items[0].items[0].body"):
        assert got[p] is False, (p, got[p])

    # navPlace hands over a Feature Collection with `features`
    nav = {"navPlace": {"id": "https://h/fc", "type": "FeatureCollection",
                        "features": [{"id": "https://h/f", "type": "Feature"}]}}
    assert dict((p, e) for p, _, e in walk(nav))["$.navPlace"] is True

    png = (b"\x89PNG\r\n\x1a\n" + b"\x00\x00\x00\rIHDR"
           + struct.pack(">II", 640, 480) + b"\x08\x02\x00\x00\x00")
    assert pixels(png) == (640, 480), pixels(png)
    jpg = (b"\xff\xd8\xff\xe0" + struct.pack(">H", 16) + b"JFIF\x00" + b"\x00" * 9
           + b"\xff\xc0" + struct.pack(">H", 17) + b"\x08" + struct.pack(">HH", 300, 400)
           + b"\x03" + b"\x00" * 9)
    assert pixels(jpg) == (400, 300), pixels(jpg)
    assert pixels(b"<!DOCTYPE html><html>") is None
    assert pixels(b"GIF89a" + struct.pack("<HH", 12, 34)) == (12, 34)

    # the checker has to find real defects, not just parse correct documents
    srv, base = _fixture_server()
    try:
        rep = Report()
        check_document(f"{base}/manifest", Probe(), rep)
    finally:
        srv.shutdown()
    fails = " | ".join(d for _, _, d in rep.of("FAIL"))
    assert "gone.jpg" in fails and "404" in fails, fails          # thumbnail nobody can fetch
    assert "no-such-collection" in fails, fails                   # partOf naming a dead route
    assert "not an image" in fails or "text/html" in fails, fails  # service base as a painting body
    assert len(rep.of("FAIL")) == 3, rep.of("FAIL")
    # A Range naming a Canvas the Manifest embeds is not a dangling reference,
    # and those Canvas URIs are usually not separately served. Demanding they
    # resolve is the over-reach that makes a checker cry wolf.
    exempt = " | ".join(d for _, _, d in rep.of("EXEMPT"))
    assert "embedded elsewhere in this document" in exempt, exempt
    assert not any("/c1" in d for _, _, d in rep.of("FAIL")), rep.of("FAIL")
    # the document handed these over; their ids are not promises
    assert any("Canvas embedded" in d for _, _, d in rep.of("EXEMPT")), rep.of("EXEMPT")
    print(f"self-test ok ({len(rep.of('FAIL'))} planted defects found)")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("url", nargs="?", help="a published Manifest or Collection URL")
    ap.add_argument("--reachable", action="store_true",
                    help="treat the URL as a root Collection and crawl what it reaches")
    ap.add_argument("--expect-restricted", action="store_true",
                    help="the document is access-controlled: a refusal is expected and a 200 is the finding")
    ap.add_argument("--budget", type=int, default=400,
                    help="maximum HTTP requests, so a big manifest stays polite (default 400)")
    ap.add_argument("--quiet", action="store_true", help="findings and exemptions only")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        self_test()
        sys.exit()
    if not args.url:
        ap.error("give the URL of a published Manifest or Collection")

    probe, rep = Probe(args.budget), Report()
    if args.reachable:
        found = check_reachable(args.url, probe, rep)
        print(f"reachable by crawling {args.url}: {len(found)} manifest(s)")
        for m in found[:20]:
            check_document(m, probe, rep, label=m.rstrip("/").rsplit("/", 1)[-1] + " ")
        if len(found) > 20:
            rep.add("EXEMPT", "reach", f"{len(found) - 20} further manifest(s) not opened")
    else:
        check_document(args.url, probe, rep)

    order = ["FAIL", "REFUSED", "EXEMPT"] + ([] if args.quiet else ["OK"])
    for verdict in order:
        rows = rep.of(verdict)
        if not rows:
            continue
        print(f"\n{verdict} ({len(rows)})")
        for _, where, detail in rows:
            print(f"  {where}  {detail}")

    fails = rep.of("FAIL")
    refused = rep.of("REFUSED")
    if args.expect_restricted:
        # a refusal is the expected result here, so the 200s are the finding
        leaks = [r for r in rep.of("OK") if "-> 200" in r[2]]
        print(f"\n--expect-restricted: {len(refused)} refusal(s) as expected, "
              f"{len(leaks)} resource(s) served to an anonymous reader")
        sys.exit(1 if leaks else 0)
    print(f"\n{len(fails)} failed, {len(refused)} refused, {len(rep.of('EXEMPT'))} not checked, "
          f"{probe.spent} request(s)")
    if probe.spent >= probe.budget:
        print(f"the {probe.budget}-request budget was reached, so this run is incomplete "
              f"— re-run with --budget to finish it")
    sys.exit(1 if fails else 0)
