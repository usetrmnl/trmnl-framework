# frozen_string_literal: true

require 'rails_helper'

# The normalize-layer dither hook in `framework/index.scss` gives every element
# carrying a paint utility the tiling, sizing, and pixel rendering a dither
# pattern needs. It reaches those elements by matching the class attribute as a
# string, so the string it matches has to be the framework's own class grammar
# and nothing wider.
#
# It used to match `bg-` on a single dash while its sibling matched `text--` on
# two. No framework background class has ever had that shape (they are all
# `bg--<token>`), so the single dash reached only foreign classes: Tailwind's
# `bg-white` and `bg-gray-100` on any element inside a `.trmnl` subtree picked up
# `image-rendering: pixelated` and a dither `background-size`. `index.scss` says
# the `tn--` layer prefix is there to avoid exactly that conflict.
RSpec.describe 'Framework dither hook scope' do
  subject(:css) { FrameworkBuild.plugins_css }

  # The hook is the one rule in the bundle that pairs the two paint namespaces.
  def hook_rule = css[/\.trmnl \[class\*=[^{]*\{[^}]*image-rendering:pixelated[^}]*\}/]

  # Every `[class^=…]` / `[class*=…]` matcher the bundle emits, unquoted.
  def attribute_matchers
    @attribute_matchers ||= css.scan(/\[class[\^*]=["']?\s?([^\]"']+)["']?\]/).flatten.uniq
  end

  describe 'the hook selector' do
    it 'matches the two paint namespaces and nothing else' do
      expect(hook_rule).to start_with('.trmnl [class*=bg--],.trmnl [class*=text--]{')
    end

    it 'still carries the whole dither-ready block' do
      expect(hook_rule).to include('background-repeat:repeat')
      expect(hook_rule).to include('background-size:var(--dither-bg-size, auto)')
      expect(hook_rule).to include('image-rendering:pixelated')
      expect(hook_rule).to include('image-rendering:crisp-edges')
    end
  end

  describe 'the single-dash form' do
    it 'leaves no attribute matcher that catches a foreign bg- class' do
      offenders = attribute_matchers.grep(/(?:\A|:)bg-(?!-)/)

      expect(offenders).to be_empty,
                           "these matchers reach outside the bg-- grammar: #{offenders.inspect}"
    end
  end
end
