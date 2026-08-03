import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  expectRuntimeIdle,
  expectStatsConsistent,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
  runTerminalize,
} from '../support/runtime-page.js';

test('exposes documented globals, keeps helpers private, and does not auto-run', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);

  const globals = await page.evaluate(() => ({
    terminalize: typeof window.terminalize,
    executeTerminalize: typeof window.executeTerminalize,
    markFrameworkReady: typeof window.markFrameworkReady,
    paint: typeof window.TRMNLPaint,
    charts: typeof window.TRMNLCharts,
    privateHelpers: [
      typeof window.adjustGridGaps,
      typeof window.clampElementToLines,
      typeof window.fitValue,
    ],
    ready: window.TRMNL_PLUGINS_READY,
    stats: window.__TRMNL_TEST_SIGNALS__.stats.length,
  }));

  expect(globals).toEqual({
    terminalize: 'function',
    executeTerminalize: 'function',
    markFrameworkReady: 'function',
    paint: 'object',
    charts: 'object',
    privateHelpers: ['undefined', 'undefined', 'undefined'],
    ready: true,
    stats: 0,
  });
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('serializes simultaneous terminalize calls into one dirty rerun', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page);

  await runTerminalize(page, 3, { concurrent: true });

  const state = await runtimeSignals(page);
  expect(state.stats).toHaveLength(2);
  for (const stats of state.stats) {
    expect(stats.engineCount).toBe(stats.engineNames.length);
  }
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});

test('keeps readiness false until deferred pixel-perfect work finishes', async ({ page }) => {
  const browserSignals = await openRuntimePage(page, {
    beforeLoad: async (currentPage) => {
      await currentPage.addInitScript(() => {
        window.__TRMNL_IDLE_CALLBACKS__ = [];
        window.requestIdleCallback = (callback) => {
          window.__TRMNL_IDLE_CALLBACKS__.push(callback);
          return window.__TRMNL_IDLE_CALLBACKS__.length;
        };
        window.__TRMNL_RELEASE_IDLE__ = () => {
          const callbacks = window.__TRMNL_IDLE_CALLBACKS__.splice(0);
          callbacks.forEach((callback) => callback({ didTimeout: false, timeRemaining: () => 16 }));
        };
      });
    },
  });
  await mountFixture(page, {
    html: '<div class="title" data-pixel-perfect="true">Deferred text</div>',
    css: '[data-runtime-test-fixture] { width: 400px; height: 200px; }',
  });

  await page.evaluate(() => {
    window.__TRMNL_PENDING_RUN__ = window.terminalize();
  });
  await page.waitForFunction(() => window.__TRMNL_IDLE_CALLBACKS__.length > 0);

  expect(await page.evaluate(() => ({
    ready: window.TRMNL_PLUGINS_READY,
    stats: window.__TRMNL_TEST_SIGNALS__.stats.length,
  }))).toEqual({ ready: false, stats: 0 });

  await page.evaluate(async () => {
    window.__TRMNL_RELEASE_IDLE__();
    await window.__TRMNL_PENDING_RUN__;
  });
  await expectRuntimeIdle(page);

  const state = await runtimeSignals(page);
  expect(state.stats).toHaveLength(1);
  expect(state.lastStats.stepNames).toContain('Pixel-perfect fonts');
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});

test('records an engine failure and continues through later engines', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div class="grid grid--cols-2" data-fault-gap>
        <div>One</div><div>Two</div>
      </div>
      <div class="columns"><div class="column">Later engine target</div></div>
    `,
    css: `
      [data-fault-gap] { display: grid; grid-template-columns: repeat(2, 1fr); width: 201px; gap: 10px; }
      .columns { display: flex; width: 201px; gap: 10px; }
      .column { flex: 1 1 0; }
    `,
  });
  await page.evaluate(() => {
    const original = window.getComputedStyle.bind(window);
    let shouldThrow = true;
    window.getComputedStyle = (element, pseudoElement) => {
      if (shouldThrow && element?.matches?.('[data-fault-gap]')) {
        shouldThrow = false;
        throw new Error('injected grid gap failure');
      }
      return original(element, pseudoElement);
    };
  });

  await runTerminalize(page);

  const state = await runtimeSignals(page);
  expect(state.stats).toHaveLength(1);
  expect(state.lastStats.errors).toEqual([
    { engine: 'Adjust grid gaps', message: 'injected grid gap failure' },
  ]);
  expect(state.lastStats.stepNames).toContain('Adjust column gaps');
  expect(state.ready).toBe(true);
  expect(state.errors).toEqual([]);
  expect(state.rejections).toEqual([]);
  expect(browserSignals.pageErrors).toEqual([]);
  expect(browserSignals.consoleErrors).toHaveLength(1);
  expect(browserSignals.consoleErrors[0]).toContain('Terminalize Adjust grid gaps failed');
});

test('renders quietly unless the page opts into debug logging', async ({ page }) => {
  const logs = [];
  page.on('console', (message) => { if (message.type() === 'log') logs.push(message.text()); });

  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div class="grid grid--cols-3" data-chatty-grid><div>One</div><div>Two</div><div>Three</div></div>
      <div id="limited" class="content" data-content-limiter="true" data-content-max-height="20">
        <span class="description">Content well past the twenty pixel budget this limiter was given.</span>
      </div>
    `,
    css: `
      [data-chatty-grid] { display: grid; grid-template-columns: repeat(3, 1fr); width: 401px; gap: 10px; }
      #limited { width: 200px; font: 16px/20px Arial, sans-serif; }
    `,
  });

  await runTerminalize(page);
  expect(logs).toEqual([]);

  await page.evaluate(() => { window.__TRMNL_DEBUG__ = true; });
  await runTerminalize(page);
  expect(logs.length).toBeGreaterThan(0);
  expect(logs.some((line) => line.includes('gap adjustment'))).toBe(true);

  const state = await runtimeSignals(page);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});

test('collapses readiness triggers into one scheduled pass', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page);

  await page.evaluate(() => {
    window.__TRMNL_FRAMEWORK_PARENT_TERMINALIZE__ = true;
    window.executeTerminalize();
    window.executeTerminalize();
    window.executeTerminalize();
    window.markFrameworkReady();
  });
  await page.waitForFunction(() => window.__TRMNL_TEST_SIGNALS__.stats.length === 1);
  await expectRuntimeIdle(page);

  const state = await runtimeSignals(page);
  expect(state.stats).toHaveLength(1);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});
