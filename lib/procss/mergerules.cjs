// Folds style rules that share an identical declaration body into one rule with
// a comma selector list. The bundle emits one copy of a utility body per gate
// combination, so the same body text repeats up to 192 times; the body is the
// expensive half and only one copy of it has to survive.
//
// Moving a selector backwards past other rules is only sound when nothing
// between the two positions could have won a tie against it. Every merge here
// is gated on that proof, and anything the analyzer cannot price is skipped
// rather than guessed: a missed merge costs bytes, a wrong merge costs paint.

// Specificity is packed into one integer so a tie is a number comparison. The
// 10-bit fields are far above any real selector; an overflow is priced as
// unknown rather than wrapped.
const SPECIFICITY_FIELD_LIMIT = 1024;
const UNKNOWN_SPECIFICITY = -1;

// Passes run to a fixed point so the transform is idempotent: a merge moves a
// selector earlier, which can free a later candidate that the previous pass
// still saw a blocker for. The cap is a guard, not an expected stopping point.
const MAX_MERGE_PASSES = 16;

// A candidate blocker that turns out to restate the shared body verbatim is
// stepped over. Past this many steps the interval is dense enough that walking
// it is not worth it, so the merge is refused instead.
const MAX_CANDIDATE_WALK = 128;

// Any member of a group can end up as the anchor the others move into, so every
// member has to be indexed at every specificity the group carries. A group
// spread across many specificities would therefore block half the file; leave
// those alone.
const MAX_GROUP_SPECIFICITIES = 24;

// At-rules that cannot contribute a declaration to an element, so a merge may
// cross them. Everything else (@media, @supports, @container, a nested @layer)
// can, and blocks. A blockless at-rule is inert too, except @import, which
// splices a whole stylesheet in at its position.
const INERT_AT_RULES = new Set([
  'charset',
  'counter-style',
  'font-face',
  'font-feature-values',
  'font-palette-values',
  'keyframes',
  'namespace',
  'property',
]);

function isInertAtRule(atRule) {
  const name = atRule.name.toLowerCase().replace(/^-(?:webkit|moz|ms|o)-/, '');

  return name !== 'import' && (!atRule.nodes || INERT_AT_RULES.has(name));
}

const LEGACY_PSEUDO_ELEMENTS = new Set(['before', 'after', 'first-line', 'first-letter']);

// :is()/:not()/:has() take the specificity of their most specific argument.
const ARGUMENT_SPECIFICITY_PSEUDOS = new Set([
  'is',
  'matches',
  'not',
  'has',
  '-webkit-any',
  '-moz-any',
]);

// Functional pseudo-classes whose argument is not a selector, so the pseudo
// itself is worth one class. Anything functional and unlisted is unpriceable.
const PLAIN_FUNCTIONAL_PSEUDOS = new Set([
  'dir',
  'lang',
  'nth-col',
  'nth-last-col',
  'nth-last-of-type',
  'nth-of-type',
]);

// Shadow-DOM pseudos price against a tree this analyzer does not see.
const UNPRICEABLE_PSEUDOS = new Set(['host', 'host-context', 'slotted', 'part']);

const PHYSICAL_SIDES = ['top', 'right', 'bottom', 'left'];
const PHYSICAL_CORNERS = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
const LOGICAL_TOKENS = ['block-start', 'block-end', 'inline-start', 'inline-end', 'block', 'inline'];

function sides(prefix, suffix = '') {
  return PHYSICAL_SIDES.map((side) => `${prefix}-${side}${suffix}`);
}

// Shorthands mapped to the longhands they reset. Two properties conflict when
// their expansions intersect, which is what keeps `background:red` from being
// read as unrelated to `background-image`. A property missing from this table
// falls back to a whole-family key, which over-blocks but never under-blocks.
function buildShorthandTable() {
  const table = new Map(
    Object.entries({
      animation: [
        'animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay',
        'animation-iteration-count', 'animation-direction', 'animation-fill-mode',
        'animation-play-state', 'animation-timeline', 'animation-range-start', 'animation-range-end',
      ],
      'animation-range': ['animation-range-start', 'animation-range-end'],
      background: [
        'background-image', 'background-position', 'background-position-x', 'background-position-y',
        'background-size', 'background-repeat', 'background-attachment', 'background-origin',
        'background-clip', 'background-color',
      ],
      'background-position': ['background-position-x', 'background-position-y'],
      'border-image': [
        'border-image-source', 'border-image-slice', 'border-image-width',
        'border-image-outset', 'border-image-repeat',
      ],
      'border-radius': PHYSICAL_CORNERS.map((corner) => `border-${corner}-radius`),
      'column-rule': ['column-rule-width', 'column-rule-style', 'column-rule-color'],
      columns: ['column-width', 'column-count'],
      container: ['container-name', 'container-type'],
      'contain-intrinsic-size': ['contain-intrinsic-width', 'contain-intrinsic-height'],
      flex: ['flex-grow', 'flex-shrink', 'flex-basis'],
      'flex-flow': ['flex-direction', 'flex-wrap'],
      font: [
        'font-family', 'font-size', 'font-stretch', 'font-style', 'font-variant', 'font-weight',
        'font-size-adjust', 'font-kerning', 'font-feature-settings', 'font-variation-settings',
        'font-optical-sizing', 'font-language-override', 'line-height',
      ],
      'font-synthesis': [
        'font-synthesis-weight', 'font-synthesis-style',
        'font-synthesis-small-caps', 'font-synthesis-position',
      ],
      'font-variant': [
        'font-variant-alternates', 'font-variant-caps', 'font-variant-east-asian',
        'font-variant-emoji', 'font-variant-ligatures', 'font-variant-numeric',
        'font-variant-position',
      ],
      gap: ['row-gap', 'column-gap'],
      grid: [
        'grid-template-rows', 'grid-template-columns', 'grid-template-areas',
        'grid-auto-rows', 'grid-auto-columns', 'grid-auto-flow',
      ],
      'grid-area': ['grid-row-start', 'grid-row-end', 'grid-column-start', 'grid-column-end'],
      'grid-column': ['grid-column-start', 'grid-column-end'],
      'grid-row': ['grid-row-start', 'grid-row-end'],
      'grid-template': ['grid-template-rows', 'grid-template-columns', 'grid-template-areas'],
      inset: PHYSICAL_SIDES.slice(),
      'list-style': ['list-style-type', 'list-style-position', 'list-style-image'],
      margin: sides('margin'),
      mask: [
        'mask-image', 'mask-mode', 'mask-repeat', 'mask-position',
        'mask-clip', 'mask-origin', 'mask-size', 'mask-composite',
      ],
      'mask-border': [
        'mask-border-source', 'mask-border-slice', 'mask-border-width',
        'mask-border-outset', 'mask-border-repeat', 'mask-border-mode',
      ],
      offset: ['offset-position', 'offset-path', 'offset-distance', 'offset-rotate', 'offset-anchor'],
      outline: ['outline-width', 'outline-style', 'outline-color'],
      overflow: ['overflow-x', 'overflow-y'],
      'overflow-wrap': ['word-wrap'],
      'overscroll-behavior': ['overscroll-behavior-x', 'overscroll-behavior-y'],
      padding: sides('padding'),
      'place-content': ['align-content', 'justify-content'],
      'place-items': ['align-items', 'justify-items'],
      'place-self': ['align-self', 'justify-self'],
      'scroll-margin': sides('scroll-margin'),
      'scroll-padding': sides('scroll-padding'),
      'scroll-timeline': ['scroll-timeline-name', 'scroll-timeline-axis'],
      'text-decoration': [
        'text-decoration-line', 'text-decoration-style',
        'text-decoration-color', 'text-decoration-thickness',
      ],
      'text-emphasis': ['text-emphasis-style', 'text-emphasis-color'],
      'text-stroke': ['text-stroke-width', 'text-stroke-color'],
      'text-wrap': ['text-wrap-mode', 'text-wrap-style', 'white-space'],
      transition: [
        'transition-property', 'transition-duration',
        'transition-timing-function', 'transition-delay', 'transition-behavior',
      ],
      'view-timeline': ['view-timeline-name', 'view-timeline-axis', 'view-timeline-inset'],
      'white-space': ['white-space-collapse', 'text-wrap-mode', 'text-wrap'],
      'word-wrap': ['overflow-wrap'],
    })
  );

  table.set('border-width', sides('border', '-width'));
  table.set('border-style', sides('border', '-style'));
  table.set('border-color', sides('border', '-color'));
  table.set('border', [
    ...sides('border', '-width'),
    ...sides('border', '-style'),
    ...sides('border', '-color'),
    ...table.get('border-image'),
  ]);

  for (const side of PHYSICAL_SIDES) {
    table.set(`border-${side}`, [`border-${side}-width`, `border-${side}-style`, `border-${side}-color`]);
  }

  for (const [physical, logical] of [['before', 'before'], ['after', 'after'], ['inside', 'inside']]) {
    table.set(`page-break-${physical}`, [`break-${logical}`]);
    table.set(`break-${logical}`, [`page-break-${physical}`]);
  }

  return table;
}

const SHORTHAND_LONGHANDS = buildShorthandTable();

const KNOWN_LONGHANDS = new Set(
  Array.from(SHORTHAND_LONGHANDS.values()).flatMap((longhands) => longhands)
);

// Properties that collide with a name the shorthand table alone does not connect them
// to: two spellings of one thing. A logical longhand and the physical side it resolves
// onto are one such pair, a legacy alias and its modern name another. The family key
// does not join them, because a physical longhand carries only its own name (a
// KNOWN_LONGHANDS member skips the family key on purpose, which is what keeps
// `background-image` unrelated to `background-color`), so the two key sets came out
// disjoint and the analyzer read them as unrelated properties.
//
// Only one direction has to be declared. Every property already carries its own name
// as a key, so naming `margin-top` from `margin-block-start` makes the pair collide
// both ways.
function buildRelatedPropertyTable() {
  const table = new Map();

  const relate = (property, related) => {
    const names = table.get(property);

    if (names) {
      for (const name of related) {
        names.add(name);
      }
    } else {
      table.set(property, new Set(related));
    }
  };

  // The writing mode decides which physical side a logical longhand lands on and a
  // stylesheet never says, so each one is priced against every physical side of its
  // family. `inset-*` is the family whose physical spellings are the bare sides.
  for (const [family, physical] of [
    ['margin', sides('margin')],
    ['padding', sides('padding')],
    ['scroll-margin', sides('scroll-margin')],
    ['scroll-padding', sides('scroll-padding')],
    ['inset', PHYSICAL_SIDES.slice()],
  ]) {
    for (const token of LOGICAL_TOKENS) {
      relate(`${family}-${token}`, physical);
    }
  }

  // border-<logical side> and its three components, against the physical sides.
  const borderComponents = ['width', 'style', 'color'];

  for (const token of LOGICAL_TOKENS) {
    relate(
      `border-${token}`,
      borderComponents.flatMap((component) => sides('border', `-${component}`))
    );

    for (const component of borderComponents) {
      relate(`border-${token}-${component}`, sides('border', `-${component}`));
    }
  }

  // The four logical corners, against the four physical ones.
  const radii = PHYSICAL_CORNERS.map((corner) => `border-${corner}-radius`);

  for (const block of ['start', 'end']) {
    for (const inline of ['start', 'end']) {
      relate(`border-${block}-${inline}-radius`, radii);
    }
  }

  // Axis-relative sizing, overflow and overscroll, against the two physical axes.
  for (const prefix of ['', 'min-', 'max-']) {
    for (const axis of ['block', 'inline']) {
      relate(`${prefix}${axis}-size`, [`${prefix}width`, `${prefix}height`]);
    }
  }

  for (const axis of ['block', 'inline']) {
    relate(`contain-intrinsic-${axis}-size`, [
      'contain-intrinsic-width', 'contain-intrinsic-height',
    ]);

    for (const family of ['overflow', 'overscroll-behavior']) {
      relate(`${family}-${axis}`, [`${family}-x`, `${family}-y`]);
    }
  }

  // Legacy grid spellings of the gap properties. The pair is one property with two
  // names, so a `grid-gap` between duplicates of `gap` has to block them. The other
  // legacy aliases this analyzer prices (`page-break-*`, `word-wrap`) are already
  // named by the shorthand table.
  relate('grid-gap', ['gap', 'row-gap', 'column-gap']);
  relate('grid-row-gap', ['row-gap']);
  relate('grid-column-gap', ['column-gap']);

  return table;
}

const RELATED_PROPERTIES = buildRelatedPropertyTable();

const PROPERTY_KEY_CACHE = new Map();

function normalizeProperty(property) {
  const trimmed = property.trim();

  // Custom properties are case-sensitive and interact with nothing but
  // themselves, so they never pick up a family key.
  if (trimmed.startsWith('--')) {
    return trimmed;
  }

  return trimmed.toLowerCase().replace(/^-(?:webkit|moz|ms|o)-/, '');
}

function familyKey(property) {
  return `~${property.split('-')[0]}`;
}

function isLogicalProperty(property) {
  return LOGICAL_TOKENS.some(
    (token) => property.endsWith(`-${token}`) || property.includes(`-${token}-`)
  );
}

// The set of keys a property can collide on. Two declarations are unrelated
// only when these sets are disjoint.
function propertyKeys(property) {
  const normalized = normalizeProperty(property);
  const cached = PROPERTY_KEY_CACHE.get(normalized);

  if (cached) {
    return cached;
  }

  const keys = new Set([normalized]);

  if (normalized.startsWith('--')) {
    PROPERTY_KEY_CACHE.set(normalized, keys);
    return keys;
  }

  const longhands = SHORTHAND_LONGHANDS.get(normalized);

  if (longhands) {
    for (const longhand of longhands) {
      keys.add(longhand);
    }
    keys.add(familyKey(normalized));
  } else if (!KNOWN_LONGHANDS.has(normalized)) {
    keys.add(familyKey(normalized));
  }

  // Logical properties resolve onto a physical side the writing mode picks, so
  // they collide with the whole physical family rather than one side of it. The
  // family key covers the shorthands; RELATED_PROPERTIES names the physical
  // longhands, which carry no family key of their own.
  if (isLogicalProperty(normalized)) {
    keys.add(familyKey(normalized));
  }

  const related = RELATED_PROPERTIES.get(normalized);

  if (related) {
    for (const name of related) {
      keys.add(name);
    }
  }

  PROPERTY_KEY_CACHE.set(normalized, keys);
  return keys;
}

function readIdentifier(text, start) {
  let index = start;

  while (index < text.length) {
    const character = text[index];

    if (character === '\\') {
      if (index + 1 >= text.length) {
        return -1;
      }

      index += 2;
      continue;
    }

    if (/[-_a-zA-Z0-9]/.test(character) || character.charCodeAt(0) > 0x7f) {
      index += 1;
      continue;
    }

    break;
  }

  return index === start ? -1 : index;
}

function skipBalanced(text, openIndex) {
  const open = text[openIndex];
  const close = open === '(' ? ')' : ']';
  let depth = 0;
  let quote = null;

  for (let index = openIndex; index < text.length; index += 1) {
    const character = text[index];

    if (character === '\\') {
      index += 1;
      continue;
    }

    if (quote) {
      if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (character === open) {
      depth += 1;
    } else if (character === close) {
      depth -= 1;

      if (!depth) {
        return index + 1;
      }
    }
  }

  return -1;
}

// Split a selector list on top-level commas. Returns null when the text does
// not balance, which takes the whole rule out of the analysis.
function splitSelectorList(selector) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let start = 0;

  for (let index = 0; index < selector.length; index += 1) {
    const character = selector[index];

    if (character === '\\') {
      index += 1;
      continue;
    }

    if (quote) {
      if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (character === '(' || character === '[') {
      depth += 1;
    } else if (character === ')' || character === ']') {
      depth -= 1;

      if (depth < 0) {
        return null;
      }
    } else if (character === ',' && depth === 0) {
      parts.push(selector.slice(start, index));
      start = index + 1;
    }
  }

  if (depth !== 0 || quote) {
    return null;
  }

  parts.push(selector.slice(start));

  const trimmed = parts.map((part) => part.trim());

  return trimmed.some((part) => part === '') ? null : trimmed;
}

function compareSpecificity(left, right) {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }

  return 0;
}

function mostSpecificArgument(argumentText) {
  const parts = splitSelectorList(argumentText);

  if (!parts) {
    return null;
  }

  let best = null;

  for (const part of parts) {
    const specificity = partSpecificity(part);

    if (!specificity) {
      return null;
    }

    if (!best || compareSpecificity(specificity, best) > 0) {
      best = specificity;
    }
  }

  return best;
}

// Standard specificity for one comma part, as [ids, classes, types]. Returns
// null for anything this scanner does not recognize with certainty.
function partSpecificity(part) {
  let ids = 0;
  let classes = 0;
  let types = 0;
  let index = 0;

  while (index < part.length) {
    const character = part[index];

    if (/[\s>+~]/.test(character)) {
      index += 1;
      continue;
    }

    if (character === '*') {
      index += 1;
      continue;
    }

    if (character === '#' || character === '.') {
      const end = readIdentifier(part, index + 1);

      if (end === -1) {
        return null;
      }

      if (character === '#') {
        ids += 1;
      } else {
        classes += 1;
      }

      index = end;
      continue;
    }

    if (character === '[') {
      const end = skipBalanced(part, index);

      if (end === -1) {
        return null;
      }

      classes += 1;
      index = end;
      continue;
    }

    if (character === ':') {
      let cursor = index + 1;
      const isPseudoElement = part[cursor] === ':';

      if (isPseudoElement) {
        cursor += 1;
      }

      const nameEnd = readIdentifier(part, cursor);

      if (nameEnd === -1) {
        return null;
      }

      const name = part.slice(cursor, nameEnd).toLowerCase();
      const hasArguments = part[nameEnd] === '(';
      const argumentsEnd = hasArguments ? skipBalanced(part, nameEnd) : nameEnd;

      if (argumentsEnd === -1) {
        return null;
      }

      if (isPseudoElement) {
        // ::slotted(), ::part() and friends price against a shadow tree.
        if (hasArguments || UNPRICEABLE_PSEUDOS.has(name)) {
          return null;
        }

        types += 1;
        index = argumentsEnd;
        continue;
      }

      if (!hasArguments) {
        if (LEGACY_PSEUDO_ELEMENTS.has(name)) {
          types += 1;
        } else if (UNPRICEABLE_PSEUDOS.has(name)) {
          return null;
        } else {
          classes += 1;
        }

        index = nameEnd;
        continue;
      }

      const argumentText = part.slice(nameEnd + 1, argumentsEnd - 1);

      if (name === 'where') {
        // :where() contributes nothing, whatever its argument holds.
        index = argumentsEnd;
        continue;
      }

      if (ARGUMENT_SPECIFICITY_PSEUDOS.has(name)) {
        const argument = mostSpecificArgument(argumentText);

        if (!argument) {
          return null;
        }

        ids += argument[0];
        classes += argument[1];
        types += argument[2];
        index = argumentsEnd;
        continue;
      }

      if (name === 'nth-child' || name === 'nth-last-child') {
        // The `of S` form adds the argument's specificity; skip rather than price it.
        if (/(^|\s)of(\s|$)/i.test(argumentText)) {
          return null;
        }

        classes += 1;
        index = argumentsEnd;
        continue;
      }

      if (!PLAIN_FUNCTIONAL_PSEUDOS.has(name)) {
        return null;
      }

      classes += 1;
      index = argumentsEnd;
      continue;
    }

    const end = readIdentifier(part, index);

    if (end === -1) {
      return null;
    }

    types += 1;
    index = end;
  }

  return [ids, classes, types];
}

function packSpecificity(specificity) {
  const [ids, classes, types] = specificity;

  if (ids >= SPECIFICITY_FIELD_LIMIT || classes >= SPECIFICITY_FIELD_LIMIT || types >= SPECIFICITY_FIELD_LIMIT) {
    return null;
  }

  return (ids * SPECIFICITY_FIELD_LIMIT + classes) * SPECIFICITY_FIELD_LIMIT + types;
}

// Every comma part of a selector, packed. Returns null when any part is
// unpriceable, which makes the rule block at every specificity.
function selectorSpecificities(selector) {
  const parts = splitSelectorList(selector);

  if (!parts) {
    return null;
  }

  const packed = [];

  for (const part of parts) {
    const specificity = partSpecificity(part);

    if (!specificity) {
      return null;
    }

    const value = packSpecificity(specificity);

    if (value === null) {
      return null;
    }

    if (!packed.includes(value)) {
      packed.push(value);
    }
  }

  return packed;
}

function describeRule(rule, position) {
  const entries = [];
  const bodyParts = [];
  const keys = new Set();
  const entriesByKey = new Map();
  let important = false;

  for (const child of rule.nodes || []) {
    if (child.type === 'comment') {
      continue;
    }

    // Nested rules are not modelled here; the rule becomes an opaque blocker.
    if (child.type !== 'decl') {
      return null;
    }

    const property = normalizeProperty(child.prop);

    // `all` resets every property, so it is not worth a special case in the
    // conflict model; the rule blocks outright.
    if (property === 'all') {
      return null;
    }

    const entry = {
      prop: property,
      value: child.value.trim(),
      important: Boolean(child.important),
      keys: propertyKeys(child.prop),
    };

    important = important || entry.important;
    entries.push(entry);
    bodyParts.push(`${child.prop.trim()}:${entry.value}${entry.important ? '!important' : ''}`);

    for (const key of entry.keys) {
      keys.add(key);

      const bucket = entriesByKey.get(key);

      if (bucket) {
        bucket.push(entry);
      } else {
        entriesByKey.set(key, [entry]);
      }
    }
  }

  if (!entries.length) {
    return null;
  }

  const specificities = selectorSpecificities(rule.selector);

  return {
    rule,
    position,
    entries,
    entriesByKey,
    keys,
    specificities,
    // Exact declaration text in source order. Nothing is reordered and nothing
    // beyond whitespace is normalized, so two matching bodies really are the
    // same declarations in the same order.
    bodyKey: bodyParts.join(';'),
    mergeable: !important && specificities !== null,
    group: null,
  };
}

// A rule with nothing to declare cannot tie with anything, so it is neither a
// merge candidate nor a blocker.
function isEmptyRule(rule) {
  return (rule.nodes || []).every((child) => child.type === 'comment');
}

function collectContainer(container) {
  const infos = [];
  const opaquePositions = [];
  const children = container.nodes || [];

  for (let position = 0; position < children.length; position += 1) {
    const node = children[position];

    if (node.type === 'rule') {
      const info = describeRule(node, position);

      if (info) {
        infos.push(info);
      } else if (!isEmptyRule(node)) {
        opaquePositions.push(position);
      }
    } else if (node.type === 'atrule') {
      if (!isInertAtRule(node)) {
        opaquePositions.push(position);
      }
    } else if (node.type === 'decl') {
      opaquePositions.push(position);
    }
  }

  return { infos, opaquePositions };
}

function indexInfo(index, info, specificities) {
  const packed = specificities === null ? [UNKNOWN_SPECIFICITY] : specificities;

  for (const key of info.keys) {
    let bySpecificity = index.get(key);

    if (!bySpecificity) {
      bySpecificity = new Map();
      index.set(key, bySpecificity);
    }

    for (const specificity of packed) {
      const bucket = bySpecificity.get(specificity);

      if (bucket) {
        bucket.push(info.position);
      } else {
        bySpecificity.set(specificity, [info.position]);
      }
    }
  }
}

// First entry of a sorted position list that lies strictly inside (low, high).
function firstPositionInRange(positions, low, high) {
  if (!positions) {
    return -1;
  }

  let start = 0;
  let end = positions.length;

  while (start < end) {
    const middle = (start + end) >> 1;

    if (positions[middle] <= low) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }

  return start < positions.length && positions[start] < high ? start : -1;
}

function conflictsWithGroup(info, group) {
  for (const entry of info.entries) {
    for (const key of entry.keys) {
      const groupEntries = group.entriesByKey.get(key);

      if (!groupEntries) {
        continue;
      }

      for (const groupEntry of groupEntries) {
        // A verbatim restatement of the shared declaration cannot change the
        // outcome. Anything else related to it can.
        if (!entry.important && groupEntry.prop === entry.prop && groupEntry.value === entry.value) {
          continue;
        }

        return true;
      }
    }
  }

  return false;
}

function bucketBlocks(positions, anchorPosition, memberPosition, group, infoByPosition) {
  let cursor = firstPositionInRange(positions, anchorPosition, memberPosition);

  if (cursor === -1) {
    return false;
  }

  let steps = 0;

  while (cursor < positions.length && positions[cursor] < memberPosition) {
    steps += 1;

    if (steps > MAX_CANDIDATE_WALK) {
      return true;
    }

    const candidate = infoByPosition[positions[cursor]];

    // Same body, so every shared property carries the same value.
    if (candidate && candidate.bodyKey !== group.bodyKey && conflictsWithGroup(candidate, group)) {
      return true;
    }

    cursor += 1;
  }

  return false;
}

// The safety condition. Moving `member`'s selector back to `anchor` changes an
// outcome only if some rule between them ties on specificity with a comma part
// of the moved selector and declares one of the shared properties differently.
// The check is run per comma part rather than only on the most specific one: a
// lower part is just as exposed to a tie at its own specificity.
function isBlocked(index, opaquePositions, infoByPosition, group, anchor, member) {
  if (firstPositionInRange(opaquePositions, anchor.position, member.position) !== -1) {
    return true;
  }

  for (const key of group.keys) {
    const bySpecificity = index.get(key);

    if (!bySpecificity) {
      continue;
    }

    for (const specificity of member.specificities) {
      if (bucketBlocks(bySpecificity.get(specificity), anchor.position, member.position, group, infoByPosition)) {
        return true;
      }
    }

    if (bucketBlocks(bySpecificity.get(UNKNOWN_SPECIFICITY), anchor.position, member.position, group, infoByPosition)) {
      return true;
    }
  }

  return false;
}

function mergeContainer(container) {
  const { infos, opaquePositions } = collectContainer(container);

  if (infos.length < 2) {
    return 0;
  }

  const groups = new Map();

  for (const info of infos) {
    if (!info.mergeable) {
      continue;
    }

    let group = groups.get(info.bodyKey);

    if (!group) {
      group = {
        bodyKey: info.bodyKey,
        keys: info.keys,
        entriesByKey: info.entriesByKey,
        members: [],
        specificities: new Set(),
      };
      groups.set(info.bodyKey, group);
    }

    info.group = group;
    group.members.push(info);

    for (const specificity of info.specificities) {
      group.specificities.add(specificity);
    }
  }

  for (const group of groups.values()) {
    group.skip = group.members.length < 2 || group.specificities.size > MAX_GROUP_SPECIFICITIES;
  }

  const index = new Map();
  const infoByPosition = [];

  for (const info of infos) {
    infoByPosition[info.position] = info;

    // Positions are read from the original layout, and a merge only ever moves
    // a selector to its group's earliest member. Indexing every member at every
    // specificity the group carries therefore covers the anchor it may grow
    // into, which is what makes merges safe to decide independently.
    const specificities =
      info.group && !info.group.skip ? Array.from(info.group.specificities) : info.specificities;

    indexInfo(index, info, specificities);
  }

  let merged = 0;

  for (const group of groups.values()) {
    if (group.skip) {
      continue;
    }

    let anchor = group.members[0];

    for (let position = 1; position < group.members.length; position += 1) {
      const member = group.members[position];

      if (isBlocked(index, opaquePositions, infoByPosition, group, anchor, member)) {
        anchor = member;
        continue;
      }

      anchor.rule.selector = `${anchor.rule.selector},${member.rule.selector}`;
      member.rule.remove();
      merged += 1;
    }
  }

  return merged;
}

function mergeTree(container) {
  let merged = mergeContainer(container);

  for (const node of container.nodes || []) {
    if (node.type === 'atrule' && node.nodes && !isInertAtRule(node)) {
      merged += mergeTree(node);
    }
  }

  return merged;
}

function mergeDuplicateBodies(root) {
  const stats = { passes: 0, merges: 0 };

  for (let pass = 0; pass < MAX_MERGE_PASSES; pass += 1) {
    const merged = mergeTree(root);

    stats.passes += 1;
    stats.merges += merged;

    if (!merged) {
      break;
    }
  }

  return stats;
}

function mergeRules(options = {}) {
  return {
    postcssPlugin: 'procss-merge-rules',
    OnceExit(root) {
      const stats = mergeDuplicateBodies(root);

      if (options.stats) {
        Object.assign(options.stats, stats);
      }
    },
  };
}

mergeRules.postcss = true;

module.exports = mergeRules;
module.exports.mergeDuplicateBodies = mergeDuplicateBodies;
module.exports.propertyKeys = propertyKeys;
module.exports.selectorSpecificities = selectorSpecificities;
module.exports.splitSelectorList = splitSelectorList;
