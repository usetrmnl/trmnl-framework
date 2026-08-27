# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Framework scale styles' do
  subject(:css) { FrameworkBuild.plugins_css }

  def expect_binding(token, declaration)
    expect(css).to match(/#{Regexp.escape(token)}[^}]+#{Regexp.escape(declaration)}/)
  end

  it 'publishes every scale modifier through one modifier input' do
    {
      xxsmall: '0.66', xsmall: '0.75', small: '0.875', regular: '1',
      large: '1.125', xlarge: '1.25', xxlarge: '1.5'
    }.each do |name, value|
      expect(css).to match(/\.screen--scale-#{name}\{--modifier-scale:\s*#{Regexp.escape(value)}\}/)
    end
  end

  it 'composes device density and modifier scale into the public outputs' do
    expect(css).to match(/\.trmnl \.screen\{[^}]*--ui-scale:\s*calc\(var\(--device-ui-scale\) \* var\(--modifier-scale\)\)/)
    expect(css).to match(
      /\.trmnl \.screen\{[^}]*--content-scale:\s*calc\(var\(--modifier-scale\) \* var\(--framework-layout-whitespace-factor, 1\)\)/
    )
    expect(css).to match(/\.screen--amazon_kindle_2024\{[^}]*--device-ui-scale:\s*0?\.8/)
  end

  it 'scales screen gaps with the explicit content scale' do
    expect(css).to match(/\.trmnl \.screen\{[^}]*--gap:\s*calc\(10px \* var\(--gap-scale\) \* var\(--content-scale\)\)/)
  end

  it 'scales pixel-based spacing and size utilities' do
    expect_binding('.lg\\:p--10', '--tn-p:calc(40px * var(--content-scale, 1))')
    expect_binding('.lg\\:w--64', '--tn-size-w:calc(256px * var(--content-scale, 1))')
    expect_binding('.lg\\:w--\\[40px\\]', '--tn-size-w:calc(40px * var(--content-scale, 1))')
    # Base class, not a gated one: arbitrary gaps carry no variants, which
    # framework_arbitrary_value_spec.rb pins. The sibling w--[40px] above keeps
    # a gated arbitrary value in this example.
    expect_binding('.gap--\\[10px\\]', '--tn-gap:calc(10px * var(--content-scale, 1))')
  end

  it 'leaves relative size utilities unchanged' do
    expect_binding('.portrait\\:h--\\[60cqh\\]', '--tn-size-h:60cqh')
  end

  it 'scales framework image, grid, and flex pixel presets' do
    expect(css).to match(/\.basis--20\{flex-basis:calc\(80px\s*\*\s*var\(--content-scale, 1\)\)\}/)
    expect(css).to match(/\.grid--min-32\{--grid-col-min:\s*calc\(128px\s*\*\s*var\(--content-scale, 1\)\)\}/)
    expect(css).to include('minmax(var(--grid-col-min, calc(160px * var(--content-scale))), 1fr)')
    expect(css).to match(/img\.image\.image--small\{max-width:calc\(80px\s*\*\s*var\(--content-scale\)\)\}/)
  end

  it 'scales rounded utilities, component geometry, and public strokes' do
    expect(css).to match(
      /\.trmnl \.screen\{[^}]*--rounded:\s*calc\(10px \* var\(--content-scale\) \* var\(--framework-layout-corner-factor, 1\)\)/
    )
    expect(css).to match(
      /\.trmnl \.screen\{[^}]*--progress-bar-height-xsmall:\s*calc\(6px\s*\*\s*var\(--ui-scale\)\s*\*\s*var\(--framework-layout-progress-factor, 1\)\)/
    )
    expect(css).to match(/\.rounded--\\\[10px\\\]\{border-radius:calc\(10px\s*\*\s*var\(--content-scale, 1\)\)/)
    expect(css).to match(/\.item\{[^}]*gap:calc\(2px\s*\*\s*var\(--ui-scale, 1\)\)/)
    expect(css).to match(/--tn-text-stroke-width:\s*calc\(3\.5px\s*\*\s*var\(--content-scale, 1\)\)/)
    # Both stroke families bind a scaled width and read it back in the program,
    # so the scale reaches the ring through the channel rather than through a
    # literal length repeated in every rule.
    expect(css).to match(/--tn-image-stroke-width:\s*calc\(1\.5px\s*\*\s*var\(--content-scale, 1\)\)/)
    expect(css).to include('drop-shadow(var(--tn-image-stroke-width, 1.5px) var(--tn-image-stroke-width, 1.5px)')
  end

  it 'emits a unit fallback from the scale token functions for older pinned bundles' do
    expect(css).to include('var(--content-scale, 1)')
    expect(css).to include('var(--ui-scale, 1)')
  end

  it 'keeps physical-pixel rails fixed' do
    expect(css).to match(/\.border--h-black::before\{[^}]*height:1px/)
    expect(css).to match(/\.label--underline::after\{[^}]*height:1px/)
  end
end
