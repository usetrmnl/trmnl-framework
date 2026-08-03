import { test } from '@playwright/test';
import { expectNoVisualErrors, expectVisualSnapshot, openVisualPage } from './support/visual-page.js';

const cases = [
  'components-typography',
  'components-text-scale',
  'components-items',
  'components-inverse',
  'components-inverse-dark',
  'components-progress',
  'components-table',
  'components-inverse-theme-black-yellow',
  'components-inverse-theme-white-red',
  'components-inverse-theme-dark',
];

for (const visualId of cases) {
  test(`${visualId} renders for visual comparison`, async ({ page }, testInfo) => {
    const signals = await openVisualPage(page, '/framework/test/visual/components');
    await expectVisualSnapshot(page.locator(`#${visualId}`), `${visualId}.png`, testInfo);
    expectNoVisualErrors(signals);
  });
}
