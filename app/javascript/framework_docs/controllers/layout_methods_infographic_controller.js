import { Controller } from "@hotwired/stimulus"

// Drives the Grid -> Flex -> Columns infographic at the top of the Layout page.
// Every position is already in the partial's stylesheet, keyed off one state class
// on the root; this only picks which one is on and which tab reads as selected.
//
// .stagger-items rides along on the two transitions where items appear or disappear
// (Flex -> Columns and Columns -> Grid), so those land one item at a time instead of
// all twelve at once.
const STATES = ["state-grid", "state-flex", "state-columns"]
const STAGGERED_TRANSITIONS = new Set(["state-flex>state-columns", "state-columns>state-grid"])

export default class extends Controller {
  static targets = ["indicator"]

  static values = {
    autoPlayDuration: { type: Number, default: 4500 }
  }

  connect() {
    this.index = Math.max(STATES.indexOf(this.currentState()), 0)
    this.render()
    this.startAutoPlay()
  }

  disconnect() {
    this.stopAutoPlay()
  }

  goTo(event) {
    const index = Number.parseInt(event.currentTarget.dataset.index, 10)
    if (!Number.isFinite(index) || index < 0 || index >= STATES.length) return

    // A click is a choice, so the timer restarts from it rather than advancing on
    // whatever was left of the previous interval.
    this.setIndex(index)
    this.startAutoPlay()
  }

  setIndex(index) {
    if (index === this.index) return

    const from = STATES[this.index]
    const to = STATES[index]
    this.index = index
    this.element.classList.toggle("stagger-items", STAGGERED_TRANSITIONS.has(`${from}>${to}`))
    this.render()
  }

  render() {
    STATES.forEach((state, index) => {
      this.element.classList.toggle(state, index === this.index)
    })

    this.indicatorTargets.forEach((indicator, index) => {
      indicator.setAttribute("aria-selected", String(index === this.index))
    })
  }

  startAutoPlay() {
    this.stopAutoPlay()
    if (this.autoPlayDurationValue <= 0) return

    this.autoPlayTimer = window.setInterval(() => {
      this.setIndex((this.index + 1) % STATES.length)
    }, this.autoPlayDurationValue)
  }

  stopAutoPlay() {
    if (!this.autoPlayTimer) return

    window.clearInterval(this.autoPlayTimer)
    this.autoPlayTimer = null
  }

  currentState() {
    return STATES.find((state) => this.element.classList.contains(state)) || STATES[0]
  }
}
