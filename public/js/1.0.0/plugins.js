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
    const items = Array.from(list.querySelectorAll('.item'));
    let hiddenCount = 0;
    let totalHeight = 0;

    // Get the computed style of the list to find the gap
    const listStyle = window.getComputedStyle(list);
    const itemGap = parseFloat(listStyle.gap) || 0;

    console.log(`List max height: ${maxTotalHeight}, Item gap: ${itemGap}`);

    // Show all items initially and calculate total height
    items.forEach((item, index) => {
      item.style.display = '';
      const itemRect = item.getBoundingClientRect();
      const itemHeight = itemRect.height;
      const heightWithGap = index === 0 ? itemHeight : itemHeight + itemGap;
      totalHeight += heightWithGap;
    });

    // Hide items from the bottom up until the list fits
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const itemRect = item.getBoundingClientRect();
      const itemHeight = itemRect.height;
      const heightWithGap = i === 0 ? itemHeight : itemHeight + itemGap;

      if (totalHeight > maxTotalHeight) {
        item.style.display = 'none';
        hiddenCount++;
        totalHeight -= heightWithGap;
        console.log(`Hiding item ${i + 1}, new total height: ${totalHeight.toFixed(2)}`);
      } else {
        break;
      }
    }

    console.log(`Final height: ${totalHeight.toFixed(2)}, Hidden count: ${hiddenCount}`);

    // Check if we should show the "And X more" text
    const showMoreText = list.getAttribute('data-list-hidden-count') === 'true';

    // Create and add the "And X more" element if needed
    if (hiddenCount > 0 && showMoreText) {
      const moreElement = document.createElement('div');
      moreElement.className = 'item';
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
 * Format numeric values with dynamic precision based on available space
 */
function formatValue() {
  const valueElements = document.querySelectorAll('[data-value-type="number"]');
  console.log('Found elements:', valueElements.length);

  valueElements.forEach(element => {
    // Idempotency in case formatValue() is invoked multiple times due to 'resize' event, etc
    if (element.dataset.rawValue == null) {
      element.dataset.rawValue = element.textContent;
    }

    const container = element.parentElement;
    const availableWidth = container.clientWidth;
    const rawValue = element.dataset.rawValue.replace(/[$,]/g, '');
    const number = parseFloat(rawValue);

    console.log('Processing element:', {
      rawValue,
      number,
      availableWidth,
      currentText: element.textContent
    });

    // Try different format combinations until it fits
    const formattedValue = findBestFormat(number, availableWidth, element);
    console.log('Formatted value:', formattedValue);

    element.textContent = formattedValue;

    // If still needed, adjust font size as last resort
    if (element.getAttribute('data-value-fit') === 'true') {
      fitTextToContainer(element);
    }
  });
}

/**
 * Find the best number format that fits the available space
 * Returns the formatted string that best fits
 */
function findBestFormat(number, availableWidth, element) {
  // Get any existing prefix from the element (currency symbol, etc.)
  const prefix = element.textContent.replace(/[\d,.\s]+.*$/, '') || '';

  // Create test element once
  const testElement = element.cloneNode(true);
  testElement.style.cssText = 'visibility: hidden; position: absolute;';
  Object.assign(testElement.style, {
    fontSize: window.getComputedStyle(element).fontSize,
    fontFamily: window.getComputedStyle(element).fontFamily
  });
  element.parentElement.appendChild(testElement);

  // Helper to test if a format fits
  const doesFit = (text) => {
    testElement.textContent = prefix + text;
    return testElement.scrollWidth <= availableWidth;
  };

  // Format definitions with thresholds
  const formats = [
    { threshold: 1000000000, suffix: 'B', divisor: 1000000000 },
    { threshold: 1000000, suffix: 'M', divisor: 1000000 },
    { threshold: 1000, suffix: 'K', divisor: 1000 }
  ];

  try {
    // Try full number first
    const fullNumber = number.toLocaleString();
    if (doesFit(fullNumber)) return prefix + fullNumber;

    // Try each format
    for (const { threshold, suffix, divisor } of formats) {
      if (number >= threshold) {
        const value = number / divisor;
        // Try different precisions
        for (let precision = 2; precision >= 0; precision--) {
          const formatted = `${value.toFixed(precision)}${suffix}`;
          if (doesFit(formatted)) return prefix + formatted;
        }
        return prefix + `${Math.round(value)}${suffix}`;
      }
    }

    return prefix + number.toString();
  } finally {
    testElement.remove();
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
  // Select elements that have either .text-pixel OR text-align: center
  // Exclude any that have already been processed
  const elements = Array.from(document.getElementsByTagName('*')).filter(element => {
    const style = window.getComputedStyle(element);
    return (element.classList.contains('text-pixel') || style.textAlign === 'center')
           && !element.hasAttribute('data-pixel-processed');
  });
  console.log(`Found ${elements.length} elements to process.`);

  elements.forEach(element => {
    if (!element.textContent.trim()) return;
    element.setAttribute('data-pixel-processed', 'true');

    if (element.classList.contains('text-pixel')) {
      // Original pixel-perfect processing for .text-pixel elements
      const originalText = element.textContent;

      // Create a temporary element to measure text
      const temp = document.createElement('div');
      temp.style.position = 'absolute';
      temp.style.visibility = 'hidden';
      temp.style.width = getComputedStyle(element).width;
      temp.style.font = getComputedStyle(element).font;
      temp.style.whiteSpace = 'pre-wrap';
      temp.textContent = originalText;
      document.body.appendChild(temp);

      // Clear the original element
      element.innerHTML = '';

      // Create spans for each line
      let lastTop = -1;
      let currentSpan;
      let currentLine = '';

      Array.from(originalText).forEach((char, index) => {
        const range = document.createRange();
        range.setStart(temp.firstChild, index);
        range.setEnd(temp.firstChild, index + 1);
        const rect = range.getBoundingClientRect();

        if (rect.top !== lastTop) {
          if (currentSpan) {
            currentSpan.textContent = currentLine;
            let width = currentSpan.getBoundingClientRect().width;
            width = Math.ceil(width);
            if (width % 2 !== 0) width += 1;
            currentSpan.style.width = `${width}px`;
            currentLine = '';
          }
          currentSpan = document.createElement('span');
          element.appendChild(currentSpan);
          lastTop = rect.top;
        }

        currentLine += char;
      });

      // Add the last line
      if (currentSpan && currentLine) {
        currentSpan.textContent = currentLine;
        let width = currentSpan.getBoundingClientRect().width;
        width = Math.ceil(width);
        if (width % 2 !== 0) width += 1;
        currentSpan.style.width = `${width}px`;
      }

      document.body.removeChild(temp);
    } else {
      // For text-align: center elements, adjust the element's width directly
      const style = window.getComputedStyle(element);
      if (style.textAlign === 'center' && element.tagName != 'BUTTON') { // ignore resizing buttons in-app
        let width = element.getBoundingClientRect().width;
        width = Math.ceil(width);

        // Ensure width is even
        if (width % 2 !== 0) {
          width += 1;
        }

        element.style.width = `${width}px`;
      }
    }

    // Apply the same logic to .text-pixel spans
    if (element.classList.contains('text-pixel')) {
      const parentWidth = element.getBoundingClientRect().width;
      const parentIsEven = Math.ceil(parentWidth) % 2 === 0;

      element.querySelectorAll('span').forEach(span => {
        let width = span.getBoundingClientRect().width;
        width = Math.ceil(width);

        if (parentIsEven && width % 2 !== 0) {
          width += 1;
        } else if (!parentIsEven && width % 2 === 0) {
          width += 1;
        }

        span.style.width = `${width}px`;
      });
    }
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
  const elements = document.querySelectorAll('[data-fit-value="true"]');
  
  elements.forEach(element => {
    const container = element.parentElement;
    if (!container) return;

    // Optional max height from data attribute
    const maxHeight = element.dataset.fitValueMaxHeight 
      ? parseFloat(element.dataset.fitValueMaxHeight)
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
 * Wrapping all transformers into single function so they can be re-binded from
 * other locations in application, for example the live preview markup editor
 */
function terminalize() {
  adjustIndexSpanWidths();
  formatValue();
  fitValue();
  manageOverflow();
  adjustGridGaps();
  pixelPerfectFonts();
}

/**
 * This listener ensures that our custom functions run after the DOM is fully loaded
 * AND all associated resources (images, stylesheets, etc.) are completely loaded.
 * Uses addEventListener("load") vs onload= to avoid being overwritten by other scripts with same listener
 */
window.addEventListener('load', function() {
  terminalize();
})
