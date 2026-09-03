<!-- source: https://iiif.io/api/image/1.1/compliance/ -->

[Home](https://iiif.io/)

# Image API Compliance, 1.1

## Table of Contents

1.  [Introduction](#introduction)
2.  [Compliance Level Summary](#compliance-level-summary)
3.  [Level 0 Compliance](#level0)
4.  [Level 1 Compliance](#level1)
5.  [Level 2 Compliance](#level2)

## 1. Introduction [<img src="/api/assets/images/icon-toc.png" class="to-toc" alt="To TOC" />](#toc "Back to Table of Contents")

This document is a companion to the [International Image Interoperability Framework Image API Specification](../1.1.md). It defines the set of supported parameters that correspond to different levels of compliance to the IIIF Image API.

## 2. Compliance Level Summary [<img src="/api/assets/images/icon-toc.png" class="to-toc" alt="To TOC" />](#toc "Back to Table of Contents")

Three levels of compliance are defined. Level 0 is defined as the minimum set of supported parameters and features to qualify an implementation of the service as compliant to the IIIF standard. Level 1 is defined as the RECOMMENDED set of parameters and features to be implemented.

<table class="image-api-table">
<colgroup>
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
</colgroup>
<thead>
<tr>
<th class="visibility-hidden"></th>
<th>Level 0</th>
<th>Level 1</th>
<th>Level 2</th>
<th>Optional</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="5" class="sub-rh">Region</td>
</tr>
<tr>
<td>full</td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td>x,y,w,h</td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td>pct:x,y,w,h</td>
<td></td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td colspan="5" class="sub-rh">Size</td>
</tr>
<tr>
<td>full</td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td>w,</td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td>,h</td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td>pct:x</td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td>w,h</td>
<td></td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td>!w,h</td>
<td></td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td colspan="5" class="sub-rh">Rotation</td>
</tr>
<tr>
<td>0</td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td>90,180,270</td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td>arbitary</td>
<td></td>
<td></td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
</tr>
<tr>
<td colspan="5" class="sub-rh">Quality</td>
</tr>
<tr>
<td>native</td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td>color</td>
<td></td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td>grey</td>
<td></td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td>bitonal</td>
<td></td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td colspan="5" class="sub-rh">Format</td>
</tr>
<tr>
<td>jpg</td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td>png</td>
<td></td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td>tif</td>
<td></td>
<td></td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
</tr>
<tr>
<td>gif</td>
<td></td>
<td></td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
</tr>
<tr>
<td>pdf</td>
<td></td>
<td></td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
</tr>
<tr>
<td>jp2</td>
<td></td>
<td></td>
<td></td>
<td><div class="compliance-tick">
✓
</div></td>
</tr>
<tr>
<td colspan="5" class="sub-rh">Image Information Request</td>
</tr>
<tr>
<td>JSON response</td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td><div class="compliance-tick">
✓
</div></td>
<td></td>
</tr>
<tr>
<td class="visibility-hidden"></td>
<td>Level 0</td>
<td>Level 1</td>
<td>Level 2</td>
<td>Optional</td>
</tr>
</tbody>
</table>

## 3. Level 0 Compliance [<img src="/api/assets/images/icon-toc.png" class="to-toc" alt="To TOC" />](#toc "Back to Table of Contents")

Servers indicate compliance with level 0 by including the following header in IIIF responses:

Link: \<http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level0\>;rel="profile"

A level 0 compliant image server MAY specify scaling_factors and/or tile_width and tile_height values in the Image information response. At Level 0 compliance, a server is only required to deliver images of sizes computed using the scaling factors declared in the Image Information response. If specified they should be interpreted with the following special meanings:

- <span class="monospace">scaling_factors</span> - only the specified scaling factors are supported
- <span class="monospace">tile_width, tile_height</span> - clients should request only regions that correspond to output tiles of the specified dimensions

If a client requests an scaling or region outside these parameters then the image server MAY reject the request with a 400 Bad Request error.

## 4. Level 1 Compliance [<img src="/api/assets/images/icon-toc.png" class="to-toc" alt="To TOC" />](#toc "Back to Table of Contents")

Servers indicate compliance with level 1 by including the following header in IIIF responses:

Link: \<http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level1\>;rel="profile"

## 5. Level 2 Compliance [<img src="/api/assets/images/icon-toc.png" class="to-toc" alt="To TOC" />](#toc "Back to Table of Contents")

Servers indicate compliance with level 2 by including the following header in IIIF responses:

Link: \<http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level2\>;rel="profile"

Please send feedback to <iiif-discuss@googlegroups.com>
