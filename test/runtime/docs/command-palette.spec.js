import { expect, test } from '@playwright/test';

// Skips openDocsPage: it polls for example iframes, which the docs index has none of.
const DOCS_INDEX = '/framework/docs/3.2';

const palette = (page) => page.locator('[data-controller="command-palette"]');

// The nav's search button reaches the palette through the command-palette:open event.
async function openPalette(page) {
  await page.locator('button[aria-label="Search"]:visible').first().click();
  await expect(palette(page)).toBeVisible();
}

test('searches the docs index and opens the page it lands on', async ({ page }) => {
  await page.goto(DOCS_INDEX);

  await expect.poll(() => page.evaluate(() => Boolean(
    window.Stimulus?.getControllerForElementAndIdentifier(
      document.querySelector('[data-controller="command-palette"]'), 'command-palette'
    )
  ))).toBe(true);
  await expect(palette(page)).toBeHidden();

  await openPalette(page);
  await page.keyboard.type('chart');

  const chart = page.locator('[data-command-palette-target="item"][data-key="chart"]');
  await expect(chart.first()).toBeVisible();
  // A query detaches every item it does not rank, so the rest of the index is gone.
  await expect(page.locator('[data-command-palette-target="item"][data-key="flex"]')).toBeHidden();

  await page.keyboard.press('Escape');
  await expect(palette(page)).toBeHidden();

  await openPalette(page);
  await page.keyboard.type('chart');
  await expect(chart.first()).toBeVisible();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/framework\/docs\/3\.2\/chart$/);
});
