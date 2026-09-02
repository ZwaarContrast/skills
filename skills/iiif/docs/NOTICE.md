# Notice

Everything under `docs/` is a crawl of <https://iiif.io>, not original work. Each
page records the URL it came from in a `<!-- source: -->` comment on its first
line, and `CRAWL.tsv` records when it was fetched.

## What IIIF states

**The specifications, registries, approved extensions and annex notes** carry
this line on the page itself, and our copies keep it:

> Copyright © 2012-2026 Editors and contributors. Published by the IIIF
> Consortium under the [CC-BY](http://creativecommons.org/licenses/by/4.0/)
> license.

**The Cookbook recipes, the guides, and the get-started pages state no license.**
Neither do their source repositories — `IIIF/api`, `IIIF/cookbook-recipes` and
`IIIF/guides` carry no licence file, and iiif.io publishes no site-wide terms.
They are reproduced here unmodified and attributed, on the same footing as
reading them on the site. Anyone redistributing this corpus further, or reusing
those parts in a product, should ask the IIIF Consortium rather than assume the
specifications' CC-BY extends to them.

## What was changed

Nothing in substance. `refresh.py` reformats mechanically: site navigation
removed, HTML tables and syntax-highlighted code turned back into Markdown, and
links between pages pointed at the local copies. `SECTIONS.tsv`, `RECIPES.tsv`
and `REQUIREMENTS.tsv` are generated indexes over that text. Running
`refresh.py --fresh` rebuilds the whole corpus from iiif.io.

The MIT `LICENSE` in the directory above covers this skill's own code —
`refresh.py`, `look.py`, `validate.py` and `SKILL.md` — not the crawled
documentation.

For anything normative the specifications at <https://iiif.io/api/> are the
authority; this is a copy for offline reading.
