// Semantic check for the duplicate-body merge pass. Reduces a stylesheet to
// (at-rule context, individual selector) -> final declared property map, so a
// selector that moved between comma groups compares equal while a selector that
// gained, lost, or changed a declaration does not.
//
// What this proves: every selector still declares exactly what it declared.
// What it cannot prove: cascade order between two different selectors. That is
// what the specificity interval condition in mergerules.cjs is for, and what the
// parity suites exercise on the served bytes.

const postcss = require('postcss');
const fs = require('fs');

const { splitSelectorList } = require('./mergerules.cjs');

// Selectors and at-rule params both carry spaces, commas and braces, so the
// context/selector pair is joined as JSON rather than by a separator character.
function mapKey(context, selector) {
  return JSON.stringify([context, selector]);
}

function describeKey(key) {
  const [context, selector] = JSON.parse(key);

  return context ? `${context} { ${selector} }` : selector;
}

function atRuleContext(node) {
  const parts = [];
  let current = node.parent;

  while (current && current.type !== 'root') {
    if (current.type === 'atrule') {
      parts.push(`@${current.name} ${current.params.trim()}`);
    } else if (current.type === 'rule') {
      parts.push(current.selector.trim());
    }

    current = current.parent;
  }

  return parts.reverse().join(' | ');
}

function finalPropertyMaps(css) {
  const root = postcss.parse(css);
  const maps = new Map();

  root.walkRules((rule) => {
    const parts = splitSelectorList(rule.selector) || [rule.selector.trim()];
    const context = atRuleContext(rule);

    for (const part of parts) {
      const key = mapKey(context, part);
      let properties = maps.get(key);

      if (!properties) {
        properties = new Map();
        maps.set(key, properties);
      }

      for (const child of rule.nodes || []) {
        if (child.type !== 'decl') {
          continue;
        }

        properties.set(child.prop.trim(), `${child.value.trim()}${child.important ? ' !important' : ''}`);
      }
    }
  });

  return maps;
}

function diffPropertyMaps(before, after, { limit = 20 } = {}) {
  const differences = [];

  const record = (message) => {
    if (differences.length < limit) {
      differences.push(message);
    }
  };

  for (const [key, properties] of before) {
    const other = after.get(key);

    if (!other) {
      record(`missing selector: ${describeKey(key)}`);
      continue;
    }

    for (const [property, value] of properties) {
      if (!other.has(property)) {
        record(`missing declaration ${property} on ${describeKey(key)}`);
      } else if (other.get(property) !== value) {
        record(`changed ${property} on ${describeKey(key)}: ${value} -> ${other.get(property)}`);
      }
    }

    for (const property of other.keys()) {
      if (!properties.has(property)) {
        record(`added declaration ${property} on ${describeKey(key)}`);
      }
    }
  }

  for (const key of after.keys()) {
    if (!before.has(key)) {
      record(`added selector: ${describeKey(key)}`);
    }
  }

  return differences;
}

function verifyStylesheets(beforeCss, afterCss, options) {
  const before = finalPropertyMaps(beforeCss);
  const after = finalPropertyMaps(afterCss);

  return {
    selectors: before.size,
    differences: diffPropertyMaps(before, after, options),
  };
}

function run() {
  const [beforePath, afterPath] = process.argv.slice(2);

  if (!beforePath || !afterPath) {
    throw new Error('Usage: node lib/procss/mergeverify.cjs <before.css> <after.css>');
  }

  const result = verifyStylesheets(
    fs.readFileSync(beforePath, 'utf8'),
    fs.readFileSync(afterPath, 'utf8')
  );

  process.stdout.write(`selectors compared: ${result.selectors}\n`);

  if (!result.differences.length) {
    process.stdout.write('final property maps identical\n');
    return;
  }

  process.stdout.write(`differences: ${result.differences.length}\n`);

  for (const difference of result.differences) {
    process.stdout.write(`  ${difference}\n`);
  }

  process.exitCode = 1;
}

if (require.main === module) {
  run();
}

module.exports = {
  diffPropertyMaps,
  finalPropertyMaps,
  verifyStylesheets,
};
