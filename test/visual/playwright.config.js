import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
// 3002 is this suite's own port. bin/dev listens on 3001 and the runtime suite
// takes 3003, so all three can run at once and none of them adopts another's server.
const port = Number(process.env.TRMNL_VISUAL_TEST_PORT || 3002);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  metadata: {
    compareVisualSnapshots: true,
  },
  testDir: '.',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  timeout: 30_000,
  outputDir: '../../tmp/playwright/visual-results',
  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{testFileBaseName}/{arg}{ext}',
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixels: 0,
      scale: 'css',
    },
  },
  reporter: 'list',
  use: {
    baseURL,
    browserName: 'chromium',
    viewport: { width: 900, height: 600 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'UTC',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    // Own pidfile: the default tmp/pids/server.pid belongs to bin/dev, and Rails
    // refuses to boot over a foreign pidfile, so the suite could not start while
    // the dev server was running.
    command: `mkdir -p tmp/pids && bin/rails dartsass:build && bin/rails server --environment development --binding 127.0.0.1 --port ${port} --pid tmp/pids/visual-server.pid`,
    cwd: repoRoot,
    url: `${baseURL}/framework/test/visual/paint`,
    // Same rule as the runtime suite: reuse a local server on this port, and on CI
    // refuse to adopt a leftover one that never ran the Sass build above.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
