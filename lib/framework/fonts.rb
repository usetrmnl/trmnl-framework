# frozen_string_literal: true

#
# Loads Framework font metadata from `db/data/framework_fonts.yml` and exposes
# a small read-only API consumed by:
#
#   - app/views/framework/font_family.html.erb (typography docs)
#   - app/views/framework/releases_index.html.erb (Fonts summary card)
#   - lib/framework/fonts_release_task.rb (rake framework:release:fonts)
#
# All accessor methods return frozen hashes/arrays with symbolized keys so
# callers can use both `:family` and `[:family]` consistently with the existing
# inline Ruby hash that previously lived in `font_family.html.erb`.
#
module Framework
  module Fonts
    BUNDLE_DOWNLOAD_BASE = '/fonts/bundles'.freeze

    module_function

    def data_path
      Framework.data_root.join("db/data/framework_fonts.yml")
    end

    def pixel_font_source_dir
      Framework.public_root.join('fonts')
    end

    def reload!
      @config = nil
      @bundles = nil
      @shared = nil
    end

    def config
      @config ||= YAML.load_file(data_path, permitted_classes: [Date]).deep_symbolize_keys.freeze
    end

    def bundles
      @bundles ||= config.fetch(:bundles).freeze
    end

    def bundle(id)
      bundles.fetch(id.to_sym) do
        raise ArgumentError, "unknown font bundle: #{id.inspect} (known: #{bundle_ids.inspect})"
      end
    end

    def bundle_ids
      bundles.keys
    end

    def shared
      @shared ||= Array(config[:shared]).freeze
    end

    def released_at
      raw = config[:released_at]
      return nil if raw.blank?

      raw.is_a?(Date) ? raw : Date.parse(raw.to_s)
    end

    def all_files_for(bundle_id)
      bundle(bundle_id)[:fonts].flat_map { |font| font[:files] }
    end

    def shared_files
      shared.flat_map { |font| font[:files] }
    end

    def bundle_zip_url(bundle_id)
      "#{BUNDLE_DOWNLOAD_BASE}/#{bundle_id}/trmnl-fonts-bundle--#{bundle_id}.zip"
    end

    def bundle_markdown_url(bundle_id)
      "#{BUNDLE_DOWNLOAD_BASE}/#{bundle_id}/README.md"
    end
  end
end
