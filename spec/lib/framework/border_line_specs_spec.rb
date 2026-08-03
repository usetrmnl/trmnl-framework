# frozen_string_literal: true

require 'rails_helper'

# `two_bit_gray_line` is the token-line half of the 2-bit rail. Border levels
# already quantize onto the four TWO_BIT_LEVEL_COLORS tones on a 2-bit device;
# these examples pin the token lines to the same tones and the same ordering, so
# a themed underline and a .divider cannot disagree about what the panel can show.
RSpec.describe Framework::BorderLineSpecs do
  let(:rail) { (%w[black] + Framework::ColorUtils::GRAY_TOKENS + %w[white]).freeze }
  let(:tones) { described_class::TWO_BIT_LEVEL_COLORS.values.map { |rgb| format('#%02X%02X%02X', *rgb) } }

  # Mean luma of a line: one accent pixel per (run + 1), the rest fill.
  def line_luma(spec)
    kind, *fields = spec
    return fields.first.delete('#').scan(/../).first.to_i(16) if kind == 'solid'

    accent, fill, run = fields
    accent_luma = accent.delete('#').scan(/../).first.to_i(16)
    fill_luma = fill.delete('#').scan(/../).first.to_i(16)
    (accent_luma + (fill_luma * run)).fdiv(run + 1)
  end

  describe '.two_bit_gray_line' do
    it 'covers the whole grayscale rail' do
      expect(rail.map { |token| described_class.two_bit_gray_line(token) }).to all(be_an(Array))
    end

    it 'draws every color from TWO_BIT_LEVEL_COLORS' do
      used = rail.flat_map { |token| described_class.two_bit_gray_line(token) }
                 .grep(/\A#\h{6}\z/).uniq

      expect(used).to all(be_in(tones))
    end

    it 'reaches for the mid-gray tones rather than dashing black on white' do
      accents = rail.filter_map { |token| described_class.two_bit_gray_line(token)[1] }.uniq

      expect(accents).to include('#555555', '#AAAAAA')
    end

    it 'stays non-decreasing from black to white' do
      lumas = rail.map { |token| line_luma(described_class.two_bit_gray_line(token)) }

      expect(lumas).to eq(lumas.sort)
      expect(lumas.first).to eq(0)
      expect(lumas.last).to eq(255)
    end

    it 'renders the native anchors as solids and everything else as a two-tone run' do
      solids = rail.select { |token| described_class.two_bit_gray_line(token).first == 'solid' }

      expect(solids).to eq(Framework::BayerTiles::TWO_BIT_SOLID_TOKENS)
    end

    it 'keeps every run inside the token line cap' do
      runs = rail.filter_map { |token| described_class.two_bit_gray_line(token)[3] }

      expect(runs).to all(be_between(1, described_class::MAX_TOKEN_RUN))
    end
  end

  describe '.two_bit_level_hex' do
    it 'refuses a tone the level table does not name' do
      expect { described_class.two_bit_level_hex([1, 2, 3]) }.to raise_error(ArgumentError, /TWO_BIT_LEVEL_COLORS/)
    end
  end
end
