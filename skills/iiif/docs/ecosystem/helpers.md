<!-- source: https://github.com/IIIF-Commons/iiif-helpers -->

# @iiif/helpers

`@iiif/helpers` 4.0.0 on npm, from <https://github.com/IIIF-Commons/iiif-helpers>.
Peer dependencies: `@iiif/parser` ^4.0.0

## README.md

# `@iiif/helpers`

`@iiif/helpers` is a TypeScript utility library for building IIIF applications with Presentation 2.1, 3.0, and the supported parts of the Presentation 4.0 release candidate.

It combines:

- pure helpers for annotation targets, content state, language maps, and image services
- higher-level helpers for thumbnails, painting annotations, ranges, search, `navDate`, and transcriptions
- a normalized IIIF vault/store layer for loading, editing, serializing, and subscribing to IIIF resources

This repository publishes one npm package, `@iiif/helpers`, with a set of focused subpath entry points such as `@iiif/helpers/thumbnail` and `@iiif/helpers/vault/store`.

## What The Library Covers

- IIIF Presentation 2.1, 3.0, and supported Presentation 4 loading, upgrading, and normalization
- normalized storage and mutation of IIIF entities through the Vault
- selector parsing for `xywh`, temporal fragments, Image API selectors, and SVG selectors
- IIIF Content State parsing, encoding, decoding, validation, and normalization
- language map selection and localization helpers
- thumbnail and image-service candidate selection
- painting annotation extraction, choice handling, and media discovery
- range traversal, table-of-contents generation, and sequence calculation
- Search API 1 and 2 search/autocomplete stores
- transcript discovery and extraction from plain text, VTT, and supplemental annotations
- Presentation 4 Scene inspection and Activation transaction parsing
- vault-backed UI glue for events and styles

## Installation

`@iiif/parser` is a peer dependency and should be installed alongside the helpers package.

```bash
npm install @iiif/helpers @iiif/parser
```

```bash
pnpm add @iiif/helpers @iiif/parser
```

```bash
yarn add @iiif/helpers @iiif/parser
```

Notes:

- Node.js 22 or newer is required.
- The package ships ESM, CJS, and TypeScript declarations for each public entry point.
- If you parse SVG selectors in Node, provide a `DOMParser` implementation such as `jsdom` or `happy-dom`.
- If you use remote loading in Node, a modern runtime with built-in `fetch` is the simplest setup.

## Import Strategy

Use the root package when you want the common surface area:

```ts
import { Vault, createThumbnailHelper, getValue, expandTarget } from "@iiif/helpers";
```

Use subpath imports when you want a smaller, more explicit import surface or when you need packages that are not re-exported from the root:

```ts
import { getCanvasTranscription } from "@iiif/helpers/transcriptions";
import { Vault4 } from "@iiif/helpers/vault-4";
import { createStore } from "@iiif/helpers/vault/store";
import { entityActions } from "@iiif/helpers/vault/actions";
import { Vault as NodeVault } from "@iiif/helpers/vault-node";
```

The root entry point includes feature helpers such as transcriptions, Search 2, Scenes, and Activations. It does **not** re-export:

- `@iiif/helpers/vault-4`
- `@iiif/helpers/vault-node`
- `@iiif/helpers/vault/actions`
- `@iiif/helpers/vault/store`
- `@iiif/helpers/vault/utility`
- `@iiif/helpers/vault/global-vault`

## Presentation 3 Quick Start

```ts
import { Vault, getValue, createThumbnailHelper } from "@iiif/helpers";

const vault = new Vault();
const manifest = await vault.loadManifest("https://iiif.io/api/cookbook/recipe/0005-image-service/manifest.json");

if (!manifest) {
  throw new Error("Manifest failed to load");
}

const firstCanvas = vault.get(manifest.items[0]);
const label = getValue(manifest.label, { language: "en-GB" });

const thumbnails = await createThumbnailHelper(vault).getBestThumbnailAtSize(firstCanvas, {
  width: 300,
  height: 300,
});

console.log(label);
console.log(thumbnails.best);
```

For a native Presentation 4 normalized model, choose `Vault4` when the application is created:

```ts
import { Vault4 } from "@iiif/helpers/vault-4";

const vault = new Vault4();
const manifest = await vault.loadManifest("https://example.org/manifest.json");

if (!manifest) {
  throw new Error("Manifest failed to load");
}

const firstContainer = vault.get(manifest.items[0]);
const presentation4 = vault.toPresentation4(manifest);
```

## Entry Points

The package is organized as subpath exports. The table below is the complete public entry-point map from `package.json`.

| Entry point                          | Re-exported from `@iiif/helpers` | Purpose                                                                                     |
| ------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------- |
| `@iiif/helpers`                      | n/a                              | Convenience entry point for the main helpers.                                               |
| `@iiif/helpers/events`               | Yes                              | Vault-backed event registration for IIIF resources.                                         |
| `@iiif/helpers/i18n`                 | Yes                              | Language map and localization helpers.                                                      |
| `@iiif/helpers/styles`               | Yes                              | Vault-backed style metadata helpers.                                                        |
| `@iiif/helpers/thumbnail`            | Yes                              | Best-thumbnail resolution for collections, manifests, canvases, annotations, and resources. |
| `@iiif/helpers/annotation-targets`   | Yes                              | Selector and target parsing for IIIF and W3C annotations.                                   |
| `@iiif/helpers/content-state`        | Yes                              | Content State parsing, encoding, decoding, and normalization.                               |
| `@iiif/helpers/fetch`                | Yes                              | Fetch and upgrade Presentation manifests and collections.                                   |
| `@iiif/helpers/painting-annotations` | Yes                              | Painting annotation flattening and choice/media extraction.                                 |
| `@iiif/helpers/ranges`               | Yes                              | Range traversal, TOC generation, and range selection helpers.                               |
| `@iiif/helpers/sequences`            | Yes                              | Visible-canvas and page-order helpers for paged/continuous/individuals behavior.            |
| `@iiif/helpers/search1`              | Yes                              | Search API 1 search and autocomplete stores.                                                |
| `@iiif/helpers/search2`              | Yes                              | Search API 2 search and autocomplete stores.                                                |
| `@iiif/helpers/image-service`        | Yes                              | Image-service loading, prediction, candidate extraction, and selection.                     |
| `@iiif/helpers/nav-date`             | Yes                              | Date-navigation trees from `navDate` values.                                                |
| `@iiif/helpers/vault`                | Yes                              | Core `Vault` class, types, and singleton helper.                                            |
| `@iiif/helpers/vault-4`              | No                               | Native Presentation 4 Vault and profile discriminator.                                      |
| `@iiif/helpers/vault-node`           | No                               | Node-oriented `Vault` with fetch support.                                                   |
| `@iiif/helpers/vault/global-vault`   | No                               | Global singleton bridge for browser-global environments.                                    |
| `@iiif/helpers/vault/actions`        | No                               | Action constants and creators for vault state updates.                                      |
| `@iiif/helpers/vault/store`          | No                               | Zustand-based store factory and reducers used by the vault.                                 |
| `@iiif/helpers/vault/utility`        | No                               | Lower-level helpers for fetch pipelines and store access.                                   |
| `@iiif/helpers/transcriptions`       | Yes                              | Transcript detection and extraction helpers.                                                |
| `@iiif/helpers/scenes`               | Yes                              | Presentation 4 Scene paintables, targets, and transforms.                                   |
| `@iiif/helpers/activations`          | Yes                              | Presentation 4 Activation discovery and transaction parsing.                                |

## Package Reference

### `@iiif/helpers`

The root entry point is a convenience export for the most commonly used helpers. It re-exports:

- `events`
- `activations`
- `annotation-values`
- `styles`
- `thumbnail`
- `i18n`
- `content-state`
- `annotation-targets`
- `painting-annotations`
- `ranges`
- `sequences`
- `vault`
- `fetch`
- `search1`
- `search2`
- `scenes`
- `nav-date`
- `image-service`
- `transcriptions`

Use it when you want a single import surface for most browser-side work.

### `@iiif/helpers/annotation-targets`

This package normalizes IIIF and W3C annotation targets into a predictable `SpecificResource`-shaped structure.

Key exports:

- `expandTarget`
- `parseSelector`
- `parseRotation`
- `splitCanvasFragment`
- `isImageApiSelector`
- `isValidCanvasFragment`
- `isRectangle`
- `polygonToBoundingBox`
- `serializeSupportedSelector`
- selector and target result types such as `SupportedTarget`, `BoxSelector`, `PointSelector`, `SvgSelector`, `TemporalSelector`, and `TemporalBoxSelector`

What it handles:

- plain canvas ids
- `#xywh=` fragments
- temporal fragments such as `#t=...`
- `SpecificResource` targets
- Image API selectors
- SVG selectors with normalized geometry and extracted style data
- targets with embedded selector fragments in `source.id`

Important notes:

- SVG selector parsing is best in the browser or with a provided `DOMParser`.
- The returned structure is designed to be easier to render than raw W3C selectors.
- `expandTarget()` always returns a `type: 'SpecificResource'` shape with `source`, `selector`, and `selectors`.

Example:

```ts
import { expandTarget } from "@iiif/helpers/annotation-targets";

const target = expandTarget("https://example.org/canvas-1#xywh=100,200,300,400");

console.log(target.selector?.type);
// BoxSelector
```

Selector-only example:

```ts
import { parseSelector } from "@iiif/helpers/annotation-targets";

const parsed = parseSelector({
  type: "FragmentSelector",
  value: "xywh=10,20,300,400&t=5,12.5",
});

console.log(parsed.selector);
// {
//   type: 'TemporalBoxSelector',
//   spatial: { x: 10, y: 20, width: 300, height: 400, unit: 'pixel' },
//   temporal: { startTime: 5, endTime: 12.5 }
// }
```

### `@iiif/helpers/content-state`

This package works with IIIF Content State values.

Key exports:

- `parseContentState`
- `serialiseContentState`
- `encodeContentState`
- `decodeContentState`
- `validateContentState`
- `normaliseContentState`
- related types such as `ContentState`, `StateSource`, and `NormalisedContentState`

What it does:

- parses already-decoded JSON strings
- parses base64url-encoded content state strings
- optionally fetches remote content state resources when called asynchronously
- encodes and decodes content state payloads
- normalizes different content state shapes into a consistent annotation form

Important notes:

- Validation is intentionally light-weight at the moment. It should be treated as a sanity check rather than full spec enforcement.
- Normalization uses the annotation-target helpers internally, so spatial selectors become structured selector objects instead of raw fragments.

Example:

```ts
import {
  parseContentState,
  serialiseContentState,
  validateContentState,
  normaliseContentState,
} from "@iiif/helpers/content-state";

const encoded = serialiseContentState({
  id: "https://example.org/canvas-1#xywh=100,200,300,400",
  type: "Canvas",
  partOf: [{ id: "https://example.org/manifest-1", type: "Manifest" }],
});

const parsed = parseContentState(encoded);
const [valid, error] = validateContentState(parsed, true);

if (!valid) {
  throw new Error(error?.reason ?? "Invalid content state");
}

const normalized = normaliseContentState(parsed);
console.log(normalized.target[0].selector);
```

### `@iiif/helpers/events`

This is a small vault-backed event registry for IIIF resources.

Key exports:

- `createEventsHelper`

The helper gives you:

- `addEventListener(resource, event, listener, scope?)`
- `removeEventListener(resource, event, listener)`
- `getListenersAsProps(resourceOrId, scope?)`

It stores event handlers in vault meta so you can attach UI behavior to resources before they are rendered. This is especially useful in component-based UIs where passing callbacks down through many layers would otherwise be awkward.

Example:

```ts
import { Vault } from "@iiif/helpers";
import { createEventsHelper } from "@iiif/helpers/events";

const vault = new Vault();
const events = createEventsHelper(vault);
const annotation = { id: "https://example.org/annotation/1", type: "Annotation" };

events.addEventListener(annotation, "onClick", (_event, resource) => {
  console.log("Clicked", resource.id);
});

const props = events.getListenersAsProps(annotation);

// React:
// <div {...props} />

// DOM:
// element.addEventListener('click', props.onClick);
```

### `@iiif/helpers/fetch`

This package exports a single helper:

- `fetch`

It fetches a Manifest or Collection and upgrades the response through `@iiif/parser/upgrader`, which makes it convenient when you want to support both Presentation 2 and Presentation 3 sources before loading them into a vault.

Example:

```ts
import { fetch as fetchIiif } from "@iiif/helpers/fetch";

const resource = await fetchIiif("https://example.org/manifest.json");
```

### `@iiif/helpers/i18n`

This package contains language-map helpers and a simple template-tag helper for localized strings.

Key exports:

- `getClosestLanguage`
- `buildLocaleString`
- `getValue`
- `getAvailableLanguagesFromResource`
- `createStringHelper`
- `iiifString`

Typical uses:

- select the best value from an IIIF language map
- apply explicit fallback languages
- detect languages used anywhere inside a collection, manifest, canvas, or range
- build localized labels inline with template literals

Example:

```ts
import { getValue, iiifString } from "@iiif/helpers/i18n";

const label = getValue({ fr: ["Titre"], en: ["Title"] }, { language: "fr" });
const summary = iiifString`Label: ${{ en: ["An English label"] }}`;
```

Fallback example:

```ts
import { buildLocaleString } from "@iiif/helpers/i18n";

const label = buildLocaleString({ en: ["English title"], fr: ["Titre francais"], none: ["Untitled"] }, "cy-GB", {
  fallbackLanguages: ["en-GB", "en"],
  defaultText: "Untitled manifest",
});
```

### `@iiif/helpers/image-service`

This is the low-level image-service package used by the thumbnail helpers and useful on its own when you need to inspect or select image delivery options.

Key exports:

- `ImageServiceLoader`
- `createImageServiceStore`
- `imageServices`
- `getImageCandidates`
- `getImageCandidatesFromService`
- `getFixedSizeFromImage`
- `getFixedSizesFromService`
- `getCustomSizeFromService`
- `getImageFromTileSource`
- `getImageServerFromId`
- `getSmallestScaleFactorAsSingleImage`
- `pickBestFromCandidates`
- `imageSizesMatch`
- `inferImageSizeFromUrl`
- `sampledTilesToTiles`
- `isImage3`
- `isBestMatch`
- image candidate/result types

What it is good for:

- turning content resources and image services into a ranked set of image candidates
- picking the best candidate for a desired width/height or min/max constraints
- preloading or sampling image service responses
- predicting compatible services on known image servers to reduce repeated network work
- exposing service-loading state through a vanilla Zustand store

Important notes:

- `ImageServiceLoader` has both synchronous and asynchronous loading paths.
- The store returned by `createImageServiceStore()` includes both a Zustand `store` and an event emitter.
- The candidate model distinguishes fixed images, fixed-size services, variable services, and unknown-size images.

Example:

```ts
import { ImageServiceLoader, getImageCandidates, pickBestFromCandidates } from "@iiif/helpers/image-service";

const loader = new ImageServiceLoader();

const resource = {
  id: "https://example.org/image/full/max/0/default.jpg",
  type: "Image",
  width: 1200,
  height: 800,
  service: [
    {
      id: "https://example.org/image",
      type: "ImageService3",
      profile: "level1",
    },
  ],
} as any;

const candidates = getImageCandidates(resource, false, loader);
const choice = pickBestFromCandidates({ width: 300, height: 200 }, [() => candidates]);

console.log(choice.best);
console.log(choice.fallback);
```

### `@iiif/helpers/nav-date`

This package builds navigation trees from `navDate`.

Key exports:

- `createDateNavigation`
- date-navigation types such as `DateNavigationCentury`, `DateNavigationDecade`, `DateNavigationYear`, `DateNavigationMonth`, and `DateNavigationDay`

How it behaves:

- it reads `navDate` values from items in a Collection or Manifest
- it groups them into century, decade, year, month, and day buckets
- if you do not pass an explicit level, it automatically collapses through single-item levels and returns the most useful level

Use it when you want archive-style time browsing or date facets built directly from IIIF metadata.

Example:

```ts
import { Vault } from "@iiif/helpers";
import { createDateNavigation } from "@iiif/helpers/nav-date";

const vault = new Vault();
const collection = vault.loadSync("https://example.org/collection", {
  id: "https://example.org/collection",
  type: "Collection",
  label: { en: ["Archive"] },
  items: [
    {
      id: "https://example.org/manifest/1986",
      type: "Manifest",
      label: { en: ["Issue 1986"] },
      navDate: "1986-01-01T00:00:00+00:00",
    },
    {
      id: "https://example.org/manifest/1987",
      type: "Manifest",
      label: { en: ["Issue 1987"] },
      navDate: "1987-01-01T00:00:00+00:00",
    },
  ],
});

const years = createDateNavigation(vault, collection!, "year");

for (const year of years) {
  console.log(year.label.en?.[0], year.count);
}
```

### `@iiif/helpers/painting-annotations`

This package is for flattening painting annotations into a simpler renderable structure.

Key exports:

- `createPaintingAnnotationsHelper`
- `parseSpecificResource`
- `Paintables`
- choice-related types such as `SingleChoice`, `ComplexChoice`, and `ChoiceDescription`

The helper gives you:

- `getAllPaintingAnnotations(canvasOrId)`
- `getPaintables(canvasOrAnnotations, enabledChoices?)`
- `extractChoices(canvasOrAnnotations)`

What it does:

- resolves all painting annotations on a canvas
- unwraps `SpecificResource` bodies
- handles `Choice` bodies and records the available/selected choices
- returns a list of paintable resources with their original annotation, target, selector, and normalized type

This is useful when you are rendering mixed media, alternative image choices, or need a flat list of paintable bodies from a canvas.

Example:

```ts
import { Vault } from "@iiif/helpers";
import { createPaintingAnnotationsHelper } from "@iiif/helpers/painting-annotations";

const vault = new Vault();
const manifest = await vault.loadManifest("https://example.org/manifest.json");

if (!manifest) {
  throw new Error("Manifest failed to load");
}

const canvas = vault.get(manifest.items[0]);
const painting = createPaintingAnnotationsHelper(vault);
const paintables = painting.getPaintables(canvas);

console.log(paintables.types);
console.log(paintables.choice);

for (const item of paintables.items) {
  console.log(item.type, item.resource.id, item.selector);
}
```

### `@iiif/helpers/ranges`

This package covers traversal and interpretation of IIIF ranges.

Key exports:

- `createRangeHelper`
- `findFirstCanvasFromRange`
- `findFirstCanvasFromRangeWithSelector`
- `findAllCanvasesInRange`
- `findManifestSelectedRange`
- `findSelectedRange`
- `rangeToTableOfContentsTree`
- `rangesToTableOfContentsTree`
- `isRangeContiguous`
- `RangeTableOfContentsNode`

What it is good for:

- finding the first canvas represented by a range
- flattening all canvases found inside nested ranges
- determining which range contains a given canvas
- building a nested table-of-contents tree with canvas leaves and parent links
- checking whether a range is contiguous within a known canvas order, including gap and subset reporting

Important notes:

- `rangeToTableOfContentsTree()` creates a structured tree that is ready to render.
- `rangesToTableOfContentsTree()` creates a virtual root when you pass multiple top-level ranges.
- `isRangeContiguous()` can optionally return detailed diagnostics about invalid ranges, missing canvases, and gaps.

Example:

```ts
import { Vault } from "@iiif/helpers";
import { rangeToTableOfContentsTree, isRangeContiguous } from "@iiif/helpers/ranges";

const vault = new Vault();
const manifest = await vault.loadManifest("https://example.org/manifest.json");

if (!manifest || !manifest.structures?.length) {
  throw new Error("Manifest has no ranges");
}

const range = vault.get(manifest.structures[0]);
const toc = rangeToTableOfContentsTree(vault, range);
const [isContiguous, detail] = isRangeContiguous(vault, range, manifest.items, { detail: true });

console.log(toc?.items?.map((item) => item.label));
console.log(isContiguous, detail?.gaps);
```

### `@iiif/helpers/search1`

This package contains helpers for IIIF Search API 1.

Key exports:

- `findSearch1Service`
- `findAutocompleteService`
- `createSearch1Store`
- `createSearch1AutocompleteStore`
- store types such as `Search1Store`, `Search1AutocompleteStore`, `Search1Service`, and `SingleSearchHit`

What it provides:

- a search store that queries a Search API 1 service, keeps `resources` and `hits`, and supports hit highlighting
- an autocomplete store that queries autocomplete endpoints and keeps a result list
- automatic aborting of in-flight requests when a new search replaces an old one

Example:

```ts
import { createSearch1Store, createSearch1AutocompleteStore } from "@iiif/helpers/search1";

const service = {
  "@id": "https://example.org/search",
  profile: "http://iiif.io/api/search/1/search",
  service: {
    "@id": "https://example.org/search/autocomplete",
    profile: "http://iiif.io/api/search/1/autocomplete",
  },
} as any;

const store = createSearch1Store(service);
await store.getState().search({ q: "1615" });
store.getState().highlightHit(0);

const autocomplete = createSearch1AutocompleteStore(service);
await autocomplete.getState().search("wunder");
```

### `@iiif/helpers/search2`

This package contains helpers for IIIF Search API 2.

Key exports:

- `findSearch2Service`
- `findSearch2AutocompleteService`
- `createSearch2Store`
- `createSearch2AutocompleteStore`
- Search 2 service, query, result, and store types

The stores manage search and autocomplete requests, abort superseded requests, expose ignored query parameters, and support navigating highlighted hits.

Example:

```ts
import { createSearch2Store, findSearch2Service } from "@iiif/helpers/search2";

const service = findSearch2Service(manifest);

if (service) {
  const store = createSearch2Store(service);
  await store.getState().search({ q: "example", motivation: "commenting" });
  store.getState().highlightHit(0);

  console.log(store.getState().resources);
}
```

### `@iiif/helpers/sequences`

This package calculates visible canvases and page order from IIIF behavior.

Key exports:

- `createSequenceHelper`
- `getVisibleCanvasesFromCanvasId`
- `getManifestSequence`

It understands manifest and range behaviors such as:

- `paged`
- `continuous`
- `individuals`
- canvas-level `facing-pages`
- canvas-level `non-paged`

Use it when you need to answer questions like:

- which canvases should be visible when canvas `X` is selected?
- what are the page groups for a paged interface?
- should this manifest render as single pages, spreads, or one continuous strip?

Example:

```ts
import { Vault } from "@iiif/helpers";
import { getManifestSequence, getVisibleCanvasesFromCanvasId } from "@iiif/helpers/sequences";

const vault = new Vault();
const manifest = await vault.loadManifest("https://example.org/manifest.json");

if (!manifest) {
  throw new Error("Manifest failed to load");
}

const [items, pageGroups] = getManifestSequence(vault, manifest);
const visible = getVisibleCanvasesFromCanvasId(vault, manifest, items[0].id);

console.log(pageGroups);
console.log(visible);
```

### `@iiif/helpers/styles`

This is a small vault-backed style metadata helper.

Key exports:

- `createStylesHelper`
- `StyleDefinition`
- `StyledHelper`

The helper gives you:

- `applyStyles(resource, scope, styles)`
- `getAppliedStyles(resource)`

It is useful when style information lives outside the IIIF resource but still needs to follow the same resource ids, for example annotation colors, highlight state, or editor-only presentation metadata.

Example:

```ts
import { Vault } from "@iiif/helpers";
import { createStylesHelper } from "@iiif/helpers/styles";

const vault = new Vault();
const styles = createStylesHelper(vault);
const annotation = { id: "https://example.org/annotation/1", type: "Annotation" };

vault.batch(() => {
  styles.applyStyles(annotation, "selected", { background: "red" });
  styles.applyStyles(annotation, "hovered", { background: "pink" });
});

console.log(styles.getAppliedStyles(annotation));
```

### `@iiif/helpers/thumbnail`

This package is the high-level thumbnail helper built on top of the image-service utilities.

Key exports:

- `getThumbnail`
- `createThumbnailHelper`
- `imageServiceLoader`
- thumbnail input/output types

What it accepts:

- string ids or URLs
- collection, manifest, canvas, annotation, annotation page, and content-resource references
- normalized IIIF resources

What it returns:

- `best`: the chosen thumbnail candidate
- `fallback`: other viable candidates
- `log`: explanation messages from the candidate-selection process

What it does:

- follows explicit `thumbnail` properties where present
- falls back to painted resources when needed
- dereferences and inspects image services when appropriate
- chooses the best available result for a requested size or constraint set

Example:

```ts
import { Vault } from "@iiif/helpers";
import { createThumbnailHelper, getThumbnail } from "@iiif/helpers/thumbnail";

const vault = new Vault();
const manifest = await vault.loadManifest("https://example.org/manifest.json");

if (!manifest) {
  throw new Error("Manifest failed to load");
}

const canvas = vault.get(manifest.items[0]);
const helper = createThumbnailHelper(vault);
const result = await helper.getBestThumbnailAtSize(canvas, { width: 256, height: 256 });

const quickResult = await getThumbnail(canvas, {
  vault,
  width: 512,
  height: 512,
  returnAllOptions: true,
});

console.log(result.best);
console.log(quickResult.fallback);
```

### `@iiif/helpers/transcriptions`

This package is focused on transcript detection and extraction.

Key exports:

- `canvasHasTranscriptionSync`
- `canvasLoadExternalAnnotationPages`
- `getCanvasTranscription`
- `manifestHasTranscriptions`
- `annotationPageToTranscription`
- `vttToTranscription`
- `timeStampToSeconds`

What it supports:

- plain text renderings on canvases
- `text/vtt` supplemental bodies on AV canvases
- `TextualBody` and `text/plain` supplemental annotations
- external annotation pages that need to be loaded before transcript detection

Returned transcription objects include:

- `plaintext`
- `segments`
- selector/timing information for segments when available

Important notes:

- VTT files are parsed into segment records with temporal selectors.
- External annotation pages can be loaded on demand with `canvasLoadExternalAnnotationPages()`.
- ALTO renderings are detected, but ALTO parsing is not implemented yet, so those paths currently return `null`.

Example:

```ts
import { Vault } from "@iiif/helpers";
import { manifestHasTranscriptions, getCanvasTranscription } from "@iiif/helpers/transcriptions";

const vault = new Vault();
const manifest = await vault.loadManifest("https://example.org/manifest.json");

if (!manifest) {
  throw new Error("Manifest failed to load");
}

const hasTranscriptions = await manifestHasTranscriptions(vault, manifest);

if (hasTranscriptions) {
  const canvas = vault.get(manifest.items[0]);
  const transcription = await getCanvasTranscription(vault, canvas);

  console.log(transcription?.plaintext);
  console.log(transcription?.segments[0]?.selector);
}
```

### `@iiif/helpers/vault`

This is the core stateful package in the library.

Key exports:

- `Vault`
- `globalVault`
- vault types such as `VaultOptions`, `Entities`, `IIIFStore`, `RequestState`, `MetaState`, and related action/type helpers

The `Vault` is a normalized Presentation 3 resource store with loading, mutation, serialization, subscription, and helper methods. It accepts Presentation 2.1 and 3.0 input, plus supported non-3D Presentation 4 input through the parser's Presentation 3 compatibility projection. Its profile never changes after construction.

Major capabilities:

- load manifests, collections, and other IIIF resources with `load()`, `loadManifest()`, and `loadCollection()`
- load synchronously from already-available JSON with `loadSync()`
- access normalized resources with `get()` and `hydrate()`
- navigate safely with `deep()`
- subscribe to store changes with `subscribe()`
- listen to dispatched actions with `on()`
- batch state changes with `batch()` and `asyncBatch()`
- serialize resources back to Presentation 2 or Presentation 3 with `toPresentation2()` and `toPresentation3()`
- manage per-resource meta state with `setMetaValue()` and `getResourceMeta()`
- paginate paged collections with `getPaginationState()` and `loadNextPage()`
- inspect the detected source version and normalization diagnostics with `getLoadReport()`

The `Vault` also includes higher-level object wrappers:

- `getObject()`
- `loadObject()`
- `loadManifestObject()`
- `loadCollectionObject()`
- `wrapObject()` and `isWrapped()` methods on the class

Those wrapped objects resolve nested references through getters and expose helper methods like `refresh()`, `reactive()`, `unwrap()`, `toJSON()`, `toPresentation2()`, and `toPresentation3()`.

Example:

```ts
import { Vault } from "@iiif/helpers/vault";

const vault = new Vault();
const manifest = await vault.loadManifest("https://example.org/manifest.json");

if (!manifest) {
  throw new Error("Manifest failed to load");
}

const firstCanvas = vault.get(manifest.items[0]);
vault.setMetaValue([firstCanvas.id, "ui", "selected"], true);

console.log(vault.getResourceMeta(firstCanvas.id, "ui"));

const wrapped = vault.getObject(manifest);
console.log(wrapped.items[0].id);
console.log(wrapped.items[0].unwrap());
```

### `@iiif/helpers/vault-4`

This package provides the explicit Presentation 4 Vault contract.

Key exports:

- `Vault4`
- `isVault4`
- Presentation 4-specific option, reference, and result types

`Vault4` shares the core Vault runtime while using Presentation 4 normalization and serialization. It preserves Canvas, Timeline, Scene, CollectionPage, and other Presentation 4 identities, and can serialize loaded resources with `toPresentation2()`, `toPresentation3()`, or `toPresentation4()`.

Use `isVault4()` instead of `instanceof Vault4` when a Vault may come from another installed copy of `@iiif/helpers`.

Example:

```ts
import { isVault4, Vault4 } from "@iiif/helpers/vault-4";

const vault = new Vault4();
const manifest = await vault.loadManifest("https://example.org/manifest.json");

if (manifest && isVault4(vault)) {
  console.log(vault.getLoadReport(manifest.id));
  console.log(vault.toPresentation4(manifest));
}
```

### `@iiif/helpers/vault-node`

This is the Node-oriented vault package.

Key exports:

- `Vault`
- `globalVault`
- the same core types re-exported by `@iiif/helpers/vault`

The `Vault` class in this package extends the core vault and configures a Node-friendly fetch path. Use it when you want vault behavior in server-side code and you do not want to wire a custom fetcher yourself.

Example:

```ts
import { Vault } from "@iiif/helpers/vault-node";

const vault = new Vault();
const manifest = await vault.loadManifest("https://example.org/manifest.json");

console.log(manifest?.id);
```

### `@iiif/helpers/vault/actions`

This package exposes the vault's Redux-style action constants and action creators.

Examples include:

- `entityActions`
- `mappingActions`
- `metaActions`
- `requestActions`
- `addReference`
- `modifyEntityField`
- `moveEntity`
- `moveEntities`
- `updateReference`
- `changeReferenceIdentifier`
- request lifecycle constants such as `REQUEST_RESOURCE`, `RESOURCE_READY`, and `RESOURCE_ERROR`

Use it when you are integrating the vault store directly or building custom tooling on top of the same reducer model.

Example:

```ts
import { Vault } from "@iiif/helpers/vault";
import { entityActions } from "@iiif/helpers/vault/actions";

const vault = new Vault();
const manifest = await vault.loadManifest("https://example.org/manifest.json");

if (!manifest) {
  throw new Error("Manifest failed to load");
}

vault.dispatch(
  entityActions.modifyEntityField({
    id: manifest.id,
    type: "Manifest",
    key: "label",
    value: { en: ["Updated title"] },
  })
);
```

### `@iiif/helpers/vault/store`

This package exposes the underlying store factory and reducers used by the vault.

Key exports:

- `createStore`
- `reducers`
- `VaultStoreState`
- `VaultZustandStore`

The store is built with vanilla Zustand plus Redux-style reducers. Use it when you want to embed the vault state model into an existing application architecture rather than always going through the `Vault` class.

Example:

```ts
import { emptyManifest } from "@iiif/parser";
import { createStore } from "@iiif/helpers/vault/store";
import { entityActions } from "@iiif/helpers/vault/actions";

const store = createStore();
const manifestId = "https://example.org/manifest-1";

store.dispatch(
  entityActions.importEntities({
    entities: {
      Manifest: {
        [manifestId]: {
          ...emptyManifest,
          id: manifestId,
          type: "Manifest",
          items: [],
        },
      },
    },
  })
);

store.dispatch(
  entityActions.modifyEntityField({
    id: manifestId,
    type: "Manifest",
    key: "label",
    value: { en: ["An example label"] },
  })
);

console.log(store.getState().iiif.entities.Manifest[manifestId]);
```

### `@iiif/helpers/vault/utility`

This package contains lower-level utility helpers used by the vault internals and occasionally useful for advanced integrations.

Key exports:

- `actionListFromResource`
- `areInputsEqual`
- `createFetchHelper`
- `getDefaultEntities`
- `resolveIfExists`
- `resolveList`

These are useful when you want to:

- build your own fetch-to-actions pipeline
- inspect or recreate the vault's normalization defaults
- resolve reference lists against a store directly
- reuse the vault's selector-equality logic

Example:

```ts
import { Vault } from "@iiif/helpers/vault";
import { createFetchHelper } from "@iiif/helpers/vault/utility";

const vault = new Vault();

const fetchManifest = createFetchHelper(vault, async (url: string) => {
  return {
    id: url,
    type: "Manifest",
    label: { en: ["Generated manifest"] },
    items: [],
  };
});

const manifest = await fetchManifest("https://example.org/manifest.json");
console.log(manifest?.id);
```

### `@iiif/helpers/vault/global-vault`

This is a small compatibility bridge for global/browser-based setups.

Key export:

- `getGlobalVault`

It returns `globalThis.IIIF_VAULT` if one already exists, and if not, it will try to initialize one from a global `IIIFVault` object. In modern module-based applications, `globalVault()` from `@iiif/helpers/vault` is usually the clearer API. This subpath is mostly useful when working with browser globals or legacy integration points.

Example:

```ts
import { getGlobalVault } from "@iiif/helpers/vault/global-vault";

const vault = getGlobalVault();
console.log(vault);
```

## Choosing The Right Package

If you are not sure where to start:

- start with `@iiif/helpers` for general browser-side helper work
- use `@iiif/helpers/vault` when you want normalized loading and resource access
- use `@iiif/helpers/vault-4` when your application needs a native Presentation 4 model
- use `@iiif/helpers/thumbnail` and `@iiif/helpers/image-service` for image selection and delivery logic
- use `@iiif/helpers/annotation-targets` and `@iiif/helpers/content-state` for viewer/deeplink interoperability
- use `@iiif/helpers/ranges`, `@iiif/helpers/sequences`, and `@iiif/helpers/nav-date` for navigation structures
- use `@iiif/helpers/search1`, `@iiif/helpers/search2`, and `@iiif/helpers/transcriptions` for discovery and text experiences
- use `@iiif/helpers/scenes` and `@iiif/helpers/activations` for the tested Presentation 4 3D helper surface

## Repo Docs And Demos

There are also focused notes and examples in this repository:

- [Annotation targets](https://github.com/IIIF-Commons/docs/annotation-targets.md)
- [Content State](https://github.com/IIIF-Commons/docs/content-state.md)
- [Events](https://github.com/IIIF-Commons/docs/events.md)
- [i18n](https://github.com/IIIF-Commons/docs/i18n.md)
- [Objects](https://github.com/IIIF-Commons/docs/objects.md)
- [Styles](https://github.com/IIIF-Commons/docs/styles.md)
- [Thumbnails](https://github.com/IIIF-Commons/docs/thumbnails.md)
- [Demos](https://github.com/IIIF-Commons/demos/index.html)

## Presentation 4

Presentation 4 uses an explicit, lifetime-stable Vault contract. Choose the normalized model when the application is created; loading a resource never replaces the Vault or changes its profile.

### Choose a Vault Contract

| API      | Accepted input                              | Normalized application model | Intended use                                                                              |
| -------- | ------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| `Vault`  | Presentation 2.1, 3.0, supported non-3D 4.0 | Presentation 3               | Existing applications; Presentation 4 Timeline resources are projected to Canvas          |
| `Vault4` | Presentation 2.1, 3.0, and 4.0              | Presentation 4               | New applications that need Timeline, Scene identity, CollectionPage, or other v4 concepts |

A Vault's normalized version is fixed for its lifetime. Parser conversion
happens once when a resource is loaded; helpers consume the resulting model.

### Existing Presentation 3 applications

No version branch is needed:

```ts
import { Vault } from "@iiif/helpers/vault";

const vault = new Vault();
const manifest = await vault.loadManifest(manifestUrl);

// Canvas for v2/v3 input and for a compatible v4 Timeline projection.
const firstCanvas = vault.get(manifest.items[0]);
```

A Presentation 4 Scene cannot be represented faithfully as Presentation 3.
The compatibility path throws a
`Presentation4CompatibilityError` with structured diagnostics instead of
silently dropping it.

### Presentation 4 applications

```ts
import { Vault4 } from "@iiif/helpers/vault-4";

const vault = new Vault4();
const manifest = await vault.loadManifest(manifestUrl);
const firstContainer = vault.get(manifest.items[0]);

const presentation4 = vault.toPresentation4(manifest);
```

`firstContainer` remains a Canvas, Timeline, or Scene. `Vault4` also accepts
Presentation 2.1 and 3.0 input and upgrades it once during ingestion.

### Load Reports

Both Vaults retain the detected source version. `Vault4` also retains parser
normalization warnings such as deterministic ID minting:

```ts
const report = vault.getLoadReport(manifestUrl);

// {
//   sourceVersion: 2 | 3 | 4 | "unknown",
//   diagnostics: [...]
// }
```

Reports are stored for both the requested URL and the canonical resource ID
when they differ.

### Explicit Page Loading

Loading a Collection or AnnotationCollection does not implicitly fetch its
pages. Page chains are an explicit Vault operation:

```ts
const collection = await vault.loadCollection(collectionUrl);
const state = await vault.loadPageChain(collection);
const members = vault.getPaginatedItems(collection);
```

CollectionPage and AnnotationPage entities remain independently addressable.
The derived member list is ordered and deduplicated. Cycles and broken links
stop safely and are exposed on `state.error`; loaded prefixes are retained.

### Helper Compatibility

Shared helpers accept either fixed Vault profile. Canvas-specific functions remain Canvas-specific; `findAllContainersInRange` and the Container transcription APIs cover Canvas, Timeline, and Scene without relabeling them. Painting, thumbnail, transcription, and Scene helpers consistently resolve nested Choice, Composite, List, Independents, and SpecificResource bodies, including authored Choice defaults.

### Deliberate Scene and Activation Support

Two optional subpaths expose the first tested 3D vertical slices:

```ts
import { createSceneHelper } from "@iiif/helpers/scenes";
import { createActivationsHelper } from "@iiif/helpers/activations";

const scenes = createSceneHelper(vault4);
const paintables = scenes.getPaintables(scene);

const activations = createActivationsHelper(vault4);
const annotations = activations.getAllActivatingAnnotations(manifest);
const transaction = activations.parseActivatingAnnotation(annotations[0]);
```

The initial supported surface is intentionally narrow:

- Model paintables are returned as a known Scene paintable type.
- SpecificResource selectors, transforms, and action order are preserved.
- Activating annotations can be collected and parsed into ordered steps.
- Unrecognized Scene body types remain available as `unknown` with `rawType`.

The helpers do not compose or render Scenes, apply transforms, choose cameras,
calculate lighting, spatialize audio emitters, or execute activation actions.
Camera, light, audio-emitter, animation, and nested extension subtrees are not
normalized into helper-specific models unless a tested vertical slice is added.

## Development

This checkout pins the exact Parser preview used for development and testing.
Install from the lockfile and run the coordinated gates directly:

```sh
pnpm install --frozen-lockfile
pnpm run fmt:check
pnpm run lint
pnpm run lint:pkg
pnpm run typecheck
pnpm exec vitest run
```

Run `pnpm fmt` to apply the shared oxfmt configuration. The checked-in Zed settings use oxfmt on save and oxlint on type.

The packed gate installs the pinned Parser preview and a packed Helpers tarball
into a fresh consumer, imports every public subpath through ESM and CommonJS,
and compiles NodeNext and Bundler consumers with `skipLibCheck: false`.

## License

MIT

## SEARCH.md

# Search 1 Helper

The Search 1 helper wraps a IIIF Search API 1 service in small Zustand vanilla stores.

It exports:

- `findSearch1Service(manifest)`
- `findAutocompleteService(searchService)`
- `createSearch1Store(serviceOrEndpoint, options?)`
- `createSearch1AutocompleteStore(searchService, options?)`

You can import from the dedicated entrypoint:

```ts
import {
  createSearch1AutocompleteStore,
  createSearch1Store,
  findAutocompleteService,
  findSearch1Service,
} from "@iiif/helpers/search1";
```

## Finding the Search Service

If you already have a manifest, use `findSearch1Service()` to pull the Search API 1 service from its `service` array.

```ts
import { findSearch1Service } from "@iiif/helpers/search1";

const searchService = findSearch1Service(manifest);

if (!searchService) {
  console.log("This manifest does not expose a Search API 1 service");
}
```

The helper looks for either of these profiles:

- `SearchService1`
- `http://iiif.io/api/search/1/search`

If you already have the search endpoint URL, you can skip discovery and pass the string directly to `createSearch1Store()`.

## Search Store

`createSearch1Store()` creates a vanilla Zustand store for executing searches and stepping through hits.

```ts
import { createSearch1Store, findSearch1Service } from "@iiif/helpers/search1";

const service = findSearch1Service(manifest);
const search = createSearch1Store(service || undefined);

await search.getState().search({ q: "1615" });

console.log(search.getState().resources);
console.log(search.getState().hits);
```

If you only have an endpoint:

```ts
import { createSearch1Store } from "@iiif/helpers/search1";

const search = createSearch1Store("https://example.org/iiif/search");

await search.getState().search({ q: "birds" });
```

### Search query

The search helper accepts the Search API 1 query params supported by the implementation:

- `q`
- `motivation`
- `date`
- `user`

```ts
await search.getState().search(
  {
    q: "wunder",
    motivation: "painting",
  },
  {
    headers: {
      Authorization: "Bearer token",
    },
  }
);
```

### Search store state

The store exposes:

- `endpoint`: resolved search endpoint
- `service`: current search service object
- `lastQuery`: last submitted query object
- `resources`: `json.resources` from the search response
- `hits`: `json.hits`, or generated hits when the response does not include them
- `loading`: `true` while a request is in flight
- `error`: `true` when the last request failed
- `errorMessage`: last fetch error message
- `hasSearch`: `true` when a search service is configured
- `hasAutocomplete`: `true` when the search service includes an autocomplete service
- `hitIndex`: currently highlighted hit index
- `highlight`: the currently highlighted hit and its matching resources

### Search store actions

- `search(query, options?)`: execute a search request
- `setSearchService(service)`: replace the active search service and reset store state
- `clearSearch()`: clears `resources`, `error`, and `errorMessage`
- `highlightHit(index)`: set the active hit and matching resources
- `nextHit()`: move to the next hit
- `previousHit()`: move to the previous hit

### Highlighting results

Use `highlightHit()` after a search to select a specific hit and pull out the matching annotation resources.

```ts
await search.getState().search({ q: "1615" });

search.getState().highlightHit(0);

console.log(search.getState().highlight.hit);
console.log(search.getState().highlight.results);

search.getState().nextHit();
search.getState().previousHit();
```

## Autocomplete Store

`createSearch1AutocompleteStore()` creates a second store for the nested autocomplete service.

```ts
import { createSearch1AutocompleteStore, findSearch1Service } from "@iiif/helpers/search1";

const service = findSearch1Service(manifest);
const autocomplete = createSearch1AutocompleteStore(service || undefined);

await autocomplete.getState().search("wunder");

console.log(autocomplete.getState().results);
```

To inspect the autocomplete service without creating a store:

```ts
import { findAutocompleteService } from "@iiif/helpers/search1";

const autocompleteService = service ? findAutocompleteService(service) : undefined;
```

The helper looks for either of these profiles:

- `AutoCompleteService1`
- `http://iiif.io/api/search/1/autocomplete`
- `http://iiif.io/api/search/0/autocomplete`

### Autocomplete query

The autocomplete helper accepts:

- `query`: the text input, sent as `q`
- `motivation`
- `date`
- `user`
- `headers`

```ts
await autocomplete.getState().search("wunder", {
  user: "https://example.org/users/1",
  headers: {
    Authorization: "Bearer token",
  },
});
```

### Autocomplete store state

The store exposes:

- `hasAutocomplete`
- `endpoint`
- `results`
- `lastQuery`
- `loading`
- `error`
- `errorMessage`
- `ignored`

### Autocomplete store actions

- `search(query, options?)`
- `setSearchService(service)`
- `clearSearch()`

## Implementation Notes

- Both helpers abort the previous in-flight request before starting a new one.
- `createSearch1Store()` throws `No search service found.` if you call `search()` without an endpoint.
- `createSearch1AutocompleteStore()` does nothing when there is no autocomplete service.
- Autocomplete does not fetch for short queries under 3 characters unless at least one of `motivation`, `date`, or `user` is provided.
- Search results with a `search` property but no `url` property are normalized so `url` is set to the same value.
- If the Search API response does not include `hits`, the helper generates them from `resources` using each annotation id and `resource.chars`.

## Minimal Example

```ts
import { createSearch1AutocompleteStore, createSearch1Store, findSearch1Service } from "@iiif/helpers/search1";

const service = findSearch1Service(manifest);

if (!service) {
  throw new Error("Search service not found");
}

const search = createSearch1Store(service);
const autocomplete = createSearch1AutocompleteStore(service);

await autocomplete.getState().search("wun");
console.log(autocomplete.getState().results);

await search.getState().search({ q: "wunder" });
search.getState().highlightHit(0);

console.log(search.getState().highlight);
```

## docs/annotation-targets.md

# Annotation targets

:::info
This helper does not require `@iiif/vault` to work and the helpers can be used on any loaded Presentation 3 resource.
:::

When working with IIIF Annotations you will come across various types of Annotation targets supported by the
[W3C Annotation Model](https://www.w3.org/TR/annotation-model/#bodies-and-targets). In IIIF most Annotations will
target a IIIF Canvas, either the whole Canvas or a region of it. This helper aims to make parsing selectors easier.

It offers the following helpers:

- `expandTarget`
- `parseSelector`

### expandTarget()

This helper has the following signature:

```typescript
function expandTarget(
  target: W3CAnnotationTarget | W3CAnnotationTarget[],
  options: {
    typeMap?: Record<string, string>;
    domParser?: DOMParser;
    svgPreprocessor?: (svg: string) => string;
  } = {}
): SupportedTarget;
```

You can use this on any `annotation.target` property defined in a IIIF Canvas or external Annotation Page.

```ts
import { expandTarget } from "@iiif/vault-helpers/annotation-targets";

const expanded = expandTarget("https://example.org/canvas#xywh=1,2,3,4");
/*
{
  type: 'BoxSelector',
  spatial: {
    x: 1,
    y: 2,
    width: 3,
    height: 4,
  }
}
*/
```

In addition to strings, it will also support expanded variations:

```json
{
  "type": "SpecificResource",
  "source": "https://example.org/canvas",
  "selector": {
    "type": "FragmentSelector",
    "value": "xywh=1,2,3,4"
  }
}
```

### parseSelector()

This helper is used by `expandTarget()` and is simply a way to parse only the selector and not the full target. For
example:

```ts
import { parseSelector } from "@iiif/vault-helpers/annotation-targets";

const expanded = parseSelector({
  type: "FragmentSelector",
  value: "xywh=1,2,3,4",
});

/*
{
  type: 'BoxSelector',
  spatial: {
    x: 1,
    y: 2,
    width: 3,
    height: 4,
  }
}
*/
```

## Supported targets

With both helpers, the returned objects will have a custom shape to make it the selectors predictable. This is
defined in the Typescript types and should offer completion when using the library in supported editors. Every selector
will have the following shape:

```ts
interface SupportedSelector {
  type: string;
  temporal?: {
    startTime: number;
    endTime?: number;
  };
  spatial?: {
    unit?: "percent" | "pixel";
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  points?: [number, number][];
  svg?: string;
  svgShape?: SvgShapeType; // 'rect' | 'circle' | 'ellipse' | 'line' | 'polyline' | 'polygon' | 'path'
  style?: SelectorStyle; // { fill?: string, strokeWidth: ... }
}
```

Using this you can progressively support more complex selectors for your viewer. For example, if you support the
`.spatial` property to render boxes, you will still see more complex SVG selectors highlighted by a bounding box.
Although this is not fully representative of the selector, it is better than not showing the selector!

All selectors can optionally have a temporal element, indicating that they should only be displayed between the
`startTime` and `endTime` for Canvases with a duration.

Currently, the following selectors are created by the helper:

- `BoxSelector` - a non-rotated box, with a non-zero `spatial.height` and `spatial.width`
- `PointSelector` - a single point without a `spatial.height` or `spatial.width`
- `SvgSelector` - an SVG shape, with style extracted and a bounding box in `spatial`
- `TemporalSelector` - only time selector
- `TemporalBoxSelector` - BoxSelector with additional temporal property

:::tip

If you find an unsupported selector, please [Raise an issue on GitHub](https://github.com/IIIF-Commons/vault-helpers/issues/new).

:::

If you are using Typescript or an editor that supports types you can narrow the types and get accurate completions:

```typescript
switch (selector.type) {
  case "BoxSelector":
  // selector.spatial.width; // number
  case "PointSelector":
  // selector.spatial.width; // undefined
}
```

### BoxSelector

The box selector will be returned when there is a compatible [media fragment](https://www.w3.org/TR/media-frags/)
selector, the fragment will be parsed - along with the unit (`pixel` / `percent`).

Example output:

```js
{
  type: 'BoxSelector',
  spatial: {
    unit: 'pixel',
    x: 1,
    y: 2,
    width: 3,
    height: 4,
  }
}
```

### PointSelector

The box selector will be returned when there is a compatible [media fragment](https://www.w3.org/TR/media-frags/)
selector without a height or width, the fragment will be parsed - along with the unit (`pixel` / `percent`).

Example output:

```js
{
  type: 'PointSelector',
  spatial: {
    unit: 'pixel',
    x: 1,
    y: 2,
  }
}
```

### SVG Selector

The SVG selector is more complicated than the others. It requires `DOMParser` which is available in the browser or can
be installed using `happy-dom` or `jsdom` for usage in NodeJS.

Given the following SVG:

```svg
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <g>
    <rect x="100" y="100" width="300" height="300" stroke="#000" fill="#fff"/>
  </g>
</svg>
```

The following will be returned:

```js
{
  points: [
    [ 100, 100 ],
    [ 400, 100 ],
    [ 400, 400 ],
    [ 100, 400 ],
    [ 100, 100 ]
  ],
  spatial: {
    height: 300,
    unit: "pixel",
    width: 300,
    x: 100,
    y: 100
  },
  style: {
    fill: "#fff",
    stroke: "#000"
  },
  svg: "<svg width=\"800\" height=\"600\" xmlns=\"http://www.w3.org/2000/svg\"><g><rect x=\"100\" y=\"100\" width=\"300\" height=\"300\"></rect></g></svg>",
  svgShape: "rect",
  type: "SvgSelector"
}
```

A lot happened during the parsing of this selector:

- **The style was extracted from the SVG** - this makes rendering the SVGs directly more predictable.
- **A bounding box was detected around the SVG** - a fallback, if it is impractical to support full SVGs
- **A list of points were extracted** - if you are rendering using an HTML Canvas, these can easily be used in draw calls.
- **The SVG shape was detected** - This may be useful if you want to support a subset of SVG selectors.

This helper has been tested with commonly used Annotation tools that output SVGs.

### TemporalSelector

Temporal selectors are common for Audio and Video content in IIIF. They usually use media frags `#t=10,20`

:::caution
Temporal selectors **do not support** time formatted in HH:mm:ss like `t=00:00,02:34`. All time fragments are expected
to be in seconds.
:::

```js
{
  type: 'TemporalSelector',
  temporal: {
    startTime: 10,
    endTime: 20
  }
}
```

### TemporalBoxSelector

This is a combination of the BoxSelector and TemporalSelector, where media frags contain both a spatial and temporal
element. e.g. `#t=10,20&xwyh=100,200,300,400`

```js
{
  type: 'TemporalSelector',
  spatial: {
    unit: 'pixel',
    x: 100,
    y: 200,
    width: 300,
    height: 400,
  },
  temporal: {
    startTime: 10,
    endTime: 20
  }
}
```

## docs/content-state.md

# Content State

:::info
This helper does not require `@iiif/vault` to work and the helpers can be used on any loaded Presentation 3 resource.
:::

Collection of helpers that can encode, decode and normalize IIIF Content State to be read by viewers.

Available helpers:

- `parseContentState(stateString, isAsync)`
- `normaliseContentState(annotation)`
- `serialiseContentState(annotation)`
- `encodeContentState(stateString)`
- `decodeContentState(encodedContentState)`
- `validateContentState(annotation)`

### parseContentState(state)

This is the primary helper that can be used to parse content state. The input can either be an encoded
string or a decoded JSON string.

```ts
import { parseContentState } from "@iiif/vault-helpers/content-state";

const state = parseContentState("JTdCJTIyaWQlMjIlM0ElM ...");
/* => 
{
  id: 'https://example.org/object1/canvas7#xywh=1000,2000,1000,2000',
  type: 'Canvas',
  partOf: [{ id: 'https://example.org/object1/manifest', type: 'Manifest' }],
} 
*/
```

Once parsed, the content state can be normalized - or used like this. If the content state is a remote
resource, you can pass the `isAsync` and await the result. This will fetch the remote annotation:

```js
import { parseContentState } from "@iiif/vault-helpers/content-state";

const state = await parseContentState("https://example.org/content-state/123.json", true);
```

### normaliseContentState(stateString, isAsync)

Given the following decoded content state:

```json
{
  "@context": "http://iiif.io/api/presentation/3/context.json",
  "id": "https://example.org/import/1",
  "type": "Annotation",
  "motivation": ["contentState"],
  "target": {
    "id": "https://example.org/object1/canvas7#xywh=1000,2000,1000,2000",
    "type": "Canvas",
    "partOf": [
      {
        "id": "https://example.org/object1/manifest",
        "type": "Manifest"
      }
    ]
  }
}
```

The normalisation step will produce:

```js
{
  "id": "https://example.org/import/1",
  "type": "Annotation",
  "motivation": ["contentState"],
  "target": [{
    "selector": {
      "spatial": {
        "height": 2000,
        "unit": "pixel",
        "width": 1000,
        "x": 1000,
        "y": 2000,
      },
      "type": "BoxSelector",
    },
    "selectors": [
      {
        "spatial": {
          "height": 2000,
          "unit": "pixel",
          "width": 1000,
          "x": 1000,
          "y": 2000,
        },
        "type": "BoxSelector",
      },
    ],
    "source": {
      "id": "https://example.org/object1/canvas7",
      "partOf": [{
         "id": "https://example.org/object1/manifest",
         "type": "Manifest",
      }],
      "type": "Canvas",
    },
    "type": "SpecificResource",
  }],
}
```

### serialiseContentState(state)

This will produce a base64 encoded content state that can be used and decoded by another viewer.

```ts
import { serialiseContentState } from "@iiif/vault-helpers/content-state";

const encoded = serialiseContentState({
  id: "https://example.org/object1/canvas7#xywh=1000,2000,1000,2000",
  type: "Canvas",
  partOf: [{ id: "https://example.org/object1/manifest", type: "Manifest" }],
}); // => JTdCJTIyaWQlMjI...
```

### encodeContentState(stateString)

Similar to `serialiseContentState` but it _must_ already be a JSON string.

```ts
import { serialiseContentState } from "@iiif/vault-helpers/content-state";

const encoded = serialiseContentState(`{
  "id": "https://example.org/object1/canvas7#xywh=1000,2000,1000,2000",
  "type": "Canvas",
  "partOf": [{ "id": "https://example.org/object1/manifest", "type": "Manifest" }],
}`); // => JTdCJTIyaWQlMjI...
```

### decodeContentState(encodedContentState)

This is the counter-part to `encodeContentState()`, returning a JSON string that can be passed to `JSON.parse()`.

```ts
const state = parseContentState("JTdCJTIyaWQlMjIlM0ElM ...");

// -> '{"id": "https://example.org/object1/canvas7#xywh=1000,2000,1000,2000", ...
```

This uses the [Annotation targets](https://github.com/IIIF-Commons/annotation-targets.md) helper internally to parse the selector within
the content state.

### validateContentState(state)

:::danger
Validation is still a work in progress.
:::

Takes in a decoded content state, either as an Object or a JSON string.

```ts
validateContentState(`
{ 
  "type": "Annotation", 
  "target": "https://example.org/canvas-1",
  "partOf": "https://example.org/manifest", 
}
`); // -> true
```

The second argument `strict` will ensure that the content state has a `partOf` if the "type" is a canvas.

## docs/events.md

# Events helper

Events let you bind browser events to IIIF resources, potentially before they are rendered in the DOM. You still have
to bind the events, but those events could come from many sources.

Useful in UI frameworks where an alternative may be to drill down props through layers of components.

```tsx
import { createEventsHelper } from "@iiif/vault-helpers/styles";

const vault = new Vault();
const events = createEventsHelper(vault);

const annotation = { id: "https://example.org/anno-1", type: "Annotation" };

// You can bind multiple callbacks to a single event.
events.addEventListener(annotation, "onClick", () => {
  console.log("Anno clicked");
});

// Where you render:
const props = events.getListenersAsProps(annotation);
$el.addEventListener("click", props.onClick);

// In React this might look like:
<div className="anno" {...props} />;
```

### Supported events

Currently, the events helper does not parse the value of the event passed to `addEventListener` and will simply
combine them into the same property. So can name the event whatever you require for your application. For example, you
could create a `onAnnotationSelected` event that is passed down to a custom component.

This can be a useful way to bake in an extension point for your viewers or libraries.

## docs/i18n.md

# i18n

:::info
This helper does not require `@iiif/vault` to work and the helpers can be used on any loaded Presentation 3 resource.
:::

Some useful helpers for parsing language maps.

### getValue()

Takes in a language map and returns the best fitting language based on the browser.

```ts
import { getValue, buildLocaleString } from "@iiif/vault-helpers/i18n";

// Simple utility.
const str1 = getValue(manifest.label); // string based on browser
```

### buildLocaleString()

A helper that can be used to link to existing i18n libraries and implementations.

```ts
import { buildLocaleString } from "@iiif/vault-helpers/i18n";

const str2 = buildLocaleString(
  manifest.label, // { en: ["Line 1", "Line 2"], none: ["Fallback"] }
  "en-GB",
  {
    fallbacks: ["en-US", "en"],
    defaultText: "Untitled manifest",
    separator: "<br/>",
    closest: false,
    strictFallback: true,
  }
); // => "Line 1<br/>Line 2"
```

### getClosestLanguage()

**Definition:**

```ts
function getClosestLanguage(
  i18nLanguage: string,
  languages: string[],
  i18nLanguages: string[] = [],
  strictFallback = false
);
```

**Example**

```ts
import { getClosestLanguage } from "@iiif/vault-helpers/i18n";

// Simple utility.
const lang = getClosestLanguage(
  "en-GB", // users current language
  ["en", "cy", "none"] // available languages in content
); // => en
```

## docs/objects.md

# Objects

This helper aims to make resources from Vault easier to use.

## Loading resources

The objects helper has a similar to API to the main vault API. You can call:

- `load()`
- `loadManifest()`
- `loadCollection()`
- `get`

From the objects helper, and two additional utilities: `wrapObject()` which converts a vault object to a wrapped one and `isWrapped` to check for wrapped objects.

```ts
const vault = new Vault();
const objects = createObjectsHelper(vault);

await vault.loadManifest("https://example.org/manifest"); // As normal

const manifest = objects.get("https://example.org/manifest");

// or.. combined

await objects.loadManifest("https://example.org/manifest");
```

## Resource API

You can access all properties using property accessors like normal JS objects. Any deeper references will be resolved.

```ts
const manifest = objects.get("https://example.org/manifest");

manifest.label; // works
manifest.items[0].label; // also works
```

:::caution

**When you call `manifest.items[0]` this object is created each time. Which results in the following:**

```ts
manifest.items[0] !== manifest.items[0]; // false!
```

:::

Because of the equality issue, there is an additional API for these objects:

```ts
manifest.items[0].is(manifest.items[0]); // true
manifest.items[0].is("https://example.org/canvas-1"); // true
```

Available APIs on all objects:

- `is()` - returns if the resource is another resource (compare string ids or refs or wrapped objects etc.)
- `reactive()` - this will make the object reactive to changes, useful if you are making an editor
- `unreactive()` - turns off reactivity
- `refresh()` - manually refreshes the properties on the manifest
- `unwrap()` - returns the original vault object, can be used for comparing (`objectA.unwrap() === objectB.unwrap()`)
- `toJSON()` - returns the object as a plain object, does not filter out empty properties
- `toPresentation3()` - similar to `toJSON()` but compresses and removes empty properties
- `toPresentation2()` - converts to valid Presentation 2.
- `subscribe()` - Pass a function to that will be called whenever this resource changes - makes the object a compatible store.

## docs/styles.md

# Styles helper

The styles helper is glue that can be used between two parts of an application to both define and apply style
information associated with IIIF resources, such as Annotations. The styles helper uses Vaults "meta" feature to
store this extra style information.

**Example usage**

```ts
import { createStyleHelper } from "@iiif/vault-helpers/styles";

const vault = new Vault();
const styles = createStyleHelper(vault);

const manifest = { id: "https://example.org/manifest-1", type: "Manifest" };

// Apply a style somewhere you in your app
styles.applyStyle(
  manifest,
  {
    background: "red",
  },
  "scope-1"
);

// Somewhere else..
styles.applyStyle(
  manifest,
  {
    someCustomStyle: "foo",
  },
  "scope-2"
);

// Where you render:
const applied = styles.getAppliedStyles(manifest);
// {
//  'scope-1': { background: 'red' },
//  'scope-2': { someCustomStyle: 'foo' }
// }
```

## docs/thumbnails.md

# Thumbnails

:::danger
This helper is still a work in progress. It may return thumbnails that are not optimized for delivery by image services
and be slower to load.
:::

Work-in-progress vault-driven thumbnails.

```ts
import { createThumbnailHelper } from "@iiif/vault-helpers/thumbnail";

const vault = new Vault();
const helper = createThumbnailHelper(vault);

const thumbnail = helper.getBestThumbnailAtSize(canvas, { width: 256, height: 256 });
// thumbnail.best.id
```

Available options:

```ts
interface Options {
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  fallback?: boolean;
  atAnyCost?: boolean;
  unsafeImageService?: boolean;
  returnAllOptions?: boolean;
  allowUnsafe?: boolean;
  preferFixedSize?: boolean;
  explain?: boolean;
}
```
