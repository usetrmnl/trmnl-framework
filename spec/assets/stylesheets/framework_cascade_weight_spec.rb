# frozen_string_literal: true

require 'rails_helper'

# Three defects with one shape: a rule weighed more than the rule it had to lose
# to, inside the same cascade layer, where specificity is the only judge left
# before source order.
#
#   - the size utilities applied `width` from a `[class^="w--"]` matcher, which
#     also caught w--min-* and w--max-*. Those bind no --tn-size-w, so a lone
#     constraint class reset the width it was supposed to constrain.
#   - `.grid .col--span-N { display: flex }` outweighed `.hidden`, so no grid
#     child could be hidden, at any variant tier.
#   - the bare `landscape:` gate carried one class more than `portrait:`, so
#     one-modifier landscape variants tied the two-modifier gates that are
#     supposed to outrank them.
#
# These examples read the compiled bundle because the emitted selector, and the
# weight it carries, is the only honest record of who wins.
RSpec.describe 'Framework cascade weights' do
  subject(:css) { FrameworkBuild.plugins_css }

  # Everything the rule lookup below reads, built once for the file.
  #
  # utilities_layer is the last cascade layer, ten megabytes of it, and nothing
  # under it can rescue a rule that loses there, so every relationship these
  # examples check lives inside it. layer_rules is its thirty thousand rules in
  # source order and rules_by_class is the same list under the class each rule
  # styles, which costs a tokenize of every selector list in the layer.
  #
  # All three used to be per-example memos, so twenty examples paid for twenty
  # passes over one immutable string. FrameworkBuild finishes the build before the
  # first read, so nothing can change those bytes between here and the last example.
  before(:all) do
    bundle = FrameworkBuild.plugins_css
    @utilities_layer = bundle[bundle.index('@layer tn--utilities{')..]
    @layer_rules = rules_declaring('')
    @rules_by_class = @layer_rules.each_with_object(Hash.new { |hash, key| hash[key] = [] }) do |rule, index|
      name = subject_class(rule.first)
      index[name] << rule if name
    end
  end

  # A gate that leads with a bit depth starts the class with a digit, so the
  # emitter writes it as `\32 bit\:`. Every other position keeps the plain form.
  def gate_token = /(?:dark|sm|md|lg|portrait|landscape|[124]bit|\\3[124]\ bit)/

  def normalize_gate(gate) = gate.delete('\\').sub(/\A3([124]) bit/, '\1bit')

  # ==================================================================
  # Selector weight
  # ==================================================================

  # A CSS escape (`\32 `, `\:`, `\[`) is one token, so `.\32 bit\:hidden` reads
  # as one class and not as two compounds split on the space inside it.
  def tokenize(text)
    tokens = []
    index = 0
    while index < text.length
      if text[index] == '\\'
        escape = text[index..].match(/\A\\(?:[0-9a-fA-F]{1,6} ?|.)/m)[0]
        tokens << [escape, :escape]
        index += escape.length
      else
        tokens << [text[index], :plain]
        index += 1
      end
    end
    tokens
  end

  def split_top_level(text, separator = ',')
    parts = [+'']
    depth = 0
    tokenize(text).each do |token, kind|
      if kind == :plain && depth.zero? && token == separator
        parts << +''
        next
      end
      depth += 1 if kind == :plain && ['(', '['].include?(token)
      depth -= 1 if kind == :plain && [')', ']'].include?(token)
      parts.last << token
    end
    parts
  end

  def skip_name(tokens, index)
    index += 1 while index < tokens.length &&
                     (tokens[index][1] == :escape || tokens[index][0].match?(/[\w-]/))
    index
  end

  # The text between an opening bracket and its match, plus the index after it.
  def read_group(tokens, index, open, close)
    depth = 0
    finish = index
    while finish < tokens.length
      token, kind = tokens[finish]
      if kind == :plain
        depth += 1 if token == open
        depth -= 1 if token == close
      end
      break if depth.zero? && finish > index

      finish += 1
    end
    [tokens[(index + 1)...finish].map(&:first).join, finish + 1]
  end

  # Specificity of one complex selector as [ids, classes, elements]. :where() is
  # weightless, :is()/:not()/:has() take their heaviest argument, an attribute
  # selector weighs a class, and a pseudo-element weighs an element.
  def weight(selector)
    tokens = tokenize(selector)
    counts = [0, 0, 0]
    index = 0
    while index < tokens.length
      token, kind = tokens[index]
      if kind == :escape
        index += 1
      elsif token == '#'
        counts[0] += 1
        index = skip_name(tokens, index + 1)
      elsif token == '.'
        counts[1] += 1
        index = skip_name(tokens, index + 1)
      elsif token == '['
        counts[1] += 1
        _, index = read_group(tokens, index, '[', ']')
      elsif token == ':'
        index = add_pseudo_weight(tokens, index, counts)
      elsif token.match?(/[\w-]/)
        counts[2] += 1
        index = skip_name(tokens, index)
      # The same step as the escape branch, for a different reason: an escape consumes its
      # character, and everything left here is punctuation that carries no weight.
      else # rubocop:disable Lint/DuplicateBranch
        index += 1
      end
    end
    counts
  end

  def add_pseudo_weight(tokens, index, counts)
    element = tokens[index + 1] && tokens[index + 1][0] == ':'
    start = index + (element ? 2 : 1)
    finish = skip_name(tokens, start)
    name = tokens[start...finish].map(&:first).join.downcase

    unless tokens[finish] && tokens[finish][0] == '('
      counts[element ? 2 : 1] += 1
      return finish
    end

    inner, after = read_group(tokens, finish, '(', ')')
    if %w[is not has matches any].include?(name)
      heaviest = split_top_level(inner).map { |part| weight(part) }.max
      3.times { |axis| counts[axis] += heaviest[axis] }
    elsif name != 'where' # :where() is weightless by definition
      counts[1] += 1
    end
    after
  end

  # The heaviest complex selector in a rule's list: the weight the rule carries
  # wherever it matches.
  def rule_weight(selectors) = split_top_level(selectors).map { |part| weight(part) }.max

  def heavier?(left, right) = (left <=> right).positive?

  describe 'the weight calculator itself' do
    it 'counts classes, attributes, guards and escapes the way the cascade does' do
      expect(weight('.trmnl .hidden')).to eq([0, 2, 0])
      expect(weight('.trmnl .\\32 bit\\:hidden')).to eq([0, 2, 0])
      expect(weight('.trmnl [class^="w--"]')).to eq([0, 2, 0])
      expect(weight('.trmnl .w--\\[64px\\]')).to eq([0, 2, 0])
      expect(weight('.trmnl .screen--md.screen--portrait .md\\:portrait\\:hidden')).to eq([0, 4, 0])
      expect(weight('.trmnl .screen--md:not(.screen--portrait) .md\\:landscape\\:hidden')).to eq([0, 4, 0])
      expect(weight('.trmnl .screen:where(:not(.screen--portrait)) .landscape\\:hidden')).to eq([0, 3, 0])
      expect(weight('.trmnl :where(.screen--portrait .portrait\\:grid) .col--span-6')).to eq([0, 2, 0])
      expect(weight('.trmnl :is(.screen--sm,.screen--md) .sm\\:hidden')).to eq([0, 3, 0])
      expect(weight('.trmnl .grid .row img')).to eq([0, 3, 1])
    end
  end

  # ==================================================================
  # Rule lookup
  # ==================================================================

  attr_reader :utilities_layer

  # [selectors, body] for every rule in the layer whose body declares the given
  # property. Gates collapse their screen scopes into :is(), whose commas rule
  # out splitting on commas, so a rule's selector list stays one string. The
  # body is a lookahead so the rule's closing brace stays available as the next
  # rule's anchor; consuming it would skip every second adjacent rule.
  def rules_declaring(pattern)
    utilities_layer.scan(/(?:[{}]|\A)([^{}]*)\{(?=([^{}]*#{pattern}[^{}]*)\})/)
  end

  # The compound the rule actually styles: everything after its last combinator.
  def subject_compound(selectors)
    complex = split_top_level(selectors).first.strip
    split_top_level(complex, ' ').last.split('>').last
  end

  def unescape(text)
    text.gsub(/\\([0-9a-fA-F]{1,6}) ?/) { [Regexp.last_match(1).hex].pack('U') }
        .gsub(/\\(.)/) { Regexp.last_match(1) }
  end

  def subject_class(selectors)
    compound = subject_compound(selectors)
    compound.start_with?('.') ? unescape(compound.delete_prefix('.')) : nil
  end

  def subject_gate(selectors)
    match = subject_compound(selectors).match(/\A\.((?:#{gate_token}\\:)*)/)
    match ? normalize_gate(match[1]) : nil
  end

  attr_reader :layer_rules, :rules_by_class

  def rules_for(variant_class) = rules_by_class[variant_class].map(&:first)

  # ==================================================================
  # Size utilities
  # ==================================================================

  describe 'size utilities' do
    def size_properties
      {
        'width' => '--tn-size-w', 'height' => '--tn-size-h',
        'min-width' => '--tn-size-w-min', 'max-width' => '--tn-size-w-max',
        'min-height' => '--tn-size-h-min', 'max-height' => '--tn-size-h-max'
      }
    end

    attr_reader :size_rules

    before(:all) { @size_rules = rules_declaring('var\(--tn-size-') }

    # Size skips bit depth and dark on purpose, so its matrix is the twelve size
    # and orientation gates.
    def size_gates
      ['', 'sm:', 'md:', 'lg:', 'landscape:', 'portrait:',
       'sm:landscape:', 'sm:portrait:', 'md:landscape:', 'md:portrait:',
       'lg:landscape:', 'lg:portrait:']
    end

    def size_tokens
      ['w--32', 'h--32', 'w--min-32', 'w--max-32', 'h--min-32', 'h--max-32',
       'w--full', 'w--auto', 'w--[64px]', 'h--[50cqh]']
    end

    it 'applies a size only from an enumerated token class' do
      # A prefix matcher reads the whole class attribute, so `[class^="w--"]`
      # also selected w--min-* and w--max-*. Those bind no --tn-size-w, so the
      # matcher resolved a guaranteed-invalid variable and dropped width to auto
      # from the last cascade layer, wiping whatever the element had underneath.
      offenders = size_rules.map(&:first).grep(/\[class[\^*]=/)

      expect(offenders).to be_empty,
                           "a size rides a prefix matcher again: #{offenders.first.to_s[0, 200]}"
    end

    it 'binds in the same rule the variable it reads' do
      # A declaration that reads a variable its own rule does not bind is the
      # shape that failed: it resolves whatever the element happens to carry, or
      # nothing at all.
      unbound = size_rules.reject do |_selectors, body|
        body.scan(/(?<![\w-])((?:min-|max-)?(?:width|height)):var\((--tn-size-[\w-]+)\)/).all? do |property, var|
          size_properties[property] == var && body.include?("#{var}:")
        end
      end

      expect(unbound).to be_empty,
                         "size rules that read a variable they do not bind: #{unbound.first.to_s[0, 200]}"
    end

    it 'never lets a min or max class touch the base property' do
      # `class="item w--max-32"` is the case that broke: max-width has to apply
      # and width has to stay untouched.
      %w[w--max- w--min- h--max- h--min-].each do |family|
        base = family.start_with?('w') ? 'width' : 'height'
        offenders = size_rules.select do |selectors, body|
          subject_compound(selectors).include?(family) && body.match?(/(?<![\w-])#{base}:/)
        end

        expect(offenders).to be_empty,
                             "#{family}* declares #{base}: #{offenders.first.to_s[0, 200]}"
      end
    end

    it 'applies every size token at every gate the matrix emits, and only those' do
      # A gate that binds the variable without carrying the declaration, or the
      # reverse, is a class that silently does nothing.
      size_tokens.each do |token|
        size_gates.each do |gate|
          rules = rules_by_class["#{gate}#{token}"]

          expect(rules.size).to eq(1), "#{gate}#{token} is emitted #{rules.size} times, expected once"
          expect(rules.first.last).to match(/--tn-size-[\w-]+:[^;]+;(?:min-|max-)?(?:width|height):var\(/)
        end

        %W[2bit:#{token} dark:#{token} dark:md:#{token}].each do |beyond|
          expect(rules_for(beyond)).to be_empty, "#{beyond} is outside the size matrix"
        end
      end
    end

    it 'weighs a base token class exactly what the prefix matcher weighed' do
      # One class against one attribute selector: nothing else in the layer
      # shifts because the declarations moved onto the token classes.
      size_tokens.each do |token|
        expect(rule_weight(rules_for(token).first)).to eq([0, 2, 0])
      end
    end
  end

  # ==================================================================
  # Box model utilities
  # ==================================================================

  # size, spacing and gap all apply their property from a --tn-* channel, and
  # the layout containers declare the same properties as their own defaults.
  # Every one of those pairs sits in this layer at the same class of weight, so
  # the file order in utilities/_index.scss decided them: forwarded first, the
  # explicit dimension lost, and `class="col h--max-8"`, `class="grid
  # w--[50cqw]"` and `class="stretch w--min-32"` did nothing at all.
  #
  # Two shapes fix it and both are asserted here. A default that a utility can
  # tie is emitted before the utility, so the utility wins on source order. A
  # default that outweighs a utility (the stretch rules carry a parent guard)
  # reads the channel instead, so the utility sets the value the winning rule
  # applies and no weight moves.
  describe 'box model utilities' do
    def box_properties
      ['width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
       'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
       'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'gap']
    end

    # The three zero-gap modifiers are documented to force a gap of zero, so
    # they are emitted after the gap sizes on purpose. Nothing else in the layer
    # may declare a box model property late.
    def deliberate_late = %w[gap--auto gap--distribute gap--space-between]

    # The class a rule styles with its gate taken off, so a modifier and its
    # variants answer as one name.
    def bare_class(selectors)
      subject_class(selectors)&.delete_prefix(subject_gate(selectors).to_s)
    end

    def declares?(body, property) = body.match?(/(?<![\w-])#{property}:/)

    # A rule takes part in the channel when its value for the property comes
    # from one. Both the utilities and the defaults that hand over to them read
    # this way; a literal value does not.
    def from_channel?(body, property) = body.match?(/(?<![\w-])#{property}:var\(--tn-/)

    # The utility that owns the property reads its channel with no fallback:
    # the class exists to set the value, so there is nothing to fall back to. A
    # container default reads the same channel with its own default as the
    # fallback, which is what keeps it working with no utility present.
    def owns?(body, property) = body.match?(/(?<![\w-])#{property}:var\(--tn-[\w-]+\)/)

    def rules_with_property(property)
      layer_rules.each_with_index.select { |(_selectors, body), _order| declares?(body, property) }
    end

    it 'emits every box model utility after the defaults that share its property' do
      offenders = box_properties.flat_map do |property|
        rules = rules_with_property(property)
        applied = rules.select { |(_selectors, body), _order| owns?(body, property) }
        next [] if applied.empty?

        first_applied = applied.map(&:last).min
        late = rules.select do |(selectors, body), order|
          order > first_applied &&
            !from_channel?(body, property) &&
            deliberate_late.exclude?(bare_class(selectors)) &&
            !heavier?([0, 2, 0], rule_weight(selectors))
        end
        late.map { |(selectors, _body), order| "#{property} ##{order}: #{selectors[0, 140]}" }
      end

      expect(offenders).to be_empty,
                           "these declare a box model property after the utility that owns it:\n  " \
                           "#{offenders.first(6).join("\n  ")}"
    end

    it 'hands the property to the channel wherever a default outweighs a utility' do
      # The stretch family is the one place a container default carries a parent
      # guard, so it weighs one class more than any size utility on the same
      # element. Ordering cannot fix that; the channel can.
      %w[stretch stretch-x stretch-y].each do |utility|
        rules = layer_rules.select { |selectors, _body| subject_class(selectors) == utility }

        expect(rules).not_to be_empty, "#{utility} has no rule at all"
        rules.each do |selectors, body|
          %w[min-width min-height width].each do |property|
            next unless declares?(body, property)

            expect(from_channel?(body, property)).to be(true),
                                                     "#{utility} declares a literal #{property}: #{selectors[0, 120]}"
          end
        end
      end
    end

    it 'registers the size channel so a container floor cannot inherit' do
      # `w--min-32` on a container would otherwise hand its floor to every
      # .stretch descendant, and the flex children would stop shrinking.
      %w[w h w-min h-min w-max h-max].each do |channel|
        expect(css).to include(%(@property --tn-size-#{channel}{syntax:"*";inherits:false})),
                       "--tn-size-#{channel} is not registered as a non-inheriting channel"
      end
    end

    it 'keeps the zero-gap modifiers after the gap sizes' do
      zero = layer_rules.each_with_index.select do |(selectors, body), _order|
        deliberate_late.include?(bare_class(selectors)) && declares?(body, 'gap')
      end
      sizes = layer_rules.each_with_index.select do |(_selectors, body), _order|
        from_channel?(body, 'gap')
      end

      expect(zero).not_to be_empty
      expect(zero.map(&:last).min).to be > sizes.map(&:last).max
    end
  end

  # ==================================================================
  # Aspect ratio utilities
  # ==================================================================

  # Two size gates of different breakpoints carry the same weight, so on a large
  # screen `md:aspect--16/9 lg:aspect--4/3` is settled by source order alone.
  # Emitting each class's whole gate set as one block tied that order to the
  # value: 4/3 beat 16/9 at lg only because the file declares it first. Gates
  # outer and values inner is what keeps the wider breakpoint winning.
  describe 'aspect ratio utilities' do
    it 'emits every size gate after the narrower gates it outranks' do
      positions = layer_rules.each_with_index.with_object({}) do |((selectors, _body), order), index|
        gate = subject_gate(selectors)
        next unless %w[sm: md: lg:].include?(gate)
        next unless subject_class(selectors).to_s.delete_prefix(gate).start_with?('aspect--')

        (index[gate] ||= []) << order
      end

      expect(positions.keys).to match_array(%w[sm: md: lg:])
      expect(positions['sm:'].max).to be < positions['md:'].min
      expect(positions['md:'].max).to be < positions['lg:'].min
    end
  end

  # ==================================================================
  # Filter utilities
  # ==================================================================

  # filter is a single property, not a list-composing one, so two utilities that
  # each wrote their own declaration could not both apply. `image invert
  # image-stroke` lost the inversion outright, and so did `invert text-stroke`:
  # the stroke program wrote `filter: none` to clear the property. Every rule in
  # the layer writes one composed declaration now, so the winner carries every
  # channel.
  describe 'filter utilities' do
    def filter_channel = 'filter:var(--tn-invert, ) var(--tn-image-stroke, )'

    attr_reader :filter_rules

    before(:all) { @filter_rules = rules_declaring('(?<![\\w-])filter:') }

    it 'writes one composed declaration everywhere it filters' do
      expect(filter_rules.size).to be >= 5

      literal = filter_rules.reject { |_selectors, body| body.include?(filter_channel) }

      expect(literal).to be_empty,
                         "these write filter outside the channel: #{literal.first.to_s[0, 200]}"
    end

    it 'gives invert and both stroke families the same declaration' do
      subjects = filter_rules.map { |selectors, _body| subject_class(selectors) }

      expect(subjects).to include('invert')
      expect(subjects.join(' ')).to include('text-stroke', 'image-stroke')
    end

    it 'registers both filter channels so a filter cannot inherit' do
      # An image-stroke inside an inverted container would otherwise invert
      # itself a second time and render as the only uninverted thing on screen.
      %w[invert image-stroke].each do |channel|
        expect(css).to include(%(@property --tn-#{channel}{syntax:"*";inherits:false}))
      end
    end
  end

  # ==================================================================
  # Display utilities
  # ==================================================================

  describe 'display utilities' do
    # display_rules is every rule in the layer that sets a display. hidden_weights
    # maps a gate to the weight of the `hidden` rule that gate publishes: every
    # other display rule at that gate has to weigh the same or less, because
    # _visibility.scss emits `hidden` last and relies on source order for the tie.
    attr_reader :display_rules, :hidden_weights

    before(:all) do
      @display_rules = rules_declaring('display:')
      @hidden_weights = @display_rules.each_with_object({}) do |(selectors, _body), index|
        gate = subject_gate(selectors)
        index[gate] = rule_weight(selectors) if subject_class(selectors) == "#{gate}hidden"
      end
    end

    it 'publishes a hidden rule for every gate that sets a display' do
      gates = display_rules.filter_map { |selectors, _body| subject_gate(selectors) }.uniq

      expect(gates.size).to be > 30
      expect(gates - hidden_weights.keys).to be_empty
    end

    it 'never lets a display rule outweigh the hidden rule of its own gate' do
      heavier = display_rules.select do |selectors, _body|
        expected = hidden_weights[subject_gate(selectors)]
        expected && heavier?(rule_weight(selectors), expected)
      end

      expect(heavier).to be_empty,
                         "display rules that .hidden cannot beat: #{heavier.first.to_s[0, 220]}"
    end

    it 'emits every hidden rule after the display rules of its gate' do
      late = display_rules.select do |selectors, _body|
        hidden = rules_for("#{subject_gate(selectors)}hidden").first
        hidden && utilities_layer.index(selectors) > utilities_layer.index(hidden)
      end

      expect(late).to be_empty,
                      "display rules emitted after their gate's hidden rule: #{late.first.to_s[0, 220]}"
    end

    it 'keeps the grid parent weightless in every column span rule' do
      # `.grid` is a context guard here, not a weight. Written bare it put
      # `display: flex` one class above `.hidden`, and the variant emitters
      # repeated the defeat one tier up.
      spans = rules_declaring('grid-column:span')
      expect(spans.size).to be > 500

      plain, variant = spans.partition { |selectors, _body| selectors.include?(':where(.grid)') }

      # A plain .grid parent lands the rule exactly on the tie its gate's hidden
      # rule sits at, which is what hands the decision to source order.
      off_tie = plain.reject { |selectors, _body| rule_weight(selectors) == hidden_weights[subject_gate(selectors)] }
      expect(off_tie).to be_empty,
                         "column spans off their gate's tie: #{off_tie.first.to_s[0, 220]}"

      # A variant parent (.portrait\:grid) gates the parent's own variant, not
      # the child's, so its whole context is weightless and the rule sits at or
      # below the tie. Never above it.
      expect(variant.size).to be > 200
      heavy = variant.select do |selectors, _body|
        heavier?(rule_weight(selectors), hidden_weights[subject_gate(selectors)])
      end
      expect(heavy).to be_empty,
                       "column spans above their gate's tie: #{heavy.first.to_s[0, 220]}"
    end
  end

  # ==================================================================
  # Orientation gates
  # ==================================================================

  describe 'orientation gates' do
    def gate_weight(variant_class)
      rules = rules_for(variant_class)
      return nil if rules.empty?

      rules.map { |selectors| rule_weight(selectors) }.max
    end

    def orientation_shapes
      ['%s:', 'md:%s:', 'lg:%s:', '%s:2bit:', 'lg:%s:4bit:', 'dark:%s:', 'dark:md:%s:']
    end

    it 'weighs a landscape gate exactly what the mirrored portrait gate weighs' do
      # Landscape has no class of its own, so its gate is a guard rather than a
      # class. The guard has to carry the weight the portrait class carries,
      # tier for tier, or identical authoring reads differently per orientation.
      # A tier a family does not publish at all is fine; publishing it for one
      # orientation only is the same defect in another shape.
      compared = 0
      %w[hidden flex gap--large col--span-3 table--base].each do |family|
        orientation_shapes.each do |shape|
          landscape = gate_weight(format(shape, 'landscape') + family)
          portrait = gate_weight(format(shape, 'portrait') + family)
          next if landscape.nil? && portrait.nil?

          compared += 1
          expect(landscape).to eq(portrait),
                               "#{format(shape, 'landscape')}#{family} weighs #{landscape.inspect}, " \
                               "#{format(shape, 'portrait')}#{family} weighs #{portrait.inspect}"
        end
      end

      expect(compared).to be > 15
    end

    it 'keeps a two-modifier gate above the one-modifier gates it refines' do
      # The hierarchy the responsive docs promise: more modifiers wins.
      %w[hidden gap--large].each do |family|
        %w[landscape portrait].each do |orientation|
          compound = gate_weight("md:#{orientation}:#{family}")

          [gate_weight("#{orientation}:#{family}"), gate_weight("md:#{family}")].each do |single|
            expect(heavier?(compound, single)).to be(true),
                                                  "md:#{orientation}:#{family} weighs #{compound.inspect}, " \
                                                  "a one-modifier gate weighs #{single.inspect}"
          end
        end
      end
    end

    it 'gives the bare orientation gates the same weight as a size gate' do
      %w[landscape portrait sm md lg].each do |modifier|
        expect(gate_weight("#{modifier}:hidden")).to eq([0, 3, 0])
      end
    end
  end
end
