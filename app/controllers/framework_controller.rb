class FrameworkController < Framework.parent_controller_class
  # A host's app/views precedes an engine's in the lookup, so every partial the docs
  # chrome renders was answerable by the host app. On core that is not hypothetical: it
  # carries its own shared/_fancy_screen_picker, its own shared/_menubar_screen_picker,
  # and a copy of all 181 shared/icons partials, all named the same. The docs nav asked
  # for the picker and got core's fork of it, which predates the Style and Text Scale
  # sections, so production served a picker two controls short of the one this repo
  # renders. Prepending pins the docs to the views shipped beside them. Scoped to this
  # controller: a host's own pages keep their own views, so core's visual editor still
  # renders core's picker.
  prepend_view_path Framework::Engine.root.join('app/views')

  # Declared last so these answer over a same-named host helper (see Framework::Engine for
  # why the host gets none of them).
  helper CoreCompatHelper
  helper DocsChromeHelper
  helper FrameworkDemoHelper
  helper FrameworkHelper
  helper FrameworkImagesHelper
  helper FrameworkRoutesHelper

  # CONTEXT: docs pages render ~1.5MB of layout-dominated, visitor-independent
  # HTML in 1.1-1.5s, so whole responses are cached and replayed. Declared
  # before the other callbacks so a cache hit skips them (including
  # render_versioned_docs_template). The docs are public and every page is the
  # same for everyone, so nothing about the visitor enters the key. The only
  # per-request bit is csrf_meta_tags, re-injected fresh on every hit.
  around_action :serve_cached_page, if: :page_cacheable?

  before_action :set_docs_version
  before_action :set_og
  before_action :validate_versioned_docs_page!, if: :versioned_docs_component_request?
  before_action :render_versioned_docs_template, if: :versioned_docs_template_request?

  layout -> { params[:_raw].present? ? false : 'framework' }

  CURRENT_DOCS_VERSION = '3.3'.freeze
  SUPPORTED_DOCS_VERSIONS = %w[1.2 2.3 3.0 3.1 3.3].freeze
  # 3.2 never had a docs generation of its own: its pages moved to 3.3 with the release,
  # so every 3.2 URL redirects to its 3.3 twin the way the v1/v2/v3 aliases do.
  LEGACY_DOCS_VERSION_ALIASES = {
    'v1' => '1.2',
    'v2' => '2.3',
    'v3' => CURRENT_DOCS_VERSION,
    '3.2' => CURRENT_DOCS_VERSION
  }.freeze
  DOCS_VERSION_MENU = %w[3.3 3.1 3.0 2.3 1.2].freeze
  CACHED_PAGE_TTL = 12.hours

  V3_DOC_GROUPS = {
    guides: %w[v3_overview v3_upgrade_guide v3_enhancement_guide trmnl_x_guide],
    arrangement: %w[size spacing gap flex grid aspect_ratio],
    responsive_utilities: %w[responsive responsive_test visibility],
    styling: %w[background border rounded outline image image_stroke scale colors tokens],
    typography: %w[font_family font_weight font_glyphs text_size text_alignment text_color text_stroke],
    modulations: %w[overflow table_overflow clamp format_value fit_value content_limiter pixel_perfect framework_runtime],
    foundation: %w[structure screen view layout title_bar columns mashup],
    elements: %w[title value label description divider],
    components: %w[rich_text item table chart progress]
  }.freeze

  V3_1_DOC_GROUPS = V3_DOC_GROUPS.merge(
    styling: V3_DOC_GROUPS.fetch(:styling) + %w[inverse],
    typography: %w[font_family font_weight font_glyphs text_size text_scale text_alignment text_color text_stroke]
  ).freeze

  # 3.2 gathers every render-time engine under :runtime (renamed from the old
  # :modulations jargon). The API surfaces sit in their own groups right after
  # :runtime: Paint (an overview plus one page per paint domain), Sass (the
  # open-source SCSS surface for custom stacks), Themes (usage, the authoring
  # contract, and the slot reference), and CSS Variables (the contract overview
  # plus the palette and token references, moved out of :styling). Rebuilding
  # from V3_DOC_GROUPS preserves key order, so :runtime keeps the slot
  # :modulations held in the sidebar and index. Earlier v3 tracks keep the page
  # set (and the :modulations and :styling groupings) they shipped with.
  #
  # 3.2 keeps Text Scale in :typography and appends the Open Source and Contributing
  # guides to :guides. The frozen 3.1 track includes Text Scale from 3.1.5 and
  # Inverse from 3.1.7.
  #
  # :foundation gains Devices and Rendering Modes behind Screen: the two things a
  # screen states about its hardware before any content goes in it. Both belong to
  # the current track only, like every other page added to this hash rather than to
  # V3_DOC_GROUPS.
  #
  # :components gains Map behind Chart, and :paint gains Painting Maps behind
  # Painting Charts: TRMNLMaps ships in the 3.3 runtime, so both pages are current-only.
  #
  # :arrangement gains Position behind Spacing: the position keywords, offsets and
  # stacking levels are 3.3 utilities, and offsets ride the spacing scale.
  CURRENT_DOC_GROUPS = V3_DOC_GROUPS.each_with_object({}) do |(group, pages), groups|
    case group
    when :guides
      groups[:guides] = pages + %w[open_source contributing]
    when :arrangement
      spacing_index = pages.index('spacing') || -1
      groups[:arrangement] = pages.dup.insert(spacing_index + 1, 'position')
    when :foundation
      screen_index = pages.index('screen') || -1
      groups[:foundation] = pages.dup.insert(screen_index + 1, 'devices', 'rendering_modes')
    when :components
      chart_index = pages.index('chart') || -1
      groups[:components] = pages.dup.insert(chart_index + 1, 'map')
    when :styling
      groups[:styling] = (pages - %w[colors tokens]) + %w[inverse]
    when :typography
      text_size_index = pages.index('text_size') || -1
      groups[:typography] = pages.dup.insert(text_size_index + 1, 'text_scale')
    when :modulations
      groups[:runtime] = %w[framework_runtime] + (pages - %w[framework_runtime])
      groups[:paint] = %w[paint_api paint_colors paint_charts paint_maps paint_borders paint_typography]
      groups[:sass] = %w[sass_api sass_build sass_devices sass_mixins]
      groups[:themes] = %w[themes theme_authoring theme_slots]
      groups[:variables] = %w[variables_api colors color_palettes tokens]
    else
      groups[group] = pages
    end
  end.freeze

  DOC_GROUPS_BY_VERSION = {
    '1.2' => {
      utilities: %w[size spacing gap flex grid background border],
      modulations: %w[overflow clamp format_value fit_value content_limiter pixel_perfect],
      foundation: %w[view layout title_bar columns mashup],
      elements: %w[text title value label description text_stroke image image_stroke],
      components: %w[rich_text item table chart]
    }.freeze,
    '2.3' => {
      guides: %w[v2_overview upgrade_guide enhancement_guide troubleshooting_guide trmnl_x_guide],
      arrangement: %w[size spacing gap flex grid aspect_ratio],
      responsive_utilities: %w[responsive responsive_test visibility],
      styling: %w[background border rounded outline text image image_stroke text_stroke scale],
      modulations: %w[overflow table_overflow clamp format_value fit_value content_limiter pixel_perfect framework_runtime],
      foundation: %w[structure screen view layout title_bar columns mashup],
      elements: %w[title value label description divider],
      components: %w[rich_text item table chart progress]
    }.freeze,
    '3.0' => V3_DOC_GROUPS,
    '3.1' => V3_1_DOC_GROUPS,
    CURRENT_DOCS_VERSION => CURRENT_DOC_GROUPS
  }.freeze

  # 3.0/3.1 share the current v3 templates; framework_v3_1 holds only the
  # pages whose 3.2 rewrite diverged (template-existence fallback in
  # docs_template_for_action), so frozen tracks keep the docs for their latest release.
  DOCS_VIEW_PREFIX_BY_VERSION = {
    '1.2' => 'framework_v1',
    '2.3' => 'framework_v2',
    '3.0' => 'framework_v3_1',
    '3.1' => 'framework_v3_1',
    CURRENT_DOCS_VERSION => 'framework'
  }.freeze

  # current_docs_version and docs_groups_for_current_version are deliberately absent: both
  # are FrameworkHelper's, and the views read them from there.
  helper_method :previous_page, :next_page, :all_pages, :current_section, :docs_pages, :example_pages,
                :docs_released_plugins_urls, :docs_theme_css_urls, :docs_responsive_test_css_url,
                :docs_plugins_bundle, :docs_serving_mode, :docs_use_live_build?, :legacy_docs?

  def index
    @og_description = 'Framework UI.'
  end

  def docs_index
    @og_description = 'Framework UI documentation.'
  end

  # JSON: authoritative plugins.css / plugins.js URLs for framework example iframes (same-origin).
  # Every value here comes from docs_plugins_bundle, the same resolution the layout's own
  # tags use. The two used to be computed separately and disagreed: the JSON re-declared
  # single_bundle_mode per branch, and it overwrote the whole 1.2 payload with the live
  # bundle while the parent page kept linking the v1.2 one.
  def example_iframe_config
    bundle = docs_plugins_bundle
    absolutize = ->(url) { absolute_url(url) }

    render json: {
      plugins_css_url: absolutize.call(bundle[:css]),
      plugins_js_url: absolutize.call(bundle[:js]),
      theme_css_urls: docs_theme_css_urls.transform_values { |url| absolutize.call(url) },
      semver: bundle[:semver],
      single_bundle_mode: bundle[:single_bundle_mode],
      scope: params[:scope].presence || 'framework'
    }
  end

  def examples_index
    @og_description = 'Framework UI examples.'
  end

  def releases_index
    @og_description = 'Framework UI releases and downloads.'
  end

  def structure; end
  def screen; end
  def devices; end
  def rendering_modes; end
  def colors; end
  def color_palettes; end
  def tokens; end
  def themes; end
  def paint_api; end
  def paint_colors; end
  def paint_charts; end
  def paint_maps; end
  def paint_borders; end
  def paint_typography; end
  def sass_api; end
  def sass_build; end
  def sass_devices; end
  def sass_mixins; end
  def theme_authoring; end
  def theme_slots; end
  def variables_api; end
  def background; end
  def image; end
  def border; end
  def rounded; end
  def outline; end
  def visibility; end
  def view; end
  def layout; end
  def title_bar; end
  def columns; end
  def grid; end
  def title; end
  def description; end
  def label; end
  def value; end
  def divider; end
  def table; end
  def table_overflow; end
  def chart; end
  def map; end
  def item; end
  def gap; end
  def clamp; end
  def overflow; end
  def format_value; end
  def fit_value; end
  def flex; end
  def size; end
  def responsive; end
  def text; end
  def text_size; end
  def text_scale; end
  def font_weight; end
  def text_color; end
  def text_alignment; end
  def spacing; end
  def position; end
  def rich_text; end
  def mashup; end
  def content_limiter; end
  def pixel_perfect; end
  def text_stroke; end
  def image_stroke; end
  def progress; end
  def scale; end
  def inverse; end
  def responsive_test; end
  def aspect_ratio; end
  def framework_runtime; end
  def enhancement_guide; end
  def upgrade_guide; end
  def v2_overview; end
  def troubleshooting_guide; end
  def trmnl_x_guide; end
  def v3_overview; end
  def v3_upgrade_guide; end
  def v3_enhancement_guide; end
  def open_source; end
  def contributing; end
  def font_family; end
  def font_glyphs; end

  def layout_examples; end

  # In core this renders live Plugin templates with Demoable demo data. Here the
  # examples are pre-captured HTML fixtures (public/framework/example_fixtures),
  # so the docs shed Plugin/Demoable/DeviceModel entirely.
  def layout_example_show
    @plugin_keyname = params[:id]
    raise ActionController::RoutingError, "unknown example: #{@plugin_keyname}" unless layout_examples_config.key?(@plugin_keyname)

    @available_views = %i[full half_horizontal half_vertical quadrant].select do |view|
      example_fixture_path(@plugin_keyname, view).exist?
    end
  end

  def example_fixture_path(keyname, view)
    Framework.public_root.join("framework/example_fixtures", keyname.to_s, "#{view}.html")
  end
  helper_method :example_fixture_path

  # rubocop:disable Metrics/MethodLength
  def layout_examples_config
    @layout_examples_config ||= {
      'github_commit_graph' => {
        name: 'GitHub Commit Graph',
        description: 'A visual representation of GitHub commit activity across different view sizes'
      },
      'shopify' => {
        name: 'Shopify',
        description: 'E-commerce analytics and store metrics displayed in various layouts'
      },
      'days_left_year' => {
        name: 'Days Left This Year',
        description: 'Countdown display showing remaining days in the year across different layout sizes'
      },
      'wiki_random_article' => {
        name: 'Wiki Random Article',
        description: 'Random Wikipedia articles displayed in various layout configurations'
      },
      'stock_price' => {
        name: 'Stock Price',
        description: 'Stock, metal, and index prices shown in different view layouts'
      },
      'reddit' => {
        name: 'Reddit',
        description: 'Top posts from favorite subreddits displayed across various layout sizes'
      },
      'todo_list' => {
        name: 'Todo List',
        description: 'Task management interface shown in different layout configurations'
      },
      'lunar_calendar' => {
        name: 'Lunar Calendar',
        description: 'Lunar phases and moon cycle information shown across different view sizes',
        layouts: {
          full: 'This layout utilizes the full screen space to display comprehensive lunar information. ' \
                'The current phase is prominently featured at the top in a large format, with key metrics ' \
                '(illumination percentage and moon age) displayed alongside. In the middle of the layout ' \
                'there is a complete phase sequence visualization showing all upcoming phases with dates, ' \
                'icons, and names. Larger icon sizes (90px) provide clear visual hierarchy. The bottom ' \
                'section shows the next phase details and upcoming full and new moon dates.',
          half_horizontal: 'This layout splits the screen horizontally into two equal columns. The left ' \
                           'column contains key metrics and dates arranged in compact grids, while the ' \
                           'right column features the phase sequence visualization. This arrangement ' \
                           'prioritizes the visual phase sequence while maintaining access to essential ' \
                           'data points. The two-column approach maximizes horizontal space usage.',
          half_vertical: 'This layout uses vertical stacking optimized for narrow vertical space. Key ' \
                         'information (current/next phase) is shown at the top in a two-column grid. ' \
                         'The phase sequence is displayed in the center with dates, icons, and names, ' \
                         'with first, current, and last phases emphasized. Essential metrics (age, ' \
                         'illumination) and upcoming dates are shown at the bottom.',
          quadrant: 'This layout uses minimal space (one-quarter of the screen) with highly condensed ' \
                    'content. The top shows current and next phase in a compact two-column format. ' \
                    'The center features a simplified phase sequence visualization with icons only. ' \
                    'Essential upcoming dates (full moon, new moon) are shown at the bottom. All ' \
                    'elements use smaller sizes (35px icons) to fit the constrained space.'
        }
      },
      'weather' => {
        name: 'Weather (WeatherAPI)',
        description: 'Weather conditions and forecasts via WeatherAPI displayed across different layout sizes',
        variant: 'weatherapi'
      }
    }
  end
  # rubocop:enable Metrics/MethodLength

  helper_method :layout_examples_config

  SEMVER_PATTERN = /\A\d+\.\d+\.\d+\z/
  COLOR_MANIFEST_NAME = 'framework_colors.resolved.json'.freeze

  # The first release whose plugins.min.css is the processed bundle (private variables
  # renamed, rules merged). From it onward the docs serve the minified name; the frozen
  # tracks before it keep serving the plain name they always did.
  PROCESSED_BUNDLE_VERSION = Gem::Version.new('3.2.0')
  BUNDLE_VARIANTS = { primary: 'Development', alias: 'Minified' }.freeze

  def releases_config
    @releases_config ||= Rails.cache.fetch(['framework/releases_config', released_assets_signature], expires_in: 1.hour) do
      build_releases_config
    end
  end

  # Cheap fingerprint of the on-disk release dirs so the cached config rebuilds
  # the moment a framework release is published or removed.
  def released_assets_signature
    %w[css js].flat_map do |kind|
      dir = Framework.public_root.join(kind)
      Dir.exist?(dir) ? Dir.children(dir) : []
    end.sort
  end

  def framework_fonts_config
    Framework::Fonts
  end

  helper_method :releases_config, :framework_fonts_config

  # Published /css|/js/{semver}/plugins.* for versioned docs, matching /framework/releases.
  # Returns nil if no semver in that major has both plugins.css and plugins.js on disk.
  def docs_released_plugins_urls
    @docs_released_plugins_urls ||= compute_docs_released_plugins_urls
  end

  # Theme CSS URLs for the docs server, scoped the same way the bundle is: the live
  # build for the current docs version in live mode, so a theme SCSS edit lands on
  # reload, and the released copy everywhere else. Themes shipped in 3.2, so a frozen
  # track falls back to css/latest rather than losing the picker's Style selector.
  def docs_theme_css_urls
    # 1.2 predates the theme system and the layout never linked them there.
    return {} if legacy_docs?

    @docs_theme_css_urls ||= Framework::Themes.ids.index_with do |id|
      theme_css = Framework::Themes.css_path(id)
      live_docs_asset_url(theme_css) || released_docs_asset_url(theme_css)
    end.compact
  end

  # Mixin-column CSS for the responsive_test parity page. Both halves of a parity row
  # have to come from one build, so an edit to the harness wins in live mode and the
  # release this track pins wins otherwise. No css/latest fallback here, unlike the
  # theme CSS above: a track whose release predates the harness would grade its pinned
  # bundle against a later release's mixins and report the version gap as a defect. Such
  # a track gets nil, and the page drops the mixin column.
  def docs_responsive_test_css_url
    @docs_responsive_test_css_url ||= live_docs_asset_url('framework/responsive_test.css') ||
                                      released_docs_asset_url('framework/responsive_test.css', fallback_to_latest: false)
  end

  # The plugins bundle this docs version links, resolved once for the layout's tags,
  # its iframe data attributes, and the example_iframe_config JSON.
  def docs_plugins_bundle
    @docs_plugins_bundle ||= begin
      released = docs_released_plugins_urls
      if released
        { css: released[:css], js: released[:js], semver: released[:semver], single_bundle_mode: true }
      elsif legacy_docs?
        # Reachable only if the published 1.2.0 bundle leaves public/: 1.2 never serves
        # a live build, and its release carries both halves. The packaged v1.2 snapshot
        # is what answers then, rather than a 3.x bundle under a 1.2 heading.
        { css: helpers.framework_docs_asset_path('plugins_legacy.css'),
          js: helpers.framework_docs_asset_path('plugin_legacy.js'),
          semver: nil, single_bundle_mode: true }
      else
        { css: helpers.framework_docs_asset_path('plugins.css'),
          js: helpers.framework_docs_asset_path('plugin-render/plugins.js'),
          semver: nil, single_bundle_mode: false }
      end
    end
  end

  def legacy_docs? = current_docs_version == '1.2'

  # How this host resolves live vs released serving, before version scoping.
  def docs_serving_mode
    @docs_serving_mode ||= Framework::DocsServingMode.current
  end

  # Every docs link rendered on a docs page stays on the track the reader is on.
  # Rails applies this to every generation, including routes with no :version segment,
  # where the option becomes a query param instead: FrameworkRoutesHelper nulls it for
  # those five routes so the default lands on the docs routes alone.
  def default_url_options
    return super unless versioned_docs_request?

    super.merge(version: current_docs_version)
  end

  private

  def page_cacheable?
    perform_caching && request.get? && flash.empty? &&
      action_name != 'layout_example_show' &&
      (request.format.html? || action_name == 'example_iframe_config')
  end

  def serve_cached_page
    cached = Rails.cache.read(page_cache_key)
    return serve_cached_body(cached) if cached

    yield
    Rails.cache.write(page_cache_key, response.body, expires_in: CACHED_PAGE_TTL) if response.status == 200
  end

  def page_cache_key
    # NOTE: Rails.root basename is the release stamp on Hatchbox, so deploys
    # invalidate cached pages; base_url covers absolute URLs in the body.
    #
    # A live rebuild moves neither of those, so the newest build mtime joins the key
    # while the host serves live. It is nil in every deployed mode, which leaves the
    # production key shape untouched. The version is already in fullpath, so this is
    # keyed on the host's mode rather than on the page's scoped one.
    #
    # A host that upgrades the gem moves none of the above, so the gem version is in the
    # key too: without it the deploy that ships new chrome replays the old HTML for 12h.
    @page_cache_key ||= ['framework-page', Framework::VERSION, Rails.root.basename.to_s, request.base_url,
                         request.fullpath, I18n.locale,
                         Framework::Version.development_mode?,
                         docs_serving_mode.build_fingerprint].compact
  end

  def serve_cached_body(body)
    return render json: body if action_name == 'example_iframe_config'

    render html: refresh_csrf_token(body).html_safe, layout: false
  end

  def refresh_csrf_token(body)
    body.sub(/(<meta name="csrf-token" content=")[^"]*/) { "#{Regexp.last_match(1)}#{form_authenticity_token}" }
  end

  def absolute_url(url)
    str = url.to_s
    str.start_with?('http://', 'https://') ? str : "#{request.base_url}#{str}"
  end

  def set_og
    page_name = framework_meta_page_name
    @og_title = [page_name, 'TRMNL Framework'].compact.join(' · ')
    @og_description = framework_meta_description(page_name)
    @og_image = 'og/framework.png'
  end

  def framework_meta_page_name
    case action_name
    when 'index'
      nil
    when 'docs_index'
      'Docs'
    when 'examples_index'
      'Examples'
    when 'releases_index'
      'Releases'
    else
      helpers.page_titles[action_name] || action_name.titleize
    end
  end

  def framework_meta_description(page_name)
    description = helpers.strip_tags(helpers.page_description(action_name)).presence
    return description if description

    page_name.present? ? "Explore #{page_name.downcase} in the TRMNL Framework." : 'Documentation and resources for the TRMNL Framework.'
  end

  def current_section
    @current_section ||= if action_name == 'index'
                           nil
                         elsif %w[layout_example_show layout_examples examples_index].include?(action_name)
                           :examples
                         elsif action_name == 'releases_index'
                           :releases
                         else
                           :docs
                         end
  end

  def docs_pages
    @docs_pages ||= helpers.docs_groups_for_current_version.values.flatten
  end

  def example_pages
    @example_pages ||= layout_examples_config.keys
  end

  def all_pages
    # Return pages for current section only
    current_section == :examples ? example_pages : docs_pages
  end

  def current_page_index
    # For plugin example pages, use params[:id] instead of action_name
    current_page = action_name == 'layout_example_show' ? params[:id] : action_name
    all_pages.index(current_page)
  end

  def previous_page
    all_pages[current_page_index - 1] if current_page_index&.positive?
  end

  def next_page
    all_pages[current_page_index + 1] if current_page_index && current_page_index < all_pages.length - 1
  end

  # One normalization for the whole request: FrameworkHelper#current_docs_version is what
  # the views call, and this memoizes its answer for the callbacks and the asset
  # resolution below, which run before any view exists.
  def set_docs_version
    @current_docs_version = helpers.current_docs_version
  end

  def current_docs_version
    @current_docs_version || CURRENT_DOCS_VERSION
  end

  def versioned_docs_request?
    params[:controller] == 'framework' && request.path.start_with?('/framework/docs')
  end

  def compute_docs_released_plugins_urls
    # Version-scoped, so this drops out for the current docs version alone. It used to
    # check the mode before reading the requested version, which handed every frozen
    # track the current build while its page still claimed the old number.
    return nil if docs_use_live_build?

    major, minor = docs_plugins_version_from_request
    unless major
      m = CURRENT_DOCS_VERSION.match(/\A(\d+)\.(\d+)\z/)
      if m
        major = m[1].to_i
        minor = m[2].to_i
      end
    end
    return nil unless major

    semver = latest_semver_with_complete_primary_assets(major, minor:)
    semver ||= latest_semver_with_complete_primary_assets(major)
    return nil unless semver

    minified = Gem::Version.new(semver) >= PROCESSED_BUNDLE_VERSION
    {
      css: "/css/#{semver}/#{minified ? 'plugins.min.css' : 'plugins.css'}",
      js: "/js/#{semver}/#{minified ? 'plugins.min.js' : 'plugins.js'}",
      semver: semver
    }
  end

  # Live serving is scoped to the current docs version. A frozen track documents the
  # release it was cut from, so handing it today's build would show it rules that
  # version never shipped while the page still claims the old number.
  def docs_use_live_build?
    docs_serving_mode.live? && current_docs_version == CURRENT_DOCS_VERSION
  end

  # A logical asset from the live build, or nil when the docs are not serving live.
  # The rescue is the graceful half of the fallback: an asset the build never wrote
  # is a missing style, not a Propshaft::MissingAssetError 500.
  def live_docs_asset_url(logical)
    return nil unless docs_use_live_build?

    helpers.asset_path(logical)
  rescue Propshaft::MissingAssetError
    nil
  end

  # The published copy of a release-relative file, pinned to the semver this docs
  # version resolves to, falling back to css/latest for releases cut before that file
  # shipped. nil when neither is on disk, so the page loses the styling instead of
  # linking a 404 (a mother app with no release archive). Callers whose file only means
  # anything alongside the bundle from the same release pass fallback_to_latest: false.
  def released_docs_asset_url(relative, fallback_to_latest: true)
    semver = docs_released_plugins_urls&.dig(:semver)
    candidates = [semver && "css/#{semver}/#{relative}"]
    candidates << "css/latest/#{relative}" if fallback_to_latest
    released = candidates.compact.find { |rel| Framework.public_root.join(rel).exist? }
    "/#{released}" if released
  end

  def docs_plugins_version_from_request
    return nil unless versioned_docs_request?

    version = current_docs_version
    m = version.match(/\A(\d+)\.(\d+)\z/)
    return nil unless m

    [m[1].to_i, m[2].to_i]
  end

  def latest_semver_with_complete_primary_assets(major, minor: nil)
    list = releases_config[major]
    return nil unless list&.any?

    list.each do |release|
      version = Gem::Version.new(release[:version])
      next if minor && version.segments[1] != minor

      assets = release[:assets]
      has_css = assets.any? { |a| a[:name] == 'plugins.css' && a[:exists] }
      has_js = assets.any? { |a| a[:name] == 'plugins.js' && a[:exists] }
      return release[:version] if has_css && has_js
    end

    nil
  end

  def versioned_docs_component_request?
    versioned_docs_request? && action_name != 'docs_index' && action_name != 'example_iframe_config'
  end

  def versioned_docs_template_request?
    versioned_docs_request? && action_name != 'example_iframe_config'
  end

  def validate_versioned_docs_page!
    return if docs_pages.include?(action_name)

    redirect_to framework_docs_index_path(version: current_docs_version)
  end

  def render_versioned_docs_template
    render template: docs_template_for_action
  end

  def docs_template_for_action
    return 'framework_v1/index' if current_docs_version == '1.2' && action_name == 'docs_index'

    if current_docs_version == '2.3' && action_name == 'docs_index'
      return 'framework_v2/docs_index'
    end

    prefix = DOCS_VIEW_PREFIX_BY_VERSION.fetch(current_docs_version)
    # Frozen v3 tracks hold only their diverged pages; everything else still
    # renders the shared current templates.
    if prefix == 'framework_v3_1' && !lookup_context.exists?(action_name, [prefix])
      prefix = 'framework'
    end

    "#{prefix}/#{action_name}"
  end

  def build_releases_config
    css_dir = Framework.public_root.join('css')
    js_dir = Framework.public_root.join('js')

    versions_config = Framework::Version.config
    release_dates = versions_config['versions'].each_with_object({}) do |v, h|
      h[v['number']] = Date.parse(v['released_at']) if v['released_at']
    end

    css_versions = Dir.children(css_dir).grep(SEMVER_PATTERN)
    js_versions = Dir.children(js_dir).grep(SEMVER_PATTERN)
    all_versions = (css_versions + js_versions).uniq

    releases = all_versions.map { |v| build_release_entry(v, css_dir, js_dir, released_at: release_dates[v]) }

    releases
      .sort_by { |r| Gem::Version.new(r[:version]) }
      .reverse
      .group_by { |r| r[:version].split('.').first.to_i }
      .sort_by { |major, _| -major }
      .to_h
  end

  def build_release_entry(version, css_dir, js_dir, options = {})
    released_at = options[:released_at]
    base = Framework.docs_base_url.to_s
    zip_name = "trmnl-framework--#{version}.zip"
    release_notes = Framework::ReleaseNotes.new(version)
    # Brotli siblings start with the 3.2.0 re-cut, so every published version before it has
    # none. Nothing special is needed for that: the listing already prices every asset by
    # whether its file is on disk, and the page renders only the ones that exist.
    bundle = BUNDLE_VARIANTS
    asset_defs = bundle_asset_defs(version, css_dir, js_dir, bundle) +
                 theme_asset_defs(version, css_dir) + [
                   {
                     path: Framework.public_root.join('framework', zip_name),
                     name: zip_name,
                     type: 'zip',
                     variant: 'Bundle',
                     group: 'Release files',
                     url: "/framework/#{zip_name}"
                   }
                 ] + [color_manifest_asset_def(version)] + [
                   {
                     path: release_notes.path,
                     name: "#{version}.md",
                     type: 'markdown',
                     variant: 'Release Notes',
                     group: 'Release files',
                     url: release_notes.url
                   }
                 ]

    assets = asset_defs.map do |file|
      exists = File.exist?(file[:path])
      relative = file[:url] || "/#{file[:type]}/#{version}/#{file[:name]}"
      {
        name: file[:name],
        type: file[:type],
        variant: file[:variant],
        group: file[:group],
        url: relative,
        public_url: "#{base}#{relative}",
        size: exists ? File.size(file[:path]) : nil,
        sha256: exists ? Digest::SHA256.file(file[:path]).hexdigest : nil,
        exists: exists
      }
    end

    { version: version, assets: assets, released_at: released_at, release_notes: release_notes.to_h }
  end

  # The release task publishes the resolved color manifest per version, so the
  # rolling "latest" card pins the same version its zip does.
  def bundle_asset_defs(version, css_dir, js_dir, bundle)
    [
      { path: css_dir.join(version, 'plugins.css'), name: 'plugins.css', type: 'css', variant: bundle[:primary], group: 'Stylesheet' },
      { path: css_dir.join(version, 'plugins.css.gz'), name: 'plugins.css.gz', type: 'css', variant: 'Gzipped', group: 'Stylesheet' },
      { path: css_dir.join(version, 'plugins.css.br'), name: 'plugins.css.br', type: 'css', variant: 'Brotli', group: 'Stylesheet' },
      { path: css_dir.join(version, 'plugins.min.css'), name: 'plugins.min.css', type: 'css', variant: bundle[:alias], group: 'Stylesheet' },
      { path: css_dir.join(version, 'plugins.min.css.gz'), name: 'plugins.min.css.gz', type: 'css', variant: "#{bundle[:alias]} + Gzipped", group: 'Stylesheet' },
      { path: css_dir.join(version, 'plugins.min.css.br'), name: 'plugins.min.css.br', type: 'css', variant: "#{bundle[:alias]} + Brotli", group: 'Stylesheet' },
      { path: js_dir.join(version, 'plugins.js'), name: 'plugins.js', type: 'js', variant: bundle[:primary], group: 'JavaScript' },
      { path: js_dir.join(version, 'plugins.js.gz'), name: 'plugins.js.gz', type: 'js', variant: 'Gzipped', group: 'JavaScript' },
      { path: js_dir.join(version, 'plugins.js.br'), name: 'plugins.js.br', type: 'js', variant: 'Brotli', group: 'JavaScript' },
      { path: js_dir.join(version, 'plugins.min.js'), name: 'plugins.min.js', type: 'js', variant: bundle[:alias], group: 'JavaScript' },
      { path: js_dir.join(version, 'plugins.min.js.gz'), name: 'plugins.min.js.gz', type: 'js', variant: "#{bundle[:alias]} + Gzipped", group: 'JavaScript' },
      { path: js_dir.join(version, 'plugins.min.js.br'), name: 'plugins.min.js.br', type: 'js', variant: "#{bundle[:alias]} + Brotli", group: 'JavaScript' }
    ]
  end

  def theme_asset_defs(version, css_dir)
    Framework::Themes.ids.flat_map do |theme_id|
      theme_name = Framework::Themes::NAMES_BY_ID.fetch(theme_id)
      [
        { path: css_dir.join(version, 'themes', "#{theme_id}-theme.css"), name: "themes/#{theme_id}-theme.css", type: 'css', variant: "#{theme_name} Theme", group: 'Themes' },
        { path: css_dir.join(version, 'themes', "#{theme_id}-theme.css.gz"), name: "themes/#{theme_id}-theme.css.gz", type: 'css', variant: "#{theme_name} Theme (Gzipped)", group: 'Themes' },
        { path: css_dir.join(version, 'themes', "#{theme_id}-theme.css.br"), name: "themes/#{theme_id}-theme.css.br", type: 'css', variant: "#{theme_name} Theme (Brotli)", group: 'Themes' }
      ]
    end
  end

  def color_manifest_asset_def(version)
    {
      path: Framework.public_root.join('framework', 'colors', version, COLOR_MANIFEST_NAME),
      name: COLOR_MANIFEST_NAME,
      type: 'json',
      variant: 'Color Manifest',
      group: 'Release files',
      url: "/framework/colors/#{version}/#{COLOR_MANIFEST_NAME}"
    }
  end
end
