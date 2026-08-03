# frozen_string_literal: true

require 'rails_helper'
require 'json'
require 'tmpdir'

# The resolved manifest is the single structure both the SCSS token generator and the bitmap
# pipeline read. build merges the raw palette data with the computed grayscale-fallback maps.
# These specs pin the manifest shape, the fallback-map invariants, and the byte-stability that
# release reproducibility depends on. They never write the real resolved JSON or generated SCSS.
RSpec.describe Framework::ColorManifest do
  subject(:manifest) { described_class.build }

  describe '.build' do
    it 'resolves every field the SCSS and bitmap generators read' do
      expect(manifest.keys).to contain_exactly(
        'color_palette', 'color_hues', 'color_shade_steps',
        'color_palette_limited_ids', 'limited_palette_grayscale_1bit_ids',
        'color_to_gray_fallback', 'limited_palettes',
        'hue_to_accents', 'preview_color_map',
        'preview_palette_ids', 'preview_limited_palette_white_hex'
      )
    end

    it 'passes the source color palette through unchanged' do
      expect(manifest['color_palette']).to include('red' => '#FF0000', 'red-10' => '#220000')
    end
  end

  describe 'the color-to-gray fallback map' do
    subject(:fallback) { manifest['color_to_gray_fallback'] }

    it 'computes a gray fallback for every palette color' do
      expect(fallback.keys).to eq(manifest['color_palette'].keys)
    end

    it 'resolves every color to a valid gray token' do
      expect(fallback.values).to all(match(/\Agray-\d+\z/))
    end

    it 'distinguishes light colors from dark ones rather than collapsing to one gray' do
      expect(fallback.values.uniq.size).to be > 1
    end

    it 'keeps every hue row monotone from dark to light' do
      each_hue_row_rungs do |hue, rungs|
        expect(rungs.each_cons(2).all? { |a, b| b >= a }).to be(true), "#{hue} row is not monotone"
      end
    end

    it 'never stacks more than two consecutive steps on one gray' do
      each_hue_row_rungs do |hue, rungs|
        longest = rungs.chunk_while { |a, b| a == b }.map(&:size).max
        expect(longest).to be <= 2, "#{hue} row collapses #{longest} steps onto one gray"
      end
    end

    it 'no longer collapses the dark blue steps onto a single gray' do
      expect(fallback['blue-20']).not_to eq(fallback['blue-10'])
    end

    it 'no longer collapses the light yellow steps onto a single gray' do
      expect(fallback.values_at('yellow-40', 'yellow-50', 'yellow-60', 'yellow-75').uniq.size).to eq(4)
    end

    it 'stays hue-aware: yellow maps lighter than blue at the same step' do
      rung = ->(token) { Framework::ColorUtils::GRAY_TOKENS.index(fallback.fetch(token)) }
      expect(rung.call('yellow-40')).to be > rung.call('blue-40')
    end

    def each_hue_row_rungs
      steps = manifest['color_shade_steps']
      shade_steps, tint_steps = steps.partition { |step| step < 45 }
      manifest['color_hues'].each do |hue|
        tokens = shade_steps.map { |s| "#{hue}-#{s}" } + [hue] + tint_steps.map { |s| "#{hue}-#{s}" }
        rungs = tokens.map { |t| Framework::ColorUtils::GRAY_TOKENS.index(fallback.fetch(t)) }
        yield hue, rungs
      end
    end
  end

  describe '.compute_color_to_gray_fallback' do
    context 'with an empty palette' do
      it 'returns an empty map' do
        expect(described_class.compute_color_to_gray_fallback({})).to eq({})
      end
    end

    context 'with a single pure-black color' do
      it 'falls back to the darkest gray token' do
        expect(described_class.compute_color_to_gray_fallback({ 'x' => '#000000' })).to eq('x' => 'gray-10')
      end
    end
  end

  describe 'byte-stability (release reproducibility)' do
    it 'serializes an identical manifest string on every regeneration' do
      expect(JSON.pretty_generate(described_class.build))
        .to eq(JSON.pretty_generate(described_class.build))
    end

    it 'writes byte-identical resolved JSON across regenerations' do
      Dir.mktmpdir do |dir|
        path = File.join(dir, 'framework_colors.resolved.json')
        first = File.binread(described_class.write_resolved_json(path))
        second = File.binread(described_class.write_resolved_json(path))
        expect(second).to eq(first)
      end
    end
  end
end
