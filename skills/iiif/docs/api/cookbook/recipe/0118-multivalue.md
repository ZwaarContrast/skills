<!-- source: https://iiif.io/api/cookbook/recipe/0118-multivalue/ -->

## Use Case

In some cases, a work is known by more than one title (or has multiple authors, subject heading, etc.) that we would like to display to end users. In this case, our work has title variants that we will include in the `metadata` property using the required arrays. This pattern can be applied to any property values that are intended to be displayed to end users.

## Implementation Notes

Language maps are required of all strings that are intended to be displayed to the user (this includes the `label` and `summary` properties, as well as `label` and `value` properties within the `metadata` and `requiredStatement` properties). Furthermore, the language map pattern requires that all values are an array, whether a single value or multiple value strings. The client must display all of the strings in the array value. Thus, a work with multiple authors might include separate strings for each author within a single array: `["Picart, Bernard", "Bernard, Jean-Frédéric"]`. See the Presentation API section [Always require arrays if property can have multiple values](../../presentation/3.0/change-log.md#134-always-require-arrays-if-property-can-have-multiple-values).

In the case of multiple languages, each language is represented by its own language map comprising a language key and an array. For more information on language maps and multi-language values, see the recipe [Internationalization and Multi-language Values](0006-text-language.md "Internationalization and Multi-language Values"). For more information about what clients are expected to do with language map properties and values, see the Presentation API [Language of Property Values](../../presentation/3.0.md#44-language-of-property-values) section.

## Restrictions

None

## Example

In this example, the work has multiple titles in both English and French. The Manifest `label` provides a single title in French within a single-value array (lines 6–8). The alternative titles are provided in the `metadata` property in both English and French, each with variants contained within two separate arrays – one array for English (lines 18–21) and one for French (lines 22–25). In the `summary` property (lines 30–32) the value is included as a single-string array.

[JSON-LD](0118-multivalue/manifest.json)

Code samples: [Python: iiif-prezi3](https://iiif-prezi.github.io/iiif-prezi3/recipes/0118-multivalue/)

``` line-numbers
```

## Related Recipes

- [Internationalization and Multi-language Values](0006-text-language.md "Internationalization and Multi-language Values")
- [Metadata](0029-metadata-anywhere.md "Metadata on any Resource")
- [Annotating in Multiple Languages](0346-multilingual-annotation-body.md "Annotating in Multiple Languages")
