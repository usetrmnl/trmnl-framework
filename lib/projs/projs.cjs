const { minify } = require('terser');
const fs = require('fs');

// The single source of truth for the terser options the release pipeline runs. Exported
// so projs.test.cjs can exercise the real shipped config instead of a hand-mirrored copy.
// mangle:true renames locals but leaves object property names alone (property mangling is
// OFF), which is what keeps the public TRMNLPaint/TRMNLCharts method names intact.
const TERSER_OPTIONS = {
  compress: { passes: 2 },
  mangle: true,
};

// The build marker plugins.js assigns to window.__TRMNL_BUILD__. A working checkout
// carries 'plugins.js source'; the release stamps the version it is cutting so the
// four bundles of four consecutive releases stop reporting the same string.
const BUILD_STAMP_PATTERN = /(window\.__TRMNL_BUILD__\s*=\s*')plugins\.js [^']*(')/;

// Rewrite the build marker to the released version. Both bundles the release publishes
// (the verbatim copy and the minified one) go through here, so they always agree.
// A missing marker is fatal: a renamed or dropped assignment would otherwise ship a
// release whose bundle claims to be a source checkout.
function stampBuild(source, version) {
  if (!version) return source;
  if (!BUILD_STAMP_PATTERN.test(source)) {
    throw new Error("Build marker not found: expected window.__TRMNL_BUILD__ = 'plugins.js …'");
  }
  return source.replace(BUILD_STAMP_PATTERN, `$1plugins.js v${version}$2`);
}

module.exports = { TERSER_OPTIONS, BUILD_STAMP_PATTERN, stampBuild };

// Only run the CLI when invoked directly (node lib/projs/projs.cjs ...); staying quiet
// when required keeps `require('./projs.cjs')` a pure options import for the test.
if (require.main === module) {
  const args = process.argv.slice(2);
  const takeFlagValue = (flag) => {
    const index = args.indexOf(flag);
    if (index === -1) return null;
    const value = args[index + 1];
    args.splice(index, 2);
    return value;
  };

  const outputPath = takeFlagValue('--output');
  const stampVersion = takeFlagValue('--stamp');
  const minifyIndex = args.indexOf('--no-minify');
  const shouldMinify = minifyIndex === -1;
  if (!shouldMinify) args.splice(minifyIndex, 1);

  const filePath = args[0];
  const jsData = fs.readFileSync(filePath, 'utf8');
  // Synchronous so a missing marker exits non-zero with its stack rather than
  // surfacing as an unhandled rejection inside the async block below.
  const stamped = stampBuild(jsData, stampVersion);

  (async () => {
    const code = shouldMinify ? (await minify(stamped, TERSER_OPTIONS)).code : stamped;

    if (outputPath) {
      fs.writeFileSync(outputPath, code);
    } else {
      process.stdout.write(code);
    }
  })();
}
