<!-- source: https://iiif.io/api/cookbook/recipe/0032-collection/ -->

## Use Case

Your organization has a named collection of paintings authored by a specific person. Each of these unique items already has a digital representation and a Manifest, and you would now like to organize and present them together in a unified and coherent IIIF Presentation interface.

## Implementation notes

This recipe illustrates the mandatory structure and properties of a IIIF Collection of Manifests, with the simplest possible content. IIIF Collections have no restrictions on the organizational purpose of their referenced resources, though the resources may be related as a named digital collection, a common metadata value, or be organized as search results.

Like with a Manifest, the JSON-LD of a Collection opens with the`@context` declaration, which identifies the terms used in the document as belonging to the IIIF specification. The `id` property identifies this collection with the URL at which it is available online. The `type` property must be `Collection`.

As with a Manifest, the `label` property is mandatory, and the language of its value must be given (or the special value `none`), using a [language map](../../presentation/3.0.md#language-of-property-values). Here the language of the `label` is English and its value is “Simple Collection Example”.

The Collection `items` property is an array of referenced Manifests. In this example there are two Manifests. Each `items` entry must have an `id`, `type`, and a `label`. The `id` must be the URI where the Manifest can be available online. The `type` must be `Manifest` or a `Collection`. Each `items` entry referenced should not be fully embedded into the Collection, and should contain only necessary properties for presentation of the collection such as `thumbnail`. Various other [descriptive](../../presentation/3.0.md#31-descriptive-properties) and [linking](../../presentation/3.0.md#33-linking-properties) properties such as `summary`, minimal `metadata`, and `homepage` may be useful as well for presentation. See the [Summary of property requirements](../../presentation/3.0.md#a-summary-of-property-requirements) for a complete list.

Collections may also reference other Collections.

Collections may have `behavior` defined in order to influence user experience when viewing the resource. Manifests within a Collection DO NOT inherit [behaviors](../../presentation/3.0.md#behavior) from their referencing Collections; however referenced Collections will.

Defining a IIIF Collection is to not be conflated with creating a table of contents within an individual Manifest. To define a table of contents, see [Multiple Volumes in a Single Bound Volume](0031-bound-multivolume.md "Multiple Volumes in a Single Bound Volume").

## Restrictions

None known.

## Example

This example IIIF Collection represents an organization’s collection of paintings by the American painter Winslow Homer, which includes two distinct artworks: *The Gulf Stream* and *Northeaster*. Each painting is represented within the Collection as a IIIF Manifest, identified by a URI as its `id`, a `type` property, and the corresponding title as the `label`.

Note: Each supporting viewer has a distinct method for toggling between Collection items:

- Universal Viewer presents items in an *Index* tab;
- Mirador presents items in a dialog component;
- Annona and TIFY present items in a toggleable information panel;
- Clover presents items as options in a dropdown element.

**Example Collection**

[JSON-LD](0032-collection/collection.json)

``` line-numbers
```

**Example Manifest for *The Gulf Stream***

[JSON-LD](0032-collection/manifest-01.json)

``` line-numbers
```

**Example Manifest for *Northeaster***

[JSON-LD](0032-collection/manifest-02.json)

``` line-numbers
```

# Related recipes

- [Multi Volume](0030-multi-volume.md "Multi-volume Work with Individually-bound Volumes")
- [Multiple Volumes in a Single Bound Volume](0031-bound-multivolume.md "Multiple Volumes in a Single Bound Volume")
- [Basic Newspaper](0068-newspaper.md "Basic Newspaper")
