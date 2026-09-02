<!-- source: https://iiif.io/api/cookbook/recipe/code/ -->

# Code samples

In addition to the [viewer matrix](matrix.md) we now link to code samples and component libraries that supported cookbook recipes. The aim is to give readers of the cookbook code which they can use to re-create the recipe that they are reading. For components it is useful for readers to be able to see how the recipe is supported before deciding whether to integrate the component into their software.

## Which libraries are included?

Currently only [iiif-prezi](https://iiif-prezi.github.io/iiif-prezi3/) is supported but we welcome additions of both code samples and components that support at least one recipe. If you would like to add a project to the list on this page please provide a pull request to the Cookbook repository. Note submissions should meet the following requirements:

- Support for the [IIIF version 3.0 Presentation API](../../presentation/3.0.md)
- Have a public instance available that we can link to.
- Support at least 1 cookbook recipe
- Components should demonstrate how to initiate the component with the supplied Manifest in a [Code Sandbox](https://codesandbox.io) or other tool.

## Code samples matrix

The possible values for viewer support are YES, NO or Partial. Check the recipe to see the full behaviour of the viewer to check it achieves the required function in the way you expect.

### Basic Recipes

| Recipe | iiif-prezi3 |
|----|----|
| [Simplest Manifest - Single Image File](0001-mvm-image.md) | YES |
| [Simplest Manifest - Audio](0002-mvm-audio.md) | YES |
| [Simplest Manifest - Video](0003-mvm-video.md) | YES |
| [Support Deep Viewing with Basic Use of a IIIF Image Service](0005-image-service.md) | YES |
| [Internationalization and Multi-language Values (label, summary, metadata, requiredStatement)](0006-text-language.md) | YES |
| [Simple Manifest - Book](0009-book-1.md) | YES |
| [HTML in Annotations](0019-html-in-annotations.md) | YES |
| [Simple Collection](0032-collection.md) | NO |
| [CSS in an Annotation](0045-css.md) | NO |
| [Missing Images in a Sequence](0283-missing-image.md) | NO |
| [Addressing a Spatial Region](0299-region.md) | YES |
| [Grouping Annotations into Collections](0309-annotation-collection.md) | NO |
| [Image in Annotations](0377-image-in-annotation.md) | NO |
| [Multiple Choice of Audio Formats in a Single View (Canvas)](0434-choice-av.md) | NO |
| [Simplest Manifest - Single 3D Model](0608-mvm-3d.md) | NO |

### IIIF Properties

| Recipe | iiif-prezi3 |
|----|----|
| [Embedding HTML in descriptive properties (label, summary, metadata, requiredStatement)](0007-string-formats.md) | YES |
| [Rights statement (rights, requiredStatement)](0008-rights.md) | YES |
| [Viewing direction and Its Effect on Navigation (viewingDirection)](0010-book-2-viewing-direction.md) | YES |
| [Book 'behavior' Variations (continuous, individuals) (behaviorimage)](0011-book-3-behavior.md) | YES |
| [Load a Preview Image Before the Main Content (placeholderCanvas)](0013-placeholderCanvas.md) | YES |
| [Audio Presentation with Accompanying Image (accompanyingCanvas)](0014-accompanyingcanvas.md) | YES |
| [Begin playback at a specific point - Time-based media (start)](0015-start.md) | YES |
| [Metadata on any Resource (metadata)](0029-metadata-anywhere.md) | YES |
| [Providing Alternative Representations (rendering)](0046-rendering.md) | YES |
| [Linking to Web Page of an Object (homepage)](0047-homepage.md) | YES |
| [Linking to Structured Metadata (seeAlso)](0053-seeAlso.md) | YES |
| [Image Thumbnail for Manifest (thumbnail)](0117-add-image-thumbnail.md) | NO |
| [Displaying Multiple Values with Language Maps (label, summary, metadata, requiredStatement)](0118-multivalue.md) | YES |
| [Load Manifest Beginning with a Specific Canvas (start)](0202-start-canvas.md) | NO |
| [Navigation by Chronology (navDate)](0230-navdate.md) | YES |
| [Acknowledge Content Contributors (provider)](0234-provider.md) | YES |

### Structuring Resources

| Recipe | iiif-prezi3 |
|----|----|
| [Table of Contents for Book Chapters (structures)](0024-book-4-toc.md) | YES |
| [Navigation by Newspaper Article (structures)](0025-newspaper-article-index.md) | NO |
| [Table of Contents for A/V Content](0026-toc-opera.md) | YES |
| [Alternative Page Sequences](0027-alternative-page-order.md) | NO |
| [Multi-volume Work with Individually-bound Volumes](0030-multi-volume.md) | YES |
| [Multiple Volumes in a Single Bound Volume](0031-bound-multivolume.md) | NO |
| [Multiple Choice of Images in a Single View (Canvas)](0033-choice.md) | YES |
| [Foldouts, Flaps, and Maps (behavior)](0035-foldouts.md) | YES |
| [Composition from Multiple Images](0036-composition-from-multiple-images.md) | YES |
| [Adding Thumbnail Navigation and no-nav to a Video Resource](0229-behavior-ranges.md) | NO |

### Image Recipes

| Recipe | iiif-prezi3 |
|----|----|
| [Simplest Manifest - Single Image File](0001-mvm-image.md) | YES |
| [Image and Canvas with Differing Dimensions](0004-canvas-size.md) | YES |
| [Support Deep Viewing with Basic Use of a IIIF Image Service](0005-image-service.md) | YES |
| [Simple Manifest - Book](0009-book-1.md) | YES |
| [Viewing direction and Its Effect on Navigation (viewingDirection)](0010-book-2-viewing-direction.md) | YES |
| [Image Rotation Two Ways](0040-image-rotation-service.md) | NO |
| [Load Manifest Beginning with a Specific Canvas (start)](0202-start-canvas.md) | NO |
| [Missing Images in a Sequence](0283-missing-image.md) | NO |

### Audio/Visual Recipes

| Recipe | iiif-prezi3 |
|----|----|
| [Simplest Manifest - Audio](0002-mvm-audio.md) | YES |
| [Simplest Manifest - Video](0003-mvm-video.md) | YES |
| [Load a Preview Image Before the Main Content (placeholderCanvas)](0013-placeholderCanvas.md) | YES |
| [Audio Presentation with Accompanying Image (accompanyingCanvas)](0014-accompanyingcanvas.md) | YES |
| [Begin playback at a specific point - Time-based media (start)](0015-start.md) | YES |
| [Providing Access to Transcript Files of A/V Content (rendering)](0017-transcription-av.md) | YES |
| [Table of Contents for A/V Content](0026-toc-opera.md) | YES |
| [Table of Contents for Multiple A/V Files on a Single Canvas (start)](0064-opera-one-canvas.md) | YES |
| [Table of Contents for Multiple A/V Files on Multiple Canvases](0065-opera-multiple-canvases.md) | YES |
| [Using Caption and Subtitle Files in Multiple Languages with Video Content](0074-multiple-language-captions.md) | YES |
| [Scholarly Annotation of a Poetry Reading](0103-poetry-reading-annotations.md) | NO |
| [Using Caption and Subtitle Files with Video Content](0219-using-caption-file.md) | YES |
| [Multiple Choice of Audio Formats in a Single View (Canvas)](0434-choice-av.md) | NO |

### Annotation Recipes

| Recipe | iiif-prezi3 |
|----|----|
| [Annotating a specific point of an image](0135-annotating-point-in-canvas.md) | NO |
| [Simple Annotation — Tagging](0021-tagging.md) | YES |
| [Redirecting from one Canvas to another resource (Hotspot linking)](0022-linking-with-a-hotspot.md) | NO |
| [Tagging with an External Resource](0258-tagging-external-resource.md) | YES |
| [Annotation with a Non-Rectangular Polygon](0261-non-rectangular-commenting.md) | YES |
| [Simplest Annotation](0266-full-canvas-annotation.md) | NO |
| [Embedded or referenced Annotations](0269-embedded-or-referenced-annotations.md) | NO |
| [Linking external Annotations targeting a Canvas to a Manifest](0306-linking-annotations-to-manifests.md) | NO |
| [Annotate specific images or layers](0326-annotating-image-layer.md) | NO |
| [Annotating in Multiple Languages](0346-multilingual-annotation-body.md) | NO |
| [Rendering Multiple Media Types on a Time-Based Canvas](0489-multimedia-canvas.md) | NO |

### Geo Recipes

| Recipe | iiif-prezi3 |
|----|----|
| [Represent Canvas Fragment as a Geographic Area in a Web Mapping Client](0139-geolocate-canvas-fragment.md) | NO |
| [Locate a Manifest on a Web Map](0154-geo-extension.md) | NO |
| [Locate Multiple Canvases on a Web Map](0240-navPlace-on-canvases.md) | YES |
| [Locating an Item in Place and Time](0318-navPlace-navDate.md) | NO |
