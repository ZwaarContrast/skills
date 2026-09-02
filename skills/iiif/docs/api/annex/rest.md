<!-- source: https://iiif.io/api/annex/rest/ -->

## Status of this Document

This document is a DRAFT. The contents should only be used for experimental purposes and not considered final.

This document is not subject to semantic versioning. Changes will be tracked within the document.

**Editors**

- **[Robert Sanderson](https://orcid.org/0000-0003-4441-6852)** [![ORCID iD](https://iiif.io/assets/uploads/orcid_16x16.png)](https://orcid.org/0000-0003-4441-6852), [*J. Paul Getty Trust*](http://www.getty.edu/)
- **[Jon Stroop](https://orcid.org/0000-0002-0367-1243)** [![ORCID iD](https://iiif.io/assets/uploads/orcid_16x16.png)](https://orcid.org/0000-0002-0367-1243), [*Princeton University Library*](https://library.princeton.edu/)
- **[Simeon Warner](https://orcid.org/0000-0002-7970-7855)** [![ORCID iD](https://iiif.io/assets/uploads/orcid_16x16.png)](https://orcid.org/0000-0002-7970-7855), [*Cornell University*](https://www.cornell.edu/)

*Copyright © 2012-2026 Editors and contributors. Published by the IIIF Consortium under the [CC-BY](http://creativecommons.org/licenses/by/4.0/ "Creative Commons — Attribution 4.0 International") license, see [disclaimer](https://iiif.io/api/annex/notes/disclaimer/).*

## Abstract

This document describes an extension to the [IIIF Image API](../image/3.0.md) which compliant servers may implement to faciliate the management of images on a server using the HTTP protocol.

Please send feedback to <iiif-discuss@googlegroups.com>.

## 1. Overview

There are cases where it is useful for a client to store, update or delete images on a IIIF compliant image server without having access to that server’s file system. For example:

1.  A scholar who wants to drag and drop one of their own images into a web application for analysis along side other images already in that environment.

2.  A digital repository that ingests images into its storage environment, but creates an access copy or derivative on a IIIF server as part of an automated workflow to support IIIF client access.

3.  The IIIF Image API does not define a mechanism for getting the source image that the API calls are using to derive images according to the request. In some cases this may be available as:

``` plaintext
{scheme}://{server}{/prefix}/{identifier}/full/full/0/native
```

but the format can not be known, and furthermore the source image may not be in a format that the server can derive through regular requests.

## 2. Requests

This document aims to follow the [REST style of architecture](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm), as commonly implemented in HTTP. There is one deviation from this approach, which is that rather than using the [OPTIONS](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.2) method or the [Access-Control-Allow-Methods](http://www.w3.org/TR/cors/#access-control-allow-methods-response-header) header to describe which methods the server supports, the a client should request the server’s capabilities document, as described in the [Image API](../image/3.0.md).

The predicates that should be used to indicate which methods are supported are defined in [Section 4](#extension-context).

The headers required by each request and response should follow [Section 14 of the HTTP Specification](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html). Additional requirements and options are described below.

### 2.1 GET

The server should return the image that it uses make derivative images in response to regular API calls. Note that there is no guarantee that this is identical to the image that was originally PUT or POSTed to the server. The server MAY return 304 (Not Modified) if the server supports caching and the appropriate request headers were supplied.

URI Pattern:

``` plaintext
{scheme}://{server}{/prefix}/{identifier}
```

Relevant Headers:

| Header | Request/Response | Required | Description |
|----|----|----|----|
| [Content-Type](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17) | Request | yes | The Media Type for the image. |

The server MUST return the image in a single format from this URI. It MAY either ignore any Accept header included in request, or return a 406 (Not Acceptable) status in response to an attempt to content-negotiate.

### 2.2 HEAD

The request should behave exactly the same as GET, except that only the appropriate response code and headers should be returned. There MUST NOT be a response body. This is useful to a client that needs to know, for example, whether an image with the supplied URI exists on the server, the format of that image, or when it was last modified.

URI Pattern:

``` plaintext
{scheme}://{server}{/prefix}/{identifier}
```

### 2.3 PUT

> TODO: what happens if the identifier uses chars the API doesn’t allow? This is why we return a Location header, but is it OK to change it? Functionally, it should be OK as long as the resolver implementation changes the identifier in the exact same way.

Update an existing image or create a new image with {identifier}.

URI Pattern:

``` plaintext
{scheme}://{server}{/prefix}/{identifier}
```

Relevant Headers:

| Header | Request/Response | Required | Description |
|----|----|----|----|
| [Location](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30) | Response | yes | The new Base URI for the image. |
| [Content-MD5](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.15) | Response | yes | As a verification that the image was received intact. |
| [Content-Type](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17) | Request | yes | The Media Type for the image. |
| [If-None-Match](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.26) | Request | no | Makes the PUT conditional. |

The response body MAY contain the info.json that was extracted from the image, but it MUST NOT redirect to the info URI as the Location header the MUST contain the Base URI of the of the newly stored image.

### 2.4 POST

Similar to PUT, except that the server will supply the identifier, and return it as part of the Location header.

URI Pattern:

``` plaintext
{scheme}://{server}{/prefix}
```

Relevant Headers:

| Header | Request/Response | Required | Description |
|----|----|----|----|
| [Location](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30) | Response | yes | The new Base URI for the image. |
| [Content-MD5](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.15) | Response | yes | As a verification that the image was received intact. |
| [Content-Type](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17) | Request | yes | The Media Type for the image. |

### 2.5 DELETE

Delete the image specified by {identifier} on the server.

URI Pattern:

``` plaintext
{scheme}://{server}{/prefix}/{identifier}
```

There are no special requirements for the HTTP headers associated with a DELETE request.

## 3. Response Codes

In addition to the error conditions discussed in the API documents, the following codes are likely to be relevant. Implementations may find additional codes useful to their applications.

### 3.1 Successful Requests

| Response Code | Description |
|----|----|
| 200 OK | For GET, HEAD requests when the resource exists. |
| 201 Created | For PUT or POST requests, when the image was successfully stored on the server. |
| 204 No Content | For DELETE requests. 204 MUST be used. Do NOT use 200. |

### 3.2 Error Conditions

| Error Code | Description |
|----|----|
| 401 Unauthorized | See [Section 5](#authorization-authentication-and-security). |
| 403 Forbidden | See [Section 5](#authorization-authentication-and-security). |
| 404 Not Found | For GETs and DELETES when the URI does not resolve to an image. |
| 405 Method Not Allowed | See [Section 5](#authorization-authentication-and-security). |
| 413 Request Entity Too Large | Use for instances when the size of the image in a POST or PUT request is larger than the server will accept, if such a limit exists. |
| 415 Unsupported Media Type | The declared Content-Type is not one that the server supports, or the server can not extract technical metadata from the entity of the request based on the declared Content-Type |
| 501 Not Implemented | The server does not support the request method |
| 503 Service Unavailable | The server can not handle the request for some other reason. For example, it may be out of storge space |

## 4. Extension Context

This extension defines five predicates in a separate context, one for each of the HTTP methods described in [Section 2](#requests). A server that supports any of the HTTP methods as described by this document should modify its capabilities document to include this context, e.g., as follows:

``` json
{
  "@context" : [
    "http://iiif.io/api/image-api/context.json",
    "http://iiif.io/api/image/ext/rest.json"
  ],
  "@id" : "http://iiif.example.com/server",

  ...

  "http_delete" : "true",
  "http_get" : "false",
  "http_head" : "true",
  "http_post" : "false",
  "http_put" : "true"
}
```

If one or more of the predicates is missing, a client MUST assume the method is not supported.

## 5. Authorization, Authentication and Security

As of this writing authorization and authentication are topics of heavy dicussion within the IIIF community. This document will be revised as necessary, as the Image API specification evolves in this area.
