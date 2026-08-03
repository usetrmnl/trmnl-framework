import { test } from '@playwright/test';
import { expectNoVisualErrors, expectVisualSnapshot, openVisualPage } from './support/visual-page.js';

const cases = [
  'borders-1bit',
  'borders-1bit-dark',
  'borders-2bit',
  'borders-color-4bwry',
  'borders-theme-black-yellow',
  'borders-theme-white-red',
  'borders-theme-dark',
  'borders-theme-dark-1bit',
  'borders-theme-dark-2bit',
  // A bit-depth class beside a palette class: the palette rail paints, so the
  // theme's 2-bit level mirror must stay off this screen.
  'borders-theme-dark-2bit-color-7a',
];

for (const visualId of cases) {
  test(`${visualId} renders for visual comparison`, async ({ page }, testInfo) => {
    const signals = await openVisualPage(page, '/framework/test/visual/borders');
    await expectVisualSnapshot(page.locator(`#${visualId}`), `${visualId}.png`, testInfo);
    expectNoVisualErrors(signals);
  });
}
