import { test } from '@playwright/test';
import { expectNoVisualErrors, expectVisualSnapshot, openVisualPage } from './support/visual-page.js';

const cases = [
  'composition-1bit',
  'composition-1bit-dark',
  'composition-2bit',
  'composition-color-4bwry',
  'composition-theme-black-yellow',
  'composition-theme-white-red',
  'composition-theme-dark',
  'composition-theme-dark-1bit',
];

for (const visualId of cases) {
  test(`${visualId} renders for visual comparison`, async ({ page }, testInfo) => {
    const signals = await openVisualPage(page, '/framework/test/visual/compositions');
    await expectVisualSnapshot(page.locator(`#${visualId}`), `${visualId}.png`, testInfo);
    expectNoVisualErrors(signals);
  });
}
