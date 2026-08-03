# frozen_string_literal: true

class FrameworkDocsSectionComponent < ViewComponent::Base
  VARIANTS = { regular: :regular, compact: :compact }.freeze

  def initialize(group:, pages:, **options)
    super()
    description = options.fetch(:description, nil)
    variant = options.fetch(:variant, :regular)
    compact_grid_cols = options.fetch(:compact_grid_cols, 8)
    max_items = options[:max_items]
    split_header = options.fetch(:split_header, false)

    all_pages = Array(pages)
    @group = group.to_s
    @pages = max_items ? all_pages.first(max_items) : all_pages
    @omitted_count = max_items ? [all_pages.size - max_items, 0].max : 0
    @title = options.fetch(:title) { FrameworkHelper.docs_group_label(@group) }
    @description = description.to_s
    @variant = VARIANTS[variant] || :regular
    @compact_grid_cols = compact_grid_cols
    @split_header = split_header
  end

  def compact?
    @variant == :compact
  end

  def compact_grid_classes
    if @compact_grid_cols == 4
      'md:grid-cols-2 gap-4'
    else
      'md:grid-cols-3 lg:grid-cols-6 gap-4'
    end
  end
end
