import { Controller } from "@hotwired/stimulus"

// Collapses long Related Tokens tables to a preview height. The toggle button
// reveals the full table and collapses it back; both labels arrive as data
// values so the controller only swaps classes and text.
export default class extends Controller {
  static targets = ["frame", "fade", "toggle"]
  static values = { showLabel: String, hideLabel: String }

  toggle() {
    const expand = this.frameTarget.classList.contains("overflow-hidden")
    this.frameTarget.classList.toggle("overflow-hidden", !expand)
    this.frameTarget.classList.toggle("max-h-[36rem]", !expand)
    this.frameTarget.classList.toggle("[&_th]:static", !expand)
    this.fadeTarget.classList.toggle("hidden", expand)
    this.toggleTarget.textContent = expand ? this.hideLabelValue : this.showLabelValue
  }
}
