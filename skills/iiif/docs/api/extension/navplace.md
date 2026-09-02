<!-- source: https://iiif.io/api/extension/navplace/ -->

## Status of this Document

This document is not subject to [semantic versioning](../annex/notes/semver.md "Versioning of APIs"). Changes will be tracked within the document.

*Copyright © 2012-2026 Editors and contributors. Published by the IIIF Consortium under the [CC-BY](http://creativecommons.org/licenses/by/4.0/ "Creative Commons — Attribution 4.0 International") license, see [disclaimer](https://iiif.io/api/annex/notes/disclaimer/).*

## 1. Introduction

The [IIIF Presentation API 3](../presentation/3.0.md) does not provide a resource property designed specifically for geographic location. However, the concept of location is a first class descriptor for many resources and thus calls for its own property by which it can be expressed.

### 1.1 Objectives and Scope

This IIIF Presentation API 3 extension defines a new property, `navPlace`, which is defined by earthbound geographic coordinates in the form of [GeoJSON-LD](https://geojson.org/geojson-ld/). Clients may use this property to leverage the functionality of web-based map platforms such as Google Earth, Leaflet, and OpenLayers to provide a means to enrich data presentation through map-based interfaces.

Spatial coordinates for resources on other celestial bodies or contrived worlds can be expressed using the semantic pattern of GeoJSON. However, `navPlace` adopts the [existing GeoJSON specification](https://datatracker.ietf.org/doc/html/rfc7946) to promote interoperability with industry standard mapping libraries and methods using [WGS84](http://www.w3.org/2003/01/geo/wgs84_pos) as the coordinate reference system for projections of the surface of Earth. As such, expressing the location of extraterrestrial entities is not supported by the `navPlace` property. This extension does not preclude the development of future extensions to address this use case.

### 1.2 Motivating Use Cases

The reasons for associating geographic coordinates with web resources vary greatly. This extension does not intend to meet the data requirements for all geospatial practices. Use cases within the scope include:

- Linking a IIIF resource to a single or multiple geographic areas
- Supplying a single geographic bounding box for an image of a map
- Representing locations that appear in digital objects, such as itineraries or travel journals

Situations which are not in scope include:

- Georeferencing and map warping
- 3D spatial representation
- [Application of geographic information to resource fragments](../cookbook/recipe/0139-geolocate-canvas-fragment.md)

### 1.3 Terminology

This extension uses the following terms:

- **embedded**: When a resource (A) is embedded within an embedding resource (B), the complete JSON representation of resource A is present within the JSON representation of resource B, and dereferencing the URI of resource A will not result in additional information. Example: Canvas A is embedded in Manifest B.
- **referenced**: When a resource (A) is referenced from a referencing resource (B), an incomplete JSON representation of resource A is present within the JSON representation of resource B, and dereferencing the URI of resource A will result in additional information. Example: Manifest A is referenced from Collection B.
- **HTTP(S)**: The HTTP or HTTPS URI scheme and internet protocol.
- **location**: The quantitative description of the position of a place, in this case, using coordinates.

The terms *array*, *JSON object*, *number*, *string*, and *boolean* in this document are to be interpreted as defined by the [Javascript Object Notation (JSON)](https://tools.ietf.org/html/rfc8259 "JSON RFC") specification.

The key words *must*, *must not*, *required*, *shall*, *shall not*, *should*, *should not*, *recommended*, *may*, and *optional* in this document are to be interpreted as described in [RFC 2119](https://tools.ietf.org/html/rfc2119 "RFC Keywords").

## 2. The `navPlace` Property and GeoJSON-LD

### 2.1 `navPlace` Property

The `navPlace` property identifies a single or multiple geographic areas pertinent to a resource using a GeoJSON Feature Collection containing one or more Features. These areas *should* be bounded discrete areas of the map akin to extents. These areas do not imply any level of accuracy, temporality, or state of existence.

``` highlight
{
   "navPlace":{
      "id": "http://example.com/feature-collection/1",
      "type": "FeatureCollection",
      "features":[
         {
            "id": "http://example.com/feature/1",
            "type": "Feature",
            "properties":{},
            "geometry":{
               "type": "Point",
               "coordinates":[
                  9.938,
                  51.533
               ]
            }
         }
      ]
   }
}
```

The `navPlace` property can be used with the [IIIF Presentation 3 API Defined Types](../presentation/3.0.md#21-defined-types).

- A Collection *may* have the `navPlace` property.\
  Clients *may* render `navPlace` on a Collection.
- A Manifest *may* have the `navPlace` property.\
  Clients *may* render `navPlace` on a Manifest.
- A Range *may* have the `navPlace` property.\
  Clients *may* render `navPlace` on a Range.
- A Canvas *may* have the `navPlace` property.\
  Clients *may* render `navPlace` on a Canvas.
- Other types of resource *must not* have the `navPlace` property.\
  Clients *should* ignore `navPlace` on other types of resource.

The `navPlace` property’s value follows a specific pattern.

- The value of the property *must* be a JSON object that follows the requirements for a GeoJSON Feature Collection as described in [Section 2.2.2](#222-feature-collection).
- The value *should* be an embedded Feature Collection. However, the value *may* be a referenced Feature Collection. Feature Collections referenced in the `navPlace` property *must* have the `id` and `type` properties. Referenced Feature Collections *must not* have the `features` property, such that clients are able to recognize that it should be retrieved in order to be processed.\

``` highlight
{"navPlace":{"id": "https://example.org/iiif/1/feature-collection", "type": "FeatureCollection"}}
```

### 2.2 GeoJSON

This extension utilizes the technical terms described in the published [GeoJSON specification](https://tools.ietf.org/html/rfc7946).

#### 2.2.1 GeoJSON as Linked Data

[GeoJSON-LD](https://geojson.org/geojson-ld/) is a publicly available vocabulary and linked data context for the GeoJSON specification. The `navPlace` extension context file refers to this context which ensures the geographic data values are well described. The example below shows how to set the `@context` property for IIIF resources with the `navPlace` property. [Section 3](#3-linked-data) has more detail on linked data compatibility.

``` highlight
{
    "@context":[
       "http://iiif.io/api/extension/navplace/context.json",
       "http://iiif.io/api/presentation/3/context.json"
    ]
}
```

#### 2.2.2 Feature Collection

A Feature Collection represents an aggregation of spatially bounded areas. [Go to the GeoJSON specification for a visual example](https://datatracker.ietf.org/doc/html/rfc7946#section-1.5). In this document, the term “Feature Collection” relates to “Feature Collection Object” from the GeoJSON specification.

- A Feature Collection has a `type` property with the value “FeatureCollection”.
- A Feature Collection has a `features` property where the value is a JSON array. Each element of the array is a Feature as defined below. While it is possible for this array to be empty, when used in the context of this extension it *should not* be empty.
- A Feature Collection *may* have an `id` property. For the purposes of this extension, the value of the `id` property *must* be a [commonly used HTTP(S) URI identifier](../presentation/3.0.md#61-uri-recommendations). The Feature Collection *may* be accessible by the URI.

#### 2.2.3 Feature

A Feature represents a spatially bounded area. Every Feature is a GeoJSON object. [Go to the GeoJSON specification for a visual example](https://datatracker.ietf.org/doc/html/rfc7946#section-1.5). In this document, the term “Feature” relates to “Feature Object” from the GeoJSON specification.

- A Feature has a `type` property with the value “Feature”.
- A Feature has a `geometry` property where the value of the property *must* be either a Geometry object as defined in [2.2.4 Geometry Objects and Position](#224-geometry-objects-and-position) or, in the case that the Feature is unlocated, a JSON null value.
- A Feature has a `properties` property where the value of the property is a JSON Object with zero or more properties. For information on using this property to provide information associated with the geographic coordinates, see [Section 3.2](#32-context-considerations-for-geojson-ld-properties).
- A Feature *may* have an `id` property. For the purposes of this extension, the value of the `id` property *must* be a [commonly used HTTP(S) URI identifier](../presentation/3.0.md#61-uri-recommendations). The `id` *may* be the URI of a Feature Collection that contains the Feature with a unique fragment on the end. The Feature *may* be accessible by the URI.

#### 2.2.4 Geometry Objects and Position

A Geometry object, referred to from the Feature object by the `geometry` property, is a GeoJSON object. [Go to the GeoJSON specification for a visual example](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1).

- A Geometry object has a `type` property with a value from the Table of Geometry Object Types in this section.
- A Geometry object has the `coordinates` property where the value is an array of positions, the structure of which is determined by the type of geometry.
- A position is an array of numbers and *must* have two or more elements. The first two elements are longitude and latitude, or easting and northing, precisely in that order and using decimal numbers. Altitude or elevation *may* be included as an optional third element.

| Geometry Object Type | Description |
|----|----|
| Point | The “coordinates” property is a single position |
| MultiPoint | The “coordinates” property is an array of positions |
| LineString | The “coordinates” property is an array of two or more positions |
| MultiLineString | The “coordinates” property is an array of LineString coordinate arrays |
| Polygon | The “coordinates” property *must* be an array of linear ring coordinate arrays. For Polygons with more than one of these rings, the first *must* be the exterior ring, and any others *must* be interior rings. The exterior ring bounds the surface, and the interior rings (if present) bound holes within the surface. |
| MultiPolygon | The “coordinates” property is an array of Polygon coordinate arrays |
| GeometryCollection | Has a property with the name “geometries”. The value of “geometries” is an array. Each element of this array is a GeoJSON Geometry object. It is possible for this array to be empty. |

For examples of these shapes, see the “Examples” section of the GeoJSON specification at <https://datatracker.ietf.org/doc/html/rfc7946#appendix-A>

## 3. Linked Data

### 3.1 Linked Data Context

- The URI of the `navPlace` linked data context is [`http://iiif.io/api/extension/navplace/context.json`](http://iiif.io/api/extension/navplace/context.json)
- The URI of the IIIF Presentation API 3 linked data context is [`http://iiif.io/api/presentation/3/context.json`](http://iiif.io/api/presentation/3/context.json)

The navPlace extension linked data context *must* be included before the IIIF Presentation API 3 linked data context on the top-level object. The navPlace extension linked data context file includes the [GeoJSON-LD context](https://geojson.org/geojson-ld/geojson-context.jsonld) through [context scoping](https://www.w3.org/TR/json-ld11/#scoped-contexts). This means the GeoJSON-LD context URI does not have to be explicitly included on the top level object. It is important to note that since the IIIF Presentation API 3 linked data context has the JSON-LD `@version` set to 1.1, all linked data contexts are processed as JSON-LD 1.1.

Consult the [Linked Data Context and Extensions section of IIIF Presentation API 3](../presentation/3.0.md#46-linked-data-context-and-extensions) for further guidance on use of the `@context` property.

### 3.2 Context Considerations for GeoJSON-LD `properties`

The value of `properties` can be any JSON object and is used to supply additional information associated with the geographic coordinates. Terms used in `properties` *should* be described either by [registered IIIF API extensions](../extension.md#abstract) or [local linked data contexts](https://www.w3.org/TR/json-ld11/#dfn-local-context). If a client discovers properties that it does not understand, then it *must* ignore them.

## 4. Full Manifest Example

Here you can see an example of a IIIF Manifest with the `navPlace` property. It is made JSON-LD 1.1 compatible by including multiple linked data contexts to cover all the terms used within the web resource. Review the Manifest below in the [JSON-LD playground](https://json-ld.org/playground/) for an example of Linked Data processing.

``` highlight
{
   "@context":[
      "http://iiif.io/api/extension/navplace/context.json",
      "http://iiif.io/api/presentation/3/context.json"
   ],
   "id":"https://example.org/iiif/manifest/1",
   "type":"Manifest",
   "label":{
      "en":[
         "navPlace Extension Example Manifest"
      ]
   },
   "items":[
      {
         "id":"https://example.org/iiif/canvas/p1",
         "type":"Canvas",
         "label":{
            "en":[
               "Picture of Göttingen taken during the 2019 IIIF Conference"
            ]
         },
         "type":"Canvas",
         "height":3024,
         "width":4032,
         "items":[
            {
               "id":"https://example.org/iiif/page/p1/1",
               "type":"AnnotationPage",
               "items":[
                  {
                     "id":"https://example.org/iiif/annotation/p0001-image",
                     "type":"Annotation",
                     "motivation":"painting",
                     "label":{
                        "en":[
                           "Picture of Göttingen"
                        ]
                     },
                     "body":{
                        "id":"https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen/full/max/0/default.jpg",
                        "type":"Image",
                        "format":"image/jpeg",
                        "height":3024,
                        "width":4032,
                        "service":[
                           {
                              "id":"https://iiif.io/api/image/3.0/example/reference/918ecd18c2592080851777620de9bcb5-gottingen",
                              "profile":"level1",
                              "type":"ImageService3"
                           }
                        ]
                     },
                     "target":"https://example.org/iiif/canvas/p1"
                  }
               ]
            }
         ]
      }
   ],
   "navPlace":{
      "id" : "https://example.org/iiif/feature-collection/2",
      "type":"FeatureCollection",
      "features":[
         {
            "id":"https://example.org/iiif/feature/2",
            "type":"Feature",
            "properties":{
               "label":{
                  "en":[
                     "navPlace Extension Example Manifest"
                  ]
               }
            },
            "geometry":{
               "type":"Point",
               "coordinates":[
                  9.938,
                  51.533
               ]
            }
         }
      ]
   }
}
```

## 5. Implementation Notes

### 5.1 GeoJSON-LD on the Web

The choice to use GeoJSON-LD is not arbitrary. It is the primary geographic coordinate data format supported by web-based map platforms. This extension drives implementers to have geographic coordinate data saved as GeoJSON-LD when it is intended for use on the web. This practice removes barriers for interoperable geographic coordinate data as well as promotes the robust functionality of prior, current, and upcoming web-based map platform developments.

### 5.2 IIIF Cookbook

The [IIIF Cookbook](../cookbook.md) exemplifies implementations of digital objects under IIIF Presentation API 3. IIIF Cookbook recipes exemplifying use of the `navPlace` property are under development. This specification will update to include links to those recipes as they are published.

## Appendices

### A. Acknowledgements

An enormous amount of gratitude is owed to the IIIF community for their continuous engagement, innovative ideas, and feedback. Thanks to [Sean Gilles](https://github.com/sgillies) and MapBox for the GeoJSON linked data context and its promotion of standardized geographic web data. We would also like to recognize the [IETF](https://www.ietf.org/) for the semantics produced through the GeoJSON specification. An extra special thank you goes out to the [IIIF Maps](https://iiif.io/community/groups/maps/) and [IIIF Cookbook](../cookbook.md) communities as implementers of this developing technology. The initial version of this document was the work of the [IIIF Maps Technical Specification Group](https://iiif.io/community/groups/maps-tsg/).

### B. Change Log

| Date       | Description         |
|------------|---------------------|
| 2021-10-18 | Initial publication |
