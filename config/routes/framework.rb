framework_v1_components = %w[background image border view layout title_bar columns grid title description
                             label value table chart item gap clamp overflow format_value fit_value content_limiter flex size text spacing mashup pixel_perfect rich_text text_stroke image_stroke]
framework_v2_components = %w[v2_overview upgrade_guide enhancement_guide troubleshooting_guide trmnl_x_guide]
framework_v3_components = %w[structure screen background image border rounded outline view layout title_bar columns grid title description
                             label value table table_overflow chart map item progress gap clamp overflow format_value fit_value content_limiter flex size responsive text_size text_scale font_weight font_family font_glyphs text_color text_alignment spacing mashup pixel_perfect rich_text text_stroke image_stroke visibility divider scale aspect_ratio responsive_test framework_runtime
                             v3_overview v3_upgrade_guide v3_enhancement_guide open_source contributing colors color_palettes tokens themes paint_api paint_colors paint_charts paint_maps paint_borders paint_typography sass_api sass_build sass_devices sass_mixins theme_authoring theme_slots variables_api inverse
                             devices rendering_modes]
framework_docs_components = (framework_v1_components + framework_v2_components + framework_v3_components).uniq

# One source of truth for the docs versions: FrameworkController. Route drawing runs
# under the autoloader, so the constants resolve here, and a version bump moves every
# redirect and every `defaults:` with them. Guarded by
# spec/requests/framework_docs_routing_spec.rb.
current_docs_version = FrameworkController::CURRENT_DOCS_VERSION
supported_docs_versions = FrameworkController::SUPPORTED_DOCS_VERSIONS
legacy_framework_docs_versions = FrameworkController::LEGACY_DOCS_VERSION_ALIASES
framework_docs_version_constraint = Regexp.union(supported_docs_versions)
v3_docs_version_constraint = Regexp.union(supported_docs_versions.grep(/\A3\./))
legacy_v1_docs_version = legacy_framework_docs_versions.fetch('v1')

# The fixture pages the Playwright suites drive, plus the runtime bundle one of them
# links. Development and test only: they are this repo's own harness, and every host
# that mounts the engine was inheriting all ten of them.
draw_test_harness = Rails.env.local?

# Backward-compatible redirects for old v1 URLs
scope :framework_legacy do
  get '/', to: redirect("/framework/docs/#{legacy_v1_docs_version}"), as: :framework_legacy

  framework_v1_components.each do |component|
    get "/#{component}", to: redirect("/framework/docs/#{legacy_v1_docs_version}/#{component}"), as: "framework_legacy_#{component}"
  end
end

scope :framework do
  get '/', to: 'framework#index', as: :framework

  if draw_test_harness
    scope :test do
      get "/overflow", to: 'framework_tests#overflow', as: :framework_test_overflow
      get "/fonts", to: 'framework_tests#fonts', as: :framework_test_fonts
      get "/font_bundles", to: 'framework_tests#font_bundles', as: :framework_test_font_bundles
      get "/runtime", to: 'framework_tests#runtime', as: :framework_test_runtime, format: false
      get "/responsive_variants", to: 'framework_tests#responsive_variants', as: :framework_test_responsive_variants, format: false
      get "/visual/paint", to: 'framework_tests#visual_paint', as: :framework_test_visual_paint, format: false
      get "/visual/borders", to: 'framework_tests#visual_borders', as: :framework_test_visual_borders, format: false
      get "/visual/components", to: 'framework_tests#visual_components', as: :framework_test_visual_components, format: false
      get "/visual/compositions", to: 'framework_tests#visual_compositions', as: :framework_test_visual_compositions, format: false
      get "/visual/responsive", to: 'framework_tests#visual_responsive', as: :framework_test_visual_responsive, format: false
    end
  end

  # Docs routes under /framework/docs/:version/:page
  scope :docs do
    get '/', to: redirect("/framework/docs/#{current_docs_version}")

    # Compatibility redirects for older non-versioned docs URLs
    framework_docs_components.each do |component|
      get "/#{component}", to: redirect("/framework/docs/#{current_docs_version}/#{component}"), as: "framework_docs_#{component}_redirect"
    end

    legacy_framework_docs_versions.each do |legacy_version, canonical_version|
      get "/#{legacy_version}", to: redirect("/framework/docs/#{canonical_version}")
      get "/#{legacy_version}/example_iframe_config", to: redirect("/framework/docs/#{canonical_version}/example_iframe_config")

      framework_docs_components.each do |component|
        canonical_component = legacy_version == 'v3' && component == 'text' ? 'text_color' : component
        get "/#{legacy_version}/#{component}", to: redirect("/framework/docs/#{canonical_version}/#{canonical_component}"), as: "framework_docs_alias_#{legacy_version}_#{component}_redirect"
      end
    end

    get '/:version', to: 'framework#docs_index', as: :framework_docs_index, constraints: { version: framework_docs_version_constraint }, defaults: { version: current_docs_version }, format: false

    get '/:version/text', to: redirect('/framework/docs/%{version}/text_color'), constraints: { version: v3_docs_version_constraint }

    get '/:version/example_iframe_config', to: 'framework#example_iframe_config', constraints: { version: framework_docs_version_constraint }, defaults: { version: current_docs_version }, as: :framework_docs_example_iframe_config, format: false

    framework_docs_components.each do |component|
      get "/:version/#{component}", to: "framework##{component}", as: "framework_docs_#{component}", constraints: { version: framework_docs_version_constraint }, defaults: { version: current_docs_version }, format: false
    end

    # Aliases for page names that were never components. `text` is not one of them: it
    # is in the component list above, so the loop already claims /docs/text and any
    # entry here can only be shadowed by it.
    get "/font_utilities", to: redirect("/framework/docs/text_size")
    get "/glyphs", to: redirect("/framework/docs/font_glyphs")
  end

  # Legacy redirects: /framework/:page -> current docs page
  framework_docs_components.each do |component|
    get "/#{component}", to: redirect("/framework/docs/#{current_docs_version}/#{component}"), as: "framework_#{component}_redirect"
  end

  get "/font_utilities", to: redirect("/framework/docs/text_size")
  get "/glyphs", to: redirect("/framework/docs/font_glyphs")

  # Examples routes
  scope :examples do
    get '/', to: 'framework#examples_index', as: :framework_examples_index
    get "/:id", to: "framework#layout_example_show", as: :framework_example_show
  end

  # Releases routes
  scope :releases do
    get '/', to: 'framework#releases_index', as: :framework_releases_index
  end

  # Legacy layout examples route
  get "/layout_examples", to: "framework#layout_examples", as: :framework_layout_examples
end

get '/framework_v2', to: redirect("/framework/docs/#{current_docs_version}")

# The runtime fixture links this exact path, and the Playwright suites fulfill it with
# whichever runtime variant a run is measuring. Nothing answered it otherwise, so the
# page 404'd its only script for anyone who opened it by hand.
if draw_test_harness
  get "/__runtime-test__/plugins.js", to: 'framework_tests#runtime_bundle', format: false
end
