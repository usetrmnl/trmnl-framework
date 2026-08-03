# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Framework mashup styles' do
  subject(:css) { FrameworkBuild.plugins_css }

  it 'publishes fixed placement modifiers for fluid mashups' do
    (1..3).each do |track|
      expect(css).to include(".mashup--3x3>.mashup-cell--col-#{track}{grid-column-start:#{track}}")
      expect(css).to include(".mashup--3x3>.mashup-cell--col-span-#{track}{grid-column-end:span #{track}}")
      expect(css).to include(".mashup--3x3>.mashup-cell--row-#{track}{grid-row-start:#{track}}")
      expect(css).to include(".mashup--3x3>.mashup-cell--row-span-#{track}{grid-row-end:span #{track}}")
    end
  end
end
