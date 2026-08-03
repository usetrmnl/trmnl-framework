# frozen_string_literal: true

require 'rails_helper'
require 'zip'

# Drift guard for the asset-hosting contract documented on the Sass build page:
# fonts are the only asset the framework loads by root-relative URL, they ship in
# the font bundle zips rather than the release zip, the page tells a custom-stack
# host to serve them, and every dither tile stays inlined as a data URI so the
# bundle fetches no images at all.
RSpec.describe 'Framework asset hosting docs' do
  def self.read(relative_path)
    File.read(Framework::Engine.root.join(relative_path), encoding: 'UTF-8')
  end

  fonts_scss = read('app/assets/stylesheets/framework/config/_fonts.scss')
  tokens_scss = read('app/assets/stylesheets/framework/config/_tokens_colors_generated.scss')
  sass_build_page = read('app/views/framework/sass_build.html.erb')
  releases_page = read('app/views/framework/releases_index.html.erb')

  referenced_fonts = fonts_scss.scan(%r{url\('/fonts/([^']+)'\)}).flatten.uniq

  describe 'fonts' do
    it 'references every font by a root-relative /fonts URL' do
      expect(referenced_fonts.size).to eq(fonts_scss.scan('url(').size)
    end

    it 'ships every referenced font file under public/fonts' do
      missing = referenced_fonts.reject { |name| Framework::Engine.root.join('public/fonts', name).exist? }
      expect(missing).to be_empty
    end

    it 'covers every referenced font file with a font bundle' do
      bundled = Framework::Fonts.bundle_ids.flat_map { |id| Framework::Fonts.all_files_for(id) }
      expect(referenced_fonts - (bundled + Framework::Fonts.shared_files).uniq).to be_empty
    end

    it 'keeps fonts out of the framework release zip' do
      zip_path = Dir[Framework::Engine.root.join('public/framework/trmnl-framework--*.zip').to_s].min
      skip 'no published release zip in this checkout' if zip_path.nil?

      entries = Zip::File.open(zip_path) { |zip| zip.map(&:name) }
      expect(entries.grep(/\.(ttf|woff2?)\z/)).to be_empty
    end
  end

  describe 'palette tiles' do
    # Palette 7a's progress override was the last rule fetching a PNG. It now
    # paints through --framework-slot-progress-*, like every other palette, so
    # fonts are the only asset the stylesheet asks a host for.
    it 'reaches outside the stylesheet for fonts alone' do
      root = Framework::Engine.root.join('app/assets/stylesheets/framework')
      callers = Dir[root.join('**/*.scss').to_s].select do |path|
        File.read(path, encoding: 'UTF-8').include?('url(')
      end

      expect(callers.map { |path| File.basename(path) })
        .to contain_exactly('_fonts.scss', '_screen-mode-vars.scss')
    end

    it 'inlines every dither tile as a data URI' do
      registry = tokens_scss[/\$dither-tile-assets:\s*\((.*?)\n\);/m, 1]
      tiles = registry.to_s.scan(/:\s*"([^"]*)"/).flatten

      expect(tiles).not_to be_empty
      expect(tiles.reject { |uri| uri.start_with?('data:') }).to be_empty
    end
  end

  describe 'the Sass build page' do
    it 'states the root-relative font requirement' do
      expect(sass_build_page).to include('/fonts/')
    end

    it 'sends the reader to the font bundles on the releases page' do
      expect(sass_build_page).to include('framework_releases_index_path')
    end
  end

  describe 'the releases page' do
    it 'says the CSS loads fonts from /fonts' do
      expect(releases_page).to include('/fonts')
    end
  end
end
