<!-- source: https://iiif.io/api/registry/motivations/ -->

## Status of this Document

This document is not subject to [semantic versioning](../annex/notes/semver.md "Versioning of APIs"). Changes will be tracked within the document.

**Editors:**

- **[Michael Appleby](https://orcid.org/0000-0002-1266-298X)**, Yale University

- **[Tom Crane](https://orcid.org/0000-0003-1881-243X)**, Digirati

- **[Robert Sanderson](https://orcid.org/0000-0003-4441-6852)**, J. Paul Getty Trust

- **[Simeon Warner](https://orcid.org/0000-0002-7970-7855)**, Cornell University

- **[Dawn Childress](https://orcid.org/0000-0003-2602-2788)**, UCLA

- **[Jeff Mixter](https://orcid.org/0000-0002-8411-2952)**, OCLC Research

*Copyright © 2012-2026 Editors and contributors. Published by the IIIF Consortium under the [CC-BY](http://creativecommons.org/licenses/by/4.0/ "Creative Commons — Attribution 4.0 International") license, see [disclaimer](https://iiif.io/api/annex/notes/disclaimer/).*

## 1. Introduction

This is one of a number of [IIIF registries](../registry.md "IIIF Extension Registry"). It lists a set of Web Annotation motivations that have been identified as useful for implementations, for the Presentation and Search APIs. They may be defined by the IIIF community, or outside of it.

Please send feedback to <iiif-discuss@googlegroups.com>

### 1.1. Disclaimer

The inclusion of entries in this document that are outside of the IIIF domain *must not* be interpreted as endorsement, support, or approval from the editors, the IIIF community or any individual. This annex is provided as a registry to advertise the existence of these extensions and attempt to ensure some consistency between implementations for common but not universal requirements.

### 1.2. Inclusion Process

The process for having a new entry added to this registry is [described here](https://iiif.io/api/registry/process/).

## 2. Requirements for Inclusion

## 3. Registry

This table summarizes the motivations available for use within the current versions of the suite of IIIF specifications. There may be other motivations available for use with older versions of the specification.

| Motivation | Reference |
|----|----|
| `painting` | [Presentation API: Values for Motivation](../presentation/3.0.md#values-for-motivation) |
| `supplementing` | [Presentation API: Values for Motivation](../presentation/3.0.md#values-for-motivation) |
| `contextualizing` | [Content Search API: Search Term Context](../search/2.0.md#match-context) |
| `contentState` | [Content State API: Form of Annotation](../content-state/1.0.md#22-form-of-annotation) |

Additional motivations are available from the [W3 Web Annotation motivations](https://www.w3.org/TR/annotation-model/#motivation-and-purpose "Web Annotation Model - Motivation"). This table includes W3 motivations that are common or recommended for use in IIIF.

| Motivation | Reference |
|----|----|
| `highlighting` | [Content Search API: Search Term Highlighting](../search/2.0.md#match-highlighting) |
| `commenting` | [Recipe: Simplest Annotation](../cookbook/recipe/0266-full-canvas-annotation.md) |
| `tagging` | [Recipe: Simple Annotation - Tagging](../cookbook/recipe/0021-tagging.md) |

## Appendices

### A. Acknowledgements

Thanks to the members of the [IIIF](https://iiif.io/community/ "IIIF Community") for their continuous engagement, innovative ideas and feedback.

### B. Change Log

| Date       | Description                                                  |
|------------|--------------------------------------------------------------|
| 2022-11-15 | Add links to Content Search motivations                      |
| 2022-05-26 | Add known motivations, plus new `contextualizing` motivation |
| 2020-06-03 | New Version 3 Registries                                     |
