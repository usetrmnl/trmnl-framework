import { expect } from '@playwright/test';
import {
  defaultRuntimeVariant,
  routeProcessedAssets,
  runtimeBody,
} from '../../support/processed-bundle.js';

export async function openRuntimePage(page, options = {}) {
  const pageErrors = [];
  const consoleErrors = [];
  const variant = options.variant || defaultRuntimeVariant();

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.addInitScript(() => {
    window.__TRMNL_TEST_SIGNALS__ = { stats: [], errors: [], rejections: [] };
    window.addEventListener('trmnl:terminalize:stats', (event) => {
      window.__TRMNL_TEST_SIGNALS__.stats.push(structuredClone(event.detail));
    });
    window.addEventListener('error', (event) => {
      window.__TRMNL_TEST_SIGNALS__.errors.push(event.message);
    });
    window.addEventListener('unhandledrejection', (event) => {
      window.__TRMNL_TEST_SIGNALS__.rejections.push(String(event.reason));
    });
  });
  if (options.beforeLoad) await options.beforeLoad(page);
  const body = await runtimeBody(variant);
  await page.route('**/__runtime-test__/plugins.js', (route) => route.fulfill({
    body,
    contentType: 'application/javascript',
  }));
  // The page links the live bundle; in processed mode this swaps in the released
  // bytes underneath it, so the fixture markup and the assertions stay identical.
  await routeProcessedAssets(page);
  await page.goto('/framework/test/runtime');
  await page.waitForFunction(() => typeof window.terminalize === 'function');
  await page.evaluate(() => document.fonts.ready);

  return { pageErrors, consoleErrors };
}

export async function mountFixture(page, { html = '', css = '', screenClasses = [] } = {}) {
  await page.evaluate(({ fixtureHtml, fixtureCss, classes }) => {
    const fixture = document.querySelector('[data-runtime-test-fixture]');
    const screen = document.querySelector('[data-runtime-test-screen]');
    let style = document.querySelector('#runtime-test-fixture-style');

    if (!style) {
      style = document.createElement('style');
      style.id = 'runtime-test-fixture-style';
      document.head.appendChild(style);
    }

    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
      ${fixtureCss}
    `;
    screen.className = ['screen', 'screen--1bit', ...classes].join(' ');
    fixture.innerHTML = fixtureHtml;
    window.__TRMNL_TEST_SIGNALS__.stats = [];
    window.__TRMNL_TEST_SIGNALS__.errors = [];
    window.__TRMNL_TEST_SIGNALS__.rejections = [];
    window.__TRMNL_LAST_STATS__ = undefined;
  }, { fixtureHtml: html, fixtureCss: css, classes: screenClasses });

  await page.evaluate(() => document.fonts.ready);
}

export async function runTerminalize(page, count = 1, { concurrent = false } = {}) {
  await page.evaluate(async ({ runCount, runConcurrently }) => {
    const calls = Array.from({ length: runCount }, () => () => window.terminalize());
    if (runConcurrently) {
      await Promise.all(calls.map((call) => call()));
    } else {
      for (const call of calls) await call();
    }
  }, { runCount: count, runConcurrently: concurrent });

  await expectRuntimeIdle(page);
}

export async function expectRuntimeIdle(page) {
  await expect.poll(() => page.evaluate(() => ({
    ready: window.TRMNL_PLUGINS_READY,
    pending: window.__terminalizeScheduler?.pending ?? false,
    inFlight: Boolean(window.__terminalizeScheduler?.inFlight),
    dirty: window.__terminalizeScheduler?.dirty ?? false,
  }))).toEqual({
    ready: true,
    pending: false,
    inFlight: false,
    dirty: false,
  });
}

export async function runtimeSignals(page) {
  return page.evaluate(() => {
    const scheduler = window.__terminalizeScheduler || {};
    const lastStats = window.__TRMNL_LAST_STATS__ || null;

    return {
      ready: window.TRMNL_PLUGINS_READY,
      scheduler: {
        pending: Boolean(scheduler.pending),
        inFlight: Boolean(scheduler.inFlight),
        dirty: Boolean(scheduler.dirty),
      },
      stats: window.__TRMNL_TEST_SIGNALS__.stats.map((stats) => ({
        engineCount: stats.engineCount,
        engineNames: stats.engines.map((engine) => engine.name),
        stepNames: stats.steps.map((step) => step.name),
        errors: stats.errors || [],
      })),
      errors: [...window.__TRMNL_TEST_SIGNALS__.errors],
      rejections: [...window.__TRMNL_TEST_SIGNALS__.rejections],
      lastStats: lastStats ? {
        engineCount: lastStats.engineCount,
        engineNames: lastStats.engines.map((engine) => engine.name),
        stepNames: lastStats.steps.map((step) => step.name),
        errors: lastStats.errors || [],
      } : null,
    };
  });
}

export function expectNoUnexpectedErrors(browserSignals, runtimeState) {
  expect(browserSignals.pageErrors).toEqual([]);
  expect(browserSignals.consoleErrors).toEqual([]);
  expect(runtimeState.errors).toEqual([]);
  expect(runtimeState.rejections).toEqual([]);
}

export function expectStatsConsistent(runtimeState) {
  expect(runtimeState.lastStats).not.toBeNull();
  expect(runtimeState.lastStats.engineCount).toBe(runtimeState.lastStats.engineNames.length);
}
