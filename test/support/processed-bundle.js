import { readdir, readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { minify } from 'terser';

// PROCESSED_BUNDLE=1 points a suite at the bytes a release publishes instead of the
// live build: the procss output for the CSS, the projs output for the runtime. The
// rule diff proves the two bundles declare the same values per selector; only a
// browser proves they render the same, which is what these suites then measure.
//
// The processed CSS is not built here. `bin/rails framework:processed_bundle` writes
// it, takes about 90 seconds, and a suite that rebuilt it per run would pay that on
// every invocation, so a missing artifact fails with the command to run instead.
const require = createRequire(import.meta.url);
const { TERSER_OPTIONS } = require('../../lib/projs/projs.cjs');

const builds = new URL('../../server/app/assets/builds/', import.meta.url);
const stylesheets = new URL('../../app/assets/stylesheets/', import.meta.url);
const runtimeSource = new URL('../../app/javascript/plugin-render/plugins.js', import.meta.url);

export const processedBundleMode = ['1', 'true'].includes(process.env.PROCESSED_BUNDLE);

// The live build's own URLs, which is what a page requests either way. Propshaft
// digests them; Framework::Static answers the undigested pair on a host with no
// Propshaft entry. Released paths (/css/<semver>/plugins.css, and the v1.2 bundle)
// are deliberately absent: a frozen track documents the release it was cut from.
const LIVE_BUNDLE_CSS = /^\/(?:assets\/plugins-[0-9a-f]+|framework-docs\/plugins)\.css$/;
const LIVE_RUNTIME_JS = /^\/(?:assets\/plugin-render\/plugins-[0-9a-f]+|framework-docs\/plugins)\.js$/;

const cache = new Map();

async function cached(key, load) {
  if (!cache.has(key)) cache.set(key, await load());
  return cache.get(key);
}

// The build file a suite compares against when it reads the bundle itself rather
// than letting the page request it.
export function frameworkBundleFile() {
  return processedBundleMode ? 'plugins.processed.css' : 'plugins.css';
}

// The suite's own web server runs dartsass:build on every start, so the live bundle is
// always current and the processed one is whatever the last task run left behind. A
// processed bundle older than the Sass it claims to represent would put two different
// builds on the two sides of the comparison and report the difference as parity.
async function assertProcessedBundleFresh(relativePath) {
  const built = await stat(new URL(relativePath, builds));
  const entries = await readdir(stylesheets, { recursive: true, withFileTypes: true });
  const sources = entries.filter((entry) => entry.isFile())
    .map((entry) => stat(join(entry.parentPath, entry.name)));
  const newest = Math.max(...(await Promise.all(sources)).map((source) => source.mtimeMs));

  if (newest <= built.mtimeMs) return;

  throw new Error(
    `${relativePath} is older than the Sass source it was built from. `
    + 'Run `bin/rails framework:processed_bundle`.',
  );
}

export async function readBuild(relativePath) {
  return cached(`build:${relativePath}`, async () => {
    let body;
    try {
      body = await readFile(new URL(relativePath, builds), 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const task = relativePath.startsWith('plugins.processed')
        ? 'bin/rails framework:processed_bundle'
        : 'bin/rails dartsass:build';
      throw new Error(`${relativePath} build was not found. Run \`${task}\`.`);
    }

    if (relativePath.startsWith('plugins.processed')) await assertProcessedBundleFresh(relativePath);
    return body;
  });
}

// The full custom property name a spec reads it under in the bundle under test. The
// renamer takes the private families, but naming one from a theme makes it contract
// and it keeps its own spelling, so whether a given name moved is a fact about the
// build rather than about the family it belongs to. The rename map is that fact, and
// nothing here may guess at it: a name the map does not carry was not renamed, which
// is the answer for every public name (--framework-*, the theme contract, the three
// engine names) and for every private one a theme happens to reach.
export async function bundleVariable(name) {
  if (!processedBundleMode) return `--${name}`;

  const map = await cached('rename-map', async () => {
    const body = await readBuild('plugins.processed.rename-map.json');
    return JSON.parse(body);
  });

  return `--${map[name] ?? name}`;
}

export async function runtimeBody(variant) {
  if (variant === 'source') return cached('runtime:source', () => readFile(runtimeSource, 'utf8'));
  if (variant !== 'minified') throw new Error(`Unknown runtime variant: ${variant}`);

  return cached('runtime:minified', async () => {
    const source = await readFile(runtimeSource, 'utf8');
    const result = await minify(source, TERSER_OPTIONS);
    return result.code;
  });
}

// The runtime a suite loads when it does not ask for one. A release ships the
// minified runtime, so the processed run exercises it everywhere the source runtime
// runs today, and release/minified-smoke.spec.js keeps covering it in both modes.
export function defaultRuntimeVariant() {
  return processedBundleMode ? 'minified' : 'source';
}

// Serve the processed artifacts wherever the page asks for the live build. A no-op
// outside processed mode, so every call site reads the same in both.
export async function routeProcessedAssets(page) {
  if (!processedBundleMode) return;

  const css = await readBuild('plugins.processed.css');
  const js = await runtimeBody('minified');

  await page.route((url) => LIVE_BUNDLE_CSS.test(url.pathname), (route) => route.fulfill({
    body: css,
    contentType: 'text/css',
  }));
  await page.route((url) => LIVE_RUNTIME_JS.test(url.pathname), (route) => route.fulfill({
    body: js,
    contentType: 'application/javascript',
  }));
}
