# Painting Colors

These functions tell you the exact color a CSS class paints right now: a background, a text color, a stroke, or a semantic color like error. Use them when something you draw in JavaScript has to match.

### Color and Token Fills

Every function takes an optional `{ el }`: the id or element whose nearest `.screen` supplies the paint. Each returns a `Fill`; the shape and how the reading works are on [Paint API](/framework/docs/3.4/paint_api) . The token names match the [Colors](/framework/docs/3.4/colors) palette.

- `bg(token, { el })`: a background token (`bg--<token>`), e.g. `'black'`, `'gray-40'`, `'red-55'`, `'error'`. On solid modes you get a color-only Fill; on dither modes, a pattern Fill. 
- `text(token, { el })`: a text token (`text--<token>`). Framework text is painted by clipping a background to the letters, so the Fill carries both the color and the image. 
- `stroke(token, { el })`: a stroke token (`text-stroke--<token>`), returned as a concrete `rgb` in a color-only Fill. 
- `semantic(slot, { el })`: one of the framework's named color roles: `canvas`, `surface`, `text-primary`, `text-secondary`, `text-inverse`, `backdrop`, `border-strong`, `border-muted`, `fill-strong`, `fill-muted`, `fill-soft`, `stroke-contrast`, or `icon`. Patterns come through intact. 
- `textColor(token, { el })`: the single color of a named text utility (`'default'`, `'muted'`, ...), for SVG or canvas text. When the text is painted with a pattern, you get the pattern's ink, the color the letters actually read as. 

```
// Resolve a token for the current screen mode/theme.
var fill = TRMNLPaint.bg("red-55", { el: "my-chart" });
// => solid mode: { color: "rgb(204, 0, 0)", image: null, url: null, size: null }
// => dither mode: { color: "rgb(255,255,255)", image: "url(...)", url: "data:...", size: 16 }

// The default text color as one plain color, for SVG or canvas text.
var textColor = TRMNLPaint.textColor("default", { el: "my-chart" });
```

### Painting Fills

A resolved Fill is painted back with one call. Wrap the painting in `watch()` so it re-runs when the screen's mode, dark or theme classes change; see [Paint API](/framework/docs/3.4/paint_api) .

- `apply(node, fill)`: paints a node's background from a Fill, layering the color under the pattern exactly as the framework itself does. 

```
var swatch = document.getElementById("legend-swatch");

TRMNLPaint.watch(swatch, function () {
  // Solid on 4-bit+ panels, a composited dither tile on 1- and 2-bit screens.
  TRMNLPaint.apply(swatch, TRMNLPaint.bg("gray-30", { el: swatch }));
});
```

### Where This Applies

[ 

## Background

 ](/framework/docs/3.4/background)[ 

## Text Color

 ](/framework/docs/3.4/text_color)[ 

## Colors

 ](/framework/docs/3.4/colors)

 Previous  [ 

## Paint API

TRMNLPaint: read the exact colors and patterns CSS paints right now, from JavaScript

 ](/framework/docs/3.4/paint_api)

 Next  [ 

## Painting Charts

Chart series colors for the current device, mode, and theme, with Highcharts adapters

 ](/framework/docs/3.4/paint_charts)

