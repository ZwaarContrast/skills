<!-- source: https://iiif.io/api/image/3.0/compliance/ -->

## Status of this Document

**This version:** 3.0.0

**Latest stable version:** [3.0.0](../3.0.md "Latest Image API Compliance Stable Version")

## 1. Introduction

This document is a companion to the [IIIF Image API 3.0 Specification](../3.0.md "Image API 3.0"). It defines the set of supported parameters that correspond to different levels of compliance to the API.

## 2. Compliance

Three levels of compliance are defined. Level 0 is the minimum set of parameters and features that *must* be implemented to qualify the service as compliant with the IIIF Image API Specification. Level 1 is the *recommended* set of parameters and features to be implemented. Note that servers may not support all combinations of all supported parameters and features, as noted in the appropriate sections below.

In the tables below ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") indicates that support is *required*, and ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") indicates that support is *optional*.

## 3. Image Parameters

### 3.1 Region

| Syntax | Feature Name | Level 0 | Level 1 | Level 2 |
|:---|:---|:--:|:--:|:--:|
| `full` |   | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| *`x,y,w,h`* | `regionByPx` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| *`pct:x,y,w,h`* | `regionByPct` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| `square` | `regionSquare` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |

See also the note under [Size](../3.0.md#42-size "4.2. Size") about combinations of Size and Region that may not be supported.

### 3.2 Size

| Syntax | Feature Name | Level 0 | Level 1 | Level 2 |
|:---|:---|:--:|:--:|:--:|
| `max` |   | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| *`w,`* | `sizeByW` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| *`,h`* | `sizeByH` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| *`pct:n`* | `sizeByPct` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| *`!w,h`* | `sizeByConfinedWh` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| *`w,h`* | `sizeByWh` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| *`^size`* | `sizeUpscaling` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") |

At any level of compliance, an image service whose Image Information response includes the `sizes` property must support requests for the sizes listed, and a service whose Image Information response includes the `tiles` property must support requests for the sizes implicit in the `width`, `height` and `scaleFactors` values given for tiles.

Note that servers may express limits on the sizes available for an image with the optional `maxWidth`, `maxHeight` and/or `maxArea` [technical properties](../3.0.md#52-technical-properties "5.2 Technical Properties"). Servers are compliant provided they support the forms of the Size parameter shown above for image sizes up to the limits specified. Clients should not assume that the full image at the `width` and `height` specified in the Image Information response will be available. The full image will be available at the `max` size, which might be less than the `width` and `height`.

### 3.3 Rotation

| Syntax | Feature Name | Level 0 | Level 1 | Level 2 |
|:---|:---|:--:|:--:|:--:|
| `0` |   | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| `90`,`180`,`270` | `rotationBy90s` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| *arbitrary* | `rotationArbitrary` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") |
| *`!n`* | `mirroring` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") |

### 3.4 Quality

| Syntax | Level 0 | Level 1 | Level 2 |
|:---|:--:|:--:|:--:|
| `default` | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| `color` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") (if applicable) |
| `gray` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") (if applicable) |
| `bitonal` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") |

### 3.5 Format

| Syntax | Level 0 | Level 1 | Level 2 |
|:---|:--:|:--:|:--:|
| `jpg` | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| `png` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| `tif` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") |
| `gif` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") |
| `pdf` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") |
| `jp2` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") |
| `webp` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") |

## 4. HTTP Features

| HTTP Feature | Feature Name | Level 0 | Level 1 | Level 2 |
|:---|:---|:--:|:--:|:--:|
| base URI redirects | `baseUriRedirect` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| CORS | `cors` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| json-ld media type | `jsonldMediaType` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") | ![required](https://iiif.io/api/assets/images/icons/metadata-api/required.png "Required") |
| profile link header | `profileLinkHeader` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") |
| canonical link header | `canonicalLinkHeader` | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") | ![optional](https://iiif.io/api/assets/images/icons/metadata-api/optional.png "Optional") |

## 5. Level 0 Compliance

A level 0 compliant image server *may* specify `scaleFactors` and/or `width` and `height` values for `tiles` in the Image Information response. At level 0 compliance, a service is only required to deliver images of sizes computed using the scaling factors declared in the Image Information response. If specified they should be interpreted with the following special meanings:

- `scaleFactors` - only the specified scaling factors are supported
- `width`, `height` within `tiles` - clients should request only regions that correspond to output tiles of the specified dimensions

A level 0 compliant image server *may* specify `sizes` to indicate specific `width` and `height` values for sizes available for the `full` region.

If a client requests a combination of size and region outside these parameters then the image server *may* reject the request with an error.
