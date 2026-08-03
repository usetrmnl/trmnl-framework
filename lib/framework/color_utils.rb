# frozen_string_literal: true

module Framework
  module ColorUtils
    # Gray token hex R value (0-255) → approximate L* for mapping
    # gray-10=17, gray-15=34, gray-20=51, ... gray-75=238
    GRAY_TOKENS = %w[gray-10 gray-15 gray-20 gray-25 gray-30 gray-35 gray-40
                     gray-45 gray-50 gray-55 gray-60 gray-65 gray-70 gray-75].freeze

    GRAY_HEX_VALUES = [17, 34, 51, 68, 85, 102, 119, 136, 153, 170, 187, 204, 221, 238].freeze

    # sRGB (0-255) to LAB L* (0-100). L* is perceptual lightness.
    def self.lab_l_star(hex)
      hex = hex.to_s.delete('#')
      r = hex[0..1].to_i(16) / 255.0
      g = hex[2..3].to_i(16) / 255.0
      b = hex[4..5].to_i(16) / 255.0

      # sRGB to linear RGB
      r, g, b = [r, g, b].map do |c|
        c > 0.04045 ? ((c + 0.055) / 1.055)**2.4 : c / 12.92
      end

      # Linear RGB to XYZ (D65), then XYZ to LAB L* (D65 white point)
      y = ((r * 0.2126729) + (g * 0.7151522) + (b * 0.0721750)) * 100
      fy = y / 100.0
      fy = fy > 0.008856 ? fy**(1.0 / 3) : (7.787 * fy) + (16.0 / 116)

      (116.0 * fy) - 16.0
    end

    GRAY_L_STAR = GRAY_HEX_VALUES.map do |val|
      hex = "##{val.to_s(16).rjust(2, '0') * 3}"
      ColorUtils.lab_l_star(hex)
    end.freeze

    def self.l_star_to_gray(l_star)
      return GRAY_TOKENS.first if l_star <= GRAY_L_STAR.first
      return GRAY_TOKENS.last if l_star >= GRAY_L_STAR.last

      idx = GRAY_L_STAR.each_with_index.min_by { |g, _| (g - l_star).abs }[1]
      GRAY_TOKENS[idx]
    end

    # Continuous rung position (0.0 .. GRAY_TOKENS.length - 1) of an L* value,
    # by linear interpolation between the gray anchors. The fractional position
    # lets monotone_gray_assignment measure how far a candidate rung sits from
    # the true lightness instead of snapping first and comparing after.
    def self.ideal_gray_position(l_star)
      return 0.0 if l_star <= GRAY_L_STAR.first
      return (GRAY_L_STAR.length - 1).to_f if l_star >= GRAY_L_STAR.last

      upper = GRAY_L_STAR.index { |g| g >= l_star }
      lower = upper - 1
      lower + ((l_star - GRAY_L_STAR[lower]) / (GRAY_L_STAR[upper] - GRAY_L_STAR[lower]))
    end

    # Assign an L*-ordered ramp (one hue row, dark to light) to gray tokens.
    # Independent nearest-neighbor quantization collapses the dark end of
    # saturated hues (blue-10/15/20 all landed on gray-10), so this solves the
    # whole row at once: rungs are non-decreasing along the ramp, at most
    # max_run consecutive entries may share a rung, and among those constraints
    # the summed squared deviation from each entry's ideal_gray_position is
    # minimized (exact dynamic program, deterministic, ties go to the darker
    # rung). Sharing remains possible only in pairs, and only where the ramp is
    # genuinely compressed, such as at the gray-10 floor and the gray-75 ceiling.
    # rubocop:disable Metrics/AbcSize -- one self-contained dynamic program; splitting it obscures the recurrence
    def self.monotone_gray_assignment(l_stars, max_run: 2)
      rung_count = GRAY_TOKENS.length
      raise ArgumentError, 'ramp too long for the gray ladder' if l_stars.length > rung_count * max_run

      ideals = l_stars.map { |l| ideal_gray_position(l) }
      # cost[rung][run] for the current token; parents reconstruct the path.
      cost = Array.new(rung_count) { Array.new(max_run + 1) }
      parent = []

      ideals.each_with_index do |ideal, i|
        next_cost = Array.new(rung_count) { Array.new(max_run + 1) }
        next_parent = Array.new(rung_count) { Array.new(max_run + 1) }
        best_prefix = nil # cheapest state on any rung strictly below the current one
        rung_count.times do |rung|
          step_cost = (rung - ideal)**2
          if i.zero?
            next_cost[rung][1] = step_cost
          else
            if best_prefix
              next_cost[rung][1] = best_prefix[0] + step_cost
              next_parent[rung][1] = best_prefix[1]
            end
            (1...max_run).each do |run|
              prev = cost[rung][run]
              next if prev.nil?

              extended = prev + step_cost
              if next_cost[rung][run + 1].nil? || extended < next_cost[rung][run + 1]
                next_cost[rung][run + 1] = extended
                next_parent[rung][run + 1] = [rung, run]
              end
            end
          end
          (1..max_run).each do |run|
            c = cost[rung][run]
            next if c.nil?

            best_prefix = [c, [rung, run]] if best_prefix.nil? || c < best_prefix[0]
          end
        end
        cost = next_cost
        parent << next_parent
      end

      final = nil
      rung_count.times do |rung|
        (1..max_run).each do |run|
          c = cost[rung][run]
          final = [c, [rung, run]] if c && (final.nil? || c < final[0])
        end
      end

      rungs = []
      state = final[1]
      (l_stars.length - 1).downto(0) do |i|
        rungs << state[0]
        state = parent[i][state[0]][state[1]]
      end
      rungs.reverse.map { |r| GRAY_TOKENS[r] }
    end
    # rubocop:enable Metrics/AbcSize

    def self.hex_to_rgb(hex)
      hex = hex.to_s.delete('#')
      [hex[0..1].to_i(16), hex[2..3].to_i(16), hex[4..5].to_i(16)]
    end
  end
end
