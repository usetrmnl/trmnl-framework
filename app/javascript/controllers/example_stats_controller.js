import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["list", "header"]

  connect() {
    this.iframe = this.findPairedIframe() || this.findNearestIframe()
    this.boundOnMessage = this.onMessage.bind(this)
    window.addEventListener('message', this.boundOnMessage)
    this._listEl = this.getListEl()
  }

  findPairedIframe() {
    try {
      const id = this.element && this.element.dataset ? this.element.dataset.exampleFor : null
      if (!id) return null
      const wrapper = document.querySelector(`[data-example-id="${id}"]`)
      if (!wrapper) return null
      const iframe = wrapper.querySelector('iframe[data-trmnl-example="true"]')
      return iframe || null
    } catch (_) {
      return null
    }
  }

  disconnect() {
    window.removeEventListener('message', this.boundOnMessage)
  }

  findNearestIframe() {
    let node = this.element.previousElementSibling
    for (let i = 0; i < 8 && node; i++) {
      if (node.tagName === 'IFRAME' && node.dataset && node.dataset.trmnlExample === 'true') return node
      if (node.classList && node.classList.contains('trmnl-example')) {
        const inner = node.querySelector('iframe[data-trmnl-example="true"]')
        if (inner) return inner
      }
      node = node.previousElementSibling
    }
    node = this.element.nextElementSibling
    for (let i = 0; i < 3 && node; i++) {
      if (node.tagName === 'IFRAME' && node.dataset && node.dataset.trmnlExample === 'true') return node
      if (node.classList && node.classList.contains('trmnl-example')) {
        const inner = node.querySelector('iframe[data-trmnl-example="true"]')
        if (inner) return inner
      }
      node = node.nextElementSibling
    }
    const parent = this.element.parentElement
    if (parent) {
      const wrappers = Array.from(parent.querySelectorAll('.trmnl-example'))
      if (wrappers.length) {
        const myTop = this.element.getBoundingClientRect().top + window.scrollY
        let best = null
        let bestDelta = Infinity
        wrappers.forEach(w => {
          const top = w.getBoundingClientRect().top + window.scrollY
          const delta = myTop - top
          if (delta >= 0 && delta < bestDelta) { best = w; bestDelta = delta }
        })
        const chosen = best || wrappers[0]
        const inner = chosen && chosen.querySelector('iframe[data-trmnl-example="true"]')
        if (inner) return inner
      }
    }
    return null
  }

  onMessage(event) {
    if (!event || !event.data || typeof event.data !== 'object') return
    if (event.data.type !== 'trmnl:terminalize:stats') return
    const isMatch = !!(this.iframe && event.source === this.iframe.contentWindow)
    if (!isMatch) return
    try { this.render(event.data.detail || {}) } catch (_) {}
  }

  toggleContent(event) {
    event && event.preventDefault && event.preventDefault()
    event && event.stopPropagation && event.stopPropagation()
    const list = this.getListEl()
    if (!list) return
    const collapsed = list.classList.toggle('hidden')
    try {
      const header = this.getHeaderEl()
      if (header) header.setAttribute('aria-expanded', String(!collapsed))
      // Sync the header toggle button icons
      if (header) {
        const btn = header.querySelector('[data-role="stats-toggle"]')
        if (btn) {
          const exp = btn.querySelector('.expand-icon')
          const col = btn.querySelector('.collapse-icon')
          if (collapsed) {
            if (exp) exp.classList.remove('hidden')
            if (col) col.classList.add('hidden')
          } else {
            if (exp) exp.classList.add('hidden')
            if (col) col.classList.remove('hidden')
          }
        }
      }
    } catch(_) {}
  }

  render(stats) {
    const list = this.getListEl()
    if (!list) return
    const sectionWrapper = this.element && this.element.parentElement ? this.element.parentElement : null
    const container = document.createElement('div')
    container.className = 'tn-stats border-t border-gray-250 dark:border-gray-650'
    const itemBaseClasses = 'tn-stats__item flex flex-col rounded-lg px-3 py-2 justify-end'
    const chipClasses = 'px-2 py-0.5 text-xs font-medium rounded-md bg-gray-75 dark:bg-gray-650 text-gray-700 dark:text-gray-200'
    const wrapperLabelClasses = 'text-[11px] leading-tight text-gray-500 dark:text-gray-400 mt-1'
    const valueTextClasses = 'text-lg font-semibold leading-tight text-gray-900 dark:text-gray-100'
    const gridClasses = 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 grid-flow-row-dense'
    const addRail = (el) => {
      el.classList.add('relative', 'pl-3')
      const rail = document.createElement('span')
      rail.className = 'pointer-events-none absolute left-0 top-1 bottom-1 w-1.5 rounded-sm bg-gray-300 dark:bg-gray-650'
      el.appendChild(rail)
      return el
    }
    const createItemContainer = (classes) => addRail(Object.assign(document.createElement('div'), { className: classes }))
    const formatNum = (n) => (typeof n === 'number' && isFinite(n)) ? n.toLocaleString() : String(n)
    const formatLabel = (key) => {
      const map = {
        durationMs: 'Time (ms)',
        adjusted: 'Adjusted',
        changed: 'Changed',
        truncated: 'Truncated',
        limited: 'Limited',
        hiddenItems: 'Hidden items',
        candidates: 'Candidates',
        targets: 'Targets',
        grids: 'Grids',
        containers: 'Containers',
        columns: 'Columns',
        scheduled: 'Elements',
        linesProcessed: 'Lines processed'
      }
      return map[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())
    }
    const makeMetric = (label, value) => {
      const card = createItemContainer(itemBaseClasses + ' items-start')
      const v = Object.assign(document.createElement('div'), { className: valueTextClasses, textContent: formatNum(value) })
      const l = Object.assign(document.createElement('div'), { className: 'text-[11px] leading-tight text-gray-500 dark:text-gray-400', textContent: label })
      card.appendChild(v)
      card.appendChild(l)
      return card
    }
    const hasEffect = (step) => {
      const entries = Object.entries(step).filter(([k]) => !['name','durationMs'].includes(k))
      if (entries.length === 0) return false
      if (step.name === 'Pixel-perfect fonts') {
        const scheduledCount = Number(step.scheduled || 0)
        return scheduledCount > 0
      }
      if ((typeof step.targets === 'number' && step.targets > 0) || (typeof step.targetsTotal === 'number' && step.targetsTotal > 0)) {
        return true
      }
      return entries.some(([k,v]) => typeof v === 'number' && v > 0 && !['targets','candidates','grids','containers','columns','scheduled'].includes(k) && !/^(avg|average)[A-Z_]?/i.test(k))
    }
    let steps = (stats.steps || []).filter(hasEffect)
    const stepOrder = [
      'Overflow engine',
      'Adjust column gaps',
      'Adjust grid gaps',
      'Clamp engine',
      'Format values',
      'Fit values',
      'Content limiter',
      'Pixel-perfect fonts',
      'Item index number resize'
    ]
    steps = steps.sort((a, b) => {
      const ia = stepOrder.indexOf(a.name)
      const ib = stepOrder.indexOf(b.name)
      const da = ia === -1 ? Number.MAX_SAFE_INTEGER : ia
      const db = ib === -1 ? Number.MAX_SAFE_INTEGER : ib
      return da - db
    })

    // Toggle visibility of the entire section when no changes were needed
    try {
      if (sectionWrapper) {
        if (steps.length === 0) {
          sectionWrapper.style.display = 'none'
        } else {
          sectionWrapper.style.display = ''
        }
      }
    } catch(_) {}

    // Update header summary with engine count
    try {
      const engineCount = Number(stats && stats.engineCount) || 0
      const header = this.getHeaderEl()
      if (header) {
        let summary = header.querySelector('[data-example-stats-summary]')
        if (!summary) {
          summary = document.createElement('div')
          summary.setAttribute('data-example-stats-summary', '1')
          summary.className = 'flex items-center gap-1 text-[11px] font-semibold text-green-450 dark:text-green-500'
          header.appendChild(summary)
        }
        // Checkmark icon
        summary.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="h-3 w-3" fill="none" aria-hidden="true">
            <rect width="256" height="256" fill="none"/>
            <polyline points="40,144 96,200 216,80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="30"/>
          </svg>
          <span>Done • ${engineCount} engine${engineCount === 1 ? '' : 's'} ran</span>
        `
      }
    } catch(_) {}

    try {
      if (steps.length === 0) {
        // When no engine made changes, hide entire section.
      } else {
        steps.forEach((s, idx) => {
          const section = document.createElement('div')
          section.className = 'tn-stats__section p-3 ' + (idx > 0 ? 'border-t border-gray-250 dark:border-gray-650' : '')

        const header = document.createElement('div')
        header.className = 'flex items-center justify-between'
        const title = document.createElement('div')
        title.className = 'flex items-center text-sm font-medium text-gray-800 dark:text-gray-200'
        const titleText = document.createElement('span')
        titleText.textContent = s.name
        title.appendChild(titleText)

        const time = document.createElement('div')
        time.className = 'flex items-center gap-1 text-[11px] font-semibold text-green-450 dark:text-green-500'
        // Stopwatch icon (inline SVG to match shared/icons/_stopwatch)
        time.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="h-3 w-3" fill="none" aria-hidden="true">
            <rect width="256" height="256" fill="none"/>
            <circle cx="128" cy="136" r="88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="30"/>
            <line x1="128" y1="136" x2="168" y2="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="30"/>
            <line x1="104" y1="16" x2="152" y2="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="30"/>
          </svg>
          <span>${formatNum(s.durationMs)}ms</span>
        `

        header.appendChild(title)
        header.appendChild(time)
        section.appendChild(header)

        const grid = document.createElement('div')
        grid.className = gridClasses

        const entries = Object.entries(s).filter(([k]) => !['name','durationMs','instances'].includes(k) && !/^(avg|average)[A-Z_]?/i.test(k))
        const isClamp = s.name === 'Clamp engine'
        const order = isClamp
          ? ['targetsTotal','truncated','linesTrimmed','wordsTrimmed','charsTrimmed']
          : ['columnsCreated','itemsProcessed','hiddenItems','overflowCounters','repeatedHeaders','harmonious']
        const ordered = entries.sort((a,b) => order.indexOf(a[0]) - order.indexOf(b[0]))

        const renderChipList = (items, titleText) => {
          const wrapper = createItemContainer(itemBaseClasses)
          const list = Object.assign(document.createElement('div'), { className: 'flex flex-wrap gap-1' })
          items.forEach((val) => {
            const chip = Object.assign(document.createElement('span'), { className: chipClasses, textContent: String(val) })
            list.appendChild(chip)
          })
          const titleEl = Object.assign(document.createElement('div'), { className: wrapperLabelClasses, textContent: titleText })
          wrapper.appendChild(list)
          wrapper.appendChild(titleEl)
          grid.appendChild(wrapper)
        }

        ordered.forEach(([k,v]) => {
          // An *Applied array with no entries (e.g. a Fit values step that made
          // 0 adjustments) would otherwise fall through to makeMetric() below and
          // render a labeled card with a blank value. Skip it entirely.
          if (/Applied$/.test(k) && Array.isArray(v) && v.length === 0) return

          let label = formatLabel(k)
          if (k === 'columnsCreated') label = 'Columns created'
          if (k === 'hiddenItems') label = 'Items hidden'
          if (k === 'itemsProcessed') label = 'Items processed'
          if (k === 'repeatedHeaders') label = 'Header carry-overs'
          if (k === 'harmonious') label = 'Harmonized columns'
          if (k === 'targetsTotal') label = 'Clamp targets'
          if (k === 'wordsTrimmed') label = 'Words trimmed'
          if (k === 'charsTrimmed') label = 'Characters trimmed'
          if (k === 'linesTrimmed') label = 'Lines trimmed'
          if (k === 'overflowCounters') label = 'Overflow Counters'

          if (k === 'gapsApplied' && Array.isArray(v) && v.length) {
            renderChipList(v, 'Gaps applied')
          } else if (k === 'fontSizesApplied' && Array.isArray(v) && v.length) {
            renderChipList(v, 'Font sizes applied')
          } else if (k === 'lineHeightsApplied' && Array.isArray(v) && v.length) {
            renderChipList(v, 'Line heights applied')
          } else if (k === 'fontWeightsApplied' && Array.isArray(v) && v.length) {
            renderChipList(v, 'Font weights applied')
          } else {
            grid.appendChild(makeMetric(label, v))
          }
        })

          section.appendChild(grid)
          container.appendChild(section)
        })
      }
    } catch (e) {
      try {
        const err = document.createElement('div')
        err.className = 'px-4 py-3 text-xs text-red-600 dark:text-red-400'
        err.textContent = 'Stats render error'
        container.appendChild(err)
        console.error('[example-stats] render error', e)
      } catch(_) {}
    }

    list.innerHTML = ''
    if (steps.length > 0) {
      list.appendChild(container)
    }
  }

  getListEl() {
    if (this._listEl && this._listEl.isConnected) return this._listEl
    return this.hasListTarget ? this.listTarget : (this.element.querySelector('[data-example-stats-target="list"]') || null)
  }

  getHeaderEl() {
    return this.hasHeaderTarget ? this.headerTarget : (this.element.querySelector('[data-example-stats-target="header"]') || null)
  }

  _resolveIconMap() { return null }
}
