<!-- source: https://iiif.io/api/cookbook/recipe/0318-navPlace-navDate/ -->

### Use Case

You have one or more IIIF resources that have a date and a location associated with each, and you would like to provide these to a client for use in the user interface. For instance, you may wish the client to provide a visualization in a timeline with an associated map, or to provide the capability to filter the set based on a date range or a bounding box on a map. The data required to meet this use case can be provided by the use of both the `navDate` and `navPlace` properties on the IIIF resources.

### Implementation Notes

The `navDate` property, as implied by its name, allows a Manifest to identify a pertinent date associated with an IIIF resource in order to help viewers provide users with date-aware navigation. Clients are not required to make use of `navDate`, and clients that do have date-aware navigation available may not default to that navigation interface. This property is described in [Navigation by Chronology](0230-navdate.md "Navigation by Chronology")

The `navPlace` property is analogous to `navDate`, but provides geographic information. The value for `navPlace` is a single [GeoJSON Feature Collection](../../extension/navplace.md#222-feature-collection). A Feature Collection represents an aggregation of spatially bounded areas. This property is described in [Locate a Manifest on a Web Map](0154-geo-extension.md "Locate a Manifest on a Web Map").

The `navPlace` property is not processed by the Universal Viewer or Mirador viewer at this time.

### Example

The example consists of a [Collection](0318-navPlace-navDate/collection.json) that references five Manifests. All five Manifests contain the `navDate` and `navPlace` properties, as shown below.

The example can be displayed in a [custom viewer](https://mikeapp.github.io/maptime-demo/?iiif-content=https://preview.iiif.io/cookbook/0318/recipe/0318-navPlace-navDate/collection.json). In the viewer, click on the “Limit by Date Range” button to sort the objects by date. Adjust the ends of the timeline slider to filter the objects based on a date range.

In a more limited way, the Collection can be displayed in the Navplace viewer used elsewhere in this cookbook. This viewer will show all examples places appropriately on a map, but ignores the `navDate` data.

[NavPlace and NavDate Collection](0318-navPlace-navDate/collection.json)

- [Castel Sant’Angelo, Rome](0318-navPlace-navDate/manifest-1.json)
- [The Colosseum](0318-navPlace-navDate/manifest-2.json)
- [The Arch of Titus from the Forum, Rome, ca. 1725](0318-navPlace-navDate/manifest-3.json)
- [The Temple of Vesta, Rome, 1849](0318-navPlace-navDate/manifest-4.json)
- [A View of Trajan’s Forum, Rome, 1821](0318-navPlace-navDate/manifest-5.json)

[JSON-LD](0318-navPlace-navDate/collection.json)

## Related Recipes

- [Locate a Manifest on a Web Map](0154-geo-extension.md "Locate a Manifest on a Web Map")
- [Navigation by Chronology](0230-navdate.md "Navigation by Chronology")
