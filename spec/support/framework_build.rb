# frozen_string_literal: true

require 'digest'
require 'fileutils'

# Compiles the framework bundles at most once per rspec process.
#
# Twelve specs read app/assets/builds, and each one used to shell out to
# `bin/rails dartsass:build` from its own before(:all). A full run therefore compiled
# the same 17 MB bundle nine times over for one bundle's worth of coverage. Every
# caller goes through here now, so the build runs once, and not at all when what is
# already on disk was produced by the sources currently in the tree.
#
# Freshness is a digest of the build inputs rather than a timestamp or a bare
# existence check: the Sass tree, the YAML the generators read, and the generators
# themselves. Any edit there moves the digest, so a stale bundle can never satisfy a
# changed source. The stamp is written only after a build succeeds, and the artifacts
# are checked alongside it, so a wiped builds/ directory rebuilds whatever the stamp
# says.
module FrameworkBuild
  # The bundle the contract specs scan, relative to Rails.root.
  PLUGINS_CSS = 'app/assets/builds/plugins.css'

  # Written by dartsass:build, relative to Rails.root (the docs server owns builds/).
  SASS_OUTPUTS = [
    PLUGINS_CSS,
    'app/assets/builds/plugins_legacy.css',
    'app/assets/builds/framework/responsive_test.css'
  ].freeze

  TAILWIND_OUTPUT = 'app/assets/builds/tailwind.css'

  # Every input that decides the compiled bundle, relative to the engine root. The
  # stylesheet tree is what dartsass reads directly. db/data and the Ruby generators
  # produce the committed token partials that tree @uses, so an edit there changes
  # what the bundle should contain without touching a single .scss file; digesting
  # them keeps the guard on the safe side of that seam.
  SOURCE_GLOBS = %w[
    app/assets/stylesheets/**/*
    db/data/*.yml
    lib/framework/**/*.rb
    lib/tasks/framework.rake
  ].freeze

  # Every input that decides the compiled tailwind bundle, relative to the engine root.
  # The entry stylesheet and the theme config it @configs are read directly. The rest
  # are the trees the entry lists as @source: the scanner turns class strings there
  # into rules, so a demo that gains a variant class changes the output without an
  # edit to any stylesheet, which is exactly the change the collision guard watches for.
  TAILWIND_SOURCE_GLOBS = %w[
    app/assets/tailwind/**/*.css
    config/tailwind.config.js
    app/components/**/*
    app/helpers/**/*.rb
    app/javascript/**/*.js
    app/views/**/*
    lib/**/*.rb
  ].freeze

  STAMP = 'tmp/framework_build.digest'
  TAILWIND_STAMP = 'tmp/tailwind_build.digest'

  class << self
    # Compiles plugins.css and its siblings. Safe to call from every example group:
    # the first call builds, the rest return.
    def sass!
      return if @sass_built

      digest = source_digest(SOURCE_GLOBS)
      unless artifacts_present? && stamp.file? && stamp.read == digest
        rails!('dartsass:build')
        FileUtils.mkdir_p(stamp.dirname)
        stamp.write(digest)
      end

      @sass_built = true
    end

    # The compiled bundle, built if needed and then read once per rspec process.
    #
    # Fifteen spec files scan plugins.css, and each one declared its own
    # `subject(:css) { ... .read }`, so a run allocated a fresh 17 MB string for
    # every one of their examples. Nothing can change those bytes mid-run: sass!
    # is the only writer the suite has, and it is finished before the first read
    # returns. The string is frozen so a caller that tries to edit the shared copy
    # fails on the spot instead of corrupting every later example.
    def plugins_css
      sass!
      @plugins_css ||= Rails.root.join(PLUGINS_CSS).read.freeze
    end

    # The docs layout links tailwind.css, so Propshaft raises MissingAssetError
    # without it. The variant collision guard also reads it, so presence alone is no
    # longer the contract: a bundle built before a demo picked up a new variant class
    # would let the guard pass on output the app no longer serves. Same digest stamp
    # the Sass side uses, over the entry stylesheet and the trees it scans.
    def tailwind!
      return if @tailwind_built

      digest = source_digest(TAILWIND_SOURCE_GLOBS)
      unless Rails.root.join(TAILWIND_OUTPUT).exist? && tailwind_stamp.file? && tailwind_stamp.read == digest
        rails!('tailwindcss:build')
        FileUtils.mkdir_p(tailwind_stamp.dirname)
        tailwind_stamp.write(digest)
      end

      @tailwind_built = true
    end

    # The compiled tailwind bundle, built if needed and then read once per rspec
    # process. Same sharing rule as plugins_css: one frozen string, no mid-run writer.
    def tailwind_css
      tailwind!
      @tailwind_css ||= Rails.root.join(TAILWIND_OUTPUT).read.freeze
    end

    # What a docs request spec needs to render a page through the app layout.
    def docs_assets!
      tailwind!
      sass!
    end

    private

    def artifacts_present?
      SASS_OUTPUTS.all? { |path| Rails.root.join(path).exist? }
    end

    def stamp = Framework::Engine.root.join(STAMP)

    def tailwind_stamp = Framework::Engine.root.join(TAILWIND_STAMP)

    # The build tasks are defined by the docs server's Rails, which is the app
    # bin/rails boots. Same call the specs used to make inline, paid once.
    def rails!(task)
      system(Framework::Engine.root.join('bin/rails').to_s, task, exception: true)
    end

    # SHA256 over the path and bytes of every input file, sorted so the digest
    # describes the tree and not the order the filesystem happened to list it in.
    # Paths go into the digest too, so a rename registers even when no byte moves.
    def source_digest(globs)
      root = Framework::Engine.root
      files = globs.flat_map { |glob| Dir.glob(root.join(glob)) }
                   .select { |path| File.file?(path) }
                   .uniq.sort

      files.each_with_object(Digest::SHA256.new) do |path, digest|
        digest << path.delete_prefix("#{root}/") << "\0" << File.binread(path) << "\0"
      end.hexdigest
    end
  end
end

# Propshaft memoizes its asset map at the first lookup of the test process, so a page
# rendered before the bundles exist poisons every later example regardless of who
# builds what afterwards. Building before the suite starts makes example order
# irrelevant; the per-group docs_assets! calls stay as documentation and are free.
RSpec.configure do |config|
  config.before(:suite) { FrameworkBuild.docs_assets! }
end
