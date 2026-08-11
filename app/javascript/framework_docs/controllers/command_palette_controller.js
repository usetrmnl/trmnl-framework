import { Controller } from "@hotwired/stimulus"
import { KEYBOARD, CSS_CLASSES, SELECTORS } from "framework_docs/command_palette/constants"
import { SearchEngine } from "framework_docs/command_palette/search_utils"
import { AnimationManager, scrollIntoView } from "framework_docs/command_palette/animation_utils"
import { isTouchEnabled } from "framework_docs/lib/input_modality"
import {
  safeQuery,
  safeQueryAll,
  toggleVisibility,
  setAriaSelected,
  getDataAttribute,
  isDefaultVisible,
  devLog
} from "framework_docs/command_palette/dom_utils"

// Command Palette Controller (Cmd+K)
//
// Items are the docs index of the page's section, server-rendered into the list. They
// are cached flat (itemsCache) and grouped into sections on the first open.
//
// Search strategies (two code paths, same entry point, applyFilter):
//   No query  → _filterSectionsDefault: show defaultVisible items, preserve section order
//   With query → _filterSectionsGlobal: score ALL items globally, reorder sections by best match
//
// DOM ownership:
//   Both strategies clear and rebuild the list container via _clearDynamicListContent.
//   Fixed Stimulus targets (topHeader, topResultContainer, empty) survive all rebuilds.
//   _filterSectionsGlobal detaches unmatched items; _filterSectionsDefault re-attaches them.
//
// Data flow:
//   openPalette → loadItems → rebuildCache → applyFilter
//   onInput → applyFilter → filterAndSortSections → updateTopResult → updateEmptyState
//
export default class extends Controller {
  static targets = [
    "backdrop",
    "frame",
    "panel",
    "input",
    "list",
    "item",
    "sectionHeader",
    "topHeader",
    "topResultContainer",
    "empty",
    "keyboardHints",
    "closeButton"
  ]

  connect() {
    this.initializeManagers()
    this.initializeState()
    this.setupEventListeners()
  }

  disconnect() {
    this.cleanup()
  }

  // ========== Lifecycle ==========

  initializeManagers() {
    this.searchEngine = new SearchEngine()
    this.animationManager = new AnimationManager(this.backdropTarget, this.panelTarget)
  }

  initializeState() {
    this.open = false
    this.selectedIndex = -1
    this.previousActive = null
    this.hoverSelectionEnabled = false

    // Core data: flat item list + grouped sections (built on first open)
    this.itemsCache = []
    this.sections = []
    this.topResultItem = null
    this.visibleItemsCount = 0

    // Lookup caches, rebuilt in rebuildCache(), avoid per-keystroke Map creation
    this._itemElMap = new Map()
    this._itemToSectionMap = new Map()
    this._viewportLayoutFrame = null
    this._responsiveControlsState = null
    this._mobileViewportLayoutApplied = false
  }
  setupEventListeners() {
    this.handleGlobalKeydown = this.handleGlobalKeydown.bind(this)
    window.addEventListener("keydown", this.handleGlobalKeydown)

    this.handleOpenEvent = this.handleOpenEvent.bind(this)
    window.addEventListener("command-palette:open", this.handleOpenEvent)

    this.handleListMouseMove = this.handleListMouseMove.bind(this)
    this.handleListMouseLeave = this.handleListMouseLeave.bind(this)

    this.applyViewportLayout = this.applyViewportLayout.bind(this)
    this.scheduleViewportLayout = this.scheduleViewportLayout.bind(this)
  }

  cleanup() {
    window.removeEventListener("keydown", this.handleGlobalKeydown)
    window.removeEventListener("command-palette:open", this.handleOpenEvent)
    this.detachListPointerHandlers()
    this.detachViewportHandlers()
    this.cancelViewportLayout()
    this.resetViewportLayout()
  }
  // ========== Open / Close ==========

  toggle() {
    this.open ? this.close() : this.openPalette()
  }

  openPalette({ focus = true, immediateFocus = false } = {}) {
    if (this.open) {
      if (focus) this.focusInputNow()
      return
    }

    this.open = true
    this.previousActive = document.activeElement
    toggleVisibility(this.element, true)
    this.element.setAttribute("aria-hidden", "false")
    document.body.classList.add(CSS_CLASSES.overflowHidden)
    this.updateResponsiveControls()
    this.attachViewportHandlers()
    this.applyViewportLayout()

    this.resetPaletteState()
    this.loadItems()
    this.attachListPointerHandlers()
    if (focus && immediateFocus) this.focusInputNow()

    this.animationManager.animateIn(() => {
      if (this.open && focus && !immediateFocus) this.focusInputNow()
    })
  }

  close() {
    if (!this.open) return

    this.open = false

    const finishClose = () => {
      toggleVisibility(this.element, false)
      this.element.setAttribute("aria-hidden", "true")
      document.body.classList.remove(CSS_CLASSES.overflowHidden)
      this.detachViewportHandlers()
      this.resetViewportLayout()
      this.restoreFocus()
    }

    if (this.animationManager.animating) {
      this.animationManager.animating = false
      this.animationManager.resetAnimationState()
      return finishClose()
    }

    this.animationManager.animateOut(finishClose)
  }

  handleOpenEvent(event) {
    const focus = event.detail?.focus !== false
    this.openPalette({ focus, immediateFocus: focus })
  }

  resetPaletteState() {
    this.setInputValue("")
    this.selectedIndex = -1
    this.hoverSelectionEnabled = false
  }

  // Cached once; a later open re-runs the filter, which re-attaches what a search detached.
  loadItems() {
    if (!this.itemsCache.length) this.rebuildCache()

    this.applyFilter("")
  }
  // ========== Keyboard & Pointer Events ==========

  handleGlobalKeydown(event) {
    if (this.isAllowedLocation() && this.isToggleShortcut(event)) {
      event.preventDefault()
      return this.toggle()
    }

    if (!this.open) return

    if (event.key === KEYBOARD.shortcuts.escape.key) {
      event.preventDefault()
      this.close()
    }
  }

  onOutsideClick(event) {
    if (this.open && !this.panelTarget.contains(event.target)) this.close()
  }

  updateResponsiveControls(viewportWidth = window.visualViewport?.width || window.innerWidth) {
    const touchEnabled = isTouchEnabled()
    const mobileLayout = this.isMobileLayout(viewportWidth)
    const state = `${touchEnabled}:${mobileLayout}`

    if (state === this._responsiveControlsState) return
    this._responsiveControlsState = state

    if (this.hasKeyboardHintsTarget) toggleVisibility(this.keyboardHintsTarget, !touchEnabled)
    if (this.hasCloseButtonTarget) toggleVisibility(this.closeButtonTarget, touchEnabled || mobileLayout)
    this.syncActionHints(touchEnabled)
  }

  syncActionHints(touchEnabled) {
    safeQueryAll(this.element, "[data-command-palette-action-hint]").forEach((hint) => {
      hint.style.display = touchEnabled ? "none" : ""
    })
  }

  focusSearchChrome(event) {
    if (event.target === this.inputTarget) return
    if (event.target.closest('[data-command-palette-target~="closeButton"]')) return

    this.focusInputNow()
  }

  onInput() {
    const query = this.getInputValue().toLowerCase().trim()
    this.hoverSelectionEnabled = false
    this.applyFilter(query)
    this.scrollListToTop()
  }

  onInputKeydown(event) {
    switch (event.key) {
      case KEYBOARD.navigation.down:
        event.preventDefault()
        this.navigateSelection(1)
        break
      case KEYBOARD.navigation.up:
        event.preventDefault()
        this.navigateSelection(-1)
        break
      case KEYBOARD.navigation.enter:
        event.preventDefault()
        this.handleEnter()
        break
    }
  }
  onItemMouseEnter(event) {
    if (!this.hoverSelectionEnabled) return

    const element = event.currentTarget
    const visible = this.getVisibleItems()
    const index = visible.findIndex((item) => item.el === element)

    if (index >= 0) {
      this.selectedIndex = index
      this.updateSelection()
    }
  }

  onItemClick() {
    this.close()
  }
  // ========== Search & Filter (see architecture comment at top) ==========

  applyFilter(query) {
    devLog("🔍 applyFilter:", query || "(empty)")
    this.currentQuery = query

    const results = this.filterAndSortSections(query)
    this.updateTopResult(query, results)
    this.updateEmptyState(results.length > 0 || this.topResultItem)
    this.visibleItemsCount = results.length + (this.topResultItem ? 1 : 0)
    this.resetSelection()
    this.scheduleViewportLayout()
  }
  filterAndSortSections(query) {
    devLog("📂 Filtering sections, total sections:", this.sections.length)

    if (!query) return this._filterSectionsDefault()

    return this._filterSectionsGlobal(query)
  }

  // NOTE: Rebuilds DOM from this.sections to re-attach items detached by _filterSectionsGlobal
  _filterSectionsDefault() {
    this._clearDynamicListContent()
    const fragment = document.createDocumentFragment()
    const allVisible = []

    this.sections.forEach((section) => {
      const sectionVisible = []

      section.items.forEach((item) => {
        const shouldShow = isDefaultVisible(item.el)
        toggleVisibility(item.el, shouldShow)
        if (shouldShow) sectionVisible.push(item)
      })

      if (section.header) {
        toggleVisibility(section.header, sectionVisible.length > 0)
        fragment.appendChild(section.header)
      }
      section.items.forEach((item) => fragment.appendChild(item.el))
      allVisible.push(...sectionVisible)
    })

    this.listTarget.appendChild(fragment)
    devLog("🎯 Default filter visible items:", allVisible.length)
    return allVisible
  }

  _filterSectionsGlobal(query) {
    const results = this.searchEngine.search(this.itemsCache, query)
    devLog("🔍 Global search results:", results.length)

    const { sectionOrder, sectionItems } = this._groupResultsBySections(results)
    this._renderRankedSections(sectionOrder, sectionItems)

    devLog("🎯 Global filter:", results.length, "items in", sectionOrder.length, "sections")
    return results.map((r) => r.item)
  }

  _groupResultsBySections(results) {
    const sectionOrder = []
    const sectionSeen = new Set()
    const sectionItems = new Map()

    results.forEach((r) => {
      const section = this._itemToSectionMap.get(r.item)
      if (!section) return

      if (!sectionSeen.has(section)) {
        sectionSeen.add(section)
        sectionOrder.push(section)
        sectionItems.set(section, [])
      }
      sectionItems.get(section).push(r.item)
    })

    return { sectionOrder, sectionItems }
  }

  // NOTE: Only matched items are appended; unmatched items are detached from DOM.
  // _filterSectionsDefault re-attaches everything when the query clears.
  _renderRankedSections(sectionOrder, sectionItems) {
    this._clearDynamicListContent()
    const fragment = document.createDocumentFragment()

    sectionOrder.forEach((section) => {
      if (section.header) {
        toggleVisibility(section.header, true)
        fragment.appendChild(section.header)
      }
      const items = sectionItems.get(section) || []
      items.forEach((item) => {
        toggleVisibility(item.el, true)
        fragment.appendChild(item.el)
      })
    })

    this.listTarget.appendChild(fragment)
  }

  updateTopResult(query, results) {
    if (!query || results.length === 0) {
      this.hideTopResult()
      return
    }

    // NOTE: results are already globally ranked, so the first item is the best match
    const best = results[0]

    if (!this.shouldShowTopResult(best)) {
      this.hideTopResult()
      return
    }

    this.showTopResult(best)
  }

  shouldShowTopResult(item) {
    if (!this.hasTopResultContainerTarget || !this.hasTopHeaderTarget) {
      return false
    }

    // Show Top Hit only when the best match isn't already the first visible item
    const firstVisible = this.listTarget.querySelector(`${SELECTORS.item}${SELECTORS.notHidden}`)
    return firstVisible !== item.el
  }

  showTopResult(item) {
    const clone = item.el.cloneNode(true)
    clone.setAttribute("data-top-duplicate", "true")
    setAriaSelected(clone, false)

    this.topResultContainerTarget.innerHTML = ""
    this.topResultContainerTarget.appendChild(clone)
    toggleVisibility(this.topHeaderTarget, true)

    this.topResultItem = {
      el: clone,
      index: -1,
      keyRaw: item.keyRaw,
      titleRaw: item.titleRaw,
      descriptionRaw: item.descriptionRaw
    }
  }

  hideTopResult() {
    if (this.hasTopHeaderTarget) {
      toggleVisibility(this.topHeaderTarget, false)
    }

    if (this.hasTopResultContainerTarget) {
      this.topResultContainerTarget.innerHTML = ""
    }

    this.topResultItem = null
  }

  // ========== Selection & Navigation ==========

  navigateSelection(direction) {
    this.hoverSelectionEnabled = false
    const visible = this.getVisibleItems()
    if (visible.length === 0) return

    const newIndex = (this.selectedIndex + direction + visible.length) % visible.length
    this.selectedIndex = newIndex
    this.updateSelection()

    if (visible[newIndex]) {
      scrollIntoView(visible[newIndex].el, this.listTarget, { padding: 10 })
    }
  }

  updateSelection() {
    const visible = this.getVisibleItems()

    visible.forEach((item, index) => {
      setAriaSelected(item.el, index === this.selectedIndex)
    })
  }

  resetSelection() {
    const visible = this.getVisibleItems()
    this.selectedIndex = visible.length > 0 ? 0 : -1
    this.updateSelection()
  }

  handleEnter() {
    const visible = this.getVisibleItems()
    const selected = visible[this.selectedIndex] || visible[0]
    if (!selected) return

    const link = safeQuery(selected.el, "a[href]")
    if (link) {
      this.close()
      link.click()
    }
  }

  // ========== Cache Management ==========

  rebuildCache() {
    devLog("🔄 Rebuilding cache...")
    this.cacheItems()
    this.buildSections()

    // NOTE: Cached maps avoid per-keystroke Map creation during search and selection
    this._itemElMap = new Map(this.itemsCache.map((item) => [item.el, item]))
    this._itemToSectionMap = new Map()
    this.sections.forEach((section) => {
      section.items.forEach((item) => this._itemToSectionMap.set(item, section))
    })

    devLog("✅ Cache rebuilt - items:", this.itemsCache.length, "sections:", this.sections.length)
  }

  cacheItems() {
    const itemElements = safeQueryAll(this.listTarget, SELECTORS.item)

    this.itemsCache = itemElements.map((el, index) => {
      const key = getDataAttribute(el, "key") || ""
      const title = getDataAttribute(el, "title") || ""
      const description = getDataAttribute(el, "description") || ""
      const group = getDataAttribute(el, "group") || ""
      const href = getDataAttribute(el, "href") || ""

      const item = {
        el,
        index,
        key: key.toLowerCase(),
        title: title.toLowerCase(),
        description: description.toLowerCase(),
        group: group.toLowerCase(),
        keyRaw: key,
        titleRaw: title,
        descriptionRaw: description,
        href
      }

      return item
    })
  }

  buildSections() {
    this.sections = []
    const itemMap = new Map(this.itemsCache.map((item) => [item.el, item]))

    let currentSection = null

    Array.from(this.listTarget.children).forEach((node) => {
      if (this.isSectionHeader(node)) {
        currentSection = this.createSection(node)
        this.sections.push(currentSection)
      } else if (itemMap.has(node)) {
        if (!currentSection) {
          currentSection = this.createSection(null)
          this.sections.push(currentSection)
        }
        currentSection.items.push(itemMap.get(node))
      }
    })

    devLog("🏁 Sections built:", this.sections.length)
  }

  isSectionHeader(node) {
    return node?.matches?.(SELECTORS.sectionHeader)
  }

  createSection(headerNode) {
    return {
      header: headerNode,
      group: getDataAttribute(headerNode, "group", "").toLowerCase(),
      items: []
    }
  }

  // ========== UI Helpers ==========

  getVisibleItems() {
    const visibleElements = safeQueryAll(this.listTarget, `${SELECTORS.item}${SELECTORS.notHidden}`)
    const items = []

    if (this.topResultItem) items.push(this.topResultItem)

    visibleElements.forEach((el) => {
      const cached = this._itemElMap.get(el)
      if (cached) {
        items.push(cached)
      } else {
        items.push({
          el,
          index: -1,
          keyRaw: getDataAttribute(el, "key") || "",
          titleRaw: getDataAttribute(el, "title") || "",
          descriptionRaw: getDataAttribute(el, "description") || ""
        })
      }
    })

    return items
  }

  updateEmptyState(hasResults) {
    if (!this.hasEmptyTarget) return

    const shouldShowEmpty = this.currentQuery?.trim() && !hasResults
    toggleVisibility(this.emptyTarget, shouldShowEmpty)
  }

  scrollListToTop() {
    if (this.hasListTarget) {
      this.listTarget.scrollTop = 0
    }
  }

  focusInputNow() {
    if (!this.hasInputTarget) return

    try {
      this.inputTarget.focus({ preventScroll: true })
    } catch {
      this.inputTarget.focus()
    }
  }

  getInputValue() {
    if (!this.hasInputTarget) return ""
    return this.isEditableSearchbox() ? this.inputTarget.textContent || "" : this.inputTarget.value || ""
  }

  setInputValue(value) {
    if (!this.hasInputTarget) return

    if (this.isEditableSearchbox()) {
      this.inputTarget.textContent = value
    } else {
      this.inputTarget.value = value
    }
  }

  isEditableSearchbox() {
    return this.inputTarget?.hasAttribute("contenteditable")
  }

  attachViewportHandlers() {
    if (this._viewportHandlersAttached) return

    window.addEventListener("resize", this.scheduleViewportLayout)
    window.visualViewport?.addEventListener("resize", this.scheduleViewportLayout)
    window.visualViewport?.addEventListener("scroll", this.scheduleViewportLayout)
    this._viewportHandlersAttached = true
  }

  detachViewportHandlers() {
    if (!this._viewportHandlersAttached) return

    window.removeEventListener("resize", this.scheduleViewportLayout)
    window.visualViewport?.removeEventListener("resize", this.scheduleViewportLayout)
    window.visualViewport?.removeEventListener("scroll", this.scheduleViewportLayout)
    this._viewportHandlersAttached = false
  }

  scheduleViewportLayout() {
    if (this._viewportLayoutFrame) return

    this._viewportLayoutFrame = requestAnimationFrame(() => {
      this._viewportLayoutFrame = null
      this.applyViewportLayout()
    })
  }

  cancelViewportLayout() {
    if (!this._viewportLayoutFrame) return

    cancelAnimationFrame(this._viewportLayoutFrame)
    this._viewportLayoutFrame = null
  }

  applyViewportLayout() {
    if (!this.open || !this.hasListTarget) return

    const viewport = window.visualViewport
    const viewportHeight = viewport?.height || window.innerHeight
    const viewportWidth = viewport?.width || window.innerWidth
    this.updateResponsiveControls(viewportWidth)

    if (!this.isMobileLayout(viewportWidth)) {
      if (this._mobileViewportLayoutApplied) this.resetViewportLayout()
      return
    }

    this._mobileViewportLayoutApplied = true

    if (viewport) {
      this.element.style.top = `${viewport.offsetTop}px`
      this.element.style.left = `${viewport.offsetLeft}px`
      this.element.style.width = `${viewport.width}px`
      this.element.style.height = `${viewport.height}px`
      this.element.style.right = "auto"
      this.element.style.bottom = "auto"
    }

    const frameStyles = window.getComputedStyle(this.hasFrameTarget ? this.frameTarget : this.panelTarget.parentElement)
    const verticalPadding = parseFloat(frameStyles.paddingTop || 0) + parseFloat(frameStyles.paddingBottom || 0)
    const panelHeight = Math.floor(Math.max(0, viewportHeight - verticalPadding))

    this.panelTarget.style.height = ""
    this.panelTarget.style.maxHeight = ""
    this.listTarget.style.maxHeight = ""

    this.panelTarget.style.maxHeight = `${panelHeight}px`
    this.panelTarget.style.height = this.shouldFillMobilePanel() ? `${panelHeight}px` : ""
  }

  resetViewportLayout() {
    this._mobileViewportLayoutApplied = false
    this.element.style.top = ""
    this.element.style.left = ""
    this.element.style.width = ""
    this.element.style.height = ""
    this.element.style.right = ""
    this.element.style.bottom = ""

    if (this.hasPanelTarget) {
      this.panelTarget.style.height = ""
      this.panelTarget.style.maxHeight = ""
    }
    if (this.hasListTarget) this.listTarget.style.maxHeight = ""
  }

  isMobileLayout(viewportWidth = window.innerWidth) {
    return viewportWidth < 768
  }

  shouldFillMobilePanel() {
    return this.visibleItemsCount > 6
  }

  restoreFocus() {
    if (this.previousActive?.focus) {
      this.previousActive.focus()
    }
    this.previousActive = null
  }

  attachListPointerHandlers() {
    if (!this.hasListTarget || this._listPointerHandlersAttached) return

    this.listTarget.addEventListener("mousemove", this.handleListMouseMove)
    this.listTarget.addEventListener("mouseleave", this.handleListMouseLeave)
    this._listPointerHandlersAttached = true
  }

  detachListPointerHandlers() {
    if (!this._listPointerHandlersAttached || !this.hasListTarget) return

    this.listTarget.removeEventListener("mousemove", this.handleListMouseMove)
    this.listTarget.removeEventListener("mouseleave", this.handleListMouseLeave)
    this._listPointerHandlersAttached = false
  }

  handleListMouseMove() {
    this.hoverSelectionEnabled = true
  }

  handleListMouseLeave() {
    this.hoverSelectionEnabled = false
  }
  // ========== Keyboard Shortcuts ==========

  isToggleShortcut(event) {
    const { key } = KEYBOARD.shortcuts.toggle
    return (event.metaKey || event.ctrlKey) && event.key?.toLowerCase() === key
  }

  isAllowedLocation() {
    return !window.location.href.includes("/markup/edit")
  }

  // ========== Internal Helpers ==========

  _clearDynamicListContent() {
    const preserved = new Set()
    if (this.hasTopHeaderTarget) preserved.add(this.topHeaderTarget)
    if (this.hasTopResultContainerTarget) preserved.add(this.topResultContainerTarget)
    if (this.hasEmptyTarget) preserved.add(this.emptyTarget)

    Array.from(this.listTarget.children).forEach((child) => {
      if (!preserved.has(child)) child.remove()
    })
  }
}
