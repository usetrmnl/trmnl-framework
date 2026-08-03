# frozen_string_literal: true

require 'rails_helper'
require 'fileutils'
require 'rack/mock'
require 'tmpdir'

# A release publishes .gz and .br next to every served bundle, and precompressed files never
# serve themselves: something has to map Accept-Encoding onto the sibling. Framework::Static
# does it itself so usetrmnl.com and every self-hoster get the small bytes without front-layer
# configuration. Serving them needs no compressor here, only the right file and header.
#
# The other half is tolerance: .br arrives with the 3.2.0 re-cut, and every version published
# before it is frozen without one, so nothing may assume the sibling is there.
RSpec.describe 'Precompressed asset serving' do
  # Stand-ins for the release's compressed output: the middleware moves bytes and never
  # decodes them, so what these say is only which file answered.
  let(:brotli_bytes) { "\x1b\x07\x00brotli".b }
  let(:gzip_bytes) { "\x1f\x8b\x08\x00gzip".b }

  # A released-looking version directory carrying whichever siblings the example wants.
  def with_release_root(*suffixes)
    Dir.mktmpdir do |dir|
      root = Pathname(dir)
      version_dir = root.join('public/css/9.9.9')
      FileUtils.mkdir_p(version_dir)
      version_dir.join('plugins.css').write('.trmnl{}')
      version_dir.join('plugins.css.br').binwrite(brotli_bytes) if suffixes.include?('.br')
      version_dir.join('plugins.css.gz').binwrite(gzip_bytes) if suffixes.include?('.gz')
      yield root
    end
  end

  def fetch(root, accept_encoding: nil, method: 'GET', path: '/css/9.9.9/plugins.css')
    env = { method: method }
    env['HTTP_ACCEPT_ENCODING'] = accept_encoding if accept_encoding
    static = Framework::Static.new(->(_env) { [404, {}, ['from the app']] }, root)
    status, headers, body = static.call(Rack::MockRequest.env_for(path, **env))
    served = +''
    body.each { |chunk| served << chunk }
    body.close if body.respond_to?(:close)
    [status, headers, served]
  end

  describe 'encoding negotiation' do
    it 'serves the brotli sibling to a client that accepts br' do
      with_release_root('.br', '.gz') do |root|
        status, headers, body = fetch(root, accept_encoding: 'gzip, deflate, br')

        aggregate_failures do
          expect(status).to eq(200)
          expect(body).to eq(brotli_bytes)
          expect(headers['content-encoding']).to eq('br')
          # The encoding changes, the resource does not: a browser that got
          # application/octet-stream here would download the bundle instead of applying it.
          expect(headers['content-type']).to eq('text/css')
        end
      end
    end

    it 'falls back to gzip when the client accepts no br' do
      with_release_root('.br', '.gz') do |root|
        status, headers, body = fetch(root, accept_encoding: 'gzip, deflate')

        aggregate_failures do
          expect(status).to eq(200)
          expect(body).to eq(gzip_bytes)
          expect(headers['content-encoding']).to eq('gzip')
        end
      end
    end

    it 'falls back to gzip when only that sibling was published' do
      with_release_root('.gz') do |root|
        _status, headers, body = fetch(root, accept_encoding: 'br, gzip')

        aggregate_failures do
          expect(body).to eq(gzip_bytes)
          expect(headers['content-encoding']).to eq('gzip')
        end
      end
    end

    it 'serves the plain file to a client that accepts neither' do
      with_release_root('.br', '.gz') do |root|
        status, headers, body = fetch(root, accept_encoding: 'identity')

        aggregate_failures do
          expect(status).to eq(200)
          expect(body).to eq('.trmnl{}')
          expect(headers).not_to have_key('content-encoding')
          expect(headers['content-type']).to eq('text/css')
        end
      end
    end

    # An encoding listed at q=0 is refused, not offered.
    it 'honours a refused encoding rather than reading the name alone' do
      with_release_root('.br', '.gz') do |root|
        _status, headers, body = fetch(root, accept_encoding: 'br;q=0, gzip')

        aggregate_failures do
          expect(body).to eq(gzip_bytes)
          expect(headers['content-encoding']).to eq('gzip')
        end
      end
    end

    # Every version published before 3.2.0 is frozen without siblings, and a request for one
    # must be a plain hit rather than a 404 for the file that is not there.
    it 'serves the plain file when the release published no siblings' do
      with_release_root do |root|
        status, headers, body = fetch(root, accept_encoding: 'gzip, deflate, br')

        aggregate_failures do
          expect(status).to eq(200)
          expect(body).to eq('.trmnl{}')
          expect(headers).not_to have_key('content-encoding')
        end
      end
    end

    it 'leaves a path with no file at all to the app' do
      with_release_root('.br') do |root|
        expect(fetch(root, accept_encoding: 'br', path: '/css/9.9.9/absent.css'))
          .to eq([404, {}, 'from the app'])
      end
    end
  end

  # Without Vary a shared cache hands whichever encoding it stored first to every later
  # client, so it goes on the negotiated responses whether or not a sibling answered.
  describe 'the Vary header' do
    it 'is set on the negotiated response' do
      with_release_root('.br') do |root|
        _status, headers, _body = fetch(root, accept_encoding: 'br')

        expect(headers['vary']).to eq('Accept-Encoding')
      end
    end

    it 'is set on the plain response for the same path' do
      with_release_root('.br') do |root|
        _status, headers, _body = fetch(root, accept_encoding: 'identity')

        expect(headers['vary']).to eq('Accept-Encoding')
      end
    end

    it 'is set even where the release published no siblings' do
      with_release_root do |root|
        _status, headers, _body = fetch(root, accept_encoding: 'br')

        expect(headers['vary']).to eq('Accept-Encoding')
      end
    end
  end

  # Framework::Static sits above Rack::Head, so what it answers a HEAD with is final: the
  # metadata has to describe the encoded bytes the matching GET would return.
  describe 'HEAD requests' do
    it 'answers with the sibling metadata and no body' do
      with_release_root('.br') do |root|
        status, headers, body = fetch(root, accept_encoding: 'br', method: 'HEAD')

        aggregate_failures do
          expect(status).to eq(200)
          expect(body).to be_empty
          expect(headers['content-encoding']).to eq('br')
          expect(headers['content-length']).to eq(brotli_bytes.bytesize.to_s)
        end
      end
    end
  end

  # Everything above runs the middleware against a temporary root with stand-in bytes, so it
  # would pass a release that shipped no .br at all. This is the other end: the artifacts the
  # re-cut committed, served through the middleware stack the engine installs, to a client
  # asking the way a browser asks.
  #
  # Framework::Static is what answers. The released files live in the gem's own public/ and
  # the host's Rails.public_path has no /css/<semver>/ tree, so ActionDispatch::Static cannot
  # reach them; the engine also unshifts Framework::Static ahead of it either way.
  describe 'the released bundles over HTTP', type: :request do
    released_version = Framework::Version.latest.number
    bundle = Framework.public_root.join('css', released_version, 'plugins.css')

    def get_bundle(version, accept_encoding)
      get "/css/#{version}/plugins.css", headers: { 'HTTP_ACCEPT_ENCODING' => accept_encoding }
    end

    it 'is reachable only through the engine, not the host public directory' do
      aggregate_failures do
        expect(bundle).to exist
        expect(Rails.public_path.join('css', released_version, 'plugins.css')).not_to exist
      end
    end

    it 'answers a browser Accept-Encoding with the published brotli bytes' do
      get_bundle(released_version, 'gzip, deflate, br, zstd')

      aggregate_failures do
        expect(response).to have_http_status(:ok)
        expect(response.headers['content-encoding']).to eq('br')
        expect(response.headers['vary']).to eq('Accept-Encoding')
        expect(response.headers['content-type']).to start_with('text/css')
        # The exact committed archive, not a stream compressed at request time.
        expect(response.body.b).to eq(Pathname("#{bundle}.br").binread)
        expect(Brotli.inflate(response.body.b)).to eq(bundle.binread)
      end
    end

    it 'answers a client that refuses encodings with the plain bundle' do
      get_bundle(released_version, 'identity')

      aggregate_failures do
        expect(response).to have_http_status(:ok)
        expect(response.headers).not_to have_key('content-encoding')
        expect(response.body.bytesize).to eq(bundle.size)
      end
    end
  end

  # The releases page prices every asset by whether its file is on disk, which is what makes
  # naming .br in the listing safe for the frozen versions that will never carry one.
  describe 'the releases listing', type: :request do
    # The oldest published version rather than a literal: it is frozen by definition, so it
    # keeps proving the tolerance after 3.2.0 starts shipping siblings of its own.
    let(:frozen_version) { Framework::Version.version_numbers.first }

    it 'names the brotli variants but prices the frozen ones as absent' do
      get '/framework/releases'
      entry = controller.send(:build_release_entry, frozen_version,
                              Framework.public_root.join('css'), Framework.public_root.join('js'))
      brotli = entry[:assets].select { |asset| asset[:name].end_with?('.br') }

      aggregate_failures do
        expect(brotli).not_to be_empty
        expect(brotli.map { |asset| asset[:exists] }).to all(be(false))
        expect(brotli.map { |asset| asset[:sha256] }).to all(be_nil)
      end
    end

    it 'links no brotli asset for a version that published none' do
      get '/framework/releases'

      aggregate_failures do
        expect(response).to have_http_status(:ok)
        expect(response.body).not_to include("/css/#{frozen_version}/plugins.css.br")
      end
    end
  end
end
