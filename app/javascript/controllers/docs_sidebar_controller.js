import { Controller } from "@hotwired/stimulus"

const COLLAPSED_WIDTH = 28

export default class extends Controller {
  static targets = ["panel", "handle", "toggleBtn"]
  static values = {
    storageKey: { type: String, default: "" },
    defaultWidth: { type: Number, default: 256 },
    minWidth: { type: Number, default: 200 },
    maxWidth: { type: Number, default: 400 },
    side: { type: String, default: "left" },
    collapseBelow: { type: Number, default: 0 }
  }

  connect() {
    this.boundPointerMove = this.onPointerMove.bind(this)
    this.boundPointerUp = this.onPointerUp.bind(this)
    this.boundOnResize = this.onResize.bind(this)
    this.viewportCollapsed = false

    const stored = this.loadState()
    this.userCollapsed = stored?.collapsed ?? false
    this.collapsed = this.userCollapsed
    const width = stored?.width ?? this.defaultWidthValue
    this.lastWidth = width

    this.applyForViewport(false)

    this.updateToggleIcon()

    if (this.collapseBelowValue > 0) {
      window.addEventListener("resize", this.boundOnResize)
    }
  }

  disconnect() {
    this.teardown()
    if (this.boundOnResize) {
      window.removeEventListener("resize", this.boundOnResize)
    }
  }

  startDrag(event) {
    if (this.collapsed) return
    if (event.target.closest("[data-action*='toggle']")) return

    event.preventDefault()
    this.dragging = true
    this.activePointerId = event.pointerId

    if (this.handleTarget.setPointerCapture) {
      this.handleTarget.setPointerCapture(this.activePointerId)
    }

    this.handleTarget.classList.add("docs-sidebar__handle--active")
    window.addEventListener("pointermove", this.boundPointerMove)
    window.addEventListener("pointerup", this.boundPointerUp)
    window.addEventListener("pointercancel", this.boundPointerUp)
    document.body.classList.add("select-none")
  }

  onPointerMove(event) {
    if (!this.dragging) return

    const rect = this.element.getBoundingClientRect()
    let width
    if (this.sideValue === "right") {
      width = rect.right - event.clientX
    } else {
      width = event.clientX - rect.left
    }

    this.applyWidth(this.clamp(width), false)
  }

  onPointerUp(event) {
    if (!this.dragging) return

    if (
      event &&
      this.handleTarget.releasePointerCapture &&
      this.activePointerId != null &&
      event.pointerId === this.activePointerId
    ) {
      this.handleTarget.releasePointerCapture(this.activePointerId)
    }

    this.persistState()
    this.teardown()
  }

  toggle(event) {
    if (event) event.stopPropagation()

    this.collapsed = !this.collapsed
    this.userCollapsed = this.collapsed
    this.viewportCollapsed = false

    if (this.collapsed) {
      this.lastWidth = this.currentWidth
      this.applyCollapsed(true)
    } else {
      const width = this.lastWidth || this.defaultWidthValue
      this.applyWidth(this.clamp(width), true)
    }

    this.updateToggleIcon()
    this.persistState()
  }

  applyForViewport(animate) {
    const shouldCollapseForViewport = this.collapseBelowValue > 0 && window.innerWidth < this.collapseBelowValue

    if (shouldCollapseForViewport) {
      this.viewportCollapsed = true
      this.applyCollapsed(animate)
    } else if (this.userCollapsed) {
      this.viewportCollapsed = false
      this.applyCollapsed(animate)
    } else {
      this.viewportCollapsed = false
      this.applyWidth(this.clamp(this.lastWidth || this.defaultWidthValue), animate)
    }
  }

  onResize() {
    if (this.dragging) return

    const shouldCollapseForViewport = this.collapseBelowValue > 0 && window.innerWidth < this.collapseBelowValue

    if (shouldCollapseForViewport && !this.collapsed) {
      this.viewportCollapsed = true
      this.applyCollapsed(true)
      this.updateToggleIcon()
    } else if (!shouldCollapseForViewport && this.viewportCollapsed && !this.userCollapsed) {
      this.viewportCollapsed = false
      const width = this.lastWidth || this.defaultWidthValue
      this.applyWidth(this.clamp(width), true)
      this.updateToggleIcon()
    }
  }

  applyWidth(width, animate) {
    this.currentWidth = width
    this.collapsed = false

    if (animate) {
      this.element.style.transition = "width 200ms ease"
      this.panelTarget.style.transition = "opacity 150ms ease"
    } else {
      this.element.style.transition = "none"
      this.panelTarget.style.transition = "none"
    }

    this.element.style.width = `${width}px`
    this.panelTarget.style.opacity = "1"
    this.panelTarget.style.pointerEvents = "auto"
    this.element.removeAttribute("data-docs-sidebar-collapsed")

    if (animate) {
      setTimeout(() => {
        this.element.style.transition = "none"
        this.panelTarget.style.transition = "none"
      }, 210)
    }
  }

  applyCollapsed(animate) {
    if (animate) {
      this.element.style.transition = "width 200ms ease"
      this.panelTarget.style.transition = "opacity 100ms ease"
    } else {
      this.element.style.transition = "none"
      this.panelTarget.style.transition = "none"
    }

    this.element.style.width = `${COLLAPSED_WIDTH}px`
    this.panelTarget.style.opacity = "0"
    this.panelTarget.style.pointerEvents = "none"
    this.element.setAttribute("data-docs-sidebar-collapsed", "")

    if (animate) {
      setTimeout(() => {
        this.element.style.transition = "none"
        this.panelTarget.style.transition = "none"
      }, 210)
    }
  }

  updateToggleIcon() {
    if (!this.hasToggleBtnTarget) return
    const btn = this.toggleBtnTarget
    btn.innerHTML = this.sidebarIcon
    btn.title = this.collapsed ? "Show sidebar" : "Hide sidebar"
  }

  clamp(width) {
    return Math.min(this.maxWidthValue, Math.max(this.minWidthValue, width))
  }

  persistState() {
    if (!this.storageKeyValue) return
    try {
      const payload = JSON.stringify({
        width: this.currentWidth || this.lastWidth || this.defaultWidthValue,
        collapsed: this.userCollapsed
      })
      localStorage.setItem(this.storageKeyValue, payload)
    } catch (e) {
      // storage unavailable
    }
  }

  loadState() {
    if (!this.storageKeyValue) return null
    try {
      const raw = localStorage.getItem(this.storageKeyValue)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return typeof parsed === "object" && parsed !== null ? parsed : null
    } catch (e) {
      return null
    }
  }

  teardown() {
    if (!this.dragging) return
    this.dragging = false
    this.activePointerId = null
    this.handleTarget.classList.remove("docs-sidebar__handle--active")
    window.removeEventListener("pointermove", this.boundPointerMove)
    window.removeEventListener("pointerup", this.boundPointerUp)
    window.removeEventListener("pointercancel", this.boundPointerUp)
    document.body.classList.remove("select-none")
  }

  get sidebarIcon() {
    const flip = this.sideValue === "right"
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"${flip ? ' style="transform:scaleX(-1)"' : ''}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>`
  }
}
