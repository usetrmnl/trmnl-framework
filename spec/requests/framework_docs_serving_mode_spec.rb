# frozen_string_literal: true

require 'rails_helper'
require 'fileutils'
require 'tmpdir'
require 'uri'

# What each docs version actually links, per serving mode.
#
# Rails.env is test under rspec and nothing outside development can serve a live
# build, so these hand the controller a Framework::DocsServingMode built for a
# development host. Every input that decides the mode is a constructor argument, so
# no marker file is written into the repo and no global environment is stubbed.
RSpec.describe 'Framework docs serving mode', type: :request do
  current_version = FrameworkController::CURRENT_DOCS_VERSION

  # The pages that link the framework bundle into the parent document: responsive_test
  # terminalizes the parent, and size renders its rows inline on every track including
  # 1.2, which never had a responsive_test page.
  let(:bundle_linking_page) { Hash.new('responsive_test').merge('1.2' => 'size') }

  # The docs layout links the compiled bundles from app/assets/builds (gitignored), and
  # live mode links nothing else, so this is also what makes the builds complete.
  before(:all) { FrameworkBuild.docs_assets! }

  def development_mode(rails_root: Rails.root, builds_dir: nil)
    Framework::DocsServingMode.new(env: ActiveSupport::StringInquirer.new('development'),
                                   rails_root:, builds_dir:)
  end

  # rspec-mocks refuses to stub from an around hook, so the tmpdir is opened there and
  # the stub is set up inside the example.
  def serve_as(mode)
    allow(Framework::DocsServingMode).to receive(:current).and_return(mode)
  end

  def with_host_root(dir)
    @host_root = Pathname(dir)
    FileUtils.mkdir_p(@host_root.join('tmp'))
    yield
  end

  def get_docs(version, page = bundle_linking_page[version])
    get "/framework/docs/#{version}/#{page}"
    expect(response).to have_http_status(:ok)
  end

  # Same-origin hrefs the page links, stylesheets and scripts alike.
  def linked_assets
    response.body.scan(/<(?:link|script)[^>]*>/i)
            .filter_map { |tag| tag[/(?:href|src)="([^"]+)"/, 1] }
            .select { |url| url.start_with?('/') }
  end

  def badge
    response.body[/<span[^>]*title="([^"]*)"[^>]*>(Live build|Released[^<]*)</m]
    [Regexp.last_match(2), Regexp.last_match(1)]
  end

  # Live serving on the framework repo's own server, which is what Rails.root already
  # is here: no marker file, nothing enabled.
  describe 'the framework repo in development' do
    before { serve_as(development_mode) }

    it "serves the live build on #{current_version}" do
      get_docs(current_version)
      assets = linked_assets

      aggregate_failures do
        expect(assets).to include(a_string_matching(%r{\A/assets/plugins-\w+\.css\z}))
        expect(assets).to include(a_string_matching(%r{\A/assets/framework/responsive_test-\w+\.css\z}))
        expect(assets).to include(a_string_matching(%r{\A/assets/plugin-render/plugins-\w+\.js\z}))
        Framework::Themes.ids.each do |id|
          expect(assets).to include(a_string_matching(%r{\A/assets/themes/#{id}-theme-\w+\.css\z}))
        end
        expect(assets).not_to include(a_string_matching(%r{\A/(?:css|js)/3\.2\.0/}))
      end
    end

    # The mode gate used to be read before the requested version was, so a frozen track
    # got today's bundle while its page still claimed the old number.
    {
      '3.1' => '3.1.8',
      '3.0' => '3.0.5',
      '2.3' => '2.3.7',
      '1.2' => '1.2.0'
    }.each do |version, semver|
      it "keeps #{version} on its released bundle" do
        get_docs(version)
        assets = linked_assets

        aggregate_failures do
          expect(assets).to include("/css/#{semver}/plugins.css")
          expect(assets).not_to include(a_string_matching(%r{\A/assets/plugins-}))
        end
      end
    end

    it 'keeps the frozen tracks on released theme CSS and no foreign harness' do
      get_docs('3.1')
      assets = linked_assets

      aggregate_failures do
        # 3.1.8 predates the themes, and the css/latest fallback answers for them: a theme
        # is inert until a screen opts in, so a later copy costs the track nothing.
        Framework::Themes.ids.each do |id|
          expect(assets).to include("/css/latest/themes/#{id}-theme.css")
        end
        # The harness has no such fallback: it would grade 3.1.8's classes against a later
        # release's mixins. 3.1.8 published none, so the track links none.
        expect(assets.grep(%r{/framework/responsive_test\.css\z})).to be_empty
      end
    end

    it 'serves 1.2 the release its own major published, with no theme CSS' do
      get_docs('1.2')
      assets = linked_assets

      aggregate_failures do
        expect(assets).to include('/css/1.2.0/plugins.css')
        expect(assets).to all(satisfy { |url| url.exclude?('-theme') })
      end
    end
  end

  # The iframe config is the authority the demo iframes fetch, so it has to name the
  # same bundle the parent page linked. It used to overwrite the whole 1.2 payload
  # with the live build while the parent kept the v1.2 one.
  describe 'the example iframe config' do
    before { serve_as(development_mode) }

    it "matches the live parent page on #{current_version}" do
      get_docs(current_version)
      parent_css = linked_assets.find { |url| url.match?(%r{\A/assets/plugins-\w+\.css\z}) }

      get "/framework/docs/#{current_version}/example_iframe_config"
      config = response.parsed_body

      aggregate_failures do
        expect(URI.parse(config.fetch('plugins_css_url')).path).to eq(parent_css)
        expect(config.fetch('semver')).to be_nil
        expect(config.fetch('single_bundle_mode')).to be(false)
      end
    end

    it 'matches the released parent page on 1.2' do
      get '/framework/docs/1.2/example_iframe_config'
      config = response.parsed_body

      aggregate_failures do
        expect(URI.parse(config.fetch('plugins_css_url')).path).to eq('/css/1.2.0/plugins.css')
        expect(URI.parse(config.fetch('plugins_js_url')).path).to eq('/js/1.2.0/plugins.js')
        expect(config.fetch('semver')).to eq('1.2.0')
        expect(config.fetch('single_bundle_mode')).to be(true)
        expect(config.fetch('theme_css_urls')).to eq({})
      end
    end

    # The layout and the JSON resolved single_bundle_mode two different ways, and
    # disagreed on every frozen track: the JSON said true, the page attribute false.
    it 'agrees with the page attribute on a frozen track' do
      get_docs('3.1')
      attribute = response.body[/data-framework-examples-single-bundle-mode-value="([^"]*)"/, 1]

      get '/framework/docs/3.1/example_iframe_config'

      expect(attribute).to eq(response.parsed_body.fetch('single_bundle_mode').to_s)
    end
  end

  describe 'the release preview opt-out' do
    around { |example| Dir.mktmpdir { |dir| with_host_root(dir) { example.run } } }

    before do
      FileUtils.touch(@host_root.join(Framework::DocsServingMode::RELEASE_PREVIEW_MARKER))
      serve_as(development_mode(rails_root: @host_root, builds_dir: Rails.root.join('app/assets/builds')))
    end

    it "serves #{current_version} its published release instead of the live build" do
      get_docs(current_version)
      assets = linked_assets

      aggregate_failures do
        expect(assets).to include('/css/3.2.0/plugins.min.css')
        expect(assets).to include('/css/3.2.0/framework/responsive_test.css')
        Framework::Themes.ids.each do |id|
          expect(assets).to include("/css/3.2.0/themes/#{id}-theme.css")
        end
        expect(assets).not_to include(a_string_matching(%r{\A/assets/plugins-}))
      end
    end

    it 'says so on the badge' do
      get_docs(current_version)

      expect(badge).to eq(['Released 3.2.0', Framework::DocsServingMode.current.explanation])
    end
  end

  # Contract: an incomplete build is a missing style, never a 500. The bundle alone
  # used to open the gate, and the layout then looked up theme and harness files that
  # were never compiled.
  describe 'an incomplete live build' do
    around { |example| Dir.mktmpdir { |dir| with_host_root(dir) { example.run } } }

    before do
      builds = @host_root.join('builds')
      FileUtils.mkdir_p(builds)
      builds.join('plugins.css').write('/* built */')
      serve_as(development_mode(builds_dir: builds))
    end

    it "renders #{current_version} against the released assets" do
      get_docs(current_version)
      assets = linked_assets

      aggregate_failures do
        expect(assets).to include('/css/3.2.0/plugins.min.css')
        expect(assets).to include('/css/3.2.0/framework/responsive_test.css')
        expect(assets).not_to include(a_string_matching(%r{\A/assets/plugins-}))
      end
    end

    it 'names the missing file on the badge' do
      get_docs(current_version)
      label, title = badge

      aggregate_failures do
        expect(label).to eq('Released 3.2.0')
        expect(title).to include('framework/responsive_test.css')
        expect(title).to include('bin/dev')
      end
    end
  end

  # The gate is checked before the render, so a build file that disappears between the
  # two still has to degrade rather than raise Propshaft::MissingAssetError.
  describe 'a build file that vanishes after the gate opens' do
    before do
      serve_as(development_mode)
      resolver = Rails.application.assets.resolver
      allow(resolver).to receive(:resolve).and_wrap_original do |original, path|
        path.to_s == 'framework/responsive_test.css' ? nil : original.call(path)
      end
    end

    # Live mode pins nothing to a semver, and the harness takes no css/latest fallback, so
    # the page renders the class half alone rather than pairing a live bundle with a
    # released harness.
    it 'drops the harness instead of 500ing' do
      get_docs(current_version)

      aggregate_failures do
        expect(response).to have_http_status(:ok)
        expect(linked_assets.grep(%r{/framework/responsive_test\.css\z})).to be_empty
      end
    end
  end

  describe 'a consumer host mounting the gem' do
    around { |example| Dir.mktmpdir { |dir| with_host_root(dir) { example.run } } }

    # Unchanged from today: a host with no framework checkout has nothing to rebuild,
    # so it opts in or serves releases.
    it 'serves released assets without the development marker' do
      serve_as(development_mode(rails_root: @host_root, builds_dir: Rails.root.join('app/assets/builds')))

      get_docs(current_version)

      expect(linked_assets).to include('/css/3.2.0/plugins.min.css')
    end

    it 'serves the live build once the marker is written' do
      FileUtils.touch(@host_root.join(Framework::DocsServingMode::DEVELOPMENT_MARKER))
      serve_as(development_mode(rails_root: @host_root, builds_dir: Rails.root.join('app/assets/builds')))

      get_docs(current_version)

      expect(linked_assets).to include(a_string_matching(%r{\A/assets/plugins-\w+\.css\z}))
    end
  end

  describe 'the mode badge' do
    it 'says Live build where the docs serve one' do
      serve_as(development_mode)

      get_docs(current_version)

      expect(badge).to eq(['Live build', Framework::DocsServingMode.current.explanation])
    end

    it 'names the release a frozen track pinned itself to' do
      serve_as(development_mode)

      get_docs('3.1')
      label, title = badge

      aggregate_failures do
        expect(label).to eq('Released 3.1.8')
        expect(title).to include(current_version)
      end
    end
  end

  # Production, the test environment and every deployed docs site keep exactly the
  # serving they have today.
  describe 'outside development' do
    it 'serves released assets for every supported version' do
      expected = { '3.2' => '3.2.0', '3.1' => '3.1.8', '3.0' => '3.0.5', '2.3' => '2.3.7', '1.2' => '1.2.0' }

      aggregate_failures do
        expected.each do |version, semver|
          get_docs(version)
          bundle = semver == '3.2.0' ? 'plugins.min.css' : 'plugins.css'
          expect(linked_assets).to include("/css/#{semver}/#{bundle}")
        end
      end
    end

    it 'keeps the page cache key shape it has in production' do
      get_docs(current_version)

      expect(controller.send(:page_cache_key).length).to eq(7)
    end
  end

  # A live rebuild moves no URL the deployed key is built from, so cached HTML would
  # keep naming the digests from before the edit.
  describe 'the page cache key in live mode' do
    it 'carries the build fingerprint' do
      mode = development_mode
      serve_as(mode)

      get_docs(current_version)

      expect(controller.send(:page_cache_key).last).to eq(mode.build_fingerprint)
    end
  end
end
