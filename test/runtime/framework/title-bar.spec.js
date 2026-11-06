import { expect, test } from '@playwright/test';
import { mountFixture, openRuntimePage } from '../support/runtime-page.js';

for (const [screenName, deviceClasses] of [['TRMNL OG', []], ['TRMNL X', ['screen--v2']]]) {
  for (const [bleedName, bleedClasses] of [['bleed', []], ['no-bleed', ['screen--no-bleed']]]) {
    test(`keeps the full view's title bar at its own height on ${screenName} with ${bleedName}`, async ({ page }) => {
      await openRuntimePage(page);
      await mountFixture(page, {
        html: '<div class="view view--full"><div class="layout"><span class="title">Content</span></div><div class="title_bar"><span class="title">Title</span></div></div>',
        css: '.screen { --pixel-ratio: 1 !important; }',
        screenClasses: [...deviceClasses, ...bleedClasses],
      });

      const result = await page.locator('.title_bar').evaluate((titleBar) => {
        const probe = titleBar.parentElement.appendChild(document.createElement('div'));
        probe.style.cssText = 'position: absolute; height: var(--title-bar-height);';
        return { height: titleBar.getBoundingClientRect().height, expected: probe.getBoundingClientRect().height };
      });
      expect(result.height).toBeCloseTo(result.expected, 1);
    });
  }
}

test.describe('long title bar text', () => {
  const LONG = 'Living Room Calendar for the Whole Family and Friends';

  const measure = (page) => page.locator('.title_bar').evaluate((titleBar) => {
    const bar = titleBar.getBoundingClientRect();
    const box = (selector) => {
      const element = titleBar.querySelector(selector);
      const rect = element.getBoundingClientRect();
      return { right: rect.right, truncated: element.scrollWidth > element.clientWidth, overflow: getComputedStyle(element).overflowX };
    };
    return { barRight: bar.right, title: box('.title'), instance: box('.instance') };
  });

  const mount = (page, title, instance) => mountFixture(page, {
    html: `<div class="view view--half_vertical"><div class="layout"></div><div class="title_bar"><span class="title">${title}</span><span class="instance">${instance}</span></div></div>`,
  });

  test.beforeEach(async ({ page }) => {
    await openRuntimePage(page);
  });

  test('cuts a long instance with an ellipsis inside the bar and keeps the title whole', async ({ page }) => {
    await mount(page, 'Calendar', LONG);
    const result = await measure(page);

    expect(result.instance.overflow).not.toBe('visible');
    expect(result.instance.truncated).toBe(true);
    expect(result.instance.right).toBeLessThanOrEqual(result.barRight);
    expect(result.title.truncated).toBe(false);
  });

  test('cuts a long title with an ellipsis inside the bar', async ({ page }) => {
    await mount(page, LONG, 'Work');
    const result = await measure(page);

    expect(result.title.overflow).not.toBe('visible');
    expect(result.title.truncated).toBe(true);
    expect(result.title.right).toBeLessThanOrEqual(result.barRight);
  });
});
