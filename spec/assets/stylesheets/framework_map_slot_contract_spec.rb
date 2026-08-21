# frozen_string_literal: true

require 'rails_helper'

# The map slots are the first component paint a non-CSS renderer draws with:
# TRMNLMaps reads them back through TRMNLPaint.slot() and hands them to
# MapLibre. So the contract is the compiled cascade, not a mixin in isolation:
# every screen declares the slots, the 1-bit rail takes its lines to the ink,
# the color rails re-point the areas at hues, and every shipped theme states
# the slots it is expected to restate.
module MapSlotContract
  AREA_SLOTS = %w[map-land map-water map-green map-area map-building].freeze
  LINE_SLOTS = %w[map-road map-road-minor map-rail map-boundary map-water-line].freeze
  TEXT_SLOTS = %w[map-label map-label-muted].freeze
  # The token-bound slots a theme has to restate; land, the major lines and the
  # labels follow semantic channels the theme already states.
  THEMED_SLOTS = %w[map-water map-green map-area map-building map-road-minor map-boundary map-water-line].freeze
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
          expect(declarations).to include("--framework-slot-#{slot}-border-color:")
          expect(declarations).to include("--framework-slot-#{slot}-border-render-stroke:")
        end
        MapSlotContract::TEXT_SLOTS.each do |slot|
          expect(declarations).to include("--framework-slot-#{slot}-text-color:")
        end
      end
    end
  end

  it 'binds the 1-bit defaults: land to the canvas, areas to gray tiles, roads to the strong border' do
    aggregate_failures do
      expect_declared(screen, '--framework-slot-map-land-bg-color', 'var(--framework-semantic-canvas-bg-color, var(--framework-canvas-bg))')
      expect_declared(screen, '--framework-slot-map-water-bg-color', 'var(--bg-gray-60-color, transparent)')
      expect_declared(screen, '--framework-slot-map-green-bg-color', 'var(--bg-gray-70-color, transparent)')
      expect_declared(screen, '--framework-slot-map-building-bg-color', 'var(--bg-gray-40-color, transparent)')
      expect_declared(screen, '--framework-slot-map-road-border-render-stroke', 'var(--framework-semantic-border-strong-border-color, var(--framework-border-strong))')
      expect_declared(screen, '--framework-slot-map-road-minor-border-render-stroke', 'var(--stroke-gray-30-color, var(--gray-30))')
      expect_declared(screen, '--framework-slot-map-label-text-color', 'var(--framework-semantic-text-primary-text-color, var(--framework-text-primary))')
    end
  end

  it 'takes the minor lines to the ink on the 1-bit rail, on the screen and on its inverse subtree' do
    expect(one_bit).not_to be_empty
    aggregate_failures do
      %w[map-road-minor map-boundary map-water-line].each do |slot|
        expect(one_bit).to include("--framework-slot-#{slot}-border-render-stroke: var(--stroke-black-color")
      end
      expect(rules.map(&:first)).to include(a_string_matching(/\.screen\.screen--1bit:where\(:not\(\[class\*=screen--theme-\]\)\) \.inverse/))
    end
  end

  it 're-points the areas and minor lines at chromatic tokens on the color-full and limited-palette rails' do
    expect(color_full).not_to be_empty
    aggregate_failures do
      expect_declared(color_full, '--framework-slot-map-water-bg-color', 'var(--bg-blue-70-color, transparent)')
      expect_declared(color_full, '--framework-slot-map-green-bg-color', 'var(--bg-green-70-color, transparent)')
      expect(color_full).to include('--framework-slot-map-boundary-border-render-stroke: var(--stroke-purple-40-color')
      palette_ids = css.scan(/\.screen\.screen--color-([a-z0-9]+):where/).flatten.uniq - %w[full]
      expect(palette_ids).not_to be_empty
      palette_ids.each do |palette_id|
        palette = declarations_on(/\A\.trmnl \.screen\.screen--color-#{Regexp.escape(palette_id)}:where/)
        expect(palette).to include('--framework-slot-map-water-bg-color: var(--bg-blue-70-color, transparent)'),
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
