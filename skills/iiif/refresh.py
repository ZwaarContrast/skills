#!/usr/bin/env python3
"""Keep docs/ in step with iiif.io, and rebuild the two indexes.

    python3 refresh.py --check    # what changed upstream, writing nothing
    python3 refresh.py            # fetch new and changed pages, reindex
    python3 refresh.py --fresh    # re-fetch everything

iiif.io's sitemap carries a <lastmod> per URL, so a check is one request:
compare it against the date recorded in docs/CRAWL.tsv when we last fetched
that page. Cookbook recipes come from the sitemap too, so a new recipe is
picked up on its own; a new *spec* page is reported for a human to add to
PAGES, since deciding a draft belongs in the corpus is a judgement call.

Pandoc runs with --sandbox: without it, it fetches every <iframe> src and
inlines whatever the remote host returns (YouTube's no-JS error page, in its
own guess at your language) straight into the docs.
"""
import argparse, datetime, hashlib, inspect, json, os, re, shutil, subprocess, sys, urllib.parse, urllib.request
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(HERE, "docs")
BASE = "https://iiif.io/"

# Current specs, their change logs, the registries, the guides, every cookbook
# recipe. Superseded versions are in only where deployed content still uses
# them: Presentation/Image 2.1, Auth 1.0, Search 1.0.
PAGES = """
api/ api/cookbook/ api/cookbook/recipe/ api/cookbook/recipe/code/ api/cookbook/recipe/matrix/ api/cookbook/recipe/matrix-v4/ api/extension/ api/registry/ guides/ get-started/
api/image/3.0/ api/image/3.0/change-log/ api/image/3.0/compliance/
api/image/3.0/implementation/ api/image/2.1/ api/image/validator/
api/presentation/3.0/ api/presentation/3.0/change-log/
api/presentation/4.0/ api/presentation/4.0/model/ api/presentation/2.1/
api/auth/2.0/ api/auth/2.0/change-log/ api/auth/1.0/ api/auth/1.0/implementation/
api/search/2.0/ api/search/2.0/change-log/ api/search/1.0/
api/discovery/1.0/ api/content-state/1.0/
api/extension/georef/ api/extension/georef/vocab/georef-terms/ api/extension/navplace/ api/extension/text-granularity/
api/registry/accessibility/ api/registry/behaviors/ api/registry/image-extensions/
api/registry/motivations/ api/registry/profiles/ api/registry/rights/
api/registry/selectors/ api/registry/services/ api/registry/timeModes/
api/registry/types/ api/registry/viewingDirections/
api/annex/notes/design_principles/ api/annex/notes/jsonld/ api/annex/notes/semver/
api/annex/notes/apache/ api/annex/services/
guides/guide_for_implementers/ guides/using_iiif_resources/
guides/finding_resources/ guides/IIIF-and-SEO/
get-started/how-iiif-works/ get-started/why-iiif/ get-started/iiif-viewers/
get-started/image-servers/ get-started/tools/ get-started/vendors/
get-started/explainers/using_iiif_resources/
""".split()

CONTEXTS = ["presentation/3", "presentation/2", "image/3", "image/2",
            "auth/2", "search/2", "discovery/1"]


def get(url, binary=False):
    with urllib.request.urlopen(url, timeout=30) as r:
        raw = r.read()
    return raw if binary else raw.decode("utf-8", "replace")


# --- 1. fetch -----------------------------------------------------------------

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "param", "source", "track", "wbr"}
DROP = {"script", "style", "nav", "noscript"}
IFRAME = re.compile(r'<iframe\b[^>]*\bsrc=["\']([^"\']+)["\'][^>]*>.*?</iframe>'
                    r'|<iframe\b[^>]*\bsrc=["\']([^"\']+)["\'][^>]*/?>', re.S | re.I)
LEVELS = {"REQUIRED", "RECOMMENDED", "OPTIONAL", "NOT ALLOWED"}
TABLE = re.compile(r"<table\b.*?</table>", re.S | re.I)
BR = re.compile(r"<br\s*/?>", re.I)
IMG = re.compile(r'<img\b[^>]*?\balt="([^"]*)"[^>]*>|<img\b[^>]*>', re.I)
PRE = re.compile(r"<pre\b[^>]*>.*?</pre>", re.S | re.I)
TAG = re.compile(r"<[^>]+>")
LANG = re.compile(r'language-(\w+)')


def plain_code(html):
    """Strip syntax highlighting back to the code it decorates.

    Rouge marks up every token, and pandoc preserves that as raw HTML rather
    than a fence. On Presentation 4.0 the spans came to 397K of a 491K file —
    four fifths of the document was colour information about JSON examples the
    reader needs as JSON.
    """
    def strip(m):
        # the language lives on a wrapper the <pre> sits inside; carrying it
        # onto the <code> is what makes pandoc write a fence rather than an
        # indented block, and write_sections needs fences to tell a JSON
        # comment from a heading
        before = html[max(0, m.start() - 300):m.start()]
        lang = (LANG.findall(before) or [""])[-1]
        cls = f' class="{lang}"' if lang else ""
        return f"<pre><code{cls}>" + TAG.sub("", m.group(0)) + "</code></pre>"
    return PRE.sub(strip, html)
PARA = re.compile(r"</?p\b[^>]*>", re.I)


def flatten_tables(html):
    """Make table cells inline so pandoc can write a pipe table.

    A GFM cell holds no line break and no block element, and pandoc answers a
    single <br> or <p> by emitting the whole table as raw HTML — several times
    the tokens, in exactly the reference tables this corpus exists to serve
    cheaply. The Image API's parameter grids are images with captions, where
    the caption is the part worth keeping.
    """
    def alt(i):
        text = i.group(1)
        if not text:
            return ""
        # appendix A states its requirement levels as icons; the alt text is
        # the whole content of those cells, so it stands in unadorned
        return text.upper() if text.upper() in LEVELS else f"[{text}]"

    def fix(m):
        t = BR.sub(" / ", m.group(0))
        t = IMG.sub(alt, t)
        return PARA.sub(" ", t)
    return TABLE.sub(fix, html)


class Grab(HTMLParser):
    """Byte span of every element whose class list holds `content`."""

    def __init__(self, html):
        super().__init__(convert_charrefs=False)
        self.stack, self.spans = [], []
        self.line_off = [0]
        for ln in html.splitlines(keepends=True):
            self.line_off.append(self.line_off[-1] + len(ln))

    def _off(self):
        line, col = self.getpos()
        return self.line_off[line - 1] + col

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append((tag, self._off(), "content" in dict(attrs).get("class", "").split()))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        while self.stack:
            t, start, hit = self.stack.pop()
            if t == tag:
                if hit:
                    self.spans.append((start, self._off() + len(tag) + 3))
                return


def main_content(html):
    """The page's own content, with the site chrome left behind."""
    html = IFRAME.sub(lambda m: f"<p>[embedded: {m.group(1) or m.group(2)}]</p>", html)
    html = flatten_tables(html)
    html = plain_code(html)
    for t in DROP:
        html = re.sub(rf"<{t}\b.*?</{t}>", "", html, flags=re.S | re.I)
    g = Grab(html)
    try:
        g.feed(html)
    except Exception:
        pass
    if not g.spans:
        return html
    a, b = max(g.spans, key=lambda s: s[1] - s[0])
    return html[a:b]


SITEMAP = re.compile(r"<loc>https://iiif\.io/([^#<]*?)(?:#[^<]*)?</loc>\s*<lastmod>(.*?)</lastmod>", re.S)
# sitemap URLs under these prefixes are documentation we would want...
WATCH = re.compile(r"^(api|guides|get-started)/")
# ...except superseded spec versions, per-institution how-tos, and the site's
# own furniture, which the corpus deliberately leaves out.
IGNORE = re.compile(r"""^(
    api/(image|presentation)/(1\.\d|2\.0)/ | api/auth/0\.9/
  | api/(discovery|content-state)/0\.\d/ | api/(metadata|model)/
  | api/presentation/(usecases|validator)/ | api/image/validator/(download|results)/
  | api/(image|presentation)/\d\.\d/(change-log-211|compliance/index\.html)
  | api/annex/notes/$ | api/annex/(openannotation|rest)/ | api/annex/notes/(disclaimer|rotation)/
  | api/registry/process/ | guides/guides/ | guides/CONTRIBUTING/
  | api/(image|presentation)/2\.1/(change-log|compliance|zones)/ | api/search/0\.9/
  | api/cookbook/recipe/(all|0118_multivalue)/   # a duplicate aggregate and a stale alias
  | (api/annex|get-started/explainers)/$   # bare index pages
  | get-started/(cookbook|non-english|talks|training)/ | 404\.html
)""", re.X)


def sitemap():
    """{page: lastmod} for the whole site, one request."""
    try:
        return dict(SITEMAP.findall(get(BASE + "sitemap.xml")))
    except Exception as e:
        sys.exit(f"cannot reach {BASE}sitemap.xml ({e}); "
                 f"the corpus on disk is unchanged and still usable")


def rules_id():
    """A fingerprint of the passes that shape a page. Pages fetched under an
    older fingerprint were cleaned by older rules, so `--check` can say that a
    `--fresh` run is due rather than leaving the corpus quietly inconsistent."""
    src = "".join(inspect.getsource(f) for f in (main_content, flatten_tables, plain_code, clean, relink, repoint))
    return hashlib.sha256(src.encode()).hexdigest()[:12]


def crawl_log(rows=None, stamp=None):
    """docs/CRAWL.tsv — the lastmod each held page carried when we fetched it,
    under a header recording when that was and which rules produced it."""
    path = os.path.join(DOCS, "CRAWL.tsv")
    if rows is None:
        if not os.path.exists(path):
            return {}, {}
        lines = open(path, encoding="utf-8").read().splitlines()
        meta = dict(re.findall(r"(\w+): (\S+)", lines[0])) if lines[0].startswith("#") else {}
        return dict(l.split("\t") for l in lines[2:] if l), meta
    stamp = stamp or datetime.date.today().isoformat()
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"# crawled: {stamp}  rules: {rules_id()}\n")
        f.write("page\tlastmod\n")
        for page in sorted(rows):
            f.write(f"{page}\t{rows[page]}\n")


def targets(smap):
    """The pages the corpus holds: the hand-picked list, plus every recipe."""
    recipes = [p for p in smap
               if re.fullmatch(r"api/cookbook/recipe/[0-9][\w-]*/", p) and not IGNORE.match(p)]
    return PAGES + sorted(recipes)


def survey(smap):
    """(changed, missing, unlisted, meta) — what a refresh would do, and what
    needs a human."""
    held, meta = crawl_log()
    want = targets(smap)
    changed = [p for p in want if p in held and smap.get(p, held[p]) != held[p]]
    missing = [p for p in want if p not in held
               or not os.path.exists(os.path.join(DOCS, (p.strip("/") or "index") + ".md"))]
    unlisted = [p for p in smap if WATCH.match(p) and not IGNORE.match(p) and p not in set(want)]
    return changed, missing, sorted(unlisted), meta


def check():
    smap = sitemap()
    changed, missing, unlisted, meta = survey(smap)
    held, _ = crawl_log()
    print(f"corpus crawled {meta.get('crawled', 'on an unrecorded date')}, "
          f"{len(held)} pages")
    for label, pages in (("updated upstream", changed), ("not yet fetched", missing)):
        print(f"{len(pages)} {label}" + (":" if pages else ""))
        for p in pages:
            was = held.get(p)
            print(f"  {p}" + (f"  {was} -> {smap[p]}" if was and p in smap else ""))
    print(f"{len(unlisted)} documentation pages on iiif.io that the corpus does not hold"
          + (" — add to PAGES if wanted:" if unlisted else ""))
    for p in unlisted:
        print(f"  {p}")
    stale_rules = meta.get("rules") not in (None, rules_id())
    if stale_rules:
        print(f"the pages on disk were cleaned by rules {meta.get('rules')}, this copy of "
              f"refresh.py is {rules_id()} — run `refresh.py --fresh` to make the corpus consistent")
    return 1 if (changed or missing or stale_rules) else 0


def fetch_pages(pages, smap):
    """Fetch each page and record the lastmod it carried.

    One unreachable page must not cost the other hundred and thirty-six, so a
    failure is collected and the log is written whatever happens.
    """
    log, _ = crawl_log()
    failed = []
    try:
        for page in pages:
            rel = page.strip("/") or "index"
            dest = os.path.join(DOCS, rel + ".md")
            try:
                html = get(BASE + page)
            except Exception as e:
                failed.append(f"{page} ({e})")
                continue
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            md = subprocess.run(
                ["pandoc", "-f", "html", "-t", "gfm", "--wrap=none", "--sandbox"],
                input=main_content(html), capture_output=True, text=True).stdout
            # site-relative -> absolute; relink() localises them again once we
            # know which pages we actually hold
            md = md.replace("](/", "](" + BASE)
            with open(dest, "w", encoding="utf-8") as f:
                f.write(f"<!-- source: {BASE}{page} -->\n\n{md}")
            log[page] = smap.get(page, "")
    finally:
        crawl_log(log)
    print(f"pages: {len(pages) - len(failed)} fetched" +
          (f", {len(failed)} FAILED: {', '.join(failed)}" if failed else ""))
    return failed


def fetch_recipe_json(fresh):
    """The example JSON each recipe page links to — the worked answers."""
    rec = os.path.join(DOCS, "api/cookbook/recipe")
    got, failed = 0, []
    for fn in sorted(os.listdir(rec)):
        if not (fn.endswith(".md") and fn[0].isdigit()):
            continue
        slug = fn[:-3]
        md = open(os.path.join(rec, fn), encoding="utf-8").read()
        for ref in sorted(set(re.findall(r'(?:\]\(|href=")([a-zA-Z0-9_./-]+\.json)', md))):
            # repoint() rewrites these links to sit beside the recipe folder, so
            # a second run sees `<slug>/manifest.json`. The remote path is always
            # relative to the recipe URL, with or without that prefix.
            remote = ref[len(slug) + 1:] if ref.startswith(slug + "/") else ref
            dest = os.path.join(rec, slug, remote)
            if os.path.exists(dest) and not fresh:
                continue
            url = f"{BASE}api/cookbook/recipe/{slug}/{remote}"
            try:
                blob = get(url, binary=True)
                json.loads(blob)   # iiif.io answers a bad path with a 200 HTML
            except Exception as e:  # 404 page, so parsing it is the only real check
                failed.append(f"{remote} ({type(e).__name__})")
                continue
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, "wb") as f:
                f.write(blob)
            got += 1
    print(f"recipe json: {got} fetched" +
          (f", {len(failed)} FAILED: {', '.join(failed)}" if failed else ""))
    return failed


def fetch_contexts():
    d = os.path.join(DOCS, "context")
    os.makedirs(d, exist_ok=True)
    for c in CONTEXTS:
        try:
            body = get(f"{BASE}api/{c}/context.json")
        except Exception as e:
            print(f"context {c}: FAILED ({e})")
            continue
        if len(body) > 10:  # Presentation 4's is still an empty stub
            open(os.path.join(d, c.replace("/", "-") + ".json"), "w", encoding="utf-8").write(body)


# --- 2. clean -----------------------------------------------------------------

ICON = re.compile(r'!\[[^\]]*\]\(https://iiif\.io/api/assets/images/icons/\w+\.png "([^"]+)"\)')
ANCHOR = re.compile(r'\s*<a href="#[^"]*" class="anchorClass"></a>')
ABBR = re.compile(r'<span class="abbr" title="[^"]*">(.*?)</span>')
DIV = re.compile(r"^\s*</?div\b[^>]*>\s*$")
VIEWER = re.compile(r'\s*\\\|\s*<a href="[^"]*"[^>]*target="_blank">View in [^<]*</a>')
ATAG = re.compile(r'<a href="([^"]*)"[^>]*>([^<]*)</a>')
NOSCRIPT_H = re.compile(r"^#+ (Er is een fout opgetreden\.|An error occurred\.)\s*$")


def md_files():
    for dp, dns, fns in os.walk(DOCS):
        dns[:] = [d for d in dns if not d.startswith(".")]
        for fn in sorted(fns):
            if fn.endswith(".md"):
                yield os.path.join(dp, fn)


def clean():
    """Drop the chrome pandoc carried over. Code fences are left alone."""
    before = after = 0
    for path in md_files():
        src = open(path, encoding="utf-8").read()
        before += len(src)
        out, fenced = [], False
        for ln in VIEWER.sub("", src).splitlines():
            if ln.lstrip().startswith("```"):
                fenced = not fenced
                out.append(ln)
                continue
            if not fenced:
                if DIV.match(ln) or NOSCRIPT_H.match(ln):
                    continue
                ln = ANCHOR.sub("", ln)
                # the requirement matrices are icons; the words are the point
                ln = ICON.sub(lambda m: m.group(1).upper(), ln)
                ln = ABBR.sub(r"\1", ln)
                ln = ATAG.sub(r"[\2](\1)", ln)
            out.append(ln)
        dst = re.sub(r"\n{3,}", "\n\n", "\n".join(out)).strip() + "\n"
        open(path, "w", encoding="utf-8").write(dst)
        after += len(dst)
    print(f"clean: {before // 1024}K -> {after // 1024}K")


URL_RE = re.compile(r'https://iiif\.io/([A-Za-z0-9_./-]*?)/?(#[A-Za-z0-9_.-]+)?(?=["\s)\]|,]|$)')


def relink():
    """A link to a page we hold becomes a path to our copy of it."""
    have = {os.path.relpath(p, DOCS)[:-3] for p in md_files()}
    hits = misses = 0
    for path in md_files():
        rel = os.path.relpath(path, DOCS)[:-3]
        here = os.path.dirname(os.path.relpath(path, DOCS)) or "."

        def sub(m):
            nonlocal hits, misses
            target, frag = m.group(1).strip("/"), m.group(2) or ""
            if target == rel and not frag:   # a page linking to itself goes nowhere
                misses += 1
                return m.group(0)
            if target not in have:
                misses += 1
                return m.group(0)
            hits += 1
            return os.path.relpath(target + ".md", here) + frag

        src = open(path, encoding="utf-8").read()
        head, _, body = src.partition("\n")
        out = head + "\n" + URL_RE.sub(sub, body)
        if out != src:
            open(path, "w", encoding="utf-8").write(out)
    print(f"links: {hits} localised, {misses} left as URLs")


LOCAL = re.compile(r'\]\((?!https?:|#|mailto:)([^)\s"]+)')


def repoint():
    """Relative links the site wrote for its own URL layout, aimed at our files.

    `implementation/` is a page here, not a directory; a recipe's `manifest.json`
    sits in the recipe's own folder, one level below its page. Anything we do not
    hold — images, the site's XML fixtures — goes back to being a URL that works,
    resolved against the page's own source, rather than a path that does not.
    """
    fixed = urled = 0
    for path in md_files():
        here = os.path.dirname(path)
        stem = os.path.basename(path)[:-3]
        src = open(path, encoding="utf-8").read()
        source = re.match(r"<!-- source: (\S+) -->", src)

        def sub(m):
            nonlocal fixed, urled
            target, _, frag = m.group(1).partition("#")
            frag = "#" + frag if frag else ""
            if not target or os.path.exists(os.path.normpath(os.path.join(here, target))):
                return m.group(0)
            bare = target.rstrip("/")
            for base, cand in ((here, bare + ".md"),
                               (here, os.path.join(stem, target)),
                               (here, os.path.join(stem, bare + ".md")),
                               (DOCS, bare.lstrip("/") + ".md"),
                               (DOCS, bare.lstrip("/"))):
                full = os.path.normpath(os.path.join(base, cand))
                if os.path.exists(full):
                    fixed += 1
                    return "](" + os.path.relpath(full, here) + frag
            if source:
                urled += 1
                return "](" + urllib.parse.urljoin(source.group(1), target) + frag
            return m.group(0)

        out = LOCAL.sub(sub, src)
        if out != src:
            open(path, "w", encoding="utf-8").write(out)
    print(f"links: {fixed} repointed at local files, {urled} restored to URLs")


# --- 3. index -----------------------------------------------------------------

HEAD = re.compile(r"^(#{1,6})\s+(.*?)\s*$")
TAG = re.compile(r"<[^>]+>")


def write_sections():
    """SECTIONS.tsv: every heading with the line range of its whole subtree."""
    rows = []
    for path in md_files():
        rel = os.path.relpath(path, DOCS)
        lines = open(path, encoding="utf-8").read().splitlines()
        heads, fenced = [], False
        for i, ln in enumerate(lines, 1):
            if ln.lstrip().startswith("```"):
                fenced = not fenced
            if fenced:
                continue
            m = HEAD.match(ln)
            if m:
                title = re.sub(r"\s+", " ", TAG.sub("", m.group(2))).strip()
                if title:
                    heads.append((i, len(m.group(1)), title))
        for n, (start, depth, title) in enumerate(heads):
            end = next((s - 1 for s, d, _ in heads[n + 1:] if d <= depth), len(lines))
            rows.append((rel, start, end, depth, title))
    with open(os.path.join(DOCS, "SECTIONS.tsv"), "w", encoding="utf-8") as f:
        f.write("file\tstart\tend\tdepth\theading\n")
        for r in rows:
            f.write("\t".join(str(x) for x in r) + "\n")
    print(f"SECTIONS.tsv: {len(rows)} sections")


CAPTION = re.compile(r"^\*\*(.+?)\*\*$")
SEPARATOR = re.compile(r"^\|[-: |]+\|$")


def write_requirements():
    """REQUIREMENTS.tsv, read straight out of the spec's own appendix A.

    `validate.py` checks against this rather than a hand-typed copy, so the
    requirements cannot drift from the spec the corpus holds. The Behavior
    Values table is transposed into `behavior:<value>` rows so it keys the
    same way as the property tables.
    """
    spec = os.path.join(DOCS, "api/presentation/3.0.md")
    lines = open(spec, encoding="utf-8").read().splitlines()
    start = next(i for i, l in enumerate(lines) if l.startswith("### A. Summary of Property"))
    end = next(i for i, l in enumerate(lines[start + 1:], start + 1) if l.startswith("### "))
    block = lines[start:end]

    def cells(line):
        return [c.strip().replace("\\", "") for c in line.strip().strip("|").split("|")]

    def is_rule(line):
        return SEPARATOR.match(line.strip())

    rows, caption, header = [], "", None
    for i, line in enumerate(block):
        cap = CAPTION.match(line.strip())
        if cap:
            caption = cap.group(1)
            continue
        if not line.startswith("|"):
            continue
        if is_rule(line):
            continue
        # a header is the row a separator follows — tables here are not always
        # introduced by a caption, so the separator is what identifies them
        if i + 1 < len(block) and is_rule(block[i + 1]):
            header = cells(line)
            continue
        if header is None:
            continue
        row = cells(line)
        label = row[0].rstrip("* ").strip()   # appendix A footnotes its labels
        if label in LEVELS or not label:              # the icon legend, not data
            continue
        for col, value in zip(header[1:], row[1:]):
            value = value.split("*")[0].strip()
            if value not in LEVELS or not col:
                continue
            if caption == "Behavior Values":
                rows.append((col.replace(" ", ""), "behavior:" + label, value))
            else:
                rows.append((label.replace(" ", ""), col, value))

    assert rows, f"appendix A parsed to nothing in {spec}"
    clash = {(t, p) for t, p, _ in rows if len({v for a, b, v in rows if (a, b) == (t, p)}) > 1}
    assert not clash, f"appendix A gave conflicting levels for {sorted(clash)[:5]}"
    with open(os.path.join(DOCS, "REQUIREMENTS.tsv"), "w", encoding="utf-8") as f:
        f.write("type\tproperty\trequirement\n")
        for r in sorted(set(rows)):
            f.write("\t".join(r) + "\n")
    req = sum(1 for r in set(rows) if r[2] == "REQUIRED")
    print(f"REQUIREMENTS.tsv: {len(set(rows))} rules, {req} of them REQUIRED")


ITEM = re.compile(r"^- (.+?) \(\[version")
LINK = re.compile(r"\[version (\d)\]\((?:.*?)recipe/([0-9][\w-]*)\.md")


def write_recipes():
    """RECIPES.tsv: what each recipe demonstrates, and the JSON it ships."""
    meta, group = {}, ""
    for ln in open(os.path.join(DOCS, "api/cookbook.md"), encoding="utf-8"):
        m = re.match(r"^## (.+)", ln)
        if m:
            group = m.group(1).strip()
            continue
        it = ITEM.match(ln)
        if not it:
            continue
        title = re.sub(r"\s+", " ", it.group(1)).strip()
        for ver, slug in LINK.findall(ln):
            meta.setdefault(slug, {"topic": group, "title": title, "v": set()})["v"].add(ver)

    rec = os.path.join(DOCS, "api/cookbook/recipe")
    rows = []
    for fn in sorted(os.listdir(rec)):
        if not (fn.endswith(".md") and fn[0].isdigit()):
            continue
        slug = fn[:-3]
        e = meta.get(slug, {})
        jsons = sorted(
            os.path.relpath(os.path.join(dp, j), rec)
            for dp, _, fns in os.walk(os.path.join(rec, slug)) for j in fns if j.endswith(".json"))
        rows.append((slug, e.get("topic", "-"), e.get("title", slug),
                     "/".join(sorted(e.get("v", ["3"]))), ",".join(jsons)))
    with open(os.path.join(DOCS, "RECIPES.tsv"), "w", encoding="utf-8") as f:
        f.write("slug\ttopic\ttitle\tprez_versions\tjson\n")
        for r in rows:
            f.write("\t".join(r) + "\n")
    orphans = [r[0] for r in rows if r[1] == "-"]
    print(f"RECIPES.tsv: {len(rows)} recipes" + (f", not listed in the cookbook index: {orphans}" if orphans else ""))


def self_test():
    """The two parsers are the whole skill; check them on known input."""
    html = ('<div class="hero"><p>chrome</p></div>'
            '<div class="content"><h2>Real</h2><iframe src="https://yt/x"></iframe></div>')
    body = main_content(html)
    assert "chrome" not in body and "Real" in body, body
    assert "[embedded: https://yt/x]" in body and "<iframe" not in body, body

    global DOCS
    keep, DOCS = DOCS, os.path.join(HERE, ".selftest")
    try:
        os.makedirs(DOCS, exist_ok=True)
        open(os.path.join(DOCS, "t.md"), "w").write(
            "# A\ntext\n## B\nmore\n```\n# not a heading\n```\n# C\nend\n")
        write_sections()
        rows = [l.split("\t") for l in
                open(os.path.join(DOCS, "SECTIONS.tsv")).read().splitlines()[1:]]
        assert [(r[4], r[1], r[2]) for r in rows] == [("A", "1", "7"), ("B", "3", "7"), ("C", "8", "9")], rows
    finally:
        shutil.rmtree(DOCS, ignore_errors=True)
        DOCS = keep
    print("self-test ok")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="report upstream changes, write nothing")
    ap.add_argument("--fresh", action="store_true", help="re-fetch every page")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        self_test()
        sys.exit()
    if args.check:
        sys.exit(check())

    smap = sitemap()
    changed, missing, _, meta = survey(smap)
    stale_rules = meta.get("rules") not in (None, rules_id())
    if stale_rules and not args.fresh:
        print(f"pages on disk were cleaned by rules {meta.get('rules')}, this refresh.py is "
              f"{rules_id()} — re-fetching everything so the corpus is consistent")
    todo = targets(smap) if (args.fresh or stale_rules) else sorted(set(changed) | set(missing))
    failed = fetch_pages(todo, smap) if todo else []
    if not todo:
        print("pages: already current")
    failed += fetch_recipe_json(args.fresh)
    fetch_contexts()
    clean()
    relink()
    repoint()
    write_sections()
    write_recipes()
    write_requirements()
    if failed:
        print(f"\n{len(failed)} fetches failed; re-run to retry them")
        sys.exit(1)
