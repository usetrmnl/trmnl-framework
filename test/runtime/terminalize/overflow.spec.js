import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  expectStatsConsistent,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
  runTerminalize,
} from '../support/runtime-page.js';

const overflowCss = `
  .runtime-overflow {
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    width: 360px;
    padding: 6px 8px;
    border: 2px solid black;
    gap: 10px;
  }

  .runtime-overflow > .column {
    box-sizing: border-box;
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    min-width: 0;
    width: 0;
    gap: 0;
  }

  .runtime-overflow .runtime-item,
  .runtime-overflow [data-overflow-label="true"] {
    box-sizing: border-box;
    flex: 0 0 24px;
    width: 100%;
    min-height: 24px;
    height: 24px;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .runtime-overflow .runtime-divider {
    box-sizing: border-box;
    flex: 0 0 2px;
    width: 100%;
    min-height: 2px;
    height: 2px;
    margin: 0;
    padding: 0;
    border: 0;
    background: black;
  }

  /* A block inside the .columns element that is not one of the engine's columns. */
  .runtime-overflow > .runtime-aside {
    box-sizing: border-box;
    flex: 0 0 0;
    width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }
`;

function itemMarkup(count) {
  return Array.from({ length: count }, (_, index) => (
    `<div id="item-${index + 1}" class="item runtime-item">Item ${index + 1}</div>`
  )).join('');
}

async function retainAuthoredItemReferences(page) {
  await page.evaluate(() => {
    window.__TRMNL_AUTHORED_ITEMS__ = Array.from(document.querySelectorAll('.runtime-item'));
  });
}

async function overflowSnapshot(page) {
  return page.evaluate(() => {
    const container = document.querySelector('.runtime-overflow');
    const columns = Array.from(container.querySelectorAll(':scope > .column'));
    const authored = Array.from(container.querySelectorAll('.runtime-item'));
    const labels = Array.from(container.querySelectorAll('[data-overflow-label="true"]'));

    return {
      directColumnCount: columns.length,
      itemOrder: authored.map((item) => item.id),
      sameReferences: window.__TRMNL_AUTHORED_ITEMS__.every(
        (item) => document.getElementById(item.id) === item,
      ),
      visibleIds: authored
        .filter((item) => getComputedStyle(item).display !== 'none')
        .map((item) => item.id),
      hiddenIds: authored
        .filter((item) => getComputedStyle(item).display === 'none')
        .map((item) => item.id),
      parentColumnById: Object.fromEntries(authored.map((item) => [
        item.id,
        columns.indexOf(item.parentElement),
      ])),
      maxHeight: container.style.maxHeight,
      counterCount: labels.length,
      counterText: labels.map((label) => label.textContent.trim()),
    };
  });
}

test('preserves authored overflow items, identity, order, and placement across reruns', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div class="columns runtime-overflow" data-overflow-cols="2" data-list-max-height="76">
        <div class="column">${itemMarkup(10)}</div>
      </div>
    `,
    css: overflowCss,
  });
  await retainAuthoredItemReferences(page);

  await runTerminalize(page);
  const first = await overflowSnapshot(page);
  await runTerminalize(page);
  const second = await overflowSnapshot(page);

  expect(first.directColumnCount).toBe(2);
  expect(first.itemOrder).toEqual(Array.from({ length: 10 }, (_, index) => `item-${index + 1}`));
  expect(first.sameReferences).toBe(true);
  expect(first.visibleIds.length).toBeGreaterThan(0);
  expect(first.hiddenIds.length).toBeGreaterThan(0);
  expect(second).toEqual(first);

  const state = await runtimeSignals(page);
  expect(state.stats).toHaveLength(2);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});

test('keeps the overflow height budget stable and maintains one accurate counter', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div
        class="columns runtime-overflow"
        data-overflow-cols="2"
        data-overflow-counter="true"
        data-list-max-height="76"
      >
        <div class="column">${itemMarkup(12)}</div>
      </div>
    `,
    css: overflowCss,
  });
  await retainAuthoredItemReferences(page);

  const snapshots = [];
  for (let pass = 0; pass < 3; pass += 1) {
    await runTerminalize(page);
    snapshots.push(await overflowSnapshot(page));
  }

  expect(snapshots[0].hiddenIds.length).toBeGreaterThan(0);
  expect(snapshots[0].counterCount).toBe(1);
  expect(snapshots[0].counterText).toEqual([`and ${snapshots[0].hiddenIds.length} more`]);
  expect(snapshots[0].sameReferences).toBe(true);
  expect(snapshots[1]).toEqual(snapshots[0]);
  expect(snapshots[2]).toEqual(snapshots[0]);

  const state = await runtimeSignals(page);
  expect(state.stats).toHaveLength(3);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});

test('keeps authored dividers only between visible adjacent items in one column', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  const blocks = Array.from({ length: 8 }, (_, index) => {
    const item = `<div id="item-${index + 1}" class="item runtime-item">Item ${index + 1}</div>`;
    if (index === 7) return item;
    return `${item}<div
      id="divider-${index + 1}"
      class="divider runtime-divider"
      data-prev="item-${index + 1}"
      data-next="item-${index + 2}"
    ></div>`;
  }).join('');

  await mountFixture(page, {
    html: `
      <div class="columns runtime-overflow" data-overflow-cols="2" data-list-max-height="76">
        <div class="column">${blocks}</div>
      </div>
    `,
    css: overflowCss,
  });

  const dividerSnapshot = () => page.evaluate(() => {
    const container = document.querySelector('.runtime-overflow');
    const dividers = Array.from(container.querySelectorAll('.runtime-divider'));
    const isVisible = (element) => getComputedStyle(element).display !== 'none';

    return dividers.map((divider) => {
      const previousItem = document.getElementById(divider.dataset.prev);
      const nextItem = document.getElementById(divider.dataset.next);
      const neighborsVisibleTogether = isVisible(previousItem)
        && isVisible(nextItem)
        && previousItem.parentElement === nextItem.parentElement;

      return {
        id: divider.id,
        visible: isVisible(divider),
        hiddenMarker: divider.getAttribute('data-hidden-by-overflow'),
        expectedVisible: neighborsVisibleTogether,
        immediatePrevious: divider.previousElementSibling?.id || null,
        immediateNext: divider.nextElementSibling?.id || null,
        expectedPrevious: neighborsVisibleTogether ? previousItem.id : null,
        expectedNext: neighborsVisibleTogether ? nextItem.id : null,
      };
    });
  });

  await runTerminalize(page);
  const first = await dividerSnapshot();
  await runTerminalize(page);
  const second = await dividerSnapshot();

  expect(first).toHaveLength(7);
  expect(first.some((divider) => divider.visible)).toBe(true);
  expect(first.some((divider) => !divider.visible)).toBe(true);
  first.forEach((divider) => {
    expect(divider.visible).toBe(divider.expectedVisible);
    if (divider.visible) {
      expect(divider.immediatePrevious).toBe(divider.expectedPrevious);
      expect(divider.immediateNext).toBe(divider.expectedNext);
      expect(divider.hiddenMarker).toBeNull();
    } else {
      expect(divider.hiddenMarker).toBe('true');
    }
  });
  expect(second).toEqual(first);

  const state = await runtimeSignals(page);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});

test('honors data-overflow-max-height on .columns, ahead of the legacy budget', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div
        class="columns runtime-overflow"
        data-overflow-cols="1"
        data-overflow-max-height="76"
        data-list-max-height="196"
      >
        <div class="column">${itemMarkup(10)}</div>
      </div>
    `,
    css: overflowCss,
  });
  await retainAuthoredItemReferences(page);

  // The engine writes the resolved budget onto the container, so the applied max-height is
  // the budget it planned with.
  await runTerminalize(page);
  const modern = await overflowSnapshot(page);
  expect(modern.maxHeight).toBe('76px');
  expect(modern.hiddenIds.length).toBeGreaterThan(0);

  await page.locator('.runtime-overflow').evaluate((columns) => {
    columns.removeAttribute('data-overflow-max-height');
  });
  await runTerminalize(page);
  const legacy = await overflowSnapshot(page);
  expect(legacy.maxHeight).toBe('196px');
  expect(legacy.visibleIds.length).toBeGreaterThan(modern.visibleIds.length);

  // 'auto' resolves to the measured budget, the same one an unset override falls back to.
  await page.locator('.runtime-overflow').evaluate((columns) => {
    columns.removeAttribute('data-list-max-height');
  });
  await runTerminalize(page);
  const measured = await overflowSnapshot(page);
  await page.locator('.runtime-overflow').evaluate((columns) => {
    columns.setAttribute('data-overflow-max-height', 'auto');
  });
  await runTerminalize(page);
  expect((await overflowSnapshot(page)).maxHeight).toBe(measured.maxHeight);

  const state = await runtimeSignals(page);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});

test('trims a column to its budget when the real layout is taller than staging', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div class="columns runtime-overflow" data-overflow-cols="1" data-list-max-height="80">
        <div class="column">
          <span id="group" class="label label--base group-header runtime-heading" data-group-header="true">Group</span>
          ${itemMarkup(3)}
        </div>
      </div>
    `,
    // The engine plans against an off-screen staging clone and then enforces the fit on
    // the real DOM. Shrinking the header only in staging is what forces that second pass
    // to run, which is where a header has to be trimmable like any other block.
    css: `
      ${overflowCss}
      .runtime-heading { display: block; flex: 0 0 100px; height: 100px; }
      [data-staging="true"] .runtime-heading { flex: 0 0 10px; height: 10px; }
    `,
  });

  await runTerminalize(page);

  const fit = await page.evaluate(() => {
    const column = document.querySelector('.runtime-overflow > .column');
    const header = document.getElementById('group');

    return {
      // The engine measures scrollHeight, so that is what has to land inside the budget.
      columnHeight: Math.round(column.scrollHeight),
      headerVisible: getComputedStyle(header).display !== 'none',
      strayDuplicates: document.querySelectorAll('[data-duplicate-heading="true"]').length,
    };
  });

  expect(fit.columnHeight).toBeLessThanOrEqual(80);
  expect(fit.headerVisible).toBe(false);
  expect(fit.strayDuplicates).toBe(0);

  const state = await runtimeSignals(page);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});

test('counts hidden items the same way for the counter label and the reported stats', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  // The aside holds an .item that lives inside the .columns element but outside every
  // column the engine plans into. The label used to count the columns and the stats used
  // to count the whole subtree, so this one authored block made them disagree.
  await mountFixture(page, {
    html: `
      <div
        class="columns runtime-overflow"
        data-overflow-cols="2"
        data-overflow-counter="true"
        data-list-max-height="76"
      >
        <div class="column">${itemMarkup(12)}</div>
        <div class="runtime-aside">
          <div id="aside-item" class="item" style="display: none">Aside</div>
        </div>
      </div>
    `,
    css: overflowCss,
  });

  await runTerminalize(page);

  const report = await page.evaluate(() => {
    const container = document.querySelector('.runtime-overflow');
    const label = container.querySelector('[data-overflow-label="true"] .label');
    const overflowStep = window.__TRMNL_LAST_STATS__.steps.find((step) => step.name === 'Overflow engine');

    return {
      labelCount: Number((String(label?.textContent || '').match(/\d+/) || [])[0]),
      statsHidden: overflowStep.hiddenItems,
      hiddenInColumns: Array.from(container.querySelectorAll(':scope > .column .runtime-item'))
        .filter((item) => item.style.display === 'none').length,
      asideUntouched: document.getElementById('aside-item').style.display === 'none',
    };
  });

  expect(report.hiddenInColumns).toBeGreaterThan(0);
  expect(report.labelCount).toBe(report.hiddenInColumns);
  expect(report.statsHidden).toBe(report.hiddenInColumns);
  expect(report.asideUntouched).toBe(true);

  const state = await runtimeSignals(page);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});
