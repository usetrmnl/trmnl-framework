# Docs harness JS: Turbo + Stimulus controllers + the framework runtime modules
# (plugin-render pins match core's).
#
# Pin with logical asset names (not absolute Pathnames). Absolute `to:` paths
# leak into the browser as /Volumes/... URLs and 404. Engine.app/javascript is
# already on the asset load path (see Framework::Engine).
#
# pin_all_from still needs an absolute directory so it resolves against the gem
# when Rails.root is the docs server host.

engine_js = Framework::Engine.root.join("app/javascript")

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from engine_js.join("controllers"), under: "controllers"

# Reached only through a controller, and controllers/index.js loads those lazily, so
# preloading these on every page downloads the palette's dependencies for readers who
# never open it. They arrive with the controller that imports them.
pin_all_from engine_js.join("command_palette"), under: "command_palette", preload: false
pin_all_from engine_js.join("lib"), under: "lib", preload: false

# The one lib module the entrypoint imports itself, so it stays on the critical path.
pin "lib/screen_class_sync", to: "lib/screen_class_sync.js", preload: "application"

# The screen-picker web component, same published package core uses.
pin "@trmnl/picker", to: "https://unpkg.com/@trmnl/picker@0.2.0/dist/trmnl-picker.esm.js", preload: false

pin "plugin-render/plugins", to: "plugin-render/plugins.js", preload: false
pin "plugin-render/dithering", to: "plugin-render/dithering.js", preload: false
pin "plugin-render/asset-deduplication", to: "plugin-render/asset-deduplication.js", preload: false
pin "plugin_legacy", to: "plugin_legacy.js", preload: false
pin "framework_iframe_bridge", to: "framework_iframe_bridge.js", preload: false
