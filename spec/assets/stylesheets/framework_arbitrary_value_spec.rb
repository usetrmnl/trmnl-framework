# frozen_string_literal: true

require 'rails_helper'

# Arbitrary values (`gap--[10px]`, `w--[96px]`, `w--[50cqw]`) are enumerated
# loops, not a parsed syntax, so every value and every gate a reader can write
# has to have been emitted. Which gates each family emits is a published
# contract and the families do not answer alike: Gap and Rounded are base-only,
# Size carries the full size/orientation gate set, and Spacing, Flex basis and
# grid track minimums have no arbitrary form at all.
#
# The gap loop used to sit inside the gate mixin, so `md:gap--[25px]` resolved
# while the Gap page said three times that it could not. That was 561 rules no
# reader could find from the docs. These examples read the compiled bundle,
# which is the only honest record of what an author can write, and they pin both
# directions: the base values that must exist, and the gates that must not.
RSpec.describe 'Framework arbitrary value contract' do
  subject(:css) { FrameworkBuild.plugins_css }

  # Every variant prefix the emitters can put in front of a utility class.
  def gate_token = /(?:dark|sm|md|lg|portrait|landscape|[124]bit)/

  # The size and orientation gate set, as the emitters spell the prefixes.
  def size_orientation_gates
    sizes = %w[sm md lg]
    orientations = %w[landscape portrait]
    [*sizes.map { |size| "#{size}:" }, *orientations.map { |orient| "#{orient}:" },
     *sizes.product(orientations).map { |size, orient| "#{size}:#{orient}:" }]
  end

  # (gate, value) for every arbitrary class the bundle emits under this stem,
  # e.g. ['', '10px'] and ['md:portrait:', '96px']. Brackets are escaped in the
  # selector, and the gate colons with them.
  def arbitrary_classes(stem)
    css.scan(/\.((?:#{gate_token}\\:)*)#{Regexp.escape(stem)}\\\[([^\\\]]+)\\\]/)
       .map { |gate, value| [gate.delete('\\'), value] }.uniq
  end

  def gates_for(stem) = arbitrary_classes(stem).map(&:first).uniq

  def values_for(stem, gate: '')
    arbitrary_classes(stem).select { |found, _value| found == gate }.map(&:last)
  end

  describe 'base-only families' do
    # The Gap page states this three times (the Arbitrary lead, the code sample
    # comment, and the notice box) and the Rounded page twice. A variant-gated
    # loop is what makes those statements false, so the assertion is on the gate
    # set, not on a sample class.
    it 'emits arbitrary gaps and radii at the base gate alone' do
      expect(gates_for('gap--')).to eq([''])
      expect(gates_for('rounded--')).to eq([''])
    end

    it 'keeps the whole 0 to 50 range both families publish' do
      expected = (0..50).map { |px| "#{px}px" }

      expect(values_for('gap--')).to match_array(expected)
      expect(values_for('rounded--')).to match_array(expected)
    end

    # Corner utilities take the named sizes only, which rounded.html.erb states.
    it 'gives the corner utilities no arbitrary form' do
      %w[rounded-t-- rounded-r-- rounded-b-- rounded-l--
         rounded-tl-- rounded-tr-- rounded-br-- rounded-bl--].each do |stem|
        expect(arbitrary_classes(stem)).to be_empty
      end
    end
  end

  describe 'the size family' do
    # size.html.erb publishes `md:w--[128px]` and `md:w--[50cqw]` in its
    # Supported Responsive Classes table, and image.html.erb and item.html.erb
    # both ship `portrait:w--[10cqw]` in demo markup. Narrowing Size to match
    # Gap would break all three.
    it 'carries every size and orientation gate' do
      %w[w-- h-- w--min- w--max- h--min- h--max-].each do |stem|
        expect(gates_for(stem)).to contain_exactly('', *size_orientation_gates)
      end
    end

    it 'stops at size and orientation, with no bit-depth or dark gate' do
      leaked = gates_for('w--').grep(/dark|bit/)

      expect(leaked).to be_empty, "size arbitrary values leaked into #{leaked.inspect}"
    end

    it 'publishes 0 to 128 pixels and 0 to 100 container query units' do
      expect(values_for('w--')).to contain_exactly(*(0..128).map { |px| "#{px}px" }, *(0..100).map { |cq| "#{cq}cqw" })
      expect(values_for('h--')).to contain_exactly(*(0..128).map { |px| "#{px}px" }, *(0..100).map { |cq| "#{cq}cqh" })
    end
  end

  describe 'families with no arbitrary form' do
    # A `p--[10px]` class matches the `[class^="p--"]` paint rule but binds no
    # --tn-p, so the declaration reverts its layer and the class does nothing at
    # all (framework_unbound_utility_token_spec.rb owns that half). Spacing docs
    # say scale tokens only; this pins the CSS to that claim.
    it 'emits none for spacing, flex basis or grid track minimums' do
      stems = %w[m-- mt-- mr-- mb-- ml-- mx-- my-- p-- pt-- pr-- pb-- pl-- px-- py--
                 basis-- grid--min-]

      emitted = stems.reject { |stem| arbitrary_classes(stem).empty? }

      expect(emitted).to be_empty, "these families gained an arbitrary form: #{emitted.inspect}"
    end
  end
end
