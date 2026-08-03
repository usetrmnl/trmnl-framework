import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
} from '../support/runtime-page.js';
import { bundleVariable } from '../../support/processed-bundle.js';

const paintFixture = {
  html: `
    <div id="paint-context">
      <div id="bg-probe" class="bg--gray-40 rounded--[10px]"></div>
      <span id="text-probe" class="text--muted">Muted text</span>
      <div id="border-probe" class="border--h-65"></div>
      <span id="type-probe" class="value">123</span>
      <span id="scale-label" class="label label--small">Small</span>
      <span id="scale-stroke" class="text-stroke text-stroke--small">Stroke</span>
      <div id="scale-item" class="item"></div>
      <div id="scale-progress" class="progress-bar progress-bar--xsmall"><div class="track"></div></div>
      <div id="apply-fill"></div>
      <div id="apply-border"></div>
      <span id="apply-type">Applied type</span>
      <div id="inverse-context" class="inverse">
        <div id="inverse-bg-probe" class="bg--gray-25"></div>
        <div id="inverse-yellow-25" class="bg--yellow-25"></div>
        <div id="inverse-yellow-30" class="bg--yellow-30"></div>
        <div id="inverse-yellow-35" class="bg--yellow-35"></div>
        <div id="inverse-yellow-40" class="bg--yellow-40"></div>
        <div id="inverse-yellow" class="bg--yellow"></div>
        <div class="item"><div id="inverse-item-meta" class="meta"></div></div>
        <div class="item item--emphasis-2"><div id="inverse-item-meta-2" class="meta"></div></div>
        <div class="item item--emphasis-3"><div id="inverse-item-meta-3" class="meta"></div></div>
        <div id="inverse-title-bar" class="title_bar"><span class="title">Inverse title</span></div>
        <div id="inverse-progress" class="progress-bar">
          <div class="track"><div id="inverse-progress-fill" class="fill" style="width: 60%"></div></div>
        </div>
        <div class="progress-bar progress-bar--emphasis-2">
          <div class="track"><div id="inverse-progress-fill-2" class="fill" style="width: 60%"></div></div>
        </div>
        <div class="progress-bar progress-bar--emphasis-3">
          <div class="track"><div id="inverse-progress-fill-3" class="fill" style="width: 60%"></div></div>
        </div>
        <div class="progress-dots">
          <div class="track">
            <div id="inverse-progress-dot" class="dot"></div>
            <div id="inverse-progress-dot-current" class="dot dot--current"></div>
            <div id="inverse-progress-dot-filled" class="dot dot--filled"></div>
          </div>
        </div>
        <span id="inverse-label-filled" class="label label--filled">Filled</span>
        <span id="inverse-label-inverted" class="label label--inverted">Inverted</span>
      </div>
      <div id="inverse-sibling">
        <div id="sibling-bg-probe" class="bg--gray-25"></div>
        <div id="sibling-progress" class="progress-bar">
          <div class="track"><div class="fill" style="width: 60%"></div></div>
        </div>
      </div>
    </div>
  `,
  css: `
    #paint-context,
    #bg-probe,
    #border-probe,
    #inverse-context,
    #inverse-sibling,
    #inverse-bg-probe,
    #inverse-yellow-25,
    #inverse-yellow-30,
    #inverse-yellow-35,
    #inverse-yellow-40,
    #inverse-yellow,
    #sibling-bg-probe,
    #apply-fill,
    #apply-border {
      box-sizing: border-box;
      width: 160px;
      min-height: 24px;
    }

    #inverse-context.slot-override {
      --framework-semantic-canvas-bg-color: rgb(1, 2, 3);
      --framework-semantic-canvas-bg-image: none;
      --framework-slot-progress-track-bg-color: rgb(4, 5, 6);
      --framework-slot-progress-track-bg-image: none;
    }
  `,
};

// A 1x1 transparent PNG: the adaptive image rule masks whatever the src is, so
// the fixture only needs a valid image for the element to lay out.
const BLANK_ICON = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// The border renderer program and the icon channel are the two paint surfaces
// with no public utility class behind them: both leave CSS as custom properties
// and are read back by TRMNLPaint, so a theme that moves the paint without
// moving them desynchronizes the export from the screen.
const themedChannelFixture = {
  html: `
    <div id="themed-context">
      <div id="rail-h-65" class="border--h-65"></div>
      <div id="rail-v-65" class="border--v-65"></div>
      <div id="rail-black" class="border--h-black"></div>
      <div id="rail-divider" class="divider"></div>
      <span id="rail-underline" class="label label--underline">Underline</span>
      <img id="icon-probe" class="image--adaptive" data-adaptive="true" alt="" src="${BLANK_ICON}"
           style="--framework-icon-src: url('${BLANK_ICON}')">
      <div id="remap-context">
        <div id="remap-rail" class="border--h-65"></div>
      </div>
    </div>
  `,
  css: `
    #rail-h-65,
    #rail-v-65,
    #rail-black,
    #rail-divider,
    #remap-rail {
      box-sizing: border-box;
      width: 160px;
      min-height: 24px;
    }

    #icon-probe {
      width: 16px;
      height: 16px;
    }

    /* The theme layer a level remap writes, for the step rail border(65) reads
       and the level-6 rail divider() reads. mixins/_theme-slots.scss:
       utility-border-token() emits this variable set, and
       spec/assets/stylesheets/framework_theme_slot_contract_spec.rb pins what it
       emits; this asserts the consumer chain reads it. */
    #remap-context.level-remapped {
      --theme-border-65-h-color: rgb(1, 2, 3);
      --theme-border-65-h-image: none;
      --theme-border-65-h-size: auto;
      --theme-border-65-h-position: 0 0;
      --theme-border-65-h-render-stroke: rgb(1, 2, 3);
      --theme-border-65-h-render-width: 0px;
      --theme-border-65-h-render-height: 0px;
      --theme-border-65-h-render-view-box: none;
      --theme-border-65-h-render-path-1: none;
      --theme-border-65-h-render-color-1: none;
      --theme-border-65-h-render-path-2: none;
      --theme-border-65-h-render-color-2: none;
      --theme-border-6-h-color: rgb(4, 5, 6);
      --theme-border-6-h-image: none;
      --theme-border-6-h-size: auto;
      --theme-border-6-h-position: 0 0;
      --theme-border-6-h-render-stroke: rgb(4, 5, 6);
      --theme-border-6-h-render-width: 0px;
      --theme-border-6-h-render-height: 0px;
      --theme-border-6-h-render-view-box: none;
      --theme-border-6-h-render-path-1: none;
      --theme-border-6-h-render-color-1: none;
      --theme-border-6-h-render-path-2: none;
      --theme-border-6-h-render-color-2: none;
    }
  `,
};

const BORDER_RENDER_FIELDS = {
  stroke: 'stroke',
  width: 'width',
  height: 'height',
  viewBox: 'view-box',
  path1: 'path-1',
  color1: 'color-1',
  path2: 'path-2',
  color2: 'color-2',
};

// Every border export site, paired with the element and pseudo that paints it.
const BORDER_EXPORT_SITES = [
  { name: 'border(65)', selector: '#rail-h-65', pseudo: '::before', call: ['border', 65, { dir: 'h' }] },
  { name: 'border(65, v)', selector: '#rail-v-65', pseudo: '::after', call: ['border', 65, { dir: 'v' }] },
  { name: "border('black')", selector: '#rail-black', pseudo: '::before', call: ['border', 'black', { dir: 'h' }] },
  { name: 'divider()', selector: '#rail-divider', pseudo: null, call: ['divider', null, {}] },
];

async function setScreenClasses(page, classes) {
  await page.evaluate((nextClasses) => {
    document.querySelector('[data-runtime-test-screen]').className = ['screen', ...nextClasses].join(' ');
  }, classes);
}

// bin/rails pins APP_PATH to server/, so `dartsass:build` writes every bundle into
// server/app/assets/builds and the page under test is served from there. Theme copies
// under app/assets/builds and public/css/latest are release-era artifacts that a rebuild
// never refreshes, so reading them would pair a fresh plugins.css with a stale theme.
async function loadTheme(page, id) {
  const themePath = new URL(`../../../server/app/assets/builds/themes/${id}-theme.css`, import.meta.url);
  let themeCss;
  try {
    themeCss = await readFile(themePath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (!themeCss) {
    throw new Error(`${id} theme build was not found at ${themePath.pathname}. Run \`bin/rails dartsass:build\`.`);
  }
  await page.route(`**/__runtime-test__/${id}-theme.css`, (route) => route.fulfill({
    body: themeCss,
    contentType: 'text/css',
  }));
  await page.evaluate((themeId) => new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/__runtime-test__/${themeId}-theme.css`;
    link.addEventListener('load', resolve, { once: true });
    link.addEventListener('error', () => reject(new Error(`${themeId} theme failed to load`)), { once: true });
    document.head.appendChild(link);
  }), id);
}

async function loadBlackAndYellowTheme(page) {
  await loadTheme(page, 'black-and-yellow');
}

async function paintParitySnapshot(page) {
  return page.evaluate(() => {
    const screen = document.querySelector('[data-runtime-test-screen]');
    const context = document.querySelector('#paint-context');
    const transparent = new Set(['transparent', 'rgba(0, 0, 0, 0)']);
    const nullableColor = (value) => transparent.has(value) ? null : value;
    const nullableImage = (value) => !value || value === 'none' ? null : value;
    const firstUrl = (image) => {
      if (!image || image === 'none') return null;
      const match = /url\((['"]?)([\s\S]*?)\1\)/.exec(image);
      return match ? match[2] : null;
    };
    const expectedFill = (style, colorProperty) => {
      const image = nullableImage(style.backgroundImage);
      const url = firstUrl(style.backgroundImage);
      let size = parseFloat(style.backgroundSize);
      if (!(size > 0)) size = null;
      if (url && size == null) {
        const fallback = parseFloat(getComputedStyle(screen).getPropertyValue('--dither-bg-size'));
        if (fallback > 0) size = fallback;
      }
      return {
        color: nullableColor(style[colorProperty]),
        image,
        url,
        size,
      };
    };
    const borderStyle = getComputedStyle(document.querySelector('#border-probe'), '::before');
    const borderVar = (suffix) => {
      const value = borderStyle.getPropertyValue(`--framework-border-render-${suffix}`).trim();
      return value && value !== 'none' ? value : null;
    };
    const expectedBorder = {
      color: nullableColor(borderStyle.backgroundColor),
      image: nullableImage(borderStyle.backgroundImage),
      url: firstUrl(borderStyle.backgroundImage),
      size: borderStyle.backgroundSize || null,
      position: borderStyle.backgroundPosition || null,
      repeat: borderStyle.backgroundRepeat || null,
      render: {
        stroke: borderVar('stroke'),
        width: borderVar('width'),
        height: borderVar('height'),
        viewBox: borderVar('view-box'),
        path1: borderVar('path-1'),
        color1: borderVar('color-1'),
        path2: borderVar('path-2'),
        color2: borderVar('color-2'),
      },
      dir: 'h',
    };
    const typeStyle = getComputedStyle(document.querySelector('#type-probe'));
    const expectedType = {
      fontFamily: typeStyle.fontFamily,
      fontSize: typeStyle.fontSize,
      fontWeight: typeStyle.fontWeight,
      lineHeight: typeStyle.lineHeight,
      color: typeStyle.color,
      backgroundColor: typeStyle.backgroundColor,
      backgroundImage: typeStyle.backgroundImage,
      backgroundSize: typeStyle.backgroundSize,
      backgroundPosition: typeStyle.backgroundPosition,
      backgroundRepeat: typeStyle.backgroundRepeat,
      clip: typeStyle.backgroundClip || typeStyle.webkitBackgroundClip || null,
    };
    const type = window.TRMNLPaint.type('value', { el: context });

    return {
      screenClass: screen.className,
      bg: {
        actual: window.TRMNLPaint.bg('gray-40', { el: context }),
        expected: expectedFill(getComputedStyle(document.querySelector('#bg-probe')), 'backgroundColor'),
      },
      text: {
        actual: window.TRMNLPaint.text('muted', { el: context }),
        expected: expectedFill(getComputedStyle(document.querySelector('#text-probe')), 'color'),
      },
      border: {
        actual: window.TRMNLPaint.border(65, { el: context }),
        expected: expectedBorder,
      },
      type: {
        actual: Object.fromEntries(Object.keys(expectedType).map((key) => [key, type[key]])),
        expected: expectedType,
      },
    };
  });
}

test('resolves paint from live CSS across bit depth, dark mode, and a theme', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, paintFixture);

  const contexts = [
    ['screen--1bit'],
    ['screen--1bit', 'screen--dark-mode'],
    ['screen--2bit'],
  ];
  const snapshots = [];

  for (const classes of contexts) {
    await setScreenClasses(page, classes);
    const snapshot = await paintParitySnapshot(page);
    expect(snapshot.bg.actual).toEqual(snapshot.bg.expected);
    expect(snapshot.text.actual).toEqual(snapshot.text.expected);
    expect(snapshot.border.actual).toEqual(snapshot.border.expected);
    expect(snapshot.type.actual).toEqual(snapshot.type.expected);
    expect(snapshot.bg.actual.color || snapshot.bg.actual.image).toBeTruthy();
    expect(snapshot.text.actual.color || snapshot.text.actual.image).toBeTruthy();
    expect(snapshot.type.actual.fontSize).toBeTruthy();
    snapshots.push(snapshot);
  }

  await loadBlackAndYellowTheme(page);
  await setScreenClasses(page, ['screen--2bit', 'screen--theme-black-and-yellow']);
  const themed = await paintParitySnapshot(page);
  expect(themed.bg.actual).toEqual(themed.bg.expected);
  expect(themed.text.actual).toEqual(themed.text.expected);
  expect(themed.border.actual).toEqual(themed.border.expected);
  expect(themed.type.actual).toEqual(themed.type.expected);

  expect(themed.bg.actual).not.toEqual(snapshots[2].bg.actual);
  expect(snapshots[0].bg.actual).not.toEqual(snapshots[1].bg.actual);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('inverse flips the screen paint cascade for one subtree', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, paintFixture);

  // The last five names belong to private families the renamer takes, so the processed
  // bundle spells them differently. Read raw they resolve to nothing there, and a probe
  // comparing '' against '' passes whatever the paint did, which is the release gate
  // silently losing the checks live mode still runs. Every name goes through the rename
  // map before the page sees it.
  const paintProperties = await Promise.all(
    [
      '--framework-semantic-canvas-bg-color',
      '--framework-semantic-canvas-bg-image',
      '--framework-semantic-surface-bg-color',
      '--framework-semantic-backdrop-bg-color',
      '--framework-semantic-fill-strong-bg-color',
      '--framework-semantic-fill-muted-bg-color',
      '--framework-semantic-fill-soft-bg-color',
      '--framework-semantic-text-primary-text-color',
      '--framework-semantic-text-primary-text-image',
      '--framework-semantic-text-secondary-text-color',
      '--framework-semantic-text-inverse-text-color',
      '--framework-semantic-stroke-contrast-stroke-color',
      '--framework-semantic-border-strong-border-color',
      '--framework-semantic-border-muted-border-color',
      '--framework-semantic-icon-color',
      '--framework-semantic-icon-image',
      '--framework-canvas-bg',
      '--framework-surface-bg',
      '--framework-backdrop-bg',
      '--framework-text-primary',
      '--framework-text-secondary',
      '--framework-text-inverse',
      '--framework-border-strong',
      '--framework-border-muted',
      '--framework-stroke-contrast',
      '--framework-fill-strong',
      '--framework-fill-muted',
      '--framework-fill-soft',
      '--framework-outline-strong',
      '--framework-slot-title-bar-bg-color',
      '--framework-slot-screen-backdrop-bg-image',
      '--framework-slot-item-meta-bg-color',
      '--framework-slot-item-meta-emphasis-2-bg-color',
      '--framework-slot-item-meta-emphasis-3-bg-color',
      '--framework-slot-progress-track-bg-color',
      '--framework-slot-progress-fill-bg-color',
      '--framework-slot-progress-fill-emphasis-2-bg-color',
      '--framework-slot-progress-fill-emphasis-3-bg-color',
      '--framework-slot-progress-dot-bg-color',
      '--framework-slot-progress-dot-current-bg-color',
      '--framework-slot-table-meta-bg-color',
      '--framework-slot-table-meta-device-bg-color',
      '--framework-slot-label-gray-text-color',
      '--framework-slot-table-head-row-border-image',
      '--framework-slot-table-body-row-border-image',
      '--framework-chart-series-0-color',
      '--framework-chart-series-0-image',
      '--bg-gray-25-color',
      '--bg-gray-25-image',
      '--text-gray-25-color',
      '--text-gray-25-image',
      '--stroke-gray-25-color',
      '--border-step-65-h-color',
      '--border-step-65-h-image',
      '--border-token-gray-25-h-color',
      '--border-token-gray-25-h-image',
    ].map((property) => bundleVariable(property.slice(2))),
  );

  const snapshot = () => page.evaluate((properties) => {
    const read = (selector, pseudo = null) => {
      const style = getComputedStyle(document.querySelector(selector), pseudo);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
      };
    };
    const custom = (selector, property) => getComputedStyle(document.querySelector(selector))
      .getPropertyValue(property).trim();
    const paintVars = (selector) => Object.fromEntries(
      properties.map((property) => [property, custom(selector, property)]),
    );
    const context = document.querySelector('#inverse-context');
    const resolved = window.TRMNLPaint.bg('gray-25', { el: context });
    const resolvedCanvas = window.TRMNLPaint.semantic('canvas', { el: context });
    const resolvedSeries = window.TRMNLPaint.series(0, 2, { el: context });

    return {
      screen: read('[data-runtime-test-screen]'),
      screenVars: paintVars('[data-runtime-test-screen]'),
      inverse: read('#inverse-context'),
      inverseVars: paintVars('#inverse-context'),
      inverseProbe: read('#inverse-bg-probe'),
      siblingProbe: read('#sibling-bg-probe'),
      inverseTrack: read('#inverse-progress .track'),
      siblingTrack: read('#sibling-progress .track'),
      series0: {
        color: custom('#inverse-context', '--framework-chart-series-0-color'),
        image: custom('#inverse-context', '--framework-chart-series-0-image'),
      },
      screenSeries0: {
        color: custom('[data-runtime-test-screen]', '--framework-chart-series-0-color'),
        image: custom('[data-runtime-test-screen]', '--framework-chart-series-0-image'),
      },
      resolved: {
        color: resolved.color,
        image: resolved.image,
      },
      resolvedCanvas: {
        color: resolvedCanvas.color,
        image: resolvedCanvas.image,
      },
      resolvedSeries: {
        color: resolvedSeries.color,
        image: resolvedSeries.image,
      },
    };
  }, paintProperties);

  const modes = [
    ['screen--1bit'],
    ['screen--2bit'],
    ['screen--4bit'],
    ['screen--8bit'],
    ['screen--16bit'],
    ['screen--color-full'],
    ['screen--color-4bwry'],
    ['screen--color-4bwry', 'screen--preview-colors'],
    ['screen--1bit', 'screen--preview-colors', 'screen--preview-white-limited'],
    ['screen--2bit', 'screen--preview-colors', 'screen--preview-white-limited'],
  ];

  for (const classes of modes) {
    await setScreenClasses(page, classes);
    const light = await snapshot();

    await setScreenClasses(page, [...classes, 'screen--dark-mode']);
    const dark = await snapshot();

    expect(light.inverse).toEqual(dark.screen);
    expect(light.inverseProbe).toEqual(dark.siblingProbe);
    expect(light.inverseTrack).toEqual(dark.siblingTrack);
    expect(light.series0).toEqual(dark.screenSeries0);
    expect(light.inverseVars).toEqual(dark.screenVars);
    expect(light.resolved.color).toBe(light.inverseProbe.backgroundColor);
    expect(light.resolved.image || 'none').toBe(light.inverseProbe.backgroundImage);
    expect(light.resolvedCanvas.color).toBe(light.inverse.backgroundColor);
    expect(light.resolvedCanvas.image || 'none').toBe(light.inverse.backgroundImage);
    expect(light.resolvedSeries.color).toBe(light.series0.color);
    expect(light.resolvedSeries.image || 'none').toBe(light.series0.image || 'none');
    expect(light.siblingProbe).not.toEqual(light.inverseProbe);

    expect(dark.inverse).toEqual(light.screen);
    expect(dark.inverseProbe).toEqual(light.siblingProbe);
    expect(dark.inverseTrack).toEqual(light.siblingTrack);
    expect(dark.inverseVars).toEqual(light.screenVars);
    expect(dark.inverse).not.toEqual(dark.screen);
    expect(dark.inverseProbe).not.toEqual(dark.siblingProbe);
  }

  await setScreenClasses(page, ['screen--1bit']);
  await page.locator('#inverse-context').evaluate((element) => element.classList.add('slot-override'));
  const override = await snapshot();
  expect(override.inverse.backgroundColor).toBe('rgb(1, 2, 3)');
  expect(override.inverseTrack.backgroundColor).toBe('rgb(4, 5, 6)');

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('shipped themes swap their canvas and ink inside inverse subtrees', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, paintFixture);
  await loadTheme(page, 'black-and-yellow');
  await loadTheme(page, 'white-and-red');

  const colors = () => page.evaluate(() => {
    const screen = getComputedStyle(document.querySelector('[data-runtime-test-screen]'));
    const inverse = getComputedStyle(document.querySelector('#inverse-context'));
    return {
      screen: { background: screen.backgroundColor, foreground: screen.color },
      inverse: { background: inverse.backgroundColor, foreground: inverse.color },
    };
  });

  await setScreenClasses(page, ['screen--color-full', 'screen--theme-black-and-yellow']);
  const blackAndYellow = await colors();
  expect(blackAndYellow).toEqual({
    screen: { background: 'rgb(255, 255, 0)', foreground: 'rgb(0, 0, 0)' },
    inverse: { background: 'rgb(0, 0, 0)', foreground: 'rgb(255, 255, 0)' },
  });
  await setScreenClasses(page, [
    'screen--color-full',
    'screen--dark-mode',
    'screen--theme-black-and-yellow',
  ]);
  expect(await colors()).toEqual(blackAndYellow);

  await setScreenClasses(page, ['screen--color-full', 'screen--theme-white-and-red']);
  const whiteAndRed = await colors();
  expect(whiteAndRed).toEqual({
    screen: { background: 'rgb(255, 0, 0)', foreground: 'rgb(255, 255, 255)' },
    inverse: { background: 'rgb(255, 255, 255)', foreground: 'rgb(255, 0, 0)' },
  });
  await setScreenClasses(page, [
    'screen--color-full',
    'screen--dark-mode',
    'screen--theme-white-and-red',
  ]);
  expect(await colors()).toEqual(whiteAndRed);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('black and yellow inverse components keep yellow-forward paint in the BWRY preview', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, paintFixture);
  await loadBlackAndYellowTheme(page);
  await setScreenClasses(page, [
    'screen--1bit',
    'screen--color-4bwry',
    'screen--preview-colors',
    'screen--preview-white-limited',
    'screen--theme-black-and-yellow',
  ]);

  const paints = await page.evaluate(() => {
    const read = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
      };
    };

    return {
      yellow25: read('#inverse-yellow-25'),
      yellow30: read('#inverse-yellow-30'),
      yellow35: read('#inverse-yellow-35'),
      yellow40: read('#inverse-yellow-40'),
      yellow: read('#inverse-yellow'),
      item: read('#inverse-item-meta'),
      item2: read('#inverse-item-meta-2'),
      item3: read('#inverse-item-meta-3'),
      titleBar: read('#inverse-title-bar'),
      progressTrack: read('#inverse-progress .track'),
      progressFill: read('#inverse-progress-fill'),
      progressFill2: read('#inverse-progress-fill-2'),
      progressFill3: read('#inverse-progress-fill-3'),
      progressDot: read('#inverse-progress-dot'),
      progressDotCurrent: read('#inverse-progress-dot-current'),
      progressDotFilled: read('#inverse-progress-dot-filled'),
      labelFilled: read('#inverse-label-filled'),
      labelInverted: read('#inverse-label-inverted'),
      labelFilledColor: getComputedStyle(document.querySelector('#inverse-label-filled')).color,
      labelInvertedColor: getComputedStyle(document.querySelector('#inverse-label-inverted')).color,
    };
  });

  // The theme's inverse block states these slots in literal tokens
  // (black-and-yellow-theme.scss), so each component must paint exactly what
  // the matching bg-- utility paints on the same subtree.
  expect(paints.item).toEqual(paints.yellow25);
  expect(paints.item2).toEqual(paints.yellow30);
  expect(paints.item3).toEqual(paints.yellow35);
  expect(paints.titleBar).toEqual(paints.yellow30);
  expect(paints.progressTrack).toEqual(paints.yellow25);
  expect(paints.progressFill).toEqual(paints.yellow30);
  expect(paints.progressFill2).toEqual(paints.yellow35);
  expect(paints.progressFill3).toEqual(paints.yellow40);
  expect(paints.progressDot).toEqual(paints.yellow25);
  expect(paints.progressDotCurrent).toEqual(paints.yellow35);
  expect(paints.progressDotFilled).toEqual(paints.yellow);
  expect(paints.labelFilled).toEqual(paints.yellow);
  expect(paints.labelInverted).toEqual(paints.yellow);
  expect(paints.labelFilledColor).toBe('rgb(0, 0, 0)');
  expect(paints.labelInvertedColor).toBe('rgb(0, 0, 0)');
  expect(new Set([
    paints.yellow25.backgroundImage,
    paints.yellow30.backgroundImage,
    paints.yellow35.backgroundImage,
    paints.yellow40.backgroundImage,
  ]).size).toBe(4);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('apply helpers write the resolved fill, border, and type longhands', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, paintFixture);
  await setScreenClasses(page, ['screen--2bit']);

  const result = await page.evaluate(() => {
    const context = document.querySelector('#paint-context');
    const fillTarget = document.querySelector('#apply-fill');
    const borderTarget = document.querySelector('#apply-border');
    const typeTarget = document.querySelector('#apply-type');
    const fill = window.TRMNLPaint.bg('gray-40', { el: context });
    const border = window.TRMNLPaint.border(65, { el: context });
    const type = window.TRMNLPaint.type('value', { el: context });

    window.TRMNLPaint.apply(fillTarget, fill);
    window.TRMNLPaint.applyBorder(borderTarget, border);
    window.TRMNLPaint.applyType(typeTarget, type);

    const fillStyle = getComputedStyle(fillTarget);
    const borderStyle = getComputedStyle(borderTarget);
    const typeStyle = getComputedStyle(typeTarget);
    const typeKeys = [
      'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color',
      'backgroundColor', 'backgroundImage', 'backgroundSize',
      'backgroundPosition', 'backgroundRepeat',
    ];

    return {
      fill,
      appliedFill: {
        color: fillStyle.backgroundColor,
        image: fillStyle.backgroundImage,
        size: fillStyle.backgroundSize,
        repeat: fillStyle.backgroundRepeat,
      },
      border,
      appliedBorder: {
        color: borderStyle.backgroundColor,
        image: borderStyle.backgroundImage,
        size: borderStyle.backgroundSize,
        position: borderStyle.backgroundPosition,
        repeat: borderStyle.backgroundRepeat,
      },
      type: Object.fromEntries(typeKeys.map((key) => [key, type[key]])),
      appliedType: Object.fromEntries(typeKeys.map((key) => [key, typeStyle[key]])),
    };
  });

  expect(result.appliedFill.color).toBe(result.fill.color || 'rgba(0, 0, 0, 0)');
  expect(result.appliedFill.image).toBe(result.fill.image || 'none');
  if (result.fill.image) {
    expect(result.appliedFill.size).toBe(`${result.fill.size}px`);
    expect(result.appliedFill.repeat).toBe('repeat');
  }
  expect(result.appliedBorder).toEqual({
    color: result.border.color || 'rgba(0, 0, 0, 0)',
    image: result.border.image || 'none',
    size: result.border.size,
    position: result.border.position,
    repeat: result.border.repeat,
  });
  expect(result.appliedType).toEqual(result.type);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('reads every scale from CSS and converts numeric dimensions', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, paintFixture);

  // The two extremes and the identity cover the conversion arithmetic; the
  // in-between factors exercise the same code path at real cost per flip.
  const factors = {
    xxsmall: 0.66,
    regular: 1,
    xxlarge: 1.5,
  };

  for (const [name, modifier] of Object.entries(factors)) {
    await setScreenClasses(page, [
      'screen--4bit',
      'screen--amazon_kindle_2024',
      `screen--scale-${name}`,
    ]);
    const result = await page.evaluate(() => {
      const context = document.querySelector('#paint-context');
      return {
        scale: window.TRMNLPaint.scale({ el: context }),
        contentPx: window.TRMNLPaint.px(40, { el: context }),
        uiPx: window.TRMNLPaint.px([10, 20], { el: context, kind: 'ui' }),
        fontSize: parseFloat(getComputedStyle(document.querySelector('#type-probe')).fontSize),
        itemGap: parseFloat(getComputedStyle(document.querySelector('#scale-item')).gap),
        radius: parseFloat(getComputedStyle(document.querySelector('#bg-probe')).borderRadius),
      };
    });

    expect(result.scale.name).toBe(name);
    expect(result.scale.device).toBeCloseTo(0.8, 4);
    expect(result.scale.modifier).toBeCloseTo(modifier, 4);
    expect(result.scale.content).toBeCloseTo(modifier, 4);
    expect(result.scale.ui).toBeCloseTo(0.8 * modifier, 4);
    expect(result.contentPx).toBeCloseTo(40 * modifier, 4);
    expect(result.uiPx[0]).toBeCloseTo(8 * modifier, 4);
    expect(result.uiPx[1]).toBeCloseTo(16 * modifier, 4);
    expect(result.fontSize).toBeCloseTo(38 * 0.8 * modifier, 4);
    expect(result.itemGap).toBeCloseTo(2 * 0.8 * modifier, 4);
    expect(result.radius).toBeCloseTo(10 * modifier, 4);

    await setScreenClasses(page, ['screen--2bit', `screen--scale-${name}`]);
    const lowDensity = await page.evaluate(() => ({
      valueFontSize: parseFloat(getComputedStyle(document.querySelector('#type-probe')).fontSize),
      smallLabelFontSize: parseFloat(getComputedStyle(document.querySelector('#scale-label')).fontSize),
      progressHeight: parseFloat(getComputedStyle(document.querySelector('#scale-progress .track')).height),
    }));
    expect(lowDensity.valueFontSize).toBeCloseTo(38 * modifier, 4);
    expect(lowDensity.smallLabelFontSize).toBeCloseTo(12 * modifier, 4);
    expect(lowDensity.progressHeight).toBeCloseTo(6 * modifier, 1);
  }

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('composes every text scale with interface scale without changing geometry', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, paintFixture);

  const factors = {
    small: 0.8,
    regular: 1,
    large: 1.25,
    xlarge: 1.5,
  };

  for (const [name, textModifier] of Object.entries(factors)) {
    await setScreenClasses(page, [
      'screen--4bit',
      'screen--amazon_kindle_2024',
      'screen--scale-xsmall',
      `screen--text-scale-${name}`,
    ]);
    const result = await page.evaluate(() => {
      const context = document.querySelector('#paint-context');
      const valueStyle = getComputedStyle(document.querySelector('#type-probe'));
      return {
        scale: window.TRMNLPaint.scale({ el: context }),
        contentPx: window.TRMNLPaint.px(40, { el: context }),
        uiPx: window.TRMNLPaint.px(40, { el: context, kind: 'ui' }),
        textPx: window.TRMNLPaint.px(40, { el: context, kind: 'text' }),
        fontSize: parseFloat(valueStyle.fontSize),
        lineHeight: parseFloat(valueStyle.lineHeight),
        itemGap: parseFloat(getComputedStyle(document.querySelector('#scale-item')).gap),
        progressHeight: parseFloat(getComputedStyle(document.querySelector('#scale-progress .track')).height),
        radius: parseFloat(getComputedStyle(document.querySelector('#bg-probe')).borderRadius),
        strokeWidth: parseFloat(window.TRMNLPaint.strokeSpec('small', { el: context }).width),
      };
    });

    const contentScale = 0.75;
    const uiScale = 0.8 * contentScale;
    const textUiScale = uiScale * textModifier;
    expect(result.scale.name).toBe('xsmall');
    expect(result.scale.textName).toBe(name);
    expect(result.scale.device).toBeCloseTo(0.8, 4);
    expect(result.scale.modifier).toBeCloseTo(0.75, 4);
    expect(result.scale.ui).toBeCloseTo(uiScale, 4);
    expect(result.scale.content).toBeCloseTo(contentScale, 4);
    expect(result.scale.textModifier).toBeCloseTo(textModifier, 4);
    expect(result.scale.textUi).toBeCloseTo(textUiScale, 4);
    expect(result.contentPx).toBeCloseTo(40 * contentScale, 4);
    expect(result.uiPx).toBeCloseTo(40 * uiScale, 4);
    expect(result.textPx).toBeCloseTo(40 * textUiScale, 4);
    expect(result.fontSize).toBeCloseTo(38 * textUiScale, 4);
    expect(result.lineHeight).toBeCloseTo(42 * textUiScale, 4);
    expect(result.itemGap).toBeCloseTo(2 * uiScale, 4);
    expect(result.progressHeight).toBeCloseTo(6 * uiScale, 1);
    expect(result.radius).toBeCloseTo(10 * contentScale, 4);
    expect(result.strokeWidth).toBeCloseTo(2 * contentScale, 1);
  }

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('watch reacts only to screen-signature changes and stop disconnects it', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, paintFixture);

  await page.evaluate(() => {
    const context = document.querySelector('#paint-context');
    window.__TRMNL_PAINT_WATCH_CALLS__ = [];
    window.__TRMNL_STOP_PAINT_WATCH__ = window.TRMNLPaint.watch(context, () => {
      const screen = window.TRMNLPaint.screen(context);
      window.__TRMNL_PAINT_WATCH_CALLS__.push({
        className: screen.className,
        fill: window.TRMNLPaint.bg('gray-40', { el: context }),
      });
    });
  });
  expect(await page.evaluate(() => window.__TRMNL_PAINT_WATCH_CALLS__.length)).toBe(1);

  await page.evaluate(async () => {
    const screen = document.querySelector('[data-runtime-test-screen]');
    screen.classList.add('unrelated-state');
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  expect(await page.evaluate(() => window.__TRMNL_PAINT_WATCH_CALLS__.length)).toBe(1);

  await page.evaluate(() => {
    document.querySelector('[data-runtime-test-screen]').classList.add('screen--dark-mode');
  });
  await expect.poll(() => page.evaluate(() => window.__TRMNL_PAINT_WATCH_CALLS__.length)).toBe(2);
  const activeCalls = await page.evaluate(() => window.__TRMNL_PAINT_WATCH_CALLS__);
  expect(activeCalls[1].className).toContain('screen--dark-mode');
  expect(activeCalls[1].fill).not.toEqual(activeCalls[0].fill);

  await page.evaluate(() => {
    document.querySelector('[data-runtime-test-screen]').classList.add('screen--text-scale-large');
  });
  await expect.poll(() => page.evaluate(() => window.__TRMNL_PAINT_WATCH_CALLS__.length)).toBe(3);
  expect((await page.evaluate(() => window.__TRMNL_PAINT_WATCH_CALLS__))[2].className).toContain('screen--text-scale-large');

  await page.evaluate(async () => {
    window.__TRMNL_STOP_PAINT_WATCH__();
    const screen = document.querySelector('[data-runtime-test-screen]');
    screen.classList.remove('screen--1bit');
    screen.classList.add('screen--2bit');
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  expect(await page.evaluate(() => window.__TRMNL_PAINT_WATCH_CALLS__.length)).toBe(3);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

async function borderExportSnapshot(page, sites, fields) {
  return page.evaluate(async ({ exportSites, renderFields }) => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const context = document.querySelector('#themed-context');
    const transparent = new Set(['transparent', 'rgba(0, 0, 0, 0)']);
    const firstUrl = (image) => {
      if (!image || image === 'none') return null;
      const match = /url\((['"]?)([\s\S]*?)\1\)/.exec(image);
      return match ? match[2] : null;
    };
    const declared = (style, suffix) => {
      const value = style.getPropertyValue(`--framework-border-render-${suffix}`).trim();
      return value && value !== 'none' ? value : null;
    };

    return exportSites.map(({ name, selector, pseudo, call }) => {
      const style = getComputedStyle(document.querySelector(selector), pseudo);
      const render = {};
      for (const [key, suffix] of Object.entries(renderFields)) render[key] = declared(style, suffix);
      const [method, spec, opts] = call;
      const actual = method === 'divider'
        ? window.TRMNLPaint.divider({ ...opts, el: context })
        : window.TRMNLPaint.border(spec, { ...opts, el: context });

      return {
        name,
        actual,
        expected: {
          color: transparent.has(style.backgroundColor) ? null : style.backgroundColor,
          image: !style.backgroundImage || style.backgroundImage === 'none' ? null : style.backgroundImage,
          url: firstUrl(style.backgroundImage),
          size: style.backgroundSize || null,
          position: style.backgroundPosition || null,
          repeat: style.backgroundRepeat || null,
          render,
          dir: opts.dir === 'v' ? 'v' : 'h',
        },
      };
    });
  }, { exportSites: sites, renderFields: fields });
}

// Reading a pseudo-element straight after a screen class flip can hand back the
// style it had before the theme's inherited slot values reached it, so the read
// waits for the frame that recalculates it. TRMNLPaint is unaffected: its probe
// is a fresh element, styled on insertion.
async function underlineRenderSnapshot(page) {
  // The level program belongs to a private family, but the dark theme names it, which
  // makes it contract and keeps its own spelling. The rename map decides either way;
  // same declaration, and the key moves only if the map says it did.
  const levelName = await bundleVariable('border-4-h-render-stroke');

  return page.evaluate(async (level) => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const underline = document.querySelector('#rail-underline');
    const painted = getComputedStyle(underline, '::after');
    const declared = getComputedStyle(underline);
    const screen = getComputedStyle(document.querySelector('[data-runtime-test-screen]'));
    const read = (style, name) => style.getPropertyValue(name).trim();

    return {
      painted: read(painted, '--framework-border-render-stroke'),
      slot: read(declared, '--framework-slot-label-underline-border-render-stroke'),
      level: read(screen, level),
      background: painted.backgroundImage,
    };
  }, levelName);
}

test('every border export site keeps the exported program equal to the painted rail', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, themedChannelFixture);
  await loadTheme(page, 'black-and-yellow');
  await loadTheme(page, 'white-and-red');

  const contexts = [
    ['screen--1bit'],
    ['screen--2bit'],
    ['screen--1bit', 'screen--theme-black-and-yellow'],
    ['screen--2bit', 'screen--theme-black-and-yellow'],
    ['screen--1bit', 'screen--theme-white-and-red'],
    ['screen--2bit', 'screen--theme-white-and-red'],
  ];

  for (const classes of contexts) {
    await setScreenClasses(page, classes);
    const sites = await borderExportSnapshot(page, BORDER_EXPORT_SITES, BORDER_RENDER_FIELDS);
    expect(sites).toHaveLength(BORDER_EXPORT_SITES.length);
    for (const site of sites) {
      expect(site.actual, `${site.name} on ${classes.join(' ')}`).toEqual(site.expected);
      expect(site.actual.render.stroke, `${site.name} stroke on ${classes.join(' ')}`).toBeTruthy();
    }
  }

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('a border slot repaints the renderer program, not only the background', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, themedChannelFixture);
  await loadTheme(page, 'black-and-yellow');
  await loadTheme(page, 'white-and-red');

  // Unthemed: no slot value is declared, so the underline keeps the level-4 art.
  await setScreenClasses(page, ['screen--1bit']);
  const unthemed = await underlineRenderSnapshot(page);
  expect(unthemed.slot).toBe('');
  expect(unthemed.painted).toBe(unthemed.level);

  for (const theme of ['black-and-yellow', 'white-and-red']) {
    for (const depth of ['screen--1bit', 'screen--2bit']) {
      await setScreenClasses(page, [depth, `screen--theme-${theme}`]);
      const themed = await underlineRenderSnapshot(page);
      const where = `${theme} ${depth}`;

      expect(themed.slot, where).not.toBe('');
      expect(themed.painted, where).toBe(themed.slot);
      expect(themed.painted, where).not.toBe(themed.level);
      // The background moved to the theme's token line in the same rule.
      expect(themed.background, where).not.toBe('none');
    }
  }

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('a level remap moves the exported program with the background', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, themedChannelFixture);
  await setScreenClasses(page, ['screen--1bit']);

  const railFill = () => page.evaluate(() => ({
    remapped: window.TRMNLPaint.border(65, { el: document.querySelector('#remap-context') }),
    remappedDivider: window.TRMNLPaint.divider({ el: document.querySelector('#remap-context') }),
    plain: window.TRMNLPaint.border(65, { el: document.querySelector('#rail-h-65') }),
    plainDivider: window.TRMNLPaint.divider({ el: document.querySelector('#rail-divider') }),
  }));

  const before = await railFill();
  expect(before.remapped).toEqual(before.plain);
  expect(before.remappedDivider).toEqual(before.plainDivider);

  await page.evaluate(() => document.querySelector('#remap-context').classList.add('level-remapped'));
  const after = await railFill();

  expect(after.plain).toEqual(before.plain);
  expect(after.plainDivider).toEqual(before.plainDivider);
  expect(after.remapped.color).toBe('rgb(1, 2, 3)');
  expect(after.remapped.render.stroke).toBe('rgb(1, 2, 3)');
  expect(after.remapped.render.path1).toBeNull();
  expect(after.remapped.render.stroke).not.toBe(before.plain.render.stroke);
  // The finding's reachable case: a level remap repaints .divider, so divider()
  // must stop reporting the unthemed level-6 ink.
  expect(after.remappedDivider.color).toBe('rgb(4, 5, 6)');
  expect(after.remappedDivider.render.stroke).toBe('rgb(4, 5, 6)');
  expect(after.remappedDivider.render.stroke).not.toBe(before.plainDivider.render.stroke);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('semantic icon resolves the adaptive image channel under both themes', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, themedChannelFixture);
  await loadTheme(page, 'black-and-yellow');
  await loadTheme(page, 'white-and-red');

  const iconSnapshot = () => page.evaluate(() => {
    const context = document.querySelector('#themed-context');
    const icon = getComputedStyle(document.querySelector('#icon-probe'));
    return {
      fill: window.TRMNLPaint.semantic('icon', { el: context }),
      painted: { color: icon.backgroundColor, image: icon.backgroundImage },
      textPrimary: window.TRMNLPaint.semantic('text-primary', { el: context }),
    };
  });

  for (const classes of [
    ['screen--1bit'],
    ['screen--2bit'],
    ['screen--1bit', 'screen--theme-black-and-yellow'],
    ['screen--2bit', 'screen--theme-black-and-yellow'],
    ['screen--1bit', 'screen--theme-white-and-red'],
    ['screen--2bit', 'screen--theme-white-and-red'],
  ]) {
    await setScreenClasses(page, classes);
    const { fill, painted, textPrimary } = await iconSnapshot();
    const where = classes.join(' ');

    // The channel is real paint, not the empty fill the resolver used to return.
    expect(fill.color || fill.image, where).toBeTruthy();
    // Parity with the element the channel actually paints: the adaptive image
    // carries the channel ink as its background color and its tile as the first
    // background layer, above the under-field gradient.
    expect(fill.color, where).toBe(painted.color);
    expect(painted.image.startsWith(fill.image || 'none'), where).toBe(true);
    // Neither theme root sets the channel, so it still tracks semantic text.
    expect(fill.color, where).toBe(textPrimary.color);
  }

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('watch follows the wrapper mode classes the cascade paints from', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, paintFixture);

  // A limited-palette screen inside a plain wrapper. `.screen--preview-colors
  // .screen.screen--color-<id>` in base/_screen-mode-vars.scss repaints every
  // palette token from the wrapper, so the class that changes the paint never
  // touches the screen.
  await page.evaluate(async () => {
    const screen = document.querySelector('[data-runtime-test-screen]');
    screen.className = 'screen screen--og screen--color-7a';
    const wrapper = document.createElement('div');
    wrapper.id = 'preview-wrapper';
    screen.parentElement.insertBefore(wrapper, screen);
    wrapper.appendChild(screen);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });

  await page.evaluate(() => {
    const context = document.querySelector('#paint-context');
    window.__TRMNL_WRAPPER_WATCH__ = [];
    window.__TRMNL_STOP_WRAPPER_WATCH__ = window.TRMNLPaint.watch(context, () => {
      window.__TRMNL_WRAPPER_WATCH__.push(window.TRMNLPaint.bg('red', { el: context }));
    });
  });
  expect(await page.evaluate(() => window.__TRMNL_WRAPPER_WATCH__.length)).toBe(1);

  await page.evaluate(() => {
    document.querySelector('#preview-wrapper').classList.add('screen--preview-colors');
  });
  await expect.poll(() => page.evaluate(() => window.__TRMNL_WRAPPER_WATCH__.length)).toBe(2);

  const calls = await page.evaluate(() => window.__TRMNL_WRAPPER_WATCH__);
  // The rebuild is not cosmetic: the wrapper swapped the palette for its preview
  // inks, so the fill the callback reads is a different color.
  expect(calls[0].color).toBe('rgb(255, 0, 0)');
  expect(calls[1].color).toBe('rgb(160, 32, 32)');

  // A wrapper class the cascade does not gate on stays silent.
  await page.evaluate(async () => {
    document.querySelector('#preview-wrapper').classList.add('unrelated-wrapper-state');
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  expect(await page.evaluate(() => window.__TRMNL_WRAPPER_WATCH__.length)).toBe(2);

  await page.evaluate(async () => {
    window.__TRMNL_STOP_WRAPPER_WATCH__();
    document.querySelector('#preview-wrapper').classList.remove('screen--preview-colors');
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  expect(await page.evaluate(() => window.__TRMNL_WRAPPER_WATCH__.length)).toBe(2);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('ramp and series walk the slot count CSS publishes', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `${paintFixture.html}<div id="short-slots"></div>`,
    // chart-series-ramp publishes the count beside the slots; overriding it on a
    // subtree is how a shorter ramp would reach the adapter.
    css: '#short-slots { --framework-chart-series-count: 4; }',
    // Solid mode, so each ramp slot is a distinct color rather than a tile over
    // the same white field.
    screenClasses: ['screen--4bit'],
  });

  const result = await page.evaluate(() => {
    const full = window.TRMNLPaint.ramp({ el: '#paint-context' });
    const short = window.TRMNLPaint.ramp({ el: '#short-slots' });
    return {
      publishedCount: getComputedStyle(document.querySelector('.screen'))
        .getPropertyValue('--framework-chart-series-count').trim(),
      fullLength: full.length,
      shortLength: short.length,
      shortColors: short.map((fill) => fill.color),
      fullHead: full.slice(0, 4).map((fill) => fill.color),
      // The base span is 11, so the last of four series lands on slot 11 unless
      // the published count pulls it back to the last slot that exists.
      lastSeries: window.TRMNLPaint.series(3, 4, { el: '#short-slots' }).color,
      lastSlot: short[short.length - 1].color,
      slotElevenColor: full[11].color,
    };
  });

  expect(result.publishedCount).toBe('16');
  expect(result.fullLength).toBe(16);
  expect(result.shortLength).toBe(4);
  expect(result.shortColors).toEqual(result.fullHead);
  expect(result.lastSeries).toBe(result.lastSlot);
  expect(result.lastSeries).not.toBe(result.slotElevenColor);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('full-color screens draw chart series from the color ramp, and a theme still wins', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, paintFixture);
  await loadTheme(page, 'black-and-yellow');

  // The eight color slots and their dark counterparts are the palette
  // base/_screen-mode-vars.scss names; the dark set is its own selection, not a
  // flip, so both are spelled out here rather than derived from each other.
  const lightRamp = [
    '#000000', '#6600CC', '#AA0000', '#EE0077', '#1111FF', '#880088', '#666600', '#00AA00',
  ];
  const darkRamp = [
    '#FFFFFF', '#8811FF', '#CC0000', '#FF1188', '#7777FF', '#AA00AA', '#666600', '#00AA00',
  ];

  const read = () => page.evaluate(() => {
    // The minifier shortens a six-digit hex whose pairs repeat (#6600CC becomes #60c),
    // so a processed bundle hands back the same color in a different spelling. Both
    // spellings normalize to the six-digit uppercase form the ramps are written in.
    const hex = (value) => {
      if (typeof value !== 'string') return value;

      const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(value);
      const full = short ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}` : value;

      return /^#[0-9a-f]{6}$/i.test(full) ? full.toUpperCase() : full;
    };
    const slots = window.TRMNLPaint.ramp({ el: '#paint-context' });
    const screen = document.querySelector('[data-runtime-test-screen]');
    return {
      head: slots.slice(0, 8).map((fill) => hex(fill.color)),
      tail: slots.slice(8).map((fill) => hex(fill.color)),
      images: slots.slice(0, 8).map((fill) => fill.image),
      span: getComputedStyle(screen).getPropertyValue('--framework-chart-series-span').trim(),
      // A four-series chart lands on slots 0, 2, 5 and 7 of a span-7 ramp.
      fourSeries: [0, 1, 2, 3].map((i) => hex(window.TRMNLPaint.series(i, 4, { el: '#paint-context' }).color)),
      inverseHead: window.TRMNLPaint.ramp({ el: '#inverse-context' }).slice(0, 8).map((fill) => hex(fill.color)),
    };
  });

  await setScreenClasses(page, ['screen--color-full']);
  const light = await read();
  expect(light.head).toEqual(lightRamp);
  expect(light.span).toBe('7');
  // Eight is the ceiling on categorical fills, so the ramp stops there instead of
  // repeating a hue: the rest of the slots resolve to empty Fills.
  expect(light.tail).toEqual(Array(8).fill(null));
  expect(light.images).toEqual(Array(8).fill(null));
  expect(light.fourSeries).toEqual(['#000000', '#AA0000', '#880088', '#00AA00']);
  // An inverse subtree is the opposite ground, so it takes the dark selection.
  expect(light.inverseHead).toEqual(darkRamp);

  await setScreenClasses(page, ['screen--color-full', 'screen--dark-mode']);
  const dark = await read();
  expect(dark.head).toEqual(darkRamp);
  expect(dark.fourSeries).toEqual(['#FFFFFF', '#CC0000', '#AA00AA', '#00AA00']);
  expect(dark.inverseHead).toEqual(lightRamp);

  // Grayscale rails keep the shade ladder they always had.
  await setScreenClasses(page, ['screen--4bit']);
  const gray = await read();
  expect(gray.span).toBe('11');
  expect(gray.head).toEqual([
    '#000000', '#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777',
  ]);

  // A theme is a complete color statement, so its ramp outranks the color one in
  // both schemes.
  await setScreenClasses(page, ['screen--color-full', 'screen--theme-black-and-yellow']);
  const themed = await read();
  expect(themed.span).toBe('6');
  expect(themed.head).toEqual([
    '#000000', '#222200', '#444400', '#666600', '#888800', '#AAAA00', '#CCCC00', '#EEEE00',
  ]);
  await setScreenClasses(page, [
    'screen--color-full',
    'screen--dark-mode',
    'screen--theme-black-and-yellow',
  ]);
  expect((await read()).head).toEqual(themed.head);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});
