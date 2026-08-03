// Docs server entrypoint: Turbo + Stimulus controllers. The framework runtime
// (plugin-render/plugins.js) is loaded separately by the framework layout / example iframes.
import "@hotwired/turbo-rails"
import "controllers"
// Side-effect import: defines window.TRMNLScreenClassSync for the screen
// picker, and for the layout's inline class-sync fallback (which cannot
// import modules).
import "lib/screen_class_sync"
