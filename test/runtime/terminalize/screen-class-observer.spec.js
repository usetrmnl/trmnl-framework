import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  expectRuntimeIdle,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
} from '../support/runtime-page.js';

// The boot IIFE installs a MutationObserver on the document that watches class attributes,
// reduces every .screen element to the sorted list of its screen classes, and re-runs
// terminalize only when that signature moves (plugins.js, autoRunTerminalize). The docs
// device picker rewrites screen classes on every interaction, so the dedup is what keeps
// one picker click from fanning out into repeated layout passes.
//
// The fixture page sets __TRMNL_FRAMEWORK_PARENT_TERMINALIZE__ = false, and that early
// return skips the observer install along with the boot pass. Pinning the flag before the
// page's own script runs boots the page the way a host page boots, which is the only state
// in which this observer exists at all.
async function openObservedPage(page) {
  const browserSignals = await openRuntimePage(page, {
    beforeLoad: async (currentPage) => {
      await currentPage.addInitScript(() => {
        Object.defineProperty(window, '__TRMNL_FRAMEWORK_PARENT_TERMINALIZE__', {
          value: true,
          configurable: true,
        });
      });
    },
  });

  // If the pin ever stops holding, every assertion below would pass against a page that
  // installed no observer at all.
  expect(await page.evaluate(() => window.__TRMNL_FRAMEWORK_PARENT_TERMINALIZE__)).toBe(true);
  return browserSignals;
}

// Mounting rewrites the class attribute, and the observer has no signature on file for the
// screen yet, so it answers with one pass. Waiting that out is what lets the counts below
// start from zero. mountFixture writes `screen screen--1bit` itself, so the fixture asks
// only for the device.
async function mountAndSettle(page) {
  await mountFixture(page, {
    html: '<div class="title">Observed</div>',
    css: '[data-runtime-test-fixture] { width: 400px; height: 200px; }',
    screenClasses: ['screen--og'],
  });

  await expect
    .poll(() => page.evaluate(() => window.__TRMNL_TEST_SIGNALS__.stats.length), 'the mount pass the observer schedules')
    .toBe(1);
  await expectRuntimeIdle(page);
  await page.evaluate(() => { window.__TRMNL_TEST_SIGNALS__.stats = []; });
}

// scheduleTerminalize defers through two animation frames, so a pass the observer asked for
// is under way by the fourth; waiting for idle then lets it finish. A quiet observer leaves
// the scheduler idle across the same window and the count stays where it was.
async function passesAfter(page, mutate) {
  await page.evaluate(mutate);
  await page.evaluate(async () => {
    for (let frame = 0; frame < 4; frame += 1) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  });
  await expectRuntimeIdle(page);

  return page.evaluate(() => window.__TRMNL_TEST_SIGNALS__.stats.length);
}

test('re-terminalizes once for each screen signature change', async ({ page }) => {
  const browserSignals = await openObservedPage(page);
  await mountAndSettle(page);

  const afterOrientation = await passesAfter(page, () => {
    document.querySelector('[data-runtime-test-screen]').classList.add('screen--portrait');
  });
  expect(afterOrientation, 'adding screen--portrait').toBe(1);

  const afterBitDepth = await passesAfter(page, () => {
    const screen = document.querySelector('[data-runtime-test-screen]');
    screen.classList.remove('screen--1bit');
    screen.classList.add('screen--2bit');
  });
  expect(afterBitDepth, 'swapping the bit depth class').toBe(2);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('skips the pass when the class change leaves the screen signature alone', async ({ page }) => {
  const browserSignals = await openObservedPage(page);
  await mountAndSettle(page);

  expect(await passesAfter(page, () => {
    document.querySelector('[data-runtime-test-screen]').classList.add('debug-outline');
  }), 'a class that is not a screen class').toBe(0);

  expect(await passesAfter(page, () => {
    document.querySelector('[data-runtime-test-screen]').className = 'debug-outline screen--1bit screen screen--og';
  }), 'the same screen classes in a different order').toBe(0);

  expect(await passesAfter(page, () => {
    document.querySelector('[data-runtime-test-fixture]').classList.add('layout--row');
  }), 'a class change on an element that is not a screen').toBe(0);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});
