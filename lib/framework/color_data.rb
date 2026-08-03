# frozen_string_literal: true

require 'yaml'

module Framework
  module ColorData
    def self.yaml_path
      if defined?(Framework::Engine)
        Framework.data_root.join("db/data/framework_colors.yml")
      else
        File.expand_path('../../db/data/framework_colors.yml', __dir__)
      end
    end

    def self.load
      YAML.load_file(yaml_path) || {}
    end

    def self.color_palette
      load['color_palette'] || {}
    end

    def self.color_hues
      load['color_hues'] || %w[red orange yellow lime green cyan blue violet purple pink]
    end

    def self.color_shade_steps
      load['color_shade_steps'] || [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75]
    end

    def self.limited_palettes
      load['limited_palettes'] || {}
    end

    def self.hue_to_accents
      load['hue_to_accents'] || {}
    end

    def self.preview_color_map
      load['preview_color_map'] || {
        'red' => '#A02020',
        'yellow' => '#F0E050',
        'green' => '#608050',
        'blue' => '#5080B8'
      }
    end

    def self.preview_palette_ids
      load['preview_palette_ids'] || %w[3bwr 3bwy 4bwry 6a 7a]
    end

    def self.preview_limited_palette_white_hex
      load['preview_limited_palette_white_hex'] || '#BBBBBB'
    end

    def self.color_palette_limited_ids
      load['color_palette_limited_ids'] || %w[3bwr 3bwy 4bwry 6a 7a]
    end

    def self.limited_palette_grayscale_1bit_ids
      load['limited_palette_grayscale_1bit_ids'] || %w[3bwr 3bwy 4bwry 6a 7a]
    end
  end
end
