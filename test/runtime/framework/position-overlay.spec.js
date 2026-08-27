import { expect, test } from '@playwright/test';
import { mountFixture, openRuntimePage } from '../support/runtime-page.js';

// The floating-card-over-a-map pattern the Map page publishes, driven in a real
// engine. The compiled-CSS specs can only read the declarations as text, and two
// of the things that decide whether the pattern works are cascade outcomes:
//
// 1. MapLibre's canvas container is `position: absolute; inset: 0` with no
//    stacking level of its own, and the labels TRMNLMaps places sit at 1
//    (components/_map.scss). A card has to clear both.
// 2. `.outline` declares `position: relative` for the pseudo-element that draws
//    its border, in the same cascade layer and at the same weight as `.absolute`.
//    Only the file order in utilities/_index.scss keeps the card out of flow.
test.describe('position utilities', () => {
  // The card exactly as the Map page prints it.
  const CARD = 'absolute top--3 left--3 z--2 p--2 bg--white outline';

  // The DOM a real map ends up with: the author writes the card into the
  // container, then MapLibre appends its canvas container and TRMNLMaps appends
  // the label overlay after it. The card is first in tree order, so only the
  // stacking level puts it on top.
  const MAP = (card) => `
    <div class="map" id="map" style="width:400px;height:240px">
      <div class="${card}" id="card"><span class="label label--small">Depot</span></div>
      <div class="maplibregl-canvas-container" id="canvas"></div>
      <div class="map__labels" id="labels"></div>
    </div>
    <div class="p--3" id="step"></div>
  `;

  test.beforeEach(async ({ page }) => {
    await openRuntimePage(page);
  });

  test('a card marked up per the docs paints above the map canvas', async ({ page }) => {
    await mountFixture(page, { html: MAP(CARD) });

    const topmost = await page.evaluate(() => {
      const box = document.getElementById('card').getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return hit.closest('#card') ? 'card' : hit.id;
    });

    expect(topmost).toBe('card');
  });

  test('a card clears the stacking level the map gives its own overlays', async ({ page }) => {
    await mountFixture(page, { html: MAP(CARD) });

    const levels = await page.evaluate(() => ['card', 'labels'].map(
      (id) => Number(getComputedStyle(document.getElementById(id)).zIndex),
    ));

    expect(levels[0]).toBeGreaterThan(levels[1]);
  });

  test('a corner inset measures the spacing step it names', async ({ page }) => {
    await mountFixture(page, { html: MAP(CARD) });

    const offsets = await page.evaluate(() => {
      const card = getComputedStyle(document.getElementById('card'));
      return { top: card.top, left: card.left, step: getComputedStyle(document.getElementById('step')).paddingLeft };
    });

    expect([offsets.top, offsets.left]).toEqual([offsets.step, offsets.step]);
  });

  test('a corner inset is measured from the map, not from the page', async ({ page }) => {
    await mountFixture(page, { html: MAP(CARD) });

    const corner = await page.evaluate(() => {
      const map = document.getElementById('map').getBoundingClientRect();
      const card = document.getElementById('card').getBoundingClientRect();
      const step = parseFloat(getComputedStyle(document.getElementById('step')).paddingLeft);
      return [Math.round(card.left - map.left - step), Math.round(card.top - map.top - step)];
    });

    expect(corner).toEqual([0, 0]);
  });

  test('inset--0 covers the positioned parent exactly', async ({ page }) => {
    await mountFixture(page, {
      html: `
        <div class="relative" id="frame" style="width:320px;height:180px">
          <div class="absolute inset--0" id="bleed"></div>
        </div>
      `,
    });

    const bleed = await page.evaluate(() => {
      const frame = document.getElementById('frame').getBoundingClientRect();
      const child = document.getElementById('bleed').getBoundingClientRect();
      return [child.left - frame.left, child.top - frame.top, child.width - frame.width, child.height - frame.height];
    });

    expect(bleed).toEqual([0, 0, 0, 0]);
  });

  // The e-ink rule the Map page states: a card over a map takes a solid fill.
  test('the documented fill paints a solid, with no shadow behind it', async ({ page }) => {
    await mountFixture(page, { html: MAP(CARD) });

    const paint = await page.evaluate(() => {
      const card = getComputedStyle(document.getElementById('card'));
      return { backgroundImage: card.backgroundImage, boxShadow: card.boxShadow };
    });

    expect(paint).toEqual({ backgroundImage: 'none', boxShadow: 'none' });
  });

  test('a mid-rail fill behind the same card dithers on 1-bit', async ({ page }) => {
    await mountFixture(page, { html: MAP(CARD.replace('bg--white', 'bg--gray-40')) });

    const backgroundImage = await page.evaluate(
      () => getComputedStyle(document.getElementById('card')).backgroundImage,
    );

    expect(backgroundImage).not.toBe('none');
  });
});
