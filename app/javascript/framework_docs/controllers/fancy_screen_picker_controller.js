import { Controller } from "@hotwired/stimulus"
import TRMNLPicker from '@trmnl/picker'
// Side-effect import: window.TRMNLScreenClassSync, the shared screen-class
// rewrite predicate (also used by the iframe bridge and layout fallback).
import "framework_docs/lib/screen_class_sync"

export default class extends Controller {
  static COLOR_PREVIEW_ACTUAL = 'actual'
  static COLOR_PREVIEW_PREVIEW = 'preview'

  static FONT_FAMILY_DEFAULT = 'default'
  static FONT_FAMILY_CLASSIC = 'classic'
  static FONT_FAMILY_TRMNL = 'trmnl'
  static FONT_FAMILY_VALUES = ['default', 'classic', 'trmnl']

  static TEXT_SCALE_DEFAULT = 'regular'
  // Mirrors Framework::TextScale.ids (lib/framework/text_scale.rb).
  static TEXT_SCALE_VALUES = ['small', 'regular', 'large', 'xlarge']

  static targets = [
    "colorPreviewText",
    "colorPreviewToggle",
    "darkIcon",
    "darkModeIndicator",
    "darkSegment",
    "fontFamilyClassicSegment",
    "fontFamilyDefaultSegment",
    "fontFamilyTrmnlSegment",
    "landscapeIcon",
    "landscapeSegment",
    "lightIcon",
    "lightSegment",
    "modelDropdown",
    "modelLabel",
    "modelMenu",
    "orientationIndicator",
    "paletteDropdown",
    "paletteLabel",
    "paletteMenu",
    "portraitIcon",
    "portraitSegment",
    "previewSegment",
    "rawSegment",
    "textScaleDropdown",
    "textScaleLabel",
    "textScaleMenu",
    "themeDropdown",
    "themeLabel",
    "themeMenu",
  ]

  static values = {
    models: Array,
    palettes: Array,
    refresh: Boolean,
    scope: String,
    themes: { type: Array, default: [] },
    dropdownItemBase: { type: String, default: 'flex items-center w-full px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors' },
    dropdownItemActive: { type: String, default: 'text-primary-700 dark:text-primary-300 font-semibold bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50' },
    dropdownItemInactive: { type: String, default: 'text-gray-600 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700' },
    dropdownGroupLabel: { type: String, default: 'px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-gray-400/60 dark:text-gray-600' },
    segmentActive: { type: String, default: '' },
    segmentInactive: { type: String, default: '' },
    summaryElementId: { type: String, default: '' },
    defaultModel: { type: String, default: '' },
    defaultPalette: { type: String, default: '' },
    deviceKey: { type: String, default: '' },
  }

  async connect() {
    this.pickerId = Math.random().toString(36).substring(2, 15)
    this.pageId = this.screenPickerPageId
    const urlOverrides = this.urlParamOverrides()
    // Captured before create(), since the picker persists its own default on first load.
    const hadSavedPrefs = !urlOverrides && !!localStorage.getItem(this.prefsKey)
    this.picker = await TRMNLPicker.create(this.element, {
      models: this.modelsValue,
      palettes: this.palettesValue,
      localStorageKey: urlOverrides ? undefined : this.prefsKey,
    })
    this.colorPreviewMode = this.loadColorPreviewMode()
    this.fontFamily = this.loadFontFamily()
    this.selectedTheme = this.loadTheme()

    // Theme is not a picker param, so ?theme= is read separately and doesn't
    // disable the picker's own localStorage persistence.
    const themeParam = new URL(window.location).searchParams.get('theme')
    if (themeParam !== null) {
      this.selectedTheme = this.normalizeTheme(themeParam)
      this.saveTheme()
    }

    this.selectedTextScale = this.loadTextScale()
    const textScaleParam = new URL(window.location).searchParams.get('text_scale')
    if (textScaleParam !== null) {
      this.selectedTextScale = this.normalizeTextScale(textScaleParam)
      this.saveTextScale()
    }

    if (urlOverrides) {
      this.picker.setParams(urlOverrides)
    } else if (this.defaultModelValue && !hadSavedPrefs) {
      // Setting modelName resets the palette to the model default, so paletteId
      // must ride along in the SAME setParams call to land on the actual palette.
      const seed = { modelName: this.defaultModelValue }
      if (this.defaultPaletteValue) seed.paletteId = this.defaultPaletteValue
      this.picker.setParams(seed)
    }

    this.element.addEventListener('trmnl:change', (event) => {
      if (event.detail.origin !== 'constructor') {
        this.updateUI(event.detail.origin)
      }
    })

    this._boundCloseDropdowns = this._closeDropdownsOnOutsideClick.bind(this)
    document.addEventListener('click', this._boundCloseDropdowns)

    this._boundResetFontFamily = this._resetFontFamily.bind(this)
    this._resetButton = this.element.querySelector('[data-reset-button]')
    if (this._resetButton) {
      this._resetButton.addEventListener('click', this._boundResetFontFamily)
    }

    if (this.hasModelMenuTarget) {
      this._setupPaletteObserver()
    }

    this.updateUI('constructor')
    this.syncCustomDropdowns()

    this.channel = new BroadcastChannel(this.channelName)
    this.channel.onmessage = (event) => {
      const data = (event && event.data) || {}
      if (!data || typeof data !== 'object') return

      switch (data.type) {
        case 'requestScreenState':
          if (data.pageId && data.pageId !== this.pageId) return
          if (!this.isScreenStateResponder()) return
          this.respondToScreenStateRequest(data.responseChannel)
          break
        case 'screenChanged':
          if (data.source !== 'screen_picker') return
          if (data.pickerId === this.pickerId) return

          this.colorPreviewMode = this.normalizeColorPreviewMode(data.colorPreviewMode)
          this.saveColorPreviewMode()
          this.fontFamily = this.normalizeFontFamily(data.fontFamily)
          this.saveFontFamily()
          this.selectedTheme = this.normalizeTheme(data.theme)
          this.saveTheme()
          this.selectedTextScale = this.normalizeTextScale(data.textScale)
          this.saveTextScale()
          this.picker.setParams(data.params)
          this.updateUI('broadcast')
          break
      }
    }

    // Publish the ready picker state on this page's private channel. Example
    // iframes and the parent docs layout may have loaded before the async picker
    // finished connecting, so their one-time state request can otherwise be
    // missed until the user changes a picker control.
    if (this.isScreenStateResponder()) {
      this.respondToScreenStateRequest(this.screenStateResponseChannelName)
    }
  }

  disconnect() {
    if (this.channel) this.channel.close()
    const responders = window.__trmnlScreenStateResponders
    if (responders instanceof Map && responders.get(this.channelName) === this) {
      responders.delete(this.channelName)
    }
    document.removeEventListener('click', this._boundCloseDropdowns)
    if (this._resetButton && this._boundResetFontFamily) {
      this._resetButton.removeEventListener('click', this._boundResetFontFamily)
    }
    if (this._paletteObserver) {
      this._paletteObserver.disconnect()
    }
  }

  updateUI(origin) {
    this.hasDarkModeIndicatorTarget && this.darkModeIndicatorTarget.classList.toggle('hidden', !this.isDarkModeEffective)
    this.hasLightIconTarget && this.lightIconTarget.classList.toggle('hidden', this.isDarkModeEffective)
    this.hasDarkIconTarget && this.darkIconTarget.classList.toggle('hidden', !this.isDarkModeEffective)
    this._syncDarkModeAvailability()

    this.hasOrientationIndicatorTarget && this.orientationIndicatorTarget.classList.toggle('hidden', !this.isPortrait)
    this.hasLandscapeIconTarget && this.landscapeIconTarget.classList.toggle('hidden', this.isPortrait)
    this.hasPortraitIconTarget && this.portraitIconTarget.classList.toggle('hidden', !this.isPortrait)

    const shouldBroadcast = origin === 'form' || origin === 'color-preview-toggle' || origin === 'font-family-toggle'
    let scrollPosition
    if (shouldBroadcast && window.getCurrentExamplePosition) {
      scrollPosition = window.getCurrentExamplePosition()
    }

    const newScreenClasses = this.computedScreenClasses

    document.querySelectorAll('.dark-mode-notice').forEach(el => {
      el.classList.toggle('hidden', !this.isDarkModeEffective)
    })

    document.querySelectorAll('.high-density-font-notice').forEach(el => {
      el.classList.toggle('hidden', !newScreenClasses.includes('screen--density-2x'))
    })

    if (this.hasColorPreviewTextTarget) {
      this.colorPreviewTextTarget.textContent = this.colorPreviewMode === this.constructor.COLOR_PREVIEW_PREVIEW ? 'Preview' : 'Raw'
    }
    if (this.hasColorPreviewToggleTarget) {
      const isPreview = this.colorPreviewMode === this.constructor.COLOR_PREVIEW_PREVIEW
      this.colorPreviewToggleTarget.setAttribute('aria-pressed', isPreview ? 'true' : 'false')
      this.colorPreviewToggleTarget.setAttribute('aria-label', `Color preview: ${isPreview ? 'Preview' : 'Raw'}`)
    }

    this._syncSegments(this.isDarkModeEffective, 'lightSegment', 'darkSegment')
    this._syncSegments(this.isPortrait, 'landscapeSegment', 'portraitSegment')
    this._syncSegments(this.isPreviewColorPreview, 'rawSegment', 'previewSegment')
    this._syncFontFamilySegments()
    this._syncThemeSelect()
    this._syncTextScaleSelect()

    document.querySelectorAll('.screen').forEach(screen => {
      if (screen.closest('[data-screen-picker-ignore]')) return
      screen.className = window.TRMNLScreenClassSync.mergeScreenClasses(screen.className, newScreenClasses)
    })

    if (this.shouldRunTerminalize()) {
      if (typeof window.executeTerminalize === 'function') window.executeTerminalize()
      else if (typeof window.terminalize === 'function') window.terminalize()
    }

    if (shouldBroadcast) this.broadcastScreenState()

    if (shouldBroadcast && this.refreshValue) {
      document.dispatchEvent(new CustomEvent('trmnl:framework-examples:refresh', {
        detail: { scrollPosition }
      }))
    } else if (shouldBroadcast && window.restoreScrollPosition) {
      window.restoreScrollPosition(scrollPosition)
    }

    this.syncCustomDropdowns()
    this.updateSummaryLabel()
  }

  updateSummaryLabel() {
    if (!this.summaryElementIdValue) return
    const el = document.getElementById(this.summaryElementIdValue)
    if (!el) return

    const sep = '<span class="shrink-0 w-px h-3 bg-gray-300 dark:bg-gray-650" aria-hidden="true"></span>'
    const segments = []

    if (this.hasModelLabelTarget) {
      const model = this.modelLabelTarget.textContent.trim()
      if (model && model !== '-') {
        segments.push(`<span class="truncate">${this._escapeHtml(model)}</span>`)
      }
    }

    const paletteSummary = this._compactPaletteSummary()
    if (paletteSummary) segments.push(`<span class="shrink-0 inline-flex items-center gap-0.5">${paletteSummary}</span>`)

    const stateIcons = this._stateIcons()
    if (stateIcons) segments.push(`<span class="shrink-0 inline-flex items-center gap-0.5 opacity-50">${stateIcons}</span>`)

    if (segments.length) {
      el.className = 'inline-flex items-center gap-2 min-w-0 max-w-[200px]'
      el.innerHTML = segments.join(sep)
    } else {
      el.className = ''
      el.textContent = 'Device'
    }
  }

  shouldRunTerminalize() {
    if (!document.querySelector('.trmnl-example')) return true
    if (this.pendingViewportExamples().length) return false

    return !!document.querySelector('#main-content .screen')
  }

  pendingViewportExamples() {
    const margin = typeof window.__TRMNL_EXAMPLE_VIEWPORT_MARGIN__ === 'number'
      ? window.__TRMNL_EXAMPLE_VIEWPORT_MARGIN__
      : 400
    return Array.from(document.querySelectorAll('.trmnl-example:not([data-trmnl-wrapped="true"])'))
      .filter((wrapper) => {
        const rect = wrapper.getBoundingClientRect()
        return rect.top < window.innerHeight + margin && rect.bottom > -margin
      })
  }

  _stateIcons() {
    const ic = 'w-3 h-3'
    const icons = []

    icons.push(this.isDarkModeEffective
      ? `<svg class="${ic}" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8.8 7.2A3.5 3.5 0 1 1 4.8 3.2a2.8 2.8 0 0 0 4 4Z"/></svg>`
      : `<svg class="${ic}" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6" cy="6" r="2"/><path d="M6 1.5v1M6 9.5v1M1.5 6h1M9.5 6h1M3.2 3.2l.7.7M8.1 8.1l.7.7M3.2 8.8l.7-.7M8.1 3.9l.7-.7"/></svg>`)

    icons.push(this.isPortrait
      ? `<svg class="${ic}" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="1" width="6" height="10" rx="1"/></svg>`
      : `<svg class="${ic}" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="10" height="6" rx="1"/></svg>`)

    icons.push(this.isPreviewColorPreview
      ? `<svg class="${ic}" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="4"/><path d="M6 2a4 4 0 0 1 0 8Z" fill="currentColor"/></svg>`
      : `<svg class="${ic}" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="4"/></svg>`)

    return icons.join('')
  }

  _compactPaletteSummary() {
    const paletteSelect = this.element.querySelector('[data-palette-select]')
    if (!paletteSelect) return ''

    const paletteId = paletteSelect.value
    const palette = this.palettesValue.find(p => p.id === paletteId)
    if (!palette) return ''

    const isColor = palette.grayscale_bit_depth !== undefined && palette.grayscale_bit_depth !== null
    let count
    if (isColor && palette.colors && palette.colors.length) {
      count = palette.colors.length
    } else if (isColor) {
      const match = paletteId.match(/(\d+)bit/)
      count = match ? `${match[1]}b` : '?'
    } else {
      count = palette.grays || 2
    }

    const grayIcon = '<svg class="inline-block w-2.5 h-2.5" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5" fill="currentColor" opacity="0.3"/></svg>'
    const colorIcon = '<svg class="inline-block w-2.5 h-2.5" viewBox="0 0 10 10"><path d="M5 .5A4.5 4.5 0 0 1 9.5 5L5 5Z" fill="#EF4444"/><path d="M9.5 5A4.5 4.5 0 0 1 5 9.5L5 5Z" fill="#22C55E"/><path d="M5 9.5A4.5 4.5 0 0 1 .5 5L5 5Z" fill="#3B82F6"/><path d="M.5 5A4.5 4.5 0 0 1 5 .5L5 5Z" fill="#EAB308"/></svg>'

    return `${count}${isColor ? colorIcon : grayIcon}`
  }

  _escapeHtml(str) {
    const div = document.createElement('div')
    div.appendChild(document.createTextNode(str))
    return div.innerHTML
  }

  toggleColorPreview() {
    const next = this.colorPreviewMode === this.constructor.COLOR_PREVIEW_PREVIEW
      ? this.constructor.COLOR_PREVIEW_ACTUAL
      : this.constructor.COLOR_PREVIEW_PREVIEW
    this.colorPreviewMode = next
    this.saveColorPreviewMode()
    this.updateUI('color-preview-toggle')
  }

  selectDarkMode(event) {
    if (this.isThemed) return
    const wantDark = event.currentTarget === this.darkSegmentTarget
    if (this.isDarkMode !== wantDark) {
      this.element.querySelector('[data-dark-mode-toggle]')?.click()
    }
  }

  // Disable the dark-mode controls while a theme is active. The native
  // `disabled` attribute is the single choke point: it also blocks the
  // external @trmnl/picker lib's own click binding on [data-dark-mode-toggle]
  // (disabled buttons ignore .click() and user clicks alike).
  _syncDarkModeAvailability() {
    const themed = this.isThemed
    const hint = 'Light/Dark has no effect while a Style is active: themes define their own colors'
    const controls = [...this.element.querySelectorAll('[data-dark-mode-toggle]')]
    if (this.hasLightSegmentTarget) controls.push(this.lightSegmentTarget)
    if (this.hasDarkSegmentTarget) controls.push(this.darkSegmentTarget)
    controls.forEach(el => {
      el.disabled = themed
      el.setAttribute('aria-disabled', themed ? 'true' : 'false')
      el.classList.toggle('opacity-40', themed)
      el.classList.toggle('cursor-not-allowed', themed)
      if (themed) el.setAttribute('title', hint)
      else el.removeAttribute('title')
    })
  }

  selectOrientation(event) {
    const wantPortrait = event.currentTarget === this.portraitSegmentTarget
    if (this.isPortrait !== wantPortrait) {
      this.element.querySelector('[data-orientation-toggle]')?.click()
    }
  }

  selectColorPreview(event) {
    const wantPreview = event.currentTarget === this.previewSegmentTarget
    const isPreview = this.colorPreviewMode === this.constructor.COLOR_PREVIEW_PREVIEW
    if (isPreview !== wantPreview) {
      this.toggleColorPreview()
    }
  }

  selectFontFamily(event) {
    const value = this.normalizeFontFamily(event.currentTarget.dataset.fontFamily)
    if (value === this.fontFamily) return
    this.fontFamily = value
    this.saveFontFamily()
    this.updateUI('font-family-toggle')
  }

  selectTheme(event) {
    const value = this.normalizeTheme(event.currentTarget.value)
    if (value === this.selectedTheme) return
    this.selectedTheme = value
    this.saveTheme()
    this.updateUI('form')
  }

  selectTextScale(event) {
    const value = this.normalizeTextScale(event.currentTarget.value)
    if (value === this.selectedTextScale) return
    this.selectedTextScale = value
    this.saveTextScale()
    this.updateUI('form')
  }

  _resetFontFamily() {
    const fontIsDefault = this.fontFamily === this.constructor.FONT_FAMILY_DEFAULT
    const themeIsDefault = this.selectedTheme === 'none'
    const textScaleIsDefault = this.selectedTextScale === this.constructor.TEXT_SCALE_DEFAULT
    if (fontIsDefault && themeIsDefault && textScaleIsDefault) return
    this.fontFamily = this.constructor.FONT_FAMILY_DEFAULT
    this.saveFontFamily()
    this.selectedTheme = 'none'
    this.saveTheme()
    this.selectedTextScale = this.constructor.TEXT_SCALE_DEFAULT
    this.saveTextScale()
    this.updateUI('font-family-toggle')
  }

  _syncFontFamilySegments() {
    const segmentMap = {
      [this.constructor.FONT_FAMILY_DEFAULT]: 'fontFamilyDefaultSegment',
      [this.constructor.FONT_FAMILY_CLASSIC]: 'fontFamilyClassicSegment',
      [this.constructor.FONT_FAMILY_TRMNL]: 'fontFamilyTrmnlSegment',
    }
    const activeClasses = this.segmentActiveValue.split(/\s+/).filter(Boolean)
    const inactiveClasses = this.segmentInactiveValue.split(/\s+/).filter(Boolean)

    Object.entries(segmentMap).forEach(([value, targetName]) => {
      const hasFn = `has${targetName.charAt(0).toUpperCase()}${targetName.slice(1)}Target`
      if (!this[hasFn]) return
      const target = this[`${targetName}Target`]
      const isActive = value === this.fontFamily
      if (isActive) {
        target.classList.remove(...inactiveClasses)
        target.classList.add(...activeClasses)
      } else {
        target.classList.remove(...activeClasses)
        target.classList.add(...inactiveClasses)
      }
      target.setAttribute('aria-pressed', isActive ? 'true' : 'false')
    })
  }

  _syncSegments(isSecondActive, firstTargetName, secondTargetName) {
    const hasFirst = `has${firstTargetName.charAt(0).toUpperCase()}${firstTargetName.slice(1)}Target`
    const hasSecond = `has${secondTargetName.charAt(0).toUpperCase()}${secondTargetName.slice(1)}Target`
    if (!this[hasFirst] || !this[hasSecond]) return

    const firstTarget = this[`${firstTargetName}Target`]
    const secondTarget = this[`${secondTargetName}Target`]
    const activeClasses = this.segmentActiveValue.split(/\s+/).filter(Boolean)
    const inactiveClasses = this.segmentInactiveValue.split(/\s+/).filter(Boolean)

    if (isSecondActive) {
      firstTarget.classList.remove(...activeClasses)
      firstTarget.classList.add(...inactiveClasses)
      secondTarget.classList.remove(...inactiveClasses)
      secondTarget.classList.add(...activeClasses)
    } else {
      firstTarget.classList.remove(...inactiveClasses)
      firstTarget.classList.add(...activeClasses)
      secondTarget.classList.remove(...activeClasses)
      secondTarget.classList.add(...inactiveClasses)
    }
  }

  screenStatePayload() {
    const pickerState = this.picker.state

    return {
      type: 'screenChanged',
      source: 'screen_picker',
      pickerId: this.pickerId,
      screenClasses: this.computedScreenClasses.join(' '),
      width: pickerState.width,
      height: pickerState.height,
      isPortrait: pickerState.isPortrait,
      isDarkMode: pickerState.isDarkMode,
      colorPreviewMode: this.colorPreviewMode,
      fontFamily: this.fontFamily,
      theme: this.selectedTheme,
      textScale: this.selectedTextScale,
      params: this.picker.params
    }
  }

  broadcastScreenState() {
    this.channel.postMessage(this.screenStatePayload())
  }

  respondToScreenStateRequest(responseChannelName) {
    if (!responseChannelName) {
      this.broadcastScreenState()
      return
    }
    if (responseChannelName !== this.screenStateResponseChannelName) return

    const responseChannel = new BroadcastChannel(responseChannelName)
    responseChannel.postMessage(this.screenStatePayload())
    responseChannel.close()
  }

  isScreenStateResponder() {
    let responders = window.__trmnlScreenStateResponders
    if (!(responders instanceof Map)) {
      responders = new Map()
      window.__trmnlScreenStateResponders = responders
    }

    const current = responders.get(this.channelName)
    if (!current || !current.element?.isConnected) {
      responders.set(this.channelName, this)
    }

    return responders.get(this.channelName) === this
  }

  // --- Custom dropdown methods ---

  syncCustomDropdowns() {
    if (this.hasModelMenuTarget) {
      this._syncDropdown(
        this.element.querySelector('[data-model-select]'),
        this.modelMenuTarget,
        this.modelLabelTarget,
        'model'
      )
    }
    if (this.hasPaletteMenuTarget) {
      this._syncDropdown(
        this.element.querySelector('[data-palette-select]'),
        this.paletteMenuTarget,
        this.paletteLabelTarget,
        'palette'
      )
    }
    if (this.hasThemeMenuTarget) {
      this._syncDropdown(
        this.element.querySelector('[data-theme-select]'),
        this.themeMenuTarget,
        this.themeLabelTarget,
        'theme'
      )
    }
    if (this.hasTextScaleMenuTarget) {
      this._syncDropdown(
        this.element.querySelector('[data-text-scale-select]'),
        this.textScaleMenuTarget,
        this.textScaleLabelTarget,
        'textScale'
      )
    }
  }

  _syncThemeSelect() {
    const select = this.element.querySelector('[data-theme-select]')
    if (select && select.value !== this.selectedTheme) select.value = this.selectedTheme
  }

  _syncTextScaleSelect() {
    const select = this.element.querySelector('[data-text-scale-select]')
    if (select && select.value !== this.selectedTextScale) select.value = this.selectedTextScale
  }

  _syncDropdown(hiddenSelect, menuEl, labelEl, type) {
    if (!hiddenSelect) return

    const currentValue = hiddenSelect.value
    menuEl.innerHTML = ''

    const optgroups = hiddenSelect.querySelectorAll('optgroup')
    if (optgroups.length > 0) {
      optgroups.forEach(group => {
        const groupLabel = document.createElement('div')
        groupLabel.className = this.dropdownGroupLabelValue
        groupLabel.textContent = group.label
        menuEl.appendChild(groupLabel)

        group.querySelectorAll('option').forEach(opt => {
          menuEl.appendChild(this._createDropdownItem(opt, currentValue, type))
        })
      })
    } else {
      hiddenSelect.querySelectorAll('option').forEach(opt => {
        menuEl.appendChild(this._createDropdownItem(opt, currentValue, type))
      })
    }

    const selectedOption = hiddenSelect.querySelector(`option[value="${CSS.escape(currentValue)}"]`)
    labelEl.textContent = selectedOption ? selectedOption.textContent : '-'
  }

  _createDropdownItem(option, currentValue, type) {
    const item = document.createElement('button')
    item.type = 'button'
    item.setAttribute('role', 'option')
    item.dataset.value = option.value
    item.dataset.dropdownType = type

    const isSelected = option.value === currentValue
    item.setAttribute('aria-selected', isSelected)

    const selectedClasses = isSelected ? this.dropdownItemActiveValue : this.dropdownItemInactiveValue
    item.className = `${this.dropdownItemBaseValue} ${selectedClasses}`
    item.textContent = option.textContent
    item.dataset.action = 'click->fancy-screen-picker#selectDropdownOption'
    return item
  }

  selectDropdownOption(event) {
    const button = event.currentTarget
    const value = button.dataset.value
    const type = button.dataset.dropdownType
    const selectByType = {
      model: '[data-model-select]',
      palette: '[data-palette-select]',
      theme: '[data-theme-select]',
      textScale: '[data-text-scale-select]',
    }
    const hiddenSelect = this.element.querySelector(selectByType[type] || selectByType.palette)

    if (!hiddenSelect) return

    hiddenSelect.value = value
    hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }))

    this._closeAllDropdowns()
  }

  toggleModelDropdown(event) {
    event.stopPropagation()
    const menu = this.modelMenuTarget
    const isOpen = !menu.hidden

    this._closeAllDropdowns()

    if (!isOpen) {
      menu.hidden = false
      this.modelDropdownTarget.querySelector('button').setAttribute('aria-expanded', 'true')
    }
  }

  togglePaletteDropdown(event) {
    event.stopPropagation()
    const menu = this.paletteMenuTarget
    const isOpen = !menu.hidden

    this._closeAllDropdowns()

    if (!isOpen) {
      menu.hidden = false
      this.paletteDropdownTarget.querySelector('button').setAttribute('aria-expanded', 'true')
    }
  }

  toggleThemeDropdown(event) {
    event.stopPropagation()
    const menu = this.themeMenuTarget
    const isOpen = !menu.hidden

    this._closeAllDropdowns()

    if (!isOpen) {
      menu.hidden = false
      this.themeDropdownTarget.querySelector('button').setAttribute('aria-expanded', 'true')
    }
  }

  toggleTextScaleDropdown(event) {
    event.stopPropagation()
    const menu = this.textScaleMenuTarget
    const isOpen = !menu.hidden

    this._closeAllDropdowns()

    if (!isOpen) {
      menu.hidden = false
      this.textScaleDropdownTarget.querySelector('button').setAttribute('aria-expanded', 'true')
    }
  }

  _closeAllDropdowns() {
    if (this.hasModelMenuTarget) {
      this.modelMenuTarget.hidden = true
      this.modelDropdownTarget.querySelector('button').setAttribute('aria-expanded', 'false')
    }
    if (this.hasPaletteMenuTarget) {
      this.paletteMenuTarget.hidden = true
      this.paletteDropdownTarget.querySelector('button').setAttribute('aria-expanded', 'false')
    }
    if (this.hasThemeMenuTarget) {
      this.themeMenuTarget.hidden = true
      this.themeDropdownTarget.querySelector('button').setAttribute('aria-expanded', 'false')
    }
    if (this.hasTextScaleMenuTarget) {
      this.textScaleMenuTarget.hidden = true
      this.textScaleDropdownTarget.querySelector('button').setAttribute('aria-expanded', 'false')
    }
  }

  _closeDropdownsOnOutsideClick(event) {
    if (this.hasModelDropdownTarget && !this.modelDropdownTarget.contains(event.target)) {
      this.modelMenuTarget.hidden = true
      this.modelDropdownTarget.querySelector('button').setAttribute('aria-expanded', 'false')
    }
    if (this.hasPaletteDropdownTarget && !this.paletteDropdownTarget.contains(event.target)) {
      this.paletteMenuTarget.hidden = true
      this.paletteDropdownTarget.querySelector('button').setAttribute('aria-expanded', 'false')
    }
    if (this.hasThemeDropdownTarget && !this.themeDropdownTarget.contains(event.target)) {
      this.themeMenuTarget.hidden = true
      this.themeDropdownTarget.querySelector('button').setAttribute('aria-expanded', 'false')
    }
    if (this.hasTextScaleDropdownTarget && !this.textScaleDropdownTarget.contains(event.target)) {
      this.textScaleMenuTarget.hidden = true
      this.textScaleDropdownTarget.querySelector('button').setAttribute('aria-expanded', 'false')
    }
  }

  _setupPaletteObserver() {
    const paletteSelect = this.element.querySelector('[data-palette-select]')
    if (!paletteSelect) return

    this._paletteObserver = new MutationObserver(() => {
      this.syncCustomDropdowns()
    })

    this._paletteObserver.observe(paletteSelect, {
      childList: true,
      subtree: true,
    })
  }
  urlParamOverrides() {
    const url = new URL(window.location)
    const overrides = {}

    if (url.searchParams.has('model')) overrides.modelName = url.searchParams.get('model')
    if (url.searchParams.has('palette')) overrides.paletteId = url.searchParams.get('palette')
    if (url.searchParams.has('dark_mode')) overrides.isDarkMode = url.searchParams.get('dark_mode') === 'true'

    return Object.keys(overrides).length > 0 ? overrides : null
  }
  // --- Getters ---

  get prefsKey() {
    const base = `${this.scopeValue}_screen_picker`
    return this.deviceKeyValue ? `${base}_${this.deviceKeyValue}` : base
  }

  get channelName() {
    return `screen_picker_${this.scopeValue}`
  }

  get screenPickerPageId() {
    if (!window.__trmnlScreenPickerPageId) {
      const randomId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
      window.__trmnlScreenPickerPageId = randomId
    }
    return window.__trmnlScreenPickerPageId
  }

  get screenStateResponseChannelName() {
    return `${this.channelName}_page_${this.pageId}`
  }

  get colorPreviewPrefsKey() {
    return `${this.prefsKey}_color_preview_mode`
  }

  get fontFamilyPrefsKey() {
    return `${this.prefsKey}_font_family`
  }

  get themePrefsKey() {
    return `${this.prefsKey}_theme`
  }

  get textScalePrefsKey() {
    return `${this.prefsKey}_text_scale`
  }

  normalizeColorPreviewMode(mode) {
    return mode === this.constructor.COLOR_PREVIEW_PREVIEW ? this.constructor.COLOR_PREVIEW_PREVIEW : this.constructor.COLOR_PREVIEW_ACTUAL
  }

  normalizeFontFamily(value) {
    return this.constructor.FONT_FAMILY_VALUES.includes(value) ? value : this.constructor.FONT_FAMILY_DEFAULT
  }

  normalizeTheme(value) {
    const themeIds = (this.themesValue || []).map(theme => theme.id)
    return themeIds.includes(value) ? value : 'none'
  }

  normalizeTextScale(value) {
    return this.constructor.TEXT_SCALE_VALUES.includes(value) ? value : this.constructor.TEXT_SCALE_DEFAULT
  }

  loadColorPreviewMode() {
    try {
      const mode = localStorage.getItem(this.colorPreviewPrefsKey)
      return this.normalizeColorPreviewMode(mode)
    } catch (_error) {
      return this.constructor.COLOR_PREVIEW_ACTUAL
    }
  }

  saveColorPreviewMode() {
    try {
      localStorage.setItem(this.colorPreviewPrefsKey, this.colorPreviewMode)
    } catch (_error) {
      // Ignore storage failures (private mode, quotas, etc)
    }
  }

  loadFontFamily() {
    try {
      const value = localStorage.getItem(this.fontFamilyPrefsKey)
      return this.normalizeFontFamily(value)
    } catch (_error) {
      return this.constructor.FONT_FAMILY_DEFAULT
    }
  }

  saveFontFamily() {
    try {
      if (this.fontFamily === this.constructor.FONT_FAMILY_DEFAULT) {
        localStorage.removeItem(this.fontFamilyPrefsKey)
      } else {
        localStorage.setItem(this.fontFamilyPrefsKey, this.fontFamily)
      }
    } catch (_error) {
      // Ignore storage failures (private mode, quotas, etc)
    }
  }

  loadTheme() {
    try {
      const value = localStorage.getItem(this.themePrefsKey)
      return this.normalizeTheme(value)
    } catch (_error) {
      return 'none'
    }
  }

  saveTheme() {
    try {
      if (this.selectedTheme === 'none') {
        localStorage.removeItem(this.themePrefsKey)
      } else {
        localStorage.setItem(this.themePrefsKey, this.selectedTheme)
      }
    } catch (_error) {
      // Ignore storage failures (private mode, quotas, etc)
    }
  }

  loadTextScale() {
    try {
      const value = localStorage.getItem(this.textScalePrefsKey)
      return this.normalizeTextScale(value)
    } catch (_error) {
      return this.constructor.TEXT_SCALE_DEFAULT
    }
  }

  saveTextScale() {
    try {
      if (this.selectedTextScale === this.constructor.TEXT_SCALE_DEFAULT) {
        localStorage.removeItem(this.textScalePrefsKey)
      } else {
        localStorage.setItem(this.textScalePrefsKey, this.selectedTextScale)
      }
    } catch (_error) {
      // Ignore storage failures (private mode, quotas, etc)
    }
  }

  get isPreviewColorPreview() {
    return this.normalizeColorPreviewMode(this.colorPreviewMode) === this.constructor.COLOR_PREVIEW_PREVIEW
  }

  get fontFamilyLabel() {
    switch (this.fontFamily) {
      case this.constructor.FONT_FAMILY_CLASSIC: return 'Classic'
      case this.constructor.FONT_FAMILY_TRMNL: return 'TRMNL'
      default: return 'Default'
    }
  }

  get fontFamilyClass() {
    switch (this.fontFamily) {
      case this.constructor.FONT_FAMILY_CLASSIC: return 'screen--fonts-classic'
      case this.constructor.FONT_FAMILY_TRMNL: return 'screen--fonts-trmnl'
      default: return null
    }
  }

  get selectedModelKeyname() {
    return String(this.picker?.params?.model || this.picker?.state?.model?.name || '')
  }

  get selectedModelFromCatalog() {
    const keyname = this.selectedModelKeyname
    if (!keyname || !Array.isArray(this.modelsValue)) return null
    return this.modelsValue.find((model) => String(model?.name) === keyname) || null
  }

  get previewWhitePoint() {
    const catalogValue = this.selectedModelFromCatalog?.preview_white_point
    if (catalogValue) return String(catalogValue)
    return String(this.picker?.state?.model?.preview_white_point || 'true_white')
  }

  get computedScreenClasses() {
    const base = this.screenClasses
    const rawClasses = Array.isArray(base) ? base.slice() : String(base || '').split(/\s+/).filter(Boolean)
    const classes = rawClasses.filter(c => !c.startsWith('screen--fonts-') && !c.startsWith('screen--density-') && !c.startsWith('screen--theme-') && !c.startsWith('screen--text-scale-'))
    const densityClass = this.selectedModelFromCatalog?.css?.classes?.density ||
      this.selectedModelFromCatalog?.density_class ||
      null
    if (densityClass) classes.push(densityClass)
    if (this.isPreviewColorPreview) {
      classes.push('screen--preview-colors')
      if (this.previewWhitePoint === 'limited') {
        classes.push('screen--preview-white-limited')
      }
    }
    const fontClass = this.fontFamilyClass
    if (fontClass) classes.push(fontClass)
    if (this.selectedTheme && this.selectedTheme !== 'none') {
      classes.push(`screen--theme-${this.selectedTheme}`)
    }
    if (this.selectedTextScale && this.selectedTextScale !== this.constructor.TEXT_SCALE_DEFAULT) {
      classes.push(`screen--text-scale-${this.selectedTextScale}`)
    }
    return Array.from(new Set(classes))
  }

  get isDarkMode() {
    return this.picker.state.isDarkMode
  }

  get isThemed() {
    return this.selectedTheme !== 'none'
  }

  // Themes are light/dark agnostic: the framework's dark remap is gated off
  // themed screens, so dark mode has no visible effect while a theme is
  // active. The stored dark state is kept (it survives theme round-trips);
  // only the presentation treats it as off.
  get isDarkModeEffective() {
    return this.isDarkMode && !this.isThemed
  }

  get isPortrait() {
    return this.picker.state.isPortrait
  }

  get screenClasses() {
    return this.picker.state.screenClasses
  }
}
