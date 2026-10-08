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

  it 'publishes the Japanese copy the generator computes now' do
    expect(root.join('public/fonts/fallbacks-ja.css').read).to eq(fallbacks.css(japanese: true))
  end

  it 'swaps only the Han fonts for Japanese ones in the Japanese copy' do
    expect(fallbacks.css(japanese: true)).to eq(fallbacks.css.gsub('CJK SC', 'CJK JP').gsub('CJKsc', 'CJKjp'))
  end

  it 'sizes fallbacks for every font family' do
    declared = root.join('app/assets/stylesheets/framework/config/_fonts.scss').read.scan(/font-family: '([^']+)'/).flatten.uniq

    expect(declared).to match_array(fallbacks::FAMILIES.keys)
  end
end
