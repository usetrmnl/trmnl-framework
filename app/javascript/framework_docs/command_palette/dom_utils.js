// DOM manipulation utilities for Command Palette
import { CSS_CLASSES } from "framework_docs/command_palette/constants"

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
