<!-- source: https://iiif.io/api/cookbook/recipe/0010-book-2-viewing-direction/ -->

## Use Case

You have a Japanese-language text that in-person would be typically read from right to left (with the binding on the reader’s right), or you have a diary notebook written across the long dimension of the paper and therefore read top to bottom (with the binding away from the reader). By using `viewingDirection` you can communicate the reading direction to a conforming client, allowing it to present the content to the reader from right to left and from top to bottom, respectively.

The `viewingDirection` property tells a presentation client one part of how to display a sequence of resources to a viewer. It is permissible for IIIF `Collection`, `Manifest`, and `Range` resources, but is an invalid property on other types of resources. Clients should process the property when it is part of a `Collection` or `Manifest`, may process it when part of a `Range`, and should ignore it if used other resource types.

Possible values for `viewingDirection` are `left-to-right` (the default if the property is not specified), `right-to-left`, `top-to-bottom`, and `bottom-to-top`. Note particularly that this is the visual layout of the views, not the orientation of the views or the layout or orientation of any visual material of the represented objects’ views.

The `viewingDirection` property can inform a client of the appropriate presentation order and navigational cues for a variety of resource arrangements. Some examples include a sequence of pages within a manuscript, all views of a scroll, or a set of multiple books.

Though the example Manifests below use the `items` property to contain Canvases representing the reading sequence of views that make up an object, the `viewingDirection` property should be given greater weight than the Manifest order of views.

## Implementation notes

In addition to `viewingDirection`, you may want to use the `behavior` property (see also the [Book (paging variations)](0011-book-3-behavior.md "Book behavior (paging) variations") recipe) depending on the expected user experience for viewing your resource(s) or the specificities of the physical object and its digital surrogate. The most common `behavior` value for a book is `paged`. Interactions between `viewingDirection` and `behavior`, especially when they are set on multiple and/or hierarchically ordered resources, need special attention. You are recommended to read [the Presentation 3.0 spec on `behavior`](../../presentation/3.0.md#behavior) carefully and to keep current with future releases.

## Restrictions

None known

## Example 1: `viewingDirection` `right-to-left`

This Manifest shows the playbill for “Akiba gongen kaisen-banashi,” “Futatsu chōchō kuruwa nikki”, and “Godairiki koi no fūjime”, kabuki performances at the Chikugo Theater in Osaka, from the fifth month of Kaei 2 (May, 1849).

[JSON-LD](0010-book-2-viewing-direction/manifest-rtl.json)

Code samples: [Python: iiif-prezi3](https://iiif-prezi.github.io/iiif-prezi3/recipes/0010-book-2-viewing-direction/)

## Example 2: `viewingDirection` `top-to-bottom`

This Manifest represents a portion of the diary of William Lewis Sachtleben, an American long-distance cyclist who rode across Asia from Istanbul to Peking in 1891 to 1892 with Thomas Gaskell Allen Jr., his classmate from Washington University.

[JSON-LD](0010-book-2-viewing-direction/manifest-ttb.json)

Code samples: [Python: iiif-prezi3](https://iiif-prezi.github.io/iiif-prezi3/recipes/0010-book-2-viewing-direction/)

# Related recipes

- [Book (simplest)](0009-book-1.md "Simple Manifest - Book")
- [Book (paging variations)](0011-book-3-behavior.md "Book behavior (paging) variations") — The objects shown here are `paged`, but other viewing compositions are possible, including `continuous` for scrolls and rolls.
