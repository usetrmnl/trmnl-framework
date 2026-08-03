# frozen_string_literal: true

module Framework
  # Which asset set the docs link: the live local build, or the published releases
  # under public/css|js.
  #
  # Two kinds of host mount these docs. The framework repo's own server (Rails.root
  # IS the engine's server/ directory) is where the Sass is edited, so it serves the
  # live build by default: an edit shows up on reload with nothing to enable. Every
  # other host mounts the gem to read the docs, so it serves releases, and keeps the
  # opt-in marker `Framework::Version.development_mode?` reads.
  #
  # This object answers for the host. Version scoping is the caller's half of the
  # rule: only the current docs version ever links the live build, because a frozen
  # track documents the release it was cut from (FrameworkController).
  class DocsServingMode
    # Consumer-host opt-in, written by `rake framework:development:enable`. Same file
    # `Framework::Version.development_mode?` reads; that method is the mother app's
    # plugin-view API and resolves the path itself, so the two are pinned together by
    # spec/lib/framework/docs_serving_mode_spec.rb rather than by a shared constant.
    DEVELOPMENT_MARKER = "tmp/framework-development.txt"

    # Framework-repo opt-out, written by `rake framework:release_preview:enable`.
    # Checking that a freshly cut release renders the way a visitor will see it is the
    # one job live serving is wrong for, so this beats every reason to go live.
    RELEASE_PREVIEW_MARKER = "tmp/framework-release-preview.txt"

    def self.current = new

    # Inputs are injected so the whole matrix is testable from a tmpdir: specs run in
    # the test environment, where nothing is ever live.
    def initialize(env: Rails.env, rails_root: Rails.root, builds_dir: nil)
      @env = env
      @rails_root = Pathname(rails_root)
      @builds_dir = Pathname(builds_dir || @rails_root.join("app/assets/builds"))
    end

    attr_reader :builds_dir

    def live? = reason == :live

    # Why the docs serve what they serve. The badge and the boot log both say it, so a
    # developer looking at an unchanged page knows whether to rebuild or clear a marker.
    #
    # :live                  the live build, for the current docs version
    # :release_preview       the opt-out marker is present
    # :incomplete_build      nothing compiled #missing_build yet
    # :marker_off            a consumer host that never asked for live serving
    # :not_development       production, test, and every deployed docs site
    def reason
      @reason ||= resolve
    end

    # The framework repo's own docs server. Rails.root is the engine's server/ tree
    # here and somewhere else entirely on a host that installed the gem. Compared
    # through realpath so a symlinked checkout (or /var vs /private/var) still matches.
    def framework_repo_host?
      resolved(@rails_root) == resolved(Engine.root.join("server"))
    end

    # The one environment where live serving is possible at all, so it is also the one
    # that gets the mode badge.
    delegate :development?, to: :@env

    def release_preview? = marker?(RELEASE_PREVIEW_MARKER)

    def development_marker? = marker?(DEVELOPMENT_MARKER)

    # Everything the docs layout links from the build tree. The bundle alone is not
    # enough: a partial builds/ used to leave the theme and harness stylesheets as
    # unguarded Propshaft lookups, which is a 500 rather than a missing style.
    def required_builds
      ["plugins.css", "framework/responsive_test.css"] + Themes.ids.map { |id| Themes.css_path(id) }
    end

    # First required build that was never compiled, relative to builds_dir. nil once
    # the set is complete.
    def missing_build
      return @missing_build if defined?(@missing_build)

      @missing_build = required_builds.find { |file| !@builds_dir.join(file).exist? }
    end

    # Page-cache discriminator. Deploys move Rails.root and releases move the URL, but
    # a live rebuild moves neither, so cached HTML would keep naming the old digests.
    # nil outside live serving, which leaves the deployed cache key exactly as it was.
    def build_fingerprint
      return nil unless live?

      required_builds.filter_map do |file|
        path = @builds_dir.join(file)
        path.mtime.to_i if path.exist?
      end.max
    end

    # One line for the boot log and the badge tooltip: the state, then what to do about it.
    def explanation
      case reason
      when :live
        "Serving the live build from #{@builds_dir}. Edit the Sass, reload the page."
      when :release_preview
        "Release preview is on (#{RELEASE_PREVIEW_MARKER}). " \
        "Run bin/rails framework:release_preview:disable to serve the live build again."
      when :incomplete_build
        "Serving released assets: nothing has compiled #{missing_build} yet. Run bin/dev (or bin/setup)."
      when :marker_off
        "Serving released assets. Run bin/rails framework:development:enable to serve the live build on this host."
      else
        "Serving released assets."
      end
    end

    private

    def resolve
      return :not_development unless @env.development?
      return :release_preview if release_preview?
      return :marker_off unless framework_repo_host? || development_marker?
      return :incomplete_build if missing_build

      :live
    end

    def marker?(name) = @rails_root.join(name).exist?

    def resolved(path) = path.exist? ? path.realpath : path.cleanpath
  end
end
