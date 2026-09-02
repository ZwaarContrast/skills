<!-- source: https://iiif.io/api/cookbook/recipe/0003-mvm-video/ -->

## Use Case

The simplest viable manifest for video content. This pattern presents a single video file in a IIIF Presentation resource.

## Implementation Notes

The implementation is identical to the [image example](0001-mvm-image.md "Simplest Manifest - Image"), except that the content is video and the canvas has the `duration` property additional to the `height` and `width` properties. The value of the `duration` property [must be a floating point number](../../presentation/3.0.md#duration). If the duration value you have is an integer, it therefore needs to be written with at least a decimal point and a trailing zero: `1985.0` rather than `1985`.

## Example

This example shows a Manifest with a single Canvas that lasts for 572 seconds, or just under 10 minutes. It has a single video file (lunchroom_manners_1024kb.mp4) which is associated with it. The mp4 also has a duration of 572 seconds.

[JSON-LD](0003-mvm-video/manifest.json)

Code samples: [Python: iiif-prezi3](https://iiif-prezi.github.io/iiif-prezi3/recipes/0003-mvm-video/)

``` line-numbers
```

# Related Recipes

- [Simplest Manifest - Image](0001-mvm-image.md "Simplest Manifest - Image") and [Simplest Manifest - Audio](0002-mvm-audio.md "Simplest Manifest - Audio") are equivalent to this example.

## Use Case

The simplest viable manifest for video content. This pattern presents a single video file in a IIIF Presentation resource.

## Implementation Notes

This illustrates the mandatory structure and properties of a manifest, with the simplest possible video content.

The implementation is substantively identical to the [image example](0001-mvm-image.md#version-4 "Simplest Manifest - Image"), except that the content is video and the Canvas has the `duration` property additional to the `height` and `width` properties. See [Simplest Manifest - Image](0001-mvm-image.md#version-4 "Simplest Manifest - Image") for enumeration and brief description of required properties.

The value of the `duration` property [must be a floating point number](../../presentation/4.0/model.md#duration). If the duration value you have is an integer, it therefore needs to be written with at least a decimal point and a trailing zero: `1985.0` rather than `1985`.

The duration of the video file, in seconds, is given and here matches the Canvas’s `duration` property exactly. Matching is not required, but mismatches will change how much of the video is presented and may change what happens after the video finishes playing. Likewise, the pixel dimensions of the video file match the dimensionless coordinate space units. Matching is also not required here, but mismatches may change the visual display.

## Example

This example shows a Manifest with a single Canvas that lasts for 572 seconds, or just under 10 minutes. It has a single video file associated with it. The mp4 also has a duration of 572 seconds.

[JSON-LD](0003-mvm-video/v4/manifest.json)

``` line-numbers
```

# Related Recipes

- [Simplest Manifest - Image](0001-mvm-image.md#version-4 "Simplest Manifest - Image") for a minimal image Manifest
- [Simplest Manifest - Audio](0002-mvm-audio.md#version-4 "Simplest Manifest - Audio") for a minimal audio Manifest
- [Simplest Manifest - 3D](0608-mvm-3d.md#version-4 "Simplest Manifest - 3D model") for a minimal 3D object Manifest

## Manifest Comparison

Below is an auto generated diff showing the changes between IIIF Presentation API version 3 and version 4 of the recipe Manifest.

Loading diff…
