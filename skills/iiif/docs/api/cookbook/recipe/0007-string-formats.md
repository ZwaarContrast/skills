<!-- source: https://iiif.io/api/cookbook/recipe/0007-string-formats/ -->

## Use Case

You want to have more control on how your metadata is displayed by adding links or simple formatting instructions to selected text blocks. For example, scientific names might need special formatting and links out to other sites benefit from being activatable. Legacy systems may also include rudimentary formatting in their output.

## Implementation notes

You may include minimal HTML markup only in the `summary` property and the `value` property in the `metadata` and `requiredStatement` objects. HTML is not permitted in `label` or other properties. Your HTML must be [well-formed XML](https://validator.w3.org/) and therefore must be wrapped in an element such as `p` or `span`.

To alert a consuming application that your content is HTML, the first character in your string must be ‘\<’ and the last character must be ‘\>’. If your content is plain text but happens to start and end with angle brackets as described above, add an additional whitespace character to the end of the value.

## Restrictions

For security reasons, clients are expected to allow only `a`, `b`, `br`, `i`, `img`, `p`, `small`, `span`, `sub`, and `sup` tags, and may remove any or all of those. For more details of permitted and prohibited markup, see [the specification](../../presentation/3.0.md#45-html-markup-in-property-values).

## Example

[JSON-LD](0007-string-formats/manifest.json)

Code samples: [Python: iiif-prezi3](https://iiif-prezi.github.io/iiif-prezi3/recipes/0007-string-formats/)

``` line-numbers
```

# Related recipes

- [Simplest Manifest - Single Image File](0001-mvm-image.md "Simplest Manifest - Image")
