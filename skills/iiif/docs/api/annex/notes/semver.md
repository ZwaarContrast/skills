<!-- source: https://iiif.io/api/annex/notes/semver/ -->

Starting with the 2.0.0 releases of the IIIF [Image API](../../image/3.0.md "Image API") and [Presentation API](../../presentation/3.0.md "Presentation API"), all future specifications will follow [Semantic Versioning](http://semver.org/spec/v2.0.0.html "Semantic Versioning 2.0.0") with version numbers of the form “MAJOR.MINOR.PATCH” where:

- MAJOR version increment indicates incompatible API changes.
- MINOR version increment indicates addition of functionality in a backwards-compatible manner.
- PATCH version increment indicates backwards-compatible bug fixes.

This versioning system will be implemented in the following ways:

- URIs for the specifications will be updated with major and minor versions, with patch versions edited in place.
- URIs for compliance and context documents will be updated with major versions only, and otherwise edited in place.
- URIs identifying a protocol (e.g. `http://iiif.io/api/image` for the IIIF [Image API](../../image/3.0.md "Image API")) will not change with versioning.

In the case of the APIs with external compliance documents, changes to either the API itself or the corresponding compliance document (e.g. [Image API compliance document](../../image/3.0/compliance.md "Image API Compliance")) will increment the version number as appropriate. In all cases, major and minor releases will be accompanied by a change log, while changes in patch releases will be appended to the change log for the latest major or minor release.

As compliance documents specify required functionality and only have major versions, no new mandatory functionality will be introduced between major versions. New features will be either recommended or optional. If a feature is intended to become mandatory in a future major version, this will be recorded when the decision is made in the [proposed changes](https://iiif.io/api/annex/notes/proposed-changes/ "Proposed Changes") document.

While the APIs should always be consistent and compatible, it is not intended that version numbers will necessarily remain synchronized across the IIIF suite of APIs. A change in one API will not advance the version number of another.
