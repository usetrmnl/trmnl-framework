# Maps go-live checklist

`TRMNLMaps` renders OpenStreetMap vector tiles through MapLibre GL JS. Who
fetches the tiles, and who pays, follows the source a map resolves:

- **Default (no source named):** TRMNL's own endpoint, the `'trmnl'` preset
  (`https://maps.trmnl.com/tiles/osm/{z}/{x}/{y}`), fetched by the page itself.
  TRMNL pays; no key, no cost to the host. The `'osm'` preset stays as an
  explicit opt-in to the public OSMF Shortbread endpoint,
  `https://vector.openstreetmap.org/shortbread_v1/{z}/{x}/{y}.mvt` (Shortbread
  1.0, zoom 0 to 14). Light use only, per the OSMF usage policy.
- **A plugin's own source:** `options({ tiles: { url, key } })`, a
  `{z}/{x}/{y}` template with `{key}` filled from the key. The plugin owner's
  account pays.
- **A host-injected source:** `window.__TRMNL_MAPS__ = { tiles: { url, key } }`
  per plugin instance, which is how the platform hands a plugin author's key
  (plugin configuration) or a user's key (plugin settings) to the map; core
  decides which of the two it injects. A source named in code wins over it.
- **TRMNL's own source:** the same `'trmnl'` preset named explicitly, TRMNL's
  own Shortbread planet behind a CDN. The engine's own `/framework/tiles/{z}/{x}/{y}.mvt` route stays
  for a host that wants to proxy a source of its own from
  `Framework.tile_source_url` (a pass-through: nothing is stored in the gem, on
  disk or in a database). The
  docs site and TRMNL's own plugins use it; third-party plugins do not by
  default.

Labels need no glyph host: they are framework elements the runtime places over
the canvas, typeset by the screen itself.

The [OSMF vector tile usage policy](https://operations.osmfoundation.org/policies/vector/)
allows light use with a valid, application-specific User-Agent or Referer and
HTTP caching, forbids heavy and bulk use, and gives no SLA. The docs site is
light use. A fleet of devices refreshing map plugins is heavy use whichever
path the tiles take: a device render originates on TRMNL's workers, so every
plugin on the public default reaches OSMF from there, and the engine endpoint
with its default upstream does the same. So a map plugin that goes out to many
devices brings its own source (the plugin owner's key), or TRMNL's own source
behind `tile_source_url` carries it. This file is the list of what that takes;
the switches are configuration, not a framework release.

## Current wiring

- `TRMNLMaps.tiles()` resolves the source in order: the argument (`'osm'`,
  `'trmnl'`, or `{ url, key, preset }`), then `window.__TRMNL_MAPS__.tiles`,
  then `'osm'`. The `'trmnl'` preset is the absolute
  `https://maps.trmnl.com/tiles/osm/{z}/{x}/{y}`: a render writes its document
  into `about:blank`, which has no origin to build a relative url against, and a
  plugin on someone else's engine should not route its tiles through their
  server. A preset carries the zoom range, the attribution and a `workerUrl`
  slot for a CSP-hosted worker.
- `FrameworkTilesController` and `Framework::Tiles` (this gem) answer the route:
  a zoom and extent check, one `Net::HTTP` GET with an identifying User-Agent
  and an 8 s timeout, then the vector tile content type, the upstream gzip
  untouched, `Cache-Control: public, max-age=86400`, `Access-Control-Allow-Origin: *`,
  204 for an empty or missing tile, 502/504 (`no-store`) when the upstream
  fails. `Framework.tile_source_url` reads `config.trmnl_framework.tile_source_url`,
  then `TRMNL_FRAMEWORK_TILE_SOURCE_URL`, then the OSMF default.
- MapLibre GL JS 5.24.0 is vendored under `vendor/javascript/` and served by
  `Framework::Static` at `/framework-docs/maplibre-gl-5.24.0.js` and
  `/framework-docs/maplibre-gl-5.24.0.css`, the way Prism and jQuery are; the
  docs demos load that copy. Plugins load the same build from the mirror beside
  Highcharts, `https://trmnl.com/js/maplibre-gl/5.24.0/maplibre-gl.js` and
  `.css` (byte-identical to the npm `dist/` files; core hosts them under
  `public/js/` and rewrites `https://trmnl.com/js/` to the worker-local host at
  render time). 5.24.0 is the last release with a UMD build: MapLibre 6.x ships
  `dist/maplibre-gl.mjs` only, and a plugin loads the library with a classic
  `<script>` tag and reads `window.maplibregl`, the same contract as
  Highcharts. Moving to 6.x means a module script in every plugin and in the
  docs demo rewrite, so it is a separate decision.
- Attribution is written into every map container by `TRMNLMaps.attach()` and
  typed by `components/_map.scss`. It stays after the switch: the data is
  OpenStreetMap either way.

## Checklist (owner: core and ops)

- [x] **Decide where plugins load MapLibre from.** Decided: the mirror beside
      Highcharts. Core hosts `maplibre-gl.js`, `maplibre-gl.css` and
      `LICENSE.txt` under `public/js/maplibre-gl/5.24.0/` and the snippets name
      `https://trmnl.com/js/maplibre-gl/5.24.0/`. If the renderer or the
      previews ever send a CSP without `worker-src blob:`, serve the
      `maplibre-gl-csp.js` build and `maplibre-gl-csp-worker.js` too and set the
      preset's `workerUrl` (MapLibre reads it as `maplibregl.workerUrl`).
- [ ] **Stand up a tile source and point `tile_source_url` at it.** The style
      speaks the Shortbread 1.0 schema, so the source has to as well. Least
      effort: the VersaTiles planet (one PMTiles file in that schema, rebuilt
      regularly) on R2 or S3 behind a small PMTiles server or a Cloudflare
      Worker, for example `https://maps.trmnl.com/tiles/osm/{z}/{x}/{y}`, then
      `TRMNL_FRAMEWORK_TILE_SOURCE_URL` on trmnl.com. More control: build your
      own Shortbread tiles with Planetiler or tilemaker. A commercial provider
      only if it serves Shortbread (most serve OpenMapTiles, which would mean
      rewriting the style's layer catalog). Zoom 0 to 14 with client overzoom, a
      rebuild cadence (weekly is plenty for a still map), and a storage estimate
      for the planet. A caching proxy in front of OSMF, which is what the
      default source amounts to, is not a go-live option: the policy forbids the
      fleet's request volume whatever sits in front of it.
- [x] **Sprites and glyphs.** Confirmed: the presets use no icon sprite and no
      glyph endpoint (a 1-bit map draws no icons, and labels are framework
      elements). Host either only if a preset gains them.
- [ ] **Cache and limits.** Immutable `Cache-Control` per tile build, CDN in
      front, per-IP rate limits, a 404 for out-of-range tiles.
- [x] **Renderer** (done in core PR #4438). The screenshot service's headless browser must expose WebGL
      (`TRMNLMaps.supported()` is true; SwiftShader or ANGLE flags if there is no
      GPU), wait for `window.TRMNL_PLUGINS_READY`, which `TRMNLMaps.settle()`
      holds until every attached map is idle (6000 ms by default,
      `window.__TRMNL_MAPS_SETTLE_MS__` to tune; the renderer's own readiness
      timeout has to cover it), send an identifying User-Agent, and time out
      unreachable tiles so a plugin still renders with an empty canvas. A
      renderer that lays the page out at 1x and sets the capture pixel ratio
      afterwards (the way core's converter does) applies that capture style,
      then awaits `TRMNLMaps.refresh()`, which rebuilds every watched map for
      the new ratio and settles, and only then freezes timers and captures:
      a map sizes its canvas and its pattern images when it is built.
- [ ] **CSP and allowlists.** On the renderer and on trmnl.com plugin previews:
      `script-src` and `style-src` for `trmnl.com/js/maplibre-gl/`,
      `connect-src 'self'` for the tiles, `worker-src blob:` (or a served
      worker), `img-src data: blob:` for pattern images. Core sends no CSP today.
- [ ] **Switch TRMNL's source.** Set `config.trmnl_framework.tile_source_url`
      (or `TRMNL_FRAMEWORK_TILE_SOURCE_URL`) on every host that renders maps,
      the workers included, so the `'trmnl'` preset stops proxying OSMF. No
      framework release is involved; if the runtime's public default ever
      changes, update the disclosure set in the same commit:
      `docs/ENGINE_INTEGRATION.md`, the Open Source docs page
      (`app/views/framework/open_source.html.erb`), `README.md`, and
      `spec/requests/framework_engine_host_spec.rb`. Attribution text stays
      `© OpenStreetMap contributors`.
- [x] **Keys per plugin instance** (done in core PR #4438). Give a plugin author a place for a
      tile source and key in the plugin configuration and a user a place in the
      plugin settings, and write the winner into the plugin document as
      `window.__TRMNL_MAPS__ = { tiles: { url, key } }` (the user's key over the
      author's is the natural order). Keys stay out of markup and out of the
      framework.
- [ ] **Size the load.** `requests per day = devices with map plugins x (1440 /
      refresh minutes) x tiles per render`. An 800x480 view at zoom 13 is about
      6 tiles of 512 px, about 12 with MapLibre's buffer, about 20 on the large
      color panels. Worked example: 5,000 devices x 96 renders x 12 tiles is
      5.76M requests a day, about 67 a second on average; size for 3x bursts.
      At roughly 50 KB a tile that is about 290 GB a day at the edge before CDN
      hits, and the hit rate is high because a device refetches the same tiles
      every refresh. Fill in the real device count and plugin share before
      sizing.
- [ ] **Monitor.** Tile 5xx rate, p95 tile latency, and the renderer's
      blank-map rate.
- [ ] **Legal.** ODbL attribution on every rendered map (the docs already
      require it and `attach()` places it). Once self-hosted, the OSMF usage
      policy no longer applies; the OpenStreetMap name is used for credit only.

## Links

- OSMF vector tile usage policy: https://operations.osmfoundation.org/policies/vector/
- Shortbread schema: https://shortbread-tiles.org/schema/1.0/
- MapLibre GL JS: https://maplibre.org/maplibre-gl-js/docs/
