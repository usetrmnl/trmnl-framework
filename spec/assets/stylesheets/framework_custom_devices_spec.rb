# frozen_string_literal: true

require 'rails_helper'
require 'open3'
require 'tmpdir'

RSpec.describe 'Framework custom device configuration' do
  def compile(source)
    Dir.mktmpdir do |dir|
      entry = File.join(dir, 'custom_build.scss')
      output = File.join(dir, 'custom_build.css')
      File.write(entry, source)
      _stdout, stderr, status = Open3.capture3(
        'bundle', 'exec', 'sass', '--style=compressed', '--no-source-map',
        "--load-path=#{Framework::Engine.root.join('app/assets/stylesheets')}",
        entry, output
      )
      [status.success? ? File.read(output) : nil, stderr, status]
    end
  end

  it 'wires a configured device through every per-device generator' do
    css, stderr, status = compile(<<~SCSS)
      @use 'framework' with (
        $custom-devices: (
          'spec-panel': (
            'screen-w': 1024px,
            'screen-h': 758px,
            'pixel-ratio': 1.0,
            'dither-pixel-ratio': 2.0,
            'ui-scale': 1.0,
            'color-depth': 2,
            'density-tier': '1x',
            'gap-scale': 1.0,
            'size': 'lg'
          )
        )
      );
    SCSS

    expect(status).to be_success, stderr

    {
      'device variables' => /\.screen--spec-panel\{[^}]*--screen-w:\s*1024px/,
      'device name' => /\.screen--spec-panel\{[^}]*--device-name:\s*"spec-panel"/,
      'size extend group' => /\.screen--lg,[^{}]*\.screen--spec-panel[^{}]*\{/,
      'pixel-ratio combo' => /\.screen--spec-panel\.screen--1x\{/
    }.each do |label, pattern|
      expect(css.match?(pattern)).to be(true), "expected compiled CSS to contain the #{label} for spec-panel"
    end
  end

  it 'rejects a profile missing part of the device schema' do
    _css, stderr, status = compile(<<~SCSS)
      @use 'framework' with ($custom-devices: ('bad-panel': ('screen-w': 800px)));
    SCSS

    expect(status).not_to be_success
    expect(stderr).to include("Custom device 'bad-panel' is missing 'screen-h'")
  end
end
