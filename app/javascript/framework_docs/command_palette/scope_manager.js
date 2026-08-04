// Scope management for Command Palette drill-down functionality
import { CSS_CLASSES, DATA_ATTRIBUTES, SELECTORS } from "framework_docs/command_palette/constants"
import { 
  createElement, 
  createFragmentFromTemplate,
  removeAllMatching,
  batchAppend
} from "framework_docs/command_palette/dom_utils"

export class ScopeManager {
  constructor(rootElement) {
    this.root = rootElement
    this.scopeStack = []
    this.injectedHeader = null
  }

  /**
   * Get current scope depth
   * @returns {number} Number of scopes in stack
   */
  get depth() {
    return this.scopeStack.length
  }

  /**
   * Get current scope
   * @returns {Object|null} Current scope or null
   */
  get currentScope() {
    return this.scopeStack[this.scopeStack.length - 1] || null
  }

  /**
   * Push a new scope onto the stack
   * @param {Object} scope - Scope object with id and label
   * @param {Element} listContainer - List container to update
   * @param {Function} onScopeLoaded - Callback after scope is loaded
   */
  pushScope(scope, listContainer, onScopeLoaded) {
    if (!scope?.id) return
    
    this.scopeStack.push({
      id: scope.id,
      label: scope.label || scope.id
    })
    
    this.loadScope(scope.id, listContainer, onScopeLoaded)
  }

  /**
   * Pop the current scope
   * @param {Element} listContainer - List container to update
   * @param {Function} onScopePopped - Callback after scope is popped
   * @returns {Object|null} Popped scope or null
   */
  popScope(listContainer, onScopePopped) {
    if (this.scopeStack.length === 0) return null
    
    const popped = this.scopeStack.pop()
    const previousScope = this.currentScope
    
    if (previousScope) {
      this.loadScope(previousScope.id, listContainer, onScopePopped)
    } else {
      // No scope left, clear and callback
      this.clearScopeContent(listContainer)
      if (onScopePopped) onScopePopped()
    }
    
    return popped
  }

  /**
   * Clear all scopes
   * @param {boolean} updateUI - Whether to update UI elements
   */
  clearScope(updateUI = true) {
    this.scopeStack = []
    this.removeInjectedHeader()
    
    if (updateUI) {
      this.renderPills(null)
    }
  }

  /**
   * Load scope content from template
   * @private
   */
  loadScope(scopeId, listContainer, callback) {
    const fragment = createFragmentFromTemplate(
      `template[data-scope-id="${scopeId}"]`,
      this.root
    )
    
    if (!fragment) {
      if (callback) callback()
      return
    }
    
    this.clearScopeContent(listContainer)
    listContainer.appendChild(fragment)
    
    if (callback) callback()
  }

  /**
   * Clear scope content from container
   * @private
   */
  clearScopeContent(container) {
    removeAllMatching(container, SELECTORS.item)
    removeAllMatching(container, SELECTORS.sectionHeader)
    this.removeInjectedHeader()
  }

  /**
   * Render scope pills/breadcrumbs
   * @param {Element} pillContainer - Container for pills
   */
  renderPills(pillContainer) {
    if (!pillContainer) return
    
    pillContainer.innerHTML = ''
    
    const pills = this.scopeStack.map(({ label }) => 
      createElement('span', {
        classes: CSS_CLASSES.pill.split(' '),
        content: label
      })
    )
    
    batchAppend(pills, pillContainer)
  }

  /**
   * Inject scope header after top result
   * @param {Element} listContainer - List container
   */
  injectScopeHeader(listContainer) {
    this.removeInjectedHeader()
    
    const currentScope = this.currentScope
    if (!currentScope) return
    
    this.injectedHeader = createElement('h3', {
      classes: CSS_CLASSES.scopeHeader.split(' '),
      content: currentScope.label,
      attributes: {
        'data-command-palette-target': 'sectionHeader'
      },
      dataset: {
        group: currentScope.label.toLowerCase(),
        injectedScopeHeader: 'true'
      }
    })
    
    listContainer.insertAdjacentElement('afterbegin', this.injectedHeader)
  }

  /**
   * Remove injected scope header
   */
  removeInjectedHeader() {
    if (this.injectedHeader?.parentNode) {
      this.injectedHeader.parentNode.removeChild(this.injectedHeader)
    }
    this.injectedHeader = null
  }

  /**
   * Check if an item can create a scope
   * @param {Element} element - Item element to check
   * @returns {Object|null} Scope info or null
   */
  getScopeFromElement(element) {
    if (!element) return null
    
    const scopeId = element.dataset?.[DATA_ATTRIBUTES.scopeId]
    if (!scopeId) return null
    
    const scopeLabel = element.dataset?.[DATA_ATTRIBUTES.scopeLabel]
    const title = element.dataset?.[DATA_ATTRIBUTES.title]
    const key = element.dataset?.[DATA_ATTRIBUTES.key]
    
    return {
      id: scopeId,
      label: scopeLabel || title || key || 'Scope'
    }
  }
}
