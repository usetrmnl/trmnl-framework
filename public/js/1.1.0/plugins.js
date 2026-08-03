/**
 * Adjust the width of index spans to ensure they have an even width.
 * This ensures consistent styling and alignment of index spans.
 */
function adjustIndexSpanWidths() {
  const indexSpans = document.querySelectorAll('.meta .index');

  indexSpans.forEach(span => {
    let width = span.offsetWidth;

    if (width % 2 !== 0) {
      span.style.width = `${width + 1}px`;
    }
  });
}

/**
 * Manage overflow for lists with a specified height limit.
 * manageOverflow ensures that lists don't exceed their designated height while providing
 * a visual cue for hidden content.
 */
function manageOverflow() {
  // Only select lists with data-limit-list="true"
  const lists = document.querySelectorAll('[data-list-limit="true"]');

  lists.forEach(list => {
    const maxTotalHeight = parseFloat(list.dataset.listMaxHeight) || 320; // Default to 320 if not set
    const maxColumns = parseInt(list.dataset.listMaxColumns, 10) || 1; // Default to 1 if not set
    const items = Array.from(list.querySelectorAll('.item'));
    let totalHeight = 0;
    let columns = 1;
    let hideAfterIndex = Infinity;
    let hiddenCount = 0;
    let itemWidth = '100%';

    // Get the computed style of the list to find the gap
    const listStyle = window.getComputedStyle(list);
    const itemGap = parseFloat(listStyle.gap) || 0;

    console.log(`List max height: ${maxTotalHeight}, Item gap: ${itemGap}`);

    // Try to fit items into an increasing number of columns
    for (columns = 1; columns <= maxColumns; columns++) {
      console.log(`--- Trying to fit into ${columns} column(s) ---`);

      let col = 0;
      let columnHeight = 0;
      let tryMoreColumns = false;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.style.display = '';
        const itemRect = item.getBoundingClientRect();
        const itemHeight = itemRect.height;
        const heightWithGap = columnHeight === 0 ? itemHeight : itemHeight + itemGap;
        const fitsInColumn = columnHeight + heightWithGap <= maxTotalHeight;

        if (fitsInColumn) {
          // There's room for this item in this column
          console.log(`Placing item ${i} into column ${col} at ${columnHeight}px`);
          columnHeight += heightWithGap;
        } else {
          // We need to consider an additional column
          col++;

          if (col === maxColumns) {
            // We cannot expand any more, so totally bail out
            console.log(`No more room at all! Hide after index: ${i}`);
            hideAfterIndex = i;
            hiddenCount = items.length - i;
            break;
          } else if (col === columns) {
            // We ran out of columns for this attempt, so restart the big loop
            console.log(`No more room in ${columns} column(s)!`);
            tryMoreColumns = true;
            break;
          } else {
            // We still have room for another column
            console.log(`Placing item ${i} into column ${col} at 0px`);
            columnHeight = heightWithGap;
          }
        }
      }
      
      totalHeight = Math.max(totalHeight, columnHeight);
      
      // If everything fit, or we ran compeltely out of room, we are done
      if (!tryMoreColumns) {
        break;
      }
    }

    console.log(`Final height: ${totalHeight.toFixed(2)}, Hidden count: ${hiddenCount}, columns: ${columns}`);

    // Enable flex-wrap if there are multiple columns
    if (columns > 1) {
      list.style.flexWrap = 'wrap';
      list.style.justifyContent = 'start';
      list.style.maxHeight = `${maxTotalHeight}px`;

      // Do some CSS math to calculate the width of each item
      const gapSpacing = itemGap * (columns - 1) / columns;
      itemWidth = `calc(${(100 / columns)}% - ${gapSpacing}px)`;
      items.forEach(item => {
        item.style.width = itemWidth;
      })
    }
    
    // Hide the extra items
    for (let i = hideAfterIndex; i < items.length; i++) {
      const item = items[i];
      item.style.display = 'none';
    }
    
    // Check if we should show the "And X more" text
    const showMoreText = list.getAttribute('data-list-hidden-count') === 'true';

    // Create and add the "And X more" element if needed
    if (hiddenCount > 0 && showMoreText) {
      const moreElement = document.createElement('div');
      moreElement.className = 'item';
      moreElement.style.width = itemWidth;
      moreElement.innerHTML = `
        <div class="meta"></div>
        <div class="content">
          <span class="label label--gray-out">And ${hiddenCount} more</span>
        </div>
      `;
      list.appendChild(moreElement);
    }
  });
}

/**
 * Adjust the gap of grid elements with odd widths.
 * This adjustment helps maintain pixel-perfect layouts by ensuring
 * that grids with odd widths have appropriate gaps.
 */
function adjustGridGaps() {
  const gridElements = document.querySelectorAll('.grid');

  gridElements.forEach(grid => {
    // Skip grids that have explicitly disabled gap adjustment
    if (grid.getAttribute('data-adjust-grid-gaps') === 'false') {
      return;
    }

    const gridWidth = grid.offsetWidth;
    let shouldAdjustGap = false;

    // Check if the grid has a .grid--cols-x class
    const colsClass = Array.from(grid.classList).find(cls => cls.startsWith('grid--cols-'));

    if (colsClass) {
      // Grids defined as .grid .grid--cols-x
      shouldAdjustGap = gridWidth % 2 !== 0;
    } else {
      // Grids defined .grid with .col--span-x children
      const columns = grid.querySelectorAll('[class*="col--span-"]');
      shouldAdjustGap = Array.from(columns).some(col => col.offsetWidth % 2 !== 0);
    }

    if (shouldAdjustGap) {
      const computedStyle = window.getComputedStyle(grid);
      const currentGap = parseInt(computedStyle.gap, 10);

      if (!isNaN(currentGap) && currentGap > 0) {
        const newGap = Math.max(currentGap - 1, 0);
        grid.style.gap = `${newGap}px`;
      }
    }
  });
}

/**
 * Adjust the gap of column elements with odd widths.
 * This adjustment helps maintain pixel-perfect layouts by ensuring
 * that column containers with odd widths have appropriate gaps.
 */
function adjustColumnGaps() {
  const columnContainers = document.querySelectorAll('.columns');

  columnContainers.forEach(container => {
    // Skip columns that have explicitly disabled gap adjustment
    if (container.getAttribute('data-adjust-column-gaps') === 'false') {
      return;
    }

    const columns = container.querySelectorAll('.column');
    const shouldAdjustGap = Array.from(columns).some(col => col.offsetWidth % 2 !== 0);

    if (shouldAdjustGap) {
      const computedStyle = window.getComputedStyle(container);
      const currentGap = parseInt(computedStyle.gap, 10);

      if (!isNaN(currentGap) && currentGap > 0) {
        const newGap = Math.max(currentGap - 1, 0);
        container.style.gap = `${newGap}px`;
      }
    }
  });
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
  // First pass: mark all elements with data-pixel-perfect="true" 
  // to exclude their parent elements from processing
  const pixelPerfectElements = document.querySelectorAll('[data-pixel-perfect="true"]');
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
  
  // Second pass: select elements to process
  // We'll only process elements with data-pixel-perfect="true"
  const elements = Array.from(document.getElementsByTagName('*')).filter(element => {
    // Skip already processed elements
    if (element.hasAttribute('data-pixel-processed')) return false;
    
    // Only process direct pixel-perfect elements
    return element.getAttribute('data-pixel-perfect') === 'true';
  });
  
  console.log(`Found ${elements.length} elements to process.`);

  elements.forEach(element => {
    if (!element.textContent.trim()) return;
    
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
        console.warn('Pixel perfect: Text mismatch or no lines detected, keeping original content', element);
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
      measureEl.style.font = style.font;
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
      
      // Verify that content wasn't lost
      if (element.textContent.trim().length === 0 && originalText.trim().length > 0) {
        console.warn('Pixel perfect: Content lost, restoring original');
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
  
  // Clean up the temporary attributes we added
  document.querySelectorAll('[data-has-pixel-perfect-children]').forEach(el => {
    el.removeAttribute('data-has-pixel-perfect-children');
  });

  console.log('Pixel perfect font adjustment completed.');
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

    let elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Reduce font size until the text fits within width and optional max height
    while (
      (elementRect.width > containerRect.width || 
        (maxHeight && elementRect.height > maxHeight))
      && fontSize > minFontSize
    ) {
      fontSize -= step;
      
      // Find the closest size in our map and get its corresponding properties
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

    console.log(`Adjusted element:`, element, 
      `New font size: ${fontSize}px, ` +
      `New font weight: ${element.style.fontWeight}, ` +
      `New line height: ${element.style.lineHeight}`
    );
  });
}

/**
 * Content limitation functionality
 * Limits content height based on view type and applies appropriate classes
 */

// Check if HEIGHT_THRESHOLDS is already defined on the window object
if (!window.hasOwnProperty('HEIGHT_THRESHOLDS')) {
  window.HEIGHT_THRESHOLDS = {
    'view--full': 400,
    'view--half_vertical': 400,
    'view--quadrant': 160,
    'view--half_horizontal': 160
  };
}

// Determine the height threshold based on the view type or data attribute
function getHeightThreshold(element) {
  const dataThreshold = element.dataset.contentMaxHeight;
  if (dataThreshold) {
    return parseInt(dataThreshold, 10);
  }

  for (const [viewClass, threshold] of Object.entries(window.HEIGHT_THRESHOLDS)) {
    if (element.closest(`.${viewClass}`)) {
      return threshold;
    }
  }
  return window.HEIGHT_THRESHOLDS['view--full']; // Default threshold
}

// Add appropriate class and inline style based on element height
function addClassBasedOnHeight(element, height, threshold) {
  if (height > threshold) {
    element.classList.add('content--small');
    element.style.maxHeight = `${threshold}px`; // Add inline style
    console.log(`Class content--small added to element and max-height set to ${threshold}px.`);

    const lines = Math.floor(threshold / 16); // Calculate lines of text based on threshold
    element.classList.add(`clamp--${lines}`);
    console.log(`Class clamp--${lines} added to element.`);
  }
}

// Apply content limits to all content elements
function applyContentLimits() {
  const elements = document.querySelectorAll('[data-content-limiter="true"]');
  console.log(`Found ${elements.length} content elements for limiting.`);
  elements.forEach(element => {
    const height = element.offsetHeight;
    console.log(`Element height: ${height}px`); // Log the height of each element
    const threshold = getHeightThreshold(element);
    addClassBasedOnHeight(element, height, threshold);
  });
}


/**
 * Wrapping all transformers into single function so they can be re-binded from
 * other locations in application, for example the live preview markup editor
 */
function terminalize() {
  // Run most operations concurrently, but keep formatValue and fitValue sequential
  Promise.all([
    Promise.resolve().then(adjustIndexSpanWidths),
    Promise.resolve().then(async () => {
      await Promise.resolve().then(formatValue);
      await Promise.resolve().then(fitValue);
    }),
    Promise.resolve().then(manageOverflow),
    Promise.resolve().then(adjustGridGaps),
    Promise.resolve().then(adjustColumnGaps),
    Promise.resolve().then(async () => {
      await Promise.resolve().then(applyContentLimits);
      await Promise.resolve().then(pixelPerfectFonts);
    }),
  ]).catch(console.error);
}

/**
 * This listener ensures that our custom functions run after the DOM is fully loaded
 * AND all associated resources (images, stylesheets, etc.) are completely loaded.
 * Uses addEventListener("load") vs onload= to avoid being overwritten by other scripts with same listener
 */
window.addEventListener('load', function() {
  terminalize();
})
