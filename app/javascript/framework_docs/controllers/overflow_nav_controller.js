import { Controller } from "@hotwired/stimulus"

// Progressively hides items by data-overflow-priority (lowest first) when the
// header's content overflows, and restores them when space becomes available.
//
// Uses overflow-x:clip (not hidden) so dropdown menus can still extend
// vertically past the header. Measures overflow manually via
// getBoundingClientRect because clip doesn't support scrollWidth detection.
export default class extends Controller {
  static targets = ["item"]

  connect() {
    this._header = this.element.closest('header')
    if (!this._header) return

    this._lockLayout()

    this._observer = new ResizeObserver(() => this._reflow())
    this._observer.observe(this._header)

    requestAnimationFrame(() => requestAnimationFrame(() => this._reflow()))
  }

  disconnect() {
    this._observer?.disconnect()
    this._unlockLayout()
  }

  _lockLayout() {
    this._header.style.overflowX = 'clip'

    this.element.style.flexShrink = '0'
    this.element.style.whiteSpace = 'nowrap'

    const parent = this.element.parentElement
    if (parent) {
      parent.style.flexShrink = '0'
      parent.style.flexWrap = 'nowrap'
    }

    this._freezeChildren()
  }

  _unlockLayout() {
    if (this._header) this._header.style.overflowX = ''
    this.element.style.flexShrink = ''
    this.element.style.whiteSpace = ''

    const parent = this.element.parentElement
    if (parent) {
      parent.style.flexShrink = ''
      parent.style.flexWrap = ''
    }

    for (const child of this.element.children) {
      child.style.flexShrink = ''
      child.style.display = ''
    }
  }

  _freezeChildren() {
    for (const child of this.element.children) {
      child.style.flexShrink = '0'
    }
  }

  _contentOverflows() {
    const hs = getComputedStyle(this._header)
    const available = this._header.clientWidth -
      parseFloat(hs.paddingLeft) - parseFloat(hs.paddingRight)
    const gap = parseFloat(hs.columnGap) || 0

    let used = 0
    let count = 0
    for (const child of this._header.children) {
      const cs = getComputedStyle(child)
      if (cs.display === 'none' || cs.position === 'absolute' || cs.position === 'fixed') continue
      used += child.getBoundingClientRect().width +
        parseFloat(cs.marginLeft) + parseFloat(cs.marginRight)
      count++
    }
    if (count > 1) used += gap * (count - 1)

    return used > available
  }

  _reflow() {
    if (this._reflowing) return
    this._reflowing = true

    const items = this._sortedItems()
    for (const { el } of items) el.style.display = ''
    this._freezeChildren()

    let i = 0
    while (i < items.length && this._contentOverflows()) {
      const priority = items[i].priority
      while (i < items.length && items[i].priority === priority) {
        items[i].el.style.display = 'none'
        i++
      }
    }

    this._reflowing = false
  }

  _sortedItems() {
    return this.itemTargets
      .map(el => ({ el, priority: parseInt(el.dataset.overflowPriority || '0', 10) }))
      .sort((a, b) => a.priority - b.priority)
  }
}
