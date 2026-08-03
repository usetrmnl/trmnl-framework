# frozen_string_literal: true

require_relative 'color_utils'
require_relative 'bayer_tiles'

module Framework
  # Border-token line geometry: every token line is either a solid color or a
  # single accent pixel followed by a fill run. Consumed by the CSS gradient
  # emission (framework.rake color_tokens), which renders these specs as
  # repeating-linear-gradient values.
  module BorderLineSpecs
    # Cells in one 8x8 Bayer tile, the denominator of BayerTiles' high-cell counts.
    TWO_BIT_TILE_CELLS = 64
    # Longest fill run a token line emits, matching the 1-bit rail's cap.
    MAX_TOKEN_RUN = 12

    # Hand-crafted border level patterns (the classic staggered art).
    # row values: 0=black, 255=white, nil=transparent; row 2 of the 2px tile
    # is row 1 rotated left by :stagger.
    ONE_BIT_LEVEL_PATTERNS = {
      1 => { w: 1,  row: [0], stagger: 0 },
      2 => { w: 12, row: [255, 0, 0, 0, 0, nil, 255, 0, 0, 0, 0, nil], stagger: 3 },
      3 => { w: 8,  row: [255, 0, 0, nil, 255, 0, 0, nil], stagger: 3 },
      4 => { w: 2,  row: [0, 255], stagger: 1 },
      5 => { w: 8,  row: [0, 255, 255, nil, 0, 255, 255, nil], stagger: 3 },
      6 => { w: 12, row: [0, 255, 255, 255, 255, nil, 0, 255, 255, 255, 255, nil], stagger: 3 },
      7 => { w: 1,  row: [255], stagger: 0 }
    }.freeze

    TWO_BIT_LEVEL_COLORS = {
      black: [0, 0, 0],
      gray_dark: [85, 85, 85],
      gray_light: [170, 170, 170],
      white: [255, 255, 255]
    }.freeze

    # stagger: 1 for 2px patterns (2,4,6); 0 for 1px
    TWO_BIT_LEVEL_PATTERNS = {
      1 => { w: 1, row: [:black], stagger: 0 },
      2 => { w: 2, row: [:gray_dark, :black], stagger: 1 },
      3 => { w: 1, row: [:gray_dark], stagger: 0 },
      4 => { w: 2, row: [:gray_dark, :gray_light], stagger: 1 },
      5 => { w: 1, row: [:gray_light], stagger: 0 },
      6 => { w: 2, row: [:gray_light, :white], stagger: 1 },
      7 => { w: 1, row: [:white], stagger: 0 }
    }.freeze

    module_function

    # Run-length segments of a pattern row: [[value, start, end], ...]
    def row_segments(row)
      segments = []
      row.each_with_index do |value, index|
        if segments.any? && segments.last[0] == value
          segments.last[2] = index + 1
        else
          segments << [value, index, index + 1]
        end
      end
      segments
    end

    def relative_luma(rgb) = (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2])

    def gray_token_target_luma(token, token_hex_map, white_luma)
      return 0.0 if token == 'black'
      return white_luma if token == 'white'

      token_hex = token_hex_map[token]
      if token_hex
        rgb = Framework::ColorUtils.hex_to_rgb(token_hex)
        return relative_luma(rgb)
      end

      # Defensive fallback if a token is unexpectedly absent from manifest color_palette.
      step = token.delete_prefix('gray-').to_i
      (white_luma * step / 80.0)
    end

    # User-requested model: single dark pixel separated by white runs.
    # Larger white runs => lighter appearance. Non-decreasing across gray-10 through gray-75.
    def gray_white_runs(token_hex_map, white_rgb)
      white_luma = relative_luma(white_rgb)
      raw_runs = Framework::ColorUtils::GRAY_TOKENS.to_h do |token|
        target_luma = gray_token_target_luma(token, token_hex_map, white_luma)
        normalized = white_luma <= 0.0 ? 0.0 : (target_luma / white_luma).clamp(0.0, 1.0)
        run = (1.0 + ((normalized**2.2) * 10.0)).round
        [token, run.clamp(1, MAX_TOKEN_RUN)]
      end

      runs = {}
      prev = 1
      Framework::ColorUtils::GRAY_TOKENS.each do |token|
        quantized = raw_runs.fetch(token).round.clamp(prev, MAX_TOKEN_RUN)
        runs[token] = quantized
        prev = quantized
      end

      runs
    end

    # Dark steps (10 to 40): accent run of the step hex after a black pixel.
    # Light steps (45 to 75): white run after a single step-hex pixel.
    def hue_step_run(step) = step <= 40 ? (1 + (((step - 10) / 30.0) * 6)).round.clamp(1, 7) : (1 + (((step - 45) / 30.0) * 8)).round.clamp(1, 9)

    # The 2-bit rail's own token lines. Border *levels* already quantize onto the
    # four TWO_BIT_LEVEL_COLORS tones on a 2-bit device; token lines used to stay
    # on the 1-bit black-on-white dash, so the two border mechanisms disagreed
    # about what the hardware can show. The tone pair and the mix come from the
    # same quantizer the 2-bit background rail uses (BayerTiles), converted into
    # the accent/fill run the token line spec already speaks: one accent pixel per
    # (run + 1). Returns ['solid', hex] or ['seq', accent_hex, fill_hex, run].
    def two_bit_gray_line(token)
      spec = Framework::BayerTiles.two_bit_spec_for_token(token)
      return ['solid', two_bit_level_hex(spec[:rgb])] if spec[:solid]

      high = spec[:high_count]
      run = high.fdiv(TWO_BIT_TILE_CELLS - high).round.clamp(1, MAX_TOKEN_RUN)
      ['seq', two_bit_level_hex(spec[:low_rgb]), two_bit_level_hex(spec[:high_rgb]), run]
    end

    # The quantizer works in raw luma; the line colors are the named tones, so a
    # value that is not one of them means the two tables have drifted apart.
    def two_bit_level_hex(rgb)
      level = TWO_BIT_LEVEL_COLORS.values.find { |value| value == rgb }
      raise ArgumentError, "no TWO_BIT_LEVEL_COLORS entry for #{rgb.inspect}" if level.nil?

      format('#%02X%02X%02X', *level)
    end
  end
end
