<!-- source: https://iiif.io/api/cookbook/recipe/0560-resources-on-a-timeline/ -->

## Use Case

You have a set of images you would like to present sequentially in time, in the manner of an automated slide show.

## Implementation Notes

This recipe is very similar to [Composition from Multiple Images](0036-composition-from-multiple-images.md "Composition from Multiple Images"), which describes using multiple IIIF resources on a single Canvas. The substantial difference between that recipe and this one is the incorporation of [the `duration` property](../../presentation/3.0.md#duration) and [`behavior` values](../../presentation/3.0.md#behavior) for instructing viewers on Canvas sequencing.

If a Canvas has a `duration` property, viewers have to process it, and can be helpful by providing an interactive means of displaying that Canvas for the value of the `duration`. To give a viewer instructions on showing a resource during all or part of that duration, the Canvas can use a media fragment on its `target` value, in the form `#t=`. For details on formats and semantics of this media fragment, see the [W3C Media Fragments section on Temporal Dimension](https://www.w3.org/TR/media-frags/#naming-time). Note that while the Media Fragments specification allows for values other than numbers of seconds, IIIF conventionally uses only whole and/or partial seconds. Fragment values can be individually or in the aggregate greater than the `duration` value. See [Rendering Multiple Media Types on a Time-Based Canvas](0489-multimedia-canvas.md "Rendering Multiple Media Types on a Time-Based Canvas") for a brief explanation of the `timeMode` property and for more on the “t” parameter on a `target`.

The Presentation API 3.0 is not explicit about whether a viewer should initiate play upon loading a Canvas with a `duration` property, even with a `start` value. In addition, for browser-based viewers, people may configure their browsers to disable autoplay. Consequently, manifest creators should not assume a resource with `duration` will begin without interaction.

Once the timeline has started, the default action in IIIF is to display a Canvas for the `duration` value and stop, regardless of the individual or aggregate “t” parameter values on the `target`s of the Canvas’s descendent `items`. To get the annotation sequence to repeat, the `behavior` value is set to `repeat`. This value is applicable only on Collections or Manifests containing Canvases with `duration`. Once the end of the `duration` (the end of the timeline) is reached, this behavior tells the viewer to start over at the beginning. Note that there is no mechanism for repeating a fixed number of times.

Within a Canvas’s annotations, the parameterized `target` values tell viewers to show each item for the “t” parameter value, not stopping until an appropriate interaction or until and unless it reaches a Canvas with no `behavior` or a Canvas with an explicit `no-auto-advance` behavior. (The default is `no-auto-advance`, so no `behavior` is functionally equivalent to declaring `no-auto-advance`.)

## Restrictions

No known restrictions, but a caution: When using timing, a high degree of precision is not likely to be achieved for all people. Resources may load slowly for many reasons, including image server issues, network traffic, or browser and client customizations. Except in a very predictable environment, timing should be considered approximate.

## Example

In this example (a minimal implementation of the use case), there are two paintings from Winslow Homer to be displayed one after the other in a loop. For demonstration purposes, the Canvas `duration` is quite short (4.0 seconds) while the timing in a real-world situation would probably be longer. The paintings are `items` on a single Canvas and should progress automatically once the timeline is started.

[JSON-LD](0560-resources-on-a-timeline/manifest.json)

``` line-numbers
```

## Related Recipes

- [Composition from Multiple Images](0036-composition-from-multiple-images.md "Composition from Multiple Images") for using multiple IIIF resources on a single Canvas
- [Image and Canvas with Differing Dimensions](0004-canvas-size.md "Image and Canvas with Differing Dimensions") for details about the way this recipe uses resources with different dimensions on a Canvas with unchanging dimensions.
- [Rendering Multiple Media Types on a Time-Based Canvas](0489-multimedia-canvas.md "Rendering Multiple Media Types on a Time-Based Canvas") is a more complex combination of still and time-based resources with various IIIF properties.
