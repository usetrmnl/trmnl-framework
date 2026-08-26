# frozen_string_literal: true

require 'rails_helper'
require 'open3'
require 'tmpdir'

# A theme slot helper whose consumer runs the renderer publishes two parallel
# outputs from one call: the CSS background longhands and the SVG render program
# TRMNLPaint exports. Writing only the background silently desynchronizes the
# exported render path from the screen, and publishing a program no consumer
# reads is dead surface, so each helper is pinned to the pair its consumers
# take. The chart ramp has the mirror problem: it wrote only the slots it was
# given, so a short theme ramp left the base grayscale in its tail.
#
# The helpers are compiled in isolation here, so what each one emits is asserted
# directly rather than inferred from a themed screen in the 17 MB bundle.
module ThemeSlotContract
  RENDER_FIELDS = %w[stroke width height view-box path-1 color-1 path-2 color-2].freeze
  RAMP_SLOTS = 16

  # A 16-token ramp, the length both shipped themes and the base grayscale pass.
  FULL_RAMP = (%w[white] + (10..75).step(5).map { |step| "red-#{step}" } + %w[red]).freeze

  PROBES = <<~SCSS.freeze
    @use 'framework/mixins/theme-slots' as theme-slots;

    .level-remap { @include theme-slots.utility-border-token(65, h, 'red-60'); }
    .token-slot { @include theme-slots.border-token-slot('label-underline', 'red-75'); }
    .level-slot { @include theme-slots.border-level-slot('table-head-row', 4); }
    .level-mirror { @include theme-slots.utility-border-level(1, h, 7); }
    .level-restate { @include theme-slots.utility-border-level(4, v, 4); }
    .short-ramp { @include theme-slots.chart-series-ramp((white, red-70, red-40)); }
    .full-ramp { @include theme-slots.chart-series-ramp((#{FULL_RAMP.join(', ')}), $span: 11); }
    .ink-slot { @include theme-slots.ink-slot('title-bar', 'red-75'); }
    .icon-slot { @include theme-slots.slot-icon('title-bar', 'red-75'); }
    .stroke-slot { @include theme-slots.slot-stroke('title-bar', 'black'); }
    .layout-factors { @include theme-slots.layout-factors($whitespace: 1.35, $corners: 0, $title-bar-height: 1.2, $meters: 1.5); }
    .layout-partial { @include theme-slots.layout-factors($corners: 1.6); }
    .weight-shift { @include theme-slots.font-weight-shift(-100); }
  SCSS

  module_function

  def css
    @css ||= compile(PROBES)
  end

  def compile(source)
    Dir.mktmpdir do |dir|
      entry = File.join(dir, 'probe.scss')
      output = File.join(dir, 'probe.css')
      File.write(entry, source)
      _stdout, stderr, status = Open3.capture3(
        'bundle', 'exec', 'sass', '--style=compressed', '--no-source-map',
        "--load-path=#{Framework::Engine.root.join('app/assets/stylesheets')}",
        entry, output
      )
      raise "sass failed: #{stderr}" unless status.success?

      File.read(output)
    end
  end

  # The custom properties of one probe rule, keyed by property name.
  def rule(selector)
    body = css[/#{Regexp.escape(selector)}\{(.*?)\}/m, 1]
    raise "no rule for #{selector}" if body.nil?

    body.scan(/(--[a-z0-9-]+):\s*([^;]+)/).to_h { |name, value| [name, value.strip] }
  end
end

RSpec.describe 'Framework theme slot contract' do
  let(:probe) { ThemeSlotContract }

  describe 'border renderer companions' do
    it 'repoints the renderer program when utility-border-token repoints a level' do
      declarations = probe.rule('.level-remap')

      ThemeSlotContract::RENDER_FIELDS.each do |field|
        expect(declarations).to include("--theme-border-65-h-render-#{field}")
      end
      # The token line has no renderer program of its own, so the flat stroke
      # comes from the same mode-correct stroke chain the bulk line remap uses.
      expect(declarations['--theme-border-65-h-render-stroke'])
        .to eq('var(--stroke-red-60-color, var(--red-60))')
      expect(declarations['--theme-border-65-h-render-path-1']).to eq('none')
    end

    it 'publishes a renderer program for a token-bound slot' do
      declarations = probe.rule('.token-slot')

      ThemeSlotContract::RENDER_FIELDS.each do |field|
        expect(declarations).to include("--framework-slot-label-underline-border-render-#{field}")
      end
      expect(declarations['--framework-slot-label-underline-border-render-stroke'])
        .to eq('var(--stroke-red-75-color, var(--red-75))')
    end

    # The theme tier comes first, so a slot pointing at a level follows a theme
    # that restated that level with utility-border-level. Both tiers have to be
    # there: dropping the framework tier would leave an unthemed screen with no
    # art at all.
    it 'forwards the level background longhands for a level-bound slot' do
      declarations = probe.rule('.level-slot')

      %w[color image size].each do |channel|
        expect(declarations["--framework-slot-table-head-row-border-#{channel}"])
          .to start_with("var(--theme-border-4-h-#{channel}, var(--border-4-h-#{channel},")
      end
    end

    # The only consumers of a level-bound slot are the table rails, which place
    # their line themselves and paint it with the three longhands above. A
    # position and an eight-field program published beside them were read
    # nowhere, and a slot whose consumer runs the renderer takes
    # border-token-slot instead.
    it 'publishes no position or renderer program for a level-bound slot' do
      declarations = probe.rule('.level-slot')

      expect(declarations).not_to include('--framework-slot-table-head-row-border-position')
      ThemeSlotContract::RENDER_FIELDS.each do |field|
        expect(declarations).not_to include("--framework-slot-table-head-row-border-render-#{field}")
      end
    end
  end

  # The 2-bit rail carries its four tones as literal hexes, so the only way a
  # theme can say "level 1 paints what level 7 paints" is to name the level.
  describe 'repointing a level at another level' do
    it 'forwards every field of the source level, background and renderer alike' do
      declarations = probe.rule('.level-mirror')

      %w[color image size position].each do |channel|
        expect(declarations["--theme-border-1-h-#{channel}"])
          .to start_with("var(--border-7-h-#{channel},")
      end
      ThemeSlotContract::RENDER_FIELDS.each do |field|
        expect(declarations["--theme-border-1-h-render-#{field}"])
          .to start_with("var(--border-7-h-render-#{field},")
      end
    end

    # A level forwarded from somewhere else carries that level's line polarity
    # with it, so the polarity statement belongs to the self-restating call only.
    it 'names no line polarity when the art comes from another level' do
      expect(probe.rule('.level-mirror')).not_to include('--theme-border-1-h-line-dark')
      expect(probe.rule('.level-mirror')).not_to include('--theme-border-1-h-line-light')
    end

    # Restating a level onto itself is how a theme keeps the family's own
    # polarity on the one level the reversible scale maps to itself: swapping the
    # two segments of a 50% checker shifts it by a pixel instead of leaving it be.
    it 'keeps the family polarity on a level restated onto itself' do
      declarations = probe.rule('.level-restate')

      expect(declarations['--theme-border-4-v-line-dark']).to eq('var(--border-line-dark, #000000)')
      expect(declarations['--theme-border-4-v-line-light']).to eq('var(--border-line-light, #FFFFFF)')
      expect(declarations['--theme-border-4-v-image']).to start_with('var(--border-4-v-image,')
    end
  end

  describe 'the title-bar ink helpers' do
    it 'publishes the solid companion beside the four glyph fields' do
      declarations = probe.rule('.ink-slot')

      %w[color image clip under].each do |field|
        expect(declarations).to include("--framework-slot-title-bar-text-#{field}")
      end
      # The bar and instance inherit their ink through `color`, which cannot
      # clip a tile, so the solid rides the same stroke chain semantic-text uses.
      expect(declarations['--framework-slot-title-bar-text-solid'])
        .to eq('var(--stroke-red-75-color, var(--red-75, transparent))')
    end

    it 'paints the slot icon through the token text triple' do
      declarations = probe.rule('.icon-slot')

      expect(declarations['--framework-slot-title-bar-icon-color'])
        .to eq('var(--text-red-75-color, var(--red-75, currentColor))')
      expect(declarations['--framework-slot-title-bar-icon-image']).to eq('var(--text-red-75-image, none)')
      expect(declarations['--framework-slot-title-bar-icon-under']).to eq('var(--text-red-75-under, transparent)')
    end

    it 'resolves the slot stroke through the mode-correct solid chain' do
      expect(probe.rule('.stroke-slot')['--framework-slot-title-bar-stroke-color'])
        .to eq('var(--stroke-black-color, var(--black, currentColor))')
    end
  end

  describe 'the structure and weight helpers' do
    it 'emits every named factor, zero included' do
      declarations = probe.rule('.layout-factors')

      expect(declarations['--framework-layout-whitespace-factor']).to eq('1.35')
      # A square-cornered theme passes 0, which must not read as "unset".
      expect(declarations['--framework-layout-corner-factor']).to eq('0')
      expect(declarations['--framework-layout-title-bar-height-factor']).to eq('1.2')
      expect(declarations['--framework-layout-meter-factor']).to eq('1.5')
    end

    it 'leaves unnamed factors to the unthemed default' do
      declarations = probe.rule('.layout-partial')

      expect(declarations.keys).to eq(['--framework-layout-corner-factor'])
    end

    it 'publishes the vector weight shift' do
      expect(probe.rule('.weight-shift')['--framework-font-weight-shift']).to eq('-100')
    end

    # The bitmap bundles are drawn on the pixel grid, so a fractional advance
    # lands their glyphs off-grid and a negative one eats sidebearings that are
    # part of the drawing. Both are refused at compile time rather than shipped.
    it 'takes whole positive pixels of tracking' do
      source = "@use 'framework/mixins/theme-slots' as theme-slots;\n" \
               ".ok { @include theme-slots.text-modifiers($label-tracking: 2px); }\n"

      expect(probe.compile(source)).to include('--framework-text-label-tracking: 2px')
    end

    it 'refuses fractional tracking' do
      source = "@use 'framework/mixins/theme-slots' as theme-slots;\n" \
               ".bad { @include theme-slots.text-modifiers($label-tracking: 1.5px); }\n"

      expect { probe.compile(source) }.to raise_error(/whole positive pixels/)
    end

    it 'refuses negative tracking' do
      source = "@use 'framework/mixins/theme-slots' as theme-slots;\n" \
               ".bad { @include theme-slots.text-modifiers($value-tracking: -1px); }\n"

      expect { probe.compile(source) }.to raise_error(/whole positive pixels/)
    end

    it 'refuses em tracking, which cannot stay on the pixel grid' do
      source = "@use 'framework/mixins/theme-slots' as theme-slots;\n" \
               ".bad { @include theme-slots.text-modifiers($title-tracking: 0.12em); }\n"

      expect { probe.compile(source) }.to raise_error(/whole positive pixels/)
    end
  end

  describe 'the chart series ramp' do
    it 'clears every slot past a short ramp instead of leaving it inherited' do
      declarations = probe.rule('.short-ramp')

      expect(declarations['--framework-chart-series-0-color']).to eq('var(--bg-white-color, transparent)')
      expect(declarations['--framework-chart-series-2-color']).to eq('var(--bg-red-40-color, transparent)')
      (3...ThemeSlotContract::RAMP_SLOTS).each do |slot|
        expect(declarations["--framework-chart-series-#{slot}-color"]).to eq('transparent')
        expect(declarations["--framework-chart-series-#{slot}-image"]).to eq('none')
      end
    end

    it 'holds the span inside the ramp it published' do
      expect(probe.rule('.short-ramp')['--framework-chart-series-span']).to eq('2')
      expect(probe.rule('.full-ramp')['--framework-chart-series-span']).to eq('11')
    end

    it 'leaves no slot cleared when the ramp fills all of them' do
      declarations = probe.rule('.full-ramp')

      (0...ThemeSlotContract::RAMP_SLOTS).each do |slot|
        expect(declarations["--framework-chart-series-#{slot}-color"]).to start_with('var(--bg-')
      end
    end

    it 'refuses a ramp longer than the slots TRMNLPaint reads' do
      overlong = (ThemeSlotContract::FULL_RAMP + %w[black]).join(', ')
      source = "@use 'framework/mixins/theme-slots' as theme-slots;\n" \
               ".over { @include theme-slots.chart-series-ramp((#{overlong})); }\n"

      expect { probe.compile(source) }.to raise_error(/at most 16 tokens/)
    end
  end
end
