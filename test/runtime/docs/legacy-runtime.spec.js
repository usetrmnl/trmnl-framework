import { expect, test } from '@playwright/test';
import { openDocsPage } from '../support/docs-page.js';

// The 1.2 docs are a frozen track: their example iframes load the released 1.2.0 bundle
// from public/js, not the working copy of plugin_legacy.js, and that released bundle is
// never re-cut. This pins which bundle the page serves and proves the examples still
// terminalize. The working copy is covered by terminalize/legacy-bundle.spec.js.
test('the 1.2 docs render and terminalize their examples from the released bundle', async ({ page }) => {
  await openDocsPage(page, '/framework/docs/1.2/overflow');

  const frames = await page.evaluate(() => Array.from(
    document.querySelectorAll('iframe[data-trmnl-example="true"]'),
    (frame) => {
      const doc = frame.contentDocument;

      return {
        entryPoint: typeof frame.contentWindow.terminalize,
        scripts: Array.from(doc.querySelectorAll('script[src]'), (script) => script.getAttribute('src')),
        screens: doc.querySelectorAll('.screen').length,
        items: doc.querySelectorAll('.item').length,
        // The legacy index engine pins an even inline width on every odd index badge, so
        // an inline width on each one is proof the runtime ran inside the iframe.
        indexWidths: Array.from(doc.querySelectorAll('.meta .index'), (span) => span.style.width),
      };
    },
  ));

  expect(frames.length).toBeGreaterThan(0);
  frames.forEach((frame) => {
    expect(frame.entryPoint).toBe('function');
    expect(frame.scripts.some((src) => src.includes('/js/1.2.0/plugins.js'))).toBe(true);
    expect(frame.screens).toBeGreaterThan(0);
    expect(frame.items).toBeGreaterThan(0);
    expect(frame.indexWidths.length).toBeGreaterThan(0);
    expect(frame.indexWidths.every((width) => /^\d+px$/.test(width))).toBe(true);
  });
});
