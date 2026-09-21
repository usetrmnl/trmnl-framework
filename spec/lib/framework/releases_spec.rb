# frozen_string_literal: true

require 'rails_helper'
require 'webmock/rspec'
require 'tmpdir'

RSpec.describe Framework::Releases do
  subject(:fetch) { described_class.fetch(into: mirror) }

  let(:mirror) { Pathname(Dir.mktmpdir) }
  let(:index) { %w[css/1.0.0/plugins.css css/1.0.0/plugins.css.gz] }

  before do
    WebMock.disable_net_connect!
    stub_request(:get, "#{described_class::DEFAULT_URL}/index.json").to_return(body: index.to_json)
    stub_request(:get, "#{described_class::DEFAULT_URL}/css/1.0.0/plugins.css.gz")
      .with(headers: { 'Accept-Encoding' => 'identity' })
      .to_return(body: 'gz-bytes', headers: { 'Content-Length' => length, 'Content-Encoding' => 'gzip' })
    mirror.join('css/1.0.0').mkpath
    mirror.join('css/1.0.0/plugins.css').write('already here')
  end

  after do
    FileUtils.rm_rf(mirror)
    WebMock.allow_net_connect!
  end

  context 'when the download is complete' do
    let(:length) { '8' }

    it 'downloads only the files the host lacks' do
      expect(fetch).to eq(%w[css/1.0.0/plugins.css.gz])
    end

    it 'stores the bytes as published, never an inflated copy' do
      fetch
      expect(mirror.join('css/1.0.0/plugins.css.gz').binread).to eq('gz-bytes')
    end
  end

  context 'when the body is shorter than announced' do
    let(:length) { '99' }

    it 'raises and leaves no partial file behind' do
      expect { fetch }.to raise_error(described_class::ShortDownload)
      expect(mirror.join('css/1.0.0')).to have_attributes(children: [mirror.join('css/1.0.0/plugins.css')])
    end
  end

  context 'when the host points the mirror at its own bucket' do
    let(:length) { '8' }

    before do
      allow(Rails.application.config.trmnl_framework).to receive(:releases_url).and_return('https://mirror.example')
      stub_request(:get, 'https://mirror.example/index.json').to_return(body: [].to_json)
    end

    it 'reads the index from there' do
      fetch
      expect(a_request(:get, 'https://mirror.example/index.json')).to have_been_made
    end
  end
end
