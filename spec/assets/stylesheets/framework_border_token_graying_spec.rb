# frozen_string_literal: true

require 'rails_helper'
require 'open3'
require 'tmpdir'

# Grayscale screens must resolve every chromatic border token through its gray
# fallback, the same rule bg, text and strokes already follow. 1-bit always did;
# 2-bit and 4/8/16-bit did not, so a theme binding label-underline to red-75 or
# yellow-30 painted a literal hue onto hardware that cannot render it.
module BorderTokenGraying
  # One rule per mode block, keyed by the first selector in its list.
  MODES = {
    '1-bit' => '.trmnl .screen.screen--1bit,',
    '1-bit dark' => '.trmnl .screen.screen--dark-mode.screen--1bit:where(:not([class*=screen--theme-])),',
    '2-bit' => '.trmnl .screen.screen--2bit,',
    '2-bit dark' => '.trmnl .screen.screen--dark-mode.screen--2bit:where(:not([class*=screen--theme-])),',
    '4/8/16-bit' => '.trmnl .screen.screen--4bit,',
    '4/8/16-bit dark' => '.trmnl .screen.screen--dark-mode.screen--4bit:where(:not([class*=screen--theme-])),'
  }.freeze

  CHANNELS = %w[image color size].freeze
  DECLARATION = /--border-token-([a-z0-9-]+)-([hv])-(image|color|size):\s*([^;}]+)/
  GRAY_REF = /\Avar\((--border-token-[a-z0-9-]+-[hv]-(?:image|color|size))[,)]/
  HEX = /#\h{6}/

  module_function

  def css
    @css ||= Dir.mktmpdir do |dir|
      entry = File.join(dir, 'screen_mode_vars.scss')
      output = File.join(dir, 'screen_mode_vars.css')
      File.write(entry, "@use 'framework/base/screen-mode-vars';\n")
      _stdout, stderr, status = Open3.capture3(
        'bundle', 'exec', 'sass', '--style=compressed', '--no-source-map',
        "--load-path=#{Framework::Engine.root.join('app/assets/stylesheets')}",
        entry, output
      )
      raise "sass failed: #{stderr}" unless status.success?

      File.read(output)
    end
  end

  # [selector, body] for every declaration block, at-rule wrappers unwrapped.
  def blocks
    @blocks ||= begin
      found = []
      selector_start = 0
      index = 0
      while (index = css.index(/[{}]/, index))
        if css[index] == '}'
          index += 1
        else
          selector = css[selector_start...index].strip
          if selector.start_with?('@') && !selector.start_with?('@font-face', '@property')
            index += 1
          else
            close = css.index('}', index)
            found << [selector, css[(index + 1)...close]]
            index = close + 1
          end
        end
        selector_start = index
      end
      found
    end
  end

  # Repeated gradients are registered once as --bline-N and referenced by name.
  def blines
    @blines ||= css.scan(/(--bline-\d+):\s*([^;}]+)/).to_h
  end

  # Custom properties merge across the equal-specificity `.screen` rules.
  def base
    @base ||= blocks.filter_map { |selector, body| body if selector == '.trmnl .screen' }
                    .flat_map { |body| border_tokens(body).to_a }
                    .to_h
  end

  def border_tokens(body)
    body.scan(DECLARATION)
        .to_h { |token, dir, channel, value| ["--border-token-#{token}-#{dir}-#{channel}", value.strip] }
  end

  def mode_rule(needle)
    match = blocks.find { |selector, _| selector.start_with?(needle) }
    raise "no rule starting with #{needle}" if match.nil?

    border_tokens(match.last)
  end

  def chromatic_tokens
    @chromatic_tokens ||= base.keys
                              .filter_map { |name| name[/\A--border-token-(.+)-h-image\z/, 1] }
                              .reject { |token| token.start_with?('gray-') || %w[black white].include?(token) }
  end

  # Follow a value down to literal color stops: gray fallback reference, then
  # the base declaration, then the --bline-N gradient registry.
  def resolve(value)
    reference = value[GRAY_REF, 1]
    value = base.fetch(reference) if reference
    value.gsub(/--bline-\d+/) { |name| blines.fetch(name, name) }
  end

  def gray_hex?(hex)
    hex[1, 2].casecmp?(hex[3, 2]) && hex[3, 2].casecmp?(hex[5, 2])
  end
end

RSpec.describe 'Framework border token graying' do
  let(:probe) { BorderTokenGraying }

  it 'declares chromatic border token lines on the default screen rule' do
    expect(probe.chromatic_tokens).to include('red-75', 'red-60', 'yellow-30')
    expect(probe.resolve(probe.base.fetch('--border-token-red-75-h-image'))).to match(BorderTokenGraying::HEX)
  end

  BorderTokenGraying::MODES.each do |label, needle|
    it "remaps every chromatic border token to its gray fallback on #{label} screens" do
      rule = probe.mode_rule(needle)

      missing = probe.chromatic_tokens.flat_map do |token|
        %w[h v].flat_map do |dir|
          BorderTokenGraying::CHANNELS.filter_map do |channel|
            name = "--border-token-#{token}-#{dir}-#{channel}"
            name unless rule[name]&.match?(BorderTokenGraying::GRAY_REF)
          end
        end
      end

      expect(missing).to be_empty,
                         "#{label} leaves #{missing.length} chromatic border token channels unmapped, " \
                         "starting with #{missing.first(3).join(', ')}"
    end

    it "resolves themed border tokens to grayscale values on #{label} screens" do
      rule = probe.mode_rule(needle)

      leaks = probe.chromatic_tokens.flat_map do |token|
        %w[h v].flat_map do |dir|
          %w[image color].flat_map do |channel|
            painted = probe.resolve(rule.fetch("--border-token-#{token}-#{dir}-#{channel}"))
            painted.scan(BorderTokenGraying::HEX)
                   .reject { |hex| probe.gray_hex?(hex) }
                   .map { |hex| "#{token}-#{dir}-#{channel}: #{hex}" }
          end
        end
      end

      expect(leaks).to be_empty,
                       "#{label} paints #{leaks.length} chromatic values, " \
                       "starting with #{leaks.first(3).join(', ')}"
    end
  end
end
