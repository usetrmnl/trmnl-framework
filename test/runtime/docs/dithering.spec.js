import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { mountFixture, openRuntimePage } from '../support/runtime-page.js';

const ditheringPath = fileURLToPath(new URL('../../../app/javascript/plugin-render/dithering.js', import.meta.url));
const WIDTH = 24;
const HEIGHT = 16;

// A deterministic source with the shapes the diffusion carries error across: a horizontal
// ramp, a solid black column and a solid white column.
function sourcePixels() {
  const pixels = [];
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      let value = Math.round((x / (WIDTH - 1)) * 255);
      if (x === 0) value = 0;
      if (x === WIDTH - 1) value = 255;
      if (y === HEIGHT - 1) value = (x % 2) * 255;
      pixels.push(value);
    }
  }
  return pixels;
}

// The same Floyd-Steinberg kernel the runtime file runs, with the accumulator held in
// ordinary JS numbers instead of a typed array. Only the storage differs, so the shipped
// buffer has to reproduce this exactly. A buffer too narrow to hold the accumulated error
// would wrap on the `+=` and diverge here.
function expectedOutput(gray) {
  const out = new Array(WIDTH * HEIGHT).fill(0);
  const err = new Array(WIDTH * HEIGHT).fill(0);

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const p = y * WIDTH + x;
      const oldPixel = (gray[p] * 0.299 + gray[p] * 0.587 + gray[p] * 0.114) + err[p];
      const newPixel = oldPixel < 128 ? 0 : 255;
      const e = oldPixel - newPixel;
      out[p] = newPixel;

      if (x + 1 < WIDTH) err[p + 1] += (e * 7) >> 4;
      if (y + 1 < HEIGHT) {
        if (x > 0) err[p + WIDTH - 1] += (e * 3) >> 4;
        err[p + WIDTH] += (e * 5) >> 4;
        if (x + 1 < WIDTH) err[p + WIDTH + 1] += (e * 1) >> 4;
      }
    }
  }
  return out;
}

test('dithers a known image to the exact Floyd-Steinberg result', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  const source = await readFile(ditheringPath, 'utf8');
  const gray = sourcePixels();

  await mountFixture(page, { html: '<div id="dither-host"></div>' });

  await page.evaluate(({ width, height, values }) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(width, height);
    values.forEach((value, index) => {
      imageData.data[index * 4] = value;
      imageData.data[index * 4 + 1] = value;
      imageData.data[index * 4 + 2] = value;
      imageData.data[index * 4 + 3] = 255;
    });
    context.putImageData(imageData, 0, 0);

    const image = document.createElement('img');
    image.className = 'image-dither';
    image.width = width;
    image.height = height;
    image.src = canvas.toDataURL('image/png');
    window.__DITHER_SOURCE_SRC__ = image.src;
    document.getElementById('dither-host').appendChild(image);
  }, { width: WIDTH, height: HEIGHT, values: gray });

  await page.addScriptTag({ content: source });
  // setup() is wired to the window load event, which fired before the script was added.
  await page.evaluate(() => window.dispatchEvent(new Event('load')));
  await expect
    .poll(() => page.evaluate(() => document.querySelector('.image-dither').src !== window.__DITHER_SOURCE_SRC__))
    .toBe(true);

  const rendered = await page.evaluate(async ({ width, height }) => {
    const image = document.querySelector('.image-dither');
    const decoded = new Image();
    decoded.src = image.src;
    await decoded.decode();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(decoded, 0, 0);
    const { data } = context.getImageData(0, 0, width, height);

    return Array.from({ length: width * height }, (_, index) => data[index * 4]);
  }, { width: WIDTH, height: HEIGHT });

  const expected = expectedOutput(gray);
  expect(rendered).toEqual(expected);
  // A one-bit result, and one that actually used both inks.
  expect(new Set(rendered)).toEqual(new Set([0, 255]));
  expect(browserSignals.pageErrors).toEqual([]);
  expect(browserSignals.consoleErrors).toEqual([]);
});
