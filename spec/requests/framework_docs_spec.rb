# frozen_string_literal: true

require 'rails_helper'
require 'uri'

# Request specs for the docs-site routing declared in config/routes/framework.rb.
#
# The contract under test is the HTTP surface: which URLs render (200), and where the
# legacy/compatibility URLs redirect (301 + Location). Rendered HTML is deliberately not
# asserted, so the sweep stays fast and survives copy changes. Page and version lists are
# derived from FrameworkController's registries rather than hardcoded, so pages added to a
# doc group are covered without touching this file.
RSpec.describe 'Framework docs routing', type: :request do
  current_version = FrameworkController::CURRENT_DOCS_VERSION
  supported_versions = FrameworkController::SUPPORTED_DOCS_VERSIONS
  legacy_aliases = FrameworkController::LEGACY_DOCS_VERSION_ALIASES
  current_pages = FrameworkController::DOC_GROUPS_BY_VERSION.fetch(current_version).values.flatten

  # A handful of pages spanning the naming shapes (single word, snake_case, renamed,
  # api, guide), used to document the redirect rules without repeating them 50+ times.
  redirect_samples = %w[border title_bar text_color paint_api trmnl_x_guide] & current_pages

  # The docs render through the app layout, which links the compiled tailwind/dartsass
  # bundles from app/assets/builds (gitignored, so empty on a fresh checkout). Without them
  # Propshaft raises MissingAssetError and every page 500s. FrameworkBuild compiles them
  # once per rspec process, however many groups ask.
  before(:all) { FrameworkBuild.docs_assets! }

  # Path portion of the last response's redirect target, host/scheme stripped.
  def redirect_target
    URI.parse(response.location).path
  end

  describe 'docs index' do
    it 'serves the framework landing page' do
      get '/framework'
      expect(response).to have_http_status(:ok)
    end

    supported_versions.each do |version|
      it "serves the docs index for version #{version}" do
        get "/framework/docs/#{version}"
        expect(response).to have_http_status(:ok)
      end
    end
  end

  # The exhaustive page sweep is the longest thing in CI: every page costs the same
  # 2.1 seconds on a runner, and there are seventy of them. The halves carry a
  # page_sweep tag so .github/workflows/ci.yml can give each one its own runner. The
  # cut is by position in the page list and means nothing else; a shard that excludes
  # the tag still runs every example in this file that is not part of the sweep.
  current_pages.each_slice((current_pages.size + 1) / 2).with_index(1) do |pages, half|
    describe "component pages for the current version (#{current_version}), half #{half}",
             page_sweep: half.to_s do
      pages.each do |page|
        it "serves /framework/docs/#{current_version}/#{page}" do
          get "/framework/docs/#{current_version}/#{page}"
          expect(response).to have_http_status(:ok)
        end
      end
    end
  end

  # The 2.3 guides render from app/views/framework_v2, which is the only copy of them.
  # An identical set once sat in app/views/framework and was never reachable, so this
  # pins the templates the frozen track actually resolves.
  describe 'frozen 2.3 guides' do
    FrameworkController::DOC_GROUPS_BY_VERSION.fetch('2.3').fetch(:guides).each do |page|
      it "serves /framework/docs/2.3/#{page}" do
        get "/framework/docs/2.3/#{page}"
        expect(response).to have_http_status(:ok)
      end
    end
  end

  describe 'Text Scale availability' do
    ['3.1', FrameworkController::CURRENT_DOCS_VERSION].each do |version|
      it "serves Text Scale on #{version}" do
        get "/framework/docs/#{version}/text_scale"
        expect(response).to have_http_status(:ok)
      end
    end

    it 'keeps Text Scale out of the frozen 3.0 track' do
      get '/framework/docs/3.0/text_scale'
      aggregate_failures do
        expect(response).to have_http_status(:found)
        expect(redirect_target).to eq('/framework/docs/3.0')
      end
    end
  end

  describe 'Fluid Mashups availability' do
    it 'documents placement modifiers on 3.1' do
      get '/framework/docs/3.1/mashup'
      aggregate_failures do
        expect(response.body).to include('Fluid Mashups')
        expect(response.body).to include('mashup-cell--col-span-2')
      end
    end

    it 'keeps Fluid Mashups out of the frozen 3.0 track' do
      get '/framework/docs/3.0/mashup'
      expect(response.body).not_to include('Fluid Mashups')
    end
  end

  describe 'Inverse availability' do
    ['3.1', FrameworkController::CURRENT_DOCS_VERSION].each do |version|
      it "serves Inverse on #{version}" do
        get "/framework/docs/#{version}/inverse"
        expect(response).to have_http_status(:ok)
      end
    end

    it 'keeps Inverse out of the frozen 3.0 track' do
      get '/framework/docs/3.0/inverse'
      aggregate_failures do
        expect(response).to have_http_status(:found)
        expect(redirect_target).to eq('/framework/docs/3.0')
      end
    end
  end

  # The Themes page list and the picker's Style selector both enumerate
  # Framework::Themes, so registering a theme reaches the docs with no copy or picker
  # edit. Both examples assert against the registry rather than a literal id: a
  # hardcoded id would keep passing after the enumeration regressed to a fixed list,
  # which is the regression these guard.
  describe 'theme enumeration in the docs' do
    it 'lists every registered theme with its screen class on the Themes page' do
      get "/framework/docs/#{current_version}/themes"
      aggregate_failures do
        Framework::Themes::NAMES_BY_ID.each do |id, name|
          expect(response.body).to include(name)
          expect(response.body).to include("screen--theme-#{id}")
        end
      end
    end

    it "offers every registered theme in the picker's Style selector" do
      get "/framework/docs/#{current_version}/themes"
      aggregate_failures do
        Framework::Themes::NAMES_BY_ID.each do |id, name|
          expect(response.body).to include(%(<option value="#{id}">#{name}</option>))
        end
      end
    end
  end

  # Devices and Rendering Modes shipped with 3.2 and describe the mode registry in
  # base/_screen-mode-vars.scss. The palette classes on the Rendering Modes page are
  # generated from the device manifest, so a palette added there has to reach the page.
  describe 'Devices and Rendering Modes availability' do
    limited_palette_classes = Framework::Devices.palettes
                                                .map { |palette| palette['framework_class'] }
                                                .select { |cls| cls.start_with?('screen--color-') && cls != 'screen--color-full' }
                                                .uniq

    it 'serves Rendering Modes with the mode classes and the published depth' do
      get "/framework/docs/#{current_version}/rendering_modes"
      aggregate_failures do
        expect(response).to have_http_status(:ok)
        expect(response.body).to include('screen--1bit')
        expect(response.body).to include('screen--2bit')
        expect(response.body).to include('screen--4bit')
        expect(response.body).to include('screen--color-full')
        expect(response.body).to include('--framework-bit-depth')
      end
    end

    it 'names every limited palette class the device manifest defines' do
      get "/framework/docs/#{current_version}/rendering_modes"
      aggregate_failures do
        limited_palette_classes.each do |cls|
          expect(response.body).to include(cls)
        end
      end
    end

    it 'serves Devices with the profile variables and the rating table' do
      get "/framework/docs/#{current_version}/devices"
      aggregate_failures do
        expect(response).to have_http_status(:ok)
        expect(response.body).to include('--dither-pixel-ratio')
        expect(response.body).to include('--device-ui-scale')
        expect(response.body).to include('screen--density-2x')
        expect(response.body).to include('Rating a Panel')
        expect(response.body).to include('$custom-devices')
      end
    end

    %w[3.0 3.1].each do |version|
      it "keeps both pages out of the frozen #{version} track" do
        aggregate_failures do
          %w[devices rendering_modes].each do |page|
            get "/framework/docs/#{version}/#{page}"
            expect(response).to have_http_status(:found)
            expect(redirect_target).to eq("/framework/docs/#{version}")
          end
        end
      end
    end
  end

  describe 'scale token availability' do
    it 'shows the complete 3.1 scale token reference' do
      get '/framework/docs/3.1/tokens'
      aggregate_failures do
        expect(response.body).to include('id="token-modifier-text-scale"')
        expect(response.body).to include('id="token-device-ui-scale"')
        expect(response.body).to include('id="token-modifier-scale"')
      end
    end

    it 'keeps Text Scale tokens out of the 3.0 reference' do
      get '/framework/docs/3.0/tokens'
      aggregate_failures do
        expect(response.body).not_to include('id="token-modifier-text-scale"')
        expect(response.body).not_to include('id="token-text-ui-scale"')
      end
    end

    it 'keeps the complete scale token reference on the current track' do
      get "/framework/docs/#{FrameworkController::CURRENT_DOCS_VERSION}/tokens"
      aggregate_failures do
        expect(response.body).to include('id="token-device-ui-scale"')
        expect(response.body).to include('id="token-modifier-scale"')
        expect(response.body).to include('id="token-modifier-text-scale"')
      end
    end
  end

  describe 'examples and releases' do
    it 'serves the examples index' do
      get '/framework/examples'
      expect(response).to have_http_status(:ok)
    end

    # The index is generated by scanning public/css, so the regression it exists to
    # catch is a scan that stops listing the newest release. A literal version cannot
    # see that: it stays in the archive and keeps passing two releases later. The
    # current release comes from the manifest, and the oldest one alongside it proves
    # the scan still reaches back instead of reporting only the newest.
    #
    # data-release-toggle carries the version of an archive card, so it is the one
    # place on the page where a version string means "this release is listed". A bare
    # version substring also matches the rolling-latest card and the asset URLs under
    # it, which is how the old literal outlived two releases.
    it 'serves the releases index' do
      get '/framework/releases'
      aggregate_failures do
        expect(response).to have_http_status(:ok)
        expect(response.body).to include(%(data-release-toggle="#{Framework::Version.latest.number}"))
        expect(response.body).to include(%(data-release-toggle="#{Framework::Version.version_numbers.first}"))
      end
    end

    it 'serves the example iframe config JSON' do
      get "/framework/docs/#{current_version}/example_iframe_config"
      expect(response).to have_http_status(:ok)
    end

    it 'uses the 3.1.8 bundles for 3.1 examples' do
      get '/framework/docs/3.1/example_iframe_config'
      config = response.parsed_body

      aggregate_failures do
        expect(config.fetch('semver')).to eq('3.1.8')
        expect(URI.parse(config.fetch('plugins_css_url')).path).to eq('/css/3.1.8/plugins.css')
        expect(URI.parse(config.fetch('plugins_js_url')).path).to eq('/js/3.1.8/plugins.js')
      end
    end
  end

  describe 'legacy redirects land on the canonical versioned page' do
    it 'redirects the bare docs path to the current-version index' do
      get '/framework/docs'
      aggregate_failures do
        expect(response).to have_http_status(:moved_permanently)
        expect(redirect_target).to eq("/framework/docs/#{current_version}")
      end
    end

    describe 'non-versioned component URLs point at the current version' do
      redirect_samples.each do |page|
        it "redirects /framework/docs/#{page}" do
          get "/framework/docs/#{page}"
          aggregate_failures do
            expect(response).to have_http_status(:moved_permanently)
            expect(redirect_target).to eq("/framework/docs/#{current_version}/#{page}")
          end
        end
      end
    end

    describe 'versioned aliases (v1/v2/v3) resolve to their semver track' do
      legacy_aliases.each do |alias_name, canonical_version|
        it "redirects the /framework/docs/#{alias_name} index to #{canonical_version}" do
          get "/framework/docs/#{alias_name}"
          aggregate_failures do
            expect(response).to have_http_status(:moved_permanently)
            expect(redirect_target).to eq("/framework/docs/#{canonical_version}")
          end
        end

        it "redirects a /framework/docs/#{alias_name} component to #{canonical_version}" do
          get "/framework/docs/#{alias_name}/border"
          aggregate_failures do
            expect(response).to have_http_status(:moved_permanently)
            expect(redirect_target).to eq("/framework/docs/#{canonical_version}/border")
          end
        end
      end
    end

    describe 'v3 alias page URLs canonicalize to the current version' do
      redirect_samples.each do |page|
        it "redirects /framework/docs/v3/#{page}" do
          get "/framework/docs/v3/#{page}"
          aggregate_failures do
            expect(response).to have_http_status(:moved_permanently)
            expect(redirect_target).to eq("/framework/docs/#{current_version}/#{page}")
          end
        end
      end

      it 'renames the retired v3 text page to text_color' do
        get '/framework/docs/v3/text'
        aggregate_failures do
          expect(response).to have_http_status(:moved_permanently)
          expect(redirect_target).to eq("/framework/docs/#{current_version}/text_color")
        end
      end
    end

    describe 'pre-docs legacy paths' do
      it 'redirects /framework/<component> to the current docs page' do
        get '/framework/border'
        aggregate_failures do
          expect(response).to have_http_status(:moved_permanently)
          expect(redirect_target).to eq("/framework/docs/#{current_version}/border")
        end
      end

      it 'redirects the /framework_legacy root to the 1.2 docs index' do
        get '/framework_legacy'
        aggregate_failures do
          expect(response).to have_http_status(:moved_permanently)
          expect(redirect_target).to eq('/framework/docs/1.2')
        end
      end

      it 'redirects a /framework_legacy component to its 1.2 docs page' do
        get '/framework_legacy/border'
        aggregate_failures do
          expect(response).to have_http_status(:moved_permanently)
          expect(redirect_target).to eq('/framework/docs/1.2/border')
        end
      end

      it 'redirects /framework_v2 to the current docs index' do
        get '/framework_v2'
        aggregate_failures do
          expect(response).to have_http_status(:moved_permanently)
          expect(redirect_target).to eq("/framework/docs/#{current_version}")
        end
      end
    end
  end
end
