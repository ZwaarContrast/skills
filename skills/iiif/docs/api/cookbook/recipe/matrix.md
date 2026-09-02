<!-- source: https://iiif.io/api/cookbook/recipe/matrix/ -->

# IIIF 3.0 Viewer Matrix

In the 2021 Working meeting there was a presentation on viewer support for IIIF Presentation 3.0. The community asked if this presentation could be turned into a matrix so people can see which viewers support which area(s) of the IIIF specifications. This matrix, shown below, is generated automatically from the latest version of cookbook recipes approved by the IIIF TRC. If you notice an error or inaccuracy, please report it as an Issue at the [cookbook GitHub site](https://github.com/IIIF/cookbook-recipes/issues/new).

## Which viewers are included?

Currently [Mirador](https://projectmirador.org/), the [Universal Viewer](https://universalviewer.io/) (UV) V3, [Annona](https://ncsu-libraries.github.io/annona/multistoryboard/), [Clover](https://samvera-labs.github.io/clover-iiif/), [Navplace Viewer](https://map.rerum.io/), [Ramp](https://iiif-react-media-player.netlify.app/), [Aviary](https://iiif.aviaryplatform.com/), [Glycerine](https://demo.viewer.glycerine.io/), [Theseus](https://theseusviewer.org/), [Curation Viewer](https://codh.rois.ac.jp/software/iiif-curation-viewer/), [liiive](https://liiive.now/), [TIFY](https://tify.rocks/) and [Triiiceratops](https://d-flood.github.io/triiiceratops/) are listed on the cookbook. We welcome the addition of other IIIF viewers, but they must support the following features:

- Support for the [IIIF version 3.0 Presentation API](../../presentation/3.0.md)
- A public, linkable instance, ideally using the `iiif-content` parameter from the [IIIF Content State API](https://iiif.io/api/content-state/)
- Support at least 1 cookbook recipe

## Viewer Matrix

The possible values for viewer support are Yes - ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes"), No - ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") or Partial - ![Partial](https://iiif.io/api/cookbook/assets/images/icons/partial.png "Partial"). Click on the recipe name to see links to supporting viewers’ behaviour with the recipe manifest. This will allow you to see whether it achieves the required function in the way you expect.

### Basic Recipes

| Recipe | Mirador | UV | Annona | Clover | Navplace Viewer | Ramp | Aviary | Glycerine Viewer | Theseus | Curation | liiive | TIFY | Triiiceratops |
|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| [Simplest Manifest - Single Image File](0001-mvm-image.md) | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] |
| [Simplest Manifest - Audio](0002-mvm-audio.md) | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] |
| [Simplest Manifest - Video](0003-mvm-video.md) | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] |
| [Support Deep Viewing with Basic Use of a IIIF Image Service](0005-image-service.md) | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] |
| [Internationalization and Multi-language Values (label, summary, metadata, requiredStatement)](0006-text-language.md) | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] |
| [Simple Manifest - Book](0009-book-1.md) | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] |
| [HTML in Annotations](0019-html-in-annotations.md) | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] |
| [Simple Collection](0032-collection.md) | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] |
| [CSS in an Annotation](0045-css.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Missing Images in a Sequence](0283-missing-image.md) | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] |
| [Addressing a Spatial Region](0299-region.md) | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] |
| [Grouping Annotations into Collections](0309-annotation-collection.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Image in Annotations](0377-image-in-annotation.md) | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] |
| [Multiple Choice of Audio Formats in a Single View (Canvas)](0434-choice-av.md) | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Simplest Manifest - Single 3D Model](0608-mvm-3d.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] |

### IIIF Properties

| Recipe | Mirador | UV | Annona | Clover | Navplace Viewer | Ramp | Aviary | Glycerine Viewer | Theseus | Curation | liiive | TIFY | Triiiceratops |
|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| [Embedding HTML in descriptive properties (label, summary, metadata, requiredStatement)](0007-string-formats.md) | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] |
| [Rights statement (rights, requiredStatement)](0008-rights.md) | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] |
| [Viewing direction and Its Effect on Navigation (viewingDirection)](0010-book-2-viewing-direction.md) | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Partial\] | \[No\] | \[Partial\] | \[Yes\] |
| [Book 'behavior' Variations (continuous, individuals) (behaviorimage)](0011-book-3-behavior.md) | \[Yes\] | \[Partial\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Partial\] | \[Yes\] |
| [Load a Preview Image Before the Main Content (placeholderCanvas)](0013-placeholderCanvas.md) | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] |
| [Audio Presentation with Accompanying Image (accompanyingCanvas)](0014-accompanyingcanvas.md) | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Begin playback at a specific point - Time-based media (start)](0015-start.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Metadata on any Resource (metadata)](0029-metadata-anywhere.md) | \[Yes\] | \[Yes\] | \[Yes\] | \[Partial\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] |
| [Providing Alternative Representations (rendering)](0046-rendering.md) | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] |
| [Linking to Web Page of an Object (homepage)](0047-homepage.md) | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] |
| [Linking to Structured Metadata (seeAlso)](0053-seeAlso.md) | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] |
| [Image Thumbnail for Manifest (thumbnail)](0117-add-image-thumbnail.md) | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] |
| [Displaying Multiple Values with Language Maps (label, summary, metadata, requiredStatement)](0118-multivalue.md) | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] |
| [Load Manifest Beginning with a Specific Canvas (start)](0202-start-canvas.md) | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] |
| [Navigation by Chronology (navDate)](0230-navdate.md) | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] |
| [Acknowledge Content Contributors (provider)](0234-provider.md) | \[Partial\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Partial\] | \[Yes\] |

### Structuring Resources

| Recipe | Mirador | UV | Annona | Clover | Navplace Viewer | Ramp | Aviary | Glycerine Viewer | Theseus | Curation | liiive | TIFY | Triiiceratops |
|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| [Table of Contents for Book Chapters (structures)](0024-book-4-toc.md) | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] |
| [Navigation by Newspaper Article (structures)](0025-newspaper-article-index.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Table of Contents for A/V Content](0026-toc-opera.md) | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Alternative Page Sequences](0027-alternative-page-order.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] |
| [Multi-volume Work with Individually-bound Volumes](0030-multi-volume.md) | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] |
| [Multiple Volumes in a Single Bound Volume](0031-bound-multivolume.md) | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] |
| [Multiple Choice of Images in a Single View (Canvas)](0033-choice.md) | \[Partial\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] |
| [Foldouts, Flaps, and Maps (behavior)](0035-foldouts.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] |
| [Composition from Multiple Images](0036-composition-from-multiple-images.md) | \[Partial\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] |
| [Adding Thumbnail Navigation and no-nav to a Video Resource](0229-behavior-ranges.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |

### Image Recipes

| Recipe | Mirador | UV | Annona | Clover | Navplace Viewer | Ramp | Aviary | Glycerine Viewer | Theseus | Curation | liiive | TIFY | Triiiceratops |
|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| [Simplest Manifest - Single Image File](0001-mvm-image.md) | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] |
| [Image and Canvas with Differing Dimensions](0004-canvas-size.md) | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] |
| [Support Deep Viewing with Basic Use of a IIIF Image Service](0005-image-service.md) | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] |
| [Simple Manifest - Book](0009-book-1.md) | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] |
| [Viewing direction and Its Effect on Navigation (viewingDirection)](0010-book-2-viewing-direction.md) | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Partial\] | \[No\] | \[Partial\] | \[Yes\] |
| [Image Rotation Two Ways](0040-image-rotation-service.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Load Manifest Beginning with a Specific Canvas (start)](0202-start-canvas.md) | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] |
| [Missing Images in a Sequence](0283-missing-image.md) | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] |

### Audio/Visual Recipes

Please note there are other IIIF AV viewers that are not listed like the [Europeana Player](https://github.com/europeana/media-player). These are not included in the matrix due to a lack of public linkable instance rather than them not supporting some of the recipes.

| Recipe | Mirador | UV | Annona | Clover | Navplace Viewer | Ramp | Aviary | Glycerine Viewer | Theseus | Curation | liiive | TIFY | Triiiceratops |
|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| [Simplest Manifest - Audio](0002-mvm-audio.md) | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] |
| [Simplest Manifest - Video](0003-mvm-video.md) | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] |
| [Load a Preview Image Before the Main Content (placeholderCanvas)](0013-placeholderCanvas.md) | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] |
| [Audio Presentation with Accompanying Image (accompanyingCanvas)](0014-accompanyingcanvas.md) | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Begin playback at a specific point - Time-based media (start)](0015-start.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Providing Access to Transcript Files of A/V Content (rendering)](0017-transcription-av.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Table of Contents for A/V Content](0026-toc-opera.md) | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Table of Contents for Multiple A/V Files on a Single Canvas (start)](0064-opera-one-canvas.md) | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Table of Contents for Multiple A/V Files on Multiple Canvases](0065-opera-multiple-canvases.md) | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Using Caption and Subtitle Files in Multiple Languages with Video Content](0074-multiple-language-captions.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] |
| [Scholarly Annotation of a Poetry Reading](0103-poetry-reading-annotations.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Using Caption and Subtitle Files with Video Content](0219-using-caption-file.md) | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] |
| [Multiple Choice of Audio Formats in a Single View (Canvas)](0434-choice-av.md) | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |

### Annotation Recipes

| Recipe | Mirador | UV | Annona | Clover | Navplace Viewer | Ramp | Aviary | Glycerine Viewer | Theseus | Curation | liiive | TIFY | Triiiceratops |
|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| [Annotating a specific point of an image](0135-annotating-point-in-canvas.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] |
| [Simple Annotation — Tagging](0021-tagging.md) | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[Yes\] | \[Yes\] |
| [Redirecting from one Canvas to another resource (Hotspot linking)](0022-linking-with-a-hotspot.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Tagging with an External Resource](0258-tagging-external-resource.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Annotation with a Non-Rectangular Polygon](0261-non-rectangular-commenting.md) | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[Yes\] |
| [Simplest Annotation](0266-full-canvas-annotation.md) | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] |
| [Embedded or referenced Annotations](0269-embedded-or-referenced-annotations.md) | \[Yes\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] |
| [Linking external Annotations targeting a Canvas to a Manifest](0306-linking-annotations-to-manifests.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Annotate specific images or layers](0326-annotating-image-layer.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Annotating in Multiple Languages](0346-multilingual-annotation-body.md) | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Rendering Multiple Media Types on a Time-Based Canvas](0489-multimedia-canvas.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |

### Recipes involving Content State

These recipes demonstrate use cases for the [content-state](https://iiif.io/api/content-state/) API.

| Recipe | Mirador | UV | Annona | Clover | Navplace Viewer | Ramp | Aviary | Glycerine Viewer | Theseus | Curation | liiive | TIFY | Triiiceratops |
|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| [Sharing a link to open a Manifest in a specific viewer](0466-link-for-loading-manifest.md) | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[Yes\] | \[No\] |
| [Open a specific region of a Canvas in a viewer](0485-contentstate-canvas-region.md) | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Sharing a link for opening two or more Canvases](0540-link-for-opening-multiple-canvases.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Drag and Drop](0599-drag-and-drop.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] |

### Geo Recipes

Please note there are many viewers built to view GeoJSON like [Leaflet](https://leafletjs.com/) and [geojson.io](https://geojson.io/), but they are not able to parse objects for a `navPlace` property or look into the `body` property of Annotations for GeoJSON. However, they are easily customizable and can be made to find GeoJSON in these properties. The Navplace Viewer is an [Open Source customization](https://github.com/CenterForDigitalHumanities/navplace-viewer) of Leaflet that intelligently gathers and formats GeoJSON from provided IIIF resources and hands that GeoJSON to a Leaflet viewer for rendering.

| Recipe | Mirador | UV | Annona | Clover | Navplace Viewer | Ramp | Aviary | Glycerine Viewer | Theseus | Curation | liiive | TIFY | Triiiceratops |
|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| [Represent Canvas Fragment as a Geographic Area in a Web Mapping Client](0139-geolocate-canvas-fragment.md) | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Locate a Manifest on a Web Map](0154-geo-extension.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[Yes\] | \[No\] | \[No\] | \[No\] |
| [Locate Multiple Canvases on a Web Map](0240-navPlace-on-canvases.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] |
| [Locating an Item in Place and Time](0318-navPlace-navDate.md) | \[No\] | \[No\] | \[No\] | \[No\] | \[Yes\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] | \[No\] |
