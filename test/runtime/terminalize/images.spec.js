import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  expectRuntimeIdle,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
  runTerminalize,
} from '../support/runtime-page.js';

const iconDataUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Crect width='4' height='4' fill='black'/%3E%3C/svg%3E";

test('waits for a delayed local image before completing layout work', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  let releaseResponse;
  let markRequested;
  const requested = new Promise((resolve) => { markRequested = resolve; });
  const release = new Promise((resolve) => { releaseResponse = resolve; });

  await page.route('**/__runtime-test__/delayed.svg', async (route) => {
    markRequested();
    await release;
    await route.fulfill({
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6"><rect width="8" height="6"/></svg>',
      contentType: 'image/svg+xml',
    });
  });
  await mountFixture(page, {
    html: '<img id="delayed-image" src="/__runtime-test__/delayed.svg" alt="">',
  });
  await requested;

  await page.evaluate(() => { window.__TRMNL_DELAYED_RUN__ = window.terminalize(); });
  await page.waitForFunction(() => window.TRMNL_PLUGINS_READY === false);
  expect(await page.evaluate(() => window.__TRMNL_TEST_SIGNALS__.stats.length)).toBe(0);

  releaseResponse();
  await page.evaluate(() => window.__TRMNL_DELAYED_RUN__);
  await expectRuntimeIdle(page);

  expect(await page.locator('#delayed-image').evaluate((image) => ({
    complete: image.complete,
    width: image.naturalWidth,
    height: image.naturalHeight,
  }))).toEqual({ complete: true, width: 8, height: 6 });
  const state = await runtimeSignals(page);
  expect(state.stats).toHaveLength(1);
  expect(state.lastStats.stepNames).toContain('Wait for images');
  expectNoUnexpectedErrors(browserSignals, state);
});

test('settles a broken local image without hanging the pass', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await page.route('**/__runtime-test__/broken.png', (route) => route.fulfill({
    body: 'not a valid image',
    contentType: 'image/png',
  }));
  await mountFixture(page, {
    html: '<img id="broken-image" src="/__runtime-test__/broken.png" alt="">',
  });

  await runTerminalize(page);

  expect(await page.locator('#broken-image').evaluate((image) => ({
    complete: image.complete,
    width: image.naturalWidth,
  }))).toEqual({ complete: true, width: 0 });
  const state = await runtimeSignals(page);
  expect(state.stats).toHaveLength(1);
  expect(state.lastStats.stepNames).toContain('Wait for images');
  expectNoUnexpectedErrors(browserSignals, state);
});

test('arms adaptive images and wraps a title-bar icon only once', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <img id="body-icon" class="image--adaptive" src="${iconDataUrl}" alt="">
      <div class="title_bar">
        <img id="title-icon" class="image image--adaptive" src="${iconDataUrl}" alt="">
        <span class="title">Adaptive icon</span>
      </div>
    `,
  });

  await runTerminalize(page, 2);

  const result = await page.evaluate(() => {
    const titleIcon = document.querySelector('#title-icon');
    const bodyIcon = document.querySelector('#body-icon');
    return {
      hosts: document.querySelectorAll('.image--adaptive-host').length,
      titleParentClass: titleIcon.parentElement.className,
      bodyParentIsHost: bodyIcon.parentElement.classList.contains('image--adaptive-host'),
      armed: [titleIcon.dataset.adaptive, bodyIcon.dataset.adaptive],
      sources: [titleIcon, bodyIcon].map((image) => image.style.getPropertyValue('--framework-icon-src')),
    };
  });
  expect(result.hosts).toBe(1);
  expect(result.titleParentClass).toBe('image--adaptive-host');
  expect(result.bodyParentIsHost).toBe(false);
  expect(result.armed).toEqual(['true', 'true']);
  expect(result.sources.every((source) => source.startsWith('url("data:image/svg+xml'))).toBe(true);

  const state = await runtimeSignals(page);
  expect(state.stats).toHaveLength(2);
  expect(state.stats.every((stats) => stats.engineNames.includes('Adaptive images'))).toBe(true);
  expectNoUnexpectedErrors(browserSignals, state);
});
