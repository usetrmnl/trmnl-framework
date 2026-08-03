import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
  runTerminalize,
} from '../support/runtime-page.js';

const clampText = 'Terminalize keeps the original clamp text available while fitting it into the rendered space.';

test('leaves a hidden clamp target untouched and processes it after reveal', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `<div id="hidden-clamp-host" hidden><span id="hidden-clamp" data-clamp="1">${clampText}</span></div>`,
    css: `
      #hidden-clamp-host { width: 140px; }
      #hidden-clamp { display: block; font: 16px/20px Arial, sans-serif; }
    `,
  });

  await runTerminalize(page);

  expect(await page.locator('#hidden-clamp').evaluate((element) => ({
    text: element.textContent,
    original: element.getAttribute('data-clamp-original'),
  }))).toEqual({ text: clampText, original: null });

  await page.locator('#hidden-clamp-host').evaluate((element) => { element.hidden = false; });
  await runTerminalize(page);

  const revealed = await page.locator('#hidden-clamp').evaluate((element) => ({
    text: element.textContent,
    original: element.getAttribute('data-clamp-original'),
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(revealed.original).toBe(clampText);
  expect(revealed.text).not.toBe(clampText);
  expect(revealed.text).toMatch(/\.\.\.$/);
  expect(revealed.scrollWidth).toBeLessThanOrEqual(revealed.clientWidth);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('keeps a one-line clamp within its available width', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `<div id="one-line-host"><span id="one-line-clamp" data-clamp="1">${clampText}</span></div>`,
    css: `
      #one-line-host { width: 132px; }
      #one-line-clamp { display: block; font: 16px/20px Arial, sans-serif; }
    `,
  });

  await runTerminalize(page);

  const result = await page.locator('#one-line-clamp').evaluate((element) => ({
    text: element.textContent,
    original: element.getAttribute('data-clamp-original'),
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    whiteSpace: getComputedStyle(element).whiteSpace,
  }));
  expect(result.original).toBe(clampText);
  expect(result.text).toMatch(/\.\.\.$/);
  expect(result.whiteSpace).toBe('nowrap');
  expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('counts padding and borders once around a two-line clamp', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `<span id="padded-clamp" data-clamp="2">${clampText} ${clampText}</span>`,
    css: `
      #padded-clamp {
        display: block;
        width: 180px;
        padding: 10px 8px;
        border: 2px solid black;
        font: 16px/20px Arial, sans-serif;
      }
    `,
  });

  await runTerminalize(page);

  const result = await page.locator('#padded-clamp').evaluate((element) => {
    const style = getComputedStyle(element);
    const envelope = (
      (parseFloat(style.lineHeight) * 2)
      + parseFloat(style.paddingTop)
      + parseFloat(style.paddingBottom)
      + parseFloat(style.borderTopWidth)
      + parseFloat(style.borderBottomWidth)
    );
    return {
      height: element.getBoundingClientRect().height,
      envelope,
      text: element.textContent,
      original: element.getAttribute('data-clamp-original'),
    };
  });
  expect(result.original).toBe(`${clampText} ${clampText}`);
  expect(result.text).toMatch(/\.\.\.$/);
  expect(result.height).toBeGreaterThan(44);
  expect(result.height).toBeLessThanOrEqual(result.envelope + 1);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('recovers text when widened and trims from the same original when narrowed again', async ({ page }) => {
  const original = `${clampText} ${clampText}`;
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `<div id="responsive-clamp-host"><span id="responsive-clamp" data-clamp="2">${original}</span></div>`,
    css: `
      #responsive-clamp-host { width: 130px; }
      #responsive-clamp { display: block; font: 16px/20px Arial, sans-serif; }
    `,
  });

  await runTerminalize(page);
  const narrowText = await page.locator('#responsive-clamp').textContent();

  await page.locator('#responsive-clamp-host').evaluate((element) => { element.style.width = '360px'; });
  await runTerminalize(page);
  const wideText = await page.locator('#responsive-clamp').textContent();

  await page.locator('#responsive-clamp-host').evaluate((element) => { element.style.width = '110px'; });
  await runTerminalize(page);
  const final = await page.locator('#responsive-clamp').evaluate((element) => ({
    text: element.textContent,
    original: element.getAttribute('data-clamp-original'),
  }));

  expect(wideText.length).toBeGreaterThan(narrowText.length);
  expect(final.text.length).toBeLessThan(wideText.length);
  expect(final.original).toBe(original);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

// The multi-line cache is keyed off data-clamp-cached and data-clamp-last-width read
// together. An exit that writes neither, or writes the width without the flag, leaves the
// next pass deciding against a width it never measured at.
test('leaves the same clamp cache state whether the text fits or is trimmed', async ({ page }) => {
  const long = `${clampText} ${clampText}`;
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div id="fits-host"><span id="fits-clamp" data-clamp="3">Short enough.</span></div>
      <div id="trimmed-host"><span id="trimmed-clamp" data-clamp="2">${long}</span></div>
    `,
    css: `
      #fits-host { width: 300px; }
      #trimmed-host { width: 130px; }
      #fits-clamp, #trimmed-clamp { display: block; font: 16px/20px Arial, sans-serif; }
    `,
  });

  const cacheState = (selector) => page.locator(selector).evaluate((element) => ({
    cached: element.getAttribute('data-clamp-cached'),
    lastWidth: Number(element.getAttribute('data-clamp-last-width')),
    text: element.textContent,
  }));

  await runTerminalize(page);

  // A target whose text already fits caches exactly like one that had to be trimmed.
  const fits = await cacheState('#fits-clamp');
  const trimmed = await cacheState('#trimmed-clamp');
  expect(fits.text).toBe('Short enough.');
  expect(fits.cached).toBe('true');
  expect(fits.lastWidth).toBeGreaterThan(0);
  expect(trimmed.cached).toBe('true');
  expect(trimmed.lastWidth).toBeGreaterThan(0);

  // Widening past the point where the original fits takes the fast exit. The cached
  // width has to move with it, or a later pass compares against the narrow measurement.
  await page.locator('#trimmed-host').evaluate((element) => { element.style.width = '640px'; });
  await runTerminalize(page);

  const widened = await cacheState('#trimmed-clamp');
  expect(widened.text).toBe(long);
  expect(widened.cached).toBe('true');
  expect(widened.lastWidth).toBeGreaterThan(trimmed.lastWidth);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});
