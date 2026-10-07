# V3.4 Overview

Framework 3.4 adds custom theme fonts and fixes clipped card borders. It keeps the adaptive maps, position utilities, and themes introduced in 3.3. Existing plugin markup continues to work.

### Open Source

The design system behind every TRMNL screen is now yours to read, fork, and build on. It lived inside the core product since inception; 3.2 pulled it out into its own public repository at [github.com/usetrmnl/trmnl-framework](https://github.com/usetrmnl/trmnl-framework).

It is yours to shape too. Test suites and CI run on every pull request, and the [Open Source](/framework/docs/3.4/open_source) and [Contributing](/framework/docs/3.4/contributing) guides show where everything lives and how to ship a change.

### The v3 Color Foundation

3.3 builds on the color system introduced in v3.0: 10 hues with 14 lightness steps, semantic roles (primary, success, error, warning), and a 14-step grayscale, listed in full on [Colors](/framework/docs/3.4/colors) . Every color adapts to the device's palette and bit depth on its own, with no per-device markup.

### Independent Text Scale

Text Scale resizes all framework text without touching the rest of the interface. It stacks with Scale, so a dense layout can keep its text large instead of shrinking both together. See [Text Scale](/framework/docs/3.4/text_scale) .

### Themes

Recolor a whole screen by loading one extra stylesheet and adding `screen--theme-<id>`. The theme picks the colors; each device renders them with the inks it has. 3.2 ships three themes: Black and Yellow, White and Red, and Dark.

- Author your own theme with the `theme-slots` mixins and validate it with `rake framework:themes:lint`.
- Preview any docs example with a theme via the Style selector in the screen picker.

Full reference: [Themes](/framework/docs/3.4/themes) .

### Extended Theming

3.3 widens what a theme can reach. The title bar's inks split into slots of their own, item cards gain a fill, a paired ink, padding and a border art, and dividers gain a slot, so a theme restyles those surfaces instead of leaving them on the screen's defaults.

Structure moves through unitless factors over the unthemed geometry, where 1 is always the unthemed screen: whitespace, corners, title bar height and progress. A signed weight shift moves every vector-face role, and text modifiers set case and tracking per text role. Size and line height stay out of it, because those belong to the device and the reader's own text scale.

3.4 lets a theme or a plugin bring its own font: [Custom Typefaces](/framework/docs/3.4/custom_typefaces) .

Every slot and factor: [Theme Slots](/framework/docs/3.4/theme_slots) .

### TRMNLPaint: the JavaScript Paint API

Read any framework color, border, text style, or size from JavaScript. `TRMNLPaint` returns what CSS would paint right now, with the device, scale, and theme already applied, so your JavaScript never hardcodes a color.

- Resolvers read one value each: `bg()`, `text()`, `semantic()`, `series()`, `border()`, `type()`, and more.
- Painters: `apply()`, `applyBorder()`, `applyType()` write resolved paint onto nodes.
- `watch()` re-runs your build function whenever the screen's device, scale, mode, dark mode, or theme changes.
- `cssVar()` reads any public `--*` variable, which is how a theme hands values to plugin code.
- `slot()` returns what any component slot paints with, and `toMapLibre()` shapes a Fill for MapLibre GL JS.
- `scale()` reads the current scale factor, and `px()` converts pixel numbers with it.

Full reference: [Paint API](/framework/docs/3.4/paint_api) .

### Generated Paint Assets

Every dither pattern is now generated at build time as an inline SVG instead of shipping as a PNG image, so a screen paints with zero image fetches.

- CSS and JavaScript share the same generated patterns: `TRMNLPaint` reads back exactly what CSS paints.
- Every screen mode, Raw/Preview included, paints from the same generated set, so pattern shapes never change between modes.

### Adaptive Charts

The runtime now bundles `TRMNLCharts`, a Highcharts adapter built on TRMNLPaint. Series colors, grid lines, and chart text all come from the framework, so a chart adapts with the rest of the screen instead of carrying its own fixed colors.

- `options()` and `merge()` give you adaptive Highcharts defaults under your own settings.
- `series(i, n)` picks each series color; `applySwatches()` paints matching legend markers.
- `watch()` rebuilds the chart on device, scale, mode, dark mode, or theme changes.
- `TRMNLPaint.px()` scales numeric chart dimensions from the same live CSS contract.

Usage and live examples: [Chart](/framework/docs/3.4/chart) . For charting beyond Highcharts, use [Paint API](/framework/docs/3.4/paint_api) directly.

### Adaptive Maps

Maps join charts on TRMNLPaint. The runtime bundles `TRMNLMaps`, a MapLibre GL JS adapter that composes the map style from the framework's map slots over OpenStreetMap vector tiles, so a plotted map takes dither tiles on 1-bit, solids on 4-bit, hues on a color panel, and a theme's own tokens. Maps render as one still frame, with no interaction and no animation.

A map with no source of its own fetches OpenStreetMap's public Shortbread tiles directly. A plugin names its own source and key instead, and a host can hand one to a single plugin instance, so a key never sits in the markup.

Usage and live examples, including a Strava activity: [Map](/framework/docs/3.4/map) . The resolvers and adapter behind it: [Painting Maps](/framework/docs/3.4/paint_maps) .

### Positioned Content

`relative` and `absolute` put one element over another instead of beside it, so a full-bleed panel can take the whole layout and carry a compact card in one corner of it. Offsets run on the spacing scale, and a short stacking scale settles which of two overlapping elements is drawn on top.

An element out of flow is not measured by the fitting engines, so it carries its own size and clamps. The classes, the scale, and what an overlay needs to stay readable on 1-bit: [Position](/framework/docs/3.4/position) .

### Adaptive Icons

Add `image--adaptive` to a monochrome icon and the framework recolors it the way it colors text: it follows the device, Raw/Preview, and the active theme. One set of icons works everywhere, as long as they are same-origin or CORS-readable. See [Image](/framework/docs/3.4/image) .

### Rebuilt Borders, Outlines, and Strokes

The Border, Outline, Text Stroke, and Image Stroke utilities were rebuilt the same way as the color system and now follow the device and themes on their own.

- **Borders:** `border--h-{step}` and `border--v-{step}` now use the same 10 to 75 shade scale as backgrounds, plus `border--h-black` and `border--h-white`. Lines render as generated gradients instead of PNG tiles, so a bordered screen fetches no images. The numbered levels `border--h-1` through `border--h-7` still work but are deprecated. See [Border](/framework/docs/3.4/border) .
- **Outline:** draws a pixel-perfect dotted rounded border on 1-bit, and a solid rounded border on 2-bit and 4-bit. 3.3 rounds the element itself on the same 8px curve, so a card with its own background ends where the outline does, and adds `outline--muted` for an edge in a mid gray that still prints on 1-bit. See [Outline](/framework/docs/3.4/outline) .
- **Text Stroke:** renders as stacked drop shadows instead of native `-webkit-text-stroke`, so the stroke sits behind the letters in every browser, even when the text is filled with a pattern. Sizes run `text-stroke--small` to `text-stroke--xlarge`. See [Text Stroke](/framework/docs/3.4/text_stroke) .
- **Image Stroke:** outlines transparent images with the same size and color variants. See [Image Stroke](/framework/docs/3.4/image_stroke) .

### Mashup Backdrop

The `screen--backdrop` modifier now follows themes like every other surface. See [Mashup](/framework/docs/3.4/mashup) .

### Fluid Mashups

Fluid Mashups sit alongside the fixed layouts: place views on a three by three grid with `mashup--3x3` and the `mashup-cell` modifiers, no inline styles needed. Every cell keeps its frame and a compact title bar at any size, on every device and under themes. See [Mashup](/framework/docs/3.4/mashup) .

### Complete Scale Modifiers

Scale modifiers now resize everything: gaps, pixel utilities, image presets, component geometry, radii, and strokes, on top of each device's own density. The new `screen--scale-xxsmall` level adds a 66% scale for dense mashups, and `TRMNLPaint.px()` lets JavaScript convert pixel numbers the same way. See [Scale](/framework/docs/3.4/scale) .

### Under the Hood

- **Smaller stylesheets:** the responsive and device rules were refactored onto `:is()` selectors.

### Start Here

- Upgrading an existing plugin? → [V3.4 Upgrade Guide](/framework/docs/3.4/v3_upgrade_guide) .
- Want to adopt themes, adaptive charts, and adaptive icons? → [V3.4 Enhancement Guide](/framework/docs/3.4/v3_enhancement_guide) .

 Next  [ 

## V3.4 Upgrade Guide

Compatibility notes for upgrading plugins to Framework 3.4

 ](/framework/docs/3.4/v3_upgrade_guide)

