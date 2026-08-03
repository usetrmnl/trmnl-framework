import { expect } from '@playwright/test';
import { routeProcessedAssets } from '../../support/processed-bundle.js';

// Docs examples are wrapped into iframes lazily. framework_examples_controller
// wraps only the .trmnl-example wrappers within a margin of the viewport and
// hands the rest to an IntersectionObserver, and the 800x480 test viewport fits
// one example, so a plain page.goto leaves every other example unwrapped and the
// specs measure a single iframe instead of the page.
//
// The margin is not a hardcoded constant: framework_examples_controller,
// fancy_screen_picker_controller and the docs layout all read
// window.__TRMNL_EXAMPLE_VIEWPORT_MARGIN__ first (see
// app/javascript/controllers/framework_examples_controller.js:115). Seeding it
// with a page-sized margin puts every wrapper in the eager set through the
// controller's own code path, so the specs exercise the shipped wrapping and
// picker logic rather than a test-only branch.
const EAGER_EXAMPLE_MARGIN = 100_000;

export async function openDocsPage(page, path) {
  // Every example iframe links the Google Fonts stylesheet for the docs Inter.
  // The framework's own faces are self-hosted from public/fonts, so the specs
  // need nothing from that host, and waiting on it would put an external
  // network round trip in front of every iframe load event.
  await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({
    body: '',
    contentType: 'text/css',
  }));
  await page.addInitScript((margin) => {
    window.__TRMNL_EXAMPLE_VIEWPORT_MARGIN__ = margin;
  }, EAGER_EXAMPLE_MARGIN);
  // Docs example iframes link the same bundle URLs the parent page does, so this
  // covers both. Frozen tracks name a released path and keep serving it.
  await routeProcessedAssets(page);
  await page.goto(path);

  // The eager path renders every example iframe at once, and on 2-core CI
  // runners a ten-example page needs more than the 5s poll default.
  await expect.poll(() => page.evaluate(() => {
    const wrappers = Array.from(document.querySelectorAll('.trmnl-example'));
    return wrappers.length > 0 && wrappers.every((wrapper) => wrapper.dataset.trmnlWrapped === 'true');
  }), { timeout: 30_000 }).toBe(true);

  await expect.poll(() => page.evaluate(() => {
    const frames = Array.from(document.querySelectorAll('iframe[data-trmnl-example="true"]'));
    return frames.length > 0 && frames.every((frame) => frame.contentDocument?.readyState === 'complete');
  }), { timeout: 30_000 }).toBe(true);
}
