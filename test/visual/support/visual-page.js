import { expect } from '@playwright/test';
import { routeProcessedAssets } from '../../support/processed-bundle.js';

export async function openVisualPage(page, path) {
  const pageErrors = [];
  const consoleErrors = [];
  const externalRequests = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    const isLocal = ['127.0.0.1', 'localhost'].includes(url.hostname);
    const isEmbedded = ['blob:', 'data:'].includes(url.protocol);

    if (isLocal || isEmbedded) {
      await route.continue();
      return;
    }

    externalRequests.push(url.href);
    await route.abort();
  });

  // Registered after the guard above so it matches first, and the snapshots stay the
  // committed ones: processed mode passes only when the released bytes paint the same
  // pixels the live build does.
  await routeProcessedAssets(page);

  await page.goto(path, { waitUntil: 'load' });
  await expect(page.locator('[data-visual-ready="true"]')).toHaveCount(1);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, (image) => {
      if (image.complete) return undefined;
      return image.decode().catch(() => undefined);
    }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });

  return { pageErrors, consoleErrors, externalRequests };
}

export function expectNoVisualErrors(signals) {
  expect(signals.pageErrors).toEqual([]);
  expect(signals.consoleErrors).toEqual([]);
  expect(signals.externalRequests).toEqual([]);
}

export async function expectVisualSnapshot(locator, snapshotName, testInfo) {
  if (testInfo.project.metadata.compareVisualSnapshots === false) {
    await expect(locator).toBeVisible();
    return;
  }

  await expect(locator).toHaveScreenshot(snapshotName);
}
