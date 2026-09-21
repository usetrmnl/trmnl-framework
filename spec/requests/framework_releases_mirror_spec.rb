# frozen_string_literal: true

require 'rails_helper'
require 'rack/mock'
require 'tmpdir'

# A host mirrors released css/js it no longer has in the gem tree into Framework.releases_root
# (rake framework:releases:fetch). Framework::Static serves that tree behind the gem's own.
RSpec.describe 'Released assets served from the mirror' do
  let(:gem_root) { Pathname(Dir.mktmpdir) }
  let(:mirror) { Pathname(Dir.mktmpdir) }
  let(:static) { Framework::Static.new(->(_env) { [404, {}, ['from the app']] }, gem_root, mirror) }

  def write(root, relative, body)
    root.join('public', relative).tap { |file| file.dirname.mkpath }.write(body)
  end

  def fetch(path, env = {})
    status, headers, body = static.call(Rack::MockRequest.env_for(path, env))
    content = +''
    body.each { |chunk| content << chunk }
    body.close if body.respond_to?(:close)
    [status, headers, content]
  end

  before do
    write(gem_root, 'css/latest/plugins.css', '.gem{}')
    write(mirror, 'css/1.0.0/plugins.css', '.mirror{}')
    write(mirror, 'css/1.0.0/plugins.css.gz', 'gz')
  end

  after { FileUtils.rm_rf([gem_root, mirror]) }

  it 'serves a release only the mirror holds' do
    expect(fetch('/css/1.0.0/plugins.css')).to include(200, '.mirror{}')
  end

  it 'holds it forever like any released path' do
    expect(fetch('/css/1.0.0/plugins.css')[1]['cache-control']).to eq(Framework::Static::IMMUTABLE_CACHE_CONTROL)
  end

  it 'serves the precompressed sibling from the mirror too' do
    _status, headers, content = fetch('/css/1.0.0/plugins.css', 'HTTP_ACCEPT_ENCODING' => 'gzip')
    expect([headers['content-encoding'], content]).to eq(%w[gzip gz])
  end

  it 'lets the gem win when both trees have the file' do
    write(mirror, 'css/latest/plugins.css', '.mirror{}')
    expect(fetch('/css/latest/plugins.css')[2]).to eq('.gem{}')
  end

  it 'falls through to the app when neither tree has it' do
    expect(fetch('/css/2.0.0/plugins.css')).to include(404, 'from the app')
  end

  describe 'Framework.released_versions' do
    before { allow(Framework).to receive(:release_public_roots).and_return([gem_root.join('public'), mirror.join('public')]) }

    it 'lists semver directories from every tree, once each' do
      write(gem_root, 'css/1.0.0/plugins.css', '.gem{}')
      write(gem_root, 'css/2.0.0/plugins.css', '.gem{}')
      expect(Framework.released_versions('css')).to contain_exactly('1.0.0', '2.0.0')
    end
  end
end
