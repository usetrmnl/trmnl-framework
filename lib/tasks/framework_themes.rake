# frozen_string_literal: true

require_relative '../framework/themes'

namespace :framework do
  namespace :themes do
    desc 'Lint framework themes for protected v3 paint variable overrides'
    task lint: :environment do
      themes_dir = Framework::Engine.root.join('app/assets/stylesheets/framework/themes')
      theme_files = Dir.glob(themes_dir.join('[a-z]*-theme.scss'))

      file_ids = theme_files.map { |path| File.basename(path, '.scss').delete_suffix('-theme') }.sort
      unless file_ids == Framework::Themes.ids.sort
        raise "Theme registry out of sync with #{themes_dir}: registry=#{Framework::Themes.ids.sort} files=#{file_ids}"
      end

      protected_prefixes = %w[--bg- --text- --border-].freeze
      root_palette_prefixes = %w[--gray- --color-].freeze
      root_palette_names = %w[--white --black].freeze
      violations = []
      engine_root = Framework::Engine.root

      theme_files.each do |path|
        File.readlines(path).each_with_index do |line, index|
          stripped = line.strip
          next if stripped.start_with?('//')

          if stripped.include?('@include theme-slots.role-token(')
            violations << {
              file: Pathname.new(path).relative_path_from(engine_root).to_s,
              line: index + 1,
              category: 'deprecated-role-token',
              prefix: 'theme-slots.role-token',
              source: stripped
            }
            next
          end

          next unless stripped.start_with?('--')

          protected_prefix = protected_prefixes.find { |prefix| stripped.start_with?(prefix) }
          if protected_prefix
            violations << {
              file: Pathname.new(path).relative_path_from(engine_root).to_s,
              line: index + 1,
              category: 'protected-paint-var',
              prefix: protected_prefix,
              source: stripped
            }
            next
          end

          root_name = root_palette_names.find { |name| stripped.start_with?("#{name}:") }
          root_prefix = root_palette_prefixes.find { |prefix| stripped.start_with?(prefix) }
          next unless root_name || root_prefix

          violations << {
            file: Pathname.new(path).relative_path_from(engine_root).to_s,
            line: index + 1,
            category: 'root-palette-var',
            prefix: root_name || root_prefix,
            source: stripped
          }
        end
      end

      if violations.empty?
        puts "✓ framework:themes:lint passed (#{theme_files.size} file#{'s' unless theme_files.size == 1} checked)"
        next
      end

      puts '✗ framework:themes:lint failed'
      puts 'Theme files must use engine-input theming only.'
      puts 'Disallowed: protected paint vars (--bg-*, --text-*, --border-*) and root palette vars (--white/--black, --gray-*, --color-*).'
      puts 'Allowed: semantic/slot mixins (theme-slots.semantic-*, bg-slot, text-slot, border-level-slot, border-token-slot).'
      puts 'Disallowed: deprecated theme-slots.role-token helper.'
      puts

      violations.each do |v|
        puts "#{v[:file]}:#{v[:line]} (#{v[:prefix]})"
        puts "  #{v[:source]}"
      end

      raise 'Protected theme variable overrides detected'
    end
  end
end
