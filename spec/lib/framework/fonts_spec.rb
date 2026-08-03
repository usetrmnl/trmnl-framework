# frozen_string_literal: true

require 'rails_helper'
require 'tmpdir'

RSpec.describe Framework::Fonts do
  subject(:fonts) { described_class }

  describe '.config' do
    it 'reads the fonts metadata data file' do
      expect(fonts.config).to include(:bundles, :shared)
    end

    it 'freezes the symbol-keyed configuration against mutation' do
      expect(fonts.config).to be_frozen
    end

    context 'when the fonts data file is missing' do
      after { fonts.reload! }

      it 'raises rather than returning empty configuration' do
        Dir.mktmpdir do |dir|
          allow(fonts).to receive(:data_path).and_return(Pathname.new(dir).join('framework_fonts.yml'))
          fonts.reload!
          expect { fonts.config }.to raise_error(Errno::ENOENT)
        end
      end
    end
  end

  describe '.bundles' do
    it 'exposes every font bundle keyed by id' do
      expect(fonts.bundles).to include(:classic, :trmnl)
    end
  end

  describe '.bundle_ids' do
    it 'lists the ids of every font bundle' do
      expect(fonts.bundle_ids).to contain_exactly(:classic, :trmnl)
    end
  end

  describe '.bundle' do
    it 'looks a bundle up by its id' do
      expect(fonts.bundle(:classic)).to include(label: 'Classic')
    end

    context 'with an unknown bundle id' do
      it 'raises an ArgumentError' do
        expect { fonts.bundle(:nope) }.to raise_error(ArgumentError, /unknown font bundle/)
      end
    end
  end

  describe '.shared' do
    it 'lists the fonts shared across every bundle' do
      expect(fonts.shared).to all(include(:family))
    end
  end

  describe '.all_files_for' do
    it 'flattens every font file in the requested bundle' do
      expect(fonts.all_files_for(:classic))
        .to contain_exactly('NicoPups-Regular.ttf', 'NicoClean-Regular.ttf', 'BlockKie.ttf')
    end
  end

  describe '.shared_files' do
    it 'flattens every shared font file' do
      expect(fonts.shared_files).to contain_exactly('Inter.ttf', 'Inter-Italic.ttf')
    end
  end

  describe '.bundle_zip_url' do
    it 'points at the downloadable bundle archive' do
      expect(fonts.bundle_zip_url(:classic)).to eq('/fonts/bundles/classic/trmnl-fonts-bundle--classic.zip')
    end
  end

  describe '.bundle_markdown_url' do
    it 'points at the bundle readme' do
      expect(fonts.bundle_markdown_url(:trmnl)).to eq('/fonts/bundles/trmnl/README.md')
    end
  end

  describe '.reload!' do
    it 'drops the memoized configuration so the next read re-parses the file' do
      original = fonts.config
      fonts.reload!
      expect(fonts.config).not_to be(original)
    end
  end
end
