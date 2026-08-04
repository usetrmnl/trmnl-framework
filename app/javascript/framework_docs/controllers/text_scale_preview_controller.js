import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "option", "scalePreview", "preview"]

  static values = {
    options: Array,
    initialIndex: { type: Number, default: 1 },
  }

  connect() {
    this.index = this.normalizedIndex(this.initialIndexValue)
    this.boundWrapped = this.bindPreview.bind(this)
    this.boundFrameLoad = () => requestAnimationFrame(() => this.applyToLoadedFrame())

    document.addEventListener("trmnl:framework-examples:wrapped", this.boundWrapped)
    this.render()
    this.bindPreview()
    this.bindAnimationFrame = requestAnimationFrame(() => this.bindPreview())
  }

  disconnect() {
    document.removeEventListener("trmnl:framework-examples:wrapped", this.boundWrapped)
    if (this.bindAnimationFrame) cancelAnimationFrame(this.bindAnimationFrame)
    if (this.frame) this.frame.removeEventListener("load", this.boundFrameLoad)
  }

  change(event) {
    this.setIndex(event.currentTarget.value)
  }

  select(event) {
    this.setIndex(event.params.index)
  }

  setIndex(value) {
    this.index = this.normalizedIndex(value)
    this.render()
    this.refreshFrame()
  }

  normalizedIndex(value) {
    const maximum = Math.max(this.optionsValue.length - 1, 0)
    const parsed = Number.parseInt(value, 10)
    if (!Number.isFinite(parsed)) return 0
    return Math.min(Math.max(parsed, 0), maximum)
  }

  currentOption() {
    return this.optionsValue[this.index] || this.optionsValue[0]
  }

  render() {
    const option = this.currentOption()
    if (!option) return

    this.inputTarget.value = String(this.index)
    this.inputTarget.setAttribute("aria-valuetext", `${option.label}, ${option.percentage}`)

    this.optionTargets.forEach((button, index) => {
      button.setAttribute("aria-pressed", String(index === this.index))
    })

    this.scalePreviewTargets.forEach((preview, index) => {
      const active = index === this.index
      preview.dataset.active = String(active)
      preview.classList.toggle("border-primary-500", active)
      preview.classList.toggle("text-primary-500", active)
      preview.classList.toggle("border-gray-300", !active)
      preview.classList.toggle("text-gray-600", !active)
      preview.classList.toggle("dark:border-gray-600", !active)
      preview.classList.toggle("dark:text-gray-300", !active)
    })
  }

  bindPreview() {
    const frame = this.previewTarget.querySelector('iframe[data-trmnl-example="true"]')
    if (!frame) return

    if (this.frame !== frame) {
      if (this.frame) this.frame.removeEventListener("load", this.boundFrameLoad)
      this.frame = frame
      this.frame.addEventListener("load", this.boundFrameLoad)
    }

    this.applyToLoadedFrame()
  }

  refreshFrame() {
    const option = this.currentOption()
    const frame = this.frame || this.previewTarget.querySelector('iframe[data-trmnl-example="true"]')
    if (!option || !frame) return

    const source = this.srcdocWithTextScale(frame.srcdoc, option.className)
    if (!source || source === frame.srcdoc) {
      this.applyToLoadedFrame()
      return
    }

    frame.srcdoc = source
  }

  srcdocWithTextScale(source, className) {
    if (!source) return null

    const document = new DOMParser().parseFromString(source, "text/html")
    const screen = document.querySelector(".screen")
    if (!screen) return null
    if (screen.classList.contains(className)) return source

    Array.from(screen.classList)
      .filter((name) => name.startsWith("screen--text-scale-"))
      .forEach((name) => screen.classList.remove(name))
    screen.classList.add(className)

    const doctype = document.doctype ? `<!DOCTYPE ${document.doctype.name}>` : "<!DOCTYPE html>"
    return `${doctype}\n${document.documentElement.outerHTML}`
  }

  applyToLoadedFrame() {
    const option = this.currentOption()
    const frame = this.frame || this.previewTarget.querySelector('iframe[data-trmnl-example="true"]')
    const screen = frame?.contentDocument?.querySelector(".screen")
    if (!option || !screen) return

    Array.from(screen.classList)
      .filter((className) => className.startsWith("screen--text-scale-"))
      .forEach((className) => screen.classList.remove(className))
    screen.classList.add(option.className)

    const runtime = frame.contentWindow
    if (typeof runtime?.executeTerminalize === "function") {
      runtime.executeTerminalize()
    } else if (typeof runtime?.terminalize === "function") {
      runtime.terminalize()
    }

    this.dispatch("change", { detail: option })
  }
}
