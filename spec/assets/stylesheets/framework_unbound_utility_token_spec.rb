# frozen_string_literal: true

require 'rails_helper'

# Gap and Spacing paint through a prefix matcher: one rule per gate selects the
# whole `gap--` / `m--` / `p--` namespace and reads the channel var the token
# bindings set. The matcher cannot tell a bound token from an unbound one, so it
# also lands on `gap--8`, `p--999`, `m--[10px]`, and `md:gap--[25px]`.
#
# With a bare `var(--tn-gap)` that declaration was invalid at computed-value
# time, which resolves to the property's initial value rather than dropping the
# declaration. tn--utilities is the last layer, so a typo actively erased the
# gap or padding a lower layer had set. `revert-layer` as the var fallback makes
# the unbound case inert instead: the layer steps aside and whatever declared
# the property underneath keeps it.
#
# These examples read the compiled bundle because the emitted declaration is the
# only record of which spelling shipped.
RSpec.describe 'Framework unbound utility tokens' do
  subject(:css) { FrameworkBuild.plugins_css }

  # Size and orientation: base, three sizes, two orientations, six pairs.
  # Spacing and Gap emit no bit-depth or dark gate.
  def gate_count = 12

  # Longest spelling first so `mt` never matches as `m` plus a stray `t`.
  def spacing_utilities = %w[mt mr mb ml mx my pt pr pb pl px py m p]

  def box_channels = ['gap', *spacing_utilities]

  # Every rule in the bundle, as [selectors, body]. The body is a lookahead so
  # the closing brace stays available to anchor the next rule; consuming it
  # would silently skip every second rule.
  def rules
    @rules ||= css.scan(/(?:[{}]|\A)([^{}]*)\{(?=([^{}]*)\})/)
  end

  # Rules that select a class-name prefix rather than a whole token: the
  # `[class^="…"]` / `[class*=" …"]` pair the utility emitter writes. The
  # zero-weight theme exemption also names a class attribute, but it matches
  # `[class*=screen--theme-]` with no leading space and is not a utility hook.
  def prefix_matched_rules
    @prefix_matched_rules ||= rules.select { |selectors, _body| selectors.match?(/\[class\^=|\[class\*=" /) }
  end

  # `property:var(--tn-<channel>…)` for the box-model channels only. The paint
  # families read their channels with an inert paint fallback (`transparent`,
  # `none`, `inherit`), which is already a no-op; a box-model property has no
  # inert value to fall back to, so it has to leave the layer instead.
  def box_reads(body)
    body.scan(/(?<![-\w])([a-z][a-z-]*):var\((--tn-(?:#{box_channels.join('|')}))(?![a-z-])([^)]*)\)/)
  end

  # Gap adds one hop before the rollback: a container publishes its own default
  # through --tn-gap-default, because the rollback is per layer and would take
  # `.flex`'s own `gap: var(--gap)` with it. Everything after that hop is still
  # the rollback.
  # The capture stops at the first `)`, so the nested form arrives unbalanced.
  def accepted_fallbacks = [', revert-layer', ', var(--tn-gap-default, revert-layer']

  describe 'every prefix-matched box-model declaration' do
    it 'falls back to revert-layer when the channel is unbound' do
      offenders = prefix_matched_rules.flat_map do |selectors, body|
        box_reads(body).filter_map do |property, channel, fallback|
          "#{selectors[0, 80]} => #{property}:var(#{channel}#{fallback})" unless accepted_fallbacks.include?(fallback)
        end
      end

      expect(offenders).to be_empty,
                           "these declarations still reset the property:\n  #{offenders.first(10).join("\n  ")}"
    end

    # A bare `var(--tn-*)` under a prefix matcher is the defect itself, whatever
    # the channel. Enumerated token classes bind and read in the same rule, so
    # the shape is only wrong here.
    it 'leaves no channel read without a fallback' do
      offenders = prefix_matched_rules.select { |_selectors, body| body.match?(/var\(--tn-[a-z-]+\)/) }

      expect(offenders).to be_empty,
                           "these rules read a channel with no fallback: #{offenders.first(5).map { |s, _b| s[0, 80] }.inspect}"
    end
  end

  describe 'the emitted matrix' do
    it 'guards the gap family at every gate it emits' do
      bodies = prefix_matched_rules.filter_map { |_selectors, body| body if body.include?('--tn-gap') }

      expect(bodies.length).to eq(gate_count)
      expect(bodies.uniq).to eq(['gap:var(--tn-gap, var(--tn-gap-default, revert-layer))'])
    end

    it 'guards each spacing family at every gate it emits' do
      counts = spacing_utilities.index_with do |utility|
        prefix_matched_rules.count { |_selectors, body| body.include?("var(--tn-#{utility}, revert-layer)") }
      end

      expect(counts.values.uniq).to eq([gate_count]), "uneven gate coverage: #{counts.reject { |_u, n| n == gate_count }.inspect}"
    end

    it 'writes both halves of the two-axis shorthands' do
      { 'mx' => %w[margin-left margin-right], 'my' => %w[margin-top margin-bottom],
        'px' => %w[padding-left padding-right], 'py' => %w[padding-top padding-bottom] }
        .each do |utility, properties|
        body = prefix_matched_rules.find { |_selectors, found| found.include?("var(--tn-#{utility},") }.last

        expect(body).to eq(properties.map { |property| "#{property}:var(--tn-#{utility}, revert-layer)" }.join(';'))
      end
    end
  end

  describe 'tokens that are bound' do
    # The fallback must not disturb a token that resolves. These are the
    # bindings the apply rules read, so a bound class still wins its layer.
    it 'still binds the gap scale and the base-only arbitrary loop' do
      expect(css).to include('.trmnl .gap--large{--tn-gap:var(--gap-large)}')
      expect(css).to include('.trmnl .gap--none{--tn-gap:0px}')
      expect(css).to match(/\.trmnl \.gap--\\\[20px\\\]\{--tn-gap:[^}]*20px[^}]*\}/)
    end

    it 'still binds the spacing scale, including the decimal steps' do
      expect(css).to match(/\.trmnl \.p--4[,{][^{]*\{--tn-p:[^}]*16px[^}]*\}/)
      expect(css).to match(/\.trmnl \.m--2\\\.5[,{][^{]*\{--tn-m:[^}]*10px[^}]*\}/)
    end
  end

  describe 'families that bind per token instead' do
    # Size, Text and Background carry their declarations on the enumerated token
    # classes, so they have no prefix-matched declaration to guard and must not
    # grow one back.
    it 'keeps size, text and background paint off the prefix matchers' do
      leaked = prefix_matched_rules.select { |_selectors, body| body.match?(/--tn-size-|--tn-(?:text|bg)-[a-z]+:/) }

      expect(leaked).to be_empty,
                        "these families regressed to a prefix matcher: #{leaked.first(3).map { |s, _b| s[0, 80] }.inspect}"
    end
  end
end
