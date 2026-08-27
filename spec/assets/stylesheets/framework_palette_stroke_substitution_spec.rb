# frozen_string_literal: true

require 'rails_helper'
require 'open3'
require 'tmpdir'

# Limited-palette screens must resolve every chromatic stroke through the panel
# accent their dither art already uses. Strokes are the solid-color chain behind
# border lines, dividers, title-bar outlines and text-stroke--*, so a raw hue
# here paints violet onto a panel whose inks are black, white, red and yellow.
module PaletteStrokeSubstitution
  # The palette rails, keyed by the first selector of each rule the mode-vars
  # sheet emits for them.
  RAILS = {
    'light' => ->(id) { ".trmnl .screen.screen--color-#{id}," },
    'preview' => ->(id) { ".trmnl .screen.screen--preview-colors.screen--color-#{id}," },
    'dark' => ->(id) { ".trmnl .screen.screen--dark-mode.screen--color-#{id}:" },
    'dark preview' => ->(id) { ".trmnl .screen.screen--dark-mode.screen--preview-colors.screen--color-#{id}:" }
  }.freeze

  DECLARATION = /--stroke-([a-z0-9-]+)-color:\s*([^;}]+)/

  module_function

  # The mode-vars sheet plus a dump of the two generated tables the substitution
  # reads, so the spec checks the shipped accent data rather than a copy of it.
  def css
    @css ||= Dir.mktmpdir do |dir|
      entry = File.join(dir, 'palette_strokes.scss')
      output = File.join(dir, 'palette_strokes.css')
      File.write(entry, <<~'SCSS')
        @use 'framework/base/screen-mode-vars';
        @use 'framework/config/tokens' as vars;

        .probe-accents {
            @each $palette-id, $accents in vars.$palette-hue-accents {
                @each $hue, $accent in $accents {
                    --#{$palette-id}-#{$hue}: #{$accent};
                }
            }
        }

        .probe-preview {
            @each $token, $hex in vars.$preview-color-palette {
                --#{$token}: #{$hex};
            }
        }
      SCSS
      _stdout, stderr, status = Open3.capture3(
        'bundle', 'exec', 'sass', '--style=compressed', '--no-source-map',
        "--load-path=#{Framework::Engine.root.join('app/assets/stylesheets')}",
        entry, output
      )
      raise "sass failed: #{stderr}" unless status.success?

      File.read(output)
    end
  end

  # [selector, body] for every declaration block, at-rule wrappers unwrapped.
  def blocks
    @blocks ||= begin
      found = []
      selector_start = 0
      index = 0
      while (index = css.index(/[{}]/, index))
        if css[index] == '}'
          index += 1
        else
          selector = css[selector_start...index].strip
          if selector.start_with?('@') && !selector.start_with?('@font-face', '@property')
            index += 1
          else
            close = css.index('}', index)
            found << [selector, css[(index + 1)...close]]
            index = close + 1
          end
        end
        selector_start = index
      end
      found
    end
  end

  # A rule may restate a token, and the last declaration is the one that paints.
  def strokes(needle)
    match = blocks.find { |selector, _| selector.start_with?(needle) }
    raise "no rule starting with #{needle}" if match.nil?

    match.last.scan(DECLARATION).to_h { |token, value| [token, value.strip] }
  end

  def probe(selector)
    blocks.find { |found, _| found == selector }.last.scan(/--([a-z0-9-]+):\s*([^;}]+)/)
          .to_h { |name, value| [name, value.strip] }
  end

  def accent(palette_id, hue) = probe('.probe-accents').fetch("color-#{palette_id}-#{hue}")

  def preview_hex(token) = probe('.probe-preview')[token]

  # Custom properties merge across the equal-specificity `.screen` rules.
  def base
    @base ||= blocks.filter_map { |selector, body| body if selector == '.trmnl .screen' }
                    .flat_map { |body| body.scan(DECLARATION) }
                    .to_h { |token, value| [token, value.strip] }
  end

  def hues = @hues ||= Framework::ColorData.load.fetch('color_hues')

  def steps = @steps ||= Framework::ColorData.load.fetch('color_shade_steps')

  def palette_ids = @palette_ids ||= Framework::ColorData.load.fetch('color_palette_limited_ids')
end

RSpec.describe 'Framework limited palette stroke substitution' do
  let(:probe) { PaletteStrokeSubstitution }

  it 'binds chromatic strokes to their raw hue on the default screen rule' do
    expect(probe.base.fetch('violet')).to eq('var(--violet)')
  end

  it 'paints violet through the red accent on the black/white/red/yellow rail' do
    expect(probe.strokes('.trmnl .screen.screen--color-4bwry,').fetch('violet')).to eq('var(--red)')
  end

  it 'paints violet through the red accent preview hex on the preview rail' do
    expect(probe.strokes('.trmnl .screen.screen--preview-colors.screen--color-4bwry,').fetch('violet'))
      .to eq(probe.preview_hex('red'))
  end

  it 'mirrors the accent shade step on the dark rail' do
    expect(probe.strokes('.trmnl .screen.screen--dark-mode.screen--color-4bwry:').fetch('violet-30'))
      .to eq('var(--red-55)')
  end

  it 'leaves gray strokes to the default screen rule' do
    expect(probe.strokes('.trmnl .screen.screen--color-4bwry,')).not_to include('gray-30')
  end

  PaletteStrokeSubstitution.palette_ids.each do |palette_id|
    it "substitutes every chromatic stroke through the #{palette_id} accent table" do
      light = probe.strokes(PaletteStrokeSubstitution::RAILS.fetch('light').call(palette_id))
      preview = probe.strokes(PaletteStrokeSubstitution::RAILS.fetch('preview').call(palette_id))

      leaks = probe.hues.flat_map do |hue|
        accent = probe.accent(palette_id, hue)
        ([nil] + probe.steps).filter_map do |step|
          token = [hue, step].compact.join('-')
          target = [accent, step].compact.join('-')
          expected_preview = probe.preview_hex(target) || "var(--#{target})"
          next if light[token] == "var(--#{target})" && preview[token] == expected_preview

          "#{token}: #{light[token]} / #{preview[token]}"
        end
      end

      expect(leaks).to be_empty,
                       "#{palette_id} leaves #{leaks.length} chromatic strokes unsubstituted, " \
                       "starting with #{leaks.first(3).join(', ')}"
    end
  end
end
