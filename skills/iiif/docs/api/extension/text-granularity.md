<!-- source: https://iiif.io/api/extension/text-granularity/ -->

## Status of this Document

This document is not subject to [semantic versioning](../annex/notes/semver.md "Versioning of APIs"). Changes will be tracked within the document.

*Copyright © 2012-2026 Editors and contributors. Published by the IIIF Consortium under the [CC-BY](http://creativecommons.org/licenses/by/4.0/ "Creative Commons — Attribution 4.0 International") license, see [disclaimer](https://iiif.io/api/annex/notes/disclaimer/).*

## 1. Introduction

### 1.1 Objectives and Scope

One use of annotations in IIIF is to associate text with IIIF resources, with the text originating from many potential sources, including optical character recognition (OCR) software, manual transcription, and existing digitized text. Furthermore, it is a common practice to produce sets of annotations at a particular level of ‘text granularity’, where each annotation in the set references the same unit of text, such as a character, line, or page. This extension recommends a pattern for indicating the level of text granularity for an annotation.

### 1.2 Motivating Use Cases

A number of common workflows can result in annotation sets with discrete levels of text granularity:

- OCR text is frequently available at a range of granularities, from page to character.
- Manual transcription user interfaces may constrain user input to the level of the line, block, or page.
- Transcriptions may be produced without coordinate data and thus have a very coarse level of granularity, such as page- or block-level.

Identification of the level of text granularity in published annotations can facilitate the use of their textual content and target regions in other applications. A primary use case is search: clients can use word-level transcription annotations to provide a search function capable of accurate hit highlighting. Other common use cases derive from crowdsourced text input, such as the correction of OCR transcription, which may require the user to work with a text at a specific level of granularity.

## 2. Text Granularity Levels and the `textGranularity` Property

The `textGranularity` property identifies the Text Granularity Level of a resource. The value *must* be a single string. This extension defines the Text Granularity Levels found in the table below. The string *should* be one of those defined in the table below or in the [Registry of Extensions](../extension.md).

| Text Granularity Level | Description                    |
|------------------------|--------------------------------|
| `page`                 | A page in a paginated document |
| `block`                | An arbitrary region of text    |
| `paragraph`            | A paragraph                    |
| `line`                 | A topographic line             |
| `word`                 | A single word                  |
| `glyph`                | A single glyph or symbol       |

``` json
{ "textGranularity": "line" }
```

## 3. Use of the `textGranularity` Property with Annotations

An Annotation *may* have the `textGranularity` property. An Annotation that has the property *should* reference a IIIF Presentation API Canvas or segment in the `target` property and the identified Text Granularity Level *should* describe that of the textual content represented by the content resources painted on the Target.

The Annotation Body’s textual content *should* be equivalent to the textual content represented by the content resources painted on the Target. For example, the Body of the Annotation might be a [TextualBody](https://www.w3.org/TR/annotation-model/#embedded-textual-body) that contains the transcription of the Target, which is painted with the image of a page of a medieval manuscript.

``` json
{
  "id": "https://example.org/iiif/aeneid/book1/transcription-line1",
  "type": "Annotation",
  "textGranularity": "line",
  "motivation": ["supplementing"],
  "body": {
    "type": "TextualBody",
    "language": "la",
    "value": "arma virumque cano, Troiae qui primus ab oris"
   },
   "target": {
     "type": "SpecificResource",
     "source": "https://example.org/aeneid/canvas/1r",
     "selector": {
        "type": "FragmentSelector",
        "value": "xywh=500,1100,3500,100"
     }
   }
}
```

Alternatively, the body might be an [external web resource](https://www.w3.org/TR/annotation-model/#external-web-resources). For example, the Body could use an XPath selector to identify the transcription of a paragraph of text within an XML document.

``` json
{
  "id": "https://example.org/iiif/aeneid/book1/transcription-line2",
  "type": "Annotation",
  "textGranularity": "line",
  "motivation": ["supplementing"],
  "body": {
    "type": "SpecificResource",
    "source": "http://example.org/aeneid-tei.xml",
    "selector": {
      "type": "XPathSelector",
      "value": "/TEI.2/text/body/div1/l[2]"
    }
   },
   "target": {
     "type": "SpecificResource",
     "source": "https://example.org/aeneid/canvas/1r",
     "selector": {
        "type": "FragmentSelector",
        "value": "xywh=500,1100,3500,100"
     }
   }
}
```

An exact alignment in the level of granularity between the Body and Target may be impractical. For example, a single manuscript paragraph in the targeted Canvas may be divided across multiple paragraphs in a transcription derived from a printed version of the work, or a single character may be transcribed by multiple characters in an alternative script.

The `motivation` value of the associated Annotation *must* have the value `supplementing` when the content of the annotation is derived from the Canvas. This is a requirement of the [Presentation API](../presentation/3.0.md#53-canvas).

## 4. Linked Data Context

The URI of the JSON-LD context for this extension is `http://iiif.io/api/extension/text-granularity/context.json`. Consult the [Linked Data Context and Extensions](../presentation/3.0.md#46-linked-data-context-and-extensions "Linked Data Context and Extensions") section of the Presentation API for further guidance on its use within the `@context` property.

``` json
{
  "@context": [
     "http://iiif.io/api/extension/text-granularity/context.json",
     "http://iiif.io/api/presentation/3/context.json"
  ]
}
```

## 5. Implementation Note

The Text Granularity Levels defined above were derived from a survey of commonly used formats for OCR output such as hOCR, ALTO, and ABBYY, as well the output produced by the Google Cloud Vision API. The following table maps Text Granularity Levels to structures found in these output formats and is intended as an aid to implementers.

| Level | hOCR | ALTO | ABBYY | Google |
|----|----|----|----|----|
| `page` | `ocr_page` | `Page` | `page` | `Page` |
| `block` | `ocrx_block` / `div[@class=”ocr_carea”]` | `TextBlock` / `ComposedBlock` | `block[@blockType="Text"]` | `Block` |
| `paragraph` | `p[@class=”ocr_carea”]` | `TextBlock` | `par` | `Paragraph` |
| `line` | `ocr_line` / `ocrx_line` | `TextLine` | `line` | \- |
| `word` | `ocrx_word` | `String` | `charParams[@wordStart=”1”]` | `Word` |
| `glyph` | `ocrx_word[@cuts]` | `Glyph` | `charParams` | `Symbol` |

## Appendices

### A. Acknowledgements

Many thanks to the members of the [IIIF community](https://iiif.io/community/ "IIIF Community") for their continuous engagement, innovative ideas, and feedback. The initial version of this document was the work of the [IIIF Text Granularity Technical Specification Group](https://iiif.io/community/groups/text-granularity/).

### B. Change Log

| Date       | Description                     |
|------------|---------------------------------|
| 2018-09-20 | Initial commit                  |
| 2019-11-03 | Minor pre-publication revisions |
