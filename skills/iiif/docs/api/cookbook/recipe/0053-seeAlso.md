<!-- source: https://iiif.io/api/cookbook/recipe/0053-seeAlso/ -->

## Use Case

You have a IIIF manifest resource along with additional machine-readable metadata usable by aggregators and others that can process or index it via the [`seeAlso`](../../presentation/3.0.md#seealso) property. You know from previous experience that aggregators crawling your collection harvest best when handed structured metadata and are also then able to offer their readers faceting capabilities, making your resources amenable to focused discovery. Through use of the `seeAlso` property, you are able to alert an aggregator to the presence of a dataset so the aggregator can provide appropriate and sophisticated information about your resource to the aggregator’s users.

## Implementation Notes

This property is used for pointing a viewer to the URI of a non-IIIF resource with information about the IIIF resource to which it is attached. Most frequently, the non-IIIF resource will be structured metadata, and to be most effective, the target resource should be a machine-readable format such as XML, JSON, or RDF. The `type` value for `seeAlso` is usually `dataset`. Manifest creators or editors should look in [the IIIF Registry of Profiles](../../registry/profiles.md#3-registry) to see if a consistent URI exists for use as the `seeAlso` property’s `profile` value.

Three other properties may seem similar, so it’s worth highlighting the differences.

- `homepage` [(IIIF Presentation API reference)](../../presentation/3.0.md#homepage) Where `rendering` presents an additional representation of the same resource, `homepage` points to a webpage *about* the object represented by the resource.

- `accompanyingCanvas` [(IIIF Presentation API reference)](../../presentation/3.0.md#accompanyingcanvas) An `accompanyingCanvas` resource is a IIIF resource presented simultaneously with the main resource, where a target of `rendering` is not IIIF-compatible and must be viewed outside the main resource’s viewer. In addition, `accompanyingCanvas` is used for content complementary to the main resource while `rendering` points to additional representations of the same resource.

- `rendering` [(IIIF Presentation API reference)](../../presentation/3.0.md#rendering) Unlike `seeAlso`, the `rendering` property provides the URI of an alternate representation of the current resource, such as a PDF or ePub version. The `type` values for `rendering` vary more widely than do those for `seeAlso`, in keeping with the variety of target formats possible.

Any resource may have the `seeAlso` property. Each instance of it may have multiple items contained inside it, provided each has the `id` and `type` properties; `label`, `format`, and `profile` are strongly recommended properties. Conforming clients may process this property in some way, but the outcomes of a client’s processing has no defined form.

## Restrictions

None

## Example

In this example, a MODS XML file is provided for the program as a whole, and as such the `seeAlso` property attaches to the Manifest. If such data files were available for each view or page separately, each Canvas would be a logical place for the corresponding `seeAlso` instance.

A consistent URI to use for the `profile` value for MODS can be found in [the IIIF Registry of Profiles](../../registry/profiles.md#3-registry).

To see the property in action in Mirador, toggle the sidebar by activating the three-line (“hamburger”) menu in the upper left-hand corner of the content window. You should then, in the “Related” area, see the link in the “Related” section under the “See also” subheading.

[JSON-LD](0053-seeAlso/manifest.json)

Code samples: [Python: iiif-prezi3](https://iiif-prezi.github.io/iiif-prezi3/recipes/0053-seeAlso/)

The direct link to the fixture is a useful convenience.

## Related Recipes

- [homepage](0047-homepage.md "Linking to Web Page of an Object") for pointing to a web page about the object represented by the current resource
- [Providing Alternative Representations](0046-rendering.md "Providing Alternative Representations") for alternate representations of the same object
