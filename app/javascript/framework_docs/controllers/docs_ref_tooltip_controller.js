import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="docs-ref-tooltip"
export default class extends Controller {
  static targets = ["trigger", "template"]

  connect() {
    this.portal = null
    this.hideTimeout = null
    this.boundOnPortalEnter = this.onPortalEnter.bind(this)
    this.boundOnPortalLeave = this.onPortalLeave.bind(this)
  }

  disconnect() {
    this.destroyPortal()
  }

  show() {
    clearTimeout(this.hideTimeout)
    if (!this.portal) this.createPortal()
    this.positionPortal()
    // Make visible and animate in similar to dropdown
    this.portal.style.visibility = "visible"
    this.portal.style.pointerEvents = "auto"
    // Trigger reflow to ensure the transition happens
    void this.portal.offsetWidth
    this.portal.classList.remove('opacity-0', 'translate-y-[-10px]')
    this.portal.classList.add('transition', 'ease-out', 'duration-200')
  }

  scheduleHide() {
    clearTimeout(this.hideTimeout)
    this.hideTimeout = setTimeout(() => this.hide(), 120)
  }

  hide() {
    if (!this.portal) return
    this.portal.classList.add('opacity-0', 'translate-y-[-10px]')
    this.portal.classList.add('transition', 'ease-in', 'duration-150')
    setTimeout(() => {
      if (!this.portal) return
      this.portal.style.visibility = "hidden"
      this.portal.style.pointerEvents = "none"
    }, 150)
  }

  onPortalEnter() {
    clearTimeout(this.hideTimeout)
  }

  onPortalLeave() {
    this.scheduleHide()
  }

  createPortal() {
    const node = this.templateTarget.cloneNode(true)
    node.removeAttribute("id")
    node.hidden = false
    node.style.position = "fixed"
    node.style.marginTop = "0"
    node.style.visibility = "hidden"
    node.style.pointerEvents = "none"
    node.classList.remove("absolute", "left-0", "top-full", "mt-1")
    node.style.zIndex = "9999"
    node.classList.remove("max-h-80", "overflow-y-auto")
    // Start hidden with dropdown-like animation classes
    node.classList.add('opacity-0', 'translate-y-[-10px]')

    document.body.appendChild(node)
    node.addEventListener("pointerenter", this.boundOnPortalEnter)
    node.addEventListener("pointerleave", this.boundOnPortalLeave)
    this.portal = node
  }

  destroyPortal() {
    if (this.portal) {
      this.portal.removeEventListener("pointerenter", this.boundOnPortalEnter)
      this.portal.removeEventListener("pointerleave", this.boundOnPortalLeave)
      this.portal.remove()
      this.portal = null
    }
  }

  positionPortal() {
    const trigger = this.triggerTarget
    const rect = trigger.getBoundingClientRect()
    // Default place below, left aligned with small gap
    const gap = 8

    // Reset size to measure
    this.portal.style.left = "0px"
    this.portal.style.top = "0px"

    // Let browser layout compute natural size
    this.portal.style.display = "block"

    // Temporarily make it visible to measure accurate size
    const prevVisibility = this.portal.style.visibility
    const prevOpacity = this.portal.style.opacity
    this.portal.style.visibility = "hidden"
    this.portal.style.opacity = "0"

    // Measure after display block
    const { width: pw, height: ph } = this.portal.getBoundingClientRect()

    // Compute horizontal position with clamping
    let left = rect.left
    if (left + pw > window.innerWidth - gap) {
      left = Math.max(gap, window.innerWidth - gap - pw)
    }

    // Compute vertical: prefer below, else above
    let top = rect.bottom + gap
    if (top + ph > window.innerHeight - gap) {
      const aboveTop = rect.top - gap - ph
      if (aboveTop >= gap) {
        top = aboveTop
      } else {
        // If neither fits entirely, pin to viewport but still show full content
        top = Math.max(gap, window.innerHeight - gap - ph)
      }
    }

    this.portal.style.left = `${left}px`
    this.portal.style.top = `${top}px`

    this.portal.style.visibility = prevVisibility
    this.portal.style.opacity = prevOpacity
  }
}

