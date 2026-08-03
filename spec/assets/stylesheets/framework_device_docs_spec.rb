# frozen_string_literal: true

require 'rails_helper'

# The device examples on the Screen page are the only place the docs state concrete device
# geometry and bit depth, and they were hand-written. This spec ties each documented profile
# to the manifest core exports (db/data/framework_devices.yml) and to the compiled bundle, so
# a fabricated size or the wrong screen--Nbit companion class fails here.
RSpec.describe 'Framework device documentation' do
  subject(:css) { FrameworkBuild.plugins_css }

  # <div class="screen screen--og screen--1bit">
  #   <!-- 800x480, 1-bit depth -->
  documented_profiles =
    Framework::Engine.root.join('app/views/framework/screen.html.erb').read
                     .scan(/screen--([a-z0-9_]+) screen--(\d+)bit">\s*\n\s*<!--\s*(\d+)x(\d+),\s*(\d+)-bit depth/)

  def manifest_spec(keyname)
    Framework::Devices.device_specs.find { |device| device.dig('css', 'keyname') == keyname }
  end

  def device_rule(css, keyname)
    css[/\.trmnl \.screen--#{Regexp.escape(keyname)}\{[^}]*\}/]
  end

  it 'documents at least the three device profiles the page enumerates' do
    expect(documented_profiles.size).to be >= 3
  end

  documented_profiles.each do |keyname, mode_bits, width, height, comment_bits|
    describe "the #{keyname} example" do
      let(:spec) { manifest_spec(keyname) }

      it 'names a device the manifest exports' do
        expect(spec).not_to be_nil
      end

      it "documents the exported geometry (#{width}x#{height})" do
        expect([spec.dig('css', 'screen_w'), spec.dig('css', 'screen_h')]).to eq([width.to_i, height.to_i])
      end

      it "documents the exported bit depth (#{comment_bits}-bit) and pairs the matching mode class" do
        exported = spec.dig('css', 'bit_depth') || spec['color_depth']
        expect([comment_bits.to_i, mode_bits.to_i]).to eq([exported, exported])
      end

      it 'matches the profile the compiled bundle emits' do
        rule = device_rule(css, keyname)
        expect(rule).to include(
          "--screen-w: #{width}px",
          "--screen-h: #{height}px",
          "--color-depth: #{comment_bits}"
        )
      end
    end
  end
end
