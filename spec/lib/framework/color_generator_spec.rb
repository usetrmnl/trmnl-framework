# frozen_string_literal: true

require 'rails_helper'
require 'open3'

# lib/tasks/framework.rake states that its generator libs are Rails-optional and
# that a caller can invoke them directly to skip the boot. That contract only
# holds if the file requires every lib it names: inside the app, Zeitwerk resolves
# the rest and hides the gap, so it takes a bare Ruby process to see it.
#
# The second half pins the two invariants that let the generator drop its dead
# branches. Both used to be papered over by fallbacks that could never run, and
# both now fail the build if they break, so a spec is what turns that into a
# readable message.
RSpec.describe 'Framework color generator' do
  let(:rake_path) { Framework::Engine.root.join('lib/tasks/framework.rake') }
  let(:rake_source) { rake_path.read }

  # The release, version, font and docs-serving tasks are app classes the `:environment`
  # tasks reach through Zeitwerk; they are not part of the Rails-optional generator set.
  let(:rails_resident) { %w[ReleaseTask FontsReleaseTask Version Static DocsServingMode] }

  describe 'its declared requires' do
    it 'names every generator lib the task body uses' do
      requires = rake_source.scan(/^require_relative '([^']+)'/).flatten
      wanted = rake_source.scan(/Framework::([A-Z]\w+)/).flatten.uniq - rails_resident

      script = <<~RUBY
        #{requires.map { |path| "require #{Framework::Engine.root.join('lib/tasks', path).to_s.inspect}" }.join("\n")}
        missing = #{wanted.inspect}.reject { |name| Framework.const_defined?(name) }
        puts missing.join(',')
      RUBY

      stdout, stderr, status = Open3.capture3('ruby', '-e', script)

      expect(status).to be_success, "loading the rake requires standalone failed: #{stderr}"
      expect(stdout.strip).to eq(''),
                              "framework.rake names Framework::#{stdout.strip} without requiring it"
    end
  end

  describe 'the invariants behind the removed fallbacks' do
    # Built in memory, never read from server/tmp: the resolved JSON is a
    # generated artifact that a fresh checkout does not have, and
    # color_manifest_spec.rb already draws that line for the same reason.
    let(:manifest) { JSON.parse(Framework::ColorManifest.build.to_json) }

    # `bayer_gray_specs` built a threshold-Bayer gray rail for a limited palette
    # outside the 1-bit grayscale set. There is no such palette, so the branch
    # never ran; the loop now builds the 1-bit rail unconditionally.
    it 'puts every limited palette on the 1-bit gray rail' do
      ids = manifest.fetch('limited_palette_grayscale_1bit_ids')
      off_rail = manifest.fetch('limited_palettes').keys.reject { |key| ids.include?(key.delete_prefix('color-')) }

      expect(off_rail).to be_empty,
                          "these palettes need their own gray specs before they can ship: #{off_rail.inspect}"
    end

    # `_border-token-palette-vars` used to fall back to the bg vars for a token a
    # palette had no line for. Every palette carries all of them, so the mixin now
    # reads the map straight and a gap becomes a build error.
    it 'gives every limited palette a border line for every chromatic token' do
      generated = Framework::Engine.root.join('app/assets/stylesheets/framework/config/_tokens_colors_generated.scss').read
      tokens = generated[/\$color-palette-framework: \(\n(.*?)\n\);/m, 1].scan(/'([^']+)':/).flatten
      palettes = generated[/\$border-palette-lines: \(\n(.*?)\n\);\n\n\$dither-tile-assets/m, 1]
                 .split(/^  '/).drop(1).to_h do |chunk|
        [chunk[/\A([^']+)'/, 1], chunk.scan(/'([^']+)': \('/).flatten]
      end

      expected_keys = manifest.fetch('color_palette_limited_ids')
                              .flat_map { |id| ["color-#{id}", "color-#{id}-preview"] }
      expect(palettes.keys).to match_array(expected_keys)

      gaps = palettes.filter_map { |key, present| "#{key}: #{(tokens - present).inspect}" if (tokens - present).any? }
      expect(gaps).to be_empty
    end
  end
end
