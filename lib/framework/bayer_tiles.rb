# frozen_string_literal: true

module Framework
  # Ordered-dither tile math behind the CSS emission (framework.rake
  # color_tokens): a tile pixel is a pure function of (x, y,
  # level-or-occupancy, colors), so CSS can paint the dither art directly:
  # gradient slices for borders, ink-cell vectors for backgrounds. Chromatic
  # tiles threshold the Bayer matrix; the grayscale families use curated
  # occupancy counts filled in Bayer-rank order.
  module BayerTiles
    BAYER_8X8 = [
      [0, 32, 8, 40, 2, 34, 10, 42],
      [48, 16, 56, 24, 50, 18, 58, 26],
      [12, 44, 4, 36, 14, 46, 6, 38],
      [60, 28, 52, 20, 62, 30, 54, 22],
      [3, 35, 11, 43, 1, 33, 9, 41],
      [51, 19, 59, 27, 49, 17, 57, 25],
      [15, 47, 7, 39, 13, 45, 5, 37],
      [63, 31, 55, 23, 61, 29, 53, 21]
    ].freeze

    PATTERN_X_OFFSET = 1

    STEP_TO_BAYER_LEVEL = {
      10 => 56, 15 => 48, 20 => 40, 25 => 32, 30 => 24, 35 => 16, 40 => 8,
      45 => 56, 50 => 48, 55 => 40, 60 => 32, 65 => 24, 70 => 16, 75 => 8
    }.freeze

    # Bayer positions ordered by rank. Curated dithers occupy the first N
    # (ascending) or last N (descending) of these cells.
    BAYER_RANK_COORDS = begin
      ranked = BAYER_8X8.each_with_index.flat_map do |row, y|
        row.each_with_index.map { |rank, x| [rank, x, y] }
      end
      ranked.sort_by(&:first).map { |_rank, x, y| [x, y] }
    end.freeze

    # 1-bit grayscale: curated white-cell occupancy per token. Mirrored pairs
    # (10<->75, ...) sum to 64 so upper-half tokens are visual complements.
    ONE_BIT_CURATED_DITHER = {
      'gray-10' => { white_count: 4, phase: :ascending },
      'gray-15' => { white_count: 8, phase: :ascending },
      'gray-20' => { white_count: 12, phase: :ascending },
      'gray-25' => { white_count: 16, phase: :ascending },
      'gray-30' => { white_count: 20, phase: :ascending },
      'gray-35' => { white_count: 24, phase: :ascending },
      'gray-40' => { white_count: 28, phase: :ascending },
      'gray-45' => { white_count: 36, phase: :descending },
      'gray-50' => { white_count: 40, phase: :descending },
      'gray-55' => { white_count: 44, phase: :descending },
      'gray-60' => { white_count: 48, phase: :descending },
      'gray-65' => { white_count: 52, phase: :descending },
      'gray-70' => { white_count: 56, phase: :descending },
      'gray-75' => { white_count: 60, phase: :descending }
    }.freeze

    # 2-bit grayscale: 4 renderable levels; the product shade scale is 0 to 80
    # with native anchors at 30 and 55. Non-anchor tokens dither between the
    # two levels bracketing their target luma, with curated occupancy.
    TWO_BIT_LEVELS = [0, 85, 170, 255].freeze
    TWO_BIT_SOLID_TOKENS = %w[black gray-30 gray-55 white].freeze
    TWO_BIT_SHADE_SCALE_MAX = 80.0
    TWO_BIT_ANCHORS = [
      [0.0, 0],
      [30.0, 85],
      [55.0, 170],
      [80.0, 255]
    ].freeze
    TWO_BIT_CURATED_DITHER = {
      'gray-10' => { high_count: 16, phase: :ascending },
      'gray-15' => { high_count: 24, phase: :ascending },
      'gray-20' => { high_count: 32, phase: :ascending },
      'gray-25' => { high_count: 40, phase: :ascending },
      'gray-35' => { high_count: 16, phase: :ascending },
      'gray-40' => { high_count: 24, phase: :ascending },
      'gray-45' => { high_count: 40, phase: :descending },
      'gray-50' => { high_count: 48, phase: :descending },
      'gray-60' => { high_count: 24, phase: :descending },
      'gray-65' => { high_count: 32, phase: :descending },
      'gray-70' => { high_count: 40, phase: :descending },
      'gray-75' => { high_count: 48, phase: :descending }
    }.freeze

    module_function

    # 8x8 booleans: true where the high (light) color sits.
    def high_occupancy_grid(high_count, phase)
      ordered_coords = phase == :descending ? BAYER_RANK_COORDS.reverse : BAYER_RANK_COORDS
      grid = Array.new(8) { Array.new(8, false) }
      high_count.clamp(0, 64).times do |index|
        x, y = ordered_coords[index]
        grid[y % 8][x % 8] = true
      end
      grid
    end

    def curated_two_tone_pixel(x, y, occupancy_grid, low:, high:)
      occupancy_grid[y % 8][(x + PATTERN_X_OFFSET) % 8] ? high : low
    end

    def two_bit_target_luma(token)
      return 0 if token == 'black'
      return 255 if token == 'white'

      step = token.delete_prefix('gray-').to_i
      shade_position = step.clamp(0, TWO_BIT_SHADE_SCALE_MAX.to_i).to_f
      left_anchor, right_anchor = TWO_BIT_ANCHORS.each_cons(2).find do |(_left_step, _), (right_step, _)|
        shade_position <= right_step
      end

      left_step, left_luma = left_anchor
      right_step, right_luma = right_anchor
      ratio = (shade_position - left_step) / (right_step - left_step)
      (left_luma + ((right_luma - left_luma) * ratio)).round
    end

    # Token dispatch for the 2-bit family: solid luma or a curated dither
    # between the two levels bracketing the target luma.
    def two_bit_spec_for_token(token)
      if TWO_BIT_SOLID_TOKENS.include?(token)
        value = two_bit_target_luma(token)
        return { solid: true, rgb: [value, value, value] }
      end

      target = two_bit_target_luma(token)
      low_level, high_level = TWO_BIT_LEVELS.each_cons(2).find { |_low, high| target <= high }
      curated = TWO_BIT_CURATED_DITHER.fetch(token)
      high_count = curated[:high_count].to_i.clamp(0, 64)
      phase = curated[:phase]

      return { solid: true, rgb: [low_level, low_level, low_level] } if high_count.zero?
      return { solid: true, rgb: [high_level, high_level, high_level] } if high_count == 64

      { solid: false, low_rgb: [low_level, low_level, low_level], high_rgb: [high_level, high_level, high_level], high_count:, phase: }
    end

    def below_level?(x, y, level) = BAYER_8X8[y % 8][(x + PATTERN_X_OFFSET) % 8] < level

    # Uncorrelated hash for 2-accent selection. Offset Bayer correlated with
    # primary and caused single-accent output (e.g. violet had only red, no blue).
    def first_accent?(x, y) = ((((x + PATTERN_X_OFFSET) % 8) * 31) + ((y % 8) * 17)) % 64 < 32

    def two_color_pixel(x, y, level, color_a, color_b) = below_level?(x, y, level) ? color_a : color_b

    def three_color_pixel(x, y, level, dark:, color_a:, color_b:, white:)
      accent = first_accent?(x, y) ? color_a : color_b
      if dark
        below_level?(x, y, level) ? '#000000' : accent
      else
        below_level?(x, y, level) ? accent : white
      end
    end
  end
end
