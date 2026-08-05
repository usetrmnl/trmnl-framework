# frozen_string_literal: true

require 'rails_helper'

# An Item dims its labels to the secondary text paint on the device depths, and
# that paint lays its under-color over whatever the element painted beneath it.
# For the pill-style modifiers the element layer's background IS the styling, so
# the dimming has to sit them out entirely: a text-channel repaint at item
# specificity once turned label--inverted into white text on a transparent pill.
RSpec.describe 'Framework item label paint' do
  subject(:css) { FrameworkBuild.plugins_css }

  # Every modifier that paints its own label background at the element layer:
  # the filled pair plus the semantic color roles.
  def pill_modifiers = %w[label--filled label--inverted label--primary label--success label--error label--warning]

  # The item-content label rules the compiled bundle emits, anchored at the
  # previous rule's brace so the scan stays linear over the compressed bundle.
  def item_label_rules
    @item_label_rules ||= css.scan(/[{}]([^{}]*\.item \.content \.label[^{}]*)\{([^}]*)\}/)
  end

  it 'excludes every pill modifier from the item label dimming rule' do
    dim_rules = item_label_rules.select { |_sel, body| body.include?('text-secondary-text-under') }
    expect(dim_rules).not_to be_empty
    dim_rules.each do |selectors, _body|
      pill_modifiers.each do |modifier|
        expect(selectors).to include("[class*=#{modifier}]")
      end
    end
  end

  it 'repaints no pill modifier with a text channel at item specificity' do
    offenders = item_label_rules.select do |selectors, body|
      pill_modifiers.any? { |modifier| selectors.include?(".#{modifier}") } && body.include?('-text-under')
    end
    expect(offenders.map(&:first)).to be_empty
  end
end
