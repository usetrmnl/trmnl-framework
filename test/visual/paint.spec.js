import { test } from '@playwright/test';
import { expectNoVisualErrors, expectVisualSnapshot, openVisualPage } from './support/visual-page.js';

const cases = [
  'paint-1bit',
  'paint-1bit-dark',
  'paint-2bit',
  'paint-2bit-dark',
  'paint-preview-white',
  'paint-color-4bwry',
  'paint-color-7a',
  'paint-theme-black-yellow',
  'paint-theme-white-red',
  'paint-theme-dark',
  'paint-theme-dark-1bit',
  'paint-theme-dark-2bit',
];

for (const visualId of cases) {
  test(`${visualId} renders for visual comparison`, async ({ page }, testInfo) => {
    const signals = await openVisualPage(page, '/framework/test/visual/paint');
    await expectVisualSnapshot(page.locator(`#${visualId}`), `${visualId}.png`, testInfo);
    expectNoVisualErrors(signals);
  });
}
