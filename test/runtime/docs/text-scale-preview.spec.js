import { expect, test } from '@playwright/test';
import { openDocsPage } from '../support/docs-page.js';

test('rebuilds the Weather preview at every Text Scale level without reloading the docs page', async ({ page }) => {
  await openDocsPage(page, '/framework/docs/3.2/text_scale');

  const preview = page.locator('[data-controller~="text-scale-preview"]');
  const slider = preview.locator('input[type="range"]');
  const chips = preview.locator('[data-text-scale-preview-target="scalePreview"]');
  const iframe = preview.locator('iframe[data-trmnl-example="true"]');

  await expect(preview).toHaveCount(1);
  await expect(slider).toHaveAttribute('min', '0');
  await expect(slider).toHaveAttribute('max', '3');
  await expect(slider).toHaveAttribute('step', '1');
  await expect(chips).toHaveCount(4);
  await expect(iframe).toHaveCount(1);
  await expect.poll(() => iframe.evaluate(frame => frame.contentDocument?.readyState)).toBe('complete');

  const weather = await iframe.evaluate((frame) => ({
    title: frame.contentDocument.querySelector('.title_bar .title')?.textContent.trim(),
    instance: frame.contentDocument.querySelector('.title_bar .instance')?.textContent.trim(),
  }));
  expect(weather).toEqual({ title: 'Weather', instance: 'Las Vegas' });

  await preview.scrollIntoViewIfNeeded();
  const initialScrollY = await page.evaluate(() => window.scrollY);
  await iframe.evaluate((frame) => {
    window.__textScalePreviewDocument = frame.contentDocument;
    window.__textScaleOtherDocuments = Array.from(document.querySelectorAll('iframe[data-trmnl-example="true"]'))
      .filter(candidate => candidate !== frame)
      .map(candidate => candidate.contentDocument);
  });

  await slider.evaluate((input) => input.dispatchEvent(new Event('input', { bubbles: true })));
  expect(await iframe.evaluate(frame => frame.contentDocument === window.__textScalePreviewDocument)).toBe(true);

  const options = [
    { name: 'small', label: 'Small', percentage: '80%', multiplier: '0.8' },
    { name: 'regular', label: 'Regular', percentage: '100%', multiplier: '1' },
    { name: 'large', label: 'Large', percentage: '125%', multiplier: '1.25' },
    { name: 'xlarge', label: 'X-Large', percentage: '150%', multiplier: '1.5' },
  ];

  for (const [index, option] of options.entries()) {
    await iframe.evaluate((frame) => {
      window.__textScalePreviewDocument = frame.contentDocument;
    });

    await slider.evaluate((input, value) => {
      input.value = String(value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, index);

    await expect(slider).toHaveAttribute('aria-valuetext', `${option.label}, ${option.percentage}`);
    for (const [chipIndex] of options.entries()) {
      await expect(chips.nth(chipIndex)).toHaveAttribute('data-active', String(chipIndex === index));
    }
    await expect.poll(() => iframe.evaluate(frame => (
      frame.contentDocument !== window.__textScalePreviewDocument && frame.contentDocument?.readyState === 'complete'
    ))).toBe(true);
    await expect.poll(() => iframe.evaluate((frame) => {
      const screen = frame.contentDocument.querySelector('.screen');
      return {
        className: Array.from(screen.classList).find(name => name.startsWith('screen--text-scale-')),
        factor: Number.parseFloat(getComputedStyle(screen).getPropertyValue('--modifier-text-scale')),
      };
    })).toEqual({ className: `screen--text-scale-${option.name}`, factor: Number.parseFloat(option.multiplier) });
    expect(await iframe.evaluate((frame, className) => frame.srcdoc.includes(className), `screen--text-scale-${option.name}`)).toBe(true);
  }

  expect(await page.evaluate(() => window.scrollY)).toBe(initialScrollY);
  expect(page.url()).toContain('/framework/docs/3.2/text_scale');
  expect(await iframe.evaluate((frame) => Array.from(document.querySelectorAll('iframe[data-trmnl-example="true"]'))
    .filter(candidate => candidate !== frame)
    .every((candidate, index) => candidate.contentDocument === window.__textScaleOtherDocuments[index]))).toBe(true);
});
