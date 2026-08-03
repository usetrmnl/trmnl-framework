# frozen_string_literal: true

class FrameworkComparisonComponent < ViewComponent::Base
  VARIANTS = {
    platform_vs_custom: :platform_vs_custom,
    do_vs_dont: :do_vs_dont,
    classic_vs_trmnl: :classic_vs_trmnl
  }.freeze

  renders_one :left_message
  renders_one :right_message
  renders_one :left_code
  renders_one :right_code

  # rubocop:disable Lint/MissingSuper
  def initialize(variant: :platform_vs_custom)
    @variant = VARIANTS[variant] || :platform_vs_custom
  end
  # rubocop:enable Lint/MissingSuper

  def platform_vs_custom?
    @variant == :platform_vs_custom
  end

  def classic_vs_trmnl?
    @variant == :classic_vs_trmnl
  end

  def left_tab_classes
    helpers.tab_sage_classes
  end

  def right_tab_classes
    platform_vs_custom? ? helpers.tab_gray_classes : helpers.tab_clay_classes
  end

  def left_message_classes
    "#{helpers.message_sage_classes} #{helpers.message_in_card_classes}"
  end

  def right_message_classes
    base = platform_vs_custom? ? helpers.message_gray_classes : helpers.message_clay_classes
    "#{base} #{helpers.message_in_card_classes}"
  end
end
