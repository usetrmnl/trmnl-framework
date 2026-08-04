// DOM manipulation utilities for Command Palette
import { CSS_CLASSES, DATA_ATTRIBUTES, SELECTORS } from "framework_docs/command_palette/constants"

/**
 * Safely query DOM elements with error handling
 * @param {Element} root - Root element to query from
 * @param {string} selector - CSS selector
 * @returns {Element|null} Found element or null
 */
export function safeQuery(root, selector) {
  try {
    return root?.querySelector(selector) || null
  } catch {
    return null
  }
}

/**
 * Safely query all DOM elements with error handling
 * @param {Element} root - Root element to query from
 * @param {string} selector - CSS selector
 * @returns {Array} Array of found elements
 */
export function safeQueryAll(root, selector) {
  try {
    return Array.from(root?.querySelectorAll(selector) || [])
  } catch {
    return []
  }
}

/**
 * Toggle visibility of an element
 * @param {Element} element - Element to toggle
 * @param {boolean} visible - Whether to show or hide
 */
export function toggleVisibility(element, visible) {
  if (!element) return
  element.classList.toggle(CSS_CLASSES.hidden, !visible)
}

/**
 * Set aria-selected attribute on element
 * @param {Element} element - Element to update
 * @param {boolean} selected - Selection state
 */
export function setAriaSelected(element, selected) {
  if (!element) return
  element.setAttribute('aria-selected', selected ? 'true' : 'false')
}

/**
 * Get data attribute value with fallback
 * @param {Element} element - Element to read from
 * @param {string} attribute - Attribute name (without data- prefix)
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Attribute value or default
 */
export function getDataAttribute(element, attribute, defaultValue = null) {
  if (!element) return defaultValue
  
  // Try both camelCase and kebab-case
  const camelCase = element.dataset?.[attribute]
  const kebabCase = element.dataset?.[attribute.replace(/([A-Z])/g, '-$1').toLowerCase()]
  
  return camelCase ?? kebabCase ?? defaultValue
}

/**
 * Create a document fragment from template
 * @param {string} templateSelector - Template selector
 * @param {Element} root - Root element to search in
 * @returns {DocumentFragment|null} Cloned template content or null
 */
export function createFragmentFromTemplate(templateSelector, root = document) {
  const template = safeQuery(root, templateSelector)
  if (!template?.content) return null
  return template.content.cloneNode(true)
}

/**
 * Remove all matching elements
 * @param {Element} container - Container to remove from
 * @param {string} selector - Selector for elements to remove
 */
export function removeAllMatching(container, selector) {
  if (!container) return
  safeQueryAll(container, selector).forEach(el => el.remove())
}

/**
 * Create element with classes and attributes
 * @param {string} tag - HTML tag name
 * @param {Object} options - Options object
 * @returns {Element} Created element
 */
export function createElement(tag, options = {}) {
  const { classes = [], attributes = {}, dataset = {}, content = '' } = options
  
  const element = document.createElement(tag)
  
  if (classes.length > 0) {
    element.className = classes.join(' ')
  }
  
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
  
  Object.entries(dataset).forEach(([key, value]) => {
    element.dataset[key] = value
  })
  
  if (content) {
    element.textContent = content
  }
  
  return element
}

/**
 * Batch DOM updates using document fragment
 * @param {Array} elements - Elements to append
 * @param {Element} container - Container to append to
 * @param {boolean} clear - Whether to clear container first
 */
export function batchAppend(elements, container, clear = false) {
  if (!container) return
  
  if (clear) {
    container.innerHTML = ''
  }
  
  const fragment = document.createDocumentFragment()
  elements.forEach(el => fragment.appendChild(el))
  container.appendChild(fragment)
}

/**
 * Provider indicator state management
 * @param {Element} indicator - Indicator element
 * @param {boolean} active - Whether indicator is active
 */
export function setProviderIndicatorState(indicator, active) {
  if (!indicator) return
  
  const { inactive, active: activeClasses } = CSS_CLASSES.providerIndicator
  
  // Remove all state classes
  indicator.classList.remove(...inactive, ...activeClasses)
  
  // Add appropriate state classes
  if (active) {
    indicator.classList.add(...activeClasses)
  } else {
    indicator.classList.add(...inactive)
  }
}

/**
 * Defer function execution to after render
 * @param {Function} fn - Function to defer
 * @param {number} frames - Number of frames to wait (default: 2)
 */
export function defer(fn, frames = 2) {
  if (frames <= 0) {
    fn()
    return
  }
  
  requestAnimationFrame(() => defer(fn, frames - 1))
}

/**
 * Check if we're in development environment
 * @returns {boolean} True if in development
 */
export function isDevelopment() {
  return window.location?.hostname === 'localhost' || 
         window.location?.port === '3000'
}

export function isDebugEnabled() {
  try {
    return window.localStorage?.getItem('commandPaletteDebug') === 'true'
  } catch {
    return false
  }
}

/**
 * Opt-in console logging
 * @param {...any} args - Arguments to log
 */
export function devLog(...args) {
  if (isDebugEnabled()) {
    console.log(...args)
  }
}

/**
 * Development-only console error logging
 * @param {...any} args - Arguments to log
 */
export function devError(...args) {
  if (isDevelopment()) {
    console.error(...args)
  }
}

/**
 * Check if element has default visibility
 * @param {Element} element - Element to check
 * @returns {boolean} Whether element should be visible by default
 */
export function isDefaultVisible(element) {
  if (!element) return true
  
  const defaultVisible = getDataAttribute(element, 'defaultVisible')
  const defaultVisibleAlt = getDataAttribute(element, 'default_visible')
  
  const hasDefaultVisible = defaultVisible !== null || defaultVisibleAlt !== null
  
  if (!hasDefaultVisible) return true
  
  const value = defaultVisible ?? defaultVisibleAlt
  const result = value !== 'false' && value !== false
  
  if (isDebugEnabled()) {
    const title = getDataAttribute(element, 'title') || 'Unknown'
    if (!hasDefaultVisible || !result) {
      devLog(`👁️ Default visibility for "${title}":`, {
        hasDefaultVisible,
        value,
        result
      })
    }
  }
  
  return result
}
