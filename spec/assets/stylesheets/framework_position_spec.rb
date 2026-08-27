# frozen_string_literal: true

require 'rails_helper'

# The position utilities take content out of flow, which is the one thing the
# other box-model families never do. Two properties of the emitted bundle decide
# whether that is safe.
#
# The offsets ride the spacing scale, so a corner inset by `top--3` sits where a
# `p--3` padding would put it, at whatever content scale the device carries. And
# every declaration lands on an enumerated token class rather than a
# `[class^="top--"]` matcher, so a token nothing binds has no rule at all instead
# of resetting the property from tn--utilities, the last cascade layer.
#
# These examples read the compiled bundle because the emitted selector, and the
# value behind it, is the only record of which spelling shipped.
RSpec.describe 'Framework position utilities' do
  subject(:css) { FrameworkBuild.plugins_css }

  # Size and orientation: base, three sizes, two orientations, six pairs. The
  # same matrix Size, Spacing and Gap publish; position answers a layout
  # question and not a palette one, so it emits no bit-depth or dark gate.
  def gate_count = 12

  def edges = %w[inset top right bottom left]

  describe 'positioning context' do
    it 'declares the two position keywords' do
      expect(css).to include('.trmnl .relative{position:relative}', '.trmnl .absolute{position:absolute}')
    end

    it 'emits both keywords at every gate the matrix covers' do
      counts = %w[relative absolute].index_with { |keyword| css.scan(/#{keyword}\{position:/).length }

      expect(counts.values).to eq([gate_count, gate_count])
    end
  end

  describe 'edge offsets' do
    it 'scales every step with the content scale, as spacing does' do
      expect(css).to include('.trmnl .top--3{top:calc(12px * var(--content-scale, 1))}')
    end

    it 'publishes the decimal steps of the spacing scale' do
      expect(css).to include('.trmnl .left--2\\.5{left:calc(10px * var(--content-scale, 1))}')
    end

    # Full bleed is the reason inset ships at all: one class over a positioned
    # parent, covering it on all four edges.
    it 'writes the full-bleed token as a single shorthand' do
      expect(css).to include('.trmnl .inset--0{inset:0px}')
    end

    it 'gives every edge the same gate coverage' do
      counts = edges.index_with { |edge| css.scan(/#{edge}--4\{#{edge}:/).length }

      expect(counts.values.uniq).to eq([gate_count])
    end
  end

  describe 'stacking' do
    # components/_map.scss leaves MapLibre's own containers at the bottom of the
    # map and puts the labels and attribution TRMNLMaps places at z-index 1, so
    # an overlay needs a level above both.
    it 'reaches a level above the overlays the map component publishes' do
      expect(css).to include('.trmnl .z--2{z-index:2}')
    end

    # The title bar sits at 10 and has to stay there. A scale that could reach it
    # would let a card in the layout cover the plugin's own header.
    it 'stops well below the title bar' do
      expect(css).not_to include('.z--4')
    end
  end

  describe 'the emitted shape' do
    # A prefix matcher reads the whole class attribute, so `[class^="top--"]`
    # would also land on a token nothing binds and drop the property to its
    # initial value from the last cascade layer. Size, Text and Background
    # already moved off that shape; position is written on it from the start.
    # Every rule in the bundle, as [selectors, body]. The body is a lookahead so
    # the closing brace stays available to anchor the next rule; consuming it
    # would silently skip every second rule.
    it 'carries no declaration on a prefix matcher' do
      properties = (edges + %w[position z-index]).join('|')
      offenders = css.scan(/(?:[{}]|\A)([^{}]*)\{(?=([^{}]*)\})/).select do |selectors, body|
        selectors.match?(/\[class\^=|\[class\*=" /) && body.match?(/(?<![\w-])(?:#{properties}):/)
      end

      expect(offenders).to be_empty
    end
  end
end
