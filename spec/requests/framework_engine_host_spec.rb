# frozen_string_literal: true

require 'rails_helper'
require 'fileutils'
require 'rack/mock'
require 'tmpdir'

# What a host has to provide to mount the engine and serve /framework, pinned from
# the outside in. It used to 500 any host that did not look like core: the docs chrome
# CSS the gem never shipped, and a Devise-shaped current_user the engine assumed. The
# gem ships the chrome now, and the visitor questions are gone rather than shimmed.
RSpec.describe 'Engine host contract' do
  # Same guard as spec/requests/framework_docs_spec.rb: the docs layout links the
  # compiled bundles from app/assets/builds, which is gitignored.
  before(:all) { FrameworkBuild.docs_assets! }

  describe 'docs chrome CSS' do
    it 'ships the packaged snapshot in the gem' do
      gemspec = Gem::Specification.load(Framework::Engine.root.join('trmnl-framework.gemspec').to_s)

      expect(gemspec.files).to include('app/assets/static/docs_chrome.css')
    end

    it 'serves the snapshot to a host that has no Tailwind build' do
      Dir.mktmpdir do |dir|
        root = Pathname(dir)
        FileUtils.mkdir_p(root.join('app/assets/static'))
        FileUtils.cp(Framework::Engine.root.join('app/assets/static/docs_chrome.css'),
                     root.join('app/assets/static/docs_chrome.css'))
        # An installed gem carries no server/ tree and no builds/ tree, so the
        # snapshot is the only candidate left.
        allow(Framework).to receive(:server_builds).and_return(root.join('server/app/assets/builds'))

        static = Framework::Static.new(->(_env) { [404, {}, []] }, root)
        status, headers, body = static.call(Rack::MockRequest.env_for('/framework-docs/tailwind.css'))
        body.close if body.respond_to?(:close)

        aggregate_failures do
          expect(status).to eq(200)
          expect(headers['content-type']).to eq('text/css')
        end
      end
    end

    it 'links a stylesheet the app actually serves', type: :request do
      get '/framework'
      href = response.body[/<link[^>]+href="([^"]*tailwind[^"]*)"/, 1]

      get href

      aggregate_failures do
        expect(href).to be_present
        expect(response).to have_http_status(:ok)
      end
    end

    # tailwind.css is the name every Rails app that runs Tailwind builds for itself, and
    # `asset_path` matches on the logical name across the host's whole load path, so the
    # host's bundle answered for the chrome. That bundle never had these views in its
    # @source list, so the docs lost every utility only they use: the nav sat on top of
    # the content with no pt-11, the sidebars had no sticky offset, and the tables came
    # out unstyled. This host builds a tailwind.css of its own, which is exactly the
    # shape that hid the bug.
    it 'links the engine copy rather than a host asset of the same name', type: :request do
      get '/framework'
      href = response.body[/<link[^>]+href="([^"]*tailwind[^"]*)"/, 1]

      get href

      aggregate_failures do
        expect(href).to start_with('/framework-docs/tailwind.css')
        expect(response.body).to include('.pt-11{')
      end
    end

    # Same collision, one stylesheet over: core carries its own prism_trmnl.css, and the
    # docs code samples were highlighted from it rather than from the theme this repo
    # ships next to them.
    it 'links the engine copy of the Prism theme', type: :request do
      get '/framework'
      href = response.body[/<link[^>]+href="([^"]*prism_trmnl[^"]*)"/, 1]

      get href

      aggregate_failures do
        expect(href).to start_with('/framework-docs/prism_trmnl.css')
        expect(response).to have_http_status(:ok)
      end
    end

    # The two vendored scripts collide by filename rather than by build: core vendors
    # prism-1.29.0.min.js and jquery-3.6.0.min.js under exactly these names, so whichever
    # copy the host's load path reached first is the one that highlighted the samples.
    %w[prism-1.29.0.min.js jquery-3.6.0.min.js].each do |script|
      it "links the engine copy of #{script}", type: :request do
        get '/framework'
        src = response.body[/<script[^>]+src="([^"]*#{Regexp.escape(script)}[^"]*)"/, 1]

        get src

        aggregate_failures do
          expect(src).to start_with("/framework-docs/#{script}")
          expect(response).to have_http_status(:ok)
        end
      end
    end
  end

  # The chrome above is only the half of the collision that shows up as a stylesheet. The
  # views and the JS modules collide the same way, and there the docs lost whole controls:
  # core carries its own shared/_fancy_screen_picker and its own fancy_screen_picker
  # controller, both predating the Style and Text Scale sections, and both answered for
  # the engine's because a host's app/views and a host's importmap are drawn last.
  describe 'docs chrome the host cannot shadow' do
    # Rails prepends every engine's app/views onto ActionController::Base in initializer
    # order, so the app's own views land in front. Prepending on the docs controller is
    # what puts the engine back ahead of them, and it gives the controller its own copy of
    # _view_paths, which is why a later prepend on the base no longer reaches it. Remove
    # that line and this decoy wins the lookup, exactly as core's fork does in production.
    it 'renders its own picker rather than a host partial of the same name', type: :request do
      Dir.mktmpdir do |dir|
        decoy = Pathname(dir)
        FileUtils.mkdir_p(decoy.join('shared'))
        decoy.join('shared/_fancy_screen_picker.html.erb').write('<p>host fork of the picker</p>')

        original = ActionController::Base._view_paths
        ActionController::Base.prepend_view_path(decoy.to_s)
        ActionView::LookupContext::DetailsKey.clear

        begin
          get '/framework'

          aggregate_failures do
            expect(response.body).not_to include('host fork of the picker')
            expect(response.body).to include('data-fancy-screen-picker-target="textScaleMenu"')
          end
        ensure
          ActionController::Base._view_paths = original
          ActionView::LookupContext::DetailsKey.clear
        end
      end
    end

    # The two controls the fork was missing, named the way the picker labels them.
    it 'reaches the page with the Style and Text Scale controls on it', type: :request do
      get '/framework/docs/3.2'

      aggregate_failures do
        expect(response.body).to include('>Style</span>')
        expect(response.body).to include('>Text Scale</span>')
        expect(response.body).to include('data-fancy-screen-picker-target="themeMenu"')
        expect(response.body).to include('data-fancy-screen-picker-target="textScaleMenu"')
      end
    end

    # `expand_directories_into` lets the later write win and a host draws its importmap
    # after the engine's, so every bare module name here was core's to claim: application,
    # controllers/*, lib/*, command_palette/*. The docs booted core's Stimulus controllers
    # against the engine's markup. Anything the docs load for themselves belongs under
    # framework_docs/; the exceptions below are the names that match core's on purpose.
    it 'pins its own JS under a namespace no host draws over', type: :request do
      shareable_modules = %w[plugin_legacy framework_iframe_bridge]
      shareable_prefixes = %w[framework_docs/ plugin-render/ @hotwired/ @trmnl/]

      get '/framework'
      map = JSON.parse(response.body[%r{<script type="importmap"[^>]*>(.*?)</script>}m, 1])

      collidable = map['imports'].keys.reject do |name|
        shareable_modules.include?(name) || shareable_prefixes.any? { |prefix| name.start_with?(prefix) }
      end

      expect(collidable).to be_empty,
                            "a host importmap can claim #{collidable.join(', ')}; pin under framework_docs/"
    end
  end

  # Same contract, one bundle over: every build path compiles plugins_legacy.css, the
  # release model publishes it nowhere, and Framework::Static's last candidate for it was
  # public/css/latest, where no version has ever written one. In an installed gem the
  # whole chain missed and /framework-docs/plugins_legacy.css fell through to the host.
  describe 'v1.2 bundle CSS' do
    it 'ships the packaged snapshot in the gem' do
      gemspec = Gem::Specification.load(Framework::Engine.root.join('trmnl-framework.gemspec').to_s)

      expect(gemspec.files).to include('app/assets/static/legacy_bundle.css')
    end

    it 'serves the snapshot to a host that has no Sass build' do
      Dir.mktmpdir do |dir|
        root = Pathname(dir)
        FileUtils.mkdir_p(root.join('app/assets/static'))
        FileUtils.cp(Framework::Engine.root.join('app/assets/static/legacy_bundle.css'),
                     root.join('app/assets/static/legacy_bundle.css'))
        # An installed gem carries no server/ tree and no builds/ tree, so the
        # snapshot is the only candidate left.
        allow(Framework).to receive(:server_builds).and_return(root.join('server/app/assets/builds'))

        static = Framework::Static.new(->(_env) { [404, {}, []] }, root)
        status, headers, body = static.call(Rack::MockRequest.env_for('/framework-docs/plugins_legacy.css'))
        body.close if body.respond_to?(:close)

        aggregate_failures do
          expect(status).to eq(200)
          expect(headers['content-type']).to eq('text/css')
        end
      end
    end

    # The live build still wins where there is one, so the docs server serves what it
    # just compiled and never the snapshot.
    it 'prefers the live build over the snapshot' do
      Dir.mktmpdir do |dir|
        root = Pathname(dir)
        FileUtils.mkdir_p(root.join('app/assets/static'))
        FileUtils.mkdir_p(root.join('builds'))
        root.join('app/assets/static/legacy_bundle.css').write('.snapshot{}')
        root.join('builds/plugins_legacy.css').write('.live{}')
        allow(Framework).to receive(:server_builds).and_return(root.join('builds'))

        static = Framework::Static.new(->(_env) { [404, {}, []] }, root)
        _status, _headers, body = static.call(Rack::MockRequest.env_for('/framework-docs/plugins_legacy.css'))
        served = +''
        body.each { |chunk| served << chunk }
        body.close if body.respond_to?(:close)

        expect(served).to eq('.live{}')
      end
    end
  end

  # Where a live build is allowed to come from. dartsass and Tailwind write to the host's
  # Rails.root, so Framework.server_builds is the only build target the engine has. Every
  # chain here used to carry the engine root's own app/assets/builds/ as a second
  # candidate, from the layout before the docs app moved under server/. After that move
  # nothing wrote there, and a checkout that still had the old output served a months-old
  # bundle in preference to the released one it should have fallen back to.
  describe 'live build resolution' do
    # A root that looks like the framework repo in exactly the wrong way: a populated
    # engine-root builds dir, no server build, and a released bundle to fall back to.
    def with_stale_engine_builds
      Dir.mktmpdir do |dir|
        root = Pathname(dir)
        FileUtils.mkdir_p(root.join('app/assets/builds/themes'))
        FileUtils.mkdir_p(root.join('app/assets/static'))
        FileUtils.mkdir_p(root.join('public/css/latest'))
        root.join('app/assets/builds/plugins.css').write('.stale{}')
        root.join('app/assets/builds/plugins_legacy.css').write('.stale{}')
        root.join('app/assets/builds/tailwind.css').write('.stale{}')
        root.join('app/assets/static/legacy_bundle.css').write('.snapshot{}')
        root.join('app/assets/static/docs_chrome.css').write('.snapshot{}')
        root.join('public/css/latest/plugins.css').write('.released{}')
        allow(Framework).to receive(:server_builds).and_return(root.join('server/app/assets/builds'))
        # Framework::Version resolves the engine root itself rather than taking one, so the
        # decoy is only in front of it while this stands in for the checkout.
        allow(Framework::Engine).to receive(:root).and_return(root)
        yield root
      end
    end

    {
      'plugins.css' => '.released{}',
      'plugins_legacy.css' => '.snapshot{}',
      'tailwind.css' => '.snapshot{}'
    }.each do |name, expected|
      it "resolves #{name} past a stale engine-root build" do
        with_stale_engine_builds do |root|
          resolved = Framework::Static::DOCS_FILES.fetch(name).call(root)

          expect(resolved&.read).to eq(expected)
        end
      end
    end

    it 'resolves /framework-dev/plugins.css to nothing rather than to a stale engine-root build' do
      with_stale_engine_builds do |root|
        resolved = Framework::Static::DEV_FILES.fetch('plugins.css').call(root)

        expect(resolved&.exist?).to be_falsey
      end
    end

    # Framework::Version stamps the mtime of whatever /framework-dev/ will serve onto the
    # URL, so it has to agree with DEV_FILES about which file that is.
    it 'stamps no live mtime when the only build left is the stale engine-root one' do
      with_stale_engine_builds do |_root|
        expect(Framework::Version.live_build_path('plugins.css')).to be_nil
      end
    end
  end

  # The docs chrome offers every page as Markdown at its own URL plus `.md`, and llms.txt
  # is advertised at the host root. Both are generated by `rake framework:generate_markdown`
  # into the framework's public/, so the engine has to serve them from there rather than
  # leaving them to whatever public dir the host happens to have.
  describe 'generated Markdown docs' do
    def static_get(root, path)
      static = Framework::Static.new(->(_env) { [404, {}, ['from the app']] }, root)
      status, _headers, body = static.call(Rack::MockRequest.env_for(path))
      contents = +''
      body.each { |chunk| contents << chunk }
      body.close if body.respond_to?(:close)
      [status, contents]
    end

    def with_generated_docs
      Dir.mktmpdir do |dir|
        root = Pathname(dir)
        version = FrameworkController::CURRENT_DOCS_VERSION
        FileUtils.mkdir_p(root.join('public/framework/docs', version))
        FileUtils.mkdir_p(root.join('public/framework/examples'))
        root.join('public/framework/docs', version, 'screen.md').write('# Screen')
        root.join('public/framework/examples/dashboard.md').write('# Dashboard')
        root.join('public/llms.txt').write('# TRMNL')
        root.join('public/llms-full.txt').write('# TRMNL full')
        yield root, version
      end
    end

    it 'serves the .md twin of a docs page' do
      with_generated_docs do |root, version|
        expect(static_get(root, "/framework/docs/#{version}/screen.md")).to eq([200, '# Screen'])
      end
    end

    it 'serves the .md twin of an example page' do
      with_generated_docs do |root, _version|
        expect(static_get(root, '/framework/examples/dashboard.md')).to eq([200, '# Dashboard'])
      end
    end

    it 'serves the llms indexes from the host root' do
      with_generated_docs do |root, _version|
        aggregate_failures do
          expect(static_get(root, '/llms.txt')).to eq([200, '# TRMNL'])
          expect(static_get(root, '/llms-full.txt')).to eq([200, '# TRMNL full'])
        end
      end
    end

    # The .md files sit under the docs routes, so a page URL must still reach the app.
    it 'leaves the docs page itself to the router' do
      with_generated_docs do |root, version|
        expect(static_get(root, "/framework/docs/#{version}/screen")).to eq([404, 'from the app'])
      end
    end
  end

  # Framework::Static sits above Rack::Head, Rack::ConditionalGet and Rack::ETag, so
  # whatever it answers is the final answer. It used to hand Rack::Files a forged GET
  # env for the /framework-docs and /framework-dev files, which threw away the request
  # method and every conditional header: HEAD came back with a full body, and a client
  # revalidating plugins.css re-downloaded all 17 MB. The real env goes through now.
  describe 'conditional and HEAD requests for the mapped files' do
    let(:path) { '/framework-docs/prism_trmnl.css' }
    let(:file) { Framework::Engine.root.join('app/assets/static/prism_trmnl.css') }

    describe 'through the host', type: :request do
      it 'answers HEAD with no body' do
        head path

        aggregate_failures do
          expect(response).to have_http_status(:ok)
          expect(response.headers['content-type']).to eq('text/css')
          expect(response.body).to be_empty
        end
      end

      it 'answers a revalidating client with 304 and no body' do
        get path
        last_modified = response.headers['last-modified']

        get path, headers: { 'HTTP_IF_MODIFIED_SINCE' => last_modified }

        aggregate_failures do
          expect(last_modified).to eq(file.mtime.httpdate)
          expect(response).to have_http_status(:not_modified)
          expect(response.body).to be_empty
        end
      end

      it 'answers a range request with just that range' do
        get path, headers: { 'HTTP_RANGE' => 'bytes=0-9' }

        aggregate_failures do
          expect(response).to have_http_status(:partial_content)
          expect(response.body).to eq(file.read(10))
          expect(response.headers['content-range']).to eq("bytes 0-9/#{file.size}")
        end
      end
    end

    # The integration harness rebuilds the response object and recomputes
    # content-length off the body it ends up with, so a HEAD that keeps the GET
    # content-length only shows at the middleware seam.
    it 'keeps the GET content-length on a HEAD' do
      static = Framework::Static.new(->(_env) { [404, {}, []] })
      _status, headers, body = static.call(Rack::MockRequest.env_for(path, method: 'HEAD'))
      served = +''
      body.each { |chunk| served << chunk }
      body.close if body.respond_to?(:close)

      aggregate_failures do
        expect(headers['content-length']).to eq(file.size.to_s)
        expect(served).to be_empty
      end
    end
  end

  # The docs are public and every page is byte-identical for everyone, so the engine
  # asks the host nothing about the visitor. It used to read current_user, current_user
  # .admin? and user_signed_in?, none of which this repo can answer, and the only view
  # that branched on them was a nav partial nothing rendered.
  describe 'no visitor contract' do
    it 'keys the page cache on the request, the gem version and the build alone', type: :request do
      get "/framework/docs/#{FrameworkController::CURRENT_DOCS_VERSION}/screen"

      expect(controller.send(:page_cache_key)).to eq(
        ['framework-page', Framework::VERSION, Rails.root.basename.to_s, 'http://www.example.com',
         "/framework/docs/#{FrameworkController::CURRENT_DOCS_VERSION}/screen", :en,
         Framework::Version.development_mode?]
      )
    end

    # The H21 contract, now met by asking nothing rather than by shimming an answer:
    # perform_caching defaults to true in production, and this host defines no auth at
    # all, so a page cache that consulted a visitor would raise here.
    it 'serves docs pages with page caching on and no host auth', type: :request do
      allow_any_instance_of(FrameworkController).to receive(:perform_caching).and_return(true)

      get "/framework/docs/#{FrameworkController::CURRENT_DOCS_VERSION}/screen"

      aggregate_failures do
        expect(response).to have_http_status(:ok)
        expect(ApplicationController.instance_methods(false)).to be_empty
      end
    end
  end

  # Mounting the engine makes the visitor's browser fetch from origins the host never
  # opted into, which a strict CSP blocks and a privacy review asks about. The engine
  # keeps them (self-hosting Highcharts is not possible and the picker is a published
  # package), so the contract is that every one of them is disclosed.
  describe 'third-party origins' do
    let(:root) { Framework::Engine.root }
    let(:integration_doc) { root.join('docs/ENGINE_INTEGRATION.md').read }
    let(:open_source_page) { root.join('app/views/framework/open_source.html.erb').read }
    let(:readme) { root.join('README.md').read }

    # The docs chrome: the layout, the Tailwind input compiled into the shipped
    # tailwind.css, the importmap, and the srcdoc every demo iframe is built from.
    let(:chrome_sources) do
      %w[
        app/views/layouts/framework.html.erb
        app/assets/tailwind/application.css
        config/importmap.rb
        app/javascript/framework_docs/controllers/framework_examples_controller.js
      ].map { |path| root.join(path).read }
    end

    # Only the three shapes that make the browser fetch: a link or script tag, a CSS
    # @import, and an importmap pin. An anchor or a URL in a comment is not a load.
    let(:subresource) do
      %r{
        <(?:link|script)\b[^>]*?(?:href|src)=["']https://([\w.-]+)
        | @import\s+(?:url\()?["']https://([\w.-]+)
        | \bto:\s*["']https://([\w.-]+)
      }x
    end

    let(:chrome_origins) { chrome_sources.flat_map { |source| source.scan(subresource) }.flatten.compact.uniq }

    it 'discloses every origin the docs chrome fetches from' do
      undisclosed = chrome_origins.reject do |origin|
        [integration_doc, open_source_page, readme].all? { |doc| doc.include?(origin) }
      end

      expect(undisclosed).to be_empty,
                             "disclose #{undisclosed.join(', ')} in ENGINE_INTEGRATION.md, the Open Source page and the README"
    end

    # Named rather than derived: the chart, map and font glyphs pages carry these script
    # tags both as live loads and inside code examples, sass_api.html.erb shows a
    # trmnl.com snippet it never fetches, and the map tile and glyph hosts are reached
    # by MapLibre from inside plugins.js, so scanning the view tree reads copy as loads.
    it 'discloses the demo origins as well' do
      aggregate_failures do
        %w[trmnl.com cdn.jsdelivr.net vector.openstreetmap.org tiles.versatiles.org].each do |origin|
          expect(integration_doc).to include(origin)
          expect(open_source_page).to include(origin)
        end
        %w[vector.openstreetmap.org tiles.versatiles.org].each do |origin|
          expect(readme).to include(origin)
        end
      end
    end

    it 'still loads them where the disclosure says it does' do
      aggregate_failures do
        expect(chrome_origins).to contain_exactly('fonts.googleapis.com', 'fonts.gstatic.com', 'unpkg.com')
        expect(root.join('app/views/framework/font_glyphs.html.erb').read).to include('cdn.jsdelivr.net')
        expect(root.join('app/views/framework/chart.html.erb').read).to include('https://trmnl.com/js/highcharts')
        expect(root.join('app/views/framework/map.html.erb').read).to include('https://trmnl.com/js/maplibre-gl')
        expect(root.join('app/javascript/plugin-render/plugins.js').read).to include('https://vector.openstreetmap.org/')
      end
    end
  end

  # config.trmnl_framework declared two options nothing read. Both are wired now, so a
  # host that sets either gets the effect the README promises.
  describe 'engine configuration' do
    describe 'parent_controller' do
      it 'defaults to the host ApplicationController' do
        aggregate_failures do
          expect(Framework.parent_controller).to eq('::ApplicationController')
          expect(Framework.parent_controller_class).to eq(ApplicationController)
        end
      end

      it 'resolves whatever the host configured' do
        allow(Rails.application.config.trmnl_framework).to receive(:parent_controller).and_return('ActionController::Base')

        expect(Framework.parent_controller_class).to eq(ActionController::Base)
      end

      it 'is what the engine controllers actually subclass' do
        aggregate_failures do
          expect(FrameworkController.superclass).to eq(Framework.parent_controller_class)
          expect(FrameworkTestsController.superclass).to eq(Framework.parent_controller_class)
        end
      end
    end

    describe 'docs_base_url' do
      it 'prefers the engine option' do
        allow(Rails.application.config.trmnl_framework).to receive(:docs_base_url).and_return('https://engine.example')

        expect(Framework.docs_base_url).to eq('https://engine.example')
      end

      it 'falls back to the host config.x key the docs server sets' do
        expect(Framework.docs_base_url).to eq(Rails.application.config.x.docs_base_url)
      end

      # The Releases page hands out CDN URLs to paste elsewhere, so those are absolute
      # and this is what roots them. In-page links are not: a heading anchor built from
      # this would jump off-host on any deployment that never set the env var.
      it 'is what the engine builds absolute asset URLs from', type: :request do
        allow(Rails.application.config.trmnl_framework).to receive(:docs_base_url).and_return('https://engine.example')

        get '/framework/releases'

        expect(response.body).to include('https://engine.example/css/')
      end
    end
  end

  # Runtime dependencies are what mounting the engine needs. Everything the release and
  # Markdown pipelines want is development-only and required lazily, so a host installs
  # neither a Tailwind binary nor the whole of Rails.
  describe 'runtime dependencies' do
    let(:gemspec) { Gem::Specification.load(Framework::Engine.root.join('trmnl-framework.gemspec').to_s) }
    let(:runtime_dependencies) { gemspec.dependencies.select { |dep| dep.type == :runtime }.map(&:name) }
    let(:build_only_gems) { %w[brotli cogger nokogiri reverse_markdown rubyzip tailwindcss-rails] }

    it 'does not force the build-only gems on a host' do
      expect(runtime_dependencies).not_to include(*build_only_gems)
    end

    it 'does not force the rails meta-gem on a host' do
      aggregate_failures do
        expect(runtime_dependencies).not_to include('rails')
        expect(runtime_dependencies).to include('actionpack', 'actionview', 'activesupport', 'railties')
      end
    end

    # The engine eager-loads app/ and lib/, so a top-level require of a build-only gem in
    # either tree is a LoadError at boot for every host, whatever the gemspec says. Requires
    # nested inside a method body are fine: those run only when the task that needs them does.
    it 'requires no build-only gem from an eager-loaded file' do
      root = Framework::Engine.root
      sources = Dir.glob(root.join('app/**/*.rb')) + Dir.glob(root.join('lib/framework/**/*.rb'))
      offenders = sources.filter_map do |path|
        required = File.readlines(path).grep(%r{\Arequire ['"]([\w\-/]+)['"]}) { Regexp.last_match(1) }
        gems = required & (build_only_gems + %w[zip])
        "#{Pathname(path).relative_path_from(root)}: #{gems.join(', ')}" if gems.any?
      end

      expect(offenders).to be_empty
    end

    # The other half of that rule: a rake task may load a build-only gem, but it has to
    # say so. `Nokogiri` was used with no require and no gemspec entry, and resolved only
    # because actionview installs nokogiri for its sanitizer. A host that ever loses that
    # transitive copy got a NameError from a task the integration docs tell it to run.
    it 'loads every gem the Markdown docs task uses' do
      source = Framework::Engine.root.join('lib/tasks/framework_docs.rake').read
      loader = source[/^def require_markdown_gems!$.*?^end$/m].to_s
      undeclared = { 'Nokogiri' => 'nokogiri', 'ReverseMarkdown' => 'reverse_markdown' }
                   .select { |constant, gem_name| source.include?(constant) && loader.exclude?(gem_name) }
                   .values

      expect(undeclared).to be_empty, "framework_docs.rake uses #{undeclared.join(' and ')} without loading it"
    end
  end

  # The compiler pin is a byte-parity guarantee about the artifacts committed in this
  # repo, and the gemspec deliberately gives hosts a wider range. That is a decision, not
  # a drift, so both files have to carry it or the next reader tightens the wrong one.
  describe 'the Sass compiler pin' do
    let(:root) { Framework::Engine.root }
    let(:gemfile) { root.join('Gemfile').read }
    let(:gemspec) { Gem::Specification.load(root.join('trmnl-framework.gemspec').to_s) }
    let(:pinned_version) { gemfile[/gem ["']sass-embedded["'], ["']([\d.]+)["']/, 1] }
    let(:gemspec_requirement) { gemspec.dependencies.find { |dep| dep.name == 'sass-embedded' }.requirement.to_s }

    it 'admits the exact version this repo builds its artifacts with' do
      expect(Gem::Requirement.new(gemspec_requirement)).to be_satisfied_by(Gem::Version.new(pinned_version))
    end
  end

  # The engine is deliberately not isolated, so every constant it defines lands at host
  # level. The generic ones are namespaced or prefixed, and the rest are documented.
  describe 'global constant surface' do
    let(:integration_doc) { Framework::Engine.root.join('docs/ENGINE_INTEGRATION.md').read }

    it 'keeps the menubar tokens under Framework' do
      expect(Framework::MenubarTheme.fetch(:framework).divider).to be_a(String)
    end

    it 'documents every helper it defines' do
      helpers = Dir.children(Framework::Engine.root.join('app/helpers')).map { |file| File.basename(file, '.rb').camelize }
      undocumented = helpers.reject { |helper| integration_doc.include?(helper) }

      expect(undocumented).to be_empty, "add #{undocumented.join(', ')} to the ENGINE_INTEGRATION.md constant surface list"
    end

    it 'documents every view root it adds' do
      roots = Dir.children(Framework::Engine.root.join('app/views'))
      undocumented = roots.reject { |root| integration_doc.include?(root) }

      expect(undocumented).to be_empty, "add #{undocumented.join(', ')} to the ENGINE_INTEGRATION.md constant surface list"
    end
  end

  # Rails included every engine helper ahead of the host's own, so core's ImagesHelper#sprite_icon
  # and PluginHelper#plugin_image_path were dead code under ours: production bug #4239.
  describe 'helpers the host does not get' do
    let(:engine_helpers) do
      Dir.children(Framework::Engine.root.join('app/helpers'))
         .map { |file| File.basename(file, '.rb').camelize.constantize }
    end

    it 'injects none of them into a host controller' do
      expect(ApplicationController._helpers.ancestors & engine_helpers).to be_empty
    end

    it 'opts every one of them in on the docs controller' do
      expect(FrameworkController._helpers.ancestors).to include(*engine_helpers)
    end

    it 'opts the test pages in on the helpers their views call' do
      expect(FrameworkTestsController._helpers.ancestors)
        .to include(FrameworkHelper, FrameworkDemoHelper, CoreCompatHelper)
    end

    context 'because the docs need the same-origin copy the gem vendors, not an asset host that 301s without CORS' do
      it 'keeps its own stand-ins ahead of a host helper of the same name' do
        ancestors = FrameworkController._helpers.ancestors

        expect(ancestors.index(CoreCompatHelper)).to be < ancestors.index(ApplicationController._helpers)
      end
    end
  end

  # The docs palette used to claim CommandPaletteHelper and a shared/_command_palette path
  # in every host; it renders from app/views/framework now, which no host of ours has.
  describe 'the names the docs palette gave back' do
    it 'defines no CommandPaletteHelper' do
      expect(Object.const_defined?(:CommandPaletteHelper)).to be(false)
    end

    it 'ships no shared/_command_palette for a host partial to share a digest with' do
      expect(Framework::Engine.root.join('app/views/shared/_command_palette.html.erb')).not_to exist
    end
  end
end
