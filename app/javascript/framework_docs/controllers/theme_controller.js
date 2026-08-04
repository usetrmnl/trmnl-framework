import { Controller } from "@hotwired/stimulus"

const VALID_THEMES = ["light", "system", "dark"]
const STORAGE_KEY = "theme"

export default class extends Controller {
  connect() {
    this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    this.handleSystemChange = this.handleSystemChange.bind(this)
    this.handleThemeChange = this.handleThemeChange.bind(this)
    this.handleStorageChange = this.handleStorageChange.bind(this)

    this.mediaQuery.addEventListener("change", this.handleSystemChange)
    window.addEventListener("trmnl:theme-change", this.handleThemeChange)
    window.addEventListener("storage", this.handleStorageChange)

    this.applyTheme()
  }

  disconnect() {
    this.mediaQuery.removeEventListener("change", this.handleSystemChange)
    window.removeEventListener("trmnl:theme-change", this.handleThemeChange)
    window.removeEventListener("storage", this.handleStorageChange)
  }

  select(event) {
    const theme = this.normalizedTheme(
      event.currentTarget.value ||
      event.currentTarget.dataset.themePreferenceOption ||
      event.currentTarget.dataset.fwThemeOption
    )

    if (window.__setThemePreference) {
      window.__setThemePreference(theme)
    } else {
      this.writePreference(theme)
      this.applyTheme()
    }

    this.closeFrameworkThemeMenus()
  }

  applyTheme() {
    const preference = window.__applyPageTheme ?
      window.__applyPageTheme(this.pageTheme) :
      this.applyThemeFallback()

    this.syncControls(preference)
  }

  handleSystemChange() {
    if (this.currentPreference() === "system") this.applyTheme()
  }

  handleThemeChange(event) {
    this.syncControls(this.normalizedTheme(event.detail?.preference))
  }

  handleStorageChange(event) {
    if (event.key === STORAGE_KEY) this.applyTheme()
  }

  applyThemeFallback() {
    const preference = this.currentPreference()

    if (preference === "dark") {
      document.documentElement.classList.add("dark")
    } else if (preference === "light") {
      document.documentElement.classList.remove("dark")
    } else {
      document.documentElement.classList.toggle("dark", this.mediaQuery.matches)
    }

    document.documentElement.dataset.themePreference = preference
    return preference
  }

  syncControls(preference = this.currentPreference()) {
    preference = this.normalizedTheme(preference)
    document.documentElement.dataset.themePreference = preference

    document.querySelectorAll("[data-theme-preference-input]").forEach((input) => {
      input.checked = input.value === preference
    })

    document.querySelectorAll("[data-theme-preference-control]").forEach((control) => {
      control.dataset.themePreferenceCurrent = preference
    })

    document.querySelectorAll("[data-theme-preference-option], [data-fw-theme-option]").forEach((option) => {
      const optionTheme = this.normalizedTheme(option.dataset.themePreferenceOption || option.dataset.fwThemeOption)
      const active = optionTheme === preference
      option.setAttribute("aria-pressed", String(active))

      option.querySelectorAll("[data-theme-preference-check]").forEach((check) => {
        check.classList.toggle("invisible", !active)
      })
    })
  }

  currentPreference() {
    if (window.__themePreference) return this.normalizedTheme(window.__themePreference())

    try {
      return this.normalizedTheme(window.localStorage.getItem(STORAGE_KEY))
    } catch (error) {
      return this.normalizedTheme(document.documentElement.dataset.themePreference)
    }
  }

  writePreference(theme) {
    try { window.localStorage.setItem(STORAGE_KEY, theme) } catch (error) {}
    document.cookie = "theme=;path=/;max-age=0;samesite=lax"
    document.cookie = "tour_theme=;path=/tour;max-age=0;samesite=lax"
  }

  normalizedTheme(theme) {
    return VALID_THEMES.includes(theme) ? theme : "system"
  }

  closeFrameworkThemeMenus() {
    document.querySelectorAll("#fw-theme-menu").forEach((menu) => {
      menu.hidden = true
    })
  }

  get pageTheme() {
    return document.body?.dataset.pageTheme || this.element.dataset.pageTheme || "system"
  }
}
