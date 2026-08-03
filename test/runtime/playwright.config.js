import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
// 3003, not the 3001 bin/dev listens on: the documented loop is bin/dev in one
// terminal and this suite in another, and a suite that adopts the dev server
// tests whatever that terminal happens to be serving. The visual suite owns 3002.
const port = Number(process.env.TRMNL_TEST_PORT || 3003);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  // A 2-core CI runner fans picker changes across ten example iframes at a
  // fraction of local speed, so CI gets triple the local budgets.
  timeout: process.env.CI ? 90_000 : 30_000,
  outputDir: '../../tmp/playwright/runtime-results',
  expect: {
    timeout: process.env.CI ? 15_000 : 5_000,
  },
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    browserName: 'chromium',
    viewport: { width: 800, height: 480 },
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'UTC',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    // tmp/pids is gitignored, so a fresh checkout (and every CI run) reaches
    // bin/rails server without a directory to write the pidfile into.
    // tailwindcss:build is the docs chrome the picker specs click through.
    // Own pidfile for the same reason as the port: the default tmp/pids/server.pid
    // belongs to bin/dev, and Rails refuses to boot over a foreign pidfile.
    command: `mkdir -p tmp/pids && bin/rails dartsass:build && bin/rails tailwindcss:build && bin/rails server --environment development --binding 127.0.0.1 --port ${port} --pid tmp/pids/runtime-server.pid`,
    cwd: repoRoot,
    url: `${baseURL}/framework/test/runtime`,
    // Locally, a server already on this port is one you started for this suite, so
    // reuse it. On CI a listener on the port is a leftover from an earlier step, and
    // adopting it skips the two builds above; fail instead.
    reuseExistingServer: !process.env.CI,
    // Two Sass builds and a Rails boot, on a shared CI runner.
    timeout: 180_000,
  },
});
