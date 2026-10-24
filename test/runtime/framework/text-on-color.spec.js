import { readdir, readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { frameworkBundleFile, readBuild } from '../../support/processed-bundle.js';

// Every screen class a palette renders with, every hue, every role and every
// theme come from the data and the build, so a new one is covered here unasked.
const devices = await readFile(new URL('../../../db/data/framework_devices.yml', import.meta.url), 'utf8');
const colors = await readFile(new URL('../../../db/data/framework_colors.yml', import.meta.url), 'utf8');
const bundle = await readBuild(frameworkBundleFile());
const themeFiles = await readdir(new URL('../../../server/app/assets/builds/themes/', import.meta.url));

// The 1-bit rail keeps its own text colors: over dither art an average color
// says little about whether text reads, so it sets no ink.
const PALETTE_CLASSES = [...new Set([...devices.matchAll(/framework_class: (screen--[\w-]+)/g)].map((m) => m[1]))]
  .filter((screenClass) => screenClass !== 'screen--1bit');
const HUES = colors.match(/^color_hues:\n((?: {2}- \w+\n)+)/m)[1].match(/\w+/g);
const ROLES = [...new Set([...bundle.matchAll(/--color-([a-z]+):\s*var\(--[a-z]+\)/g)].map((m) => m[1]))];
const THEMES = [null, ...themeFiles.filter((f) => f.endsWith('-theme.css')).map((f) => f.replace('-theme.css', ''))];
const MODES = ['light', 'dark'];
// Palette id -> { drawn hex: hex the panel shows }, from panel_appearance.
const PANEL_APPEARANCE = Object.fromEntries(
  [...(colors.match(/^panel_appearance:\n((?: .*\n)+)/m)?.[1] ?? '').matchAll(/^ {2}(color-\w+):\n((?: {4}.*\n)+)/gm)]
    .map(([, palette, body]) => [palette, Object.fromEntries([...body.matchAll(/"(#\w{6})": "(#\w{6})"/g)].map((m) => m.slice(1, 3)))]),
);
const BACKGROUNDS = [...HUES, ...ROLES];

// A dither pattern averages slightly off the color it stands for, so a tie
// within this margin passes either way.
const CONTRAST_TOLERANCE = 0.9;

function luminance([r, g, b]) {
  const linear = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrast(a, b) {
  const [light, dark] = [a, b].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const hex = (rgb) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
const rgbOf = (value) => value.match(/\w\w/g).map((pair) => parseInt(pair, 16));
const shownLuminance = (rgb, appearance) => luminance(appearance?.[hex(rgb)] ? rgbOf(appearance[hex(rgb)]) : rgb);

async function routeStylesheets(page) {
  await page.route('**/__text-on-color__/plugins.css', (route) => route.fulfill({ body: bundle, contentType: 'text/css' }));
  for (const theme of THEMES.filter(Boolean)) {
    const css = await readBuild(`themes/${theme}-theme.css`);
    await page.route(`**/__text-on-color__/${theme}-theme.css`, (route) => route.fulfill({ body: css, contentType: 'text/css' }));
  }
}

// Parts that paint their own ground keep the screen's text inside a colored
// background, so each must match its copy outside one. bg--white must read best.
const OWN_GROUND = {
  'bg--canvas': (probe) => `<div ${probe} class="bg--canvas">Aa</div>`,
  'bg--surface': (probe) => `<div ${probe} class="bg--surface">Aa</div>`,
  'bg--backdrop': (probe) => `<div ${probe} class="bg--backdrop">Aa</div>`,
  'title_bar': (probe) => `<div class="title_bar"><span ${probe} class="title">Aa</span></div>`,
  'item meta': (probe) => `<div class="item"><div class="meta"><span ${probe} class="index">1</span></div><div class="content"></div></div>`,
  'table meta': (probe) => `<table class="table table--indexed"><tbody><tr><td><div class="meta"><span ${probe} class="index">1</span></div></td></tr></tbody></table>`,
  'map__attribution': (probe) => `<div class="map" style="position:relative"><div ${probe} class="map__attribution">Aa</div></div>`,
  // A text stroke draws its halo in the screen's contrast color, so its text keeps the screen's color too.
  'text-stroke': (probe) => `<div ${probe} class="text-stroke">Aa</div>`,
  'text-stroke--white': (probe) => `<div ${probe} class="text-stroke text-stroke--white">Aa</div>`,
};
const NEST_IN = [...BACKGROUNDS, 'black'];
const NESTED = ['bg--white', ...Object.keys(OWN_GROUND)];
const nestedMarkup = (name, probe) => (OWN_GROUND[name] ? OWN_GROUND[name](probe) : `<div ${probe} class="${name}">Aa</div>`);

async function render(page, screenClasses, theme, appearance) {
  const themeLink = theme ? `<link rel="stylesheet" href="/__text-on-color__/${theme}-theme.css">` : '';
  const box = 'style="display:inline-block;width:30px;height:20px;margin:1px;font-size:12px;line-height:20px"';
  await page.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <link rel="stylesheet" href="/__text-on-color__/plugins.css">${themeLink}
      <style>.screen { visibility: visible } .group { display: flex; padding: 3px; } .cell { width: 30px; height: 20px; margin: 1px; overflow: hidden; }
        .cell > *, .cell .title_bar, .cell .item, .cell .meta, .cell .table { width: 30px; height: 20px; font-size: 12px; line-height: 20px; }</style>
    </head><body class="environment trmnl">
      <div class="screen ${screenClasses}"><div style="display:flex;flex-wrap:wrap;align-content:flex-start">
        ${ROLES.map((r) => `<span data-probe="label--${r}" class="label label--${r}" ${box}>Aa</span>`).join('')}
        ${BACKGROUNDS.map((t) => `<div data-probe="bg--${t}" class="bg--${t}" ${box}>Aa</div>`).join('')}
        ${Object.keys(OWN_GROUND).map((name) => `<div class="cell">${nestedMarkup(name, `data-probe="${name}"`)}</div>`).join('')}
        ${NEST_IN.map((t) => `<div class="bg--${t} group">${NESTED.map((name) => `<div class="cell">${nestedMarkup(name, `data-probe="${name} in bg--${t}"`)}</div>`).join('')}</div>`).join('')}
        ${NEST_IN.map((t) => `<div class="cell"><div data-probe="text-stroke in bg--${t} itself" class="bg--${t} text-stroke">Aa</div></div>`).join('')}
      </div></div>
    </body></html>`);

  const probes = await page.evaluate(() => [...document.querySelectorAll('[data-probe]')].map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      name: element.dataset.probe,
      text: getComputedStyle(element).color.match(/[\d.]+/g).slice(0, 3).map(Number),
      rect: { x: Math.round(rect.x) + 4, y: Math.round(rect.y) + 4, width: Math.round(rect.width) - 8, height: Math.round(rect.height) - 8 },
    };
  }));
  await page.addStyleTag({ content: '[data-probe] { color: transparent !important; -webkit-text-fill-color: transparent !important; }' });

  const png = (await page.screenshot()).toString('base64');
  const grounds = await page.evaluate(async ({ data, rects }) => {
    const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
    const canvas = new OffscreenCanvas(image.width, image.height);
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    return rects.map(({ x, y, width, height }) => {
      const pixels = context.getImageData(x, y, width, height).data;
      const counts = {};
      for (let i = 0; i < pixels.length; i += 4) {
        const rgb = `${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`;
        counts[rgb] = (counts[rgb] || 0) + 1;
      }
      return Object.entries(counts).map(([rgb, count]) => [rgb.split(',').map(Number), count / (pixels.length / 4)]);
    });
  }, { data: png, rects: probes.map(({ rect }) => rect) });
  probes.forEach((probe, index) => {
    const shares = grounds[index];
    // A measured panel reflects each dot's own light, so the ground averages in linear light.
    probe.ground = appearance
      ? shares.reduce((sum, [rgb, share]) => sum + share * shownLuminance(rgb, appearance), 0)
      : luminance([0, 1, 2].map((c) => shares.reduce((sum, [rgb, share]) => sum + share * rgb[c], 0)));
    probe.textLuminance = shownLuminance(probe.text, appearance);
  });
  return probes;
}

test.describe('text on color', () => {
  test.beforeEach(async ({ page }) => {
    await routeStylesheets(page);
    await page.goto('/framework/test/runtime');
  });

  for (const paletteClass of PALETTE_CLASSES) {
    for (const mode of MODES) {
      for (const theme of THEMES) {
        const classes = [paletteClass, mode === 'dark' && 'screen--dark-mode', theme && `screen--theme-${theme}`].filter(Boolean).join(' ');

        test(`picks the readable ink on ${classes}`, async ({ page }) => {
          const appearance = PANEL_APPEARANCE[paletteClass.replace('screen--', '')];
          const probes = await render(page, classes, theme, appearance);
          const [black, white] = ['#000000', '#FFFFFF'].map((value) => shownLuminance(rgbOf(value), appearance));
          const ownText = Object.fromEntries(probes.filter(({ name }) => OWN_GROUND[name]).map(({ name, text }) => [name, text.join(',')]));
          const wrong = probes.filter(({ name, text, textLuminance, ground }) => {
            if (OWN_GROUND[name]) return false;
            const part = Object.keys(OWN_GROUND).find((key) => name.startsWith(`${key} in `));
            if (part) return text.join(',') !== ownText[part];
            const best = Math.max(contrast(black, ground), contrast(white, ground));
            return contrast(textLuminance, ground) < best * CONTRAST_TOLERANCE;
          }).map(({ name, text, ground }) => `${name}: text ${text.join(',')} on luminance ${ground.toFixed(3)}`);

          expect(wrong).toEqual([]);
        });
      }
    }
  }
});
