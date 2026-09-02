<!-- source: https://iiif.io/api/cookbook/ -->

The [IIIF Presentation API](https://iiif.io/api/presentation/3 "IIIF Presentation API") specifies a standardized way to describe complex digital objects. The resource types and properties of the specification are the building blocks of interoperable representations, for rendering by viewers and other software clients. This cookbook gathers together many examples of these representations (usually IIIF Manifests), in order to:

- provide many more examples than the specification alone can do, for reference and learning;
- encourage publishers to adopt common patterns in modeling classes of complex objects;
- enable client software developers to support these patterns, for consistency of user experience (when desirable);
- demonstrate the applicability of IIIF to a broad range of use cases.

The issues of the [Cookbook Recipes repository](https://github.com/IIIF/cookbook-recipes/issues) are used to identify and discuss cookbook recipes, prior to their inclusion in the final cookbook site.

## Viewer Support

As part of the work to aid implementation the Cookbook group have developed a Viewer Matrix which shows which recipe is supported by which IIIF viewer.

[IIIF v3 viewer support](cookbook/recipe/matrix.md)

[IIIF v4 viewer support](cookbook/recipe/matrix-v4.md)

## Presentation API Versions

The cookbook contains recipes primarily for version 3 of the IIIF Presentation API. Where a recipe has been written for only version 4, or for both versions 3 and 4, that is indicated following the recipe title.

## Code samples

As well as viewer support, the cookbook provides links to code samples in various development libraries to aid developers who hope to re-create these recipes in Code. You can see a full list of recipes with code samples in the [code samples](cookbook/recipe/code.md) page.

# Contributing

Anyone is welcome to submit a recipe idea or work on implementing a recipe. Advice and support can be received from the IIIF Cookbook channel on the IIIF Slack. For detailed information on how to contribute please see the [Cookbook process](cookbook/recipe.md).

# The Recipes

## Building a manifest in stages, adding more complexity at each stage

- Simplest Manifest - Image ([version 3](cookbook/recipe/0001-mvm-image.md "Simplest Manifest - Image") / [version 4](cookbook/recipe/0001-mvm-image.md#version-4 "Simplest Manifest - Image"))
- Simplest Manifest - Audio ([version 3](cookbook/recipe/0002-mvm-audio.md "Simplest Manifest - Audio") / [version 4](cookbook/recipe/0002-mvm-audio.md#version-4 "Simplest Manifest - Audio"))
- Simplest Manifest - Video ([version 3](cookbook/recipe/0003-mvm-video.md "Simplest Manifest - Video") / [version 4](cookbook/recipe/0003-mvm-video.md#version-4 "Simplest Manifest - Video"))
- Simplest Manifest - 3D ([version 4](cookbook/recipe/0608-mvm-3d.md#version-4 "Simplest Manifest - 3D model"))
- Image and Canvas with Differing Dimensions ([version 3](cookbook/recipe/0004-canvas-size.md "Image and Canvas with Differing Dimensions"))
- Support Deep Viewing with Basic Use of a IIIF Image Service ([version 3](cookbook/recipe/0005-image-service.md "Support Deep Viewing with Basic Use of a IIIF Image Service"))
- Internationalization and Multi-language Values ([version 3](cookbook/recipe/0006-text-language.md "Internationalization and Multi-language Values"))
- Displaying Multiple Values with Language Maps ([version 3](cookbook/recipe/0118-multivalue.md "Displaying Multiple Values with Language Maps"))
- Embedding HTML in descriptive properties ([version 3](cookbook/recipe/0007-string-formats.md "Embedding HTML"))
- Metadata on any Resource ([version 3](cookbook/recipe/0029-metadata-anywhere.md "Metadata on any Resource"))
- Rights statement(s) ([version 3](cookbook/recipe/0008-rights.md "Rights"))
- Simple Manifest - Book ([version 3](cookbook/recipe/0009-book-1.md "Simple Manifest - Book"))
- Book behavior (paging) variations ([version 3](cookbook/recipe/0011-book-3-behavior.md "Book behavior (paging) variations"))
- Addressing a spatial region ([version 3](cookbook/recipe/0299-region.md "Addressing a spatial region"))
- Viewing direction and its effect on navigation ([version 3](cookbook/recipe/0010-book-2-viewing-direction.md "Viewing direction and its effect on navigation"))
- Missing Images in a Sequence ([version 3](cookbook/recipe/0283-missing-image.md "Missing Images in a Sequence"))
- Image Thumbnail for Manifest ([version 3](cookbook/recipe/0117-add-image-thumbnail.md "Image Thumbnail for Manifest"))
- Implementation discussion: Thumbnails on Canvases ([version 3](cookbook/recipe/0232-image-thumbnail-canvas.md "Implementation discussion: Thumbnails on Canvases"))
- Load a Preview Image Before the Main Content ([version 3](cookbook/recipe/0013-placeholderCanvas.md "Load a Preview Image Before the Main Content"))
- Audio Presentation with Accompanying Image ([version 3](cookbook/recipe/0014-accompanyingcanvas.md "Audio Presentation with Accompanying Image"))
- Load Manifest Beginning with a Specific Canvas ([version 3](cookbook/recipe/0202-start-canvas.md "Load Manifest Beginning with a Specific Canvas"))
- Begin playback at a specific point - Time-based media ([version 3](cookbook/recipe/0015-start.md "Begin playback at a specific point - Time-based media"))
- Navigation by Chronology ([version 3](cookbook/recipe/0230-navdate.md "Navigation by Chronology"))
- Locate a Manifest on a Web Map ([version 3](cookbook/recipe/0154-geo-extension.md "Locate a Manifest on a Web Map"))
- Locate Multiple Canvases on a Web Map ([version 3](cookbook/recipe/0240-navPlace-on-canvases.md "Locate Multiple Canvases on a Web Map"))
- Acknowledge Content Contributors ([version 3](cookbook/recipe/0234-provider.md "Acknowledge Content Contributors"))
- Simple Collection ([version 3](cookbook/recipe/0032-collection.md "Simple Collection"))
- Reuse parts of a Manifest ([version 3](cookbook/recipe/0464-reuse-manifest.md "Reuse parts of a Manifest"))

## Textual and other supplementary content

- Using Transcripts with A/V Content ([version 3](cookbook/recipe/0017-transcription-av.md "Providing Access to Transcript Files of A/V Content"))
- Scholarly Annotation of a Poetry Reading ([version 3](cookbook/recipe/0103-poetry-reading-annotations.md "Scholarly Annotation of a Poetry Reading"))
- Using Captions and Subtitles with Video Content ([version 3](cookbook/recipe/0219-using-caption-file.md "Using Caption and Subtitle Files with Video Content"))
- Providing Alternative Representations ([version 3](cookbook/recipe/0046-rendering.md "Providing Alternative Representations"))
- Transcripts, Captions, and Subtitles - General Considerations ([version 3](cookbook/recipe/0231-transcript-meta-recipe.md "Transcripts, Captions, and Subtitles - General Considerations"))
  - Providing Access to Transcript Files of A/V Content ([version 3](cookbook/recipe/0017-transcription-av.md "Providing Access to Transcript Files of A/V Content"))
  - Using Caption and Subtitle Files with Video Content ([version 3](cookbook/recipe/0219-using-caption-file.md "Using Caption and Subtitle Files with Video Content"))

## Other kinds of annotations

(These are also building blocks for segmentation, below)

- Simplest Annotation ([version 3](cookbook/recipe/0266-full-canvas-annotation.md "Simplest Annotation"))
- HTML in Annotations ([version 3](cookbook/recipe/0019-html-in-annotations.md "HTML in Annotations"))
- CSS in an Annotation ([version 3](cookbook/recipe/0045-css.md "CSS in an Annotation"))
- Simple Annotation - Tagging ([version 3](cookbook/recipe/0021-tagging.md "Simple Annotation — Tagging"))
- Annotation with a Non-Rectangular Polygon ([version 3](cookbook/recipe/0261-non-rectangular-commenting.md "Annotation with a Non-Rectangular Polygon"))
- Tagging with an External Resource ([version 3](cookbook/recipe/0258-tagging-external-resource.md "Tagging with an External Resource"))
- Redirecting from one Canvas to another resource (Hotspot linking) ([version 3](cookbook/recipe/0022-linking-with-a-hotspot.md "Redirecting from one Canvas to another resource (Hotspot linking)"))
- Annotate a specific images or layers ([version 3](cookbook/recipe/0326-annotating-image-layer.md "Annotate a specific images or layers"))
- Annotating a specific point of an image ([version 3](cookbook/recipe/0135-annotating-point-in-canvas.md "Annotating a specific point of an image"))
- Geographic coordinates ([version 3](cookbook/recipe/0139-geolocate-canvas-fragment.md "Represent Canvas Fragment as a Geographic Area on a Web Map"))
- Embedded or Referenced Annotations ([version 3](cookbook/recipe/0269-embedded-or-referenced-annotations.md "Embedded or Referenced Annotations"))
- Linking external Annotations targeting a Canvas to a Manifest ([version 3](cookbook/recipe/0306-linking-annotations-to-manifests.md "Linking external Annotations targeting a Canvas to a Manifest"))
- Using Annotation collections ([version 3](cookbook/recipe/0309-annotation-collection.md "Using Annotation Collections"))
- Image in annotations ([version 3](cookbook/recipe/0377-image-in-annotation.md "Image in annotation"))
- Annotating in Multiple Languages ([version 3](cookbook/recipe/0346-multilingual-annotation-body.md "Annotating in Multiple Languages"))
- Visible Text Resource on a Canvas ([version 3](cookbook/recipe/0561-text-on-image.md "Visible Text Resource on a Canvas"))

## Internal structure

- Table of Contents for Book Chapters ([version 3](cookbook/recipe/0024-book-4-toc.md "Book with Table of contents (ranges)"))
- Navigation by Newspaper Article ([version 3](cookbook/recipe/0025-newspaper-article-index.md "Navigation by Newspaper Article"))
- Table of contents for A/V content ([version 3](cookbook/recipe/0026-toc-opera.md "Table of Contents for A/V Content"))
- Adding Thumbnail Navigation and `no-nav` to a Video Resource ([version 3](cookbook/recipe/0229-behavior-ranges.md "Adding Thumbnail Navigation and `no-nav` to a Video Resource"))
- Alternative Page Sequences ([version 3](cookbook/recipe/0027-alternative-page-order.md "Alternative Page Sequences"))

## Higher-level structure

- Multi-volume Work with Individually-bound Volumes ([version 3](cookbook/recipe/0030-multi-volume.md "Multi-volume Work with Individually-bound Volumes"))
- Multiple Volumes in a Single Bound Volume ([version 3](cookbook/recipe/0031-bound-multivolume.md "Multiple Volumes in a Single Bound Volume"))

## Segmentation and complex resources

- Multiple choice of images in a single view ([version 3](cookbook/recipe/0033-choice.md "Multiple choice of images in a single view"))
- Foldouts, Flaps, and Maps ([version 3](cookbook/recipe/0035-foldouts.md "Foldouts, Flaps, and Maps"))
- Composition from Multiple Images ([version 3](cookbook/recipe/0036-composition-from-multiple-images.md "Composition from Multiple Images"))
- Rendering Resources Sequentially on a Timeline ([version 3](cookbook/recipe/0560-resources-on-a-timeline.md "Rendering Resources Sequentially on a Timeline"))
- Rendering Multiple Media Types on a Time-Based Canvas ([version 3](cookbook/recipe/0489-multimedia-canvas.md "Rendering Multiple Media Types on a Time-Based Canvas"))
- Image Rotation Two Ways ([version 3](cookbook/recipe/0040-image-rotation-service.md "Image Rotation Two Ways"))

## Linking

- Linking to Web Page of an Object (homepage) ([version 3](cookbook/recipe/0047-homepage.md "Linking to Web Page of an Object"))
- Linking to Structured Metadata ([version 3](cookbook/recipe/0053-seeAlso.md "Linking to Structured Metadata"))

## Sharing IIIF content

Recipes using [Content State API](content-state/1.0.md)

- Loading a manifest with a viewer using a link ([version 3](cookbook/recipe/0466-link-for-loading-manifest.md "Loading a manifest with a viewer using a link"))
- Open a specific region of a canvas in a viewer ([version 3](cookbook/recipe/0485-contentstate-canvas-region.md "Open a specific region of a canvas in a viewer"))
- Sharing a link for opening two or more Canvases ([version 3](cookbook/recipe/0540-link-for-opening-multiple-canvases.md "Sharing a link for opening two or more Canvases"))
- Drag and drop ([version 3](cookbook/recipe/0599-drag-and-drop.md "Drag and Drop"))

## Technical

- Making IIIF Presentation API v2 and v3 manifests available at the same URL ([version 3](cookbook/recipe/0057-publishing-v2-and-v3.md "Making IIIF Presentation API v2 and v3 manifests available at the same URL"))

## Real-world complex objects (ideally taken from actual collections)

- Multiple Choice of Audio Formats in a Single View (Canvas) ([version 3](cookbook/recipe/0434-choice-av.md "Multiple Choice of Audio Formats in a Single View (Canvas)"))
- Table of Contents for Multiple A/V files on a Single Canvas ([version 3](cookbook/recipe/0064-opera-one-canvas.md "Table of Contents for Multiple A/V Files on a Single Canvas"))
- Table of Contents for Multiple A/V files on Multiple Canvases ([version 3](cookbook/recipe/0065-opera-multiple-canvases.md "Table of Contents for Multiple A/V Files on Multiple Canvases"))
- Basic Newspaper ([version 3](cookbook/recipe/0068-newspaper.md "Basic Newspaper"))
- Using Caption and Subtitle Files in Multiple Languages with Video Content ([version 3](cookbook/recipe/0074-multiple-language-captions.md "Using Caption and Subtitle Files in Multiple Languages with Video Content"))
- Locating an Item in Place and Time ([version 3](cookbook/recipe/0318-navPlace-navDate.md "Locating an Item in Place and Time"))
