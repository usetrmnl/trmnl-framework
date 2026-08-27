import { expect, test } from '@playwright/test';
import { openDocsPage } from '../support/docs-page.js';

test('sizes runtime examples from the selected device on initial page load', async ({ page }) => {
  await openDocsPage(page, '/framework/docs/3.3/overflow');

  await expect.poll(() => page.evaluate(() => {
    const element = document.querySelector('[data-controller~="fancy-screen-picker"]');
    return Boolean(
      element && window.Stimulus
        .getControllerForElementAndIdentifier(element, 'fancy-screen-picker')?.picker
    );
  })).toBe(true);

  const iframes = page.locator('iframe[data-trmnl-example="true"]');
  await expect.poll(() => iframes.count()).toBeGreaterThan(1);

  await expect.poll(() => page.evaluate(() => {
    const pickerElement = document.querySelector('[data-controller~="fancy-screen-picker"]');
    const picker = window.Stimulus
      .getControllerForElementAndIdentifier(pickerElement, 'fancy-screen-picker')
      .picker;
    const expectedWidth = `${picker.state.width}px`;
    const expectedHeight = `${picker.state.height}px`;
    const frames = Array.from(document.querySelectorAll('iframe[data-trmnl-example="true"]'));

    return frames.length > 1 && frames.every(frame => (
      frame.style.width === expectedWidth && frame.style.height === expectedHeight
    ));
  })).toBe(true);
});

test('preserves Text Scale modifiers when the picker rewrites example screens', async ({ page }) => {
  await openDocsPage(page, '/framework/docs/3.3/text_scale');

  const iframes = page.locator('iframe[data-trmnl-example="true"]');
  await expect.poll(() => iframes.count()).toBeGreaterThan(0);

  await page.locator('[data-controller~="text-scale-preview"] input[type="range"]').evaluate((input) => {
    input.value = '2';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect.poll(() => page.evaluate(() => Array.from(
    document.querySelectorAll('iframe[data-trmnl-example="true"]'),
    frame => frame.contentDocument.querySelector('.screen')?.classList.contains('screen--text-scale-large'),
  ).some(Boolean))).toBe(true);

  const before = await page.evaluate(() => {
    const frames = Array.from(document.querySelectorAll('iframe[data-trmnl-example="true"]'));
    window.__textScalePickerDocuments = frames.map(frame => frame.contentDocument);
    return frames.map(frame => frame.contentDocument.querySelector('.screen')?.className || '');
  });
  expect(before.some(className => className.includes('screen--text-scale-large'))).toBe(true);

  const summary = page.locator('button:has(#fw-device-summary)');
  await expect(summary).toHaveCount(1);
  await summary.click();
  await expect.poll(() => page.evaluate(() => {
    const element = Array.from(document.querySelectorAll('[data-controller~="fancy-screen-picker"]'))
      .find(candidate => candidate.offsetParent !== null);
    return Boolean(
      element && window.Stimulus
        .getControllerForElementAndIdentifier(element, 'fancy-screen-picker')?.picker
    );
  })).toBe(true);
  const isPortrait = await page.evaluate(() => {
    const element = Array.from(document.querySelectorAll('[data-controller~="fancy-screen-picker"]'))
      .find(candidate => candidate.offsetParent !== null);
    const controller = window.Stimulus.getControllerForElementAndIdentifier(element, 'fancy-screen-picker');
    return Boolean(controller.picker.state.isPortrait);
  });
  const orientation = page.locator(
    isPortrait
      ? '[data-fancy-screen-picker-target="landscapeSegment"]:visible'
      : '[data-fancy-screen-picker-target="portraitSegment"]:visible',
  );
  await expect(orientation).toHaveCount(1);
  await orientation.click();

  await expect.poll(() => page.evaluate(() => {
    const previous = window.__textScalePickerDocuments || [];
    const frames = Array.from(document.querySelectorAll('iframe[data-trmnl-example="true"]'));
    return frames.length > 0 && frames.every((frame, index) => frame.contentDocument !== previous[index]);
  })).toBe(true);

  await expect.poll(() => page.evaluate(() => Array.from(
    document.querySelectorAll('iframe[data-trmnl-example="true"]'),
    frame => frame.contentDocument.querySelector('.screen')?.className || '',
  ).some(className => className.includes('screen--text-scale-large')))).toBe(true);
});

test('applies the picker Text Scale select to every example screen and resets it', async ({ page }) => {
  await openDocsPage(page, '/framework/docs/3.3/overflow');

  const iframes = page.locator('iframe[data-trmnl-example="true"]');
  await expect.poll(() => iframes.count()).toBeGreaterThan(1);

  const summary = page.locator('button:has(#fw-device-summary)');
  await expect(summary).toHaveCount(1);
  await summary.click();
  await expect.poll(() => page.evaluate(() => {
    const element = Array.from(document.querySelectorAll('[data-controller~="fancy-screen-picker"]'))
      .find(candidate => candidate.offsetParent !== null);
    return Boolean(
      element && window.Stimulus
        .getControllerForElementAndIdentifier(element, 'fancy-screen-picker')?.picker
    );
  })).toBe(true);

  await page.evaluate(() => {
    const element = Array.from(document.querySelectorAll('[data-controller~="fancy-screen-picker"]'))
      .find(candidate => candidate.offsetParent !== null);
    const select = element.querySelector('[data-text-scale-select]');
    select.value = 'large';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect.poll(() => page.evaluate(() => {
    const frames = Array.from(document.querySelectorAll('iframe[data-trmnl-example="true"]'));
    return frames.length > 1 && frames.every(frame => (
      frame.contentDocument?.querySelector('.screen')?.classList.contains('screen--text-scale-large')
    ));
  })).toBe(true);

  expect(await page.evaluate(() => {
    const key = Object.keys(localStorage).find(candidate => candidate.endsWith('_text_scale'));
    return key ? localStorage.getItem(key) : null;
  })).toBe('large');

  await page.evaluate(() => {
    const element = Array.from(document.querySelectorAll('[data-controller~="fancy-screen-picker"]'))
      .find(candidate => candidate.querySelector('[data-text-scale-select]'));
    const select = element.querySelector('[data-text-scale-select]');
    select.value = 'regular';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect.poll(() => page.evaluate(() => {
    const frames = Array.from(document.querySelectorAll('iframe[data-trmnl-example="true"]'));
    return frames.length > 1 && frames.every(frame => {
      const screen = frame.contentDocument?.querySelector('.screen');
      return screen && !Array.from(screen.classList).some(name => name.startsWith('screen--text-scale-'));
    });
  })).toBe(true);

  expect(await page.evaluate(() => {
    const key = Object.keys(localStorage).find(candidate => candidate.endsWith('_text_scale'));
    return key ? localStorage.getItem(key) : null;
  })).toBe(null);
});

test('seeds the picker Text Scale from the text_scale URL param', async ({ page }) => {
  await openDocsPage(page, '/framework/docs/3.3/overflow?text_scale=large');

  const iframes = page.locator('iframe[data-trmnl-example="true"]');
  await expect.poll(() => iframes.count()).toBeGreaterThan(1);
  await expect.poll(() => page.evaluate(() => {
    const frames = Array.from(document.querySelectorAll('iframe[data-trmnl-example="true"]'));
    return frames.length > 1 && frames.every(frame => (
      frame.contentDocument?.readyState === 'complete' &&
      frame.contentDocument.querySelector('.screen')?.classList.contains('screen--text-scale-large')
    ));
  })).toBe(true);
});

test('refreshes runtime examples without reloading the docs page or losing the active example', async ({ page }) => {
  await openDocsPage(page, '/framework/docs/3.3/overflow');

  const iframes = page.locator('iframe[data-trmnl-example="true"]');
  await expect.poll(() => iframes.count()).toBeGreaterThan(1);

  const anchorIndex = Math.floor((await iframes.count()) / 2);
  const anchor = iframes.nth(anchorIndex);
  await anchor.scrollIntoViewIfNeeded();

  const before = await page.evaluate((index) => {
    const frames = Array.from(document.querySelectorAll('iframe[data-trmnl-example="true"]'));
    const target = frames[index];
    target.scrollIntoView({ block: 'center' });

    window.__devicePickerPageMarker = 'still-here';
    window.__devicePickerDocuments = frames.map(frame => frame.contentDocument);
    window.__devicePickerSizes = frames.map(frame => ({
      width: frame.style.width,
      height: frame.style.height,
    }));
    window.__devicePickerRefreshSnapshots = [];

    const observer = new MutationObserver((records) => {
      if (!records.some(record => record.attributeName === 'srcdoc')) return;
      window.__devicePickerRefreshSnapshots.push(frames.map(frame => ({
        width: frame.style.width,
        height: frame.style.height,
      })));
    });
    frames.forEach(frame => observer.observe(frame, { attributes: true, attributeFilter: ['srcdoc'] }));
    window.__devicePickerRefreshObserver = observer;

    return {
      anchorTop: target.getBoundingClientRect().top,
      scrollTop: window.scrollY,
      sizes: window.__devicePickerSizes,
    };
  }, anchorIndex);

  const summary = page.locator('button:has(#fw-device-summary)');
  await expect(summary).toHaveCount(1);
  await summary.click();

  const portrait = page.locator('[data-fancy-screen-picker-target="portraitSegment"]:visible');
  await expect(portrait).toHaveCount(1);
  await portrait.click();

  await expect.poll(() => page.evaluate(() => {
    const previous = window.__devicePickerDocuments || [];
    const frames = Array.from(document.querySelectorAll('iframe[data-trmnl-example="true"]'));
    return frames.length > 0 && frames.every((frame, index) => frame.contentDocument !== previous[index]);
  })).toBe(true);

  await expect.poll(() => page.evaluate(() => {
    return document.querySelectorAll('iframe[data-trmnl-refreshing="true"]').length;
  })).toBe(0);
  await page.waitForTimeout(500);

  const after = await page.evaluate((index) => {
    window.__devicePickerRefreshObserver?.disconnect();
    const frames = Array.from(document.querySelectorAll('iframe[data-trmnl-example="true"]'));
    return {
      marker: window.__devicePickerPageMarker,
      anchorTop: frames[index].getBoundingClientRect().top,
      scrollTop: window.scrollY,
      sizesDuringRefresh: window.__devicePickerRefreshSnapshots,
    };
  }, anchorIndex);

  expect(after.marker).toBe('still-here');
  expect(after.sizesDuringRefresh.length).toBeGreaterThan(0);
  expect(after.sizesDuringRefresh[0]).toEqual(before.sizes);
  expect(Math.abs(after.anchorTop - before.anchorTop)).toBeLessThanOrEqual(4);
  expect(Math.abs(after.scrollTop - before.scrollTop)).toBeGreaterThan(0);
});

test('does not let iframe state requests rewrite the picker from another tab', async ({ page, context }) => {
  const otherPage = await context.newPage();

  await Promise.all([
    openDocsPage(page, '/framework/docs/3.3/overflow'),
    openDocsPage(otherPage, '/framework/docs/3.3/overflow'),
  ]);

  for (const currentPage of [page, otherPage]) {
    await expect.poll(() => currentPage.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[data-controller~="fancy-screen-picker"]'));
      return elements.length > 1 && elements.every(element => {
        return window.Stimulus.getControllerForElementAndIdentifier(element, 'fancy-screen-picker')?.picker;
      });
    })).toBe(true);
  }

  await otherPage.evaluate(() => {
    const element = document.querySelector('[data-controller~="fancy-screen-picker"]');
    const controller = window.Stimulus.getControllerForElementAndIdentifier(element, 'fancy-screen-picker');
    controller.picker.setParams({ isPortrait: true });
  });

  await page.evaluate(() => {
    window.__devicePickerUnsolicitedChanges = [];
    document.querySelectorAll('[data-controller~="fancy-screen-picker"]').forEach((element, index) => {
      element.addEventListener('trmnl:change', event => {
        window.__devicePickerUnsolicitedChanges.push({
          index,
          origin: event.detail.origin,
          isPortrait: event.detail.isPortrait,
        });
      });
    });

    window.__devicePickerDocuments = Array.from(
      document.querySelectorAll('iframe[data-trmnl-example="true"]')
    ).map(frame => frame.contentDocument);

    document.dispatchEvent(new CustomEvent('trmnl:framework-examples:refresh'));
  });

  await expect.poll(() => page.evaluate(() => {
    const previous = window.__devicePickerDocuments || [];
    const frames = Array.from(document.querySelectorAll('iframe[data-trmnl-example="true"]'));
    return frames.length > 0 && frames.every((frame, index) => frame.contentDocument !== previous[index]);
  })).toBe(true);

  await expect.poll(() => page.evaluate(() => {
    return document.querySelectorAll('iframe[data-trmnl-refreshing="true"]').length;
  })).toBe(0);

  const result = await page.evaluate(() => ({
    unsolicitedChanges: window.__devicePickerUnsolicitedChanges,
    orientations: Array.from(document.querySelectorAll('[data-controller~="fancy-screen-picker"]')).map(element => {
      const controller = window.Stimulus.getControllerForElementAndIdentifier(element, 'fancy-screen-picker');
      return controller.picker.state.isPortrait;
    }),
  }));

  expect(result.unsolicitedChanges).toEqual([]);
  expect(result.orientations).toEqual([false, false]);

  await otherPage.close();
});
