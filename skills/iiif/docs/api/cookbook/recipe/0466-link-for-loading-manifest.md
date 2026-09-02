<!-- source: https://iiif.io/api/cookbook/recipe/0466-link-for-loading-manifest/ -->

# Use case

You would like to provide the user a link to click that will open a specific Manifest directly in a preselected viewer application. For example, on your web page or in an email to a user or colleague, you share a link to a IIIF Manifest for a book that will automatically open in a Mirador instance.

# Implementation notes

This type of request can be implemented using the [IIIF Content State API](https://iiif.io/api/content-state) following the [HTTP GET (Query String) Parameter](../../content-state/1.0.md#initialization-mechanisms-link) section.

The Manifest URL is provided as the value of the `iiif-content` parameter following the viewer instance URL. Assuming the viewer can be accessed at `https://example.org/viewer` we can pass the `iiif-content` parameter as follows:

    https://example.org/viewer?iiif-content=manifest-url

Note when the content state is a plain URI, rather than a JSON object, it must not be [content-state-encoded](https://iiif.io/api/content-state/0.9/#62-content-state-encoding-and-uri-requirements).

**However, the current specs do not provide a standardized approach to interpret URIs containing special characters, please see the issue https://github.com/IIIF/api/issues/2292 for a detailed explanation and updates regarding this issue.**

## Example

To open the IIIF Manifest <https://iiif.io/api/cookbook/recipe/0001-mvm-image/manifest.json> in the Mirador viewer hosted at <https://projectmirador.org/embed/>, we construct the link as follows:

<https://projectmirador.org/embed/?iiif-content=https://iiif.io/api/cookbook/recipe/0001-mvm-image/manifest.json>

Similarly with Clover we append the `iiif-content` parameter to the viewer location as so:

<https://samvera-labs.github.io/clover-iiif/docs/viewer/demo?iiif-content=https://iiif.io/api/cookbook/recipe/0001-mvm-image/manifest.json>

## Related Recipes

- [Simplest Manifest - Image](0001-mvm-image.md "Simplest Manifest - Image") shows the basic structure of a IIIF Manifest using presentation API 3.0.
