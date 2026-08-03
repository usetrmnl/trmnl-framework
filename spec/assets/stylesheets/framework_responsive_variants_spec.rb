# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Framework responsive variant gates' do
  subject(:css) { FrameworkBuild.plugins_css }

  def sizes = %w[sm md lg]
  def orientations = %w[landscape portrait]
  def bit_depths = %w[1bit 2bit 4bit]

  # Every gate token as the bundle spells it, in any position. A gate that leads
  # with a bit depth starts the class with a digit, which the emitter writes as
  # `\32 bit\:`, so the escaped spelling is part of the token; the cascade weight
  # suite reads it the same way. Without it the index could not see a single
  # bit-depth-only family, which is how `text-stroke--base` sat with no
  # `1bit:`/`2bit:`/`4bit:` form while every one of its siblings had all three.
  #
  # Every reader in this file goes through here. A second, narrower spelling of
  # the same list is what kept the escaped form invisible to half the suite
  # while the index already saw it.
  def gate_token = /(?:dark|sm|md|lg|portrait|landscape|[124]bit|\\3[124]\ bit)/

  # One or more gate tokens, spelled as a class prefix: `md\:`, `\32 bit\:`,
  # `md\:portrait\:4bit\:`.
  def gate_prefix = /(?:#{gate_token}\\:)+/

  def normalize_gate(gate) = gate.delete('\\').sub(/\A3([124]) bit/, '\1bit')

  # A variant class as the bundle spells it: colons escaped, and a leading digit
  # written as its `\3N ` escape. Building a regex from the class name as
  # authored is what hid every bit-prefixed device override from this suite.
  def selector_text(variant_class)
    variant_class.gsub(':') { '\\:' }.sub(/\A(\d)/) { "\\3#{Regexp.last_match(1)} " }
  end

  # Arbitrary-value classes (w--[40px]) leave a truncated stem behind the bracket.
  def arbitrary_stem = /-\z/

  # Modifiers that carry no variants while their siblings do. Rich text alignment
  # is scoped under .richtext and has never had variants. Shrink this list when
  # that changes; never grow it to make a failure pass.
  def known_variantless
    %w[content--center content--left content--right]
  end

  # The families whose whole variant contract is the bit depth. A stroke answers
  # the screen's palette, not its size or its orientation, and neither stroke
  # page offers a size or orientation form; both families publish the same three
  # gates and nothing else. Same rule as the list above: shrink it, never grow
  # it.
  def bit_depth_only = /\A(?:text|image)-stroke(?:--|\z)/

  # The utility families that carry the `dark:` tier, as class prefixes. The axis
  # is closed: the 2026-07-29 dark-mode decision made the Dark theme the
  # documented way to darken a screen, keeps the tier
  # working untouched through 3.x, and deletes it at 4.0
  # (`docs/V4_BREAKING.md` item 4).
  #
  # Closed means this list is the whole axis. A family that reaches for `dark:`
  # now is buying into surface with a removal date, and it widens the M97
  # divergence between a family and the display utility sharing its name, which
  # is half of why the axis is leaving. The two answers are the Dark theme for a
  # whole screen and `inverse` for one element.
  #
  # Same rule as the two lists above: shrink it when a family loses the axis,
  # never grow it to make a failure pass. `inline-flex` is the one entry that
  # arrived late: it is a value in the display map every other entry here comes
  # from and was emitted from _flexbox.scss instead, so it published 12 gates
  # where its eleven siblings published 96. Joining the map is what closed that,
  # not a new family reaching for the tier.
  def dark_axis_families
    %w[bg block flex font grid hidden inline inline-block inline-flex inline-grid
       table table-cell table-row text visible]
  end

  # The family prefixes the bundle actually publishes under a `dark:` gate:
  # 'bg--gray-10' counts as 'bg', 'hidden' counts as itself. The gate index keys
  # on whole class names, and the axis is owned one level up, at the same family
  # grouping the coverage example below uses.
  def darkened_families
    @gate_index.select { |_family, gates| axis_signature(gates)[:dark] }
               .keys.map { |family| family.split('--').first }.uniq.sort
  end

  before(:all) do
    bundle = FrameworkBuild.plugins_css
    @gate_index = gate_index(bundle)
    @rules = rule_pairs(bundle)
    @companion_pairs = companion_pairs(bundle)
  end

  # Every rule the readers below can see, as [selector list, declarations], in source
  # order. Built once: the bundle is 16MB and the device override example alone asks
  # about 400 classes, which used to be 400 scans of the whole file.
  #
  # The delimiters are the ones the per-call scans used, so the index sees exactly what
  # they saw: a rule is visible when its selector list follows a `}` or opens the file.
  # A rule that opens an at-rule block follows a `{` and stays invisible, as before.
  def rule_pairs(bundle)
    bundle.scan(/(?:\A|(?<=\}))([^{}]*)\{(?=([^{}]*)\})/)
  end

  # Every same-element pair of framework modifiers the bundle compounds, as
  # authored class names: '.md\:flex--row.flex--left' becomes
  # ['md:flex--row', 'flex--left']. Built once, so the direction examples ask a
  # set instead of rescanning 17MB per combination.
  def companion_pairs(bundle)
    name = /#{gate_prefix}?(?:flex|layout)--[a-z0-9-]+/
    bundle.scan(/\.(#{name})\.(#{name})(?![\w-])/)
          .to_set { |left, right| [normalize_gate(left), normalize_gate(right)] }
  end

  # family => the set of variant prefixes it is emitted under, e.g.
  # 'table--base' => ['sm:', 'lg:portrait:', ...]. Built once: the bundle is 16MB.
  def gate_index(bundle)
    index = Hash.new { |h, k| h[k] = [] }
    bundle.scan(/\.(#{gate_prefix})([a-z][a-z0-9-]*)/) do |prefix, family|
      next if family.match?(arbitrary_stem)

      index[family] << normalize_gate(prefix)
    end
    index.transform_values { |gates| gates.uniq.sort }
  end

  # Which of the four axes a family's gates use. Families group into tiers by this,
  # and a tier is the set of families the emitters are supposed to treat alike.
  def axis_signature(gates)
    tokens = gates.flat_map { |gate| gate.split(':') }.uniq
    {
      size: tokens.intersect?(sizes),
      orientation: tokens.intersect?(orientations),
      bit_depth: tokens.any? { |token| token.match?(/\A[124]bit\z/) },
      dark: tokens.include?('dark')
    }
  end

  # The class as a whole name. The trailing guard is what keeps `.lg\:table--base`
  # from answering for `lg:table--base-x`.
  def class_matcher(variant_class)
    /\.#{Regexp.escape(selector_text(variant_class))}(?![\w-])/
  end

  # A variant class only exists if the emitters wrote a selector for it, so the
  # compiled bundle is the only honest source for these assertions. Gates collapse
  # their screen scopes into :is(), whose commas rule out splitting on commas;
  # match the whole selector list of every rule that mentions the class instead.
  def rules_for(variant_class)
    matcher = class_matcher(variant_class)
    @rules.filter_map { |selectors, _declarations| selectors if selectors.match?(matcher) }
  end

  # The declarations of every rule that styles this exact class, concatenated.
  def declarations_for(variant_class)
    matcher = class_matcher(variant_class)
    @rules.filter_map { |selectors, declarations| declarations if selectors.match?(matcher) }.join(';')
  end

  # Families carrying a given variant prefix, e.g. 'table' from `.lg\:table--base`.
  # A trailing `\:` means the token is another prefix (portrait, 2bit), not a family.
  def families_under(prefix)
    css.scan(/\.#{prefix}([a-z][a-z0-9-]*?)(?:--|[ .,{])/).flatten.uniq
  end

  describe 'table row heights' do
    it 'gates lg:portrait:table--xlarge on both the size and the orientation' do
      rules = rules_for('lg:portrait:table--xlarge')

      expect(rules).not_to be_empty
      expect(rules).to all(include('.screen--lg', '.screen--portrait'))
    end

    it 'emits bare orientation variants for every table modifier' do
      %w[base large xlarge small xsmall condensed].each do |modifier|
        expect(rules_for("portrait:table--#{modifier}")).not_to be_empty
        expect(rules_for("landscape:table--#{modifier}")).not_to be_empty
      end
    end
  end

  describe 'orientation coverage' do
    it 'gives every size-varied class family a size+orientation variant' do
      size_only = families_under('lg\\\\:')
      size_and_orientation = families_under('lg\\\\:portrait\\\\:')

      expect(size_only - size_and_orientation).to be_empty
    end
  end

  # The two defects this suite was written for were whole gates that did not exist.
  # Spot checks cannot see that, so these examples enumerate the bundle instead.
  describe 'gate matrix' do
    it 'covers enough of the bundle to be worth trusting' do
      expect(@gate_index.size).to be > 1_000
    end

    it 'gives every variant family both a size and an orientation axis' do
      missing = @gate_index.reject do |family, gates|
        axis_signature(gates)[:orientation] || family.match?(bit_depth_only)
      end

      expect(missing.keys).to be_empty,
                              "families with variants but no orientation gate: #{missing.keys.sort.first(20).inspect}"
    end

    it 'publishes the dark tier for no family beyond the closed list' do
      opened = darkened_families - dark_axis_families

      expect(opened).to be_empty,
                        "these families opened the dark tier after it closed: #{opened.inspect}. " \
                        'The Dark theme darkens a whole screen and `inverse` darkens one element; ' \
                        'see docs/V4_BREAKING.md item 4.'
    end

    it 'keeps the closed list honest against the bundle' do
      # The list is a ceiling only if it is also a floor. A family that loses the
      # axis has to leave the list too, or the list quietly licenses coverage
      # nothing publishes any more and the next reader trusts a stale ceiling.
      stale = dark_axis_families - darkened_families

      expect(stale).to be_empty, "listed families with no dark gate left: #{stale.inspect}"
    end

    it 'gives the two stroke families one modifier set and one gate set' do
      # They are the same utility for two media and the docs teach them side by
      # side, so a modifier one publishes and the other does not is a hole, not a
      # choice: image-stroke had no grayscale tokens and no bit-depth variants at
      # all while text-stroke had both.
      text, image = %w[text-stroke image-stroke].map do |family|
        @gate_index.select { |name, _gates| name == family || name.start_with?("#{family}--") }
                   .transform_keys { |name| name.delete_prefix(family) }
      end

      expect(text.keys).to match_array(image.keys)
      expect(text.values.uniq).to eq([%w[1bit: 2bit: 4bit:]])
      expect(image.values.uniq).to eq([%w[1bit: 2bit: 4bit:]])
    end

    it 'emits an identical gate set for every family in a tier' do
      # A family that uses an axis must use all of it. Grouping by axis signature is
      # coarser than the gate set, so equality within a group is a real assertion:
      # one family missing a gate its peers have fails here.
      uneven = @gate_index.group_by { |_family, gates| axis_signature(gates) }.filter_map do |signature, members|
        widest = members.map { |_family, gates| gates }.max_by(&:size)
        odd_family, odd_gates = members.find { |_family, gates| gates != widest }
        next if odd_family.nil?

        "#{signature.select { |_axis, used| used }.keys.inspect} tier: #{odd_family} has " \
          "#{odd_gates.size} of #{widest.size} gates, missing #{(widest - odd_gates).first(6).inspect}"
      end

      expect(uneven).to be_empty, "gate sets differ inside a tier:\n  #{uneven.join("\n  ")}"
    end

    it 'keeps size gates mobile-first, widest at sm and narrowest at lg' do
      # sm: fires on sm, md, and lg; md: on md and lg; lg: on lg alone.
      %w[gap--large value--large hidden table--base].each do |family|
        widths = sizes.map do |size|
          rules_for("#{size}:#{family}").first.to_s.scan(/\.screen--(?:sm|md|lg)\b/).uniq.size
        end

        expect(widths).to eq([3, 2, 1]), "#{family} size gates cover #{widths.inspect} screens, expected [3, 2, 1]"
      end
    end

    # The gate index only sees classes that appear with a prefix, so a modifier
    # with no variants at all is invisible to it. That is how label--inverted and
    # label--gray-out sat variantless: each was the second name in a grouped
    # selector, and the emitters keep only the first name they parse.
    it 'gives every modifier in a utility family the same variant coverage' do
      base_classes = css.scan(/(?<![\w\\:-])\.([a-z][a-z0-9-]*--[a-z0-9-]+)(?![a-z0-9-])/)
                        .flatten.uniq.reject { |name| name.end_with?('-') }

      uneven = base_classes.group_by { |name| name.split('--').first }.filter_map do |prefix, members|
        variantless = members.reject { |name| @gate_index.key?(name) } - known_variantless
        next if variantless.empty? || variantless.size == members.size

        "#{prefix}--: #{variantless.sort.inspect} carry no variants while their siblings do"
      end

      expect(uneven).to be_empty, "variant coverage differs inside a utility family:\n  #{uneven.join("\n  ")}"
    end

    it 'never escapes a compound selector into a class name' do
      # A modifier nested inside a companion compound (.flex--row.flex--center)
      # reaches the emitters as one string. Escaped whole, it becomes a class no
      # author can write, and the variant it was meant to publish does not exist.
      #
      # An escaped dot followed by a letter starts a second class; followed by a
      # digit it is just a decimal token (md:w--0.5), which is fine.
      #
      # The gate list is the shared one. Spelled out locally it could not see a
      # leading bit depth, so a `\32 bit\:` prefix could carry any of this into
      # the bundle unnoticed.
      unwritable = css.scan(/\.#{gate_prefix}[a-z0-9-]*(?:\\\.[a-z]|\\:not\\\()[^ {,]*/)
                      .map { |name| name.sub(/\A\.#{gate_prefix}/, '') }.uniq.sort

      expect(unwritable).to be_empty,
                            "variants escaped into unwritable classes: #{unwritable.first(8).inspect}"
    end

    it 'never publishes a gate prefix with no class behind it' do
      # `.grid .row img` ends in a tag, so the emitter had no class to prefix and
      # published the prefix alone: `.trmnl :is(...) .sm\:{max-height:100%}` and
      # four more. They match nothing an author can write and they replaced the
      # variants the block asked for. The check above cannot see them because it
      # needs an escaped dot or a `:not(` after the prefix; this one needs the
      # class to be missing entirely.
      empty = css.scan(/\.#{gate_prefix}(?=[\s,{)])/).uniq

      expect(empty).to be_empty,
                       "gate prefixes published with no class: #{empty.first(8).inspect}"
    end

    it 'keeps :not() guards at the weight they look like they carry' do
      # :not() takes the specificity of its most specific argument, so a descendant
      # selector inside one silently inflates the rule. `&:not(&--row)` is the easy
      # way to write that by accident: & expands to the whole parent selector.
      #
      # A :not() wrapped in :where() is exempt, because :where() is zero weight
      # whatever it holds. That is the spelling to reach for when a guard needs a
      # descendant, e.g. the rich-text `.content` alias staying off `.item .content`.
      inflated = css.scan(/(?<!:where\():not\([^)]*\s[^)]*\)/).uniq

      expect(inflated).to be_empty,
                          "these :not() guards carry a descendant selector: #{inflated.first(5).inspect}"
    end

    it 'scopes each gate axis the way the grammar promises' do
      expect(rules_for('md:portrait:gap--large')).to all(include('.screen--md.screen--portrait'))
      expect(rules_for('md:2bit:hidden')).to all(include('.screen--md.screen--2bit'))
      expect(rules_for('dark:md:hidden')).to all(include(':where(:not([class*=screen--theme-]))'))
    end

    it 'scopes a bare bit-depth gate on the bit-depth class alone' do
      # `2bit:hidden` is written `.\32 bit\:hidden`: the leading digit is
      # escaped, so every regex built from the class as authored missed it and
      # the whole bare-bit tier went unasserted. Named here so the escaped
      # spelling is a first-class case and not a side effect of the index.
      bit_depths.each do |depth|
        rules = rules_for("#{depth}:hidden")

        expect(rules).not_to be_empty, "#{depth}:hidden has no rule at all"
        expect(rules).to all(include(".screen--#{depth}"))
        expect(rules.join(' ')).not_to include('.screen--sm', '.screen--md', '.screen--lg')
      end
    end

    it 'gives the bit-depth-only families their three bare gates and nothing else' do
      # The stroke families publish no size or orientation form, so the bare bit
      # gate is their whole contract. It is also the only tier where a family
      # exists purely in the escaped spelling, which is what made it invisible.
      %w[text-stroke--small image-stroke--small].each do |family|
        expect(@gate_index[family]).to eq(%w[1bit: 2bit: 4bit:])
        bit_depths.each { |depth| expect(rules_for("#{depth}:#{family}")).not_to be_empty }
      end
    end

    it 'paints from a bit-prefixed stroke class the way the bare class paints' do
      # A stroke class binds the width and color variables; painting them is a
      # second rule that lists every class allowed to draw on its own. The
      # bit-prefixed base and size classes were not in that list, so
      # `2bit:text-stroke` set three variables and drew nothing while
      # `text-stroke` drew a ring. The gate index cannot see this: the class is
      # published either way, it just does nothing.
      #
      # Color modifiers are deliberately absent from this list. A bare
      # `text-stroke--black` is inert by contract and only tunes the color of a
      # class that paints.
      painting = %w[base small medium large xlarge].map { |size| "text-stroke--#{size}" } << 'text-stroke'

      painting.each do |klass|
        expect(declarations_for(klass)).to include('text-shadow'), "#{klass} paints no stroke"

        bit_depths.each do |depth|
          expect(declarations_for("#{depth}:#{klass}")).to include('text-shadow'),
                                                           "#{depth}:#{klass} sets variables but never paints"
        end
      end
    end
  end

  # responsive_test.scss is the mixin half of the parity harness: every rule
  # there keys off an element ID or a page-local demo class and calls screen().
  # Its header says so, and points here for the class-based half. This example is
  # what keeps that division true.
  describe 'the screen() mixin harness' do
    it 'publishes no variant class of its own' do
      harness = Rails.root.join('app/assets/builds/framework/responsive_test.css').read

      expect(harness.scan(/\.#{gate_prefix}[a-z]/).uniq).to be_empty
    end
  end

  # Device overrides gate an existing variant class on a bit depth, so their gate
  # set has to track the class's own. A missing one renders the right size at the
  # wrong weight on exactly the devices the override exists for.
  describe 'device weight overrides' do
    # The unprefixed device rule pins the wght axis, and font-weight cannot move
    # it back on a variable font. So every gate a class is published under needs
    # its own font-variation-settings, including the bit-prefixed ones the
    # responsive page teaches (`md:portrait:4bit:value--large`).
    #
    # family => the bit depths whose device rules pin the axis for it.
    def overridden_families
      {
        'value' => %w[2bit 4bit],
        'value--base' => %w[2bit 4bit],
        'value--large' => %w[2bit 4bit],
        'value--xxxlarge' => %w[2bit 4bit],
        'content--base' => %w[2bit 4bit],
        'content--large' => %w[2bit 4bit],
        'content--xxxlarge' => %w[2bit 4bit],
        'title--base' => %w[4bit],
        'title--large' => %w[4bit],
        'title--xxlarge' => %w[4bit],
        'label--base' => %w[4bit],
        'label--large' => %w[4bit],
        'label--xxlarge' => %w[4bit],
        'description--large' => %w[4bit],
        'description--xxlarge' => %w[4bit]
      }
    end

    # Every gate shape the emitters publish a class under, with and without a
    # leading bit-depth token.
    def gate_prefixes(depth)
      plain = ['', *sizes.map { |s| "#{s}:" }, *orientations.map { |o| "#{o}:" },
               *sizes.product(orientations).map { |s, o| "#{s}:#{o}:" }]
      plain + plain.map { |gate| "#{gate}#{depth}:" }
    end

    it 'reaches every gate of the classes it overrides' do
      missing = overridden_families.flat_map do |family, depths|
        depths.flat_map do |depth|
          uncovered = gate_prefixes(depth).reject do |gate|
            declarations_for("#{gate}#{family}").include?('font-variation-settings')
          end
          uncovered.map { |gate| "#{gate}#{family}" }
        end
      end

      expect(missing).to be_empty, "these classes have no device weight override: #{missing.first(12).inspect}"
    end

    it 'sees the bit-prefixed classes at all' do
      # `4bit:value--large` is written `.\34 bit\:value--large`, which a regex
      # built from the class name as authored cannot match. Every assertion above
      # would pass vacuously if this one did not hold.
      expect(rules_for('4bit:value--large')).not_to be_empty
      expect(rules_for('2bit:content--large')).not_to be_empty
      expect(rules_for('4bit:title--large')).not_to be_empty
    end

    it 'does not publish variant classes the base layer never defines' do
      # These are container and element classes: they have no responsive variants
      # of their own, so a device override must not invent sm:content and friends.
      %w[content title label description].each do |element|
        sizes.each { |size| expect(rules_for("#{size}:#{element}")).to be_empty }
        orientations.each { |orient| expect(rules_for("#{orient}:#{element}")).to be_empty }
        bit_depths.each { |depth| expect(rules_for("#{depth}:#{element}")).to be_empty }
      end
    end
  end

  # stretch-x and stretch-y only mean anything as a direct child of .flex or
  # .layout, and each parent context gives them a different body. Handed to a
  # class-name-extracting emitter, a parent-child block keeps only the child
  # compound, so each context published its own global rule and whichever came
  # last decided the layout of every element carrying the class.
  describe 'parent-child utilities' do
    def child_gates
      [*sizes.map { |s| "#{s}:" }, *orientations.map { |o| "#{o}:" },
       *sizes.product(orientations).map { |s, o| "#{s}:#{o}:" }]
    end

    it 'keeps the parent guard on every prefixed stretch rule' do
      unguarded = %w[stretch-x stretch-y].flat_map do |utility|
        child_gates.flat_map do |gate|
          rules = rules_for("#{gate}#{utility}")
          expect(rules).not_to be_empty, "#{gate}#{utility} has no rule at all"

          rules.grep_v(/(?:flex|layout)[^ ]*>/)
        end
      end

      expect(unguarded).to be_empty,
                           "prefixed stretch rules with no parent: #{unguarded.first(4).inspect}"
    end

    it 'never publishes a stretch modifier as a standalone class' do
      # The subject compound sits behind a `>` in every legitimate rule. Behind a
      # space or a comma it is a global utility, which stretch-x / stretch-y are
      # documented not to be.
      expect(css).not_to match(/[ ,]\.(?:#{gate_token}\\:)*stretch-[xy][{,]/)
    end

    it 'gives each parent context its own rule at every gate' do
      # Six contexts: plain .flex and .layout, plus row and col for each.
      %w[stretch-x stretch-y].each do |utility|
        %w[md: sm:portrait: landscape:].each do |gate|
          parents = rules_for("#{gate}#{utility}").map { |rule| rule[/[^ ]*(?:flex|layout)[^ ]*>/] }

          expect(parents.uniq.size).to eq(parents.size),
                                       "#{gate}#{utility} has two rules for the same parent: #{parents.inspect}"
          expect(parents.size).to be >= 6, "#{gate}#{utility} reaches only #{parents.inspect}"
        end
      end
    end
  end

  # A direction class is a guard: it decides which axis an alignment modifier
  # resolves on. Guards that test a bare class cannot see `md:flex--row`, so a
  # responsively switched direction fell through to the directionless table and
  # aligned on the wrong axis, and the reverse directions had no table at all.
  describe 'direction companions' do
    def companion_gates
      [*sizes.map { |s| "#{s}:" }, *orientations.map { |o| "#{o}:" },
       *sizes.product(orientations).map { |s, o| "#{s}:#{o}:" }]
    end

    # Every modifier a direction answers for. Spelled out rather than derived,
    # so a table that loses a key fails here instead of asserting less.
    def flex_modifiers
      %w[left start center-x right end top center-y bottom center] +
        %w[stretch stretch-x stretch-y] +
        %w[between around evenly] +
        %w[content-start content-center content-end content-between
           content-around content-evenly content-stretch]
    end

    def layout_modifiers
      %w[stretch-x stretch-y left right top bottom center-x center-y]
    end

    def missing_pairs(family, directions, modifiers)
      directions.flat_map do |direction|
        modifiers.flat_map do |modifier|
          companion = "#{family}--#{direction}"
          pairs = [[companion, "#{family}--#{modifier}"]]
          companion_gates.each do |gate|
            pairs << [companion, "#{gate}#{family}--#{modifier}"]
            pairs << ["#{gate}#{companion}", "#{family}--#{modifier}"]
            pairs << ["#{gate}#{companion}", "#{gate}#{family}--#{modifier}"]
          end
          pairs.reject { |pair| @companion_pairs.include?(pair) }.map { |pair| pair.join(' + ') }
        end
      end
    end

    it 'pairs every flex direction with every modifier at every gate' do
      missing = missing_pairs('flex', %w[row col row-reverse col-reverse], flex_modifiers)

      expect(missing).to be_empty,
                         "#{missing.size} direction pairs have no rule: #{missing.first(8).inspect}"
    end

    it 'pairs a column direction with its wrap companion at every gate' do
      # A column wraps into the height it is given, so a column paired with a
      # wrap class takes the full height of its parent. Written as a nested block
      # inside the direction's own variants, the pairing reached only the
      # combinations where exactly one of the two classes carried the gate:
      # `md:flex--col md:flex--wrap` had no height rule and stopped wrapping.
      missing = missing_pairs('flex', %w[col col-reverse], %w[wrap wrap-reverse])

      expect(missing).to be_empty,
                         "#{missing.size} column wrap pairs have no rule: #{missing.first(8).inspect}"
    end

    it 'pairs every layout direction with every override at every gate' do
      missing = missing_pairs('layout', %w[row col], layout_modifiers)

      expect(missing).to be_empty,
                         "#{missing.size} direction pairs have no rule: #{missing.first(8).inspect}"
    end

    it 'gives a reverse direction the same modifier set as the direction it reverses' do
      # A reverse container lays out on the same axis, so every modifier has to
      # resolve on that axis too. Anything the base direction answers for and the
      # reverse one does not falls back to the directionless table, on the wrong
      # axis, which is the defect this pairing exists to close.
      { 'row' => 'row-reverse', 'col' => 'col-reverse' }.each do |base, reverse|
        base_modifiers = @companion_pairs.filter_map do |left, right|
          right if left == "flex--#{base}"
        end
        reverse_modifiers = @companion_pairs.filter_map do |left, right|
          right if left == "flex--#{reverse}"
        end

        expect(reverse_modifiers).to match_array(base_modifiers)
      end
    end

    it 'keeps the directionless alignment guard weightless' do
      # The guard has to cost nothing, or the directionless reading outweighs
      # every gated direction and wins the axis it has no business deciding.
      # Bare :not() there is what put `.flex:not(.flex--row):not(.flex--col)`
      # two classes above `.md\:flex--row`.
      expect(css).to include('.flex:where(:not(.flex--row):not(.flex--col)')
      expect(css).not_to include('.flex:not(.flex--row)')
      expect(css).not_to include('.layout:not(.layout--row)')
    end
  end

  describe 'landscape default' do
    # Landscape has no class of its own and the picker never emits
    # .screen--landscape, so every gate must fall back to "not portrait".
    it 'gates compound landscape variants on :not(.screen--portrait)' do
      rules = rules_for('md:landscape:gap--large')

      expect(rules).not_to be_empty
      expect(rules).to all(include('.screen--md:not(.screen--portrait)'))
    end

    it 'never requires an explicit .screen--landscape alongside another screen class' do
      # Either order. Written as landscape-second only, the historical dead form
      # `.screen--landscape.screen--2bit` passed: the picker emits no
      # .screen--landscape, so every one of those gates matched nothing.
      dead = css.scan(/\.screen--(?:[a-z0-9-]+\.screen--landscape|landscape\.screen--[a-z0-9-]+)/).uniq

      expect(dead).to be_empty,
                      "gates anchored on a class the picker never emits: #{dead.first(8).inspect}"
    end

    it 'gates bare orientation variants on one weightless not-portrait guard' do
      # One scope, not two. The .screen--landscape alternative is gone because
      # the picker never emits it and a screen that carries it anyway still
      # matches: it is a .screen and it is not portrait. The guard rides
      # :where() so the gate weighs one class, exactly what .screen--portrait
      # weighs, which is what keeps the two-modifier gates above it.
      %w[landscape:gap--large landscape:col--span-3 landscape:hidden].each do |variant|
        rules = rules_for(variant)

        expect(rules).not_to be_empty
        expect(rules.join(' ')).to include('.screen:where(:not(.screen--portrait))')
        expect(rules.join(' ')).not_to include('.screen--landscape')
      end
    end

    it 'carries the fallback into parent-child variants' do
      rules = css.scan(/(?:\A|\})([^{}]*\.landscape\\:flex>\.stretch(?![\w-])[^{}]*)\{/).flatten

      expect(rules).not_to be_empty
      expect(rules.join(' ')).to include('.screen:where(:not(.screen--portrait))')
    end

    it 'anchors the orientation gate on a real class in bit-depth combinations' do
      rules = rules_for('landscape:2bit:hidden')

      expect(rules).not_to be_empty
      expect(rules).to all(include('.screen--2bit:not(.screen--portrait)'))
    end
  end
end
