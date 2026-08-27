# frozen_string_literal: true

require 'rails_helper'
require 'json'
require 'yaml'

# The public custom-property contract, checked against the bundle a release publishes
# rather than the readable build every other asset spec reads. Renaming is the one
# semantic transform in the release pipeline, and the release size work widens it,
# so this is where "nothing external reads that name"
# stops being an argument and becomes a check. A variable renamed out from under a
# theme, a plugin author, or plugins.js is invisible until something stops painting.
#
# `bin/rails framework:processed_bundle` writes the two files this reads. Without them
# the group skips, so a plain rspec run never pays for a 17 MB minification pass.
RSpec.describe 'the processed bundle contract' do
  builds = Rails.root.join('app/assets/builds')
  source_path = builds.join('plugins.css')
  bundle_path = builds.join('plugins.processed.css')
  rename_map_path = builds.join('plugins.processed.rename-map.json')

  # The published themes of the released version, which is the contract the release task
  # hands procss as --preserve-variables-from. Reading the frozen release rather than the
  # live build keeps the contract a published fact, and reading the version out of
  # framework_versions.yml keeps it the current one after the next cut.
  released_version = YAML.load_file(Framework::Engine.root.join('db/data/framework_versions.yml'))['latest']
  theme_paths = Framework::Engine.root.glob("public/css/#{released_version}/themes/*.css")

  # A custom property occurrence is `--name` whose preceding character cannot belong to
  # a name. That excludes the double dash inside a class (`.screen--dark-mode`) and
  # inside a layer name (`tn--utilities`), which a bare /--[\w-]+/ collects as tokens.
  custom_properties = lambda do |path|
    names = Set.new
    path.read.scan(/(?<![\w-])--[A-Za-z0-9_-]+/) { |name| names << name }
    names
  end

  # The Sass the bundle is built from, and the same freshness rule the Playwright
  # harness applies (assertProcessedBundleFresh in test/support/processed-bundle.js): an
  # artifact older than its source puts two different builds on the two sides of one
  # comparison and reports the difference as parity. One example reads plugins.css
  # directly, which is why this has to hold and not just look tidy.
  #
  # Keyed on the Sass rather than on plugins.css: every build path recompiles that file
  # whether or not anything changed, and a rebuild with no source edit produces the same
  # bytes the processed bundle was cut from.
  sources = -> { Framework::Engine.root.glob('app/assets/stylesheets/**/*').select(&:file?) }

  # Staleness reads as a missing artifact rather than a failure: a plain rspec run is
  # not meant to pay for the 90-second minification pass, which is the same reason the
  # group skips when the files are absent. The CI job regenerates them first, so it
  # never takes either branch.
  before do
    missing = [source_path, bundle_path, rename_map_path].reject(&:exist?)
    skip("Missing #{missing.join(', ')}. Run `bin/rails framework:processed_bundle`.") if missing.any?

    newest_source = sources.call.map(&:mtime).max
    next if newest_source.nil? || newest_source <= bundle_path.mtime

    skip("#{bundle_path} is older than the Sass source it was built from. " \
         'Run `bin/rails framework:processed_bundle`.')
  end

  let(:names) { custom_properties.call(bundle_path) }
  let(:rename_map) { JSON.parse(rename_map_path.read) }

  it 'keeps the documented token names a plugin author writes' do
    expect(names).to include('--gray-20', '--title-font-size')
  end

  it 'keeps every custom property the published themes name' do
    theme_names = theme_paths.flat_map { |path| custom_properties.call(path).to_a }.uniq

    aggregate_failures do
      # The chromatic border-token names are the part of this contract the renamer
      # comes closest to: they are --border-* names a theme reads by hand. Two
      # families of four: White and Red's label underline on red-75 and Black and
      # Yellow's on yellow-30. Red-60 was a third until the themed inverse fix
      # restated every inverse block in literal tokens and moved that underline
      # to red-15, which the published themes have carried since the next cut.
      expect(theme_names.grep(/\A--border-token-(red-75|yellow-30)-h-/).size).to eq(8)
      expect(theme_names.size).to be > 100
      expect(theme_names - names.to_a).to be_empty
    end
  end

  it 'keeps the three text-stroke names the runtime reads' do
    expect(names).to include(
      '--tn-text-stroke-color',
      '--tn-text-stroke-width',
      '--tn-text-stroke-radius'
    )
  end

  # plugins.js builds these names at runtime ('--framework-border-render-' + suffix), so
  # no static reference protects them. The set is read off the build instead of listed
  # here: a new suffix is covered the day the CSS emits it.
  it 'keeps the whole border render family plugins.js addresses by suffix' do
    family = /\A--framework-border-render-/
    emitted = custom_properties.call(source_path).grep(family)

    aggregate_failures do
      expect(emitted).not_to be_empty
      expect(names.grep(family)).to match_array(emitted)
    end
  end

  # border-token-slot and the line remap resolve these names for whatever token a
  # theme maps, shipped or not, so the release preserve files cannot enumerate them.
  # The private-pattern lookahead is what keeps them, and this is where losing it
  # would surface: an unlisted token's slot falling back to a flat line.
  it 'keeps every border token and line-ink name a theme can resolve' do
    aggregate_failures do
      %w[--border-token- --border-line-].each do |family|
        emitted = custom_properties.call(source_path).select { |name| name.start_with?(family) }

        expect(emitted).not_to be_empty
        expect(names.select { |name| name.start_with?(family) }).to match_array(emitted)
      end
    end
  end

  # The other half of the contract: whatever the rename map says moved is really gone.
  # A half-applied rename (declaration renamed, one reference left behind) resolves to
  # nothing at paint time and is silent everywhere else.
  it 'leaves no renamed name behind in the bundle' do
    expect(rename_map.keys.select { |name| names.include?("--#{name}") }).to be_empty
  end
end
