import { expect, test } from '@playwright/test';
import { frameworkBundleFile, readBuild } from '../../support/processed-bundle.js';

async function renderCard(page, { art, bits, corners, extraClass = '' }) {
  await page.setContent(`<html><head><style>${await readBuild(frameworkBundleFile())}</style>
    <style>
      body { margin: 0; background: white; }
      .screen { visibility: visible; --ui-scale: 1; --dither-ratio: 1;
        --framework-layout-corner-factor: ${corners}; }
      .layout { width: 200px; height: 100px; }
      .item { width: 160px; height: 64px;
        --framework-slot-item-border-art: var(--framework-item-border-art-${art});
        --framework-slot-item-border-radius: var(--framework-item-border-radius-${art}); }
    </style></head><body class="trmnl">
    <div class="screen screen--${bits}bit"><div class="layout">
      <div class="item ${extraClass}"><div class="content"></div></div>
    </div></div></body></html>`);
  return page.locator('.item').screenshot();
}

async function readPixels(page, screenshot, points) {
  return page.evaluate(async ({ data, points }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    return points.map(([x, y]) => [...context.getImageData(x, y, 1, 1).data]);
  }, { data: screenshot.toString('base64'), points });
}

for (const bits of [1, 4]) {
  for (const corners of [0, 1, 2]) {
    test(`keeps all bracket tips at ${bits}-bit with corner factor ${corners}`, async ({ page }, testInfo) => {
      const screenshot = await renderCard(page, { art: 'corner-brackets', bits, corners });
      await testInfo.attach('card', { body: screenshot, contentType: 'image/png' });
      const points = [[0, 0], [159, 0], [0, 63], [159, 63]];
      expect(await readPixels(page, screenshot, points)).toEqual(points.map(() => [0, 0, 0, 255]));
    });
  }
}

test('keeps dotted outline corners when the theme increases corner rounding', async ({ page }, testInfo) => {
  const screenshot = await renderCard(page, { art: 'outline', bits: 1, corners: 2 });
  await testInfo.attach('card', { body: screenshot, contentType: 'image/png' });
  const points = [[8, 0], [4, 1], [1, 4], [0, 8]];
  expect(await readPixels(page, screenshot, points)).toEqual(points.map(() => [0, 0, 0, 255]));
});

test('keeps the solid outline rounded on grayscale screens', async ({ page }) => {
  const screenshot = await renderCard(page, { art: 'outline', bits: 4, corners: 1 });
  expect(await readPixels(page, screenshot, [[0, 0], [80, 0], [0, 32]])).toEqual([
    [255, 255, 255, 255], [0, 0, 0, 255], [0, 0, 0, 255],
  ]);
});

test('keeps an item horizontal border utility on its bottom edge', async ({ page }) => {
  const screenshot = await renderCard(page, { bits: 1, corners: 1, extraClass: 'border--h-black' });
  expect(await readPixels(page, screenshot, [[80, 0], [80, 63]])).toEqual([
    [255, 255, 255, 255], [0, 0, 0, 255],
  ]);
});
