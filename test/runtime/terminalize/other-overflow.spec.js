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
  .runtime-generic-overflow {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 280px;
    margin: 0;
    padding: 0;
    border: 0;
    gap: 0;
  }

  .runtime-generic-overflow > .runtime-generic-item {
    box-sizing: border-box;
    flex: 0 0 24px;
    width: 100%;
    min-height: 24px;
    height: 24px;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .runtime-table {
    box-sizing: border-box;
    width: 240px;
    margin: 0;
    padding: 0;
    border: 0;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .runtime-table tr,
  .runtime-table th,
  .runtime-table td {
    box-sizing: border-box;
    height: 24px;
    margin: 0;
    padding: 0;
    border: 0;
    line-height: 24px;
  }

  .runtime-zero-height {
    height: 0;
    overflow: hidden;
  }
`;

function genericItems(count) {
  return Array.from({ length: count }, (_, index) => (
    `<div id="generic-item-${index + 1}" class="item runtime-generic-item">Item ${index + 1}</div>`
  )).join('');
}

async function genericSnapshot(page, selector = '#generic-overflow') {
  return page.evaluate((containerSelector) => {
    const container = document.querySelector(containerSelector);
    const authored = Array.from(container.querySelectorAll(':scope > .runtime-generic-item'));
    const visible = authored.filter((item) => getComputedStyle(item).display !== 'none');
    const hidden = authored.filter((item) => getComputedStyle(item).display === 'none');

    return {
      order: authored.map((item) => item.id),
      visibleIds: visible.map((item) => item.id),
      hiddenIds: hidden.map((item) => item.id),
      hiddenMarkers: hidden.map((item) => item.getAttribute('data-hidden-by-overflow')),
      maxHeight: container.style.maxHeight,
      counterCount: container.querySelectorAll(':scope > [data-overflow-label="true"]').length,
      sameReferences: (window.__TRMNL_GENERIC_REFS__ || []).every(
        (item) => document.getElementById(item.id) === item,
      ),
    };
  }, selector);
}

test('generic overflow hides a trailing suffix and restores it when the budget grows', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div id="generic-overflow" class="runtime-generic-overflow" data-overflow="true" data-overflow-max-height="50">
        ${genericItems(5)}
      </div>
    `,
    css: overflowCss,
  });
  await page.evaluate(() => {
    window.__TRMNL_GENERIC_REFS__ = Array.from(document.querySelectorAll('.runtime-generic-item'));
  });

  await runTerminalize(page);
  const constrained = await genericSnapshot(page);
  const authoredIds = Array.from({ length: 5 }, (_, index) => `generic-item-${index + 1}`);

  expect(constrained.order).toEqual(authoredIds);
  expect(constrained.visibleIds.length).toBeGreaterThan(0);
  expect(constrained.hiddenIds.length).toBeGreaterThan(0);
  expect(constrained.visibleIds).toEqual(authoredIds.slice(0, constrained.visibleIds.length));
  expect(constrained.hiddenIds).toEqual(authoredIds.slice(constrained.visibleIds.length));
  expect(constrained.hiddenMarkers).toEqual(constrained.hiddenIds.map(() => 'true'));
  expect(constrained.sameReferences).toBe(true);

  await page.evaluate(() => {
    document.querySelector('#generic-overflow').setAttribute('data-overflow-max-height', '140');
  });
  await runTerminalize(page);
  const expanded = await genericSnapshot(page);

  expect(expanded.order).toEqual(authoredIds);
  expect(expanded.visibleIds).toEqual(authoredIds);
  expect(expanded.hiddenIds).toEqual([]);
  expect(expanded.sameReferences).toBe(true);

  await runTerminalize(page);
  expect(await genericSnapshot(page)).toEqual(expanded);

  const state = await runtimeSignals(page);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});

function tableMarkup(id, counterAttribute) {
  const rows = Array.from({ length: 6 }, (_, index) => `
    <tr id="${id}-row-${index + 1}" class="runtime-authored-row">
      <td>${id} row ${index + 1}</td>
    </tr>
  `).join('');

  return `
    <table id="${id}" class="table runtime-table" data-table-limit="true" data-table-max-height="96" ${counterAttribute}>
      <thead><tr><th>Heading</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function tableSnapshot(page) {
  return page.evaluate(() => Object.fromEntries(['modern-counter', 'legacy-counter'].map((id) => {
    const table = document.getElementById(id);
    const rows = Array.from(table.querySelectorAll('tbody > .runtime-authored-row'));
    const hidden = rows.filter((row) => getComputedStyle(row).display === 'none');
    const labels = Array.from(table.querySelectorAll('tbody > [data-table-overflow-label="true"]'));
    const references = window.__TRMNL_TABLE_REFS__[id];

    return [id, {
      rowOrder: rows.map((row) => row.id),
      hiddenCount: hidden.length,
      hiddenMarkers: hidden.map((row) => row.getAttribute('data-hidden-by-table-overflow')),
      labelCount: labels.length,
      labelText: labels.map((row) => row.textContent.trim()),
      sameReferences: references.every((row) => document.getElementById(row.id) === row),
    }];
  })));
}

test('modern and legacy table counter attributes produce equivalent, idempotent behavior', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      ${tableMarkup('modern-counter', 'data-table-overflow-counter="true"')}
      ${tableMarkup('legacy-counter', 'table-overflow-counter="true"')}
    `,
    css: overflowCss,
  });
  await page.evaluate(() => {
    window.__TRMNL_TABLE_REFS__ = Object.fromEntries(['modern-counter', 'legacy-counter'].map((id) => [
      id,
      Array.from(document.querySelectorAll(`#${id} tbody > .runtime-authored-row`)),
    ]));
  });

  await runTerminalize(page);
  const first = await tableSnapshot(page);
  await runTerminalize(page);
  const second = await tableSnapshot(page);

  for (const snapshot of Object.values(first)) {
    expect(snapshot.hiddenCount).toBeGreaterThan(0);
    expect(snapshot.hiddenMarkers).toEqual(Array.from({ length: snapshot.hiddenCount }, () => 'true'));
    expect(snapshot.labelCount).toBe(1);
    expect(snapshot.labelText).toEqual([`and ${snapshot.hiddenCount} more`]);
    expect(snapshot.sameReferences).toBe(true);
  }
  expect(first['modern-counter'].hiddenCount).toBe(first['legacy-counter'].hiddenCount);
  expect(second).toEqual(first);

  await page.evaluate(() => {
    document.querySelector('#modern-counter').setAttribute('data-table-overflow-counter', 'false');
    document.querySelector('#legacy-counter').setAttribute('table-overflow-counter', 'false');
  });
  await runTerminalize(page);
  const disabled = await tableSnapshot(page);

  for (const snapshot of Object.values(disabled)) {
    expect(snapshot.hiddenCount).toBeGreaterThan(0);
    expect(snapshot.labelCount).toBe(0);
    expect(snapshot.labelText).toEqual([]);
    expect(snapshot.sameReferences).toBe(true);
  }
  expect(disabled['modern-counter'].hiddenCount).toBe(disabled['legacy-counter'].hiddenCount);

  const state = await runtimeSignals(page);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});

for (const maxHeightAttribute of ['', 'data-table-max-height="120"']) {
  test(`table overflow uses logical heights under screen scaling with ${maxHeightAttribute || 'automatic height'}`, async ({ page }) => {
    const browserSignals = await openRuntimePage(page);
    await mountFixture(page, {
      html: `
        <div class="runtime-scaled-table-parent">
          <table class="table runtime-table" data-table-limit="true" ${maxHeightAttribute}>
            <thead><tr><th>Heading</th></tr></thead>
            <tbody>
              ${Array.from({ length: 6 }, (_, index) => `<tr id="scaled-row-${index + 1}"><td>Row ${index + 1}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      `,
      css: `${overflowCss}
        .runtime-scaled-table-parent {
          box-sizing: border-box;
          width: 240px;
          height: 120px;
        }
      `,
      screenClasses: ['screen--v2', 'screen--scale-xxlarge'],
    });

    await runTerminalize(page);
    const result = await page.evaluate(() => {
      const parent = document.querySelector('.runtime-scaled-table-parent');
      const table = parent.querySelector('table');
      const rows = Array.from(table.querySelectorAll('tbody > tr[id]'));
      const labels = Array.from(table.querySelectorAll('tbody > [data-table-overflow-label="true"]'));

      return {
        parentClientHeight: parent.clientHeight,
        parentRenderedHeight: parent.getBoundingClientRect().height,
        tableFitsParent: table.getBoundingClientRect().height <= parent.getBoundingClientRect().height + 0.01,
        visibleIds: rows.filter((row) => getComputedStyle(row).display !== 'none').map((row) => row.id),
        hiddenIds: rows.filter((row) => getComputedStyle(row).display === 'none').map((row) => row.id),
        labels: labels.map((row) => row.textContent.trim()),
      };
    });

    expect(result).toEqual({
      parentClientHeight: 120,
      parentRenderedHeight: 216,
      tableFitsParent: true,
      visibleIds: ['scaled-row-1', 'scaled-row-2'],
      hiddenIds: ['scaled-row-3', 'scaled-row-4', 'scaled-row-5', 'scaled-row-6'],
      labels: ['and 4 more'],
    });

    const state = await runtimeSignals(page);
    expectStatsConsistent(state);
    expectNoUnexpectedErrors(browserSignals, state);
  });
}

for (const { description, budget, fixtureCss, visibleCount } of [
  {
    description: 'fractional rows',
    budget: 120,
    fixtureCss: `
      .runtime-height-table-parent tr,
      .runtime-height-table-parent th,
      .runtime-height-table-parent td {
        height: 24.4px;
      }
    `,
    visibleCount: 2,
  },
  {
    description: 'bordered content-box rows',
    budget: 128,
    fixtureCss: `
      .runtime-height-table-parent tr {
        box-sizing: content-box;
        height: 24px;
        border: 4px solid;
      }

      .runtime-height-table-parent th,
      .runtime-height-table-parent td {
        box-sizing: border-box;
        height: 16px;
        line-height: 16px;
      }
    `,
    visibleCount: { 1: 3, 1.8: 2 },
  },
]) {
  for (const { scale, screenClasses } of [
    { scale: 1, screenClasses: [] },
    { scale: 1.8, screenClasses: ['screen--v2', 'screen--scale-xxlarge'] },
  ]) {
    for (const budgetMode of ['automatic', 'explicit']) {
      test(`${description} fit the ${budgetMode} height budget at ${scale} scale`, async ({ page }) => {
        const browserSignals = await openRuntimePage(page);
        const maxHeightAttribute = budgetMode === 'explicit' ? `data-table-max-height="${budget}"` : '';
        await mountFixture(page, {
          html: `
            <div class="runtime-height-table-parent">
              <table class="table runtime-table" data-table-limit="true" ${maxHeightAttribute}>
                <thead><tr><th>Heading</th></tr></thead>
                <tbody>
                  ${Array.from({ length: 6 }, (_, index) => `<tr id="height-row-${index + 1}"><td>Row ${index + 1}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          `,
          css: `${overflowCss}
            .runtime-height-table-parent {
              box-sizing: border-box;
              width: 240px;
              height: ${budget}px;
            }

            ${fixtureCss}
          `,
          screenClasses,
        });

        await runTerminalize(page);
        const result = await page.evaluate(() => {
          const parent = document.querySelector('.runtime-height-table-parent');
          const table = parent.querySelector('table');
          const rows = Array.from(table.querySelectorAll('tbody > tr[id]'));
          const labels = Array.from(table.querySelectorAll('tbody > [data-table-overflow-label="true"]'));

          return {
            tableFitsParent: table.getBoundingClientRect().height <= parent.getBoundingClientRect().height + 0.01,
            visibleIds: rows.filter((row) => getComputedStyle(row).display !== 'none').map((row) => row.id),
            hiddenIds: rows.filter((row) => getComputedStyle(row).display === 'none').map((row) => row.id),
            labels: labels.map((row) => row.textContent.trim()),
          };
        });

        const rowIds = Array.from({ length: 6 }, (_, index) => `height-row-${index + 1}`);
        const expectedVisibleCount = typeof visibleCount === 'number' ? visibleCount : visibleCount[scale];
        expect(result).toEqual({
          tableFitsParent: true,
          visibleIds: rowIds.slice(0, expectedVisibleCount),
          hiddenIds: rowIds.slice(expectedVisibleCount),
          labels: [`and ${6 - expectedVisibleCount} more`],
        });

        const state = await runtimeSignals(page);
        expectStatsConsistent(state);
        expectNoUnexpectedErrors(browserSignals, state);
      });
    }
  }
}

for (const { description, budget, firstRowHeight, counterHeight, visibleIds, hiddenIds, labels } of [
  {
    description: 'a tall first row and a shorter counter',
    budget: 125,
    firstRowHeight: 60,
    counterHeight: 20,
    visibleIds: ['counter-row-1', 'counter-row-2'],
    hiddenIds: ['counter-row-3', 'counter-row-4'],
    labels: ['and 2 more'],
  },
  {
    description: 'a counter that cannot fit beside the first row',
    budget: 100,
    firstRowHeight: 80,
    counterHeight: 20,
    visibleIds: ['counter-row-1'],
    hiddenIds: ['counter-row-2', 'counter-row-3', 'counter-row-4'],
    labels: [],
  },
  {
    description: 'a hidden first row and an oversized counter',
    budget: 60,
    firstRowHeight: 120,
    counterHeight: 30,
    visibleIds: ['counter-row-2'],
    hiddenIds: ['counter-row-1', 'counter-row-3', 'counter-row-4'],
    labels: [],
  },
]) {
  test(`table overflow handles ${description} across repeated passes`, async ({ page }) => {
    const browserSignals = await openRuntimePage(page);
    await mountFixture(page, {
      html: `
        <div class="runtime-counter-table-parent">
          <table class="table runtime-table" data-table-limit="true">
            <thead><tr><th>Heading</th></tr></thead>
            <tbody>
              ${Array.from({ length: 4 }, (_, index) => `<tr id="counter-row-${index + 1}"><td>Row ${index + 1}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      `,
      css: `${overflowCss}
        .runtime-counter-table-parent {
          box-sizing: border-box;
          width: 240px;
          height: ${budget}px;
        }

        .runtime-counter-table-parent tr,
        .runtime-counter-table-parent th,
        .runtime-counter-table-parent td {
          height: 20px;
          line-height: 20px;
        }

        .runtime-counter-table-parent tbody > tr:first-child,
        .runtime-counter-table-parent tbody > tr:first-child td {
          height: ${firstRowHeight}px;
        }

        .runtime-counter-table-parent [data-table-overflow-label] .label {
          font-size: 12px;
          line-height: ${counterHeight}px;
        }

        .runtime-counter-table-parent [data-table-overflow-label] td {
          height: ${counterHeight}px;
          line-height: ${counterHeight}px;
        }
      `,
    });
    await page.evaluate(() => {
      window.__TRMNL_COUNTER_REFS__ = Array.from(document.querySelectorAll('.runtime-counter-table-parent tbody > tr[id]'));
    });

    const snapshot = () => page.evaluate(() => {
      const parent = document.querySelector('.runtime-counter-table-parent');
      const table = parent.querySelector('table');
      const rows = Array.from(table.querySelectorAll('tbody > tr[id]'));
      const labelRows = Array.from(table.querySelectorAll('tbody > [data-table-overflow-label="true"]'));

      return {
        tableFitsParent: table.getBoundingClientRect().height <= parent.getBoundingClientRect().height + 0.01,
        visibleIds: rows.filter((row) => getComputedStyle(row).display !== 'none').map((row) => row.id),
        hiddenIds: rows.filter((row) => getComputedStyle(row).display === 'none').map((row) => row.id),
        labels: labelRows.map((row) => row.textContent.trim()),
        sameReferences: window.__TRMNL_COUNTER_REFS__.every((row) => document.getElementById(row.id) === row),
      };
    });

    await runTerminalize(page);
    const first = await snapshot();
    await runTerminalize(page);
    const second = await snapshot();

    expect(first).toEqual({ tableFitsParent: true, visibleIds, hiddenIds, labels, sameReferences: true });
    expect(second).toEqual(first);

    const state = await runtimeSignals(page);
    expectStatsConsistent(state);
    expectNoUnexpectedErrors(browserSignals, state);
  });
}

test('a zero-height overflow budget hides but never removes authored nodes', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div class="runtime-zero-height">
        <div id="generic-overflow" class="runtime-generic-overflow" data-overflow="true" data-overflow-max-height="auto">
          ${genericItems(4)}
        </div>
      </div>
    `,
    css: overflowCss,
  });
  await page.evaluate(() => {
    window.__TRMNL_GENERIC_REFS__ = Array.from(document.querySelectorAll('.runtime-generic-item'));
  });

  await runTerminalize(page);
  const first = await genericSnapshot(page);
  await runTerminalize(page);
  const second = await genericSnapshot(page);

  const authoredIds = Array.from({ length: 4 }, (_, index) => `generic-item-${index + 1}`);
  expect(first.order).toEqual(authoredIds);
  expect(first.visibleIds).toEqual([]);
  expect(first.hiddenIds).toEqual(authoredIds);
  expect(first.hiddenMarkers).toEqual(authoredIds.map(() => 'true'));
  expect(first.counterCount).toBe(0);
  expect(first.sameReferences).toBe(true);
  expect(second).toEqual(first);

  const state = await runtimeSignals(page);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});

test('falls back to the English counter when a host ships an I18n global without andXMore', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  // What a host page's own i18n library looks like to the runtime: the global exists, the
  // method the counter wants does not.
  await page.evaluate(() => { window.I18n = { t: (key) => key }; });
  await mountFixture(page, {
    html: `
      <div id="generic-overflow" class="runtime-generic-overflow" data-overflow="true" data-overflow-counter="true" data-overflow-max-height="50">
        ${genericItems(5)}
      </div>
      ${tableMarkup('modern-counter', 'data-table-overflow-counter="true"')}
      ${tableMarkup('legacy-counter', 'table-overflow-counter="true"')}
    `,
    css: overflowCss,
  });
  await page.evaluate(() => {
    window.__TRMNL_TABLE_REFS__ = Object.fromEntries(['modern-counter', 'legacy-counter'].map((id) => [
      id,
      Array.from(document.querySelectorAll(`#${id} tbody > .runtime-authored-row`)),
    ]));
  });

  await runTerminalize(page);

  const generic = await genericSnapshot(page);
  expect(generic.counterCount).toBe(1);
  expect(await page.locator('#generic-overflow [data-overflow-label="true"]').innerText())
    .toBe(`and ${generic.hiddenIds.length} more`);

  for (const snapshot of Object.values(await tableSnapshot(page))) {
    expect(snapshot.hiddenCount).toBeGreaterThan(0);
    expect(snapshot.labelText).toEqual([`and ${snapshot.hiddenCount} more`]);
  }

  const state = await runtimeSignals(page);
  expectStatsConsistent(state);
  expectNoUnexpectedErrors(browserSignals, state);
});

test('records a table engine failure in the stats instead of reporting a clean pass', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  // A host contract that throws is the one lever a page has over the middle of the table
  // engine, so it stands in for any DOM the engine cannot handle.
  await page.evaluate(() => {
    window.I18n = { andXMore() { throw new Error('host i18n exploded'); } };
  });
  await mountFixture(page, {
    html: tableMarkup('modern-counter', 'data-table-overflow-counter="true"'),
    css: overflowCss,
  });

  await runTerminalize(page);

  const state = await runtimeSignals(page);
  expect(state.lastStats.errors).toEqual([
    { engine: 'Table overflow', message: 'host i18n exploded' },
  ]);
  // The pass still finishes, and the rows the engine hid before the throw stay hidden.
  expect(state.ready).toBe(true);
  expect(await page.locator('#modern-counter tbody > tr[data-hidden-by-table-overflow="true"]').count())
    .toBeGreaterThan(0);
  expect(browserSignals.consoleErrors).toHaveLength(1);
  expect(browserSignals.consoleErrors[0]).toContain('Terminalize Table overflow failed');
  expect(browserSignals.pageErrors).toEqual([]);
});
