<!-- source: https://iiif.io/api/registry/accessibility/ -->

## Status of this Document

This document is not subject to [semantic versioning](../annex/notes/semver.md "Versioning of APIs"). Changes will be tracked within the document.

**Editors:**

- **[Michael Appleby](https://orcid.org/0000-0002-1266-298X)**, Yale University

- **[Dawn Childress](https://orcid.org/0000-0003-2602-2788)**, UCLA

- **[Tom Crane](https://orcid.org/0000-0003-1881-243X)**, Digirati

- **[Jeff Mixter](https://orcid.org/0000-0002-8411-2952)**, OCLC

- **[Robert Sanderson](https://orcid.org/0000-0003-4441-6852)**, Yale University

- **[Julie Winchester](https://orcid.org/0000-0001-6578-764X)**, Duke University

*Copyright © 2012-2026 Editors and contributors. Published by the IIIF Consortium under the [CC-BY](http://creativecommons.org/licenses/by/4.0/ "Creative Commons — Attribution 4.0 International") license, see [disclaimer](https://iiif.io/api/annex/notes/disclaimer/).*

## Abstract

This document lists a set of allowed values for the Presentation API `provides` property that have been identified as useful for implementations, especially related to accessibility. They may be defined by the IIIF community, or outside of it.

Please send feedback to <iiif-discuss@googlegroups.com>

## 1. Introduction

This is one of a number of [IIIF registries](../registry.md "IIIF Extension Registry"). It lists a set of allowed values for the Presentation API `provides` property that have been identified as useful for implementations, especially related to accessibility. They may be defined by the IIIF community, or outside of it.

### 1.1. Disclaimer

The inclusion of entries in this document that are outside of the IIIF domain *must not* be interpreted as endorsement, support, or approval from the editors, the IIIF community or any individual. This annex is provided as a registry to advertise the existence of these extensions and attempt to ensure some consistency between implementations for common but not universal requirements.

### 1.2. Inclusion Process

The process for having a new entry added to this registry is [described here](https://iiif.io/api/registry/process/).

## 2. Requirements for Inclusion

## 3. Registry

This table summarizes the known values available for use with the [Presentation API](https://iiif.io/api/presentation/ "IIIF Presentation API") `provides` propery, which defines accessibility functionality that a linked resource enables for its target, describing why and how a client might use it rather than what the resource is by type or format. The current approved values are defined by Schema.org’s [Accessibility Properties for Discoverability Vocabulary](https://www.w3.org/community/reports/a11y-discov-vocab/CG-FINAL-vocabulary-20241209/#accessibilityFeature-vocabulary "Accessibility Properties for Discoverability Vocabulary") and the IIIF Community.

| Value | Description | Source |
|----|----|----|
| `closedCaptions` | … | Schema.org |
| `alternativeText` | … | Schema.org |
| `audioDescription` | … | Schema.org |
| `longDescription` | … | Schema.org |
| `signLanguage` | … | Schema.org |
| `highContrastAudio` | … | Schema.org |
| `highContrastDisplay` | … | Schema.org |
| `braille` | … | Schema.org |
| `tactileGraphic` | … | Schema.org |
| `transcript` | … | Schema.org |
| `translation` | … | IIIF |
| `subtitles` | … | IIIF |

## Appendices

### A. Acknowledgements

Thanks to the members of the [IIIF](https://iiif.io/community/ "IIIF Community") for their continuous engagement, innovative ideas and feedback.

### B. Change Log

| Date       | Description              |
|------------|--------------------------|
| 2026-XX-YY | New Version 4 Registries |
