import { expect, test } from '@playwright/test';
import { frameworkBundleFile, readBuild } from '../../support/processed-bundle.js';

// A theme ships as a second <link> next to plugins.css, and a consumer is free
// to put it first. Cascade layer order is fixed by the first stylesheet that
// names the layers, so a theme parsed ahead of the bundle would register
// tn--themes before tn--base and lose every semantic channel it sets at equal
// specificity. Each compiled theme therefore emits the framework's own ordering
// statement (config/_layers.scss), and this drives both link orders in a real
// engine to prove the rendered result is the same either way.
//
// bin/rails pins APP_PATH to server/, so `dartsass:build` writes every bundle
// into server/app/assets/builds. Copies elsewhere are release-era artifacts a
// rebuild never refreshes.
const THEME_IDS = ['black-and-yellow', 'dark', 'white-and-red'];

// The ordering statement is per-theme and per-file, so one grayscale and one
// palette mode cover it; a missing statement fails in every mode at once.
const MODES = [
  { name: '1-bit', classes: 'screen--1bit' },
  { name: '4bwry preview', classes: 'screen--4bit screen--color-4bwry screen--preview-colors' },
];

const FIXTURE = `
  <div class="view view--full">
    <div class="layout layout--col">
      <span data-probe="title" class="title">Title</span>
      <span data-probe="label" class="label label--filled">Label</span>
      <div data-probe="rail" class="border--h-black"></div>
      <div class="progress-dots"><div class="track">
        <div data-probe="dot" class="dot dot--filled"></div>
      </div></div>
      <div class="progress-bar"><div class="track">
        <div data-probe="fill" class="fill" style="width: 60%"></div>
      </div></div>
      <div class="item"><div data-probe="meta" class="meta"></div></div>
    </div>
  </div>
`;

async function routeStylesheets(page) {
  // The bundle half is the mode's bundle: layer order is declared by whichever
  // stylesheet parses first, and the processed pass rewrites the statement that
  // declares it. Themes stay unprocessed in a release, so they are read as built.
  const bundle = await readBuild(frameworkBundleFile());
  await page.route('**/__layer-order__/plugins.css', (route) => route.fulfill({
    body: bundle,
    contentType: 'text/css',
  }));

  for (const id of THEME_IDS) {
    const theme = await readBuild(`themes/${id}-theme.css`);
    await page.route(`**/__layer-order__/${id}-theme.css`, (route) => route.fulfill({
      body: theme,
      contentType: 'text/css',
    }));
  }
}

async function renderScreen(page, { hrefs, themeId, modeClasses }) {
  const links = hrefs.map((href) => `<link rel="stylesheet" href="${href}">`).join('');
  const themeClass = themeId ? ` screen--theme-${themeId}` : '';
  await page.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8">${links}
      <style>html, body { margin: 0 } .screen { visibility: visible }</style>
    </head><body class="environment trmnl">
      <div data-probe="screen" class="screen screen--og ${modeClasses}${themeClass}">${FIXTURE}</div>
    </body></html>`);
  await page.evaluate(() => document.fonts.ready);

  return page.evaluate(() => {
    const paint = (element, pseudo = null) => {
      const style = getComputedStyle(element, pseudo);
      return {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        backgroundSize: style.backgroundSize,
        color: style.color,
      };
    };
    const screen = document.querySelector('[data-probe="screen"]');
    const snapshot = {
      channels: Object.fromEntries([
        'canvas-bg-color', 'canvas-bg-image', 'fill-strong-bg-color', 'fill-strong-bg-image',
        'fill-muted-bg-color', 'fill-soft-bg-color', 'text-primary-text-color',
        'border-strong-border-color',
      ].map((channel) => [
        channel,
        getComputedStyle(screen).getPropertyValue(`--framework-semantic-${channel}`).trim(),
      ])),
    };
    for (const element of document.querySelectorAll('[data-probe]')) {
      const name = element.dataset.probe;
      snapshot[name] = paint(element);
      if (name === 'rail') snapshot['rail::before'] = paint(element, '::before');
    }
    return snapshot;
  });
}

test.describe('theme cascade layer order', () => {
  test.beforeEach(async ({ page }) => {
    await routeStylesheets(page);
    await page.goto('/framework/test/runtime');
  });

  for (const themeId of THEME_IDS) {
    for (const mode of MODES) {
      test(`${themeId} paints the same with the theme link before or after plugins.css (${mode.name})`, async ({ page }) => {
        const bundle = '/__layer-order__/plugins.css';
        const theme = `/__layer-order__/${themeId}-theme.css`;

        const unthemed = await renderScreen(page, {
          hrefs: [bundle],
          themeId: null,
          modeClasses: mode.classes,
        });
        const bundleFirst = await renderScreen(page, {
          hrefs: [bundle, theme],
          themeId,
          modeClasses: mode.classes,
        });
        const themeFirst = await renderScreen(page, {
          hrefs: [theme, bundle],
          themeId,
          modeClasses: mode.classes,
        });

        // Anchor the comparison: an inert theme makes both orders agree on the
        // framework defaults, which is the exact failure this test exists to catch.
        expect(bundleFirst).not.toEqual(unthemed);
        expect(themeFirst).toEqual(bundleFirst);
      });
    }
  }
});
