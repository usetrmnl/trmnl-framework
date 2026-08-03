# frozen_string_literal: true

require 'rails_helper'
require 'trmnl/framework/package'

# The gemspec has two ways to build the file list: `git ls-files` in the repo, and a glob
# over the packaged subtrees when there is no .git (a source tarball). They used to
# disagree. The glob skipped dotfiles, so it dropped app/assets/builds/.keep, the one
# dotfile the filter deliberately keeps, and it had no exclusion for build output, so a
# local vendor/bundle or a generated public/assets would have shipped inside the gem.
RSpec.describe Framework::Package do
  let(:tracked) { described_class.tracked_files.sort }
  let(:globbed) { described_class.globbed_files.sort }

  it 'packages the same files from git and from a source tarball' do
    aggregate_failures do
      expect(globbed - tracked).to be_empty
      expect(tracked - globbed).to be_empty
    end
  end

  it 'keeps the builds directory placeholder in both' do
    aggregate_failures do
      expect(tracked).to include('app/assets/builds/.keep')
      expect(globbed).to include('app/assets/builds/.keep')
    end
  end

  it 'rejects generated build output that only a dirty tree would show' do
    generated = [
      'public/assets/application-abc123.css',
      'public/framework/docs/3.2/screen.md',
      'public/llms.txt',
      'vendor/bundle/ruby/4.0.0/gems/rake-13.0.0/lib/rake.rb'
    ]

    aggregate_failures do
      generated.each { |path| expect(described_class).not_to be_packaged(path) }
    end
  end

  # The glob branch matches dotfiles so it keeps app/assets/builds/.keep, which also lets it
  # see the junk macOS and Windows drop into any directory a Finder or Explorer window opens.
  # git ignores those, so without this filter a tarball build would pack files a repo build
  # never sees.
  it 'rejects OS droppings the glob branch would otherwise sweep in' do
    junk = [
      'public/.DS_Store',
      'public/fonts/bundles/trmnl/.DS_Store',
      'app/assets/builds/Thumbs.db',
      'public/images/desktop.ini',
      'public/images/._logo.png'
    ]

    aggregate_failures do
      junk.each { |path| expect(described_class).not_to be_packaged(path) }
      expect(described_class).to be_packaged('app/assets/builds/.keep')
    end
  end

  it 'rejects the repo-only trees' do
    aggregate_failures do
      %w[spec/spec_helper.rb docs/ENGINE_INTEGRATION.md prelaunch-briefs/README.md bin/setup
         Rakefile config.ru].each do |path|
        expect(described_class).not_to be_packaged(path)
      end
    end
  end

  # The Tailwind input the gem ships resolves `@config "../../../config/tailwind.config.js"`
  # against the gem root, so the config has to be inside the package.
  it 'packages the Tailwind config the docs chrome input points at' do
    aggregate_failures do
      expect(tracked).to include('config/tailwind.config.js')
      expect(Framework::Engine.root.join('config/tailwind.config.js')).to exist
    end
  end

  it 'ships no developer scratch pages' do
    expect(tracked.grep(%r{\Apublic/spike/})).to be_empty
  end

  # lib/procss and lib/projs are the Node build tooling the engine tells Zeitwerk to
  # ignore. Their `node --test` files matched the lib/ accept prefix, and the npm manifest
  # and its 49 KB lockfile were on the root accept list, so a published gem carried the
  # test suite and the devDependency pins of tooling it never runs.
  it 'ships no Node test files' do
    aggregate_failures do
      expect(tracked.grep(/\.test\.cjs\z/)).to be_empty
      expect(globbed.grep(/\.test\.cjs\z/)).to be_empty
    end
  end

  it 'ships no npm manifest' do
    aggregate_failures do
      %w[package.json package-lock.json].each do |manifest|
        expect(described_class).not_to be_packaged(manifest)
        expect(Framework::Engine.root.join(manifest)).to exist
      end
    end
  end

  # The minifiers themselves stay: `rake framework:release:*` shells out to them, and the
  # release pipeline reads the same lib/ the gem carries.
  it 'keeps the minifier sources the release pipeline runs' do
    expect(tracked).to include('lib/procss/procss.cjs', 'lib/projs/projs.cjs')
  end
end
