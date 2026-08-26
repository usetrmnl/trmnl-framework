# frozen_string_literal: true

require_relative 'bayer_tiles'

module Framework
  # Horizontal ordered-dither ramps: ink at the left edge fading to paper at the
  # right, one per paint rail. Consumed by the CSS emission (framework.rake
  # dither_ramps), which publishes each rail's ramp as a custom property an item
  # fill can point at.
  #
  # Same Bayer threshold map as the tiles, applied along x instead of at one
  # level: column x asks for a paper fraction, the matrix decides which of the
  # rail's renderable tones that pixel lands on. The art is emitted at its
  # natural size and consumed there; a stretched ramp resamples pixels the
  # dither already decided and reads as a blur.
  module DitherRamps
    RAMP_WIDTH = 128
    # The Bayer matrix' own period, so the strip tiles seamlessly with repeat-y.
    RAMP_HEIGHT = 8

    # Ink coverage of the darkest column. A ramp that starts at solid ink leaves
    # overlaid text with nothing to separate from, so the left edge is a mid-gray:
    # roughly half the pixels are ink, and black glyphs still read against it.
    MAX_INK_COVERAGE = 0.55

    # Renderable tones per rail. Full color is absent on purpose: a solid-capable
    # rail takes the plain gradient from .full_ramp_value, the same place the
    # paint pipeline stops dithering (base/_screen-mode-vars.scss).
    RAIL_TONE_COUNTS = { '1bit' => 2, '2bit' => 4, '4bit' => 16 }.freeze

    module_function

    # 1.0 is paper; the darkest column sits MAX_INK_COVERAGE below it.
    def paper_fraction(x) = 1.0 - (MAX_INK_COVERAGE * (1.0 - x.fdiv(RAMP_WIDTH - 1)))

    # Ordered dither: the matrix rank biases the quantizer, so neighbouring
    # pixels of one column round to different tones and average out to it.
    def tone(x, y, tone_count)
      threshold = (BayerTiles::BAYER_8X8[y % 8][x % 8] + 0.5) / 64.0
      level = ((paper_fraction(x) * (tone_count - 1)) + threshold).floor.clamp(0, tone_count - 1)
      (level * 255.0 / (tone_count - 1)).round
    end

    def gray_hex(value) = format('#%02X%02X%02X', value, value, value)

    def ramp_grid(tone_count)
      Array.new(RAMP_HEIGHT) { |y| Array.new(RAMP_WIDTH) { |x| gray_hex(tone(x, y, tone_count)) } }
    end

    # Horizontal runs of one tone as a single path. Merging them is what keeps
    # the data URI small: a rect per pixel is an order of magnitude more bytes.
    def tone_path(grid, color)
      path = +''
      grid.each_with_index do |row, y|
        x = 0
        while x < RAMP_WIDTH
          if row[x] == color
            width = 1
            width += 1 while x + width < RAMP_WIDTH && row[x + width] == color
            path << "M#{x} #{y}h#{width}v1h-#{width}z"
            x += width
          else
            x += 1
          end
        end
      end
      path
    end

    # Same ink-cell technique as the Bayer tiles: the commonest tone is one
    # background rect, every other tone is one path over it.
    def svg_uri(grid)
      tone_counts = grid.flatten.tally
      background = tone_counts.max_by { |_color, count| count }.first
      paths = (tone_counts.keys - [background]).map { |color| "<path d='#{tone_path(grid, color)}' fill='#{color}'/>" }.join
      svg = "<svg xmlns='http://www.w3.org/2000/svg' width='#{RAMP_WIDTH}' height='#{RAMP_HEIGHT}' shape-rendering='crispEdges'>" \
            "<rect width='#{RAMP_WIDTH}' height='#{RAMP_HEIGHT}' fill='#{background}'/>#{paths}</svg>"
      "data:image/svg+xml,#{svg.gsub('#', '%23').gsub('<', '%3C').gsub('>', '%3E')}"
    end

    def rail_uris = RAIL_TONE_COUNTS.transform_values { |tone_count| svg_uri(ramp_grid(tone_count)) }

    # The solid-capable rail renders the ramp it was quantized from, unquantized.
    def full_ramp_value = "linear-gradient(to right, #{gray_hex((paper_fraction(0) * 255).round)}, #FFFFFF)"
  end
end
