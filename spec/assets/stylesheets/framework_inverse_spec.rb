# frozen_string_literal: true

require 'rails_helper'
require 'open3'
require 'tmpdir'

RSpec.describe 'Framework inverse palette' do
  def compile(source)
    Dir.mktmpdir do |dir|
      entry = File.join(dir, 'inverse_spec.scss')
      output = File.join(dir, 'inverse_spec.css')
      File.write(entry, source)
      _stdout, stderr, status = Open3.capture3(
        'bundle', 'exec', 'sass', '--style=compressed', '--no-source-map',
        "--load-path=#{Framework::Engine.root.join('app/assets/stylesheets')}",
        entry, output
      )
      [status.success? ? File.read(output) : nil, stderr, status]
    end
  end

  it 'derives every grayscale counterpoint from reversible ordered ramps' do
    css, stderr, status = compile(<<~'SCSS')
      @use 'sass:map';
      @use 'framework/config/tokens' as tokens;

      .inverse-map {
        @each $token in tokens.$grayscale-ramp {
          $inverse: map.get(tokens.$dark-mode-grayscale-remap, $token);
          --inverse-#{$token}: #{$inverse};
          --round-trip-#{$token}: #{map.get(tokens.$dark-mode-grayscale-remap, $inverse)};
        }
      }
    SCSS

    expect(status).to be_success, stderr
    expect(css).to match(/--inverse-black:\s*white/)
    expect(css).to match(/--inverse-gray-25:\s*gray-60/)
    expect(css).to match(/--inverse-gray-50:\s*gray-35/)
    expect(css).to match(/--inverse-gray-75:\s*gray-10/)
    expect(css).to match(/--inverse-white:\s*black/)

    %w[black gray-10 gray-25 gray-40 gray-45 gray-50 gray-75 white].each do |token|
      expect(css).to match(/--round-trip-#{token}:\s*#{token}/)
    end
  end

  it 'emits theme-gated light restores for every dark-screen inverse paint branch' do
    css, stderr, status = compile(<<~SCSS)
      @use 'framework/index';
    SCSS

    expect(status).to be_success, stderr

    gate = ':where(:not([class*=screen--theme-]))'
    generic = ".trmnl .screen.screen--dark-mode#{gate} .inverse"
    expect(css.scan(generic).length).to be >= 2

    %w[1bit 2bit 4bit 8bit 16bit color-full].each do |mode|
      expect(css).to include(
        ".trmnl .screen.screen--dark-mode.screen--#{mode}#{gate} .inverse"
      )
    end

    expect(css).to include(
      ".trmnl .screen.screen--dark-mode.screen--color-4bwry#{gate} .inverse"
    )
    expect(css).to include(
      ".trmnl .screen.screen--dark-mode.screen--preview-colors.screen--color-4bwry#{gate} .inverse"
    )
    expect(css).to include(
      ".trmnl .screen.screen--dark-mode.screen--preview-colors.screen--preview-white-limited.screen--1bit#{gate} .inverse"
    )
    expect(css).to include(
      ".trmnl .screen.screen--dark-mode.screen--preview-colors.screen--preview-white-limited.screen--2bit#{gate} .inverse"
    )
  end

  # A theme states its own inverse scheme in literal tokens, so the paint rail
  # under a themed inverse subtree must stay the screen's own. Ungated arms
  # re-inverted the theme's already-inverted tokens, and on the gray fallback
  # rails that flipped a hue ink onto its canvas (black-and-yellow's yellow ink
  # landed dark on its black inverse ground).
  it 'theme-gates every light-screen inverse paint arm' do
    css, stderr, status = compile(<<~SCSS)
      @use 'framework/index';
    SCSS

    expect(status).to be_success, stderr

    gate = ':where(:not([class*=screen--theme-]))'

    %w[1bit 2bit 4bit 8bit 16bit color-full color-4bwry].each do |mode|
      expect(css).to include(".trmnl .screen.screen--#{mode}#{gate} .inverse")
      expect(css).not_to include(".trmnl .screen.screen--#{mode} .inverse")
    end

    # The default (no bit-depth) dark remap and the semantic/slot rebind.
    expect(css).to include(".trmnl .screen#{gate} .inverse")
    expect(css).not_to include(".trmnl .screen .inverse{--bg-")

    # The ungated arm keeps only the canvas paint and the re-aliased
    # indirection vars, which follow whatever scheme the subtree binds.
    ungated = css[/\.trmnl \.screen \.inverse\{([^}]*)\}/m, 1]
    expect(ungated).to include('background-color:')
    expect(ungated).not_to include('--bg-')
    expect(ungated).not_to include('--framework-slot-item-meta-bg-color')
  end

  # Dark mode and .inverse remap the --bg-* rails, which the slot chain reads. A
  # palette that paints a component directly keeps its light-mode art inside an
  # inverted screen, which is how palette 7a's progress bar (findings H25, H26)
  # painted PNG tiles that never inverted.
  it 'leaves no palette-specific paint outside the inverting slot rails' do
    css, stderr, status = compile(<<~SCSS)
      @use 'framework/index';
    SCSS

    expect(status).to be_success, stderr

    # `transparent` and `none` hold no art, so they cannot keep a light-mode
    # value inside an inverted screen. The mashup chrome clears the cell that way
    # before its ::before paints the surface through a slot (_screen-device.scss).
    # The compressed output writes transparent as rgba(0,0,0,0).
    inert = /transparent|none|rgba\(0,\s*0,\s*0,\s*0\)/
    palette_paint = css.scan(/[{}]([^{}]*screen--color-[a-z0-9]+[^{}]*)\{([^{}]*)\}/)
    direct = palette_paint.select do |_selector, body|
      body.match?(/(?:\A|;)background-(?:image|color):(?!var\(--(?:bg|text|framework-slot|framework-semantic)|#{inert})/)
    end

    expect(direct.map(&:first)).to be_empty
    expect(css).not_to include('/images/')
  end
end
