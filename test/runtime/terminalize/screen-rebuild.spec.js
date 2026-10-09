import { expect, test } from '@playwright/test';
import { mountFixture, openRuntimePage, runTerminalize } from '../support/runtime-page.js';

const FIREFOX_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0';

async function countScreenRebuilds(page) {
  await page.evaluate(() => {
    window.__screenRebuilds = 0;
    new MutationObserver((records) => {
      window.__screenRebuilds += records.filter((record) => (record.oldValue || '').includes('display: none')).length;
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['style'], attributeOldValue: true });
  });
  await mountFixture(page, { html: '<div class="title">Rebuild probe</div>' });
  await runTerminalize(page);
  return page.evaluate(() => window.__screenRebuilds);
}

test.describe('in Firefox', () => {
  test.use({ userAgent: FIREFOX_USER_AGENT });

  test('skips the screen rebuild WebKit needs after fitting values', async ({ page }) => {
    await openRuntimePage(page);

    expect(await countScreenRebuilds(page)).toBe(0);
  });
});

test('rebuilds the screen in other engines after fitting values', async ({ page }) => {
  await openRuntimePage(page);

  expect(await countScreenRebuilds(page)).toBeGreaterThan(0);
});
