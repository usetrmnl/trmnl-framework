import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
// 3004 is this suite's own port, after bin/dev on 3001, the visual suite on 3002 and the
// runtime suite on 3003, so all four can run at once and none adopts another's server.
const port = Number(process.env.TRMNL_RELEASE_TEST_PORT || 3004);
const baseURL = `http://127.0.0.1:${port}`;

// Firefox earns its place here rather than in the other suites: it paints every background
// layer with the first background-clip value instead of one per layer, so a stylesheet can
// pass in Chromium and still paint the wrong thing on the render pool's browser.
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  timeout: process.env.CI ? 90_000 : 30_000,
  outputDir: '../../tmp/playwright/release-results',
  expect: {
    timeout: process.env.CI ? 15_000 : 5_000,
  },
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    viewport: { width: 400, height: 200 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'UTC',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
  webServer: {
    // No asset build: this suite reads the committed release bundles, which a build does
    // not touch. Own pidfile, because the default one belongs to bin/dev and Rails refuses
    // to boot over a foreign pidfile.
    command: `mkdir -p tmp/pids && bin/rails server --environment development --binding 127.0.0.1 --port ${port} --pid tmp/pids/release-server.pid`,
    cwd: repoRoot,
    url: `${baseURL}/css/latest/plugins.min.css`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
