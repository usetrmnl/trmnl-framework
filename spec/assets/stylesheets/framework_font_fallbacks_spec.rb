# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Framework font fallbacks' do
  subject(:fallbacks) { Framework::FontFallbacks }

  let(:root) { Framework::Engine.root }

  it 'publishes the stylesheet the generator computes now' do
    expect(root.join('app/assets/stylesheets/framework/config/_font_fallbacks.scss').read).to end_with(fallbacks.css)
  end

  it 'publishes the unversioned copy the generator computes now' do
    expect(root.join('public/fonts/fallbacks.css').read).to eq(fallbacks.css)
  end

  # Inter is an outline font at full size, so the browser's own fallbacks already match it.
  it 'sizes fallbacks for every pixel family' do
    declared = root.join('app/assets/stylesheets/framework/config/_fonts.scss').read.scan(/font-family: '([^']+)'/).flatten.uniq

    expect(declared - ['Inter Variable']).to match_array(fallbacks::FAMILIES.keys)
  end
end
