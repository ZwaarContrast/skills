<!-- source: https://iiif.io/api/image/2.1/compliance/ -->

## Status of this Document

**This version:** 2.1.0

**Latest stable version:** [3.0.0](../3.0/compliance.md "Stable Version")

## 1. Introduction

This document is a companion to the [IIIF Image API Specification](../2.1.md "Image API 2.1"). It defines the set of supported parameters that correspond to different levels of compliance to the API.

## 2. Compliance

Three levels of compliance are defined. Level 0 is the minimum set of parameters and features that *must* be implemented to qualify the service as compliant with the IIIF Image API Specification. Level 1 is the *recommended* set of parameters and features to be implemented. Note that servers may not support all combinations of all supported parameters and features, as noted in the appropriate sections below.

In the tables below “REQUIRED” indicates that support is *required*, and “OPTIONAL” indicates that support is *optional*.

## 3. Image Parameters

### 3.1 Region

| Syntax      | Feature Name   | Level 0  | Level 1  | Level 2  |
|:------------|:---------------|:--------:|:--------:|:--------:|
| `full`      |                | REQUIRED | REQUIRED | REQUIRED |
| x,y,w,h     | `regionByPx`   | OPTIONAL | REQUIRED | REQUIRED |
| pct:x,y,w,h | `regionByPct`  | OPTIONAL | OPTIONAL | REQUIRED |
| `square`    | `regionSquare` | OPTIONAL | OPTIONAL | OPTIONAL |

See also the note under [Size](#size "3.2 Size") about combinations of Size and Region that may not be supported.

### 3.2 Size

| Syntax | Feature Name        | Level 0  | Level 1  | Level 2  |
|:-------|:--------------------|:--------:|:--------:|:--------:|
| `full` |                     | REQUIRED | REQUIRED | REQUIRED |
| `max`  |                     | OPTIONAL | OPTIONAL | OPTIONAL |
| w,     | `sizeByW`           | OPTIONAL | REQUIRED | REQUIRED |
| ,h     | `sizeByH`           | OPTIONAL | REQUIRED | REQUIRED |
| pct:n  | `sizeByPct`         | OPTIONAL | REQUIRED | REQUIRED |
| !w,h   | `sizeByConfinedWh`  | OPTIONAL | OPTIONAL | REQUIRED |
| w,h    | `sizeByDistortedWh` | OPTIONAL | OPTIONAL | REQUIRED |
| w,h    | `sizeByWh`          | OPTIONAL | OPTIONAL | REQUIRED |
|        | `sizeAboveFull`     | OPTIONAL | OPTIONAL | OPTIONAL |

At any level of compliance, an image service whose Image Information response includes the `sizes` property must support requests for the sizes listed, and a service whose Image Information response includes the `tiles` property must support requests for the sizes implicit in the `width`, `height` and `scaleFactors` values given for tiles.

Note that servers may express limits on the sizes available for an image with the optional `maxWidth`, `maxHeight` and/or `maxArea` [Profile Description properties](../2.1.md#profile-description "5.3 Profile Description"). Servers are compliant provided they support the forms of the Size parameter shown above for image sizes up to the limits specified. Clients should not assume that Region and Size parameter combinations such as `/full/full/` will be supported.

See also the [deprecation warning about `full`](../2.1.md#full-dep "Full Size Keyword Deprecation Warning").

### 3.3 Rotation

| Syntax           | Feature Name        | Level 0  | Level 1  | Level 2  |
|:-----------------|:--------------------|:--------:|:--------:|:--------:|
| `0`              |                     | REQUIRED | REQUIRED | REQUIRED |
| `90`,`180`,`270` | `rotationBy90s`     | OPTIONAL | OPTIONAL | REQUIRED |
| *arbitrary*      | `rotationArbitrary` | OPTIONAL | OPTIONAL | OPTIONAL |
| !*n*             | `mirroring`         | OPTIONAL | OPTIONAL | OPTIONAL |

### 3.4 Quality

| Syntax    | Level 0  | Level 1  |         Level 2          |
|:----------|:--------:|:--------:|:------------------------:|
| `default` | REQUIRED | REQUIRED |         REQUIRED         |
| `color`   | OPTIONAL | OPTIONAL | REQUIRED (if applicable) |
| `gray`    | OPTIONAL | OPTIONAL | REQUIRED (if applicable) |
| `bitonal` | OPTIONAL | OPTIONAL |         REQUIRED         |

### 3.5 Format

| Syntax | Level 0  | Level 1  | Level 2  |
|:-------|:--------:|:--------:|:--------:|
| `jpg`  | REQUIRED | REQUIRED | REQUIRED |
| `png`  | OPTIONAL | OPTIONAL | REQUIRED |
| `tif`  | OPTIONAL | OPTIONAL | OPTIONAL |
| `gif`  | OPTIONAL | OPTIONAL | OPTIONAL |
| `pdf`  | OPTIONAL | OPTIONAL | OPTIONAL |
| `jp2`  | OPTIONAL | OPTIONAL | OPTIONAL |
| `webp` | OPTIONAL | OPTIONAL | OPTIONAL |

## 4. HTTP Features

| HTTP Feature | Feature Name | Level 0 | Level 1 | Level 2 |
|:---|:---|:--:|:--:|:--:|
| base URI redirects | `baseUriRedirect` | OPTIONAL | REQUIRED | REQUIRED |
| CORS | `cors` | OPTIONAL | REQUIRED | REQUIRED |
| json-ld media type | `jsonldMediaType` | OPTIONAL | REQUIRED | REQUIRED |
| profile link header | `profileLinkHeader` | OPTIONAL | OPTIONAL | OPTIONAL |
| canonical link header | `canonicalLinkHeader` | OPTIONAL | OPTIONAL | OPTIONAL |

## 5. Indicating Compliance

Servers *may* indicate compliance with by including a header in IIIF responses for images:

``` plaintext
Link: <http://iiif.io/api/image/2/level1.json>;rel="profile"
```

The URIs for the the compliance levels are as follows:

| Level | URI                                    |
|:-----:|:---------------------------------------|
|   0   | http://iiif.io/api/image/2/level0.json |
|   1   | http://iiif.io/api/image/2/level1.json |
|   2   | http://iiif.io/api/image/2/level2.json |

### 5.1 Level 0 Compliance

A level 0 compliant image server *may* specify `scaleFactors` and/or `width` and `height` values for `tiles` in the Image Information response. At Level 0 compliance, a service is only required to deliver images of sizes computed using the scaling factors declared in the Image Information response. If specified they should be interpreted with the following special meanings:

- `scaleFactors` - only the specified scaling factors are supported
- `width`, `height` within `tiles` - clients should request only regions that correspond to output tiles of the specified dimensions

A level 0 compliant image server *may* also specify `sizes` to indicate specific `width` and `height` values for sizes available for the `full` region.

If a client requests a combination of size and region outside these parameters then the image server *may* reject the request with an error.
