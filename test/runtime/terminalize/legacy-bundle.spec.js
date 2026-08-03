import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

// The frozen v1.2 runtime, served to host apps as a docs asset and loaded by the 1.2 docs
// layouts in live-build mode. Its thirteen engine declarations used to land on window;
// formatValue is the name plugins.js's own IIFE header calls out as a plugin-author
// collision. Only terminalize is public.
const legacyPath = fileURLToPath(new URL('../../../app/javascript/plugin_legacy.js', import.meta.url));

const PRIVATE_NAMES = [
  'adjustIndexSpanWidths',
  'manageOverflow',
  'adjustGridGaps',
  'adjustColumnGaps',
  'formatValue',
  'findBestFormat',
  'fitTextToContainer',
  'pixelPerfectFonts',
  'fitValue',
  'getHeightThreshold',
  'addClassBasedOnHeight',
  'applyContentLimits',
];

const legacyFixture = `
  <style>
    body { margin: 0; }
    .legacy-list { display: flex; flex-direction: column; width: 240px; gap: 0; }
    .legacy-list > .item { box-sizing: border-box; height: 40px; margin: 0; padding: 0; border: 0; }
  </style>
  <div class="screen">
    <div class="view view--full">
      <div class="layout layout--col">
        <div class="column legacy-list" data-list-limit="true" data-list-max-height="120" data-list-hidden-count="true">
          ${Array.from({ length: 6 }, (_, index) => `
            <div class="item" id="legacy-item-${index + 1}">
              <div class="meta"><span class="index">${index + 1}</span></div>
              <div class="content"><span class="title">Item ${index + 1}</span></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
`;

test('the legacy bundle exposes only terminalize and still trims a legacy list', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  // Same-origin so the classic script behaves exactly as it does in the docs iframes.
  await page.goto('/framework/test/runtime');
  await page.setContent(legacyFixture);
  await page.addScriptTag({ content: await readFile(legacyPath, 'utf8') });

  const globals = await page.evaluate((names) => ({
    terminalize: typeof window.terminalize,
    leaked: names.filter((name) => typeof window[name] !== 'undefined'),
  }), PRIVATE_NAMES);

  expect(globals).toEqual({ terminalize: 'function', leaked: [] });

  // The script is injected after load, so the bundle's own load listener never fires:
  // this is the same call the 1.2 layouts and the iframe bridge make.
  await page.evaluate(() => window.terminalize());
  await expect.poll(() => page.evaluate(
    () => document.querySelectorAll('.legacy-list > .item[style*="display: none"]').length,
  )).toBeGreaterThan(0);

  const counter = await page.evaluate(() => {
    const label = document.querySelector('.legacy-list .label--gray-out');
    return label ? label.textContent.trim() : null;
  });
  expect(counter).toMatch(/^and \d+ more$/);
  expect(pageErrors).toEqual([]);
});
