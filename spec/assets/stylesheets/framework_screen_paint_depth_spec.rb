# frozen_string_literal: true

require 'rails_helper'

# The runtime needs one number per screen: how coarse the rail it paints on is.
# That number used to live twice, as a class ladder in getScreenContext() and as
# the mode blocks in _screen-mode-vars.scss, and the JS copy enumerated the five
# limited palette ids by hand. A sixth palette would have painted on the palette
# rail while the runtime called it 1-bit.
#
# CSS is the registry now: the mode class that selects the rail publishes
# --framework-bit-depth, and JS reads it. These examples pin both halves, so a
# palette added to the generator has to reach the bundle, and JS cannot grow a
# second copy of the list.
RSpec.describe 'Screen paint depth' do
  subject(:css) { Rails.root.join('app/assets/builds/plugins.css').read }

  before(:all) { FrameworkBuild.sass! }

  let(:runtime_js) { Framework::Engine.root.join('app/javascript/plugin-render/plugins.js').read }
  let(:limited_palette_ids) { Framework::ColorData.color_palette_limited_ids }

  def published_depth(selector)
    css[/#{Regexp.escape(selector)}\{--framework-bit-depth: (\d+)\}/, 1]
  end

  it 'publishes a depth for the unmodified screen and for every grayscale mode' do
    expect(published_depth('.trmnl .screen')).to eq('1')

    {
      '1bit' => '1', '2bit' => '2', '4bit' => '4', '8bit' => '8', '16bit' => '16'
    }.each do |modifier, depth|
      expect(published_depth(".trmnl .screen.screen--#{modifier}")).to eq(depth)
    end
  end

  it 'publishes a depth for every limited palette the generator emits' do
    expect(limited_palette_ids).not_to be_empty

    missing = limited_palette_ids.reject { |id| published_depth(".trmnl .screen.screen--color-#{id}") == '4' }

    expect(missing).to be_empty,
                       "palettes with no published paint depth: #{missing.join(', ')}"
  end

  it 'publishes the full-spectrum depth' do
    expect(published_depth('.trmnl .screen.screen--color-full')).to eq('12')
  end

  it 'orders the palette rules after the grayscale ones, so the painted rail wins' do
    grayscale = css.index('.trmnl .screen.screen--2bit{--framework-bit-depth: 2}')
    palette = css.index('.trmnl .screen.screen--color-7a{--framework-bit-depth: 4}')

    expect(grayscale).to be < palette
  end

  it 'leaves no palette-id registry in the runtime' do
    duplicated = limited_palette_ids.select { |id| runtime_js.include?("screen--color-#{id}") }

    expect(duplicated).to be_empty,
                          "plugins.js names palette ids CSS already publishes a depth for: #{duplicated.join(', ')}"
  end

  it 'reads the published depth instead of classifying mode classes' do
    expect(runtime_js).to include("getPropertyValue('--framework-bit-depth')")
  end

  # The order above decides more than the published number: a rule keyed on a mode
  # class only means "this rail paints" while no class declared later answers for
  # the screen. The Dark theme's 2-bit level mirror is the one rule that restates a
  # grayscale family's art, and keyed on the class alone it also fired on screens
  # whose lines come from a later block. `screen--2bit screen--color-7a` paints
  # palette lines, which the theme's polarity swap has already mirrored, so the
  # level mirror inverted them a second time and put black ink on this theme's
  # black canvas.
  #
  # The registry is the guard list rather than a hand-written copy of it: every
  # mode class whose depth rule follows the 2-bit one takes the paint from a screen
  # wearing both, so the mirror has to reject it, and a rail added to the registry
  # lands here.
  describe "the Dark theme's 2-bit level mirror" do
    let(:dark_theme_css) do
      path = Rails.root.join('app/assets/builds', Framework::Themes.css_path('dark'))
      raise "no built Dark theme bundle at #{path}" unless path.exist?

      path.read
    end

    # The rules that name level 1's art: the mirror on the themed screen, and
    # the identity restatement inside its inverse subtree (the root's mirror
    # hooks inherit in and cannot be unset). No other rule in the theme names
    # that level: the self-restating call covers only the level the reversible
    # scale maps to itself.
    let(:level_rules) do
      rules = dark_theme_css.scan(/([^{}]+)\{--theme-border-1-h-color: var\(--border-(\d)-/)
                            .map { |selector, from_level| [selector.strip, from_level.to_i] }
      raise 'no level rules in the built Dark theme' if rules.empty?

      rules
    end

    let(:mirror_selectors) { level_rules.map(&:first) }

    # Mode classes whose paint block is declared after the 2-bit one, read off the
    # published depth rules in source order.
    let(:overriding_mode_classes) do
      rules = css.to_enum(:scan, /\.trmnl \.screen\.(screen--[\w-]+)\{--framework-bit-depth: \d+\}/)
                 .map { [Regexp.last_match(1), Regexp.last_match.begin(0)] }
      two_bit = rules.find { |mode, _| mode == 'screen--2bit' }
      raise 'no published depth for the 2-bit rail' if two_bit.nil?

      rules.filter_map { |mode, at| mode if at > two_bit.last }
    end

    # A guard rejects a class either by naming it or through an attribute test the
    # class name starts with, the way $theme-exempt covers every theme id at once.
    def rejects?(selector, mode_class)
      return true if selector.include?(":not(.#{mode_class})")

      selector.scan(/:not\(\[class\*=([^\]]+)\]\)/).flatten.any? do |prefix|
        mode_class.start_with?(prefix.delete(%q("')))
      end
    end

    it 'mirrors the level on the themed screen and restates identity inside its inverse subtree' do
      expect(level_rules.length).to eq(2)

      screen_rule, inverse_rule = level_rules
      expect(screen_rule.first).not_to end_with(' .inverse')
      expect(screen_rule.last).not_to eq(1)
      expect(inverse_rule.first).to end_with(' .inverse')
      expect(inverse_rule.last).to eq(1)
    end

    # Negations only, so the plain 2-bit rail the mirror was written for still gets
    # it, and :where() keeps the guard weightless so the rule keeps its own weight.
    it 'guards the bit-depth key without adding a requirement of its own' do
      mirror_selectors.each do |selector|
        rest = selector.delete_prefix('.trmnl .screen--theme-dark.screen--2bit').delete_suffix(' .inverse')

        expect(rest).to match(/\A:where\((?::not\([^()]*\))+\)\z/)
      end
    end

    it 'fires on no mode class whose own rail paints instead of the 2-bit one' do
      expect(overriding_mode_classes).to include('screen--4bit', 'screen--color-full', 'screen--color-7a')

      unguarded = overriding_mode_classes.reject do |mode|
        mirror_selectors.all? { |selector| rejects?(selector, mode) }
      end

      expect(unguarded).to be_empty,
                           "mode classes the 2-bit level mirror still reaches: #{unguarded.join(', ')}"
    end
  end
end
