import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
  runTerminalize,
} from '../support/runtime-page.js';

// 41px is the point of the fixture: the engine only touches odd widths, and it pins the
// span one pixel narrower so a 1-bit panel never renders a half-pixel edge.
const indexCss = `
  .runtime-index {
    box-sizing: border-box;
    display: inline-block;
    width: 41px;
    height: 20px;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .runtime-index-columns {
    box-sizing: border-box;
    display: flex;
    width: 360px;
    margin: 0;
    padding: 0;
    border: 0;
    gap: 0;
  }

  .runtime-index-columns > .column {
    box-sizing: border-box;
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    min-width: 0;
    gap: 0;
  }
`;

const indexItem = (id) => `
  <div class="item">
    <div class="meta"><span id="${id}" class="index runtime-index">1</span></div>
    <div class="content"><span class="value">Item</span></div>
  </div>
`;

const readIndexState = (page) => page.evaluate(() => Array.from(
  document.querySelectorAll('.meta .index'),
  (span) => ({
    id: span.id,
    inlineWidth: span.style.width,
    pinned: span.getAttribute('data-index-width-pinned'),
    measuredWidth: Math.round(span.getBoundingClientRect().width),
  }),
));

const setScreenClasses = (page, classes) => page.evaluate((next) => {
  document.querySelector('[data-runtime-test-screen]').className = next.join(' ');
}, classes);

test('pins odd index widths to even and drops the pins when the screen leaves 1-bit', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      ${indexItem('index-outside')}
      <div class="columns runtime-index-columns" data-overflow-max-cols="2" data-list-max-height="200">
        <div class="column">${indexItem('index-inside')}</div>
      </div>
    `,
    css: indexCss,
  });

  await runTerminalize(page);
  const oneBit = await readIndexState(page);
  expect(oneBit).toEqual([
    { id: 'index-outside', inlineWidth: '40px', pinned: 'true', measuredWidth: 40 },
    { id: 'index-inside', inlineWidth: '40px', pinned: 'true', measuredWidth: 40 },
  ]);

  // The even-width normalization is a 1-bit trick, so a screen that switches into a mode
  // the engine must not run in has to lose the widths instead of freezing them in.
  await setScreenClasses(page, ['screen', 'screen--2bit']);
  await runTerminalize(page);
  expect(await readIndexState(page)).toEqual([
    { id: 'index-outside', inlineWidth: '', pinned: null, measuredWidth: 41 },
    { id: 'index-inside', inlineWidth: '', pinned: null, measuredWidth: 41 },
  ]);

  await setScreenClasses(page, ['screen', 'screen--1bit']);
  await runTerminalize(page);
  expect(await readIndexState(page)).toEqual(oneBit);

  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('leaves an author-set index width alone in a mode it must not run in', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, { html: indexItem('index-authored'), css: indexCss });
  await setScreenClasses(page, ['screen', 'screen--2bit']);
  await page.locator('#index-authored').evaluate((span) => { span.style.width = '37px'; });

  await runTerminalize(page);

  // Only the widths this engine pinned are cleared: the marker is what tells its own
  // write apart from an inline width the plugin author set.
  expect(await readIndexState(page)).toEqual([
    { id: 'index-authored', inlineWidth: '37px', pinned: null, measuredWidth: 37 },
  ]);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});
