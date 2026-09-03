# Notes from using this skill on a live system

Written after a long pass over a running IIIF implementation: a Presentation 3
server with its own Image API 3 service, Authorization Flow 2, the georeference
and navPlace extensions, transcription annotations, and a few hundred manifests
imported from ten institutions. Roughly thirty defects came out of it. This
records which of them the skill found, which it could not have found, and what
would have to change for it to find them next time.

Nothing here is a complaint about the corpus. The corpus was right every time it
was consulted. The gap is that most of what was wrong lived outside the document.

## What worked, unchanged

- **`look.py` then a line range.** Reading thirty lines of the specification
  beat recalling it, every time. The habit the skill asks for is the right one.
- **Pinning the version in the first sentence.** This mattered more than
  expected once real imported material was involved, where three versions of the
  Image API are live at once.
- **`RECIPES.tsv` and the recipe JSON.** Adapting a recipe's shape settled at
  least four arguments that the prose alone would have left open, including how
  a nested Range is written and how an Annotation Collection is referenced from
  a Manifest.
- **`validate.py`'s three verdicts.** `UNCHECKED` earning its own exit code is
  worth keeping. A clean run that checked nothing is the failure mode that
  matters, and the wording makes it visible.

## The thing the skill does not say, and should

**A validator checks a document against a schema. Almost every real defect was a
promise the document made that nothing kept.**

Every document in this system passed `validate.py --local` and passed the hosted
validator, throughout, including while it was publishing:

- a `thumbnail` whose URL answered 401 to the reader the manifest was published
  for
- a `partOf` naming a parent collection that same reader could not fetch
- a `rendering` pointing at a file that answered 404 to everybody, owner
  included, because of a mistaken guard
- painting bodies for 1119 canvases whose `id` was an image *service* base
  rather than an image request, so the body returned HTML or a redirect while
  declaring itself `image/jpeg`
- an image service published as `ImageService3` at `level2` when the server was
  Image API 1.1 at Stanford-profile level 2, so viewers built version 3 URLs
  against it
- a `sequence` Range listing 15 of 23 canvases, which a conforming viewer must
  use for ordering, so eight published pages were invisible
- a nested Range published as a reference to `/api/iiif/range/{id}`, a route
  that did not exist
- an Annotation Collection reporting `total: 5` when it held 236 annotations
- a root Collection listing nothing, so nothing published was reachable by
  crawling

None of these are schema violations. All of them are the document being wrong
about the world. The cheapest way to find them is not to read more
specification, it is to make something ask the document to keep its promises.

### Concretely, the four checks that found almost everything

1. **Follow every URI the document publishes, as the reader it was published
   to.** Fetch anonymously, not as the owner: the owner can read everything, so
   the owner's view proves nothing about a published document. Roughly half the
   defects above fell out of this one check on the first run.

2. **Decide "must this answer?" structurally, not by URL shape.** §id: "If the
   resource is embedded, it may also be dereferenceable. If the resource is
   referenced, it must be dereferenceable." A resource is embedded when the
   document handed it over, which is decidable: it carries `items`, or a `body`,
   or (navPlace says so in its own words) `features`. Everything else with an
   `id` is a reference and has to answer.

   This was learned the hard way. A first version of the checker excused
   `/api/iiif/range/` on the grounds that Ranges in `structures` are embedded,
   which is true, and that exemption then waved through a *nested* Range
   published as a bare reference to a route that did not exist. A list of path
   patterns only excuses the shapes somebody thought of.

3. **Fetch everything `info.json` advertises.** "An image service whose Image
   Information response includes the `sizes` property must support requests for
   the sizes listed, and a service whose Image Information response includes the
   `tiles` property must support requests for the sizes implicit in the `width`,
   `height` and `scaleFactors` values given for tiles." Check the pixels that
   come back, not the status code: a 200 carrying the wrong dimensions is
   invisible to a status check and is what makes a deep-zoom viewer tile
   crookedly. Do the same for `extraQualities`, `extraFormats` and
   `extraFeatures`: a declared `level2` is a promise about roughly twenty
   distinct requests.

4. **Check reachability, not just resolvability.** A document nothing links to
   from the root Collection is not published, whatever its visibility flag says,
   because the only way anyone finds it is by being told the URL. Walk out from
   the root and compare what that reaches against what the system believes it
   has published.

A fifth, for anything with access control: **a refusal is a result, not a
failure.** A checker that treats a restricted manifest's 401 on its images as a
defect reports dozens of false ones and hides the real signal. Assert the
refusal instead. It is a stronger check than skipping: a 200 there is the
finding.

## Corpus gaps that cost real time

- **The Web Annotation Data Model is not in the corpus, and Presentation 3
  leans on it.** `total` on an Annotation Collection is defined there.
  `api/presentation/3.0.md` §5.8 shows an example without `total` and says
  nothing about its meaning, so the natural reading (number of pages, since the
  collection is "an ordered list of Annotation Pages") is wrong. The correct
  meaning was eventually found in two places that are in the corpus but that
  nobody would think to search: `api/search/2.0.md` line 208, and
  `api/cookbook/recipe/0309-annotation-collection.md`. Either a pointer in
  SKILL.md's table, or a note under §5.8's entry, would have saved that.

- **Auth 2.0 says nothing about caching, and the rule that matters is in its
  introduction.** "Each version of a resource must have a distinct URI to
  prevent web caches from providing the wrong version" is the sentence that
  decides whether a probe result needs `Cache-Control: no-store` and `Vary:
  Authorization`. `look.py cache --file auth/2.0` finds nothing, because it is
  prose in §1 rather than a heading. A grep hint for this specific case is
  probably not worth it; a general note that the introductions carry normative
  statements would be.

- **Image API 1.1 is not held, and it is still deployed.** Gallica, one of the
  largest IIIF publishers in Europe, serves `.../full/full/0/native.jpg` from a
  service whose profile is a Stanford compliance URL. The corpus holds 2.1 and
  3.0 for exactly the right reason ("a great deal of published IIIF is still
  v2"), and the same argument applies one version further back. At minimum, the
  three dialects are worth a table in SKILL.md, because getting this wrong is
  silent: lenient servers answer the wrong request anyway, so it works in
  testing and fails on the strict one.

  | Version | Full size | Default quality | Type in a Presentation 3 document |
  |---|---|---|---|
  | 1.1 | `full` | `native` | `ImageService1` |
  | 2.x | `full` | `default` | `ImageService2` |
  | 3.0 | `max` | `default` | `ImageService3` |

  The type names are in `api/presentation/3.0.md` §service, under "For
  cross-version consistency, this specification defines the following values".
  That table is easy to miss and is the thing that tells you an older service
  may be written with `id`/`type` rather than `@id`/`@type`.

## A practical gotcha, not a specification one

`@iiif/parser`'s `convertPresentation2` **mutates the document it is given**: it
strips `@id` from nested resources as it upgrades. Code that keeps the raw
document as provenance and converts it in the same breath ends up storing
something the source never served, and code that reads the raw document after
converting reads a corpse. Clone first. Worth a line in the skill because the
upgrade path is the first thing anyone writes when they meet a v2 manifest, and
the damage is invisible until much later.

## Suggested additions, in the order I would make them

1. **A section in SKILL.md titled something like "Check the promises, not just
   the shape"**, holding the four checks above. This is the highest-value change
   by a wide margin. Everything the validator can catch, the validator already
   catches; this is the other half.

2. **The embedded-versus-referenced rule as a named rule**, with the §id quote
   and the structural test. It is the single most reusable idea from this pass,
   it is two sentences, and it is what makes check 1 mechanical rather than a
   matter of taste.

3. **The Image API dialect table**, plus the `ImageService1`/`ImageService2`
   pointer.

4. **A `--follow` mode for `validate.py`**, or a sibling script, that takes a
   URL and fetches every same-host URI the document publishes, applying the
   structural embedded test. It is about eighty lines. It would have found
   nine of the defects listed above on its first run, against a system whose
   documents were already passing every validator.

5. **A pointer to the Web Annotation Data Model** in the "Where the rest lives"
   table, for `total`, `startIndex`, `next`/`prev`, and the Collection paging
   vocabulary generally.

## One caution for whoever writes check 4

The checker is code, and it will be wrong before the implementation is. Two of
its early runs reported 161 and then 28 failures, all but three of them its own
misreadings: embedded ids it insisted must resolve, correct refusals on
restricted material, and a service id that needs query parameters. A checker
that cries wolf gets ignored, and the pass that follows is worse than no pass.

Make it name what it deliberately does not check, rather than skipping quietly.
The version that ended up useful prints its exemptions and fails when it finds a
route nobody wrote a probe for, so a gap in the check reads as a gap rather than
as a pass.

---

# Response — 2026-09-03

Every factual claim above was checked against the corpus before anything was
changed. All of them held, including the two that were easiest to get wrong: the
`total` vocabulary really is absent from `api/presentation/3.0.md` (zero
occurrences) and present only in `api/search/2.0.md` and cookbook recipe 0309,
and `@iiif/parser`'s `convertPresentation2` really does mutate its argument —
reproduced on 4.0.1, where nested `@id` becomes `undefined` while the root
survives.

One correction to the report, offered because it matters for anyone reusing the
quote: the `sizes`/`tiles` obligation is real but is **not** in the Image API
specification. It is in the compliance companion,
`api/image/3.0/compliance.md` §"At any level of compliance". SKILL.md now cites
it there, since that is another instance of the report's own theme — the
normative sentence lives somewhere nobody would search.

## 1. `follow.py` — the four checks, as a script

New file, run against a URL rather than a file, because the defects it looks for
only exist once something is published.

```bash
python3 <skill-dir>/follow.py https://example.org/iiif/manifest
python3 <skill-dir>/follow.py https://example.org/iiif/collection --reachable
python3 <skill-dir>/follow.py https://example.org/iiif/manifest --expect-restricted
```

- **Anonymous by design.** It sends no credentials, so what it sees is what a
  reader sees.
- **Structural embedded test**, not path patterns — the rule below.
- **`info.json` promises, measured in pixels.** `sizes` entries are fetched and
  the returned image's dimensions read from its own header (PNG, JPEG, GIF,
  WebP); `tiles` are fetched as real tile-region requests, one per
  `scaleFactor`, with the expected output size computed from the region and the
  factor. A 200 at the wrong size is a finding, which a status check cannot see.
- **Version mismatch.** It compares the declared `ImageService{1,2,3}` against
  the `@context` the service actually answers with, and reports the case the
  report describes — `ImageService3` declared over an older server — because
  that decides which URL syntax viewers build.
- **`--reachable`** crawls out from a root Collection and reports what is
  reachable, with each finding labelled by the manifest it came from.
- **`--expect-restricted`** inverts the verdict: refusals are expected and a 200
  is the finding. Without it, 401/403 are reported as `REFUSED` and never
  counted as failures.
- **`EXEMPT` is printed, always.** Anything not checked says so and why. A URI
  with no probe written for it is a finding, not a pass.
- **A 400-request budget** (`--budget`), so a 36-canvas manifest stays polite.
  Reaching it prints *"this run is incomplete"* rather than a clean result.

### The caution about crying wolf was well placed

It caught the checker twice during development, both times exactly as predicted.

Against Wellcome's `b18035723` the first version reported 12 failures. Three
were its own over-reach: a Range's `items` name Canvases the Manifest already
embeds, and those Canvas URIs are not separately served — the document handed
them over, so the link resolves within it. Per-occurrence embeddedness was the
wrong test; it now collects every id the document embeds anywhere and exempts
references to them, with the reason printed.

The second was worse in kind: when the request budget was reached, the
unfetched URLs were reported as `FAIL`. Sixty-two failures, four real. Budget
exhaustion is now `EXEMPT` and the run declares itself incomplete.

After both fixes the same manifest reports **4 findings and no false
positives** — a `sizes` array advertising `73,100` where the server returns
73×99, on a spec that says `w,h` means "exactly *w* and *h*".

The fixture is permanent. `follow.py --self-test` starts a local server
publishing a manifest with a thumbnail that 404s, a `partOf` naming a dead
route, a painting body whose `id` is a service base returning HTML under
`image/jpeg`, and a Range referencing an embedded Canvas. It asserts three
findings and that the fourth is exempt; removing the exemption makes it fail.

## 2. The embedded/referenced rule, named

SKILL.md has a section *Embedded or referenced* carrying the §`id` quote and the
structural test verbatim: a resource is embedded when the document handed its
content over — it carries `items`, a `body`, or, for navPlace, `features` —
and everything else with an `id` is a reference that has to answer. Both
`validate.py` and `follow.py` use it.

## 3. The Image API dialect table

In *Pin the version*, with the `ImageService1`/`ImageService2` pointer to
§`service` "For cross-version consistency" and the note that such a service may
use `@id`/`@type`.

**Image API 1.1 is now held**, with its compliance document. The argument was
accepted as given: the corpus holds 2.1 because published IIIF is still v2, and
that reasoning does not stop at 2.

## 4. Corpus gaps

- **`total`.** A row in *Where the rest lives* points at `api/search/2.0.md`
  §Annotation Collection and cookbook recipe 0309, and states the trap outright:
  it is the count of *annotations*, not of pages, borrowed from the W3C model
  and never defined by Presentation 3. The W3C model itself is not crawled —
  it is not iiif.io, and the pointer solves the reported problem.
- **Normative statements in introductions.** A note in *Find the section*, using
  the Auth 2.0 caching rule as the worked example, telling the reader to read the
  introduction when a lookup comes back empty rather than concluding the spec is
  silent.

## 5. `@iiif/parser` and `@iiif/helpers`

The mutation gotcha is a paragraph in *Pin the version*, beside the v2 upgrade
discussion where it will be met.

Both libraries' own documentation is now in the corpus at `ecosystem/`
(`README`, and for helpers its seven `docs/` pages), fetched by `refresh.py`
alongside everything else and indexed in `SECTIONS.tsv`, so `look.py thumbnail
--file ecosystem` works. Each file records the current npm version and peer
dependencies read from the registry, so `@iiif/helpers` requiring
`@iiif/parser ^4.0.0` as a peer cannot go stale silently.

## Not done

- **The W3C Web Annotation Data Model is not crawled.** It is a different site
  with a different structure, and `refresh.py` is built around iiif.io's
  sitemap. The pointer covers the vocabulary that actually came up. Say if the
  full model would earn its place.
- **`sizes`/`tiles` probing samples the first eight requests per service**, not
  the whole pyramid. Exhaustive probing of a deep-zoom service is thousands of
  requests against someone else's server.
- **No probe for non-image services** — Auth, Search, and the rest are reported
  as `EXEMPT` naming the service type, rather than guessed at.
