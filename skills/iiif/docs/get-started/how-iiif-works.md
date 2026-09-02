<!-- source: https://iiif.io/get-started/how-iiif-works/ -->

## Introduction

Learning about IIIF (generally pronounced “triple-eye-eff”) can be overwhelming at first, especially if you’re not a programmer, so we’ve created a plain-language guide for newcomers. We’ve also created a glossary of [“Key concepts you’ll encounter when working with IIIF”](how-iiif-works.md#key-concepts-youll-encounter-when-working-with-iiif) which you’ll find at the end of this page.

As you are learning, please know that the community is here to help. Feel free to reach out on [Slack](http://bit.ly/iiif-slack) or our email discussion list ([iiif-discuss](https://groups.google.com/forum/#!forum/iiif-discuss)) with any questions. There’s also a [self-paced online tutorial](https://training.iiif.io/iiif-online-workshop/) that may be a useful next step for newcomers, or check out our general set of resources for [getting started with IIIF](../get-started.md).

[![delivery diagram](https://iiif.io/assets/images/zeplin/delivery@3x.png)](https://iiif.io/assets/images/zeplin/delivery@3x.png) <span class="caption">A diagram of how the core IIIF APIs work together.</span>

## The basics

IIIF is a way to standardize the delivery of images and audio/visual files from servers to different environments on the Web where they can then be viewed and interacted with in many ways.

Modern Web browsers understand how to display formats like .jpg and .mp4 at defined sizes, but cannot do much else. The IIIF specifications align with general Web standards that define how all browsers work to enable richer functionality beyond viewing an image or audio/visual files. For images, that means enabling deep zoom, comparison, structure (i.e., for an object such as a book, structure = page order) and annotation. For audio/visual materials, that means being able to deliver complex structures (such as several reels of film that make up a single movie) along with things like captions, transcriptions/translations, annotations, and more.

IIIF makes these objects work in a consistent way. That enables portability across viewers, the ability to connect and unite materials across institutional boundaries, and more.

## The Image and Presentation APIs

There are two main components to IIIF: delivering digital objects to sites and viewing them.

### Delivering objects

The Image API defines how image servers deliver image pixels to a viewer. It allows the image to be sent as a full-sized image or as a smaller size, a zoomed portion, a rotated view, or as a black and white version. All of these settings are designated by changing portions of the URL for an Image API resource. To try it out for yourself, head over to this [Image API Playrground](https://www.learniiif.org/image-api/playground) and adjust some of the Image API parameters to see how they work with real images.

The Image API can be implemented on its own (most commonly to enable fast, deep zoom of very high resolution files like TIF and JP2000), or alongside the Presentation API for additional viewing capabilities.

[![Image API filler](https://iiif.io/api/image/1.0/images/iiif-order.png)](https://iiif.io/api/image/1.0/images/iiif-order.png) <span class="caption">The image API controls the form in which an image is delivered to a location on the Web.</span>

### Viewing objects

The Presentation API attaches basic metadata and structure to digital objects, defining how they appear in viewers. It does this via the Manifest, a JSON file which bundles up all the different elements of an IIIF object (such as a single image, or a series of images) with basic metadata (like title, description, and rights information) and structural information (such as page order). ([See the glossary below](how-iiif-works.md#key-concepts-youll-encounter-when-working-with-iiif) for more definitions of common IIIF terms.)

<figure class="image inline-image float-right">
<img src="/assets/uploads/presentation-api-filler.png" alt="API filler image" />
<figcaption>The presentation API delivers data and structure about an image to a viewer.</figcaption>
</figure>

There are many [IIIF viewers](iiif-viewers.md). Some are general purpose tools while others specialize in particular kinds of content or functionality. IIIF-compatible viewers generally allow users to pan, zoom, rotate, and resize image objects, and play audio/visual files. Some allow annotation with text, audio, location, and more. Others allow comparison of objects from a single collection side-by-side (or even objects from multiple collections if the object’s Manifest is made available to users).

## Advanced use cases

IIIF also enables you to use the same standardized principles to manage other needs related to your IIIF objects.

- **Authentication**: The Authentication API defines where or by who your objects can be viewed.
- **Search**: The Search API allows users to search within any text associated with an object (such as OCR, transcriptions, etc.)
- **Content state**: The Content State API provides a way of linking directly to a particular region and zoom level of a IIIF resource.
- **Change discovery**: The Change Discovery API is a tool to describe the new publication of and updates to digital objects, to help aid cross-institutional discovery.

## Putting it all together

If you have your own images you want to put online using IIIF you’ll need high-quality assets (most people use JPEG2000 or TIF files), and metadata about structure as well as the information people will read about the image.

From there:

- Make images and audio/video materials available using the Image API and an [IIIF image server](image-servers.md), or a [IIIF-compatible image server from a vendor or other web host](vendors.md).
- Combine your images and structural data (like pagination or ordering) from your metadata source into a IIIF Manifest using the Presentation API (there are many [open source or vendor products that help handle this](https://github.com/IIIF/awesome-iiif#presentation-api-libraries)).
- Choose a [viewer](iiif-viewers.md) to show your images
- Consider making your image **manifests** (definition below) available publicly on your collection site so users can work with your images across collections.
