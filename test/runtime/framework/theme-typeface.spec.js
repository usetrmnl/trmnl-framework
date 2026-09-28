import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { frameworkBundleFile, readBuild } from '../../support/processed-bundle.js';

const theme = execFileSync('bundle', ['exec', 'sass', '--stdin', '--no-source-map',
  '--load-path=app/assets/stylesheets'], {
  encoding: 'utf8',
  input: `@use 'framework/config/layers';
    @use 'framework/mixins/theme-slots';
    @include layers.order;
    @font-face {
      font-family: 'Example Sans';
      font-weight: 100 900;
      src: url('./fonts/example.ttf') format('truetype');
    }
    @layer tn--themes {
      .trmnl .screen--theme-example { @include theme-slots.typeface('Example Sans'); }
    }`,
});

for (const mode of ['screen--1bit', 'screen--4bit', 'screen--1bit screen--density-2x',
  'screen--1bit screen--scale-large screen--text-scale-large']) {
  for (const themeFirst of [false, true]) {
    test(`loads a standalone typeface with ${mode}, theme first: ${themeFirst}`, async ({ page }) => {
      const fontRequests = [];
      const unexpectedRequests = [];
      await page.route('**/*', async (route) => {
        const path = new URL(route.request().url()).pathname;
        if (path === '/plugins.css') {
          return route.fulfill({ body: await readBuild(frameworkBundleFile()), contentType: 'text/css' });
        }
        if (path === '/themes/example.css') {
          return route.fulfill({ body: theme, contentType: 'text/css' });
        }
        if (path === '/themes/fonts/example.ttf') {
          fontRequests.push(path);
          return route.fulfill({ body: await readFile('public/fonts/Inter.ttf'), contentType: 'font/ttf' });
        }
        unexpectedRequests.push(path);
        return route.abort();
      });
      const links = ['/plugins.css', '/themes/example.css'];
      if (themeFirst) links.reverse();
      await page.setContent(`<base href="https://standalone.test/">
        ${links.map((href) => `<link rel="stylesheet" href="${href}">`).join('')}
        <body class="trmnl"><div class="screen ${mode} screen--theme-example">
          <div class="title">Weather</div><div class="label">Today</div>
          <div class="value">23°</div><div class="description">Overcast</div>
          <div class="richtext"><div class="content">Berlin</div></div>
        </div></body>`);
      await page.evaluate(() => document.fonts.ready);
      const families = await page.locator('.title, .label, .value, .description, .richtext .content').evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).fontFamily));
      expect(families).toEqual(Array(5).fill('"Example Sans", "Inter Variable", Inter'));
      expect(await page.evaluate(() => document.fonts.check('16px "Example Sans"'))).toBe(true);
      expect(fontRequests).toEqual(['/themes/fonts/example.ttf']);
      expect(unexpectedRequests).toEqual([]);
    });
  }
}
