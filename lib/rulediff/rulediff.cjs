const fs = require('fs');
const path = require('path');

// Rule-level diff of two minified CSS bundles. This is the proof tool behind every
// size change to plugins.css: a transform is allowed to move
// bytes around, and nothing else. It answers one question, per selector, in a form a
// human can read when the answer is no.
//
// The unit of comparison is (at-rule context, one selector) -> final property map.
// Comma groups are split, so a selector that moves between groups is still the same
// key; duplicate rules for one selector are folded in source order, so what survives
// is what the cascade would apply at equal specificity. That makes the comparison
// blind to the two things a minifier legitimately changes (rule grouping and rule
// order within a selector) and sensitive to the one thing it must never change (the
// value an element ends up with).
//
// Both inputs must be minified the same way. Comparing a readable build against a
// minified one reports every value cssnano normalized (`0.5px` -> `.5px`,
// `to right` -> `90deg`) as a change, which is noise, not evidence.
//
// CLI options:
//   --rename-map <path>       JSON rename table, { "<original>": "<renamed>" } with bare
//                             names (no leading dashes), as written by
//                             `procss --rename-map-output`. It is applied in reverse to
//                             the CANDIDATE bundle, custom property declarations and
//                             var() references alike, so it compares in original-name
//                             space.
//   --base-rename-map <path>  the same for the base bundle. Both sides need one
//                             whenever both were renamed: the private numbering is
//                             assignment order, so widening the private set moves every
//                             name that follows and the two bundles share no `_tn<n>`
//                             meaning at all.
//   --report <prefix>         write <prefix>.removed.txt, <prefix>.added.txt and
//                             <prefix>.changed.txt with the full detail.
//   --allow-added             added keys are reported but do not fail the run.
//
// Exit status is nonzero when a key was removed or its final map changed, and (unless
// --allow-added) when a key was added.

// The at-rules whose blocks hold ordinary rules. Everything else that carries a block
// (@font-face, @keyframes, @property, @page) is opaque: its body is compared verbatim
// rather than parsed into a property map.
const NESTING_AT_RULES = new Set(['@media', '@supports', '@layer', '@container']);

const KEY_SEPARATOR = ' || ';

const NAME_CHARACTER = /[A-Za-z0-9_-]/;

function isNameCharacter(character) {
  return character !== undefined && NAME_CHARACTER.test(character);
}

// Index just past the closing quote. Backslash escapes are consumed as a pair, so a
// quote inside a string cannot end it.
function skipString(css, startIndex) {
  const quote = css[startIndex];
  let index = startIndex + 1;

  while (index < css.length) {
    if (css[index] === '\\') {
      index += 2;
      continue;
    }

    if (css[index] === quote) {
      return index + 1;
    }

    index += 1;
  }

  return css.length;
}

// Index just past the comment terminator, or the end of input for an unterminated one.
function skipComment(css, startIndex) {
  const end = css.indexOf('*/', startIndex + 2);

  return end === -1 ? css.length : end + 2;
}

// Split a prelude on its top-level commas. Parens and brackets nest, so `:is(.a, .b)`
// and `[data-x="a,b"]` stay whole, and a backslash escape consumes the character after
// it, so an escaped comma in a class name is not a separator.
function splitSelectors(selectorList) {
  const selectors = [];
  let depth = 0;
  let start = 0;
  let index = 0;

  while (index < selectorList.length) {
    const character = selectorList[index];

    if (character === '\\') {
      index += 2;
      continue;
    }

    if (character === '"' || character === "'") {
      index = skipString(selectorList, index);
      continue;
    }

    if (character === '(' || character === '[') {
      depth += 1;
    } else if (character === ')' || character === ']') {
      depth -= 1;
    } else if (character === ',' && depth === 0) {
      selectors.push(selectorList.slice(start, index).trim());
      start = index + 1;
    }

    index += 1;
  }

  selectors.push(selectorList.slice(start).trim());

  return selectors.filter(Boolean);
}

// Fold one declaration block into a selector's running property map. Later blocks win
// per property, except against an earlier !important: at equal specificity an
// important declaration beats every normal one that follows it.
function applyDeclarations(properties, body) {
  let depth = 0;
  let start = 0;
  let index = 0;
  const declarations = [];

  while (index < body.length) {
    const character = body[index];

    if (character === '"' || character === "'") {
      index = skipString(body, index);
      continue;
    }

    if (character === '(') {
      depth += 1;
    } else if (character === ')') {
      depth -= 1;
    } else if (character === ';' && depth === 0) {
      declarations.push(body.slice(start, index));
      start = index + 1;
    }

    index += 1;
  }

  declarations.push(body.slice(start));

  for (const declaration of declarations) {
    const colon = declaration.indexOf(':');

    if (colon < 0) {
      continue;
    }

    const property = declaration.slice(0, colon).trim();
    const value = declaration.slice(colon + 1).trim();

    if (!property) {
      continue;
    }

    const existing = properties.get(property);

    if (existing !== undefined && existing.endsWith('!important') && !value.endsWith('!important')) {
      continue;
    }

    properties.set(property, value);
  }
}

// Parse a stylesheet into Map(key -> Map(property -> value)), where key is the at-rule
// context stack joined with the selector.
function parseStylesheet(css) {
  const rules = new Map();
  const context = [];
  let index = 0;

  const keyFor = (selector) => (context.length ? context.join(KEY_SEPARATOR) + KEY_SEPARATOR + selector : selector);

  const propertiesFor = (key) => {
    let properties = rules.get(key);

    if (!properties) {
      properties = new Map();
      rules.set(key, properties);
    }

    return properties;
  };

  // Everything up to the block or statement terminator that ends the prelude. Parens
  // nest so a `;` inside url() or a media feature cannot end it early.
  const readPrelude = () => {
    const start = index;
    let depth = 0;

    while (index < css.length) {
      const character = css[index];

      if (character === '\\') {
        index += 2;
        continue;
      }

      if (character === '"' || character === "'") {
        index = skipString(css, index);
        continue;
      }

      if (character === '/' && css[index + 1] === '*') {
        index = skipComment(css, index);
        continue;
      }

      if (character === '(') {
        depth += 1;
      } else if (character === ')') {
        depth -= 1;
      } else if (depth === 0 && (character === '{' || character === ';' || character === '}')) {
        return css.slice(start, index);
      }

      index += 1;
    }

    return css.slice(start);
  };

  // The block body, with index left just past the matching close brace.
  const readBlock = () => {
    const start = index + 1;
    let depth = 0;

    while (index < css.length) {
      const character = css[index];

      if (character === '"' || character === "'") {
        index = skipString(css, index);
        continue;
      }

      if (character === '/' && css[index + 1] === '*') {
        index = skipComment(css, index);
        continue;
      }

      if (character === '{') {
        depth += 1;
      } else if (character === '}') {
        depth -= 1;

        if (depth === 0) {
          const body = css.slice(start, index);
          index += 1;
          return body;
        }
      }

      index += 1;
    }

    return css.slice(start);
  };

  while (index < css.length) {
    const character = css[index];

    if (character === ' ' || character === '\n' || character === '\t' || character === '\r') {
      index += 1;
      continue;
    }

    if (character === '/' && css[index + 1] === '*') {
      index = skipComment(css, index);
      continue;
    }

    if (character === '}') {
      context.pop();
      index += 1;
      continue;
    }

    const prelude = readPrelude().trim();

    if (index >= css.length) {
      break;
    }

    // A statement at-rule (@import, @charset, the @layer ordering statement) or a
    // stray semicolon: nothing to key.
    if (css[index] === ';') {
      index += 1;
      continue;
    }

    // Text before a close brace, which only malformed input produces. Leave the brace
    // for the loop head so the context stack still unwinds.
    if (css[index] === '}') {
      continue;
    }

    if (prelude.startsWith('@')) {
      const name = prelude.split(/[\s(]/)[0].toLowerCase();

      if (NESTING_AT_RULES.has(name)) {
        context.push(prelude);
        index += 1;
        continue;
      }

      // Opaque at-rule. Bodies for one prelude accumulate in source order, so a
      // reordered or dropped @font-face shows up as a changed key.
      const body = readBlock();
      const properties = propertiesFor(keyFor(prelude));
      properties.set('__raw__', (properties.get('__raw__') || '') + body);
      continue;
    }

    const body = readBlock();

    for (const selector of splitSelectors(prelude)) {
      applyDeclarations(propertiesFor(keyFor(selector)), body);
    }
  }

  return rules;
}

function stripDashes(name) {
  return String(name).replace(/^--/, '');
}

// Turn a { original: renamed } table into the { renamed: original } lookup the diff
// applies to the candidate bundle. Names are accepted with or without their leading
// dashes; the table procss writes carries them bare.
function invertRenameMap(table) {
  if (!table || typeof table !== 'object' || Array.isArray(table)) {
    throw new Error('A rename map must be a JSON object of original name to renamed name');
  }

  const inverted = new Map();

  for (const [original, renamed] of Object.entries(table)) {
    if (typeof renamed !== 'string') {
      throw new Error(`Rename map entry ${original} must name a string`);
    }

    const from = stripDashes(renamed);
    const to = stripDashes(original);
    const existing = inverted.get(from);

    if (existing !== undefined && existing !== to) {
      throw new Error(`Rename map is ambiguous: --${from} maps back to both --${existing} and --${to}`);
    }

    inverted.set(from, to);
  }

  return inverted;
}

function loadRenameMap(filePath) {
  return invertRenameMap(JSON.parse(fs.readFileSync(filePath, 'utf8')));
}

// Rewrite every custom property token the map names, declarations and var() references
// alike, so a renamed bundle compares in original-name space. Quoted strings are
// skipped: a data URI or a content string that happens to carry the token text is not
// a custom property.
function applyRenameMap(css, renames) {
  if (renames.size === 0) {
    return css;
  }

  const chunks = [];
  let copiedTo = 0;
  let index = 0;

  while (index < css.length) {
    const character = css[index];

    if (character === '"' || character === "'") {
      index = skipString(css, index);
      continue;
    }

    if (character !== '-' || css[index + 1] !== '-' || isNameCharacter(css[index - 1])) {
      index += 1;
      continue;
    }

    let end = index + 2;

    while (end < css.length && isNameCharacter(css[end])) {
      end += 1;
    }

    const original = renames.get(css.slice(index + 2, end));

    if (original !== undefined) {
      chunks.push(css.slice(copiedTo, index), `--${original}`);
      copiedTo = end;
    }

    index = end;
  }

  chunks.push(css.slice(copiedTo));

  return chunks.join('');
}

// { removed: [key], added: [key], changed: [{ key, differences: [line] }] }
function diffStylesheets(baseRules, candidateRules) {
  const removed = [];
  const added = [];
  const changed = [];

  for (const [key, baseProperties] of baseRules) {
    const candidateProperties = candidateRules.get(key);

    if (!candidateProperties) {
      removed.push(key);
      continue;
    }

    const differences = [];

    for (const [property, value] of baseProperties) {
      const candidateValue = candidateProperties.get(property);

      if (candidateValue === undefined) {
        differences.push(`- ${property}: ${value}`);
      } else if (candidateValue !== value) {
        differences.push(`~ ${property}: ${value} -> ${candidateValue}`);
      }
    }

    for (const [property, value] of candidateProperties) {
      if (!baseProperties.has(property)) {
        differences.push(`+ ${property}: ${value}`);
      }
    }

    if (differences.length) {
      changed.push({ key, differences });
    }
  }

  for (const key of candidateRules.keys()) {
    if (!baseRules.has(key)) {
      added.push(key);
    }
  }

  return { removed, added, changed };
}

// A removed or changed key is always a failure: the bundle no longer paints what it
// painted. An added key is a failure by default too, because a transform that only
// removes bytes has no reason to invent one, and --allow-added is how a caller says
// this run is expected to (a merge pass splitting a group, for instance).
function hasFailures(differences, { allowAdded = false } = {}) {
  return Boolean(
    differences.removed.length ||
      differences.changed.length ||
      (!allowAdded && differences.added.length)
  );
}

function parseArgs(args) {
  const inputPaths = [];
  let renameMapPath = null;
  let baseRenameMapPath = null;
  let reportPath = null;
  let allowAdded = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === '--rename-map' || argument === '--base-rename-map' || argument === '--report') {
      const value = args[index + 1];

      if (!value || value.startsWith('--')) {
        throw new Error(`${argument} requires a path`);
      }

      if (argument === '--rename-map') {
        renameMapPath = value;
      } else if (argument === '--base-rename-map') {
        baseRenameMapPath = value;
      } else {
        reportPath = value;
      }

      index += 1;
    } else if (argument === '--allow-added') {
      allowAdded = true;
    } else if (argument.startsWith('--')) {
      throw new Error(`Unknown option: ${argument}`);
    } else {
      inputPaths.push(argument);
    }
  }

  if (inputPaths.length !== 2) {
    throw new Error('Two CSS input paths are required: <base.css> <candidate.css>');
  }

  return {
    basePath: inputPaths[0],
    candidatePath: inputPaths[1],
    renameMapPath,
    baseRenameMapPath,
    reportPath,
    allowAdded,
  };
}

function writeReport(reportPath, differences) {
  const directory = path.dirname(reportPath);

  if (directory) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const write = (suffix, body) => {
    const file = `${reportPath}.${suffix}.txt`;
    fs.writeFileSync(file, body ? `${body}\n` : '');
    return file;
  };

  return [
    write('removed', differences.removed.join('\n')),
    write('added', differences.added.join('\n')),
    write(
      'changed',
      differences.changed
        .map(({ key, differences: lines }) => [key, ...lines.map((line) => `  ${line}`)].join('\n'))
        .join('\n\n')
    ),
  ];
}

function run() {
  const options = parseArgs(process.argv.slice(2));

  const read = (filePath, renameMapPath) => {
    const renames = renameMapPath ? loadRenameMap(renameMapPath) : new Map();

    return {
      renames,
      rules: parseStylesheet(applyRenameMap(fs.readFileSync(filePath, 'utf8'), renames)),
    };
  };

  const base = read(options.basePath, options.baseRenameMapPath);
  const candidate = read(options.candidatePath, options.renameMapPath);
  const differences = diffStylesheets(base.rules, candidate.rules);
  const failed = hasFailures(differences, options);

  const summary = {
    base: options.basePath,
    candidate: options.candidatePath,
    baseKeys: base.rules.size,
    candidateKeys: candidate.rules.size,
    baseRenamedVariables: base.renames.size,
    renamedVariables: candidate.renames.size,
    removedKeys: differences.removed.length,
    addedKeys: differences.added.length,
    changedKeys: differences.changed.length,
  };

  if (options.reportPath) {
    summary.report = writeReport(options.reportPath, differences);
  }

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

  if (failed && !options.reportPath) {
    process.stderr.write('Rule diff failed. Re-run with --report <prefix> for the full detail.\n');
  }

  process.exitCode = failed ? 1 : 0;
}

if (require.main === module) {
  try {
    run();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

module.exports = {
  applyRenameMap,
  diffStylesheets,
  hasFailures,
  invertRenameMap,
  loadRenameMap,
  parseArgs,
  parseStylesheet,
  splitSelectors,
};
