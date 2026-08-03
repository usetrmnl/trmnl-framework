/**
 * Screen context helper
 * Returns current screen size (sm|md|lg), orientation (landscape|portrait),
 * bitDepth (1|2|4|8|16), scale (xsmall|small|regular|large|xlarge),
 * and a flag is2BitAndUp.
 */
function getScreenContext() {
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

    // Bit depth
    if (screen.classList.contains('screen--4bit')) bitDepth = 4;
    else if (screen.classList.contains('screen--2bit')) bitDepth = 2;
    else if (screen.classList.contains('screen--8bit')) bitDepth = 8;
    else if (screen.classList.contains('screen--16bit')) bitDepth = 16;

    // Scale
    const scales = ['xsmall', 'small', 'regular', 'large', 'xlarge'];
    for (const s of scales) {
      if (screen.classList.contains(`scale--${s}`) || screen.classList.contains(`screen--scale-${s}`)) {
        scale = s;
        break;
      }
    }
    if (!scale && screen.dataset && screen.dataset.scale) {
      scale = String(screen.dataset.scale);
    }
  }

  return {
    size,
    orientation,
    bitDepth,
    scale,
    is2BitAndUp: bitDepth >= 2
  };
}

/**
 * Check if the screen is 2-bit or higher.
 * This is used to skip certain adjustments when the 2-bit or 4-bit screen mode is active.
 */
function isScreen2BitAndUp() {
  return getScreenContext().is2BitAndUp;
}

// Lightweight observer to avoid rescanning all index spans on every terminalize()
let __indexWidthObserver = null;
const __observedIndexSpans = new WeakSet();
let __indexWidthScheduled = false;
const __indexWidthDirty = new Set();
const __indexLastAppliedWidth = new WeakMap();
const __indexMeasuredWidth = new WeakMap();
let __indexMutationObserver = null;
let __indexWidthsWired = false;

function processIndexWidthDirty() {
  __indexWidthScheduled = false;
  if (isScreen2BitAndUp()) return;
  if (__indexWidthDirty.size === 0) return;
  const items = Array.from(__indexWidthDirty);
  __indexWidthDirty.clear();
  for (const span of items) {
    if (!(span instanceof Element)) continue;
    // Use the width captured by ResizeObserver to avoid read->write feedback
    const measured = __indexMeasuredWidth.get(span);
    const width = Math.round((measured == null ? 0 : measured));
    if (width > 0 && (width & 1)) {
      const target = `${width - 1}px`;
      if (span.style.width !== target || __indexLastAppliedWidth.get(span) !== target) {
        span.style.width = target;
        __indexLastAppliedWidth.set(span, target);
      }
    }
    // Do not clear inline width in the observer to avoid flip-flop loops
  }
}

function ensureIndexWidthObserver() {
  if (__indexWidthObserver) return __indexWidthObserver;
  if (typeof ResizeObserver !== 'function') return null;

  __indexWidthObserver = new ResizeObserver((entries) => {
    // Collect dirty elements and schedule a single rAF write to avoid RO loop warnings
    for (const entry of entries) {
      const el = entry.target;
      if (el instanceof Element) {
        // Record content box width snapshot from RO
        const w = (entry && entry.contentRect) ? entry.contentRect.width : 0;
        __indexMeasuredWidth.set(el, w);
        __indexWidthDirty.add(el);
      }
    }
    if (!__indexWidthScheduled) {
      __indexWidthScheduled = true;
      requestAnimationFrame(processIndexWidthDirty);
    }
  });
  return __indexWidthObserver;
}

function ensureIndexMutationObserver() {
  if (__indexMutationObserver) return __indexMutationObserver;
  if (typeof MutationObserver !== 'function') return null;
  const ro = ensureIndexWidthObserver();
  if (!ro) return null;

  __indexMutationObserver = new MutationObserver((mutations) => {
    if (isScreen2BitAndUp()) return;
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches && node.matches('.meta .index')) {
          if (!__observedIndexSpans.has(node)) {
            __observedIndexSpans.add(node);
            ro.observe(node);
          }
        }
        const inner = node.querySelectorAll ? node.querySelectorAll('.meta .index') : [];
        if (inner && inner.length) {
          inner.forEach((el) => {
            if (!__observedIndexSpans.has(el)) {
              __observedIndexSpans.add(el);
              ro.observe(el);
            }
          });
        }
      }
    }
  });
  __indexMutationObserver.observe(document.body, { childList: true, subtree: true });
  return __indexMutationObserver;
}

// Adjust index spans within a specific root (limits work to affected subtree)
function adjustIndexSpanWidthsInRoot(root) {
  if (!root || isScreen2BitAndUp()) return 0;
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
    const target = `${newWidth}px`;
    if (span.style.width !== target) {
      span.style.width = target;
      adjusted++;
    }
  }
  return adjusted;
}

/**
 * Adjust the width of index spans to ensure they have an even width.
 * Global pass: only for spans NOT inside `.columns`; columns are handled post-commit.
 */
function adjustIndexSpanWidths() {
  if (isScreen2BitAndUp()) return;
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
    const target = `${newWidth}px`;
    if (span.style.width !== target) span.style.width = target;
  }
}

/**
 * Get the responsive max columns value for a list element based on current screen context.
 * Supports size-based (sm:, md:, lg:) and scale-based responsive variants.
 * 
 * Data attribute patterns:
 * - data-list-max-columns="3" (base value)
 * - data-list-max-columns-sm="2" (small screens)
 * - data-list-max-columns-md="3" (medium screens)  
 * - data-list-max-columns-lg="4" (large screens)
 * - data-list-max-columns-sm-scale-small="1" (small screen + small scale)
 * - data-list-max-columns-md-scale-small="2" (medium screen + small scale)
 * - data-list-max-columns-md-scale-large="4" (medium screen + large scale)
 * - data-list-max-columns-lg-scale-small="3" (large screen + small scale)
 * - data-list-max-columns-lg-scale-large="5" (large screen + large scale)
 * 
 * Example usage in HTML:
 * 
 * <!-- Basic responsive by screen size -->
 * <div data-list-limit="true" 
 *      data-list-max-columns="1"
 *      data-list-max-columns-md="2" 
 *      data-list-max-columns-lg="3">
 *   <!-- items -->
 * </div>
 * 
 * <!-- Size + scale combinations (scale cannot be used alone) -->
 * <div data-list-limit="true"
 *      data-list-max-columns="2"
 *      data-list-max-columns-sm="1"
 *      data-list-max-columns-md="2"
 *      data-list-max-columns-lg="4"
 *      data-list-max-columns-md-scale-small="1"
 *      data-list-max-columns-md-scale-large="3"
 *      data-list-max-columns-lg-scale-small="3"
 *      data-list-max-columns-lg-scale-large="5">
 *   <!-- items -->
 * </div>
 */
function getResponsiveMaxColumns(list) {
  const { size: currentSize, scale: currentScale } = getScreenContext();
  if (!currentSize && !currentScale) return parseInt(list?.dataset?.listMaxColumns || '1', 10) || 1;
  
  let maxColumns = null;
  
  // Try to get responsive value in order of specificity (most specific first):
     // 1. Combined size + scale: data-list-max-columns-md-scale-large
   if (!maxColumns && currentSize && currentScale) {
     const combinedKey = toCamelCase(`list-max-columns-${currentSize}-scale-${currentScale}`);
     maxColumns = parseInt(list.dataset[combinedKey], 10);
     if (!isNaN(maxColumns)) {
       // combined size+scale value found
     } else {
       maxColumns = null;
     }
   }
   
   // 2. Size-specific: data-list-max-columns-md
   if (!maxColumns && currentSize) {
     const sizeKey = toCamelCase(`list-max-columns-${currentSize}`);
     maxColumns = parseInt(list.dataset[sizeKey], 10);
     if (!isNaN(maxColumns)) {
       // size-specific value found
     } else {
       maxColumns = null;
     }
   }
   
   // Note: Scale-only modifiers are not supported - scale must be combined with size
   // This prevents standalone usage like data-list-max-columns-scale-large="2"
  
  // 4. Base value: data-list-max-columns
  if (!maxColumns) {
    maxColumns = parseInt(list.dataset.listMaxColumns, 10);
    if (!isNaN(maxColumns)) {
      // base value found
    } else {
      maxColumns = null;
    }
  }
  
  // Default to 1 if no valid value found
  const finalValue = maxColumns || 1;
  
  return finalValue;
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
 * - Word-trim with ellipsis '...'
 * - Single-line height derived from measurement
 * - Re-clamp on width change by invoking clamp on demand
 * - Can clamp any subtree (works inside and outside .columns)
 */

// Determine available content width for clamping by preferring the element's own rendered width.
// This captures actual space assigned by layout (e.g., inside flex rows next to siblings).
// If the element has not been laid out yet (width 0), fall back to nearest ancestor width.
function getAvailableWidthForClamp(element) {
  if (!element) return 0;
  const ownWidth = Math.round((element.getBoundingClientRect()?.width) || 0);
  if (ownWidth > 0) return ownWidth;
  let node = element;
  while (node && node !== document.body) {
    const parent = node.parentElement;
    if (!parent) break;
    const w = Math.round(parent.getBoundingClientRect().width || 0);
    if (w > 0) return w;
    node = parent;
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
  clone.style.padding = computed.padding;
  clone.style.letterSpacing = computed.letterSpacing;

  container.appendChild(clone);
  parent.appendChild(container);
  const height = Math.ceil(clone.getBoundingClientRect().height);
  parent.removeChild(container);
  return height > 0 ? height : Math.max(1, Math.ceil(parseFloat(computed.fontSize)));
}

// Clamp a single element's text content to a maximum number of lines using word trimming and ellipsis
function clampElementToLines(element, maxLines) {
  if (!element) return;
  const lines = parseInt(element.getAttribute('data-clamp'), 10);
  if (isNaN(lines) || lines <= 0) return;
  // Clear stale per-element clamp stats
  if (element.hasAttribute('data-clamp-lines-trimmed')) {
    element.removeAttribute('data-clamp-lines-trimmed');
  }
  // Cache: if we computed for this width before, attempt a quick revalidation to avoid stale over-clamping
  const currentWidth = getAvailableWidthForClamp(element);
  const cachedWidth = parseInt(element.getAttribute('data-clamp-last-width') || '0', 10);
  if (cachedWidth && Math.abs(cachedWidth - currentWidth) <= 1 && element.hasAttribute('data-clamp-cached')) {
    // If fonts or metrics changed since last clamp, the original may now fit. Revalidate cheaply.
    const originalTextForRecheck = element.getAttribute('data-clamp-original') || '';
    if (originalTextForRecheck) {
      const computedRe = window.getComputedStyle(element);
      const paddingTopRe = parseFloat(computedRe.paddingTop) || 0;
      const paddingBottomRe = parseFloat(computedRe.paddingBottom) || 0;
      const singleLineHeightRe = measureSingleLineHeight(element);
      let maxHeightRe = Math.ceil(paddingTopRe + paddingBottomRe + singleLineHeightRe * lines);
      const overrideMaxHRe = parseInt(element.getAttribute('data-clamp-max-height-px') || '0', 10);
      if (Number.isFinite(overrideMaxHRe) && overrideMaxHRe > 0) {
        maxHeightRe = overrideMaxHRe;
      }

      // Inline candidate measurement (mirrors measureCandidateHeight below)
      const parent = element.parentElement || document.body;
      const targetWidth = currentWidth;
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
      probe.style.font = computedRe.font;
      probe.style.fontFamily = computedRe.fontFamily;
      probe.style.fontSize = computedRe.fontSize;
      probe.style.lineHeight = computedRe.lineHeight === 'normal' ? 'normal' : computedRe.lineHeight;
      probe.style.padding = computedRe.padding;
      probe.style.letterSpacing = computedRe.letterSpacing;
      probe.textContent = originalTextForRecheck;

      container.appendChild(probe);
      parent.appendChild(container);
      let hRe = Math.ceil(probe.getBoundingClientRect().height);
      // Include margins to match real-flow height inside content containers
      const mtRe = parseFloat(computedRe.marginTop) || 0;
      const mbRe = parseFloat(computedRe.marginBottom) || 0;
      hRe += Math.ceil(mtRe + mbRe);
      parent.removeChild(container);

      if (hRe <= maxHeightRe) {
        element.textContent = originalTextForRecheck;
        // Ensure newline characters render as visual breaks
        element.style.whiteSpace = 'pre-line';
        element.setAttribute('data-clamp-last-width', String(currentWidth));
        // Clear lines-trimmed stat since we're no longer truncated
        if (element.hasAttribute('data-clamp-lines-trimmed')) {
          element.removeAttribute('data-clamp-lines-trimmed');
        }
        // Keep cached flag; future identical widths can safely skip
        return;
      }
    }
    // If original still doesn't fit, fall through to full clamp logic
  }

  // Preserve original once
  if (!element.hasAttribute('data-clamp-original')) {
    // Use innerText to preserve <br> and block-level line breaks as \n
    element.setAttribute('data-clamp-original', element.innerText || '');
  }

  const originalText = element.getAttribute('data-clamp-original') || '';
  const singleLineHeight = measureSingleLineHeight(element);
  const computed = window.getComputedStyle(element);
  const paddingTop = parseFloat(computed.paddingTop) || 0;
  const paddingBottom = parseFloat(computed.paddingBottom) || 0;
  let maxHeight = Math.ceil(paddingTop + paddingBottom + singleLineHeight * lines);
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

  // Early exit: try original first without mutating real element
  const hOriginal = measureCandidateHeight(originalText);
  if (hOriginal <= maxHeight) {
    element.textContent = originalText;
    // Ensure newline characters render as visual breaks
    element.style.whiteSpace = 'pre-line';
    // Clear lines-trimmed stat since not truncated
    if (element.hasAttribute('data-clamp-lines-trimmed')) {
      element.removeAttribute('data-clamp-lines-trimmed');
    }
    return;
  }

  // Word-trim preserving original whitespace (including \n from <br>) and use exact ellipsis '...'
  // Tokenize into words (\S+) and whitespace (\s+) so we can rebuild with original line breaks
  const parts = (originalText.match(/\S+|\s+/g) || []);
  const wordTokens = parts.filter((t) => /\S+/.test(t));
  const totalWords = wordTokens.length;
  if (totalWords === 0) {
    element.textContent = '';
    return;
  }

  let low = 0; // not fit
  let high = totalWords; // candidate count that may fit
  let best = 0;

  const buildCandidateForCount = (count) => {
    if (count <= 0) return '...';
    let collected = 0;
    let out = '';
    for (let i = 0; i < parts.length; i += 1) {
      const token = parts[i];
      out += token;
      if (/\S+/.test(token)) {
        collected += 1;
        if (collected >= count) break;
      }
    }
    if (count < totalWords) out += '...';
    return out;
  };

  const fitsWithWordCount = (count) => {
    const candidate = buildCandidateForCount(count);
    const h = measureCandidateHeight(candidate);
    return h <= maxHeight;
  };

  // Binary search for maximum words that fit
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (mid === 0) {
      // Try first word before falling back to ellipsis
      const firstWord = wordTokens[0] || '';
      if (firstWord) {
        if (measureCandidateHeight(firstWord) <= maxHeight) {
          best = 1;
          break;
        }
      }
      const h = measureCandidateHeight('...');
      if (h <= maxHeight) {
        best = 0;
        break;
      } else {
        element.textContent = '';
        return;
      }
    }
    if (fitsWithWordCount(mid)) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const finalText = buildCandidateForCount(best);
  element.textContent = finalText;
  // Ensure newline characters render as visual breaks after truncation
  element.style.whiteSpace = 'pre-line';
  element.setAttribute('data-clamp-cached', 'true');
  element.setAttribute('data-clamp-last-width', String(currentWidth));
  // Compute lines trimmed approximately using original measured height
  const contentHeight = Math.max(0, Math.ceil(hOriginal - (paddingTop + paddingBottom)));
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

// Clamp all [data-clamp] within a subtree root (inclusive)
function clampSubtree(root) {
  if (!root) return;
  const elements = root.querySelectorAll('[data-clamp]');
  elements.forEach((el) => clampElementToLines(el, parseInt(el.getAttribute('data-clamp'), 10)));
}

// Reset [data-clamp] text to original before re-clamping within a subtree
function resetClampToOriginal(root) {
  if (!root) return;
  const elements = root.querySelectorAll('[data-clamp]');
  elements.forEach((el) => {
    const original = el.getAttribute('data-clamp-original');
    if (original !== null) {
      el.textContent = original;
      // Preserve hard line breaks that were captured via innerText
      el.style.whiteSpace = 'pre-line';
    }
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

// Create a label item wrapper: <div class="item"><div class="meta"></div><div class="content"><span class="label label--gray">and N more</span></div></div>
function createLabelItem(nHidden) {
  const item = document.createElement('div');
  item.className = 'item';
  const meta = document.createElement('div');
  meta.className = 'meta';
  const content = document.createElement('div');
  content.className = 'content';
  const span = document.createElement('span');
  span.className = 'label label--gray';
  span.textContent = `and ${nHidden} more`;
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
  // Skip .columns containers — they are handled by the multi-column engine
  if (containerEl.classList && containerEl.classList.contains('columns')) return null;

  // Reset previous state created by overflow engine (safe for generic containers)
  resetOverflowState(containerEl);

  // Clamp any [data-clamp] inside prior to measuring so heights reflect final text
  try {
    const clampTargets = containerEl.querySelectorAll('[data-clamp]');
    clampTargets.forEach((el) => {
      const original = el.getAttribute('data-clamp-original');
      if (original !== null) el.textContent = original;
      clampElementToLines(el, parseInt(el.getAttribute('data-clamp'), 10));
    });
  } catch (_) {}

  // Compute and enforce height budget
  const heightBudget = Math.max(0, Math.floor(getHeightBudgetForGeneric(containerEl) || 0));
  try { containerEl.style.maxHeight = `${heightBudget}px`; } catch (_) {}
  if (heightBudget <= 0) {
    // Nothing fits; hide all items and bail (no label as there's no room)
    const blocks = Array.from(containerEl.children).filter((c) => c.classList && (c.classList.contains('item') || c.classList.contains('label')));
    blocks.forEach((b) => { b.style.display = 'none'; b.setAttribute('data-hidden-by-overflow', 'true'); });
    return { itemsProcessed: blocks.length, hiddenItems: blocks.length };
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
      target.style.display = 'none';
      target.setAttribute('data-hidden-by-overflow', 'true');
      // Re-check budget after each hide to avoid overshooting and hiding extra items
      if (withinBudget()) break;
    }
  }

  // Append trailing label if opted-in and there are hidden .item blocks
  const hiddenItemsCount = Array.from(containerEl.querySelectorAll(':scope > .item')).filter((n) => n.style.display === 'none').length;
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
      target.style.display = 'none';
      target.setAttribute('data-hidden-by-overflow', 'true');
      // Update label count
      const newHidden = Array.from(containerEl.querySelectorAll(':scope > .item')).filter((n) => n.style.display === 'none').length;
      const span = label.querySelector('.label');
      if (span) span.textContent = `and ${newHidden} more`;
    }
    // If even with everything hidden the label cannot fit, remove it
    if (!withinBudget()) {
      try { label.remove(); } catch (_) {}
      label = null;
    }
  }

  return {
    itemsProcessed: allBlocks.length,
    hiddenItems: Array.from(containerEl.querySelectorAll(':scope > .item')).filter((n) => n.style.display === 'none').length,
    labelAdded: !!label
  };
}

function getSourceBlocks(columnsEl) {
  const firstColumn = columnsEl.querySelector('.column');
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

function getColumnMetrics(columnEl) {
  const rect = columnEl.getBoundingClientRect();
  return {
    top: Math.floor(rect.top),
    bottom: Math.floor(rect.bottom),
    height: Math.floor(rect.height),
    width: Math.floor(rect.width)
  };
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

  // Measure widths (implicitly via CSS); widths used by clampSubtree during placement
  const columnWidths = stagingColumns.map((col) => getColumnMetrics(col).width);

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
        headerCloneNode.className = 'label label--medium group-header label--gray';
        headerCloneNode.setAttribute('data-duplicate-heading', 'true');
        headerCloneNode.textContent = activeHeading.textContent || '';
        if (!tryPlaceCloneInColumn(columnEl, headerCloneNode, heightBudget)) {
          headerCloneNode = null;
          continue;
        }
      }

      const itemClone = deepCloneBlockForStaging(realNode);
      if (tryPlaceCloneInColumn(columnEl, itemClone, heightBudget)) {
        // If this is the first time placing this group's header, place the ORIGINAL header label before the item
        if (needHeader && activeHeading && !placedHeadings.has(activeHeading)) {
          placements.push({ realNode: activeHeading, columnIndex: colIndex, cloneNode: headerCloneNode, type: 'header' });
          placedHeadings.add(activeHeading);
          headerPlacedInColumn[colIndex].add(activeHeading);
        } else if (needHeader && activeHeading) {
          // For subsequent columns, record a duplicate heading to be inserted during commit
          headerPlacedInColumn[colIndex].add(activeHeading);
          duplicatesByColumn[colIndex].push({ before: realNode, heading: activeHeading });
        }
        placements.push({ realNode, columnIndex: colIndex, cloneNode: itemClone, type: 'item', headingCloneNode: (needHeader && !placedHeadings.has(activeHeading)) ? headerCloneNode : null, groupHeading: activeHeading || null });
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
      headerClone.className = 'label label--medium group-header label--gray';
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
  const sourceBlocks = getSourceBlocks(columnsEl);

  // Clear existing blocks from all columns to avoid duplicates; we'll re-append
  realColumns.forEach((col) => {
    Array.from(col.children).forEach((child) => {
      if (child.classList && (child.classList.contains('heading') || child.classList.contains('item') || child.classList.contains('label'))) {
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
      node.style.display = 'none';
      node.setAttribute('data-hidden-by-overflow', 'true');
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
        dup.className = 'label label--medium group-header label--gray';
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
      // Keep order, attach to DOM, and hide
      lastCol.appendChild(node);
      node.style.display = 'none';
      node.setAttribute('data-hidden-by-overflow', 'true');
    });
  }

  // Append label if needed in the last column
  if (plan.needsLabel && shouldShowHiddenCount(columnsEl)) {
    const totalHiddenItems = plan.hiddenNodes.filter((n) => n.classList.contains('item')).length;
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

  // Make each column fit by hiding trailing blocks (prefer items), using batched removals
  realColumns.forEach((col) => {
    const blocks = Array.from(col.children).filter((c) => c.classList && (c.classList.contains('heading') || c.classList.contains('item')));
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
          if (blocks[i].classList.contains('heading')) { target = blocks[i]; break; }
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
      for (let k = 0; k < hideCount; k++) {
        const target = pickLastVisible(true) || pickLastVisible(false);
        if (!target) break;
        target.style.display = 'none';
        target.setAttribute('data-hidden-by-overflow', 'true');
        // Stop early if this column now fits to avoid overshooting
        if (Math.floor(col.scrollHeight || col.getBoundingClientRect().height) <= Math.floor(heightBudget)) break;
      }
    }
  });
  
  // Compute hidden items and add label to last column if needed
  const hiddenItems = Array.from(columnsEl.querySelectorAll(':scope > .column .item')).filter((n) => n.style.display === 'none').length;
  if (hiddenItems > 0 && shouldShowHiddenCount(columnsEl)) {
    const lastCol = realColumns[realColumns.length - 1];
    const label = createLabelItem(hiddenItems);
    label.setAttribute('data-overflow-label', 'true');
    lastCol.appendChild(label);

  // Ensure label fits; if not, hide more trailing blocks
    let safety = 50;
    while (Math.floor(lastCol.scrollHeight || lastCol.getBoundingClientRect().height) > Math.floor(heightBudget) && safety-- > 0) {
      const candidates = Array.from(lastCol.children).filter((c) => c.classList && (c.classList.contains('heading') || c.classList.contains('item')) && c.style.display !== 'none');
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
        target.style.display = 'none';
        target.setAttribute('data-hidden-by-overflow', 'true');
        // Stop early if label now fits after this hide
        if (Math.floor(lastCol.scrollHeight || lastCol.getBoundingClientRect().height) <= Math.floor(heightBudget)) break;
      }
      // Update label count once per iteration
      const newHidden = Array.from(columnsEl.querySelectorAll('.item')).filter((n) => n.style.display === 'none').length;
      const labelSpan = label.querySelector('.label');
      if (labelSpan) labelSpan.textContent = `and ${newHidden} more`;
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
            c.style.display = 'none';
            c.setAttribute('data-hidden-by-overflow', 'true');
          }
        }
      }
    }
  });
}

function runOverflowEngineForColumns(columnsEl) {
  // Opt-in when either data-overflow-max-cols (best-fit up to N)
  // or data-overflow-cols (fixed N) is present
  const hasMax = columnsEl.hasAttribute('data-overflow-max-cols');
  const hasFixed = columnsEl.hasAttribute('data-overflow-cols');
  if (!hasMax && !hasFixed) {
    return null;
  }
  // Pre-pass reset
  resetOverflowState(columnsEl);

  const maxColumnsAttr = columnsEl.getAttribute('data-overflow-max-cols');
  let maxColumns = Math.max(1, parseInt(maxColumnsAttr || '1', 10) || 1);
  // Fixed column count (forces exact number of columns)
  const fixedColumnsAttr = columnsEl.getAttribute('data-overflow-cols');
  const fixedColumns = Math.max(0, parseInt(fixedColumnsAttr || '0', 10) || 0);
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
    // Hide all candidate blocks; ensure no label
    getSourceBlocks(columnsEl).forEach((n) => {
      n.style.display = 'none';
      n.setAttribute('data-hidden-by-overflow', 'true');
    });
    // Remove engine-created artifacts
    columnsEl.querySelectorAll('.item[data-overflow-label="true"]').forEach((l) => l.remove());
    columnsEl.querySelectorAll('.heading[data-duplicate-heading="true"]').forEach((dup) => dup.remove());
    return { itemsProcessed: itemsInSource, columnsCreated: 0, repeatedHeaders: 0, harmonious: 0, hiddenItems: 0 };
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
    const hiddenItemsPost = Array.from(columnsEl.querySelectorAll(':scope > .column .item')).filter((n) => n.style.display === 'none').length;
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
  const hiddenItemsPost = Array.from(columnsEl.querySelectorAll(':scope > .column .item')).filter((n) => n.style.display === 'none').length;

  return {
    itemsProcessed: itemsInSource,
    columnsCreated: bestPlan ? bestPlan.columnCount : 0,
    repeatedHeaders: duplicateHeaders,
    harmonious: bestPlan && bestPlan.isHarmonious ? 1 : 0,
    hiddenItems: hiddenItemsPost
  };
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
    
    // Need at least 2 columns for gaps to matter
    if (columnCount < 2) return;

    const containerWidth = grid.offsetWidth;
    const computedStyle = window.getComputedStyle(grid);
    // Handle both gap and grid-gap properties
    let currentGap = parseFloat(computedStyle.gap) || parseFloat(computedStyle.gridGap) || 0;
    
    // If gap is still 0, try to calculate it from actual column positions
    if (currentGap === 0) {
      const children = grid.children;
      if (children.length >= 2) {
        const firstChild = children[0].getBoundingClientRect();
        const secondChild = children[1].getBoundingClientRect();
        // Check if they're in the same row (horizontal neighbors)
        if (Math.abs(firstChild.top - secondChild.top) < 1) {
          currentGap = secondChild.left - firstChild.right;
        }
      }
    }
    
    console.log(`Grid gap adjustment: Container ${containerWidth}px, ${columnCount} columns, current gap ${currentGap}px`);
    
    // Calculate total gap space and space available for columns
    const totalGapSpace = currentGap * (columnCount - 1);
    const availableSpace = containerWidth - totalGapSpace;
    const columnWidth = availableSpace / columnCount;
    
    // Check if columns would have fractional widths (with tolerance for floating point)
    const isInteger = Math.abs(columnWidth - Math.round(columnWidth)) < 0.001;
    
    if (!isInteger) {
      // Find the nearest integer column width
      // that results in a reasonable gap (0-50px range)
      
      let bestGap = currentGap;
      let bestColumnWidth = columnWidth;
      let minDifference = Infinity;
      
      // Try the two nearest integer column widths
      const lowerColumnWidth = Math.floor(columnWidth);
      const higherColumnWidth = Math.ceil(columnWidth);
      
      for (const targetColumnWidth of [lowerColumnWidth, higherColumnWidth]) {
        // Calculate what gap would give us this exact column width
        const requiredGap = (containerWidth - targetColumnWidth * columnCount) / (columnCount - 1);
        
        // Check if this gap is within reasonable range (0-50px)
        if (requiredGap >= 0 && requiredGap <= 50) {
          const difference = Math.abs(currentGap - requiredGap);
          
          if (difference < minDifference) {
            minDifference = difference;
            bestGap = Math.round(requiredGap * 10) / 10; // Round to 1 decimal place
            bestColumnWidth = targetColumnWidth;
          }
        }
      }
      
      // If neither integer width works, try a few more values near the current column width
      // but limit to a much smaller range for performance
      if (minDifference === Infinity) {
        const searchRange = 5; // Much smaller search range
        const baseWidth = Math.round(columnWidth);
        
        for (let offset = -searchRange; offset <= searchRange; offset++) {
          const targetColumnWidth = baseWidth + offset;
          if (targetColumnWidth <= 0) continue; // Skip invalid widths
          
          const requiredGap = (containerWidth - targetColumnWidth * columnCount) / (columnCount - 1);
          
          if (requiredGap >= 0 && requiredGap <= 50) {
            const difference = Math.abs(currentGap - requiredGap);
            
            if (difference < minDifference) {
              minDifference = difference;
              bestGap = Math.round(requiredGap * 10) / 10;
              bestColumnWidth = targetColumnWidth;
            }
          }
        }
      }
      
      // Apply the best gap found (only if we found a better solution)
      if (minDifference < Infinity && Math.abs(bestGap - currentGap) > 0.001) {
        grid.style.gap = `${bestGap}px`;
        console.log(`Adjusted grid gap from ${currentGap}px to ${bestGap}px, resulting in ${bestColumnWidth}px columns`);
      }
    }
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

    const columns = container.querySelectorAll('.column');
    const columnCount = columns.length;
    
    // Need at least 2 columns for gaps to matter
    if (columnCount < 2) return;

    const containerWidth = container.offsetWidth;
    const computedStyle = window.getComputedStyle(container);
    // Handle both gap and column-gap properties
    let currentGap = parseFloat(computedStyle.gap) || parseFloat(computedStyle.columnGap) || 0;
    
    // If gap is still 0, try to calculate it from actual column positions (optimized)
    if (currentGap === 0 && columns.length >= 2) {
      const firstColumn = columns[0].getBoundingClientRect();
      const secondColumn = columns[1].getBoundingClientRect();
      currentGap = secondColumn.left - firstColumn.right;
    }
    
    console.log(`Column gap adjustment: Container ${containerWidth}px, ${columnCount} columns, current gap ${currentGap}px`);
    
    // Calculate total gap space and space available for columns
    const totalGapSpace = currentGap * (columnCount - 1);
    const availableSpace = containerWidth - totalGapSpace;
    const columnWidth = availableSpace / columnCount;
    
    // Check if columns would have fractional widths (with tolerance for floating point)
    const isInteger = Math.abs(columnWidth - Math.round(columnWidth)) < 0.001;
    
    if (!isInteger) {
      // Find the nearest integer column width
      // that results in a reasonable gap (0-50px range)
      
      let bestGap = currentGap;
      let bestColumnWidth = columnWidth;
      let minDifference = Infinity;
      
      // Try the two nearest integer column widths
      const lowerColumnWidth = Math.floor(columnWidth);
      const higherColumnWidth = Math.ceil(columnWidth);
      
      for (const targetColumnWidth of [lowerColumnWidth, higherColumnWidth]) {
        // Calculate what gap would give us this exact column width
        const requiredGap = (containerWidth - targetColumnWidth * columnCount) / (columnCount - 1);
        
        // Check if this gap is within reasonable range (0-50px based on user's typical range)
        if (requiredGap >= 0 && requiredGap <= 50) {
          const difference = Math.abs(currentGap - requiredGap);
          
          if (difference < minDifference) {
            minDifference = difference;
            bestGap = Math.round(requiredGap * 10) / 10; // Round to 1 decimal place
            bestColumnWidth = targetColumnWidth;
          }
        }
      }
      
      // If neither integer width works, try a few more values near the current column width
      // but limit to a much smaller range for performance
      if (minDifference === Infinity) {
        const searchRange = 5; // Much smaller search range
        const baseWidth = Math.round(columnWidth);
        
        for (let offset = -searchRange; offset <= searchRange; offset++) {
          const targetColumnWidth = baseWidth + offset;
          if (targetColumnWidth <= 0) continue; // Skip invalid widths
          
          const requiredGap = (containerWidth - targetColumnWidth * columnCount) / (columnCount - 1);
          
          if (requiredGap >= 0 && requiredGap <= 50) {
            const difference = Math.abs(currentGap - requiredGap);
            
            if (difference < minDifference) {
              minDifference = difference;
              bestGap = Math.round(requiredGap * 10) / 10;
              bestColumnWidth = targetColumnWidth;
            }
          }
        }
      }
      
      // Apply the best gap found (only if we found a better solution)
      if (minDifference < Infinity && Math.abs(bestGap - currentGap) > 0.001) {
        container.style.gap = `${bestGap}px`;
        console.log(`Adjusted column gap from ${currentGap}px to ${bestGap}px, resulting in ${bestColumnWidth}px columns`);
      }
    }
  });
}

function adjustColumnGaps() {
  const columnContainers = document.querySelectorAll('.columns');
  adjustColumnGapsFor(Array.from(columnContainers));
}

/**
 * Format numeric values with dynamic precision based on available space
 */
function formatValue() {
  document.querySelectorAll('[data-value-type="number"], [data-value-format="true"]').forEach(element => {
    element.style.whiteSpace = 'nowrap';
    const container = element.parentElement;
    if (!container) return;

    // Store raw value
    if (!element.dataset.rawValue) {
      element.dataset.rawValue = element.textContent;
    }

    const rawValue = element.dataset.rawValue;
    // Extract currency symbol without the minus sign
    const currencySymbol = (rawValue.match(/[\$€£¥₹₽₪₩₫₴₱₿]/) || [''])[0];
    // Handle negative sign separately
    const isNegative = rawValue.includes('-');
    const prefix = isNegative ? '-' + currencySymbol : currencySymbol;
    const number = parseFloat(rawValue.replace(/[^0-9.-]/g, ''));
    const locale = element.dataset.valueLocale || 'en-US';

    if (isNaN(number)) return;

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
  const maxWidth = container.clientWidth;
  let fontSize = parseInt(window.getComputedStyle(element).fontSize);

  element.style.whiteSpace = 'nowrap';

  while (element.scrollWidth > maxWidth && fontSize > 8) {
    fontSize--;
    element.style.fontSize = `${fontSize}px`;
  }
}

/**
 * Adjust text elements to ensure pixel-perfect rendering by wrapping lines
 * in spans and ensuring even widths.
 */
function pixelPerfectFonts() {
  // Skip all processing when the 4-bit or higher screen mode is active
  const __ctx = getScreenContext();
  if (__ctx && __ctx.bitDepth >= 4) return;

  // Track total number of lines wrapped across all elements
  let __pixelPerfectLinesProcessed = 0;

  // First pass: mark all elements with data-pixel-perfect="true" 
  // to exclude their parent elements from processing
  const pixelPerfectElements = document.querySelectorAll('.screen.screen--1bit [data-pixel-perfect="true"], .screen.screen--2bit [data-pixel-perfect="true"]');
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
  
  // Second pass: select direct pixel-perfect elements only within 1-bit and 2-bit screens
  const allTargets = Array.from(document.querySelectorAll('.screen.screen--1bit [data-pixel-perfect="true"], .screen.screen--2bit [data-pixel-perfect="true"]'))
    .filter(el => !el.hasAttribute('data-pixel-processed'));

  

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
      
      // Clear the original element but save the original HTML as fallback
      const originalElementHTML = element.outerHTML;
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
      
      // Clean up
      document.body.removeChild(measureEl);
      
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

  // Emit an updated stats event with lines processed if stats are available
  try {
    if (typeof window !== 'undefined' && window.__TRMNL_LAST_STATS__ && Array.isArray(window.__TRMNL_LAST_STATS__.steps)) {
      const stats = window.__TRMNL_LAST_STATS__;
      const step = stats.steps.find(s => s && s.name === 'Pixel-perfect fonts');
      if (step) {
        step.linesProcessed = __pixelPerfectLinesProcessed;
        const evt = new CustomEvent('trmnl:terminalize:stats', { detail: stats });
        window.dispatchEvent(evt);
      }
    }
  } catch (_) {}


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

    const maxHeight = element.dataset.valueFitMaxHeight 
      ? parseFloat(element.dataset.valueFitMaxHeight)
      : null;

    element.style.fontSize = '';
    element.style.fontWeight = '';
    element.style.lineHeight = '';

    let fontSize = parseFloat(window.getComputedStyle(element).fontSize);
    
    const sizeMap = {
      128: { weight: 350, lineHeight: '128px' },  // xxxlarge
      96: { weight: 350, lineHeight: '108px' },   // xxlarge
      74: { weight: 375, lineHeight: '86px' },    // xlarge
      58: { weight: 400, lineHeight: '70px' },    // large
      38: { weight: 450, lineHeight: '42px' },    // default
      26: { weight: 600, lineHeight: '29px' },    // small
      20: { weight: 700, lineHeight: '24px' },    // xsmall
      16: { weight: 400, lineHeight: '16px' }     // xxsmall (NicoClean font)
    };

    const containerRect = container.getBoundingClientRect();

    // Coarse pass: reduce quickly in larger steps to avoid many layout reads
    let elementRect = element.getBoundingClientRect();
    const coarseStep = Math.max(step, 2);
    while (
      (elementRect.width > containerRect.width || (maxHeight && elementRect.height > maxHeight)) &&
      fontSize - coarseStep >= minFontSize
    ) {
      fontSize -= coarseStep;
      const sizes = Object.keys(sizeMap).map(Number).sort((a, b) => b - a);
      const closestSize = sizes.find(size => fontSize >= size) || sizes[sizes.length - 1];
      const { weight, lineHeight } = sizeMap[closestSize];
      element.style.fontSize = `${fontSize}px`;
      element.style.fontWeight = weight;
      element.style.fontVariationSettings = `'wght' ${weight}`;
      const originalLineHeight = parseInt(lineHeight);
      const lineHeightRatio = originalLineHeight / closestSize;
      const newLineHeight = Math.round(fontSize * lineHeightRatio);
      element.style.lineHeight = `${newLineHeight}px`;
      elementRect = element.getBoundingClientRect();
    }

    // Fine pass: binary search within a small range to converge with few measures
    let low = minFontSize;
    let high = fontSize;
    const fits = () => {
      const r = element.getBoundingClientRect();
      return r.width <= containerRect.width && (!maxHeight || r.height <= maxHeight);
    };
    if (!fits()) {
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const sizes = Object.keys(sizeMap).map(Number).sort((a, b) => b - a);
        const closestSize = sizes.find(size => mid >= size) || sizes[sizes.length - 1];
        const { weight, lineHeight } = sizeMap[closestSize];
        element.style.fontSize = `${mid}px`;
        element.style.fontWeight = weight;
        element.style.fontVariationSettings = `'wght' ${weight}`;
        const originalLineHeight = parseInt(lineHeight);
        const lineHeightRatio = originalLineHeight / closestSize;
        const newLineHeight = Math.round(mid * lineHeightRatio);
        element.style.lineHeight = `${newLineHeight}px`;
        if (fits()) {
          fontSize = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
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
  const elRect = element.getBoundingClientRect();
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

  const contentTopY = Math.floor(layoutRect.top + Math.floor(paddingTop));
  const contentBottomY = Math.floor(contentTopY + contentHeight);

  // Offset from content top to element top
  const offsetFromContentTop = Math.max(0, Math.floor(elRect.top - contentTopY));
  // Remaining space in the content box below the element top
  let available = Math.max(0, Math.floor(contentHeight - offsetFromContentTop));

  // Clamp available to contentHeight for safety
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
  console.log(`Content limiter: content--small + max-height ${threshold}px applied.`);

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
  if (children.length === 0) return;

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
  const maxLines = Math.max(1, Math.floor(usablePx / Math.max(1, lineHeightPx)));
  target.setAttribute('data-clamp', String(maxLines));
  // Provide an exact pixel cap to the clamp engine to avoid line-height mismatches
  const allowedPx = Math.max(0, Math.floor(usablePx + paddingTop + paddingBottom));
  target.setAttribute('data-clamp-max-height-px', String(allowedPx));
  // Ensure the target respects line breaks and won't visually overflow while we clamp
  target.style.whiteSpace = 'pre-line';
  target.style.overflow = 'hidden';
  target.style.display = 'block';
  try { clampElementToLines(target, maxLines); } catch (_) {}
  console.log(`Content limiter: clamped child to ${maxLines} lines (usable=${usablePx}px, line=${lineHeightPx}px).`);
}

// Apply content limits to all content elements
function applyContentLimits() {
  const targets = Array.from(document.querySelectorAll('[data-content-limiter="true"]'));
  const budgetMs = 12;
  let queue = [...targets];
  const processOne = (el) => {
    const height = el.offsetHeight;
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

async function terminalize() {
  const stats = { steps: [], engines: [] };
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

  // Helpers for responsiveness and scoping
  
  // Backwards compatibility for clamp utilities using legacy classnames
  // - Supports only base tokens: clamp--N and clamp--none
  // - Responsive legacy tokens (e.g., md:clamp--N, md:portrait:clamp--N) are NOT supported
  // - Responsive data attributes are still respected (e.g., data-clamp-md), independent of legacy classes
  // Reuse global getScreenContext() for consistency

  function toCamelCase(str) {
    return String(str || '').replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  }

  function parseIntSafe(v) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  }

  function readResponsiveClampFromDataset(el, ctx) {
    if (!el || !el.dataset) return null;
    const { size, orientation } = ctx || {};
    // 1) size + orientation
    if (size && orientation) {
      const key = toCamelCase(`clamp-${size}-${orientation}`); // e.g., clampMdPortrait
      const v = el.dataset[key];
      const n = parseIntSafe(v);
      if (n != null) return n;
    }
    // 2) size only
    if (size) {
      const key = toCamelCase(`clamp-${size}`); // e.g., clampMd
      const v = el.dataset[key];
      const n = parseIntSafe(v);
      if (n != null) return n;
    }
    // 3) orientation only
    if (orientation) {
      const key = toCamelCase(`clamp-${orientation}`); // e.g., clampPortrait
      const v = el.dataset[key];
      const n = parseIntSafe(v);
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

  function ensureLegacyClampClassSupport(root = document) {
    const t0 = performance.now();
    const ctx = getScreenContext();
    // Fast selector for any potential clamp class
    const candidates = root.querySelectorAll('[class*="clamp--"]');
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

  const forEachInBatches = async (items, batchSize, perItem) => {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      batch.forEach(perItem);
      // Yield to the browser between batches
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    }
  };

  // Ensure images are loaded/settled before doing layout-sensitive work
  {
    const t0 = performance.now();
    let meta = { targets: 0, timedOut: false };
    try {
      const res = await waitForImagesToSettle();
      meta = { targets: res.waitedCount, timedOut: !!res.timedOut };
    } catch (_) {}
    if (meta.targets > 0 || meta.timedOut) {
      pushStep('Wait for images', meta, t0);
      addEngine('Wait for images', meta);
    }
  }

  // Index and value formatting first
  // Map legacy clamp classes to data attributes before any clamping/layout work
  ensureLegacyClampClassSupport(document);
  {
    // Global pass (outside of .columns)
    const outside = Array.from(document.querySelectorAll('.meta .index')).filter((el) => !el.closest('.columns'));
    const candidatesOutside = outside.length;
    const t0 = performance.now();
    adjustIndexSpanWidths();
    const adjusted = outside.reduce((n, el) => n + ((el.style && el.style.width && el.style.width.length > 0) ? 1 : 0), 0);

    // Inside each .columns after commit
  const columnsRoots = Array.from(document.querySelectorAll('.columns[data-overflow-max-cols], .columns[data-overflow-cols]'));
    let innerAdjusted = 0;
    columnsRoots.forEach((root) => {
      try { innerAdjusted += (adjustIndexSpanWidthsInRoot(root) || 0); } catch(_) {}
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
    formatValue();
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
    fitValue();
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
    adjustGridGaps();
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
    const nonOverflowColumns = Array.from(document.querySelectorAll('.columns'))
      .filter((el) => !el.hasAttribute('data-overflow-max-cols'));
    if (nonOverflowColumns.length > 0) {
      adjustColumnGapsFor(nonOverflowColumns);
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
        // Responsive list max columns: prefer direct base value for legacy mapping
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
      const alreadyManaged = cols.hasAttribute('data-overflow-max-cols') || cols.hasAttribute('data-overflow-cols');
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

  const columnsGroups = Array.from(document.querySelectorAll('.columns[data-overflow-max-cols], .columns[data-overflow-cols]'));
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
            const r = runOverflowEngineForColumns(cols);
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
      const columnsContainers = Array.from(document.querySelectorAll('.columns[data-overflow-max-cols], .columns[data-overflow-cols]'));
      const hiddenItemsColumns = columnsContainers
        .flatMap((c) => Array.from(c.querySelectorAll('.item')))
        .filter((n) => n.getAttribute('data-hidden-by-overflow') === 'true' || n.style.display === 'none').length;
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
            return !(col.hasAttribute('data-overflow-max-cols') || col.hasAttribute('data-overflow-cols'));
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
              const r = runOverflowEngineForGeneric(node);
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
      return !col.hasAttribute('data-overflow-max-cols');
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
          clampElementToLines(el, parseInt(el.getAttribute('data-clamp'), 10));
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
  }

  // Table overflow: hide overflowing tbody rows and append a trailing "and X more" row
  {
    const t0 = performance.now();
    const tables = Array.from(document.querySelectorAll('table[data-table-limit="true"]'));
    let hiddenRowsTotal = 0;
    tables.forEach((table) => {
      try {
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
            span.className = 'label label--gray';
            span.textContent = `and ${hiddenRows} more`;
            td.appendChild(span);
            tr.appendChild(td);
          } else {
            const td = document.createElement('td');
            td.setAttribute('colspan', String(colCount));
            const span = document.createElement('span');
            span.className = 'label label--gray';
            span.textContent = `and ${hiddenRows} more`;
            td.appendChild(span);
            tr.appendChild(td);
          }
          tbody.appendChild(tr);
        }

        // Track totals after any adjustments for label reservation
        hiddenRowsTotal += hiddenRows;
      } catch (_) {}
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
    await applyContentLimits();
    // After limiter adjusted the layout, re-clamp any nested targets to ensure final fit
    const reclampStart = performance.now();
    const clampNodes = Array.from(document.querySelectorAll('[data-content-limiter="true"] [data-clamp]'));
    clampNodes.forEach((node) => {
      const original = node.getAttribute('data-clamp-original');
      if (original != null) {
        node.textContent = original;
        node.style.whiteSpace = 'pre-line';
      }
      try { clampElementToLines(node, parseInt(node.getAttribute('data-clamp'), 10)); } catch(_) {}
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
  // Run pixelPerfectFonts in idle time (non-blocking) to reduce jank
  {
    const scheduled = document.querySelectorAll('[data-pixel-perfect="true"]').length;
    const t0 = performance.now();
    requestIdle(() => { try { pixelPerfectFonts(); } catch (_) {} });
    pushStep('Pixel-perfect fonts', { scheduled }, t0);
    addEngine('Pixel-perfect fonts', { scheduled });
  }

  // Final pass: adjust column gaps after Overflow engine has settled columns
  {
    const colContainers = Array.from(document.querySelectorAll('.columns'));
    const containers = colContainers.length;
    const t0 = performance.now();
    adjustColumnGaps();
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

  // Finalize and emit stats
  try {
    stats.engineCount = stats.engines.length;
    window.__TRMNL_LAST_STATS__ = stats;
    const evt = new CustomEvent('trmnl:terminalize:stats', { detail: stats });
    window.dispatchEvent(evt);
  } catch (_) {}
}

// Framework readiness system
window.frameworkReady = false;

// Debounced scheduler to execute terminalize after layout settles
function scheduleTerminalize() {
  if (!window.__terminalizeScheduler) {
    window.__terminalizeScheduler = { rafId1: 0, rafId2: 0, pending: false };
  }
  const scheduler = window.__terminalizeScheduler;
  if (scheduler.pending) return;
  scheduler.pending = true;
  if (scheduler.rafId1) cancelAnimationFrame(scheduler.rafId1);
  if (scheduler.rafId2) cancelAnimationFrame(scheduler.rafId2);
  scheduler.rafId1 = requestAnimationFrame(() => {
    scheduler.rafId2 = requestAnimationFrame(() => {
      scheduler.pending = false;
      try { terminalize(); } catch (_) {}
    });
  });
}
/**
 * External trigger for terminalize - called by framework.html.erb when ready
 */
function executeTerminalize() {
  const inFrameworkDocs = !!window.__TRMNL_FRAMEWORK_BUILD__;
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
 * Auto-execute terminalize depending on environment:
 * - In Framework docs: wait for frameworkReady, or run immediately if already ready
 * - Outside Framework: run when DOM is ready (DOMContentLoaded) or immediately if already ready
 */
(function autoRunTerminalize() {
  const inFrameworkDocs = !!window.__TRMNL_FRAMEWORK_BUILD__;
  if (inFrameworkDocs) {
    if (window.frameworkReady) {
      scheduleTerminalize();
    } else {
      window.addEventListener('trmnl:framework:ready', scheduleTerminalize, { once: true });
    }
    // Re-run when screen classes change (e.g., Orientation/Size toggles)
    try {
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'attributes' && m.attributeName === 'class') {
            const el = m.target;
            if (el.classList && el.classList.contains('screen')) {
              scheduleTerminalize();
              break;
            }
          }
        }
      });
      observer.observe(document.documentElement || document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
    } catch (_) {}
    return;
  }
  // Run once after full page load so images and subresources are available
  if (document.readyState === 'complete') {
    scheduleTerminalize();
  } else {
    window.addEventListener('load', scheduleTerminalize, { once: true });
  }
})();

// Version marker for cache-busting visibility
window.__TRMNL_BUILD__ = 'plugins.js v2025-09-08-2';
console.log('[TRMNL] Build:', window.__TRMNL_BUILD__);
