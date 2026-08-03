import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
  runTerminalize,
} from '../support/runtime-page.js';

const pixelText = 'Pixel-perfect text wraps into stable measured lines without leaving probes behind.';

const readPixelState = (page) => page.locator('#pixel-target').evaluate((element) => {
  const spans = Array.from(element.querySelectorAll(':scope > span'));

  return {
    html: element.innerHTML,
    text: element.textContent,
    processed: element.getAttribute('data-pixel-processed'),
    inlineWidth: element.style.width,
    spanWidths: spans.map((span) => Math.round(span.getBoundingClientRect().width)),
    hostWidth: Math.round(element.parentElement.getBoundingClientRect().width),
  };
});

const setScreenClasses = (page, classes) => page.evaluate((next) => {
  document.querySelector('[data-runtime-test-screen]').className = next.join(' ');
}, classes);

test('marks pixel-perfect text, removes measurement nodes, and stays idempotent', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `<div id="pixel-host"><div id="pixel-target" data-pixel-perfect="true">${pixelText}</div></div>`,
    css: `
      #pixel-host { width: 160px; }
      #pixel-target { width: 160px; font: 16px/20px Arial, sans-serif; }
    `,
  });
  const bodyChildrenBefore = await page.locator('body').evaluate((body) => body.children.length);

  await runTerminalize(page);
  const first = await page.locator('#pixel-target').evaluate((element) => ({
    html: element.innerHTML,
    text: element.textContent,
    processed: element.getAttribute('data-pixel-processed'),
    lines: element.querySelectorAll(':scope > span').length,
  }));
  expect(first.processed).toBe('true');
  expect(first.text).toBe(pixelText);
  expect(first.lines).toBeGreaterThan(0);
  expect(await page.locator('body > [style*="position: absolute"][style*="visibility: hidden"]').count()).toBe(0);
  expect(await page.locator('[data-has-pixel-perfect-children]').count()).toBe(0);

  await runTerminalize(page);
  const second = await page.locator('#pixel-target').evaluate((element) => ({
    html: element.innerHTML,
    text: element.textContent,
    processed: element.getAttribute('data-pixel-processed'),
  }));
  expect(second).toEqual({ html: first.html, text: pixelText, processed: 'true' });
  expect(await page.locator('body').evaluate((body) => body.children.length)).toBe(bodyChildrenBefore);
  expect(await page.locator('body > [style*="position: absolute"][style*="visibility: hidden"]').count()).toBe(0);

  const state = await runtimeSignals(page);
  expect(state.stats).toHaveLength(2);
  expect(state.stats.every((stats) => stats.stepNames.includes('Pixel-perfect fonts'))).toBe(true);
  expectNoUnexpectedErrors(browserSignals, state);
});

test('re-measures line widths after an orientation change and grows them back', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `<div id="pixel-host"><div id="pixel-target" data-pixel-perfect="true">${pixelText}</div></div>`,
    css: `
      #pixel-host { width: 320px; }
      #pixel-target { font: 16px/20px Arial, sans-serif; }
      .screen--portrait #pixel-host { width: 140px; }
    `,
  });

  await runTerminalize(page);
  const landscape = await readPixelState(page);
  expect(landscape.processed).toBe('true');
  expect(landscape.hostWidth).toBe(320);
  expect(landscape.spanWidths.length).toBeGreaterThan(0);
  expect(Math.max(...landscape.spanWidths)).toBeGreaterThan(140);

  await setScreenClasses(page, ['screen', 'screen--1bit', 'screen--portrait']);
  await runTerminalize(page);
  const portrait = await readPixelState(page);
  expect(portrait.text).toBe(pixelText);
  expect(portrait.processed).toBe('true');
  expect(portrait.hostWidth).toBe(140);
  // Every line, and the element itself, is measured against the narrow layout
  // instead of keeping the widths the landscape pass froze in.
  expect(Math.max(...portrait.spanWidths)).toBeLessThanOrEqual(141);
  expect(parseInt(portrait.inlineWidth, 10)).toBeLessThanOrEqual(141);
  expect(portrait.spanWidths.length).toBeGreaterThan(landscape.spanWidths.length);

  await setScreenClasses(page, ['screen', 'screen--1bit']);
  await runTerminalize(page);
  const restored = await readPixelState(page);
  expect(restored).toEqual(landscape);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('drops its widths when the screen switches to a bit depth it must not touch', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `<div id="pixel-host"><div id="pixel-target" data-pixel-perfect="true">${pixelText}</div></div>`,
    css: `
      #pixel-host { width: 320px; }
      #pixel-target { font: 16px/20px Arial, sans-serif; }
    `,
  });

  await runTerminalize(page);
  const oneBit = await readPixelState(page);
  expect(oneBit.processed).toBe('true');
  expect(oneBit.spanWidths.length).toBeGreaterThan(0);

  await setScreenClasses(page, ['screen', 'screen--4bit']);
  await runTerminalize(page);
  expect(await readPixelState(page)).toMatchObject({
    text: pixelText,
    processed: null,
    inlineWidth: '',
    spanWidths: [],
  });

  await setScreenClasses(page, ['screen', 'screen--1bit']);
  await runTerminalize(page);
  expect(await readPixelState(page)).toEqual(oneBit);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('reads the depth the cascade published, not the first mode class it finds', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `<div id="pixel-host"><div id="pixel-target" data-pixel-perfect="true">${pixelText}</div></div>`,
    css: `
      #pixel-host { width: 320px; }
      #pixel-target { font: 16px/20px Arial, sans-serif; }
    `,
  });

  // Grayscale class plus palette class. The palette block wins in the cascade
  // and paints solid palette inks, so _screen-paint-depth-vars publishes 4 and
  // this engine has to stand down, even though screen--2bit is still on the
  // element.
  await setScreenClasses(page, ['screen', 'screen--2bit', 'screen--color-7a']);
  await runTerminalize(page);
  // The palette ink is compared as a color, not as a spelling: a minified bundle
  // writes the shortest form of every color it ships (#FF0000 becomes red), and both
  // spellings name the same ink.
  const published = await page.evaluate(() => {
    const screen = document.querySelector('.screen');
    const probe = document.createElement('span');
    screen.appendChild(probe);
    probe.style.color = getComputedStyle(screen).getPropertyValue('--bg-red-color').trim();
    const red = getComputedStyle(probe).color;
    probe.remove();

    return { depth: getComputedStyle(screen).getPropertyValue('--framework-bit-depth').trim(), red };
  });
  expect(published).toEqual({ depth: '4', red: 'rgb(255, 0, 0)' });
  expect(await readPixelState(page)).toMatchObject({ text: pixelText, processed: null, spanWidths: [] });

  // Same grayscale class without the palette: the 2-bit rail paints and the
  // engine runs.
  await setScreenClasses(page, ['screen', 'screen--2bit']);
  await runTerminalize(page);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.screen'))
    .getPropertyValue('--framework-bit-depth').trim())).toBe('2');
  const twoBit = await readPixelState(page);
  expect(twoBit.processed).toBe('true');
  expect(twoBit.spanWidths.length).toBeGreaterThan(0);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});
