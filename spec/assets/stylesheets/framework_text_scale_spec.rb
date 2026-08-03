# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Framework text scale styles' do
  subject(:css) { FrameworkBuild.plugins_css }

  it 'publishes every text scale modifier through one input' do
    {
      small: '0.8', regular: '1', large: '1.25',
      xlarge: '1.5'
    }.each do |name, value|
      expect(css).to match(/\.screen--text-scale-#{name}\{--modifier-text-scale:\s*#{Regexp.escape(value)}\}/)
    end

    expect(css).not_to include('.screen--text-scale-xxsmall')
    expect(css).not_to include('.screen--text-scale-xsmall')
    expect(css).not_to include('.screen--text-scale-xxlarge')
  end

  it 'composes text scale with the existing UI output' do
    expect(css).to match(/\.trmnl \.screen\{[^}]*--text-ui-scale:\s*calc\(var\(--ui-scale\) \* var\(--modifier-text-scale\)\)/)
  end

  it 'scales framework typography and pixel line heights through text UI scale' do
    expect(css).to match(/\.trmnl \.screen\{[^}]*--value-font-size:\s*calc\(38px \* var\(--text-ui-scale\)\)/)
    expect(css).to match(/\.trmnl \.screen\{[^}]*--value-line-height:\s*calc\(42px \* var\(--text-ui-scale\)\)/)
    expect(css).to match(/\.trmnl \.screen\{[^}]*--font-xxlarge-font-size:\s*calc\(38px \* var\(--text-ui-scale\)\)/)
  end

  it 'leaves text strokes and interface geometry on Scale' do
    expect(css).to match(/--title-bar-text-stroke-width:\s*calc\(3\.5px\s*\*\s*var\(--ui-scale\)\)/)
    expect(css).to match(/--title-bar-padding-top:\s*calc\(5px\s*\*\s*var\(--ui-scale\)\)/)
    expect(css).not_to match(/--title-bar-padding-top:[^;]*var\(--text-ui-scale\)/)
    expect(css).to match(/\.item \.meta \.index\{--tn-shadow-stroke-width:\s*calc\(3\.5px\s*\*\s*var\(--ui-scale, 1\)\)/)
    expect(css).to match(/\.table tbody tr td \.meta \.index\{--tn-shadow-stroke-width:\s*calc\(3\.5px\s*\*\s*var\(--ui-scale, 1\)\)/)
    expect(css).to match(/\.trmnl \.screen\{[^}]*--title-bar-image-height:\s*calc\(28px\s*\*\s*var\(--ui-scale\)\)/)
  end

  it 'scales the compact title bar height on the screen' do
    expect(css).to match(/\.trmnl \.screen\{[^}]*--title-bar-small-height:\s*calc\(32px\s*\*\s*var\(--ui-scale\)\)/)
  end

  it 'scales the compact title bar image height on the screen' do
    expect(css).to match(/\.trmnl \.screen\{[^}]*--title-bar-small-image-height:\s*calc\(24px\s*\*\s*var\(--ui-scale\)\)/)
  end
end
