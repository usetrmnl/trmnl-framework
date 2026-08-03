# frozen_string_literal: true

require 'English'
require 'stringio'
require 'zlib'

# cogger and rubyzip are build-only (Gemfile development/test group), and this file sits
# in the engine's eager-load path, so requiring them here would drag both into every host
# that boots the engine. Each is required at the one seam that needs it instead.

#
# Publishes a framework release: versioned CSS/JS dist, precompressed siblings (gzip and
# brotli), release zip, release notes, resolved color manifest, and framework_versions.yml.
#
#   - rake framework:release:current - re-release the current version (local iteration)
#   - rake framework:release:patch   - bug fixes
#   - rake framework:release:minor   - backward-compatible features
#   - rake framework:release:major   - breaking changes
#
# The published pair is conventional: plugins.css and plugins.js are the readable
# builds, and plugins.min.css and plugins.min.js are the processed bundles (procss and
# projs output) that production serves via Framework::Version#css_url and #js_url.
#
# Ported from core with two deliberate changes: assets come straight from this repo's
# build (server/app/assets/builds/plugins.css via dartsass, app/javascript/plugin-render/plugins.js
# through projs, with no fingerprint glob over a full app precompile), and every archive is
# written from Ruby with a fixed timestamp so re-releasing identical content is
# byte-identical.
# The published color manifest is new: core's bitmap/dithering pipeline pins it per release.
#
# A pushed v<version> tag freezes that version (see RELEASE.md): re-cuts are refused
# unless HEAD is the tagged commit itself (the rebuild-from-tag flow).
#
module Framework
  class ReleaseTask
    RELEASE_ASSET_NAMES = {
      css: %w[plugins.css plugins.css.gz plugins.css.br
              plugins.min.css plugins.min.css.gz plugins.min.css.br],
      js: %w[plugins.js plugins.js.gz plugins.js.br
             plugins.min.js plugins.min.js.gz plugins.min.js.br]
    }.freeze
    # Themes stay standalone and readable. The processed bundle preserves their custom-
    # property contract while shortening only explicitly private framework vars.
    THEME_RELEASE_ASSET_SUFFIXES = %w[.css .css.gz .css.br].freeze
    # Both precompressed siblings a release publishes, in the order a negotiating server
    # should prefer them. Every artifact that gets one gets both, so the writers stay a
    # single loop and no consumer has to reason about a per-artifact encoding set.
    COMPRESSED_SIBLING_WRITERS = { '.gz' => :gzip, '.br' => :brotli }.freeze
    # The mixin half of the responsive_test parity harness, published per version so the
    # docs page can pin it to the bundle it is compared against. It styles that one page
    # and nothing a consumer renders, so it ships in the version directory but not in the zip.
    RESPONSIVE_TEST_CSS = 'framework/responsive_test.css'
    RELEASE_NOTES_ZIP_ENTRY = 'RELEASE_NOTES.md'
    NPM_VERSION_FIELD = /"version":\s*"[^"]*"/
    COLOR_MANIFEST_NAME = 'framework_colors.resolved.json'
    COLOR_MANIFEST_ZIP_ENTRY = COLOR_MANIFEST_NAME

    def initialize(bump_type, root_dir: Framework::Engine.root, logger: nil)
      @bump_type = bump_type
      @root_dir = Pathname.new(root_dir)
      @logger = logger || begin
        require 'cogger'
        Cogger.new(id: :framework_release, formatter: :emoji, io: $stdout, level: :info)
      end
    end

    # The freeze guard, as a step of its own. `rake framework:release:*` runs it before
    # the build (see framework.rake), because the build regenerates tracked color SCSS:
    # a refusal that arrives afterwards leaves a modified working tree to reason about
    # and revert, which is the opposite of what a freeze guard is for.
    def verify_unpublished
      load_current_version
      calculate_version
      ensure_version_unpublished
    end

    def call
      # Guard first, for the same reason the rake tasks run it ahead of the build:
      # `npm install` rewrites package-lock.json, so the refusal has to land before it.
      print_header
      verify_unpublished
      install_npm_dependencies
      find_assets
      publish_versioned_stylesheets
      publish_versioned_javascript
      publish_color_manifest
      ensure_release_notes
      # Before the zip: release_timestamp stamps every entry from this version's
      # released_at, so the date has to be settled while the archive is being written.
      update_versions_file
      build_versioned_release_zip
      copy_to_latest_directories
      update_gem_version
      update_npm_version
      print_success
    end

    private

    attr_reader :root_dir, :bump_type, :current_version, :new_version, :css_file, :js_file, :logger

    def install_npm_dependencies
      logger.info { 'Installing npm dependencies...' }
      system('npm install', chdir: root_dir.to_s)
      raise 'Failed to install npm dependencies.' unless $CHILD_STATUS.success?
    end

    def framework_versions_yaml = root_dir.join('db', 'data', 'framework_versions.yml')
    # dartsass writes into the host Rails.root builds dir (docs server or mother app).
    def builds_dir = Rails.root.join("app/assets/builds")
    def compiled_css_path = builds_dir.join('plugins.css')
    def compiled_theme_css_path(id) = builds_dir.join('themes', "#{id}-theme.css")

    # The prior release's published themes, or none for versions that predate themes.
    def released_theme_css_paths
      return [] if current_version.nil?

      Pathname.glob(public_css_dir.join(current_version, 'themes', '*.css')).sort
    end

    def compiled_responsive_test_css_path = builds_dir.join(RESPONSIVE_TEST_CSS)
    def runtime_js_path = root_dir.join('app', 'javascript', 'plugin-render', 'plugins.js')
    def public_css_dir = root_dir.join('public', 'css')
    def public_js_dir = root_dir.join('public', 'js')
    def public_framework_dir = root_dir.join('public', 'framework')
    def release_notes_dir = public_framework_dir.join('releases')
    def color_manifests_dir = public_framework_dir.join('colors')

    def print_header
      logger.info { '═' * 60 }
      logger.info { "Framework Release: #{bump_type.upcase}" }
      logger.info { '═' * 60 }
    end

    def load_current_version
      config = load_versions_config
      @current_version = config['latest']
      logger.info { "Current version: #{current_version}" }
    end

    def calculate_version
      @new_version = calculate_new_version(current_version, bump_type)
      logger.info { "New version: #{new_version}" }
    end

    # The framework compiles in this repo: dartsass emits the CSS bundle and the JS
    # runtime is a self-contained source file, published minified with its build marker
    # stamped to the released version.
    def find_assets
      logger.info { 'Locating compiled release assets...' }

      raise "CSS bundle not found at #{compiled_css_path} - run `bin/rails dartsass:build` first" unless compiled_css_path.exist?
      raise "JS runtime not found at #{runtime_js_path}" unless runtime_js_path.exist?

      Framework::Themes.ids.each do |id|
        path = compiled_theme_css_path(id)
        raise "Theme CSS not found at #{path} - run `bin/rails dartsass:build` first" unless path.exist?
      end

      unless compiled_responsive_test_css_path.exist?
        raise "Responsive test CSS not found at #{compiled_responsive_test_css_path} - run `bin/rails dartsass:build` first"
      end

      @css_file = compiled_css_path.to_s
      @js_file = runtime_js_path.to_s
      logger.info { "Found CSS: #{compiled_css_path.relative_path_from(root_dir)}" }
      logger.info { "Found JS: #{runtime_js_path.relative_path_from(root_dir)}" }
      logger.info { "Found themes: #{Framework::Themes.ids.join(', ')}" }
    end

    # plugins.css ships as the readable build straight from the compiler; plugins.min.css
    # is the procss output production serves. The standalone theme and harness
    # stylesheets stay unprocessed beside them.
    def publish_versioned_stylesheets
      logger.info { "Processing CSS for version #{new_version}..." }
      css_version_dir = public_css_dir.join(new_version)
      FileUtils.mkdir_p(css_version_dir)

      readable_css = css_version_dir.join('plugins.css')
      FileUtils.cp(css_file, readable_css)
      logger.info { "Copied readable CSS to #{readable_css}" }
      compress_siblings(readable_css)

      process_stylesheet(css_file, css_version_dir.join('plugins.min.css'))
      compress_siblings(css_version_dir.join('plugins.min.css'))
      copy_theme_stylesheets(css_version_dir)
      copy_responsive_test_stylesheet(css_version_dir)
    end

    def publish_versioned_javascript
      logger.info { "Processing JS for version #{new_version}..." }
      js_version_dir = public_js_dir.join(new_version)
      FileUtils.mkdir_p(js_version_dir)

      process_javascript(new_version, js_file, js_version_dir.join('plugins.js'), minify: false)
      compress_siblings(js_version_dir.join('plugins.js'))
      process_javascript(new_version, js_file, js_version_dir.join('plugins.min.js'))
      compress_siblings(js_version_dir.join('plugins.min.js'))
    end

    # Core's bitmap/dithering pipeline reads the same resolved color manifest the Sass
    # tokens are generated from; publishing it per release lets core pin it.
    def publish_color_manifest
      logger.info { "Publishing resolved color manifest for #{new_version}..." }
      dir = color_manifests_dir.join(new_version)
      FileUtils.mkdir_p(dir)
      Framework::ColorManifest.write_resolved_json(dir.join(COLOR_MANIFEST_NAME))
      logger.info { "Wrote #{dir.join(COLOR_MANIFEST_NAME).relative_path_from(root_dir)}" }
    end

    def copy_to_latest_directories
      logger.info { 'Copying assets to latest...' }
      copy_assets_to_latest
    end

    def build_versioned_release_zip
      logger.info { "Building release ZIP for version #{new_version}..." }
      build_release_zip(new_version)
    end

    def ensure_release_notes
      FileUtils.mkdir_p(release_notes_dir)
      path = release_notes_path(new_version)
      return if path.exist?

      path.write(default_release_notes)
      logger.info { "Wrote release notes template to #{path.relative_path_from(root_dir)}" }
    end

    def update_versions_file
      logger.info { 'Updating framework_versions.yml...' }
      update_framework_versions(new_version)
    end

    def print_success
      logger.info { '═' * 60 }
      logger.info { "✓ Framework #{new_version} released successfully!" }
      logger.info { '═' * 60 }
      logger.warn { 'Next steps:' }
      logger.warn { "• Commit the updated #{framework_versions_yaml}" }
      logger.warn { "• Commit the updated #{gem_version_file.relative_path_from(root_dir)}" }
      logger.warn { '• Commit the updated package.json and package-lock.json' }
      logger.warn { "• Commit the new assets in public/css/#{new_version}/ and public/js/#{new_version}/" }
      logger.warn { '• Commit the new assets in public/css/latest/ and public/js/latest/' }
      logger.warn { "• Commit the new zip public/framework/#{release_zip_filename(new_version)}" }
      logger.warn { "• Commit the new color manifest in public/framework/colors/#{new_version}/" }
      logger.warn { "• Review release notes in #{release_notes_path(new_version).relative_path_from(root_dir)}" }
      logger.warn { '• Open a release PR; after it merges to main, tag it (see RELEASE.md):' }
      logger.warn { "•   git tag -a v#{new_version} -m \"Framework #{new_version}\" && git push origin v#{new_version}" }
      logger.warn { '•   The Release workflow then publishes the GitHub Release from the tag.' }
    end

    def load_versions_config
      YAML.load_file(framework_versions_yaml)
    end

    def save_versions_config(config)
      yaml_content = config.to_yaml(line_width: -1)
      yaml_content = yaml_content.sub(/\A---\n/, '')

      comment = "# This file is auto-generated. Do not edit manually. Use rake framework:release:{current,major,minor,patch}\n"
      File.write(framework_versions_yaml, comment + yaml_content)
    end

    def calculate_new_version(current_version, bump_type)
      parts = current_version.split('.').map(&:to_i)
      case bump_type.to_s
      when 'current'
        current_version
      when 'major'
        "#{parts[0] + 1}.0.0"
      when 'minor'
        "#{parts[0]}.#{parts[1] + 1}.0"
      when 'patch'
        "#{parts[0]}.#{parts[1]}.#{parts[2] + 1}"
      else
        raise ArgumentError, "Invalid bump type: #{bump_type}"
      end
    end

    # A pushed v<version> tag means the version is published and frozen: its source and
    # artifacts are pinned by that tag, and a re-cut here would drift main away from it.
    # The one legitimate rebuild of a published version runs from its own tag checkout,
    # where HEAD is the tagged commit and determinism reproduces the artifacts byte-for-byte.
    def ensure_version_unpublished
      tag = version_tag(new_version)
      tag_sha = git_commit_sha("refs/tags/#{tag}")
      return if tag_sha.nil? || tag_sha == git_commit_sha('HEAD')

      raise "Framework #{new_version} is published and frozen: tag #{tag} exists. " \
            'Cut the next version instead (rake framework:release:patch), or rebuild this ' \
            "one from its tag checkout (git checkout #{tag}). See RELEASE.md."
    end

    def version_tag(version) = "v#{version}"

    # A version is published once its tag exists, whatever HEAD is.
    def version_published?(version) = !git_commit_sha("refs/tags/#{version_tag(version)}").nil?

    # nil outside a git checkout or for a missing ref, which leaves the guard inert:
    # tag truth lives in git, so without a repository there is nothing to enforce.
    def git_commit_sha(ref)
      sha = IO.popen(['git', '-C', root_dir.to_s, 'rev-parse', '--quiet', '--verify', "#{ref}^{commit}"],
                     err: File::NULL, &:read)
      $CHILD_STATUS.success? ? sha.strip : nil
    rescue Errno::ENOENT
      nil
    end

    def copy_theme_stylesheets(css_version_dir)
      themes_dir = css_version_dir.join('themes')
      FileUtils.mkdir_p(themes_dir)
      Framework::Themes.ids.each do |id|
        theme_dest = themes_dir.join("#{id}-theme.css")
        FileUtils.cp(compiled_theme_css_path(id), theme_dest)
        logger.info { "Copied theme CSS to #{theme_dest}" }
        compress_siblings(theme_dest)
      end
    end

    def copy_responsive_test_stylesheet(css_version_dir)
      harness_dest = css_version_dir.join(RESPONSIVE_TEST_CSS)
      FileUtils.mkdir_p(harness_dest.dirname)
      FileUtils.cp(compiled_responsive_test_css_path, harness_dest)
      logger.info { "Copied responsive test CSS to #{harness_dest}" }
      compress_siblings(harness_dest)
    end

    # Ruby's zlib rather than whatever `gzip` is on PATH: the header is easy to zero out
    # but the deflate stream is implementation-specific (Apple gzip, GNU gzip and node's
    # zlib all disagree on the same input), and the .gz files are committed artifacts a
    # rebuild-from-tag has to reproduce byte for byte on any machine. This pins the
    # compressor to the Ruby the release already pins, and emits the same bytes the
    # published archives were cut with: mtime 0, no stored filename, level 9.
    #
    # Compression happens in memory and lands in one write, so a failure raises before
    # dest is touched instead of leaving a truncated archive behind.
    def gzip(source, dest)
      buffer = StringIO.new(+''.b)
      writer = Zlib::GzipWriter.new(buffer, Zlib::BEST_COMPRESSION)
      writer.mtime = 0
      writer.write(File.binread(source))
      writer.close

      File.binwrite(dest.to_s, buffer.string)
      logger.info { "Gzipped to #{dest}" }
    end

    # The brotli half of the same contract, through the exactly pinned Ruby gem so the bytes
    # are a property of the release rather than of whatever `brotli` binary the machine has.
    # Both parameters that move the output are named rather than defaulted: quality 11 (the
    # maximum, which is the whole point of a precompressed sibling) and window 24, the
    # largest the format allows without the large-window extension every decoder would have
    # to opt into. That pair is what the release's `brotli -q 11` measurements were
    # taken with; the library default of 22 costs ~4 KB on the
    # CSS bundle. The format stores no timestamp or filename, so there is no header to zero
    # out, and the one-write shape matches gzip: a missing source raises before dest exists.
    #
    # Build-only, required here rather than at the top of the file: this file eager-loads
    # into every host that mounts the engine, and serving a `.br` needs no decoder.
    def brotli(source, dest)
      require 'brotli'

      compressed = Brotli.deflate(File.binread(source), quality: 11, lgwin: 24)

      File.binwrite(dest.to_s, compressed)
      logger.info { "Brotlied to #{dest}" }
    end

    # Every published plaintext artifact gets the same sibling set, so call sites name the
    # plaintext file once and the encodings stay defined in COMPRESSED_SIBLING_WRITERS.
    def compress_siblings(source)
      COMPRESSED_SIBLING_WRITERS.each do |suffix, writer|
        send(writer, source, Pathname.new("#{source}#{suffix}"))
      end
    end

    # The published stylesheet is the procss output: minified, with private framework
    # variables renamed and every registered theme handed over as a preserved contract,
    # so a theme file keeps resolving against the bundle it ships with. The prior
    # release's published themes ride along: a pinned or cached theme file from that
    # version keeps resolving against this bundle even where the current theme sources
    # no longer name a variable.
    def process_stylesheet(css_file, css_dest)
      command = ['npm', 'run', '--silent', 'process_stylesheets', '--', css_file, '--output', css_dest.to_s]
      Framework::Themes.ids.each do |id|
        command.push('--preserve-variables-from', compiled_theme_css_path(id).to_s)
      end
      released_theme_css_paths.each do |path|
        command.push('--preserve-variables-from', path.to_s)
      end

      system(*command, chdir: root_dir.to_s)
      raise "CSS processing failed for #{css_file}" unless $CHILD_STATUS.success?

      logger.info { "Processed CSS to #{css_dest}" }
    end

    # Both published runtimes carry a build marker rewritten to this version, so a pinned
    # /js/<version>/plugins.js reports which release it is. The rewrite and the terser
    # pass live in the JS pipeline (lib/projs/projs.cjs); minify: false publishes the
    # stamped source unminified for the readable plugins.js.
    def process_javascript(version, js_file, js_dest, minify: true)
      command = ['npm', 'run', '--silent', 'process_scripts', '--', js_file,
                 '--stamp', version, '--output', js_dest.to_s]
      command.push('--no-minify') unless minify
      system(*command, chdir: root_dir.to_s)
      raise "JS processing failed for #{js_file}" unless $CHILD_STATUS.success?

      logger.info { "Processed JS to #{js_dest}" }
    end

    def copy_assets_to_latest
      css_version_dir = public_css_dir.join(new_version)
      js_version_dir = public_js_dir.join(new_version)
      css_latest_dir = public_css_dir.join('latest')
      js_latest_dir = public_js_dir.join('latest')

      # Rebuild latest/ from scratch so assets removed from the release don't linger.
      FileUtils.rm_rf([css_latest_dir, js_latest_dir])
      FileUtils.mkdir_p(css_latest_dir)
      FileUtils.mkdir_p(js_latest_dir)

      mirror_release_dir(css_version_dir, css_latest_dir)
      mirror_release_dir(js_version_dir, js_latest_dir)
    end

    # Copies whole entries rather than a loop per subdirectory: latest/ has to be an exact
    # mirror of the version directory (bin/parity-check diffs the two), and a release that
    # publishes a new subtree should not need another copy loop here to stay mirrored.
    def mirror_release_dir(version_dir, latest_dir)
      Dir.glob(version_dir.join('*')).each do |entry|
        FileUtils.cp_r(entry, latest_dir)
        logger.info { "Copied #{File.basename(entry)} to #{latest_dir}" }
      end
    end

    def build_release_zip(version)
      require 'zip'
      FileUtils.mkdir_p(public_framework_dir)

      zip_path = public_framework_dir.join(release_zip_filename(version))
      FileUtils.rm_f(zip_path)

      entries = release_zip_entries(version)
      missing = entries.map(&:last).reject { |path| File.exist?(path) }
      if missing.any?
        relative_missing = missing.map { |path| path.relative_path_from(root_dir) }.join(', ')
        raise "Missing release asset(s): #{relative_missing}"
      end

      # Zip::File#add stamps wall-clock mtimes at commit; stream entries with a fixed
      # timestamp so re-releasing identical content is byte-identical, the same way the
      # gzipped variants zero their header timestamp.
      timestamp = release_timestamp(version)
      Zip::OutputStream.open(zip_path) do |zip|
        entries.each do |entry_name, path|
          entry = Zip::Entry.new(zip_path.to_s, entry_name)
          entry.time = timestamp
          zip.put_next_entry(entry)
          zip.write(File.binread(path))
        end
      end

      logger.info { "Wrote #{zip_path.relative_path_from(root_dir)}" }
    end

    def release_zip_entries(version)
      asset_entries = RELEASE_ASSET_NAMES.flat_map do |type, names|
        source_dir = type == :css ? public_css_dir : public_js_dir
        names.map do |name|
          ["#{type}/#{name}", source_dir.join(version, name)]
        end
      end

      theme_entries = Framework::Themes.ids.flat_map do |id|
        THEME_RELEASE_ASSET_SUFFIXES.map do |suffix|
          name = "#{id}-theme#{suffix}"
          ["css/themes/#{name}", public_css_dir.join(version, 'themes', name)]
        end
      end

      asset_entries + theme_entries + [
        [RELEASE_NOTES_ZIP_ENTRY, release_notes_path(version)],
        [COLOR_MANIFEST_ZIP_ENTRY, color_manifests_dir.join(version, COLOR_MANIFEST_NAME)]
      ]
    end

    def release_zip_filename(version)
      "trmnl-framework--#{version}.zip"
    end

    # Midnight UTC, not local: rubyzip records the instant in a UniversalTime extra field,
    # so a local midnight would make the archive bytes a function of the writer's timezone.
    def release_timestamp(version)
      require 'zip'
      released_at = load_versions_config['versions'].find { |v| v['number'] == version }&.dig('released_at')
      date = released_at ? Date.parse(released_at.to_s) : Time.zone.today
      Zip::DOSTime.utc(date.year, date.month, date.day)
    end

    def release_notes_path(version)
      release_notes_dir.join("#{version}.md")
    end

    def default_release_notes
      <<~MARKDOWN
        # Framework v#{new_version}

        Released on #{Time.zone.today.iso8601}.

        ## Framework Changes

        - TODO: Add notable framework CSS, JavaScript runtime, generated asset, utility behavior, or public API changes.

        ## Upgrade Notes

        - TODO: Add user action required for this release, or remove this section if there is none.

        ## Documentation Changes

        - TODO: Add notable docs, examples, guide, notice, generated markdown, or navigation changes.
      MARKDOWN
    end

    # released_at is the date of the cut that ships, so an unpublished version carries the
    # date of its latest re-cut: it is re-released until the tag goes up, and a stale date
    # would list it out of order against versions released in the meantime. A published
    # version is never re-dated. The rebuild-from-tag flow reproduces frozen artifacts, and
    # release_timestamp stamps every zip entry from this date.
    def update_framework_versions(new_version)
      config = load_versions_config

      config['latest'] = new_version
      entry = config['versions'].find { |v| v['number'] == new_version }

      if entry.nil?
        config['versions'] << { 'number' => new_version, 'released_at' => Time.zone.today.to_s }
      elsif !version_published?(new_version)
        entry['released_at'] = Time.zone.today.to_s
      end

      save_versions_config(config)
      logger.info { "Updated #{framework_versions_yaml}" }
      logger.info { "Latest version: #{new_version}" }
    end

    def gem_version_file = root_dir.join('lib', 'trmnl_framework', 'version.rb')
    def npm_manifest_file = root_dir.join('package.json')
    def npm_lockfile = root_dir.join('package-lock.json')

    # The gemspec reads Framework::VERSION, so the gem version follows the released
    # framework version; the Release workflow refuses tags where the two disagree.
    def update_gem_version
      pattern = /VERSION = "[^"]*"/
      contents = gem_version_file.read
      raise "VERSION constant not found in #{gem_version_file}" unless contents.match?(pattern)

      gem_version_file.write(contents.sub(pattern, %(VERSION = "#{new_version}")))
      logger.info { "Updated #{gem_version_file.relative_path_from(root_dir)} to #{new_version}" }
    end

    # package.json is private and never published to npm, but its version is the one a
    # reader compares against Framework::VERSION, so it follows the release like the gem
    # version does. The lockfile records the same number in its header and `npm install`
    # rewrites it on the next run, which would land an unattributed diff in a later
    # release commit; updating both here keeps that diff inside the release that caused it.
    def update_npm_version
      rewrite_npm_version(npm_manifest_file, 1)
      rewrite_npm_version(npm_lockfile, 2)
    end

    # The manifest version appears once in package.json and twice in the lockfile header
    # (the root object and its "" package entry). Everything from the first "node_modules/"
    # key on is a dependency's own version and must not move, so only the head is rewritten
    # and the expected count is asserted rather than assumed.
    def rewrite_npm_version(path, expected)
      head, separator, tail = path.read.partition('"node_modules/')
      found = head.scan(NPM_VERSION_FIELD).length
      unless found == expected
        raise "Expected #{expected} version field(s) in #{path.relative_path_from(root_dir)}, found #{found}"
      end

      path.write(head.gsub(NPM_VERSION_FIELD, %("version": "#{new_version}")) + separator + tail)
      logger.info { "Updated #{path.relative_path_from(root_dir)} to #{new_version}" }
    end
  end
end
