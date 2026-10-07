# Painting Charts

These functions pick the colors for a chart. Ask for series 2 of 5 and you get its paint, correct for the current device, mode, and theme. Adapters then turn each answer into the exact option Highcharts expects.

### Chart Series

Every function takes an optional `{ el }`: the id or element whose nearest `.screen` supplies the paint. Each returns a `Fill`; see [Paint API](/framework/docs/3.4/paint_api) for the shape.

- `series(i, count, { el })`: the paint for series _i_ of _count_. 
- `ramp({ el })`: every chart series color at once, as an array of Fills. CSS says how many there are in `--framework-chart-series-count`, so a theme that adds more chart colors shows up in JavaScript automatically. Entries past a shorter theme's last color come back empty. 

Series colors start at the screen's ink and spread only as far as stays readable; the public `--framework-chart-series-span` variable sets how far, so a theme can narrow it from CSS. Full-color screens use a set of distinct colors: the ink first, then seven hues in a fixed order, tuned separately for light and dark backgrounds. Grayscale and limited-palette screens step through shades instead, and a theme's own chart colors win over both.

```
// The paint for series 1 of 4.
var s = TRMNLPaint.series(1, 4, { el: "my-chart" });

// Every series color at once.
var fills = TRMNLPaint.ramp({ el: "my-chart" });
```

### Highcharts Adapters

Adapters translate a `Fill`, `BorderFill`, or `TypeSpec` into the shape a charting library expects. They only copy values across; no adapter invents colors or contrast rules of its own.

- `toHighcharts(fill)`: a solid Fill returns a flat color string; a tile Fill returns a `{ pattern: { image, width, height, backgroundColor } }` object for the Highcharts pattern-fill module. The background color is baked into the pattern image, under the dark pixels, so the pattern is self-contained. An empty Fill returns `null`. Patterns render through the Highcharts pattern-fill module; load it next to Highcharts, as the [Chart](/framework/docs/3.4/chart) examples do. 

The axis and label adapters live with their resolvers: `toHighchartsAxis()` on [Painting Borders](/framework/docs/3.4/paint_borders) , `toHighchartsText()` on [Painting Typography](/framework/docs/3.4/paint_typography) .

`TRMNLCharts` (next section) builds on these adapters: its `grid()`, `axisLine()`, and `textStyle()` methods pick the right chart parts and convert them for Highcharts. There is no adapter for other libraries yet (a Chart.js `CanvasPattern`, a D3 `<pattern>`); until one ships, read a Fill and translate it yourself. The Fill already carries everything a library needs.

```
// Highcharts: flat color on solid panels, a self-contained pattern tile
// on 1- and 2-bit screens.
var hc = TRMNLPaint.toHighcharts(TRMNLPaint.series(0, 4, { el: "my-chart" }));

// Any other library: resolve a Fill and translate it however you like.
var fill = TRMNLPaint.bg("gray-30", { el: "my-chart" });
var css = fill.image
  ? fill.image + " repeat" // dither tile
  : fill.color; // solid
```

### The TRMNLCharts API

`TRMNLCharts` builds Highcharts options that follow the device and the active theme. It ships in the same `plugins.js` runtime as `TRMNLPaint`, and every color it returns comes from TRMNLPaint. [Chart](/framework/docs/3.4/chart) puts it to work in line, bar, and gauge charts.

`TRMNLMaps` does the same for MapLibre GL JS, composing map styles out of the map slots: see [Painting Maps](/framework/docs/3.4/paint_maps) .

Every method takes the same optional `{ el }` as the paint functions above.

#### Resolving Chart Paint

- `paint(token, { el })`: one palette token as a Highcharts fill, flat color in solid modes and a pattern object in dither modes. 
- `series(i, count, { el })`: the Highcharts fill for series _i_ of _count_. 
- `applySwatches({ el })`: paints every element under the screen tagged `data-chart-series="i"` with that series' color, so legend markers always match. An optional `data-chart-series-count` sets the series total; it defaults to the number of tagged elements. Call it every time the chart builds. 

#### Building the Options

- `options({ el })`: the recommended Highcharts options for the TRMNL aesthetic, with a transparent background, no animation, no chrome, and framework-resolved axes and text styles. 
- `merge(base, overrides)`: a deep merge of two plain objects, where arrays and scalars replace. Layer your chart's own config over `options()` with it. 
- `grid({ el, dir })`: the grid-line options (`gridLineColor`, `gridLineWidth`, `gridLineDashStyle`), taken from the framework's muted border line (step 65). `dir: 'h'` (the default) is the horizontal yAxis grid, `'v'` the vertical xAxis grid. 
- `axisLine({ el })`: the `lineColor` and `tickColor` options, taken from the framework's black border line; axis and ticks share it. 
- `textStyle(role, { el })`: a Highcharts text style for one framework text role. It carries the font settings and a solid text color, and sets `textOutline: 'none'` so data labels lose the default white halo. Pass `{ stroke: '<token>' }` for an intentional outline. 

#### Keeping the Chart Current

- `watch(el, buildFn)`: builds the chart now and again whenever the device, scale, mode, dark-mode or theme classes change on the screen or on a wrapper above it. `buildFn` creates and returns the chart instance; the previous one is destroyed before each rebuild. Returns a stop function. 

Highcharts numbers do not read CSS, so resolve heights, spacing, and offsets with `TRMNLPaint.px()` inside the build function. See [Paint API](/framework/docs/3.4/paint_api) .

```
var el = "my-chart";

// watch() rebuilds on every device, mode, dark-mode and theme change.
TRMNLCharts.watch(el, function () {
  var chart = Highcharts.chart(el, TRMNLCharts.merge(TRMNLCharts.options({ el: el }), {
    chart: { type: "column", height: TRMNLPaint.px(180, { el: el }) },
    xAxis: { categories: ["Mon", "Tue", "Wed"] },
    series: [
      { name: "Sent", data: [3, 5, 8], color: TRMNLCharts.series(0, 2, { el: el }) },
      { name: "Read", data: [2, 4, 6], color: TRMNLCharts.series(1, 2, { el: el }) }
    ]
  }));
  // Legend markers tagged data-chart-series="0" / "1" get the same series colors.
  TRMNLCharts.applySwatches({ el: el });
  return chart;
});
```

### Live Example

The bar rows below are painted with `TRMNLPaint.series()` and `TRMNLPaint.apply()`, wrapped in `TRMNLPaint.watch()`, with no charting library involved. Change the device mode or Style in the screen picker and the bars repaint to match: flat colors on solid panels, dither patterns on 1- and 2-bit screens.

$48.6kPaper Sales

6Branches

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Paint APITRMNLPaint.apply

```
<!-- an empty container with an id to paint into -->
<div id="paint-strip" class="flex flex--col gap--small w--full"></div>

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
    var el = "paint-strip";
    var DATA = [["Scranton", 12.4], ["Stamford", 9.8], ["Nashua", 8.6],
                ["Utica", 7.4], ["Albany", 6.2], ["Buffalo", 4.2]];
    // watch() repaints whenever the screen device/scale/mode/dark/theme classes change.
    TRMNLPaint.watch(el, function () {
      var box = document.getElementById(el);
      if (!box) return;
      box.innerHTML = "";
      DATA.forEach(function (d, i) {
        var row = document.createElement("div");
        row.className = "flex flex--row flex--center-y gap--small";
        var cap = document.createElement("span");
        cap.className = "label label--small";
        cap.style.cssText = "width:88px;flex:none;";
        cap.textContent = d[0];
        var track = document.createElement("div");
        track.style.cssText = "flex:1;height:16px;";
        var bar = document.createElement("div");
        bar.style.cssText = "height:100%;border-radius:4px;width:" + (d[1] / DATA[0][1] * 100) + "%;";
        // series(i, n) reads the paint for series i; apply() layers color and
        // pattern like the framework does.
        TRMNLPaint.apply(bar, TRMNLPaint.series(i, DATA.length, { el: el }));
        track.appendChild(bar);
        row.appendChild(cap);
        row.appendChild(track);
        box.appendChild(row);
      });
    });
  });
</script>
```

### Where This Applies

[ 

## Rendering Modes

 ](/framework/docs/3.4/rendering_modes)[ 

## Chart

 ](/framework/docs/3.4/chart)

 Previous  [ 

## Painting Colors

Read background, text, stroke, and semantic colors from JavaScript as Fill objects

 ](/framework/docs/3.4/paint_colors)

 Next  [ 

## Painting Maps

Map slot colors for the current device, mode, and theme, with MapLibre GL JS adapters

 ](/framework/docs/3.4/paint_maps)

