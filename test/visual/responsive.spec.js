import { test } from '@playwright/test';
import { expectNoVisualErrors, expectVisualSnapshot, openVisualPage } from './support/visual-page.js';

// Every other visual fixture pins one device and one orientation, and each of
// them hardcodes screen--landscape, which the picker never emits. That is what
// let a dead landscape gate ship: the suite could not see the axis at all.
// These six cases vary size and orientation, and the landscape rows carry no
// explicit orientation class so the framework default is what gets photographed.
// sm is in the set because it is the tightest size class, the one where clamping,
// overflow and gap collapse are most likely to look wrong.
const cases = [
  'responsive-md-landscape',
  'responsive-md-portrait',
  'responsive-lg-landscape',
  'responsive-lg-portrait',
  'responsive-sm-landscape',
  'responsive-sm-portrait',
];

for (const visualId of cases) {
  test(`${visualId} renders for visual comparison`, async ({ page }, testInfo) => {
    const signals = await openVisualPage(page, '/framework/test/visual/responsive');
    await expectVisualSnapshot(page.locator(`#${visualId}`), `${visualId}.png`, testInfo);
    expectNoVisualErrors(signals);
  });
}
