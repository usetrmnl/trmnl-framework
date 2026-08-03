# frozen_string_literal: true

require "json"

module Framework
  # Reads the latest release's resolved color manifest from the gem archive.
  # Hosts do not copy this file; Screen::Palette loads it in-process from the gem.
  module Colors
    def self.manifest_path
      latest = Framework::Version.latest.number
      Framework::Engine.root.join(
        "public/framework/colors/#{latest}/framework_colors.resolved.json"
      )
    end

    def self.manifest
      @manifest ||= JSON.parse(manifest_path.read).freeze
    end

    def self.limited_palette_grayscale_1bit_ids = manifest.fetch("limited_palette_grayscale_1bit_ids")

    def self.reload!
      @manifest = nil
    end
  end
end
