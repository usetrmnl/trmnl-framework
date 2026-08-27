import { expect, test } from '@playwright/test';

// The released versions that carry the composed bg--/text-- rule. They are frozen, so this list
// only grows when a release is cut; the rspec parity spec is what watches the rule's size.
const VERSIONS = ['3.0.5', '3.1.1', '3.1.2', '3.1.3', '3.1.4', '3.1.5', '3.1.6', '3.1.7', '3.1.8', '3.2.0', '3.3.0'];

// A palette per family, because each reaches the rule through a different set of tokens, plus a
// variant-prefixed pair, which is where most of the rule's selectors live.
const CASES = [
  { name: 'four-colour', screen: 'screen--color-4bwry', bg: 'bg--yellow', text: 'text--black' },
  { name: 'one-bit', screen: 'screen--1bit', bg: 'bg--gray-50', text: 'text--black' },
  { name: 'variant', screen: 'screen--color-4bwry', bg: 'bg--yellow', text: 'sm:text--black' },
];

// A pattern shade, which is the one kind of text fill that cannot share an element with a bg--
// fill. The docs send authors here, so it has to keep working.
const NESTED = { screen: 'screen--color-4bwry', bg: 'bg--yellow', text: 'text--gray-50' };

// The bundle is read over HTTP at the path a pinned plugin links, because what fails here is a
// browser's own reading of that file. The host page is served by the suite so that only the
// bundle and its images cross the wire, but it keeps the server's origin, which is what lets the
// bundle's own /images/ URLs resolve.
async function openProbePage(page, version, probes) {
  await page.route('**/probe', (route) => route.fulfill({
    contentType: 'text/html',
    body: `
      <link rel="stylesheet" href="/css/${version}/plugins.min.css">
      <body class="environment trmnl" style="margin:0">
        <div class="screen screen--og_plus ${probes.screen} screen--lg">
          <div class="view view--full">${probes.html}</div>
        </div>
      </body>
    `,
  }));
  await page.goto('/probe', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
}

function paintOf(page, id) {
  return page.evaluate((probe) => {
    const style = getComputedStyle(document.getElementById(probe));
    return {
      image: style.backgroundImage,
      color: style.backgroundColor,
      firstClip: style.backgroundClip.split(',')[0].trim(),
    };
  }, id);
}

// Two boxes the same size, one with the bg-- utility alone and one with a text-- utility beside
// it. Adding a text fill must not change what the box paints, so the pair is the assertion and
// there are no baseline images to keep per platform.
function composedProbes(testCase) {
  const box = 'style="width:200px;height:60px"';
  return {
    screen: testCase.screen,
    html: `<div id="field" class="${testCase.bg}" ${box}></div>
           <div id="composed" class="${testCase.bg} ${testCase.text}" ${box}></div>`,
  };
}

function nestedProbes() {
  const box = 'style="width:200px;padding:20px 8px"';
  return {
    screen: NESTED.screen,
    html: `<div id="field" class="${NESTED.bg}" ${box}></div>
           <div id="outer" class="${NESTED.bg}" ${box}><span id="ink" class="${NESTED.text}">Mon 8/3</span></div>`,
  };
}

for (const version of VERSIONS) {
  for (const testCase of CASES) {
    test(`${version} declares a ${testCase.name} bg-- fill under a text-- fill`, async ({ page }) => {
      await openProbePage(page, version, composedProbes(testCase));
      const field = await paintOf(page, 'field');
      const composed = await paintOf(page, 'composed');

      expect(composed.image).toContain(field.image);
      expect(composed.color).toBe(field.color);
      // Firefox gives every background layer the first value, so anything but border-box here
      // confines the fill to the glyphs there, whatever the rest of the list says.
      expect(composed.firstClip).toBe('border-box');
    });

    test(`${version} paints a ${testCase.name} bg-- fill under a text-- fill`, async ({ page }) => {
      await openProbePage(page, version, composedProbes(testCase));

      // The declarations above read as correct in Firefox on a bundle it painted wrong, so the
      // pixels are asserted separately.
      expect(await page.locator('#composed').screenshot())
        .toEqual(await page.locator('#field').screenshot());
    });
  }

  test(`${version} keeps both fills when a pattern shade is nested`, async ({ page }) => {
    await openProbePage(page, version, nestedProbes());
    const field = await paintOf(page, 'field');
    const outer = await paintOf(page, 'outer');
    const ink = await paintOf(page, 'ink');

    expect(outer.image).toBe(field.image);
    expect(outer.firstClip).toBe('border-box');
    // The pattern still clips to the glyphs, because that element paints nothing else.
    expect(ink.firstClip).toBe('text');
  });
}
