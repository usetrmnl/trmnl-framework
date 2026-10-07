# Map

Maps render OpenStreetMap vector tiles through MapLibre GL JS, with every layer painted by the framework. The TRMNLMaps helper composes the map style from the live screen, so a map adapts to the device and themes like the rest of the screen. Maps are plotted, never satellite, and never interactive.

### Usage

Maps are [MapLibre GL JS](https://maplibre.org) compositions over [OpenStreetMap](https://www.openstreetmap.org) vector tiles, and every layer is painted by the framework. The plugin runtime bundles a `TRMNLMaps` helper that builds the map style from the live screen, the way `TRMNLCharts` builds Highcharts options. The methods below are the ones these examples use; [Painting Maps](/framework/docs/3.4/paint_maps) carries the full list and the resolvers behind it.

- `options({ el, preset, center, zoom })`: the Map options for a still map, with the style for a preset, the container, and every handler and animation off. 
- `watch(el, buildFn)`: builds the map now and again when device, scale, mode, dark mode or theme changes, removing the previous one first. 
- `route(map, coords, { el, width })` and `dot(map, lngLat, { el, radius, hollow })`: plot a route and its markers as crisp fills painted from the screen's chart-series ramp. 
- `fit(map, coords, { padding, maxZoom })`: frames the coordinates on an integer zoom, with no animation. 
- `decodePolyline(str)`: a Google encoded polyline (the shape Strava returns) as `[lng, lat]` pairs. 
- `merge(base, overrides)`: layer your own layer ids, sources and Map options over the defaults. 

`{ el }` is the map container id or element. Omit it on a single-screen plugin.

Four style presets ship: `streets` draws roads, water, parks, buildings and labels, `minimal` keeps the land, water and main roads a route sits on, `outline` is coast, water, main roads and the big place names for a small view, and `blank` is the land alone for your own overlays. Each preset is the same slot set drawn differently, so a theme restyles all four at once.

`TRMNLMaps` resolves no paint of its own: every color comes from a `TRMNLPaint` map slot, so a map on a 1-bit screen draws dither tiles and a map on a color panel draws solids. For anything beyond MapLibre, read the slots directly: see [Paint API](/framework/docs/3.4/paint_api) .

#### Tiles and keys

A map that names no tile source fetches TRMNL's own tiles (`maps.trmnl.com`) itself, and whoever renders the plugin pays nothing. Name a source when you have one:

- `options({ tiles: { url, key } })`: your own source. `url` is a `{z}/{x}/{y}` template and may carry `{key}`, which the key fills. 
- `options({ tiles: 'trmnl' })`: TRMNL's own source, `maps.trmnl.com`, a Shortbread planet behind a CDN. The docs site and TRMNL's plugins use it. 
- `window. __TRMNL_MAPS__ = { tiles: { url, key } }`: set by the host per plugin instance, so a plugin author's key or a user's key from the plugin settings reaches the map without a key in the markup. A source named in code wins over it. 

The style speaks the Shortbread tile schema, so a source has to as well. Keep the OpenStreetMap credit whatever the source: the data is theirs either way.

Maps are built non-interactive. A device has no input and the screenshot service captures one still frame, so options() disables every handler and animation: set the camera in the options or with fit(), never with flyTo or easeTo.

OpenStreetMap data is licensed under the ODbL and needs visible credit. watch() and attach() place a framework-styled "© OpenStreetMap contributors" label on every map: keep it.

A plugin loads MapLibre GL JS from trmnl.com/js/maplibre-gl/5.24.0/, the same build the framework serves next to the runtime for these examples, and the tiles come from maps.trmnl.com, so a map renders an empty canvas without network. MapLibre is BSD licensed; the map data is © OpenStreetMap contributors.

#### Streets

The streets preset on its own: one place, one zoom, nothing plotted. Load MapLibre from the framework, give the map a container with the map class, and build it inside watch().

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)MapStreets

```
<!-- import MapLibre GL JS and its stylesheet -->
<script src="https://trmnl.com/js/maplibre-gl/5.24.0/maplibre-gl.js"></script>
<link href="https://trmnl.com/js/maplibre-gl/5.24.0/maplibre-gl.css" rel="stylesheet">

<!-- markup with an empty, ID'd .map container for the canvas -->
<div class="view view--full">
  <div class="layout layout--col">
    <div id="map-streets" class="map stretch w--full rounded--base"></div>
  </div>

  <div class="title_bar">
    <img class="image image--adaptive" src="/images/plugins/trmnl--render.svg" alt="TRMNL Logo">
    <span class="title">Map</span>
    <span class="instance">Streets</span>
  </div>
</div>

<script type="text/javascript">
  // Wait for MapLibre and the framework TRMNLMaps helper (bundled in the
  // plugin runtime), then build the map from the live screen.
  function whenReady(cb) {
    var tries = 0;
    (function attempt() {
      if (window.TRMNLMaps && window.maplibregl) return cb();
      if (++tries > 200) return;
      setTimeout(attempt, 50);
    })();
  }

  whenReady(function () {
    var el = "map-streets";
    // watch() rebuilds on device/scale/mode/dark/theme change; options() carries
    // the style for the preset, painted from the live screen.
    TRMNLMaps.watch(el, function () {
      return new maplibregl.Map(TRMNLMaps.options({
        el: el, preset: "streets", center: [-84.3885, 33.7554], zoom: 13
      }));
    });
  });
</script>
```

#### Map styles

The same view through three presets. Streets is the full map, minimal keeps the shapes a route sits on, and outline is coast, water, main roads and the big names for the smallest views.

The small detail waits for the zoom that has room for it. Buildings, sites, minor roads, paths and transit stops start at zoom 13 and 14, so below that streets and minimal draw close to the same map.

Leibnizstraße 62

streets

Leibnizstraße 62

minimal

Leibnizstraße 62

outline

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)MapStyles

```
// One watch() per container; only the preset changes.
var office = [13.3133, 52.5038];
["streets", "minimal", "outline"].forEach(function (preset) {
  var el = "map-style-" + preset;
  TRMNLMaps.watch(el, function () {
    var map = new maplibregl.Map(TRMNLMaps.options({
      el: el, preset: preset, center: office, zoom: 14
    }));
    // The label engine only names tile features, so a place of your own is a
    // dot plus your own markup over the map.
    map.on("load", function () { TRMNLMaps.dot(map, office, { el: el }); });
    return map;
  });
});
```

#### Markers and routes

Plot your own data. route() and dot() draw it as crisp fills painted from the screen's chart-series ramp, and fit() frames it on an integer zoom. A second route takes the next step of the ramp (a dither on 1-bit), so the walk out and the walk back read apart.

4.4 kmDistance

55 minWalk

+12 mClimb

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)MapTiergarten walk

```
// Brandenburger Tor west through the woods, back through the north of the park.
var route = [
  [13.3778, 52.5163], [13.3766, 52.5160], [13.3769, 52.5158], [13.3763, 52.5154],
  [13.3765, 52.5138], [13.3755, 52.5131], [13.3741, 52.5127], [13.3723, 52.5129],
  [13.3712, 52.5128], [13.3691, 52.5120], [13.3637, 52.5137], [13.3631, 52.5133],
  [13.3614, 52.5130], [13.3579, 52.5133], [13.3570, 52.5132], [13.3545, 52.5144],
  [13.3527, 52.5143], [13.3519, 52.5144], [13.3519, 52.5146], [13.3508, 52.5146]
];
var back = [
  [13.3508, 52.5146], [13.3518, 52.5149], [13.3518, 52.5155], [13.3524, 52.5158],
  [13.3617, 52.5176], [13.3690, 52.5174], [13.3700, 52.5179], [13.3741, 52.5177],
  [13.3768, 52.5166], [13.3778, 52.5163]
];

whenReady(function () {
  var el = "map-walk";
  TRMNLMaps.watch(el, function () {
    var map = new maplibregl.Map(TRMNLMaps.options({ el: el, preset: "minimal" }));
    map.on("load", function () {
      // route() and dot() draw crisp fills from the chart-series ramp:
      // the walk out takes step 0 of 2, the walk back step 1.
      TRMNLMaps.route(map, route, { el: el, i: 0, n: 2 });
      TRMNLMaps.route(map, back, { el: el, id: "back", i: 1, n: 2 });
      TRMNLMaps.dot(map, route[0], { el: el, id: "start" });
      TRMNLMaps.dot(map, route[route.length - 1], { el: el, id: "end", hollow: true });
    });
    // fit() frames both routes on an integer zoom, no animation.
    TRMNLMaps.fit(map, route.concat(back), { padding: TRMNLPaint.px(24, { el: el }), maxZoom: 14 });
    return map;
  });
});
```

#### Grayscale and color

The map slots default to grays tuned for 1-bit: land and the built-up blocks are the canvas, water, parks and buildings are dither tiles, roads are grays short of the ink, labels are the ink. A full-color screen re-points the same slots at chromatic tokens and a limited palette dithers them to its ink set, so the plugin changes nothing.

Labels are framework elements placed over the canvas, so they take the screen's own fonts (TRMNL pixel fonts on 1-bit and 2-bit low-density panels, Inter on 4-bit and high density) with a large text stroke, on whole pixels. The biggest names win the space: small places wait for closer zooms, and a small map holds a few names instead of a crowd.

Switch the device picker to a color device or dark mode and the map repaints. A theme restyles the map with the same slot mixins it uses for every other component: see [Theme Slots](/framework/docs/3.4/theme_slots) .

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)MapSydney Harbour

```
// Nothing here names a device or a color: the slots resolve per screen.
TRMNLMaps.watch(el, function () {
  return new maplibregl.Map(TRMNLMaps.options({
    el: el, preset: "streets", center: [151.2153, -33.8568], zoom: 12
  }));
});

// A theme re-points a map slot like any other component slot (SCSS):
// @include theme-slots.bg-slot("map-water", "blue-65");
// @include theme-slots.bg-slot("map-road-minor", "gray-50");
```

#### Floating card

A card belongs inside the `map` container, which positions its children already, so `top--2 left--2` measures from the map's own corner. Give the card a width and lay its contents out yourself, since nothing sizes or arranges an element that is out of flow. [Position](/framework/docs/3.4/position) has the offset and stacking classes.

The bottom right corner belongs to the data credit, which has to stay visible. Place names land wherever the map data puts them, so a smaller card leaves more of them legible. A route map has a lever a fixed center does not: more padding on the card's side of `fit()` frames the route in what is left.

Over a detailed map, `outline--muted`[Outline](/framework/docs/3.4/outline) draws that edge in a mid gray. It still separates the card from the map, with a quieter line across whatever it covers.

A card over a map takes a solid fill and no shade in between: `bg--canvas` follows the screen's own background, `bg--white` and `bg--black` pin it, and every gray between them is a dither tile that small text cannot survive on 1-bit. Its edge comes from `outline`, which reads against a light and a dark map alike, and never from a box-shadow, which ePaper renders as a smear of dither.

Atlanta UnitedMercedes-Benz Stadium

| Opponent | Orlando City |
| Kickoff | 7:30 PM |
| Gates | 5:30 PM |
| Seats | 118, Row 12 |
| MARTA | GWCC/CNN Center |

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)MapFloating card

```
<!-- The map fills the layout; the card is its positioned child. -->
<div class="view view--full">
  <div class="layout layout--col">
    <div id="map-overlay" class="map stretch w--full rounded--base">
      <div class="absolute top--2 left--2 z--2 p--4 w--max-60 bg--canvas outline outline--muted">
        <div class="flex flex--col gap--small">
          <div class="item">
            <div class="meta"></div>
            <div class="content">
              <span class="value value--small">Atlanta United</span>
              <span class="label">Mercedes-Benz Stadium</span>
            </div>
          </div>

          <div class="divider"></div>

          <table class="table table--condensed">
            <tbody>
              <tr>
                <td><span class="label label--small">Opponent</span></td>
                <td><span class="label label--small">Orlando City</span></td>
              </tr>
              <tr>
                <td><span class="label label--small">Kickoff</span></td>
                <td><span class="label label--small">7:30 PM</span></td>
              </tr>
              <tr>
                <td><span class="label label--small">Gates</span></td>
                <td><span class="label label--small">5:30 PM</span></td>
              </tr>
              <tr>
                <td><span class="label label--small">Seats</span></td>
                <td><span class="label label--small">118, Row 12</span></td>
              </tr>
              <tr>
                <td><span class="label label--small">MARTA</span></td>
                <td><span class="label label--small">GWCC/CNN Center</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <div class="title_bar">
    <img class="image image--adaptive" src="https://usetrmnl.com/images/plugins/trmnl--render.svg" alt="TRMNL Logo">
    <span class="title">Map</span>
    <span class="instance">Floating card</span>
  </div>
</div>

<script type="text/javascript">
  var stadium = [-84.4008, 33.7554];

  TRMNLMaps.watch("map-overlay", function () {
    var map = new maplibregl.Map(TRMNLMaps.options({
      el: "map-overlay", preset: "streets", center: stadium, zoom: 15
    }));
    map.on("load", function () {
      TRMNLMaps.dot(map, stadium, { el: "map-overlay", id: "venue" });
    });
    return map;
  });
</script>
```

### Strava activity

Strava returns each activity with `map.summary_polyline`, a Google encoded polyline. Decode it, fit the camera to it, draw the route with a start dot and an end ring, and show the activity stats in the framework layout.

In a plugin the `activity` object comes from your polling URL; the example inlines one run. The roads are grays and the route takes the ink, so it reads on top; the minimal preset keeps the streets under it quiet.

Morning RunCentral Park, New York

9.7 kmDistance

49:58Time

5:09 /kmPace

+78 mElev Gain

152 bpmAvg Heart Rate

683 calCalories

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)StravaActivity

```
<!-- import MapLibre GL JS and its stylesheet -->
<script src="https://trmnl.com/js/maplibre-gl/5.24.0/maplibre-gl.js"></script>
<link href="https://trmnl.com/js/maplibre-gl/5.24.0/maplibre-gl.css" rel="stylesheet">

<div class="view view--full">
  <div class="layout layout--col">
    <div class="grid grid--cols-4 gap--small stretch">
      <!-- The card is a positioned child of the map, so it floats over the route. -->
      <div id="map-strava" class="map col--span-3 stretch w--full rounded--base">
        <div id="strava-card" class="absolute top--2 left--2 z--2 p--4 w--max-60 bg--canvas outline outline--muted">
          <div class="item">
            <div class="meta"></div>
            <div class="content">
              <span class="value value--small">{{ activity.name }}</span>
              <span class="label">Central Park, New York</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex--col flex--between">
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--base value--tnums" id="strava-distance"></span>
            <span class="label">Distance</span>
          </div>
        </div>
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--base value--tnums" id="strava-time"></span>
            <span class="label">Time</span>
          </div>
        </div>
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--base value--tnums" id="strava-pace"></span>
            <span class="label">Pace</span>
          </div>
        </div>
        <div class="divider"></div>
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--xsmall lg:value--small value--tnums" id="strava-elevation"></span>
            <span class="label label--small">Elev Gain</span>
          </div>
        </div>
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--xsmall lg:value--small value--tnums" id="strava-heartrate"></span>
            <span class="label label--small">Avg Heart Rate</span>
          </div>
        </div>
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--xsmall lg:value--small value--tnums" id="strava-calories"></span>
            <span class="label label--small">Calories</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="title_bar">
    <img class="image image--adaptive" src="/images/plugins/trmnl--render.svg" alt="TRMNL Logo">
    <span class="title">Strava</span>
    <span class="instance">Activity</span>
  </div>
</div>

<script type="text/javascript">
  // One activity as the Strava API returns it (metres and seconds). In a
  // plugin this is your polling data: {{ activity | json }}.
  var activity = {
    name: "Morning Run",
    distance: 9705,
    moving_time: 2998,
    total_elevation_gain: 78,
    average_heartrate: 152,
    calories: 683,
    map: { summary_polyline: "sxywFnunbMiAyCoEuC{BaFeAiAcEsAiDdA_BK}BsBcCgF}CI}GqBgDuBgE_FiGiDgAwAu@yCQaBTkFq@wBa^sUeJk@_DdBeBKkEoCqGuHuDBeGcAuA{A_AqC}@i@_AXa@jAJ`BjAnCCfAc@p@aAD{EmEuDeA}BfBcB`EcA~JTjAl@x@rA^~@Yf@y@`@mC~@aAjFu@xAVnBdCvAvF|DnCvAdGlAvBlKdGvBfE~@`AhAV|BItAh@bDvJnCbDfBbAdBXzGuAzAH|DzCzDlG|Hn@lAfApDbGnEtEvEfIxBn@hH]jB`@r@|@l@dDp@dAvCnB|IrDpIhLzBjBdBb@jBy@rBsClB}EZyDG{@o@_AiImEiCaDQaD`AeDFoB" }
  };

  function whenReady(cb) {
    var tries = 0;
    (function attempt() {
      if (window.TRMNLMaps && window.maplibregl) return cb();
      if (++tries > 200) return;
      setTimeout(attempt, 50);
    })();
  }

  function clock(seconds) {
    var m = Math.floor(seconds / 60), s = Math.round(seconds % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  whenReady(function () {
    var el = "map-strava";
    var km = activity.distance / 1000;
    var stats = {
      distance: km.toFixed(1) + " km",
      time: clock(activity.moving_time),
      pace: clock(activity.moving_time / km) + " /km",
      elevation: "+" + Math.round(activity.total_elevation_gain) + " m",
      heartrate: Math.round(activity.average_heartrate) + " bpm",
      calories: Math.round(activity.calories) + " cal"
    };
    Object.keys(stats).forEach(function (key) {
      document.getElementById("strava-" + key).textContent = stats[key];
    });

    // decodePolyline() returns [lng, lat] pairs, ready for GeoJSON.
    var coords = TRMNLMaps.decodePolyline(activity.map.summary_polyline);

    TRMNLMaps.watch(el, function () {
      var map = new maplibregl.Map(TRMNLMaps.options({ el: el, preset: "minimal" }));
      map.on("load", function () {
        TRMNLMaps.route(map, coords, { el: el });
        TRMNLMaps.dot(map, coords[0], { el: el, id: "start" });
        TRMNLMaps.dot(map, coords[coords.length - 1], { el: el, id: "end", hollow: true });
      });
      // fit() frames the run on an integer zoom, no animation. Padding only frames
      // the camera it computes, so more of it on the side the card covers leaves
      // the route in the strip that is left.
      var gutter = TRMNLPaint.px(20, { el: el });
      var card = document.getElementById("strava-card");
      TRMNLMaps.fit(map, coords, {
        padding: { top: gutter, right: gutter, bottom: gutter, left: card.offsetLeft + card.offsetWidth + gutter },
        maxZoom: 15
      });
      return map;
    });
  });
</script>
```

 Previous  [ 

## Chart

Visualize data with charts that adapt to the device and theme

 ](/framework/docs/3.4/chart)

 Next  [ 

## Progress

Display progress bars in different styles

 ](/framework/docs/3.4/progress)

