<!-- source: https://iiif.io/api/cookbook/recipe/0135-annotating-point-in-canvas/ -->

## Use Case

You want to annotate a coordinate of the image rather than a region. You have a map with some locations that can be represented better by a single coordinate. You want to add some auxiliary data relative to a specific point of the image (e.g. some spectroscopic analysis made on a manuscript).

## Implementation notes

This recipe, as [Simple Annotation — Tagging](0021-tagging.md "Simple Annotation — Tagging") implements a method for annotating an image. Recipe [Begin playback at a specific point - Time-based media](0015-start.md "Begin playback at a specific point - Time-based media") uses a Point Selector for selecting a specific time of a video, this recipe selects instead a specific point of the image.

In this use case, the Annotation is inside an Annotation Page in the `annotations` list of the Manifest. The `motivation` of the Annotation is “tagging” and the target `source` points to the Canvas `id`. The `type` property is a Specific Resource while the Selector `type` property is a Point Selector that contains the coordinates `x` and `y` of the Canvas coordinates system as parameters.

Viewers might consider implementing scale-independent point markers so that they are visible at every level of zoom.

## Example

This example uses a leaflet with a map and a guide supplied by the Library of Congress Geography and Map Division, it shows how we can annotate some locations expressed in the map.

[JSON-LD](0135-annotating-point-in-canvas/manifest.json)

# Related recipes

- [Begin playback at a specific point - Time-based media](0015-start.md "Begin playback at a specific point - Time-based media") uses a Point Selector for selecting for starting the playback at a specific time.
- [Simple Annotation — Tagging](0021-tagging.md "Simple Annotation — Tagging") a simple annotation pointing to a region of an image.
