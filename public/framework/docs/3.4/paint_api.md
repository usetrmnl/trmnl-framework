# Paint API

TRMNLPaint is the framework's JavaScript API for its paint: colors, border lines, and text styles. Ask it for any framework color and it returns what CSS would actually paint right now, with the device and the active theme already applied. Use it wherever JavaScript draws: charts, maps, canvases, or your own rendering.

### The Paint Domains

The functions are documented by what they paint. Every one takes an optional `{ el }`: the id or element to read the paint at, with device settings from its nearest `.screen`. Omit it on a single-screen plugin and the first screen on the page is used.

#### Painting Colors

Read background, text, stroke, and semantic colors as Fills, and paint them onto nodes.

- `bg()`, `text()`, `stroke()`
- `semantic()`, `textColor()`
- `apply()`

 Go to [Painting Colors](/framework/docs/3.4/paint_colors)

#### Painting Charts

Colors for chart series, and the Highcharts fill adapter.

- `series()`, `ramp()`
- `toHighcharts()`

 Go to [Painting Charts](/framework/docs/3.4/paint_charts)

#### Painting Maps

Map slots for land, water, roads and labels, and the MapLibre GL JS paint adapter.

- `slot()`
- `toMapLibre()`

 Go to [Painting Maps](/framework/docs/3.4/paint_maps)

#### Painting Borders

Border and divider lines as BorderFills, for your own lines and Highcharts axes.

- `border()`, `divider()`
- `applyBorder()`
- `toHighchartsAxis()`, `applyHighchartsAxisPaint()`

 Go to [Painting Borders](/framework/docs/3.4/paint_borders)

#### Painting Typography

Text styles and strokes as TypeSpecs, for your own text and chart labels.

- `type()`, `strokeSpec()`
- `applyType()`
- `toHighchartsText()`

 Go to [Painting Typography](/framework/docs/3.4/paint_typography)

### How It Works

All framework colors live in CSS, as custom properties on the `.screen` element; a theme is only CSS that changes them. `TRMNLPaint` reads those values, it never defines its own.

To answer a query, TRMNLPaint adds a hidden element to the target, gives it the real utility class (`bg--<token>`, `text--<token>`, ...), and reads back what the browser computed. That is why everything is honored automatically: bit depth, inverse, themes, and limited palettes shape the answer the same way they shape the screen.

No call ever throws: a missing `.screen` or an unknown token returns a Fill with null fields instead. Plugins render on a screenshot service, where a thrown error would mean a blank device screen.

### Scale Values

Scale pixel numbers in JavaScript the way the framework scales its own. `TRMNLPaint` reads the same variables CSS uses, so device density, Scale, and Text Scale never drift apart.

- `scale({ el })`: returns `{ name, device, modifier, ui, content, textName, textModifier, textUi }` for the target screen. The names identify the active Scale and Text Scale, device is the density factor, and the rest are the numeric multipliers they produce. 
- `px(value, { el, kind })`: scales one number or an array of numbers. It uses content scale by default; pass `kind: "ui"` for framework geometry or `kind: "text"` for framework typography. 

Use `px()` for numeric chart options, canvas dimensions, and other library configuration. Leave percentages, data values, and deliberate one-pixel lines unscaled.

```
var scale = TRMNLPaint.scale({ el: "my-chart" });
var height = TRMNLPaint.px(260, { el: "my-chart" });
var spacing = TRMNLPaint.px([10, 10, 5, 10], { el: "my-chart" });

// Framework component sizes also include device density.
var componentInset = TRMNLPaint.px(6, { el: "my-chart", kind: "ui" });

// Framework typography includes device density, Scale, and Text Scale.
var fontSize = TRMNLPaint.px(16, { el: "my-chart", kind: "text" });
```

### The Fill type

Every function returns a `Fill`, a plain object that says what to paint with. A Fill with a `url` and `size` is a dither pattern; a Fill with only a `color` is a solid. Anything library-specific lives in the adapters, never in the Fill.

```
Fill = {
  color: string | null, // resolved rgb(...); the solid color, or the color under a pattern
  image: string | null, // full resolved background-image; null when "none"
  url: string | null, // first url(...) from image; null for gradients / solids
  size: number | null, // tile size in px (falls back to --dither-bg-size)
}

// url && size => a dither tile pattern
// color only => a solid
```

Borders and typography have richer shapes: `BorderFill` is documented on [Painting Borders](/framework/docs/3.4/paint_borders) and `TypeSpec` on [Painting Typography](/framework/docs/3.4/paint_typography) .

### Painting and Reactivity

- `apply(node, fill)`: paints a node's background from a Fill, layering the color under the pattern exactly as the framework itself does. 
- `watch(el, onChange, { immediate })`: runs `onChange` now (unless `immediate: false`) and again whenever the device, scale, mode, dark or theme classes change on the screen or on a wrapper above it. Returns a `stop()` function. 
- `screen(el)`: the nearest `.screen` for a target element, or the first screen on the page. 

`applyBorder()` and `applyType()` do the same for lines and text; both are documented on [Painting Borders](/framework/docs/3.4/paint_borders) and [Painting Typography](/framework/docs/3.4/paint_typography) .

### Extending a Theme from JavaScript

A theme that wants to hand extra values to plugin code (a brand accent, say) sets its own `--*` variables on the screen, and JavaScript reads them back with `cssVar()`. Both sides read the same CSS.

`cssVar(name, { el })` returns the computed value of any public `--*` variable on the screen.

Read public var families only. The CSS minifier renames private variables in the released `plugins.min.css`; the readable `plugins.css` keeps the source names. `cssVar("--border-step-40-h-color")` answers in the dev build and returns an empty string in every release. See [CSS Variables](/framework/docs/3.4/variables_api) for the families that survive.

```
// A theme publishes a public var on .screen--theme-my-brand:
// --my-brand-accent: var(--red-50);
// Read it back from JS, resolved for the active mode/theme:
var accent = TRMNLPaint.cssVar("--my-brand-accent", { el: "my-chart" });
```

### Where This Applies

[ 

## Scale

 ](/framework/docs/3.4/scale)[ 

## Text Scale

 ](/framework/docs/3.4/text_scale)[ 

## Framework Runtime

 ](/framework/docs/3.4/framework_runtime)[ 

## Tokens

 ](/framework/docs/3.4/tokens)[ 

## Rendering Modes

 ](/framework/docs/3.4/rendering_modes)

 Previous  [ 

## Pixel Perfect

Ensure text renders with crisp edges by aligning to the pixel grid

 ](/framework/docs/3.4/pixel_perfect)

 Next  [ 

## Painting Colors

Read background, text, stroke, and semantic colors from JavaScript as Fill objects

 ](/framework/docs/3.4/paint_colors)

