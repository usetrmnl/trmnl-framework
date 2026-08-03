const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const {
  UNSAFE_ADVANCED_TRANSFORMS,
  isPrivateVariable,
  parseArgs,
  processStylesheet,
} = require('./procss.cjs');

const THEME_SLOTS_PATH = path.join(
  __dirname,
  '..',
  '..',
  'app',
  'assets',
  'stylesheets',
  'framework',
  'mixins',
  '_theme-slots.scss'
);

const SCREEN_MODE_VARS_PATH = path.join(
  __dirname,
  '..',
  '..',
  'app',
  'assets',
  'stylesheets',
  'framework',
  'base',
  '_screen-mode-vars.scss'
);

const SCREEN_PATH = path.join(
  __dirname,
  '..',
  '..',
  'app',
  'assets',
  'stylesheets',
  'framework',
  'base',
  '_screen.scss'
);

const VISIBILITY_PATH = path.join(
  __dirname,
  '..',
  '..',
  'app',
  'assets',
  'stylesheets',
  'framework',
  'utilities',
  '_visibility.scss'
);

test('recognizes only explicitly private framework variable families', () => {
  for (const name of [
    '_local',
    'framework-internal-paint',
    'tile-gray-10',
    'bline-42',
    'border-1-h-image',
    'tn-bg-image',
  ]) {
    assert.equal(isPrivateVariable(name), true, name);
  }

  for (const name of [
    'framework-semantic-canvas',
    'theme-bg-white',
    'bline-custom',
    'framework-border-render-stroke',
    'tn-text-stroke-color',
    'tn-text-stroke-width',
    'tn-text-stroke-radius',
  ]) {
    assert.equal(isPrivateVariable(name), false, name);
  }
});

test('parses repeatable theme contract paths', () => {
  assert.deepEqual(
    parseArgs([
      'plugins.css',
      '--output',
      'plugins.min.css',
      '--preserve-variables-from',
      'theme-a.css',
      '--preserve-variables-from',
      'theme-b.css',
      '--rename-map-output',
      'plugins.rename-map.json',
    ]),
    {
      filePath: 'plugins.css',
      outputPath: 'plugins.min.css',
      contractPaths: ['theme-a.css', 'theme-b.css'],
      renameMapOutputPath: 'plugins.rename-map.json',
    }
  );
  assert.equal(parseArgs(['plugins.css']).renameMapOutputPath, null);
});

test('rejects an option token where a path value is required', () => {
  assert.throws(
    () => parseArgs(['plugins.css', '--output', '--typo']),
    /--output requires a path/
  );
  assert.throws(
    () => parseArgs(['plugins.css', '--preserve-variables-from', '--typo']),
    /--preserve-variables-from requires a path/
  );
  assert.throws(
    () => parseArgs(['plugins.css', '--rename-map-output', '--typo']),
    /--rename-map-output requires a path/
  );
});

test('reports the rename table it applied, in the shape lib/rulediff reads', async () => {
  // The rename map is what lets the rule diff compare a renamed bundle against an
  // unrenamed one, so it has to be complete and honest: every private name that moved
  // and nothing that did not. Names are bare, without the leading dashes, which is the
  // key space the rename strategy itself works in.
  const source = `
    .trmnl .screen {
      --tile-gray-10: url(a.svg);
      --_local: var(--tile-gray-10);
      --framework-semantic-canvas-bg-color: #fff;
      --tn-gap: 4px;
      --tn-text-stroke-width: 2px;
      color: var(--framework-semantic-canvas-bg-color);
    }
  `;

  const renames = new Map();
  const output = await processStylesheet(source, { from: 'fixture.css', renames });

  assert.deepEqual(Object.fromEntries(renames), { 'tile-gray-10': '_tn0', _local: '_tn1', 'tn-gap': '_tn2' });
  for (const [original, renamed] of renames) {
    assert.doesNotMatch(output, new RegExp(`--${original}(?![\\w-])`), original);
    assert.match(output, new RegExp(`--${renamed}(?![\\w-])`), renamed);
  }
});

test('bright-canvas themes keep the base border ink positions', () => {
  const source = fs.readFileSync(THEME_SLOTS_PATH, 'utf8');
  const start = source.indexOf('@mixin utility-remap-border-grayscale');
  const end = source.indexOf('\n// 2:1 compression maps', start);
  const mixin = source.slice(start, end);

  // The base pattern defines its visible/ink geometry in the `dark` segments.
  // Bright themes recolor those positions white and turn the complementary
  // `light` positions into the canvas hue. Swapping these complements the rail.
  assert.match(
    mixin,
    /@if \$side == 'dark'\s*\{\s*--theme-border-line-dark:\s*var\(--stroke-black-color,\s*var\(--black\)\);\s*--theme-border-line-light:\s*var\(--stroke-#\{\$to-hue\}-color,\s*var\(--#\{\$to-hue\}\)\);/s
  );
  assert.match(
    mixin,
    /@else\s*\{\s*--theme-border-line-dark:\s*var\(--stroke-white-color,\s*var\(--white\)\);\s*--theme-border-line-light:\s*var\(--stroke-#\{\$to-hue\}-color,\s*var\(--#\{\$to-hue\}\)\);/s
  );
});

test('border renderer lengths are computed by CSS before reaching SVG', () => {
  const source = fs.readFileSync(SCREEN_MODE_VARS_PATH, 'utf8');
  for (const name of ['width', 'height']) {
    assert.match(
      source,
      new RegExp('@property --framework-border-render-' + name + '\\s*\\{\\s*syntax: "<length>";\\s*inherits: false;\\s*initial-value: 0px;', 's')
    );
  }
});

test('preserves registered border renderer lengths in release CSS', async () => {
  const source = `
    @property --framework-border-render-width {
      syntax: "<length>";
      inherits: false;
      initial-value: 0px;
    }
    .trmnl .border--h-65::before {
      --framework-border-render-width: calc(12px / var(--dither-ratio));
    }
  `;
  const output = await processStylesheet(source, { from: 'fixture.css' });
  assert.match(output, /@property --framework-border-render-width/);
  assert.match(output, /syntax:"<length>"/);
  assert.match(output, /--framework-border-render-width/);
});

test('preserves classes and public/theme variables while shortening private variables', async () => {
  const source = `
    .trmnl .screen--dark-mode .dark\\:bg--white {
      --framework-semantic-canvas-bg-color: #fff;
      --tn-text-stroke-width: 4px;
      ---brand: #f00;
      --éclair: #0f0;
      --tile-éclair: url(theme-private.svg);
      --tile-shared: url(shared.svg);
      --tile-private: url(private.svg);
      --bline-1: #000;
      --framework-internal-paint: var(--tile-private);
      --_local: var(--bline-1);
      color: var(--framework-semantic-canvas-bg-color);
    }
  `;
  const theme = `
    .screen--theme-example {
      --theme-bg-white-color: var(--framework-semantic-canvas-bg-color);
      --theme-private-bridge: var(--tile-shared);
      --theme-unicode-private-bridge: var(--tile-éclair);
    }
  `;

  const output = await processStylesheet(source, {
    from: 'fixture.css',
    contractCss: [theme],
  });

  assert.match(output, /\.trmnl \.screen--dark-mode \.dark\\:bg--white/);
  assert.match(output, /--framework-semantic-canvas-bg-color/);
  assert.match(output, /--tn-text-stroke-width/);
  assert.match(output, /---brand/);
  assert.match(output, /--éclair/);
  assert.match(output, /--tile-éclair/);
  assert.match(output, /--tile-shared/);
  assert.doesNotMatch(output, /--tile-private|--bline-1|--framework-internal-paint|--_local/);
  assert.match(output, /--_tn[0-9a-z]+/);
});

test('shortens the border pipeline and engine families but not the names the runtime reads', async () => {
  // --border-* is the internal border pipeline and --tn-* is the engine
  // plumbing, so both shorten. Two exemptions are load bearing:
  // TRMNLPaint.strokeSpec() reads the three --tn-text-stroke-* names off
  // computed styles, and the renderer bridge builds --framework-border-render-*
  // names by concatenation at runtime, so neither may be renamed.
  const source = `
    .trmnl .screen .border--h-1::before {
      --border-1-h-image: url("data:image/svg+xml,border");
      --border-1-h-size: 12px 2px;
      --framework-border-render-stroke: #000;
      background-image: var(--border-1-h-image, none);
      background-size: var(--border-1-h-size, auto);
    }
    .trmnl .text-stroke {
      --tn-bg-image: url("data:image/svg+xml,engine");
      --tn-text-stroke-color: var(--framework-stroke-contrast);
      --tn-text-stroke-width: 3.5px;
      --tn-text-stroke-radius: 1.75px;
      background-image: var(--tn-bg-image, none);
    }
  `;

  const output = await processStylesheet(source, { from: 'fixture.css' });

  assert.match(output, /--framework-border-render-stroke/);
  assert.match(output, /--tn-text-stroke-color/);
  assert.match(output, /--tn-text-stroke-width/);
  assert.match(output, /--tn-text-stroke-radius/);
  assert.match(output, /--framework-stroke-contrast/);
  assert.doesNotMatch(output, /--border-1-h-image|--border-1-h-size|--tn-bg-image/);
  assert.match(output, /--_tn[0-9a-z]+/);
});

test('keeps theme contract border tokens the private pattern would otherwise match', async () => {
  // The 12 --border-token-*-h-* names are theme authoring surface. The release
  // task passes each theme through --preserve-variables-from, and that contract
  // wins over the --border-* private pattern.
  const source = `
    .trmnl .screen {
      --border-token-red-60-h-color: #f00;
      --border-token-red-60-h-image: url("data:image/svg+xml,token");
      --border-2-h-color: #000;
    }
  `;
  const theme = `
    .screen--theme-example {
      --theme-border-red-color: var(--border-token-red-60-h-color);
      --theme-border-red-image: var(--border-token-red-60-h-image);
    }
  `;

  const output = await processStylesheet(source, {
    from: 'fixture.css',
    contractCss: [theme],
  });

  assert.match(output, /--border-token-red-60-h-color/);
  assert.match(output, /--border-token-red-60-h-image/);
  assert.doesNotMatch(output, /--border-2-h-color/);
});

test('preserves the adaptive image contract and the theme-exempt dark gate', async () => {
  // --framework-icon-src is written as an inline-style literal by plugins.js,
  // and the semantic icon paint channel is public CSS API. Renaming either
  // breaks adaptive images at runtime.
  const source = `
    .trmnl img.image--adaptive[data-adaptive] {
      background-color: var(--framework-semantic-icon-color, var(--framework-semantic-text-primary-text-color, currentColor));
      background-image:
        var(--framework-semantic-icon-image, none),
        linear-gradient(
          var(--framework-semantic-icon-under, transparent),
          var(--framework-semantic-icon-under, transparent)
        );
      background-repeat: repeat, repeat;
      background-size: var(--dither-bg-size, auto), auto;
      -webkit-mask: var(--framework-icon-src) center / contain no-repeat;
      mask: var(--framework-icon-src) center / contain no-repeat;
      object-position: -9999px 0;
    }
    .trmnl .screen.screen--dark-mode:where(:not([class*="screen--theme-"])) {
      --framework-semantic-canvas-bg-color: #000;
    }
  `;

  const output = await processStylesheet(source, { from: 'fixture.css' });

  assert.match(output, /img\.image--adaptive\[data-adaptive\]/);
  assert.match(output, /--framework-semantic-icon-color/);
  assert.match(output, /--framework-semantic-icon-image/);
  assert.match(output, /--framework-semantic-icon-under/);
  assert.match(output, /--framework-semantic-text-primary-text-color/);
  assert.match(output, /linear-gradient/);
  assert.match(output, /--dither-bg-size/);
  assert.match(output, /-webkit-mask:\s*var\(--framework-icon-src\)/);
  assert.match(output, /(^|[^-])mask:\s*var\(--framework-icon-src\)/);
  assert.match(output, /:where\(:not\(\[class\*=("?)screen--theme-\1\]\)\)/);
});

test('limited preview white is resolved through tokens, not an image filter', () => {
  const source = fs.readFileSync(SCREEN_PATH, 'utf8');

  assert.match(source, /screen--preview-colors\.screen--preview-white-limited[\s\S]*--white:/);
  assert.doesNotMatch(source, /screen--preview-colors\.screen--preview-white-limited\s+\.image/);
  assert.doesNotMatch(source, /filter:\s*brightness/);
});

test('preserves the chart paint contract read by TRMNLPaint at runtime', async () => {
  // TRMNLPaint (plugins.js) resolves chart paint by reading utility probes and
  // complete public semantic channels from the live cascade. It reads standard
  // properties, but the framework must still keep these public names intact so the cascade
  // resolves: the per-token bg image/color, the dither tile size, the theme
  // override channel, and the semantic text colors used for ink. The private
  // --tile-* indirection is renamed, but only consistently: declaration and
  // reference move together, so the public --bg-*-image still resolves.
  const source = `
    .trmnl .screen {
      --tile-gray-35-1bit: url("data:image/svg+xml,tile");
      --bg-gray-35-image: var(--tile-gray-35-1bit);
      --bg-gray-35-color: #fff;
      --dither-bg-size: calc(16px / var(--dither-ratio));
      --framework-semantic-text-primary-text-color: #000;
      --framework-text-secondary: var(--gray-30);
      --framework-chart-series-span: 11;
      --framework-chart-series-0-color: var(--bg-black-color, transparent);
      --framework-chart-series-0-image: var(--bg-black-image, none);
      --framework-chart-series-5-color: var(--bg-gray-35-color, transparent);
      --framework-chart-series-5-image: var(--bg-gray-35-image, none);
      --framework-chart-series-15-color: var(--bg-white-color, transparent);
      --framework-chart-series-15-image: var(--bg-white-image, none);
      --framework-semantic-fill-strong-bg-color: #000;
      --framework-semantic-fill-strong-bg-image: var(--bg-black-image, none);
      --framework-semantic-fill-muted-bg-color: #666;
      --framework-semantic-fill-muted-bg-image: var(--bg-gray-60-image, none);
      --framework-semantic-fill-soft-bg-color: #ccc;
      --framework-semantic-fill-soft-bg-image: var(--bg-gray-70-image, none);
      --framework-semantic-border-strong-border-color: #000;
      --framework-semantic-border-strong-border-image: var(--bg-black-image, none);
      --framework-semantic-border-strong-border-size: var(--dither-bg-size, auto);
      --framework-semantic-border-muted-border-color: #666;
      --framework-semantic-border-muted-border-image: var(--bg-gray-65-image, none);
      --framework-semantic-border-muted-border-size: var(--dither-bg-size, auto);
      --framework-semantic-stroke-contrast-stroke-color: #fff;
    }
    .trmnl .screen--theme-example {
      --theme-bg-gray-35-image: url("data:image/svg+xml,themed");
      --theme-bg-gray-35-color: #eee;
    }
    .trmnl .bg--gray-35 {
      background-image: var(--theme-bg-gray-35-image, var(--bg-gray-35-image, none));
      background-color: var(--theme-bg-gray-35-color, var(--bg-gray-35-color, transparent));
      background-size: var(--dither-bg-size, auto);
    }
  `;

  const output = await processStylesheet(source, { from: 'fixture.css' });

  assert.match(output, /\.bg--gray-35/);
  assert.match(output, /--bg-gray-35-image/);
  assert.match(output, /--bg-gray-35-color/);
  assert.match(output, /--dither-bg-size/);
  assert.match(output, /--theme-bg-gray-35-image/);
  assert.match(output, /--framework-semantic-text-primary-text-color/);
  assert.match(output, /--framework-text-secondary/);
  // The chart-series ramp slots TRMNLPaint.series()/ramp() read by index must
  // survive across the whole 0..15 range, along with the legible-span var that
  // TRMNLPaint.series() reads to spread series across the ramp.
  assert.match(output, /--framework-chart-series-span/);
  assert.match(output, /--framework-chart-series-0-image/);
  assert.match(output, /--framework-chart-series-5-color/);
  assert.match(output, /--framework-chart-series-15-image/);
  // Complete semantic channels read by TRMNLPaint.semantic() must retain color,
  // image, and size instead of surviving only through color-only aliases.
  assert.match(output, /--framework-semantic-fill-strong-bg-color/);
  assert.match(output, /--framework-semantic-fill-strong-bg-image/);
  assert.match(output, /--framework-semantic-border-muted-border-image/);
  assert.match(output, /--framework-semantic-border-muted-border-size/);
  assert.match(output, /--framework-semantic-stroke-contrast-stroke-color/);
  // The private tile holder is mangled away (public names still resolve through it).
  assert.doesNotMatch(output, /--tile-gray-35-1bit/);
});

test('preserves the border/typography probe contract read by TRMNLPaint at runtime', async () => {
  // TRMNLPaint.border()/divider()/type()/strokeSpec() (plugins.js) resolve paint
  // by appending probe elements carrying these framework utility classes and
  // reading the resolved cascade. The border art paints on a pseudo-element
  // (::before for horizontal), so the class selectors AND the public --framework-*
  // / --tn-text-stroke-* vars the declarations reference must survive minification
  // intact, or the probes resolve to nothing at runtime.
  const source = `
    .trmnl .screen .border--h-10::before {
      background-image:
        linear-gradient(to right, #000 0 25%, transparent 25% 50%, #fff 50% 75%, transparent 75% 100%),
        linear-gradient(to right, #000 0 25%, transparent 25% 50%, #fff 50% 75%, transparent 75% 100%);
      background-size: 12px 0.5px, 12px 0.5px;
      background-position: 0 0, 8px 0.5px;
      background-repeat: repeat-x;
      --framework-border-render-stroke: #000;
      --framework-border-render-width: calc(12px / var(--dither-ratio));
      --framework-border-render-height: calc(2px / var(--dither-ratio));
      --framework-border-render-view-box: 0 0 12 2;
      --framework-border-render-path-1: M0 0H1V1H0Z;
      --framework-border-render-color-1: #000;
      --framework-border-render-path-2: M1 0H5V1H1Z;
      --framework-border-render-color-2: #fff;
    }
    .trmnl .screen .border--h-black::before {
      background-color: var(--framework-fill-strong);
    }
    .trmnl .screen .border--v-65::after {
      background-color: var(--framework-border-muted);
    }
    .trmnl .screen .divider {
      background-color: var(--framework-border-muted);
    }
    .trmnl .value {
      font-size: 38px;
    }
    .trmnl .text--small {
      font-size: var(--font-small-size);
    }
    .trmnl .text-stroke {
      --tn-text-stroke-width: 3.5px;
      --tn-text-stroke-radius: 1.75px;
      --tn-text-stroke-color: var(--framework-stroke-contrast);
      color: var(--tn-text-stroke-color, currentColor);
    }
  `;

  const output = await processStylesheet(source, { from: 'fixture.css' });

  // The border-utility / divider / typography probe selectors survive verbatim.
  // (the minifier normalizes the double-colon pseudo to a single colon).
  assert.match(output, /\.border--h-10:{1,2}before/);
  assert.match(output, /\.border--h-black:{1,2}before/);
  assert.match(output, /\.border--v-65:{1,2}after/);
  assert.match(output, /\.divider/);
  assert.match(output, /\.value/);
  assert.match(output, /\.text--small/);
  assert.match(output, /\.text-stroke/);
  // DOM paint retains both gradient layers. The renderer bridge reads a separate
  // CSS-declared SVG program and must keep that public contract verbatim.
  assert.match(output, /linear-gradient\((?:to right|90deg)[^;]+linear-gradient\((?:to right|90deg)/);
  assert.match(output, /background-size:12px .5px,12px .5px/);
  assert.match(output, /background-position:0 0,8px .5px/);
  assert.match(output, /background-repeat:repeat-x/);
  for (const suffix of ['stroke', 'width', 'height', 'view-box', 'path-1', 'color-1', 'path-2', 'color-2']) {
    assert.match(output, new RegExp('--framework-border-render-' + suffix));
  }
  assert.match(output, /M0 0H1V1H0Z/);
  assert.match(output, /M1 0H5V1H1Z/);
  // The fill-backed black border utility carries real ink via
  // --framework-fill-strong in every mode; the step-65 hairline reads
  // --framework-border-muted. Both public names must survive.
  assert.match(output, /--framework-fill-strong/);
  assert.match(output, /--framework-border-muted/);
  // The public text-stroke channel strokeSpec() reads on the probe (width/radius
  // vars + the color var re-exposed through `color`) must keep its public names.
  assert.match(output, /--tn-text-stroke-width/);
  assert.match(output, /--tn-text-stroke-radius/);
  assert.match(output, /--tn-text-stroke-color/);
  assert.match(output, /--framework-stroke-contrast/);
});

test('visibility keeps `hidden` last so it hides flex/grid/block on the same element', () => {
  // The visibility utilities emit `.trmnl .X { display: … }` per map entry at equal
  // specificity with no !important, so CSS last-wins decides same-element combos like
  // `class="flex hidden"`. `hidden` MUST be the final entry in $display-variants, or a
  // layout display re-emitted after it wins and `.hidden` silently stops hiding.
  const source = fs.readFileSync(VISIBILITY_PATH, 'utf8');
  const open = source.indexOf('$display-variants: (');
  assert.notEqual(open, -1, '$display-variants map not found');
  const close = source.indexOf(');', open);
  assert.notEqual(close, -1, '$display-variants map is not closed');
  const map = source.slice(open, close);

  const keys = [...map.matchAll(/'([a-z-]+)':/g)].map((m) => m[1]);
  assert.ok(keys.length > 1, 'expected multiple display variants');
  assert.equal(keys.at(-1), 'hidden', `expected 'hidden' to be the last display variant, got order: ${keys.join(', ')}`);
  for (const display of ['block', 'flex', 'grid']) {
    assert.ok(
      keys.indexOf('hidden') > keys.indexOf(display),
      `'hidden' must be emitted after '${display}' so it wins at equal specificity`
    );
  }
});

test('preserves an @font-face declared after an ordinary rule, without duplicating a leading one', async () => {
  // cssnano drops an @font-face that appears after a non-@font-face rule, so the
  // framework re-adds fonts from a verbatim prelude scanned out of the source.
  // That scan must walk the WHOLE stylesheet, not just the leading run: a font
  // declared after any ordinary rule was previously stripped by the minifier and
  // never re-added, silently losing the font at runtime. The leading case must
  // still round-trip exactly once (the prelude re-adds it, the body strip removes
  // the survivor), so a font declared up front is never emitted twice.

  // Regression: a non-leading @font-face (after `.a{color:red}`) must survive
  // with its whole body intact. Before the fix this whole rule vanished.
  const nonLeading = await processStylesheet(
    '.a{color:red}@font-face{font-family:NonLeading;src:url(x.woff2)}',
    { from: 'fixture.css' }
  );
  assert.match(nonLeading, /@font-face/);
  assert.match(nonLeading, /font-family:\s*NonLeading/);
  assert.match(nonLeading, /src:\s*url\(x\.woff2\)/);
  // The ordinary rule it followed is still minified into the body.
  assert.match(nonLeading, /\.a\s*\{\s*color:\s*red\s*\}/);

  // Other half of the contract: a leading @font-face still works and is emitted
  // exactly once (the prelude re-adds it, the body strip removes the survivor).
  const leading = await processStylesheet(
    '@font-face{font-family:Leading;src:url(y.woff2)}.b{color:blue}',
    { from: 'fixture.css' }
  );
  assert.equal(
    (leading.match(/@font-face/g) || []).length,
    1,
    'a leading @font-face must be emitted exactly once, not duplicated'
  );
  assert.equal(
    (leading.match(/font-family:\s*Leading/g) || []).length,
    1,
    'the leading font-family must survive exactly once'
  );
  assert.match(leading, /\.b\s*\{\s*color:\s*blue\s*\}/);
});

test('a @font-face nested in a conditional at-rule survives alongside a top-level one', async () => {
  // The prelude scan collects top-level @font-face rules only, so the strip that makes
  // room for it has to be top-level only too. Removing every @font-face while re-adding
  // just the top-level run deleted a nested face outright, and only when the file also
  // declared a top-level one, which is the layout the framework ships.
  const nested = await processStylesheet(
    '@font-face{font-family:TopFace;src:url(a.woff2)}'
    + '@media print{@font-face{font-family:PrintFace;src:url(b.woff2)}}'
    + '.a{color:red}',
    { from: 'fixture.css' }
  );

  assert.match(nested, /font-family:\s*TopFace/);
  assert.match(nested, /font-family:\s*PrintFace/);
  assert.equal(
    (nested.match(/font-family:\s*TopFace/g) || []).length,
    1,
    'the top-level face is still emitted exactly once'
  );

  // With no top-level face the prelude is empty and the strip never runs, which is the
  // path that always kept the nested one. Both layouts now agree.
  const nestedOnly = await processStylesheet(
    '@media print{@font-face{font-family:PrintFace;src:url(b.woff2)}}.a{color:red}',
    { from: 'fixture.css' }
  );

  assert.match(nestedOnly, /font-family:\s*PrintFace/);
});

test('the four unsafe advanced transforms stay disabled', () => {
  // Pinned by name, not left to the census. Each one is a no-op on today's bundle only
  // because of what the bundle happens to contain, so an accident is doing the work a
  // decision should. Turning one back on is a deliberate edit here.
  assert.deepEqual(UNSAFE_ADVANCED_TRANSFORMS, {
    discardUnused: false,
    mergeIdents: false,
    reduceIdents: false,
    zindex: false,
  });
});

test('z-index values are not rebased', async () => {
  // postcss-zindex renumbers every positive z-index from 1, and it aborts only while
  // some negative value survives. A bundle that lost its z-index:-1 would otherwise
  // have every stacking value quietly rewritten with all gates green.
  const output = await processStylesheet('.a{z-index:10}.b{z-index:20}', { from: 'fixture.css' });

  assert.match(output, /\.a\{z-index:10\}/);
  assert.match(output, /\.b\{z-index:20\}/);
});

test('unreferenced keyframes and counter styles are left alone', async () => {
  // discard-unused deletes an @keyframes or @counter-style with no reference in the
  // bundle. A plugin's own markup or Core can name either, and neither is visible here.
  const output = await processStylesheet(
    '@keyframes spin{from{opacity:0}to{opacity:1}}'
    + '@counter-style tick{system:cyclic;symbols:"x"}'
    + '.a{color:red}',
    { from: 'fixture.css' }
  );

  assert.match(output, /@keyframes spin\{/);
  assert.match(output, /@counter-style tick\{/);
});

test('a referenced animation keeps the name the source gave it', async () => {
  // reduce-idents renames `spin` to `a` when it can see every reference, and
  // merge-idents folds two identical @keyframes into one name. Both names stay
  // addressable from outside the bundle, so both are left as written.
  const output = await processStylesheet(
    '@keyframes spin{from{opacity:0}to{opacity:1}}'
    + '@keyframes fade{from{opacity:0}to{opacity:1}}'
    + '.a{animation:spin 1s}.b{animation:fade 1s}',
    { from: 'fixture.css' }
  );

  assert.match(output, /@keyframes spin\{/);
  assert.match(output, /@keyframes fade\{/);
  assert.match(output, /animation:spin 1s/);
  assert.match(output, /animation:fade 1s/);
});
