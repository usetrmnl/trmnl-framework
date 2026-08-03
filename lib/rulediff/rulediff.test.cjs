const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const {
  applyRenameMap,
  diffStylesheets,
  hasFailures,
  invertRenameMap,
  parseArgs,
  parseStylesheet,
  splitSelectors,
} = require('./rulediff.cjs');

const RULEDIFF = path.join(__dirname, 'rulediff.cjs');

function keys(css) {
  return [...parseStylesheet(css).keys()];
}

function finalMap(css, key) {
  const properties = parseStylesheet(css).get(key);
  assert.ok(properties, `no rule keyed ${key}`);
  return Object.fromEntries(properties);
}

test('splits a selector list only on its top-level commas', () => {
  // The framework emits gate combinations as comma groups and the release merge
  // pass rewrites them, so group membership must not be
  // part of the key. Splitting inside :is() or an attribute value would invent keys
  // that never existed.
  assert.deepEqual(splitSelectors('.a:is(.b,.c),.d'), ['.a:is(.b,.c)', '.d']);
  assert.deepEqual(splitSelectors('[data-list="a,b"],.e'), ['[data-list="a,b"]', '.e']);
  assert.deepEqual(splitSelectors('.a , .b ,'), ['.a', '.b']);
});

test('keeps escaped selector characters whole', () => {
  // Variant utilities carry escaped colons and brackets (`.md\:flex`, `.w-\[10px\]`),
  // and an escaped comma is a character, not a separator.
  assert.deepEqual(splitSelectors('.md\\:flex,.lg\\:flex'), ['.md\\:flex', '.lg\\:flex']);
  assert.deepEqual(splitSelectors('.a\\,b,.c'), ['.a\\,b', '.c']);
  assert.deepEqual(keys('.w-\\[10px\\]{width:10px}'), ['.w-\\[10px\\]']);
});

test('reads through strings that contain braces', () => {
  // One unbalanced brace treated as structure desynchronizes the rest of the file, so
  // both the prelude scanner and the block scanner have to know about strings.
  const css = '[data-note="}"]{color:red}.b{content:"}"}.c{color:blue}';

  assert.deepEqual(keys(css), ['[data-note="}"]', '.b', '.c']);
  assert.deepEqual(finalMap(css, '.b'), { content: '"}"' });
  assert.deepEqual(finalMap(css, '.c'), { color: 'blue' });
});

test('aggregates duplicate selectors in source order', () => {
  // The same selector is emitted many times across the bundle. What the diff compares
  // is the map the cascade lands on, so a later block wins per property and leaves the
  // properties it does not mention alone.
  const css = '.a{color:red;margin:0}.b{color:green}.a{color:blue}';

  assert.deepEqual(finalMap(css, '.a'), { color: 'blue', margin: '0' });
  assert.deepEqual(finalMap(css, '.b'), { color: 'green' });
});

test('keeps an !important declaration against a later normal one', () => {
  const css = '.a{color:red!important;margin:0}.a{color:blue;margin:4px}';

  assert.deepEqual(finalMap(css, '.a'), { color: 'red!important', margin: '4px' });
});

test('later !important wins, so the guard is not a one-way latch', () => {
  const css = '.a{color:red!important}.a{color:blue!important}';

  assert.deepEqual(finalMap(css, '.a'), { color: 'blue!important' });
});

test('splits declarations on top-level semicolons only', () => {
  const css = '.a{background:url(data:image/svg+xml,a;b);color:red}';

  assert.deepEqual(finalMap(css, '.a'), { background: 'url(data:image/svg+xml,a;b)', color: 'red' });
});

test('keys a selector by its at-rule context', () => {
  // Same selector, different context, different outcome: the key has to carry the
  // whole stack or a layered override would compare equal to the base rule.
  const css = [
    '@layer tn--utilities{',
    '.a{color:red}',
    '@media (min-width:10px){.a{color:blue}}',
    '@supports (display:grid){.a{display:grid}}',
    '@container (min-width:20px){.a{color:green}}',
    '}',
    '.a{color:black}',
  ].join('');

  assert.deepEqual(keys(css), [
    '@layer tn--utilities || .a',
    '@layer tn--utilities || @media (min-width:10px) || .a',
    '@layer tn--utilities || @supports (display:grid) || .a',
    '@layer tn--utilities || @container (min-width:20px) || .a',
    '.a',
  ]);
  assert.deepEqual(finalMap(css, '.a'), { color: 'black' });
});

test('ignores statement at-rules, which key nothing', () => {
  const css = '@charset "utf-8";@layer tn--base,tn--utilities;@import url(x.css);.a{color:red}';

  assert.deepEqual(keys(css), ['.a']);
});

test('treats @font-face and @keyframes bodies as opaque', () => {
  // Neither carries a cascade to model. Comparing the raw body is what catches a
  // dropped src or a rewritten keyframe stop, and the bodies for one prelude
  // accumulate so a lost @font-face among several still shows.
  const css = [
    '@font-face{font-family:A;src:url(a.woff2)}',
    '@font-face{font-family:B;src:url(b.woff2)}',
    '@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}',
  ].join('');

  assert.deepEqual(finalMap(css, '@font-face'), {
    __raw__: 'font-family:A;src:url(a.woff2)font-family:B;src:url(b.woff2)',
  });
  assert.deepEqual(finalMap(css, '@keyframes spin'), {
    __raw__: 'from{transform:rotate(0)}to{transform:rotate(360deg)}',
  });
});

test('keys a registered custom property by its @property prelude', () => {
  // plugins.js reads the --framework-border-render-* family by name, so the diff has
  // to notice a registration that changed syntax or lost its initial value.
  const css = '@property --framework-border-render-width{syntax:"<length>";inherits:false;initial-value:0px}';

  assert.deepEqual(finalMap(css, '@property --framework-border-render-width'), {
    __raw__: 'syntax:"<length>";inherits:false;initial-value:0px',
  });
});

test('applies a rename map to declarations and var() references alike', () => {
  const renames = invertRenameMap({ 'border-1-h-image': '_tn0', 'tn-bg-image': '_tn1' });
  const renamed = '.a{--_tn0:url(x.svg);--_tn1:var(--_tn0);background:var(--_tn1,none)}';

  assert.equal(
    applyRenameMap(renamed, renames),
    '.a{--border-1-h-image:url(x.svg);--tn-bg-image:var(--border-1-h-image);background:var(--tn-bg-image,none)}'
  );
});

test('the rename map leaves everything it does not name alone', () => {
  // Three ways a token can look like a private variable and not be one: it is a public
  // name, it is a class name that merely contains a double dash, or it only shares a
  // prefix with a renamed name.
  const renames = invertRenameMap({ 'tile-gray-10': '_tn0' });
  const css = '.screen--dark-mode .bg--gray-10{--gray-10:#eee;--_tn0:1;--_tn0-extra:2;content:"--_tn0"}';

  assert.equal(
    applyRenameMap(css, renames),
    '.screen--dark-mode .bg--gray-10{--gray-10:#eee;--tile-gray-10:1;--_tn0-extra:2;content:"--_tn0"}'
  );
});

test('reads a rename map written with or without leading dashes', () => {
  const bare = invertRenameMap({ 'tn-bg-image': '_tn5' });
  const dashed = invertRenameMap({ '--tn-bg-image': '--_tn5' });

  assert.deepEqual([...bare], [...dashed]);
  assert.equal(applyRenameMap('.a{--_tn5:1}', dashed), '.a{--tn-bg-image:1}');
});

test('rejects a rename map that cannot be inverted', () => {
  assert.throws(() => invertRenameMap({ a: '_tn0', b: '_tn0' }), /ambiguous/);
  assert.throws(() => invertRenameMap(['a']), /JSON object/);
  assert.throws(() => invertRenameMap({ a: 1 }), /must name a string/);
});

test('reports removed, added and changed keys', () => {
  const base = parseStylesheet('.a{color:red;margin:0}.b{color:green}');
  const candidate = parseStylesheet('.a{color:blue;padding:0}.c{color:black}');
  const differences = diffStylesheets(base, candidate);

  assert.deepEqual(differences.removed, ['.b']);
  assert.deepEqual(differences.added, ['.c']);
  assert.deepEqual(differences.changed, [
    {
      key: '.a',
      differences: ['~ color: red -> blue', '- margin: 0', '+ padding: 0'],
    },
  ]);
});

test('regrouped comma lists and reordered rules are not differences', () => {
  // The whole point of the key: a transform may re-cut comma groups and move rules,
  // as long as every selector still resolves to the same map.
  const base = parseStylesheet('.a,.b{color:red}.c{color:red}');
  const candidate = parseStylesheet('.c,.a{color:red}.b{color:red}');

  assert.deepEqual(diffStylesheets(base, candidate), { removed: [], added: [], changed: [] });
});

test('only --allow-added tolerates an added key', () => {
  const added = { removed: [], added: ['.c'], changed: [] };

  assert.equal(hasFailures(added), true);
  assert.equal(hasFailures(added, { allowAdded: true }), false);
  assert.equal(hasFailures({ removed: ['.b'], added: [], changed: [] }, { allowAdded: true }), true);
  assert.equal(hasFailures({ removed: [], added: [], changed: [{ key: '.a' }] }, { allowAdded: true }), true);
  assert.equal(hasFailures({ removed: [], added: [], changed: [] }), false);
});

test('parses the CLI options', () => {
  const full = ['base.css', 'candidate.css', '--rename-map', 'map.json', '--base-rename-map',
                'base-map.json', '--report', 'tmp/diff', '--allow-added'];

  assert.deepEqual(parseArgs(full), {
    basePath: 'base.css',
    candidatePath: 'candidate.css',
    renameMapPath: 'map.json',
    baseRenameMapPath: 'base-map.json',
    reportPath: 'tmp/diff',
    allowAdded: true,
  });
  assert.deepEqual(parseArgs(['base.css', 'candidate.css']), {
    basePath: 'base.css',
    candidatePath: 'candidate.css',
    renameMapPath: null,
    baseRenameMapPath: null,
    reportPath: null,
    allowAdded: false,
  });
});

test('rejects a malformed command line', () => {
  assert.throws(() => parseArgs(['base.css']), /Two CSS input paths are required/);
  assert.throws(() => parseArgs(['a.css', 'b.css', 'c.css']), /Two CSS input paths are required/);
  assert.throws(() => parseArgs(['a.css', 'b.css', '--rename-map', '--report']), /--rename-map requires a path/);
  assert.throws(() => parseArgs(['a.css', 'b.css', '--base-rename-map']), /--base-rename-map requires a path/);
  assert.throws(() => parseArgs(['a.css', 'b.css', '--report']), /--report requires a path/);
  assert.throws(() => parseArgs(['a.css', 'b.css', '--typo']), /Unknown option: --typo/);
});

test('the command exits clean on a renamed bundle and dirty on a changed one', () => {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rulediff-'));
  const write = (name, body) => {
    const file = path.join(workDir, name);
    fs.writeFileSync(file, body);
    return file;
  };

  const base = write('base.css', '.a{--tile-gray-10:url(x.svg);color:var(--tile-gray-10)}.b{color:red}');
  const renamed = write('renamed.css', '.a{--_tn0:url(x.svg);color:var(--_tn0)}.b{color:red}');
  const changed = write('changed.css', '.a{--_tn0:url(x.svg);color:var(--_tn0)}.b{color:blue}');
  const map = write('map.json', JSON.stringify({ 'tile-gray-10': '_tn0' }));
  const reportPath = path.join(workDir, 'reports', 'diff');

  const clean = execFileSync(process.execPath, [RULEDIFF, base, renamed, '--rename-map', map], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  assert.deepEqual(JSON.parse(clean).removedKeys, 0);
  assert.deepEqual(JSON.parse(clean).changedKeys, 0);
  assert.deepEqual(JSON.parse(clean).renamedVariables, 1);

  assert.throws(
    () => execFileSync(process.execPath, [RULEDIFF, base, changed, '--rename-map', map, '--report', reportPath], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }),
    (error) => {
      assert.equal(error.status, 1);
      assert.equal(JSON.parse(error.stdout).changedKeys, 1);
      return true;
    }
  );

  assert.match(fs.readFileSync(`${reportPath}.changed.txt`, 'utf8'), /^\.b\n {2}~ color: red -> blue$/m);
  assert.equal(fs.readFileSync(`${reportPath}.removed.txt`, 'utf8'), '');

  // Without the rename map the same pair is a wall of differences, which is the check
  // that the map is doing the work rather than the parser ignoring variable names.
  assert.throws(
    () => execFileSync(process.execPath, [RULEDIFF, base, renamed], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }),
    (error) => {
      assert.equal(error.status, 1);
      assert.equal(JSON.parse(error.stdout).changedKeys, 1);
      return true;
    }
  );

  fs.rmSync(workDir, { recursive: true, force: true });
});

test('compares two bundles that were renamed against different tables', () => {
  // The phase 2 gate: both sides are procss output, and widening the private set
  // renumbers everything after the first new name, so `_tn0` means one variable on the
  // left and another on the right. Each side needs its own map or nothing lines up.
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rulediff-'));
  const write = (name, body) => {
    const file = path.join(workDir, name);
    fs.writeFileSync(file, body);
    return file;
  };

  const base = write('base.css', '.a{--_tn0:1;--_tn1:var(--_tn0);--border-1-h-image:url(x.svg)}');
  const baseMap = write('base.map.json', JSON.stringify({ 'tile-a': '_tn0', 'tile-b': '_tn1' }));
  const candidate = write('candidate.css', '.a{--_tn1:1;--_tn2:var(--_tn1);--_tn0:url(x.svg)}');
  const candidateMap = write(
    'candidate.map.json',
    JSON.stringify({ 'border-1-h-image': '_tn0', 'tile-a': '_tn1', 'tile-b': '_tn2' })
  );

  const clean = execFileSync(
    process.execPath,
    [RULEDIFF, base, candidate, '--base-rename-map', baseMap, '--rename-map', candidateMap],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );
  const summary = JSON.parse(clean);

  assert.equal(summary.changedKeys, 0);
  assert.equal(summary.removedKeys, 0);
  assert.equal(summary.baseRenamedVariables, 2);
  assert.equal(summary.renamedVariables, 3);

  // Mapping only the candidate leaves the base in its own renamed space, which is the
  // failure this flag exists to prevent.
  assert.throws(
    () => execFileSync(process.execPath, [RULEDIFF, base, candidate, '--rename-map', candidateMap], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }),
    (error) => {
      assert.equal(error.status, 1);
      return true;
    }
  );

  fs.rmSync(workDir, { recursive: true, force: true });
});
