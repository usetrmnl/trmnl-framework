# rubocop:disable Metrics/ModuleLength
module FrameworkHelper
  include FrameworkDemoHelper

  PAGE_TITLES = {
    'structure' => 'Structure',
    'screen' => 'Screen',
    'devices' => 'Devices',
    'rendering_modes' => 'Rendering Modes',
    'background' => 'Background',
    'colors' => 'Colors',
    'color_palettes' => 'Color Palettes',
    'tokens' => 'Tokens',
    'themes' => 'Themes',
    'paint_api' => 'Paint API',
    'paint_colors' => 'Painting Colors',
    'paint_charts' => 'Painting Charts',
    'paint_maps' => 'Painting Maps',
    'paint_borders' => 'Painting Borders',
    'paint_typography' => 'Painting Typography',
    'sass_api' => 'Sass API',
    'sass_build' => 'Compiling the Framework',
    'sass_devices' => 'Custom Devices',
    'sass_mixins' => 'Sass Mixins',
    'theme_authoring' => 'Authoring Themes',
    'theme_slots' => 'Theme Slots',
    'variables_api' => 'CSS Variables',
    'border' => 'Border',
    'spacing' => 'Spacing',
    'gap' => 'Gap',
    'size' => 'Size',
    'image' => 'Image',
    'view' => 'View',
    'layout' => 'Layout',
    'title_bar' => 'Title Bar',
    'columns' => 'Columns',
    'grid' => 'Grid',
    'flex' => 'Flex',
    'text' => 'Text',
    'text_size' => 'Text Size',
    'text_scale' => 'Text Scale',
    'font_weight' => 'Font Weight',
    'font_family' => 'Font Family',
    'font_glyphs' => 'Font Glyphs',
    'text_color' => 'Text Color',
    'text_alignment' => 'Text Alignment',
    'rich_text' => 'Rich Text',
    'title' => 'Title',
    'description' => 'Description',
    'label' => 'Label',
    'value' => 'Value',
    'clamp' => 'Clamp',
    'item' => 'Item',
    'table' => 'Table',
    'table_overflow' => 'Table Overflow',
    'chart' => 'Chart',
    'map' => 'Map',
    'overflow' => 'Overflow',
    'format_value' => 'Format Value',
    'fit_value' => 'Fit Value',
    'content_limiter' => 'Content Limiter',
    'mashup' => 'Mashup',
    'pixel_perfect' => 'Pixel Perfect',
    'text_stroke' => 'Text Stroke',
    'image_stroke' => 'Image Stroke',
    'visibility' => 'Visibility',
    'responsive' => 'Responsive',
    'responsive_test' => 'Responsive Test',
    'rounded' => 'Rounded',
    'outline' => 'Outline',
    'divider' => 'Divider',
    'progress' => 'Progress',
    'scale' => 'Scale',
    'inverse' => 'Inverse',
    'aspect_ratio' => 'Aspect Ratio',
    'framework_runtime' => 'Framework Runtime',
    'v2_overview' => 'V2 Overview',
    'upgrade_guide' => 'V2 Upgrade Guide',
    'enhancement_guide' => 'V2 Enhancement Guide',
    'troubleshooting_guide' => 'V2 Troubleshooting',
    'trmnl_x_guide' => 'TRMNL X Guide',
    'v3_overview' => 'V3.3 Overview',
    'v3_upgrade_guide' => 'V3.3 Upgrade Guide',
    'v3_enhancement_guide' => 'V3.3 Enhancement Guide',
    'open_source' => 'Open Source',
    'contributing' => 'Contributing',
    'layout_examples' => 'Layout Examples'
  }.freeze

  # The frozen 3.0/3.1 tracks keep the guide titles and descriptions they
  # shipped with; the shared keys above are retitled for the 3.2 track.
  LEGACY_V3_DOCS_VERSIONS = %w[3.0 3.1].freeze

  LEGACY_V3_GUIDE_PAGE_TITLES = {
    'v3_overview' => 'V3 Overview',
    'v3_upgrade_guide' => 'V3 Upgrade Guide',
    'v3_enhancement_guide' => 'V3 Enhancement Guide'
  }.freeze

  LEGACY_V3_GUIDE_PAGE_DESCRIPTIONS = {
    'v3_overview' => "What's new in Framework v3: color palette, semantic colors, extended grayscale, and CSS variable architecture",
    'v3_upgrade_guide' => 'Steps to upgrade your plugins from Framework v2 to v3',
    'v3_enhancement_guide' => 'Use chromatic colors, semantic roles, and label variants in your plugins'
  }.freeze

  PAGE_DESCRIPTIONS = {
    'structure' => 'The framework\'s exact div hierarchy and how Screen, View, Layout, Title Bar, Columns, and Mashup work together',
    'screen' => 'Device screen dimensions, orientation, and display properties',
    'devices' => 'Device profiles: the geometry, size, and density a screen--{keyname} class carries, and how to rate a panel of your own',
    'rendering_modes' => 'The grayscale tiers and color modes a screen can carry, what each one paints, and the depth it publishes to the runtime',
    'background' => 'Apply color tokens as backgrounds with bg--{token}',
    'colors' => 'Complete palette definition: grayscale, chromatic hues, and semantic roles',
    'color_palettes' => 'Every palette a screen can carry: grayscale tiers, limited ink sets, and full color, with the class each one maps to',
    'tokens' => 'Complete CSS variable reference with root defaults, density, and bit-depth overrides',
    'themes' => 'Opt-in stylesheets that re-theme screens while preserving device-capability rendering',
    'paint_api' => 'TRMNLPaint: read the live CSS cascade from JavaScript to resolve framework colors and tile patterns',
    'paint_colors' => 'Resolve background, text, stroke, and semantic tokens from JavaScript as canonical Fill objects',
    'paint_charts' => 'Chart series colors from the framework ramp, with Highcharts adapters',
    'paint_maps' => 'Map slot colors from the framework paint, with MapLibre GL JS adapters',
    'paint_borders' => 'Read border rails as BorderFill objects for custom rails and Highcharts axes',
    'paint_typography' => 'Read text roles as TypeSpec objects for custom text and chart labels',
    'sass_api' => 'The framework SCSS source: architecture, cascade layers, and what a custom stack can build from it',
    'sass_build' => 'Compile plugins.css and the theme stylesheets from source with Dart Sass',
    'sass_devices' => 'Device profiles and the $custom-devices configuration for custom builds',
    'sass_mixins' => 'Screen-targeting mixins and scale functions for authoring device-aware SCSS',
    'theme_authoring' => 'The theme contract and workflow: boilerplate, slot mapping, registration, and linting',
    'theme_slots' => 'Every themable surface: semantic channels, component slots, utility remaps, border lines, and the chart ramp',
    'variables_api' => 'The CSS variable contract: which families are public, which are internal, and who reads, re-points, and generates them',
    'border' => 'Apply border patterns that create the illusion of different border intensities',
    'spacing' => 'Control element spacing with fixed margin and padding values',
    'gap' => 'Set precise spacing between elements with predefined gap values',
    'size' => 'Define exact width and height dimensions for elements',
    'image' => 'Optimize images using dithering techniques for 1-bit rendering',
    'view' => 'Show your plugin in different sizes with Mashup view containers',
    'layout' => 'Primary container for organizing plugin content',
    'title_bar' => 'Standardized title bar with plugin information and instance details',
    'columns' => 'Implement zero-config column layouts for content organization',
    'grid' => 'Create grid layouts with predefined column structures',
    'flex' => 'Arrange elements with flexible layouts and alignment options',
    'text' => 'Control text color, alignment and formatting',
    'text_size' => 'Control text size with utility classes across all display types',
    'text_scale' => 'Scale all framework typography independently of interface geometry',
    'font_weight' => 'Toggle between regular and bold font weight independently of size',
    'font_family' => 'Switch between Classic and TRMNL font bundles per device',
    'font_glyphs' => 'Browse every glyph available in each Framework font bundle',
    'text_color' => 'Apply grayscale and chromatic color shades to text elements',
    'text_alignment' => 'Control text alignment with responsive breakpoint, orientation, and bit-depth variants',
    'rich_text' => 'Display formatted paragraphs with alignment and size variants',
    'title' => 'Style headings with consistent typography',
    'description' => 'Format descriptive text with standardized styles',
    'label' => 'Create clear labels for unified content identification',
    'value' => 'Display data values with consistent formatting',
    'clamp' => 'Manage text overflow with single and multi-line truncation',
    'item' => 'Build standardized list items and content blocks',
    'table' => 'Create data tables optimized for 1-bit rendering',
    'table_overflow' => 'Handle table rows overflow',
    'chart' => 'Visualize data optimized for 1-bit rendering',
    'map' => 'Plot locations and routes on a vector map painted for 1-bit and color screens',
    'overflow' => 'Handle column items overflow',
    'format_value' => 'Format numbers and values with consistent styling',
    'fit_value' => 'Automatically resize numbers and values to fit within their containers',
    'content_limiter' => 'Change font size when content overflows to fit within the container',
    'mashup' => 'Assemble multiple plugin views into a single interface',
    'pixel_perfect' => 'Ensure text renders with crisp edges by aligning to the pixel grid',
    'text_stroke' => 'Legible text when displayed on shaded backgrounds',
    'image_stroke' => 'Legible images when displayed on shaded backgrounds',
    'visibility' => 'Control element visibility based on display bit depth',
    'responsive' => "Adapt styles to the device's size class, orientation, and bit depth using variant prefixes",
    'responsive_test' => 'Test responsive utilities and compare SCSS mixins with CSS classes',
    'rounded' => 'Control element rounding with predefined values',
    'outline' => 'Pixel-perfect dotted rounded borders drawn with CSS gradients on 1-bit displays',
    'divider' => 'Create horizontal or vertical dividers between elements',
    'progress' => 'Display progress bars in different styles',
    'scale' => 'Scale interface to affect content density and readability',
    'inverse' => 'Apply inverse framework colors to an element and its descendants',
    'aspect_ratio' => 'Maintain consistent proportions for elements regardless of their content',
    'framework_runtime' => 'How the runtime applies layout, clamping, overflow, and presentation adjustments at render time',
    'v2_overview' => "What's new in Framework v2: utilities, components, and guides",
    'upgrade_guide' => 'Steps to upgrade your plugins to Framework v2',
    'enhancement_guide' => 'Device, bit-depth, and orientation-responsive patterns for plugins',
    'troubleshooting_guide' => "Resolve issues surfaced by v2's stricter markup requirements",
    'trmnl_x_guide' => 'Framework changes for TRMNL X compatibility',
    'v3_overview' => "What's new in Framework 3.3: themes, the TRMNLPaint JS API, adaptive charts, maps and icons, and theme-driven borders",
    'v3_upgrade_guide' => 'Compatibility notes for upgrading plugins to Framework 3.3',
    'v3_enhancement_guide' => 'Make your plugin theme-ready and adopt adaptive charts, icons, and JS paint',
    'open_source' => 'What this repository is, how it fits together, and the paint mandate that shapes it',
    'contributing' => 'Run the framework locally, find your way around, run the tests, and open a good pull request'
  }.freeze

  TOKEN_ROOT_VARIABLES_PATH = Framework::Engine.root.join('app/assets/stylesheets/framework/config/_variables_root.scss').freeze
  TOKEN_OVERRIDE_VARIABLES_PATH = Framework::Engine.root.join('app/assets/stylesheets/framework/config/_variables_overrides.scss').freeze

  TOKEN_SIZE_VARIANTS = %w[xxsmall xsmall small large xlarge xxlarge xxxlarge mega giga tera peta].freeze

  TOKEN_VARIANT_CATEGORIES = %i[title_bar label description title value rich_text table item progress palette].freeze

  TOKEN_HIDDEN_CATEGORIES = %i[framework_roles].freeze

  TEXT_SCALE_TOKENS = %w[--modifier-text-scale --text-ui-scale].freeze
  COMPOSED_SCALE_TOKENS = %w[--device-ui-scale --modifier-scale].freeze

  PALETTE_GROUP_ORDER = ['Semantic', 'Grayscale', 'Legacy Grayscale'].freeze

  TOKEN_CATEGORY_PREFIXES = {
    layout: %w[--screen- --full- --quadrant- --half_ --pixel-ratio --dither-pixel-ratio --device-name --color-depth],
    spacing: %w[--gap --gap- --list-gap-],
    scaling: %w[--device-ui-scale --modifier-scale --ui-scale --content-scale --modifier-text-scale --text-ui-scale --gap-scale],
    rounded: %w[--rounded --rounded-],
    palette: %w[--black --white --gray- --color-],
    framework_roles: %w[--framework-],
    title_bar: %w[--title-bar-],
    label: %w[--label-],
    description: %w[--description-],
    title: %w[--title-],
    value: %w[--value-],
    rich_text: %w[--richtext-],
    table: %w[--table-],
    item: %w[--item-],
    progress: %w[--progress-]
  }.freeze

  # Pages appear here only when the prefixed variables genuinely program them.
  # The paint utilities (background, text color, border) are absent on purpose:
  # they render through engine-owned --bg-*/--text-*/--border-* variables that
  # live outside the parsed token files, and tabulating the palette hexes there
  # misrepresented how those systems render per mode.
  DOC_PAGE_TOKEN_PREFIXES = {
    'screen' => %w[--screen- --full- --quadrant- --half_ --pixel-ratio --dither-pixel-ratio --color-depth --device-name --device-ui-scale --modifier-scale --ui-scale --content-scale --modifier-text-scale --text-ui-scale --gap-scale],
    'colors' => %w[--black --white --gray- --color-],
    'rounded' => %w[--rounded- --title-bar-border-radius --progress-bar-radius],
    'outline' => %w[--rounded-],
    'title_bar' => %w[--title-bar-],
    'title' => %w[--title-],
    'description' => %w[--description-],
    'label' => %w[--label-],
    'value' => %w[--value-],
    'table' => %w[--table-],
    'table_overflow' => %w[--table-],
    'item' => %w[--item-],
    'progress' => %w[--progress-],
    'gap' => %w[--gap- --list-gap-],
    'spacing' => %w[--gap- --list-gap-],
    'scale' => %w[--device-ui-scale --modifier-scale --ui-scale --content-scale --gap-scale --gap- --list-gap-],
    'text_scale' => %w[--device-ui-scale --modifier-scale --ui-scale --content-scale --modifier-text-scale --text-ui-scale],
    'rich_text' => %w[--richtext-],
    'framework_runtime' => %w[--full- --quadrant- --half_ --screen- --device-ui-scale --modifier-scale --ui-scale --content-scale --modifier-text-scale --text-ui-scale --gap-scale]
  }.freeze

  # Curated cross-references between docs pages and the API surfaces that
  # program them. Forward, the Related APIs rail (_related_apis.html.erb)
  # renders one authored excerpt per ref from a shared partial in
  # app/views/framework/related_apis/, parameterized by locals. inline: true
  # marks a cross-over the page already covers with its own authored prose; it
  # renders nothing forward but still feeds the derived "Where This Applies"
  # section on the target page. Kept honest by
  # spec/helpers/framework_api_refs_spec.rb.
  DOC_PAGE_API_REFS = {
    'background' => [
      { page: :paint_colors, partial: 'paint_colors',
        locals: { heading: 'Reading background paint from JavaScript', resolver: 'bg', utility: 'bg--{token}',
                  example: 'var fill = TRMNLPaint.bg("gray-30", { el: "my-node" });' } }
    ],
    'text_color' => [
      { page: :paint_colors, partial: 'paint_colors',
        locals: { heading: 'Reading text paint from JavaScript', resolver: 'text', utility: 'text--{token}',
                  example: 'var fill = TRMNLPaint.text("gray-45", { el: "my-node" });' } }
    ],
    'colors' => [
      { page: :paint_colors, partial: 'paint_colors',
        locals: { heading: 'Reading the palette from JavaScript', resolver: 'bg', utility: 'bg--{token}',
                  example: 'var fill = TRMNLPaint.bg("red-55", { el: "my-chart" });' } },
      { page: :theme_slots, partial: 'theme_slots_utility_remaps' }
    ],
    'tokens' => [
      { page: :paint_api, partial: 'paint_api_css_var' },
      { page: :theme_authoring, partial: 'theme_authoring_variables' },
      { page: :sass_api, partial: 'sass_api_variables' }
    ],
    'screen' => [
      { page: :sass_devices, partial: 'sass_devices' }
    ],
    'devices' => [
      { page: :sass_devices, partial: 'sass_devices' }
    ],
    'rendering_modes' => [
      { page: :paint_api, partial: 'paint_api_css_var' },
      { page: :paint_charts, inline: true }
    ],
    'scale' => [
      { page: :paint_api, partial: 'paint_api_scale',
        locals: { kind: 'ui', example: 'var inset = TRMNLPaint.px(6, { el: "my-chart", kind: "ui" });' } }
    ],
    'text_scale' => [
      { page: :paint_api, partial: 'paint_api_scale',
        locals: { kind: 'text', example: 'var fontSize = TRMNLPaint.px(16, { el: "my-chart", kind: "text" });' } }
    ],
    'border' => [
      { page: :theme_slots, inline: true },
      { page: :paint_borders, inline: true }
    ],
    'title_bar' => [
      { page: :theme_slots, partial: 'theme_slots',
        locals: { component: 'title bar', slots: %w[title-bar],
                  example: '@include theme-slots.bg-slot("title-bar", "yellow-40");' } }
    ],
    'label' => [
      { page: :theme_slots, partial: 'theme_slots',
        locals: { component: 'label', slots: %w[label-gray label-underline],
                  example: '@include theme-slots.border-token-slot("label-underline", "yellow-30");' } }
    ],
    'item' => [
      { page: :theme_slots, partial: 'theme_slots',
        locals: { component: 'item', slots: %w[item-meta item-meta-emphasis-2 item-meta-emphasis-3],
                  example: '@include theme-slots.text-slot("item-meta", "black");' } }
    ],
    'table' => [
      { page: :theme_slots, partial: 'theme_slots',
        locals: { component: 'table', slots: %w[table-meta table-meta-device table-head-row table-body-row],
                  example: '@include theme-slots.bg-slot("table-meta", "yellow-55");' } }
    ],
    'progress' => [
      { page: :theme_slots, partial: 'theme_slots',
        locals: { component: 'progress bar',
                  slots: %w[progress-track progress-fill progress-dot progress-dot-current],
                  example: '@include theme-slots.bg-slot("progress-fill", "yellow-55");' } }
    ],
    'image' => [
      { page: :themes, partial: 'themes_adaptive_icons' }
    ],
    'chart' => [
      { page: :paint_charts, inline: true }
    ],
    'map' => [
      { page: :paint_maps, inline: true }
    ],
    'responsive' => [
      { page: :sass_mixins, partial: 'sass_mixins' }
    ],
    'framework_runtime' => [
      { page: :paint_api, partial: 'paint_api_runtime' }
    ]
  }.freeze

  # Centralized intro paragraphs for each docs page
  # rubocop:disable Metrics/MethodLength
  def framework_intro_paragraphs
    @framework_intro_paragraphs ||= {
      'structure' => 'Screen, View, Layout, Title Bar, Columns, and Mashup form the fixed hierarchy that defines the display environment. Plugins render their content inside Views. Follow the exact div setup; deviating causes layout and rendering issues.',
      'screen' => 'The Screen component is the outermost container that defines the device dimensions and provides global settings for your content.',
      'devices' => 'A device profile is what the framework knows about one panel: its dimensions, pixel ratio, interface scale, size class, and density tier. Each profile compiles into a screen--{keyname} class, so a screen states its device in one class. The platform exports the registry these profiles come from, and the framework ships the synced map.',
      'rendering_modes' => 'A rendering mode is the class that tells a screen what its panel can print. Three grayscale tiers cover the panels with no color, one class per palette covers the color panels, and the mode class publishes its own paint depth for the JavaScript runtime to read.',
      'colors' => 'The Colors system defines the complete palette for the framework: grayscale, chromatic hues, and semantic roles (primary, success, error, warning). Use these tokens with bg--, text--, and other utilities. See Background and Text Color for usage examples.',
      'color_palettes' => 'A palette tells a screen which inks its panel can print. Four grayscale palettes map onto the bit-depth classes, five limited color palettes dither every framework token down to a fixed ink set, and screen--color-full paints every token at its actual hex on 12-bit and 24-bit displays.',
      'tokens' => "The Tokens reference lists every Framework CSS variable from <code>_variables_root.scss</code> and display overrides in <code>_variables_overrides.scss</code>. Use it to understand defaults, 2-bit visual/layout behavior, high-density typography, and 4-bit-and-up scaling.",
      'themes' => 'Themes are standalone stylesheets that re-point semantic channels, component slots, and utility tokens at different palette tokens. A themed screen still renders through its device mode: dither patterns on 1-bit, palette images on limited color, solids on full color.',
      'paint_api' => 'TRMNLPaint is the framework\'s public JavaScript paint API. It reads the live CSS cascade (bit depth, dark mode, theme, limited palette, and tiles all resolved) and hands back a canonical Fill, so token mappings are never duplicated in JavaScript. Charts and maps are two consumers; any plugin can resolve framework colors from JS for any purpose.',
      'paint_colors' => 'The color resolvers read background, text, stroke, and semantic tokens from the live cascade and return canonical Fill objects. Use them when JavaScript needs the exact paint a CSS utility would produce.',
      'paint_charts' => 'The chart resolvers pick evenly spaced series colors from the framework chart ramp, resolved through the live cascade. Adapters convert the resulting Fills into Highcharts color options.',
      'paint_maps' => 'The map resolvers read the map slots (land, water, roads, parks, buildings, labels) from the live cascade and return canonical Fill objects. Adapters convert them into MapLibre GL JS paint properties, and TRMNLMaps assembles whole styles out of them.',
      'paint_borders' => 'The border resolvers read the framework border rails as BorderFill objects. Apply them to custom rails, or convert them for Highcharts axes and grid lines.',
      'paint_typography' => 'The typography resolver reads a text role or utility class as a TypeSpec: font, size, weight, paint, and optional stroke. Apply it to custom text, or convert it for Highcharts labels.',
      'sass_api' => 'The Sass API is the framework\'s SCSS source, open since 3.2. A custom stack serves either an official released build or its own build compiled from this source; these pages document the build-your-own path. The TRMNL Platform always serves official builds.',
      'sass_build' => 'Compile the framework from source with Dart Sass: one entrypoint, one load path, plus a stylesheet per theme. The result is the same plugins.css the release pipeline produces. You only need a source build when a released one is not enough, for modified source or custom device profiles.',
      'sass_devices' => 'Device profiles drive the compile: each entry in the device map becomes a screen--{name} class with its dimensions, density, and color depth baked in. Configure $custom-devices to add your own profiles without touching framework source.',
      'sass_mixins' => 'The screen mixins generate device-aware rules from the same grammar the responsive utility classes use: size, orientation, and bit depth. The scale functions wrap pixel values so custom CSS scales with the device like framework CSS does.',
      'theme_authoring' => 'A theme maps framework slots to different tokens and never touches the paint pipeline, so a themed screen keeps its device-capability rendering. This page walks the workflow: start from the boilerplate, map your slots, register the id, and lint.',
      'theme_slots' => 'Every surface a theme can re-point, with the mixin that sets it: semantic channels, component slots, utility remaps, border lines, and the chart ramp. Slots take token references, so each one still resolves through the device mode at render time.',
      'variables_api' => 'Every framework CSS variable is either public contract or private implementation. This page states the contract: which families are public, which are internal, and how the Paint API reads them, themes re-point them, and the Sass source generates them.',
      'background' => "Use the color palette defined in #{link_to 'Colors', framework_docs_colors_path, class: 'font-medium hover:underline'}. Apply these shades with bg--{token} for backgrounds. On 1-bit displays, grayscale uses dither patterns; on 2-bit and 4-bit+, solid colors render.",
      'border' => 'Draw a horizontal or vertical rule on any element with the border--h and border--v utilities, named on the same 10 to 75 shade scale as backgrounds. On 1-bit displays a step renders as a dither pattern of black and white pixels, so a rule can read as gray. 4-bit and full-color screens draw all 14 steps; the other rails pair them onto seven levels.',
      'gap' => 'Utility classes for the space between the children of a flex, grid, or column container. Predefined sizes, arbitrary values, distribution modifiers, and responsive variants.',
      'size' => 'Utility classes for width and height. Fixed sizes, arbitrary values, dynamic sizes, and container query units, each also available as a min or max constraint and with responsive variants.',
      'image' => 'Place images on a screen and control their size, object fit, and inversion. On 1-bit displays, dithering arranges black and white pixels so an image still reads as shades of gray.',
      'view' => 'A View holds content (e.g. a plugin instance). Single views use <code>view--full</code> inside the Screen; multiple views go inside a Mashup, where the view modifier sets each view\'s share of space and the Mashup modifier sets the arrangement. View and Layout receive calculated dimensions from the device and orientation.',
      'layout' => 'The Layout is the content container inside a View, exactly one <code>layout</code> per <code>view</code>. It arranges content horizontally (<code>layout--row</code>) or vertically (<code>layout--col</code>), with alignment and stretch modifiers.',
      'title_bar' => 'A header strip for a View, holding an icon, a title, and an optional instance label. Place it as a sibling of the Layout, not inside it.',
      'title' => 'Headings for a plugin screen. Five size variants from small to xxlarge, each with responsive prefixes for breakpoints and orientation.',
      'description' => 'Supporting body text, sized to sit under a Title or a Value rather than compete with it. Four size variants from base to xxlarge, with wrapping or line clamping for longer copy.',
      'label' => 'Short captions and status chips for a plugin screen. Five sizes plus style variants (filled, outline, underline, inverted) and semantic variants such as label--success and label--error.',
      'value' => 'Figures and readouts on a plugin screen. Twelve size variants from xxsmall to peta, plus value--tnums for tabular numbers that keep columns aligned.',
      'table' => 'Tabular data with optional row indexes. Five size variants, and the Overflow and Clamp engines drop rows and truncate cells that do not fit the space available.',
      'table_overflow' => 'When a table has more rows than can fit within the available vertical space, it constrains its height and appends a trailing "and X more" row to indicate the hidden entries.',
      'chart' => 'With careful, minimal styling choices, TRMNL can display a variety of numerical or time centric content as charts and graphs.',
      'map' => 'Maps render OpenStreetMap vector tiles through MapLibre GL JS, with every layer painted by the framework. The plugin runtime bundles TRMNLMaps, which composes the map style from the live screen, so a map adapts to the device, bit depth, dark mode, and themes like the rest of the screen. Maps are plotted, never satellite, and never interactive.',
      'item' => 'A row for lists, schedules, and other repeating content, with optional meta text, an index, or an icon. Stack items in a Layout and let the Overflow engine handle the ones that do not fit.',
      'progress' => 'Progress bars and step dots for completion state. The fill renders as a bitmap pattern on 1-bit displays and as a solid color on 4-bit+ displays.',
      'flex' => 'Utility classes for Flexbox layouts. Row and column directions with alignment, centering, and stretching modifiers.',
      'spacing' => 'Utility classes for margin and padding. Fixed steps plus decimal values for the cases where a whole step is too coarse.',
      'pixel_perfect' => 'Pixel Perfect aligns text to the pixel grid so it renders with crisp edges. It uses pixel fonts designed for specific sizes, so text stays sharp instead of turning blurry or unevenly bold when a layout is converted to 1-bit for ePaper displays.',
      'grid' => 'Utility classes for column-based and row-based grids. Set the column count, span cells across columns, and change either at a breakpoint.',
      'rounded' => 'Utility classes for corner radius. Predefined sizes, per-corner control, and arbitrary pixel values.',
      'outline' => 'The Outline utility draws a pixel-perfect dotted rounded border on any element. On 1-bit displays it places single-pixel dots at exact integer coordinates with pure CSS gradients; on 2-bit and 4-bit displays it falls back to a standard CSS border with border-radius.',
      'aspect_ratio' => 'Hold an element to a fixed width-to-height ratio. The utilities set the native CSS aspect-ratio property, so images, charts, and containers keep their proportions at any screen size.',
      'visibility' => 'Show or hide an element and set its display type. Hidden and visible controls plus display helpers like flex, grid, and inline, each with responsive and bit-depth variants for device-specific layouts.',
      'overflow' => 'The Overflow engine automatically lays out items into up to N columns and adds an "and X more" label when content exceeds the available height. It also applies text clamping per-column width and handles grouped headers without leaving orphaned headings.',
      'format_value' => 'Format numbers so they fit their container and stay readable. Abbreviations (K, M, B), precision that adjusts to the space, and currency values with the symbol in the right place.',
      'fit_value' => 'Fit text to its container by adjusting font size, weight, and line height. Use it where the space available changes between devices, orientations, or view sizes.',
      'mashup' => if current_docs_version == '3.0'
                    'A Mashup arranges multiple plugin views within a single screen. The mashup modifier (e.g. <code>mashup--1Lx1R</code>, <code>mashup--2x2</code>) controls how the views are positioned, while each view\'s own modifier determines how much space it occupies.'
                  else
                    'A Mashup arranges multiple plugin views within a single screen. A fixed mashup modifier (e.g. <code>mashup--1Lx1R</code>, <code>mashup--2x2</code>) positions the views, while each view\'s own modifier sets how much space it occupies. Fluid Mashups use the <code>mashup--3x3</code> layout and cell placement modifiers for custom tilings.'
                  end,
      # 'text' serves the frozen 1.2 and 2.3 tracks, where this page ships as Text.
      # Current-track pages reference 'text_color'.
      'text' => "The Text Color system creates the illusion of grayscale text through carefully designed dither patterns. When rendered on 1-bit (black and white only) displays, these patterns create an illusion of different shades of gray by using specific arrangements of black and white pixels. The shade scale matches the #{link_to 'Colors', framework_docs_colors_path, class: 'font-medium hover:underline'} palette.",
      'text_color' => "Set text color with the text--{token} utilities, on the same scale as the #{link_to 'Colors', framework_docs_colors_path, class: 'font-medium hover:underline'} palette. On 1-bit displays a grayscale token renders as a dither pattern of black and white pixels, so text can read as any shade of gray.",
      'text_alignment' => 'Utility classes for horizontal text alignment. Left, center, right, and justify, with responsive variants for breakpoints, orientation, and bit-depth.',
      'rich_text' => 'A container for long-form text: paragraphs, headings, lists, and quotes. The framework styles the children of the content block, so text from a feed renders in the framework font without a class on every tag.',
      'text_stroke' => 'Outline text so it stays legible on a shaded background. Set the stroke width and color with the text stroke utilities.',
      'image_stroke' => 'Outline a vector or transparent raster image so it stays legible on a shaded background. Set the stroke width and color with the image stroke utilities.',
      'responsive' => "The Responsive system adapts a layout to the device it renders on. <strong>Size-based</strong> breakpoints follow the size class each device carries, and <strong>Bit-depth</strong> variants follow its color capabilities. Combine them to control how your content appears across TRMNL's range of devices.",
      'responsive_test' => 'This page tests responsive utilities by comparing SCSS mixins with CSS classes across different screen conditions. Each test row shows an element styled with SCSS mixins alongside the same element styled with CSS utility classes. Both columns should look identical when the conditions are met, demonstrating that mixins and classes produce equivalent results.',
      'framework_runtime' => 'Different devices have different, fixed amounts of screen space. The Framework Runtime fills that space when a plugin layout renders, doing the heavy, repetitive measuring and fitting for you. Expand the "Framework Runtime" panel under any example on this site to see the stats for that render.',
      'v2_overview' => "Welcome to Framework v2. This overview highlights what's new and what changed, and points you to detailed guides.",
      'upgrade_guide' => 'This short guide helps you upgrade from Framework v1 to v2. The new framework stays backward compatible, with the exception of the Border utility.',
      'enhancement_guide' => "This guide explains how to enhance plugins with Framework v2.0's expanded responsive capabilities. For a quick migration checklist, see the Upgrade Guide.",
      'content_limiter' => 'Content areas are capped in height by the view type they sit in. Past that threshold the limiter steps typography down and the Clamp engine truncates the first block that still overflows.',
      'columns' => 'The Columns system handles lots of same-type data. You provide the items; it distributes them into columns and manages overflow, so you can display as few or as many items as there are in any given situation. For other layout needs, use Grid or Flex.',
      'clamp' => 'The Clamp engine truncates text to a specified number of lines using word-based ellipsis. It preserves the original text, measures available width, and re-applies clamping whenever layouts change.',
      'divider' => 'The Divider element provides a simple, standalone shorthand for horizontal and vertical separators. It uses the same border-level rendering pipeline as the Border utility and defaults to level 6.',
      'scale' => 'Scale the whole interface from one screen modifier by changing the UI scale factor. Use it to match content density to viewing distance or user preference.',
      'inverse' => 'The Inverse utility applies the framework inverse color scheme to one element and its descendants. Use it for greater visual control, or to distinguish an active element and communicate a state transition without changing its siblings.',
      'text_scale' => 'Text Scale adjusts every framework font size and pixel line height from one screen modifier. It composes with Scale, so you can change text readability without applying the same factor to interface geometry or text strokes.',
      'troubleshooting_guide' => "When upgrading to v2, validate markup against intended usage. This guide lists common issues surfaced by v2's more precise behavior.",
      'trmnl_x_guide' => 'TRMNL X is a larger, 4-bit ePaper display. This guide covers what changed in the Framework to support it: new size modifiers, container query units, responsive overflow columns, and layout improvements. Existing plugins keep working; adopt these features to use the larger screen, portrait orientation, and expanded grayscale.',
      'v3_overview' => 'Framework 3.3 makes plugins theme-aware. It adds opt-in theme stylesheets, the TRMNLPaint JavaScript paint API, adaptive charts, maps and icons, rebuilt border, outline, and stroke utilities, and Fluid Mashups for arranging views, all on top of the v3 color system. Existing markup keeps working; every 3.2 and 3.3 feature is opt-in.',
      'v3_upgrade_guide' => 'Framework 3.3 is fully backward compatible with 3.0, 3.1 and 3.2. Existing class names render unchanged, and every 3.2 and 3.3 feature (themes, the paint API, adaptive charts, maps and icons) is opt-in. This guide lists the few things worth reviewing when you upgrade.',
      'v3_enhancement_guide' => 'Framework 3.3 lets an existing plugin follow themes, dark mode, and device modes everywhere: in markup, in charts, in maps, in icons, and in text and image outlines. This guide walks through each enhancement you can adopt (theme readiness, adaptive charts, adaptive icons, JS paint, the border step rail, and legible overlaid text and images), one at a time and in any order.',
      'open_source' => 'The TRMNL Framework is open source as of version 3.2. It is the design system TRMNL plugin screens are built with, tuned for 1-bit, 2-bit, and limited-color ePaper displays. This repository holds the CSS, the JavaScript runtime, the design tokens, and the documentation site you are reading.',
      'contributing' => 'Everything you need to make your first contribution to the TRMNL Framework: run it locally, find your way around the code, run the test suites, and open a pull request that lands. Start here, then read CONTRIBUTING.md for the fine print.',
      'font_family' => 'The Framework ships two pixel font bundles: Classic (NicoPups, NicoClean, BlockKie) and TRMNL (TRMNL12, TRMNL16, TRMNL21). Low-density displays use the selected bundle; high-density displays use Inter Variable for legibility.',
      'text_size' => 'Utility classes for controlling text size. Each class sets the correct font family, size, line-height, and smoothing for the active density tier: pixel bundle on low-density displays, Inter Variable on high-density displays.',
      'font_weight' => 'Utility classes for controlling font weight independently of size. Classic ships in a single weight, so <code>text--bold</code> is a no-op on low-density Classic; on low-density TRMNL it picks the bundled bold variant; on high-density displays it sets the Inter Variable weight.',
      'font_glyphs' => 'Browse every glyph available in each Framework font. Switch between the Classic and TRMNL bundles to view their full character inventory.'
    }
  end
  # rubocop:enable Metrics/MethodLength

  # Pages whose intro paragraphs intentionally include HTML (like <code>, <strong>,
  # links) and should be rendered html_safe rather than escaped. Single source of
  # truth shared by render_framework_intro_paragraph and the DocsRef tooltip
  # component (app/components/docs_ref.html.erb) so the two allowlists never drift.
  FRAMEWORK_INTRO_HTML_SAFE_PAGES = %w[responsive view screen layout mashup background text text_color tokens font_weight].freeze

  def framework_intro_html_safe?(page)
    FRAMEWORK_INTRO_HTML_SAFE_PAGES.include?(page.to_s)
  end

  # Render a standardized intro paragraph for the current page
  def render_framework_intro_paragraph(page)
    content = framework_intro_paragraphs[page.to_s]
    return '' if content.blank?

    paragraph_inner = framework_intro_html_safe?(page) ? content.html_safe : ERB::Util.html_escape(content)
    content_tag(:p, paragraph_inner, class: framework_section_description_classes)
  end

  # The track being read, normalized from the requested version, and the page groups it
  # publishes. Both are derived from the request alone, so they live here and
  # FrameworkController reads them through `helpers` for its callbacks. The paging built
  # on top (docs_pages, previous_page, next_page) is the controller's, because it also
  # has to page the examples section, which carries no docs version at all.
  def current_docs_version
    version = params[:version].to_s
    return FrameworkController::LEGACY_DOCS_VERSION_ALIASES.fetch(version) if FrameworkController::LEGACY_DOCS_VERSION_ALIASES.key?(version)
    return version if FrameworkController::SUPPORTED_DOCS_VERSIONS.include?(version)

    FrameworkController::CURRENT_DOCS_VERSION
  end

  def docs_groups_for_current_version
    FrameworkController::DOC_GROUPS_BY_VERSION.fetch(current_docs_version)
  end

  def framework_bit_depth_options
    [1, 2, 4].map do |bits|
      ["#{bits}-bit", bits.to_s]
    end
  end

  # Devices come from the manifest core exports (db/data/framework_devices.yml):
  # core dictates the device set; density classes arrive pre-resolved.
  def framework_model_screen_picker_options
    Framework::Devices.device_specs.map do |model|
      {
        id: model['id'],
        name: model['screen_picker_name'],
        keyname: model['keyname'],
        bitDepth: model.dig('css', 'bit_depth') || model['color_depth'],
        densityClass: model['density_class'],
        size: model.dig('css', 'size'),
        width: model.dig('css', 'screen_w'),
        height: model.dig('css', 'screen_h'),
        palette_ids: model['palette_ids']
      }
    end
  end

  def framework_screen_picker_default_summary(default_model_keyname: 'og_plus')
    model_option = framework_model_screen_picker_options.find { |o| o[:keyname] == default_model_keyname }
    model_name = model_option&.dig(:name) || 'Device'

    sep = tag.span(nil, class: "shrink-0 w-px h-3 bg-gray-300 dark:bg-gray-650", aria: { hidden: true })

    model_segment = tag.span(model_name, class: "truncate")

    gray_icon = '<svg class="inline-block w-2.5 h-2.5" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5" fill="currentColor" opacity="0.3"/></svg>'
    palette_segment = tag.span("2#{gray_icon}".html_safe, class: "shrink-0 inline-flex items-center gap-0.5")

    ic = "w-3 h-3"
    sun_icon = %(<svg class="#{ic}" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6" cy="6" r="2"/><path d="M6 1.5v1M6 9.5v1M1.5 6h1M9.5 6h1M3.2 3.2l.7.7M8.1 8.1l.7.7M3.2 8.8l.7-.7M8.1 3.9l.7-.7"/></svg>)
    landscape_icon = %(<svg class="#{ic}" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="10" height="6" rx="1"/></svg>)
    raw_icon = %(<svg class="#{ic}" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="4"/></svg>)
    state_segment = tag.span("#{sun_icon}#{landscape_icon}#{raw_icon}".html_safe, class: "shrink-0 inline-flex items-center gap-0.5 opacity-50")

    tag.span(
      safe_join([model_segment, sep, palette_segment, sep, state_segment]),
      class: "inline-flex items-center gap-2 min-w-0 max-w-[200px]"
    )
  end

  def framework_palette_options
    Framework::Devices.palettes.map(&:symbolize_keys)
  end

  def framework_theme_options = Framework::Themes.picker_options

  def page_titles
    titles = PAGE_TITLES.dup
    begin
      if respond_to?(:layout_examples_config, true)
        layout_examples_config.each do |keyname, config|
          titles[keyname] = config[:name] || keyname.to_s.titleize
        end
      end
    rescue NameError
      # layout_examples_config not available
    end
    # Outside a request (rake docs generation) there is no controller, and the
    # legacy-guide merge only applies when rendering a legacy track anyway.
    titles.merge!(LEGACY_V3_GUIDE_PAGE_TITLES) if controller && LEGACY_V3_DOCS_VERSIONS.include?(current_docs_version)
    titles
  end

  # Pages a later track renamed. A reference written once resolves to the name the target
  # track published, the same rename the /docs/:version/text redirect performs. Tracks
  # that still publish the old name never reach the alias.
  RENAMED_PAGES = { 'text' => 'text_color' }.freeze

  def framework_page_path(page, version: current_docs_version)
    # Check if this is a plugin example page

    if respond_to?(:layout_examples_config, true) && layout_examples_config.key?(page.to_s)
      config = layout_examples_config[page.to_s]
      opts = { id: page }
      opts[:variant] = config[:variant] if config.is_a?(Hash) && config[:variant].present?
      framework_example_show_path(**opts)
    else
      target_version = framework_target_version(version)
      target_page = framework_page_on_version(page, target_version)
      return framework_docs_index_path(version: target_version) unless target_page

      send("framework_docs_#{target_page}_path", version: target_version)
    end
  rescue NameError
    framework_docs_index_path(version: framework_target_version(version))
  end

  # What this page is called on that track, or nil when the track never published it.
  # A caller that would otherwise render a labelled link to the docs index checks this
  # first: on a frozen track the label names a page that track does not have.
  def framework_page_on_version(page, version = current_docs_version)
    target_version = framework_target_version(version)
    version_pages = FrameworkController::DOC_GROUPS_BY_VERSION.fetch(target_version, {}).values.flatten
    return page.to_s if version_pages.include?(page.to_s)

    aliased = RENAMED_PAGES[page.to_s]
    aliased if aliased && version_pages.include?(aliased)
  end

  # Whether a reference to this page has somewhere to go on the track being read.
  # framework_page_path answers the docs index for anything else, which a labelled chip
  # would present as the page itself.
  def framework_page_reachable?(page, version = current_docs_version)
    return true if respond_to?(:layout_examples_config, true) && layout_examples_config.key?(page.to_s)

    framework_page_on_version(page, version).present?
  rescue NameError
    false
  end

  def framework_target_version(version)
    FrameworkController::LEGACY_DOCS_VERSION_ALIASES.fetch(version.to_s, version.to_s)
  end

  def framework_page_active?(page)
    # For plugin examples, check if we're on the example_show action with matching id

    if respond_to?(:layout_examples_config, true) && layout_examples_config.key?(page.to_s)
      params[:controller] == 'framework' && params[:action] == 'layout_example_show' && params[:id] == page.to_s
    else
      params[:controller] == 'framework' && params[:action] == page.to_s && current_section == :docs
    end
  rescue NameError
    params[:action] == page.to_s
  end

  def page_description(page)
    begin
      if respond_to?(:layout_examples_config, true) && layout_examples_config.key?(page.to_s)
        config = layout_examples_config[page.to_s]
        return config[:description] if config.is_a?(Hash) && config[:description].present?
      end
    rescue NameError; nil
    end

    if LEGACY_V3_DOCS_VERSIONS.include?(current_docs_version) && LEGACY_V3_GUIDE_PAGE_DESCRIPTIONS.key?(page.to_s)
      return LEGACY_V3_GUIDE_PAGE_DESCRIPTIONS[page.to_s]
    end

    PAGE_DESCRIPTIONS[page] || ''
  end

  # Memoized: the docs sidebar calls page_icon once per example page.
  # Icon URLs come from the manifest (exported from core's Plugin records).
  def example_plugins_by_keyname
    @example_plugins_by_keyname ||= Framework::Devices.example_plugins
  end

  def page_icon(page, classes = nil)
    plugin_page_icon(page, classes) || sprite_icon(page_icon_name(page), classes: classes)
  end

  def plugin_page_icon(page, classes)
    return unless respond_to?(:layout_examples_config, true) && layout_examples_config.key?(page.to_s)

    plugin = example_plugins_by_keyname[page.to_s]
    return unless plugin

    safe_join([image_tag(plugin['image_url'], alt: plugin['name'], class: "#{classes} dark:hidden"),
               image_tag(plugin['image_dark_url'], alt: plugin['name'], class: "#{classes} hidden dark:block")])
  rescue NameError
    nil
  end

  # Pages without an icon partial of their own borrow a neighbor's.
  PAGE_ICON_ALIASES = {
    'text_scale' => 'text_size',
    'rendering_modes' => 'visibility',
    'color_palettes' => 'colors',
    'paint_colors' => 'colors',
    'paint_charts' => 'chart',
    'paint_maps' => 'map',
    'paint_borders' => 'border',
    'paint_typography' => 'text',
    'sass_api' => 'curly_brackets',
    'sass_build' => 'cog',
    'sass_devices' => 'devices',
    'sass_mixins' => 'responsive',
    'themes' => 'magic',
    'theme_authoring' => 'edit',
    'theme_slots' => 'bounding_box',
    'variables_api' => 'curly_brackets'
  }.freeze

  def page_icon_name(page)
    name = if framework_guide_page?(page)
             'guide'
           else
             PAGE_ICON_ALIASES.fetch(page.to_s, page.to_s)
           end
    lookup_context.exists?(name, ['shared/icons'], true) ? name : 'info'
  end

  def framework_guide_page?(page)
    (docs_groups_for_current_version[:guides] || []).include?(page.to_s)
  end

  # Helper to create headings with automatic IDs for TOC
  def framework_heading(level, text, additional_classes = '')
    # Track used IDs to ensure uniqueness within a single page render
    @framework_heading_ids ||= Set.new

    base_id = text.parameterize
    unique_id = base_id
    counter = 1

    # Ensure ID uniqueness by adding a counter if needed
    while @framework_heading_ids.include?(unique_id)
      unique_id = "#{base_id}-#{counter}"
      counter += 1
    end

    @framework_heading_ids.add(unique_id)

    tag_class = case level
                when 1
                  framework_page_title_classes
                when 2
                  framework_section_title_classes
                when 3
                  framework_subsection_title_classes
                when 4
                  framework_subsubsection_title_classes
                else
                  ''
                end

    content_tag(:div, class: 'group relative') do
      top = 4 - level # add/remove a pixel to vertically center
      content_tag('a', '#', href: anchored_framework_path(unique_id), class: 'framework-heading-anchor', style: "top: #{top}px") +
        content_tag("h#{level}", text, id: unique_id, class: "inline #{tag_class} #{additional_classes}")
    end
  end

  # Relative on purpose: an in-page jump has to land on the host that served the page.
  # Rooting it at DOCS_BASE_URL sent every heading anchor to localhost:3001 from any
  # other host or port.
  def anchored_framework_path(id)
    "#{request.path}##{id}"
  end

  # JSON icon map for Framework Runtime stats panel
  # Returns a Ruby Hash that will be JSON-escaped into the layout attribute
  def example_stats_icon_map
    {
      "Overflow engine" => render('shared/icons/overflow', classes: 'w-5 h-5'),
      "Clamp engine" => render('shared/icons/clamp', classes: 'w-5 h-5'),
      "Adjust grid gaps" => render('shared/icons/grid', classes: 'w-5 h-5'),
      "Adjust column gaps" => render('shared/icons/columns', classes: 'w-5 h-5'),
      "Format values" => render('shared/icons/format_value', classes: 'w-5 h-5'),
      "Fit values" => render('shared/icons/fit_value', classes: 'w-5 h-5'),
      "Content limiter" => render('shared/icons/content_limiter', classes: 'w-5 h-5'),
      "Pixel-perfect fonts" => render('shared/icons/pixel_perfect', classes: 'w-5 h-5'),
      "Table overflow" => begin
        render('shared/icons/table', classes: 'w-5 h-5')
      rescue StandardError
        render('shared/icons/grid', classes: 'w-5 h-5')
      end,
      "Item index number resize" => render('shared/icons/item', classes: 'w-5 h-5'),
      "__default__" => render('shared/icons/info', classes: 'w-5 h-5')
    }
  end

  def device_selector_should_refresh?
    refresh_pages = %w[overflow clamp scale text_scale]
    params[:controller] == 'framework' && refresh_pages.include?(params[:action])
  end

  def framework_nav_groups
    if current_section == :examples
      build_examples_nav_groups
    else
      docs_groups_for_current_version
    end
  end

  # Sidebar and docs-index group headings. Group keys titleize cleanly except
  # the API groups, whose acronym casing lives here.
  DOCS_GROUP_LABELS = {
    'paint' => 'Paint API',
    'sass' => 'Sass API',
    'themes' => 'Themes API',
    'variables' => 'CSS Variables'
  }.freeze

  def self.docs_group_label(group)
    DOCS_GROUP_LABELS.fetch(group.to_s) { group.to_s.titleize }
  end

  delegate :docs_group_label, to: :FrameworkHelper

  # Descriptions for each docs group, shown on the docs index
  def framework_docs_group_descriptions
    base_descriptions = {
      guides: 'Step-by-step guides for this Framework version, including overview and migration guidance.',
      arrangement: 'Control dimensions, spacing, and arrangement of elements. Size, spacing, gap, flex, grid, and aspect ratio are the building blocks for structure.',
      utilities: 'Core utilities for sizing, spacing, layout, responsiveness, and visual styling.',
      responsive_utilities: 'Breakpoints, bit-depth variants, and visibility controls: the building blocks for adaptive layouts.',
      styling: 'Control appearance and visual effects. Background, border, image, scale, and inverse colors are the building blocks for custom interfaces.',
      typography: 'Font families, glyphs, text size and scale, weight, color, alignment, and stroke utilities for controlling how text appears across devices and orientations.',
      modulations: 'Engines and systems that adapt content at render time: overflow, clamping, value formatting and fitting, content limiting, pixel-perfect text, and the Framework Runtime.',
      runtime: 'The Framework Runtime and the engines it drives at render time: overflow, clamping, value formatting and fitting, content limiting, and pixel-perfect text.',
      paint: 'TRMNLPaint, the JavaScript paint API. Read the live CSS cascade to resolve framework colors, borders, and typography for canvases, SVGs, charts, and maps.',
      sass: 'The framework SCSS source for custom stacks. Compile your own build, add custom device profiles, and author device-aware styles with the framework mixins.',
      themes: 'Opt-in stylesheets that re-theme screens while preserving device-capability rendering: usage, the authoring contract, and every themable slot.',
      variables: 'The public CSS variable surface: the palette, every token with its per-mode values, and the contract for who reads, re-points, and generates them.',
      foundation: 'The structural hierarchy of Screen, View, Layout, Title Bar, Columns, and Mashup: the fixed scaffolding for plugin content.',
      elements: 'Atomic text and separator elements: Title, Value, Label, Description, and Divider. Use these for consistent typography and visual structure.',
      components: 'Higher-level UI patterns that combine elements: Rich Text, Item, Table, Chart, and Progress. Ready-made building blocks for content.'
    }

    version_specific_guide_description = case current_docs_version
                                         when '1.2'
                                           'Foundational Framework v1 references and examples.'
                                         when '2.3'
                                           'Step-by-step guides for Framework v2: overview, upgrading, enhancing plugins, troubleshooting, and TRMNL X compatibility.'
                                         when '3.0'
                                           'Framework 3.0 guides for color system, migration, enhancement workflows, and TRMNL X compatibility.'
                                         when '3.1'
                                           'Framework 3.1 guides for color system, migration, font bundle defaults, enhancement workflows, and TRMNL X compatibility.'
                                         else
                                           'Framework 3.3 guides for migration, enhancement workflows, and TRMNL X compatibility, plus how the open-source repository is built and how to contribute.'
                                         end

    base_descriptions.merge(guides: version_specific_guide_description).with_indifferent_access
  end

  def framework_token_catalog
    @framework_token_catalog ||= begin
      root_source = File.read(TOKEN_ROOT_VARIABLES_PATH)
      override_source = File.read(TOKEN_OVERRIDE_VARIABLES_PATH)

      root_tokens = parse_css_variables_from_root_block(root_source)
      two_bit_base_tokens = parse_override_mixin_variables(override_source, 'two-bit-display-variables')
      two_bit_classic_tokens = parse_override_mixin_variables(override_source, 'classic-fonts')
      two_bit_tokens = two_bit_base_tokens.merge(two_bit_classic_tokens)
      density_2x_tokens = parse_override_mixin_variables(override_source, 'density-2x-display-variables')
      four_bit_plus_tokens = parse_override_mixin_variables(override_source, 'four-bit-and-up-display-variables')

      token_names = (root_tokens.keys + two_bit_tokens.keys + density_2x_tokens.keys + four_bit_plus_tokens.keys).uniq.sort

      token_names.filter_map do |token_name|
        next if current_docs_version == '3.0' && TEXT_SCALE_TOKENS.include?(token_name)
        next if current_docs_version == '3.0' && COMPOSED_SCALE_TOKENS.include?(token_name)

        root_value = root_tokens[token_name]
        override_2bit = two_bit_tokens[token_name]
        override_density_2x = density_2x_tokens[token_name]
        override_4bit_plus = four_bit_plus_tokens[token_name]

        {
          token_name: token_name,
          category: framework_token_category(token_name),
          root_value: root_value,
          override_2bit: override_2bit,
          override_density_2x: override_density_2x,
          override_4bit_plus: override_4bit_plus,
          notes: framework_token_notes_for_values(root_value, override_2bit, override_4bit_plus)
        }
      end
    end
  end

  def framework_token_row(token_name)
    framework_token_catalog.find { |row| row[:token_name] == token_name.to_s }
  end

  def framework_token_catalog_by_category
    framework_token_catalog.group_by { |row| row[:category] }
  end

  def framework_token_categories
    framework_token_catalog.map { |row| row[:category] }.uniq.reject { |c| TOKEN_HIDDEN_CATEGORIES.include?(c) }
  end

  def framework_token_category_title(category)
    category.to_s.tr('_', ' ').titleize
  end

  def framework_token_group_anchor(category)
    "token-group-#{category.to_s.tr('_', '-')}"
  end

  def framework_token_anchor(token_name)
    "token-#{token_name.to_s.delete_prefix('--').tr('_', '-')}"
  end

  def framework_token_path(token_name = nil)
    anchor = token_name.present? ? framework_token_anchor(token_name) : nil
    framework_page_path(:tokens) + (anchor.present? ? "##{anchor}" : '')
  end

  def related_tokens_for_page(page = params[:action])
    prefixes = DOC_PAGE_TOKEN_PREFIXES.fetch(page.to_s, [])
    return [] if prefixes.empty?

    framework_token_catalog.select do |token|
      name = token[:token_name]
      best_match = prefixes.select { |p| name.start_with?(p) }.max_by(&:length)
      next false unless best_match

      more_specific_page = DOC_PAGE_TOKEN_PREFIXES.any? do |other_page, other_prefixes|
        next false if other_page == page.to_s

        other_prefixes.any? { |op| name.start_with?(op) && op.length > best_match.length }
      end

      !more_specific_page
    end
  end

  def related_token_groups_for_page(page = params[:action])
    related_tokens_for_page(page).map { |token| token[:category] }.uniq
  end

  def framework_token_variant_groups(tokens, category)
    return { nil => tokens } unless TOKEN_VARIANT_CATEGORIES.include?(category&.to_sym)
    return palette_variant_groups(tokens) if category&.to_sym == :palette

    prefixes = TOKEN_CATEGORY_PREFIXES.fetch(category.to_sym, [])
    longest_prefix = prefixes.max_by(&:length) || ''

    groups = ActiveSupport::OrderedHash.new
    tokens.each do |token|
      remainder = token[:token_name].delete_prefix(longest_prefix)
      variant = TOKEN_SIZE_VARIANTS.find { |v| remainder.start_with?("#{v}-") }
      label = variant&.capitalize || 'Base'
      (groups[label] ||= []) << token
    end

    ordered = ActiveSupport::OrderedHash.new
    ordered['Base'] = groups.delete('Base') if groups.key?('Base')
    TOKEN_SIZE_VARIANTS.each do |v|
      key = v.capitalize
      ordered[key] = groups.delete(key) if groups.key?(key)
    end
    groups.each { |k, v| ordered[k] = v }
    ordered
  end

  def framework_related_tokens_section?
    return false unless params[:controller] == 'framework' && current_section == :docs
    return false if %w[docs_index tokens].include?(params[:action])

    related_tokens_for_page.present?
  end

  # Frozen tracks ship without the API pages, so refs whose target is not part
  # of the current version's docs filter out and the rail hides itself.
  def framework_api_refs_for_page(page = params[:action])
    refs = DOC_PAGE_API_REFS.fetch(page.to_s, [])
    return [] if refs.empty?

    refs.select { |ref| docs_pages.include?(ref[:page].to_s) }
  end

  # The excerpts the rail renders forward. inline refs are covered by the
  # page's own prose and only feed the reverse direction.
  def framework_api_excerpts_for_page(page = params[:action])
    framework_api_refs_for_page(page).reject { |ref| ref[:inline] }
  end

  # The derived reverse direction: pages whose registry entries target the
  # given page, in docs order. Selecting from docs_pages also drops
  # consumers that are not part of the current version's docs.
  def framework_api_ref_consumers_for_page(page = params[:action])
    consumers = DOC_PAGE_API_REFS.filter_map do |source, refs|
      source if refs.any? { |ref| ref[:page].to_s == page.to_s }
    end
    docs_pages.select { |candidate| consumers.include?(candidate) }
  end

  def framework_related_apis_section?
    return false unless params[:controller] == 'framework' && current_section == :docs

    framework_api_excerpts_for_page.present? || framework_api_ref_consumers_for_page.present?
  end

  def build_examples_nav_groups
    return {} unless respond_to?(:layout_examples_config, true)

    config = layout_examples_config
    plugin_keynames = config.is_a?(Hash) ? config.keys : []
    { layouts: plugin_keynames }
  rescue NameError => e
    Rails.logger.debug { "framework_nav_groups error: #{e.message}" } if defined?(Rails)
    {}
  end

  def current_section
    # Don't cache this - it needs to be recalculated for each request
    if params[:controller] == 'framework'
      # Check path first (most reliable)
      # Normalize path by removing trailing slash for consistent comparison
      path = request.path.to_s.chomp('/')

      # If we're on exactly /framework, return nil so neither tab is active
      if path == '/framework'
        return nil
      end

      if path.start_with?('/framework/releases')
        return :releases
      elsif path.start_with?('/framework/examples')
        return :examples
      elsif path.start_with?('/framework/docs')
        return :docs
      end

      # Check action as fallback
      if params[:action] == 'releases_index'
        :releases
      elsif ['layout_example_show', 'layout_examples', 'examples_index'].include?(params[:action])
        :examples
      elsif ['index', 'docs_index'].include?(params[:action])
        # If action is 'index' and path is exactly /framework, return nil
        path == '/framework' ? nil : :docs
      end
    else
      :docs
    end
  end

  # Pages that should display a "Beta" tag in navigation and headers
  def framework_beta_pages
    # Add action names here to mark specific docs pages as beta
    pages = []
    # Responsive and Aspect Ratio graduated in 3.2; the tracks frozen before it keep the tag.
    pages += %w[responsive responsive_test aspect_ratio] if current_docs_version.to_f < 3.2
    pages << 'scale' if current_docs_version == '3.0'
    pages
  end

  def framework_beta?(page)
    framework_beta_pages.include?(page.to_s)
  end

  # Shared classes for Framework docs reference tables (guides-first refresh)
  def framework_docs_table_wrapper_classes
    'max-w-[800px] xl:max-w-none'
  end

  def framework_docs_table_card_classes
    'border border-gray-300 dark:border-gray-700 rounded-lg overflow-x-auto xl:overflow-x-clip'
  end

  def framework_docs_table_classes
    'min-w-full border-separate border-spacing-0'
  end

  def framework_docs_table_header_cell_classes
    'sticky top-0 xl:top-11 z-10 border-b border-gray-300 dark:border-gray-700 bg-gray-175 dark:bg-gray-800/95 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider backdrop-blur-sm first:rounded-tl-lg last:rounded-tr-lg'
  end

  def framework_docs_table_body_classes
    'bg-white dark:bg-gray-900 [&>tr:nth-child(odd)]:bg-gray-100 [&>tr:nth-child(even)]:bg-gray-150 dark:[&>tr:nth-child(odd)]:bg-gray-900 dark:[&>tr:nth-child(even)]:bg-gray-800/50 [&>tr>td]:px-4 [&>tr>td]:py-3 [&>tr>td]:align-top [&>tr:last-child>td:first-child]:rounded-bl-lg [&>tr:last-child>td:last-child]:rounded-br-lg'
  end

  def framework_docs_table_row_classes
    'odd:bg-gray-100 even:bg-gray-150 dark:odd:bg-gray-900 dark:even:bg-gray-800/50'
  end

  def framework_docs_table_cell_classes
    'px-4 py-3 text-sm text-gray-500 dark:text-gray-400 align-top'
  end

  def framework_docs_table_cell_emphasis_classes
    'px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 align-top'
  end

  # Render plugin HTML and return as formatted string for code display
  # In core this renders the live Plugin template; here it reads the HTML fixture
  # captured from core (public/framework/example_fixtures), already stripped/formatted
  # at capture time.
  def render_plugin_html_for_code(plugin_keyname, view_type, _demo_data = nil, _framework_locals = nil)
    path = controller.example_fixture_path(plugin_keyname, view_type)
    return "<!-- example fixture missing: #{plugin_keyname}/#{view_type} -->" unless path.exist?

    path.read
  end

  # Fixture-based (captured from core's plugin _common.html.erb files).
  def plugin_common_file_exists?(plugin_keyname)
    example_common_fixture_path(plugin_keyname).exist?
  rescue StandardError
    false
  end

  def example_common_fixture_path(plugin_keyname)
    Framework.public_root.join('framework/example_fixtures', plugin_keyname.to_s, 'common.json')
  end

  # Returns the captured common-file sections: [{ type:, content:, language: }, ...]
  def render_plugin_common_for_code(plugin_keyname)
    JSON.parse(example_common_fixture_path(plugin_keyname).read, symbolize_names: true)
  rescue StandardError => e
    Rails.logger.error "Error reading plugin common fixture: #{e.message}"
    [{ type: 'html', content: "<!-- Error reading fixture: #{e.message} -->", language: 'html' }]
  end

  def format_file_size(bytes)
    return '-' if bytes.nil?

    if bytes < 1024
      "#{bytes} B"
    elsif bytes < 1_048_576
      "#{(bytes / 1024.0).round(1)} KB"
    else
      "#{(bytes / 1_048_576.0).round(1)} MB"
    end
  end

  # Returns the newest release per major version that has at least one existing
  # asset of the given type (:css or :js). Used by the summary cards on the
  # /framework/releases page.
  def latest_per_major(asset_type)
    type = asset_type.to_s
    releases_config.each_with_object({}) do |(major, versions), result|
      release = versions.find { |r| r[:assets].any? { |a| a[:type] == type && a[:exists] } }
      result[major] = release if release
    end
  end

  # Returns the count of distinct release versions that have at least one
  # existing asset of the given type (:css or :js).
  def total_releases_with(asset_type)
    type = asset_type.to_s
    releases_config.values.flatten.count do |release|
      release[:assets].any? { |a| a[:type] == type && a[:exists] }
    end
  end

  def relative_release_date(date)
    return '' if date.nil?

    date = date.to_date
    diff_days = (Date.current - date).to_i

    if diff_days <= 0
      'today'
    elsif diff_days == 1
      'yesterday'
    elsif diff_days < 7
      "#{diff_days} days ago"
    elsif diff_days < 14
      'last week'
    elsif diff_days < 30
      "#{pluralize(diff_days / 7, 'week')} ago"
    elsif date.year == Date.current.year
      date.strftime('%b %-d')
    else
      date.strftime('%b %-d, %Y')
    end
  end

  # Propshaft::Resolver::Static (hosts with public/assets/.manifest.json) cannot see
  # engine app/javascript files. Prefer digested assets when present; otherwise use
  # /framework-docs/* served from the gem by Framework::Static.
  DOCS_PUBLIC_ASSET_MAP = {
    'framework_docs/lib/screen_class_sync.js' => 'screen_class_sync.js',
    'framework_iframe_bridge.js' => 'framework_iframe_bridge.js',
    'plugin_legacy.js' => 'plugin_legacy.js',
    'plugin-render/plugins.js' => 'plugins.js',
    'plugins.css' => 'plugins.css',
    'plugins_legacy.css' => 'plugins_legacy.css'
  }.freeze

  # The docs chrome, which a host's own pipeline answers with a different file.
  # `asset_path` matches on the logical name across the whole load path, so the first
  # asset called tailwind.css wins, and on any host that runs Tailwind that is the
  # host's bundle. The docs then rendered against a stylesheet compiled without these
  # views in its @source list, and every utility only the docs use was simply absent:
  # no pt-11 under the fixed nav, no sticky sidebar offset, no border-separate on the
  # tables. The Prism theme collides the same way on a host carrying its own copy, as do
  # the two vendored scripts: core vendors prism-1.29.0.min.js and jquery-3.6.0.min.js
  # under those exact names, so the docs highlighted their samples with whichever
  # tokenizer the host's load path reached first.
  #
  # These come off the engine tree instead. Framework::Static resolves the chrome to
  # the live build in this repo and the packaged snapshot everywhere else, so the docs
  # server still serves what it just compiled. Everything else keeps the lookup above:
  # engine-only paths cannot collide, and the plugin bundles are resolved by serving
  # mode, where a consumer host that opts in with the development marker is asking for
  # its own build.
  HOST_SHADOWED_DOCS_ASSETS = %w[
    tailwind.css
    prism_trmnl.css
    prism-1.29.0.min.js
    jquery-3.6.0.min.js
  ].freeze

  # Above the private section on purpose: the controller resolves the docs bundle
  # through `helpers.framework_docs_asset_path`, an explicit receiver, so that the
  # layout tags and the iframe config JSON name one URL.
  def framework_docs_asset_path(logical)
    return framework_docs_static_path(logical) if HOST_SHADOWED_DOCS_ASSETS.include?(logical)

    asset_path(logical)
  rescue Propshaft::MissingAssetError
    framework_docs_static_path(logical)
  end

  def framework_docs_static_path(logical)
    public_name = DOCS_PUBLIC_ASSET_MAP.fetch(logical) { File.basename(logical) }
    file = Framework::Static.docs_file_path(public_name)
    # Framework::Static serves these straight off the engine tree, outside Propshaft's
    # digesting, so nothing in the URL moves when the file is rebuilt. Without the
    # mtime a warm browser cache keeps replaying the bundle from before the edit.
    return "/framework-docs/#{public_name}" unless file

    "/framework-docs/#{public_name}?v=#{file.mtime.to_i}"
  end

  # Dev-only badge naming the asset set this page linked, with the reason in its
  # tooltip. nil outside development: nothing else can serve a live build, so the
  # badge would say "Released" on every deployed page forever.
  def docs_serving_mode_badge
    return nil unless docs_serving_mode.development?
    return { label: 'Live build', title: docs_serving_mode.explanation } if docs_use_live_build?

    semver = docs_released_plugins_urls&.dig(:semver)
    { label: ['Released', semver].compact.join(' '), title: docs_released_badge_title(semver) }
  end

  private

  def palette_variant_groups(tokens)
    groups = ActiveSupport::OrderedHash.new
    tokens.each do |token|
      name = token[:token_name]
      label = if name.start_with?('--color-') || name == '--black' || name == '--white'
                'Semantic'
              elsif name.match?(/\A--gray-\d\z/)
                'Legacy Grayscale'
              else
                'Grayscale'
              end
      (groups[label] ||= []) << token
    end

    ordered = ActiveSupport::OrderedHash.new
    PALETTE_GROUP_ORDER.each do |key|
      ordered[key] = groups.delete(key) if groups.key?(key)
    end
    groups.each { |k, v| ordered[k] = v }
    ordered
  end

  def framework_token_category(token_name)
    TOKEN_CATEGORY_PREFIXES.each do |category, prefixes|
      return category if prefixes.any? { |prefix| token_name.start_with?(prefix) }
    end

    :other
  end

  def framework_token_notes_for_values(*values)
    present_values = values.compact
    notes = []
    notes << 'computed' if present_values.any? { |value| value.include?('calc(') }
    notes << 'references token' if present_values.any? { |value| value.include?('var(') }
    notes.join(', ')
  end

  def parse_css_variables_from_root_block(source)
    block = extract_named_block(source, ':root')
    parse_css_variables_from_block(block)
  end

  def parse_override_mixin_variables(source, mixin_name)
    block = extract_named_block(source, "@mixin #{mixin_name}")
    maps = parse_scss_maps(source)
    parse_css_variables_from_block(block, maps: maps, source: source)
  end

  def parse_css_variables_from_block(block_source, maps: {}, source: nil, visited_mixins: Set.new)
    variables = {}

    block_source.to_s.each_line do |line|
      stripped = line.strip
      next if stripped.blank? || stripped.start_with?('//')

      assignment_match = stripped.match(%r{\A(--[\w-]+)\s*:\s*(.+?);\s*(?://.*)?\z})
      if assignment_match
        variables[assignment_match[1]] = assignment_match[2].strip
        next
      end

      include_match = stripped.match(/\A@include\s+emit-sized-vars\(\$(\w+)(?:,\s*\$scale:\s*(true|false))?\);\z/)
      if include_match
        map_name = include_match[1]
        should_scale = include_match[2] == 'true'
        map_variables = maps.fetch(map_name, {})

        map_variables.each do |token_name, token_value|
          variables[token_name] = scale_px_token_value(token_value, should_scale)
        end
        next
      end

      nested_include_match = stripped.match(/\A@include\s+([a-zA-Z0-9_-]+)(?:\([^)]*\))?;\z/)
      next unless nested_include_match && source

      nested_mixin_name = nested_include_match[1]
      next if nested_mixin_name == 'emit-sized-vars'
      next if visited_mixins.include?(nested_mixin_name)

      nested_block = extract_named_block(source, "@mixin #{nested_mixin_name}")
      next if nested_block.blank?

      nested_vars = parse_css_variables_from_block(
        nested_block,
        maps: maps,
        source: source,
        visited_mixins: visited_mixins.dup.add(nested_mixin_name)
      )
      variables.merge!(nested_vars)
    end

    variables
  end

  def parse_scss_maps(source)
    maps = {}

    source.scan(/\$(\w+)\s*:\s*\((.*?)\);\s*/m).each do |map_name, body|
      entries = {}
      body.scan(/'(--[^']+)':\s*([^,\n]+),?/).each do |token_name, token_value|
        entries[token_name] = token_value.strip
      end
      maps[map_name] = entries
    end

    maps
  end

  def scale_px_token_value(token_value, should_scale)
    return token_value unless should_scale
    return token_value unless token_value.match?(/\A-?\d*\.?\d+px\z/)
    return token_value if token_value == '0px'

    "calc(#{token_value} * var(--ui-scale))"
  end

  def extract_named_block(source, marker)
    marker_index = source.index(marker)
    return '' unless marker_index

    open_brace_index = source.index('{', marker_index)
    return '' unless open_brace_index

    depth = 0
    close_brace_index = nil

    source.chars.each_with_index do |char, index|
      next if index < open_brace_index

      depth += 1 if char == '{'
      next unless char == '}'

      depth -= 1
      if depth.zero?
        close_brace_index = index
        break
      end
    end

    return '' unless close_brace_index

    source[(open_brace_index + 1)...close_brace_index]
  end

  def docs_released_badge_title(semver)
    return docs_serving_mode.explanation unless docs_serving_mode.live?

    # The host is live but this page is not: only the current docs version ever is.
    "#{current_docs_version} documents a frozen release, so it always links " \
      "#{semver || 'its published bundle'}. Live serving is scoped to " \
      "#{FrameworkController::CURRENT_DOCS_VERSION}."
  end
end
# rubocop:enable Metrics/ModuleLength
