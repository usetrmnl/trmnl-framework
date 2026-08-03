# frozen_string_literal: true

require 'rails_helper'

# The weight utilities ship under two spellings. `text--regular` and `text--bold`
# are canonical; `font--regular` and `font--bold` are deprecated aliases that
# leave at 4.0.
#
# Two names for one rule are only honest while both resolve the same way at every
# gate, and the emitters make that easy to get wrong: each one reads a single
# class name out of the selector it is handed, so a grouped `.text--bold,
# .font--bold` would publish all 48 gates under `text--bold` and leave the alias
# with its base rule alone. `md:font--bold` would then quietly do nothing, which
# is the same defect that once left `label--inverted` variantless.
#
# The compiled bundle is the only place that difference is visible, so these
# examples read it rather than the Sass.
RSpec.describe 'Framework font weight utilities' do
  subject(:css) { FrameworkBuild.plugins_css }

  before(:all) do
    @rules = FrameworkBuild.plugins_css.scan(/(?:\A|(?<=\}))([^{}]*)\{(?=([^{}]*)\})/)
  end

  # canonical spelling => the deprecated alias that has to match it.
  def synonyms = { 'text--regular' => 'font--regular', 'text--bold' => 'font--bold' }

  def sizes = %w[sm md lg]
  def orientations = %w[portrait landscape]
  def bit_depths = %w[1bit 2bit 4bit]

  # Every gate `with-all-variants` publishes: the bare class, each axis on its
  # own, and every pair and triple. Spelled out rather than derived, so a gate
  # the emitters stop writing fails here instead of asserting less.
  def gate_prefixes
    plain = ['', *sizes.map { |s| "#{s}:" }, *orientations.map { |o| "#{o}:" },
             *sizes.product(orientations).map { |s, o| "#{s}:#{o}:" }]
    plain + plain.flat_map { |gate| bit_depths.map { |depth| "#{gate}#{depth}:" } }
  end

  # Same gate vocabulary the responsive suite reads with: a gate that leads with
  # a bit depth starts the class with a digit, which the emitter writes as
  # `\32 bit\:`, so the escaped spelling is part of the token.
  def gate_token = /(?:dark|sm|md|lg|portrait|landscape|[124]bit|\\3[124]\ bit)/

  def normalize_gate(gate) = gate.delete('\\').sub(/\A3([124]) bit/, '\1bit')

  # A variant class as the bundle spells it: colons escaped, a leading digit
  # written as its `\3N ` escape.
  def selector_text(variant_class)
    variant_class.gsub(':') { '\\:' }.sub(/\A(\d)/) { "\\3#{Regexp.last_match(1)} " }
  end

  def class_matcher(variant_class)
    /\.#{Regexp.escape(selector_text(variant_class))}(?![\w-])/
  end

  # The rules that style one exact variant class, e.g. `md:portrait:4bit:text--bold`.
  def rules_for(variant_class)
    matcher = class_matcher(variant_class)
    @rules.select { |selectors, _declarations| selectors.match?(matcher) }
  end

  # Every rule that styles the class under any gate. The class name is not
  # anchored on a `.` here, because in `.md\:text--bold` the gate owns the dot.
  def every_rule_for(class_name)
    matcher = /(?<![\w-])#{Regexp.escape(class_name)}(?![\w-])/
    @rules.select { |selectors, _declarations| selectors.match?(matcher) }
  end

  # Every gate prefix the bundle actually publishes this class under, read back
  # from the selectors. The enumerated list above says what must be there; this
  # says what is there, so an extra gate on one spelling shows up too.
  def emitted_gates(class_name)
    css.scan(/\.((?:#{gate_token}\\:)*)#{Regexp.escape(class_name)}(?![\w-])/)
       .flatten.map { |prefix| normalize_gate(prefix) }.uniq.sort
  end

  describe 'the canonical spellings' do
    it 'publishes text--regular and text--bold at all 48 gates' do
      missing = synonyms.keys.flat_map do |canonical|
        gate_prefixes.reject { |gate| rules_for("#{gate}#{canonical}").any? }
                     .map { |gate| "#{gate}#{canonical}" }
      end

      expect(missing).to be_empty, "canonical weight classes with no rule: #{missing.first(12).inspect}"
    end

    it 'sets the weight and the variable-font axis together' do
      # A variable font honors font-variation-settings over font-weight, so a
      # rule that moves one and not the other renders at the wrong weight on
      # exactly the 4-bit screens the utility exists for.
      { 'text--regular' => '400', 'text--bold' => '700' }.each do |canonical, weight|
        declarations = every_rule_for(canonical).map(&:last)

        expect(declarations.size).to eq(48)
        expect(declarations).to all(include("font-weight:#{weight}"))
        expect(declarations).to all(include(%(font-variation-settings:"wght" #{weight})))
      end
    end
  end

  describe 'the deprecated font-- aliases' do
    it 'resolves identically to its canonical spelling, gate for gate' do
      synonyms.each do |canonical, deprecated|
        canonical_rules = every_rule_for(canonical).map { |sel, decl| [sel.gsub(canonical, 'WEIGHT'), decl] }
        deprecated_rules = every_rule_for(deprecated).map { |sel, decl| [sel.gsub(deprecated, 'WEIGHT'), decl] }

        expect(canonical_rules.size).to eq(48)
        expect(canonical_rules.sort).to eq(deprecated_rules.sort),
                                        "#{canonical} and #{deprecated} differ at " \
                                        "#{((canonical_rules | deprecated_rules) - (canonical_rules & deprecated_rules)).first(4).inspect}"
      end
    end

    it 'keeps every font-- weight and size alias emitting' do
      # Nothing is removed before 4.0. The size aliases are listed with the
      # weights because they leave on the same release.
      aliases = %w[font--regular font--bold] +
                %w[small base large xlarge xxlarge xxxlarge mega giga tera peta].map { |size| "font--#{size}" }

      expect(aliases.reject { |name| every_rule_for(name).any? }).to be_empty
    end
  end

  describe 'the text-- namespace' do
    it 'gives the weight classes the weight family gate set, not the size family one' do
      # The size classes take a `dark:` gate because their namespace siblings do.
      # The weight classes take the weight family's gates instead, so that the
      # canonical spelling and the alias stay one rule under two names.
      expect(emitted_gates('text--small')).to include('dark:')
      expect(emitted_gates('text--bold')).not_to include('dark:')
    end
  end
end
