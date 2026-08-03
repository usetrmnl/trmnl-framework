# frozen_string_literal: true

require 'rails_helper'

# Pure color math shared by the token generators. These functions carry no state and touch
# no files, so they are specified in isolation with known-good inputs. lab_l_star and
# l_star_to_gray are the seam the grayscale-fallback maps are built on; hex_to_rgb feeds the
# border/tile pipelines.
RSpec.describe Framework::ColorUtils do
  describe '.lab_l_star' do
    it 'reports pure black as the darkest possible lightness' do
      expect(described_class.lab_l_star('#000000')).to eq(0.0)
    end

    it 'reports pure white as full lightness' do
      expect(described_class.lab_l_star('#FFFFFF')).to be_within(1e-4).of(100.0)
    end

    it 'places mid-gray near the middle of the perceptual lightness scale' do
      expect(described_class.lab_l_star('#888888')).to be_within(1e-3).of(56.703)
    end

    context 'with a nil hex' do
      it 'raises rather than silently treating it as black' do
        expect { described_class.lab_l_star(nil) }.to raise_error(ArgumentError)
      end
    end
  end

  describe '.l_star_to_gray' do
    it 'maps a color-matched lightness back to its own gray token' do
      matched = described_class.lab_l_star('#888888')
      expect(described_class.l_star_to_gray(matched)).to eq('gray-45')
    end

    context 'when the lightness sits below the gray ramp' do
      it 'clamps to the darkest gray token' do
        expect(described_class.l_star_to_gray(-50)).to eq('gray-10')
      end
    end

    context 'when the lightness sits above the gray ramp' do
      it 'clamps to the lightest gray token' do
        expect(described_class.l_star_to_gray(999)).to eq('gray-75')
      end
    end
  end

  describe '.ideal_gray_position' do
    it 'clamps below the ramp to the first rung' do
      expect(described_class.ideal_gray_position(-10)).to eq(0.0)
    end

    it 'clamps above the ramp to the last rung' do
      expect(described_class.ideal_gray_position(150)).to eq(13.0)
    end

    it 'lands exactly on a rung for a gray anchor lightness' do
      expect(described_class.ideal_gray_position(described_class::GRAY_L_STAR[5])).to be_within(1e-9).of(5.0)
    end

    it 'interpolates between adjacent rungs' do
      midpoint = (described_class::GRAY_L_STAR[2] + described_class::GRAY_L_STAR[3]) / 2.0
      expect(described_class.ideal_gray_position(midpoint)).to be_within(1e-9).of(2.5)
    end
  end

  describe '.monotone_gray_assignment' do
    it 'keeps a well-spread ramp on its nearest rungs' do
      l_stars = described_class::GRAY_L_STAR.values_at(0, 3, 6, 9, 12)
      expect(described_class.monotone_gray_assignment(l_stars))
        .to eq(%w[gray-10 gray-25 gray-40 gray-55 gray-70])
    end

    it 'spreads a collapsed dark run instead of stacking it on one rung' do
      # Three values that all quantize to gray-10 under nearest-neighbor.
      assignment = described_class.monotone_gray_assignment([1.0, 3.8, 8.6, 14.3])
      expect(assignment[2]).not_to eq(assignment[0])
      expect(assignment.chunk_while { |a, b| a == b }.map(&:size).max).to be <= 2
    end

    it 'never assigns more than max_run consecutive entries to one rung' do
      flat_top = Array.new(9, 99.0)
      assignment = described_class.monotone_gray_assignment(flat_top)
      expect(assignment.chunk_while { |a, b| a == b }.map(&:size).max).to be <= 2
    end

    it 'keeps rungs monotone along the ramp' do
      ramp = [1.0, 3.8, 8.6, 14.3, 20.0, 26.0, 29.0, 32.3, 40.0, 55.0, 70.0, 80.0, 88.0, 93.0, 96.0]
      assignment = described_class.monotone_gray_assignment(ramp)
      indices = assignment.map { |token| described_class::GRAY_TOKENS.index(token) }
      expect(indices.each_cons(2).all? { |a, b| b >= a }).to be(true)
    end

    it 'raises when the ramp cannot fit the ladder under max_run' do
      expect { described_class.monotone_gray_assignment(Array.new(29, 50.0)) }
        .to raise_error(ArgumentError)
    end
  end

  describe '.hex_to_rgb' do
    it 'splits a hash-prefixed hex string into 8-bit channels' do
      expect(described_class.hex_to_rgb('#FF8000')).to eq([255, 128, 0])
    end

    it 'accepts a hex string without the leading hash' do
      expect(described_class.hex_to_rgb('FF8000')).to eq([255, 128, 0])
    end

    context 'with a nil hex' do
      it 'raises rather than returning a fabricated channel triple' do
        expect { described_class.hex_to_rgb(nil) }.to raise_error(ArgumentError)
      end
    end
  end
end
