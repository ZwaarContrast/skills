<!-- source: https://iiif.io/api/image/3.0/change-log/ -->

This document is a companion to the [IIIF Image API Specification, Version 3.0](../3.0.md "Image API 3.0"). It describes the changes to the API specification made in this major release, including ones that are backwards incompatible with version 2.1.1, the previous version.

## 1. Breaking Changes

The following changes are backwards incompatible with version 2.1.1 of the Image API.

### 1.1. Image Request Changes

#### 1.1.1. Remove size `full` in favor of `max`

Per the [deprecation warning](../2.1.md#full-dep "Deprecation Warning") in the previous version, the value `full` is no longer allowed for the size parameter, `max` must be used instead.

See issues [\#678](https://github.com/IIIF/api/issues/678) and [\#1369](https://github.com/IIIF/api/issues/1369).

#### 1.1.2. Changes to upscaling of images to larger than the extracted region

Unless prefixed with a caret (`^`), the value of the size parameter must not result in an image larger than the extracted region, and attempts to do so must generate an error response. Previous versions allowed implementations to [optionally and implicitly support scaling up](../2.1.md#size "4.2. Size"). The `sizeAboveFull` feature name was also removed. Servers may still support upscaling by indicating that they support the `sizeUpscaling` feature.

See issues [\#693](https://github.com/IIIF/api/issues/693),[\#1370](https://github.com/IIIF/api/issues/1370), and [\#1627](https://github.com/IIIF/api/issues/1627).

#### 1.1.3. Change canonical form of size parameter to *`w,h`*

Per the [deprecation warning](../2.1.md#full-dep "Deprecation Warning") and the [inconsistency warning](../2.1.md#size-inconsistency "Inconsistency Warning") about the size parameter in the previous version, the canonical form of the size parameter is now *`w,h`* unless the maximum size is requested, in which case the canonical form is now `max`. This resolves the inconsistency between the server-preferred values in the `sizes` object, and the canonical form of the size parameter. In order to request preferred sizes, a client should use the `width` and `height` values from `sizes` unmodified to build the *`w,h`* size to request. Clients should also use canonical form of the size parameter *`w,h`* when constructing tile requests.

See issues [\#544](https://github.com/IIIF/api/issues/544) and [\#678](https://github.com/IIIF/api/issues/678).

### 1.2. Image Information Changes

Several existing properties were renamed for consistency with the Presentation API, developer convenience, or to better reflect the intended semantics. Some of the semantics were also clarified based on implementation experience during previous versions.

#### 1.2.1. Rename `@id` to `id`, `@type` to `type`

These properties were renamed to enable Javascript developers to use the “dot notation” (`image.id`) instead of the square-brackets based equivalent needed with the `@` character (`image['@id']`). This follows JSON-LD community best practices established by schema.org, the JSON-LD, Web Annotation and Social Web working groups.

See issues [\#590](https://github.com/IIIF/api/issues/590) and [\#1901](https://github.com/IIIF/api/issues/1901).

#### 1.2.2. Remove the `attribution` and `logo` properties

The `attribution` and `logo` properties have been removed to better separate concerns between the Image and Presentation APIs. Both properties continue to be available in the [Presentation API](../../presentation/3.0.md).

See issue [\#1787](https://github.com/IIIF/api/issues/1787). Approved by [trc#12](https://github.com/IIIF/trc/issues/12).

#### 1.2.3. Rename `license` to `rights`, allow only a single value

The `license` property was renamed to `rights` to accommodate both rights statements and usage licenses. The value is constrained to be a single URI, an array is no longer permitted. The value is further constrained to allow only Creative Commons URIs, RightsStatements.org URIs and URIs registered as extensions. This additional constraint is to allow clients to treat the property as an enumeration rather than free text, and implement URI specific behavior.

See issues [\#644](https://github.com/IIIF/api/issues/644) and [\#1479](https://github.com/IIIF/api/issues/1479).

#### 1.2.4. Require the `type` property on image information document and external references, with new values

The `type` property with a single value is now required at the top level of the image information document (`info.json`), and any externally referenced resources including content resources such as further images and services. This serves several purposes, including facilitating object mapping code libraries, and forcing the serialization to generate a JSON object for the resource, not just a string with the resource’s URI. The values for `type` have been changed to version-specific strings that avoid the namespace structure, for example from `iiif:Image` in 2.1 to `ImageService3` in 3.0. Note that the `@type` property is used only when referring to an object from older specifications such as the Authentication API 1.0. The `type` property is optional for entries in the tiles (`Tile`) and sizes (`Size`) arrays.

See issues [\#1185](https://github.com/IIIF/api/issues/1185) and [\#1867](https://github.com/IIIF/api/issues/1867)

A list of allowed values for `@type` when referring to services from older IIIF specifications is given in the [services annex](../../annex/services.md "Services Annex Document") document.

#### 1.2.5. Change the `profile` property to take one compliance level

The `profile` property must have a single value that is a compliance level string. The property value must not be an array as in previous versions, and features supported beyond those specified are instead described in the new `extraFeatures` property.

See issues [\#1275](https://github.com/IIIF/api/issues/1275), [\#1373](https://github.com/IIIF/api/issues/1373), [\#1554](https://github.com/IIIF/api/issues/1554), and [\#1013](https://github.com/IIIF/api/issues/1013).

#### 1.2.6. Change the `service` property value to an array of objects

In version 2.1 the value of the `service` property could be a single value or an array of objects, the value must now be an array of objects.

See issue [\#1131](https://github.com/IIIF/api/issues/1131).

#### 1.2.7. Remove feature names `sizeByWhListed` and `sizeByForcedWh`

Per the [deprecation warning](../2.1.md#dep-sizes "Deprecation Warning") in the previous version, the feature names `sizeByWhListed` and `sizeByForcedWh` have been removed. See PR [\#727](https://github.com/IIIF/api/pull/727).

#### 1.2.8. Remove feature name `sizeByDistortedWh`

The feature `sizeByWhDistorted` has no useful meaning separate from `sizeByWh` and was thus removed.

See issue [\#879](https://github.com/IIIF/api/issues/879).

#### 1.2.9. Use language map pattern for `label`

In the [Presentation API](../../presentation/3.0.md) and here, a new pattern has been adopted for all textual values of a JSON object with the language code as the key (or `none` if the language is not known) and the content as a string within an array as the value. This pattern is much easier to implement and use than the previous `@value` / `@language` tuples pattern.

See issues [\#755](https://github.com/IIIF/api/issues/755) and [\#1739](https://github.com/IIIF/api/issues/1739). Approved by [trc#2](https://github.com/IIIF/trc/issues/2) and [trc#5](https://github.com/IIIF/trc/issues/5).

#### 1.2.10. Clarify content negotiation expectations

Expectations around the implementation of content negotiation were added.

See issue [\#1685](https://github.com/IIIF/api/issues/1685).

#### 1.2.11. Update context for new major version

The URI of the context document was updated for the new major version, and thus the value of the `@context` property uses the new value of `http://iiif.io/api/image/3/context.json`, or includes it as the last item in an array.

### 1.3. Compliance Requirements

#### 1.3.1. Require support for region `square` at `level1` and `level2` compliance

Support for the region parameter value `square`, introduced in [version 2.1](../2.1.md "Image API 2.1"), is now required at `level1` and `level2` [compliance](compliance.md "Image API Compliance").

See issue [\#501](https://github.com/IIIF/api/issues/501).

#### 1.3.2. No longer require support for `pct:x` size at `level1` compliance

Support for the `pct:x` size form is no longer required at `level1` compliance. This is consistent with the `pct:x,y,w,h` for region as both are now `level2` features.

See issue [\#478](https://github.com/IIIF/api/issues/478).

### 1.4. External Specifications

#### 1.4.1. Use JSON-LD 1.1

JSON-LD remains the serialization format of the Image API, as it is for the Presentation API. Some features of the JSON-LD Community Group specification make significant improvements to the Presentation API’s structure and consistency and are also adopted by the Image API although the impact is much less. While this specification is not a W3C Technical Recommendation at the time of release, the likelihood of the standardization process for JSON-LD 1.1 being successful is extremely high and the advantages have been judged to be worth the risk of unintended incompatibility.

See issue [\#1192](https://github.com/IIIF/api/issues/1192).

## 2. Non-Breaking Changes

The following changes are backwards compatible with version 2.1.1 of the Image API.

### 2.1. Add notes on extension mechanisms and registry

A new [Extensions](../3.0.md#49-extensions "4.9. Extensions") section describes mechanisms for extension of image requests and the new [Extra Functionality](../3.0.md#57-extra-functionality "5.7. Extra Functionality") section describes how extensions are described in the image information response. The `extraQualities` and `extraFormats` properties have been added to allow description of additional functionality.

See issues [\#1374](https://github.com/IIIF/api/issues/1374), [\#1373](https://github.com/IIIF/api/issues/1373), and [\#1435](https://github.com/IIIF/api/issues/1435).

There is now a [registry of known extensions](../../extension.md) to the IIIF specifications, which includes a \[registry of Image API extensions\]\[registry-image-extensions\]. Extensions intended for community use should be registered in the extensions registry, but registration is not mandatory.

### 2.2. Add `partOf` and `seeAlso` linking properties

Two linking properties also present in the Presentation API were added to the image information. The `seeAlso` property addresses the use case of providing a link to technical metadata, and the `partOf` property supports discovery of a containing Manifest.

See issues [\#1507](https://github.com/IIIF/api/issues/1507) and [\#600](https://github.com/IIIF/api/issues/600).

### 2.3. Define JSON-LD profile for media type

A specific media-type, to be used with the HTTP headers `Accept` and `Content-Type` was defined. This media type is the JSON-LD media type, with the context in the `profile` parameter, following established conventions.

See issue [\#1066](https://github.com/IIIF/api/issues/1066).

## 3. Editorial Changes

The following changes do not change the Image API behavior from version 2.1.1.

### 3.1. Clarify distinctions between underlying image content, full image, extracted region, and image returned

The [Terminology](../3.0.md#12-terminology "1.2 Terminology") section now explicitly defines **underlying image content** and **full image**. These terms, along with “extracted region” and “image returned” are used to describe the image manipulations more consistently than in previous versions.

See issue [\#1425](https://github.com/IIIF/api/issues/1425).

### 3.2. Clarify description of the *`!w,h`* form for the size parameter

Description of the *`!w,h`* form for the size parameter has been clarified to point out that the returned image must be as large as possible to fit within the *`w,h`* box subject to constraints of extracted region size and server-imposed limits.

See issue [\#1372](https://github.com/IIIF/api/issues/1372).

### 3.3. Clarify that the `color` format value might still yield a non-color image

Description of the `color` value of the format parameter has been clarified to make it clear that it is a request for the image with all of its color information. If the underlying image content has no color information then the resulting image will not have any either, even with the `color` format value.

See issues [\#1375](https://github.com/IIIF/api/issues/1375), [\#1435](https://github.com/IIIF/api/issues/1435) and [\#1922](https://github.com/IIIF/api/issues/1922).

### 3.4. Change examples to use `https` URIs

All examples now use `https` URIs in order to reflect best practices for interoperable implementations.

See issue [\#1421](https://github.com/IIIF/api/issues/1421).

### 3.5. Clarify and move discussion of floating point representation

Discussion of floating point representation has been moved from the image requests introduction to its own section, [Floating Point Values](../3.0.md#47-floating-point-values "4.7. Floating Point Values"), and has been expanded for clarity. The advice on using at most 10 decimal digits has been removed. Description of `pct` values clarifies these may be either floating point or integer.

See issues [\#1468](https://github.com/IIIF/api/issues/1468), [\#1240](https://github.com/IIIF/api/issues/1240) and [\#1875](https://github.com/IIIF/api/issues/1875)

### 3.6. Clarify support for CORS

Discussion of CORS has be moved to a new [CORS](../3.0.md#71-cors "7.1. CORS") section and the wording clarified to make it clear that not only the `Access-Control-Allow-Origin` header but also the preflight request pattern (ie. including the `OPTIONS` header) should be supported.

See issue [\#1274](https://github.com/IIIF/api/issues/1274).

### 3.7. Clarify that the `@context` value may be a single URI or an array of URIs

The previous version mentioned only the Image API JSON-LD context. The description has been changed to make it clear that the value of `@context` may be either a single URI, or an array with extension context URIs followed by the Image API context URI.

See issue [\#1472](https://github.com/IIIF/api/issues/1472).

### 3.8. Clarify that a compliance `Link` header may be returned with both Image and Image Information responses

The [description of compliance](../3.0.md#6-compliance-level-and-profile-document "6. Compliance Level and Profile Document") has been changed to note that the compliance level may be given in a HTTP `Link` header on both Image and Image Information responses.

See issue [\#1365](https://github.com/IIIF/api/issues/1365).

### 3.9. Move implementation notes to a separate document

A new [Image API 3.0 Implementation Notes](implementation.md "Implementation Notes") document was created by extracting notes from the appendices of the previous version. An algorithm for handling implementation constraints on maximum sizes with `maxWidth`, `maxHeight` and/or `maxArea` was added. Care has been taken to avoid [RFC 2119](https://tools.ietf.org/html/rfc2119 "RFC Keywords") keywords as the implementation notes are not normative.

See issues [\#928](https://github.com/IIIF/api/issues/928) and [\#1427](https://github.com/IIIF/api/issues/1427).

### 3.10. Describe implementation with static web resources

Explicit mention of support for `level0` implementation with pre-generated files was added. The Image API Compliance document has [additional guidance](compliance.md#5-level-0-compliance "5. Level 0 Compliance") on interpretation of `scaleFactors`, `tiles` and `sizes` information at `level0`.

See issues [\#1231](https://github.com/IIIF/api/issues/1231) and [\#1274](https://github.com/IIIF/api/issues/1254).

### 3.11. Add note encouraging adoption of HTTP/2

A new [HTTP Versions](../3.0.md#74-http-versions "7.4. HTTP Versions") section was added to describe issues with many concurrent requests and recommends support for HTTP/2.

See issue [\#957](https://github.com/IIIF/api/issues/957).

### 3.12. Improve font and style consistency

The use of `code` font and capitalization was made consistent for class names, property names and values when used in prose.
