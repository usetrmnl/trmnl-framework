# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Framework ellipsis overflow' do
  subject(:css) { FrameworkBuild.plugins_css }

  # A mixin included after overflow: hidden (the text stroke sets visible) silently turns text-overflow off.
  it 'never leaves an ellipsis rule with visible overflow' do
    rules = css.split('}').filter_map do |rule|
      selector, body = rule.split('{', 2)
      next unless body&.include?('text-overflow:ellipsis')

      selector.strip if body.scan(/(?<![-\w])overflow:([a-z]+)/).flatten.last == 'visible'
    end

    expect(rules).to be_empty
  end
end
