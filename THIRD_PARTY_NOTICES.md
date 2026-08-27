# Third-party notices

The MIT license in [LICENSE](LICENSE) covers this project's own code. The files listed
here are third-party works redistributed with it, under their own terms.

## Weather Icons

Fifteen SVG glyphs under `public/images/plugins/` come from Weather Icons, which ships
under the SIL Open Font License 1.1. The example fixtures render them, so they are
distributed and displayed, not dormant.

- `public/images/plugins/weather/`: `wi-day-cloudy.svg`, `wi-day-showers.svg`,
  `wi-day-sunny.svg`, `wi-hot.svg`, `wi-rain.svg`, `wi-raindrops.svg`,
  `wi-strong-wind.svg`, `wi-thermometer.svg`
- `public/images/plugins/lunar_calendar/`: `wi-moon-alt-first-quarter.svg`,
  `wi-moon-alt-full.svg`, `wi-moon-alt-third-quarter.svg`,
  `wi-moon-alt-waning-crescent-3.svg`, `wi-moon-alt-waning-gibbous-3.svg`,
  `wi-moon-alt-waxing-crescent-3.svg`, `wi-moon-alt-waxing-gibbous-3.svg`

Weather Icons by Erik Flowers, <https://erikflowers.github.io/weather-icons/>. The icon
designs are originally by Lukas Bischoff. Licensed under the SIL Open Font License,
Version 1.1, reproduced in full at the end of this file.

The copies here are Illustrator exports that carry no license header of their own. Each
one keeps the file name it has in the upstream `svg/` directory.

## MapLibre GL JS

`vendor/javascript/maplibre-gl-5.24.0.js` and `vendor/javascript/maplibre-gl-5.24.0.css`
are the unmodified `dist/maplibre-gl.js` and `dist/maplibre-gl.css` of MapLibre GL JS
5.24.0, <https://maplibre.org/>, redistributed under the 3-Clause BSD License. The
JavaScript file carries the license notice and the notices of the libraries it bundles in
its header; the full text is at <https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt>.
The engine serves both at `/framework-docs/` for the map docs and for `TRMNLMaps`.

Copyright (c) 2023, MapLibre contributors. Copyright (c) 2020, Mapbox. All rights reserved.

## Brand marks

These files reproduce the logo of the service each example plugin renders. They identify
the service and nothing else (nominative use). Every mark stays the property of its
owner, none of them is covered by the MIT license, and shipping one is not a claim of
endorsement or affiliation. Any other use is governed by the owner's own trademark and
brand guidelines.

All paths are under `public/images/plugins/`.

- GitHub, Inc.: `github.svg`, `github--dark.svg`, `github--render.svg`
- Reddit, Inc.: `reddit.svg`, `reddit--render.svg`
- Shopify Inc.: `shopify.svg`, `shopify--render.svg`
- Wikimedia Foundation, Inc.: `wikipedia.svg`, `wikipedia--render.svg`
- Simple Analytics: `simple-analytics--render.svg`

## Vendored JavaScript

Each file carries its upstream notice on line 1.

- `vendor/javascript/prism-1.29.0.min.js`: Prism, copyright Lea Verou and contributors,
  MIT. `app/assets/static/prism_trmnl.css` derives from its theme and repeats the notice.
- `vendor/javascript/jquery-3.6.0.min.js`: jQuery, copyright OpenJS Foundation and other
  contributors, MIT.

## Fonts

Font files under `public/fonts/` are licensed by their own copyright holders. [LICENSE](LICENSE)
names each family and its terms, and every bundle under
[public/fonts/bundles/](public/fonts/bundles/) carries the full texts in `README.md`,
`OFL.txt`, and `CC-BY-3.0.txt`.

## SIL Open Font License, Version 1.1

Applies to the Weather Icons glyphs above. The fonts under `public/fonts/` ship this same
text with their own bundles.

```
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```
