# frozen_string_literal: true

require 'rails_helper'
require 'brotli'
require 'digest'
require 'yaml'
require 'zlib'

# The build-free half of the release parity contract, checked on every rspec run: each
# committed archive must carry its plaintext sibling's bytes, and public/{css,js}/latest
# must still be the copy of the released version's directory that ReleaseTask makes.
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

  def digest(path)
    Digest::SHA256.file(path.to_s).hexdigest
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

  # copy_to_latest_directories rebuilds latest/ from the released version's directory, so
  # the two trees are identical until someone edits one of them by hand.
  describe 'the latest directories' do
    it "mirror the released version (#{released_version})" do
      expect(tree_digests(css_latest)).to eq(tree_digests(root.join('public/css', released_version)))
      expect(tree_digests(js_latest)).to eq(tree_digests(root.join('public/js', released_version)))
    end
  end
end
