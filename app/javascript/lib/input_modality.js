export function isTouchEnabled() {
  const touchPoints = navigator.maxTouchPoints || navigator.msMaxTouchPoints || 0
  if (touchPoints > 0) return true

  return window.matchMedia?.("(any-pointer: coarse)")?.matches || false
}

export function inputModality() {
  return isTouchEnabled() ? "touch" : "pointer"
}

export function syncInputModality(root = document.documentElement) {
  const modality = inputModality()

  root.dataset.inputModality = modality
  root.classList.toggle("has-touch", modality === "touch")
  root.classList.toggle("no-touch", modality !== "touch")

  return modality
}
