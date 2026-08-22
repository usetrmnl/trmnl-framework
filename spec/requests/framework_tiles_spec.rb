# frozen_string_literal: true

require 'rails_helper'

# /framework/tiles/{z}/{x}/{y}.mvt is the tile endpoint TRMNLMaps resolves from the page's own
# origin. The upstream is stubbed: the contract here is the headers and statuses a map client and
# a CDN see, and the range and template rules around the fetch.
RSpec.describe 'Framework tiles endpoint', type: :request do
  let(:tile) { Framework::Tiles::Result.new(status: 200, body: 'MVT', content_encoding: 'gzip', etag: '"abc"') }

  before { allow(Framework::Tiles).to receive(:fetch).and_return(tile) }

  it 'hands a tile on with the vector tile type, the upstream encoding, a public cache and an open origin' do
    get '/framework/tiles/13/4092/2723.mvt'

    aggregate_failures do
      expect(response).to have_http_status(:ok)
      expect(response.body).to eq('MVT')
      expect(response.content_type).to eq(Framework::Tiles::CONTENT_TYPE)
      expect(response.headers['Content-Encoding']).to eq('gzip')
      expect(response.headers['Cache-Control']).to include('public').and include('max-age=86400')
      expect(response.headers['Access-Control-Allow-Origin']).to eq('*')
      expect(response.headers['ETag']).to eq('"abc"')
      expect(Framework::Tiles).to have_received(:fetch).with(13, 4092, 2723, if_none_match: nil)
    end
  end

  it 'forwards the client validator and keeps its copy on 304' do
    allow(Framework::Tiles).to receive(:fetch).and_return(Framework::Tiles::Result.new(status: 304, body: '', content_encoding: nil, etag: '"abc"'))

    get '/framework/tiles/13/4092/2723.mvt', headers: { 'If-None-Match' => '"abc"' }

    aggregate_failures do
      expect(response).to have_http_status(:not_modified)
      expect(Framework::Tiles).to have_received(:fetch).with(13, 4092, 2723, if_none_match: '"abc"')
    end
  end

  it 'turns an empty or missing upstream tile into 204, which a map client draws as nothing' do
    allow(Framework::Tiles).to receive(:fetch).and_return(Framework::Tiles::Result.new(status: 404, body: '', content_encoding: nil, etag: nil))

    get '/framework/tiles/13/4092/2723.mvt'

    aggregate_failures do
      expect(response).to have_http_status(:no_content)
      expect(response.headers['Cache-Control']).to include('public').and include('max-age=86400')
    end
  end

  it 'answers 502 without caching when the upstream fails, and 504 when it does not answer' do
    allow(Framework::Tiles).to receive(:fetch).and_return(Framework::Tiles::Result.new(status: 500, body: '', content_encoding: nil, etag: nil))
    get '/framework/tiles/13/4092/2723.mvt'
    expect(response).to have_http_status(:bad_gateway)
    expect(response.headers['Cache-Control']).to eq('no-store')

    allow(Framework::Tiles).to receive(:fetch).and_raise(Net::OpenTimeout)
    get '/framework/tiles/13/4092/2723.mvt'
    expect(response).to have_http_status(:gateway_timeout)
    expect(response.headers['Access-Control-Allow-Origin']).to eq('*')
  end

  it 'refuses tiles outside the zoom and extent without touching the upstream' do
    get '/framework/tiles/15/0/0.mvt'
    expect(response).to have_http_status(:not_found)
    get '/framework/tiles/3/8/0.mvt'
    expect(response).to have_http_status(:not_found)
    expect(Framework::Tiles).not_to have_received(:fetch)
  end

  it 'routes only the .mvt shape' do
    get '/framework/tiles/13/4092/2723.png'
    expect(response).to have_http_status(:not_found)
    expect(Framework::Tiles).not_to have_received(:fetch)
  end

  describe 'the source template' do
    around do |example|
      previous = Rails.application.config.trmnl_framework.tile_source_url
      example.run
    ensure
      Rails.application.config.trmnl_framework.tile_source_url = previous
    end

    it 'defaults to the OSMF Shortbread endpoint and substitutes the tile address' do
      Rails.application.config.trmnl_framework.tile_source_url = nil
      expect(Framework.tile_source_url).to eq(Framework::DEFAULT_TILE_SOURCE_URL)
      expect(Framework::Tiles.source_url_for(13, 4092, 2723)).to eq('https://vector.openstreetmap.org/shortbread_v1/13/4092/2723.mvt')
    end

    it 'prefers the host configuration, then the environment' do
      Rails.application.config.trmnl_framework.tile_source_url = 'https://tiles.example.com/{z}/{x}/{y}.pbf'
      expect(Framework::Tiles.source_url_for(1, 2, 3)).to eq('https://tiles.example.com/1/2/3.pbf')

      Rails.application.config.trmnl_framework.tile_source_url = nil
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('TRMNL_FRAMEWORK_TILE_SOURCE_URL').and_return('https://env.example.com/{z}/{x}/{y}.mvt')
      expect(Framework::Tiles.source_url_for(1, 2, 3)).to eq('https://env.example.com/1/2/3.mvt')
    end

    it 'names itself to the upstream' do
      expect(Framework.tile_source_user_agent).to include('TRMNL Framework')
    end
  end
end
