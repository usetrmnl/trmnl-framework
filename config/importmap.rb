# Docs harness JS: Turbo + Stimulus controllers + the framework runtime modules
# (plugin-render pins match core's).
#
# Pin with logical asset names (not absolute Pathnames). Absolute `to:` paths
# leak into the browser as /Volumes/... URLs and 404. Engine.app/javascript is
# already on the asset load path (see Framework::Engine).
#
# pin_all_from still needs an absolute directory so it resolves against the gem
# when Rails.root is the docs server host.
#
# Everything the docs boot for themselves lives under framework_docs/. A host draws its
# own importmap after the engine's, and `expand_directories_into` lets the later write
# win, so bare names (application, controllers/*, lib/*, command_palette/*) were all
# answerable by the host: on core the docs ran core's Stimulus controllers, including a
# fork of the screen picker that predates the Style and Text Scale sections. The prefix
# is the whole fix, and it costs nothing at the markup layer: stimulus-loading builds a
# module path out of the `under` it is given, so `data-controller="fancy-screen-picker"`
# still resolves, now to framework_docs/controllers/fancy_screen_picker_controller.
#
# plugin-render/*, plugin_legacy and framework_iframe_bridge deliberately stay bare:
# those names match core's, which is the point of them.

engine_js = Framework::Engine.root.join("app/javascript")

pin "framework_docs/application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from engine_js.join("framework_docs/controllers"), under: "framework_docs/controllers"

# Reached only through a controller, and controllers/index.js loads those lazily, so
# preloading these on every page downloads the palette's dependencies for readers who
# never open it. They arrive with the controller that imports them.
pin_all_from engine_js.join("framework_docs/command_palette"), under: "framework_docs/command_palette", preload: false
pin_all_from engine_js.join("framework_docs/lib"), under: "framework_docs/lib", preload: false

# The one lib module the entrypoint imports itself, so it stays on the critical path.
pin "framework_docs/lib/screen_class_sync",
    to: "framework_docs/lib/screen_class_sync.js",
    preload: "framework_docs/application"

# The screen-picker web component, same published package core uses.
pin "@trmnl/picker", to: "https://unpkg.com/@trmnl/picker@0.2.0/dist/trmnl-picker.esm.js", preload: false

pin "plugin-render/plugins", to: "plugin-render/plugins.js", preload: false
pin "plugin-render/dithering", to: "plugin-render/dithering.js", preload: false
pin "plugin-render/asset-deduplication", to: "plugin-render/asset-deduplication.js", preload: false
pin "plugin_legacy", to: "plugin_legacy.js", preload: false
pin "framework_iframe_bridge", to: "framework_iframe_bridge.js", preload: false
