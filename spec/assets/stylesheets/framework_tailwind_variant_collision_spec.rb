# frozen_string_literal: true

require 'rails_helper'

# The docs pages link both bundles, and the two read the same class name off the
# same element.
#
# A demo writes `portrait:hidden` to teach a framework variant. The framework
# gates it on the simulated screen (`.trmnl .screen--portrait .portrait\:hidden`).
# Tailwind's scanner reads the same string out of the view, sees a real variant
# chain in front of a real utility, and publishes `@media (orientation: portrait)
# .portrait\:hidden { display: none }` keyed off the visitor's browser window. Both
# rules land on the demo element, so it disappeared whenever the window happened to
# be portrait or wide enough, whatever screen the device picker was showing.
#
# `@source not inline(...)` in app/assets/tailwind/application.css keeps those
# candidates out of the tailwind bundle. This suite reads the compiled bundles
# because a blocked candidate leaves no trace anywhere else, and because the whole
# failure mode is a scanner picking up a class nobody declared.
RSpec.describe 'Docs Tailwind variant collisions' do
  subject(:tailwind) { FrameworkBuild.tailwind_css }

  def framework = FrameworkBuild.plugins_css

  # Variant tokens both systems spell the same way. sm/md/lg are framework screen
  # sizes and Tailwind breakpoints; portrait/landscape are framework orientations
  # and Tailwind orientation media queries; dark is a screen mode here and a
  # `.dark` ancestor there. Bit depths (`2bit:`) are framework-only, so Tailwind
  # discards those chains and they cannot collide.
  def gate_token = /(?:sm|md|lg|portrait|landscape|dark)/

  # A class-name character in a compiled selector: an escape pair, or a bare
  # character a class name may carry. A lone `:` ends the name and starts a
  # pseudo-class, which is what separates `.dark\:hidden` from its `:where(...)`.
  def name_char = %r{(?:\\.|[a-zA-Z0-9_%/.-])}

  # Every class a bundle publishes behind one or more shared gates, as authored:
  # `.md\:portrait\:hidden` reads back as `md:portrait:hidden`.
  def variant_classes(css)
    css.scan(/\.((?:#{gate_token}\\:)+#{name_char}+)/).flatten
       .map { |name| name.gsub('\\:', ':').gsub(/\\(.)/) { Regexp.last_match(1) } }
       .uniq
  end

  # Class names the docs chrome writes as genuine Tailwind utilities, on elements
  # that never sit inside a `.trmnl` screen. The framework publishes the same
  # names, so blocking them would take the nav's mobile menu, the sidebar rails,
  # the menubar, the release cards and every light/dark asset swap with them.
  #
  # Every demo that uses one of these also carries a base framework display class,
  # which outweighs Tailwind's single-class rule, so none of them is broken today.
  # Shrink this list by moving a chrome call site onto a class the framework does
  # not publish; never grow it to make a failure pass.
  def chrome_owned
    %w[
      dark:block dark:hidden
      lg:block lg:flex lg:hidden lg:inline-flex
      md:flex md:flex-none md:hidden
      sm:inline sm:inline-flex
    ]
  end

  it 'publishes no framework variant class the docs chrome does not own' do
    collisions = variant_classes(tailwind) & variant_classes(framework)

    expect(collisions - chrome_owned).to be_empty,
                                         "tailwind re-declares these framework variant classes: #{(collisions - chrome_owned).sort.inspect}"
  end

  it 'keeps the blocked spellings out of the bundle the app serves' do
    # The regression the blocklist exists for, named one class at a time so a
    # failure says which candidate came back rather than how many did.
    %w[
      sm:hidden sm:flex sm:inline-block
      md:block md:grid md:visible
      lg:grid lg:table lg:visible lg:inline-grid
      portrait:hidden portrait:grid md:portrait:hidden
    ].each do |klass|
      expect(published?(klass)).to be(false), "#{klass} is back in the tailwind bundle"
    end
  end

  it 'never keys a rule off the browser window orientation' do
    # Orientation is a device property in this app: the picker sets
    # `.screen--portrait` and the framework gates on that class. A real
    # `@media (orientation: ...)` block in the docs bundle can only have come
    # from a framework class the scanner mistook for a Tailwind chain.
    expect(tailwind.scan(/@media[^{]*orientation[^{]*/).uniq).to be_empty
  end

  it 'leaves the utilities the docs chrome and demo tables use alone' do
    # The blocklist names whole class strings, so the `md:grid` entry must not
    # take `md:grid-cols-2` with it. opacity-20 stands in for the plain utilities
    # the reference tables are built from.
    %w[
      opacity-20 sm:text-sm md:px-8 lg:flex-row
      xs:grid-cols-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3
    ].each do |klass|
      expect(published?(klass)).to be(true), "#{klass} no longer reaches the docs pages"
    end

    chrome_owned.each do |klass|
      expect(published?(klass)).to be(true), "#{klass} no longer reaches the docs chrome"
    end
  end

  # Whether the bundle declares this exact class. Asked as a boolean rather than a
  # `match` on the bundle itself: a failed match prints the subject, and the subject
  # here is a quarter of a megabyte of minified CSS.
  #
  # Colons are escaped as the compiled selector spells them, and the trailing guard
  # keeps `.md\:grid` from answering for `.md\:grid-cols-2`.
  def published?(klass)
    tailwind.match?(/\.#{Regexp.escape(klass.gsub(':') { '\\:' })}(?![\w-])/)
  end
end
