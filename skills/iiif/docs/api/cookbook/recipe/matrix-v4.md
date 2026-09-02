<!-- source: https://iiif.io/api/cookbook/recipe/matrix-v4/ -->

# IIIF 4.0 Viewer Matrix

In the 2021 Working meeting there was a presentation on viewer support for IIIF Presentation 3.0. The community asked if this presentation could be turned into a matrix so people can see which viewers support which area(s) of the IIIF specifications. This matrix, shown below, is generated automatically from the latest version of cookbook recipes approved by the IIIF TRC. If you notice an error or inaccuracy, please report it as an Issue at the [cookbook GitHub site](https://github.com/IIIF/cookbook-recipes/issues/new).

## Which viewers are included?

Currently [Mirador](https://projectmirador.org/), the [Universal Viewer](https://universalviewer.io/) (UV) V3, [Clover](https://samvera-labs.github.io/clover-iiif/), [Aviary](https://iiif.aviaryplatform.com/), [Theseus](https://theseusviewer.org/), [TIFY](https://tify.rocks/) and [Triiiceratops](https://d-flood.github.io/triiiceratops/) are listed on the cookbook. We welcome the addition of other IIIF viewers, but they must support the following features:

- Support for the [IIIF version 4.0 Presentation API](../../presentation/4.0.md)
- A public, linkable instance, ideally using the `iiif-content` parameter from the [IIIF Content State API](https://iiif.io/api/content-state/)
- Support at least 1 cookbook recipe

## Viewer Matrix

The possible values for viewer support are Yes - ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes"), No - ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") or Partial - ![Partial](https://iiif.io/api/cookbook/assets/images/icons/partial.png "Partial"). Click on the recipe name to see links to supporting viewers’ behaviour with the recipe manifest. This will allow you to see whether it achieves the required function in the way you expect.

### Basic Recipes

| Recipe | Mirador | UV | Annona | Clover | Aviary | Theseus | TIFY | Triiiceratops | Voyager | Kompakkt |
|----|----|----|----|----|----|----|----|----|----|----|
| [Simplest Manifest - Single Image File](0001-mvm-image.md#version-4) | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") |
| [Simplest Manifest - Audio](0002-mvm-audio.md#version-4) | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") |
| [Simplest Manifest - Video](0003-mvm-video.md#version-4) | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") |
| [Simplest Manifest - Single 3D Model](0608-mvm-3d.md#version-4) | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") |

### Image Recipes

| Recipe | Mirador | UV | Annona | Clover | Aviary | Theseus | TIFY | Triiiceratops | Voyager | Kompakkt |
|----|----|----|----|----|----|----|----|----|----|----|
| [Simplest Manifest - Single Image File](0001-mvm-image.md#version-4) | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") |

### Audio/Visual Recipes

Please note there are other IIIF AV viewers that are not listed like the [Europeana Player](https://github.com/europeana/media-player). These are not included in the matrix due to a lack of public linkable instance rather than them not supporting some of the recipes.

| Recipe | Mirador | UV | Annona | Clover | Aviary | Theseus | TIFY | Triiiceratops | Voyager | Kompakkt |
|----|----|----|----|----|----|----|----|----|----|----|
| [Simplest Manifest - Audio](0002-mvm-audio.md#version-4) | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") |
| [Simplest Manifest - Video](0003-mvm-video.md#version-4) | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") |

### 3D Recipes

| Recipe | Mirador | UV | Annona | Clover | Aviary | Theseus | TIFY | Triiiceratops | Voyager | Kompakkt |
|----|----|----|----|----|----|----|----|----|----|----|
| [Simplest Manifest - Single 3D Model](0608-mvm-3d.md#version-4) | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![No](https://iiif.io/api/cookbook/assets/images/icons/no.png "No") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") | ![Yes](https://iiif.io/api/cookbook/assets/images/icons/yes.png "Yes") |
