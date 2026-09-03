---
name: iiif
description: Implement, serve, parse or review IIIF against a local copy of the specifications, indexed so looking up a property costs one command and thirty lines. Covers Presentation (manifests, collections, canvases, ranges, annotations, behaviors), Image API 1.1/2.1/3.0 (URL syntax, info.json, compliance levels), Auth, Content Search, Change Discovery, Content State, the extensions and registries, 76 Cookbook recipes with working JSON, and the @iiif npm libraries. Use when writing or debugging a manifest, choosing a property or its allowed values, building image URLs, consuming someone else's IIIF, checking a document is spec-correct, or checking a published one keeps its promises — that every URI it publishes answers to an anonymous reader.
---

# IIIF

The specifications are large and detailed, and the way to get IIIF wrong is to
implement from memory. Every claim you make about IIIF comes from a **section**
of the corpus that you actually read on this run, or from a **recipe** whose JSON
you actually opened.

Both are indexed, so reading the spec costs almost nothing: find the section,
read its line range. Reading a spec file whole is never necessary —
`api/presentation/3.0.md` is 2100 lines and the answer to a property question is
about thirty of them.

`<skill-dir>` below is the directory holding this file; the corpus is
`<skill-dir>/docs/`, and every path in this document is relative to that.

## Find the section

`look.py` searches the heading of every section in the corpus and prints the one
you want. Properties, resource types and registry terms are all headings, so most
lookups are a single call. The term is matched literally, so `^max` and `w,h` find
themselves; pass `--regex` when you want a pattern.

```bash
python3 <skill-dir>/look.py behavior                          # where is it defined?
python3 <skill-dir>/look.py behavior --file presentation/3.0 --read
python3 <skill-dir>/look.py tiles --file image/3.0            # narrow by path
```

A section over 200 lines lists its parts instead of printing itself; pick a part,
or pass `--all`.

Behind it is `docs/SECTIONS.tsv` — `file <TAB> start <TAB> end <TAB> depth <TAB>
heading` for every heading in the corpus — so you can also read a range directly,
or pull a table of contents:

```bash
cd <skill-dir>/docs
awk -F'\t' '$1=="api/presentation/3.0.md" && $4<=3' SECTIONS.tsv
sed -n '578,628p' api/presentation/3.0.md
```

Normative statements are not all under headings. Auth 2.0's caching rule — "each
version of a resource must have a distinct URI to prevent web caches from
providing the wrong version" — is a bullet in §1, so `look.py cache` cannot find
it. When a lookup comes back empty, read the specification's introduction before
concluding it says nothing.

When the term is not a heading — a value, an error code, a media type — grep the
one file that owns it rather than the tree:

```bash
grep -n 'sizeUpscaling' <skill-dir>/docs/api/image/3.0.md
```

## Copy a recipe

`docs/RECIPES.tsv` is the Cookbook: `slug <TAB> topic <TAB> title <TAB>
prez_versions <TAB> json`. The Cookbook is the community's agreed way to model a
thing, and every recipe ships the manifest that proves it. Prefer adapting a
recipe's JSON over composing a shape from the spec's prose.

```bash
cd <skill-dir>/docs
grep -i 'annotation' RECIPES.tsv                       # what exists
cat api/cookbook/recipe/0021-tagging.md                # why it is shaped that way
cat api/cookbook/recipe/0021-tagging/manifest.json     # the shape itself
```

`api/cookbook.md` groups every recipe by topic — read it when you do not yet know
what to search for.

## Pin the version

State the version in your first sentence about any resource, because the same
property name means different things across them.

- **Presentation 3.0** and **Image 3.0** are what you write. Default to these.
- **Presentation 4.0** is a draft (`api/presentation/4.0.md`, model in
  `api/presentation/4.0/model.md`). Use it only when asked for it by name.
- **Presentation 2.1** and **Image 2.1** are held because a great deal of
  published IIIF is still v2, so consumers meet it. Read them to parse v2; the
  change logs (`api/presentation/3.0/change-log.md`) explain what moved.

A v2 document announces itself with `@context …/presentation/2/context.json` and
`@id`/`@type`; v3 uses `id`/`type`.

Three dialects of the Image API are live at once, and getting this wrong is
silent — lenient servers answer the wrong request anyway, so it works in testing
and fails on the strict one:

| Image API | Full size | Default quality | `type` in a Presentation 3 document |
|---|---|---|---|
| 1.1 | `full` | `native` | `ImageService1` |
| 2.x | `full` | `default` | `ImageService2` |
| 3.0 | `max` | `default` | `ImageService3` |

The `ImageService1`/`ImageService2` names come from `api/presentation/3.0.md`
§`service`, under "For cross-version consistency". A service typed that way may
be written with `@id`/`@type` rather than `id`/`type`. All three specs are held:
`api/image/1.1.md`, `api/image/2.1.md` and `api/image/3.0.md`.

**`@iiif/parser`'s `convertPresentation2` mutates the document you hand it** — it
strips `@id` from nested resources as it upgrades, so a raw v2 document kept as
provenance and converted in the same breath becomes something the source never
served. Clone before converting. See `ecosystem/parser.md`.

## Where the rest lives

Paths are relative to `<skill-dir>/docs/`.

| Question | File |
|---|---|
| Manifests, collections, canvases, ranges, annotations, every property | `api/presentation/3.0.md` |
| Which properties are required, recommended or forbidden on which type | `REQUIREMENTS.tsv` — `type <TAB> property <TAB> requirement`, read out of appendix A. Prose and examples: `api/presentation/3.0.md` section "A. Summary of Property Requirements" |
| Which `behavior` values a type accepts | `REQUIREMENTS.tsv`, the `behavior:<value>` rows — `grep 'behavior:paged' REQUIREMENTS.tsv` |
| What each `behavior`, `viewingDirection`, `timeMode` or `motivation` value means | the property's own section in `api/presentation/3.0.md` |
| Image URL syntax, `info.json`, compliance levels | `api/image/3.0.md`, with `api/image/3.0/compliance.md` (v2 services: `api/image/2.1/compliance.md`) |
| Terms registered *outside* the spec | `api/registry/`. Populated: `accessibility`, `motivations`, `profiles`, `rights`, `selectors`, `services`. Empty because iiif.io publishes them empty, not because the crawl failed: `behaviors`, `image-extensions`, `timeModes`, `types`, `viewingDirections` |
| Which `rights` URIs are allowed | `api/registry/rights.md`, and the `rights` section of `api/presentation/3.0.md` |
| `navPlace`, `georeference`, text granularity | `api/extension/` |
| `total`, `startIndex`, `next`/`prev` on an Annotation Collection | `api/search/2.0.md` §Annotation Collection and `api/cookbook/recipe/0309-annotation-collection.md`. Presentation 3 borrows this vocabulary from the W3C Web Annotation model and never defines it — `total` is the count of *annotations*, not of pages |
| The libraries: `@iiif/parser`, `@iiif/helpers` | `ecosystem/` — their own docs, with the npm version and peer dependencies recorded |
| Putting `navPlace` coordinates on a map | `guides/guides/navplace.md` — worked Leaflet example |
| Who your users are and what they need from a viewer | `guides/guides/personas.md` |
| Search within an object | `api/search/2.0.md` (deployed services are mostly `api/search/1.0.md`) |
| Access control, probe and token services | `api/auth/2.0.md` (deployed services are mostly `api/auth/1.0.md`) |
| Publishing an activity stream of changes | `api/discovery/1.0.md` |
| Linking to a specific view — a canvas, a region, a time | `api/content-state/1.0.md` |
| What a client is allowed to assume, and why the spec is shaped this way | `api/annex/notes/design_principles.md` |
| JSON-LD rules the spec relies on | `api/annex/notes/jsonld.md` |
| Implementation notes: Apache config, rotation maths, Open Annotation, the REST extension | `api/annex/` |
| Choosing an image server, a viewer, a library | `get-started/image-servers.md`, `get-started/iiif-viewers.md`, `get-started/tools.md` |
| Deciding what to publish at all | `guides/guide_for_implementers.md` |
| Raw JSON-LD contexts | `context/` |

Links between documents are local paths, so follow them with `cat` and `sed`.
Every page keeps its origin in a `<!-- source: -->` comment on line 1.

## Check the work: the shape

Any IIIF you wrote or changed gets validated before you report it done.

```bash
python3 <skill-dir>/validate.py path/to/manifest.json          # local rules, then iiif.io's validator
python3 <skill-dir>/validate.py https://example.org/manifest   # validator fetches it — tests the endpoint too
python3 <skill-dir>/validate.py --local manifest.json          # nothing leaves this machine
```

Every run prints what it checked and ends on one of three verdicts, so a clean
exit can never be mistaken for a check that did not happen:

| | | |
|---|---|---|
| `PASS` | 0 | checked against the rules named above, no errors |
| `ERROR` | 1 | a spec violation, or the hosted validator was unreachable |
| `UNCHECKED` | 2 | no rule in this skill applies — a v2 document, or not IIIF at all |

- Validating a **URL** is the stronger test: it also catches a manifest that is
  correct on disk but served with the wrong content-type, or whose `id` does not
  resolve.
- **`--local`** skips the hosted validator and says so. It applies
  `REQUIREMENTS.tsv` and nothing else, so it is a weaker check — use it for
  anything unpublished, since the default sends the document to iiif.io.

Errors are spec violations. Warnings name RECOMMENDED properties you left out:
a manifest that validates while omitting `thumbnail`, `summary`, `metadata` and
`provider` is valid and close to useless to a viewer, so account for each one
rather than clearing the list by reflex.

## Check the work: the promises

**A validator checks a document against a schema. Most real defects are a promise
the document made that nothing kept.** A thumbnail that answers 401 to the reader
it was published for, a `partOf` naming a parent nobody can fetch, a painting body
whose `id` is an image service base so it returns HTML while declaring
`image/jpeg`, a service typed `ImageService3` over an Image API 1.1 server — none
of these is a schema violation, and every one passes both validators above.

```bash
python3 <skill-dir>/follow.py https://example.org/iiif/manifest
python3 <skill-dir>/follow.py https://example.org/iiif/collection --reachable
python3 <skill-dir>/follow.py https://example.org/iiif/manifest --expect-restricted
```

Four checks find most of it:

1. **Follow every URI the document publishes, as the reader it was published to.**
   Fetch anonymously, never as the owner — the owner can read everything, so the
   owner's view proves nothing about a published document.
2. **Decide "must this answer?" structurally, not by URL shape** — the rule
   below. A list of path patterns only excuses the shapes somebody thought of.
3. **Fetch everything `info.json` advertises,** and measure the pixels that come
   back rather than the status code: a 200 at the wrong dimensions is invisible
   to a status check and is what makes a deep-zoom viewer tile crookedly. The
   obligation is in `api/image/3.0/compliance.md`, not the spec — "an image
   service whose Image Information response includes the `sizes` property must
   support requests for the sizes listed", and likewise for `tiles`.
4. **Check reachability, not just resolvability.** A document nothing links to
   from the root Collection is not published, whatever its visibility flag says,
   because the only way anyone finds it is by being told the URL.

And for anything access-controlled: **a refusal is a result, not a failure.** A
checker that reports a restricted manifest's 401 as a defect buries the real
signal in dozens of false ones. Assert the refusal instead — under
`--expect-restricted` a 200 is the finding.

### Embedded or referenced

The rule that makes check 2 mechanical. `api/presentation/3.0.md` §`id`:

> If the resource with the `id` property is embedded, it *may* also be
> dereferenceable. If the resource is referenced, it *must* be dereferenceable.

A resource is **embedded** when the document handed its content over, which is
decidable from the JSON: it carries `items`, or a `body`, or — navPlace says so
in its own words — `features`. Everything else carrying an `id` is a
**reference**, and a reference has to answer. This is why a nested Range
published as a bare link to a route nobody wrote is a defect, while the Range in
`structures` that carries `items` is not.

A reference to something the document already embedded elsewhere — a Range's
`items` naming Canvases the Manifest carries — resolves within the document and
is not a promise to the world.

`follow.py` stops at 400 requests by default (`--budget`) so a 36-canvas
manifest stays polite, and says the run was incomplete rather than reporting a
clean pass. It prints what it deliberately did not check under `EXEMPT`, and
treats a URI it has no probe for as a finding. A gap in the check must read as a gap,
not as a clean run — a checker that cries wolf gets ignored, and the pass after
that is worse than no pass.

## Keeping the corpus current

`docs/` is a crawl of iiif.io, kept under CC-BY — see `docs/NOTICE.md`. Its
date is the `# crawled:` header of `docs/CRAWL.tsv`; check that before trusting
the corpus on a recent change.

```bash
python3 <skill-dir>/refresh.py --check    # what changed upstream; writes nothing
python3 <skill-dir>/refresh.py            # fetch what changed, rebuild the indexes
```

The corpus holds everything iiif.io's own API index presents as current, draft
or approved, plus the superseded versions that index still points at. It leaves
out earlier drafts, and the 74 per-institution "where to find the manifest"
walkthroughs under `guides/guides/`, whose content is screenshots.

`--check` compares each page against the `lastmod` in iiif.io's sitemap, reports
documentation pages the corpus does not hold, and says whether the pages on disk
were cleaned by an older version of `refresh.py`. It exits non-zero when a
refresh is due. A plain `refresh.py` re-fetches everything if the cleaning rules
have moved on, so the corpus never ends up half-processed.
