# frozen_string_literal: true

require 'erb'
require 'stringio'
require 'date'

# cogger and rubyzip are build-only (Gemfile development/test group), and this file sits
# in the engine's eager-load path, so requiring them here would drag both into every host
# that boots the engine. Each is required at the one seam that needs it instead.

#
# Builds per-bundle font release ZIPs from `db/data/framework_fonts.yml` and the
# font binaries under `public/fonts/`. Each invocation overwrites the previous
# output - fonts are not versioned.
#
# The output is a pure function of the fonts data, the font binaries, and the recorded
# `released_at`: archives are streamed with a fixed timestamp and a sorted entry list, so
# a run that changes nothing rewrites nothing (no churn in the tracked multi-megabyte
# zips) and a run that does change something dates itself.
#
# Output (under `public/fonts/bundles/`):
#
#   - <bundle>/trmnl-fonts-bundle--<bundle>.zip - font binaries + the license documents inside the archive
#   - <bundle>/README.md                         - bundle credits/license markdown (also embedded in the zip)
#   - <bundle>/OFL.txt                           - copyright notices + OFL text for the bundle's OFL fonts
#   - <bundle>/CC-BY-3.0.txt                     - copyright notices + CC BY 3.0 text for the bundle's CC BY fonts
#   - <bundle>/<fonts_only_zip>                  - the bundle's own families, with their own documents
#
# The full bundle zip also includes the Inter Variable typeface (used on high-density
# displays in both bundles). The fonts-only zip, built for the bundles that name one in
# the yml, carries the bundle's families alone, so its documents are rendered against an
# empty shared list and credit only what the archive ships. Each reproduces a license text
# only when it ships a font under it, so a bundle with no CC BY font gets no CC-BY-3.0.txt.
#
# Driver: `rake framework:release:fonts`.
#
module Framework
  class FontsReleaseTask
    TEMPLATES_DIR = Pathname.new(__dir__).join('templates')
    MARKDOWN_TEMPLATE_PATH = TEMPLATES_DIR.join('fonts_bundle.md.erb')
    OFL_TEXT_PATH = TEMPLATES_DIR.join('ofl-1.1.txt')
    CC_BY_TEXT_PATH = TEMPLATES_DIR.join('cc-by-3.0.txt')
    MARKDOWN_FILENAME = 'README.md'
    OFL_FILENAME = 'OFL.txt'
    CC_BY_FILENAME = 'CC-BY-3.0.txt'

    def initialize(root_dir: Framework::Engine.root, logger: nil, fonts_module: Framework::Fonts)
      @root_dir = Pathname.new(root_dir)
      @logger = logger || begin
        require 'cogger'
        Cogger.new(id: :framework_fonts_release, formatter: :emoji, io: $stdout, level: :info)
      end
      @fonts_module = fonts_module
    end

    def call
      @fonts_module.reload!
      print_header
      ensure_output_dir

      # Render against the recorded date first. Byte-identical output means the fonts data
      # and binaries are unchanged, so the archives and the date both stay put.
      if bundle_ids.all? { |bundle_id| bundle_written?(bundle_id, render_bundle(bundle_id)) }
        print_unchanged
        return
      end

      @released_at = Time.zone.today
      bundle_ids.each { |bundle_id| build_bundle(bundle_id) }
      update_released_at
      print_success
    end

    private

    attr_reader :root_dir, :logger, :fonts_module

    # The date the current archives were cut on, which is what their entry timestamps and
    # their README carry. A run that changes nothing reproduces exactly those bytes. It comes
    # from the file this task rewrites, so the date a bundle was cut with and the date the
    # next run renders against are always the same value.
    def released_at
      @released_at ||= recorded_released_at || Time.zone.today
    end

    def recorded_released_at
      return nil unless fonts_yaml_path.exist?

      raw = YAML.load_file(fonts_yaml_path, permitted_classes: [Date])['released_at']
      return nil if raw.blank?

      raw.is_a?(Date) ? raw : Date.parse(raw.to_s)
    end

    def fonts_yaml_path
      root_dir.join('db', 'data', 'framework_fonts.yml')
    end

    def public_fonts_dir
      root_dir.join('public', 'fonts')
    end

    def output_dir
      public_fonts_dir.join('bundles')
    end

    def bundle_ids
      fonts_module.bundle_ids
    end

    def shared_fonts
      fonts_module.shared
    end

    def print_header
      logger.info { '═' * 60 }
      logger.info { 'Framework Fonts Release' }
      logger.info { '═' * 60 }
    end

    def print_success
      logger.info { '═' * 60 }
      logger.info { "✓ Built #{bundle_ids.size} font bundle(s)" }
      bundle_ids.each do |bundle_id|
        logger.info { "  • #{bundle_output_dir(bundle_id).join(zip_filename(bundle_id)).relative_path_from(root_dir)}" }
      end
      logger.info { '═' * 60 }
      logger.warn { 'Next steps:' }
      logger.warn { "• Commit the rebuilt bundles in #{output_dir.relative_path_from(root_dir)}/" }
      logger.warn { "• Commit the new released_at in #{fonts_yaml_path.relative_path_from(root_dir)}" }
    end

    def print_unchanged
      logger.info { '═' * 60 }
      logger.info { "✓ #{bundle_ids.size} font bundle(s) already current (released #{released_at.iso8601})" }
      logger.info { 'Nothing changed, so nothing was rewritten.' }
      logger.info { '═' * 60 }
    end

    def ensure_output_dir
      FileUtils.mkdir_p(output_dir)
    end

    def bundle_output_dir(bundle_id)
      output_dir.join(bundle_id.to_s)
    end

    def zip_filename(bundle_id)
      "trmnl-fonts-bundle--#{bundle_id}.zip"
    end

    def build_bundle(bundle_id)
      bundle = fonts_module.bundle(bundle_id)
      logger.info { "Building #{bundle[:label]} bundle..." }

      artifacts = render_bundle(bundle_id)
      bundle_dir = bundle_output_dir(bundle_id)
      FileUtils.mkdir_p(bundle_dir)

      artifacts.each do |filename, contents|
        path = bundle_dir.join(filename)
        path.binwrite(contents)
        logger.info { "  ↳ wrote #{path.relative_path_from(root_dir)} (#{file_size_kb(path)} KB)" }
      end
    end

    # Every file a bundle directory holds, as filename => bytes: the archive plus the two
    # documents it embeds. Rendering before writing is what lets an unchanged run compare
    # the result against what is already on disk.
    def render_bundle(bundle_id)
      bundle = fonts_module.bundle(bundle_id)
      markdown = render_markdown(bundle)
      ofl_notice = render_ofl_notice(bundle)
      cc_by_notice = render_cc_by_notice(bundle)

      artifacts = { MARKDOWN_FILENAME => markdown }
      artifacts[OFL_FILENAME] = ofl_notice if ofl_notice
      artifacts[CC_BY_FILENAME] = cc_by_notice if cc_by_notice
      artifacts[zip_filename(bundle_id)] = build_zip(
        file_paths: collect_font_paths(bundle), markdown: markdown, ofl_notice: ofl_notice,
        cc_by_notice: cc_by_notice
      )
      artifacts.merge(render_fonts_only_zip(bundle))
    end

    # A bundle that names a `fonts_only_zip` publishes a second archive next to the full
    # one: its own families without the shared high-density face. Core's Font Family page
    # links the trmnl one as its download, so it is a shipped artifact, not a convenience
    # copy, and it gets documents of its own rather than the full bundle's. Those credit
    # Inter, which this archive does not carry.
    def render_fonts_only_zip(bundle)
      filename = bundle[:fonts_only_zip]
      return {} if filename.blank?

      {
        filename => build_zip(
          file_paths: collect_font_paths(bundle, shared: []),
          markdown: render_markdown(bundle, shared: []),
          ofl_notice: render_ofl_notice(bundle, shared: []),
          cc_by_notice: render_cc_by_notice(bundle, shared: [])
        )
      }
    end

    def bundle_written?(bundle_id, artifacts)
      bundle_dir = bundle_output_dir(bundle_id)
      artifacts.all? do |filename, contents|
        path = bundle_dir.join(filename)
        path.exist? && path.binread == contents.b
      end
    end

    # `shared:` is the seam the fonts-only archive uses: the same collection, minus the
    # high-density face every full bundle carries.
    def collect_font_paths(bundle, shared: shared_fonts)
      bundle_files = bundle[:fonts].flat_map { |font| font[:files] }
      shared_files = shared.flat_map { |font| font[:files] }
      paths = (bundle_files + shared_files).uniq.map { |name| public_fonts_dir.join(name) }
      missing = paths.reject { |path| File.exist?(path) }
      if missing.any?
        raise "Missing font file(s): #{missing.map { |p| p.relative_path_from(root_dir).to_s }.join(', ')}"
      end

      paths
    end

    def render_markdown(bundle, shared: shared_fonts)
      template = File.read(MARKDOWN_TEMPLATE_PATH)
      ofl_text = File.read(OFL_TEXT_PATH)

      license_groups = group_fonts_by_license(bundle, shared: shared)
      current_docs_version = FrameworkController::CURRENT_DOCS_VERSION
      shared_fonts_local = shared
      released_at_local = released_at

      ERB.new(template, trim_mode: '-').result_with_hash(
        bundle: bundle,
        shared_fonts: shared_fonts_local,
        license_groups: license_groups,
        ofl_text: ofl_text,
        released_at: released_at_local,
        current_docs_version: current_docs_version
      )
    end

    def group_fonts_by_license(bundle, shared: shared_fonts)
      all_fonts = bundle[:fonts] + shared
      grouped = all_fonts.group_by { |font| font[:license_id].to_s }
      grouped.delete('')
      grouped
    end

    def render_ofl_notice(bundle, shared: shared_fonts)
      ofl_fonts = group_fonts_by_license(bundle, shared: shared)['ofl']
      return nil if ofl_fonts.blank?

      copyrights = ofl_fonts.map { |font| font[:copyright] }.compact.uniq

      <<~NOTICE
        #{copyrights.join("\n")}

        This Font Software is licensed under the SIL Open Font License, Version 1.1.
        This license is copied below, and is also available with a FAQ at:
        https://openfontlicense.org


        #{File.read(OFL_TEXT_PATH).strip}
      NOTICE
    end

    # The CC BY twin of `render_ofl_notice`. LICENSE promises that the full text of every
    # font license ships with the bundle, and BlockKie is the one font the OFL text does
    # not cover.
    def render_cc_by_notice(bundle, shared: shared_fonts)
      cc_by_fonts = group_fonts_by_license(bundle, shared: shared)['cc-by-3.0']
      return nil if cc_by_fonts.blank?

      copyrights = cc_by_fonts.map { |font| font[:copyright] }.compact.uniq

      <<~NOTICE
        #{copyrights.join("\n")}

        This work is licensed under the Creative Commons Attribution 3.0 Unported
        License. This license is copied below, and is also available at:
        https://creativecommons.org/licenses/by/3.0/


        #{File.read(CC_BY_TEXT_PATH).strip}
      NOTICE
    end

    # Same discipline as the framework release zip (ReleaseTask#build_release_zip): Zip::File#add
    # stamps each entry with the source file's on-disk mtime and the stream entries stamp
    # wall-clock, neither of which survives a fresh checkout. Streaming every entry with the
    # release date (midnight UTC) and a sorted font list makes the archive a function of its
    # contents alone, on any machine in any timezone.
    def build_zip(file_paths:, markdown:, ofl_notice: nil, cc_by_notice: nil)
      require 'zip'
      entries = file_paths.sort_by { |path| File.basename(path) }
                          .map { |path| [File.basename(path), File.binread(path)] }
      entries << [MARKDOWN_FILENAME, markdown]
      entries << [OFL_FILENAME, ofl_notice] if ofl_notice
      entries << [CC_BY_FILENAME, cc_by_notice] if cc_by_notice

      buffer = Zip::OutputStream.write_buffer(StringIO.new(+''.b)) do |zip|
        entries.each do |name, contents|
          entry = Zip::Entry.new('', name)
          entry.time = zip_timestamp
          zip.put_next_entry(entry)
          zip.write(contents)
        end
      end
      buffer.string
    end

    # Midnight UTC, not local: rubyzip records the instant in a UniversalTime extra field,
    # so a local midnight would make the archive bytes a function of the writer's timezone.
    def zip_timestamp
      require 'zip'
      Zip::DOSTime.utc(released_at.year, released_at.month, released_at.day)
    end

    def update_released_at
      raw = File.read(fonts_yaml_path)
      updated = raw.sub(/^released_at:.*$/, "released_at: #{released_at.iso8601}")
      File.write(fonts_yaml_path, updated)
      logger.info { "Updated released_at in #{fonts_yaml_path.relative_path_from(root_dir)}" }
    end

    def file_size_kb(path)
      (File.size(path) / 1024.0).round(1)
    end
  end
end
