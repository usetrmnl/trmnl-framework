# frozen_string_literal: true

require 'rails_helper'
require 'fileutils'
require 'rack/mock'
require 'tmpdir'

# Framework::Static is unshifted ahead of every Rails middleware, so it is the only thing
# that can price the release archive it serves. Rack::Files sets Last-Modified alone, and
# ActionDispatch::Static's public_file_server.headers never reach these files: without a
# Cache-Control here every page view revalidates the multi-MB bundle it links.
#
# The rule is the release contract. A path carrying a semver names one published release,
# which is never re-cut, so it is immutable. css/latest and the docs chrome move under a
# fixed URL and take the short window instead.
RSpec.describe 'Released asset cache headers' do
  def with_release_root
    Dir.mktmpdir do |dir|
      root = Pathname(dir)
      FileUtils.mkdir_p(root.join('public/css/9.9.9'))
      root.join('public/css/9.9.9/plugins.css').write('.trmnl{}')
      FileUtils.mkdir_p(root.join('public/css/latest'))
      root.join('public/css/latest/plugins.css').write('.trmnl{}')
      FileUtils.mkdir_p(root.join('public/fonts'))
      root.join('public/fonts/TRMNL12-Regular.ttf').write('font')
      yield root
    end
  end

  def cache_control(root, path)
    static = Framework::Static.new(->(_env) { [404, {}, ['from the app']] }, root)
    _status, headers, body = static.call(Rack::MockRequest.env_for(path))
    body.close if body.respond_to?(:close)
    headers['cache-control']
  end

  it 'holds a versioned release forever' do
    with_release_root do |root|
      expect(cache_control(root, '/css/9.9.9/plugins.css')).to eq('public, max-age=31536000, immutable')
    end
  end

  it 'revalidates the rolling latest copy' do
    with_release_root do |root|
      expect(cache_control(root, '/css/latest/plugins.css')).to eq('public, max-age=3600')
    end
  end

  it 'revalidates the files that ship under a fixed name' do
    with_release_root do |root|
      expect(cache_control(root, '/fonts/TRMNL12-Regular.ttf')).to eq('public, max-age=3600')
    end
  end

  # A host in development mode rebuilds this file under a URL that never moves, so an
  # hour of browser cache would hide the rebuild it exists to show.
  it 'revalidates the development live build on every request' do
    expect(Framework::Static.new(nil).send(:cache_control_for, '/framework-dev/plugins.css')).to eq('no-cache')
  end

  describe 'over HTTP', type: :request do
    released_version = Framework::Version.latest.number

    it "prices the published #{released_version} bundle as immutable" do
      get "/css/#{released_version}/plugins.css"

      aggregate_failures do
        expect(response).to have_http_status(:ok)
        expect(response.headers['cache-control']).to eq('public, max-age=31536000, immutable')
      end
    end

    it 'prices the docs chrome for revalidation' do
      get '/framework-docs/tailwind.css'

      aggregate_failures do
        expect(response).to have_http_status(:ok)
        expect(response.headers['cache-control']).to eq('public, max-age=3600')
      end
    end
  end
end
