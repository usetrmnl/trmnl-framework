# frozen_string_literal: true

require 'rails_helper'

# Text paint used to ride a `[class^="text--"]` prefix matcher, which also caught
# the alignment and font-size utilities in the same namespace. Those bind no
# --tn-text-* vars, so the matcher repainted them with its inert fallbacks from
# tn--utilities, the last cascade layer, and erased whatever an element or
# component had painted underneath. Paint now rides the enumerated color token
# classes instead. These examples read the compiled bundle because the emitted
# selector list is the only honest record of which elements the paint reaches.
RSpec.describe 'Framework text paint scope' do
  subject(:css) { FrameworkBuild.plugins_css }

  # The first declaration apply-text-paint-vars emits, as the compressed
  # compiler writes it. A rule carrying this is a text paint rule.
  def paint_head = 'color:var(--tn-text-color, inherit)'

  def alignment_utilities = %w[center left right justify]

  def size_utilities = %w[small base large xlarge xxlarge xxxlarge mega giga tera peta]

  # The canonical weight utilities, the third non-paint family in the namespace.
  # They set font-weight and the wght axis and bind no --tn-text-* var, so a
  # prefix matcher would repaint `text--black text--bold` the same way it once
  # repainted `text--black text--center`.
  def weight_utilities = %w[regular bold]

  # Painted by their own rules in _text.scss, on the narrower size/orientation/
  # dark gate set, not by the factorized token loop.
  def semantic_roles = %w[default muted inverse]

  # A gate that leads with a bit depth starts the class with a digit, so the
  # emitter writes it as `\32 bit\:`. Every other position keeps the plain form.
  def gate_token = /(?:dark|sm|md|lg|portrait|landscape|[124]bit|\\3[124]\ bit)/

  def normalize_gate(gate) = gate.delete('\\').sub(/\A3([124]) bit/, '\1bit')

  # Selector list of every rule whose body carries the text paint block. Gates
  # collapse their screen scopes into :is(), whose commas rule out splitting on
  # commas, so each rule stays one string. The body is a lookahead so the rule's
  # closing brace stays available as the next rule's anchor.
  def paint_rules
    @paint_rules ||= css.scan(
      /(?:[{}]|\A)([^{}]*)\{(?=[^{}]*#{Regexp.escape(paint_head)}[^{}]*\})/
    ).flatten
  end

  # Rules that paint text on their own. The composed bg+text rule is excluded:
  # it needs a bg--* class alongside the text--* one and is a separate contract.
  def standalone_paint_rules = paint_rules.reject { |selectors| selectors.include?('bg--') }

  # (gate, token) pairs the standalone paint rules select, e.g. ['', 'black']
  # and ['sm:portrait:', 'black'].
  def painted_variants
    @painted_variants ||= standalone_paint_rules.flat_map do |selectors|
      selectors.scan(/\.((?:#{gate_token}\\:)*)text--([a-z0-9-]+)/)
               .map { |gate, token| [normalize_gate(gate), token] }
    end.to_set
  end

  def painted_tokens = painted_variants.to_set(&:last)

  def gates_for(token) = painted_variants.select { |_gate, name| name == token }.to_set(&:first)

  # Every text-- class the bundle publishes, whatever emitted it.
  def text_family = css.scan(/\.text--([a-z0-9-]+)(?![a-z0-9-])/).flatten.uniq.sort

  def color_tokens = text_family - alignment_utilities - size_utilities - weight_utilities - semantic_roles

  describe 'utilities that carry no paint' do
    # Two ways a rule could reach `class="label label--filled text--center"`:
    # by naming .text--center, or by matching the text-- namespace as a string.
    # Both are closed, so no paint rule selects it and the label keeps its fill.
    it 'never names an alignment utility in a paint selector' do
      expect(painted_tokens.to_a & alignment_utilities).to be_empty
    end

    it 'never names a font-size utility in a paint selector' do
      expect(painted_tokens.to_a & size_utilities).to be_empty
    end

    it 'never names a weight utility in a paint selector' do
      expect(painted_tokens.to_a & weight_utilities).to be_empty
    end

    it 'never matches the text-- namespace by prefix in a standalone paint rule' do
      offenders = standalone_paint_rules.grep(/\[class[\^*]=["' ]*(?:#{gate_token}:)*text--/)

      expect(offenders).to be_empty,
                           "paint rides a prefix matcher again: #{offenders.first.to_s[0, 200]}"
    end
  end

  describe 'color tokens that must keep painting' do
    it 'paints a color token at every gate the token matrix emits' do
      reference = gates_for('black')

      # Base, size, orientation, size+orientation, the bit-depth combinations,
      # and the dark-first mirror of all of them.
      expect(reference).to include('', 'sm:', 'lg:', 'portrait:', 'md:landscape:', '2bit:',
                                   'sm:4bit:', 'landscape:1bit:', 'lg:portrait:4bit:',
                                   'dark:', 'dark:md:', 'dark:portrait:', 'dark:2bit:',
                                   'dark:lg:portrait:4bit:')
      expect(reference.size).to be > 60
    end

    it 'gives every color token the identical gate set' do
      reference = gates_for('black')
      tokens = color_tokens

      expect(tokens.size).to be > 150
      uneven = tokens.reject { |token| gates_for(token) == reference }

      expect(uneven).to be_empty,
                        "color tokens missing paint gates: #{uneven.first(10).inspect}"
    end

    it 'covers the shade, hue, and semantic ends of the palette' do
      %w[black white gray-1 gray-7 gray-10 gray-75 red red-40 yellow-75 primary error success warning]
        .each { |token| expect(painted_tokens).to include(token) }
    end

    it 'still paints the semantic text roles' do
      semantic_roles.each do |role|
        expect(gates_for(role)).to include(''), "text--#{role} lost its paint"
      end
    end

    it 'accounts for every class in the text-- family' do
      # A new text-- class must either be painted or be a declared non-paint
      # utility. Anything else means the token list and the emitters disagree.
      unaccounted = text_family - painted_tokens.to_a - alignment_utilities - size_utilities - weight_utilities

      expect(unaccounted).to be_empty,
                             "text-- classes that are neither painted nor a known utility: #{unaccounted.inspect}"
    end
  end

  describe 'cascade weight' do
    # PR 80's lesson: a guard that inflates its own specificity breaks the
    # relationships around it. A token class weighs one class, exactly what the
    # prefix matcher weighed, so the composed rule keeps its two-unit lead.
    it 'keeps the composed bg+text rule on both prefix matchers' do
      composed = paint_rules.select { |selectors| selectors.include?('bg--') }

      expect(composed.length).to eq(1)
      expect(composed.first).to include(
        ':is([class^=bg--],[class*=" bg--"]):is([class^=text--],[class*=" text--"])'
      )
    end

    it 'emits the composed rule after every color token paint rule' do
      composed = paint_rules.find { |selectors| selectors.include?('bg--') }
      token_rules = standalone_paint_rules.reject do |selectors|
        semantic_roles.any? { |role| selectors.include?("text--#{role}") }
      end

      expect(css.index(composed)).to be > token_rules.map { |selectors| css.index(selectors) }.max
    end

    it 'emits the semantic text roles after the token paint rules' do
      # The roles set the same --tn-text-* vars at the same weight, so source
      # order is what makes text--default win over a color token beside it.
      role_rules = standalone_paint_rules.select { |selectors| selectors.include?('text--default') }
      token_rules = standalone_paint_rules.reject do |selectors|
        semantic_roles.any? { |role| selectors.include?("text--#{role}") }
      end

      expect(role_rules).not_to be_empty
      expect(role_rules.map { |selectors| css.index(selectors) }.min)
        .to be > token_rules.map { |selectors| css.index(selectors) }.max
    end

    it 'adds no exclusion guard to the paint selectors' do
      # An exclusion list would read the whole class attribute, so excluding
      # text--center would also strip the paint from `text--black text--center`.
      # The only :not() forms allowed are the landscape screen gate and the
      # zero-weight theme exemption on the dark gates.
      allowed = [':not(.screen--portrait)', ':not([class*=screen--theme-])']
      guards = standalone_paint_rules.flat_map { |selectors| selectors.scan(/:not\([^)]*\)/) }.uniq

      expect(guards - allowed).to be_empty
    end
  end
end
