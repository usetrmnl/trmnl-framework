# frozen_string_literal: true

require 'rails_helper'

# The map slots are the first component paint a non-CSS renderer draws with:
# TRMNLMaps reads them back through TRMNLPaint.slot() and hands them to
# MapLibre. So the contract is the compiled cascade, not a mixin in isolation:
# every screen declares the slots, the 1-bit rail takes its lines to the ink,
# the color rails re-point the areas at hues, and every shipped theme states
# the slots it is expected to restate.
module MapSlotContract
  AREA_SLOTS = %w[map-land map-water map-forest map-green map-farmland map-rock map-sand map-area map-site map-building map-transit].freeze
  LINE_SLOTS = %w[map-road map-road-minor map-path map-rail map-boundary map-water-line].freeze
  TEXT_SLOTS = %w[map-label].freeze
  # The token-bound slots a theme has to restate; land and the labels follow
  # semantic channels the theme already states.
  THEMED_SLOTS = (AREA_SLOTS + LINE_SLOTS - %w[map-land]).freeze
end

RSpec.describe 'Framework map slot contract' do
  subject(:css) { FrameworkBuild.plugins_css }

  # Every innermost rule as [selector, declarations]; wrappers such as @layer
  # carry braces in their body and are skipped by the non-greedy match.
  def rules
    @rules ||= css.scan(/([^{}]+)\{([^{}]*)\}/).map { |selector, body| [selector.strip, body] }
  end

  def declarations_on(selector_pattern)
    rules.select { |selector, _| selector.match?(selector_pattern) }.map(&:last).join(';')
  end

  def expect_declared(declarations, property, value)
    expect(declarations).to include("#{property}: #{value}"),
                            "expected #{property} to be #{value}"
  end

  def expect_no_declaration(declarations, property)
    expect(declarations).not_to include("#{property}:"),
                                "expected #{property} not to be re-pointed here"
  end

  let(:screen) { declarations_on(/\A\.trmnl \.screen\z/) }
  let(:inverse) { declarations_on(/\A\.trmnl \.screen:where\(:not\(\[class\*=screen--theme-\]\)\) \.inverse\z/) }
  let(:one_bit) { declarations_on(/\A\.trmnl \.screen\.screen--1bit:where/) }
  let(:color_full) { declarations_on(/\A\.trmnl \.screen\.screen--color-full:where/) }

  it 'declares every area, line and text slot on the screen and restates them on the inverse subtree' do
    aggregate_failures do
      [screen, inverse].each do |declarations|
        MapSlotContract::AREA_SLOTS.each do |slot|
          expect(declarations).to include("--framework-slot-#{slot}-bg-color:")
          expect(declarations).to include("--framework-slot-#{slot}-bg-image:")
        end
        MapSlotContract::LINE_SLOTS.each do |slot|
          expect(declarations).to include("--framework-slot-#{slot}-bg-color:")
          expect(declarations).to include("--framework-slot-#{slot}-bg-image:")
        end
        MapSlotContract::TEXT_SLOTS.each do |slot|
          expect(declarations).to include("--framework-slot-#{slot}-text-color:")
        end
      end
    end
  end

  it 'binds the grayscale defaults: land to the canvas, areas to gray tiles, every line to a gray short of the ink' do
    aggregate_failures do
      expect_declared(screen, '--framework-slot-map-land-bg-color', 'var(--framework-semantic-canvas-bg-color, var(--framework-canvas-bg))')
      expect_declared(screen, '--framework-slot-map-water-bg-color', 'var(--bg-gray-45-color, transparent)')
      expect_declared(screen, '--framework-slot-map-forest-bg-color', 'var(--bg-gray-50-color, transparent)')
      expect_declared(screen, '--framework-slot-map-green-bg-color', 'var(--bg-gray-60-color, transparent)')
      expect_declared(screen, '--framework-slot-map-rock-bg-color', 'var(--bg-gray-70-color, transparent)')
      expect_declared(screen, '--framework-slot-map-building-bg-color', 'var(--bg-gray-65-color, transparent)')
      expect_declared(screen, '--framework-slot-map-road-bg-color', 'var(--bg-gray-35-color, transparent)')
      expect_declared(screen, '--framework-slot-map-road-minor-bg-color', 'var(--bg-gray-45-color, transparent)')
      expect_declared(screen, '--framework-slot-map-path-bg-color', 'var(--bg-gray-55-color, transparent)')
      expect_declared(screen, '--framework-slot-map-label-text-color', 'var(--framework-semantic-text-primary-text-color, var(--framework-text-primary))')
      # The residential field takes the lightest tile on every rail, the 1-bit
      # one included: folding it into the canvas there left a settlement as bare
      # white, which read as missing content next to the same map at 2-bit.
      expect_declared(screen, '--framework-slot-map-area-bg-color', 'var(--bg-gray-75-color, transparent)')
      expect_no_declaration(one_bit, '--framework-slot-map-area-bg-color')
      expect_no_declaration(one_bit, '--framework-slot-map-area-bg-image')
      # The area ramp puts the sea fifty ink points off the canvas, and the
      # 1-bit rail steps over fifty: the checkerboard is its tone there.
      expect_declared(one_bit, '--framework-slot-map-water-bg-color', 'var(--bg-checker-color, transparent)')
    end
  end

  # A plotted route takes the ink (chart-series slot 0), so no default map line
  # may: a line is a bg slot like an area, so on the 1-bit rail its gray is the
  # token's dither tile, which the renderer draws as a line pattern, and never a
  # hex the panel cannot print.
  it 'keeps every default line off the ink on every rail and on the bg chain' do
    aggregate_failures do
      [screen, inverse, one_bit, color_full].each do |declarations|
        MapSlotContract::LINE_SLOTS.each do |slot|
          expect(declarations).not_to include("--framework-slot-#{slot}-bg-color: var(--bg-black-color")
          expect(declarations).not_to include("--framework-slot-#{slot}-border-")
        end
      end
    end
  end

  it 're-points the areas and minor lines at chromatic tokens on the color-full and limited-palette rails' do
    expect(color_full).not_to be_empty
    aggregate_failures do
      expect_declared(color_full, '--framework-slot-map-water-bg-color', 'var(--bg-blue-55-color, transparent)')
      expect_declared(color_full, '--framework-slot-map-forest-bg-color', 'var(--bg-green-55-color, transparent)')
      expect_declared(color_full, '--framework-slot-map-green-bg-color', 'var(--bg-green-70-color, transparent)')
      expect_declared(color_full, '--framework-slot-map-boundary-bg-color', 'var(--bg-purple-40-color, transparent)')
      palette_ids = css.scan(/\.screen\.screen--color-([a-z0-9]+):where/).flatten.uniq - %w[full]
      expect(palette_ids).not_to be_empty
      palette_ids.each do |palette_id|
        palette = declarations_on(/\A\.trmnl \.screen\.screen--color-#{Regexp.escape(palette_id)}:where/)
        expect(palette).to include('--framework-slot-map-water-bg-color: var(--bg-blue-55-color, transparent)'),
                           "palette #{palette_id} does not re-point map-water"
      end
    end
  end

  it 'is restated by every shipped theme, on the screen and on its inverse subtree' do
    themes = Dir.glob(Framework::Engine.root.join('app/assets/stylesheets/framework/themes/*-theme.scss'))
    expect(themes).not_to be_empty
    aggregate_failures do
      themes.each do |path|
        source = File.read(path)
        MapSlotContract::THEMED_SLOTS.each do |slot|
          expect(source.scan(/'#{slot}'/).size).to be >= 1, "#{File.basename(path)} does not restate #{slot}"
        end
      end
    end
  end
end
