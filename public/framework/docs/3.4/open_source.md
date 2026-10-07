# Open Source

The TRMNL Framework is open source as of version 3.2. It is the design system TRMNL plugin screens are built with, tuned for 1-bit, 2-bit, 4-bit, and limited-color ePaper displays. This repository holds the CSS, the JavaScript runtime, the design tokens, and the documentation site you are reading.

### What This Repository Is

The source lives at [github.com/usetrmnl/trmnl-framework](https://github.com/usetrmnl/trmnl-framework). Star it, fork it, or clone it from there.

The framework and the site that documents it live together in one Rails app. It has no database. It compiles the CSS, then renders these pages against it and the JavaScript runtime.

Framework development happens against the docs: edit the Sass or JS, watch it rebuild, and check the result on the page it documents.

TRMNL FrameworkThe ePaper design system is now open source.

3.3Version

MITCode license

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Open Source

The fixed hierarchy of Screen, View, Layout, and Title Bar is documented in [Structure](/framework/docs/3.4/structure) .

### The Design System

The CSS is a Sass design system under `app/assets/stylesheets/framework/`. It renders one layout correctly across very different screens. The SCSS source and what a custom stack can build from it are documented in [Sass API](/framework/docs/3.4/sass_api) .

- **Bit-depth-aware tokens:** a color dithers down to the panel's inks where needed and paints exactly on full color. See [Colors](/framework/docs/3.4/colors) and [Tokens](/framework/docs/3.4/tokens) .
- **Dither and tile backgrounds:** grayscale and limited-palette fills are generated tiles, applied with `bg--{shade}`. See [Background](/framework/docs/3.4/background) .
- **Device screen classes:** `.screen--<device>` bakes each device's dimensions and palette into the build. See [Screen](/framework/docs/3.4/screen) .
- **Themes:** opt-in stylesheets recolor a whole screen; the device still decides how colors print. See [Themes](/framework/docs/3.4/themes) .

### The Runtime

The JavaScript runtime lives in `app/javascript/` and ships as two files: the readable `plugins.js` and the minified `plugins.min.js` production serves, both stamped with the version they were released from. It does the render-time work a static stylesheet cannot.

- **terminalize:** the layout engine that fills each device's fixed space, handling overflow columns, text clamping, value fitting, and more. See [Framework Runtime](/framework/docs/3.4/framework_runtime) .
- **TRMNLPaint:** returns what CSS would paint right now as Fill, BorderFill, and TypeSpec objects, so any plugin can read framework colors from JavaScript. See [Paint API](/framework/docs/3.4/paint_api) .
- **TRMNLCharts:** a Highcharts adapter built on TRMNLPaint, so charts adapt to bit depth and themes with the rest of the screen. See [Chart](/framework/docs/3.4/chart) .
- **TRMNLMaps:** a MapLibre GL JS adapter built on TRMNLPaint, so a plotted map over OpenStreetMap vector tiles adapts the same way. See [Map](/framework/docs/3.4/map) .

### CSS Is the Single Source of Truth for Paint

One rule shapes the whole project. Every rendering rule exists in CSS first, then `TRMNLPaint` mirrors it.

`TRMNLPaint` reads what CSS computed and converts it. It never re-implements color rules, adds contrast tweaks, or invents fallback values in JavaScript.

The same instinct applies to new features. Before adding a pattern, tile, gradient, or one-off variable, check whether the dither and tile system, the border pipeline, or the theme slots already express it. A new bespoke mechanism for one call site is almost always wrong.

The full mandate is in `AGENTS.md`. See [Paint API](/framework/docs/3.4/paint_api) for how the API does its reading.

### The Release Pipeline

Releases are reproducible and need only this repository. A release regenerates the tokens, compiles the Sass, and minifies the CSS and the version-stamped JS runtime. Every artifact is then precompressed as gzip and brotli, and zipped.

The published archive under `public/css` and `public/js` keeps every version, so the docs render each version against the exact bundle it shipped. Releases are maintainer-only.

### What This Site Loads from Elsewhere

The framework bundles fetch one thing from outside their own origin: a map's vector tiles, from TRMNL's own endpoint by default and otherwise from whichever source the map names. Fonts, the only other asset they load by URL, come from wherever `plugins.css` came from.

The docs site around them loads from four third-party origins, all in the page chrome or in a demo. Each one degrades only the feature that uses it, so a host that blocks all four still serves every page here.

- **Google Fonts** (`fonts.googleapis.com`, `fonts.gstatic.com`): Inter and EB Garamond for this site, Space Mono for code, and Inter again inside every demo iframe. Blocked, the site falls back to system fonts and the screens keep their self-hosted families. See [Font Family](/framework/docs/3.4/font_family) .
- **unpkg** (`unpkg.com`): the `@trmnl/picker` component behind the device selector. Blocked, the picker stays blank.
- **trmnl.com** : Highcharts and Chartkick, on the chart page and in the Shopify example. Blocked, those charts render empty. See [Chart](/framework/docs/3.4/chart) .
- **jsDelivr** (`cdn.jsdelivr.net`): opentype.js, which reads the glyph tables. Blocked, those tables stay empty. See [Font Glyphs](/framework/docs/3.4/font_glyphs) .

The docs site can mount as an engine in another Rails app; doing so brings all four origins with it. `docs/ENGINE_INTEGRATION.md` repeats this list with the CSP directives each origin needs.

Map tiles come from TRMNL's own endpoint (`maps.trmnl.com`) by default, fetched by the page itself; the `'osm'` preset opts into OpenStreetMap's public Shortbread endpoint (`vector.openstreetmap.org`), whose usage policy allows light use and forbids a fleet. A plugin names its own source and key, a host injects one per plugin instance, and the `'trmnl'` preset names the TRMNL endpoint explicitly. The engine also serves `/framework/tiles/{z}/{x}/{y}.mvt` for a host proxying a source of its own (a pass-through from `Framework.tile_source_url`; nothing is stored).

`docs/MAPS_GO_LIVE.md` is the checklist for a host that renders map plugins for devices. See [Map](/framework/docs/3.4/map) .

### License

The framework code is released under the MIT license. See the `LICENSE` file in the repository.

The MIT grant covers the code; the bundled fonts are licensed separately. The TRMNL pixel fonts (by Heavyweight Digital Type Foundry), Inter, and the Nico fonts ship under the SIL Open Font License 1.1; BlockKie ships under CC BY 3.0. Each font bundle download carries the full terms in its README and OFL.txt.

Highcharts is a commercial library the framework does not include. The chart examples load it from trmnl.com, where TRMNL serves it under its own license, and `TRMNLCharts` is only the adapter. A custom stack brings its own charting library and license: see [Chart](/framework/docs/3.4/chart) .

MapLibre GL JS is BSD licensed and vendored under `vendor/javascript/`, served by the engine next to the runtime and mirrored for plugins at `trmnl.com/js/maplibre-gl/5.24.0/`; `THIRD_PARTY_NOTICES.md` carries its notice. The map data is © OpenStreetMap contributors under the ODbL, which is why every map keeps its credit visible, and `TRMNLMaps` is only the adapter: see [Map](/framework/docs/3.4/map) .

### Start Here

- Want to help build it? Read [Contributing](/framework/docs/3.4/contributing) .
- New to the framework? Start with [Structure](/framework/docs/3.4/structure) and [Colors](/framework/docs/3.4/colors) .
- Adopting the 3.2 and 3.3 features? See [V3.4 Overview](/framework/docs/3.4/v3_overview) .

 Previous  [ 

## TRMNL X Guide

Framework changes for TRMNL X compatibility

 ](/framework/docs/3.4/trmnl_x_guide)

 Next  [ 

## Contributing

Run the framework locally, find your way around, run the tests, and open a good pull request

 ](/framework/docs/3.4/contributing)

