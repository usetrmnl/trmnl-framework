# frozen_string_literal: true

require 'rails_helper'
require 'tmpdir'

RSpec.describe Framework::Version do
  subject(:version) { described_class.new(number) }

  # A stable, long-released version so the specs stay valid as new releases are appended.
  let(:number) { '1.0.0' }

  describe '.config' do
    it 'reads the framework versions data file' do
      expect(described_class.config).to include('latest', 'versions')
    end

    context 'when the versions data file is missing' do
      it 'raises rather than returning empty configuration' do
        Dir.mktmpdir do |dir|
          allow(described_class).to receive(:config_path).and_return(Pathname.new(dir).join('missing.yml'))
          expect { described_class.config }.to raise_error(Errno::ENOENT)
        end
      end
    end
  end

  describe '.version_numbers' do
    it 'lists every released version as a semantic-version string' do
      expect(described_class.version_numbers).to all(match(/\A\d+\.\d+\.\d+\z/))
    end
  end

  describe '.latest' do
    it 'resolves to the number pinned as latest in the data file' do
      expect(described_class.latest.number).to eq(described_class.config['latest'])
    end
  end

  describe '.options' do
    it 'offers latest-tracking as the first select option' do
      expect(described_class.options.first)
        .to eq("Always track latest (currently v#{described_class.latest.number})" => 'latest')
    end
  end

  describe '#initialize' do
    context 'with a known version number' do
      it 'pins to that version' do
        expect(version).to be_pinned
      end
    end

    context "with 'latest'" do
      let(:number) { 'latest' }

      it 'does not pin the version' do
        expect(version).not_to be_pinned
      end

      it 'resolves to the latest released number' do
        expect(version.number).to eq(described_class.latest.number)
      end
    end

    context 'with an unknown version number' do
      let(:number) { '99.99.99' }

      it 'raises an ArgumentError' do
        expect { version }.to raise_error(ArgumentError, /unknown Framework version/)
      end
    end
  end

  shared_examples 'a bundle url' do |extension|
    context 'with a version that published a minified build' do
      let(:number) { '3.1.8' }

      it 'links the minified bundle' do
        expect(url).to end_with("/#{extension}/#{number}/plugins.min.#{extension}")
      end
    end

    context 'with a version released before minification' do
      let(:number) { '1.0.0' }

      it 'links the plain bundle' do
        expect(url).to end_with("/#{extension}/#{number}/plugins.#{extension}")
      end
    end

    context 'when serving the live build' do
      let(:number) { '3.1.8' }

      before { allow(described_class).to receive(:development_mode?).and_return(true) }

      it 'links the live build instead of a release' do
        expect(url).to start_with("/framework-dev/plugins.#{extension}")
      end
    end
  end

  describe '#css_url' do
    let(:url) { version.css_url }

    it_behaves_like 'a bundle url', 'css'
  end

  describe '#js_url' do
    let(:url) { version.js_url }

    it_behaves_like 'a bundle url', 'js'
  end

  describe '#theme_css_urls' do
    context 'with a version that publishes themes' do
      let(:number) { '3.2.0' }

      it 'points at every published theme stylesheet' do
        expect(version.theme_css_urls.keys).to eq(Framework::Themes.ids)
      end

      it 'scopes each url to the version' do
        expect(version.theme_css_urls['dark']).to end_with("/css/#{number}/themes/dark-theme.css")
      end
    end

    context 'with a version released before themes shipped' do
      let(:number) { '3.1.8' }

      it 'publishes none' do
        expect(version.theme_css_urls).to eq({})
      end
    end
  end

  describe '#<=>' do
    it 'orders versions by semantic precedence' do
      expect(described_class.new('1.0.0')).to be < described_class.new('2.0.0')
    end

    context 'against a non-version object' do
      it 'is not comparable' do
        expect(described_class.new('1.0.0') <=> '1.0.0').to be_nil
      end
    end
  end

  describe '#==' do
    it 'equals another version with the same number' do
      expect(described_class.new('1.0.0')).to eq(described_class.new('1.0.0'))
    end

    it 'does not equal a bare string of the same number' do
      expect(described_class.new('1.0.0')).not_to eq('1.0.0')
    end
  end

  describe '#as_json' do
    it 'serializes to its version number' do
      expect(version.as_json).to eq('1.0.0')
    end
  end

  describe '#major' do
    let(:number) { '2.1.0' }

    it 'exposes the major segment as an integer' do
      expect(version.major).to eq(2)
    end
  end
end
