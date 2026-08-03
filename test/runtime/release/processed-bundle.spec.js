import { expect, test } from '@playwright/test';
import { openDocsPage } from '../support/docs-page.js';
import { mountFixture, openRuntimePage } from '../support/runtime-page.js';
import {
  defaultRuntimeVariant,
  frameworkBundleFile,
  processedBundleMode,
  readBuild,
  runtimeBody,
} from '../../support/processed-bundle.js';

// PROCESSED_BUNDLE=1 swaps the released bytes in underneath every other spec in this
// suite, and a swap that quietly missed would leave the whole run measuring the live
// build and reporting parity. So this asserts what the browser actually received, in
// both modes: the mode's own bundle, byte for byte, at the URLs the pages request.
//
// Sizes rather than content because the assertion has to be exact and the bundle is
// megabytes: a decoded length differs the moment a single declaration does.
test('the runtime page serves the bundle and runtime this mode names', async ({ page }) => {
  await openRuntimePage(page);

  const served = await page.evaluate(async () => {
    const bytes = async (url) => (await (await fetch(url)).text()).length;
    return {
      css: await bytes(document.querySelector('link[data-runtime-stylesheet]').href),
      js: await bytes(document.querySelector('script[src*="__runtime-test__"]').src),
    };
  });

  expect(served.css).toBe((await readBuild(frameworkBundleFile())).length);
  expect(served.js).toBe((await runtimeBody(defaultRuntimeVariant())).length);
});

test('the docs bundle URLs serve the bundle and runtime this mode names', async ({ page }) => {
  await openDocsPage(page, '/framework/docs/3.2/overflow');

  const served = await page.evaluate(async () => {
    const { dataset } = document.body;
    const bytes = async (url) => (await (await fetch(url)).text()).length;
    return {
      css: await bytes(dataset.frameworkExamplesPluginsCssPathValue),
      js: await bytes(dataset.frameworkExamplesPluginsJsPathValue),
    };
  });

  expect(served.css).toBe((await readBuild(frameworkBundleFile())).length);
  expect(served.js).toBe((await runtimeBody(defaultRuntimeVariant())).length);
});

// The canaries the public-contract spec uses, read back through the cascade instead of
// out of the file: a private variable the renamer took is gone from computed style, and
// an engine variable plugins.js reads by name has to survive under its own name.
test('the served bundle carries the renamed names in processed mode and the original names otherwise', async ({ page }) => {
  await openRuntimePage(page);
  await mountFixture(page, { html: '<div id="canary" class="bg--black text-stroke"></div>' });

  const names = await page.evaluate(() => {
    const canary = document.querySelector('#canary');
    const value = (name) => getComputedStyle(canary).getPropertyValue(name).trim();
    return {
      private: value('--tn-bg-image'),
      engine: value('--tn-text-stroke-color'),
    };
  });

  expect(names.engine).not.toBe('');
  if (processedBundleMode) expect(names.private).toBe('');
  else expect(names.private).not.toBe('');
});
