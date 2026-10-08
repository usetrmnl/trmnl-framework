# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Framework font fallbacks' do
  subject(:fallbacks) { Framework::FontFallbacks }

  let(:root) { Framework::Engine.root }
  let(:han) { fallbacks::SCRIPTS.fetch('han') }

  def sources(names) = names.map { |name| "local('#{name}')" }.join(', ')

  it 'publishes the stylesheet the generator computes now' do
    expect(root.join('app/assets/stylesheets/framework/config/_font_fallbacks.scss').read).to end_with(fallbacks.css)
  end

  it 'publishes the unversioned copy the generator computes now' do
    expect(root.join('public/fonts/fallbacks.css').read).to eq(fallbacks.css)
  end

  Framework::FontFallbacks.variants.each do |variant|
    it "publishes the #{variant} copy the generator computes now" do
      expect(root.join("public/fonts/fallbacks-#{variant}.css").read).to eq(fallbacks.css(variant:))
    end

    it "swaps only the Han fonts in the #{variant} copy" do
      fonts = han.dig(:variants, variant)
      expected = fallbacks.css.gsub(sources(han[:bold]), sources(fonts[:bold])).gsub(sources(han[:regular]), sources(fonts[:regular]))

      expect(fallbacks.css(variant:)).to eq(expected)
    end
  end

  it 'sizes fallbacks for every font family' do
    declared = root.join('app/assets/stylesheets/framework/config/_fonts.scss').read.scan(/font-family: '([^']+)'/).flatten.uniq

    expect(declared).to match_array(fallbacks::FAMILIES.keys)
  end
end
