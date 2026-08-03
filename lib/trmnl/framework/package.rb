# frozen_string_literal: true

module Framework
  # The gem's file list, in one place so the gemspec stays declarative and both ways of
  # building the gem can be checked against each other.
  #
  # A build from the repo reads `git ls-files`. A build from a source tarball has no .git,
  # so it globs the packaged subtrees instead. The two have to agree: `packaged?` is the
  # single filter, `PACKAGED_SUBTREES` is the single subtree list, and `GENERATED_PATHS`
  # names the gitignored build output that only the glob branch can ever see.
  #
  # Plain Ruby on purpose: the gemspec loads this file before any Rails is available, and
  # the engine keeps lib/trmnl/framework out of the autoloader.
  module Package
    ROOT = Pathname.new(__dir__).join("../../..").expand_path

    # The only subtrees a package ever draws from.
    PACKAGED_SUBTREES = %w[app config db/data lib public vendor].freeze

    # Root files that ship alongside them. No npm manifest: package.json is `private:
    # true` and describes the repo's Node build tooling (the minifiers and the Playwright
    # suites), the lockfile pins that tooling's devDependencies, and nothing in the
    # packaged tree reads either. `rake framework:release:*` bumps their version fields,
    # and that runs from a checkout, never from an installed gem.
    # MIT-LICENSE used to sit here and never matched a file: the repo has one license file
    # and it is named LICENSE. THIRD_PARTY_NOTICES.md travels with it because the gem
    # packages public/images and public/fonts, which is what it covers.
    PACKAGED_ROOT_FILES = %w[
      trmnl-framework.gemspec
      README.md
      LICENSE
      THIRD_PARTY_NOTICES.md
    ].freeze

    # Trees that exist only to run the repo, never to ship. Two prefixes that used
    # to sit here are gone because neither had anything to guard: there is no
    # top-level config/environments (the engine's config/ holds the importmap, the
    # routes and the Tailwind config, and the docs server's environment files live
    # under server/, which matches no packaged subtree), and scripts/ no longer
    # exists at all.
    EXCLUDED_PREFIXES = %w[spec/ test/ docs/ prelaunch-briefs/ bin/].freeze

    EXCLUDED_ROOT_FILES = %w[config.ru Rakefile Procfile.dev].freeze

    # The Node suffix for a test file. lib/procss and lib/projs are build-time tooling the
    # engine tells Zeitwerk to ignore, and their `node --test` files are the spec/ tree of
    # that tooling: repo-only, like everything else EXCLUDED_PREFIXES drops.
    EXCLUDED_SUFFIXES = %w[.test.cjs].freeze

    # Build output that lands inside a packaged subtree and is gitignored: compiled
    # bundles, `rake framework:generate_markdown` output, a local bundle path. The git
    # branch never sees these; naming them keeps the glob branch from sweeping them in.
    GENERATED_PATHS = %w[
      public/assets/
      public/framework/docs/
      public/framework/examples/
      public/llms.txt
      public/llms-full.txt
      vendor/bundle/
      vendor/cache/
    ].freeze

    # OS and editor droppings. git ignores them, so only the glob branch can ever see one,
    # and a .DS_Store anywhere under public/ would be enough to make a tarball build pack a
    # different list than a repo build. Filtered here so the two branches cannot diverge on
    # a working copy that is dirty but clean by git's reckoning.
    JUNK_BASENAMES = %w[.DS_Store Thumbs.db desktop.ini].freeze

    def self.junk?(path)
      basename = File.basename(path)

      JUNK_BASENAMES.include?(basename) || basename.start_with?("._")
    end

    def self.packaged?(path)
      return false if junk?(path)
      return false if EXCLUDED_PREFIXES.any? { |prefix| path.start_with?(prefix) }
      return false if EXCLUDED_ROOT_FILES.include?(path)
      return false if EXCLUDED_SUFFIXES.any? { |suffix| path.end_with?(suffix) }
      return false if path.start_with?("app/assets/builds/") && !path.end_with?(".keep")
      return false if GENERATED_PATHS.any? { |generated| path.start_with?(generated) }

      PACKAGED_SUBTREES.any? { |dir| path.start_with?("#{dir}/") } || PACKAGED_ROOT_FILES.include?(path)
    end

    # Everything git knows about, or [] outside a work tree.
    def self.tracked_paths
      Dir.chdir(ROOT) do
        next [] unless system("git", "rev-parse", "--is-inside-work-tree", out: File::NULL, err: File::NULL)

        `git ls-files -z`.split("\x0")
      end
    end

    # FNM_DOTMATCH so app/assets/builds/.keep survives: it is the one dotfile the filter
    # deliberately keeps, and a plain glob drops every dotfile.
    def self.globbed_paths
      Dir.chdir(ROOT) do
        subtree_files = PACKAGED_SUBTREES.flat_map { |dir| Dir.glob("#{dir}/**/*", File::FNM_DOTMATCH) }
        (subtree_files + PACKAGED_ROOT_FILES).select { |path| File.file?(path) }.uniq
      end
    end

    def self.tracked_files = tracked_paths.select { |path| packaged?(path) }

    def self.globbed_files = globbed_paths.select { |path| packaged?(path) }

    def self.files
      tracked = tracked_files
      tracked.any? ? tracked : globbed_files
    end
  end
end
