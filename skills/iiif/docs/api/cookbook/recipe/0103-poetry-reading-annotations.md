<!-- source: https://iiif.io/api/cookbook/recipe/0103-poetry-reading-annotations/ -->

## Use Case

Scholars may wish to use annotations to indicate aspects of the performance of a particular poem.

For a performance of a published text, transcribing the performance is of little use to the researcher annotating the performance. Rather, the annotations serve as commentary on the performance itself.

A researcher might want to annotate the following types of information:

- structural information (introduction, title, stanzas)
- points where the performer takes a breath
- repeated or emphasized phrases

## Implementation notes

This implementation builds off of the [audio example](0002-mvm-audio.md "Simplest Manifest - Audio"), but adds Web Annotations. We show annotation targeting using a simplified Media Fragment `#t=702.0,705.0` appended to the canvas URL.

If you are targeting a single point, you should use a point selector. The [Begin playback at a specific point - Time-based media](0015-start.md "Begin playback at a specific point - Time-based media") recipe demonstrates that approach.

Because the annotations are pointing out features of the audio, rather than transcriptions, the `motivation` for each annotation is `commenting` not `supplementing`. If the annotations were transcriptions, their motivation would be `supplementing`.

## Example

A manifest for a poetry reading by Canadian poet Daphne Marlatt in 2018 that includes an annotation describing environmental noise. The recording is 707 seconds long.

[JSON-LD](0103-poetry-reading-annotations/manifest.json)

# Related recipes

- [Simple Manifest - Audio](0002-mvm-audio.md "Simplest Manifest - Audio")
- \[Transformation - WebVTT or OHMS XML to Annotations\]\[0079\]
- [Begin playback at a specific point - Time-based media](0015-start.md "Begin playback at a specific point - Time-based media")
- [Embedded or Referenced Annotations](0269-embedded-or-referenced-annotations.md "Embedded or Referenced Annotations")
