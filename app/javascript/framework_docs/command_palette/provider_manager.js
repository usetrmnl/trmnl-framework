// Provider management for Command Palette
import { PROVIDERS, DATA_ATTRIBUTES, SELECTORS } from "framework_docs/command_palette/constants"
import { 
  safeQuery, 
  safeQueryAll, 
  createFragmentFromTemplate,
  removeAllMatching,
  getDataAttribute,
  devLog,
  devError
} from "framework_docs/command_palette/dom_utils"

export class ProviderManager {
  constructor(rootElement) {
    this.root = rootElement
    this.currentProviderId = null
    this.availableProviders = this.findAvailableProviders()
  }

  /**
   * Find all available providers from templates
   * @returns {Array<string>} Array of provider IDs
   */
  findAvailableProviders() {
    try {
      return safeQueryAll(this.root, SELECTORS.providerTemplate)
        .map(template => getDataAttribute(template, 'providerId'))
        .filter(id => id)
    } catch {
      return [PROVIDERS.APPLICATION]
    }
  }

  /**
   * Load a provider by ID
   * @param {string} providerId - Provider ID to load
   * @param {Element} listContainer - Container to append items to
   * @returns {boolean} Success status
   */
  loadProvider(providerId, listContainer) {
    devLog('📦 Loading provider:', providerId)
    if (this.isProviderLoaded(providerId, listContainer)) return true

    const fragment = createFragmentFromTemplate(
      `template[data-provider-id="${providerId}"]`,
      this.root
    )
    
    if (!fragment) {
      devError('❌ Template not found for provider:', providerId)
      return false
    }

    // Remove current provider nodes if any
    if (this.currentProviderId) {
      devLog('🗑️ Removing current provider nodes:', this.currentProviderId)
      this.removeProviderNodes(this.currentProviderId, listContainer)
    }

    // Process the fragment based on provider type
    if (providerId === PROVIDERS.UNIFIED) {
      devLog('🔄 Processing unified provider')
      this.processUnifiedProvider(fragment, providerId)
    } else {
      devLog('📄 Processing standard provider')
      this.processStandardProvider(fragment, providerId)
    }

    listContainer.appendChild(fragment)
    this.currentProviderId = providerId
    
    devLog('✅ Provider loaded successfully:', providerId)
    return true
  }

  isProviderLoaded(providerId, listContainer) {
    return this.currentProviderId === providerId &&
      !!listContainer?.querySelector(SELECTORS.withDataProvider(providerId))
  }

  /**
   * Process unified provider fragment
   * @private
   */
  processUnifiedProvider(fragment, providerId) {
    const originWrappers = fragment.querySelectorAll(`[data-${DATA_ATTRIBUTES.originProvider}]`)
    devLog('🔄 Processing unified provider, origin wrappers found:', originWrappers.length)
    
    // Also try the kebab-case version
    const kebabWrappers = fragment.querySelectorAll(`[data-origin-provider]`)
    devLog('🔍 Kebab-case origin wrappers found:', kebabWrappers.length)
    
    // Use whichever wrapper format was found
    const wrappersToProcess = originWrappers.length > 0 ? originWrappers : kebabWrappers
    
    if (wrappersToProcess.length > 0) {
      devLog('✅ Using wrappers:', originWrappers.length > 0 ? 'camelCase' : 'kebab-case')
      wrappersToProcess.forEach((wrapper, index) => {
        const origin = wrapper.getAttribute(`data-${DATA_ATTRIBUTES.originProvider}`) || 
                      wrapper.getAttribute('data-origin-provider')
        devLog(`📦 Processing wrapper ${index} with origin:`, origin)
        
        const items = wrapper.querySelectorAll(`${SELECTORS.item}`)
        const headers = wrapper.querySelectorAll(`${SELECTORS.sectionHeader}`)
        devLog(`  - Items found: ${items.length}`)
        devLog(`  - Headers found: ${headers.length}`)
        
        // Tag all items with their origin
        wrapper.querySelectorAll(`${SELECTORS.item}, ${SELECTORS.sectionHeader}`)
          .forEach(el => {
            el.dataset[DATA_ATTRIBUTES.provider] = origin
            el.dataset[DATA_ATTRIBUTES.mountedProvider] = providerId
          })
        
        // Unwrap wrapper to flatten structure
        while (wrapper.firstChild) {
          wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper)
        }
        wrapper.remove()
      })
    } else {
      devLog('⚠️ No origin wrappers found, tagging everything with unified')
      // No origin wrappers, tag everything with unified
      this.tagProviderElements(fragment, providerId, providerId)
    }
  }

  /**
   * Process standard provider fragment
   * @private
   */
  processStandardProvider(fragment, providerId) {
    this.tagProviderElements(fragment, providerId, providerId)
  }

  /**
   * Tag all relevant elements with provider data
   * @private
   */
  tagProviderElements(container, providerId, mountedProviderId) {
    container.querySelectorAll(`${SELECTORS.item}, ${SELECTORS.sectionHeader}`)
      .forEach(el => {
        el.dataset[DATA_ATTRIBUTES.provider] = providerId
        el.dataset[DATA_ATTRIBUTES.mountedProvider] = mountedProviderId
      })
  }

  /**
   * Remove all nodes from a specific provider
   * @param {string} providerId - Provider ID to remove
   * @param {Element} container - Container to remove from
   */
  removeProviderNodes(providerId, container) {
    removeAllMatching(container, SELECTORS.withDataProvider(providerId))
  }

  /**
   * Get next provider in cycle
   * @param {number} direction - Direction to cycle (1 or -1)
   * @returns {string|null} Next provider ID or null
   */
  getNextProvider(direction = 1) {
    const providers = this.availableProviders.length > 0 
      ? this.availableProviders 
      : [PROVIDERS.APPLICATION]
    
    if (providers.length < 2) return null
    
    const currentIndex = Math.max(0, providers.indexOf(this.currentProviderId))
    const nextIndex = (currentIndex + direction + providers.length) % providers.length
    
    return providers[nextIndex]
  }

  /**
   * Get provider at specific index
   * @param {number} index - Provider index (0-based)
   * @returns {string|null} Provider ID or null
   */
  getProviderAtIndex(index) {
    const providers = this.availableProviders.length > 0 
      ? this.availableProviders 
      : [PROVIDERS.APPLICATION]
    
    if (index < 0 || index >= providers.length) return null
    
    return providers[index]
  }

  /**
   * Detect applicable provider based on current page
   * @returns {string} Recommended provider ID
   */
  detectApplicableProvider() {
    try {
      const path = window.location?.pathname || ''
      devLog('🦭 Detecting applicable provider for path:', path)
      
      if (/^\/framework(_v2)?(\/|$)/.test(path) || /^\/docs(\/|$)/.test(path)) {
        devLog('📚 Framework docs provider detected')
        return PROVIDERS.FRAMEWORK_DOCS
      }
      
      devLog('📱 Application provider detected')
      return PROVIDERS.APPLICATION
    } catch {
      devLog('⚠️ Error detecting provider, defaulting to application')
      return PROVIDERS.APPLICATION
    }
  }

  /**
   * Reorder sections by provider preference
   * @param {Array} sections - Array of section objects
   * @param {string} preferredProvider - Preferred provider ID
   * @returns {Array} Reordered sections
   */
  reorderSectionsByProvider(sections, preferredProvider) {
    devLog('🔄 Reordering sections by preferred provider:', preferredProvider)
    
    const getSectionProvider = (section) => {
      const headerProvider = section?.header?.dataset?.[DATA_ATTRIBUTES.provider]
      if (headerProvider) return headerProvider
      
      const firstItem = section?.items?.[0]
      return firstItem?.el?.dataset?.[DATA_ATTRIBUTES.provider] || null
    }
    
    const preferred = []
    const others = []
    
    sections.forEach(section => {
      const provider = getSectionProvider(section)
      const sectionName = section.header?.textContent?.trim() || 'No Header'
      devLog(`📁 Section "${sectionName}" has provider:`, provider)
      
      if (provider === preferredProvider) {
        devLog(`⬆️ Moving "${sectionName}" to preferred (${provider})`)
        preferred.push(section)
      } else {
        devLog(`⬇️ Moving "${sectionName}" to others (${provider})`)
        others.push(section)
      }
    })
    
    devLog('🎯 Reorder result:', {
      preferred: preferred.length,
      others: others.length,
      total: preferred.length + others.length
    })
    
    return [...preferred, ...others]
  }
}
