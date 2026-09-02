<!-- source: https://iiif.io/api/image/validator/ -->

The IIIF Image API validator runs a set of tests against your implementation.

You must first download a [test image](https://iiif.io/api/image/validator/download.html) then save and import the test image into your repository, to be served through your IIIF Image service. Once the image is accessible through your IIIF service, you may then run the tests below. Fill out `server` with the hostname of your server, `prefix` with everything in the URI path up to the identifier, and your `identifier` for the test image.

\

### Technical Note

If you would like to use the validator programmatically, there are two options:

- [Download](http://github.com/IIIF/image-api/) the code from github and run it locally.
- Use it online with JSON based output, by an HTTP GET endpoints following this pattern:\
  \
  `https://image-validator.iiif.io/`*`test-name`*`?server=`*`server-here`*`&prefix=`*`prefix-here`*`&identifier=`*`identifier-here`*`&version=2.0`\
  \
  The list of tests is available at: <https://image-validator.iiif.io/list_tests>

### Image Validator

## IIIF Server to Validate

Server:

Prefix:

Image ID:

Version: Version 3.0 Version 2.0 Version 1.1 Version 1.0

Level: Level 0 - Minimum Level 1 - Recommended Level 2 - Desirable Complete Custom

\

## Tests
