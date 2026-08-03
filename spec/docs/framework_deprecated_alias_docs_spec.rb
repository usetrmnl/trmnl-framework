# frozen_string_literal: true

require 'rails_helper'

# Drift guard for the deprecation contract on the `font--` prefix.
#
# Every class under the prefix is an alias of a `text--` class and leaves at 4.0.
# A deprecation a reader cannot find is not a deprecation, so each alias has to
# be named on a docs page, next to its successor and next to the release that
# removes it. The prefix spent two releases half deprecated (the ten sizes were
# noticed, the two weights were not and had no successor at all), which is the
# state this guards against returning to.
RSpec.describe 'Framework deprecated alias docs' do
  def self.read(relative_path)
    File.read(Framework::Engine.root.join(relative_path), encoding: 'UTF-8')
  end

  font_scss = read('app/assets/stylesheets/framework/utilities/_font.scss')
  pages = {
    'app/views/framework/text_size.html.erb' => read('app/views/framework/text_size.html.erb'),
    'app/views/framework/font_weight.html.erb' => read('app/views/framework/font_weight.html.erb')
  }

  # deprecated alias => [canonical successor, the page that notices it].
  # Spelled out rather than derived, so an entry that goes missing fails here
  # instead of asserting less. The example below keeps the list honest against
  # the stylesheet.
  deprecated_aliases = {
    'font--small' => ['text--small', 'app/views/framework/text_size.html.erb'],
    'font--base' => ['text--base', 'app/views/framework/text_size.html.erb'],
    'font--large' => ['text--large', 'app/views/framework/text_size.html.erb'],
    'font--xlarge' => ['text--xlarge', 'app/views/framework/text_size.html.erb'],
    'font--xxlarge' => ['text--xxlarge', 'app/views/framework/text_size.html.erb'],
    'font--xxxlarge' => ['text--xxxlarge', 'app/views/framework/text_size.html.erb'],
    'font--mega' => ['text--mega', 'app/views/framework/text_size.html.erb'],
    'font--giga' => ['text--giga', 'app/views/framework/text_size.html.erb'],
    'font--tera' => ['text--tera', 'app/views/framework/text_size.html.erb'],
    'font--peta' => ['text--peta', 'app/views/framework/text_size.html.erb'],
    'font--regular' => ['text--regular', 'app/views/framework/font_weight.html.erb'],
    'font--bold' => ['text--bold', 'app/views/framework/font_weight.html.erb']
  }.freeze

  removal_notice = 'removed in Framework 4.0'

  # A page names a class when it prints the whole name, in prose or in the table
  # data an ERB loop renders. The guards keep `text--xlarge` from answering for
  # `text--xxlarge`.
  def names?(page_source, class_name)
    page_source.match?(/(?<![\w-])#{Regexp.escape(class_name)}(?![\w-])/)
  end

  it 'lists every font-- class the stylesheet emits' do
    emitted = font_scss.scan(/^\s*\.(font--[a-z0-9-]+)\s*\{/).flatten.sort

    expect(emitted).to eq(deprecated_aliases.keys.sort)
  end

  it 'gives every alias a canonical text-- class in the same stylesheet' do
    emitted = font_scss.scan(/^\s*\.(text--[a-z0-9-]+)\s*\{/).flatten

    expect(deprecated_aliases.values.map(&:first) - emitted).to be_empty
  end

  it 'names every alias on a docs page' do
    unnamed = deprecated_aliases.reject do |name, (_canonical, page)|
      names?(pages.fetch(page), name)
    end

    expect(unnamed.keys).to be_empty, "aliases with no docs mention: #{unnamed.keys.inspect}"
  end

  it 'names the successor alongside the alias' do
    unpaired = deprecated_aliases.reject do |_name, (canonical, page)|
      names?(pages.fetch(page), canonical)
    end

    expect(unpaired.keys).to be_empty, "aliases whose page never names the successor: #{unpaired.keys.inspect}"
  end

  it 'states the removal release on every page that notices an alias' do
    silent = deprecated_aliases.values.map(&:last).uniq.reject do |page|
      pages.fetch(page).include?(removal_notice)
    end

    expect(silent).to be_empty, "pages deprecating a class without naming 4.0: #{silent.inspect}"
  end

  it 'teaches the canonical spelling in the weight page tables and demos' do
    # The page taught `font--bold` in every table, demo, and snippet while it
    # was the only non-deprecated class under a prefix the neighbouring page
    # called deprecated.
    weight_page = pages.fetch('app/views/framework/font_weight.html.erb')

    expect(weight_page).to include('md:text--bold').and include('4bit:text--bold')
    expect(weight_page.scan(/class="[^"]*text--bold/)).not_to be_empty
  end
end
