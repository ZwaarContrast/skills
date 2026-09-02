<!-- source: https://iiif.io/api/registry/services/ -->

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

This is one of a number of [IIIF registries](../registry.md "IIIF Extension Registry"). It lists a set of services that have been identified as useful for implementations, across the APIs. They may be defined by the IIIF community, or outside of it.

Please send feedback to <iiif-discuss@googlegroups.com>

## 1. Introduction

This is one of a number of [IIIF registries](../registry.md "IIIF Extension Registry"). It lists a set of services that have been identified as useful for implementations, across the APIs. They may be defined by the IIIF community, or outside of it.

### 1.1. Disclaimer

The inclusion of entries in this document that are outside of the IIIF domain *must not* be interpreted as endorsement, support, or approval from the editors, the IIIF community or any individual. This annex is provided as a registry to advertise the existence of these extensions and attempt to ensure some consistency between implementations for common but not universal requirements.

### 1.2. Inclusion Process

The process for having a new entry added to this registry is [described here](https://iiif.io/api/registry/process/).

## 2. Requirements for Inclusion

## 3. Registry

This table summarizes the services available and which APIs they may be used in. The ‘![not allowed](https://iiif.io/api/assets/images/icons/metadata-api/not_allowed.png "Not allowed")’ icon means that the service is not to be used in the API. The ‘![recommended](https://iiif.io/api/assets/images/icons/metadata-api/recommended.png "Recommended")’ icon means that the service can be used in the API.

| Service | Image API | Presentation API |
|----|:--:|:--:|
| [Image Information](../image/3.0.md "Image API") | OPTIONAL | RECOMMENDED |

### 3.1 Image Information

*Added: 2014-05-20*

The Image Information service allows the [Presentation API](../presentation/3.0.md "Presentation API"), and potentially other APIs, to reference content to be displayed via the [Image API](../image/3.0.md "Image API"). The JSON-LD content to be referenced or embedded is the Image Information document, also known as `info.json`. The service *must* have the `@context`, `@id` and `profile` keys, pointing to the context document, service base URI and compliance level profile respectively.

``` json
{
  "service": {
    "@context" : "http://iiif.io/api/image/2/context.json",
    "@id" : "http://www.example.org/image-service/abcd1234",
    "profile": "http://iiif.io/api/image/2/level2.json"
  }
}
```

The service *may* have additional information embedded from the Image Information document to avoid the need to retrieve and parse it separately. In this case, the profile *may* also point to the profile of what functionality is supported, as described in the Image API.

``` json
{
  "service": {
    "@context" : "http://iiif.io/api/image/2/context.json",
    "@id" : "http://www.example.org/image-service/abcd1234",
    "protocol": "http://iiif.io/api/image",
    "width" : 6000,
    "height" : 4000,
    "sizes" : [
      {"width" : 150, "height" : 100},
      {"width" : 600, "height" : 400},
      {"width" : 3000, "height": 2000}
    ],
    "tiles": [
      {"width" : 512, "scaleFactors" : [1,2,4,8,16]}
    ],
    "profile" : [
      "http://iiif.io/api/image/2/level2.json",
      {
        "formats" : [ "gif", "pdf" ],
        "qualities" : [ "color", "gray" ],
        "supports" : [
            "canonicalLinkHeader", "rotationArbitrary", "http://example.com/feature"
        ]
      }
    ]
  }
}
```

With the `logo` property added to the Image Information description in version 2.1 of the Image API, it is possible and reasonable for one `info.json` response to embed another using this pattern. In this case, the second service is related to the icon that should be displayed when a client renders the image described by the main response.

``` json
{
  "@context" : "http://iiif.io/api/image/2/context.json",
  "@id" : "http://www.example.org/image-service/baseImage",
  "protocol" : "http://iiif.io/api/image",

  "attribution" : "Provided by Example Organization",
  "logo" : {
    "@id": "http://example.org/image-service/logo/full/full/0/default.png",
    "service": {
      "@id": "http://example.org/image-service/logo",
      "protocol": "http://iiif.io/api/image",
      "profile": "http://iiif.io/api/image/2/level2.json"
    }
  }
}
```

## Appendices

### A. Acknowledgements

The production of this document was generously supported by a grant from the [Andrew W. Mellon Foundation](http://www.mellon.org/ "The Andrew W. Mellon Foundation").

Thanks to the members of the [IIIF](https://iiif.io/community/ "IIIF Community") for their continuous engagement, innovative ideas and feedback.

### B. Change Log

| Date       | Description              |
|------------|--------------------------|
| 2018-XX-YY | New Version 3 Registries |
