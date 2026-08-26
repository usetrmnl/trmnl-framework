# frozen_string_literal: true

require 'rails_helper'
require 'cgi'
require 'open3'

# The item-fill ramps are ordered-dither art baked at generation time, which puts
# two things at risk that a compile cannot catch. A rail whose ramp reaches for a
# tone the device cannot render is a blurred fill on hardware nobody runs the
# suite on, so the tone ladder is asserted here rather than trusted. And a
# generator whose output moves between runs turns every unrelated release into a
# diff of three data URIs, so the bytes have to be a function of the constants
# alone.
RSpec.describe 'Framework item fill dither ramps' do
  subject(:generated) do
    Framework::Engine.root.join('app/assets/stylesheets/framework/config/_dither_ramps_generated.scss').read
  end

  let(:ramps) { Framework::DitherRamps }

  # The tones one rail's ramp actually paints: the background rect plus one path
  # per remaining tone, read back off the emitted SVG.
  def tones_in(uri) = CGI.unescape(uri).scan(/fill='(#[0-9A-F]{6})'/).flatten.uniq

  # Every renderable tone from the one the darkest column quantizes to up to
  # paper. The ramp starts at a mid-gray (MAX_INK_COVERAGE), so the tones below
  # that never appear and a rail uses fewer tones than it can render.
  def expected_tone_count(tone_count)
    tone_count - (ramps.paper_fraction(0) * (tone_count - 1)).floor
  end

  it 'publishes the committed art the generator computes now' do
    committed = generated.scan(/'(\w+)': "(data:[^"]+)"/).to_h

    expect(committed).to eq(ramps.rail_uris)
  end

  it 'publishes the committed gradient the generator computes now' do
    expect(generated).to include(%(: "#{ramps.full_ramp_value}";))
  end

  # Ruby seeds its hash function per process and the emission orders tones by a
  # tally, so "the same bytes twice" only means anything across two processes.
  it 'generates the same bytes in a fresh process' do
    script = <<~RUBY
      require #{Framework::Engine.root.join('lib/framework/dither_ramps').to_s.inspect}
      print Framework::DitherRamps.rail_uris.values.join
    RUBY

    stdout, = Open3.capture3('ruby', '-e', script)

    expect(stdout).to eq(ramps.rail_uris.values.join)
  end

  it 'spans every renderable tone from the darkest column up to paper' do
    counts = ramps::RAIL_TONE_COUNTS.transform_values { |tone_count| expected_tone_count(tone_count) }

    expect(ramps.rail_uris.transform_values { |uri| tones_in(uri).length }).to eq(counts)
  end

  it 'paints the 1-bit rail in ink and paper alone' do
    expect(tones_in(ramps.rail_uris.fetch('1bit'))).to match_array(%w[#000000 #FFFFFF])
  end

  it 'leaves the solid-capable rail undithered' do
    expect(ramps.full_ramp_value).to start_with('linear-gradient(')
  end

  # The art is emitted once on .screen and every mode block names the rail it
  # paints from, so a screen resolves --framework-item-fill-ramp to its own
  # device's ramp with no theme involvement.
  describe 'the compiled bundle' do
    subject(:css) { FrameworkBuild.plugins_css }

    # The lookahead ends the selector at its own boundary, so a rule shared by a
    # group of mode classes answers for each of them.
    def ramp_for(selector)
      css[/#{Regexp.escape(selector)}(?=[,{])[^{}]*\{[^}]*?--framework-item-fill-ramp: var\(([^)]+)\)/, 1]
    end

    it 'publishes every rail plus the natural size on the screen itself' do
      defined_rails = css.scan(/--framework-item-fill-ramp-(\w+): /).flatten.uniq

      expect(defined_rails).to match_array(ramps::RAIL_TONE_COUNTS.keys + %w[full size])
    end

    it 'points each mode at the deepest rail its device can render' do
      modes = {
        '.trmnl .screen' => '1bit', '.trmnl .screen.screen--2bit' => '2bit',
        '.trmnl .screen.screen--4bit' => '4bit', '.trmnl .screen.screen--color-full' => 'full'
      }

      expect(modes.keys.index_with { |selector| ramp_for(selector) })
        .to eq(modes.transform_values { |rail| "--framework-item-fill-ramp-#{rail}" })
    end

    # A limited palette paints its grays on the 1-bit rail whatever bit-depth
    # class it also wears, so its rule has to land after the deeper ones.
    it 'takes the 1-bit ramp back for every limited palette' do
      off_rail = Framework::ColorData.color_palette_limited_ids.reject do |id|
        ramp_for(".trmnl .screen.screen--color-#{id}") == '--framework-item-fill-ramp-1bit'
      end

      expect(off_rail).to be_empty
    end
  end
end
