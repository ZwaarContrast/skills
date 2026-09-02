<!-- source: https://iiif.io/api/cookbook/recipe/0234-provider/ -->

## Use Case

You have a IIIF resource for which you would like to include information about one or more organizations or people that contributed to providing the content of the resource. You want to include a rich set of information for each contributor so clients can make visible this information in a similarly robust way. The [`provider`](../../presentation/3.0.md#provider) property allows you an extensible way to acknowledge contributions with as little as a `label` and as much as a `label`, `homepage`, a `logo`, and a `seeAlso` machine-readable description for the contributor.

## Implementation Notes

So that a client can display one or more content contributors for a resource, the `provider` property conveys information in the form of an [Agent](http://purl.org/dc/terms/Agent) resource. This resource must contain, at a minimum:

- `id`, an authoritative and unique URI for the contributor,
- `type`, always the string “Agent”, and
- `label`, a human-readable name for the contributor.

In addition, `provider` is structured data, can contain multiple Agents, and can contain information about assets other than plain text, distinguishing it from [`requiredStatement`](../../presentation/3.0.md#requiredstatement).

To make the information more usable and interconnected for a reader, `provider` as an Agent is strongly recommended to have both [`homepage`](../../presentation/3.0.md#homepage) and [`logo`](../../presentation/3.0.md#logo) properties. These will allow a reader to go to the contributor’s website and find more. Note that the `id` for the Agent may, but does not have to be, the same as the `id` for the `homepage`.

## Restrictions

None known.

## Example

In this example, we reuse the front page of a kabuki playbill that was contributed to the IIIF Cookbook by UCLA Library Digital Collections. The `id` for them as an Agent is the US Library of Congress authority ID for the UCLA Library, the `homepage` is their actual homepage, the `logo` is also for the library as a whole, and the `seeAlso` is the US Library of Congress MADS/XML. In your use of this property, you might want to and be able to unify the information in the property differently.

Note: Mirador only partially implements `provider`. The property must be on the Manifest level, Mirador will only display the text from a `label` and the image from a `logo` under `provider`, and the information will only be found in the list of manifests.

[JSON-LD](0234-provider/manifest.json)

Code samples: [Python: iiif-prezi3](https://iiif-prezi.github.io/iiif-prezi3/recipes/0234-provider/)

## Related Recipes

- [Linking to Web Page of an Object](0047-homepage.md "Linking to Web Page of an Object") for demonstrating the use of `homepage` at the Manifest level
- \[Add Identifying Graphic\]\[0217\] for demonstrating the use of `logo`
- [Linking to Structured Metadata](0053-seeAlso.md "Linking to Structured Metadata") for demonstrating the use of `seeAlso`
- [Rights](0008-rights.md "Rights") for demonstrating use of `requiredStatement`
