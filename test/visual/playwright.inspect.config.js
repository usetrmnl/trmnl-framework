import { defineConfig } from '@playwright/test';
import snapshotConfig from './playwright.config.js';

// Headed Chromium rasterizes edges and fonts differently from headless Chromium.
// Keep this mode useful for inspection without treating those pixels as regressions.
export default defineConfig({
  ...snapshotConfig,
  metadata: {
    ...snapshotConfig.metadata,
    compareVisualSnapshots: false,
  },
  outputDir: '../../tmp/playwright/visual-inspect-results',
  use: {
    ...snapshotConfig.use,
    headless: false,
    launchOptions: {
      ...snapshotConfig.use?.launchOptions,
      slowMo: 100,
    },
  },
});
