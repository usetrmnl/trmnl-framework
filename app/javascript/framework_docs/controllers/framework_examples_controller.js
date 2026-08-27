import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    pluginsCssPath: String,
    pluginsJsPath: String,
    bridgePath: String,
    screenClassSyncPath: String,
    exampleIframeConfigUrl: { type: String, default: '' },
    singleBundleMode: { type: Boolean, default: false },
    frozenRuntime: { type: Boolean, default: false },
    examplesScope: { type: String, default: 'framework' },
    themeCssUrls: { type: Object, default: {} },
  }

  connect() {
    this.disconnected = false
    this.refreshToken = 0
    this.lazyWrapMargin = `${this.exampleViewportMargin()}px 0px`
    this.boundRefresh = this.refresh.bind(this)
    this.boundRefreshExamples = this.refreshExamples.bind(this)
    document.addEventListener('turbo:load', this.boundRefresh)
    document.addEventListener('turbo:render', this.boundRefresh)
    document.addEventListener('trmnl:framework-examples:refresh', this.boundRefreshExamples)
    this.refresh()
  }

  disconnect() {
    this.disconnected = true
    document.removeEventListener('turbo:load', this.boundRefresh)
    document.removeEventListener('turbo:render', this.boundRefresh)
    document.removeEventListener('trmnl:framework-examples:refresh', this.boundRefreshExamples)
    if (this.wrapFrame) cancelAnimationFrame(this.wrapFrame)
    if (this.wrapFrameInner) cancelAnimationFrame(this.wrapFrameInner)
    this.stopLazyWrapping()
    this.stopExampleRefresh()
  }

  async refresh() {
    const token = this.refreshToken + 1
    this.refreshToken = token
    // Resolve the authoritative iframe asset config before wrapping so iframes are
    // built from the fetched config instead of the fallback data attributes. When
    // there is no config URL or the fetch fails, this resolves quickly with
    // fetchedIframeAssets left null and wrapAll falls back to the data attributes.
    await this.prepareIframeAssetConfig(token)
    if (this.disconnected || this.refreshToken !== token) return
    this.scheduleWrapAll()
  }

  scheduleWrapAll() {
    if (this.wrapFrame) cancelAnimationFrame(this.wrapFrame)
    if (this.wrapFrameInner) cancelAnimationFrame(this.wrapFrameInner)
    this.wrapFrame = requestAnimationFrame(() => {
      this.wrapFrameInner = requestAnimationFrame(() => {
        if (!this.disconnected) this.wrapAll()
      })
    })
  }

  async prepareIframeAssetConfig(token = this.refreshToken) {
    this.fetchedIframeAssets = null
    const url = (this.exampleIframeConfigUrlValue || '').trim()
    if (!url) return
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      if (!response.ok) return
      const payload = await response.json()
      if (!this.disconnected && this.refreshToken === token) this.fetchedIframeAssets = payload
    } catch (_) {}
  }

  wrapAll() {
    this.stopLazyWrapping()

    const pending = Array.from(document.querySelectorAll('.trmnl-example:not([data-trmnl-wrapped="true"])'))
    if (!pending.length) {
      this.dispatchWrapped(0)
      return
    }

    const eager = []
    const lazy = []
    const margin = this.exampleViewportMargin()

    pending.forEach((wrapper) => {
      const rect = wrapper.getBoundingClientRect()
      if (rect.top < window.innerHeight + margin && rect.bottom > -margin) {
        eager.push(wrapper)
      } else {
        lazy.push(wrapper)
      }
    })

    const context = this.wrapContext()
    if (this.isWebKitBrowser() && eager.length) {
      this.wrapEagerSequentially(eager, lazy, context)
      return
    }

    eager.forEach((wrapper, idx) => this.wrapOne(wrapper, idx, context))

    if (lazy.length) {
      this.observeLazyWrappers(lazy, context, eager.length)
    }

    this.dispatchWrapped(eager.length + lazy.length)
  }

  isWebKitBrowser() {
    const ua = navigator.userAgent
    return /AppleWebKit/i.test(ua) && !/Chrom(e|ium)|CriOS|Edg|OPR|FxiOS/i.test(ua)
  }

  exampleViewportMargin() {
    if (typeof window.__TRMNL_EXAMPLE_VIEWPORT_MARGIN__ === 'number') {
      return window.__TRMNL_EXAMPLE_VIEWPORT_MARGIN__
    }
    const margin = this.isWebKitBrowser() ? 120 : 400
    window.__TRMNL_EXAMPLE_VIEWPORT_MARGIN__ = margin
    return margin
  }

  wrapEagerSequentially(eager, lazy, context) {
    let index = 0
    const step = () => {
      if (this.disconnected) return
      if (index < eager.length) {
        this.wrapOne(eager[index], index, context)
        index += 1
        requestAnimationFrame(step)
        return
      }
      if (lazy.length) this.observeLazyWrappers(lazy, context, eager.length)
      this.dispatchWrapped(eager.length + lazy.length)
    }
    requestAnimationFrame(step)
  }

  wrapContext() {
    return {
      cssHref: this.pluginsCssPathValue,
      jsSrc: this.pluginsJsPathValue,
      importmap: this.readParentImportmap(),
      scope: this.examplesScopeValue || 'framework',
      iframeAssets: this.fetchedIframeAssets,
      singleBundleMode: this.singleBundleModeValue,
      frozenRuntime: this.frozenRuntimeValue,
      themeCssUrls: this.themeCssUrlsValue
    }
  }

  // A demo's own scripts belong to its iframe, but the parent document parses this
  // markup before anything wraps it: four chart demos meant four Highcharts loads in
  // one document, three uncaught "already defined" errors, and chart calls against a
  // library the parent has no business holding. So a demo declares its libraries with
  // data-trmnl-src and its own code with type="text/trmnl-example", neither of which
  // the parent executes, and both become the real thing on the way into the srcdoc.
  // A stylesheet a library needs (MapLibre lays its canvas out from its own CSS)
  // takes the same road as data-trmnl-href on a <link>: inert in the parent, href
  // inside the srcdoc. The <template> parse is inert too, so nothing runs while they
  // are rewritten.
  exampleBodyHtml(wrapper) {
    const html = wrapper.innerHTML
    if (!html.includes('data-trmnl-src') && !html.includes('data-trmnl-href') && !html.includes('text/trmnl-example')) return html

    const template = document.createElement('template')
    template.innerHTML = html
    template.content.querySelectorAll('script[data-trmnl-src]').forEach((script) => {
      script.setAttribute('src', script.getAttribute('data-trmnl-src'))
      script.removeAttribute('data-trmnl-src')
    })
    template.content.querySelectorAll('link[data-trmnl-href]').forEach((link) => {
      link.setAttribute('href', link.getAttribute('data-trmnl-href'))
      link.removeAttribute('data-trmnl-href')
    })
    template.content.querySelectorAll('script[type="text/trmnl-example"]').forEach((script) => {
      script.setAttribute('type', 'text/javascript')
    })

    return template.innerHTML
  }

  wrapOne(wrapper, idx, context) {
    if (wrapper.dataset.trmnlWrapped === 'true') return

    const html = this.exampleBodyHtml(wrapper)
    const iframe = document.createElement('iframe')
    iframe.setAttribute('data-trmnl-example', 'true')
    iframe.setAttribute('title', 'TRMNL Example')
    iframe.setAttribute('scrolling', 'no')
    iframe.style.width = '100%'
    iframe.style.border = '0'
    iframe.style.display = 'block'
    iframe.style.height = '480px'

    const exId = `ex-${Date.now()}-${idx}-${Math.floor(Math.random() * 1e6)}`
    wrapper.dataset.exampleId = exId

    iframe.srcdoc = this.buildSrcdoc({
      cssHref: context.cssHref,
      jsSrc: context.jsSrc,
      scope: context.scope,
      bodyHtml: html,
      importmap: context.importmap,
      singleBundleMode: context.singleBundleMode,
      frozenRuntime: context.frozenRuntime,
      iframeAssets: context.iframeAssets,
      themeCssUrls: context.themeCssUrls
    })

    wrapper.innerHTML = ''
    wrapper.appendChild(iframe)
    try {
      const stats = this.buildStatsDropdown(exId)
      const inner = wrapper.parentElement
      const outer = inner && inner.parentElement
      if (outer && outer.parentElement) {
        outer.parentElement.insertBefore(stats, outer.nextSibling)
      } else if (inner && inner.parentElement) {
        inner.parentElement.insertBefore(stats, inner.nextSibling)
      } else if (wrapper.parentElement) {
        wrapper.parentElement.insertBefore(stats, wrapper.nextSibling)
      } else {
        wrapper.after(stats)
      }
    } catch (_) {}
    wrapper.dataset.trmnlWrapped = 'true'
  }

  observeLazyWrappers(wrappers, context, startIndex = 0) {
    if (!('IntersectionObserver' in window)) {
      if (this.isWebKitBrowser()) {
        let index = 0
        const step = () => {
          if (this.disconnected || index >= wrappers.length) {
            this.dispatchWrapped(document.querySelectorAll('.trmnl-example[data-trmnl-wrapped="true"]').length)
            return
          }
          this.wrapOne(wrappers[index], startIndex + index, context)
          index += 1
          requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        return
      }
      wrappers.forEach((wrapper, idx) => this.wrapOne(wrapper, startIndex + idx, context))
      this.dispatchWrapped(document.querySelectorAll('.trmnl-example[data-trmnl-wrapped="true"]').length)
      return
    }

    let wrappedCount = startIndex
    const queue = []
    let draining = false

    const drainQueue = () => {
      if (this.disconnected || !queue.length) {
        draining = false
        return
      }
      draining = true
      const wrapper = queue.shift()
      this.wrapOne(wrapper, wrappedCount, context)
      wrappedCount += 1
      this.dispatchWrapped(wrappedCount)
      requestAnimationFrame(drainQueue)
    }

    this.lazyWrapObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const wrapper = entry.target
        this.lazyWrapObserver.unobserve(wrapper)
        if (this.isWebKitBrowser()) {
          queue.push(wrapper)
          if (!draining) drainQueue()
        } else {
          this.wrapOne(wrapper, wrappedCount, context)
          wrappedCount += 1
          this.dispatchWrapped(wrappedCount)
        }
      })
    }, { rootMargin: this.lazyWrapMargin, threshold: 0 })

    wrappers.forEach((wrapper) => this.lazyWrapObserver.observe(wrapper))
  }

  stopLazyWrapping() {
    if (this.lazyWrapObserver) {
      this.lazyWrapObserver.disconnect()
      this.lazyWrapObserver = null
    }
  }

  dispatchWrapped(count) {
    if (this.disconnected) return
    document.dispatchEvent(new CustomEvent('trmnl:framework-examples:wrapped', { detail: { count } }))
  }

  refreshExamples(event) {
    const iframes = Array.from(document.querySelectorAll('iframe[data-trmnl-example="true"]'))
    const scrollPosition = event?.detail?.scrollPosition

    if (!iframes.length) {
      if (window.restoreScrollPosition) window.restoreScrollPosition(scrollPosition)
      return
    }

    this.stopExampleRefresh()
    const refreshToken = (this.exampleRefreshToken || 0) + 1
    this.exampleRefreshToken = refreshToken
    const anchor = scrollPosition ? iframes[scrollPosition.index] : null
    let pendingLoads = iframes.length
    let settleUntil = Date.now() + 150

    const restoreScroll = () => {
      if (this.disconnected || this.exampleRefreshToken !== refreshToken) return
      if (!anchor || !anchor.isConnected || !scrollPosition) return

      const adjustment = anchor.getBoundingClientRect().top - scrollPosition.offsetFromTop
      if (Math.abs(adjustment) > 0.5) {
        window.scrollTo(0, window.scrollY + adjustment)
      }
    }

    this.exampleRefreshFrames = []

    const finishRefresh = () => {
      restoreScroll()
      if (pendingLoads > 0) pendingLoads -= 1
      settleUntil = Date.now() + 150
    }

    const maintainScroll = () => {
      if (this.disconnected || this.exampleRefreshToken !== refreshToken) return
      restoreScroll()
      if (pendingLoads > 0 || Date.now() < settleUntil) {
        this.exampleRefreshAnimationFrame = requestAnimationFrame(maintainScroll)
      } else {
        this.stopExampleRefresh()
      }
    }

    if (typeof ResizeObserver === 'function') {
      this.exampleRefreshObserver = new ResizeObserver(() => {
        settleUntil = Date.now() + 150
        restoreScroll()
      })
      iframes.forEach(iframe => this.exampleRefreshObserver.observe(iframe))
    }

    iframes.forEach(iframe => {
      const srcdoc = iframe.srcdoc
      const width = iframe.style.width
      const height = iframe.style.height
      const onLoad = () => {
        delete iframe.dataset.trmnlRefreshing
        finishRefresh()
      }

      this.exampleRefreshFrames.push({ iframe, onLoad })
      iframe.dataset.trmnlRefreshing = 'true'
      iframe.addEventListener('load', onLoad, { once: true })
      iframe.srcdoc = srcdoc

      // Reusing the same iframe keeps its current box in the document while the
      // fresh srcdoc loads. The bridge can resize it once the new screen state
      // has been applied and measured.
      iframe.style.width = width
      iframe.style.height = height
    })

    restoreScroll()
    this.exampleRefreshAnimationFrame = requestAnimationFrame(maintainScroll)
    this.exampleRefreshMaxTimer = setTimeout(() => {
      restoreScroll()
      this.stopExampleRefresh()
    }, 2000)
  }

  stopExampleRefresh() {
    if (this.exampleRefreshObserver) {
      this.exampleRefreshObserver.disconnect()
      this.exampleRefreshObserver = null
    }
    if (this.exampleRefreshAnimationFrame) {
      cancelAnimationFrame(this.exampleRefreshAnimationFrame)
      this.exampleRefreshAnimationFrame = null
    }
    if (this.exampleRefreshMaxTimer) {
      clearTimeout(this.exampleRefreshMaxTimer)
      this.exampleRefreshMaxTimer = null
    }
    if (this.exampleRefreshFrames) {
      this.exampleRefreshFrames.forEach(({ iframe, onLoad }) => {
        iframe.removeEventListener('load', onLoad)
        delete iframe.dataset.trmnlRefreshing
      })
      this.exampleRefreshFrames = null
    }
  }

  buildSrcdoc({ cssHref, jsSrc, scope, bodyHtml, importmap, singleBundleMode, frozenRuntime, iframeAssets, themeCssUrls }) {
    const fonts = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;350;375;400;450;600;700&display=swap'
    const safeHtml = bodyHtml || ''
    const scopeName = `screen_picker_${scope}`
    const bridgeScript = this.buildBridgeScript(scopeName, frozenRuntime)
    const fetchedCss = iframeAssets && iframeAssets.plugins_css_url
    const fetchedJs = iframeAssets && iframeAssets.plugins_js_url
    const fetchedSingleBundleMode = iframeAssets && typeof iframeAssets.single_bundle_mode === 'boolean' ? iframeAssets.single_bundle_mode : null
    const fetchedThemeCssUrls = iframeAssets && iframeAssets.theme_css_urls
    const effectiveCss = fetchedCss || cssHref
    const effectiveJsSrc = fetchedJs || jsSrc
    const shouldUseSingleBundle = fetchedSingleBundleMode !== null ? fetchedSingleBundleMode : singleBundleMode
    const effectiveThemeCssUrls = (fetchedThemeCssUrls && typeof fetchedThemeCssUrls === 'object') ? fetchedThemeCssUrls : (themeCssUrls || {})
    const themeCssUrlsTag = `<script>window.TRMNL_THEME_CSS_URLS = ${JSON.stringify(effectiveThemeCssUrls)};</script>`
    // The docs site's maps draw from TRMNL's own tile source (the engine endpoint on this
    // host), the way a host injects a per-instance source for a plugin; a plugin that names
    // none rides the public default. The snippets show none, so a reader copies the default.
    const mapsTag = `<script>window.__TRMNL_MAPS__ = { tiles: 'trmnl' };</script>`
    // Theme CSS is inert without a screen--theme-* class, so load all of it up
    // front (mirroring the parent layout). Hardcoded theme demos and picker
    // broadcasts then only ever toggle classes.
    const themeCssLinkTags = Object.values(effectiveThemeCssUrls).map(href => `<link href="${href}" rel="stylesheet">`).join('\n    ')

    let pluginsLoaderTag = ''
    if (shouldUseSingleBundle && effectiveJsSrc) {
      pluginsLoaderTag = `<script src="${effectiveJsSrc}"></script>`
    } else {
      try {
        if (importmap) {
          const obj = JSON.parse(importmap)
          const m = obj && obj.imports ? obj.imports : {}
          const urls = [
            m['plugin-render/asset-deduplication'],
            m['plugin-render/dithering'],
            m['plugin-render/plugins']
          ].filter(Boolean)
          if (urls.length) {
            pluginsLoaderTag = urls.map(u => `<script src="${u}"></script>`).join('')
          }
        }
      } catch (_) {}

      if (!pluginsLoaderTag && effectiveJsSrc) {
        pluginsLoaderTag = `<script src="${effectiveJsSrc}"></script>`
      }
    }

    return `<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="${fonts}" rel="stylesheet">\n    <link href="${effectiveCss}" rel="stylesheet">\n    ${themeCssLinkTags}\n      </head>\n  <body class="environment trmnl">\n    ${safeHtml}\n    ${pluginsLoaderTag}\n    ${themeCssUrlsTag}\n    ${mapsTag}\n    ${bridgeScript}\n  </body>\n</html>`
  }

  buildBridgeScript(scopeName, frozenRuntime) {
    // lib/screen_class_sync.js is a classic script (iframe docs have no
    // importmap): it defines window.TRMNLScreenClassSync, the shared
    // screen-class rewrite predicate the bridge uses.
    return `
      <script>
        // Set scope name for auto-initialization
        window.TRMNL_SCOPE_NAME = ${JSON.stringify(scopeName)};
        window.TRMNL_FROZEN_RUNTIME = ${frozenRuntime ? 'true' : 'false'};
        // The one origin the bridge posts its stats and resize messages to.
        window.TRMNL_PARENT_ORIGIN = ${JSON.stringify(window.location.origin)};
      </script>
      <script src="${this.screenClassSyncPathValue}"></script>
      <script type="module">
        import ${JSON.stringify(this.bridgePathValue)};
      </script>
    `
  }

  buildStatsDropdown(exampleId) {
    const container = document.createElement('div')
    container.className = 'mt-2'
    const outer = document.createElement('div')
    outer.className = 'relative block w-full'
    outer.setAttribute('data-controller', 'example-stats')
    if (exampleId) outer.dataset.exampleFor = String(exampleId)
    const menu = document.createElement('div')
    menu.className = 'mt-2 w-full rounded-xl bg-gray-150 dark:bg-gray-750 border border-gray-250 dark:border-gray-650 overflow-hidden'
    menu.innerHTML = `
      <div>
        <div data-example-stats-target="header"
             data-action="click->example-stats#toggleContent keydown.enter->example-stats#toggleContent keydown.space->example-stats#toggleContent"
             role="button" tabindex="0" aria-expanded="false"
             class="flex flex-row items-center justify-between py-2 px-3 cursor-pointer select-none">
          <div class="flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-gray-400 tracking-wide">
            <svg class="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
              <path d="M114.34,154.34l96-96a8,8,0,0,1,11.32,11.32l-96,96a8,8,0,0,1-11.32-11.32ZM128,88a63.9,63.9,0,0,1,20.44,3.33,8,8,0,1,0,5.11-15.16A80,80,0,0,0,48.49,160.88,8,8,0,0,0,56.43,168c.29,0,.59,0,.89-.05a8,8,0,0,0,7.07-8.83A64.92,64.92,0,0,1,64,152,64.07,64.07,0,0,1,128,88Zm99.74,13a8,8,0,0,0-14.24,7.3,96.27,96.27,0,0,1,5,75.71l-181.1-.07A96.24,96.24,0,0,1,128,56h.88a95,95,0,0,1,42.82,10.5A8,8,0,1,0,179,52.27a112,112,0,0,0-156.66,137A16.07,16.07,0,0,0,37.46,200H218.53a16,16,0,0,0,15.11-10.71,112.35,112.35,0,0,0-5.9-88.3Z"></path>
            </svg>
            <span>Framework Runtime</span>
          </div>
          <div class="flex items-center gap-2">
            <div data-example-stats-summary class="flex items-center gap-1 text-[11px] font-semibold text-green-450 dark:text-green-500"></div>
            <button type="button"
                    data-role="stats-toggle"
                    data-action="click->example-stats#toggleContent"
                    class="font-medium rounded-lg text-xs px-2 py-1 inline-flex items-center transition duration-150 justify-center shrink-0 gap-1.5 whitespace-nowrap text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none">
              <span class="expand-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
              <span class="collapse-icon hidden" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>
        <div data-example-stats-target="list" class="hidden max-h-[60vh] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800"></div>
      </div>
    `

    outer.appendChild(menu)
    container.appendChild(outer)
    return container
  }

  readParentImportmap() {
    try {
      const el = document.querySelector('script[type="importmap"]')
      if (!el) return ''
      const json = (el.textContent || '').trim()
      if (!json) return ''
      return json
    } catch (_) {
      return ''
    }
  }
}
