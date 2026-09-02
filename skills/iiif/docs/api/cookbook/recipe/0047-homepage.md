<!-- source: https://iiif.io/api/cookbook/recipe/0047-homepage/ -->

## Use Case

You have a IIIF Manifest representing an object that is also represented by one or more home pages by an organization. These web pages may be published by the organization responsible for the object as well as its Manifest resource. For each homepage entry, an actionable route would be provided to a web page able to be displayed to the user.

## Implementation Notes

Conforming clients may render the `homepage` property in various ways, yet most likely as an HTML anchor element for each entry. An alternative consideration could be as a button.

If an anchor is utilized for the instance, the `id` represents the destination of the link and would serve as the value for its `href` attribute.

The `label` is rendered as the content within the link according to the [Language of Property Values](../../presentation/3.0.md#language-of-property-values). A client may also choose to provide a `lang` attribute on the anchor element with a value of the determined BCP 47 language code of the `label`.

Entries of a `homepage` property may also have a `language` property. These values represent the language(s) of the destination web page. A client may also render a *single* language entry as the value for `hreflang` attribute on the anchor element. Entries should have a `format` property, most likely with a value being `text/html`.

## Restrictions

Web pages related to the object described by the Manifest that are not its home should utilize the `metadata` property as a `label` and `value` pair.

## Example

In this example we have a Manifest representing an object housed at the Getty Museum Collection. A `homepage` property is at the Manifest level with one entry. The single instance references the URL at which a user could be displayed a web page of the object’s catalog entry.

*Laocöon*. Credit: Getty.

[JSON-LD](0047-homepage/manifest.json)

Code samples: [Python: iiif-prezi3](https://iiif-prezi.github.io/iiif-prezi3/recipes/0047-homepage/)

## Related Recipes

- [Acknowledge Content Contributors](0234-provider.md "Acknowledge Content Contributors") for demonstrating the use of `homepage` for a `provider`
- [Linking to Structured Metadata](0053-seeAlso.md "Linking to Structured Metadata") for demonstrating the use of `seeAlso`
- [Metadata on any Resource](0029-metadata-anywhere.md "Metadata on any Resource")
