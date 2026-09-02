---
name: iiif
description: Implement, serve, parse or review IIIF against a local copy of the specifications, indexed so looking up a property costs one command and thirty lines instead of a four-thousand-line spec. Covers Presentation (manifests, collections, canvases, ranges, annotations, behaviors), Image API (URL syntax, info.json, compliance levels), Auth, Content Search, Change Discovery, Content State, the extensions and registries, and 76 Cookbook recipes with their working JSON. Use when writing or debugging a manifest, choosing a property or its allowed values, building image URLs, consuming someone else's IIIF, or checking that a document is spec-correct.
---

# IIIF

The specifications are large and detailed, and the way to get IIIF wrong is to
implement from memory. Every claim you make about IIIF comes from a **section**
of `docs/` that you actually read on this run, or from a **recipe** whose JSON
you actually opened.

Both are indexed, so reading the spec costs almost nothing: find the section,
read its line range. Never read a spec file whole — `docs/api/presentation/3.0.md`
alone is 4000 lines, and the answer to a property question is 30 of them.

## Find the section

`look.py` searches the heading of every section in the corpus and prints the one
you want. Properties, resource types and registry terms are all headings, so most
lookups are a single call.

```bash
python3 look.py behavior                              # where is it defined?
python3 look.py behavior --file presentation/3.0 --read   # print that section
python3 look.py tiles --file image/3.0                # narrow by path
```

Behind it is `docs/SECTIONS.tsv` — `file <TAB> start <TAB> end <TAB> depth <TAB>
heading` for all 1773 sections — so you can also read a range directly, or pull a
list of what a spec contains:

```bash
cd docs
awk -F'\t' '$1=="api/presentation/3.0.md" && $4<=3' SECTIONS.tsv   # its table of contents
sed -n '578,628p' api/presentation/3.0.md
```

When the term is not a heading — a value, an error code, a media type — grep the
one file that owns it rather than the tree:

```bash
grep -n 'sizeUpscaling' docs/api/image/3.0.md
```

## Copy a recipe

`docs/RECIPES.tsv` is the Cookbook: `slug <TAB> topic <TAB> title <TAB>
prez_versions <TAB> json`. The Cookbook is the community's agreed way to model a
thing, and every recipe ships the manifest that proves it. Prefer adapting a
recipe's JSON over composing a shape from the spec's prose.

```bash
grep -i 'annotation' docs/RECIPES.tsv                              # what exists
cat docs/api/cookbook/recipe/0021-tagging.md                       # why it is shaped that way
cat docs/api/cookbook/recipe/0021-tagging/manifest.json            # the shape itself
```

`docs/api/cookbook.md` groups every recipe by topic — read it when you do not yet
know what to search for.

## Pin the version

State the version in your first sentence about any resource, because the same
property name means different things across them.

- **Presentation 3.0** and **Image 3.0** are what you write. Default to these.
- **Presentation 4.0** is a draft (`docs/api/presentation/4.0.md`, model in
  `4.0/model.md`). Use it only when asked for it by name.
- **Presentation 2.1** and **Image 2.1** are in `docs/` because a great deal of
  published IIIF is still v2, so consumers meet it. Read them to parse v2; the
  change logs (`3.0/change-log.md`) explain what moved.

A v2 document announces itself with `@context …/presentation/2/context.json` and
`@id`/`@type`; v3 uses `id`/`type`.

## Where the rest lives

| Question | File |
|---|---|
| Manifests, collections, canvases, ranges, annotations, every property | `api/presentation/3.0.md` |
| Which properties are required on which type | `api/presentation/3.0.md`, section "A. Summary of Property Requirements" |
| Image URL syntax, `info.json`, compliance levels | `api/image/3.0.md` |
| Allowed values for `behavior`, `viewingDirection`, `timeMode`, `motivation` | the property's own section in `api/presentation/3.0.md` — the value tables live in the spec |
| Terms someone registered *outside* the spec: extra motivations, services, selectors, profiles, accessibility features | `api/registry/` (several of its tables are empty upstream — that means nothing is registered, not that the crawl failed) |
| Which `rights` URIs are allowed | `api/presentation/3.0.md`, section `rights` — Creative Commons, RightsStatements.org, or a registered extension |
| `navPlace`, `georeference`, text granularity | `api/extension/` |
| Search within an object | `api/search/2.0.md` (deployed services are mostly `1.0.md`) |
| Access control, probe and token services | `api/auth/2.0.md` (deployed services are mostly `1.0.md`) |
| Publishing an activity stream of changes | `api/discovery/1.0.md` |
| Linking to a specific view — a canvas, a region, a time | `api/content-state/1.0.md` |
| What a client is allowed to assume, and why the spec is shaped this way | `api/annex/notes/design_principles.md` |
| JSON-LD rules the spec relies on | `api/annex/notes/jsonld.md` |
| Choosing an image server, a viewer, a library | `get-started/image-servers.md`, `get-started/iiif-viewers.md`, `get-started/tools.md` |
| Deciding what to publish at all | `guides/guide_for_implementers.md` |
| Raw JSON-LD contexts | `docs/context/` |

Links between documents are local paths, so follow them with `cat` and `sed`.
Every page keeps its origin in a `<!-- source: -->` comment on line 1.

## Check the work

Any IIIF you wrote or changed gets validated before you report it done.

```bash
python3 validate.py path/to/manifest.json          # local rules, then iiif.io's validator
python3 validate.py https://example.org/manifest   # validator fetches it — tests the endpoint too
python3 validate.py --local manifest.json          # nothing leaves this machine
```

Validating a URL is the stronger test: it catches a manifest that is correct on
disk but served with the wrong content-type, or whose `id` does not resolve.
Without `--local` the document is sent to iiif.io's hosted validator, so use
`--local` for anything unpublished.

The validator does not know what you meant to build. Also walk the requirements
table in `api/presentation/3.0.md` section A for every resource type you emitted,
and account for each RECOMMENDED property you left out — a manifest that
validates while omitting `thumbnail`, `summary`, `metadata` and `provider` is
valid and close to useless to a viewer.

## Keeping the corpus current

`docs/` is a crawl of iiif.io, dated by `docs/CRAWL.tsv`.

```bash
python3 refresh.py --check    # what changed upstream; writes nothing
python3 refresh.py            # fetch what changed, rebuild both indexes
```

`--check` compares each page against the `lastmod` in iiif.io's sitemap, and
reports documentation pages the corpus does not hold. Run it when a spec question
turns on recent wording, or when the answer you find contradicts a live service.

Changing how pages are cleaned or linked calls for `refresh.py --fresh`: pages
already on disk are otherwise left as they were fetched.
