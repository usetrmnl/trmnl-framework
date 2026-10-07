# Painting Typography

These functions read everything a text class sets: font, size, weight, color, and optional stroke. Apply the result to text you draw yourself, or convert it for Highcharts labels.

### Custom Fonts and JavaScript

From Framework 3.4 a theme or a plugin can use its own font. The JavaScript typography APIs read the computed CSS, so they return that font with the device's sizes. See [Custom Typefaces](/framework/docs/3.4/custom_typefaces) .

A plugin's font applies inside its `typeface` container, so pass an `el` inside that container to read it.

A theme switch changes the screen's CSS class. Previously returned specs and copied inline styles are snapshots: read and apply them again after the switch, and update chart options from a fresh `TRMNLCharts.textStyle()` result. See [Painting Charts](/framework/docs/3.4/paint_charts) for chart integration.

```
// Both theme stylesheets are already loaded.
const screen = document.querySelector(".screen");
screen.classList.replace("screen--theme-example", "screen--theme-alternate");
const node = document.getElementById("custom-label");
const spec = TRMNLPaint.type("label", { el: screen });
TRMNLPaint.applyType(node, spec);
```

For canvas or chart layout that measures text, wait for `document.fonts.ready` after applying the font. The existing APIs cover custom typefaces; no separate JavaScript typeface setter is required.

### Typography

Every function takes an optional `{ el }`: the id or element whose nearest `.screen` supplies the paint. How the reading works is on [Paint API](/framework/docs/3.4/paint_api) .

- `type(classOrRole, { el, stroke })`: the typography of a role or class as a `TypeSpec`. Pass `stroke` (a size token, or `true` for the base size) to include a text stroke. 
- `strokeSpec(sizeToken, { el })`: one text stroke as `{ color, width, radius }`. The `sizeToken` is `'small'` / `'medium'` / `'large'` / `'xlarge'`, or `null` for the base `text-stroke`. 

The roles map to framework classes: `'chart-label'` to `text--small`; `'value'`, `'label'`, `'title'`, and `'description'` to their own classes. Any other string passes through as a literal class list (e.g. `'value value--xxlarge'`). Font family, size, weight, and line-height are measured live, so they match the active font bundle, custom theme font, and density.

```
TypeSpec = {
  fontFamily: string | null, // resolved family for the active bundle and density
  fontSize: string | null, // e.g. "38px" for .value
  fontWeight: string | null,
  fontStyle: string | null,
  fontVariantNumeric: string | null,
  fontVariationSettings: string | null,
  webkitFontSmoothing: string | null,
  letterSpacing: string | null,
  lineHeight: string | null,
  color: string | null, // exact computed color; transparent when text paints with a pattern
  backgroundColor: string | null, // the color under the text pattern
  backgroundImage: string | null, // exact computed image; the dither pattern lives here
  backgroundSize: string | null,
  backgroundPosition: string | null,
  backgroundRepeat:string | null,
  clip: string | null, // computed background-clip
  textShadow: string | null, // the stacked drop shadows when a stroke was requested
  filter: string | null,
  overflow: string | null,
  stroke: null | { color, width, radius }, // present only when stroke was requested
}
```

```
// The .value role, size/family/weight resolved for the active bundle + density.
var big = TRMNLPaint.type("value", { el: "my-chart" }); // -> TypeSpec
var axis = TRMNLPaint.type("chart-label", { el: "my-chart" });
```

### Painting Type

A TypeSpec is written back complete, so dither patterns and strokes survive instead of collapsing to a solid color. Wrap the painting in `watch()` so text re-reads when the bundle, density, or theme changes; see [Paint API](/framework/docs/3.4/paint_api) .

- `applyType(node, typeSpec)`: writes a `TypeSpec`'s font, text paint, clipping, and optional stroke onto a node, exactly as computed. 

### Highcharts Labels

The text adapter copies a TypeSpec into Highcharts' label options; the fill adapter and the rules all adapters follow are on [Painting Charts](/framework/docs/3.4/paint_charts) .

- `toHighchartsText(typeSpec)`: turns a `TypeSpec` into `{ color, textOutline, fontFamily?, fontSize?, ... }`. Font keys appear only when resolved, and `textOutline` is `'none'` unless a stroke was requested, so data labels lose Highcharts' default white halo. 

```
// Typography into Highcharts label options.
var label = TRMNLPaint.toHighchartsText(
  TRMNLPaint.type("chart-label", { el: "my-chart" }));
// => { color, textOutline: "none", fontFamily, fontSize, fontWeight }
```

### Live Example

The two stat tiles below are built from plain spans that carry no framework classes. `TRMNLPaint.type()` resolves the `value` role (the big-number face used by stat tiles) and the `chart-label` role, and `TRMNLPaint.applyType()` writes the font and text paint onto them. Toggle the font bundle or density in the picker and the tiles follow.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Paint APITRMNLPaint.applyType

```
<div id="type-specimen" class="grid grid--cols-2 w--full"></div>

<script type="text/javascript">
  function whenReady(cb) {
    var tries = 0;
    (function attempt() {
      if (window.TRMNLPaint) return cb();
      if (++tries > 200) return;
      setTimeout(attempt, 50);
    })();
  }

  whenReady(function () {
    var el = "type-specimen";
    var TILES = [
      { value: "4,283", caption: "Reams Sold" },
      { value: "12", caption: "Dundie Awards" }
    ];
    // watch() re-resolves the typography whenever bundle/density/theme changes.
    TRMNLPaint.watch(el, function () {
      var grid = document.getElementById(el);
      if (!grid) return;
      grid.innerHTML = "";
      var big = TRMNLPaint.type("value", { el: el });
      var small = TRMNLPaint.type("chart-label", { el: el });
      TILES.forEach(function (t) {
        var cell = document.createElement("div");
        cell.className = "flex flex--col flex--center-x";
        var v = document.createElement("span");
        v.textContent = t.value;
        // applyType writes the complete TypeSpec; the spans themselves carry
        // no framework class.
        TRMNLPaint.applyType(v, big);
        var c = document.createElement("span");
        c.textContent = t.caption;
        TRMNLPaint.applyType(c, small);
        cell.appendChild(v);
        cell.appendChild(c);
        grid.appendChild(cell);
      });
    });
  });
</script>
```

 Previous  [ 

## Painting Borders

Read framework border lines as BorderFill objects, for your own lines and Highcharts axes

 ](/framework/docs/3.4/paint_borders)

 Next  [ 

## Sass API

The framework SCSS source: architecture, cascade layers, and what a custom stack can build from it

 ](/framework/docs/3.4/sass_api)

