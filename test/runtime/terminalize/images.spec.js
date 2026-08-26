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

test.describe('arming an adaptive icon', () => {
  const iconPath = '/__runtime-test__/icon.svg';
  const otherOrigin = 'https://icons.example.test/icon.svg';

  // Counts any read of the icon back over fetch(), which is how arming used to inline it.
  const armIcon = async (page, src) => {
    const browserSignals = await openRuntimePage(page);
    await mountFixture(page, {
      html: `<img id="icon" class="image--adaptive" src="${src}" alt="">`,
    });
    await page.evaluate((url) => {
      window.__iconFetches = 0;
      const realFetch = window.fetch;
      window.fetch = function (...args) {
        if (String(args[0]).includes(url)) window.__iconFetches += 1;
        return realFetch.apply(this, args);
      };
    }, src);

    await runTerminalize(page, 1);

    const result = await page.evaluate(() => {
      const icon = document.querySelector('#icon');
      return {
        armed: icon.dataset.adaptive,
        source: icon.style.getPropertyValue('--framework-icon-src'),
        iconFetches: window.__iconFetches,
      };
    });
    return { browserSignals, result };
  };

  test.beforeEach(async ({ page }) => {
    await page.route(`**${iconPath}`, (route) => route.fulfill({
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4"/></svg>',
      contentType: 'image/svg+xml',
    }));
    await page.route(otherOrigin, (route) => route.fulfill({
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4"/></svg>',
      contentType: 'image/svg+xml',
    }));
  });

  test('masks it with the icon url', async ({ page }) => {
    const { result } = await armIcon(page, iconPath);
    // currentSrc resolves to an absolute url, so match the path rather than the whole value.
    expect(result.source).toContain(iconPath);
  });

  test('does not copy the icon into the mask', async ({ page }) => {
    const { result } = await armIcon(page, iconPath);
    expect(result.source.startsWith('url("data:')).toBe(false);
  });

  test('does not read the icon back over the network', async ({ page }) => {
    const { result } = await armIcon(page, iconPath);
    expect(result.iconFetches).toBe(0);
  });

  test('arms an icon served from another origin', async ({ page }) => {
    const { result } = await armIcon(page, otherOrigin);
    expect(result.armed).toBe('true');
  });

  test('masks a cross-origin icon with its own url', async ({ page }) => {
    const { result } = await armIcon(page, otherOrigin);
    expect(result.source).toContain(otherOrigin);
  });

  test('reports no runtime errors while arming', async ({ page }) => {
    const { browserSignals } = await armIcon(page, iconPath);
    const state = await runtimeSignals(page);
    expectNoUnexpectedErrors(browserSignals, state);
  });
});
