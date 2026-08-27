import { expect, test } from '@playwright/test';
import { frameworkBundleFile, readBuild } from '../../support/processed-bundle.js';

// Custom properties substitute in their declaring scope, so only a browser proves
// override reachability: a runtime spec, not a compiled-CSS one.
const OVERRIDE_CSS = `
  .pill {
    --framework-stroke-contrast: #000000;
    color: var(--framework-text-inverse);
  }
`;

async function routeStylesheets(page) {
  const bundle = await readBuild(frameworkBundleFile());
  await page.route('**/__stroke-contrast__/plugins.css', (route) => route.fulfill({
    body: bundle,
    contentType: 'text/css',
  }));

  const theme = await readBuild('themes/dark-theme.css');
  await page.route('**/__stroke-contrast__/dark-theme.css', (route) => route.fulfill({
    body: theme,
    contentType: 'text/css',
  }));
}

async function renderScreen(page, { themed }) {
  const themeLink = themed
    ? '<link rel="stylesheet" href="/__stroke-contrast__/dark-theme.css">'
    : '';
  const themeClass = themed ? ' screen--theme-dark' : '';

  await page.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <link rel="stylesheet" href="/__stroke-contrast__/plugins.css">${themeLink}
      <style>html, body { margin: 0 } .screen { visibility: visible } ${OVERRIDE_CSS}</style>
    </head><body class="environment trmnl">
      <div class="screen screen--og screen--1bit${themeClass}">
        <span data-probe="default" class="text-stroke">93</span>
        <div class="pill"><span data-probe="override" class="text-stroke">82</span></div>
        <div class="inverse"><span data-probe="inverse" class="text-stroke">72</span></div>
      </div>
    </body></html>`);
  await page.evaluate(() => document.fonts.ready);

  return page.evaluate(() => Object.fromEntries(
    [...document.querySelectorAll('[data-probe]')].map((element) => {
      const style = getComputedStyle(element);
      return [element.dataset.probe, {
        strokeColor: style.getPropertyValue('--tn-text-stroke-color').trim(),
        ring: (style.textShadow.match(/^rgba?\([^)]+\)/) || [''])[0],
      }];
    })
  ));
}

test.describe('stroke contrast override', () => {
  test.beforeEach(async ({ page }) => {
    await routeStylesheets(page);
    // setContent alone leaves the page on about:blank, where the routed
    // absolute stylesheet paths never resolve.
    await page.goto('/framework/test/runtime');
  });

  test('a subtree repainting --framework-stroke-contrast strokes with its own color', async ({ page }) => {
    const probes = await renderScreen(page, { themed: false });

    expect(probes.override).toEqual({ strokeColor: '#000000', ring: 'rgb(0, 0, 0)' });
  });

  test('an untouched screen still strokes with the semantic contrast color', async ({ page }) => {
    const probes = await renderScreen(page, { themed: false });

    expect(probes.default).toEqual({ strokeColor: '#FFFFFF', ring: 'rgb(255, 255, 255)' });
  });

  test('a theme still moves the stroke color on the screen it themes', async ({ page }) => {
    const probes = await renderScreen(page, { themed: true });

    expect(probes.default).toEqual({ strokeColor: '#000000', ring: 'rgb(0, 0, 0)' });
  });

  test('a theme still moves the stroke color in scopes below the screen', async ({ page }) => {
    const probes = await renderScreen(page, { themed: true });

    expect(probes.inverse).toEqual({ strokeColor: '#FFFFFF', ring: 'rgb(255, 255, 255)' });
  });
});
