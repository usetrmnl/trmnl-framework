import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
  runTerminalize,
} from '../support/runtime-page.js';

test('applies responsive clamp data in size and orientation precedence order', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    screenClasses: ['screen--md', 'screen--portrait'],
    html: `
      <span id="specific" data-clamp="5" data-clamp-portrait="4" data-clamp-md="3" data-clamp-md-portrait="2">Specific</span>
      <span id="size" data-clamp="5" data-clamp-portrait="4" data-clamp-md="3">Size</span>
      <span id="portrait" data-clamp="5" data-clamp-portrait="4">Portrait</span>
      <span id="base" data-clamp="5">Base</span>
    `,
  });

  await runTerminalize(page);

  expect(await page.evaluate(() => Object.fromEntries(
    ['specific', 'size', 'portrait', 'base'].map((id) => [
      id,
      document.getElementById(id).getAttribute('data-clamp'),
    ]),
  ))).toEqual({ specific: '2', size: '3', portrait: '4', base: '5' });
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});
