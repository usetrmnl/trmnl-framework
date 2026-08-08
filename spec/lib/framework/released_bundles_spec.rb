# frozen_string_literal: true

require 'rails_helper'
require 'brotli'
require 'digest'
require 'uri'
require 'yaml'
require 'zlib'

# The build-free half of the release parity contract, checked on every rspec run: every
# released version must publish the bundles a pinned plugin links, each committed archive
# must carry its plaintext sibling's bytes, and public/{css,js}/latest must still be the
# copy of the released version's directory that ReleaseTask makes.
# bin/parity-check adds the half that needs a compile (a fresh build of the source against
# these same committed bytes) and runs in CI when the bundles move. See RELEASE.md.
RSpec.describe 'the committed release bundles' do
  root = Framework::Engine.root
  released_version = YAML.load_file(root.join('db/data/framework_versions.yml'))['latest']
  css_latest = root.join('public/css/latest')
  js_latest = root.join('public/js/latest')

  bundles = [
    css_latest.join('plugins.css'),
    css_latest.join('plugins.min.css'),
    js_latest.join('plugins.js'),
    js_latest.join('plugins.min.js')
  ] + Framework::Themes.ids.map { |id| css_latest.join('themes', "#{id}-theme.css") }

  # Blink stops registering a rule's selectors part way through a long comma list and drops the
  # rest without warning. It kept the 1,304th and dropped the 1,404th; 1,000 stays below that.
  # Gecko reads the whole list, so a bundle over this only loses selectors in one of the two.
  max_selectors_per_rule = 1_000

  def digest(path)
    Digest::SHA256.file(path.to_s).hexdigest
  end

  # How many selectors each rule that paints a bg-- field under a text-- fill carries. The rules
  # are found by their selectors rather than their declarations because the minified bundles
  # rename the custom properties.
  def composed_paint_selector_counts(css)
    css.enum_for(:scan, /[^{}]*bg--[^{}]*text--[^{}]*\{/).filter_map do
      list_end = Regexp.last_match.end(0) - 1
      list_start = [css.rindex('}', list_end), css.rindex('{', list_end - 1)].compact.max
      selectors = split_selectors(css[(list_start + 1)...list_end])

      selectors.count if selectors.any? { |selector| selector.include?('bg--') && selector.include?('text--') }
    end
  end

  # Splits on the commas between selectors, not the ones inside :is().
  def split_selectors(selector_list)
    depth = 0
    selectors = [+'']

    selector_list.each_char do |char|
      depth += 1 if char == '('
      depth -= 1 if char == ')'
      char == ',' && depth.zero? ? selectors << +'' : selectors.last << char
    end

    selectors
  end

  # Streamed so the 16 MB bundles never land in memory whole.
  def gzip_digest(path)
    sha = Digest::SHA256.new
    Zlib::GzipReader.open(path.to_s) do |archive|
      sha << archive.read(1 << 20) until archive.eof?
    end
    sha.hexdigest
  end

  def tree_digests(dir)
    Dir.glob(dir.join('**', '*')).select { |path| File.file?(path) }.to_h do |path|
      [Pathname.new(path).relative_path_from(dir).to_s, digest(path)]
    end
  end

  # Framework::Static answers these paths off disk, so a version that never published one
  # serves a 404 to every plugin pinned to it and renders them unstyled. Resolved through
  # Framework::Version rather than named here, so changing which file a pin links fails on
  # the releases that do not carry it.
  describe 'the bundles a pinned version links' do
    Framework::Version.version_numbers.each do |number|
      { css_url: 'stylesheet', js_url: 'runtime' }.each do |url_reader, bundle_name|
        it "publishes the #{bundle_name} for #{number}" do
          url = Framework::Version.new(number).public_send(url_reader)

          expect(root.join('public', URI.parse(url).path.delete_prefix('/'))).to exist
        end
      end
    end
  end

  # The .gz files are what most consumers actually download, so a bundle edited without
  # re-gzipping ships two different stylesheets under one release.
  describe 'the gzip archives' do
    bundles.each do |bundle|
      it "carries the bytes of #{bundle.relative_path_from(root)}" do
        expect(gzip_digest("#{bundle}.gz")).to eq(digest(bundle))
      end
    end
  end

  # The brotli siblings start with the 3.2.0 re-cut, and versions published before it are
  # frozen without them, so this checks the archives a release carries rather than demanding
  # them. What it catches is the same thing as above: a bundle edited without re-compressing.
  describe 'the brotli archives' do
    bundles.each do |bundle|
      it "carries the bytes of #{bundle.relative_path_from(root)}" do
        archive = Pathname("#{bundle}.br")
        skip "#{archive.relative_path_from(root)} is not published for this release" unless archive.exist?

        expect(Digest::SHA256.hexdigest(Brotli.inflate(archive.binread))).to eq(digest(bundle))
      end
    end
  end

  # This rule is what keeps a bg-- background alive under a text-- fill on the palettes that
  # paint with tiles, and it names every variant gate, so its selector list runs to thousands.
  # The ones past the limit match nothing, and the plain text-- rule wins on those elements
  # instead and overwrites the background. Splitting the list across rules is what keeps them
  # all reachable, so what has to hold is the count per rule, not where any one selector sits.
  describe 'the composed bg--/text-- paint rule' do
    Framework::Version.version_numbers.each do |number|
      %w[plugins.css plugins.min.css].each do |file_name|
        it "keeps every selector reachable in #{number}/#{file_name}" do
          counts = composed_paint_selector_counts(root.join('public/css', number, file_name).read)
          skip "#{number} was released before the rule existed" if counts.empty?

          expect(counts.max).to be <= max_selectors_per_rule
        end
      end
    end
  end

  # copy_to_latest_directories rebuilds latest/ from the released version's directory, so
  # the two trees are identical until someone edits one of them by hand.
  describe 'the latest directories' do
    it "mirror the released version (#{released_version})" do
      expect(tree_digests(css_latest)).to eq(tree_digests(root.join('public/css', released_version)))
      expect(tree_digests(js_latest)).to eq(tree_digests(root.join('public/js', released_version)))
    end
  end
end
