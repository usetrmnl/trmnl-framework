import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
  runTerminalize,
} from '../support/runtime-page.js';

// The canonical Google encoded-polyline test vector.
const POLYLINE = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';

// A stand-in for a MapLibre map: the surface TRMNLMaps touches, recording what
// it is asked to do. Lives in page scope; see installFakeMap().
async function installFakeMap(page) {
  await page.evaluate(() => {
    window.__TRMNL_FAKE_MAP__ = (container, overrides) => {
      const handlers = {};
      const fake = {
        calls: { remove: 0, jumpTo: [], addImage: [], resize: 0 },
        on(name, fn) { (handlers[name] = handlers[name] || []).push(fn); return fake; },
        once(name, fn) { (handlers[name] = handlers[name] || []).push(fn); return fake; },
        fire(name, event) { (handlers[name] || []).splice(0).forEach((fn) => fn(event)); },
        remove() { fake.calls.remove += 1; fake.fire('remove'); },
        getContainer() { return container; },
        getCanvas() { return { clientWidth: 300, clientHeight: 200 }; },
        getPixelRatio() { return 1; },
        loaded() { return true; },
        areTilesLoaded() { return true; },
        hasImage(id) { return fake.calls.addImage.some((call) => call.id === id); },
        addImage(id, image, opts) { fake.calls.addImage.push({ id, width: image.width, height: image.height, opts }); },
        getStyle() { return fake.style || null; },
        getZoom() { return 13; },
        getCenter() { return { lng: -0.1276, lat: 51.5072 }; },
        jumpTo(cam) { fake.calls.jumpTo.push(cam); },
        cameraForBounds() { return { center: { lng: 1.23, lat: 4.56 }, zoom: 12.7 }; },
        resize() { fake.calls.resize += 1; },
        // Two cities, a town and a pond, as a loaded tile would answer them.
        querySourceFeatures(source, opts) {
          if (opts.sourceLayer === 'place_labels') {
            return [
              { properties: { kind: 'city', name: 'Alpha', population: 900000 }, geometry: { type: 'Point', coordinates: [10, 50] } },
              { properties: { kind: 'city', name: 'Alpha', population: 900000 }, geometry: { type: 'Point', coordinates: [10, 50] } },
              { properties: { kind: 'city', name: 'Beta', population: 400000 }, geometry: { type: 'Point', coordinates: [10.001, 50.001] } },
              { properties: { kind: 'town', name: 'Gamma', population: 20000 }, geometry: { type: 'Point', coordinates: [9.1, 49.4] } },
            ];
          }
          if (opts.sourceLayer === 'water_polygons_labels') {
            return [
              { properties: { kind: 'water', name: 'Big Lake', way_area: 900000 }, geometry: { type: 'Point', coordinates: [10.9, 50.6] } },
              { properties: { kind: 'water', name: 'Pond', way_area: 120 }, geometry: { type: 'Point', coordinates: [8, 48] } },
            ];
          }
          if (opts.sourceLayer === 'streets') {
            // One primary road across the view and one far outside it.
            return [
              { properties: { kind: 'primary' }, geometry: { type: 'LineString', coordinates: [[9.5, 49.5], [10, 50], [10.5, 50.5]] } },
              { properties: { kind: 'primary' }, geometry: { type: 'LineString', coordinates: [[40, 60], [41, 61]] } },
            ];
          }
          return [];
        },
        // A linear camera: 100 px per degree around (10, 50) at pixel (150, 100).
        project(lngLat) { return { x: 150 + (lngLat[0] - 10) * 100, y: 100 - (lngLat[1] - 50) * 100 }; },
        unproject(pt) { return { lng: 10 + (pt[0] - 150) / 100, lat: 50 - (pt[1] - 100) / 100 }; },
        getSource(id) {
          if (!fake.sources[id]) {
            fake.sources[id] = {
              setData(data) {
                // One MultiPolygon per source; count its rings and check they
                // all wind the same way (a ring wound against the rest would
                // read as a hole in the ring before it).
                const rings = data.features.flatMap((f) => (f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates.map((poly) => poly[0]) : [f.geometry.coordinates[0]]));
                const signs = new Set(rings.map((ring) => Math.sign(ring.reduce((sum, pt, i) => { const q = ring[(i + 1) % ring.length]; return sum + (pt[0] * q[1] - q[0] * pt[1]); }, 0))));
                fake.calls.setData.push({ id, features: data.features.length, rings: rings.length, windings: signs.size });
              },
            };
          }
          return fake.sources[id];
        },
        addSource(id) { fake.calls.addSource.push(id); return fake.getSource(id); },
        addLayer(layer) { fake.layers.push(layer); },
        getLayer(id) { return fake.layers.find((layer) => layer.id === id) || null; },
        // Dirty after the first addLayer, as a real style reports itself; the
        // runtime installs against getStyle() (loaded once), not this.
        isStyleLoaded() { return false; },
        triggerRepaint() {},
      };
      fake.sources = {};
      fake.layers = [];
      fake.calls.setData = [];
      fake.calls.addSource = [];
      return Object.assign(fake, overrides || {});
    };
  });
}

test('builds still-map options and a slot-painted style without MapLibre loaded', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, { html: '<div id="map-target" class="map" style="width:300px;height:200px"></div>' });
  await installFakeMap(page);

  const result = await page.evaluate(() => {
    const maps = window.TRMNLMaps;
    const paint = window.TRMNLPaint;
    const target = document.querySelector('#map-target');
    const options = maps.options({ el: target, preset: 'streets', center: [-0.1276, 51.5072], zoom: 12.6 });
    const style = options.style;
    const layer = (id) => style.layers.find((entry) => entry.id === id);
    const waterFill = paint.toMapLibre(paint.slot('map-water', { el: target }));
    const roadFill = paint.toMapLibre(paint.slot('map-road', { el: target }));
    const decoded = maps.decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
    return {
      maplibre: typeof window.maplibregl,
      options: {
        container: options.container === target,
        interactive: options.interactive,
        handlers: [options.dragPan, options.scrollZoom, options.keyboard, options.doubleClickZoom, options.touchZoomRotate, options.boxZoom, options.dragRotate, options.touchPitch, options.cooperativeGestures],
        fadeDuration: options.fadeDuration,
        trackResize: options.trackResize,
        attributionControl: options.attributionControl,
        maplibreLogo: options.maplibreLogo,
        zoom: options.zoom,
        center: options.center,
        pixelRatio: options.pixelRatio,
        preserve: options.canvasContextAttributes.preserveDrawingBuffer,
        antialias: options.canvasContextAttributes.antialias,
      },
      style: {
        version: style.version,
        source: style.sources.osm.tiles[0],
        glyphs: style.glyphs,
        ids: style.layers.map((entry) => entry.id),
        waterPaint: layer('water').paint,
        waterOpaque: Boolean(waterFill.pattern && waterFill.pattern.opaque),
        waterMatches: waterFill.pattern
          ? (waterFill.pattern.opaque
            ? layer('water').paint['fill-color'] === waterFill.pattern.keyColor
            : layer('water').paint['fill-pattern'] === waterFill.pattern.id)
          : layer('water').paint['fill-color'] === waterFill.color,
        // 1-bit: the road slot is a tile, so the road is a fill over a tile-line source
        // that the runtime widens after the tiles load, not a MapLibre line.
        roadType: layer('roads-major').type,
        roadPattern: layer('roads-major').paint['fill-pattern'],
        roadFlat: layer('roads-major').paint['fill-color'],
        roadPatternFromSlot: Boolean(roadFill.pattern) && (roadFill.pattern.opaque
          ? layer('roads-major').paint['fill-color'] === roadFill.pattern.keyColor
          : layer('roads-major').paint['fill-pattern'] === roadFill.pattern.id),
        roadSource: style.sources[layer('roads-major').source] && style.sources[layer('roads-major').source].type,
        roadCasing: layer('roads-major-casing') && layer('roads-major-casing').type,
        lineSpecs: style.metadata['trmnl:shapes'].map((spec) => spec.id),
        railType: layer('rail').type,
        railInk: layer('rail').paint['fill-color'],
        railSpec: style.metadata['trmnl:shapes'].find((spec) => spec.id === 'rail'),
        transitSpec: style.metadata['trmnl:shapes'].find((spec) => spec.id === 'transit'),
        primitives: style.layers.filter((entry) => entry.type === 'line' || entry.type === 'circle' || entry.type === 'symbol').length,
        symbols: style.layers.filter((entry) => entry.type === 'symbol').length,
        labels: style.metadata['trmnl:labels'],
        transitInk: layer('transit').paint['fill-color'],
        // Dark mode flips the land; a dash or stop takes the tile's under-field there.
        dark: (() => {
          const screen = document.querySelector('[data-runtime-test-screen]');
          screen.classList.add('screen--dark-mode');
          const darkStyle = maps.style('streets', { el: target });
          screen.classList.remove('screen--dark-mode');
          const darkLayer = (id) => darkStyle.layers.find((entry) => entry.id === id);
          return { railInk: darkLayer('rail').paint['fill-color'], transitInk: darkLayer('transit').paint['fill-color'] };
        })(),
      },
      presets: {
        outline: maps.style('outline', { el: target }).layers.map((entry) => entry.id),
        blank: maps.style('blank', { el: target }).layers.map((entry) => entry.id),
        noLabels: maps.style('streets', { el: target, labels: false }).metadata['trmnl:labels'],
        majorOnly: maps.style('streets', { el: target, labels: 'major' }).metadata['trmnl:labels'],
        noBuildings: maps.style('streets', { el: target, buildings: false }).layers.some((entry) => entry.id === 'buildings'),
        customTiles: maps.style('minimal', { el: target, tiles: { url: 'https://tiles.example.com/{z}/{x}/{y}.mvt' } }).sources.osm.tiles[0],
      },
      delegation: {
        paint: JSON.stringify(maps.paint('black', { el: target })) === JSON.stringify(paint.toMapLibre(paint.bg('black', { el: target }))),
        series: JSON.stringify(maps.series(1, 3, { el: target })) === JSON.stringify(paint.toMapLibre(paint.series(1, 3, { el: target }))),
      },
      overlays: (() => {
        const fake = window.__TRMNL_FAKE_MAP__(target);
        fake.style = style;
        maps.route(fake, [[9.5, 49.5], [10.5, 50.5]], { el: target, width: 3 });
        maps.dot(fake, [10, 50], { el: target, id: 'start', radius: 5 });
        maps.dot(fake, [10.2, 50.2], { el: target, id: 'end', radius: 5, hollow: true });
        fake.fire('idle');
        return {
          layers: fake.layers.map((layer) => layer.id),
          routePaint: fake.layers.find((layer) => layer.id === 'trmnl-route-route').paint,
          casingPaint: fake.layers.find((layer) => layer.id === 'trmnl-route-route-casing').paint,
          corePaint: fake.layers.find((layer) => layer.id === 'trmnl-dot-end-core').paint,
          setData: fake.calls.setData.filter((call) => /trmnl-(route|dot)/.test(call.id)).map((call) => call.id + ':' + call.features + '/' + call.rings + '/' + call.windings),
        };
      })(),
      tiles: maps.tiles({ url: 'x' }),
      tileSources: (() => {
        const byDefault = maps.tiles().url;
        const trmnl = maps.tiles('trmnl').url;
        const keyed = maps.tiles({ url: 'https://tiles.example.com/{z}/{x}/{y}.pbf?key={key}', key: 'a b' }).url;
        const keyIgnored = maps.tiles({ url: 'https://tiles.example.com/{z}/{x}/{y}.pbf', key: 'abc' }).url;
        window.__TRMNL_MAPS__ = { tiles: { url: 'https://host.example.com/{z}/{x}/{y}.mvt?k={key}', key: 'hostkey' } };
        const hosted = maps.tiles().url;
        const hostedStyle = maps.style('minimal', { el: target }).sources.osm.tiles[0];
        const explicitOverHost = maps.tiles('osm').url;
        window.__TRMNL_MAPS__ = { tiles: 'trmnl' };
        const hostedPreset = maps.tiles().url;
        delete window.__TRMNL_MAPS__;
        return { byDefault, trmnl, keyed, keyIgnored, hosted, hostedStyle, explicitOverHost, hostedPreset };
      })(),
      merged: maps.merge({ a: { b: 1, c: [1] }, d: 1 }, { a: { c: [2] }, e: 2 }),
      decoded: decoded.map((pair) => pair.map((n) => Number(n.toFixed(3)))),
    };
  });

  expect(result.maplibre).toBe('undefined');
  expect(result.options).toEqual({
    container: true,
    interactive: false,
    handlers: [false, false, false, false, false, false, false, false, false],
    fadeDuration: 0,
    trackResize: false,
    attributionControl: false,
    maplibreLogo: false,
    zoom: 13,
    center: [-0.1276, 51.5072],
    pixelRatio: 1,
    preserve: true,
    antialias: false,
  });
  expect(result.style.version).toBe(8);
  // The default source is TRMNL's own endpoint.
  expect(result.style.source).toBe('https://maps.trmnl.com/tiles/osm/{z}/{x}/{y}');
  expect(result.style.glyphs).toBeUndefined();
  expect(result.style.ids).toEqual(expect.arrayContaining(['background', 'ocean', 'land-farmland', 'land-green', 'land-forest', 'land-sand', 'land-rock', 'sites', 'water', 'ferries', 'buildings', 'roads-minor', 'paths', 'roads-major', 'rail', 'transit', 'boundaries']));
  // Labels are framework elements the runtime places, never MapLibre glyph text.
  expect(result.style.symbols).toBe(0);
  expect(result.style.labels).toEqual({ major: true, minor: true, water: true });
  expect(result.style.transitInk).toBe('#000000');
  // 1-bit: the water tone is a tile, and an opaque tile paints as its flat key
  // color for the dither pass to repaint, so the layer names no MapLibre pattern.
  // MapLibre cannot sample one onto the pixel grid at a fractional device ratio.
  expect(result.style.waterOpaque).toBe(true);
  expect(result.style.waterPaint['fill-pattern']).toBeUndefined();
  expect(result.style.waterPaint['fill-color']).toMatch(/^rgb\(/);
  expect(result.style.waterMatches).toBe(true);
  expect(result.style.roadType).toBe('fill');
  expect(result.style.roadPattern).toBeUndefined();
  expect(result.style.roadFlat).toMatch(/^rgb\(/);
  expect(result.style.roadPatternFromSlot).toBe(true);
  expect(result.style.roadSource).toBe('geojson');
  expect(result.style.roadCasing).toBe('fill');
  expect(result.style.lineSpecs).toEqual(expect.arrayContaining(['roads-major', 'roads-minor', 'water-lines', 'rail', 'paths', 'boundaries', 'transit']));
  // A dashed line cannot carry a pattern, so rail takes the tile's ink: the 1-bit
  // tile's black, never its white under-field (which painted rails invisible once).
  // Dashed lines and stops are shapes too: a dashed shape in the ink, a point shape with a casing.
  expect(result.style.railType).toBe('fill');
  expect(result.style.railInk).toBe('#000000');
  expect(result.style.dark.railInk).toBe('rgb(255, 255, 255)');
  expect(result.style.dark.transitInk).toBe('rgb(255, 255, 255)');
  expect(result.style.railSpec).toMatchObject({ kind: 'line', dash: [3, 2] });
  expect(result.style.transitSpec).toMatchObject({ kind: 'point', casing: 'trmnl-shape-transit-casing' });
  // Nothing MapLibre draws itself: no line, circle or symbol layer anywhere.
  expect(result.style.primitives).toBe(0);
  expect(result.presets.outline).toEqual(['background', 'ocean', 'water', 'roads-major-casing', 'roads-major', 'boundaries']);
  expect(result.presets.blank).toEqual(['background']);
  expect(result.presets.noLabels).toEqual({ major: false, minor: false, water: false });
  expect(result.presets.majorOnly).toEqual({ major: true, minor: false, water: false });
  expect(result.presets.noBuildings).toBe(false);
  expect(result.presets.customTiles).toBe('https://tiles.example.com/{z}/{x}/{y}.mvt');
  expect(result.delegation).toEqual({ paint: true, series: true });
  // route() and dot() add casing + shape fill layers and widen them on idle.
  expect(result.overlays.layers).toEqual(['trmnl-route-route-casing', 'trmnl-route-route', 'trmnl-dot-start-casing', 'trmnl-dot-start', 'trmnl-dot-end-casing', 'trmnl-dot-end', 'trmnl-dot-end-core']);
  expect(result.overlays.routePaint['fill-color']).toMatch(/^(rgb|#)/);
  expect(result.overlays.routePaint['fill-antialias']).toBe(false);
  expect(result.overlays.casingPaint['fill-color']).toMatch(/^rgb/);
  expect(result.overlays.corePaint['fill-color']).toBe(result.overlays.casingPaint['fill-color']);
  // One MultiPolygon feature per source (features/rings/windings): a two-point
  // route is a quad plus a join dot at each end, every ring wound the same way.
  expect(result.overlays.setData).toEqual(expect.arrayContaining(['trmnl-route-route:1/3/1', 'trmnl-route-route-casing:1/3/1', 'trmnl-dot-start:1/1/1', 'trmnl-dot-end-core:1/1/1']));
  expect(result.tiles.url).toBe('x');
  expect(result.tiles.glyphs).toBeUndefined();
  // Source order: the argument, then the host's per-instance source, then TRMNL's own endpoint.
  expect(result.tileSources.byDefault).toBe('https://maps.trmnl.com/tiles/osm/{z}/{x}/{y}');
  expect(result.tileSources.trmnl).toBe('https://maps.trmnl.com/tiles/osm/{z}/{x}/{y}');
  expect(result.tileSources.keyed).toBe('https://tiles.example.com/{z}/{x}/{y}.pbf?key=a%20b');
  expect(result.tileSources.keyIgnored).toBe('https://tiles.example.com/{z}/{x}/{y}.pbf');
  expect(result.tileSources.hosted).toBe('https://host.example.com/{z}/{x}/{y}.mvt?k=hostkey');
  expect(result.tileSources.hostedStyle).toBe('https://host.example.com/{z}/{x}/{y}.mvt?k=hostkey');
  expect(result.tileSources.explicitOverHost).toBe('https://vector.openstreetmap.org/shortbread_v1/{z}/{x}/{y}.mvt');
  expect(result.tileSources.hostedPreset).toBe('https://maps.trmnl.com/tiles/osm/{z}/{x}/{y}');
  expect(result.merged).toEqual({ a: { b: 1, c: [2] }, d: 1, e: 2 });
  expect(result.decoded).toEqual([[-120.2, 38.5], [-120.95, 40.7], [-126.453, 43.252]]);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('resolves map slots per mode and shapes them for MapLibre', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  const html = `
    <div id="slot-target" class="map"></div>
    <span id="swatch-water" data-map-slot="map-water"></span>
    <span id="swatch-road" data-map-slot="map-road"></span>
  `;
  const read = () => page.evaluate(() => {
    const paint = window.TRMNLPaint;
    const target = document.querySelector('#slot-target');
    const water = paint.slot('map-water', { el: target });
    const label = paint.slot('map-label', { el: target, kind: 'text' });
    const road = paint.slot('map-road', { el: target });
    const minor = paint.slot('map-road-minor', { el: target });
    const roadLine = paint.slot('map-road', { el: target, kind: 'border' });
    window.TRMNLMaps.applySwatches({ el: target });
    return {
      water: { tile: Boolean(water.url), size: water.size, color: water.color, sameAsBackdrop: water.url === paint.slot('screen-backdrop', { el: target }).url },
      waterBlue: water.color === paint.bg('blue-55', { el: target }).color && water.url === paint.bg('blue-55', { el: target }).url,
      label: { color: label.color, tile: Boolean(label.url) },
      road: { tile: Boolean(road.url), color: road.color },
      minor: { tile: Boolean(minor.url), color: minor.color },
      roadLine: { stroke: roadLine.render && roadLine.render.stroke },
      adapter: {
        water: paint.toMapLibre(water),
        road: paint.toMapLibre(road),
        black: paint.toMapLibre(paint.bg('black', { el: target })),
      },
      swatches: {
        water: document.querySelector('#swatch-water').style.backgroundImage || document.querySelector('#swatch-water').style.backgroundColor,
        road: document.querySelector('#swatch-road').style.backgroundImage || document.querySelector('#swatch-road').style.backgroundColor,
      },
    };
  });

  await mountFixture(page, { html, screenClasses: [] });
  const oneBit = await read();
  expect(oneBit.water.tile).toBe(true);
  expect(oneBit.water.size).toBe(16);
  // The rail's checkerboard, the flat fifty percent the backdrop slot takes too.
  expect(oneBit.water.sameAsBackdrop).toBe(true);
  expect(oneBit.label.color).toMatch(/^rgb/);
  // Lines are bg slots: on 1-bit a gray road is the token's tile, never a hex,
  // and the border kind finds no rail on a map slot.
  expect(oneBit.road.tile).toBe(true);
  expect(oneBit.minor.tile).toBe(true);
  expect(oneBit.roadLine.stroke).toBeNull();
  expect(oneBit.adapter.water.color).toBeNull();
  expect(oneBit.adapter.water.pattern).toMatchObject({ width: 16, height: 16, pixelRatio: 1 });
  expect(oneBit.adapter.water.pattern.id).toMatch(/^trmnl-tile-\d+$/);
  expect(oneBit.adapter.water.pattern.image).toMatch(/^data:image\/svg\+xml/);
  expect(oneBit.adapter.road.ink).toBe('#000000');
  expect(oneBit.adapter.road.pattern).toMatchObject({ width: 16, height: 16 });
  expect(oneBit.adapter.black).toEqual({ color: 'rgb(0, 0, 0)', ink: 'rgb(0, 0, 0)', pattern: null });
  expect(oneBit.swatches.water).toContain('url(');
  // A gray line slot paints its dash art; the swatch carries that tile.
  expect(oneBit.swatches.road).toMatch(/url\(|rgb/);

  await page.locator('[data-runtime-test-screen]').evaluate((screen) => {
    screen.classList.remove('screen--1bit');
    screen.classList.add('screen--4bit');
  });
  const fourBit = await read();
  expect(fourBit.water.tile).toBe(false);
  expect(fourBit.water.color).toBe('rgb(136, 136, 136)');
  expect(fourBit.road.tile).toBe(false);
  expect(fourBit.road.color).toBe('rgb(102, 102, 102)');
  // The minor road shares the water's tone on the solid rails: a line over a
  // fill, separated by the contrast casing it carries.
  expect(fourBit.minor.color).toBe('rgb(136, 136, 136)');
  expect(fourBit.adapter.water).toEqual({ color: 'rgb(136, 136, 136)', ink: 'rgb(136, 136, 136)', pattern: null });

  await page.locator('[data-runtime-test-screen]').evaluate((screen) => {
    screen.classList.remove('screen--4bit');
    screen.classList.add('screen--color-full');
  });
  const colorFull = await read();
  expect(colorFull.waterBlue).toBe(true);
  expect(colorFull.water.tile).toBe(false);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('attaches, fits, readies and settles maps, and rebuilds watched maps on a screen change', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, { html: '<div id="watched-map" class="map" style="width:300px;height:200px"></div>' });
  await installFakeMap(page);

  const attached = await page.evaluate(async () => {
    const maps = window.TRMNLMaps;
    const paint = window.TRMNLPaint;
    const container = document.querySelector('#watched-map');
    const fake = window.__TRMNL_FAKE_MAP__(container);
    fake.style = maps.style('streets', { el: container });
    maps.attach(fake, { el: container });
    const fit = maps.fit(fake, [[1, 4], [1.5, 5]], { padding: 10, maxZoom: 15 });
    // The style has loaded: every pattern the style names is decoded and added.
    fake.fire('style.load');
    // Idle: the runtime places the labels as framework elements, and ready()
    // waits for that first idle before it trusts loaded().
    fake.fire('idle');
    const roadData = fake.calls.setData.find((call) => call.id === 'trmnl-shape-roads-major');
    const roadCasingData = fake.calls.setData.find((call) => call.id === 'trmnl-shape-roads-major-casing');
    await maps.ready(fake);
    const water = paint.toMapLibre(paint.slot('map-water', { el: container })).pattern;
    const labels = Array.from(container.querySelectorAll('.map__labels .map__label')).map((node) => ({
      text: node.textContent, className: node.className, left: node.style.left, top: node.style.top,
    }));
    return {
      labels,
      roadData,
      roadCasingData,
      attribution: container.querySelector('.map__attribution') && container.querySelector('.map__attribution').textContent,
      fit,
      jumpTo: fake.calls.jumpTo,
      addImage: fake.calls.addImage,
      waterId: water && water.id,
      waterOpaque: Boolean(water && water.opaque),
      twice: maps.attach(fake, { el: container }) === fake && container.querySelectorAll('.map__attribution').length,
    };
  });
  expect(attached.attribution).toBe('© OpenStreetMap contributors');
  // The in-view road became one MultiPolygon of stroke pieces (quads plus
  // joins), the far one was skipped, and the casing mirrors it ring for ring.
  expect(attached.roadData.features).toBe(1);
  expect(attached.roadData.rings).toBeGreaterThan(2);
  expect(attached.roadData.windings).toBe(1);
  expect(attached.roadCasingData.rings).toBe(attached.roadData.rings);
  // Alpha wins its pixel over Beta (bigger city first), the duplicate Alpha is
  // folded, Gamma and Big Lake fit, the pond is too small to name.
  expect(attached.labels.map((label) => label.text)).toEqual(['Alpha', 'Gamma', 'Big Lake']);
  expect(attached.labels[0].className).toBe('map__label label text-stroke text-stroke--large');
  expect(attached.labels[1].className).toBe('map__label label label--small text-stroke text-stroke--large');
  expect(attached.labels.every((label) => /^-?\d+px$/.test(label.left) && /^-?\d+px$/.test(label.top))).toBe(true);
  expect(attached.fit.zoom).toBe(12);
  expect(attached.fit.center[0]).toBeCloseTo(1.23, 2);
  expect(attached.fit.center[1]).toBeCloseTo(4.56, 2);
  expect(attached.jumpTo[0]).toMatchObject({ zoom: 12, bearing: 0, pitch: 0 });
  // An opaque tile never reaches MapLibre as an image: the dither pass paints it
  // from the decoded art, so addImage is left for a tile with transparent gaps.
  expect(attached.addImage).toEqual([]);
  expect(attached.waterOpaque).toBe(true);
  expect(attached.twice).toBe(1);

  // settle(): a map that never goes idle times out, and terminalize reports it.
  const settled = await page.evaluate(async () => {
    const maps = window.TRMNLMaps;
    const container = document.querySelector('#watched-map');
    const stuck = window.__TRMNL_FAKE_MAP__(container, { loaded: () => false });
    maps.attach(stuck, { el: container });
    const result = await maps.settle({ maxWaitMs: 30 });
    stuck.remove();
    return result;
  });
  expect(settled).toEqual({ targets: 2, timedOut: true });

  await page.evaluate(() => { window.__TRMNL_MAPS_SETTLE_MS__ = 30; });
  await page.evaluate(() => {
    const container = document.querySelector('#watched-map');
    window.__TRMNL_STUCK_MAP__ = window.__TRMNL_FAKE_MAP__(container, { loaded: () => false });
    window.TRMNLMaps.attach(window.__TRMNL_STUCK_MAP__, { el: container });
  });
  await runTerminalize(page);
  const signals = await runtimeSignals(page);
  expect(signals.lastStats.stepNames).toContain('Wait for maps');
  expect(signals.ready).toBe(true);
  await page.evaluate(() => { window.__TRMNL_STUCK_MAP__.remove(); delete window.__TRMNL_MAPS_SETTLE_MS__; });

  // watch(): rebuild on a screen class change, remove on stop.
  await page.evaluate(() => {
    window.TRMNLMaps.supported = () => true;
    window.__TRMNL_MAP_WATCH__ = { builds: 0, maps: [] };
    window.__TRMNL_STOP_MAP_WATCH__ = window.TRMNLMaps.watch('#watched-map', () => {
      window.__TRMNL_MAP_WATCH__.builds += 1;
      const fake = window.__TRMNL_FAKE_MAP__(document.querySelector('#watched-map'));
      window.__TRMNL_MAP_WATCH__.maps.push(fake);
      return fake;
    });
  });
  const removes = () => page.evaluate(() => window.__TRMNL_MAP_WATCH__.maps.map((fake) => fake.calls.remove));
  expect(await page.evaluate(() => window.__TRMNL_MAP_WATCH__.builds)).toBe(1);
  await page.locator('[data-runtime-test-screen]').evaluate((screen) => screen.classList.add('screen--dark-mode'));
  await page.waitForFunction(() => window.__TRMNL_MAP_WATCH__.builds === 2);
  expect(await removes()).toEqual([1, 0]);
  // refresh(): every watched map is built again and settled, and no pass
  // re-runs (the rebuilt map's attach() does not re-arm terminalize, where a
  // late attach() on a READY page does).
  await page.waitForFunction(() => window.TRMNL_PLUGINS_READY === true);
  const refreshed = await page.evaluate(async () => {
    const passes = window.__TRMNL_TEST_SIGNALS__.stats.length;
    const result = await window.TRMNLMaps.refresh({ maxWaitMs: 30 });
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { result, builds: window.__TRMNL_MAP_WATCH__.builds, passesAfter: window.__TRMNL_TEST_SIGNALS__.stats.length - passes, ready: window.TRMNL_PLUGINS_READY };
  });
  expect(refreshed.builds).toBe(3);
  // Two live maps settle: the fake attached at the top of the test and the rebuilt watched one.
  expect(refreshed.result).toEqual({ targets: 2, timedOut: true });
  expect(refreshed.passesAfter).toBe(0);
  expect(refreshed.ready).toBe(true);
  expect(await removes()).toEqual([1, 1, 0]);
  await page.evaluate(() => window.__TRMNL_STOP_MAP_WATCH__());
  expect(await removes()).toEqual([1, 1, 1]);
  await page.locator('[data-runtime-test-screen]').evaluate((screen) => screen.classList.add('screen--2bit'));
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await page.evaluate(() => window.__TRMNL_MAP_WATCH__.builds)).toBe(3);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});
