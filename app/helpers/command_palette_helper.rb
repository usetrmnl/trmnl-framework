module CommandPaletteHelper
  # CSS Classes for Command Palette components
  COMMAND_PALETTE_CLASSES = {
    # Main container
    backdrop: 'absolute inset-0 bg-gray-100/40 dark:bg-gray-850/40 backdrop-blur-[2px] transition-opacity',
    panel: 'flex min-h-0 w-full max-w-3xl flex-col divide-y divide-gray-100 overflow-hidden rounded-xl bg-gray-25 shadow-xl outline outline-1 outline-black/5 dark:divide-gray-700 dark:bg-gray-850 dark:-outline-offset-1 dark:outline-gray-700',

    # Search input
    search_icon: 'pointer-events-none col-start-1 row-start-1 ml-4 w-5 h-5 self-center text-gray-400 dark:text-gray-500',
    input: 'flex-auto min-h-6 w-px min-w-0 cursor-text overflow-hidden whitespace-nowrap text-base leading-6 text-gray-900 sm:text-sm sm:leading-5 bg-transparent dark:bg-transparent dark:text-white border-0 focus:border-0 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus:shadow-none',

    # Pills
    pill: 'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-500 border border-gray-200 dark:border-gray-650',

    # Provider indicators
    provider_indicator_base: 'w-8 h-8 rounded-full flex items-center justify-center ring-1 transition-colors',
    provider_indicator_inactive: 'ring-gray-300 dark:ring-white/20 text-gray-400 dark:text-gray-500 bg-transparent',
    provider_indicator_active: 'text-white ring-sage-500/50 dark:ring-sage-500/40 bg-sage-600 dark:bg-sage-500',

    # Keyboard hints
    kbd: 'mx-1 flex h-5 items-center justify-center rounded-xl bg-white px-2 text-gray-900 dark:bg-gray-850 dark:text-gray-400 inline-flex',
    kbd_small: 'mx-1 flex h-5 px-2 items-center justify-center rounded-xl bg-white px-1 text-sage-600 dark:bg-gray-800 dark:text-sage-400 inline-flex text-xs',

    # Empty state
    empty: 'px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400'
  }.freeze

  # Returns the standardized class list for command palette items
  def command_palette_item_classes(hidden: false)
    base = 'group flex cursor-default items-center rounded-2xl p-2 select-none text-gray-700 dark:text-gray-300 aria-selected:bg-sage-75/80 dark:aria-selected:bg-sage-850 aria-selected:ring-1 aria-selected:ring-sage-100 dark:aria-selected:ring-sage-800 aria-selected:text-sage-700 dark:aria-selected:text-sage-400'
    hidden ? "#{base} hidden" : base
  end

  # Returns standardized classes for provider section headers
  def command_palette_section_header_classes
    'mb-2 mt-3 text-xs font-medium text-gray-600 dark:text-gray-400'
  end

  # Returns classes for a specific component
  def command_palette_class(component)
    COMMAND_PALETTE_CLASSES[component] || ''
  end

  # Render a provider section header with consistent styling and data attributes
  def command_palette_section_header(title)
    tag.h3(title,
           class: command_palette_section_header_classes,
           data: { 'command-palette-target': 'sectionHeader', group: title })
  end

  # Build normalized html_data for command palette items.
  # Ensures consistent string keys and hyphenated data attributes.
  def command_item_html_data(key:, title:, **opts)
    description = opts.fetch(:description, nil)
    group = opts.fetch(:group, nil)
    beta = opts.fetch(:beta, false)
    href = opts.fetch(:href, nil)
    extra = opts.fetch(:extra, {}) || {}

    data = {}
    data['key'] = key
    data['title'] = title
    data['description'] = description.to_s if description
    data['group'] = group if group
    data['beta'] = beta ? 'true' : 'false'
    data['href'] = href if href
    extra.each do |k, v|
      k_str = k.to_s.tr('_', '-')
      data[k_str] = v.is_a?(TrueClass) || v.is_a?(FalseClass) ? v.to_s : v
    end
    data
  end

  # Render action hints for command palette items
  def command_item_action_hints(html_data)
    has_scope = html_data && (html_data['scope-id'] || html_data[:'scope-id'])
    has_device = html_data && (html_data['device-id'] || html_data[:'device-id'])
    select_action = html_data && (html_data['select-action'] || html_data[:'select-action'])
    switch_on_select = select_action == 'switch-device'

    kbd_class = command_palette_class(:kbd_small)
    enter_kbd = content_tag(:kbd, 'enter', class: kbd_class)
    tab_kbd = content_tag(:kbd, 'tab', class: kbd_class)

    if has_scope
      "Open #{enter_kbd} · Show all #{tab_kbd}".html_safe
    elsif has_device && switch_on_select
      "Switch #{enter_kbd} · #{tab_kbd}".html_safe
    elsif has_device
      "Open #{enter_kbd} · Switch #{tab_kbd}".html_safe
    else
      enter_kbd
    end
  end

  # Render a command palette item with normalized data attributes.
  def command_item(title:, key:, **opts)
    icon_partial = opts.fetch(:icon_partial, nil)
    icon_locals = opts.fetch(:icon_locals, {})
    icon_html = opts.fetch(:icon_html, nil)
    description = opts.fetch(:description, nil)
    href = opts.fetch(:href, '#')
    group = opts.fetch(:group, nil)
    beta = opts.fetch(:beta, false)
    hidden = opts.fetch(:hidden, false)
    extra_data = opts.fetch(:extra_data, {})
    extra_inner_html = opts.fetch(:extra_inner_html, nil)

    html_data = command_item_html_data(key: key, title: title, description: description, group: group, beta: beta, href: href, extra: extra_data)
    render 'shared/command_providers/command_palette_item',
           hidden: hidden,
           icon_partial: icon_partial,
           icon_locals: icon_locals,
           icon_html: icon_html,
           title_text: title,
           description_text: description,
           href: href,
           html_data: html_data,
           extra_inner_html: extra_inner_html
  end

  # Render an icon partial with per-request memoization to avoid repeated
  # partial renders for identical icons within a single palette render.
  def render_command_icon(icon_partial, icon_locals = {})
    return nil unless icon_partial

    # NOTE: the palette is yielded twice per page, so icons dedup via the sprite.
    name = icon_partial.to_s.delete_prefix('shared/icons/')
    return sprite_icon(name, classes: icon_locals[:classes]) if sprite_command_icon?(name, icon_locals)

    legacy_inline_command_icon(icon_partial, icon_locals)
  end

  def sprite_command_icon?(name, icon_locals)
    icon_locals.except(:classes).empty? && lookup_context.exists?(name, ['shared/icons'], true)
  end

  def legacy_inline_command_icon(icon_partial, icon_locals)
    @__cp_icon_cache ||= {}
    key = [icon_partial.to_s, icon_locals.to_a.sort]
    return @__cp_icon_cache[key] if @__cp_icon_cache.key?(key)

    @__cp_icon_cache[key] = begin
      begin
        render(icon_partial, icon_locals)
      rescue StandardError
        render(icon_partial)
      end
    rescue StandardError
      nil
    end
  end
end
