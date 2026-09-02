<!-- source: https://iiif.io/api/cookbook/recipe/0014-accompanyingcanvas/ -->

## Use Case

You have content you would like to provide to the user to enrich the presentation or experience of the main content. It could be something to experience before the user chooses to start interacting with the main content and/or something additional to consider while interacting with the main content. You might want to have an image available while an audio-only Canvas is playing or, conversely, audio available while a user is navigating an image-only Manifest.

## Implementation notes

Across a Manifest and its properties, you may use more than one `accompanyingCanvas`, allowing you to have an authentic `accompanyingCanvas` for each appropriate resource (Collection, Manifest, Canvas, and Range).

The `target` of the `Annotation` of an `accompanyingCanvas` should have as its value the `id` of the `accompanyingCanvas`, not the `id` of the resource that has the `accompanyingCanvas`.

Always keep in mind the wide latitude given conforming clients: It is up to the client whether and in what sort of UI to display content you place in a `accompanyingCanvas` property. Don’t use this property for content that must be displayed. On the other hand, placing content in a `accompanyingCanvas` does tell a client that the content, if displayed, should be displayed at the same time as the resource to which it is attached.

## Restrictions

Each instance of `accompanyingCanvas` may only contain one Canvas, and as such may specifically not contain an additional `accompanyingCanvas` or a `placeholderCanvas`.

## Example

In the example, the main Canvas contains audio of a performance of Gustav Mahler’s Symphony No. 3 and the `accompanyingCanvas` contains an image of a page from the score.

[JSON-LD](0014-accompanyingcanvas/manifest.json)

Code samples: [Python: iiif-prezi3](https://iiif-prezi.github.io/iiif-prezi3/recipes/0014-accompanyingcanvas/)

# Related recipes

- [Simplest Manifest - Video](0003-mvm-video.md "Simplest Manifest - Video")
- [Load a Preview Image Before the Main Content](0013-placeholderCanvas.md "Load a Preview Image Before the Main Content"), using `placeholderCanvas` to present one resource ahead of another.
