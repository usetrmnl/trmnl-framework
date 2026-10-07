# Painting Maps

These functions give you the color of every part of a map: land, water, roads, parks, buildings, and labels, correct for the current device, mode, and theme. Adapters turn each answer into a MapLibre GL JS paint property, and TRMNLMaps assembles whole map styles out of them.

### Map slots

Every resolver takes an optional `{ el }`: the id or element whose nearest `.screen` ancestor supplies the paint. Each returns a canonical `Fill`; see [Paint API](/framework/docs/3.4/paint_api) for the shape.

- `slot(name, { el, kind })`: the Fill of one component slot. `kind` is `'bg'` (the default) for an area, `'text'` for a label, or `'border'` for a line, which returns a BorderFill whose `render.stroke` is the one color a line can take. 
- `series(i, count, { el })`: the fill for route _i_ of _count_, from the same chart-series ramp charts use. See [Painting Charts](/framework/docs/3.4/paint_charts) . 

The area slots are `map-land` (the canvas), `map-water`, `map-forest` (forest, wood), `map-green` (parks, grass, meadow, heath, scrub, wetland), `map-farmland`, `map-rock` (bare rock, scree), `map-sand` (beach, sand, shingle), `map-area` (residential, commercial, industrial; the canvas itself on 1-bit), `map-site` (schools, hospitals, parking), `map-building` (also piers, dams, bridges) and `map-transit` (station dots).

The line slots are `map-road` (motorway to tertiary), `map-road-minor` (residential, service, pedestrian, runways), `map-path` (footway, cycleway, track, steps), `map-rail` (rail, tram, subway, aerialways), `map-boundary` and `map-water-line` (rivers, canals, ferries). The text role `map-label` inks every place and water label; tiers differ by size, not tone, because a small dithered label would not survive a busy map.

Every map slot is a bg slot, lines included, so each resolves through the device mode: a dither tile on 1- and 2-bit screens, a solid on 4-bit and up, a hue on the color panels. A line painted from a tile is drawn as the polygon of its stroke filled with that tile, so a 1-bit road is the same screen-aligned dither its area would be, never a gray the panel cannot print; every line defaults to a gray short of the ink, so a plotted route in the ink reads on top of the roads.

Land follows the canvas and the labels follow the text channel, so a theme restates the token-bound areas and lines with `bg-slot`, the mixin it uses for every other component: see [Theme Slots](/framework/docs/3.4/theme_slots) .

```
// An area: a tile on 1-bit, a solid on 4-bit, blue on a color panel.
var water = TRMNLPaint.slot("map-water", { el: "my-map" });

// A line is a bg slot too: a tile on 1-bit (drawn as a line pattern), a gray on 4-bit.
var road = TRMNLPaint.slot("map-road", { el: "my-map" });

// A label: the ink of the map-label text role.
var label = TRMNLPaint.slot("map-label", { el: "my-map", kind: "text" });
```

### MapLibre adapters

Adapters shape a resolved `Fill` or `BorderFill` for one specific renderer. They copy resolved values into the renderer's native form; no adapter adds contrast heuristics, thresholds or substitute design rules.

- `toMapLibre(fill)`: returns `{ color, ink, pattern }`. A solid Fill gives its color as both `color` and `ink`; a tile Fill gives its painted ink and a registered pattern image for `fill-pattern`, with the field composited in and a pixel ratio that lands one tile pixel on one device pixel; a line Fill gives its stroke and never a pattern. 

`TRMNLMaps` (see the next section) is the MapLibre composition layer over TRMNLPaint, the way `TRMNLCharts` is for Highcharts: [Painting Charts](/framework/docs/3.4/paint_charts) . Pattern images are added to the map as the style asks for them, so a plugin never handles the image itself.

```
// MapLibre: a flat color on solid panels, a registered pattern on 1- and 2-bit screens.
var water = TRMNLPaint.toMapLibre(TRMNLPaint.slot("map-water", { el: "my-map" }));
var paint = water.pattern
  ? { "fill-pattern": water.pattern.id } // dither tile
  : { "fill-color": water.color }; // solid

// A line layer: TRMNLMaps.style() widens a tile line into a fill with the tile after the
// tiles load; by hand, a solid rail gives you the color and a dashed line takes the ink.
var road = TRMNLPaint.toMapLibre(TRMNLPaint.slot("map-road", { el: "my-map" }));
var linePaint = { "line-color": road.color || road.ink, "line-width": TRMNLPaint.px(2, { el: "my-map" }) };
```

### The TRMNLMaps API

`TRMNLMaps` ships in the same `plugins.js` runtime as `TRMNLPaint` and composes MapLibre GL JS styles and options out of it. It resolves no paint of its own: every value it returns comes from a TRMNLPaint resolver and adapter. [Map](/framework/docs/3.4/map) puts it to work in street, route and Strava examples.

Every method takes the same optional `{ el }` as the resolvers: the map container id or element whose nearest `.screen` supplies the paint. Omit it on a single-screen plugin.

#### Resolving map paint

- `paint(token, { el })`: one palette token as MapLibre paint, `{ color, ink, pattern }`. 
- `series(i, count, { el })`: the MapLibre paint for route _i_ of _count_ from the screen's chart-series ramp. 
- `route(map, coords, { el, i, n, width, id, casing })`: plots a route as the polygon of its stroke (default width 4, through `TRMNLPaint.px()`) filled with series _i_ of _n_ over a two pixel contrast casing, crisp and re-widened for every camera. Call it once the map has loaded. 
- `dot(map, lngLat, { el, i, n, radius, hollow, id })`: plots a disc (default radius 5) in that series paint with a two pixel contrast ring; `hollow: true` makes it a ring around a contrast core, so a start dot and an end ring read apart on one ink. 
- `applySwatches({ el })`: paints every element under the screen carrying `data-map-slot="map-water"` (and `data-map-slot-kind="text"` or `"border"`) from that slot, for a legend. 

#### Building the style

- `tiles(preset)`: a tile source, the vector tile URL template, zoom range and attribution. Resolved in order: the argument (`'osm'`, `'trmnl'`, or `{ url, key, preset }` merging over a preset), then the host's `window. __TRMNL_MAPS__.tiles`, then `'osm'`, the public endpoint. A url may carry `{key}`. 
- `style(preset, { el, tiles, labels, buildings })`: a complete MapLibre style for `streets`, `minimal`, `outline` or `blank`, every layer painted from the map slots. `labels: false` drops the labels, `labels: 'major'` keeps the big place names, `buildings: false` drops the footprints. 
- `options({ el, preset, center, zoom })`: Map options for a still map: the container, every handler and animation off, no controls, the screen's pixel ratio, and the style for the preset. Pass the result to `new maplibregl.Map()`. 
- `merge(base, overrides)`: a deep merge of two plain objects, where arrays and scalars replace. Layer your own ids, sources and options over the defaults with it. 

#### Fitting and decoding

- `fit(map, coords, { padding, maxZoom })`: frames the coordinates without animation, on an integer zoom with the center snapped to the pixel grid so dither patterns stay crisp. Returns the `{ center, zoom }` it jumped to. 
- `decodePolyline(str, precision)`: a Google encoded polyline (Strava's `map.summary_polyline`) as `[lng, lat]` pairs, ready for a GeoJSON LineString. 

#### Keeping the map current

- `watch(el, buildFn)`: builds the map now and again whenever the device, scale, mode, dark-mode or theme classes change. `buildFn` creates and returns the map; the previous one is removed first and the new one attached. Returns a stop function. 
- `attach(map, { el })`: registers a map you built yourself: pattern images, the pixel-grid snap, the labels, the attribution and readiness. `watch()` calls it for you. 
- `ready(map)`: a promise that resolves once the map has drawn everything it knows about. 
- `settle({ maxWaitMs })`: the bounded wait the runtime runs at the end of a pass, so `window.TRMNL_PLUGINS_READY` flips only once every attached map is idle. Default 6000 ms, or `window. __TRMNL_MAPS_SETTLE_MS__ `. 
- `refresh({ maxWaitMs })`: rebuilds every watched map from the live cascade and settles them, without re-running the pass. For a host that rescales the screen after the pass, the way a screenshot service sets its capture pixel ratio last. 
- `supported()`: whether this browser can draw a MapLibre map. Without WebGL, `watch()` flags the container `data-map-unsupported` and shows a `.map__fallback` child if you placed one. 

MapLibre numbers do not read CSS, so resolve widths, radii and padding with `TRMNLPaint.px()` inside the build function. See [Paint API](/framework/docs/3.4/paint_api) .

#### Every mark is a fill

Nothing TRMNLMaps draws is a MapLibre line or circle, which would be anti-aliased and, for a tile, filtered along the line. Every road, dash, stop, route and dot is the polygon of its stroke, filled with the slot's tile or solid without anti-aliasing, so it lands on the pixel grid like every other tile on the screen. The runtime widens them after the tiles load and again for every camera, in device pixels: a 1px line is one row of the panel's pixels on a 1.8x device as on a 1x one.

#### Labels

Place and water labels are framework elements, not MapLibre text. After every idle the runtime reads the label features out of the loaded tiles, writes each one into the container as a `label` (big places) or `label label--small` (towns, suburbs, water) with `text-stroke text-stroke--large`, snaps it to whole pixels, and keeps the biggest that fit without overlap. Every tier takes the map-label ink.

The biggest names win the space. Small kinds wait for closer zooms (towns from zoom 9, villages from 11, suburbs from 12, neighbourhoods from 13), water earns a name once it covers about a label's worth of screen, and a small map holds a few names instead of a crowd. No label lands on the credit.

So labels take the screen's own typography (TRMNL pixel fonts on 1-bit and 2-bit low-density panels, Inter on 4-bit and high density), the text-stroke halo, and the map-label slot for ink, with no glyph endpoint involved. `style()` decides which tiers a preset shows.

```
var el = "my-map";

// watch() rebuilds on every device, mode, dark-mode and theme change.
TRMNLMaps.watch(el, function () {
  var map = new maplibregl.Map(TRMNLMaps.options({ el: el, preset: "minimal" }));
  map.on("load", function () {
    TRMNLMaps.route(map, coords, { el: el, width: 3 });
    TRMNLMaps.dot(map, coords[0], { el: el, id: "start" });
  });
  TRMNLMaps.fit(map, coords, { padding: TRMNLPaint.px(20, { el: el }), maxZoom: 15 });
  return map;
});
```

### Live example

The swatches below are painted with `TRMNLMaps.applySwatches()` inside `TRMNLPaint.watch()`, with no map library involved. Change the device mode or Style in the screen picker and they repaint from the live cascade: tiles on 1- and 2-bit screens, solids on 4-bit, hues on a color panel.

Land

Water

Green

Building

Road

Minor road

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Painting MapsMap slots

```
<div class="w--14 h--4 mb--2 rounded--small" data-map-slot="map-water"></div>
<div class="w--14 h--1.5 mb--2" data-map-slot="map-road"></div>

<script type="text/javascript">
  var el = "map-slot-swatches";
  TRMNLPaint.watch(el, function () {
    TRMNLMaps.applySwatches({ el: el });
  });
</script>
```

### Where This Applies

[ 

## Map

 ](/framework/docs/3.4/map)

 Previous  [ 

## Painting Charts

Chart series colors for the current device, mode, and theme, with Highcharts adapters

 ](/framework/docs/3.4/paint_charts)

 Next  [ 

## Painting Borders

Read framework border lines as BorderFill objects, for your own lines and Highcharts axes

 ](/framework/docs/3.4/paint_borders)

