<!-- source: https://iiif.io/api/ -->

## Current specifications

| API | Current Version | Description |
|----|----|----|
| Image API | [3.0.0](api/image/3.0.md) | The IIIF Image API specifies a web service that returns an image in response to a standard HTTP(S) request. The URI can specify the region, size, rotation, quality characteristics and format of the requested image. |
| Presentation API | [3.0.0](api/presentation/3.0.md) | The IIIF Presentation API provides the information necessary to allow a rich, online viewing environment for compound digital objects to be presented to a human user, often in conjunction with the IIIF Image API. |
| Authorization Flow API | [2.0.0](api/auth/2.0.md) | The IIIF Authorization Flow specification describes a set of workflows for guiding the user through an existing access control system. |
| Change Discovery API | [1.0.0](api/discovery/1.0.md) | The IIIF Change Discovery API provides the information needed to discover and make use of IIIF resources. |
| Content Search API | [2.0.0](api/search/2.0.md) | The IIIF Content Search API specification lays out the interoperability mechanism for performing searches of text annotations associated with an object within the IIIF context. |
| Content State API | [1.0.0](api/content-state/1.0.md) | The IIIF Content State API provides a way to refer to a IIIF Presentation API resource, or a part of a resource, in a compact format that can be used to initialize the view of that resource in any client. |

## Draft specifications

| API | Draft Version (Status) |
|----|----|
| Presentation API | [4.0.0](api/presentation/4.0.md) (Release candidate) |

### Feedback requested

We welcome feedback on all IIIF Specifications. Please send any feedback to <iiif-discuss@googlegroups.com>.

## Approved extensions

Please see the [Registry of Extensions](api/registry.md "IIIF Extension Registry") for full details on how extensions work and the process for creating them.

Currently, there are three formally published extensions available for use with the Presentation API.

| Presentation API Extensions | Description |
|----|----|
| [navPlace Extension](api/extension/navplace.md) | This IIIF Presentation 3 API extension defines a new property, navPlace, which is defined by earthbound geographic coordinates in the form of GeoJSON-LD. |
| [Text Granularity Extension](api/extension/text-granularity.md) | This extension recommends a pattern for indicating the level of text granularity for an annotation related to optical character recognition (OCR) software, manual transcription, and existing digitized text. |
| [Georeference Extension](api/extension/georef.md) | This extension leverages Web Annotations to provide a pattern for georeferencing IIIF Presentation 3 API Canvases as well as images served through the IIIF Image API. |

## Community translations

| API | Version | Translation |
|----|----|----|
| Image API | 3.0 | [Japanese](http://www.asahi-net.or.jp/~ax2s-kmtn/ref/iiif/apiimage3.0.html), [Chinese](https://www.yuque.com/iiifchina/df4qfk/fwybkl) |
| Image API | 2.1 | [Japanese](http://www.asahi-net.or.jp/~ax2s-kmtn/ref/iiif/apiimage2.1.html) |
| Presentation API | 3.0 | [Chinese](https://www.yuque.com/iiifchina/df4qfk/gpf6od) |
| Presentation API | 2.1 | [Japanese](http://www.asahi-net.or.jp/~ax2s-kmtn/ref/iiif/apipresentation2.1.html) |
| Content Search API | 1.0 | [Japanese](http://www.asahi-net.or.jp/~ax2s-kmtn/ref/iiif/searchapi1.0.html), [Chinese](https://www.yuque.com/iiifchina/df4qfk/ygbnck) |
| Authentication API | 1.0 | [Japanese](http://www.asahi-net.or.jp/~ax2s-kmtn/ref/iiif/apiauthentication1.0.html), [Chinese](https://www.yuque.com/iiifchina/df4qfk/vkxifz) |
| Discovery API | 1.0 | [Chinese](https://www.yuque.com/iiifchina/df4qfk/hdb26g) |
| Content State API | 0.9 | [Chinese](https://www.yuque.com/iiifchina/df4qfk/wysy7i) |
| NavPlace Extension |   | [Chinese](https://www.yuque.com/iiifchina/df4qfk/xh0bna) |

**Translation note**\
Please note that the IIIF community does not guarantee the accuracy of any translation. They are linked to for information purposes only, and any discrepancies with the specifications are unintentional. The English versions of the specifications linked above are the definitive versions.

## Community cookbook

The [Cookbook](api/cookbook.md "IIIF Cookbook") gathers together examples of how to create IIIF Presentation API assets, in order to:

- Provide many more examples than the specification alone can do, for reference and learning;
- Encourage publishers to adopt common patterns in modeling classes of complex objects;
- Enable client software developers to support these patterns, for consistency of user experience (when desirable); and
- Demonstrate the applicability of IIIF to a broad range of use cases.

The [Cookbook](api/cookbook.md "IIIF Cookbook") webpages are under constant development and the list of recipes include links to completed recipes and place holders for future recipes. The community welcomes additions to the [Cookbook](api/cookbook.md "IIIF Cookbook"). To get started, review the [Cookbook process](api/cookbook/recipe.md "Cookbook process") and say hello on the Cookbook [Slack](http://bit.ly/iiif-slack) channel.

## Validators

- [Image API validator](api/image/validator.md) - A service to validate a IIIF Image API resource against the specification.
- [Presentation API validator](https://iiif.io/api/presentation/validator/service/) - A service to validate a IIIF Presentation API resource against the specification.

## Older versions

Current IIIF specifications *should* be used for all new work. Old versions are retained for reference and are listed below. Technical resources and reference implementations of older versions are *NOT* guaranteed to be maintained across new major versions.

| Old API Version | Notes |
|----|----|
| [Authentication API 0.9.4](https://iiif.io/api/auth/0.9/ "Authentication API v0.9.4") | Published 2016-10-05 |
| [Authentication API 1.0](api/auth/1.0.md "IIIF Authentication API 1.0") | Published 2017-01-19 |
| [Change Discovery API 0.9.2](https://iiif.io/api/discovery/0.9/ "IIIF Change Discovery API") | Published 2021-04-28 |
| [Image API 2.1](api/image/2.1.md "Image API 2.1") | Published 2016-05-12, updated 2017-06-09 |
| [Image API 2.0](https://iiif.io/api/image/2.0/ "Image API v2.0") | Published 2014-09-11 |
| [Image API 1.1](https://iiif.io/api/image/1.1/ "Image API 1.1") | Published 2013-09-17 |
| [Image API 1.0](https://iiif.io/api/image/1.0/ "Image API v1.0") | Published 2012-08-10 |
| [Presentation API 2.1](api/presentation/2.1.md "IIIF Presentation API 2.1") | Published 2016-05-12, updated 2017-06-09 |
| [Presentation API 2.0](https://iiif.io/api/presentation/2.0/ "IIIF Presentation API 2.0") | Published 2014-08-12 |
| [Metadata API 1.0](https://iiif.io/api/metadata/1.0/ "Metadata API v1.0") | “Metadata API” was replaced with the Presentation API, published 2013-09-16 |
| [Metadata API 0.9](https://iiif.io/api/metadata/0.9/ "Metadata API v0.9") | Draft of the “Metadata API”, published 2013-06-11 |
| [Search API 0.9](https://iiif.io/api/search/0.9/ "Search API v0.9") | Draft published 2016-04-11 |
| [Search API 1.0](api/search/1.0.md) | Published 2016-05-12 |

## Notes

IIIF also has a series of [Implementation Notes](https://iiif.io/api/annex/ "Implementation Notes") which are not subject to the same process as formal APIs but may be useful to implementers.

## Process

IIIF Specifications are created and published following the [IIIF Editorial Process](https://iiif.io/community/policy/editorial/ "IIIF Editorial Process").
