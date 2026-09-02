<!-- source: https://iiif.io/api/cookbook/recipe/0002-mvm-audio/ -->

## Use Case

The simplest viable manifest for audio content. This pattern presents a single audio file in a IIIF Presentation resource.

## Implementation Notes

The implementation is identical to the [image example](0001-mvm-image.md "Simplest Manifest - Image"), except that the content is audio and the canvas has the `duration` property instead of the `height` and `width` properties. The value of the `duration` property [must be a floating point number](../../presentation/3.0.md#duration). If the duration value you have is an integer, it therefore needs to be written with at least a decimal point and a trailing zero: `1985.0` rather than `1985`.

## Example

This example shows a Manifest with a single Canvas that lasts for 1985.024 seconds. It has a single audio file which is associated with it. The mp4 also has a duration of 1985.024 seconds.

[JSON-LD](0002-mvm-audio/manifest.json)

Code samples: [Python: iiif-prezi3](https://iiif-prezi.github.io/iiif-prezi3/recipes/0002-mvm-audio/)

``` line-numbers
```

## Related Recipes

- [Simplest Manifest - Image](0001-mvm-image.md "Simplest Manifest - Image") for the most minimal image Manifest
- [Simplest Manifest - Video](0003-mvm-video.md "Simplest Manifest - Video") for the most minimal video Manifest

## Use Case

The simplest viable manifest for audio content. This pattern presents a single audio file in a IIIF Presentation resource.

## Implementation Notes

This illustrates the mandatory structure and properties of a manifest, with the simplest possible audio content.

Audio resources are contained inside a [Timeline](../../presentation/4.0.md#timeline), which is required to have a `duration` property with the time, in seconds, of the audio resource to be included in the timeline. The value of the `duration` property [must be a floating point number](../../presentation/4.0/model.md#duration). If the duration value you have is an integer, it needs to be written with at least a decimal point and a trailing zero: `1985.0` rather than `1985`.

The `items` property of the Canvas is a list of annotation pages. In this case there is only one. The `items` property of the annotation page is a list of annotations. Again, in this case there is only one. This annotation links the audio resource and the timeline. The `body` of the annotation is an audio file, the url of which is the `id` property of the body. The duration of the audio file, in seconds, is given and here matches the timeline’s `duration` property exactly. Matching is not required, but mismatches will change how much of the audio is heard and may change what happens after the audio finishes playing. The `target` property tells us both that the audio file is associated with the entirety of the container and that the container is a timeline, and the `motivation` property of “painting” tells us that the audio file is the content of the container.

The `type` of the resource is “Audio” but viewers should accept “Sound” as a synonym for Audio to improve compatibility with previous versions. For more details see the [type definition](../../presentation/4.0/model.md#type).

## Example

This example shows a Manifest with a single Timeline that lasts for 1985.024 seconds. It has a single audio file associated with it. The mp4 also has a duration of 1985.024 seconds.

[JSON-LD](0002-mvm-audio/v4/manifest.json)

``` line-numbers
```

## Related Recipes

- [Simplest Manifest - Image](0001-mvm-image.md#version-4 "Simplest Manifest - Image") for a minimal image Manifest
- [Simplest Manifest - Video](0003-mvm-video.md#version-4 "Simplest Manifest - Video") for a minimal video Manifest
- [Simplest Manifest - 3D](0608-mvm-3d.md#version-4 "Simplest Manifest - 3D model") for a minimal 3D object Manifest

## Manifest Comparison

Below is an auto generated diff showing the changes between IIIF Presentation API version 3 and version 4 of the recipe Manifest.

Loading diff…
