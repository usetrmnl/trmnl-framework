import { expect, test } from '@playwright/test';

// Every released version whose composed bg--/text-- rule needed re-emitting, plus the one
// after them as a control. These are frozen bundles, so the list only grows if a release is
// re-cut with the same fault; the rspec parity spec is what watches for that.
const VERSIONS = ['3.0.5', '3.1.1', '3.1.2', '3.1.3', '3.1.4', '3.1.5', '3.1.6', '3.1.7', '3.1.8', '3.2.0'];

// One case per family of palette, because they fail differently: a colour palette used to
// paint the whole element with the ink tile, a tiled greyscale one used to paint nothing.
// The variant case is the rest of the rule's selector list, which is most of it: the gates
// are emitted after the plain pair, so they are what a length limit takes first.
const CASES = [
  { name: 'four-colour', screen: 'screen--color-4bwry', bg: 'bg--yellow', text: 'text--black' },
  { name: 'one-bit', screen: 'screen--1bit', bg: 'bg--gray-50', text: 'text--black' },
  { name: 'variant', screen: 'screen--color-4bwry', bg: 'bg--yellow', text: 'sm:text--black' },
];

// Two boxes of the same size, one carrying the bg-- utility alone and one carrying it with a
// text-- utility. Adding a text fill must not change what the box paints, so the pair is the
// assertion: no baseline files, and it holds for any palette on any platform.
//
// The bundle comes from Framework::Static at the path a pinned plugin links, because what
// failed here was a browser's own reading of that file, which reading it cannot catch.
async function openProbes(page, version, testCase) {
  // The host page is served from the suite rather than the app so that only the bundle and
  // its images cross the wire, but it keeps the server's origin, which is what makes the
  // bundle's own /images/ URLs resolve.
  await page.route('**/probe', (route) => route.fulfill({
    contentType: 'text/html',
    body: `
      <link rel="stylesheet" href="/css/${version}/plugins.min.css">
      <body class="environment trmnl" style="margin:0">
        <div class="screen screen--og_plus ${testCase.screen} screen--lg">
          <div class="view view--full">
            <div id="field" class="${testCase.bg}" style="width:200px;height:60px"></div>
            <div id="composed" class="${testCase.bg} ${testCase.text}" style="width:200px;height:60px"></div>
          </div>
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

for (const version of VERSIONS) {
  for (const testCase of CASES) {
    test(`${version} keeps a ${testCase.name} bg-- field under a text-- fill`, async ({ page }) => {
      await openProbes(page, version, testCase);
      const field = await paintOf(page, 'field');
      const composed = await paintOf(page, 'composed');

      expect(composed.image).toContain(field.image);
      expect(composed.color).toBe(field.color);
      // Firefox gives every background layer the first value, so anything but border-box here
      // confines the field to the glyphs there, whatever the rest of the list says.
      expect(composed.firstClip).toBe('border-box');
    });

    test(`${version} paints a ${testCase.name} bg-- field under a text-- fill`, async ({ page }) => {
      await openProbes(page, version, testCase);

      // Firefox reported the computed values above as correct on a bundle that painted a solid
      // black box, so the two browsers disagree about which half of this catches a regression.
      expect(await page.locator('#composed').screenshot())
        .toEqual(await page.locator('#field').screenshot());
    });
  }
}
