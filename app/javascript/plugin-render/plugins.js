// Wrapped in an IIFE so the terminalize pipeline's top-level declarations
// (formatValue, fitValue, getScreenContext, clampElementToLines, scheduleTerminalize, …)
// stay private instead of leaking as globals that collide with plugin-authored
// setup/draw/formatValue or p5.js. The public API is only the window.* assignments
// made inside (terminalize, executeTerminalize, markFrameworkReady, frameworkReady,
// TRMNL_PLUGINS_READY, __TRMNL_LAST_STATS__, __terminalizeScheduler, TRMNLPaint,
// TRMNLCharts, __TRMNL_BUILD__). Encloses the existing TRMNLPaint/autoRunTerminalize
// IIFEs so autoRunTerminalize can still reach the private scheduleTerminalize.
(function () {
/**
 * Opt-in engine chatter. A device render, a screenshot pass and a plugin host
 * embed all share one console, so per-element decisions are silent unless a page
 * sets `window.__TRMNL_DEBUG__ = true`. Failures are not chatter: recordError
 * keeps writing to console.error unconditionally.
 */
function debugLog(...args) {
  try {
    if (!window.__TRMNL_DEBUG__) return;
    console.log(...args);
  } catch (_) {}
}

/**
 * Screen context helper
 * Returns current screen size (sm|md|lg), orientation (landscape|portrait),
 * bitDepth (1|2|4|8|16), the active screen scale name,
 * and a flag is2BitAndUp.
 */
function screenScaleName(screen) {
  if (!screen) return null;
  // screen--scale-<name> is the whole scale contract: it is what the Scale page
  // documents and the only shape the bundle carries rules for. A class or attribute
  // no CSS reads would make the runtime report a scale the layout never applies.
  for (const className of Array.from(screen.classList || [])) {
    if (className.startsWith('screen--scale-')) return className.slice('screen--scale-'.length) || null;
  }
  return null;
}

function screenTextScaleName(screen) {
  if (!screen) return null;
  for (const className of Array.from(screen.classList || [])) {
    if (className.startsWith('screen--text-scale-')) return className.slice('screen--text-scale-'.length) || null;
  }
  return null;
}

function getScreenContext() {
  // One screen per served page is the platform contract, so the first .screen is
  // the device context for everything on it (owner decision, 2026-07-28).
  const screen = document.querySelector('.screen');
  let size = null;
  let orientation = 'landscape';
  let bitDepth = 1;
  let scale = null;

  if (screen) {
    // Size
    if (screen.classList.contains('screen--sm')) size = 'sm';
    else if (screen.classList.contains('screen--md')) size = 'md';
    else if (screen.classList.contains('screen--lg')) size = 'lg';

    // Orientation
    if (screen.classList.contains('screen--portrait')) orientation = 'portrait';

    // Bit depth: the mode class that selects a screen's paint rail publishes
    // that rail's depth as --framework-bit-depth (_screen-paint-depth-vars in
    // base/_screen-mode-vars.scss). Reading the resolved value keeps the mode
    // registry in CSS, so a palette added there needs no JS change and a screen
    // wearing two mode classes reports the rail the cascade actually picked.
    const publishedDepth = parseInt(
      getComputedStyle(screen).getPropertyValue('--framework-bit-depth'),
      10
    );
    if (publishedDepth > 0) bitDepth = publishedDepth;

    // Scale names come from the class rather than a duplicated JS registry, so
    // new CSS scale modifiers are visible to the runtime automatically.
    scale = screenScaleName(screen);
  }

  return {
    size,
    orientation,
    bitDepth,
    scale,
    is2BitAndUp: bitDepth >= 2
  };
}

/** Hyphenated string to camelCase (e.g. "overflow-max-cols-md" -> "overflowMaxColsMd") */
function toCamelCase(str) {
  return String(str || '').replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

/** Parse integer safely, returning null for invalid values */
function parseIntSafe(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

const OVERFLOW_MAX_COLS_RESPONSIVE_SUFFIXES = ['sm', 'md', 'lg', 'portrait', 'sm-portrait', 'md-portrait', 'lg-portrait'];

/** Base tolerance for fitValue / fitTextToContainer: rects vs line-height often differ by a few px. */
const FIT_VALUE_LAYOUT_SLACK_PX = 2;

function fitValueLayoutSlackPx() {
  try {
    return Math.max(FIT_VALUE_LAYOUT_SLACK_PX, Math.ceil((window.devicePixelRatio || 1) * 2));
  } catch (_) {
    return FIT_VALUE_LAYOUT_SLACK_PX;
  }
}

function hasAnyOverflowMaxColsAttribute(el) {
  if (!el) return false;
  if (el.hasAttribute('data-overflow-max-cols')) return true;
  return OVERFLOW_MAX_COLS_RESPONSIVE_SUFFIXES.some(
    (s) => el.hasAttribute(`data-overflow-max-cols-${s}`)
  );
}

function hasAnyOverflowColsAttribute(el) {
  if (!el) return false;
  if (el.hasAttribute('data-overflow-cols')) return true;
  return OVERFLOW_MAX_COLS_RESPONSIVE_SUFFIXES.some(
    (s) => el.hasAttribute(`data-overflow-cols-${s}`)
  );
}

/**
 * Read responsive data-overflow-max-cols from a .columns element.
 * Specificity: size+portrait, size, portrait, base. Uses getScreenContext() (no scale).
 */
function readResponsiveOverflowMaxCols(columnsEl) {
  if (!columnsEl?.dataset) return null;
  const ctx = getScreenContext();
  const { size, orientation } = ctx;
  const isPortrait = orientation === 'portrait';
  // 1) size + portrait
  if (size && isPortrait) {
    const key = toCamelCase(`overflow-max-cols-${size}-portrait`);
    const n = parseIntSafe(columnsEl.dataset[key]);
    if (n != null) return n;
  }
  // 2) size only
  if (size) {
    const key = toCamelCase(`overflow-max-cols-${size}`);
    const n = parseIntSafe(columnsEl.dataset[key]);
    if (n != null) return n;
  }
  // 3) portrait only
  if (isPortrait) {
    const n = parseIntSafe(columnsEl.dataset.overflowMaxColsPortrait);
    if (n != null) return n;
  }
  // 4) base
  return parseIntSafe(columnsEl.getAttribute('data-overflow-max-cols'));
}

/**
 * Read responsive data-overflow-cols from a .columns element.
 * Same specificity order as readResponsiveOverflowMaxCols (no scale).
 */
function readResponsiveOverflowCols(columnsEl) {
  if (!columnsEl?.dataset) return null;
  const ctx = getScreenContext();
  const { size, orientation } = ctx;
  const isPortrait = orientation === 'portrait';
  // 1) size + portrait
  if (size && isPortrait) {
    const key = toCamelCase(`overflow-cols-${size}-portrait`);
    const n = parseIntSafe(columnsEl.dataset[key]);
    if (n != null) return n;
  }
  // 2) size only
  if (size) {
    const key = toCamelCase(`overflow-cols-${size}`);
    const n = parseIntSafe(columnsEl.dataset[key]);
    if (n != null) return n;
  }
  // 3) portrait only
  if (isPortrait) {
    const n = parseIntSafe(columnsEl.dataset.overflowColsPortrait);
    if (n != null) return n;
  }
  // 4) base
  return parseIntSafe(columnsEl.getAttribute('data-overflow-cols'));
}

/** All .columns that have data-overflow-max-cols or data-overflow-cols (base or responsive). */
function getColumnsWithOverflow(root = document) {
  return Array.from(root.querySelectorAll('.columns')).filter(
    (el) => hasAnyOverflowMaxColsAttribute(el) || hasAnyOverflowColsAttribute(el)
  );
}

/**
 * Check if the screen is 2-bit or higher.
 * This is used to skip certain adjustments when the 2-bit or 4-bit screen mode is active.
 */
function isScreen2BitAndUp() {
  return getScreenContext().is2BitAndUp;
}

// Marks the spans this engine pinned to an even width. The pin is a bare inline
// width, so without a marker a later pass cannot tell its own write from an
// author's inline width and would clear both.
const INDEX_WIDTH_PINNED_ATTR = 'data-index-width-pinned';

function pinIndexSpanWidth(span, newWidth) {
  const target = `${newWidth}px`;
  if (span.style.width === target && span.hasAttribute(INDEX_WIDTH_PINNED_ATTR)) return false;
  span.style.width = target;
  span.setAttribute(INDEX_WIDTH_PINNED_ATTR, 'true');
  return true;
}

// Undo the pins a prior pass left, so a screen that switches into a mode this
// engine must not run in drops the even-width normalization instead of freezing
// a 1-bit measurement into it. Mirrors resetPixelPerfect, using this engine's
// own state (the marked inline width) rather than a snapshot.
function clearPinnedIndexSpanWidths(root) {
  const scope = root || document;
  let cleared = 0;
  scope.querySelectorAll(`.meta .index[${INDEX_WIDTH_PINNED_ATTR}]`).forEach((span) => {
    span.style.width = '';
    span.removeAttribute(INDEX_WIDTH_PINNED_ATTR);
    cleared++;
  });
  return cleared;
}

// Adjust index spans within a specific root (limits work to affected subtree)
function adjustIndexSpanWidthsInRoot(root) {
  if (!root) return 0;
  if (isScreen2BitAndUp()) {
    clearPinnedIndexSpanWidths(root);
    return 0;
  }
  const spans = Array.from(root.querySelectorAll('.meta .index'));
  if (spans.length === 0) return 0;
  const updates = [];
  for (const span of spans) {
    const width = span.offsetWidth | 0;
    if (width > 0 && (width & 1)) updates.push([span, width - 1]);
  }
  if (updates.length === 0) return 0;
  let adjusted = 0;
  for (const [span, newWidth] of updates) {
    if (pinIndexSpanWidth(span, newWidth)) adjusted++;
  }
  return adjusted;
}

/**
 * Adjust the width of index spans to ensure they have an even width.
 * Global pass: only for spans NOT inside `.columns`; columns are handled post-commit.
 */
function adjustIndexSpanWidths() {
  if (isScreen2BitAndUp()) {
    // Document-wide: the engine is off for this screen, and the per-root pass
    // only visits `.columns` containers the Overflow engine manages.
    clearPinnedIndexSpanWidths(document);
    return;
  }
  const all = Array.from(document.querySelectorAll('.meta .index'));
  if (all.length === 0) return;
  const outsideColumns = all.filter((el) => !el.closest('.columns'));
  if (outsideColumns.length === 0) return;
  const updates = [];
  for (const span of outsideColumns) {
    const width = span.offsetWidth | 0;
    if (width > 0 && (width & 1)) updates.push([span, width - 1]);
  }
  for (const [span, newWidth] of updates) {
    pinIndexSpanWidth(span, newWidth);
  }
}

/**
 * Manage overflow for lists with a specified height limit.
 * manageOverflow ensures that lists don't exceed their designated height while providing
 * a visual cue for hidden content.
 * 
 * Supports data-list-max-height="auto" to automatically calculate available height
 * based on the parent container's dimensions minus any sibling elements.
 */
// Clamping-aware measurement helper removed

/* manageOverflow removed */

/**
 * Clamp Engine
 * Implements data-clamp="N" with:
 * - Original preservation in data-clamp-original
 * - Character-level truncation with ellipsis '...' (fits as many characters as possible)
 * - Single-line height derived from measurement
 * - Re-clamp on width change by invoking clamp on demand
 * - Can clamp any subtree (works inside and outside .columns)
 */

// Determine available content width for clamping. Works in any layout: grid, flex, or block.
// When inside a .grid or .flex, use the width of the direct child of that container (the
// "cell" or "flex item"). The framework sets min-width: 0 on those children so they
// shrink to their track; this width is then accurate. Otherwise we use the element's
// own width or walk up to find a parent with a usable width.
function getAvailableWidthForClamp(element) {
  if (!element) return 0;
  let node = element;
  while (node && node !== document.body) {
    const p = node.parentElement;
    if (!p) break;
    const isGrid = p.classList && p.classList.contains('grid');
    const isFlex = p.classList && p.classList.contains('flex');
    if (isGrid || isFlex) {
      const itemW = Math.round((node.getBoundingClientRect()?.width) || 0);
      if (itemW > 0) return itemW;
      if (isGrid) {
        let gridW = Math.round((p.getBoundingClientRect()?.width) || 0);
        if (gridW === 0) {
          let n = p;
          while (n && n !== document.body) {
            const parent = n.parentElement;
            if (!parent) break;
            gridW = Math.round(parent.getBoundingClientRect()?.width || 0);
            if (gridW > 0) break;
            n = parent;
          }
        }
        const match = p.className.match(/grid--cols-(\d+)/);
        const cols = match ? Math.max(1, parseInt(match[1], 10)) : 1;
        if (gridW > 0) return Math.max(0, Math.floor(gridW / cols));
      }
      return 0;
    }
    node = p;
  }
  const ownWidth = Math.round((element.getBoundingClientRect()?.width) || 0);
  if (ownWidth > 0) return ownWidth;
  node = element;
  while (node && node !== document.body) {
    const p = node.parentElement;
    if (!p) break;
    const w = Math.round(p.getBoundingClientRect().width || 0);
    if (w > 0) return w;
    node = p;
  }
  return 0;
}

// Measure a single line height for a given element by forcing a single line in an offscreen clone
function measureSingleLineHeight(element) {
  // Build isolated measurement env with same width and styles
  const parent = element.parentElement || document.body;
  const computed = window.getComputedStyle(element);
  const targetWidth = getAvailableWidthForClamp(element);

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.visibility = 'hidden';
  container.style.contain = 'layout';
  if (targetWidth > 0) container.style.width = `${targetWidth}px`;

  const clone = element.cloneNode(false);
  clone.textContent = (element.textContent || 'M') || 'M';
  clone.style.display = 'block';
  clone.style.whiteSpace = 'nowrap';
  clone.style.font = computed.font;
  clone.style.fontFamily = computed.fontFamily;
  clone.style.fontSize = computed.fontSize;
  clone.style.lineHeight = computed.lineHeight === 'normal' ? 'normal' : computed.lineHeight;
  // Return the content line height only. The clamp budget adds the element's
  // padding and borders once around all lines below.
  clone.style.padding = '0';
  clone.style.border = '0';
  clone.style.letterSpacing = computed.letterSpacing;

  container.appendChild(clone);
  parent.appendChild(container);
  const height = Math.ceil(clone.getBoundingClientRect().height);
  parent.removeChild(container);
  return height > 0 ? height : Math.max(1, Math.ceil(parseFloat(computed.fontSize)));
}

// Measure width of text when rendered with white-space: nowrap. Used for single-line clamp where the only constraint is width.
function measureTextWidthNowrap(element, text, computed) {
  const parent = element.parentElement || document.body;
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-99999px';
  container.style.visibility = 'hidden';
  container.style.contain = 'layout';
  const probe = element.cloneNode(false);
  probe.style.display = 'inline-block';
  probe.style.whiteSpace = 'nowrap';
  probe.style.overflow = 'visible';
  probe.style.font = computed.font;
  probe.style.fontFamily = computed.fontFamily;
  probe.style.fontSize = computed.fontSize;
  probe.style.lineHeight = computed.lineHeight === 'normal' ? 'normal' : computed.lineHeight;
  probe.style.padding = computed.padding;
  probe.style.letterSpacing = computed.letterSpacing;
  probe.textContent = text;
  container.appendChild(probe);
  parent.appendChild(container);
  const w = Math.ceil(probe.getBoundingClientRect().width || 0);
  parent.removeChild(container);
  return w;
}

// Clamp a single element's text content to a maximum number of lines using character-level truncation and ellipsis.
// Single-line (data-clamp="1"): constraint is width only. Multi-line: constraint is height (pre-line probe).
function clampElementToLines(element, maxLines) {
  if (!element) return;
  const lines = parseInt(element.getAttribute('data-clamp'), 10);
  if (isNaN(lines) || lines <= 0) return;
  // Skip elements with no layout box (inside a display:none subtree, or
  // detached from the document). They have no measurable width, and clamping
  // here would cache an empty data-clamp-original (innerText is '' when hidden)
  // and permanently replace the content with '...'. Re-clamp will run once the
  // element is laid out.
  if (!element.getClientRects().length) return;
  // Clear stale per-element clamp stats
  if (element.hasAttribute('data-clamp-lines-trimmed')) {
    element.removeAttribute('data-clamp-lines-trimmed');
  }
  const currentWidth = getAvailableWidthForClamp(element);
  const isInsideShrinkableContainer = element.parentElement && (function walk(el) {
    const p = el.parentElement;
    if (!p) return false;
    if (p.classList && (p.classList.contains('grid') || p.classList.contains('flex'))) return true;
    return walk(p);
  })(element);

  if (!element.hasAttribute('data-clamp-original')) {
    element.setAttribute('data-clamp-original', element.innerText || '');
  }
  const originalText = element.getAttribute('data-clamp-original') || '';
  const computed = window.getComputedStyle(element);

  // --- Single-line: width-only path (one line = fit in width; no height checks) ---
  if (lines === 1) {
    if (currentWidth <= 0) {
      element.textContent = '...';
      element.style.whiteSpace = 'nowrap';
      element.setAttribute('data-clamp-cached', 'true');
      element.setAttribute('data-clamp-last-width', String(currentWidth));
      return;
    }
    const cachedWidth = parseInt(element.getAttribute('data-clamp-last-width') || '0', 10);
    if (!isInsideShrinkableContainer && cachedWidth && Math.abs(cachedWidth - currentWidth) <= 1 && element.hasAttribute('data-clamp-cached')) {
      if (measureTextWidthNowrap(element, originalText, computed) <= currentWidth) {
        element.textContent = originalText;
        element.style.whiteSpace = 'pre-line';
        element.setAttribute('data-clamp-last-width', String(currentWidth));
        return;
      }
    }
    if (measureTextWidthNowrap(element, originalText, computed) <= currentWidth) {
      element.textContent = originalText;
      element.style.whiteSpace = 'pre-line';
      element.setAttribute('data-clamp-cached', 'true');
      element.setAttribute('data-clamp-last-width', String(currentWidth));
      return;
    }
    const len = originalText.length;
    let low = 0;
    let high = len;
    let best = 0;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const candidate = mid >= len ? originalText : originalText.slice(0, mid) + '...';
      if (measureTextWidthNowrap(element, candidate, computed) <= currentWidth) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    const finalText = best >= len ? originalText : (best === 0 ? '...' : originalText.slice(0, best) + '...');
    element.textContent = finalText;
    element.style.whiteSpace = best >= len ? 'pre-line' : 'nowrap';
    element.setAttribute('data-clamp-cached', 'true');
    element.setAttribute('data-clamp-last-width', String(currentWidth));
    element.setAttribute('data-clamp-lines-trimmed', '1');
    return;
  }

  // --- Multi-line: height-based path ---
  const cachedWidth = parseInt(element.getAttribute('data-clamp-last-width') || '0', 10);
  if (!isInsideShrinkableContainer && cachedWidth && Math.abs(cachedWidth - currentWidth) <= 1 && element.hasAttribute('data-clamp-cached')) {
    const originalTextForRecheck = element.getAttribute('data-clamp-original') || '';
    if (originalTextForRecheck) {
      const paddingTopRe = parseFloat(computed.paddingTop) || 0;
      const paddingBottomRe = parseFloat(computed.paddingBottom) || 0;
      const borderTopRe = parseFloat(computed.borderTopWidth) || 0;
      const borderBottomRe = parseFloat(computed.borderBottomWidth) || 0;
      const singleLineHeightRe = measureSingleLineHeight(element);
      let maxHeightRe = Math.ceil(
        paddingTopRe + paddingBottomRe + borderTopRe + borderBottomRe + singleLineHeightRe * lines
      );
      const overrideMaxHRe = parseInt(element.getAttribute('data-clamp-max-height-px') || '0', 10);
      if (Number.isFinite(overrideMaxHRe) && overrideMaxHRe > 0) maxHeightRe = overrideMaxHRe;
      const parent = element.parentElement || document.body;
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-99999px';
      container.style.top = '0';
      container.style.visibility = 'hidden';
      container.style.contain = 'layout';
      if (currentWidth > 0) container.style.width = `${currentWidth}px`;
      const probe = element.cloneNode(false);
      probe.style.display = 'block';
      probe.style.whiteSpace = 'pre-line';
      probe.style.wordBreak = 'normal';
      probe.style.overflow = 'visible';
      probe.style.font = computed.font;
      probe.style.fontFamily = computed.fontFamily;
      probe.style.fontSize = computed.fontSize;
      probe.style.lineHeight = computed.lineHeight === 'normal' ? 'normal' : computed.lineHeight;
      probe.style.padding = computed.padding;
      probe.style.letterSpacing = computed.letterSpacing;
      probe.textContent = originalTextForRecheck;
      container.appendChild(probe);
      parent.appendChild(container);
      let hRe = Math.ceil(probe.getBoundingClientRect().height);
      hRe += Math.ceil((parseFloat(computed.marginTop) || 0) + (parseFloat(computed.marginBottom) || 0));
      parent.removeChild(container);
      if (hRe <= maxHeightRe) {
        element.textContent = originalTextForRecheck;
        element.style.whiteSpace = 'pre-line';
        element.setAttribute('data-clamp-cached', 'true');
        element.setAttribute('data-clamp-last-width', String(currentWidth));
        return;
      }
    }
  }

  const singleLineHeight = measureSingleLineHeight(element);
  const paddingTop = parseFloat(computed.paddingTop) || 0;
  const paddingBottom = parseFloat(computed.paddingBottom) || 0;
  const borderTop = parseFloat(computed.borderTopWidth) || 0;
  const borderBottom = parseFloat(computed.borderBottomWidth) || 0;
  let maxHeight = Math.ceil(
    paddingTop + paddingBottom + borderTop + borderBottom + singleLineHeight * lines
  );
  // If caller provided an exact pixel constraint, honor it to match container budget precisely
  const overrideMaxH = parseInt(element.getAttribute('data-clamp-max-height-px') || '0', 10);
  if (Number.isFinite(overrideMaxH) && overrideMaxH > 0) {
    maxHeight = overrideMaxH;
  }

  // Isolated measurement env builder for a given candidate text
  const measureCandidateHeight = (text) => {
    const parent = element.parentElement || document.body;
    const targetWidth = getAvailableWidthForClamp(element);

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-99999px';
    container.style.top = '0';
    container.style.visibility = 'hidden';
    container.style.contain = 'layout';
    if (targetWidth > 0) container.style.width = `${targetWidth}px`;

    const probe = element.cloneNode(false);
    probe.style.display = 'block';
    // Preserve hard line breaks from <br> and innerText
    probe.style.whiteSpace = 'pre-line';
    probe.style.wordBreak = 'normal';
    probe.style.overflow = 'visible';
    probe.style.font = computed.font;
    probe.style.fontFamily = computed.fontFamily;
    probe.style.fontSize = computed.fontSize;
    probe.style.lineHeight = computed.lineHeight === 'normal' ? 'normal' : computed.lineHeight;
    probe.style.padding = computed.padding;
    probe.style.letterSpacing = computed.letterSpacing;
    probe.textContent = text;

    container.appendChild(probe);
    parent.appendChild(container);
    let h = Math.ceil(probe.getBoundingClientRect().height);
    // Include margins to match real-flow height inside content containers
    const mt = parseFloat(computed.marginTop) || 0;
    const mb = parseFloat(computed.marginBottom) || 0;
    h += Math.ceil(mt + mb);
    parent.removeChild(container);
    return h;
  };

  const hOriginal = measureCandidateHeight(originalText);
  if (hOriginal <= maxHeight) {
    element.textContent = originalText;
    element.style.whiteSpace = 'pre-line';
    // Same cache state as every other exit. The fast-path check above keys off
    // both attributes together, so leaving a stale width behind an unset
    // `data-clamp-cached` makes the next pass decide on a width it never measured.
    element.setAttribute('data-clamp-cached', 'true');
    element.setAttribute('data-clamp-last-width', String(currentWidth));
    return;
  }

  const len = originalText.length;
  let low = 0;
  let high = len;
  let best = 0;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = mid >= len ? originalText : originalText.slice(0, mid) + '...';
    if (measureCandidateHeight(candidate) <= maxHeight) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const finalText = best >= len ? originalText : (best === 0 ? '...' : originalText.slice(0, best) + '...');
  element.textContent = finalText;
  // Multi-line: always use pre-line so truncated text wraps across lines (not nowrap)
  element.style.whiteSpace = 'pre-line';
  element.setAttribute('data-clamp-cached', 'true');
  element.setAttribute('data-clamp-last-width', String(currentWidth));
  const contentHeight = Math.max(0, Math.ceil(
    hOriginal - (paddingTop + paddingBottom + borderTop + borderBottom)
  ));
  const linesOriginal = Math.max(0, Math.ceil(contentHeight / Math.max(1, singleLineHeight)));
  const linesTrimmed = Math.max(0, linesOriginal - lines);
  element.setAttribute('data-clamp-lines-trimmed', String(linesTrimmed));
}

// Lightweight staging-time clamp estimate
function estimateSingleLineHeightFromComputed(cs) {
  let lineHeight = parseFloat(cs.lineHeight);
  if (!isFinite(lineHeight) || cs.lineHeight === 'normal') {
    const fontSize = parseFloat(cs.fontSize) || 16;
    lineHeight = Math.round(fontSize * 1.2);
  }
  return Math.max(1, Math.floor(lineHeight));
}

function applyEstimatedClampToSubtree(root) {
  if (!root || !root.querySelectorAll) return;
  const targets = root.querySelectorAll('[data-clamp]');
  targets.forEach((el) => {
    const lines = parseInt(el.getAttribute('data-clamp'), 10);
    if (!lines || lines <= 0) return;
    const cs = window.getComputedStyle(el);
    const pt = parseFloat(cs.paddingTop) || 0;
    const pb = parseFloat(cs.paddingBottom) || 0;
    const lh = estimateSingleLineHeightFromComputed(cs);
    const maxH = Math.ceil(pt + pb + lh * lines);
    el.style.maxHeight = `${maxH}px`;
    el.style.overflow = 'hidden';
  });
}

/**
 * Overflow Engine with Staging Simulation
 * - Uses off-screen staging to simulate margin-correct placement
 * - Supports multi-column planning 1..N (data-overflow-max-cols on .columns)
 * - Re-clamps descendants per column width during simulation and after commit
 *
 * Additionally, a lightweight single-container branch is available for any container
 * with `data-overflow="true"`. That branch:
 * - Treats the container as a single entity (no multi-column logic)
 * - Hides trailing items until content fits within the height budget
 * - Honors [data-clamp] inside items prior to measuring
 * - Optionally appends an "and N more" label when `data-overflow-counter="true"`
 */

function getHeightBudgetForColumns(columnsEl) {
  if (!columnsEl) return 0;

  // Helper to parse CSS length
  const toPx = (v) => {
    const n = parseFloat(v);
    return isFinite(n) ? n : 0;
  };

  // Improved dynamic budget, accounting for following siblings and parent row gaps
  const computeDynamicBudget = () => {
    const parent = columnsEl.parentElement;
    if (!parent) return 0;

    const parentCS = window.getComputedStyle(parent);
    const parentPB = toPx(parentCS.paddingBottom);
    const parentRect = parent.getBoundingClientRect();
    const contentBottom = Math.floor(parentRect.bottom - parentPB);

    const colsCS = window.getComputedStyle(columnsEl);
    const colsRect = columnsEl.getBoundingClientRect();
    const colsTop = Math.floor(colsRect.top);
    const colsMB = toPx(colsCS.marginBottom);
    const colsPT = toPx(colsCS.paddingTop);
    const colsPB = toPx(colsCS.paddingBottom);
    const colsBT = toPx(colsCS.borderTopWidth);
    const colsBB = toPx(colsCS.borderBottomWidth);

    let reserveBelow = 0;
    let visibleBelowCount = 0;
    try {
      let sib = columnsEl.nextElementSibling;
      while (sib) {
        if (!(sib instanceof Element)) { sib = sib.nextElementSibling; continue; }
        if (sib.parentElement !== parent) break;
        const scs = window.getComputedStyle(sib);
        const pos = scs.position;
        if (scs && scs.display !== 'none' && pos !== 'absolute' && pos !== 'fixed') {
          const srect = sib.getBoundingClientRect();
          const smt = toPx(scs.marginTop);
          const smb = toPx(scs.marginBottom);
          reserveBelow += Math.ceil((srect?.height || 0) + smt + smb);
          visibleBelowCount += 1;
        }
        sib = sib.nextElementSibling;
      }
    } catch (_) {}

    // Account for parent row-gap between this and following siblings
    let rowGap = 0;
    try {
      const rg = parentCS.rowGap || parentCS["row-gap"] || parentCS.gap || '0';
      rowGap = toPx(rg);
    } catch (_) { rowGap = 0; }
    const reserveGaps = Math.max(0, visibleBelowCount) * rowGap;

    const availableOuter = Math.max(0, contentBottom - colsTop - colsMB - reserveBelow - reserveGaps);
    const contentBudget = Math.max(0, Math.floor(availableOuter - (colsPT + colsPB + colsBT + colsBB)));
    return contentBudget;
  };

  // Modern override, the same attribute the generic engine reads: a pixel value
  // or 'auto'. Read first so an author's explicit budget wins over the legacy
  // attributes the back-compat pre-pass writes onto this node.
  const modernHeight = columnsEl.getAttribute('data-overflow-max-height');
  if (modernHeight) {
    if (modernHeight === 'auto') return computeDynamicBudget();
    const n = parseInt(modernHeight, 10);
    if (isFinite(n) && n > 0) return n;
  }

  // Legacy override: allow explicit per-container height
  const legacyHeight = columnsEl.getAttribute('data-legacy-height-budget') || columnsEl.getAttribute('data-list-max-height');
  if (legacyHeight) {
    if (legacyHeight === 'auto') {
      // Use dynamic calculation so 'auto' respects siblings and gaps
      return computeDynamicBudget();
    }
    const n = parseInt(legacyHeight, 10);
    if (isFinite(n) && n > 0) return n;
  }

  // Default: dynamic measurement within parent content area
  return computeDynamicBudget();
}

// Height budget for generic containers (non-.columns)
function getHeightBudgetForGeneric(containerEl) {
  if (!containerEl) return 0;
  // Special case: when inside a managed `.columns` context, compute the budget
  // based on the remaining vertical space in the columns content area rather
  // than the parent's current content height (which can be unconstrained).
  try {
    const columnsEl = containerEl.closest('.columns');
    const columnEl = containerEl.closest('.column');
    if (columnsEl && columnEl) {
      // Determine the bottom edge of the columns' content box (exclude padding-bottom)
      const colsCS = window.getComputedStyle(columnsEl);
      const colsPB = parseFloat(colsCS.paddingBottom) || 0;
      const colsRect = columnsEl.getBoundingClientRect();
      const contentBottom = Math.floor(colsRect.bottom - colsPB);

      // From the container's top border edge down to the contentBottom is the
      // maximum outer box we can occupy. Convert to content-box budget for max-height.
      const contCS = window.getComputedStyle(containerEl);
      const contRect = containerEl.getBoundingClientRect();
      const contTop = Math.floor(contRect.top);
      const marginBottom = parseFloat(contCS.marginBottom) || 0;
      const paddingTop = parseFloat(contCS.paddingTop) || 0;
      const paddingBottom = parseFloat(contCS.paddingBottom) || 0;
      const borderTop = parseFloat(contCS.borderTopWidth) || 0;
      const borderBottom = parseFloat(contCS.borderBottomWidth) || 0;

      // Reserve space for any siblings that follow this container within the same column
      let reserveBelow = 0;
      let visibleBelowCount = 0;
      try {
        let sib = containerEl.nextElementSibling;
        while (sib) {
          if (!(sib instanceof Element)) { sib = sib.nextElementSibling; continue; }
          // Stop reserving if we moved out of the same column container
          if (!columnEl.contains(sib)) break;
          const scs = window.getComputedStyle(sib);
          if (scs && scs.display !== 'none') {
            const srect = sib.getBoundingClientRect();
            const smt = parseFloat(scs.marginTop) || 0;
            const smb = parseFloat(scs.marginBottom) || 0;
            reserveBelow += Math.ceil((srect?.height || 0) + smt + smb);
            visibleBelowCount += 1;
          }
          sib = sib.nextElementSibling;
        }
      } catch (_) {}

      // Account for vertical gaps between this node and the following siblings
      let rowGap = 0;
      try {
        const pCS = window.getComputedStyle(containerEl.parentElement || columnEl);
        const rg = pCS.rowGap || pCS["row-gap"] || pCS.gap || '0';
        rowGap = parseFloat(rg) || 0;
      } catch (_) { rowGap = 0; }
      const reserveGaps = Math.max(0, visibleBelowCount) * rowGap;

      // Available space for the element's outer box (content+padding+border)
      // We intentionally return the outer-box allowance (minus margin-bottom and
      // space needed by following siblings) to better match subsequent checks.
      const availableOuter = Math.max(0, contentBottom - contTop - marginBottom - reserveBelow - reserveGaps);
      return Math.floor(availableOuter);
    }
  } catch (_) { /* fall through to generic paths */ }
  // Prefer explicit modern attribute first
  const modern = containerEl.getAttribute('data-overflow-max-height');
  if (modern) {
    if (modern === 'auto') {
      const parent = containerEl.parentElement;
      if (!parent) return 0;
      const cs = window.getComputedStyle(parent);
      const pt = parseFloat(cs.paddingTop) || 0;
      const pb = parseFloat(cs.paddingBottom) || 0;
      const base = parent.clientHeight || parent.getBoundingClientRect().height || 0;
      return Math.max(0, Math.floor(base - pt - pb));
    }
    const n = parseInt(modern, 10);
    if (isFinite(n) && n > 0) return n;
  }
  // Legacy attribute
  const legacy = containerEl.getAttribute('data-list-max-height');
  if (legacy) {
    if (legacy === 'auto') {
      const parent = containerEl.parentElement;
      if (!parent) return 0;
      const cs = window.getComputedStyle(parent);
      const pt = parseFloat(cs.paddingTop) || 0;
      const pb = parseFloat(cs.paddingBottom) || 0;
      const base = parent.clientHeight || parent.getBoundingClientRect().height || 0;
      return Math.max(0, Math.floor(base - pt - pb));
    }
    const n = parseInt(legacy, 10);
    if (isFinite(n) && n > 0) return n;
  }
  // Fallback: parent content box height
  const parent = containerEl.parentElement;
  if (!parent) return 0;
  const cs = window.getComputedStyle(parent);
  const pt = parseFloat(cs.paddingTop) || 0;
  const pb = parseFloat(cs.paddingBottom) || 0;
  const base = parent.clientHeight || parent.getBoundingClientRect().height || 0;
  return Math.max(0, Math.floor(base - pt - pb));
}

// The one owner of "how many .item blocks are hidden inside this overflow
// container". Every site that renders that number ("and N more") or reports it
// (stats.hiddenItems) calls this, so the label and the stats cannot disagree and
// no caller can pick its own scope. Hand it the container the engine was given
// and it resolves the scope itself: a .columns root counts the items its own
// direct columns hold, any other container counts its own direct items. A
// nested .columns therefore brings its own count instead of inflating its host's.
function countHiddenOverflowItems(containerEl) {
  if (!containerEl || typeof containerEl.querySelectorAll !== 'function') return 0;
  const isColumnsRoot = Boolean(containerEl.classList && containerEl.classList.contains('columns'));
  const selector = isColumnsRoot ? ':scope > .column .item' : ':scope > .item';
  return Array.from(containerEl.querySelectorAll(selector)).filter(
    (node) => node.style.display === 'none' || node.getAttribute('data-hidden-by-overflow') === 'true'
  ).length;
}

// Create a label item wrapper: <div class="item"><div class="meta"></div><div class="content"><span class="label label--gray">and N more</span></div></div>
// window.I18n is a host contract this repo never defines, and a host that ships
// some other i18n global (i18n-js, rails-i18n) has no andXMore on it. Every call
// site guards the method as well as the object so an unrelated global falls back
// to the English string instead of throwing through the engine.
function createLabelItem(nHidden) {
  const item = document.createElement('div');
  item.className = 'item';
  const meta = document.createElement('div');
  meta.className = 'meta';
  const content = document.createElement('div');
  content.className = 'content';
  const span = document.createElement('span');
  span.className = 'label label--gray';
  span.textContent = window.I18n?.andXMore?.(nHidden) ?? `and ${nHidden} more`;
  content.appendChild(span);
  item.appendChild(meta);
  item.appendChild(content);
  return item;
}

// Decide whether the engine should append the trailing hidden-count label
function shouldShowHiddenCount(columnsEl) {
  // Modern attribute: explicit opt-in, defaults to false when absent
  const modern = columnsEl.getAttribute('data-overflow-counter');
  if (modern != null) return String(modern) === 'true';
  // Legacy attributes fallback for compatibility
  const legacy = columnsEl.getAttribute('data-legacy-hidden-count');
  if (legacy != null) return String(legacy) !== 'false';
  const direct = columnsEl.getAttribute('data-list-hidden-count');
  if (direct != null) return String(direct) !== 'false';
  // Default: do not show the trailing label
  return false;
}

// Generic single-container overflow: manage any container with data-overflow="true"
function runOverflowEngineForGeneric(containerEl) {
  if (!containerEl || String(containerEl.getAttribute('data-overflow')) !== 'true') return null;
  // Skip .columns containers, which are handled by the multi-column engine
  if (containerEl.classList && containerEl.classList.contains('columns')) return null;

  // Reset previous state created by overflow engine (safe for generic containers)
  resetOverflowState(containerEl);

  // Clamp any [data-clamp] inside prior to measuring so heights reflect final text.
  // A throw here propagates to the 'Overflow engine generic' runSafely that wraps
  // this call, the same way the columns engine's own re-clamp does, so a failure
  // lands in stats.errors instead of leaving an untrimmed container reported as OK.
  const clampTargets = containerEl.querySelectorAll('[data-clamp]');
  clampTargets.forEach((el) => {
    const original = el.getAttribute('data-clamp-original');
    if (original !== null) el.textContent = original;
    clampElementToLines(el, parseInt(el.getAttribute('data-clamp'), 10));
  });

  // Compute and enforce height budget
  const heightBudget = Math.max(0, Math.floor(getHeightBudgetForGeneric(containerEl) || 0));
  try { containerEl.style.maxHeight = `${heightBudget}px`; } catch (_) {}
  if (heightBudget <= 0) {
    // Nothing fits; hide all items and their adjacent dividers, bail
    const blocks = Array.from(containerEl.children).filter((c) => c.classList && (c.classList.contains('item') || c.classList.contains('label')));
    blocks.forEach((b) => hideItemAndAdjacentDividers(b));
    // blocks holds group-header labels as well, so it is not the item count.
    return { itemsProcessed: blocks.length, hiddenItems: countHiddenOverflowItems(containerEl) };
  }

  // Make sure everything is visible before trimming
  const allBlocks = Array.from(containerEl.children).filter((c) => c.classList && (c.classList.contains('item') || c.classList.contains('label')));
  allBlocks.forEach((el) => { el.style.display = ''; el.removeAttribute('data-hidden-by-overflow'); });

  const getCurrentHeight = () => Math.floor(containerEl.scrollHeight || containerEl.getBoundingClientRect().height || 0);
  const withinBudget = () => getCurrentHeight() <= Math.floor(heightBudget);

  // Trim from the end until content fits (prefer hiding items first, then labels)
  let safety = 200; // generous cap for very long lists
  const visibleBlocks = () => allBlocks.filter((el) => el.style.display !== 'none');
  const pickLastVisible = () => {
    const v = visibleBlocks();
    // Prefer hiding trailing .item first
    for (let i = v.length - 1; i >= 0; i--) {
      if (v[i].classList.contains('item')) return v[i];
    }
    return v[v.length - 1] || null;
  };

  // Coarse batches: estimate average height of last few visible items to speed up trimming
  while (!withinBudget() && safety-- > 0) {
    const v = visibleBlocks();
    if (v.length === 0) break;
    const sample = v.filter((el) => el.classList.contains('item')).slice(-3);
    const avg = sample.length ? Math.round(sample.reduce((s, el) => s + (el.offsetHeight || el.getBoundingClientRect().height || 0), 0) / sample.length) : 0;
    const current = getCurrentHeight();
    const diff = Math.max(0, current - Math.floor(heightBudget));
    let hideCount = 1;
    if (avg > 0) hideCount = Math.max(1, Math.min(10, Math.ceil(diff / avg)));
    for (let k = 0; k < hideCount; k++) {
      const target = pickLastVisible();
      if (!target) break;
      hideItemAndAdjacentDividers(target);
      // Re-check budget after each hide to avoid overshooting and hiding extra items
      if (withinBudget()) break;
    }
  }

  // Append trailing label if opted-in and there are hidden .item blocks
  const hiddenItemsCount = countHiddenOverflowItems(containerEl);
  const showLabel = shouldShowHiddenCount(containerEl);
  let label = null;
  if (showLabel && hiddenItemsCount > 0) {
    label = createLabelItem(hiddenItemsCount);
    label.setAttribute('data-overflow-label', 'true');
    containerEl.appendChild(label);

    // Ensure label fits; if not, hide more from the end and keep counts updated
    let guard = 100;
    while (!withinBudget() && guard-- > 0) {
      const candidates = Array.from(containerEl.children).filter((c) => c !== label && c.style.display !== 'none' && c.classList && (c.classList.contains('item') || c.classList.contains('label')));
      if (candidates.length === 0) break;
      let target = null;
      for (let i = candidates.length - 1; i >= 0; i--) {
        if (candidates[i].classList.contains('item')) { target = candidates[i]; break; }
      }
      if (!target) target = candidates[candidates.length - 1];
      if (!target) break;
      hideItemAndAdjacentDividers(target);
      // Update label count
      const newHidden = countHiddenOverflowItems(containerEl);
      const span = label.querySelector('.label');
      if (span) span.textContent = window.I18n?.andXMore?.(newHidden) ?? `and ${newHidden} more`;
    }
    // If even with everything hidden the label cannot fit, remove it
    if (!withinBudget()) {
      try { label.remove(); } catch (_) {}
      label = null;
    }
  }

  return {
    itemsProcessed: allBlocks.length,
    hiddenItems: countHiddenOverflowItems(containerEl),
    labelAdded: !!label
  };
}

function getSourceBlocks(columnsEl) {
  const firstColumn = columnsEl.querySelector(':scope > .column');
  if (!firstColumn) return [];
  const blocks = Array.from(firstColumn.children).filter((node) =>
    node.classList && (node.classList.contains('item') || node.classList.contains('label'))
  );
  return blocks;
}

function resetOverflowState(columnsEl) {
  // Remove all .label within columns
  // Only remove overflow labels created by this engine
  columnsEl.querySelectorAll('.item[data-overflow-label="true"]').forEach((labelItem) => labelItem.remove());
  // Remove any duplicate header labels previously created by this engine
  columnsEl.querySelectorAll('.label[data-duplicate-heading="true"]').forEach((dup) => dup.remove());
  // Unhide elements previously hidden by this engine
  columnsEl.querySelectorAll('[data-hidden-by-overflow="true"]').forEach((el) => {
    el.style.display = '';
    el.removeAttribute('data-hidden-by-overflow');
  });
  // Clear the height cap written by the prior pass before measuring the next
  // budget. Otherwise padding and borders can make the available height ratchet
  // smaller on every re-terminalize.
  columnsEl.style.maxHeight = '';

  // A committed plan distributes authored nodes across every direct column,
  // while getSourceBlocks plans from the first column. Consolidate the real
  // source back into that first column before planning so a later commit cannot
  // clear and discard everything that was previously placed in columns 2+.
  const realColumns = Array.from(columnsEl.querySelectorAll(':scope > .column'));
  if (realColumns.length > 1) {
    const firstColumn = realColumns[0];
    for (let i = 1; i < realColumns.length; i++) {
      const extraColumn = realColumns[i];
      Array.from(extraColumn.children).forEach((child) => {
        if (child.classList && (
          child.classList.contains('item') ||
          child.classList.contains('label') ||
          child.classList.contains('divider')
        )) {
          firstColumn.appendChild(child);
        }
      });
      extraColumn.remove();
    }
  }
}

/** Hide an item (or block) and any adjacent .divider siblings. Keeps dividers in sync when items are hidden. */
function hideItemAndAdjacentDividers(el) {
  el.style.display = 'none';
  el.setAttribute('data-hidden-by-overflow', 'true');
  const prev = el.previousElementSibling;
  const next = el.nextElementSibling;
  if (prev && prev.classList && prev.classList.contains('divider')) {
    prev.style.display = 'none';
    prev.setAttribute('data-hidden-by-overflow', 'true');
  }
  if (next && next.classList && next.classList.contains('divider')) {
    next.style.display = 'none';
    next.setAttribute('data-hidden-by-overflow', 'true');
  }
}

function createStagingRootLike(columnsEl) {
  const staging = document.createElement('div');
  staging.className = columnsEl.className || 'columns';
  staging.setAttribute('data-staging', 'true');
  staging.style.position = 'absolute';
  staging.style.left = '-99999px';
  staging.style.top = '0';
  staging.style.visibility = 'hidden';
  staging.style.contain = 'layout';
  // Mirror real columns width to let CSS compute matching column widths
  const realRect = columnsEl.getBoundingClientRect();
  if (realRect && realRect.width) {
    staging.style.width = `${Math.floor(realRect.width)}px`;
  }
  // Attach near the real columns to inherit the same CSS environment
  const parent = columnsEl.parentElement || document.body;
  parent.appendChild(staging);
  return staging;
}

function buildStagingColumns(stagingRoot, count) {
  stagingRoot.innerHTML = '';
  const cols = [];
  for (let i = 0; i < count; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    stagingRoot.appendChild(col);
    cols.push(col);
  }
  return cols;
}

function tryPlaceCloneInColumn(columnEl, cloneNode, heightBudget) {
  // Fast simulation path: use estimated clamp (CSS max-height) to approximate
  // text height without performing expensive measurement.
  columnEl.appendChild(cloneNode);
  applyEstimatedClampToSubtree(cloneNode);
  const colRect = columnEl.getBoundingClientRect();
  const lastChild = columnEl.lastElementChild;
  const contentHeight = lastChild
    ? Math.ceil(lastChild.getBoundingClientRect().bottom - colRect.top)
    : 0;
  const fits = contentHeight <= Math.floor(heightBudget);
  if (!fits) {
    columnEl.removeChild(cloneNode);
  }
  return fits;
}

function deepCloneBlockForStaging(realNode) {
  // Deep clone to reflect structure for measurement
  return realNode.cloneNode(true);
}

function simulateLayoutForColumnCount(columnsEl, columnCount, heightBudget) {
  const stagingRoot = createStagingRootLike(columnsEl);
  const stagingColumns = buildStagingColumns(stagingRoot, columnCount);

  const sourceBlocks = getSourceBlocks(columnsEl);
  const placements = []; // { realNode, columnIndex, cloneNode, type: 'item'|'header', headingCloneNode? }
  const hiddenRealNodes = new Set();
  const duplicatesByColumn = Array.from({ length: columnCount }, () => []); // [{ before, heading }]
  const headerPlacedInColumn = Array.from({ length: columnCount }, () => new Set());
  const placedHeadings = new Set(); // track original heading placed in some column

  let currentColumnIndex = 0;
  let activeHeading = null;

  sourceBlocks.forEach((realNode) => {
    const isHeaderItem = realNode.classList.contains('label') && realNode.hasAttribute('data-group-header');
    const isItem = realNode.classList.contains('item');
    if (!isHeaderItem && !isItem) return;

    if (isHeaderItem) {
      activeHeading = realNode;
      return;
    }

    let placed = false;
    for (let colIndex = currentColumnIndex; colIndex < stagingColumns.length; colIndex++) {
      const columnEl = stagingColumns[colIndex];

      const needHeader = !!activeHeading && !headerPlacedInColumn[colIndex].has(activeHeading);
      let headerCloneNode = null;
      if (needHeader) {
        // Duplicate header as a plain label element
        headerCloneNode = document.createElement('span');
        headerCloneNode.className = 'label label--base group-header label--gray';
        headerCloneNode.setAttribute('data-duplicate-heading', 'true');
        headerCloneNode.textContent = activeHeading.textContent || '';
        if (!tryPlaceCloneInColumn(columnEl, headerCloneNode, heightBudget)) {
          headerCloneNode = null;
          continue;
        }
      }

      const itemClone = deepCloneBlockForStaging(realNode);
      if (tryPlaceCloneInColumn(columnEl, itemClone, heightBudget)) {
        // Capture whether this is the first placement of the active heading
        // BEFORE placedHeadings.add() runs below. The item's headingCloneNode
        // link (used to remove the header clone if the item is later dropped)
        // must be read from this snapshot; reading placedHeadings after the add
        // would always be false, so headingCloneNode would always be null.
        const isFirstHeadingPlacement = needHeader && !!activeHeading && !placedHeadings.has(activeHeading);
        // If this is the first time placing this group's header, place the ORIGINAL header label before the item
        if (isFirstHeadingPlacement) {
          placements.push({ realNode: activeHeading, columnIndex: colIndex, cloneNode: headerCloneNode, type: 'header' });
          placedHeadings.add(activeHeading);
          headerPlacedInColumn[colIndex].add(activeHeading);
        } else if (needHeader && activeHeading) {
          // For subsequent columns, record a duplicate heading to be inserted during commit
          headerPlacedInColumn[colIndex].add(activeHeading);
          duplicatesByColumn[colIndex].push({ before: realNode, heading: activeHeading });
        }
        placements.push({ realNode, columnIndex: colIndex, cloneNode: itemClone, type: 'item', headingCloneNode: isFirstHeadingPlacement ? headerCloneNode : null, groupHeading: activeHeading || null });
        placed = true;
        currentColumnIndex = colIndex;
        break;
      } else {
        if (headerCloneNode && headerCloneNode.parentElement === columnEl) {
          columnEl.removeChild(headerCloneNode);
        }
        headerCloneNode = null;
      }
    }

    if (!placed) {
      hiddenRealNodes.add(realNode);
    }
  });

  // Count hidden items (exclude headings)
  const nHiddenItems = Array.from(hiddenRealNodes).filter((n) => n.classList.contains('item')).length;

  // Attempt to add label if needed
  let labelClone = null;
  let hiddenByLabelAdjust = [];
  if (nHiddenItems > 0 && stagingColumns.length > 0 && shouldShowHiddenCount(columnsEl)) {
    const lastCol = stagingColumns[stagingColumns.length - 1];

    const ensureLabelFits = () => {
      if (labelClone && labelClone.parentElement) {
        labelClone.parentElement.removeChild(labelClone);
      }
      labelClone = createLabelItem(nHiddenItems);
      return tryPlaceCloneInColumn(lastCol, labelClone, heightBudget);
    };

    // First try with existing placements
    if (!ensureLabelFits()) {
      // Hide trailing visible blocks until label fits
      while (placements.length > 0) {
        // Prefer removing a trailing item; if none, remove trailing heading
        const findAndRemoveFromStaging = () => {
          // Try from end and prefer items
          for (let i = placements.length - 1; i >= 0; i--) {
            if (placements[i].type === 'item') {
              const removed = placements.splice(i, 1)[0];
              const { cloneNode, headingCloneNode, columnIndex: colIndex, realNode, groupHeading } = removed;
              if (cloneNode && cloneNode.parentElement) {
                cloneNode.parentElement.removeChild(cloneNode);
              }
              if (headingCloneNode && headingCloneNode.parentElement) {
                headingCloneNode.parentElement.removeChild(headingCloneNode);
              }
              if (Array.isArray(duplicatesByColumn[colIndex])) {
                // Retarget duplicate heading to the next remaining item of the same group in this column
                const dups = duplicatesByColumn[colIndex];
                const idx = dups.findIndex((d) => d.before === realNode);
                if (idx !== -1) {
                  const nextSameGroup = placements.find((p) => p.columnIndex === colIndex && p.type === 'item' && p.groupHeading === groupHeading);
                  if (nextSameGroup) {
                    dups[idx] = { before: nextSameGroup.realNode, heading: groupHeading };
                  } else {
                    dups.splice(idx, 1);
                    // Allow a future item in this column to reinsert the header if it appears
                    if (groupHeading && headerPlacedInColumn[colIndex]) {
                      headerPlacedInColumn[colIndex].delete(groupHeading);
                    }
                  }
                }
              }
              return removed;
            }
          }
          // Fallback: remove the last one
          const removed = placements.pop();
          if (removed && removed.cloneNode && removed.cloneNode.parentElement) {
            removed.cloneNode.parentElement.removeChild(removed.cloneNode);
          }
          return removed;
        };

        const removed = findAndRemoveFromStaging();
        const { realNode } = removed || {};
        // Update hidden sets & counts if item was removed
        if (realNode && realNode.classList && realNode.classList.contains('item')) {
          hiddenRealNodes.add(realNode);
        }
        if (realNode) hiddenByLabelAdjust.push(realNode);
        if (ensureLabelFits()) break;
      }

      // If nothing left visible, try label-only case
      if (placements.length === 0 && (!labelClone || labelClone.parentElement !== lastCol)) {
        // Clear columns explicitly (detach children safely)
        stagingColumns.forEach((c) => {
          while (c.firstChild) { c.removeChild(c.firstChild); }
        });
        if (!ensureLabelFits()) {
          // Height budget is probably 0; render nothing
          if (labelClone && labelClone.parentElement) {
            labelClone.parentElement.removeChild(labelClone);
          }
          labelClone = null;
        }
      }
    }
  }

  // Compute score by visible items
  // Slightly penalize placements that hide many items to counterbalance the
  // absence of clamping in simulation. Prefer more items visible first.
  const visibleItemsCount = placements.filter((p) => p.type === 'item').length;

  // Build commit plan: mapping of column index -> array of real nodes
  const columnToRealNodes = Array.from({ length: columnCount }, () => []);
  placements.forEach((p) => {
    columnToRealNodes[p.columnIndex].push(p.realNode);
  });

  // Cleanup staging
  if (stagingRoot && stagingRoot.parentNode) {
    stagingRoot.parentNode.removeChild(stagingRoot);
  }

  return {
    columnCount,
    columnToRealNodes,
    hiddenNodes: Array.from(hiddenRealNodes),
    visibleItemsCount,
    needsLabel: !!(labelClone || (Array.isArray(hiddenByLabelAdjust) && hiddenByLabelAdjust.length > 0)),
    hiddenByLabelAdjust,
    duplicatesByColumn
  };
}

// Special-case simulation: when the number of group headers equals the desired column count,
// place each group entirely within its own column in order. This creates a harmonious layout
// where columns align with group boundaries. Items from earlier groups will never spill into
// later columns; if overflow occurs, it must only be in the last column's group.
function simulateHarmoniousGroups(columnsEl, columnCount, heightBudget) {
  const stagingRoot = createStagingRootLike(columnsEl);
  const stagingColumns = buildStagingColumns(stagingRoot, columnCount);

  const sourceBlocks = getSourceBlocks(columnsEl);

  // Identify headers and map each item to its group index
  const headers = [];
  const nodeToGroupIndex = new Map();
  let currentGroupIndex = -1;
  sourceBlocks.forEach((node) => {
    const isHeader = node.classList.contains('label') && node.hasAttribute('data-group-header');
    const isItem = node.classList.contains('item');
    if (!isHeader && !isItem) return;
    if (isHeader) {
      headers.push(node);
      currentGroupIndex = headers.length - 1;
    } else if (isItem) {
      if (currentGroupIndex >= 0) nodeToGroupIndex.set(node, currentGroupIndex);
    }
  });

  // Require exact or fewer groups than requested columns
  // We plan exactly one column per header. If there are more requested columns than headers,
  // we still simulate using headers.length columns.
  if (headers.length === 0 || headers.length > columnCount) {
    if (stagingRoot && stagingRoot.parentNode) stagingRoot.parentNode.removeChild(stagingRoot);
    return null;
  }
  // Adjust staging to match header count
  while (stagingColumns.length > headers.length) {
    const col = stagingColumns.pop();
    if (col && col.parentNode) col.parentNode.removeChild(col);
  }
  columnCount = headers.length;

  const placements = []; // { realNode, columnIndex, cloneNode, type }
  const hiddenRealNodes = new Set();
  const duplicatesByColumn = Array.from({ length: columnCount }, () => []);
  const placedHeaderInColumn = new Set();

  let violatedEarlyGroupFit = false;

  // Iterate once and place nodes strictly into their group's column
  let activeGroupIndex = -1;
  sourceBlocks.forEach((realNode) => {
    const isHeader = realNode.classList.contains('label') && realNode.hasAttribute('data-group-header');
    const isItem = realNode.classList.contains('item');
    if (!isHeader && !isItem) return;

    if (isHeader) {
      activeGroupIndex += 1;
      const colEl = stagingColumns[activeGroupIndex] || stagingColumns[stagingColumns.length - 1];
      const headerClone = document.createElement('span');
      headerClone.className = 'label label--base group-header label--gray';
      headerClone.setAttribute('data-duplicate-heading', 'true');
      headerClone.textContent = realNode.textContent || '';
      // Place the ORIGINAL header in placements, but clone for staging measurement
      if (tryPlaceCloneInColumn(colEl, headerClone, heightBudget)) {
        placements.push({ realNode, columnIndex: activeGroupIndex, cloneNode: headerClone, type: 'header' });
        placedHeaderInColumn.add(activeGroupIndex);
      } else {
        // If header itself cannot fit, mark overflow; treat as hidden and bail
        hiddenRealNodes.add(realNode);
        if (activeGroupIndex < columnCount - 1) violatedEarlyGroupFit = true;
      }
      return;
    }

    // Items: force into current group's column
    const groupIdx = nodeToGroupIndex.get(realNode);
    if (groupIdx == null) return;
    const colEl = stagingColumns[groupIdx] || stagingColumns[stagingColumns.length - 1];

    const itemClone = deepCloneBlockForStaging(realNode);
    if (tryPlaceCloneInColumn(colEl, itemClone, heightBudget)) {
      placements.push({ realNode, columnIndex: groupIdx, cloneNode: itemClone, type: 'item' });
    } else {
      hiddenRealNodes.add(realNode);
      if (groupIdx < columnCount - 1) {
        // Any early group item that does not fit makes this plan invalid for harmonious layout
        violatedEarlyGroupFit = true;
      }
    }
  });

  // If early groups overflowed, this plan is not considered harmonious
  if (violatedEarlyGroupFit) {
    if (stagingRoot && stagingRoot.parentNode) stagingRoot.parentNode.removeChild(stagingRoot);
    return null;
  }

  // Build final plan
  const columnToRealNodes = Array.from({ length: columnCount }, () => []);
  placements.forEach((p) => {
    columnToRealNodes[p.columnIndex].push(p.realNode);
  });

  const visibleItemsCount = placements.filter((p) => p.type === 'item').length;

  // Cleanup staging
  if (stagingRoot && stagingRoot.parentNode) stagingRoot.parentNode.removeChild(stagingRoot);

  return {
    columnCount,
    columnToRealNodes,
    hiddenNodes: Array.from(hiddenRealNodes),
    visibleItemsCount,
    needsLabel: shouldShowHiddenCount(columnsEl) && hiddenRealNodes.size > 0,
    hiddenByLabelAdjust: Array.from(hiddenRealNodes),
    duplicatesByColumn,
    isHarmonious: true
  };
}

function commitOverflowPlan(columnsEl, plan) {
  // Ensure correct number of real columns
  let realColumns = Array.from(columnsEl.querySelectorAll(':scope > .column'));
  // Use first .column as base; add/remove to match plan.columnCount
  if (realColumns.length < plan.columnCount) {
    const toAdd = plan.columnCount - realColumns.length;
    for (let i = 0; i < toAdd; i++) {
      const newCol = document.createElement('div');
      newCol.className = 'column';
      columnsEl.appendChild(newCol);
    }
    realColumns = Array.from(columnsEl.querySelectorAll(':scope > .column'));
  } else if (realColumns.length > plan.columnCount) {
    // Remove extras from the end after clearing their content
    for (let i = realColumns.length - 1; i >= plan.columnCount; i--) {
      const col = realColumns[i];
      col.remove();
    }
    realColumns = Array.from(columnsEl.querySelectorAll(':scope > .column'));
  }

  // Move real blocks into target columns in source order
  // First collect all candidate blocks from original source order
  const sourceColumn = columnsEl.querySelector(':scope > .column');
  const sourceChildren = sourceColumn ? Array.from(sourceColumn.children) : [];
  const sourceBlocks = getSourceBlocks(columnsEl);
  const dividerRecords = sourceChildren
    .map((node, index) => {
      if (!(node.classList && node.classList.contains('divider'))) return null;
      let previousItem = null;
      let nextItem = null;
      for (let i = index - 1; i >= 0; i--) {
        if (sourceChildren[i].classList?.contains('item')) {
          previousItem = sourceChildren[i];
          break;
        }
      }
      for (let i = index + 1; i < sourceChildren.length; i++) {
        if (sourceChildren[i].classList?.contains('item')) {
          nextItem = sourceChildren[i];
          break;
        }
      }
      return { node, previousItem, nextItem };
    })
    .filter(Boolean);

  // Clear existing blocks from all columns to avoid duplicates; we'll re-append
  realColumns.forEach((col) => {
    Array.from(col.children).forEach((child) => {
      if (child.classList && (
        child.classList.contains('item') ||
        child.classList.contains('label') ||
        child.classList.contains('divider')
      )) {
        child.remove();
      }
    });
  });

  // Visibility map: mark all as hidden by default; we'll unhide those in plan
  const visibleSet = new Set();
  plan.columnToRealNodes.forEach((arr) => arr.forEach((node) => visibleSet.add(node)));

  sourceBlocks.forEach((node) => {
    if (visibleSet.has(node)) {
      node.style.display = '';
      node.removeAttribute('data-hidden-by-overflow');
    } else {
      hideItemAndAdjacentDividers(node);
    }
  });

  // Append visible nodes according to the plan (insert duplicate header labels when needed)
  plan.columnToRealNodes.forEach((nodes, idx) => {
    const col = realColumns[idx];
    nodes.forEach((node) => {
      const dups = (plan.duplicatesByColumn && plan.duplicatesByColumn[idx]) || [];
      const matches = dups.filter((d) => d.before === node);
      matches.forEach((d) => {
        // Build a duplicate header as a label only
        const dup = document.createElement('span');
        dup.className = 'label label--base group-header label--gray';
        dup.setAttribute('data-duplicate-heading', 'true');
        const srcLabel = d.heading; // original is a label
        dup.textContent = srcLabel ? srcLabel.textContent : '';
        col.appendChild(dup);
      });
      col.appendChild(node);
    });
  });

  // Ensure hidden nodes remain in DOM (spec: hide leftovers without removal)
  const hiddenList = sourceBlocks.filter((node) => !visibleSet.has(node));
  if (hiddenList.length > 0) {
    const lastCol = realColumns[realColumns.length - 1];
    hiddenList.forEach((node) => {
      // Keep order, attach to DOM, and hide (dividers were already hidden in visibility pass above)
      lastCol.appendChild(node);
      node.style.display = 'none';
      node.setAttribute('data-hidden-by-overflow', 'true');
    });
  }

  // Restore authored dividers beside their original item neighbors. A divider
  // is visible only when both adjacent items remain visible in the same column;
  // hidden dividers stay next to the following item so source order survives
  // another consolidation and planning pass.
  dividerRecords.forEach(({ node, previousItem, nextItem }) => {
    const previousVisible = previousItem && visibleSet.has(previousItem);
    const nextVisible = nextItem && visibleSet.has(nextItem);
    const sharedColumn = previousVisible && nextVisible && previousItem.parentElement === nextItem.parentElement
      ? nextItem.parentElement
      : null;

    if (sharedColumn) {
      node.style.display = '';
      node.removeAttribute('data-hidden-by-overflow');
      sharedColumn.insertBefore(node, nextItem);
      return;
    }

    node.style.display = 'none';
    node.setAttribute('data-hidden-by-overflow', 'true');
    if (nextItem?.parentElement) {
      nextItem.parentElement.insertBefore(node, nextItem);
    } else if (previousItem?.parentElement) {
      previousItem.parentElement.insertBefore(node, previousItem.nextSibling);
    } else {
      realColumns[realColumns.length - 1].appendChild(node);
    }
  });

  // Append label if needed in the last column
  if (plan.needsLabel && shouldShowHiddenCount(columnsEl)) {
    // The plan's own hidden list is not the count the reader sees. Read the
    // committed DOM through the same owner every other site uses.
    const totalHiddenItems = countHiddenOverflowItems(columnsEl);
    if (totalHiddenItems > 0) {
      const label = createLabelItem(totalHiddenItems);
      label.setAttribute('data-overflow-label', 'true');
      const lastCol = realColumns[realColumns.length - 1];
      lastCol.appendChild(label);
    }
  }

  // After moving, re-clamp only when column width actually changed,
  // and remove staging-time CSS clamp estimates
  const realColumnWidths = realColumns.map((col) => Math.floor(col.getBoundingClientRect().width));
  plan.columnToRealNodes.forEach((nodes, colIdx) => {
    if (!nodes || nodes.length === 0) return;
    const colWidth = realColumnWidths[colIdx] || 0;
    nodes.forEach((node) => {
      // Only touch elements that explicitly opt into clamping
      const clampTargets = node.querySelectorAll('[data-clamp]');
      if (clampTargets.length === 0) return;
      clampTargets.forEach((el) => {
        // Clear estimated CSS clamp used in staging simulation
        el.style.maxHeight = '';
        el.style.overflow = '';
        const lastWidthAttr = el.getAttribute('data-clamp-last-width');
        const lastWidth = lastWidthAttr ? parseInt(lastWidthAttr, 10) : 0;
        // Re-clamp only if the effective column width changed more than 1px
        if (Math.abs(colWidth - lastWidth) <= 1) return;
        const original = el.getAttribute('data-clamp-original');
        if (original !== null) el.textContent = original;
        clampElementToLines(el, parseInt(el.getAttribute('data-clamp'), 10));
        el.setAttribute('data-clamp-last-width', String(colWidth));
      });
    });
  });

  // Enforce final fit in real DOM to eliminate any staging vs real differentials
  enforceRealColumnsFit(columnsEl);
}

function enforceRealColumnsFit(columnsEl) {
  const heightBudget = getHeightBudgetForColumns(columnsEl);
  const realColumns = Array.from(columnsEl.querySelectorAll(':scope > .column'));
  
  if (Math.floor(heightBudget || 0) <= 0 || realColumns.length === 0) return;

  // Ensure no labels present before fit pass
  // Only remove overflow labels created by this engine
  columnsEl.querySelectorAll('.item[data-overflow-label="true"]').forEach((l) => l.remove());

  // Make each column fit by hiding trailing blocks (prefer items), using batched removals.
  // The engine's blocks are `.item` and `.label` (group headers and their duplicates),
  // the same pair getSourceBlocks plans from.
  realColumns.forEach((col) => {
    const blocks = Array.from(col.children).filter((c) => c.classList && (c.classList.contains('label') || c.classList.contains('item')));
    const isVisible = (el) => el.style.display !== 'none';
    let safety = 50; // significantly lower iterations by hiding in batches

    const pickLastVisible = (preferItem = true) => {
      let target = null;
      if (preferItem) {
        for (let i = blocks.length - 1; i >= 0; i--) {
          if (!isVisible(blocks[i])) continue;
          if (blocks[i].classList.contains('item')) { target = blocks[i]; break; }
        }
      }
      if (!target) {
        for (let i = blocks.length - 1; i >= 0; i--) {
          if (!isVisible(blocks[i])) continue;
          if (blocks[i].classList.contains('label')) { target = blocks[i]; break; }
        }
      }
      return target;
    };

    while (Math.floor(col.scrollHeight || col.getBoundingClientRect().height) > Math.floor(heightBudget) && safety-- > 0) {
      // Estimate how many items to hide based on average height of last few visible items
      const visibleItems = blocks.filter((b) => isVisible(b) && b.classList.contains('item'));
      const sample = visibleItems.slice(-3);
      let avg = 0;
      if (sample.length > 0) {
        avg = Math.round(sample.reduce((sum, el) => sum + (el.offsetHeight || el.getBoundingClientRect().height), 0) / sample.length);
      }
      const current = Math.floor(col.scrollHeight || col.getBoundingClientRect().height);
      const diff = Math.max(0, current - Math.floor(heightBudget));
      let hideCount = 1;
      if (avg > 0) {
        hideCount = Math.max(1, Math.min(10, Math.ceil(diff / avg)));
      }
      let hidAny = false;
      for (let k = 0; k < hideCount; k++) {
        const target = pickLastVisible(true) || pickLastVisible(false);
        if (!target) break;
        hideItemAndAdjacentDividers(target);
        hidAny = true;
        // Stop early if this column now fits to avoid overshooting
        if (Math.floor(col.scrollHeight || col.getBoundingClientRect().height) <= Math.floor(heightBudget)) break;
      }
      // Nothing left to hide: the condition cannot change, so re-testing it would
      // just burn the remaining iterations on forced layout reads.
      if (!hidAny) break;
    }
  });
  
  // Compute hidden items and add label to last column if needed
  const hiddenItems = countHiddenOverflowItems(columnsEl);
  if (hiddenItems > 0 && shouldShowHiddenCount(columnsEl)) {
    const lastCol = realColumns[realColumns.length - 1];
    const label = createLabelItem(hiddenItems);
    label.setAttribute('data-overflow-label', 'true');
    lastCol.appendChild(label);

  // Ensure label fits; if not, hide more trailing blocks
    let safety = 50;
    while (Math.floor(lastCol.scrollHeight || lastCol.getBoundingClientRect().height) > Math.floor(heightBudget) && safety-- > 0) {
      const candidates = Array.from(lastCol.children).filter((c) => c.classList && (c.classList.contains('label') || c.classList.contains('item')) && c.style.display !== 'none');
      if (candidates.length === 0) break;
      const visibleItems = candidates.filter((c) => c.classList.contains('item'));
      const sample = visibleItems.slice(-3);
      const avg = sample.length ? Math.round(sample.reduce((s, el) => s + (el.offsetHeight || el.getBoundingClientRect().height), 0) / sample.length) : 0;
      const current = Math.floor(lastCol.scrollHeight || lastCol.getBoundingClientRect().height);
      const diff = Math.max(0, current - Math.floor(heightBudget));
      let hideCount = 1;
      if (avg > 0) hideCount = Math.max(1, Math.min(10, Math.ceil(diff / avg)));

      for (let k = 0; k < hideCount; k++) {
        let target = null;
        for (let i = candidates.length - 1; i >= 0; i--) {
          if (candidates[i].classList.contains('item')) { target = candidates[i]; break; }
        }
        if (!target) target = candidates[candidates.length - 1];
        if (!target) break;
        hideItemAndAdjacentDividers(target);
        // Stop early if label now fits after this hide
        if (Math.floor(lastCol.scrollHeight || lastCol.getBoundingClientRect().height) <= Math.floor(heightBudget)) break;
      }
      // Update label count once per iteration
      const newHidden = countHiddenOverflowItems(columnsEl);
      const labelSpan = label.querySelector('.label');
      if (labelSpan) labelSpan.textContent = window.I18n?.andXMore?.(newHidden) ?? `and ${newHidden} more`;
    }

    // If nothing can remain and label still cannot fit, remove label
    if (Math.floor(lastCol.scrollHeight || lastCol.getBoundingClientRect().height) > Math.floor(heightBudget)) {
      label.remove();
    }
  }
  // Remove or hide dangling header labels not followed by any visible item in the same column
  realColumns.forEach((col) => {
    const children = Array.from(col.children);
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      const isHeaderLabel = c.classList && c.classList.contains('label') && c.hasAttribute('data-group-header');
      const isDuplicateHeaderLabel = c.classList && c.classList.contains('label') && c.getAttribute('data-duplicate-heading') === 'true';
      // A duplicate the fit pass above hid is engine-created residue. Duplicates
      // are minted fresh every commit, so drop it instead of leaving a hidden node.
      if (isDuplicateHeaderLabel && c.style.display === 'none') {
        c.remove();
        continue;
      }
      if ((isHeaderLabel || isDuplicateHeaderLabel) && c.style.display !== 'none') {
        // Look ahead for next visible item
        let hasFollowingVisibleItem = false;
        for (let j = i + 1; j < children.length; j++) {
          const n = children[j];
          if (!n.classList) continue;
          if (n.style.display === 'none') continue;
          if (n.classList.contains('item')) { hasFollowingVisibleItem = true; break; }
          if (n.getAttribute && n.getAttribute('data-overflow-label') === 'true') break; // stop at label
        }
        if (!hasFollowingVisibleItem) {
          if (isDuplicateHeaderLabel) {
            c.remove();
          } else {
            hideItemAndAdjacentDividers(c);
          }
        }
      }
    }
  });
}

function runOverflowEngineForColumns(columnsEl) {
  // Opt-in when either data-overflow-max-cols or data-overflow-cols (or any responsive variant) is present
  const hasMax = hasAnyOverflowMaxColsAttribute(columnsEl);
  const hasFixed = hasAnyOverflowColsAttribute(columnsEl);
  if (!hasMax && !hasFixed) {
    return null;
  }
  // Pre-pass reset
  resetOverflowState(columnsEl);

  const maxColumnsResolved = readResponsiveOverflowMaxCols(columnsEl);
  let maxColumns = Math.max(1, (maxColumnsResolved != null ? maxColumnsResolved : 1));
  const fixedColumnsResolved = readResponsiveOverflowCols(columnsEl);
  const fixedColumns = Math.max(0, fixedColumnsResolved != null ? fixedColumnsResolved : 0);
  // If only fixed is provided and no max, set max to fixed so width estimates are sane
  if (!hasMax && hasFixed && fixedColumns > 0) {
    maxColumns = fixedColumns;
  }
  const heightBudget = getHeightBudgetForColumns(columnsEl);
  
  try {
    const h = Math.max(0, Math.floor(heightBudget || 0));
    columnsEl.style.maxHeight = `${h}px`;
  } catch (_) { /* noop for safety */ }

  // Track items present in this instance
  const sourceAll = getSourceBlocks(columnsEl);
  const itemsInSource = sourceAll.filter((n) => n.classList && n.classList.contains('item')).length;

  // Edge case: zero height budget, nothing to render
  if (heightBudget <= 0) {
    // Hide all candidate blocks and their adjacent dividers; ensure no label
    getSourceBlocks(columnsEl).forEach((n) => hideItemAndAdjacentDividers(n));
    // Remove engine-created artifacts
    columnsEl.querySelectorAll('.item[data-overflow-label="true"]').forEach((l) => l.remove());
    // Duplicate group headers are labels, the same selector resetOverflowState clears.
    columnsEl.querySelectorAll('.label[data-duplicate-heading="true"]').forEach((dup) => dup.remove());
    // Everything above is hidden, so the count is what the DOM now carries, the same
    // way the generic engine's zero-budget path reports it.
    return {
      itemsProcessed: itemsInSource,
      columnsCreated: 0,
      repeatedHeaders: 0,
      harmonious: 0,
      hiddenItems: countHiddenOverflowItems(columnsEl)
    };
  }

  let bestPlan = null;
  if (fixedColumns > 0) {
    // Force an exact number of columns as requested by the container
    const c = Math.max(1, fixedColumns);
    bestPlan = simulateLayoutForColumnCount(columnsEl, c, heightBudget);
  } else {
    // Prefer harmonious group-per-column layout when applicable
    // Attempt harmonious layout when we have 1..maxColumns headings
    const headers = getSourceBlocks(columnsEl).filter((n) => n.classList && n.classList.contains('label') && n.hasAttribute('data-group-header'));
    if (headers.length >= 1 && headers.length <= maxColumns) {
      const harmonious = simulateHarmoniousGroups(columnsEl, headers.length, heightBudget);
      if (harmonious) {
        bestPlan = harmonious;
      }
    }

    // Evaluate c=1..N, choose plan with highest visible items;
    // tie-break: when overflow exists, prefer more columns; otherwise prefer fewer
    for (let c = 1; c <= maxColumns; c++) {
      const plan = simulateLayoutForColumnCount(columnsEl, c, heightBudget);
      if (!bestPlan) {
        bestPlan = plan;
        continue;
      }
      // When a harmonious plan exists, only replace it if another plan shows strictly more items
      if (bestPlan && bestPlan.isHarmonious) {
        if (plan.visibleItemsCount > bestPlan.visibleItemsCount) {
          bestPlan = plan;
        }
        continue;
      }
      if (plan.visibleItemsCount > bestPlan.visibleItemsCount) {
        bestPlan = plan;
        continue;
      }
      if (plan.visibleItemsCount === bestPlan.visibleItemsCount) {
        const planHasOverflow = plan.hiddenNodes.some((n) => n.classList && n.classList.contains('item'));
        const bestHasOverflow = bestPlan.hiddenNodes.some((n) => n.classList && n.classList.contains('item'));
        if (planHasOverflow && bestHasOverflow) {
          // When both plans still have hidden items, prefer the layout that uses more columns
          if (plan.columnCount > bestPlan.columnCount) bestPlan = plan;
        } else if (!planHasOverflow && !bestHasOverflow) {
          // When nothing overflows, prefer fewer columns
          if (plan.columnCount < bestPlan.columnCount) bestPlan = plan;
        }
      }
    }

    // Enforce multi-column when overflow exists and a higher column plan is not worse
    if (maxColumns > 1 && bestPlan) {
      const maxPlan = simulateLayoutForColumnCount(columnsEl, maxColumns, heightBudget);
      const bestHiddenItems = bestPlan.hiddenNodes.filter((n) => n.classList && n.classList.contains('item')).length;
      if (
        bestHiddenItems > 0 &&
        maxPlan.columnCount > bestPlan.columnCount &&
        maxPlan.visibleItemsCount >= bestPlan.visibleItemsCount
      ) {
        bestPlan = maxPlan;
      }
    }
  }

  if (bestPlan) {
    commitOverflowPlan(columnsEl, bestPlan);
    // After committing layout for this .columns, normalize index widths within it
    adjustIndexSpanWidthsInRoot(columnsEl);
    // If commit plan determined no label (due to tie-breaks) but we have hidden items, force a label append
    const hiddenItemsPost = countHiddenOverflowItems(columnsEl);
    if (hiddenItemsPost > 0 && shouldShowHiddenCount(columnsEl) && !columnsEl.querySelector('[data-overflow-label="true"]')) {
      const lastCol = columnsEl.querySelector(':scope > .column:last-child');
      if (lastCol) {
        const label = createLabelItem(hiddenItemsPost);
        label.setAttribute('data-overflow-label', 'true');
        lastCol.appendChild(label);
      }
    }
  }

  // Compute duplicates planned
  const duplicateHeaders = bestPlan && Array.isArray(bestPlan.duplicatesByColumn)
    ? bestPlan.duplicatesByColumn.reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
    : 0;

  // Count hidden items after commit
  const hiddenItemsPost = countHiddenOverflowItems(columnsEl);

  return {
    itemsProcessed: itemsInSource,
    columnsCreated: bestPlan ? bestPlan.columnCount : 0,
    repeatedHeaders: duplicateHeaders,
    harmonious: bestPlan && bestPlan.isHarmonious ? 1 : 0,
    hiddenItems: hiddenItemsPost
  };
}

// Matches the arbitrary pixel-gap utility class `gap--[10px]`. When the user
// wrote an exact pixel value we treat it as immutable and skip the
// pixel-perfect adjustment entirely.
//
// Base form only, because that is the only form _gap.scss emits: the arbitrary
// loop sits outside the variant gates, so `md:gap--[25px]` sets no gap and has
// no intent to preserve. Matching prefixes here would have skipped the
// adjustment for a class that does nothing.
const ARBITRARY_GAP_CLASS_RE = /^gap--\[\d+(?:\.\d+)?(?:px)?\]$/;
const GAP_ADJUSTMENT_EPSILON = 0.001;
const __adjustedGapElements = new WeakSet();

function hasArbitraryGapClass(el) {
  return Array.from(el.classList).some((cls) => ARBITRARY_GAP_CLASS_RE.test(cls));
}

function parseCssPixelValue(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function formatGapPx(value) {
  return `${Math.round(value * 1000) / 1000}px`;
}

function readComputedHorizontalGap(el, properties, fallbackMeasure) {
  const computedStyle = window.getComputedStyle(el);
  let gap = null;

  for (const property of properties) {
    const parsed = parseCssPixelValue(computedStyle[property]);
    if (parsed != null) {
      gap = parsed;
      break;
    }
  }

  if (gap == null && typeof fallbackMeasure === 'function') {
    const fallbackGap = fallbackMeasure();
    if (Number.isFinite(fallbackGap)) gap = fallbackGap;
  }

  return gap ?? 0;
}

function readIntendedGap(el, measureGap) {
  const currentInlineGap = el.style.gap;
  if (currentInlineGap) el.style.gap = '';

  try {
    return measureGap();
  } finally {
    if (currentInlineGap) {
      el.style.gap = currentInlineGap;
    }
  }
}

function clearAdjustedGap(el) {
  el.style.gap = '';
  __adjustedGapElements.delete(el);
}

function applyAdjustedGap(el, gap) {
  el.style.gap = formatGapPx(gap);
  __adjustedGapElements.add(el);
}

// Tolerance band around the user's intended gap. Small fractional snapping
// (well below 1 CSS pixel) is fine; multi-pixel deviations are not. We allow
// at most ±2px and usually at least ±1px so even tiny non-zero gaps (e.g.
// xsmall=5px) can be nudged to the nearest integer-column candidate. A zero
// gap is an explicit no-gap request, so it must stay at 0 unless already exact.
function gapAdjustmentTolerance(intendedGap) {
  if (Math.abs(intendedGap) <= GAP_ADJUSTMENT_EPSILON) return 0;
  return Math.min(2, Math.max(1, intendedGap * 0.25));
}

// Sweep every integer column width that fits in the container and return the
// one whose required gap is closest to the user's intent. Returns null if no
// candidate lands inside the tolerance band. In that case we leave the gap
// alone, since a small fractional column is a smaller artefact than silently
// halving the user's gap.
function findClosestIntegerColumnGap(containerWidth, columnCount, intendedGap) {
  if (columnCount < 2 || containerWidth <= 0) return null;

  const maxColumnWidth = Math.floor(containerWidth / columnCount);
  let bestGap = null;
  let bestColumnWidth = null;
  let minDifference = Infinity;

  for (let w = 1; w <= maxColumnWidth; w++) {
    const requiredGap = (containerWidth - w * columnCount) / (columnCount - 1);
    if (requiredGap < 0) continue;
    const diff = Math.abs(intendedGap - requiredGap);
    if (diff < minDifference) {
      minDifference = diff;
      bestGap = requiredGap;
      bestColumnWidth = w;
    }
  }

  if (bestGap == null) return null;
  const tolerance = gapAdjustmentTolerance(intendedGap);
  if (minDifference > tolerance) return null;
  return { bestGap, bestColumnWidth, difference: minDifference };
}

function adjustGapForIntegerColumns(el, columnCount, label, measureGap) {
  if (columnCount < 2) {
    if (__adjustedGapElements.has(el)) clearAdjustedGap(el);
    return;
  }

  if (hasArbitraryGapClass(el)) {
    if (__adjustedGapElements.has(el)) clearAdjustedGap(el);
    debugLog(`${label} gap adjustment: skipped (arbitrary gap--[Npx] class)`);
    return;
  }

  const computedStyle = window.getComputedStyle(el);
  const horizontalInset = [
    computedStyle.paddingLeft,
    computedStyle.paddingRight,
    computedStyle.borderLeftWidth,
    computedStyle.borderRightWidth
  ].reduce((total, value) => total + (parseCssPixelValue(value) || 0), 0);
  const containerWidth = el.offsetWidth - horizontalInset;
  if (containerWidth <= 0) {
    if (__adjustedGapElements.has(el)) clearAdjustedGap(el);
    return;
  }

  const intendedGap = readIntendedGap(el, measureGap);
  if (!Number.isFinite(intendedGap)) return;

  debugLog(`${label} gap adjustment: Container ${containerWidth}px, ${columnCount} columns, intended gap ${intendedGap}px`);

  // Calculate total gap space and space available for columns
  const totalGapSpace = intendedGap * (columnCount - 1);
  const availableSpace = containerWidth - totalGapSpace;
  const columnWidth = availableSpace / columnCount;

  // Check if columns would have fractional widths (with tolerance for floating point)
  const isInteger = Math.abs(columnWidth - Math.round(columnWidth)) < GAP_ADJUSTMENT_EPSILON;
  if (isInteger) {
    clearAdjustedGap(el);
    return;
  }

  const candidate = findClosestIntegerColumnGap(containerWidth, columnCount, intendedGap);
  if (!candidate) {
    clearAdjustedGap(el);
    debugLog(`${label} gap adjustment: skipped (no candidate within tolerance of ${intendedGap}px)`);
    return;
  }
  if (Math.abs(candidate.bestGap - intendedGap) <= GAP_ADJUSTMENT_EPSILON) {
    clearAdjustedGap(el);
    return;
  }

  applyAdjustedGap(el, candidate.bestGap);
  debugLog(`Adjusted ${label.toLowerCase()} gap from ${intendedGap}px to ${candidate.bestGap}px, resulting in ${candidate.bestColumnWidth}px columns`);
}

/**
 * Adjust the gap of grid elements to ensure all columns have integer widths.
 * This adjustment helps maintain pixel-perfect layouts by calculating the optimal
 * gap value that results in whole pixel column widths.
 */
function adjustGridGaps() {
  const gridElements = document.querySelectorAll('.grid');

  gridElements.forEach(grid => {
    // Skip grids that have explicitly disabled gap adjustment
    if (grid.getAttribute('data-adjust-grid-gaps') === 'false') {
      return;
    }

    let columnCount = 0;
    
    // Check if the grid has a .grid--cols-x class
    const colsClass = Array.from(grid.classList).find(cls => cls.startsWith('grid--cols-'));
    
    if (colsClass) {
      // Extract column count from class name (e.g., 'grid--cols-3' -> 3)
      columnCount = parseInt(colsClass.split('-').pop(), 10) || 0;
    } else {
      // For grids with .col--span-x children, count actual columns
      const columns = grid.querySelectorAll('[class*="col--span-"]');
      if (columns.length > 0) {
        // Get computed styles to check grid-template-columns
        const computedStyle = window.getComputedStyle(grid);
        const templateColumns = computedStyle.gridTemplateColumns;
        
        // Count columns from grid-template-columns (handles auto-generated columns)
        if (templateColumns && templateColumns !== 'none') {
          columnCount = templateColumns.split(' ').length;
        } else {
          // Fallback: use number of direct children as column count
          columnCount = columns.length;
        }
      }
    }
    
    adjustGapForIntegerColumns(grid, columnCount, 'Grid', () => (
      readComputedHorizontalGap(grid, ['columnGap', 'gap', 'gridGap'], () => {
        const children = grid.children;
        if (children.length < 2) return 0;

        const firstChild = children[0].getBoundingClientRect();
        const secondChild = children[1].getBoundingClientRect();
        // Check if they're in the same row (horizontal neighbors)
        if (Math.abs(firstChild.top - secondChild.top) < 1) {
          return secondChild.left - firstChild.right;
        }
        return 0;
      })
    ));
  });
}

/**
 * Adjust the gap of column elements to ensure all columns have integer widths.
 * This adjustment helps maintain pixel-perfect layouts by calculating the optimal
 * gap value that results in whole pixel column widths.
 */
function adjustColumnGapsFor(containers) {
  containers.forEach(container => {
    // Skip columns that have explicitly disabled gap adjustment
    if (container.getAttribute('data-adjust-column-gaps') === 'false') {
      return;
    }

    const columns = container.querySelectorAll(':scope > .column');
    const columnCount = columns.length;

    adjustGapForIntegerColumns(container, columnCount, 'Column', () => (
      readComputedHorizontalGap(container, ['columnGap', 'gap'], () => {
        if (columns.length < 2) return 0;

        const firstColumn = columns[0].getBoundingClientRect();
        const secondColumn = columns[1].getBoundingClientRect();
        if (Math.abs(firstColumn.top - secondColumn.top) >= 1) return 0;

        const leftColumn = firstColumn.left <= secondColumn.left ? firstColumn : secondColumn;
        const rightColumn = leftColumn === firstColumn ? secondColumn : firstColumn;
        return rightColumn.left - leftColumn.right;
      })
    ));
  });
}

function adjustColumnGaps() {
  const columnContainers = document.querySelectorAll('.columns');
  adjustColumnGapsFor(Array.from(columnContainers));
}

function parseLocalizedNumber(rawValue, locale) {
  let normalized = String(rawValue || '').trim();
  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const group = parts.find((part) => part.type === 'group')?.value;
    const decimal = parts.find((part) => part.type === 'decimal')?.value;
    if (group) normalized = normalized.split(group).join('');
    normalized = normalized.replace(/[\s\u00a0\u202f]/g, '');
    if (decimal && decimal !== '.') normalized = normalized.split(decimal).join('.');
  } catch (_) {
    // Fall back to the legacy dot-decimal parser for an invalid locale.
  }
  return Number.parseFloat(normalized.replace(/[^0-9+.-]/g, ''));
}

/**
 * Format numeric values with dynamic precision based on available space
 */
function formatValue() {
  document.querySelectorAll('[data-value-type="number"], [data-value-format="true"]').forEach(element => {
    element.style.whiteSpace = 'nowrap';
    const container = element.parentElement;
    if (!container) return;

    // Reset any inline font-size a prior pass left behind so the width
    // measurements below reflect the CSS-intended size. Otherwise a value
    // shrunk on a narrow pass measures small here and the chosen format never
    // recovers when the container widens.
    element.style.fontSize = '';

    // Store raw value
    if (!element.dataset.rawValue) {
      element.dataset.rawValue = element.textContent;
    }

    const rawValue = element.dataset.rawValue;
    // Extract currency symbol without the minus sign
    const currencySymbol = (rawValue.match(/[\$€£¥₹₽₪₩₫₴₱₿]/) || [''])[0];
    const locale = element.dataset.valueLocale || 'en-US';
    const number = parseLocalizedNumber(rawValue, locale);

    if (isNaN(number)) return;

    // The sign comes from the number that was actually parsed, never from a
    // substring test. A hyphen anywhere in the raw value is not a minus sign:
    // dates (2024-01-15), ranges (12-34) and part numbers all carry one, and
    // Number.parseFloat honors only a leading sign. Reading the parsed number
    // also keeps the prefix and the magnitude below from ever disagreeing.
    const isNegative = number < 0;
    const prefix = isNegative ? '-' + currencySymbol : currencySymbol;

    element.textContent = findBestFormat(Math.abs(number), container.clientWidth, element, prefix, locale);

    if (element.getAttribute('data-value-fit') === 'true' || element.getAttribute('data-fit-value') === 'true') {
      fitTextToContainer(element);
    }
  });
}

/**
 * Find the best number format that fits the available space
 * Returns the formatted string that best fits
 */
function findBestFormat(number, availableWidth, element, prefix = '', locale = 'en-US') {
  const doesFit = (text) => {
    element.textContent = text;
    return element.scrollWidth <= availableWidth;
  };

  const originalText = element.textContent;
  try {
    // Try full number first
    const fullNumber = prefix + number.toLocaleString(locale);
    if (doesFit(fullNumber)) return fullNumber;

    // Try abbreviated formats
    const formats = [
      [1000000000, 'B'],
      [1000000, 'M'],
      [1000, 'k']
    ];

    for (const [divisor, suffix] of formats) {
      if (Math.abs(number) >= divisor) { // Use Math.abs to handle negative numbers
        const value = number / divisor;
        // Try different precisions
        for (let precision = 2; precision >= 0; precision--) {
          const formatted = `${prefix}${Math.abs(value).toLocaleString(locale, {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
          })}${suffix}`;
          if (doesFit(formatted)) return formatted;
        }
        return `${prefix}${Math.round(Math.abs(value)).toLocaleString(locale)}${suffix}`;
      }
    }

    return prefix + number.toLocaleString(locale);
  } finally {
    element.textContent = originalText;
  }
}

/**
 * Adjust font size to fit text within its container without overflow.
 * Maintains readability by stopping at 8px minimum font size.
 */
function fitTextToContainer(element) {
  const container = element.parentElement;
  // Reset any inline size from a prior pass so we re-measure from the
  // CSS-intended size. Reading the current computed size and only decrementing
  // would let a value shrunk on a narrow pass ratchet down and never grow back
  // when the container widens.
  element.style.fontSize = '';
  let fontSize = parseInt(window.getComputedStyle(element).fontSize);

  element.style.whiteSpace = 'nowrap';

  while (fontSize > 8) {
    const maxWidth = container.clientWidth;
    if (element.scrollWidth <= maxWidth + fitValueLayoutSlackPx()) break;
    fontSize--;
    element.style.fontSize = `${fontSize}px`;
  }
}

// Private store for the pristine state of each processed pixel-perfect element
// (not in DOM). Mirrors __CONTENT_LIMITER_ORIGINAL_HTML__.
const __PIXEL_PERFECT_ORIGINAL__ = new WeakMap();

// Undo the state a prior pixel-perfect pass left on this element so the pass
// below re-measures pristine content. Every width this engine writes is frozen
// to the layout it measured, so without this reset the pass is one-shot: a
// device, orientation or scale change re-runs terminalize, the element is
// filtered out as already processed, and its line spans keep the widths of the
// old layout. Mirrors resetContentLimit.
function resetPixelPerfect(el) {
  if (!el || !el.hasAttribute('data-pixel-processed')) return;
  el.removeAttribute('data-pixel-processed');

  // Marked but never rewritten (container, empty or unmatched-text paths).
  const original = __PIXEL_PERFECT_ORIGINAL__.get(el);
  if (!original) return;
  __PIXEL_PERFECT_ORIGINAL__.delete(el);

  // Restore the markup only while the element still holds this engine's own
  // line spans. Another engine (clamp, content limiter) may have rewritten the
  // text since; in that case keep its content and just re-measure it.
  try {
    if (typeof original.html === 'string'
      && el.textContent === original.text
      && el.innerHTML !== original.html) {
      el.innerHTML = original.html;
    }
  } catch (_) {}

  // Restore the inline width and alignment the element carried before the
  // pass, so a re-measure starts from the CSS-intended box.
  el.style.width = original.width || '';
  el.style.textAlign = original.textAlign || '';
}

/**
 * Adjust text elements to ensure pixel-perfect rendering by wrapping lines
 * in spans and ensuring even widths.
 */
// Pixel-perfect targets: every [data-pixel-perfect] inside a screen whose rail paints
// at depth 1 or 2. The mode class publishes that depth as --framework-bit-depth
// (_screen-paint-depth-vars in base/_screen-mode-vars.scss) and a screen with no mode
// class publishes 1, so reading the published value keeps the mode registry in CSS:
// naming screen--1bit and screen--2bit here skipped bare screens the CSS calls 1-bit
// and would skip any depth-1 or depth-2 mode added later.
function pixelPerfectTargets() {
  const depths = new Map();

  return Array.from(document.querySelectorAll('.screen [data-pixel-perfect="true"]')).filter((el) => {
    const screen = el.closest('.screen');
    if (!screen) return false;
    if (!depths.has(screen)) {
      const published = parseInt(getComputedStyle(screen).getPropertyValue('--framework-bit-depth'), 10);
      depths.set(screen, published > 0 ? published : 1);
    }
    return depths.get(screen) <= 2;
  });
}

function pixelPerfectFonts() {
  // Undo the previous pass before anything is measured. This runs ahead of the
  // bit-depth guard on purpose: switching a screen into a mode this engine must
  // not touch has to drop the widths it left behind, not freeze them.
  document.querySelectorAll('[data-pixel-processed]').forEach(resetPixelPerfect);

  // Skip all processing when the 4-bit or higher screen mode is active
  const __ctx = getScreenContext();
  if (__ctx && __ctx.bitDepth >= 4) return 0;

  // Track total number of lines wrapped across all elements
  let __pixelPerfectLinesProcessed = 0;

  // First pass: mark all elements with data-pixel-perfect="true"
  // to exclude their parent elements from processing
  const pixelPerfectElements = pixelPerfectTargets();
  pixelPerfectElements.forEach(el => {

    // Apply width constraints and word-breaking to all pixel-perfect elements
    // to ensure they don't overflow their containers
    el.style.overflowWrap = 'break-word';
    el.style.wordBreak = 'break-word';

    let parent = el.parentElement;
    while (parent) {
      parent.setAttribute('data-has-pixel-perfect-children', 'true');
      parent = parent.parentElement;
    }
  });

  // Second pass: the same targets, minus anything a nested call already handled
  const allTargets = pixelPerfectElements.filter(el => !el.hasAttribute('data-pixel-processed'));

  

  const processElements = (elements) => elements.forEach(element => {
    if (!element.textContent.trim()) return;
    
    // Targets are already limited to 1-bit and 2-bit screens

    try {
      // Skip if this element contains other pixel-perfect elements
      // This double-check ensures we're not processing containers
      const hasPixelPerfectChildren = element.querySelector('[data-pixel-perfect="true"]');
      if (hasPixelPerfectChildren) {
        element.setAttribute('data-pixel-processed', 'true');
        return;
      }
      
      // Check if the element is center-aligned before modifying it
      const style = window.getComputedStyle(element);
      const isCentered = style.textAlign === 'center';
      const originalText = element.textContent;
      const originalHTML = element.innerHTML;
      
      // Check parent element width to determine if we need even or odd widths
      const parentElement = element.parentElement;
      const parentWidth = parentElement ? parentElement.offsetWidth : 0;
      const needsEvenWidth = parentWidth % 2 === 0;
      
      // Create an exact clone of the element to measure line breaks
      const clone = element.cloneNode(false); // Shallow clone to avoid inheriting nested structure
      clone.style.cssText = element.style.cssText; // Copy only inline styles
      clone.style.position = 'absolute';
      clone.style.visibility = 'hidden';
      clone.style.width = getComputedStyle(element).width;
      clone.style.height = 'auto';
      clone.style.whiteSpace = 'pre-wrap';
      clone.textContent = originalText; // Add just the text content, no HTML
      
      // Ensure font properties are preserved exactly
      ['font', 'fontSize', 'fontFamily', 'lineHeight', 'letterSpacing', 'fontWeight'].forEach(prop => {
        clone.style[prop] = getComputedStyle(element)[prop];
      });
      
      document.body.appendChild(clone);
      
      // Helper function to get the client rect for a range of text
      function getRectForRange(node, start, end) {
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, end);
        return range.getBoundingClientRect();
      }
      
      // Find line breaks by checking height changes
      const textNode = clone.firstChild;
      if (!textNode) {
        document.body.removeChild(clone);
        element.setAttribute('data-pixel-processed', 'true');
        return;
      }
      
      const lines = [];
      let lineStart = 0;
      let prevBottom = -1;
      
      // We'll check every 5 characters for efficiency, then refine
      for (let i = 1; i <= originalText.length; i += 5) {
        const checkPos = Math.min(i, originalText.length);
        const rect = getRectForRange(textNode, lineStart, checkPos);
        
        // If this rect extends below the previous line's bottom, we've found a line break
        if (prevBottom !== -1 && rect.bottom > prevBottom + 2) {
          // Find the exact character where the line breaks
          let breakPos = lineStart + 1;
          for (let j = lineStart + 1; j <= checkPos; j++) {
            const testRect = getRectForRange(textNode, lineStart, j);
            if (testRect.bottom > prevBottom + 2) {
              breakPos = j - 1; // Last char before the break
              break;
            }
          }
          
          // Don't break words - find the last space before this position
          let wordBreakPos = breakPos;
          while (wordBreakPos > lineStart && 
                 originalText[wordBreakPos] !== ' ' && 
                 originalText[wordBreakPos] !== '\n') {
            wordBreakPos--;
          }
          
          // If we found a space, break there; otherwise use character break
          const finalBreakPos = (wordBreakPos > lineStart && 
                                (originalText[wordBreakPos] === ' ' || 
                                 originalText[wordBreakPos] === '\n')) ? 
                              wordBreakPos + 1 : breakPos;
          
          // Add this line (preserving leading/trailing whitespace)
          const line = originalText.substring(lineStart, finalBreakPos);
          lines.push(line);
          
          // Start the next line
          lineStart = finalBreakPos;
          i = finalBreakPos + 1; // Skip ahead
        }
        
        // Update for next iteration
        prevBottom = rect.bottom;
      }
      
      // Add the final line
      if (lineStart < originalText.length) {
        const line = originalText.substring(lineStart);
        lines.push(line);
      }
      
      // Check if we detected lines properly
      const combinedText = lines.join('');
      const textMatches = combinedText.replace(/\s+/g, '') === originalText.replace(/\s+/g, '');
      
      // If text doesn't match or no lines were detected, don't modify the element
      if (!textMatches || lines.length === 0) {
        document.body.removeChild(clone);
        
        // Still mark as processed so we don't try again
        element.setAttribute('data-pixel-processed', 'true');
        return;
      }
      
      // Clean up the clone
      document.body.removeChild(clone);
      
      // Create a simple DIV for measuring text width
      const measureEl = document.createElement('div');
      measureEl.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;';
      // Copy full font-related properties to make measurement invariant across bit-depth modes
      // Use both shorthand and individual props to cover browser differences
      measureEl.style.font = style.font;
      measureEl.style.fontFamily = style.fontFamily;
      measureEl.style.fontSize = style.fontSize;
      measureEl.style.fontWeight = style.fontWeight;
      measureEl.style.lineHeight = (style.lineHeight === 'normal') ? 'normal' : style.lineHeight;
      measureEl.style.letterSpacing = style.letterSpacing;
      measureEl.style.fontVariationSettings = style.fontVariationSettings;
      measureEl.style.fontStretch = style.fontStretch;
      measureEl.style.fontKerning = style.fontKerning;
      measureEl.style.fontFeatureSettings = style.fontFeatureSettings;
      // Ensure no extra box model effects influence width
      measureEl.style.boxSizing = 'content-box';
      measureEl.style.padding = '0';
      measureEl.style.border = '0';
      measureEl.style.margin = '0';
      document.body.appendChild(measureEl);

      // Guard every path below so the hidden measurement div is removed whether
      // we succeed, hit the content-lost early return, or throw into the outer
      // catch. Without this finally, measureEl leaks on those failure paths.
      try {
      // Clear the original element but save the original HTML as fallback
      const originalElementHTML = element.outerHTML;
      // Stash the pristine state before the first destructive write so the next
      // pass can restore it and re-measure against the new layout.
      __PIXEL_PERFECT_ORIGINAL__.set(element, {
        html: originalHTML,
        text: originalText,
        width: element.style.width,
        textAlign: element.style.textAlign
      });
      element.innerHTML = '';
      
      // Create spans for each line
      lines.forEach(line => {
        const span = document.createElement('span');
        span.textContent = line; // Just set text, no HTML
        
        // DO NOT copy classes or other styles - they'll be inherited naturally
        // from the parent element, which is what we want
        
        // Measure the width to ensure even pixels
        measureEl.textContent = line;
        const rect = measureEl.getBoundingClientRect();
        let width = Math.ceil(rect.width);
        
        // Ensure width matches parent container rule (even or odd)
        if (needsEvenWidth) {
          // Make width even for even-width parents
          if (width % 2 !== 0) {
            width += 1;
          }
        } else {
          // Make width odd for odd-width parents
          if (width % 2 === 0) {
            width += 1;
          }
        }
        
        // Only add the specific styles needed for pixel-perfect rendering
        span.style.width = `${width}px`;
        span.style.display = 'block';
        
        // Center the span if needed
        if (isCentered) {
          span.style.marginLeft = 'auto';
          span.style.marginRight = 'auto';
        }
        
        element.appendChild(span);
      });
      // Count lines wrapped for this element
      __pixelPerfectLinesProcessed += lines.length;
      
      // Verify that content wasn't lost
      if (element.textContent.trim().length === 0 && originalText.trim().length > 0) {
        element.outerHTML = originalElementHTML; // Restore the entire original element
        return;
      }
      } finally {
        // Clean up: always remove the hidden measurement element.
        measureEl.remove();
      }

      // Set the overall element width to match parent's even/odd rule
      const elementRect = element.getBoundingClientRect();
      let elementWidth = Math.ceil(elementRect.width);
      if (needsEvenWidth) {
        // Make element width even for even-width parents
        if (elementWidth % 2 !== 0) {
          elementWidth += 1;
        }
      } else {
        // Make element width odd for odd-width parents
        if (elementWidth % 2 === 0) {
          elementWidth += 1;
        }
      }
      
      element.style.width = `${elementWidth}px`;
      
      // Preserve original text alignment
      if (isCentered) {
        element.style.textAlign = 'center';
      }
      
      // Mark as processed after successful processing
      element.setAttribute('data-pixel-processed', 'true');
    } catch (error) {
      console.error('Error in pixel perfect processing:', error, element);
      // Don't mark as processed so we can try again
    }
  });

  processElements(allTargets);
  
  // Clean up the temporary attributes we added
  document.querySelectorAll('[data-has-pixel-perfect-children]').forEach(el => {
    el.removeAttribute('data-has-pixel-perfect-children');
  });

  return __pixelPerfectLinesProcessed;
}

/**
 * Automatically resize text to fit within its container by gradually reducing font size
 * and increasing font weight to maintain readability and visual impact.
 * Targets elements with data-fit-value="true".
 * 
 * @param {number} minFontSize - The minimum font size in pixels. Defaults to 8.
 * @param {number} step - The amount to decrease the font size by each iteration. Defaults to 1.
 */
function fitValue(minFontSize = 8, step = 1) {
  // Update selector to look for both old and new attributes
  const elements = document.querySelectorAll('[data-fit-value="true"], [data-value-fit="true"]');
  
  elements.forEach(element => {
    const container = element.parentElement;
    if (!container) return;

    const explicitMaxHeight = element.dataset.valueFitMaxHeight
      ? parseFloat(element.dataset.valueFitMaxHeight)
      : null;
    const hasExplicitMaxHeight = explicitMaxHeight != null && Number.isFinite(explicitMaxHeight);

    element.style.fontSize = '';
    element.style.fontWeight = '';
    element.style.lineHeight = '';
    // Clear the variable-font weight applyStyles() writes when shrinking, so a
    // value that fits at full size on a later run is not stuck at a heavy wght.
    element.style.fontVariationSettings = '';

    const computed = window.getComputedStyle(element);
    let fontSize = parseFloat(computed.fontSize);

    const initialLineHeight = (() => {
      const lh = computed.lineHeight;
      return lh && lh !== 'normal' ? parseFloat(lh) : fontSize * 1.2;
    })();

    const getMaxHeight = () => {
      if (hasExplicitMaxHeight) return explicitMaxHeight;
      if (element.style.lineHeight) return parseFloat(element.style.lineHeight);
      return initialLineHeight;
    };

    // Without nowrap, wrapped lines make rect height >> single-line budget and we shrink to minFontSize.
    // When a max height is set (framework "text fitting"), allow normal wrapping.
    if (!hasExplicitMaxHeight) {
      element.style.whiteSpace = 'nowrap';
    }

    let containerRect = container.getBoundingClientRect();
    if (containerRect.width < 4 || containerRect.height < 4) {
      return;
    }

    const originalFontSize = fontSize;
    const originalWeight = parseFloat(computed.fontWeight) || 400;
    const originalLineHeightRatio = initialLineHeight / fontSize;
    const targetWeight = 700;
    const targetLineHeightRatio = 1.2;

    const getStylesForSize = (size) => {
      const t = Math.max(0, Math.min(1,
        (originalFontSize - size) / (originalFontSize - minFontSize)));
      const tEased = t * t;
      const weight = Math.round(originalWeight + tEased * (targetWeight - originalWeight));
      const ratio = originalLineHeightRatio + t * (targetLineHeightRatio - originalLineHeightRatio);
      const lineHeight = Math.round(size * ratio);
      return { weight, lineHeight };
    };

    const applyStyles = (size) => {
      const { weight, lineHeight } = getStylesForSize(size);
      element.style.fontSize = `${size}px`;
      element.style.fontWeight = weight;
      element.style.fontVariationSettings = `'wght' ${weight}`;
      element.style.lineHeight = `${lineHeight}px`;
    };

    const slack = fitValueLayoutSlackPx();

    // Without data-value-fit-max-height, framework value-fit is width-only (see framework_v2/fit_value).
    // Height checks vs line-height falsely "overflow" from glyph metrics and shrink to minFontSize.
    const overflows = (r, cr) => {
      if (r.width > cr.width + slack) return true;
      if (!hasExplicitMaxHeight) return false;
      return r.height > getMaxHeight() + slack;
    };

    // Coarse pass: reduce quickly in larger steps to avoid many layout reads
    let elementRect = element.getBoundingClientRect();
    const coarseStep = Math.max(step, 2);
    containerRect = container.getBoundingClientRect();
    while (overflows(elementRect, containerRect) && fontSize - coarseStep >= minFontSize) {
      fontSize -= coarseStep;
      applyStyles(fontSize);
      containerRect = container.getBoundingClientRect();
      elementRect = element.getBoundingClientRect();
    }

    // Fine pass: binary search within a small range to converge with few measures
    let low = minFontSize;
    let high = fontSize;
    const fits = () => {
      const cr = container.getBoundingClientRect();
      const r = element.getBoundingClientRect();
      return !overflows(r, cr);
    };
    if (!fits()) {
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        applyStyles(mid);
        if (fits()) {
          fontSize = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      // The final probe may have applied a non-fitting (too-large) size, so
      // re-apply the best fitting size tracked in `fontSize`.
      applyStyles(fontSize);
    }

    // fitValue adjusted
  });
}

/**
 * Content limitation functionality
 * Limits content height based on view type and applies appropriate classes
 */

// Private store for original HTML snapshots per content element (not in DOM)
const __CONTENT_LIMITER_ORIGINAL_HTML__ = new WeakMap();

// Removed legacy view-based default thresholds. The limiter now uses
// explicit data-content-max-height or auto-measures available height.

// Compute available height using the current view's direct `.layout` as the sole budget source.
// This avoids accidentally selecting an outer layout and guarantees the threshold <= layout height.
// When the element is inside a flex column (e.g. .richtext), use sibling heights + gap instead of
// position so we don't rely on getBoundingClientRect() which can be wrong before layout settles.
function computeAvailableHeight(element) {
  if (!element) return 0;
  // Prefer the layout that belongs to the same view as the element
  let layout = null;
  const view = element.closest('.view');
  if (view) {
    // Find the direct child .layout of the view first
    const direct = Array.from(view.children || []).find((ch) => ch && ch.classList && ch.classList.contains('layout'));
    layout = direct || view.querySelector('.layout');
  }
  // Fallback to nearest layout if no view-bound layout found
  if (!layout) layout = element.closest('.layout');
  if (!layout) return 0;

  const layoutRect = layout.getBoundingClientRect();
  const cs = window.getComputedStyle(layout);
  const paddingTop = parseFloat(cs.paddingTop) || 0;
  const paddingBottom = parseFloat(cs.paddingBottom) || 0;

  // Establish content box metrics for the layout
  const client = Math.floor(layout.clientHeight || 0);
  const fallbackHeight = Math.floor(layoutRect.height || 0);
  // Content height excludes paddings on both sides
  const contentHeight = client
    ? Math.max(0, client - Math.floor(paddingTop) - Math.floor(paddingBottom))
    : Math.max(0, fallbackHeight - Math.floor(paddingTop) - Math.floor(paddingBottom));

  const parent = element.parentElement;
  const parentCs = parent ? window.getComputedStyle(parent) : null;
  const isFlexColumn = parentCs && parentCs.display === 'flex' && parentCs.flexDirection === 'column';

  if (isFlexColumn && parent) {
    // Sibling-based budget: sum preceding siblings' heights + gap(s) so we don't rely on element position
    let usedByPreceding = 0;
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(element);
    if (index > 0) {
      for (let i = 0; i < index; i += 1) {
        const sibling = siblings[i];
        if (sibling && sibling.nodeType === 1) {
          usedByPreceding += Math.ceil((sibling.getBoundingClientRect().height || sibling.offsetHeight) || 0);
        }
      }
      // Parse gap (row-gap for column; first value if "row column" or single value)
      const gapStr = (parentCs.gap || parentCs.rowGap || '0').trim().split(/\s+/)[0] || '0';
      const gapPx = Math.max(0, parseFloat(gapStr) || 0);
      const numGaps = index; // gaps before element: between sibling 0 and 1, 1 and 2, ... so index gaps
      usedByPreceding += gapPx * numGaps;
    }
    let available = Math.max(0, Math.floor(contentHeight - usedByPreceding));
    if (!Number.isFinite(available)) return 0;
    available = Math.min(available, contentHeight);
    return available;
  }

  // Position-based: remaining space below element top in layout content box
  const elRect = element.getBoundingClientRect();
  const contentTopY = Math.floor(layoutRect.top + Math.floor(paddingTop));
  const offsetFromContentTop = Math.max(0, Math.floor(elRect.top - contentTopY));
  let available = Math.max(0, Math.floor(contentHeight - offsetFromContentTop));

  if (!Number.isFinite(available)) return 0;
  available = Math.min(available, contentHeight);
  return available;
}

// Determine the height threshold based on the view type or data attribute
function getHeightThreshold(element) {
  const dataThreshold = element.dataset.contentMaxHeight;
  if (dataThreshold) {
    return parseInt(dataThreshold, 10);
  }
  // Auto: if no explicit max height, use available space in container
  const auto = computeAvailableHeight(element);
  if (auto > 0) return auto;
  // If we cannot determine available height, do not enforce a threshold
  return 0;
}

// Add appropriate class and inline style based on element height
function addClassBasedOnHeight(element, height, threshold) {
  if (!Number.isFinite(threshold) || threshold <= 0) return;
  if (height <= threshold) return;

  // 1) Apply small text styling and cap height
  element.classList.add('content--small');
  element.style.maxHeight = `${threshold}px`;
  // Ensure extra content doesn't spill visually; clamping will add ellipsis, this is a safety net
  element.style.overflow = 'hidden';
  debugLog(`Content limiter: content--small + max-height ${threshold}px applied.`);

  // 2) Restore original HTML structure to avoid flattening and clear prior limiter state
  try {
    if (!__CONTENT_LIMITER_ORIGINAL_HTML__.has(element)) {
      __CONTENT_LIMITER_ORIGINAL_HTML__.set(element, element.innerHTML);
    } else {
      const original = __CONTENT_LIMITER_ORIGINAL_HTML__.get(element);
      if (typeof original === 'string' && original.length > 0 && element.innerHTML !== original) {
        element.innerHTML = original;
      }
    }
  } catch (_) {}
  try {
    const previouslyHidden = element.querySelectorAll(':scope > [data-hidden-by-content-limiter="1"]');
    previouslyHidden.forEach((el) => { el.style.display = ''; el.removeAttribute('data-hidden-by-content-limiter'); });
  } catch (_) {}

  // 3) Determine which direct children fit, then clamp only the first that does not fully fit
  const children = Array.from(element.children).filter((el) => el && el.nodeType === 1);
  if (children.length === 0) {
    // Fallback: text-only content (no block children). Treat element itself as clamp target.
    const targetCs = window.getComputedStyle(element);
    const paddingTop = parseFloat(targetCs.paddingTop) || 0;
    const paddingBottom = parseFloat(targetCs.paddingBottom) || 0;
    const usablePx = Math.max(0, Math.floor(threshold - paddingTop - paddingBottom));
    if (!Number.isFinite(usablePx) || usablePx <= 0) return;
    let lineHeightPx = parseFloat(targetCs.lineHeight);
    if (!Number.isFinite(lineHeightPx) || targetCs.lineHeight === 'normal') {
      const fontSize = parseFloat(targetCs.fontSize) || 16;
      lineHeightPx = Math.round(fontSize * 1.2);
    }
    const maxLines = Math.max(1, Math.floor(usablePx / Math.max(1, lineHeightPx)));
    element.setAttribute('data-clamp', String(maxLines));
    const allowedPx = Math.max(0, Math.floor(usablePx + paddingTop + paddingBottom));
    element.setAttribute('data-clamp-max-height-px', String(allowedPx));
    element.style.whiteSpace = 'pre-line';
    element.style.display = 'block';
    try { clampElementToLines(element, maxLines); } catch (_) {}
    debugLog(`Content limiter: clamped text-only content to ${maxLines} lines (usable=${usablePx}px, line=${lineHeightPx}px).`);
    return;
  }

  const containerRect = element.getBoundingClientRect();
  let lastFullEnd = 0; // pixels from container top to bottom of last fully fitting child
  let partialIndex = -1;
  const blocks = children.map((child) => {
    const rect = child.getBoundingClientRect();
    const cs = window.getComputedStyle(child);
    const start = Math.ceil(rect.top - containerRect.top);   // includes collapsed margins and gaps
    const end = Math.ceil(rect.bottom - containerRect.top);  // actual bottom position relative to container top
    return {
      child,
      rect,
      cs,
      start,
      end,
      paddingTop: parseFloat(cs.paddingTop) || 0,
      paddingBottom: parseFloat(cs.paddingBottom) || 0
    };
  });

  for (let i = 0; i < blocks.length; i += 1) {
    const blockEnd = blocks[i].end; // real used height up to this child
    if (blockEnd <= threshold) {
      lastFullEnd = blockEnd;
    } else {
      partialIndex = i;
      break;
    }
  }

  if (partialIndex === -1) {
    // Everything fits after making text small; nothing more to do
    return;
  }

  // Hide everything after the partially fitting child
  for (let j = partialIndex + 1; j < blocks.length; j += 1) {
    blocks[j].child.setAttribute('data-hidden-by-content-limiter', '1');
    blocks[j].child.style.display = 'none';
  }

  // Clamp the partially fitting direct child to the remaining available space
  const targetBlock = blocks[partialIndex];
  const target = targetBlock.child;
  // Compute remaining space from the target's own top to the threshold
  const targetStart = Math.max(0, Math.floor(targetBlock.start));
  const remainingPx = Math.max(0, Math.floor(threshold - targetStart));
  const targetCs = window.getComputedStyle(target);
  const paddingTop = parseFloat(targetCs.paddingTop) || 0;
  const paddingBottom = parseFloat(targetCs.paddingBottom) || 0;
  const usablePx = Math.max(0, remainingPx - paddingTop - paddingBottom);

  // If there's no usable space, hide the target entirely and return
  if (!Number.isFinite(usablePx) || usablePx <= 0) {
    target.setAttribute('data-hidden-by-content-limiter', '1');
    target.style.display = 'none';
    return;
  }

  // Use computed line-height to avoid padding double-count and ensure tight packing
  let lineHeightPx = parseFloat(targetCs.lineHeight);
  if (!Number.isFinite(lineHeightPx) || targetCs.lineHeight === 'normal') {
    const fontSize = parseFloat(targetCs.fontSize) || 16;
    lineHeightPx = Math.round(fontSize * 1.2);
  }
  const maxLines = Math.floor(usablePx / Math.max(1, lineHeightPx));
  // Less than one full line fits: forcing a 1-line clamp would leave a sliver
  // that the max-height overflow cap slices mid-glyph. Hide the child instead.
  if (maxLines < 1) {
    target.setAttribute('data-hidden-by-content-limiter', '1');
    target.style.display = 'none';
    return;
  }
  target.setAttribute('data-clamp', String(maxLines));
  // Provide an exact pixel cap to the clamp engine to avoid line-height mismatches
  const allowedPx = Math.max(0, Math.floor(usablePx + paddingTop + paddingBottom));
  target.setAttribute('data-clamp-max-height-px', String(allowedPx));
  // Ensure the target respects line breaks and won't visually overflow while we clamp
  target.style.whiteSpace = 'pre-line';
  target.style.overflow = 'hidden';
  target.style.display = 'block';
  try { clampElementToLines(target, maxLines); } catch (_) {}
  debugLog(`Content limiter: clamped child to ${maxLines} lines (usable=${usablePx}px, line=${lineHeightPx}px).`);
}

// Undo any state a prior content-limiter run left on this element so the pass
// below re-measures pristine, full-height content. Without this the limiter is
// add-only: it measures an already-limited subtree (children hidden, text
// clamped, content--small applied), reads a height under threshold, and returns
// early before restoring, so it only ever tightens and never reveals when space
// grows. Mirrors the reset discipline the clamp and fitValue engines use.
function resetContentLimit(el) {
  const wasLimited = el.classList.contains('content--small')
    || __CONTENT_LIMITER_ORIGINAL_HTML__.has(el)
    || el.hasAttribute('data-clamp-max-height-px')
    || el.querySelector(':scope > [data-hidden-by-content-limiter="1"]');
  if (!wasLimited) return;

  el.classList.remove('content--small');
  el.style.maxHeight = '';
  el.style.overflow = '';

  // Restore the pristine content stashed on the first limiting pass. This
  // reinstates hidden children and undoes any child clamp in one shot.
  try {
    const original = __CONTENT_LIMITER_ORIGINAL_HTML__.get(el);
    if (typeof original === 'string' && original.length > 0 && el.innerHTML !== original) {
      el.innerHTML = original;
    }
  } catch (_) {}

  // Defensive: unhide any children the limiter hid (covers a missing stash).
  try {
    el.querySelectorAll(':scope > [data-hidden-by-content-limiter="1"]').forEach((child) => {
      child.style.display = '';
      child.removeAttribute('data-hidden-by-content-limiter');
    });
  } catch (_) {}

  // The text-only path clamps the element itself and marks it with the
  // limiter-exclusive data-clamp-max-height-px. Strip that clamp so a later,
  // roomier run can grow the text back; the main clamp pass would otherwise
  // keep re-truncating it to the old line count every run.
  if (el.hasAttribute('data-clamp-max-height-px')) {
    el.removeAttribute('data-clamp');
    el.removeAttribute('data-clamp-max-height-px');
    el.removeAttribute('data-clamp-original');
    el.style.whiteSpace = '';
    el.style.display = '';
  }
}

// Apply content limits to all content elements
function applyContentLimits() {
  const targets = Array.from(document.querySelectorAll('[data-content-limiter="true"]'));
  // Reset every target to its pristine state before any measurement so budgets
  // (including sibling-based ones in flex columns) are computed against
  // full-height content, not the previous run's already-limited layout.
  targets.forEach((el) => resetContentLimit(el));
  const budgetMs = 12;
  let queue = [...targets];
  const processOne = (el) => {
    const prevOverflow = el.style.overflow;
    el.style.overflow = 'hidden';
    const height = el.scrollHeight;
    el.style.overflow = prevOverflow;
    const threshold = getHeightThreshold(el);
    addClassBasedOnHeight(el, height, threshold);
  };
  return new Promise((resolve) => {
    const step = () => {
      const start = performance.now();
      while (queue.length && (performance.now() - start) < budgetMs) {
        processOne(queue.shift());
      }
      if (queue.length) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
}

/**
 * Wrapping all transformers into single function so they can be re-binded from
 * other locations in application, for example the live preview markup editor
 */
// Wait for images to load/settle so layout calculations are accurate
async function waitForImagesToSettle(root = document, opts = {}) {
  const maxWaitMs = Number.isFinite(opts.maxWaitMs) ? opts.maxWaitMs : 1500;
  const settleDelayMs = Number.isFinite(opts.settleDelayMs) ? opts.settleDelayMs : 40;
  const imgs = Array.from((root || document).querySelectorAll('img'));
  const pending = imgs.filter((img) => !(img.complete && img.naturalWidth > 0));
  const waitedCount = pending.length;

  if (waitedCount === 0) {
    // Ensure any synchronous layout work after cached images has completed
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return { waitedCount: 0, timedOut: false };
  }

  const perImage = (img) => new Promise((resolve) => {
    if (img.complete && img.naturalWidth > 0) return resolve();
    let done = false;
    const cleanup = () => {
      if (done) return; done = true;
      img.removeEventListener('load', onDone, true);
      img.removeEventListener('error', onDone, true);
    };
    const onDone = () => { cleanup(); resolve(); };
    try {
      if (typeof img.decode === 'function') {
        img.decode().then(onDone).catch(onDone);
      }
    } catch (_) {}
    img.addEventListener('load', onDone, { once: true, capture: true });
    img.addEventListener('error', onDone, { once: true, capture: true });
  });

  let timedOut = false;
  const timeout = new Promise((resolve) => setTimeout(() => { timedOut = true; resolve(); }, Math.max(0, maxWaitMs)));
  const waitAll = Promise.all(pending.map(perImage));
  await Promise.race([waitAll, timeout]);
  if (settleDelayMs > 0) await new Promise((r) => setTimeout(r, settleDelayMs));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return { waitedCount, timedOut };
}

// Arm adaptive images so the stylesheet can mask-recolor them (CSS cannot read
// an img's own src). A CSS mask source is CORS-restricted, so we can only
// recolor an icon we are actually allowed to read: we fetch it and, on success,
// arm the element with a same-origin data: URI (which also sidesteps redirects).
// If the fetch fails (cross-origin without CORS headers, network error) we
// leave the plain <img> untouched so it still renders in its own colors rather
// than vanishing. The data-adaptive marker gates the utility's CSS; only armed
// elements get masked. Idempotent: already-armed images are skipped, and an
// element that already carries an author-supplied --framework-icon-src (the
// JS-free markup form) is trusted as-is.
// A mask-recolored icon (image--adaptive) can't be stroked in place: CSS applies
// filter before mask, so a drop-shadow stroke on the icon is clipped away by the
// icon's own mask. Title-bar icons must carry the same contrast stroke as the
// title/instance text, so wrap an armed title-bar icon in a non-masked host span
// (.image--adaptive-host) that the stylesheet drop-shadows instead. Scoped to
// .title_bar so body icons stay unstroked. Idempotent and best-effort.
function wrapAdaptiveForStroke(img) {
  try {
    if (!img.closest || !img.closest('.title_bar')) return;
    const parent = img.parentNode;
    if (!parent || (parent.classList && parent.classList.contains('image--adaptive-host'))) return;
    const host = img.ownerDocument.createElement('span');
    host.className = 'image--adaptive-host';
    parent.insertBefore(host, img);
    host.appendChild(img);
  } catch (_) { /* wrapping is decorative; the icon still renders unwrapped */ }
}

async function applyAdaptiveImages(root = document) {
  const scope = root || document;
  // Only un-armed icons are processed and armed below; arming behavior is unchanged.
  const imgs = Array.from(scope.querySelectorAll('img.image--adaptive:not([data-adaptive])'));
  // Icons armed on a previous terminalize pass. Counted (read-only) so the stats
  // step can report the total adaptive images present on the screen rather than
  // just this run's newly-armed candidates. Without this, a re-terminalize with
  // nothing left to arm would report targets: 0 and the step would be dropped.
  const alreadyArmed = scope.querySelectorAll('img.image--adaptive[data-adaptive]').length;
  let armed = 0;
  let skipped = 0;

  const readAsDataURL = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('read failed'));
    reader.readAsDataURL(blob);
  });

  await Promise.all(imgs.map(async (img) => {
    // Author-supplied mask source (manual form): trust it, just flip the gate.
    if (img.style.getPropertyValue('--framework-icon-src').trim()) {
      img.setAttribute('data-adaptive', 'true');
      wrapAdaptiveForStroke(img);
      armed += 1;
      return;
    }
    const src = img.currentSrc || img.src || '';
    if (!src) return;
    try {
      const response = await fetch(src, { mode: 'cors', credentials: 'omit' });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const dataUri = await readAsDataURL(await response.blob());
      img.style.setProperty('--framework-icon-src', `url("${String(dataUri).replace(/"/g, '\\"')}")`);
      img.setAttribute('data-adaptive', 'true');
      wrapAdaptiveForStroke(img);
      armed += 1;
    } catch (_) {
      // Icon is not readable (e.g. cross-origin host without CORS headers).
      // Leave it as a plain image; recoloring is simply unavailable here.
      skipped += 1;
    }
  }));

  // targets = total adaptive images present (already-armed + newly-armed candidates)
  // so the step reports consistently across re-terminalize passes. armed is the
  // count armed THIS run; alreadyArmed were armed on a prior pass.
  return { targets: alreadyArmed + imgs.length, armed, alreadyArmed, skipped };
}

async function runTerminalizePass() {
  const stats = { steps: [], engines: [], errors: [] };
  const pushStep = (name, meta, t0) => {
    let durationMs = 0;
    try {
      if (typeof t0 === 'number') durationMs = Math.max(0, Math.round(performance.now() - t0));
    } catch (_) {}
    stats.steps.push({ name, durationMs, ...(meta || {}) });
  };
  const addEngine = (name, meta) => {
    // Only add to engines list if the engine actually had an effect
    const hasEffect = (meta) => {
      if (!meta) return false;
      const entries = Object.entries(meta);
      if (entries.length === 0) return false;
      if (name === 'Pixel-perfect fonts') {
        const scheduledCount = Number(meta.scheduled || 0);
        return scheduledCount > 0;
      }
      if ((typeof meta.targets === 'number' && meta.targets > 0) || (typeof meta.targetsTotal === 'number' && meta.targetsTotal > 0)) {
        return true;
      }
      return entries.some(([k,v]) => typeof v === 'number' && v > 0 && !['targets','candidates','grids','containers','columns','scheduled'].includes(k) && !/^(avg|average)[A-Z_]?/i.test(k));
    };
    if (hasEffect(meta)) {
      stats.engines.push({ name, ...(meta || {}) });
    }
  };
  const recordError = (engine, error) => {
    const message = error instanceof Error ? error.message : String(error || 'Unknown error');
    stats.errors.push({ engine, message });
    console.error(`Terminalize ${engine} failed:`, error);
  };
  const runSafely = (engine, fn, fallback = undefined) => {
    try {
      return fn();
    } catch (error) {
      recordError(engine, error);
      return fallback;
    }
  };
  const runSafelyAsync = async (engine, fn, fallback = undefined) => {
    try {
      return await fn();
    } catch (error) {
      recordError(engine, error);
      return fallback;
    }
  };

  try {

  // Helpers for responsiveness and scoping
  
  // Backwards compatibility for clamp utilities using legacy classnames
  // - Supports only base tokens: clamp--N and clamp--none
  // - Responsive legacy tokens (e.g., md:clamp--N, md:portrait:clamp--N) are NOT supported
  // - Responsive data attributes are still respected (e.g., data-clamp-md), independent of legacy classes
  // Uses global toCamelCase() and parseIntSafe() for consistency

  function readResponsiveClampFromDataset(el, ctx) {
    if (!el || !el.dataset) return null;
    const { size, orientation } = ctx || {};
    const isPortrait = orientation === 'portrait';
    // 1) size + portrait
    if (size && isPortrait) {
      const key = toCamelCase(`clamp-${size}-portrait`); // e.g., clampMdPortrait
      const n = parseIntSafe(el.dataset[key]);
      if (n != null) return n;
    }
    // 2) size only
    if (size) {
      const key = toCamelCase(`clamp-${size}`); // e.g., clampMd
      const n = parseIntSafe(el.dataset[key]);
      if (n != null) return n;
    }
    // 3) portrait only
    if (isPortrait) {
      const n = parseIntSafe(el.dataset.clampPortrait);
      if (n != null) return n;
    }
    // 4) base
    return parseIntSafe(el.getAttribute('data-clamp'));
  }

  function readResponsiveClampFromClasses(el, ctx) {
    if (!el || !el.classList) return null;
    // Gather all class tokens once
    const classes = new Set(Array.from(el.classList));
    // Helper to find first match with specificity order
    const findMatch = (patterns) => {
      for (const p of patterns) {
        if (classes.has(p.token)) return p.value;
      }
      return null;
    };
    // Build candidate patterns in precedence order
    const patterns = [];
    const pushNone = (token) => patterns.push({ token, value: 0 }); // 0 disables clamping
    // Base only
    pushNone('clamp--none');
    for (let n = 1; n <= 50; n++) {
      patterns.push({ token: `clamp--${n}`, value: n });
    }
    return findMatch(patterns);
  }

  const CLAMP_RESPONSIVE_SELECTOR = [
    '[class*="clamp--"]',
    '[data-clamp]',
    '[data-clamp-sm]',
    '[data-clamp-md]',
    '[data-clamp-lg]',
    '[data-clamp-portrait]',
    '[data-clamp-sm-portrait]',
    '[data-clamp-md-portrait]',
    '[data-clamp-lg-portrait]'
  ].join(', ');

  function ensureLegacyClampClassSupport(root = document) {
    const t0 = performance.now();
    const ctx = getScreenContext();
    const candidates = root.querySelectorAll(CLAMP_RESPONSIVE_SELECTOR);
    let updated = 0;
    candidates.forEach((el) => {
      // Prefer explicit data- attributes when present and responsive
      let value = readResponsiveClampFromDataset(el, ctx);
      if (value == null) {
        value = readResponsiveClampFromClasses(el, ctx);
      }
      if (value != null) {
        const current = el.getAttribute('data-clamp');
        const next = String(value);
        if (current !== next) {
          el.setAttribute('data-clamp', next);
          updated += 1;
        }
      }
    });
    const changed = updated;
    if (changed > 0) {
      const msg = { candidates: candidates.length, updated: changed };
      pushStep('Clamp legacy class support', msg, t0);
      addEngine('Clamp legacy class support', msg);
    }
  }

  const requestIdle = (cb) => {
    if (typeof window.requestIdleCallback === 'function') {
      return window.requestIdleCallback(cb, { timeout: 300 });
    }
    return requestAnimationFrame(() => cb({ didTimeout: false, timeRemaining: () => 16 }));
  };

  // Ensure images are loaded/settled before doing layout-sensitive work
  {
    const t0 = performance.now();
    let meta = { targets: 0, timedOut: false };
    const res = await runSafelyAsync('Wait for images', waitForImagesToSettle, null);
    if (res) meta = { targets: res.waitedCount, timedOut: !!res.timedOut };
    if (meta.targets > 0 || meta.timedOut) {
      pushStep('Wait for images', meta, t0);
      addEngine('Wait for images', meta);
    }
  }

  // Arm adaptive images (mask-recolored icons) before any layout work
  {
    const t0 = performance.now();
    const defaultMeta = { targets: 0, armed: 0, alreadyArmed: 0, skipped: 0 };
    const meta = await runSafelyAsync('Adaptive images', () => applyAdaptiveImages(document), defaultMeta);
    // targets is now the total adaptive images present (armed on this or a prior
    // pass), so this records the step consistently on every terminalize, not just
    // the run that happened to arm the last un-armed image.
    if (meta.targets > 0) {
      pushStep('Adaptive images', meta, t0);
      addEngine('Adaptive images', meta);
    }
  }

  // Index and value formatting first
  // Map legacy clamp classes to data attributes before any clamping/layout work
  runSafely('Clamp legacy class support', () => ensureLegacyClampClassSupport(document));
  {
    // Global pass (outside of .columns)
    const outside = Array.from(document.querySelectorAll('.meta .index')).filter((el) => !el.closest('.columns'));
    const candidatesOutside = outside.length;
    const t0 = performance.now();
    runSafely('Item index number resize', adjustIndexSpanWidths);
    const adjusted = outside.reduce((n, el) => n + ((el.style && el.style.width && el.style.width.length > 0) ? 1 : 0), 0);

    // Inside each .columns after commit
  const columnsRoots = getColumnsWithOverflow(document);
    let innerAdjusted = 0;
    columnsRoots.forEach((root) => {
      innerAdjusted += (runSafely('Item index number resize', () => adjustIndexSpanWidthsInRoot(root), 0) || 0);
    });
    const totalCandidates = document.querySelectorAll('.meta .index').length;
    const totalAdjusted = adjusted + innerAdjusted;
    if (totalCandidates > 0 && totalAdjusted > 0) {
      pushStep('Item index number resize', { candidates: totalCandidates, adjusted: totalAdjusted }, t0);
      addEngine('Item index number resize', { candidates: totalCandidates, adjusted: totalAdjusted });
    }
  }
  {
    const valueTargets = Array.from(document.querySelectorAll('[data-value-type="number"], [data-value-format="true"]'));
    const targets = valueTargets.length;
    const t0 = performance.now();
    runSafely('Format values', formatValue);
    let changed = 0, abbreviated = 0;
    valueTargets.forEach((el) => {
      const raw = (el.dataset && el.dataset.rawValue) ? String(el.dataset.rawValue) : '';
      const now = String(el.textContent || '');
      if (raw && raw.trim() !== now.trim()) changed += 1;
      if (/[kMB]$/.test(now.trim())) abbreviated += 1;
    });
    pushStep('Format values', { targets, changed, abbreviated }, t0);
    addEngine('Format values', { targets, changed, abbreviated });
  }
  {
    const fitTargets = Array.from(document.querySelectorAll('[data-fit-value="true"], [data-value-fit="true"]'));
    const targets = fitTargets.length;
    const t0 = performance.now();
    runSafely('Fit values', fitValue);
    let adjusted = 0; const fontSizes = new Set(); const lineHeights = new Set(); const fontWeights = new Set();
    fitTargets.forEach((el) => {
      const fs = parseFloat(el.style && el.style.fontSize || '');
      const lh = parseFloat(el.style && el.style.lineHeight || '');
      const fw = parseInt(el.style && el.style.fontWeight || '', 10);
      let counted = false;
      if (isFinite(fs) && fs > 0) { fontSizes.add(`${fs}px`); counted = true; }
      if (isFinite(lh) && lh > 0) { lineHeights.add(`${lh}px`); counted = true; }
      if (isFinite(fw) && fw > 0) { fontWeights.add(String(fw)); counted = true; }
      if (counted) adjusted += 1;
    });
    pushStep('Fit values', { targets, adjusted, fontSizesApplied: Array.from(fontSizes), lineHeightsApplied: Array.from(lineHeights), fontWeightsApplied: Array.from(fontWeights) }, t0);
    addEngine('Fit values', { targets, adjusted, fontSizesApplied: Array.from(fontSizes), lineHeightsApplied: Array.from(lineHeights), fontWeightsApplied: Array.from(fontWeights) });
  }

  // Gap adjustments next (affects widths)
  {
    const gridsList = Array.from(document.querySelectorAll('.grid'));
    const grids = gridsList.length;
    const t0 = performance.now();
    runSafely('Adjust grid gaps', adjustGridGaps);
    let adjusted = 0; const gaps = [];
    gridsList.forEach((el) => {
      if (el.style && el.style.gap && el.style.gap.length > 0) {
        adjusted += 1;
        const g = parseFloat(el.style.gap);
        if (isFinite(g)) gaps.push(`${g}px`);
      }
    });
    const gapsApplied = gaps;
    pushStep('Adjust grid gaps', { grids, adjusted, gapsApplied }, t0);
    addEngine('Adjust grid gaps', { grids, adjusted, gapsApplied });
  }
  {
    // Pre-pass: adjust column gaps for columns that will NOT be processed by the Overflow engine.
    // These can be more numerous and should be handled early to stabilize widths.
    const nonOverflowColumns = Array.from(document.querySelectorAll('.columns')).filter(
      (el) => !hasAnyOverflowMaxColsAttribute(el) && !hasAnyOverflowColsAttribute(el)
    );
    if (nonOverflowColumns.length > 0) {
      runSafely('Adjust column gaps pre-pass', () => adjustColumnGapsFor(nonOverflowColumns));
      // No separate stats entry here to keep a single unified column gaps group later
    }
  }

  // Overflow Engine across all .columns (multi-column simulation includes Clamp internally)
  // Backwards compatibility pre-pass:
  // - Promote legacy attributes on `.list` / `.column` into `.columns[data-overflow-max-cols]`
  // - Capture legacy height and hidden count signals on the `.columns` node
  (function applyLegacyOverflowAttributes() {
    const allColumns = Array.from(document.querySelectorAll('.columns'));
    allColumns.forEach((cols) => {
      // If already opted in, still allow legacy height/hidden-count overrides
      const descendants = Array.from(cols.querySelectorAll(':scope > .column, :scope .list'));
      let legacyLimit = false;
      let legacyMaxColumns = null;
      let legacyMaxHeight = null;
      let legacyHiddenCount = null;

      descendants.forEach((node) => {
        if (node.getAttribute('data-list-limit') === 'true') legacyLimit = true;
        // Legacy max columns is a single base value. Responsive column counts come from
        // data-overflow-max-cols-{size}[-portrait] on the .columns container.
        if (legacyMaxColumns == null) {
          const v = node.getAttribute('data-list-max-columns');
          if (v != null) legacyMaxColumns = v;
        }
        if (legacyMaxHeight == null) {
          const h = node.getAttribute('data-list-max-height');
          if (h != null) legacyMaxHeight = h;
        }
        if (legacyHiddenCount == null) {
          const hc = node.getAttribute('data-list-hidden-count');
          if (hc != null) legacyHiddenCount = hc;
        }
      });

      // Compute desired max columns from legacy, defaulting to 1
      const parsedMaxCols = parseInt(legacyMaxColumns || '1', 10);
      const maxCols = (isFinite(parsedMaxCols) && parsedMaxCols > 0) ? parsedMaxCols : 1;

      // Back-compat rule: only promote a `.columns` container into the multi-column
      // Overflow engine when it would actually produce 2+ columns. If the legacy
      // intent caps at a single column, keep the `.columns` unmanaged so nested
      // lists can use the generic overflow path instead.
      const alreadyManaged = hasAnyOverflowMaxColsAttribute(cols) || hasAnyOverflowColsAttribute(cols);
      const shouldOptIn = legacyLimit && !alreadyManaged && maxCols > 1;

      if (shouldOptIn) {
        cols.setAttribute('data-overflow-max-cols', String(maxCols));
      }

      // Persist legacy overrides on the columns node for engine reads only when
      // this columns container is (or will be) managed by the columns engine.
      if (shouldOptIn || alreadyManaged) {
        if (legacyMaxHeight != null) {
          cols.setAttribute('data-legacy-height-budget', legacyMaxHeight);
        } else if (legacyLimit && !cols.hasAttribute('data-legacy-height-budget')) {
          // Legacy default height when list-limit is used without explicit max-height
          cols.setAttribute('data-legacy-height-budget', '320');
        }
        if (legacyHiddenCount != null) cols.setAttribute('data-legacy-hidden-count', legacyHiddenCount);
      }
    });
  })();

  const columnsGroups = getColumnsWithOverflow(document);
  {
    const overflowAgg = { itemsProcessed: 0, columnsCreated: 0, repeatedHeaders: 0, harmonious: 0, hiddenItems: 0, overflowCounters: 0 };
    let overflowDurationMs = 0;

    {
      const t0 = performance.now();
      const budgetMs = 12;
      let queue = [...columnsGroups];
      const agg = { itemsProcessed: 0, columnsCreated: 0, repeatedHeaders: 0, harmonious: 0 };
      await new Promise((resolve) => {
        const step = () => {
          const start = performance.now();
          while (queue.length && (performance.now() - start) < budgetMs) {
            const cols = queue.shift();
            const r = runSafely('Overflow engine columns', () => runOverflowEngineForColumns(cols), null);
            if (r) {
              agg.itemsProcessed += (r.itemsProcessed || 0);
              agg.columnsCreated += (r.columnsCreated || 0);
              agg.repeatedHeaders += (r.repeatedHeaders || 0);
              agg.harmonious += (r.harmonious || 0);
            }
          }
          if (queue.length) requestAnimationFrame(step); else resolve();
        };
        requestAnimationFrame(step);
      });
      const columnsContainers = getColumnsWithOverflow(document);
      const hiddenItemsColumns = columnsContainers
        .reduce((sum, c) => sum + countHiddenOverflowItems(c), 0);
      const labelsInColumns = columnsContainers
        .reduce((sum, c) => sum + c.querySelectorAll(':scope > .column .item[data-overflow-label="true"]').length, 0);
      overflowAgg.itemsProcessed += agg.itemsProcessed;
      overflowAgg.columnsCreated += agg.columnsCreated;
      overflowAgg.repeatedHeaders += agg.repeatedHeaders;
      overflowAgg.harmonious += agg.harmonious;
      overflowAgg.hiddenItems += hiddenItemsColumns;
      overflowAgg.overflowCounters += labelsInColumns;
      overflowDurationMs += Math.max(0, Math.round(performance.now() - t0));
    }

    {
      (function applyLegacyOverflowAttributesGeneric() {
        const candidates = Array.from(document.querySelectorAll('[data-list-limit="true"]'))
          .filter((el) => {
            const col = el.closest('.columns');
            if (!col) return true;
            return !(hasAnyOverflowMaxColsAttribute(col) || hasAnyOverflowColsAttribute(col));
          });
        candidates.forEach((node) => {
          if (!node.hasAttribute('data-overflow')) {
            node.setAttribute('data-overflow', 'true');
          }
          if (node.hasAttribute('data-list-max-height') && !node.hasAttribute('data-overflow-max-height')) {
            const v = node.getAttribute('data-list-max-height');
            if (v != null) node.setAttribute('data-overflow-max-height', v);
          }
        });
      })();

      const genericTargets = Array.from(document.querySelectorAll('[data-overflow="true"]'))
        .filter((el) => !(el.classList && el.classList.contains('columns')));
      if (genericTargets.length > 0) {
        const t0 = performance.now();
        const budgetMs = 12;
        let queue = [...genericTargets];
        const agg = { itemsProcessed: 0, hiddenItems: 0, overflowCounters: 0 };
        await new Promise((resolve) => {
          const step = () => {
            const start = performance.now();
            while (queue.length && (performance.now() - start) < budgetMs) {
              const node = queue.shift();
              const r = runSafely('Overflow engine generic', () => runOverflowEngineForGeneric(node), null);
              if (r) {
                agg.itemsProcessed += (r.itemsProcessed || 0);
                agg.hiddenItems += (r.hiddenItems || 0);
              agg.overflowCounters += (r.labelAdded ? 1 : 0);
              }
            }
            if (queue.length) requestAnimationFrame(step); else resolve();
          };
          requestAnimationFrame(step);
        });
        overflowAgg.itemsProcessed += agg.itemsProcessed;
        overflowAgg.hiddenItems += agg.hiddenItems;
        overflowAgg.overflowCounters += agg.overflowCounters;
        overflowDurationMs += Math.max(0, Math.round(performance.now() - t0));
      }
    }

    const fakeStart = performance.now() - overflowDurationMs;
    pushStep('Overflow engine', overflowAgg, fakeStart);
    addEngine('Overflow engine', overflowAgg);
  }

  {
    const outsideOrUnmanagedClampTargets = Array.from(document.querySelectorAll('[data-clamp]')).filter((el) => {
      const col = el.closest('.columns');
      if (!col) return true;
      return !(hasAnyOverflowMaxColsAttribute(col) || hasAnyOverflowColsAttribute(col));
    });
    const t0 = performance.now();
    const budgetMs = 12;
    let queue = [...outsideOrUnmanagedClampTargets];
    await new Promise((resolve) => {
      const step = () => {
        const start = performance.now();
        while (queue.length && (performance.now() - start) < budgetMs) {
          const el = queue.shift();
          const original = el.getAttribute('data-clamp-original');
          if (original !== null) {
            el.textContent = original;
            // Ensure newline characters render as visual breaks
            el.style.whiteSpace = 'pre-line';
          }
          runSafely('Clamp engine', () => {
            clampElementToLines(el, parseInt(el.getAttribute('data-clamp'), 10));
          });
        }
        if (queue.length) requestAnimationFrame(step); else resolve();
      };
      requestAnimationFrame(step);
    });
    // Compute final truncated count and lightweight detail stats across ALL clamp targets after operations
    const allClampTargets = Array.from(document.querySelectorAll('[data-clamp]'));
    let truncatedTotal = 0;
    let wordsTrimmed = 0;
    let charsTrimmed = 0;
    let linesTrimmedSum = 0;
    allClampTargets.forEach((el) => {
      const original = el.getAttribute('data-clamp-original');
      if (original != null) {
        const now = String(el.textContent || '');
        if (now !== original) {
          truncatedTotal += 1;
          // Count words and chars trimmed (ignore trailing ellipsis)
          const strippedNow = now.endsWith('...') ? now.slice(0, -3) : now;
          const wordsOrig = (original.trim().match(/\S+/g) || []).length;
          const wordsNow = (strippedNow.trim().match(/\S+/g) || []).length;
          if (wordsOrig > wordsNow) wordsTrimmed += (wordsOrig - wordsNow);
          const charsNowNoEllipsis = strippedNow.length;
          if (original.length > charsNowNoEllipsis) charsTrimmed += (original.length - charsNowNoEllipsis);
          const lt = parseInt(el.getAttribute('data-clamp-lines-trimmed') || '0', 10);
          if (isFinite(lt) && lt > 0) linesTrimmedSum += lt;
        }
      }
    });

    if (truncatedTotal > 0) {
      pushStep('Clamp engine', {
        truncated: truncatedTotal,
        targetsTotal: allClampTargets.length,
        wordsTrimmed,
        charsTrimmed,
        linesTrimmed: linesTrimmedSum
      }, t0);
      addEngine('Clamp engine', {
        truncated: truncatedTotal,
        targetsTotal: allClampTargets.length,
        wordsTrimmed,
        charsTrimmed,
        linesTrimmed: linesTrimmedSum
      });
    }

    // Re-clamp after layout (e.g. grid cells get real width) so path-like and
    // grid content truncates correctly before readiness is signaled.
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
    outsideOrUnmanagedClampTargets.forEach((el) => {
      runSafely('Clamp engine deferred pass', () => {
        const original = el.getAttribute('data-clamp-original');
        if (original !== null) {
          el.textContent = original;
          el.style.whiteSpace = 'pre-line';
        }
        clampElementToLines(el, parseInt(el.getAttribute('data-clamp'), 10));
      });
    });
  }

  // Table overflow: hide overflowing tbody rows and append a trailing "and X more" row
  {
    const t0 = performance.now();
    const tables = Array.from(document.querySelectorAll('table[data-table-limit="true"]'));
    let hiddenRowsTotal = 0;
    tables.forEach((table) => {
      // Per table, so one unusual table cannot abandon the rest, and a failure is
      // recorded in stats.errors instead of reporting hiddenRows: 0 as success.
      runSafely('Table overflow', () => {
        // Reset any previous state
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        tbody.querySelectorAll(':scope > tr[data-table-overflow-label="true"]').forEach((tr) => tr.remove());
        tbody.querySelectorAll(':scope > tr[data-hidden-by-table-overflow="true"]').forEach((tr) => {
          tr.style.display = '';
          tr.removeAttribute('data-hidden-by-table-overflow');
        });

        // Height budget
        const maxHAttr = table.getAttribute('data-table-max-height') || table.getAttribute('data-list-max-height');
        let heightBudget = 0;
        if (maxHAttr === 'auto' || maxHAttr == null) {
          const parent = table.parentElement;
          heightBudget = Math.floor(parent ? (parent.clientHeight || parent.getBoundingClientRect().height) : 0);
        } else {
          const n = parseInt(maxHAttr, 10);
          heightBudget = (Number.isFinite(n) && n > 0) ? n : 0;
        }
        if (heightBudget <= 0) return;

        const thead = table.querySelector('thead');
        const headH = thead ? Math.ceil(thead.getBoundingClientRect().height) : 0;
        const budgetForBody = Math.max(0, heightBudget - headH);

        // Measure and hide rows beyond budget
        const rows = Array.from(tbody.querySelectorAll(':scope > tr'));
        let acc = 0;
        let lastVisibleIndex = -1;
        rows.forEach((row, idx) => {
          if (row.getAttribute('data-table-overflow-label') === 'true') return;
          row.style.display = '';
          const rect = row.getBoundingClientRect();
          const h = Math.ceil(rect.height || 0);
          if (acc + h <= budgetForBody) {
            acc += h;
            lastVisibleIndex = idx;
          } else {
            row.style.display = 'none';
            row.setAttribute('data-hidden-by-table-overflow', 'true');
          }
        });

        let hiddenRows = rows.filter((r) => r.getAttribute('data-hidden-by-table-overflow') === 'true').length;

        // Decide whether to show the trailing label row
        const showLabel = (function () {
          const counter = table.getAttribute('data-table-overflow-counter') ?? table.getAttribute('table-overflow-counter');
          if (counter != null) return String(counter) !== 'false';
          const attr = table.getAttribute('data-table-hidden-count');
          if (attr != null) return String(attr) !== 'false';
          const legacy = table.getAttribute('data-list-hidden-count');
          if (legacy != null) return String(legacy) !== 'false';
          return true;
        }());

        if (hiddenRows > 0 && showLabel) {
          // Reserve space for the trailing label row so we don't overflow the budget
          // Estimate row height from the first body row (rows were measured with display='')
          const sampleRow = rows[0];
          const estimatedLabelHeight = Math.ceil((sampleRow?.getBoundingClientRect().height) || 0);

          // If the label won't fit, hide additional visible rows from the bottom until it fits
          while ((acc + estimatedLabelHeight) > budgetForBody && lastVisibleIndex >= 0) {
            const victim = rows[lastVisibleIndex];
            if (victim && victim.getAttribute('data-table-overflow-label') !== 'true' && victim.getAttribute('data-hidden-by-table-overflow') !== 'true') {
              const victimH = Math.ceil((victim.getBoundingClientRect().height) || estimatedLabelHeight);
              victim.style.display = 'none';
              victim.setAttribute('data-hidden-by-table-overflow', 'true');
              acc = Math.max(0, acc - victimH);
              hiddenRows += 1;
            }
            lastVisibleIndex -= 1;
          }

          // Ensure at least one row is visible
          if (lastVisibleIndex < 0 && rows.length > 0) {
            const first = rows[0];
            first.style.display = '';
            first.removeAttribute('data-hidden-by-table-overflow');
            lastVisibleIndex = 0;
            // Adjust acc to include one row to avoid empty body when label appears
            try { const h = Math.ceil((first.getBoundingClientRect().height) || 0); acc += h; } catch (_) {}
          }

          // Final guard: if even with adjustments the label does not fit, skip the label to avoid overflow
          if ((acc + estimatedLabelHeight) > budgetForBody) {
            hiddenRowsTotal += hiddenRows;
            return;
          }

          // Compute column span from thead or first row
          const headRow = table.querySelector('thead tr');
          const cells = headRow ? Array.from(headRow.children) : (rows[0] ? Array.from(rows[0].children) : []);
          const colCount = (cells.reduce((sum, cell) => sum + (parseInt(cell.getAttribute('colspan') || '1', 10) || 1), 0)) || 1;

          // Scale label with table size
          const isSmallTable = table.classList.contains('table--small') || table.classList.contains('table--xsmall') || table.classList.contains('table--condensed');
          const labelClass = isSmallTable ? 'label label--small label--gray' : 'label label--gray';

          // Append trailing label row
          const tr = document.createElement('tr');
          tr.setAttribute('data-table-overflow-label', 'true');
          const isIndexed = table.classList.contains('table--indexed');
          if (isIndexed && colCount > 1) {
            // For indexed tables, insert an empty first cell so the label aligns with the data column
            const tdEmpty = document.createElement('td');
            tr.appendChild(tdEmpty);

            const td = document.createElement('td');
            td.setAttribute('colspan', String(colCount - 1));
            const span = document.createElement('span');
            span.className = labelClass;
            span.textContent = window.I18n?.andXMore?.(hiddenRows) ?? `and ${hiddenRows} more`;
            td.appendChild(span);
            tr.appendChild(td);
          } else {
            const td = document.createElement('td');
            td.setAttribute('colspan', String(colCount));
            const span = document.createElement('span');
            span.className = labelClass;
            span.textContent = window.I18n?.andXMore?.(hiddenRows) ?? `and ${hiddenRows} more`;
            td.appendChild(span);
            tr.appendChild(td);
          }
          tbody.appendChild(tr);
        }

        // Track totals after any adjustments for label reservation
        hiddenRowsTotal += hiddenRows;
      });
    });

    if (tables.length > 0) {
    pushStep('Table overflow', { hiddenRows: hiddenRowsTotal }, t0);
    addEngine('Table overflow', { hiddenRows: hiddenRowsTotal });
    }
  }

  // Content limits and pixel perfect fonts last
  {
    const limiterTargets = Array.from(document.querySelectorAll('[data-content-limiter="true"]'));
    const targets = limiterTargets.length;
    const t0 = performance.now();
    await runSafelyAsync('Content limiter', applyContentLimits);
    // After limiter adjusted the layout, re-clamp any nested targets to ensure final fit
    const reclampStart = performance.now();
    const clampNodes = Array.from(document.querySelectorAll('[data-content-limiter="true"] [data-clamp]'));
    clampNodes.forEach((node) => {
      // Per node, matching the deferred clamp pass above: one node that cannot be
      // clamped is recorded and the rest still re-fit.
      runSafely('Content limiter re-clamp', () => {
        const original = node.getAttribute('data-clamp-original');
        if (original != null) {
          node.textContent = original;
          node.style.whiteSpace = 'pre-line';
        }
        clampElementToLines(node, parseInt(node.getAttribute('data-clamp'), 10));
      });
    });
    let limited = 0, thrSum = 0;
    limiterTargets.forEach((el) => {
      if (el.classList.contains('content--small')) limited += 1;
      try { const thr = getHeightThreshold(el); if (isFinite(thr)) thrSum += thr; } catch(_) {}
    });
    const avgThresholdPx = targets ? Math.round((thrSum / targets) * 10) / 10 : 0;
    if (limited > 0) {
      pushStep('Content limiter', { targets, limited, avgThresholdPx, reclamped: clampNodes.length }, t0);
      addEngine('Content limiter', { targets, limited, avgThresholdPx, reclamped: clampNodes.length });
    }
  }
  // Run pixelPerfectFonts in idle time to reduce jank, but await it so READY and
  // the emitted stats describe the completed render rather than an interim one.
  {
    const scheduled = document.querySelectorAll('[data-pixel-perfect="true"]').length;
    const t0 = performance.now();
    let linesProcessed = 0;
    if (scheduled > 0) {
      await new Promise((resolve) => requestIdle(resolve));
      linesProcessed = runSafely('Pixel-perfect fonts', pixelPerfectFonts, 0);
    }
    const meta = { scheduled, linesProcessed };
    pushStep('Pixel-perfect fonts', meta, t0);
    addEngine('Pixel-perfect fonts', meta);
  }

  // Final pass: adjust column gaps after Overflow engine has settled columns
  {
    const colContainers = Array.from(document.querySelectorAll('.columns'));
    const containers = colContainers.length;
    const t0 = performance.now();
    runSafely('Adjust column gaps', adjustColumnGaps);
    let adjusted = 0; const gaps = [];
    colContainers.forEach((el) => {
      if (el.style && el.style.gap && el.style.gap.length > 0) {
        adjusted += 1;
        const g = parseFloat(el.style.gap);
        if (isFinite(g)) gaps.push(`${g}px`);
      }
    });
    const gapsApplied = gaps;
    pushStep('Adjust column gaps', { containers, adjusted, gapsApplied }, t0);
    addEngine('Adjust column gaps', { containers, adjusted, gapsApplied });
  }

  } catch (error) {
    recordError('pipeline', error);
  } finally {
    // Finalize and emit stats even when one engine fails. Deferred passes have
    // completed before this point, so consumers receive one stable snapshot.
    try {
      stats.engineCount = stats.engines.length;
      if (stats.errors.length === 0) delete stats.errors;
      window.__TRMNL_LAST_STATS__ = stats;
      const evt = new CustomEvent('trmnl:terminalize:stats', { detail: stats });
      window.dispatchEvent(evt);
    } catch (_) {}
  }
}

function getTerminalizeScheduler() {
  if (!window.__terminalizeScheduler) {
    window.__terminalizeScheduler = {
      rafId1: 0,
      rafId2: 0,
      pending: false,
      inFlight: null,
      dirty: false
    };
  }
  const scheduler = window.__terminalizeScheduler;
  if (!Object.prototype.hasOwnProperty.call(scheduler, 'inFlight')) scheduler.inFlight = null;
  if (!Object.prototype.hasOwnProperty.call(scheduler, 'dirty')) scheduler.dirty = false;
  return scheduler;
}

async function terminalize() {
  const scheduler = getTerminalizeScheduler();
  if (scheduler.inFlight) {
    scheduler.dirty = true;
    return scheduler.inFlight;
  }

  window.TRMNL_PLUGINS_READY = false;
  const runPromise = (async () => {
    do {
      scheduler.dirty = false;
      await runTerminalizePass();
    } while (scheduler.dirty);
  })();
  scheduler.inFlight = runPromise;

  try {
    await runPromise;
  } finally {
    if (scheduler.inFlight === runPromise) {
      scheduler.inFlight = null;
      // The loop read dirty for the last time before runPromise resolved, and
      // everything up to here still saw inFlight set. A re-run requested in that
      // window (a MutationObserver callback is a microtask, so it lands there)
      // only set the flag and scheduled nothing, so pick it up now.
      if (scheduler.dirty) {
        scheduler.dirty = false;
        scheduleTerminalize();
      }
    }
    try { forceScreenLayoutRecalculation(); } catch (_) {}
    window.TRMNL_PLUGINS_READY = true;
  }
}

// WebKit keeps stale flex heights after fitValue's inline font-size change; toggling display rebuilds the render subtree synchronously (no visible flash).
function forceScreenLayoutRecalculation() {
  document.querySelectorAll('.screen').forEach((screen) => {
    const previousDisplay = screen.style.display;
    screen.style.display = 'none';
    void screen.offsetHeight;
    screen.style.display = previousDisplay;
    void screen.offsetHeight;
  });
}

// Framework readiness system
window.frameworkReady = false;

// Debounced scheduler to execute terminalize after layout settles
function scheduleTerminalize() {
  const scheduler = getTerminalizeScheduler();
  if (scheduler.inFlight) {
    scheduler.dirty = true;
    return;
  }
  if (scheduler.pending) return;
  scheduler.pending = true;
  if (scheduler.rafId1) cancelAnimationFrame(scheduler.rafId1);
  if (scheduler.rafId2) cancelAnimationFrame(scheduler.rafId2);
  scheduler.rafId1 = requestAnimationFrame(() => {
    scheduler.rafId2 = requestAnimationFrame(() => {
      scheduler.pending = false;
      terminalize().catch((error) => {
        console.error('Terminalize scheduler failed:', error);
        window.TRMNL_PLUGINS_READY = true;
      });
    });
  });
}
/**
 * External trigger for terminalize - called by framework.html.erb when ready
 */
function executeTerminalize() {
  const inFrameworkDocs = !!window.__TRMNL_FRAMEWORK_BUILD__;
  if (inFrameworkDocs && window.__TRMNL_FRAMEWORK_PARENT_TERMINALIZE__ === false) {
    window.TRMNL_PLUGINS_READY = true;
    return;
  }
  if (inFrameworkDocs && !window.frameworkReady) {
    window.addEventListener('trmnl:framework:ready', scheduleTerminalize, { once: true });
  } else {
    scheduleTerminalize();
  }
}

/**
 * Called by framework.html.erb to signal that framework initialization is complete
 */
function markFrameworkReady() {
  window.frameworkReady = true;
  try {
    const evt = new Event('trmnl:framework:ready');
    window.dispatchEvent(evt);
  } catch (_) {}
}

// Expose functions globally for framework.html.erb to use
window.terminalize = terminalize;
window.executeTerminalize = executeTerminalize;
window.markFrameworkReady = markFrameworkReady;

/**
 * TRMNLPaint, the framework's public JS paint API. A theme is a stylesheet;
 * TRMNLPaint is a *reader* of the live CSS cascade, never a second source of
 * truth. Every resolver appends a hidden probe element carrying the framework's
 * own utility class (bg--<token>, text--<token>, …) inside the target .screen and
 * reads the browser-resolved *standard* computed properties, so bit depth, dark
 * mode, theme overrides, limited-palette families and the tile indirection are all
 * honoured with zero token mappings duplicated in JS, and immune to CSS-variable
 * minification. Resolvers return a canonical Fill:
 *
 *   Fill = { color: string|null, image: string|null, url: string|null, size: number|null }
 *
 * where `url && size` ⇒ a dither tile pattern and `color` alone ⇒ a solid. All
 * library-specific shaping lives in adapters (toHighcharts, …). Total functions:
 * a missing .screen or unknown token yields a null-field Fill rather than throwing
 * (charts render on a screenshot service; a throw = a blank device screen).
 *
 * TRMNLCharts is the Highcharts-specific composition layer built on top of
 * TRMNLPaint. Both globals are exported from this one shared closure. Neither
 * depends on the terminalize() pipeline.
 */
(function () {
  const TRANSPARENT = 'rgba(0, 0, 0, 0)';
  const PROBE_CSS = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;visibility:hidden;pointer-events:none;';

  function resolveEl(el) {
    if (!el) return null;
    if (typeof el === 'string') return document.getElementById(el) || document.querySelector(el);
    return el;
  }

  // Nearest .screen ancestor of the target element, the element the framework
  // declares its per-mode paint on. Falls back to the first .screen so a
  // single-screen plugin can omit { el }.
  function resolveScreen(el) {
    const node = resolveEl(el);
    if (node && node.closest) {
      const scoped = node.closest('.screen');
      if (scoped) return scoped;
      return (node.ownerDocument || document).querySelector('.screen');
    }
    return document.querySelector('.screen');
  }

  // Paint can be rebound below the screen root by state wrappers such as
  // `.inverse` or by direct semantic/slot values. Probe inside the supplied
  // element so the browser resolves that local cascade; retain the screen for
  // device metrics and as the fallback context.
  function resolvePaintContext(el, screen) {
    const node = resolveEl(el);
    if (node && node.closest && node.closest('.screen') === screen) return node;
    return screen;
  }

  function viewFor(el) {
    return (el && el.ownerDocument && el.ownerDocument.defaultView) || window;
  }

  // A throwaway probe carrying a framework utility class, appended inside the
  // requested paint context (utility CSS is scoped under .trmnl and paint vars
  // can be rebound below .screen).
  // Reading its *standard* computed properties lets the browser resolve the whole
  // cascade for us. `pseudo` (e.g. '::before'/'::after') reads a generated pseudo-
  // element instead of the box itself, because border utilities paint their hairline on
  // ::before (horizontal) / ::after (vertical). `reader(cs, probe)` extracts what
  // the caller needs.
  function probePseudo(className, screen, reader, pseudo, extraStyle) {
    const doc = screen.ownerDocument || document;
    const el = doc.createElement('div');
    el.className = className;
    el.style.cssText = PROBE_CSS + (extraStyle || '');
    screen.appendChild(el);
    let result;
    try {
      result = reader(viewFor(screen).getComputedStyle(el, pseudo || null), el);
    } finally {
      el.remove();
    }
    return result;
  }

  // Probe the element box itself (no pseudo).
  function probe(className, screen, reader, extraStyle) {
    return probePseudo(className, screen, reader, null, extraStyle);
  }

  function resolvedScaleFactor(screen, propertyName) {
    if (!screen) return 1;
    const width = probe(
      '',
      screen,
      (cs) => parseFloat(cs.width),
      'box-sizing:border-box;max-width:none;width:calc(10000px * var(' + propertyName + ', 1));'
    );
    return Number.isFinite(width) && width >= 0 ? width / 10000 : 1;
  }

  function firstUrl(backgroundImage) {
    if (!backgroundImage || backgroundImage === 'none') return null;
    const match = /url\((['"]?)([\s\S]*?)\1\)/.exec(backgroundImage);
    return match ? match[2] : null;
  }

  function emptyFill() {
    return { color: null, image: null, url: null, size: null };
  }

  // Build a Fill from resolved image/color/size strings. `screen` (optional)
  // supplies the --dither-bg-size fallback when a tile image carries no explicit
  // background-size (the ramp vars are read raw, not through a sized utility).
  function makeFill(image, color, size, screen) {
    const img = image && image !== 'none' ? image : null;
    const url = firstUrl(image);
    const col = color && color !== TRANSPARENT && color !== 'transparent' ? color : null;
    let px = parseFloat(size);
    if (!(px > 0)) px = null;
    if (url && px == null && screen) {
      const d = parseFloat(viewFor(screen).getComputedStyle(screen).getPropertyValue('--dither-bg-size'));
      if (d > 0) px = d;
    }
    return { color: col, image: img, url: url, size: px };
  }

  function readBg(cs) {
    return { image: cs.backgroundImage, color: cs.backgroundColor, size: cs.backgroundSize };
  }

  function isOpaqueColor(color) {
    if (!color || color === TRANSPARENT || color === 'transparent') return false;
    // Only a genuine 4th component is the alpha channel; the loose "last number"
    // reading would mistake the blue channel of an opaque rgb(r, g, 0) for alpha 0.
    const m = /rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*([\d.]+%?)\s*)?\)/i.exec(color);
    if (m && m[1] !== undefined && parseFloat(m[1]) === 0) return false;
    return true;
  }

  // ── Border system (utilities/_border.scss, elements/_divider.scss) ──
  // Every .border--* utility paints a 1px line as *background* on a pseudo-element
  // (::before for horizontal, ::after for vertical); .divider paints on the box
  // itself. CSS publishes both the DOM background and an SVG-ready render program
  // from the same rule. Paint copies that program into non-CSS renderers; it never
  // reverse-engineers the background longhands.
  function borderRenderValue(cs, suffix) {
    const value = cs.getPropertyValue('--framework-border-render-' + suffix).trim();
    return value && value !== 'none' ? value : null;
  }

  function readBorder(cs) {
    return {
      color: cs.backgroundColor,
      image: cs.backgroundImage,
      size: cs.backgroundSize,
      position: cs.backgroundPosition,
      repeat: cs.backgroundRepeat,
      render: {
        stroke: borderRenderValue(cs, 'stroke'),
        width: borderRenderValue(cs, 'width'),
        height: borderRenderValue(cs, 'height'),
        viewBox: borderRenderValue(cs, 'view-box'),
        path1: borderRenderValue(cs, 'path-1'),
        color1: borderRenderValue(cs, 'color-1'),
        path2: borderRenderValue(cs, 'path-2'),
        color2: borderRenderValue(cs, 'color-2'),
      },
    };
  }

  function emptyBorderFill(dir) {
    return { color: null, image: null, url: null, size: null, position: null, repeat: null, render: null, dir: dir || 'h' };
  }

  function makeBorderFill(raw, dir) {
    const image = raw.image && raw.image !== 'none' ? raw.image : null;
    const color = raw.color && raw.color !== TRANSPARENT && raw.color !== 'transparent' ? raw.color : null;
    return {
      color: color,
      image: image,
      url: firstUrl(raw.image),
      size: raw.size || null,
      position: raw.position || null,
      repeat: raw.repeat || null,
      render: raw.render || null,
      dir: dir === 'v' ? 'v' : 'h',
    };
  }

  // The text tile is an SVG whose path fill is the ink; --text-*-under is the
  // field beneath it. Reading the first painted fill is the one-color SVG
  // counterpart of base/_screen-mode-vars.scss:_text-tile, not a
  // contrast choice. Both raw and percent-encoded data URIs occur in the cascade.
  function imageInk(uri) {
    if (!uri) return null;
    let source = String(uri);
    try { source = decodeURIComponent(source); } catch (_) {}
    const match = /\bfill\s*=\s*(['"])([^'"]+)\1/i.exec(source);
    if (!match || !isOpaqueColor(match[2])) return null;
    return match[2];
  }

  function textFillInk(fill) {
    if (!fill) return null;
    return (isOpaqueColor(fill.color) && fill.color) || imageInk(fill.url) || null;
  }

  // ── Typography system (elements/_value.scss, utilities/_font.scss, …) ──
  // Family/size/weight/line-height are contextual (font bundle × density) so they
  // MUST be probed, never read from vars. In dither modes text ink rides the
  // background image (background-clip:text) and computed `color` is transparent,
  // both are captured; one-color renderers derive the actual ink from the tile.
  function readType(cs) {
    return {
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontStyle: cs.fontStyle,
      fontVariantNumeric: cs.fontVariantNumeric,
      fontVariationSettings: cs.fontVariationSettings,
      webkitFontSmoothing: cs.webkitFontSmoothing,
      letterSpacing: cs.letterSpacing,
      lineHeight: cs.lineHeight,
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage,
      backgroundSize: cs.backgroundSize,
      backgroundPosition: cs.backgroundPosition,
      backgroundRepeat: cs.backgroundRepeat,
      clip: cs.backgroundClip || cs.webkitBackgroundClip || null,
      textShadow: cs.textShadow,
      filter: cs.filter,
      overflow: cs.overflow,
    };
  }

  function emptyTypeSpec() {
    return {
      fontFamily: null, fontSize: null, fontWeight: null, fontStyle: null,
      fontVariantNumeric: null, fontVariationSettings: null,
      webkitFontSmoothing: null, letterSpacing: null, lineHeight: null,
      color: null, backgroundColor: null, backgroundImage: null,
      backgroundSize: null, backgroundPosition: null, backgroundRepeat: null, clip: null,
      textShadow: null, filter: null, overflow: null, stroke: null,
    };
  }

  // Framework role → utility class. 'chart-label' is the de-facto axis-label role
  // (text--small); the named element roles map to themselves; any other string is
  // a literal class pass-through (e.g. 'value value--xxlarge', 'text--mega').
  const TYPE_ROLE = {
    'chart-label': 'text--small',
    'value': 'value',
    'label': 'label',
    'title': 'title',
    'description': 'description',
  };

  // Chart rails use the literal public utilities `.border--*-black` and
  // `.border--*-65`. These fill-backed utilities carry real ink in EVERY mode
  // (incl. dark) and directional rail geometry; JS does not add its own aliases.
  // Normalize a computed color ('rgb(...)', 'rgba(...)', '#rgb', '#rrggbb') to an
  // uppercase '#RRGGBB' string for embedding in an SVG data-URI. Returns null for
  // anything it can't parse (named colors, gradients) so the caller can skip it.
  function normalizeHex(color) {
    if (!color) return null;
    const s = String(color).trim();
    if (s.charAt(0) === '#') {
      if (s.length === 4) {
        return ('#' + s.charAt(1) + s.charAt(1) + s.charAt(2) + s.charAt(2) + s.charAt(3) + s.charAt(3)).toUpperCase();
      }
      if (s.length >= 7) return s.slice(0, 7).toUpperCase();
      return null;
    }
    const m = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(s);
    if (!m) return null;
    const hex = (n) => {
      let v = Math.max(0, Math.min(255, Math.round(parseFloat(n)))).toString(16);
      return v.length === 1 ? '0' + v : v;
    };
    return ('#' + hex(m[1]) + hex(m[2]) + hex(m[3])).toUpperCase();
  }

  // Composite a full-tile field rect INTO an SVG tile data-URI, immediately after
  // the opening <svg …> tag (so the ink paths stay on top). This is the literal
  // adapter translation of utilities/_background.scss:apply-bg-paint-vars:
  // background-color is the field UNDER background-image. `100%` keeps the rect
  // tied to the resolved asset dimensions instead of inventing a tile size in
  // JS. Handles both percent-encoded and raw data URIs.
  function compositeFieldIntoTile(uri, fieldHex) {
    if (!uri || !fieldHex) return uri;
    // Percent-encoded form: opening tag ends at the first %3E.
    let m = /%3Csvg[\s\S]*?%3E/i.exec(uri);
    if (m) {
      const rect = "%3Crect width='100%25' height='100%25' fill='" + encodeURIComponent(fieldHex) + "'/%3E";
      const at = m.index + m[0].length;
      return uri.slice(0, at) + rect + uri.slice(at);
    }
    // Raw form: opening tag ends at the first >.
    m = /<svg[\s\S]*?>/i.exec(uri);
    if (m) {
      const rect = "<rect width='100%' height='100%' fill='" + fieldHex + "'/>";
      const at = m.index + m[0].length;
      return uri.slice(0, at) + rect + uri.slice(at);
    }
    return uri;
  }

  function svgExtent(uri, name) {
    if (!uri) return null;
    let source = String(uri);
    try { source = decodeURIComponent(source); } catch (_) {}
    const match = new RegExp('\\b' + name + '\\s*=\\s*([\'\"])([\\d.]+)\\1', 'i').exec(source);
    const value = match && parseFloat(match[2]);
    return value > 0 ? value : null;
  }

  function svgElement(doc, name, attrs) {
    const node = doc.createElementNS('http://www.w3.org/2000/svg', name);
    for (const key of Object.keys(attrs)) node.setAttribute(key, attrs[key]);
    return node;
  }

  function mintBorderPattern(chart, fill, role) {
    const program = fill && fill.render;
    if (!program || !program.path1 || !program.color1 || !program.width || !program.height || !program.viewBox || !chart || !chart.container) return null;
    const svg = chart.container.querySelector('svg');
    if (!svg) return null;
    const doc = svg.ownerDocument || document;
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = svgElement(doc, 'defs', {});
      svg.insertBefore(defs, svg.firstChild);
    }
    const id = 'trmnl-border-' + chart.index + '-' + role;
    const existing = defs.querySelector('#' + id);
    if (existing) existing.remove();
    const pattern = svgElement(doc, 'pattern', {
      id: id,
      patternUnits: 'userSpaceOnUse',
      width: program.width,
      height: program.height,
      viewBox: program.viewBox,
      preserveAspectRatio: 'none',
      overflow: 'hidden',
    });
    pattern.style.width = program.width;
    pattern.style.height = program.height;
    pattern.appendChild(svgElement(doc, 'path', { d: program.path1, fill: program.color1 }));
    if (program.path2 && program.color2) pattern.appendChild(svgElement(doc, 'path', { d: program.path2, fill: program.color2 }));
    defs.appendChild(pattern);
    return 'url(#' + id + ')';
  }

  function setStroke(target, stroke) {
    if (!target || !stroke) return;
    const node = target.element || target;
    if (node && node.setAttribute) {
      node.setAttribute('stroke', stroke);
      node.removeAttribute('stroke-dasharray');
    }
  }

  function paintAxisPattern(chart, axis, gridFill, lineFill, role) {
    if (!axis) return;
    const gridStroke = mintBorderPattern(chart, gridFill, role + '-grid') || (gridFill && gridFill.render && gridFill.render.stroke);
    const lineStroke = mintBorderPattern(chart, lineFill, role + '-line') || (lineFill && lineFill.render && lineFill.render.stroke);
    if (gridStroke && axis.gridGroup && axis.gridGroup.element) {
      const paths = axis.gridGroup.element.querySelectorAll('.highcharts-grid-line');
      for (const path of paths) setStroke(path, gridStroke);
    }
    if (lineStroke) {
      setStroke(axis.axisLine, lineStroke);
      const ticks = axis.ticks || {};
      for (const key of Object.keys(ticks)) setStroke(ticks[key] && ticks[key].mark, lineStroke);
    }
  }

  function paintChartAxisPatterns(chart, fills) {
    if (!chart || !fills) return;
    (chart.xAxis || []).forEach((axis, index) => paintAxisPattern(chart, axis, fills.xGrid, fills.axis, 'x' + index));
    (chart.yAxis || []).forEach((axis, index) => paintAxisPattern(chart, axis, fills.yGrid, fills.axis, 'y' + index));
  }

  function isPlainObject(v) {
    return v != null && typeof v === 'object' && !Array.isArray(v);
  }

  // How many chart-series slots the resolved cascade declares. chart-series-ramp
  // in mixins/_theme-slots.scss emits the count and the slots from the same
  // $chart-series-slots constant, so this read is what bounds ramp() and
  // series(): the loop walks the ramp CSS published rather than a ceiling JS
  // keeps. No count means no ramp rule, which is zero slots, not a JS default.
  function chartSeriesSlotCount(cs) {
    const n = parseInt(cs.getPropertyValue('--framework-chart-series-count'), 10);
    return n > 0 ? n : 0;
  }

  // The cascade gates paint on screen--* classes wherever they sit, not only on
  // the screen itself: base/_screen-mode-vars.scss declares mode blocks whose
  // gate is an ancestor wrapper, and for-preview-color-palette in
  // mixins/_screen.scss emits that ancestor form for every limited palette. The
  // signature therefore spans the screen and its ancestors, so a wrapper toggle
  // is a change the watcher can see. See docs/PAINT_RULE_TRACEABILITY.md for the
  // exact selectors.
  function screenClassTokens(el) {
    return Array.from(el.classList || [])
      .filter((c) => c === 'screen' || /^screen--/.test(c))
      .sort()
      .join(' ');
  }

  // Screen first, then each ancestor outward. Also the exact node set watch()
  // observes: everything whose class attribute the signature reads.
  function screenSignatureNodes(screen) {
    const nodes = [];
    for (let el = screen; el; el = el.parentElement) nodes.push(el);
    return nodes;
  }

  function screenSignature(screen) {
    // Levels stay separated: the same modifier moving from wrapper to screen is
    // a different cascade and has to read as a change.
    return screenSignatureNodes(screen).map(screenClassTokens).join('|');
  }

  // Semantic slot → resolution strategy. Public utilities are probed directly;
  // roles without a utility are projected from their complete public semantic
  // channel onto standard CSS properties before computed style is read.
  const SEMANTIC_PROBE = {
    'canvas': 'bg--canvas',
    'surface': 'bg--surface',
    'backdrop': 'bg--backdrop',
    'text-primary': 'text--default',
    'text-secondary': 'text--muted',
    'text-inverse': 'text--inverse',
  };
  const SEMANTIC_BG = new Set(['fill-strong', 'fill-muted', 'fill-soft']);
  const SEMANTIC_BORDER = new Set(['border-strong', 'border-muted']);
  const SEMANTIC_STROKE = new Set(['stroke-contrast']);
  // The icon channel is text-shaped (ink, tile, under-field), the way
  // utilities/_image.scss paints img.image--adaptive, so it projects onto the
  // same properties the .text--* roles use and reads back the same three.
  const SEMANTIC_ICON = new Set(['icon']);

  const TRMNLPaint = {
    /**
     * Resolve a background token (`bg--<token>`) to a Fill for the target screen's
     * mode/theme. Solid modes yield a color-only Fill; dither modes yield a Fill
     * with a tile `url`/`image`/`size`.
     *
     * @param {string} token - e.g. 'black', 'gray-40', 'red-55'
     * @param {{el?: (string|Element)}} [opts]
     * @returns {{color: string|null, image: string|null, url: string|null, size: number|null}}
     */
    bg(token, opts) {
      const screen = resolveScreen(opts && opts.el);
      if (!screen) return emptyFill();
      const context = resolvePaintContext(opts && opts.el, screen);
      const b = probe('bg--' + token, context, readBg);
      return makeFill(b.image, b.color, b.size, screen);
    },

    /**
     * Resolve a text token (`text--<token>`) to a Fill. Text paints via
     * background-clip:text, so the ink can ride the background image while `color`
     * is transparent, so both are read. `color` is the flat ink where the mode has
     * one.
     *
     * @param {string} token
     * @param {{el?: (string|Element)}} [opts]
     * @returns {{color, image, url, size}}
     */
    text(token, opts) {
      const screen = resolveScreen(opts && opts.el);
      if (!screen) return emptyFill();
      const context = resolvePaintContext(opts && opts.el, screen);
      const t = probe('text--' + token, context, (cs) => ({ color: cs.color, image: cs.backgroundImage, size: cs.backgroundSize }));
      return makeFill(t.image, t.color, t.size, screen);
    },

    /**
     * Resolve a stroke token (`text-stroke text-stroke--<token>`) to a color-only
     * Fill. The stroke utility renders via text-shadow rings and stores its color
     * in --tn-text-stroke-color; the probe re-exposes that through a standard
     * `color` property so the browser resolves it to a concrete rgb.
     *
     * @param {string} token
     * @param {{el?: (string|Element)}} [opts]
     * @returns {{color, image, url, size}}
     */
    stroke(token, opts) {
      const screen = resolveScreen(opts && opts.el);
      if (!screen) return emptyFill();
      const context = resolvePaintContext(opts && opts.el, screen);
      const color = probe(
        'text-stroke text-stroke--' + token,
        context,
        (cs) => cs.color,
        'color:var(--tn-text-stroke-color, currentColor);'
      );
      return makeFill(null, color, null, screen);
    },

    /**
     * Resolve a framework semantic slot to a complete Fill. Utility-backed roles
     * are probed through their real class. Fill/border/stroke/icon roles without
     * a public utility class are projected onto standard CSS properties from
     * their public --framework-semantic-* channels, then read through computed
     * style. No role is reduced to a color-only alias.
     *
     * @param {string} slot
     * @param {{el?: (string|Element)}} [opts]
     * @returns {{color, image, url, size}}
     */
    semantic(slot, opts) {
      const screen = resolveScreen(opts && opts.el);
      if (!screen) return emptyFill();
      const context = resolvePaintContext(opts && opts.el, screen);
      const cls = SEMANTIC_PROBE[slot];
      if (cls) {
        if (cls.indexOf('text--') === 0) {
          const t = probe(cls, context, (cs) => ({ color: cs.color, image: cs.backgroundImage, size: cs.backgroundSize }));
          return makeFill(t.image, t.color, t.size, screen);
        }
        const b = probe(cls, context, readBg);
        return makeFill(b.image, b.color, b.size, screen);
      }
      if (SEMANTIC_BG.has(slot)) {
        const base = '--framework-semantic-' + slot + '-bg-';
        const b = probe('', context, readBg,
          'background-color:var(' + base + 'color);' +
          'background-image:var(' + base + 'image);' +
          'background-size:var(--dither-bg-size, auto);');
        return makeFill(b.image, b.color, b.size, screen);
      }
      if (SEMANTIC_BORDER.has(slot)) {
        const base = '--framework-semantic-' + slot + '-border-';
        const b = probe('', context, readBg,
          'background-color:var(' + base + 'color);' +
          'background-image:var(' + base + 'image);' +
          'background-size:var(' + base + 'size);');
        return makeFill(b.image, b.color, b.size, screen);
      }
      if (SEMANTIC_STROKE.has(slot)) {
        const name = '--framework-semantic-' + slot + '-stroke-color';
        const color = probe('', context, (cs) => cs.color, 'color:var(' + name + ');');
        return makeFill(null, color, null, screen);
      }
      if (SEMANTIC_ICON.has(slot)) {
        const base = '--framework-semantic-' + slot + '-';
        const t = probe('', context, (cs) => ({ color: cs.color, image: cs.backgroundImage, size: cs.backgroundSize }),
          'color:var(' + base + 'color, var(--framework-semantic-text-primary-text-color, currentColor));' +
          'background-color:var(' + base + 'under, transparent);' +
          'background-image:var(' + base + 'image, none);' +
          'background-size:var(--dither-bg-size, auto);');
        return makeFill(t.image, t.color, t.size, screen);
      }
      return emptyFill();
    },

    /**
     * Resolve a text utility to the one-color value required by renderers that
     * cannot clip CSS background paint into glyphs. The caller names the actual
     * text token; this method performs no semantic-role selection. Solid modes
     * return computed `color`; clipped tile modes return the SVG tile's painted
     * ink, never its under-field.
     *
     * @param {string} token - e.g. 'default', 'muted', 'black'
     * @param {{el?: (string|Element)}} [opts]
     * @returns {string|null}
     */
    textColor(token, opts) {
      return textFillInk(TRMNLPaint.text(token, opts));
    },

    /**
     * Resolve the fill for series `i` of `count` from the framework's chart-series
     * ramp (--framework-chart-series-<n>-{color,image}). The ramp runs from the
     * screen's ink toward its canvas: grayscale on Default, the theme's own
     * ink→canvas ramp under a theme. `count` series are spread across the legible
     * front of the ramp; the legible span is the public --framework-chart-series-
     * span var (themes narrow it from CSS; no theme sniffing or JS default).
     *
     * @param {number} i - 0-based series index
     * @param {number} count - total number of series
     * @param {{el?: (string|Element)}} [opts]
     * @returns {{color, image, url, size}}
     */
    series(i, count, opts) {
      const screen = resolveScreen(opts && opts.el);
      if (!screen) return emptyFill();
      const context = resolvePaintContext(opts && opts.el, screen);
      const cs = viewFor(context).getComputedStyle(context);
      // mixins/_theme-slots.scss:chart-series-ramp publishes the slot count, the
      // span and the paint slots from one Sass constant, and keeps the span
      // inside the ramp it declared. An absent count or span is an absent CSS
      // rule, not permission for JS to invent one.
      const slots = chartSeriesSlotCount(cs);
      if (!slots) return emptyFill();
      const span = parseFloat(cs.getPropertyValue('--framework-chart-series-span'));
      if (!(span >= 0)) return emptyFill();
      const n = Math.trunc(Number(count));
      const seriesIndex = Math.trunc(Number(i));
      if (!(n > 0) || !Number.isFinite(seriesIndex)) return emptyFill();
      const idx = ((seriesIndex % n) + n) % n;
      let pos = n <= 1 ? 0 : Math.round((idx * span) / (n - 1));
      if (pos < 0) pos = 0;
      if (pos > slots - 1) pos = slots - 1;
      const color = cs.getPropertyValue('--framework-chart-series-' + pos + '-color').trim();
      const image = cs.getPropertyValue('--framework-chart-series-' + pos + '-image').trim();
      return makeFill(image, color, null, screen);
    },

    /**
     * The chart-series ramp as an array of Fills, one per slot CSS declared.
     *
     * @param {{el?: (string|Element)}} [opts]
     * @returns {Array<{color, image, url, size}>}
     */
    ramp(opts) {
      const screen = resolveScreen(opts && opts.el);
      const out = [];
      if (!screen) return out;
      const context = resolvePaintContext(opts && opts.el, screen);
      const cs = viewFor(context).getComputedStyle(context);
      const slots = chartSeriesSlotCount(cs);
      for (let i = 0; i < slots; i++) {
        const color = cs.getPropertyValue('--framework-chart-series-' + i + '-color').trim();
        const image = cs.getPropertyValue('--framework-chart-series-' + i + '-image').trim();
        out.push(makeFill(image, color, null, screen));
      }
      return out;
    },

    /**
     * Generic escape hatch: the trimmed computed value of a CSS custom property on
     * the requested context. Public var families only. The minified bundle
     * (plugins.min.css, the file production serves) renames six private families:
     * --_*, --framework-internal-*, --tile-*, --bline-{n}, --border-* and --tn-*.
     * Two of those keep a preserved subset: the theme-contract border slots
     * (--border-1..7-*, --border-token-*, --border-line-*) and the three
     * --tn-text-stroke-* names the runtime reads. Every other name in those families
     * returns '' against the minified bundle; the readable plugins.css keeps the
     * source names.
     *
     * @param {string} name - e.g. '--framework-fill-strong'
     * @param {{el?: (string|Element)}} [opts]
     * @returns {string}
     */
    cssVar(name, opts) {
      const screen = resolveScreen(opts && opts.el);
      if (!screen) return '';
      const context = resolvePaintContext(opts && opts.el, screen);
      return viewFor(context).getComputedStyle(context).getPropertyValue(name).trim();
    },

    /**
     * Paint a node's background from a Fill, compositing
     * the field color under the tile image with normal CSS two-layer painting,
     * the same way legend swatches and the rest of the screen paint.
     *
     * @param {Element} node
     * @param {{color, image, url, size}} fill
     */
    apply(node, fill) {
      if (!node) return;
      if (!fill) return;
      // utilities/_background.scss:apply-bg-paint-vars for the color, image and
      // size; the tiling comes from the normalize layer in framework/index.scss,
      // which includes mixins/_crisp-edges.scss:dither-ready on every bg-- and
      // text-- element for background-repeat: repeat.
      node.style.backgroundColor = fill.color || 'transparent';
      if (fill.image) {
        node.style.backgroundImage = fill.image;
        if (fill.size != null) node.style.backgroundSize = fill.size + 'px';
        node.style.backgroundRepeat = 'repeat';
      } else {
        node.style.backgroundImage = 'none';
      }
    },

    /**
     * The nearest .screen for a target element (or the first .screen).
     *
     * @param {(string|Element)} [el]
     * @returns {Element|null}
     */
    screen(el) {
      return resolveScreen(el);
    },

    /**
     * Read the resolved scale contract from the target screen. CSS remains the
     * source of truth: probe widths force the browser to evaluate custom-property
     * expressions before JavaScript sees the numeric factors.
     *
     * @param {{el?: (string|Element)}} [opts]
     * @returns {{name: string|null, device: number, modifier: number, ui: number, content: number, textName: string|null, textModifier: number, textUi: number}}
     */
    scale(opts) {
      const screen = resolveScreen(opts && opts.el);
      return {
        name: screenScaleName(screen),
        device: resolvedScaleFactor(screen, '--device-ui-scale'),
        modifier: resolvedScaleFactor(screen, '--modifier-scale'),
        ui: resolvedScaleFactor(screen, '--ui-scale'),
        content: resolvedScaleFactor(screen, '--content-scale'),
        textName: screenTextScaleName(screen),
        textModifier: resolvedScaleFactor(screen, '--modifier-text-scale'),
        textUi: resolvedScaleFactor(screen, '--text-ui-scale'),
      };
    },

    /**
     * Scale a numeric CSS-pixel dimension, or an array of dimensions, through
     * the live screen cascade. Content scale is the default for plugin-authored
     * layout; pass {kind:'ui'} for Framework-owned component geometry or
     * {kind:'text'} for Framework typography.
     *
     * @param {(number|Array<number>)} value
     * @param {{el?: (string|Element), kind?: ('content'|'ui'|'text')}} [opts]
     * @returns {(number|Array<number>)}
     */
    px(value, opts) {
      const screen = resolveScreen(opts && opts.el);
      const kind = opts && opts.kind;
      const propertyName = kind === 'ui' ? '--ui-scale' : (kind === 'text' ? '--text-ui-scale' : '--content-scale');
      const factor = resolvedScaleFactor(screen, propertyName);
      const scaled = (entry) => Number.isFinite(entry) ? entry * factor : entry;
      return Array.isArray(value) ? value.map(scaled) : scaled(value);
    },

    /**
     * Run `onChange` now (unless {immediate:false}) and again whenever the
     * device/scale/mode/dark/theme classes change on the screen or on any
     * ancestor the cascade gates paint from. Returns a stop() function.
     *
     * @param {(string|Element)} el
     * @param {() => void} onChange
     * @param {{immediate?: boolean}} [opts]
     * @returns {() => void}
     */
    watch(el, onChange, opts) {
      const screen = resolveScreen(el);
      const immediate = !(opts && opts.immediate === false);
      if (immediate) { try { onChange(); } catch (err) { console.error('TRMNLPaint.watch callback threw:', err); } }
      if (!screen) return function stop() {};
      let signature = screenSignature(screen);
      const observer = new (viewFor(screen).MutationObserver)(() => {
        const next = screenSignature(screen);
        if (next === signature) return;
        signature = next;
        try { onChange(); } catch (err) { console.error('TRMNLPaint.watch callback threw:', err); }
      });
      // One observer over every node the signature reads. A wrapper-gated mode
      // block repaints the whole screen from an ancestor's class attribute, so
      // watching the screen alone would sleep through it.
      for (const node of screenSignatureNodes(screen)) {
        observer.observe(node, { attributes: true, attributeFilter: ['class'] });
      }
      return function stop() { try { observer.disconnect(); } catch (_) {} };
    },

    /**
     * Adapter: shape a Fill for Highcharts. Solid Fills return a flat color string;
     * tile Fills return a { pattern: { image, width, height, backgroundColor } }.
     * The field color is composited INTO the pattern image (self-contained tile),
     * with backgroundColor kept as belt-and-braces. An empty Fill returns null.
     *
     * @param {{color, image, url, size}} fill
     * @returns {string|{pattern: object}|null}
     */
    toHighcharts(fill) {
      if (!fill || (!fill.url && !fill.color)) return null;
      if (!fill.url) return fill.color;
      const fieldHex = normalizeHex(fill.color);
      const image = fieldHex ? compositeFieldIntoTile(fill.url, fieldHex) : fill.url;
      const px = fill.size || svgExtent(fill.url, 'width');
      if (!(px > 0)) return fill.color;
      return { pattern: { image: image, width: px, height: px, backgroundColor: fill.color || undefined } };
    },

    /**
     * Resolve a framework border utility (`border--{h|v}-<spec>`) to a BorderFill
     * for the target screen's mode/theme. Border art paints as *background* on a
     * pseudo-element (::before for h, ::after for v); the five background longhands
     * are kept VERBATIM as strings (dither sizes/positions are list-valued).
     *
     * spec: a literal framework rail suffix, a shade step from 10 to 75, 'black', or 'white'.
     * These fill-backed utilities carry real ink in every mode incl. dark, so use
     * this for guaranteed hairlines, not the transparent semantic('border-*') slot.
     *
     * @param {(number|string)} spec
     * @param {{dir?: ('h'|'v'), el?: (string|Element)}} [opts]
     * @returns {{color, image, url, size, position, repeat, render, dir}}
     */
    border(spec, opts) {
      const dir = opts && opts.dir === 'v' ? 'v' : 'h';
      const screen = resolveScreen(opts && opts.el);
      if (!screen) return emptyBorderFill(dir);
      const context = resolvePaintContext(opts && opts.el, screen);
      const s = spec == null ? '' : String(spec).trim();
      const pseudo = dir === 'v' ? '::after' : '::before';
      const raw = probePseudo('border--' + dir + '-' + s, context, readBorder, pseudo);
      return makeBorderFill(raw, dir);
    },

    /**
     * Resolve the framework `.divider` rail (level-6 hairline painted on the box
     * itself) to a BorderFill. `dir:'v'` probes `.divider--v`.
     *
     * @param {{dir?: ('h'|'v'), el?: (string|Element)}} [opts]
     * @returns {{color, image, url, size, position, repeat, render, dir}}
     */
    divider(opts) {
      const dir = opts && opts.dir === 'v' ? 'v' : 'h';
      const screen = resolveScreen(opts && opts.el);
      if (!screen) return emptyBorderFill(dir);
      const context = resolvePaintContext(opts && opts.el, screen);
      const cls = dir === 'v' ? 'divider divider--v' : 'divider divider--h';
      const raw = probe(cls, context, readBorder);
      return makeBorderFill(raw, dir);
    },

    /**
     * Resolve a typography role/class to a TypeSpec containing the exact computed
     * font and text-paint longhands. Roles:
     * 'chart-label' -> text--small; 'value'/'label'/'title'/'description' ->
     * themselves; any other string is a literal class pass-through. Pass
     * {stroke:<sizeToken>|true} to also resolve the matching text-stroke.
     *
     * @param {string} classOrRole
     * @param {{el?: (string|Element), stroke?: (string|boolean)}} [opts]
     * @returns {{fontFamily, fontSize, fontWeight, fontStyle, fontVariantNumeric, fontVariationSettings, webkitFontSmoothing, letterSpacing, lineHeight, color, backgroundColor, backgroundImage, backgroundSize, backgroundPosition, backgroundRepeat, clip, textShadow, filter, overflow, stroke}}
     */
    type(classOrRole, opts) {
      const screen = resolveScreen(opts && opts.el);
      if (!screen) return emptyTypeSpec();
      const context = resolvePaintContext(opts && opts.el, screen);
      const key = classOrRole == null ? '' : String(classOrRole).trim();
      const cls = Object.prototype.hasOwnProperty.call(TYPE_ROLE, key) ? TYPE_ROLE[key] : key;
      const strokeToken = opts && opts.stroke && opts.stroke !== true ? opts.stroke : null;
      const strokeClass = opts && opts.stroke
        ? ' text-stroke' + (strokeToken ? ' text-stroke--' + strokeToken : '')
        : '';
      const t = probe((cls + strokeClass).trim(), context, readType);
      const spec = {
        fontFamily: t.fontFamily || null,
        fontSize: t.fontSize || null,
        fontWeight: t.fontWeight || null,
        fontStyle: t.fontStyle || null,
        fontVariantNumeric: t.fontVariantNumeric || null,
        fontVariationSettings: t.fontVariationSettings || null,
        webkitFontSmoothing: t.webkitFontSmoothing || null,
        letterSpacing: t.letterSpacing || null,
        lineHeight: t.lineHeight || null,
        color: t.color || null,
        backgroundColor: t.backgroundColor || null,
        backgroundImage: t.backgroundImage || null,
        backgroundSize: t.backgroundSize || null,
        backgroundPosition: t.backgroundPosition || null,
        backgroundRepeat: t.backgroundRepeat || null,
        clip: t.clip || null,
        textShadow: t.textShadow || null,
        filter: t.filter || null,
        overflow: t.overflow || null,
        stroke: null,
      };
      if (opts && opts.stroke) {
        spec.stroke = TRMNLPaint.strokeSpec(strokeToken, { el: opts.el });
      }
      return spec;
    },

    /**
     * Resolve a text-stroke size to its concrete {color, width, radius}. Probes
     * `.text-stroke text-stroke--<sizeToken>` (or just `.text-stroke` when no size
     * token) and reads the public --tn-text-stroke-width/-radius vars plus the
     * color re-exposed through a standard `color` property.
     *
     * @param {(string|null)} sizeToken - 'small'|'medium'|'large'|'xlarge'|null
     * @param {{el?: (string|Element)}} [opts]
     * @returns {{color: string|null, width: string|null, radius: string|null}}
     */
    strokeSpec(sizeToken, opts) {
      const screen = resolveScreen(opts && opts.el);
      if (!screen) return { color: null, width: null, radius: null };
      const context = resolvePaintContext(opts && opts.el, screen);
      const cls = 'text-stroke' + (sizeToken ? ' text-stroke--' + sizeToken : '');
      return probe(
        cls,
        context,
        (cs) => ({
          color: isOpaqueColor(cs.color) ? cs.color : null,
          width: cs.width || null,
          radius: cs.height || null,
        }),
        'color:var(--tn-text-stroke-color, currentColor);' +
        'width:var(--tn-text-stroke-width, 0px);' +
        'height:var(--tn-text-stroke-radius, 0px);'
      );
    },

    /**
     * Paint a node's border/background from a BorderFill, writing the five
     * background longhands VERBATIM (no parseFloat, because dither sizes/positions are
     * list-valued strings). Solid fills clear the image; image fills keep the
     * resolved color as the composited field.
     *
     * @param {Element} node
     * @param {{color, image, url, size, position, repeat, dir}} fill
     */
    applyBorder(node, fill) {
      if (!node || !fill) return;
      node.style.backgroundColor = fill.color || 'transparent';
      node.style.backgroundImage = fill.image || 'none';
      if (fill.size != null) node.style.backgroundSize = fill.size;
      if (fill.position != null) node.style.backgroundPosition = fill.position;
      if (fill.repeat != null) node.style.backgroundRepeat = fill.repeat;
    },

    /**
     * Apply every computed TypeSpec longhand to a node: font, CSS text paint, clip,
     * and (when requested by type()) the resolved 16-ring text-shadow program.
     * This is a lossless round-trip of the probed utility, not a font-only helper.
     *
     * @param {Element} node
     * @param {{fontFamily, fontSize, fontWeight, fontStyle, fontVariantNumeric, fontVariationSettings, webkitFontSmoothing, letterSpacing, lineHeight, color, backgroundColor, backgroundImage, backgroundSize, backgroundPosition, backgroundRepeat, clip, textShadow, filter, overflow}} spec
     */
    applyType(node, spec) {
      if (!node || !spec) return;
      if (spec.fontFamily != null) node.style.fontFamily = spec.fontFamily;
      if (spec.fontSize != null) node.style.fontSize = spec.fontSize;
      if (spec.fontWeight != null) node.style.fontWeight = spec.fontWeight;
      if (spec.fontStyle != null) node.style.fontStyle = spec.fontStyle;
      if (spec.fontVariantNumeric != null) node.style.fontVariantNumeric = spec.fontVariantNumeric;
      if (spec.fontVariationSettings != null) node.style.fontVariationSettings = spec.fontVariationSettings;
      if (spec.webkitFontSmoothing != null) node.style.webkitFontSmoothing = spec.webkitFontSmoothing;
      if (spec.letterSpacing != null) node.style.letterSpacing = spec.letterSpacing;
      if (spec.lineHeight != null) node.style.lineHeight = spec.lineHeight;
      if (spec.color != null) node.style.color = spec.color;
      if (spec.backgroundColor != null) node.style.backgroundColor = spec.backgroundColor;
      if (spec.backgroundImage != null) node.style.backgroundImage = spec.backgroundImage;
      if (spec.backgroundSize != null) node.style.backgroundSize = spec.backgroundSize;
      if (spec.backgroundPosition != null) node.style.backgroundPosition = spec.backgroundPosition;
      if (spec.backgroundRepeat != null) node.style.backgroundRepeat = spec.backgroundRepeat;
      if (spec.clip != null) {
        node.style.webkitBackgroundClip = spec.clip;
        node.style.backgroundClip = spec.clip;
      }
      if (spec.textShadow != null) node.style.textShadow = spec.textShadow;
      if (spec.filter != null) node.style.filter = spec.filter;
      if (spec.overflow != null) node.style.overflow = spec.overflow;
    },

    /**
     * Adapter: shape a BorderFill into Highcharts axis/grid line options. CSS has
     * already declared both the fallback stroke and any SVG pattern program;
     * this method merely passes those values to Highcharts and the render hook.
     *
     * @param {{color, image, url, size, position, repeat, dir}} fill
     * @returns {{gridLineColor, gridLineWidth, gridLineDashStyle, lineColor, tickColor}}
     */
    toHighchartsAxis(fill) {
      const line = fill && fill.render && fill.render.stroke;
      return {
        gridLineColor: line,
        gridLineWidth: 1,
        gridLineDashStyle: 'Solid',
        lineColor: line,
        tickColor: line,
        _trmnlPattern: fill && (fill.image || fill.color) ? fill : null,
      };
    },

    /**
     * Apply resolved axis/grid BorderFills to a rendered Highcharts chart. This
     * keeps CSS-to-SVG paint conversion inside TRMNLPaint; TRMNLCharts only passes
     * through the fills returned by border()/toHighchartsAxis().
     *
     * @param {object} chart
     * @param {{xGrid, yGrid, axis}} fills
     */
    applyHighchartsAxisPaint(chart, fills) {
      paintChartAxisPatterns(chart, fills);
    },

    /**
     * Adapter: shape a TypeSpec into a Highcharts text style. Uses the solid color
     * or the SVG tile's actual ink fill (the one-color counterpart of CSS
     * background-clip:text). Emits
     * textOutline:'none' unless the spec carries an opaque stroke. The 'none'
     * value kills Highcharts' default 1px 'contrast' white halo on dataLabels.
     * lineHeight is omitted (SVG text ignores it).
     *
     * @param {{fontFamily, fontSize, fontWeight, fontStyle, fontVariantNumeric, fontVariationSettings, webkitFontSmoothing, letterSpacing, color, stroke}} spec
     * @returns {{fontFamily?, fontSize?, fontWeight?, fontStyle?, fontVariantNumeric?, fontVariationSettings?, webkitFontSmoothing?, letterSpacing?, color, textOutline}}
     */
    toHighchartsText(spec) {
      const s = spec || {};
      const out = {
        color: (isOpaqueColor(s.color) && s.color) || imageInk(firstUrl(s.backgroundImage)) || null,
        textOutline: 'none',
      };
      if (s.stroke && isOpaqueColor(s.stroke.color)) {
        // utilities/_text_stroke.scss publishes the resolved width through
        // --tn-text-stroke-width; if it is absent there is no CSS stroke rule
        // to synthesize here.
        if (s.stroke.width) out.textOutline = s.stroke.width + ' ' + s.stroke.color;
      }
      if (s.fontFamily) out.fontFamily = s.fontFamily;
      if (s.fontSize) out.fontSize = s.fontSize;
      if (s.fontWeight) out.fontWeight = s.fontWeight;
      if (s.fontStyle) out.fontStyle = s.fontStyle;
      if (s.fontVariantNumeric) out.fontVariantNumeric = s.fontVariantNumeric;
      if (s.fontVariationSettings) out.fontVariationSettings = s.fontVariationSettings;
      if (s.webkitFontSmoothing) out.webkitFontSmoothing = s.webkitFontSmoothing;
      if (s.letterSpacing) out.letterSpacing = s.letterSpacing;
      return out;
    },
  };

  // Build one axis's default config from pre-resolved framework specs:
  // { grid: {gridLineColor,gridLineWidth,gridLineDashStyle}, axisLine:
  // {lineColor,tickColor}, label: <HC text style>, axisTitle: <HC text style> }.
  function axisDefaults(specs) {
    return {
      labels: { style: specs.label },
      lineColor: specs.axisLine.lineColor,
      tickColor: specs.axisLine.tickColor,
      gridLineColor: specs.grid.gridLineColor,
      gridLineWidth: specs.grid.gridLineWidth,
      gridLineDashStyle: specs.grid.gridLineDashStyle,
      title: { text: null, style: specs.axisTitle },
    };
  }

  // TRMNLCharts, the Highcharts composition layer built on TRMNLPaint. It owns no
  // paint resolution or conversion: every paint value and renderer-specific
  // transformation comes from TRMNLPaint.
  const TRMNLCharts = {
    /**
     * Resolve a token to a Highcharts fill for the target screen's mode/theme.
     * Solid modes return a flat color string; dither modes return a pattern object
     * (requires the Highcharts pattern-fill module).
     *
     * @param {string} token - e.g. 'black', 'gray-5', 'red-40'
     * @param {{el?: (string|Element)}} [opts]
     * @returns {string|{pattern: object}|null}
     */
    paint(token, opts) {
      return TRMNLPaint.toHighcharts(TRMNLPaint.bg(token, opts));
    },

    /**
     * Resolve the Highcharts fill for series `i` of `count` from the framework's
     * chart-series ramp. A dither pattern in 1-/2-bit modes, a flat color in solid
     * modes.
     *
     * @param {number} i - 0-based series index
     * @param {number} count - total number of series in the chart
     * @param {{el?: (string|Element)}} [opts]
     * @returns {string|{pattern: object}|null}
     */
    series(i, count, opts) {
      const el = opts && opts.el;
      return TRMNLPaint.toHighcharts(TRMNLPaint.series(i, count, { el: el }));
    },

    /**
     * Paint legend swatches from the same ramp the chart series use, so marker and
     * series stay in lockstep in every mode and theme. Targets any element under
     * the screen carrying data-chart-series="<i>" (with an optional
     * data-chart-series-count="<n>"; defaults to the number of marks). Call it
     * whenever the chart (re)builds, e.g. inside a watch() build function.
     *
     * @param {{el?: (string|Element)}} [opts]
     */
    applySwatches(opts) {
      const el = opts && opts.el;
      const screen = TRMNLPaint.screen(el);
      if (!screen) return;
      const marks = Array.prototype.slice.call(screen.querySelectorAll('[data-chart-series]'));
      const total = marks.length;
      for (const node of marks) {
        const i = parseInt(node.getAttribute('data-chart-series'), 10) || 0;
        const n = parseInt(node.getAttribute('data-chart-series-count'), 10) || total;
        TRMNLPaint.apply(node, TRMNLPaint.series(i, n, { el: node }));
      }
    },

    /**
     * Highcharts grid-line options from the framework's muted themed hairline
     * (border step 65). yAxis horizontal grid -> {dir:'h'} (default); xAxis
     * vertical grid -> {dir:'v'}. The computed two-layer rhythm is retained.
     *
     * @param {{el?: (string|Element), dir?: ('h'|'v')}} [opts]
     * @returns {{gridLineColor, gridLineWidth, gridLineDashStyle}}
     */
    grid(opts) {
      const el = opts && opts.el;
      const dir = opts && opts.dir === 'v' ? 'v' : 'h';
      const fill = TRMNLPaint.border(65, { el: el, dir: dir });
      const axis = TRMNLPaint.toHighchartsAxis(fill);
      return {
        gridLineColor: axis.gridLineColor,
        gridLineWidth: axis.gridLineWidth,
        gridLineDashStyle: axis.gridLineDashStyle,
        _trmnlPattern: axis._trmnlPattern,
      };
    },

    /**
     * Highcharts axis/tick line options from the framework's strong border rail.
     * Both axis and tick share its resolved paint.
     *
     * @param {{el?: (string|Element)}} [opts]
     * @returns {{lineColor, tickColor}}
     */
    axisLine(opts) {
      const el = opts && opts.el;
      const fill = TRMNLPaint.border('black', { el: el });
      const axis = TRMNLPaint.toHighchartsAxis(fill);
      return { lineColor: axis.lineColor, tickColor: axis.tickColor, _trmnlPattern: axis._trmnlPattern };
    },

    /**
     * Highcharts text style for a typography role (see TRMNLPaint.type): resolved
     * font properties, opaque ink color, and textOutline 'none' by default (kills
     * the dataLabel halo). Pass {stroke:<token>} to emit an intentional outline.
     *
     * @param {string} role
     * @param {{el?: (string|Element), stroke?: (string|boolean)}} [opts]
     * @returns {{fontFamily?, fontSize?, fontWeight?, fontStyle?, fontVariantNumeric?, fontVariationSettings?, webkitFontSmoothing?, letterSpacing?, color, textOutline}}
     */
    textStyle(role, opts) {
      const el = opts && opts.el;
      const stroke = opts && opts.stroke;
      const spec = TRMNLPaint.type(role, { el: el, stroke: stroke });
      return TRMNLPaint.toHighchartsText(spec);
    },

    /**
     * Deep-merge plain objects (arrays and scalars replace). Layer a chart's own
     * config over the recommended defaults.
     */
    merge(base, overrides) {
      if (!isPlainObject(base) || !isPlainObject(overrides)) {
        return overrides === undefined ? base : overrides;
      }
      const out = Object.assign({}, base);
      for (const key of Object.keys(overrides)) {
        out[key] = TRMNLCharts.merge(base[key], overrides[key]);
      }
      return out;
    },

    /**
     * Recommended Highcharts options for the TRMNL aesthetic: transparent
     * background, no animation (the screenshot renderer can't capture it), no
     * chrome, and framework-resolved axes/type. Layer chart.type/height and series
     * on top with TRMNLCharts.merge().
     *
     * @param {{el?: (string|Element)}} [opts]
     */
    options(opts) {
      const el = opts && opts.el;
      // Resolve every framework spec ONCE per call.
      const label = TRMNLCharts.textStyle('chart-label', { el: el });
      const axisTitle = TRMNLCharts.textStyle('label', { el: el });
      const axisLine = TRMNLCharts.axisLine({ el: el });
      const gridH = TRMNLCharts.grid({ el: el, dir: 'h' });
      const gridV = TRMNLCharts.grid({ el: el, dir: 'v' });
      const legendStyle = TRMNLCharts.textStyle('chart-label', { el: el });
      const titleStyle = TRMNLCharts.textStyle('title', { el: el });
      // textStyle() already carries the resolved chart-label color and explicit
      // no-halo rule. Do not replace either with a separate generic ink lookup.
      const dataLabel = TRMNLCharts.textStyle('chart-label', { el: el });
      const borderFills = {
        xGrid: gridV._trmnlPattern,
        yGrid: gridH._trmnlPattern,
        axis: axisLine._trmnlPattern,
      };
      return {
        chart: {
          animation: false,
          backgroundColor: 'transparent',
          events: {
            // Highcharts builds axes from the flat color above; once its SVG
            // exists, replace strokes with the computed CSS pattern. Re-run on
            // every redraw so newly-created grid/tick paths stay in parity.
            render: function () { TRMNLPaint.applyHighchartsAxisPaint(this, borderFills); },
          },
        },
        title: { text: null, style: titleStyle },
        credits: { enabled: false },
        tooltip: { enabled: false },
        legend: { enabled: false, itemStyle: legendStyle },
        plotOptions: {
          series: {
            animation: false,
            enableMouseTracking: false,
            states: { hover: { enabled: false } },
            marker: { enabled: false },
            dataLabels: { style: dataLabel },
          },
        },
        xAxis: axisDefaults({ grid: gridV, axisLine: axisLine, label: label, axisTitle: axisTitle }),
        yAxis: axisDefaults({ grid: gridH, axisLine: axisLine, label: label, axisTitle: axisTitle }),
      };
    },

    /**
     * Build a chart now and rebuild it when the screen's mode/dark/theme classes
     * change (e.g. a dark-mode toggle). buildFn should create and return the chart
     * instance (Highcharts.chart(...) returns one); the previous instance is
     * destroyed before each rebuild. Returns a stop() function that disconnects
     * the observer and destroys the live chart.
     *
     * @param {(string|Element)} el - chart container (id or element)
     * @param {() => any} buildFn
     * @returns {() => void}
     */
    watch(el, buildFn) {
      let chart = null;
      const destroy = () => {
        try { if (chart && typeof chart.destroy === 'function') chart.destroy(); } catch (_) {}
        chart = null;
      };
      const build = () => {
        destroy();
        chart = buildFn() || null;
      };
      const stopObserving = TRMNLPaint.watch(el, build, { immediate: true });
      // TRMNLPaint.watch's stop only disconnects the observer. Without the
      // destroy the last chart outlives the watch, keeping its Highcharts DOM,
      // its SVG pattern defs and its own resize listeners alive.
      return function stop() {
        stopObserving();
        destroy();
      };
    },
  };

  window.TRMNLPaint = TRMNLPaint;
  window.TRMNLCharts = TRMNLCharts;
})();

/**
 * Auto-execute terminalize depending on environment:
 * - In Framework docs: wait for frameworkReady, or run immediately if already ready
 * - Outside Framework: run when DOM is ready (DOMContentLoaded) or immediately if already ready
 */
(function autoRunTerminalize() {
  const inFrameworkDocs = !!window.__TRMNL_FRAMEWORK_BUILD__;
  if (inFrameworkDocs && window.__TRMNL_FRAMEWORK_PARENT_TERMINALIZE__ === false) {
    window.TRMNL_PLUGINS_READY = true;
    return;
  }
  // Re-run when screen classes change (e.g., Orientation/Size/Text Scale toggles)
  try {
    const screenClassSignatures = new WeakMap();
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          const el = m.target;
          if (el.classList && el.classList.contains('screen')) {
            const nextSignature = String(el.className || '')
              .split(/\s+/)
              .filter((c) => c === 'screen' || /^screen--/.test(c))
              .sort()
              .join(' ');
            const prevSignature = screenClassSignatures.get(el);
            if (prevSignature === nextSignature) continue;
            screenClassSignatures.set(el, nextSignature);
            scheduleTerminalize();
            break;
          }
        }
      }
    });
    observer.observe(document.documentElement || document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  } catch (_) {}
  if (inFrameworkDocs) {
    if (window.frameworkReady) {
      scheduleTerminalize();
    } else {
      window.addEventListener('trmnl:framework:ready', scheduleTerminalize, { once: true });
    }
    return;
  }
  // Run once after full page load so images and subresources are available
  if (document.readyState === 'complete') {
    scheduleTerminalize();
  } else {
    window.addEventListener('load', scheduleTerminalize, { once: true });
  }
})();

// Version marker. The release pipeline rewrites this literal with the version it
// cuts (lib/projs/projs.cjs --stamp, run from ReleaseTask for both the plain and
// the minified bundle), so every published /js/<ver>/plugins.js reports its own
// version and a pinned or cached file is identifiable. A working checkout ships
// 'source': read window.__TRMNL_BUILD__ when an edit does not show up.
window.__TRMNL_BUILD__ = 'plugins.js source';
debugLog('[TRMNL] Build:', window.__TRMNL_BUILD__);
})();
