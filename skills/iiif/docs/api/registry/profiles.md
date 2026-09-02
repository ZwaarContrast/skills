<!-- source: https://iiif.io/api/registry/profiles/ -->

## Status of this Document

This document is not subject to [semantic versioning](../annex/notes/semver.md "Versioning of APIs"). Changes will be tracked within the document.

**Editors:**

- **[Michael Appleby](https://orcid.org/0000-0002-1266-298X)**, Yale University

- **[Tom Crane](https://orcid.org/0000-0003-1881-243X)**, Digirati

- **[Robert Sanderson](https://orcid.org/0000-0003-4441-6852)**, J. Paul Getty Trust

- **[Jon Stroop](https://orcid.org/0000-0002-0367-1243)**, Princeton University Library

- **[Simeon Warner](https://orcid.org/0000-0002-7970-7855)**, Cornell University

*Copyright © 2012-2026 Editors and contributors. Published by the IIIF Consortium under the [CC-BY](http://creativecommons.org/licenses/by/4.0/ "Creative Commons — Attribution 4.0 International") license, see [disclaimer](https://iiif.io/api/annex/notes/disclaimer/).*

## Abstract

This is one of a number of [IIIF registries](../registry.md "IIIF Extension Registry"). It lists a set of profile URIs that have been identified as useful for implementations, across the APIs. They may be defined by the IIIF community, or outside of it.

Please send feedback to <iiif-discuss@googlegroups.com>

## 1. Introduction

This is one of a number of [IIIF registries](../registry.md "IIIF Extension Registry"). It lists a set of profile URIs that have been identified as useful for implementations, across the APIs. They may be defined by the IIIF community, or outside of it.

### 1.1. Disclaimer

The inclusion of entries in this document that are outside of the IIIF domain *must not* be interpreted as endorsement, support, or approval from the editors, the IIIF community or any individual. This annex is provided as a registry to advertise the existence of these extensions and attempt to ensure some consistency between implementations for common but not universal requirements.

### 1.2. Inclusion Process

The process for having a new entry added to this registry is [described here](https://iiif.io/api/registry/process/).

## 2. Requirements for Inclusion

## 3. Registry

This table summarizes the known profiles available, for use with the [Presentation API](https://iiif.io/api/presentation/ "IIIF Presentation API").

| Profile | Description |
|----|----|
| http://www.loc.gov/mods/v3 | The URI for identifying [MODS (Metadata Object Description Schema)](https://www.loc.gov/standards/mods/) version 3 metadata records. |
| https://linked.art/ns/terms | The URI for identifying records that follow the [Linked Art model](https://linked.art/) and [API version 1](https://linked.art/api/1.0/). |
| http://www.lido-schema.org/ | The URI for identifying records that follow the [LIDO XML schema](https://cidoc.mini.icom.museum/working-groups/lido/lido-overview/). |
| https://www.wikidata.org/entity/Q115365241 | The URI for identifying the canonical JSON for information in [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page). |
| http://www.tdwg.org/standards/450 | The URI for identifying records that follow the [Darwin Core](http://www.tdwg.org/standards/450) schema. |
| http://www.loc.gov/standards/alto | The URI for identifying [ALTO](https://www.loc.gov/standards/alto/) which is used for encoding OCR text. |
| http://www.loc.gov/standards/marcxml | The URI for identifying [MarcXML](https://www.loc.gov/standards/marcxml/) metadata records. |
| http://purl.org/dc/terms/ | The URI for identifying records that follow the [Dublin Core Metadata Initiative Metadata Terms](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/) (NB: these are different from the legacy Dublin Core Metadata Element Set, Version 1.1, refered to as http://purl.org/dc/elements/1.1/). |
| https://www.europeana.eu/schemas/edm/ | The URI for identifying [EDM (Europeana Data Model)](https://pro.europeana.eu/page/edm-documentation) metadata records. |

## Appendices

### A. Acknowledgements

Thanks to the members of the [IIIF](https://iiif.io/community/ "IIIF Community") for their continuous engagement, innovative ideas and feedback.

### B. Change Log

| Date       | Description                            |
|------------|----------------------------------------|
| 2018-XX-YY | New Version 3 Registries               |
| 2023-XX-YY | Added MarcXML as a profile             |
| 2022-11-15 | Addition of EDM (Europeana Data Model) |
