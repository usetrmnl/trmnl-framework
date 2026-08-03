import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  expectStatsConsistent,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
  runTerminalize,
} from '../support/runtime-page.js';

const gapFixtureCss = `
  .runtime-gap-outer {
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    width: 338px;
    padding: 0 8px 0 7px;
    border: 0;
    border-left: 1px solid black;
    border-right: 1px solid black;
    gap: 10px;
  }

  .runtime-gap-outer > .column,
  .runtime-gap-nested > .column,
  .runtime-gap-zero > .column {
    box-sizing: border-box;
    flex: 1 1 0;
    min-width: 0;
    width: 0;
  }

  .runtime-gap-nested {
    display: flex;
    width: 100%;
    gap: 10px;
  }

  .runtime-gap-zero {
    box-sizing: border-box;
    display: flex;
    width: 321px;
    gap: 0;
  }
`;

const nestedColumnsMarkup = `
  <div class="columns runtime-gap-outer">
    <div class="column">
      <div class="columns runtime-gap-nested">
        <div class="column">Nested one</div>
        <div class="column">Nested two</div>
      </div>
    </div>
    <div class="column">Outer two</div>
  </div>
`;

async function outerGapSnapshot(page) {
  return page.evaluate(() => {
    const container = document.querySelector('.runtime-gap-outer');
    const columns = Array.from(container.querySelectorAll(':scope > .column'));
    const style = getComputedStyle(container);
    const contentWidth = container.offsetWidth
      - parseFloat(style.paddingLeft)
      - parseFloat(style.paddingRight)
      - parseFloat(style.borderLeftWidth)
      - parseFloat(style.borderRightWidth);

    return {
      inlineGap: container.style.gap,
      computedGap: parseFloat(style.columnGap),
      offsetWidth: container.offsetWidth,
      contentWidth,
      directColumnCount: columns.length,
      directColumnWidths: columns.map((column) => column.getBoundingClientRect().width),
    };
  });
}

test('measures the content box and only direct columns when adjusting column gaps', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: nestedColumnsMarkup,
    css: gapFixtureCss,
  });

  await runTerminalize(page);
  const snapshot = await outerGapSnapshot(page);

  expect(snapshot.offsetWidth).toBe(338);
  expect(snapshot.contentWidth).toBe(321);
  expect(snapshot.directColumnCount).toBe(2);
  expect(snapshot.inlineGap).toBe('11px');
  expect(snapshot.computedGap).toBe(11);
  snapshot.directColumnWidths.forEach((width) => {
    expect(Math.abs(width - Math.round(width))).toBeLessThan(0.001);
  });

  const state = await runtimeSignals(page);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});

test('preserves an intentional zero gap even when it produces fractional columns', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div class="columns runtime-gap-zero">
        <div class="column">One</div>
        <div class="column">Two</div>
      </div>
    `,
    css: gapFixtureCss,
  });

  await runTerminalize(page);

  const snapshot = await page.evaluate(() => {
    const container = document.querySelector('.runtime-gap-zero');
    const widths = Array.from(container.querySelectorAll(':scope > .column'))
      .map((column) => column.getBoundingClientRect().width);
    return {
      inlineGap: container.style.gap,
      computedGap: parseFloat(getComputedStyle(container).columnGap),
      widths,
    };
  });

  expect(snapshot.inlineGap).toBe('');
  expect(snapshot.computedGap).toBe(0);
  expect(snapshot.widths.some((width) => Math.abs(width - Math.round(width)) > 0.001)).toBe(true);

  const state = await runtimeSignals(page);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});

test('clears stale adjusted gaps while hidden or below two direct columns', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: nestedColumnsMarkup,
    css: gapFixtureCss,
  });

  await runTerminalize(page);
  expect((await outerGapSnapshot(page)).inlineGap).toBe('11px');

  await page.evaluate(() => {
    document.querySelector('.runtime-gap-outer').style.display = 'none';
  });
  await runTerminalize(page);
  expect((await outerGapSnapshot(page)).inlineGap).toBe('');

  await page.evaluate(() => {
    const container = document.querySelector('.runtime-gap-outer');
    container.style.display = '';
  });
  await runTerminalize(page);
  expect((await outerGapSnapshot(page)).inlineGap).toBe('11px');

  await page.evaluate(() => {
    const container = document.querySelector('.runtime-gap-outer');
    container.querySelector(':scope > .column:last-child').remove();
  });
  await runTerminalize(page);
  expect((await outerGapSnapshot(page)).inlineGap).toBe('');

  const state = await runtimeSignals(page);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});
