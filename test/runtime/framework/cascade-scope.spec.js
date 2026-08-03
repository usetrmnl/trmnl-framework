import { expect, test } from '@playwright/test';
import { mountFixture, openRuntimePage } from '../support/runtime-page.js';

// Two cascade rules that the compiled-CSS specs can only read as text. This
// drives them in a real engine against the live build.
//
// 1. The normalize-layer dither hook matches the framework's own class grammar,
//    `bg--` and `text--`. It used to match `bg-` on a single dash, so a foreign
//    Tailwind class inside a .trmnl subtree picked up pixelated rendering and a
//    dither background-size.
// 2. Gap and Spacing read their channel var through a prefix matcher that also
//    lands on tokens nothing bound. Without a fallback that declaration was
//    invalid at computed-value time and reset the property from the last
//    cascade layer, so a typo erased the value a lower layer had set.
test.describe('cascade scope', () => {
  test.beforeEach(async ({ page }) => {
    await openRuntimePage(page);
  });

  const read = (page, id, properties) => page.evaluate(({ probeId, props }) => {
    const cs = getComputedStyle(document.getElementById(probeId));
    return Object.fromEntries(props.map((property) => [property, cs[property]]));
  }, { probeId: id, props: properties });

  const DITHER = ['imageRendering', 'backgroundSize'];

  test('the dither hook reaches the framework paint utilities only', async ({ page }) => {
    await mountFixture(page, {
      html: `
        <div id="tailwind-bg" class="bg-gray-100"></div>
        <div id="tailwind-white" class="bg-white"></div>
        <div id="framework-bg" class="bg--black"></div>
        <div id="framework-text" class="text--black"></div>
      `,
    });

    // A foreign bg- class is left alone: image-rendering stays at its initial
    // value and background-size is not pinned to the dither tile.
    for (const id of ['tailwind-bg', 'tailwind-white']) {
      expect(await read(page, id, DITHER)).toEqual({ imageRendering: 'auto', backgroundSize: 'auto' });
    }

    // The framework's own utilities still get the whole block.
    for (const id of ['framework-bg', 'framework-text']) {
      const paint = await read(page, id, DITHER);
      expect(paint.imageRendering).toBe('crisp-edges');
      expect(paint.backgroundSize).not.toBe('auto');
    }
  });

  test('an unbound gap token leaves the layer below untouched', async ({ page }) => {
    await mountFixture(page, {
      html: `
        <div id="gap-plain" class="layout"></div>
        <div id="gap-typo" class="layout gap--8"></div>
        <div id="gap-out-of-range" class="layout gap--[60px]"></div>
        <div id="gap-prefixed-arbitrary" class="layout md:gap--[25px]"></div>
        <div id="gap-token" class="layout gap--large"></div>
        <div id="gap-arbitrary" class="layout gap--[20px]"></div>
      `,
    });

    // .layout declares gap in tn--base. An unbound gap-- class no longer
    // overrides it: the utilities layer steps aside.
    const inherited = (await read(page, 'gap-plain', ['gap'])).gap;
    expect(inherited).not.toBe('normal');
    for (const id of ['gap-typo', 'gap-out-of-range', 'gap-prefixed-arbitrary']) {
      expect((await read(page, id, ['gap'])).gap).toBe(inherited);
    }

    // A bound token still wins its layer.
    expect((await read(page, 'gap-token', ['gap'])).gap).toBe('20px');
    expect((await read(page, 'gap-arbitrary', ['gap'])).gap).toBe('20px');
  });

  test('an unbound spacing token leaves the layer below untouched', async ({ page }) => {
    await mountFixture(page, {
      html: `
        <div id="pad-plain" class="title_bar"></div>
        <div id="pad-typo" class="title_bar p--999"></div>
        <div id="pad-arbitrary" class="title_bar p--[10px]"></div>
        <div id="pad-x-typo" class="title_bar px--999"></div>
        <div id="pad-token" class="title_bar p--4"></div>
      `,
    });

    // .title_bar declares padding in tn--base.
    const inherited = (await read(page, 'pad-plain', ['padding'])).padding;
    expect(inherited).not.toBe('0px');
    for (const id of ['pad-typo', 'pad-arbitrary', 'pad-x-typo']) {
      expect((await read(page, id, ['padding'])).padding).toBe(inherited);
    }

    expect((await read(page, 'pad-token', ['padding'])).padding).toBe('16px');
  });
});
