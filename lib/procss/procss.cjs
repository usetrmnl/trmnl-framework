const postcss = require('postcss');
const cssnano = require('cssnano');
const advancedPreset = require('cssnano-preset-advanced');
const fs = require('fs');
const variableRename = require('postcss-rename/variable');
const valueParser = require('postcss-value-parser');
const mergeRules = require('./mergerules.cjs');

const FONT_FACE_KEYWORD = '@font-face';

// Public custom properties are part of the framework/theme/Core contract. Only
// variables whose names explicitly mark them as implementation details may be
// shortened. Keep this allowlist deliberately small: an unknown variable is
// public by default.
//
// `border-` is the internal border pipeline and `tn-` is the engine plumbing.
// The lookahead exempts the three names the runtime reads off computed styles
// (`--tn-text-stroke-color`, `--tn-text-stroke-width`,
// `--tn-text-stroke-radius`); the theme contract names under `--border-token-`
// stay intact through `--preserve-variables-from`. The runtime also builds
// `--framework-border-render-` names by string concatenation, which no pattern
// here matches.
const PRIVATE_VARIABLE_PATTERNS = [
  /^_/,
  /^framework-internal-/,
  /^tile-/,
  /^bline-\d+$/,
  /^border-/,
  /^tn-(?!text-stroke-(color|width|radius)$)/,
];

// The four transforms the advanced preset adds on top of the default one all rewrite
// or drop identifiers the bundle does not own, so each is off by name rather than by
// luck. `zindex` rebases every stacking value (it aborts only while some negative
// z-index survives), and the other three delete or fold @keyframes, @counter-style,
// counter() and grid-area idents whose only other reference may live in a plugin's own
// markup or in Core. The bundle carries none of those today, which is exactly why an
// accidental no-op must not be mistaken for a decision. spec/.../procss.test.cjs pins
// them off.
const UNSAFE_ADVANCED_TRANSFORMS = {
  discardUnused: false,
  mergeIdents: false,
  reduceIdents: false,
  zindex: false,
};

const preset = advancedPreset({
  autoprefixer: false,
  discardComments: { removeAll: true },
  ...UNSAFE_ADVANCED_TRANSFORMS,
});

// CLI options:
//   --output <path>                   processed CSS destination (default: stdout)
//   --preserve-variables-from <path>  repeatable; every custom property the file names
//                                     is exempt from renaming
//   --rename-map-output <path>        write the private-variable rename table as JSON,
//                                     { "<original>": "<renamed>" }, names bare with no
//                                     leading dashes and entries in assignment order.
//                                     lib/rulediff reads exactly this shape, which is
//                                     what lets it compare a renamed bundle against an
//                                     unrenamed one.
function parseArgs(args) {
  let filePath = null;
  let outputPath = null;
  let renameMapOutputPath = null;
  const contractPaths = [];

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (
      argument === '--output' ||
      argument === '--preserve-variables-from' ||
      argument === '--rename-map-output'
    ) {
      const value = args[index + 1];

      if (!value || value.startsWith('--')) {
        throw new Error(`${argument} requires a path`);
      }

      if (argument === '--output') {
        outputPath = value;
      } else if (argument === '--rename-map-output') {
        renameMapOutputPath = value;
      } else {
        contractPaths.push(value);
      }

      index += 1;
    } else if (argument.startsWith('--')) {
      throw new Error(`Unknown option: ${argument}`);
    } else if (!filePath) {
      filePath = argument;
    } else {
      throw new Error(`Unexpected argument: ${argument}`);
    }
  }

  if (!filePath) {
    throw new Error('A CSS input path is required');
  }

  return { filePath, outputPath, contractPaths, renameMapOutputPath };
}

function customPropertyNames(css) {
  const names = new Set();
  const root = postcss.parse(css);

  root.walkDecls((declaration) => {
    if (declaration.prop.startsWith('--')) {
      names.add(declaration.prop.slice(2));
    }

    valueParser(declaration.value).walk((node) => {
      if (node.type === 'word' && node.value.startsWith('--')) {
        names.add(node.value.slice(2));
      }
    });
  });

  root.walkAtRules('property', (atRule) => {
    const name = atRule.params.trim();
    if (name.startsWith('--')) {
      names.add(name.slice(2));
    }
  });

  return names;
}

function isPrivateVariable(name) {
  return PRIVATE_VARIABLE_PATTERNS.some((pattern) => pattern.test(name));
}

function preservedVariableNames(sourceCss, contractCss = []) {
  const sourceNames = customPropertyNames(sourceCss);
  const contractNames = new Set(
    contractCss.flatMap((css) => Array.from(customPropertyNames(css)))
  );

  return new Set([
    ...contractNames,
    ...Array.from(sourceNames).filter((name) => !isPrivateVariable(name)),
  ]);
}

// `renames` is the table the caller reads back afterwards (--rename-map-output). It is
// passed in rather than returned so the strategy stays a plain postcss-rename callback.
function privateVariableStrategy(reservedNames, renames = new Map()) {
  let nextIndex = 0;

  return (name) => {
    // Enforce public-by-default here as well as in the skip set so a future
    // parser-supported identifier form cannot accidentally become private.
    if (reservedNames.has(name) || !isPrivateVariable(name)) {
      return name;
    }

    if (renames.has(name)) {
      return renames.get(name);
    }

    // `_tn` is the minifier's reserved private namespace. Base-36 numbering is
    // deterministic, compact, and cannot collide with any preserved contract
    // variable collected above.
    let candidate;
    do {
      candidate = `_tn${(nextIndex++).toString(36)}`;
    } while (reservedNames.has(candidate));

    renames.set(name, candidate);
    return candidate;
  };
}

function isCssWhitespace(character) {
  return /\s/.test(character);
}

function skipCssIgnorable(css, startIndex) {
  let index = startIndex;

  while (index < css.length) {
    if (isCssWhitespace(css[index])) {
      index += 1;
      continue;
    }

    if (css[index] === '/' && css[index + 1] === '*') {
      const commentEnd = css.indexOf('*/', index + 2);

      if (commentEnd === -1) {
        return css.length;
      }

      index = commentEnd + 2;
      continue;
    }

    break;
  }

  return index;
}

function scanCssBlock(css, openBraceIndex) {
  let index = openBraceIndex + 1;
  let depth = 1;
  let activeQuote = null;
  let isEscaped = false;

  while (index < css.length) {
    const character = css[index];

    if (activeQuote) {
      if (isEscaped) {
        isEscaped = false;
      } else if (character === '\\') {
        isEscaped = true;
      } else if (character === activeQuote) {
        activeQuote = null;
      }

      index += 1;
      continue;
    }

    if (character === '"' || character === "'") {
      activeQuote = character;
      index += 1;
      continue;
    }

    if (character === '/' && css[index + 1] === '*') {
      const commentEnd = css.indexOf('*/', index + 2);

      if (commentEnd === -1) {
        return -1;
      }

      index = commentEnd + 2;
      continue;
    }

    if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;

      if (!depth) {
        return index + 1;
      }
    }

    index += 1;
  }

  return -1;
}

function getFontFaceBlockEnd(css, atRuleIndex) {
  if (
    css.slice(atRuleIndex, atRuleIndex + FONT_FACE_KEYWORD.length).toLowerCase() !==
    FONT_FACE_KEYWORD
  ) {
    return -1;
  }

  const blockStartIndex = skipCssIgnorable(
    css,
    atRuleIndex + FONT_FACE_KEYWORD.length
  );

  if (css[blockStartIndex] !== '{') {
    return -1;
  }

  return scanCssBlock(css, blockStartIndex);
}

// Advance past a single non-@font-face construct (a rule or at-rule) and return
// the index just after it, so the scan can keep looking for @font-face rules
// that appear later in the file. Mirrors scanCssBlock's string/comment handling
// and ignores braces or semicolons nested inside parens (e.g. url(...)).
function skipCssConstruct(css, startIndex) {
  let index = startIndex;
  let activeQuote = null;
  let isEscaped = false;
  let parenDepth = 0;

  while (index < css.length) {
    const character = css[index];

    if (activeQuote) {
      if (isEscaped) {
        isEscaped = false;
      } else if (character === '\\') {
        isEscaped = true;
      } else if (character === activeQuote) {
        activeQuote = null;
      }

      index += 1;
      continue;
    }

    if (character === '"' || character === "'") {
      activeQuote = character;
      index += 1;
      continue;
    }

    if (character === '/' && css[index + 1] === '*') {
      const commentEnd = css.indexOf('*/', index + 2);

      if (commentEnd === -1) {
        return css.length;
      }

      index = commentEnd + 2;
      continue;
    }

    if (character === '(') {
      parenDepth += 1;
    } else if (character === ')') {
      if (parenDepth > 0) {
        parenDepth -= 1;
      }
    } else if (parenDepth === 0) {
      if (character === ';') {
        return index + 1;
      }

      if (character === '{') {
        const blockEnd = scanCssBlock(css, index);
        return blockEnd === -1 ? css.length : blockEnd;
      }
    }

    index += 1;
  }

  return css.length;
}

// Capture every top-level @font-face rule verbatim, in source order, so none is
// lost when stripFontFaceAtRules later removes them all from the minified CSS.
// Contiguous @font-face rules (separated only by whitespace or comments) are
// kept as a single verbatim slice, so a stylesheet whose fonts are all declared
// up front yields the exact same prelude as before this walked the whole file.
function extractFontFacePrelude(css) {
  let index = skipCssIgnorable(css, 0);
  const runs = [];
  let runStart = null;
  let runEnd = null;

  while (index < css.length) {
    const blockEnd = getFontFaceBlockEnd(css, index);

    if (blockEnd === -1) {
      if (runStart !== null) {
        runs.push(css.slice(runStart, runEnd));
        runStart = null;
        runEnd = null;
      }

      const nextIndex = skipCssConstruct(css, index);
      index = nextIndex > index ? skipCssIgnorable(css, nextIndex) : index + 1;
      continue;
    }

    if (runStart === null) {
      runStart = index;
    }

    runEnd = blockEnd;
    index = skipCssIgnorable(css, blockEnd);
  }

  if (runStart !== null) {
    runs.push(css.slice(runStart, runEnd));
  }

  return runs.join('\n');
}

function stripFontFaceAtRules(css) {
  if (!css.includes(FONT_FACE_KEYWORD)) {
    return css;
  }

  const root = postcss.parse(css);

  // Only top-level rules, because only those are in the prelude that replaces them.
  // A @font-face nested in @media or @supports has no prelude entry, so removing it
  // here would drop it from the release while the dev build kept it.
  root.walkAtRules('font-face', (atRule) => {
    if (atRule.parent && atRule.parent.type === 'root') {
      atRule.remove();
    }
  });

  return root.toString();
}

function preserveFontFacePrelude(sourceCss, processedCss) {
  const fontFacePrelude = extractFontFacePrelude(sourceCss);

  if (!fontFacePrelude) {
    return processedCss;
  }

  const strippedCss = stripFontFaceAtRules(processedCss);

  return `${fontFacePrelude}${strippedCss}`;
}

async function processStylesheet(cssData, { from, contractCss = [], renames = new Map() } = {}) {
  const preservedNames = preservedVariableNames(cssData, contractCss);
  const result = await postcss([
    variableRename({
      strategy: privateVariableStrategy(preservedNames, renames),
      except: preservedNames,
    }),
    cssnano({ preset }),
    // Last in the chain on purpose: cssnano has already normalized values and
    // selectors, so identical bodies are identical text and the specificity
    // interval the merge proves safe is the one that actually ships.
    mergeRules(),
  ]).process(cssData, { from });

  return preserveFontFacePrelude(cssData, result.css);
}

async function run() {
  const { filePath, outputPath, contractPaths, renameMapOutputPath } = parseArgs(process.argv.slice(2));
  const cssData = fs.readFileSync(filePath, 'utf8');
  const contractCss = contractPaths.map((path) => fs.readFileSync(path, 'utf8'));
  const renames = new Map();
  const output = await processStylesheet(cssData, { from: filePath, contractCss, renames });

  if (renameMapOutputPath) {
    fs.writeFileSync(renameMapOutputPath, `${JSON.stringify(Object.fromEntries(renames), null, 2)}\n`);
  }

  if (outputPath) {
    fs.writeFileSync(outputPath, output);
  } else {
    process.stdout.write(output);
  }
}

if (require.main === module) {
  run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  UNSAFE_ADVANCED_TRANSFORMS,
  customPropertyNames,
  isPrivateVariable,
  parseArgs,
  preservedVariableNames,
  processStylesheet,
};
