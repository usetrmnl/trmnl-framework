const assert = require('node:assert/strict');
const test = require('node:test');
const postcss = require('postcss');

const mergeRules = require('./mergerules.cjs');
const { selectorSpecificities } = require('./mergerules.cjs');
const { finalPropertyMaps, diffPropertyMaps, verifyStylesheets } = require('./mergeverify.cjs');

function merge(css) {
  return postcss([mergeRules()]).process(css, { from: 'fixture.css' }).css;
}

function specificity(selector) {
  return selectorSpecificities(selector);
}

test('folds identical declaration bodies into one comma rule', () => {
  assert.equal(
    merge('@layer tn--utilities{.a{color:red}.b{margin:0}.c{color:red}}'),
    '@layer tn--utilities{.a,.c{color:red}.b{margin:0}}'
  );
});

test('keeps the earliest rule as the anchor and the survivors in order', () => {
  // The merged selector joins the first occurrence, so the shared body keeps the
  // cascade position it already had and nothing that stays moves.
  assert.equal(
    merge('@layer tn--utilities{.a{color:red}.b{color:red}.c{color:red}}'),
    '@layer tn--utilities{.a,.b,.c{color:red}}'
  );
});

test('an equal-specificity rule declaring a shared property differently blocks the merge', () => {
  // An element carrying both `.c` and `.q` resolves the tie by source order, so
  // moving `.c` in front of `.q` would flip which value wins.
  const css = '@layer tn--utilities{.a{color:red}.q{color:blue}.c{color:red}}';

  assert.equal(merge(css), css);
});

test('an equal-specificity rule declaring an unrelated property does not block', () => {
  assert.equal(
    merge('@layer tn--utilities{.a{color:red}.q{margin:0}.c{color:red}}'),
    '@layer tn--utilities{.a,.c{color:red}.q{margin:0}}'
  );
});

test('a different-specificity rule does not block, in either direction', () => {
  assert.equal(
    merge('@layer tn--utilities{.a{color:red}.q .r{color:blue}.c{color:red}}'),
    '@layer tn--utilities{.a,.c{color:red}.q .r{color:blue}}'
  );
  assert.equal(
    merge('@layer tn--utilities{.a .b{color:red}q{color:blue}.a .c{color:red}}'),
    '@layer tn--utilities{.a .b,.a .c{color:red}q{color:blue}}'
  );
});

test('the block is decided per comma part, not only on the most specific one', () => {
  // `.c` alone ties with `.q`. Pricing the moved selector only by its most
  // specific part (`.c .d`) would miss that and merge unsafely.
  const css = '@layer tn--utilities{.a{color:red}.q{color:blue}.c,.c .d{color:red}}';

  assert.equal(merge(css), css);
});

test('a shorthand between duplicates blocks the longhand they share', () => {
  const css = '@layer tn--utilities{.a{background-image:none}.q{background:blue}.c{background-image:none}}';

  assert.equal(merge(css), css);
});

test('sibling longhands of one shorthand do not block each other', () => {
  assert.equal(
    merge('@layer tn--utilities{.a{background-image:none}.q{background-color:blue}.c{background-image:none}}'),
    '@layer tn--utilities{.a,.c{background-image:none}.q{background-color:blue}}'
  );
});

test('a physical longhand between duplicates blocks the logical one it resolves onto', () => {
  // `margin-block-start` is `margin-top` in a horizontal writing mode, so an element
  // carrying both `.c` and `.q` resolves the tie by source order exactly as two
  // spellings of one property would. The two carried disjoint key sets before: the
  // logical name got a family key, the physical longhand only its own name.
  const pairs = [
    ['margin-block-start:0', 'margin-top:5px'],
    ['padding-inline-start:0', 'padding-left:5px'],
    ['margin-block:0', 'margin-bottom:5px'],
    ['inset-block-start:0', 'top:5px'],
    ['border-block-start-width:0', 'border-top-width:5px'],
    ['border-start-start-radius:0', 'border-top-left-radius:5px'],
    ['block-size:0', 'width:5px'],
    ['overflow-inline:hidden', 'overflow-x:scroll'],
  ];

  for (const [logical, physical] of pairs) {
    const css = `@layer tn--utilities{.a{${logical}}.q{${physical}}.c{${logical}}}`;

    assert.equal(merge(css), css, `${logical} must not merge across ${physical}`);
  }
});

test('a legacy alias between duplicates blocks its modern spelling', () => {
  // `grid-gap` and `gap` are one property with two names, so the analyzer has to
  // price them as a tie rather than as unrelated declarations.
  const pairs = [
    ['gap:0', 'grid-gap:5px'],
    ['row-gap:0', 'grid-row-gap:5px'],
    ['column-gap:0', 'grid-column-gap:5px'],
    ['grid-gap:0', 'row-gap:5px'],
  ];

  for (const [left, right] of pairs) {
    const css = `@layer tn--utilities{.a{${left}}.q{${right}}.c{${left}}}`;

    assert.equal(merge(css), css, `${left} must not merge across ${right}`);
  }
});

test('unrelated sides and axes of a logical family still merge', () => {
  // The fix must not price every box property against every other one: a merge
  // refused costs bytes on the utility bodies the pass exists to fold.
  assert.equal(
    merge('@layer tn--utilities{.a{margin-block-start:0}.q{padding-top:5px}.c{margin-block-start:0}}'),
    '@layer tn--utilities{.a,.c{margin-block-start:0}.q{padding-top:5px}}'
  );
  assert.equal(
    merge('@layer tn--utilities{.a{row-gap:0}.q{grid-column-gap:5px}.c{row-gap:0}}'),
    '@layer tn--utilities{.a,.c{row-gap:0}.q{grid-column-gap:5px}}'
  );
});

test('custom properties collide only with themselves', () => {
  assert.equal(
    merge('@layer tn--utilities{.a{--tn-size-w:1px}.q{--tn-size-h:2px}.c{--tn-size-w:1px}}'),
    '@layer tn--utilities{.a,.c{--tn-size-w:1px}.q{--tn-size-h:2px}}'
  );

  const blocked = '@layer tn--utilities{.a{--tn-size-w:1px}.q{--tn-size-w:2px}.c{--tn-size-w:1px}}';
  assert.equal(merge(blocked), blocked);
});

test('layers are isolated', () => {
  const css = '@layer tn--base{.a{color:red}}@layer tn--utilities{.c{color:red}}';

  assert.equal(merge(css), css);
});

test('at-rule contexts are isolated, and an at-rule between duplicates blocks', () => {
  const isolated = '@layer tn--base{.a{color:red}}@media print{.c{color:red}}';
  assert.equal(merge(isolated), isolated);

  const crossed = '@layer tn--base{.a{color:red}@media print{.q{color:red}}.c{color:red}}';
  assert.equal(merge(crossed), crossed);

  // Duplicates inside one at-rule still merge.
  assert.equal(
    merge('@media print{.a{color:red}.c{color:red}}'),
    '@media print{.a,.c{color:red}}'
  );
});

test('an inert at-rule between duplicates does not block', () => {
  // @property registers a custom property; it cannot declare anything on an element.
  assert.equal(
    merge('@layer tn--base{.a{color:red}@property --tn-invert{syntax:"<number>";inherits:false;initial-value:0}.c{color:red}}'),
    '@layer tn--base{.a,.c{color:red}@property --tn-invert{syntax:"<number>";inherits:false;initial-value:0}}'
  );
});

test(':where() contributes zero specificity', () => {
  assert.deepEqual(specificity(':where(.q, #i).r'), [1024]);
  assert.deepEqual(specificity('.r'), [1024]);

  // Priced as one class, `:where(.q).r` ties with `.a` and blocks.
  const blocked = '@layer tn--utilities{.a{color:red}:where(.q).r{color:blue}.c{color:red}}';
  assert.equal(merge(blocked), blocked);

  // The same rule without :where() carries two classes and no longer ties.
  assert.equal(
    merge('@layer tn--utilities{.a{color:red}.q.r{color:blue}.c{color:red}}'),
    '@layer tn--utilities{.a,.c{color:red}.q.r{color:blue}}'
  );
});

test(':is() and :not() take their most specific argument', () => {
  assert.deepEqual(specificity(':is(.q,#i)'), specificity('#i'));
  assert.deepEqual(specificity(':not(.q)'), specificity('.q'));
  assert.deepEqual(specificity(':is(a, .q)'), specificity('.q'));

  // (1,0,0) against (0,1,0): no tie, so the merge is safe.
  assert.equal(
    merge('@layer tn--utilities{.a{color:red}:is(.q,#i){color:blue}.c{color:red}}'),
    '@layer tn--utilities{.a,.c{color:red}:is(.q,#i){color:blue}}'
  );

  // (0,1,0) against (0,1,0): a tie, so the merge is refused.
  const blocked = '@layer tn--utilities{.a{color:red}:is(.q,a){color:blue}.c{color:red}}';
  assert.equal(merge(blocked), blocked);
});

test('escaped class names and gate selectors are priced, not skipped', () => {
  assert.deepEqual(specificity('.trmnl .md\\:h--min-\\[112px\\]'), specificity('.a .b'));
  assert.deepEqual(
    specificity('.trmnl .screen:not(.screen--portrait) .gap--large'),
    specificity('.a .b.c .d')
  );
});

test('a selector the analyzer cannot price blocks every merge across it', () => {
  // `:nth-child(n of S)` adds its argument's specificity; rather than guess, the
  // rule is treated as tying at any specificity.
  const css = '@layer tn--utilities{.a{color:red}.q:nth-child(1 of .r){color:blue}.c{color:red}}';

  assert.equal(merge(css), css);
  assert.equal(selectorSpecificities('.q:nth-child(1 of .r)'), null);
});

test('bodies carrying !important are never merged', () => {
  const css = '@layer tn--utilities{.a{color:red!important}.b{margin:0}.c{color:red!important}}';

  assert.equal(merge(css), css);
});

test('declaration order is part of the body identity', () => {
  const css = '@layer tn--utilities{.a{color:red;margin:0}.c{margin:0;color:red}}';

  assert.equal(merge(css), css);
});

test('running the pass twice equals running it once', () => {
  const source = [
    '@layer tn--utilities{',
    '.a{color:red}.q{color:blue}.b{color:red}.r .s{color:green}.c{color:red}',
    '.d{margin:0}.e{margin:0}',
    '}',
  ].join('');

  const once = merge(source);
  const twice = merge(once);

  assert.equal(twice, once);
  assert.notEqual(once, source);
});

test('the output is valid CSS and every selector keeps its final property map', () => {
  const source = [
    '@layer tn--base{.a{--tn-size-w:1px;width:var(--tn-size-w)}.q{color:blue}',
    '.b{--tn-size-w:1px;width:var(--tn-size-w)}}',
    '@layer tn--utilities{.c{color:red}.d .e{color:blue}.f{color:red}}',
    '@media print{.g{color:red}.h{color:red}}',
  ].join('');

  const output = merge(source);

  assert.doesNotThrow(() => postcss.parse(output));
  assert.deepEqual(verifyStylesheets(source, output).differences, []);
});

test('the verifier reports a selector whose final value changed', () => {
  // Guards the check above against passing vacuously.
  const before = finalPropertyMaps('@layer tn--utilities{.a{color:red}}');
  const after = finalPropertyMaps('@layer tn--utilities{.a{color:blue}}');

  assert.deepEqual(diffPropertyMaps(before, after), [
    'changed color on @layer tn--utilities { .a }: red -> blue',
  ]);
});

test('the verifier keys on individual selectors, so comma regrouping compares equal', () => {
  const before = finalPropertyMaps('.a{color:red}.b{color:red}');
  const after = finalPropertyMaps('.a,.b{color:red}');

  assert.deepEqual(diffPropertyMaps(before, after), []);
});
