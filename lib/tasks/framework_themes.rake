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

      # The whole theme contract lives in three namespaces. Anything else a theme
      # declares - paint internals, root palette, geometry, font metrics - is
      # engine- or device-owned and belongs behind a contract slot or factor.
      contract_namespaces = /\A--(framework-|theme-|tn-text-stroke-)/
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
          next if stripped.match?(contract_namespaces)

          violations << {
            file: Pathname.new(path).relative_path_from(engine_root).to_s,
            line: index + 1,
            category: 'non-contract-var',
            prefix: stripped[/\A--[a-z0-9-]+/],
            source: stripped
          }
        end
      end

      if violations.empty?
        puts "✓ framework:themes:lint passed (#{theme_files.size} file#{'s' unless theme_files.size == 1} checked)"
        next
      end

      puts '✗ framework:themes:lint failed'
      puts 'Theme files may declare contract variables only: --framework-*, --theme-*, --tn-text-stroke-*.'
      puts 'Use the theme-slots mixins for paint, the --framework-layout-* factors for structure,'
      puts 'and --framework-font-weight-shift for weight. Raw paint, palette, geometry, and font'
      puts 'metric variables are engine- or device-owned.'
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
