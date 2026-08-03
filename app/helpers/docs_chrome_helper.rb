# Tailwind class-string helpers the framework docs chrome uses, extracted verbatim
# from core app/helpers/application_helper.rb. Keep bodies identical to core so the
# docs render pixel-identically; sync when core styling changes.
# rubocop:disable Metrics/ModuleLength
module DocsChromeHelper
  CANONICAL_TRACKING_PARAMS = %w[
    ref utm_source utm_medium utm_campaign utm_term utm_content
    fbclid gclid mc_cid mc_eid
  ].freeze

  def canonical_url
    return @canonical_url if @canonical_url.present?

    query = request.query_parameters.except(*CANONICAL_TRACKING_PARAMS)
    base = "#{request.base_url}#{request.path}"
    query.present? ? "#{base}?#{query.to_query}" : base
  end

  def layout_application
    "flex justify-center bg-gray-100 dark:bg-gray-800 max-w-full overflow-x-hidden"
  end

  def layout_framework_classes
    'flex flex-col w-full justify-center pb-20 sm:pb-36'
  end

  def layout_single_col_classes
    'flex flex-grow flex-col gap-6 justify-center px-4 md:px-8'
  end

  def layout_framework_content_classes
    'flex flex-grow flex-col gap-6 justify-center px-4 md:px-8 leading-6'
  end

  def menubar_theme_key
    (@menubar_theme || :editor).to_sym
  end

  def menubar_divider(theme: nil)
    key = theme.nil? ? menubar_theme_key : Framework::MenubarTheme.normalize_key(theme)
    tag.div(nil, aria: { hidden: true }, class: Framework::MenubarTheme.fetch(key).divider)
  end

  def menubar_dropdown_trigger_classes(theme: nil)
    key = theme.nil? ? menubar_theme_key : Framework::MenubarTheme.normalize_key(theme)
    Framework::MenubarTheme.fetch(key).dropdown_trigger
  end

  def menubar_dropdown_menu_classes(theme: nil)
    key = theme.nil? ? menubar_theme_key : Framework::MenubarTheme.normalize_key(theme)
    Framework::MenubarTheme.fetch(key).dropdown_menu
  end

  def menubar_dropdown_item_base_classes
    "flex items-center w-full px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors"
  end

  def menubar_dropdown_item_active_classes
    "text-primary-700 dark:text-primary-300 font-semibold bg-primary-50 dark:bg-primary-900/30 " \
      "hover:bg-primary-100 dark:hover:bg-primary-900/50"
  end

  def menubar_dropdown_item_inactive_classes
    "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
  end

  def menubar_dropdown_item_classes(active:)
    "#{menubar_dropdown_item_base_classes} #{active ? menubar_dropdown_item_active_classes : menubar_dropdown_item_inactive_classes}"
  end

  def menubar_dropdown_group_label_classes
    "px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-500"
  end

  def menubar_icon_button_classes(padding: "p-1.5")
    "inline-block #{padding} transition-all duration-200 text-sm font-medium tracking-tight rounded-full " \
      "bg-transparent border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 relative"
  end

  def menubar_pill_link_classes
    "inline-block py-1.5 px-2.5 transition-all duration-200 text-xs font-medium tracking-tight rounded-full"
  end

  def menubar_dropdown_chevron
    tag.svg(
      tag.path(nil, stroke: "currentColor", 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "2", d: "m8 10 4 4 4-4"),
      class: "w-3.5 h-3.5 shrink-0 opacity-50", 'aria-hidden': "true",
      xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24"
    )
  end

  def menubar_checkmark_icon(visible: true, data: {})
    tag.svg(
      tag.path(nil, 'stroke-linecap': "round", 'stroke-linejoin': "round", d: "m4.5 12.75 6 6 9-13.5"),
      class: "w-3.5 h-3.5 shrink-0 #{'invisible' unless visible}".strip,
      data: data,
      xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24",
      'stroke-width': "2.5", stroke: "currentColor"
    )
  end

  def layout_framework_title_classes
    'flex-grow z-20 px-4 md:px-8 pt-8 pb-4'
  end

  def nav_classes
    # Centered via auto margins (left-0 right-0 mx-auto), NOT a transform, so the
    # CSS `translate` property stays free for the bulk-select slide animation
    # (html[data-bulk-active] [data-bottom-nav] { translate: 0 150% }). Centering
    # with -translate-x-1/2 would collide and make the nav slide in from the side.
    'nav-glass fixed left-0 right-0 mx-auto w-fit bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 max-w-[calc(100vw-1.5rem)] overflow-x-auto rounded-full bg-gray-100/75 dark:bg-gray-850/75 scrollbar-hide sm:bottom-6'
  end

  def nav_icon_classes
    'w-[20px] h-[20px] sm:w-8 sm:h-8 md:w-10 md:h-10 stroke-[2.5] sm:stroke-[2] md:stroke-[1.75]'
  end

  def nav_link_classes(*_paths)
    'nav-link relative z-[1] flex shrink-0 items-center justify-center px-3 py-2 md:px-4 md:py-2.5 rounded-full text-sm tracking-wide font-medium text-gray-700 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-500 transition-colors duration-150'
  end

  def nav_link_text_classes
    'ml-2 link-text hidden hover:xl:inline'
  end

  def button_small_classes
    'font-medium rounded-lg text-xs px-2 py-1 inline-flex items-center transition duration-150 justify-center shrink-0 gap-1.5 whitespace-nowrap'
  end

  def playlist_bar_control_base_classes
    'h-9 rounded-lg text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800'
  end

  def playlist_bar_control_ghost_classes
    'text-gray-700 dark:text-gray-200 bg-transparent hover:bg-gray-200/70 dark:hover:bg-gray-800/80 border border-transparent'
  end

  def playlist_bar_button_classes
    "#{playlist_bar_control_base_classes} #{playlist_bar_control_ghost_classes} cursor-pointer"
  end

  def button_secondary_classes
    'text-primary-500 bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 focus:outline-none'
  end

  def button_sage_solid_classes
    # Lighter than sage-600/800 so the pill reads as sage, not near-black (see tailwind sage scale)
    'text-white dark:text-sage-50 bg-sage-450 dark:bg-sage-700 hover:bg-sage-500 dark:hover:bg-sage-675 focus:outline-none'
  end

  def button_gray_light_classes
    'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none'
  end

  def button_sage_classes
    'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 text-sage-500 bg-transparent hover:text-sage-700 hover:bg-sage-100 dark:text-sage-400 dark:hover:text-sage-200 dark:hover:bg-sage-800'
  end

  def button_sage_active_classes
    'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 text-sage-600 bg-sage-100 hover:bg-sage-200 dark:text-sage-300 dark:bg-sage-700 dark:hover:bg-sage-600'
  end

  def message_classes
    'flex items-center text-blue-700 dark:text-blue-400 rounded-xl bg-blue-100 dark:bg-blue-900 border border-blue-150 dark:border-blue-850 p-2.5 mb-6'
  end

  def tab_sage_classes
    'w-fit flex items-center gap-2 text-sm font-medium text-sage-700 dark:text-sage-300 bg-sage-100/50 dark:bg-sage-850/50 px-3 pt-1.5 pb-4 rounded-t-lg -mb-2.5'
  end

  def tab_gray_classes
    'w-fit flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-175 dark:bg-gray-700/50 px-3 pt-1.5 pb-4 rounded-t-lg -mb-2.5'
  end

  def tab_clay_classes
    'w-fit flex items-center gap-2 text-sm font-medium text-clay-700 dark:text-clay-300 bg-clay-100/50 dark:bg-clay-850/50 px-3 pt-1.5 pb-4 rounded-t-lg -mb-2.5'
  end

  def message_sage_classes
    'flex items-center text-sage-700 dark:text-sage-300 rounded-xl bg-sage-100 dark:bg-sage-850 border border-sage-150 dark:border-sage-850 p-2.5 mb-6'
  end

  def message_warning_classes
    'flex items-center text-yellow-700 dark:text-yellow-400 rounded-xl bg-yellow-100 dark:bg-yellow-900 border border-yellow-150 dark:border-yellow-850 p-2.5 mb-6'
  end

  def message_gray_classes
    'flex items-center text-gray-700 dark:text-gray-250 rounded-xl bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-650 p-2.5 mb-6'
  end

  def message_in_card_classes
    'shrink-0 relative z-10 !rounded-b-none !mb-0 !border-b-0'
  end

  def message_clay_classes
    'flex items-center text-clay-700 dark:text-clay-300 rounded-xl bg-clay-100 dark:bg-clay-850 border border-clay-150 dark:border-clay-850 p-2.5 mb-6'
  end

  def card_classes
    'rounded-xl bg-gray-50 dark:bg-gray-750 shadow-sm dark:shadow-black border border-gray-200 dark:border-gray-650'
  end

  def table_classes
    'flex flex-col overflow-hidden rounded-xl border border-gray-300 dark:border-gray-650 min-h-[74px]'
  end

  def framework_page_title_classes
    'text-2xl font-semibold text-gray-900 dark:text-white mb-6'
  end

  def framework_section_title_classes
    'text-xl font-medium text-gray-900 dark:text-white mb-4'
  end

  def framework_section_description_classes
    'text-sm text-gray-700 dark:text-gray-500 mb-8 !leading-7 tracking-[.01em] max-w-[800px]'
  end

  def framework_list_classes
    'text-sm text-gray-700 dark:text-gray-500 !leading-7 tracking-[.01em]'
  end

  def framework_subsection_title_classes
    'text-lg font-medium text-gray-800 dark:text-gray-100 mb-3'
  end

  def framework_subsection_description_classes
    'text-sm text-gray-700 dark:text-gray-500 mb-8 !leading-7 tracking-[.01em] max-w-[800px]'
  end

  def framework_card_content_classes
    'text-sm text-gray-700 dark:text-gray-500 !leading-7 tracking-[.01em]'
  end

  def framework_subsubsection_title_classes
    'text-md font-medium text-gray-700 dark:text-gray-200 mb-2'
  end

  def framework_example_classes
    'flex overflow-visible -mx-8 md:-mx-16 lg:-mx-8 !-mb-6 px-4 md:px-8 lg:px-0 pb-0 md:pb-0 lg:pb-0'
  end

  def framework_example_inner_classes
    'overflow-x-auto w-full px-4 md:px-8 pt-2 pb-10'
  end

  def framework_example_wrapper_classes
    base = 'w-fit overflow-hidden shadow shadow-xl rounded-2xl'
    return base if params[:controller] == 'framework' && params[:action] == 'responsive_test'

    "trmnl-example #{base}"
  end

  # Docs pages whose demos are inline in the page body instead of .trmnl-example
  # iframes: they mix docs chrome classes with framework classes, so the parent
  # page must load the framework CSS for them. Value lists the docs versions with
  # inline markup; nil means every version that serves the page.
  INLINE_FRAMEWORK_DEMO_PAGES = {
    'colors' => nil,
    'size' => nil,
    'background' => %w[2.3]
  }.freeze

  def docs_page_renders_inline_framework_demos?
    return false unless params[:controller] == 'framework'

    versions = INLINE_FRAMEWORK_DEMO_PAGES.fetch(params[:action]) { return false }
    versions.nil? || versions.include?(current_docs_version)
  end

  def framework_section_code_classes
    'framework-section-code text-xs px-1 py-0.5 rounded text-syntax-string bg-syntax-string-bg border border-syntax-string-border'
  end

  def framework_badge_base_classes
    'inline-flex items-center px-2.5 py-0.5 gap-1 rounded-full text-[11px] font-semibold uppercase tracking-wide'
  end

  def framework_badge_sm_base_classes
    'inline-flex items-center px-1.5 py-1 gap-0.5 rounded-full text-[9px] leading-none font-semibold uppercase tracking-wide'
  end

  def framework_badge_active_classes
    "#{framework_badge_base_classes} bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-50"
  end

  def framework_badge_disabled_classes
    "#{framework_badge_base_classes} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-600"
  end

  def framework_badge_auto_classes
    "#{framework_badge_base_classes} badge-border-3d-blue text-blue-700 dark:text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.4)] dark:shadow-[0_0_12px_rgba(96,165,250,0.6)]"
  end

  def framework_docs_support_yes_classes
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-200'
  end

  def framework_docs_support_no_classes
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-gray-400 border border-gray-200 bg-transparent dark:text-gray-500 dark:border-gray-650 dark:bg-transparent'
  end

  def framework_docs_support_auto_classes
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  end

  def framework_docs_support_pill_icon_classes
    'inline-flex shrink-0 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:shrink-0 [&>svg]:mx-0'
  end

  def framework_badge_primary_classes
    "#{framework_badge_base_classes} badge-border-3d-primary text-primary-700 dark:text-primary-300"
  end

  def framework_badge_primary_sm_classes
    "#{framework_badge_sm_base_classes} badge-border-3d-primary text-primary-700 dark:text-primary-300"
  end

  def framework_badge_sage_sm_muted_classes
    "#{framework_badge_sm_base_classes} badge-border-3d-sage text-sage-600 dark:text-sage-400"
  end

  def framework_card_link_classes
    "#{card_classes} block focus:outline-none ring-2 ring-transparent hover:ring-offset-2 hover:ring-primary-300 dark:hover:ring-primary-900 hover:border-transparent focus:border-transparent focus:ring-2 ring-offset-gray-200 dark:ring-offset-gray-950 focus:ring-offset-2 focus:ring-offset-gray-200 dark:focus:ring-offset-gray-950 focus:ring-primary-500 focus:border-transparent active:ring-primary-500 dark:active:ring-primary-500 active:border-transparent transition-color duration-150 p-3"
  end

  def framework_card_link_classes_sage
    "#{card_classes} block focus:outline-none ring-2 ring-transparent hover:ring-offset-2 hover:ring-sage-300 dark:hover:ring-sage-800 hover:border-transparent focus:border-transparent focus:ring-2 ring-offset-gray-200 dark:ring-offset-gray-950 focus:ring-offset-2 focus:ring-offset-gray-200 dark:focus:ring-offset-gray-950 focus:ring-sage-500 focus:border-transparent active:ring-sage-500 dark:active:ring-sage-500 active:border-transparent transition-color duration-150 p-3"
  end

  def theme_classes(theme, light:, dark:)
    theme = (theme || "light").to_s
    case theme
    when "system"
      dark_prefixed = dark.split.map { |cls| "dark:#{cls}" }.join(" ")
      "#{light} #{dark_prefixed}"
    when "dark" then dark
    else light
    end
  end

  def theme_text_color(theme = "light")
    theme_classes(theme, light: "text-black", dark: "text-white")
  end
end
# rubocop:enable Metrics/ModuleLength
