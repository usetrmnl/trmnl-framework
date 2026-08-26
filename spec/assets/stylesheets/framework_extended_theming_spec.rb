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
  # The lookbehind takes `{` as well as `}`: the first rule inside an @layer
  # block follows the block's opening brace, and anchoring on `}` alone
  # silently skipped it.
  def declarations_for(matcher)
    css.scan(/(?:\A|(?<=[{}]))([^{}]*)\{([^{}]*)\}/)
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

    it 'lets the instance halo diverge before following the bar stroke' do
      instance_rules = declarations_for(/\.title_bar[^{]*\.instance(?![\w-])/).join

      expect(instance_rules)
        .to include('var(--framework-slot-title-bar-instance-stroke-color, var(--framework-slot-title-bar-stroke-color,')
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

  describe 'text modifiers' do
    # Case and tracking are theme decisions; size is not. The modifiers ride
    # the elements themselves so a theme never restates a font metric.
    it 'reads case and tracking on the label' do
      label_rules = declarations_for(/\.label(?![\w-])/).join

      expect(label_rules).to include('text-transform:var(--framework-text-label-transform, none)')
      expect(label_rules).to include('letter-spacing:var(--framework-text-label-tracking, normal)')
    end

    it 'reads case and tracking on the value' do
      value_rules = declarations_for(/\.value(?![\w-])/).join

      expect(value_rules).to include('text-transform:var(--framework-text-value-transform, none)')
      expect(value_rules).to include('letter-spacing:var(--framework-text-value-tracking, normal)')
    end

    it 'reads case and tracking on the title' do
      title_rules = declarations_for(/\.title(?![\w-])/).join

      expect(title_rules).to include('text-transform:var(--framework-text-title-transform, none)')
      expect(title_rules).to include('letter-spacing:var(--framework-text-title-tracking, normal)')
    end

    it 'reads tracking on the description' do
      expect(declarations_for(/\.description(?![\w-])/).join)
        .to include('letter-spacing:var(--framework-text-description-tracking, normal)')
    end

    # The bar's title span carries the .title element class, so the two need
    # separate modifiers or a theme's title treatment follows it into the bar.
    it 'keeps the title bar text on its own modifiers, not the title element' do
      bar_title = declarations_for(/\.title_bar[^{]*\.title(?![\w-])/).join
      bar_instance = declarations_for(/\.title_bar[^{]*\.instance(?![\w-])/).join

      expect(bar_title).to include('text-transform:var(--framework-text-title-bar-transform, none)')
      expect(bar_title).to include('letter-spacing:var(--framework-text-title-bar-tracking, normal)')
      expect(bar_instance).to include('text-transform:var(--framework-text-title-bar-instance-transform, none)')
      expect(bar_instance).to include('letter-spacing:var(--framework-text-title-bar-instance-tracking, normal)')
    end

    it 'reads case and tracking on the table head, its own label tier' do
      head_rules = declarations_for(/\.table[^{]*th(?![\w-])/).join

      expect(head_rules).to include('text-transform:var(--framework-text-table-head-transform, none)')
      expect(head_rules).to include('letter-spacing:var(--framework-text-table-head-tracking, normal)')
    end

    it 'reads tracking on the table body' do
      expect(declarations_for(/\.table[^{]*td(?![\w-])/).join)
        .to include('letter-spacing:var(--framework-text-table-body-tracking, normal)')
    end

    it 'never publishes a size or line-height modifier, which stay device axes' do
      expect(css).not_to match(/--framework-text-[a-z-]*(size|line-height)/)
    end
  end

  describe 'the divider slot' do
    # Level 6 is shared with the tables and the .border--* utilities, so a
    # theme quieting dividers must not reach for the level itself.
    it 'reads its own slot before level 6' do
      divider_rules = declarations_for(/\.divider(?![\w-])/).join

      expect(divider_rules).to include(
        'background-color:var(--framework-slot-divider-border-color, var(--theme-border-6-h-color,'
      )
      expect(divider_rules).to include('background-image:var(--framework-slot-divider-border-image,')
    end
  end

  describe 'spacing slots' do
    it 'rides a factor over the screen gap on the title bar, so zero sits flush' do
      expect(declarations_for(/\.title_bar(?![\w-])/).join)
        .to include('padding:0 calc(var(--gap)*var(--framework-layout-title-bar-padding-factor, 1))')
    end

    it 'gives the item padding slots that default to the unthemed zero' do
      expect(declarations_for(/\.item(?![\w-])/).join)
        .to include('padding:var(--framework-slot-item-padding-y, 0) var(--framework-slot-item-padding-x, 0)')
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
