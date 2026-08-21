# Maps go-live checklist

`TRMNLMaps` renders OpenStreetMap vector tiles through MapLibre GL JS. While the
feature is in development, the `osm` tile preset in
`app/javascript/plugin-render/plugins.js` points at a community server:

- Tiles: `https://vector.openstreetmap.org/shortbread_v1/{z}/{x}/{y}.mvt`
  (OSMF, Shortbread 1.0 schema, zoom 0 to 14)

Labels need no glyph host: they are framework elements the runtime places over
the canvas, typeset by the screen itself.

The [OSMF vector tile usage policy](https://operations.osmfoundation.org/policies/vector/)
allows light use with a valid, application-specific User-Agent or Referer and
HTTP caching, forbids heavy and bulk use, and gives no SLA. The docs site is
light use. A fleet of devices refreshing map plugins is heavy use. So nothing
ships a map plugin to devices until TRMNL hosts tiles itself, and the preset
points there. This file is the list of what that takes.

## Current wiring

- `TRMNLMaps.tiles()` carries the preset: URL, zoom range, attribution, and a
  `workerUrl` slot for a CSP-hosted worker. The go-live switch is one edit to
  that preset, plus the disclosure set below.
- MapLibre GL JS 5.24.0 is vendored under `vendor/javascript/` and served by
  `Framework::Static` at `/framework-docs/maplibre-gl-5.24.0.js` and
  `/framework-docs/maplibre-gl-5.24.0.css`, the way Prism and jQuery are. The
  docs page and every snippet name that root-relative path today, so it
  resolves on `bin/dev` and on any host that mounts the engine (trmnl.com
  included) without a separate upload. 5.24.0 is the last release with a UMD
  build: MapLibre 6.x ships `dist/maplibre-gl.mjs` only, and a plugin loads the
  library with a classic `<script>` tag and reads `window.maplibregl`, the same
  contract as Highcharts. Moving to 6.x means a module script in every plugin
  and in the docs demo rewrite, so it is a separate decision.
- Attribution is written into every map container by `TRMNLMaps.attach()` and
  typed by `components/_map.scss`. It stays after the switch: the data is
  OpenStreetMap either way.

## Checklist (owner: core and ops)

- [ ] **Decide where plugins load MapLibre from.** Today the engine serves the
      vendored copy at `/framework-docs/maplibre-gl-5.24.0.js`, which a plugin
      rendered by a host that mounts the engine can reach root-relative. If the
      library should instead sit beside Highcharts on the CDN, upload
      `maplibre-gl.js`, `maplibre-gl.css` and the BSD LICENSE to
      `trmnl.com/js/maplibre-gl/5.24.0/` with long-lived immutable cache headers
      and the same CORS setup, then repoint the docs snippets. If the renderer or
      the previews send a CSP without `worker-src blob:`, serve the
      `maplibre-gl-csp.js` build and `maplibre-gl-csp-worker.js` too and set the
      preset's `workerUrl` (MapLibre reads it as `maplibregl.workerUrl`).
- [ ] **Stand up a tile host.** Self-hosted Shortbread 1.0 tiles, built with
      tilemaker (the Shortbread config) or Planetiler, or the VersaTiles planet
      build, served as PMTiles or MBTiles behind a CDN at a TRMNL host, for
      example `tiles.trmnl.com/shortbread_v1/{z}/{x}/{y}.mvt`. Zoom 0 to 14 with
      client overzoom, a rebuild cadence (weekly is plenty for a still map), and
      a storage estimate for the planet. A caching proxy in front of OSMF is not
      a go-live option: the policy forbids the fleet's request volume whatever
      sits in front of it.
- [ ] **Sprites and glyphs.** Confirm the presets use no icon sprite and no
      glyph endpoint (they do not today: a 1-bit map draws no icons, and labels
      are framework elements). Host either only if a preset gains them.
- [ ] **Cache and limits.** Immutable `Cache-Control` per tile build, CDN in
      front, per-IP rate limits, a 404 for out-of-range tiles.
- [ ] **Renderer.** The screenshot service's headless browser must expose WebGL
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
      `script-src` and `style-src` for wherever MapLibre is served from,
      `connect-src` for the tile host, `worker-src blob:` (or a served worker),
      `img-src data: blob:` for pattern images.
- [ ] **Switch the preset.** Edit the `osm` preset in `plugins.js`, then update
      the disclosure set in the same commit: `docs/ENGINE_INTEGRATION.md`, the
      Open Source docs page (`app/views/framework/open_source.html.erb`),
      `README.md`, and the origin list in
      `spec/requests/framework_engine_host_spec.rb`. Attribution text stays
      `© OpenStreetMap contributors`.
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
