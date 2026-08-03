import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  expectStatsConsistent,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
  runTerminalize,
} from '../support/runtime-page.js';

const itemMarkup = Array.from({ length: 6 }, (_, index) => (
  `<div id="release-item-${index + 1}" class="item release-item">Item ${index + 1}</div>`
)).join('');

test('runs representative lifecycle, layout, and paint behavior from the minified runtime', async ({ page }) => {
  const browserSignals = await openRuntimePage(page, { variant: 'minified' });
  await mountFixture(page, {
    html: `
      <div class="columns release-overflow" data-overflow-cols="2" data-list-max-height="52">
        <div class="column">${itemMarkup}</div>
      </div>
      <div id="release-clamp-host"><span id="release-clamp" data-clamp="1">Minified clamp behavior keeps the rendered text inside its width.</span></div>
      <div id="release-value-host"><span id="release-value" data-value-format="true" data-value-locale="de-DE">1.234,56 €</span></div>
      <div id="release-paint-probe"></div>
    `,
    css: `
      [data-runtime-test-fixture] { align-items: flex-start; }
      .release-overflow { display: flex; width: 260px; gap: 8px; }
      .release-overflow > .column { display: flex; flex: 1 1 0; flex-direction: column; min-width: 0; gap: 0; }
      .release-item { flex: 0 0 24px; width: 100%; height: 24px; margin: 0; padding: 0; }
      #release-clamp-host { width: 130px; }
      #release-clamp { display: block; font: 16px/20px Arial, sans-serif; }
      #release-value-host { width: 260px; }
      #release-value { font: 20px/24px Arial, sans-serif; }
    `,
  });
  await page.evaluate(() => {
    window.__TRMNL_MINIFIED_ITEMS__ = Array.from(document.querySelectorAll('.release-item'));
  });

  await runTerminalize(page, 2);

  const result = await page.evaluate(() => {
    document.querySelector('[data-runtime-test-screen]').classList.add('screen--text-scale-large');
    const container = document.querySelector('.release-overflow');
    const items = Array.from(container.querySelectorAll('.release-item'));
    const clamp = document.querySelector('#release-clamp');
    const paintTarget = document.querySelector('#release-paint-probe');
    const fill = window.TRMNLPaint.bg('black', { el: paintTarget });
    const scale = window.TRMNLPaint.scale({ el: paintTarget });
    const chartFill = window.TRMNLCharts.paint('black', { el: paintTarget });
    return {
      globals: {
        terminalize: typeof window.terminalize,
        paint: typeof window.TRMNLPaint,
        charts: typeof window.TRMNLCharts,
        scale: typeof window.TRMNLPaint.scale,
        px: typeof window.TRMNLPaint.px,
      },
      overflow: {
        columns: container.querySelectorAll(':scope > .column').length,
        ids: items.map((item) => item.id),
        sameReferences: window.__TRMNL_MINIFIED_ITEMS__.every(
          (item) => document.getElementById(item.id) === item,
        ),
        visible: items.filter((item) => getComputedStyle(item).display !== 'none').length,
        hidden: items.filter((item) => getComputedStyle(item).display === 'none').length,
      },
      clamp: {
        text: clamp.textContent,
        original: clamp.getAttribute('data-clamp-original'),
        fits: clamp.scrollWidth <= clamp.clientWidth,
      },
      value: document.querySelector('#release-value').textContent,
      paint: {
        hasFill: Boolean(fill.color || fill.url),
        chartShape: chartFill == null ? 'null' : typeof chartFill,
        scale: scale.content,
        pixels: window.TRMNLPaint.px(40, { el: paintTarget }),
        textScale: scale.textModifier,
        textPixels: window.TRMNLPaint.px(40, { el: paintTarget, kind: 'text' }),
      },
    };
  });

  expect(result.globals).toEqual({
    terminalize: 'function', paint: 'object', charts: 'object', scale: 'function', px: 'function',
  });
  expect(result.overflow.columns).toBe(2);
  expect(result.overflow.ids).toEqual(Array.from({ length: 6 }, (_, index) => `release-item-${index + 1}`));
  expect(result.overflow.sameReferences).toBe(true);
  expect(result.overflow.visible).toBeGreaterThan(0);
  expect(result.overflow.hidden).toBeGreaterThan(0);
  expect(result.clamp.original).toBe('Minified clamp behavior keeps the rendered text inside its width.');
  expect(result.clamp.text).toMatch(/\.\.\.$/);
  expect(result.clamp.fits).toBe(true);
  expect(result.value).toBe('€1.234,56');
  expect(result.paint.hasFill).toBe(true);
  expect(result.paint.chartShape).not.toBe('null');
  expect(result.paint.scale).toBe(1);
  expect(result.paint.pixels).toBe(40);
  expect(result.paint.textScale).toBe(1.25);
  expect(result.paint.textPixels).toBe(50);

  const state = await runtimeSignals(page);
  expect(state.stats).toHaveLength(2);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});
