import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
  runTerminalize,
} from '../support/runtime-page.js';

test('tightens structured content and reveals every authored child when the budget grows', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div id="limited-content" data-content-limiter="true" data-content-max-height="70">
        <div id="block-1">First authored block</div>
        <div id="block-2">Second authored block has enough text to need limiting</div>
        <div id="block-3">Third authored block</div>
      </div>
    `,
    css: `
      #limited-content { width: 180px; font: 16px/20px Arial, sans-serif; }
      #limited-content > div { height: 40px; margin: 0; }
    `,
  });

  await runTerminalize(page);

  const tight = await page.locator('#limited-content').evaluate((element) => ({
    limited: element.classList.contains('content--small'),
    hiddenIds: Array.from(element.querySelectorAll(':scope > [data-hidden-by-content-limiter="1"]'), (node) => node.id),
    childIds: Array.from(element.children, (node) => node.id),
  }));
  expect(tight.limited).toBe(true);
  expect(tight.hiddenIds).toContain('block-3');
  expect(tight.childIds).toEqual(['block-1', 'block-2', 'block-3']);

  await page.locator('#limited-content').evaluate((element) => {
    element.setAttribute('data-content-max-height', '200');
  });
  await runTerminalize(page);

  const roomy = await page.locator('#limited-content').evaluate((element) => ({
    limited: element.classList.contains('content--small'),
    hidden: element.querySelectorAll(':scope > [data-hidden-by-content-limiter="1"]').length,
    visibleIds: Array.from(element.children)
      .filter((node) => getComputedStyle(node).display !== 'none')
      .map((node) => node.id),
  }));
  expect(roomy).toEqual({
    limited: false,
    hidden: 0,
    visibleIds: ['block-1', 'block-2', 'block-3'],
  });
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('removes limiter-generated clamp state when text-only content has room again', async ({ page }) => {
  const original = 'Text-only limiter content must recover without turning generated clamp attributes into authored state.';
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `<div id="text-limiter" data-content-limiter="true" data-content-max-height="42">${original}</div>`,
    css: '#text-limiter { width: 150px; font: 16px/20px Arial, sans-serif; }',
  });

  await runTerminalize(page);

  const tight = await page.locator('#text-limiter').evaluate((element) => ({
    limited: element.classList.contains('content--small'),
    clamp: element.getAttribute('data-clamp'),
    clampHeight: element.getAttribute('data-clamp-max-height-px'),
  }));
  expect(tight.limited).toBe(true);
  expect(tight.clamp).not.toBeNull();
  expect(tight.clampHeight).not.toBeNull();

  await page.locator('#text-limiter').evaluate((element) => {
    element.setAttribute('data-content-max-height', '240');
  });
  await runTerminalize(page);

  expect(await page.locator('#text-limiter').evaluate((element) => ({
    text: element.textContent,
    limited: element.classList.contains('content--small'),
    clamp: element.getAttribute('data-clamp'),
    clampHeight: element.getAttribute('data-clamp-max-height-px'),
    clampOriginal: element.getAttribute('data-clamp-original'),
  }))).toEqual({
    text: original,
    limited: false,
    clamp: null,
    clampHeight: null,
    clampOriginal: null,
  });
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});
