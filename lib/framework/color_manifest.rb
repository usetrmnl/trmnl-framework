# frozen_string_literal: true

require 'json'
require 'fileutils'

module Framework
  module ColorManifest
    def self.resolved_json_path
      if defined?(Rails)
        Rails.root.join("tmp/framework_colors.resolved.json")
      else
        File.expand_path('../../tmp/framework_colors.resolved.json', __dir__)
      end
    end

    def self.build
      color_palette = Framework::ColorData.color_palette

      {
        'color_palette' => color_palette,
        'color_hues' => Framework::ColorData.color_hues,
        'color_shade_steps' => Framework::ColorData.color_shade_steps,
        'color_palette_limited_ids' => Framework::ColorData.color_palette_limited_ids,
        'limited_palette_grayscale_1bit_ids' => Framework::ColorData.limited_palette_grayscale_1bit_ids,
        'color_to_gray_fallback' => compute_color_to_gray_fallback(color_palette),
        # Limited-palette fields ride in the same manifest so every consumer reads one structure.
        'limited_palettes' => Framework::ColorData.limited_palettes,
        'hue_to_accents' => Framework::ColorData.hue_to_accents,
        'preview_color_map' => Framework::ColorData.preview_color_map,
        'preview_palette_ids' => Framework::ColorData.preview_palette_ids,
        'preview_limited_palette_white_hex' => Framework::ColorData.preview_limited_palette_white_hex
      }
    end

    def self.write_resolved_json(path = resolved_json_path)
      path = Pathname(path)
      FileUtils.mkdir_p(path.dirname)
      File.write(path, JSON.pretty_generate(build))
      path
    end

    def self.load_resolved_json(path = resolved_json_path)
      path = Pathname(path)
      JSON.parse(File.read(path))
    end

    # Chromatic tokens are mapped per hue row (dark to light, the pure hue
    # between the shade and tint halves) instead of one token at a time:
    # independent nearest-neighbor quantization collapsed the dark end of
    # saturated hues onto a single gray. The row assignment keeps rungs
    # monotone along the ramp and spreads collapsed runs while staying closest
    # to true L*, so hue rows remain luma-faithful (yellow lighter than blue)
    # with distinct steps wherever the ladder has room.
    def self.compute_color_to_gray_fallback(color_palette)
      steps = Framework::ColorData.color_shade_steps
      shade_steps, tint_steps = steps.partition { |step| step < 45 }
      mapping = {}

      Framework::ColorData.color_hues.each do |hue|
        tokens = shade_steps.map { |s| "#{hue}-#{s}" } + [hue] + tint_steps.map { |s| "#{hue}-#{s}" }
        tokens = tokens.select { |t| color_palette.key?(t) }
        next if tokens.empty?

        l_stars = tokens.map { |t| Framework::ColorUtils.lab_l_star(color_palette.fetch(t)) }
        grays = Framework::ColorUtils.monotone_gray_assignment(l_stars)
        tokens.each_with_index { |t, i| mapping[t] = grays[i] }
      end

      # Safety net: palette keys outside the hue rows keep the scalar mapping.
      color_palette.to_h do |token, hex|
        [token, mapping.fetch(token) { Framework::ColorUtils.l_star_to_gray(Framework::ColorUtils.lab_l_star(hex)) }]
      end
    end
  end
end
