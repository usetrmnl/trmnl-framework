// Animation utilities for Command Palette
import { ANIMATION, CSS_CLASSES } from "framework_docs/command_palette/constants"

export class AnimationManager {
  constructor(backdropElement, panelElement) {
    this.backdrop = backdropElement
    this.panel = panelElement
    this.animating = false
  }

  /**
   * Animate elements in (show)
   * @param {Function} onComplete - Callback when animation completes
   */
  animateIn(onComplete) {
    if (this.animating) return
    this.resetAnimationState()
    if (onComplete) onComplete()
  }

  /**
   * Animate elements out (hide)
   * @param {Function} onComplete - Callback when animation completes
   */
  animateOut(onComplete) {
    if (this.animating) return
    this.resetAnimationState()
    if (onComplete) onComplete()
  }

  /**
   * Reset animation state (remove animation classes)
   */
  resetAnimationState() {
    const { backdrop, panel } = ANIMATION.TRANSITION_CLASSES
    
    this.setClasses(this.backdrop, backdrop.leave, false)
    this.setClasses(this.panel, panel.leave, false)
    
    this.setTransition(this.backdrop, '')
    this.setTransition(this.panel, '')
  }

  /**
   * Helper to set/unset classes on an element
   * @private
   */
  setClasses(element, classes, add) {
    if (!element) return
    
    if (add) {
      element.classList.add(...classes)
    } else {
      element.classList.remove(...classes)
    }
  }

  /**
   * Helper to set transition style
   * @private
   */
  setTransition(element, transition) {
    if (!element) return
    element.style.transition = transition
  }
}

/**
 * Utility to smoothly scroll an element into view within its container
 * @param {HTMLElement} element - Element to scroll into view
 * @param {HTMLElement} container - Container element with scroll
 * @param {Object} options - Scroll options
 */
export function scrollIntoView(element, container, options = {}) {
  if (!element || !container) return
  
  const { 
    behavior = 'auto',
    padding = 0 
  } = options
  
  const containerRect = container.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  
  const isAbove = elementRect.top < containerRect.top + padding
  const isBelow = elementRect.bottom > containerRect.bottom - padding
  
  if (isAbove) {
    const scrollAmount = elementRect.top - containerRect.top - padding
    if (behavior === 'smooth') {
      container.scrollBy({ top: scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollTop += scrollAmount
    }
  } else if (isBelow) {
    const scrollAmount = elementRect.bottom - containerRect.bottom + padding
    if (behavior === 'smooth') {
      container.scrollBy({ top: scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollTop += scrollAmount
    }
  }
}

/**
 * Check if an element is visible within its scrollable container
 * @param {HTMLElement} element - Element to check
 * @param {HTMLElement} container - Container element
 * @returns {boolean} True if element is fully visible
 */
export function isElementInViewport(element, container) {
  if (!element || !container) return false
  
  const containerRect = container.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  
  return elementRect.top >= containerRect.top && 
         elementRect.bottom <= containerRect.bottom
}
