import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { frameworkBundleFile, readBuild } from '../../support/processed-bundle.js';

// The plain CSS entry point: a plugin loads its own font and names it on any
// container with the typeface class, because platform markup cannot add classes
// to .screen. A theme typeface sits on the same screen to prove the plugin wins.
const theme = execFileSync('bundle', ['exec', 'sass', '--stdin', '--no-source-map',
  '--load-path=app/assets/stylesheets'], {
  encoding: 'utf8',
  input: `@use 'framework/config/layers';
    @use 'framework/mixins/theme-slots';
    @include layers.order;
    @font-face {
      font-family: 'Theme Sans';
      font-weight: 100 900;
      src: url('./fonts/theme.ttf') format('truetype');
    }
    @layer tn--themes {
      .trmnl .screen--theme-example { @include theme-slots.typeface('Theme Sans'); }
    }`,
});

const PLUGIN_FONT = `<style>
  @font-face {
    font-family: 'Plugin Sans';
    font-weight: 100 900;
    src: url('/fonts/plugin.ttf') format('truetype');
  }
</style>`;

const TEXT = `<div class="title">Weather</div><div class="label">Today</div>
  <div class="value">23°</div><div class="description">Overcast</div>
  <div class="richtext"><div class="content">Berlin</div></div>`;

const PLUGIN_FAMILY = '"Plugin Sans", "Inter Variable", Inter';
const THEME_FAMILY = '"Theme Sans", "Inter Variable", Inter';
const PLUGIN_TYPEFACE = 'style="--framework-typeface: \'Plugin Sans\'"';

async function render(page, body, { themeFirst = false } = {}) {
  const unexpectedRequests = [];
  await page.route('**/*', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/plugins.css') {
      return route.fulfill({ body: await readBuild(frameworkBundleFile()), contentType: 'text/css' });
    }
    if (path === '/themes/example.css') return route.fulfill({ body: theme, contentType: 'text/css' });
    if (['/fonts/plugin.ttf', '/themes/fonts/theme.ttf', '/fonts/Inter.ttf'].includes(path)) {
      return route.fulfill({ body: await readFile('public/fonts/Inter.ttf'), contentType: 'font/ttf' });
    }
    unexpectedRequests.push(path);
    return route.abort();
  });
  const links = ['/plugins.css', '/themes/example.css'];
  if (themeFirst) links.reverse();
  await page.setContent(`<base href="https://standalone.test/">
    ${links.map((href) => `<link rel="stylesheet" href="${href}">`).join('')}
    ${PLUGIN_FONT}
    <body class="trmnl">${body}</body>`);
  await page.evaluate(() => document.fonts.ready);
  expect(unexpectedRequests).toEqual([]);
}

function families(page, scope) {
  return page.locator(scope).locator('.title, .label, .value, .description, .richtext .content')
    .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).fontFamily));
}

for (const mode of ['screen--1bit', 'screen--4bit', 'screen--1bit screen--density-2x',
  'screen--1bit screen--scale-large screen--text-scale-large']) {
  test(`sets a plugin typeface on a view with ${mode}`, async ({ page }) => {
    await render(page, `<div class="screen ${mode}">
      <div class="view view--full typeface" ${PLUGIN_TYPEFACE}>${TEXT}</div></div>`);

    expect(await families(page, '.view')).toEqual(Array(5).fill(PLUGIN_FAMILY));
  });

  test(`sets a plugin typeface on the screen with ${mode}`, async ({ page }) => {
    await render(page, `<div class="screen ${mode} typeface" ${PLUGIN_TYPEFACE}>
      <div class="view view--full">${TEXT}</div></div>`);

    expect(await families(page, '.view')).toEqual(Array(5).fill(PLUGIN_FAMILY));
  });
}

test('loads the plugin font file', async ({ page }) => {
  await render(page, `<div class="screen screen--1bit">
    <div class="view view--full typeface" ${PLUGIN_TYPEFACE}>${TEXT}</div></div>`);

  expect(await page.evaluate(() => document.fonts.check('16px "Plugin Sans"'))).toBe(true);
});

test('falls back to Inter without a family', async ({ page }) => {
  await render(page, `<div class="screen screen--1bit">
    <div class="view view--full typeface">${TEXT}</div></div>`);

  expect(await families(page, '.view')).toEqual(Array(5).fill('"Inter Variable", "Inter Variable", Inter'));
});

for (const themeFirst of [false, true]) {
  test(`puts a plugin typeface above the theme typeface, theme first: ${themeFirst}`, async ({ page }) => {
    await render(page, `<div class="screen screen--1bit screen--theme-example">
      <div class="mashup mashup--1Lx1R">
        <div class="view view--half_vertical plugin typeface" ${PLUGIN_TYPEFACE}>${TEXT}</div>
        <div class="view view--half_vertical other">${TEXT}</div>
      </div></div>`, { themeFirst });

    expect({ plugin: await families(page, '.plugin'), other: await families(page, '.other') })
      .toEqual({ plugin: Array(5).fill(PLUGIN_FAMILY), other: Array(5).fill(THEME_FAMILY) });
  });

  test(`puts a plugin typeface above a theme on the same element, theme first: ${themeFirst}`, async ({ page }) => {
    await render(page, `<div class="screen screen--1bit screen--theme-example typeface" ${PLUGIN_TYPEFACE}>
      <div class="view view--full">${TEXT}</div></div>`, { themeFirst });

    expect(await families(page, '.view')).toEqual(Array(5).fill(PLUGIN_FAMILY));
  });
}
