# Painting Borders

These functions tell you exactly how the framework draws a border line. Use them so lines you draw yourself, or Highcharts axes and grid lines, match the borders around them.

### Borders and Dividers

Every function takes an optional `{ el }`: the id or element whose nearest `.screen` supplies the paint. How the reading works is on [Paint API](/framework/docs/3.4/paint_api) .

- `border(spec, { dir, el })`: one framework border line as a `BorderFill`. The `spec` is a shade step from 10 to 75, or `'black'` / `'white'`; `dir` is `'h'` (default) or `'v'`. Framework borders are painted as a background on a pseudo-element, so that is where the paint is read. 
- `divider({ dir, el })`: the `.divider` line (level 6) as a `BorderFill`, read on the element itself. 

A dithered line is painted from several stacked layers, so `BorderFill` keeps `size`, `position`, and `repeat` as verbatim strings. It also carries the ready-made SVG drawing instructions the CSS declares, so a renderer copies paths and colors verbatim instead of parsing gradients.

```
BorderFill = {
  color: string | null, // resolved background-color (solid/black-white modes)
  image: string | null, // resolved background-image gradient(s); null when "none"
  url: string | null, // first url(...) ink tile (black/white lines); null otherwise
  size: string | null, // VERBATIM background-size string (dither lines are list-valued)
  position: string | null, // VERBATIM background-position string
  repeat: string | null, // VERBATIM background-repeat string
  render: { // CSS-declared; copied verbatim by renderer adapters
    stroke: string | null,
    width: string | null,
    height: string | null,
    viewBox: string | null,
    path1: string | null,
    color1: string | null,
    path2: string | null,
    color2: string | null,
  } | null,
  dir: "h" | "v", // which pseudo/orientation was read
}
```

`border()` is the right call for drawing lines: it reads the `.border--*` utilities, which stay visible in every mode and follow themes for free. `semantic('border-strong')` and `semantic('border-muted')` return the role's color as a plain Fill, not the line artwork; reach for them only when you need the color itself.

```
// Framework border lines, read for the current mode/theme.
var gridLine = TRMNLPaint.border(65, { el: "my-chart" }); // -> BorderFill
var axisLine = TRMNLPaint.border("black", { dir: "v", el: "my-chart" });
var step40 = TRMNLPaint.border(40, { el: "my-chart" });
```

### Painting Lines

A BorderFill is written back verbatim, so it paints exactly as the CSS `.border--*` utilities do. Wrap the painting in `watch()` so lines re-read on mode, dark, and theme changes; see [Paint API](/framework/docs/3.4/paint_api) .

- `applyBorder(node, borderFill)`: writes a `BorderFill` onto a node as its five background properties; solids, gradients, and dithered lines all arrive unchanged. 

### Highcharts Axes

The axis adapters copy a border line into Highcharts' native options; the fill adapter and the rules all adapters follow are on [Painting Charts](/framework/docs/3.4/paint_charts) .

- `toHighchartsAxis(borderFill)`: turns a `BorderFill` into a `{ gridLineColor, gridLineWidth, gridLineDashStyle, lineColor, tickColor }` block. 
- `applyHighchartsAxisPaint(chart, fills)`: paints the rendered grid, axis, and tick paths from `{ xGrid, yGrid, axis }` BorderFills, re-running on the chart's render event. `TRMNLCharts.options()` wires it up for you. Flat modes carry a stroke; dither modes carry their complete pattern, paths and colors. 

```
// Border lines into Highcharts axis/grid options.
var grid = TRMNLPaint.toHighchartsAxis(
  TRMNLPaint.border(65, { el: "my-chart" }));
```

### Live Example

The separator under each schedule row is painted with `TRMNLPaint.border()` and `TRMNLPaint.applyBorder()`, wrapped in `TRMNLPaint.watch()`. Each row uses a different spec (shade steps 65 and 40, then black and white), labelled on the right. Change the device mode or Style in the picker and the lines repaint, picking up dither patterns and theme colors.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Paint APITRMNLPaint.applyBorder

```
<div id="border-strip" class="flex flex--col w--full"></div>

<script type="text/javascript">
  // plugins.js bundles TRMNLPaint; wait for it before painting.
  function whenReady(cb) {
    var tries = 0;
    (function attempt() {
      if (window.TRMNLPaint) return cb();
      if (++tries > 200) return;
      setTimeout(attempt, 50);
    })();
  }

  whenReady(function () {
    var el = "border-strip";
    var SPECS = [65, 40, "black", "white"];
    // watch() re-reads each line whenever the screen device/scale/mode/dark/theme changes.
    TRMNLPaint.watch(el, function () {
      var box = document.getElementById(el);
      if (!box) return;
      box.innerHTML = "";
      SPECS.forEach(function (spec) {
        var row = document.createElement("div");
        row.style.cssText = "padding:12px 0;";
        row.textContent = "border(" + JSON.stringify(spec) + ")";
        var line = document.createElement("div");
        line.style.cssText = "height:2px;width:100%;";
        // applyBorder paints the line exactly as the CSS .border--* utilities do.
        TRMNLPaint.applyBorder(line, TRMNLPaint.border(spec, { el: el }));
        box.appendChild(row);
        box.appendChild(line);
      });
    });
  });
</script>
```

### Where This Applies

[ 

## Border

 ](/framework/docs/3.4/border)

 Previous  [ 

## Painting Maps

Map slot colors for the current device, mode, and theme, with MapLibre GL JS adapters

 ](/framework/docs/3.4/paint_maps)

 Next  [ 

## Painting Typography

Read text roles as TypeSpec objects for custom text and chart labels

 ](/framework/docs/3.4/paint_typography)

