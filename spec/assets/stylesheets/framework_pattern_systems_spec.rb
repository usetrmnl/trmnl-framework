# frozen_string_literal: true

require 'rails_helper'

# The pattern systems (border level art, border token lines, outline dots, and the
# device paint that rides them) each own one mechanism, and each had a place where
# the mechanism was only half applied:
#
#   * `border-step-paint` read the theme tier and the level tier of
#     `background-position` but skipped the step tier every sibling longhand uses.
#   * The 2-bit rail quantized border *levels* onto four tones and left border
#     *tokens* dashing pure black on white, so one rail disagreed with itself.
#   * `outline-dots` draws in two spaces on purpose: dot size and edge cadence
#     divide by the dither ratio (physical-pixel grid), while the corner arc and
#     the edge insets ride --ui-scale, the space of the ui-scaled(7px) rounded
#     clip on mashup views. Dividing the arc by the dither ratio shrank it
#     inside that clip on 2x devices and overflow: hidden erased the corners.
#   * Three progress device rules declared `background-image` twice, the first
#     value dead.
#
# These examples pin the whole mechanism in each case rather than the one call
# site, so a new step, tone, corner dot, or device override cannot reopen the gap.
RSpec.describe 'Framework pattern systems' do
  subject(:css) { Rails.root.join('app/assets/builds/plugins.css').read }

  before(:all) { FrameworkBuild.sass! }

  # The bundle is one compressed line. Take the declaration block whose selector
  # list starts at a rule boundary with the given text.
  def block_starting_with(prefix)
    match = css.match(/[{}]#{Regexp.escape(prefix)}[^{}]*\{([^{}]*)\}/)
    raise "no rule starting with #{prefix}" if match.nil?

    match[1]
  end

  # Repeated border gradients are registered once as --bline-N and referenced by
  # name, so a line value has to be followed into the registry to read its stops.
  def blines = @blines ||= css.scan(/(--bline-\d+):\s*([^;}]+)/).to_h

  def resolve(value) = value.gsub(/--bline-\d+/) { |name| blines.fetch(name, name) }

  def border_tokens(body)
    body.scan(/--border-token-([a-z0-9-]+)-([hv])-(image|size|color):\s*([^;}]+)/)
  end

  let(:grayscale_rail) { %w[black] + steps.map { |step| "gray-#{step}" } + %w[white] }
  let(:two_bit_tones) { %w[#000000 #555555 #AAAAAA #FFFFFF] }
  let(:steps) { (10..75).step(5).to_a }

  describe 'the border step position tier' do
    # Every longhand in border-step-paint reads theme step -> step art -> theme
    # level -> level art. The position longhand skipped the step tier, so a step
    # whose art has a different layer count than the level art underneath it read
    # the level's multi-layer position. The theme level tier is what carries a
    # theme that restated the level (theme-slots.utility-border-level) onto the
    # steps that collapse onto it.
    it 'chains every step position through theme, step and level' do
      missing = steps.flat_map do |step|
        level_of = { 10 => 1, 15 => 1, 20 => 2, 25 => 2, 30 => 3, 35 => 3, 40 => 4,
                     45 => 4, 50 => 5, 55 => 5, 60 => 6, 65 => 6, 70 => 7, 75 => 7 }
        %w[h v].filter_map do |dir|
          selector = dir == 'h' ? ".trmnl .border--h-#{step}::before" : ".trmnl .border--v-#{step}::after"
          chain = "background-position:var(--theme-border-#{step}-#{dir}-position, " \
                  "var(--border-step-#{step}-#{dir}-position, " \
                  "var(--theme-border-#{level_of[step]}-#{dir}-position, " \
                  "var(--border-#{level_of[step]}-#{dir}-position, 0 0))))"
          "#{step}-#{dir}" unless block_starting_with(selector).include?(chain)
        end
      end

      expect(missing).to be_empty,
                         "these step rails skip the --border-step-*-position tier: #{missing.inspect}"
    end

    # The solid modes give each step its own one-layer gradient, so they have to
    # say the position is one layer too.
    it 'publishes a one-layer step position wherever it publishes one-layer step art' do
      ['.trmnl .screen.screen--4bit,', '.trmnl .screen.screen--color-full,'].each do |prefix|
        body = block_starting_with(prefix)
        sized = body.scan(/--border-step-(\d+)-([hv])-size/).map { |step, dir| "#{step}-#{dir}" }
        positioned = body.scan(/--border-step-(\d+)-([hv])-position/).map { |step, dir| "#{step}-#{dir}" }

        expect(sized).not_to be_empty
        expect(positioned).to match_array(sized)
        expect(body).to include('--border-step-65-h-position: 0 0')
      end
    end
  end

  describe 'the 2-bit border token rail' do
    let(:light) { block_starting_with('.trmnl .screen.screen--2bit,') }
    let(:dark) do
      block_starting_with('.trmnl .screen.screen--dark-mode.screen--2bit:where(:not([class*=screen--theme-])),')
    end

    # Chromatic tokens in this rule are gray-fallback references (pinned by
    # framework_border_token_graying_spec.rb); the rail itself is what has to
    # carry real 2-bit lines here.
    it 'declares a token line for the whole grayscale rail in both polarities' do
      [light, dark].each do |body|
        declared = border_tokens(body).map { |token, dir, channel, _| [token, dir, channel] }

        expect(declared).to include(*grayscale_rail.product(%w[h v], %w[image size color]))
      end
    end

    # The whole point: the token rail speaks the same four tones the 2-bit level
    # art speaks, so a themed underline and a .divider agree about the hardware.
    it 'paints token lines and level art from the same four tones' do
      [light, dark].each do |body|
        token_hexes = border_tokens(body).select { |token, _, _, _| grayscale_rail.include?(token) }
                                         .flat_map { |_, _, _, value| resolve(value).scan(/#\h{6}/) }
        level_hexes = body.scan(/--border-\d-[hv]-(?:image|color):\s*([^;}]+)/)
                          .flatten.flat_map { |value| resolve(value).scan(/#\h{6}/) }

        expect(token_hexes).not_to be_empty
        expect(level_hexes).not_to be_empty
        expect(token_hexes.uniq.sort).to all(be_in(two_bit_tones))
        expect(level_hexes.uniq.sort).to all(be_in(two_bit_tones))
      end
    end

    it 'uses the mid-gray tones as accents instead of dashing black on white' do
      [light, dark].each do |body|
        hexes = border_tokens(body).select { |token, _, _, _| grayscale_rail.include?(token) }
                                   .flat_map { |_, _, _, value| resolve(value).scan(/#\h{6}/) }.uniq

        expect(hexes).to include('#555555', '#AAAAAA')
      end
    end
  end

  describe 'the outline dot cadence' do
    # The outline draws in two spaces. Dot size and edge cadence (--_dot,
    # --_gap3, --_gap4) divide by --_pr so every dot sits on the physical-pixel
    # grid. Curve coordinates and edge insets multiply by --_arc (--ui-scale),
    # the space of the ui-scaled(7px) rounded clip on mashup views and cells: a
    # curve divided by the dither ratio instead shrinks inside that clip on 2x
    # devices, and overflow: hidden erases every corner dot.
    def outline_backgrounds = css.scan(/background:[^;{}]*var\(--_gap4\)[^;{}]*/)

    it 'covers both call sites' do
      expect(outline_backgrounds.length).to eq(2)
    end

    it 'keeps dot size and cadence on the physical-pixel grid' do
      declarations = css.scan(/--_(?:dot|gap3|gap4):\s*([^;{}]+?)[;}]/).flatten.uniq

      expect(declarations.length).to eq(3)
      expect(declarations).to all(match(%r{px\s*/\s*var\(--_pr\)}))
    end

    it 'multiplies every curve coordinate and inset by the arc scale' do
      unscaled = outline_backgrounds.flat_map do |background|
        background.scan(/(?<![\w.])[\d.]+px(?!\s*\*\s*var\(--_arc\))/)
      end

      expect(unscaled).to be_empty,
                          "these outline lengths do not ride the arc scale: #{unscaled.uniq.inspect}"
    end
  end

  describe 'device paint overrides' do
    # A rule that says `background-image: none` and then declares the real image
    # two lines later reads as an unresolved merge; the first value never paints.
    it 'never declares background-image twice with a dead none' do
      dead = css.scan(/([^{}]+)\{([^{}]*)\}/).select do |_selector, body|
        values = body.scan(/(?:\A|;)background-image:\s*([^;]*)/).flatten
        values.length > 1 && values[0..-2].include?('none')
      end

      expect(dead.map(&:first)).to be_empty
    end
  end

  describe 'pattern art lookup surfaces' do
    # Path helpers and tile geometry tables exist to be read by a paint rule. One
    # with no reader is a mechanism a contributor can build on that never runs.
    it 'keeps every pattern-path helper and border tile table reachable' do
      root = Framework::Engine.root.join('app/assets/stylesheets')
      sheets = Dir.glob(root.join('**/*.scss')).index_with { |path| File.read(path, encoding: 'UTF-8') }

      surfaces = sheets.flat_map do |path, text|
        next [] unless path.include?('/framework/mixins/')

        text.each_line.filter_map do |line|
          if (match = line.match(/\A@function\s+([a-zA-Z0-9_-]*-pattern-path)\s*\(/))
            [path, "#{match[1]}("]
          elsif (match = line.match(/\A\$(border-[a-zA-Z0-9_-]*-tiles)\s*:/))
            [path, "$#{match[1]}"]
          end
        end
      end

      expect(surfaces).not_to be_empty
      unreachable = surfaces.reject do |declared_in, needle|
        sheets.any? do |path, text|
          count = text.scan(needle).length
          path == declared_in ? count > 1 : count.positive?
        end
      end

      expect(unreachable.map(&:last)).to be_empty,
                                         'these pattern surfaces have no call site left'
    end
  end
end
