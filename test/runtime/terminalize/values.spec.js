import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
  runTerminalize,
} from '../support/runtime-page.js';

test('parses and formats grouped decimals using the declared locale', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div class="value-host"><span id="german-value" data-value-format="true" data-value-locale="de-DE">1.234,56 €</span></div>
      <div class="value-host"><span id="us-value" data-value-format="true" data-value-locale="en-US">$1,234.56</span></div>
    `,
    css: `
      [data-runtime-test-fixture] { align-items: flex-start; }
      .value-host { width: 320px; }
      .value-host span { font: 24px/28px Arial, sans-serif; }
    `,
  });

  await runTerminalize(page, 2);

  expect(await page.locator('#german-value').textContent()).toBe('€1.234,56');
  expect(await page.locator('#us-value').textContent()).toBe('$1,234.56');
  expect(await page.locator('#german-value').getAttribute('data-raw-value')).toBe('1.234,56 €');
  expect(await page.locator('#us-value').getAttribute('data-raw-value')).toBe('$1,234.56');
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('shrinks a fitted value when narrow and restores its authored styles when widened', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: '<div id="value-host"><span id="fitted-value" data-fit-value="true">Runtime measurements recover</span></div>',
    css: `
      #value-host { width: 140px; height: 70px; }
      #fitted-value {
        display: inline-block;
        font-family: Arial, sans-serif;
        font-size: 42px;
        font-weight: 400;
        line-height: 42px;
      }
    `,
  });

  await runTerminalize(page);

  const narrow = await page.locator('#fitted-value').evaluate((element) => ({
    fontSize: parseFloat(getComputedStyle(element).fontSize),
    inlineFontSize: element.style.fontSize,
    width: element.getBoundingClientRect().width,
    containerWidth: element.parentElement.getBoundingClientRect().width,
  }));
  expect(narrow.fontSize).toBeLessThan(42);
  expect(narrow.inlineFontSize).not.toBe('');
  expect(narrow.width).toBeLessThanOrEqual(narrow.containerWidth + 2);

  await page.locator('#value-host').evaluate((element) => { element.style.width = '700px'; });
  await runTerminalize(page);

  const wide = await page.locator('#fitted-value').evaluate((element) => ({
    fontSize: parseFloat(getComputedStyle(element).fontSize),
    inline: {
      fontSize: element.style.fontSize,
      fontWeight: element.style.fontWeight,
      lineHeight: element.style.lineHeight,
      variation: element.style.fontVariationSettings,
    },
    width: element.getBoundingClientRect().width,
    containerWidth: element.parentElement.getBoundingClientRect().width,
  }));
  expect(wide.fontSize).toBe(42);
  expect(wide.inline).toEqual({ fontSize: '', fontWeight: '', lineHeight: '', variation: '' });
  expect(wide.width).toBeLessThanOrEqual(wide.containerWidth + 2);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('formats data-value-type="number" the same way as data-value-format="true"', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div class="value-host"><span id="typed-value" data-value-type="number">2345678</span></div>
      <div class="value-host"><span id="flagged-value" data-value-format="true">2345678</span></div>
      <div class="value-host"><span id="typed-locale-value" data-value-type="number" data-value-locale="de-DE">1.234,56 €</span></div>
      <div class="value-host"><span id="other-type-value" data-value-type="currency">2345678</span></div>
    `,
    css: `
      [data-runtime-test-fixture] { align-items: flex-start; }
      .value-host { width: 90px; }
      .value-host span { font: 24px/28px Arial, sans-serif; }
    `,
  });

  await runTerminalize(page, 2);

  const typed = await page.locator('#typed-value').textContent();
  expect(typed).toBe(await page.locator('#flagged-value').textContent());
  expect(typed).not.toBe('2345678');
  expect(await page.locator('#typed-value').getAttribute('data-raw-value')).toBe('2345678');
  expect(await page.locator('#typed-locale-value').textContent()).toBe('€1.234,56');
  expect(await page.locator('#other-type-value').textContent()).toBe('2345678');
  expect(await page.locator('#other-type-value').getAttribute('data-raw-value')).toBe(null);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

// Only a leading sign is a sign. Dates, ranges, ticket numbers and phone-shaped strings
// all carry an interior hyphen, and a substring test turned every one of them into a
// negative number on the screen.
test('takes the sign from the parsed number, not from a hyphen anywhere in the value', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div class="value-host"><span id="date-value" data-value-type="number">2024-01-15</span></div>
      <div class="value-host"><span id="range-value" data-value-type="number">12-34</span></div>
      <div class="value-host"><span id="phone-value" data-value-type="number">555-0123</span></div>
      <div class="value-host"><span id="grouped-value" data-value-type="number">1,234.56</span></div>
      <div class="value-host"><span id="signed-value" data-value-type="number">-1234</span></div>
      <div class="value-host"><span id="signed-currency" data-value-type="number">-$1,234.56</span></div>
      <div class="value-host"><span id="trailing-currency" data-value-type="number">$-1,234.56</span></div>
    `,
    css: `
      [data-runtime-test-fixture] { align-items: flex-start; flex-wrap: wrap; }
      .value-host { width: 320px; }
      .value-host span { font: 16px/20px Arial, sans-serif; }
    `,
  });

  await runTerminalize(page, 2);

  const rendered = await page.evaluate(() => Object.fromEntries(
    ['date-value', 'range-value', 'phone-value', 'grouped-value', 'signed-value', 'signed-currency', 'trailing-currency']
      .map((id) => [id, document.getElementById(id).textContent]),
  ));

  expect(rendered['date-value']).toBe('2,024');
  expect(rendered['range-value']).toBe('12');
  expect(rendered['phone-value']).toBe('555');
  expect(rendered['grouped-value']).toBe('1,234.56');
  // A real leading sign still survives, wherever the currency symbol sits.
  expect(rendered['signed-value']).toBe('-1,234');
  expect(rendered['signed-currency']).toBe('-$1,234.56');
  expect(rendered['trailing-currency']).toBe('-$1,234.56');
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});
