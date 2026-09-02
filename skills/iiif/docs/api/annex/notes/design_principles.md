<!-- source: https://iiif.io/api/annex/notes/design_principles/ -->

## Status of this Document

This document is not subject to [IIIF’s versioning semantics](semver.md "Versioning of APIs"). Changes will be tracked within the document and its [internal change log](#change-log "Change Log")

**Authors:**

- **[Michael Appleby](https://orcid.org/0000-0002-1266-298X)**, Yale University

- **[Tom Crane](https://orcid.org/0000-0003-1881-243X)**, Digirati

- **[Robert Sanderson](https://orcid.org/0000-0003-4441-6852)**, J. Paul Getty Trust

- **[Jon Stroop](https://orcid.org/0000-0002-0367-1243)**, Princeton University Library

- **[Simeon Warner](https://orcid.org/0000-0002-7970-7855)**, Cornell University

*Copyright © 2017-2026 Editors and contributors. Published by the IIIF Consortium under the [CC-BY](http://creativecommons.org/licenses/by/4.0/ "Creative Commons — Attribution 4.0 International") license, see [disclaimer](https://iiif.io/api/annex/notes/disclaimer/).*

------------------------------------------------------------------------

## Contents

## 1. Overview

This document aims to describe, rationalize, and document the design principles that have evolved around the creation of the IIIF specifications to date. These principles should be used as a guide for ongoing and future work in order to promote consistency across the growing number of IIIF specifications.

The principles do not speak to the process by which the specifications are written and managed over time. For notes on the adopted approaches for these, please see:

- [Editorial Process](https://iiif.io/community/policy/editorial/#community-process): The community process of discussion, and the editorial process of writing, the specifications.
- [Semantic Versioning](semver.md "Versioning of APIs"): The interpretation of the semantic versioning pattern for managing change of APIs in a responsible and responsive manner.

## 2. Design Principles

### 2.1. Scope Design Through Shared Use Cases

IIIF specifications are shaped by shared, documented, and well-understood use cases. Shared understanding promotes interoperability, and the specifications are more likely to be implemented if the results solve real, not speculative, problems. Assessment of use cases is a key factor in the process of determining which features should be included or prioritized.

The intent of adopting this principle is to keep the resulting specifications practical and to solve real problems. Implementers will invest time in solutions that solve their problems, and not speculative or abstract ones. If the use case is shared by multiple organizations, then there is a need for interoperability.

### 2.2. Select Solutions That Are as Simple as Possible and No Simpler

IIIF specifications should be designed to reduce the complexity to the lowest possible point at which the use cases that feed them can be met. They should make simple things easy and complex things possible. They should allow implementers to build up from a minimum viable product in stages and incrementally enable more complex use cases.

The intent of adopting this principle is to ensure the adoption of the specifications is as high as possible. Simplicity is often a trade-off between parties, and must take into account the generation and publishing of the data on the server side, and the consumption and processing of the data on the client side.

### 2.3. Intelligently Manage Ramping Up

IIIF specifications should allow basic implementation with static on-disk files, often called “level 0”, when possible. They should not require costly or complicated libraries or tooling to get started, nor computationally expensive runtime processing. A useful implementation should require only a way of hosting files that are accessible via a web server.

The intent of adopting this principle is to support simple and quick implementations as a way to encourage adoption.

### 2.4. Avoid Dependency on Specific Technologies

IIIF specifications should avoid placing undue value on one technology or format over another, unless there is a clear benefit and the choice does not pose a significant barrier to entry. While the APIs must make choices for the sake of interoperability, these choices must be weighed as to how closely tied they are to specific products or formats. For example, the JPEG format has extremely widespread adoption across multiple programming languages and environments. The JPEG2000 format, although technically superior, is not able to be rendered by most web browsers natively. The first is an acceptable dependency, the second is not.

The intent of adopting this principle is to ensure that the specifications can be implemented in a variety of languages and styles. It results from the combination of the previous two principles.

### 2.5. Use Resource Oriented Design

IIIF specifications follow resource-centric design principles, for example by using [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) interfaces rather than service or operation-centric design principles. This carries on from the previous design principles, and serves to provide a consistent and coherent principle across many different functional areas.

The intent of adopting this principle is to ensure that the specifications are cacheable and performant, at the same time as being easy to understand and implement.

### 2.6. Don’t Break Web Caches

IIIF specifications are designed to work seamlessly with modern web caching infrastructure. The specifications will ensure that representations can be trivially cached by intermediate systems without loss of fidelity or function.

The intent of adopting this principle is ensure performance and simplicity of implementation, and results from the previous principles.

### 2.7. Follow Linked Data Principles

IIIF specifications conform to [Linked Data](https://en.wikipedia.org/wiki/Linked_data), and relevant [web architecture](https://www.w3.org/TR/webarch/) standards as defined by the W3C and IETF. They should not require an RDF based development stack to implement, but it must be possible to implement using one. It should be possible to transform the data present in a single document back and forth between triples and the [JSON-LD](https://www.w3.org/TR/json-ld/) serialization without loss, but not necessarily without the use of custom code.

The intent of adopting this principle is to ensure that the data published via IIIF specifications can be part of the Web, not just on the Web. The semantics of the properties and classes used in the APIs are therefore self-documenting and able to be shared.

### 2.8. Design for JSON-LD First

IIIF specifications that involve the description of resources, rather than the transfer of bitstreams, are designed for [JSON-LD](https://www.w3.org/TR/json-ld/) as the primary serialization. This is comprised of publishing and maintaining a JSON-LD context document, and providing JSON-LD Frames.

The intent of adopting this principle is to ensure that the representation of the Linked Data is as easy to use as possible without the need for a full RDF development suite. Developers must be able to treat the representation as plain JSON, with a predictable structure. This ease of understanding increases the likelihood of wide spread adoption.

The design principles for this JSON representation are detailed in the next section.

### 2.9. Use Existing Standards Where Possible

IIIF specifications should be consistent with and use existing open standards when possible. This is tempered by the need for ease of understanding, implementation and the timing of standards evolution and updates.

The intent of adopting this principle is to ensure the continued integration of IIIF specifications with the wider web environment, and existing implementations.

### 2.10. Follow Existing Best Practices

IIIF specifications follow existing best practices for the standards that it adopts, including [JSON-LD best practices](http://json-ld.org/spec/latest/json-ld-api-best-practices/), [Linked Open Data best practices](https://www.w3.org/TR/ld-bp/), and [Data on the Web best practices](https://www.w3.org/TR/dwbp/), where possible and appropriate. Exceptions are made when the cost of following the best practice would prove to be a significant barrier to understanding or implementation, and hence adoption.

The intent of adopting this principle is to ensure the continued integration of IIIF specifications with the wider web environment. The design of IIIF specifications should be informed by existing and ongoing work, but evaluated as to the appropriateness of the application to the IIIF context.

### 2.11. Separate Concerns, Loosely Couple APIs

In the well established principle of doing one thing well, IIIF specifications should address their own area of concern and be loosely coupled rather than tightly bound together. This allows for independent implementation and tooling, and simplifies the process for deployment by adopters and API updates by the community. For example, it is possible to implement the [Image API](https://iiif.io/api/image/) without the [Presentation API](https://iiif.io/api/presentation/) and vice versa. A counter example is that the [Search API](https://iiif.io/api/search/) is necessarily more tightly linked to the Presentation API.

The intent of adopting this principle is to ensure that the on-ramp for adopters was as easy and multi-entrant as possible. The Presentation API can be a starting point for any of the other APIs, the Image API can be a starting point for the Presentation or [Authentication API](https://iiif.io/api/auth/)s. It also ensures the simplicity and scope of the APIs individually, as the complexity must be managed entirely within the API’s specification.

### 2.12. Define Success, Not Failure

IIIF specifications define the functionality that can be expected to work and how to request it, and do not limit the interpretation of requests that are beyond the scope or current definition of the specification. Any principle outside of those defined by the APIs is able to be used by implementers, keeping in mind that future official API extensions might make it inconsistent. For example, an implementation of the [Image API](https://iiif.io/api/image/) can legitimately recognize its own specific parameter values for `quality` or `size`, but it should not change the interpretation of parameter values that are specified.

The intent of adopting this principle is to enable experimentation by implementers, thereby encouraging the early adoption and validation of new (minor) versions.

### 2.13. Design for Worldwide Use

IIIF specifications encourage internationalization efforts by requiring that text values of properties indicate their language, to support and encourage use around the world. IIIF assumes that text values of properties may have multiple values in multiple languages, rather than this being a special case.

## 3. JSON-LD Design Principles

The representation of the information in JSON must be:

- Valid JSON and JSON-LD, following the restrictions of both specifications ;
- Understandable by developers without special training or documentation ;
- Usable in a variety of application environments to ensure the widest adoption.

These design principles have been selected in order to maximize these features in the resulting APIs. Note that these principles are not enforced for externally defined JSON-LD based systems which are then imported for use within the IIIF context. For example, the use of `motivation` for Annotations exactly follows the requirements of the Web Annotation Data Model which allows for both a JSON array or a single string, and does not follow the principle recommended by [3.4.1](#json-ld-design-patterns) below.

### 3.1. Use Native Data Types

Native data types in JSON are used to ensure that applications do not have to do type coercion. If the value should be an integer in the model, then the JSON representation is as a JSON number. Similarly, if the value is an ordered list of resources, then a JSON array is used, mapping to an `rdf:List`. Thus we use `"height": 1400` and not `"height": "1400"`.

### 3.2. Avoid Special Characters

Special characters are avoided in the names of classes and properties. Any character other than those in the range 0-9, a-z, A-Z and the underscore character are removed in the mapping to JSON-LD, if present in the name of a class or property. This is to ensure that applications developed in object oriented programming languages can treat these values as class and property names internally.

JSON-LD defines two special keys in the data: `@id` (the URI of the resource) and `@type` (the class of the resource). These are aliased to `id` and `type` respectively to avoid the use of the `@` symbol.

### 3.3. Use Consistent Naming Conventions

Additional design principles beyond the restricted range of characters are used to make the names of terms easier to remember and use.

#### 3.3.1. Use CamelCase

All terms defined by IIIF specifications use camelCase (concatenated words with uppercase letters at word boundaries). Thus we use `seeAlso` and not `see_also`.

#### 3.3.2. Distinguish Classes and Properties

All properties start with a lowercase letter, and all classes start with an uppercase letter. Thus we use `Manifest` and `items`, and not `manifest` or `Items`.

#### 3.3.3. Avoid Explicit Namespaces

While JSON-LD allows for namespaced terms (`oa:Annotation`), this would require the use of a `:` character in the class or property name, which is ruled out by the special characters design principle. Thus use `Manifest` and not `sc:Manifest`.

### 3.4. Use Consistent Structural Conventions

Consistent data structures make code that consumes those structures easier to write. The code does not need to check for different variants, it’s either present in a single form, not present at all, or an error condition.

#### 3.4.1. Always Use Arrays for Multiple Value Properties

If a property can ever have multiple values, it will always be an array even if it has only one value. This means that code can always iterate over the values without checking first to see if it’s an array. Thus we use `"language": [ "en" ]` and not `"language": "en"`.

#### 3.4.2. Use JSON Objects for Referenced Resources

If the set of referenced resources is not unbounded or otherwise impossible to enumerate, then the resource will be described with a JSON object that has at least the `id` and `type` properties. This ensures ease of processing as the resources will always be of the same type, rather than some being just the URI from `id` as a string and others being a JSON object. The inclusion of `type` makes it easier to build object models in code, as the class to instantiate is given by the description rather than needing to be inferred from the property. Thus we use `"thumbnail": {"id": "https://example.org/images/logo.jpg", "type": "Image"}` and not `"thumbnail": "https://example.org/images/logo.jpg"`.

#### 3.4.3. Use Strings for Enumerated Flags

Flags in the IIIF specifications, such as `timeMode` or `behavior` are actually resources with URIs. If a URI could be treated as a value in an enumerated list such as these flags, then the URI is given as a string. All enumerations defined by IIIF specifications will be encoded in the respective JSON-LD context as easy-to-remember-and-use strings. Thus we use `"timeMode": "trim"` and not `"timeMode": "http://iiif.io/api/presentation/3#trim"`, nor `"timeMode": {"id": "http://iiif.io/api/presentation/3#trim"}`.

## 4. Change Log

| Date | Description |
|----|----|
| 2018-03-22 | Added JSON-LD Design Patterns |
| 2017-03-15 | First published version after community review |
| 2017-02-06 | Initial draft version |
