# frozen_string_literal: true

require 'rails_helper'

# Drift guards for the docs copy rules in .claude/skills/write-docs/SKILL.md and for the
# cross-references the current docs track makes.
#
# Copy drifts silently: nothing renders differently when a paragraph grows to five
# sentences, when a cross-reference points at a page that dropped the section it
# promises, or when a code sample stops matching the demo beside it. These read the
# source of the current-track pages and the helper that holds their intros, so the rules
# stay enforced without a reviewer re-reading every page.
RSpec.describe 'Framework docs copy style' do
  def self.read(relative_path)
    File.read(Framework::Engine.root.join(relative_path), encoding: 'UTF-8')
  end

  def self.page_sources
    Dir.glob(Framework::Engine.root.join('app/views/framework/*.html.erb')).to_h do |path|
      [File.basename(path), File.read(path, encoding: 'UTF-8')]
    end
  end

  # Sentence terminators, with the abbreviations, decimal versions and Sass ranges the
  # corpus uses masked out so they do not read as sentence ends.
  def self.sentence_count(text)
    text.gsub(/\b(?:e\.g|i\.e|etc|vs)\./i, 'x')
        .gsub(/(\d)\.(\d)/, '\1_\2')
        .gsub(/\.{2,}/, '_')
        .scan(/[.!?](?=\s|\z)/)
        .length
  end

  def self.paragraph_text(inner_html)
    inner_html.gsub(/<%=?-?.*?-?%>/m, '')
              .gsub(/<[^>]+>/m, '')
              .gsub(/&[a-z]+;/, ' ')
              .gsub(/\s+/, ' ')
              .strip
  end

  # Section copy lives in <p class="<%= framework_section_description_classes %>"> and the
  # subsection variant. Demo body text inside a .screen, notice boxes and table cells carry
  # their own classes and are not section copy.
  section_copy_attr = /framework_(?:sub)?section_description_classes/

  pages = page_sources
  helper_source = read('app/helpers/framework_helper.rb')

  over_limit_paragraphs = pages.flat_map do |name, source|
    source.enum_for(:scan, %r{<p\b([^>]*)>(.*?)</p>}m).filter_map do
      match = Regexp.last_match
      attrs, inner = match.captures
      next unless attrs.match?(section_copy_attr)

      count = sentence_count(paragraph_text(inner))
      "#{name}:#{source[0...match.begin(0)].count("\n") + 1} (#{count} sentences)" if count > 3
    end
  end

  # Em-dashes are banned in prose but serve as the "no value" placeholder in the generated
  # token tables, so review covers those. These four have no legitimate use anywhere in the
  # corpus: prose ranges read "N to M", code spans read "N..M", and quotes are ASCII.
  typographic = { '–' => 'en-dash', '‘' => 'curly quote', '’' => 'curly apostrophe',
                  '“' => 'curly quote', '”' => 'curly quote' }.freeze

  typographic_offenders = pages.merge('framework_helper.rb' => helper_source).flat_map do |name, source|
    source.each_line.with_index.flat_map do |line, index|
      typographic.filter_map { |glyph, label| "#{name}:#{index + 1} #{label}" if line.include?(glyph) }
    end
  end

  # Demo screens are published documentation. An address on a live domain is a scrape
  # target and mail to a real MX, and if the local part names a colleague it publishes
  # their work address on three pages. example.com is reserved for exactly this use
  # (RFC 2606), and the rest of the demo corpus already runs on invented data.
  live_domain_addresses = pages.flat_map do |name, source|
    source.each_line.with_index.flat_map do |line, index|
      line.scan(/[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/).flatten
          .grep_v(/\Aexample\.(?:com|net|org)\z/i)
          .map { |domain| "#{name}:#{index + 1} #{domain}" }
    end
  end

  describe 'paragraph shape' do
    it 'keeps every section paragraph to three sentences or fewer' do
      expect(over_limit_paragraphs).to be_empty
    end
  end

  describe 'punctuation' do
    it 'uses ASCII quotes and no en-dashes in docs pages and page intros' do
      expect(typographic_offenders).to be_empty
    end
  end

  describe 'demo data' do
    it 'writes email addresses on a reserved example domain' do
      expect(live_domain_addresses).to be_empty
    end
  end

  describe 'docs group descriptions', type: :helper do
    # The docs controller opts this module in; nothing mixes it into a bare view any more.
    before { helper.extend(FrameworkHelper) }

    it 'describes only groups a supported version actually renders' do
      rendered = FrameworkController::DOC_GROUPS_BY_VERSION.values.flat_map(&:keys).map(&:to_s).uniq
      described = FrameworkController::SUPPORTED_DOCS_VERSIONS.flat_map do |version|
        allow(helper).to receive(:current_docs_version).and_return(version)
        helper.framework_docs_group_descriptions.keys.map(&:to_s)
      end.uniq

      expect(described - rendered).to be_empty
    end
  end

  describe 'responsive support table' do
    responsive = read('app/views/framework/responsive.html.erb')
    rows = responsive.split('<tr>').drop(1)

    it 'marks Bit-Depth support as Yes on every row whose example uses a bit-depth prefix' do
      contradictions = rows.filter_map do |row|
        next unless row.match?(/(?:^|:)(?:1bit|2bit|4bit):/)

        component = row[/>\s*([A-Z][A-Za-z ]*?)\s*</, 1]
        "#{component} row shows the Auto pill" if row.include?('framework_docs_support_auto_classes')
      end

      expect(contradictions).to be_empty
    end

    it 'prints no deprecated numbered border level class' do
      expect(responsive).not_to match(/border--[hv]-[1-7]\b/)
    end
  end

  describe 'cross-references' do
    screen = read('app/views/framework/screen.html.erb')
    contributing = read('app/views/framework/contributing.html.erb')
    dev_script = read('bin/dev')

    it 'sends backdrop readers to a page that documents screen--backdrop' do
      paragraph = screen[%r{<p\b[^>]*>(?:(?!</p>).)*?screen--backdrop(?:(?!</p>).)*?</p>}m]
      target = paragraph[/DocsRef\.new\(page: :(\w+)\)/, 1]

      expect(target).to be_present
      expect(self.class.read("app/views/framework/#{target}.html.erb")).to include('screen--backdrop')
    end

    it 'names the builds directory the docs server actually reads' do
      # bin/dev holds the directory in a variable and appends each file to it, so this
      # matches the path itself rather than a path with a file behind it.
      builds_dir = dev_script[%r{(server/app/assets/builds)\b}, 1]

      expect(builds_dir).to eq('server/app/assets/builds')
      expect(contributing).to include("#{builds_dir}/")
    end
  end

  describe 'inverse page sample' do
    inverse = read('app/views/framework/inverse.html.erb')

    it 'shows the classes the adjacent demo renders' do
      demo_card = inverse[/<div class="(layout layout--col[^"]*\binverse\b[^"]*)">/, 1]
      demo_stack = inverse[/<div class="(flex flex--col flex--center[^"]*)">/, 1]
      sample = inverse.scan(/demo_code: '([^']*)'/m).flatten.find do |code|
        code.include?('layout--col') && code.include?('inverse')
      end

      expect(sample).to include(demo_card)
      expect(sample).to include(demo_stack)
      expect(sample).to include('divider w--full')
    end
  end
end
