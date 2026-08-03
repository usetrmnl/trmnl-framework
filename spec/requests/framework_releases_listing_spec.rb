# frozen_string_literal: true

require 'rails_helper'

# What the releases page says each published file is. The names never change, but their
# meaning did at 3.2.0: before it a release published an unprocessed plugins.css and a
# separately minified plugins.min.css, and from it on plugins.css is the processed bundle
# with plugins.min.css a byte-identical copy. The listing has to describe the release it is
# showing rather than the newest convention, because every archive stays on the page forever.
#
# Versions come from the manifest rather than literals, so an archive that ages out of the
# newest minor keeps this honest instead of pinning it to a release that already shipped.
RSpec.describe 'the releases listing', type: :request do
  processed_version = Framework::Version.latest.number
  archive_version = Framework::Version.version_numbers
                                      .select { |number| Gem::Version.new(number) < FrameworkController::PROCESSED_BUNDLE_VERSION }
                                      .max_by { |number| Gem::Version.new(number) }

  # build_release_entry is private, and the page is what calls it; asking the controller that
  # just rendered keeps the entry and the HTML below reading the same disk state.
  def entry_for(version, **options)
    controller.send(:build_release_entry, version,
                    Framework.public_root.join('css'), Framework.public_root.join('js'), options)
  end

  def variants(entry)
    entry[:assets].to_h { |asset| [asset[:name], asset[:variant]] }
  end

  before { get '/framework/releases' }

  # Every release once again carries a real pair: a readable primary and a separate
  # minified build, so one labelling covers every version.
  describe 'the bundle labels' do
    it 'calls plugins.css the development build and plugins.min.css the minified one' do
      labels = variants(entry_for(processed_version))

      aggregate_failures do
        expect(labels['plugins.css']).to eq('Development')
        expect(labels['plugins.js']).to eq('Development')
        expect(labels['plugins.min.css']).to eq('Minified')
        expect(labels['plugins.min.css.gz']).to eq('Minified + Gzipped')
        expect(labels['plugins.min.css.br']).to eq('Minified + Brotli')
        expect(labels['plugins.min.js']).to eq('Minified')
      end
    end

    it 'labels the archived releases the same way' do
      labels = variants(entry_for(archive_version))

      aggregate_failures do
        expect(labels['plugins.css']).to eq('Development')
        expect(labels['plugins.min.css']).to eq('Minified')
        expect(labels['plugins.min.css.gz']).to eq('Minified + Gzipped')
      end
    end
  end

  # The brotli siblings arrived with the re-cut, and the listing prices every asset by whether
  # its file is on disk, so this is what proves the new ones reach the page at all.
  describe 'the brotli siblings' do
    it "prices every published .br for #{processed_version}" do
      brotli = entry_for(processed_version)[:assets].select { |asset| asset[:name].end_with?('.br') }

      aggregate_failures do
        expect(brotli).not_to be_empty
        expect(brotli.map { |asset| asset[:exists] }).to all(be(true))
        expect(brotli.map { |asset| asset[:size] }).to all(be_positive)
        expect(brotli.map { |asset| asset[:sha256] }).to all(be_present)
      end
    end

    it 'links them from the rendered page' do
      aggregate_failures do
        expect(response).to have_http_status(:ok)
        expect(response.body).to include("/css/#{processed_version}/plugins.css.br")
        expect(response.body).to include("/js/#{processed_version}/plugins.js.br")
      end
    end
  end
end
