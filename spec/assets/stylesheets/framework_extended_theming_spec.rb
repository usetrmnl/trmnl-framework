# frozen_string_literal: true

require 'rails_helper'

# The 3.3 theme contract closes every gap a theme previously had to reach
# around with raw geometry or typography declarations: title-bar inks get
# their own slots, structure moves through --framework-layout-* factors, and
# the vector weight ladder takes one shift variable. Everything here is
# consumption-side wiring, so the compiled bundle is where the contract is
# visible: a chain that stops naming its slot silently strands every theme
# that set it.
RSpec.describe 'Framework extended theming contract' do
  subject(:css) { FrameworkBuild.plugins_css }

  # The declarations of every rule whose selector list matches the matcher.
  def declarations_for(matcher)
    css.scan(/(?:\A|(?<=\}))([^{}]*)\{([^{}]*)\}/)
       .select { |selectors, _| selectors.match?(matcher) }
       .map(&:last)
  end

  describe 'title-bar ink slots' do
    it 'resolves the bar ink through the title-bar text slot before text-primary' do
      expect(declarations_for(/\.title_bar(?![\w-])/).join)
        .to include('color:var(--framework-slot-title-bar-text-solid,')
    end

    it 'paints the title glyph fields through the title-bar text slot' do
      title_rules = declarations_for(/\.title_bar[^{]*\.title(?![\w-])/).join

      expect(title_rules).to include('background-color:var(--framework-slot-title-bar-text-under,')
      expect(title_rules).to include('background-image:var(--framework-slot-title-bar-text-image,')
      expect(title_rules).to include('background-clip:var(--framework-slot-title-bar-text-clip,')
    end

    it 'lets the instance ink diverge from the title ink before following it' do
      instance_rules = declarations_for(/\.title_bar[^{]*\.instance(?![\w-])/).join

      expect(instance_rules)
        .to include('color:var(--framework-slot-title-bar-instance-text-solid, var(--framework-slot-title-bar-text-solid,')
      expect(instance_rules)
        .to include('background-color:var(--framework-slot-title-bar-instance-text-under, var(--framework-slot-title-bar-text-under,')
    end

    it 'keeps the device text-secondary instance ink behind the instance slot' do
      expect(css).to include(
        'color:var(--framework-slot-title-bar-instance-text-solid, ' \
        'var(--framework-semantic-text-secondary-text-solid,'
      )
    end

    it 'outlines title, instance, and icon with the title-bar stroke slot' do
      bar_rules = declarations_for(/\.title_bar/).join

      expect(bar_rules).to include('var(--framework-slot-title-bar-stroke-color,')
    end

    it 'recolors the adaptive title-bar icon through the icon slot' do
      icon_rules = declarations_for(/\.title_bar[^{]*\.image--adaptive\[data-adaptive\]/).join

      expect(icon_rules).to include('background-color:var(--framework-slot-title-bar-icon-color,')
      expect(icon_rules).to include('var(--framework-slot-title-bar-icon-under,')
    end
  end

  describe 'layout factor slots' do
    it 'rides the whitespace factor on the content scale every gap and pad reads' do
      expect(css).to match(
        /--content-scale:\s*calc\(var\(--modifier-scale\)\s*\*\s*var\(--framework-layout-whitespace-factor, 1\)\)/
      )
    end

    it 'rides the whitespace factor on the table row heights' do
      expect(css).to match(
        /--table-thead-height:\s*calc\(36px\s*\*\s*var\(--ui-scale\)\s*\*\s*var\(--framework-layout-whitespace-factor, 1\)\)/
      )
    end

    it 'rides the meter factor on the progress sizes' do
      expect(css).to match(
        /--progress-bar-height:\s*calc\(24px\s*\*\s*var\(--ui-scale\)\s*\*\s*var\(--framework-layout-meter-factor, 1\)\)/
      )
      expect(css).to match(
        /--progress-dot-size:\s*calc\(16px\s*\*\s*var\(--ui-scale\)\s*\*\s*var\(--framework-layout-meter-factor, 1\)\)/
      )
    end

    it 'rides the corner factor on the rounding scale, not the pill or the square' do
      expect(css).to match(
        /--rounded:\s*calc\(10px\s*\*\s*var\(--content-scale\)\s*\*\s*var\(--framework-layout-corner-factor, 1\)\)/
      )
      expect(css).to match(/--rounded-none:\s*0px/)
      expect(css).to match(/--rounded-full:\s*9999px/)
    end

    it 'rides the corner factor on the radius variables components own' do
      expect(css).to match(
        /--title-bar-border-radius:\s*calc\(10px\s*\*\s*var\(--ui-scale\)\s*\*\s*var\(--framework-layout-corner-factor, 1\)\)/
      )
      expect(css).to match(
        /--progress-bar-radius:\s*calc\(10px\s*\*\s*var\(--ui-scale\)\s*\*\s*var\(--framework-layout-corner-factor, 1\)\)/
      )
    end

    it 'rides the corner factor on the hard-coded component radii' do
      # The label pill and the view frame were literal ui-scaled radii a theme
      # could not move without scoped component rules of its own.
      remaining = css.scan(/border-radius:calc\((?:[2-9]|1[0-9])px\*var\(--ui-scale, 1\)\)/)

      expect(remaining).to be_empty
      expect(css).to include('border-radius:calc(4px*var(--ui-scale, 1)*var(--framework-layout-corner-factor, 1))')
      expect(css).to include('border-radius:calc(7px*var(--ui-scale, 1)*var(--framework-layout-corner-factor, 1))')
    end

    it 'rides the title-bar height factor on the bar and its icon, not its type' do
      expect(css).to match(
        /--title-bar-height:\s*calc\(40px\s*\*\s*var\(--ui-scale\)\s*\*\s*var\(--framework-layout-title-bar-height-factor, 1\)\)/
      )
      expect(css).to match(
        /--title-bar-image-height:\s*calc\(28px\s*\*\s*var\(--ui-scale\)\s*\*\s*var\(--framework-layout-title-bar-height-factor, 1\)\)/
      )
      expect(css).to match(/--title-bar-font-size:\s*calc\(16px\s*\*\s*var\(--text-ui-scale\)\)/)
    end
  end

  describe 'the font weight shift' do
    it 'shifts every vector role weight inside the renderable clamp' do
      expect(css).to include('--title-bar-font-weight: clamp(100, calc(700 + var(--framework-font-weight-shift, 0)), 900)')
      expect(css).to include('--value-peta-font-weight: clamp(100, calc(200 + var(--framework-font-weight-shift, 0)), 900)')
    end

    it 'leaves the bitmap bundles at their single native weights' do
      # A shifted weight on a bitmap face only buys synthetic bolding artifacts,
      # so the shift stops at the vector boundary, exactly where Inter takes over.
      expect(css).to match(/--title-bar-font-family:\s*"TRMNL16"/)
      expect(css.scan(/--label-small-font-weight:\s*400;/)).not_to be_empty
    end
  end
end
