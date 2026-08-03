const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { minify } = require('terser');

// The exact terser options the release pipeline runs, imported straight from the CLI
// module (lib/projs/projs.cjs, invoked by lib/framework/release_task.rb via
// `npm run process_scripts`) so this suite exercises the real shipped config rather than
// a hand-mirrored copy that could drift. mangle:true renames locals but leaves object
// property names alone (property mangling is OFF), which is what lets the public method
// names below survive.
const { TERSER_OPTIONS, stampBuild } = require('./projs.cjs');

// plugins.js is the only JS shipped verbatim to real plugins at release.
const PLUGINS_PATH = path.join(
  __dirname,
  '..',
  '..',
  'app',
  'javascript',
  'plugin-render',
  'plugins.js'
);

const V3_1_CHART_PATH = path.join(
  __dirname,
  '..',
  '..',
  'app',
  'views',
  'framework_v3_1',
  'chart.html.erb'
);

const FRAMEWORK_VIEWS_PATH = path.join(
  __dirname,
  '..',
  '..',
  'app',
  'views',
  'framework'
);

// The public JS surface documented for plugin authors. If terser were ever
// configured to mangle property names, these would vanish from the minified
// output and every 3.2 chart/paint example would break at runtime.
const TRMNL_PAINT_METHODS = [
  'bg',
  'text',
  'stroke',
  'semantic',
  'textColor',
  'series',
  'ramp',
  'cssVar',
  'apply',
  'screen',
  'scale',
  'px',
  'watch',
  'toHighcharts',
  // Border + typography resolvers (added with the chart border/type rewire).
  'border',
  'divider',
  'type',
  'strokeSpec',
  'applyBorder',
  'applyType',
  'toHighchartsAxis',
  'applyHighchartsAxisPaint',
  'toHighchartsText',
];

const TRMNL_CHARTS_METHODS = [
  'paint',
  'series',
  'applySwatches',
  'options',
  'merge',
  'watch',
  // Thin delegations onto the new TRMNLPaint border/type surface.
  'grid',
  'axisLine',
  'textStyle',
];

// Public CSS custom-property names plugins.js reads *as string literals* from the
// live cascade. These are not renamed by JS minification (they're string
// contents), but asserting them here guards against an accidental rename in the
// source drifting away from the CSS contract enforced in procss.test.cjs.
const PUBLIC_VAR_LITERALS = [
  '--framework-chart-series-',
  '--framework-chart-series-span',
  '--dither-bg-size',
  '--device-ui-scale',
  '--modifier-scale',
  '--ui-scale',
  '--content-scale',
  '--modifier-text-scale',
  '--text-ui-scale',
  '--framework-semantic-',
  '-bg-',
  '-border-',
  '-stroke-color',
  '--framework-icon-src',
  '--framework-border-render-',
  // Public text-stroke channel read by TRMNLPaint.strokeSpec()/stroke(): the
  // width/radius vars queried on the probe and the color var re-exposed through
  // a standard `color` property. Renaming any breaks stroke resolution.
  '--tn-text-stroke-width',
  '--tn-text-stroke-radius',
  '--tn-text-stroke-color',
];

// Framework utility class / attribute names plugins.js writes literally when it
// appends probe elements and paints legend swatches; the CSS cascade resolves
// paint through these, so they must survive verbatim too.
const PUBLIC_SELECTOR_LITERALS = [
  'bg--',
  'text--',
  'text-stroke--',
  'bg--canvas',
  'bg--surface',
  'bg--backdrop',
  'text--default',
  'text--muted',
  'text--inverse',
  'data-chart-series',
  // Border-utility + divider probe class strings (border() builds 'border--'+dir
  // +'-'+spec; divider() probes 'divider divider--{h|v}').
  'border--',
  'divider',
  'divider--h',
  'divider--v',
  // Typography role class strings (TYPE_ROLE values + text-stroke probe base);
  // 'text--small' is the chart-label role.
  'text-stroke',
  'text--small',
  'value',
  'label',
  'title',
  'description',
];

// Internal SVG adapter literals are not public API, but losing one during
// minification would flatten the CSS border program back to a single stroke.
const BORDER_PATTERN_LITERALS = [
  '_trmnlPattern',
  'patternUnits',
  'userSpaceOnUse',
  'viewBox',
  'preserveAspectRatio',
  'stroke-dasharray',
  'highcharts-grid-line',
];

let minified;
let source;

test.before(async () => {
  source = fs.readFileSync(PLUGINS_PATH, 'utf8');
  const result = await minify(source, TERSER_OPTIONS);
  assert.equal(typeof result.code, 'string');
  assert.ok(result.code.length > 0, 'terser produced empty output');
  minified = result.code;
});

// `.heading` is not a framework class: it produces no rule in the SCSS source or in any
// published bundle. The columns engine filtered on it in four places, so those branches
// could never match and header-only columns were unshrinkable. The engine's real markers
// are `.item`, `.label`, `[data-group-header]` and `[data-duplicate-heading]`.
test('the columns engine filters on framework classes, not an undefined .heading', () => {
  assert.doesNotMatch(source, /classList\.contains\('heading'\)/);
  assert.doesNotMatch(source, /\.heading\[data-duplicate-heading/);
  assert.match(source, /\.label\[data-duplicate-heading="true"\]/);
});

// Engine chatter is opt-in. A device render, a screenshot pass and an embed all share one
// console, and the per-element logs used to fire on every terminalize.
test('engine logging goes through the debug gate, errors go straight to the console', () => {
  const chatter = source.match(/^\s*console\.log\(/gm) || [];
  assert.equal(chatter.length, 1, 'console.log should only appear inside debugLog');
  assert.match(source, /function debugLog\(\.\.\.args\) \{\n\s+try \{\n\s+if \(!window\.__TRMNL_DEBUG__\) return;/);
  assert.match(source, /console\.error\(`Terminalize \$\{engine\} failed:`, error\);/);
});

// window.I18n is a host contract this repo never defines. Guarding only the object throws
// on any host that ships an unrelated i18n global.
test('every andXMore call guards the method as well as the object', () => {
  const calls = source.match(/window\.I18n\?\.andXMore/g) || [];
  const guarded = source.match(/window\.I18n\?\.andXMore\?\.\(/g) || [];
  assert.ok(calls.length > 0, 'expected the label engines to read window.I18n');
  assert.equal(guarded.length, calls.length);
});

// The build marker is the only thing that separates a published bundle from the source
// file. Four consecutive releases shipped the same hand-edited string before the release
// started stamping it, so the marker's shape is a contract now.
test('the release stamps the build marker with the version it cuts', () => {
  assert.match(source, /window\.__TRMNL_BUILD__ = 'plugins\.js source';/);

  const stamped = stampBuild(source, '9.9.9');
  assert.match(stamped, /window\.__TRMNL_BUILD__ = 'plugins\.js v9\.9\.9';/);
  assert.equal(stamped.length - source.length, 'v9.9.9'.length - 'source'.length);
});

test('stamping without a version leaves the source untouched', () => {
  assert.equal(stampBuild(source, null), source);
});

test('stamping refuses a file whose build marker is gone', () => {
  assert.throws(
    () => stampBuild('window.somethingElse = 1;', '9.9.9'),
    /Build marker not found/
  );
});

test('plugins.js is syntactically valid JavaScript', () => {
  // `node --check` parses the file without executing it; a syntax error (e.g. the
  // apostrophe traps this file is full of) exits non-zero and throws here.
  execFileSync(process.execPath, ['--check', PLUGINS_PATH], { stdio: 'pipe' });
});

test('both public globals survive minification', () => {
  assert.match(minified, /window\.TRMNLPaint\s*=/);
  assert.match(minified, /window\.TRMNLCharts\s*=/);
});

test('every TRMNLPaint public method name survives mangling', () => {
  for (const name of TRMNL_PAINT_METHODS) {
    // Property keys survive either as shorthand method definitions (`,name(`) or,
    // where terser rewrites a single-expression method to an arrow, as `name:`.
    assert.match(
      minified,
      new RegExp('[,{;]' + name + '\\s*[(:]'),
      `TRMNLPaint.${name} missing from minified output`
    );
  }
});

test('every TRMNLCharts public method name survives mangling', () => {
  for (const name of TRMNL_CHARTS_METHODS) {
    assert.match(
      minified,
      new RegExp('[,{;]' + name + '\\s*[(:]'),
      `TRMNLCharts.${name} missing from minified output`
    );
  }
});

test('public CSS var string literals survive minification', () => {
  for (const literal of PUBLIC_VAR_LITERALS) {
    assert.ok(
      minified.includes(literal),
      `public var literal ${literal} missing from minified output`
    );
  }
});

test('public utility class / attribute literals survive minification', () => {
  for (const literal of PUBLIC_SELECTOR_LITERALS) {
    assert.ok(
      minified.includes(literal),
      `public selector literal ${literal} missing from minified output`
    );
  }
});

test('pattern-faithful Highcharts border adapter survives minification', () => {
  for (const literal of BORDER_PATTERN_LITERALS) {
    assert.ok(minified.includes(literal), `${literal} missing from minified output`);
  }
});

test('paint IIFE contains no axis contrast heuristic or invented black fallback', () => {
  const start = source.indexOf('/**\n * TRMNLPaint');
  const end = source.indexOf('\n})();', start);
  const paintSource = source.slice(start, end);
  assert.doesNotMatch(paintSource, /AXIS_MIN_CONTRAST|axisInk|colorDistance|Manhattan channel distance/);
  assert.doesNotMatch(paintSource, /\|\|\s*['"]#000000['"]/);
  assert.doesNotMatch(paintSource, /gridLineDashStyle:\s*['"]ShortDot['"]/);
  assert.doesNotMatch(paintSource, /screen--preview|preview_white|previewWhite|colorPreview/);
});

test('border rendering copies the CSS-declared program without interpreting CSS paint', () => {
  const start = source.indexOf('// ── Border system');
  const end = source.indexOf('// ── Typography system', start);
  const borderSource = source.slice(start, end);
  assert.match(borderSource, /--framework-border-render-/);
  assert.match(borderSource, /borderRenderValue/);
  assert.doesNotMatch(
    source,
    /gradientInks|firstGradientInk|borderInk|splitCssList|cssLength|cssPair|cssListItem|gradientLayer|flatBorderImage|borderPattern|patternKey|hashString/
  );
  assert.doesNotMatch(borderSource, /parseFloat|Math\.|gradient\s*\(/);
});

test('TRMNLCharts delegates paint resolution and conversion to TRMNLPaint', () => {
  const paintStart = source.indexOf('const TRMNLPaint = {');
  const start = source.indexOf('const TRMNLCharts = {');
  const end = source.indexOf('\n  window.TRMNLPaint', start);
  const paintApiSource = source.slice(paintStart, start);
  const chartsSource = source.slice(start, end);
  assert.match(paintApiSource, /textColor\(token, opts\)/);
  assert.doesNotMatch(paintApiSource, /\n\s+ink\(/);
  assert.doesNotMatch(paintApiSource, /BORDER_ALIAS|toHighcharts\(fill, fallback\)|typeof fill === ['"]string['"]/);
  assert.match(chartsSource, /TRMNLPaint\.applyHighchartsAxisPaint\(this, borderFills\)/);
  assert.doesNotMatch(chartsSource, /\n\s+ink\(/);
  assert.doesNotMatch(chartsSource, /border\(['"](?:strong|muted)['"]/);
  assert.doesNotMatch(chartsSource, /textFillInk|imageInk|borderPattern|paintChartAxisPatterns/);
});

test('the frozen 3.1 chart page keeps its own dependencies without calling the 3.2 API', () => {
  const chartSource = fs.readFileSync(V3_1_CHART_PATH, 'utf8');
  assert.match(chartSource, /highcharts\/12\.3\.0\/highcharts\.js/);
  assert.match(chartSource, /chartkick\/5\.0\.1\/chartkick\.min\.js/);
  assert.doesNotMatch(chartSource, /TRMNLPaint|TRMNLCharts/);
});

test('3.2 documentation calls only the current paint and chart APIs', () => {
  // recursive: the Related APIs excerpt partials live in a subdirectory.
  const docsSource = fs.readdirSync(FRAMEWORK_VIEWS_PATH, { recursive: true })
    .filter((name) => name.endsWith('.html.erb'))
    .map((name) => fs.readFileSync(path.join(FRAMEWORK_VIEWS_PATH, name), 'utf8'))
    .join('\n');

  for (const match of docsSource.matchAll(/TRMNLPaint\.([A-Za-z][A-Za-z0-9_]*)/g)) {
    assert.ok(TRMNL_PAINT_METHODS.includes(match[1]), `unknown documented method TRMNLPaint.${match[1]}`);
  }
  for (const match of docsSource.matchAll(/TRMNLCharts\.([A-Za-z][A-Za-z0-9_]*)/g)) {
    assert.ok(TRMNL_CHARTS_METHODS.includes(match[1]), `unknown documented method TRMNLCharts.${match[1]}`);
  }
});

test('the Painting Borders example uses literal public rail specs', () => {
  const paintDocsSource = fs.readFileSync(path.join(FRAMEWORK_VIEWS_PATH, 'paint_borders.html.erb'), 'utf8');
  const specLists = Array.from(paintDocsSource.matchAll(/var SPECS = (\[[^\]]+\]);/g), (match) => JSON.parse(match[1]));
  assert.deepEqual(specLists, [
    [65, 40, 'black', 'white'],
  ]);
  assert.doesNotMatch(paintDocsSource, /TRMNLPaint\.border\(["'](?:muted|strong)["']/);
});

test('TypeSpec round-trips complete CSS text paint instead of font-only data', () => {
  const start = source.indexOf('function readType(cs)');
  const end = source.indexOf('\n  // Build one axis', start);
  const typeSource = source.slice(start, end);
  for (const property of [
    'fontStyle',
    'fontVariantNumeric',
    'fontVariationSettings',
    'webkitFontSmoothing',
    'letterSpacing',
    'backgroundColor',
    'backgroundImage',
    'backgroundSize',
    'backgroundPosition',
    'backgroundRepeat',
    'webkitBackgroundClip',
    'backgroundClip',
    'textShadow',
    'filter',
    'overflow',
  ]) {
    assert.ok(typeSource.includes(property), `${property} missing from TypeSpec round-trip`);
  }
});

// The readable half of the published pair: --no-minify must emit the stamped source
// byte for byte, since the release publishes it as plugins.js next to the minified
// plugins.min.js.
test('the CLI with --no-minify emits the stamped source unminified', () => {
  const outPath = path.join(fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'projs-')), 'plugins.js');
  execFileSync('node', [
    path.join(__dirname, 'projs.cjs'),
    PLUGINS_PATH,
    '--stamp', '9.9.9',
    '--no-minify',
    '--output', outPath,
  ]);

  const emitted = fs.readFileSync(outPath, 'utf8');
  const expected = stampBuild(fs.readFileSync(PLUGINS_PATH, 'utf8'), '9.9.9');
  assert.equal(emitted, expected);
});
