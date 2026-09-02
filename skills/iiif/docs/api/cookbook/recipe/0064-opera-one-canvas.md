<!-- source: https://iiif.io/api/cookbook/recipe/0064-opera-one-canvas/ -->

## Use Case

It is common to have A/V content split into multiple files. This recipe shows how to model such content using one single Canvas. The advantage of using one single Canvas is continuous playback across the files, with the viewer reporting the sum duration of the files, thus providing the user with a cohesive viewing/listening experience.

## Implementation Notes

This implementation builds upon the [Table of Contents for A/V Content](0026-toc-opera.md "Table of Contents for A/V Content") recipe but uses two video files, one for each act of the opera used as example, annotated onto the same Canvas: Atto Primo targets \#t=0, and Atto Secondo targets \#t=3971.24, right after the end of Atto Primo, thus ensuring continuous playback. Conceptually it makes more sense to include both acts as annotations on the same Annotation Page since they are both targeting the same Canvas.

The opera covers the whole length of the Canvas and is divided into two Ranges for the two acts. Atto Primo has a Range for the prelude and first song and then a Range for the remainder of the act. Atto Secondo has not been subdivided into Ranges for simplicity of this example.

Metadata and thumbnail properties have been added for more context. Implementation is similar to [Book Chapters](0024-book-4-toc.md "Book with Table of contents (ranges)"), but nesting may be deeper.

## Example

[JSON-LD](0064-opera-one-canvas/manifest.json)

Code samples: [Python: iiif-prezi3](https://iiif-prezi.github.io/iiif-prezi3/recipes/0064-opera-one-canvas/)

## Related Recipes

- [Text in Multiple Languages](0006-text-language.md "Internationalization and Multi-language Values") - Recipe explaining the use of multiple languages in text like in the label for this opera.
- \[Thumbnails\]\[0012\]
- [Table of Contents for A/V Content](0026-toc-opera.md "Table of Contents for A/V Content") - Another example of using nested Ranges to represent an opera’s table of contents.
- [Table of Contents for Multiple A/V Files on Multiple Canvases](0065-opera-multiple-canvases.md "Table of Contents for Multiple A/V Files on Multiple Canvases") - The same opera from this example but in audio format split across multiple Canvases.
