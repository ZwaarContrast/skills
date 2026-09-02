<!-- source: https://iiif.io/api/extension/georef/ -->

## Status of this Document

This document is not subject to [semantic versioning](../annex/notes/semver.md "Versioning of APIs"). Changes will be tracked within the document.

*Copyright © 2012-2026 Editors and contributors. Published by the IIIF Consortium under the [CC-BY](http://creativecommons.org/licenses/by/4.0/ "Creative Commons — Attribution 4.0 International") license, see [disclaimer](https://iiif.io/api/annex/notes/disclaimer/).*

## 1. Introduction

This document describes a way to store the metadata needed to georeference a IIIF resource in a *Georeference Annotation*. Georeference Annotations can be used to convert images such as digitized maps and aerial photographs into geospatial assets.

The [IIIF Presentation API](../presentation/3.0.md) has the capability to support complex Web Annotations which can provide detailed and specific information regarding IIIF resources. You can see various use cases which implement such Web Annotations in the [IIIF Cookbook](../cookbook.md). Through the work of the [IIIF Maps Community Group](https://iiif.io/community/groups/maps/) and [IIIF Maps TSG](https://iiif.io/community/groups/maps-tsg/), a commonality of techniques to georeference IIIF Canvases and Images in the context of a global map became evident, and a desire to have standards and best practices for georeferencing became known.

### 1.1 Objectives and Scope

This document will supply vocabulary and a JSON-LD 1.1 context allowing for a JSON-LD pattern by which to extend Web Annotation and the IIIF Presentation API to support georeferencing. This pattern promotes interoperability for georeferenced maps across different georeferencing platforms, even those which focus on georeferencing for a specific use case such as those listed in the [Motivating Use Cases](#12-motivating-use-cases) section below.

The [existing GeoJSON format](https://datatracker.ietf.org/doc/html/rfc7946) is adopted for its linked data vocabulary and context for geographic coordinates. This means coordinates are expressed through the [WGS84](http://www.w3.org/2003/01/geo/wgs84_pos) coordinate reference system. As such, expressing the location of extraterrestrial entities is not supported by this technique.

Further, the following use cases are not in scope:

- Geotagging of (non-aerial) photographs. This extension is aimed at georeferencing cartographic IIIF resources containing two-dimensional representations of the three-dimensional surface of the globe. Usage may extend to other representations that can be mapped to geospatial coordinates, such as orthographic plan projections or vertical aerial photographs. Geotagging photographs is out of scope because this requires a different set of data points and relates to other use cases. Please refer to the [navPlace Extension](navplace.md) for an alternative solution.
- Georeferencing altitude or elevation. The GeoJSON format [supports a third position element](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.1) indicating the “height in meters above or below the WGS84 reference ellipsoid”. Adding this position element will not result in an invalid Georeference Annotation, but this extension will not cover any use of this element. It may be utilized in future versions of this extension.
- Specifying the original map projection and related coordinate reference system (CRS) of a IIIF resource. When selecting a transformation method to warp a map, it can be useful to know the original map projection of a IIIF resource, such as Mercator or Lambert. Including this in the Georeference Annotation would require a complex taxonomy, which is out of scope. A solution is to include this information in the metadata of the IIIF Manifest, or in a machine readable format referenced through the [seeAlso](../presentation/3.0.md#seealso) property.

### 1.2 Motivating Use Cases

- Adding IIIF resources as map layers to dynamic web maps or in GIS applications. Based on georeference data, clients can transform IIIF resources by scaling, skewing, rotating and stretching them. This process, also called *warping*, can be carried out through various methods.
- The previous use case also supports stitching together multiple map sheets, each represented by a single IIIF resource, to form a composite map. Alternatively, it can be used to compare different versions of the same map or a collection of maps of the same area.
- Geospatial exploration of IIIF resources. Georeference data can be used to compute the geospatial areas depicted on IIIF resources. This enables geospatial indexing and harvesting by geospatial search engines.
- The same method can be used to convert Web Annotations to geographic formats such as GeoJSON, and vice versa. This can be used to display Web Annotations as vectors in a map interface or to paint geographic data onto a Canvas from its connected Annotations.
- Calculating the scale (in pixels per unit of length) and orientation (compass direction) of IIIF resources. This can be used to improve user experiences when viewing IIIF resources or for indexing.
- Converting IIIF resources to a variety of raster map formats such as GeoTIFF and XYZ map tiles. This allows resources to be used in conventional GIS software.

### 1.3 Terminology

This extension uses the following terms:

- **embedded**: When a resource (A) is embedded within an embedding resource (B), the complete JSON representation of resource A is present within the JSON representation of resource B, and dereferencing the URI of resource A will not result in additional information. Example: Canvas A is embedded in Manifest B.
- **referenced**: When a resource (A) is referenced from a referencing resource (B), an incomplete JSON representation of resource A is present within the JSON representation of resource B, and dereferencing the URI of resource A will result in additional information. Example: Manifest A is referenced from Collection B.
- **HTTP(S)**: The HTTP or HTTPS URI scheme and internet protocol.

The terms *array*, *JSON object*, *number*, *string*, and *boolean* in this document are to be interpreted as defined by the [Javascript Object Notation (JSON)](https://tools.ietf.org/html/rfc8259 "JSON RFC") specification.

The key words *must*, *must not*, *required*, *shall*, *shall not*, *should*, *should not*, *recommended*, *may*, and *optional* in this document are to be interpreted as described in [RFC 2119](https://tools.ietf.org/html/rfc2119 "RFC Keywords").

## 2. Georeferencing IIIF Resources

### 2.1 Georeferencing

Georeferencing is the process of mapping the internal coordinates of an image to geographic coordinates. For the purposes of this extension, references to *IIIF resource* equate to a IIIF Presentation API [Canvas](../presentation/3.0.md#53-canvas) or [Image Service](../presentation/3.0.md#service). To qualify for georeferencing, the IIIF resource must include one or more regions that can be mapped to geographic coordinates such as cartographic material, aerial photographs, archaeological drawings, and building plans. In this extension, each of these regions is called a *map*.

To be georeferenced with a single Georeference Annotation the image information of the IIIF resource must be accessible with a single, continuous cartesian coordinate system. This is why a Georeferencing Annotation can be used to georeference a Canvas or Image Service, but not a [Manifest](../presentation/3.0.md#52-manifest) or [Range](../presentation/3.0.md#54-range). To georeference a Manifest or Range, multiple Georeference Annotations are needed, one for each Canvas or Image Service in the Manifest or Range.

### 2.2 Georeferencing Process

The process of georeferencing consists of the following steps:

1.  Selecting a IIIF resource. When a resource depicts multiple maps (such as inset maps) or when the resource contains non-cartographic parts (such as legends or borders), a polygonal selector is used to select a region of the resource that corresponds to a single map. The shape of a polygonal selector can vary from a simple rectangle to a more complex polygon. This step is called *cropping* or *masking* in other georeferencing software.
2.  Defining a mapping between coordinates on the IIIF resource and corresponding geographic WGS84 coordinates. This mapping consists of pairs of resource coordinates and geographic coordinates. Each pair of coordinates is called a Ground Control Point (GCP). At least three GCPs are needed to enable clients to warp a map.
3.  Optionally, a preferred transformation algorithm is defined that clients can use to turn the discrete set of GCPs into a function that interpolates any of the IIIF resource coordinates to geographic coordinates, and vice versa.

In Georeference Annotations, these steps are encoded as follows:

| Data | Georeference Annotation |
|----|----|
| Resource and selector | IIIF Presentation API Canvas or Image API Image Service with an optional [SVG Selector](https://www.w3.org/TR/annotation-model/#svg-selector) or [Image API Selector](../annex/openannotation.md#iiif-image-api-selector) |
| GCPs | A GeoJSON Feature Collection where each GCP is stored as a GeoJSON Feature with Point geometry and a `resourceCoords` property in the Feature’s `properties` object |
| Transformation algorithm | A `transformation` property defined on the GeoJSON Feature Collection that holds the GCPs |

**Target Projection**\
Please note that the Georeference Extension does not provide a property for specifying which geographic projection should be targeted when warping a IIIF resource. Most commonly, IIIF resources will be warped to the [WGS84 / Pseudo Mercator](https://epsg.io/?q=3857) projection (EPSG:3857), which is the current *de facto* standard for web mapping interfaces. Targeting another projection, even while using the same set of GCPs, will produce a different result. A property for specifying a target projection may be added in future versions of the extension.

## 3. Web Annotations for Georeferencing

The combined information described in Section 2 is stored in a Georeference Annotation using the [Web Annotation Data Model](https://www.w3.org/TR/annotation-model/). This section details the structure of a Georeference Annotation and its relationship to the IIIF Presentation API and Image API. It includes examples of the different properties and options.

### 3.1 Embedded vs. Referenced Annotations

Georeference Annotations can be included in a IIIF Presentation API response as part of an [Annotation Page](../presentation/3.0.md#annotations) under the `annotations` property of a Canvas. Alternatively, Georeference Annotations can exist independent of their targeted IIIF resource and can be retrieved by resolving their URI `id`.

For Georeference Annotations included in a Canvas, implementers *must* have at least one Annotation Page in the `annotations` property of the targeted Canvas. Implementers have the option to [reference or embed](../presentation/3.0.md#12-terminology) those Annotation Pages. For the purposes of this extension, implementers *should* embed the Annotation Pages in the `annotations` property as opposed to referencing them. See the Cookbook entry [Embedded or referenced Annotations](../cookbook/recipe/0269-embedded-or-referenced-annotations.md) for a close look at the difference.

**Why should you embed?**\
Embedding resources reduces the need to make HTTP calls. It also ensures the availability of resources when URIs do not resolve. In those cases it would otherwise not be possible to display or use those resources in client applications. If you are certain the resources you are referencing will consistently resolve to the same object you plan to embed then you can move past this suggestion.

### 3.2 Georeference Annotation `motivation`

The `motivation` property declares the reason for creating the Georeference Annotation. The `motivation` property *should* be included on all Georeference Annotations and when included it *must* have the value `georeferencing`.

The [linked data context](https://iiif.io/api/extension/georef/1/context.json) provided with this document includes the formal JSON-LD 1.1 motivation extension, and the [vocabulary](georef/vocab/georef-terms.md) provided with this document contains the formal vocabulary for the `georeferencing` motivation discussed above.

### 3.3 Georeference Annotation `target`

The `target` property describes the resource that the Georeference Annotation applies to. The value for `target` *must* either be a single and full IIIF resource, or a single region within a IIIF resource represented as a [Specific Resource](https://www.w3.org/TR/annotation-model/#specific-resources).

For Georeference Annotations embedded in the `annotations` property of a Canvas, the `target` *must* be the Canvas URI. When the desired target is a part of a Canvas represented by a Specific Resource, the `source` *must* be the Canvas URI. For Georeference Annotations that are external to the IIIF resource they target, implementers *should* embed the IIIF resource in the `target` property instead of referencing it.

Clients processing the georeferencing information require the original height and width of the resources to have the proper aspect ratios. Implementers *should* add the `height` and `width` properties to their embedded resources for consistency.

Sometimes the targeted resource exists within a parent resource, such as a targeted Canvas that exists embedded in some Manifest. In these cases, it is important to maintain the link between them to access useful contextual information. Implementers *may* use the [`partOf` property](../presentation/3.0.md#partof) to reference the parent resource.

#### 3.3.1 Targeting the Full Resource

Example of a Georeference Annotation `target` that is an entire Canvas:

``` json
"target": {
  "id" : "http://www.example.org/canvas1.json"
  "type": "Canvas",
  "height": 2000,
  "width": 1000
  ...
}
```

#### 3.3.2 Targeting a Specific Region of the Resource

When a [Specific Resource](https://www.w3.org/TR/annotation-model/#specific-resources) is used as a `target`, the `source` property supplies the resource and the `selector` property indicates the region of the resource that the annotation applies to. To select a rectangular or polygonal region, a [IIIF Image API Selector](../annex/openannotation.md#iiif-image-api-selector) or an [SVG Selector](https://www.w3.org/TR/annotation-model/#svg-selector) can be used. An SVG Selector can be used on both Canvas and ImageService resources and is the preferred technique.

Example of a Georeference Annotation `target` with a [SVG Selector](https://www.w3.org/TR/annotation-model/#svg-selector) on a Canvas:

``` json
"target": {
  "id": "http://www.example.org/canvas-specific-resource.json",
  "type": "SpecificResource",
  "source": {
    "id": "http://www.example.org/canvas2.json",
    "type": "Canvas",
    "height": 2514,
    "width": 5965
  },
  "selector": {
    "type": "SvgSelector",
    "value": "<svg><polygon points=\"59,84 44,2329 5932,2353 5920,103 \" /></svg>"
  }
}
```

There are some limitations to the type of SVG Selectors you can use to ensure that each map is a single shape without holes:

- The `svg` element *must* contain a single child element.
- This single child element *must* either be a [`<polygon>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon) or a [`<rect>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect).
- When a `rect` element is used, the `rx` and `ry` attributes *must not* be used.
- The [`viewBox`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox) attribute *must not* be used on the `svg` element.
- The `svg` element *may* include `width` and `height` attributes. When these attributes are included, they *must* be equal to the width and height of the targeted resource and they *must* be numbers without units.
- The [`transform`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform) attribute *must not* be used on any of the SVG Selector’s elements.

#### 3.3.3 Content Variants

##### Multiple Maps Depicted on a Single IIIF Resource

It is common that a single IIIF resource depicts multiple maps, such as an image of a map with additional inset maps. Such a resource can be georeferenced by using multiple Georeference Annotations, each with their own SVG Selector and GCPs.

<figure>
<img src="images/greenpoint.jpg" alt="Brooklyn, Vol. 1, 2nd Part, Double Page Plate No. 34; Part of Ward 17, Section 9, from the New York Public Library" />
<figcaption>Three maps depicted and selected on a single IIIF resource: [Brooklyn, Vol. 1, 2nd Part, Double Page Plate No. 34; Part of Ward 17, Section 9](https://digitalcollections.nypl.org/items/69582cf7-d6cd-ba72-e040-e00a18065eba), from the New York Public Library</figcaption>
</figure>

##### A Canvas with multiple painting Annotations

It is also possible for a Canvas to contain multiple painting Annotations, each of a separate map. When the maps on the Canvas align properly, such a Canvas can be georeferenced at once, using a single Georeference Annotation.

<figure>
<img src="images/watergraafsmeer.jpg" alt="Watergraafs of Diemer-meer, from Delft University of Technology Library" />
<figcaption>Four map sheets painted on a single Canvas: [Watergraafs of Diemer-meer](https://tudelft.on.worldcat.org/oclc/708029770), from Delft University of Technology Library.</figcaption>
</figure>

More Georeference Annotation examples with robust implementation guidance will be available through the IIIF Cookbook. This document will be updated with links to those recipes as they become available.

### 3.4 Georeference Annotation `body`

The `body` of a Georeference Annotation contains the geospatial information about the resource that is referenced or embedded in the `target` property. For the purposes of this extension the `body` contains the GCPs. The value for `body` *must* be a GeoJSON Feature Collection. The Feature Collection *must* only contain Features with [Point](https://www.rfc-editor.org/rfc/rfc7946#section-3.1.2) geometries and *should* contain at least three Point Features.

All commonly used transformation algorithms (including the ones described below) that are used to warp images require at least three GCPs. Algorithms exist that only need two GCPs, but they require information about the coordinate reference system (CRS) of the map. This extension does not support adding information about a map’s CRS, as explained in [Section 1.1](#11-objectives-and-scope).

Still, a Georeference Annotation that contains less than three GCPs is valid. Such Georeference Annotations hold geospatial information that can be used in geospatial databases or GIS applications. In crowdsourcing scenarios “incomplete” Georeference Annotations can be finished by someone else while intermediary results still comply with this extension.

An example of the Georeference Annotation `body`:

``` json
{
  "body": {
    "id": "http://www.example.org/feature-collection.json",
    "type": "FeatureCollection",
    "transformation": {
      ...
    },
    "features": [
      ...
    ]
  }
}
```

### 3.5 The `resourceCoords` Property

The `resourceCoords` property is defined by this document in order to supply the coordinates from the IIIF resource and the WGS84 `coordinates` in a Feature together to form a single GCP. Each Feature in the Feature Collection *must* have the `resourceCoords` property in the `properties` property. The value is an array representing a resource coordinate at (x, y) and *must* be exactly in that order.

An example of a Feature with the `resourceCoords` property:

``` json
{
  "type": "Feature",
  "properties": {
    "resourceCoords": [5085, 782]
  },
  "geometry": {
    "type": "Point",
    "coordinates": [4.4885839, 51.9101828]
  }
}
```

**Coordinate System of GCP Resource Coordinates**\
The `resourceCoords` property uses the same cartesian coordinate system as the targeted IIIF resource. When the Georeference Annotation’s targeted resource is the full resource or a selected region of the resource via an SVG selector, the `resourceCoords` value (x, y) corresponds to coordinates (x, y) of that resource. However, when an [Image API Selector](../annex/openannotation.md#iiif-image-api-selector) is used instead of an SVG Selector the `resourceCoords` value (x, y) corresponds to the *translated*, *resized* and *rotated* coordinates according to the Selector’s [region](../image/3.0.md#41-region), [size](../image/3.0.md#42-size) and [rotation](../image/3.0.md#43-rotation) parameters.

### 3.6 The `transformation` Property

The `transformation` property is defined by this document in order to supply the preferred transformation algorithm that is used to create a complete mapping from pixel coordinates to geographic coordinates (and vice versa) based on a list of GCPs. The value for `transformation` is a JSON object which includes the properties `type` and `options`. The property *may* be added to the Feature Collection used in the Georeference Annotation `body` and clients *may* use the information in the object.

If a transformation algorithm is not provided, clients *should* use their default algorithm. Similarly, if the supplied transformation algorithm is not supported by a client, that client *should* use their default algorithm.

The name of the preferred transformation algorithm is stored in the `type` property inside the `transformation` JSON object. Typical values include but are not limited to:

| Transformation type | Description | Options |
|----|----|----|
| `polynomial` | 1st, 2nd or 3rd order polynomial transformation | `order` |
| `thinPlateSpline` | Thin plate spline transformation, also known as *rubber sheeting* | N/A |

The `options` property is used to supply additional parameters related to the selected transformation type. If a transformation type does not have or require options, implementers *should not* include the `options` property.

The table below describes the different possible `order` values for the `polynomial` transformation type.

| Value | Description                                     |
|-------|-------------------------------------------------|
| `1`   | 1st order (linear) polynomial transformation    |
| `2`   | 2nd order (quadratic) polynomial transformation |
| `3`   | 3nd order (cubic) polynomial transformation     |

Other properties within `options`, including other transformation types not defined in this document, *should* be described either by [registered IIIF API extensions](../extension.md) or [local linked data contexts](https://www.w3.org/TR/json-ld11/#dfn-local-context). If a client is not able to process properties then it *must* ignore them.

Example of a `transformation` JSON object:

``` json
{
  "transformation": {
    "type": "polynomial",
    "options": {
      "order": 1
    }
  }
}
```

## 4. Full Examples

### 4.1 Full Canvas Example

``` json
{
  "@context": [
    "http://iiif.io/api/extension/georef/1/context.json",
    "http://iiif.io/api/presentation/3/context.json"
  ],
  "id": "http://www.example.org/georeferenced-canvas.json",
  "type": "Canvas",
  "label": {
    "nl": ["River Nieuwe Maas and Rotterdam's Havens"],
    "en": ["Guide to the New-Waterway"]
  },
  "height": 2514,
  "width": 5965,
  "items": [
    {
      "id": "http://www.example.org/contentPage.json",
      "type": "AnnotationPage",
      "items": [
        {
          "id": "http://www.example.org/content.json",
          "type": "Annotation",
          "motivation": "painting",
          "body": {
            "id": "https://cdm21033.contentdm.oclc.org/digital/iiif/krt/2891/full/full/0/default.jpg",
            "type": "Image",
            "format": "image/jpeg",
            "height": 2514,
            "width": 5965,
            "service": [
              {
                "@id": "https://cdm21033.contentdm.oclc.org/digital/iiif/krt/2891",
                "type": "ImageService2"
              }
            ]
          },
          "target": "http://www.example.org/georeferenced-canvas.json"
        }
      ]
    }
  ],
  "annotations": [
    {
      "id": "http://www.example.org/annotationPage.json",
      "type": "AnnotationPage",
      "items": [
        {
          "id": "http://www.example.org/canvas-annotation.json",
          "type": "Annotation",
          "motivation": "georeferencing",
          "target": "http://www.example.org/georeferenced-canvas.json",
          "body": {
            "id": "http://www.example.org/feature-collection.json",
            "type": "FeatureCollection",
            "transformation": {
              "type": "polynomial",
              "options": {
                "order": 1
              }
            },
            "features": [
              {
                "type": "Feature",
                "properties": {
                  "resourceCoords": [5085, 782]
                },
                "geometry": {
                  "type": "Point",
                  "coordinates": [4.4885839, 51.9101828]
                }
              },
              {
                "type": "Feature",
                "properties": {
                  "resourceCoords": [5467, 1338]
                },
                "geometry": {
                  "type": "Point",
                  "coordinates": [4.5011785, 51.901595]
                }
              },
              {
                "type": "Feature",
                "properties": {
                  "resourceCoords": [2006, 374]
                },
                "geometry": {
                  "type": "Point",
                  "coordinates": [4.405981, 51.9091596]
                }
              }
            ]
          }
        }
      ]
    }
  ],
  "partOf": [{
    "id": "http://example.org/manifest/1",
    "type": "Manifest"
  }]
}
```

### 4.2 Full Georeference Annotation Example

``` json
{
  "@context": [
    "http://iiif.io/api/extension/georef/1/context.json",
    "http://iiif.io/api/presentation/3/context.json"
  ],
  "id": "http://www.example.org/canvas-annotation.json",
  "type": "Annotation",
  "motivation": "georeferencing",
  "target": {
    "id": "http://www.example.org/canvas.json",
    "type": "Canvas",
    "label": {
      "nl": ["River Nieuwe Maas and Rotterdam's Havens"],
      "en": ["Guide to the New-Waterway"]
    },
    "height": 2514,
    "width": 5965,
    "items": [
      {
        "id": "http://www.example.org/contentPage.json",
        "type": "AnnotationPage",
        "items": [
          {
            "id": "http://www.example.org/content.json",
            "type": "Annotation",
            "motivation": "painting",
            "body": {
              "id": "https://cdm21033.contentdm.oclc.org/digital/iiif/krt/2891/full/full/0/default.jpg",
              "type": "Image",
              "format": "image/jpeg",
              "height": 2514,
              "width": 5965,
              "service": [
                {
                  "@id": "https://cdm21033.contentdm.oclc.org/digital/iiif/krt/2891",
                  "type": "ImageService2"
                }
              ]
            },
            "target": "http://www.example.org/canvas.json"
          }
        ]
      }
    ],
    "partOf": [{
      "id": "http://example.org/manifest/1",
      "type": "Manifest"
    }]
  },
  "body": {
    "id": "http://www.example.org/feature-collection.json",
    "type": "FeatureCollection",
    "transformation": {
      "type": "polynomial",
      "options": {
        "order": 1
      }
    },
    "features": [
      {
        "type": "Feature",
        "properties": {
          "resourceCoords": [5085, 782]
        },
        "geometry": {
          "type": "Point",
          "coordinates": [4.4885839, 51.9101828]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "resourceCoords": [5467, 1338]
        },
        "geometry": {
          "type": "Point",
          "coordinates": [4.5011785, 51.901595]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "resourceCoords": [2006, 374]
        },
        "geometry": {
          "type": "Point",
          "coordinates": [4.405981, 51.9091596]
        }
      }
    ]
  }
}
```

## 5. Linked Data Context

- The URI of this extension’s linked data context is `http://iiif.io/api/extension/georef/1/context.json`
- The URI of the IIIF Presentation API linked data context is `http://iiif.io/api/presentation/3/context.json`

The linked data context of this extension *must* be included before the IIIF Presentation API linked data context on the top-level object. The extension linked data context file includes the [GeoJSON-LD context](https://geojson.org/geojson-ld/geojson-context.jsonld) through [context scoping](https://www.w3.org/TR/json-ld11/#dfn-scoped-context). This means the GeoJSON-LD context URI does not have to be explicitly included on the top level object. Note that since the IIIF Presentation API linked data context has the JSON-LD `@version` set to 1.1, all linked data contexts are processed as JSON-LD 1.1. It is also worth noting the linked data context for this extension also has `@version` set to 1.1. If this context is used in another setting, it will have the same behavior. JSON-LD 1.0 processors will throw a version error.

Consult the [Linked Data Context and Extensions section of IIIF Presentation API](../presentation/3.0.md#46-linked-data-context-and-extensions) for further guidance on use of the `@context` property.

## 6. Appendices

### A. Acknowledgements

This extension was produced by the IIIF Maps Community Group and IIIF Maps Technical Specification Group. Of course, assistance came from many branches of the IIIF Community. We thank everyone for their time and perseverance given to ensure this extension is as useful as possible.

A grant from [Stichting Pica](https://www.stichtingpica.nl) for the further development of [Allmaps Viewer](https://viewer.allmaps.org) made the completion of this extension possible.

### B. Change Log

| Date       | Description         |
|------------|---------------------|
| 2023-05-15 | Initial publication |
