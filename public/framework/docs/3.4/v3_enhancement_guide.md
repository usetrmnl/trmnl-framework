# V3.4 Enhancement Guide

Framework 3.4 lets an existing plugin follow themes and device modes everywhere: in markup, in charts, in icons, and in outlined text and images. This guide walks through the enhancements one at a time; adopt them in any order.

### 1. Make Your Plugin Theme-Ready

A theme recolors the whole screen. Your plugin does not load themes itself; it renders inside a screen that may carry one. A plugin is theme-ready when everything it draws uses framework classes and colors.

- Style with framework utilities (`bg--`, `text--`, `border--`) and elements (`label`, `value`, `title`). Themes recolor all of them.
- Avoid hardcoded hex colors and inline styles; a theme cannot recolor them.
- Test with the Style selector in the docs screen picker. It applies a theme to every example on the page.

To theme a screen you control, include the theme stylesheet and add the theme class. See [Themes](/framework/docs/3.4/themes) .

```
<link rel="stylesheet" href="plugins.css">
<link rel="stylesheet" href="themes/black-and-yellow-theme.css">

<div class="screen screen--theme-black-and-yellow">...</div>
```

### 2. Migrate Charts to TRMNLCharts

Use `TRMNLCharts`, the Highcharts adapter bundled with the runtime, for your charts. They become device-responsive, adapting to each panel's capabilities, and follow the active theme, with no hardcoded colors.

- Build your chart inside `TRMNLCharts.watch()` so it rebuilds when the device, scale, mode, dark mode, or theme changes.
- Start from `TRMNLCharts.options()` merged under your own settings.
- Color each series with `TRMNLCharts.series(i, n)` instead of a literal color.
- Convert numeric chart dimensions with `TRMNLPaint.px()`.

```
var el = document.getElementById("my-chart");

TRMNLCharts.watch(el, function () {
  var px = function (value) { return TRMNLPaint.px(value, { el: el }); };
  Highcharts.chart(el, TRMNLCharts.merge(TRMNLCharts.options({ el: el }), {
    chart: { height: px(260) },
    plotOptions: { series: { lineWidth: px(4) } },
    series: [
      { data: incoming, color: TRMNLCharts.series(0, 2, { el: el }) },
      { data: outgoing, color: TRMNLCharts.series(1, 2, { el: el }) }
    ]
  }));

  // Paint legend markers tagged data-chart-series="i" with matching series colors.
  TRMNLCharts.applySwatches({ el: el });
});
```

Full examples for line, multi-series, and bar charts are on the [Chart](/framework/docs/3.4/chart) page.

### 3. Mark Monochrome Icons Adaptive

Add `image--adaptive` to monochrome silhouette icons. The framework takes the icon's shape and repaints it in the screen's icon color, following the device, Raw/Preview, and the active theme.

```
<!-- Monochrome silhouette icons (shape on a transparent background) -->
<img class="image--adaptive" src="path to icon">
```

- Silhouettes only: never use it on photos or multi-color logos. Use [Image Stroke](/framework/docs/3.4/image_stroke) to keep those legible instead.
- Icons must be same-origin or served from a CORS-enabled host, or the framework leaves them unpainted. See [Image](/framework/docs/3.4/image) .

### 4. Resolve Paint from JavaScript

Drawing something yourself, on canvas, in SVG, or with another library? Ask `TRMNLPaint` for the colors. It returns what CSS would paint right now, with the device and the active theme already applied.

```
// A background token: solid where the panel can print it, dithered down to its inks where it cannot.
var fill = TRMNLPaint.bg("gray-40", { el: "my-visual" });

// The effective one-color value of a text utility for SVG or canvas text.
var ink = TRMNLPaint.textColor("default", { el: "my-visual" });

// Rebuild whenever the screen device, scale, mode, dark mode, or theme changes.
TRMNLPaint.watch("my-visual", function () { draw(); });
```

The full resolver and painter surface is documented on [Paint API](/framework/docs/3.4/paint_api) .

### 5. Move Borders to Shade Steps

Replace the numbered border levels with shade steps; the numbered classes still render, but they are deprecated. Steps use the same 10 to 75 scale as backgrounds, and themes recolor them. Borders now render as generated gradients instead of PNG tiles, so a bordered screen fetches no images.

```
<!-- Before: numbered levels (deprecated) -->
<div class="item border--h-5">...</div>

<!-- After: shade steps, plus black and white -->
<div class="item border--h-45">...</div>
<div class="item border--h-black">...</div>
```

See [Border](/framework/docs/3.4/border) for the full step scale and how themes recolor it.

### 6. Keep Overlaid Text and Images Legible

Text and images placed over a shaded or patterned surface can lose contrast. The Text Stroke and Image Stroke utilities outline them, and both were rebuilt to follow the device and themes like the rest of the screen.

- Add `text-stroke` to framework text over a busy background, and size it with `text-stroke--small` through `text-stroke--xlarge`. The stroke stays behind the letters in every browser, even when the text is filled with a pattern.
- Add `image-stroke` to a transparent or vector image for the same effect, with the matching `--small` through `--xlarge` sizes.
- Leave the color off to stroke with the default contrast ink, or set one with a color variant (`text-stroke--black`, `image-stroke--white`, or any palette token). Color variants follow the active theme.

```
<!-- Framework text over a shaded background -->
<span class="value text-stroke text-stroke--medium">64%</span>

<!-- Transparent or vector image over a pattern -->
<img class="image-stroke image-stroke--large" src="path to icon">
```

Full size and color scales are on the [Text Stroke](/framework/docs/3.4/text_stroke) and [Image Stroke](/framework/docs/3.4/image_stroke) pages.

 Previous  [ 

## V3.4 Upgrade Guide

Compatibility notes for upgrading plugins to Framework 3.4

 ](/framework/docs/3.4/v3_upgrade_guide)

 Next  [ 

## TRMNL X Guide

Framework changes for TRMNL X compatibility

 ](/framework/docs/3.4/trmnl_x_guide)

