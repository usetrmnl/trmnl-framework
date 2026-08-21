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
      };
      return Object.assign(fake, overrides || {});
    };
  });
}

test('builds still-map options and a slot-painted style without MapLibre loaded', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, { html: '<div id="map-target" class="map" style="width:300px;height:200px"></div>' });

  const result = await page.evaluate(() => {
    const maps = window.TRMNLMaps;
    const paint = window.TRMNLPaint;
    const target = document.querySelector('#map-target');
    const options = maps.options({ el: target, preset: 'streets', center: [-0.1276, 51.5072], zoom: 12.6 });
    const style = options.style;
    const layer = (id) => style.layers.find((entry) => entry.id === id);
    const waterFill = paint.toMapLibre(paint.slot('map-water', { el: target }));
    const roadInk = paint.toMapLibre(paint.slot('map-road', { el: target, kind: 'border' })).ink;
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
        waterMatches: waterFill.pattern
          ? layer('water').paint['fill-pattern'] === waterFill.pattern.id
          : layer('water').paint['fill-color'] === waterFill.color,
        roadMatches: layer('roads-major').paint['line-color'] === roadInk,
        roadInkIsColor: /^rgb/.test(roadInk || ''),
        labelFont: layer('place-labels-major').layout['text-font'],
        labelSize: layer('place-labels-major').layout['text-size'],
        labelInk: layer('place-labels-major').paint['text-color'],
        halo: layer('place-labels-major').paint['text-halo-color'],
      },
      presets: {
        outline: maps.style('outline', { el: target }).layers.map((entry) => entry.id),
        blank: maps.style('blank', { el: target }).layers.map((entry) => entry.id),
        noLabels: maps.style('streets', { el: target, labels: false }).layers.some((entry) => entry.type === 'symbol'),
        noBuildings: maps.style('streets', { el: target, buildings: false }).layers.some((entry) => entry.id === 'buildings'),
        customTiles: maps.style('minimal', { el: target, tiles: { url: 'https://tiles.example.com/{z}/{x}/{y}.mvt' } }).sources.osm.tiles[0],
      },
      delegation: {
        paint: JSON.stringify(maps.paint('black', { el: target })) === JSON.stringify(paint.toMapLibre(paint.bg('black', { el: target }))),
        series: JSON.stringify(maps.series(1, 3, { el: target })) === JSON.stringify(paint.toMapLibre(paint.series(1, 3, { el: target }))),
      },
      overlays: {
        path: maps.path(0, 1, { el: target, width: 3 }),
        marker: maps.marker(0, 2, { el: target }),
        label: maps.label('label', { el: target, bold: true }),
      },
      tiles: maps.tiles({ url: 'x' }),
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
  expect(result.style.source).toContain('vector.openstreetmap.org/shortbread_v1');
  expect(result.style.glyphs).toContain('{fontstack}/{range}.pbf');
  expect(result.style.ids).toEqual(expect.arrayContaining(['background', 'ocean', 'land-green', 'water', 'buildings', 'roads-minor', 'roads-major', 'rail', 'boundaries', 'place-labels-major', 'street-labels']));
  // 1-bit: gray-60 water is a dither tile, so the layer paints with a pattern.
  expect(result.style.waterPaint['fill-pattern']).toMatch(/^trmnl-tile-\d+$/);
  expect(result.style.waterMatches).toBe(true);
  expect(result.style.roadMatches).toBe(true);
  expect(result.style.roadInkIsColor).toBe(true);
  expect(result.style.labelFont).toEqual(['noto_sans_bold']);
  expect(result.style.labelSize).toBeGreaterThan(0);
  expect(result.style.labelInk).toMatch(/^rgb/);
  expect(result.style.halo).toMatch(/^rgb/);
  expect(result.presets.outline).toEqual(['background', 'ocean', 'water', 'roads-major-casing', 'roads-major', 'boundaries', 'place-labels-major']);
  expect(result.presets.blank).toEqual(['background']);
  expect(result.presets.noLabels).toBe(false);
  expect(result.presets.noBuildings).toBe(false);
  expect(result.presets.customTiles).toBe('https://tiles.example.com/{z}/{x}/{y}.mvt');
  expect(result.delegation).toEqual({ paint: true, series: true });
  expect(result.overlays.path.type).toBe('line');
  expect(result.overlays.path.paint['line-width']).toBe(3);
  // Tile inks come from the SVG fill (hex); solids from computed style (rgb).
  expect(result.overlays.path.paint['line-color']).toMatch(/^(rgb|#)/);
  expect(result.overlays.marker.type).toBe('circle');
  expect(result.overlays.marker.paint['circle-radius']).toBe(4);
  expect(result.overlays.marker.paint['circle-stroke-color']).toMatch(/^rgb/);
  expect(result.overlays.label.layout['text-font']).toEqual(['noto_sans_bold']);
  expect(result.tiles.url).toBe('x');
  expect(result.tiles.glyphs).toContain('tiles.versatiles.org');
  expect(result.merged).toEqual({ a: { b: 1, c: [2] }, d: 1, e: 2 });
  expect(result.decoded).toEqual([[-120.2, 38.5], [-120.95, 40.7], [-126.453, 43.252]]);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('resolves map slots per mode and shapes them for MapLibre', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  const html = `
    <div id="slot-target" class="map"></div>
    <span id="swatch-water" data-map-slot="map-water"></span>
    <span id="swatch-road" data-map-slot="map-road" data-map-slot-kind="border"></span>
  `;
  const read = () => page.evaluate(() => {
    const paint = window.TRMNLPaint;
    const target = document.querySelector('#slot-target');
    const water = paint.slot('map-water', { el: target });
    const label = paint.slot('map-label', { el: target, kind: 'text' });
    const road = paint.slot('map-road', { el: target, kind: 'border' });
    const minor = paint.slot('map-road-minor', { el: target, kind: 'border' });
    window.TRMNLMaps.applySwatches({ el: target });
    return {
      water: { tile: Boolean(water.url), size: water.size, color: water.color, sameAsGray60: water.url === paint.bg('gray-60', { el: target }).url && water.color === paint.bg('gray-60', { el: target }).color },
      waterBlue: water.color === paint.bg('blue-70', { el: target }).color && water.url === paint.bg('blue-70', { el: target }).url,
      label: { color: label.color, tile: Boolean(label.url) },
      road: { stroke: road.render && road.render.stroke, color: road.color },
      minor: { stroke: minor.render && minor.render.stroke },
      adapter: {
        water: paint.toMapLibre(water),
        road: paint.toMapLibre(road),
        black: paint.toMapLibre(paint.bg('black', { el: target })),
      },
      swatches: {
        water: document.querySelector('#swatch-water').style.backgroundImage || document.querySelector('#swatch-water').style.backgroundColor,
        road: document.querySelector('#swatch-road').style.backgroundColor,
      },
    };
  });

  await mountFixture(page, { html, screenClasses: [] });
  const oneBit = await read();
  expect(oneBit.water.tile).toBe(true);
  expect(oneBit.water.size).toBe(16);
  expect(oneBit.water.sameAsGray60).toBe(true);
  expect(oneBit.label.color).toMatch(/^rgb/);
  // render.stroke is the CSS-declared stroke chain read as a custom property, so
  // it stays the palette hex rather than a computed rgb().
  expect(oneBit.road.stroke).toBe('#000000');
  // The 1-bit block re-points the gray line slots to the ink.
  expect(oneBit.minor.stroke).toBe('#000000');
  expect(oneBit.adapter.water.color).toBeNull();
  expect(oneBit.adapter.water.pattern).toMatchObject({ width: 16, height: 16, pixelRatio: 1 });
  expect(oneBit.adapter.water.pattern.id).toMatch(/^trmnl-tile-\d+$/);
  expect(oneBit.adapter.water.pattern.image).toMatch(/^data:image\/svg\+xml/);
  expect(oneBit.adapter.road).toEqual({ color: 'rgb(0, 0, 0)', ink: 'rgb(0, 0, 0)', pattern: null });
  expect(oneBit.adapter.black).toEqual({ color: 'rgb(0, 0, 0)', ink: 'rgb(0, 0, 0)', pattern: null });
  expect(oneBit.swatches.water).toContain('url(');
  expect(oneBit.swatches.road).toBe('rgb(0, 0, 0)');

  await page.locator('[data-runtime-test-screen]').evaluate((screen) => {
    screen.classList.remove('screen--1bit');
    screen.classList.add('screen--4bit');
  });
  const fourBit = await read();
  expect(fourBit.water.tile).toBe(false);
  expect(fourBit.water.color).toBe('rgb(187, 187, 187)');
  expect(fourBit.minor.stroke).toBe('#555555');
  expect(fourBit.adapter.water).toEqual({ color: 'rgb(187, 187, 187)', ink: 'rgb(187, 187, 187)', pattern: null });

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
    await maps.ready(fake);
    const water = paint.toMapLibre(paint.slot('map-water', { el: container })).pattern;
    return {
      attribution: container.querySelector('.map__attribution') && container.querySelector('.map__attribution').textContent,
      fit,
      jumpTo: fake.calls.jumpTo,
      addImage: fake.calls.addImage,
      waterId: water && water.id,
      twice: maps.attach(fake, { el: container }) === fake && container.querySelectorAll('.map__attribution').length,
    };
  });
  expect(attached.attribution).toBe('© OpenStreetMap contributors');
  expect(attached.fit.zoom).toBe(12);
  expect(attached.fit.center[0]).toBeCloseTo(1.23, 2);
  expect(attached.fit.center[1]).toBeCloseTo(4.56, 2);
  expect(attached.jumpTo[0]).toMatchObject({ zoom: 12, bearing: 0, pitch: 0 });
  expect(attached.addImage.length).toBeGreaterThan(0);
  expect(attached.addImage.find((call) => call.id === attached.waterId)).toMatchObject({ width: 16, height: 16, opts: { pixelRatio: 1 } });
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
  await page.evaluate(() => window.__TRMNL_STOP_MAP_WATCH__());
  expect(await removes()).toEqual([1, 1]);
  await page.locator('[data-runtime-test-screen]').evaluate((screen) => screen.classList.add('screen--2bit'));
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await page.evaluate(() => window.__TRMNL_MAP_WATCH__.builds)).toBe(2);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});
