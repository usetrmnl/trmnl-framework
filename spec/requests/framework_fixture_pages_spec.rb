# frozen_string_literal: true

require 'rails_helper'

# Request specs for the pages under /framework/test, plus the example pages beside them.
#
# The fixture pages are the substrate the browser suites stand on: test/runtime boots
# against /framework/test/runtime, and every visual case is a node on one of the five
# /framework/test/visual pages. No CI job runs Playwright today, so a fixture page that
# 500s after a helper rename is invisible, and the browser suites nobody runs would fail
# with an opaque timeout. One GET each says it here instead.
#
# The paths come from the routes table and the example ids from the controller's own
# config, so a fixture page or an example added later is covered without touching this
# file.
RSpec.describe 'Framework fixture and example pages', type: :request do
  # The fixture pages only. The controller also answers /__runtime-test__/plugins.js,
  # which is the runtime page's script rather than a page of its own.
  fixture_paths = Rails.application.routes.routes
                       .select { |route| route.defaults[:controller] == 'framework_tests' }
                       .map { |route| route.path.spec.to_s.delete_suffix('(.:format)') }
                       .grep(%r{\A/framework/test/})

  example_ids = FrameworkController.new.layout_examples_config.keys

  # The fixture pages render through the test layouts, which link the compiled bundles
  # from app/assets/builds (gitignored, so empty on a fresh checkout). Same reason the
  # docs sweep builds first.
  before(:all) { FrameworkBuild.docs_assets! }

  # Both lists are derived, so an emptied one would turn this whole file into a no-op.
  # These two examples are what stops that from passing as coverage.
  it 'derives a path for every fixture route the tests controller draws' do
    expect(fixture_paths).to include(
      '/framework/test/runtime',
      '/framework/test/responsive_variants',
      '/framework/test/visual/paint'
    )
  end

  it 'derives the configured layout examples' do
    expect(example_ids).not_to be_empty
  end

  describe 'fixture pages' do
    fixture_paths.each do |path|
      it "serves #{path} as HTML" do
        get path
        aggregate_failures do
          expect(response).to have_http_status(:ok)
          expect(response.media_type).to eq('text/html')
        end
      end
    end
  end

  # What the browser suites reach for once the page loads. A rename on either side is a
  # timeout in a suite no CI job runs; here it is a named failure.
  describe 'hooks the browser suites depend on' do
    it 'gives the runtime fixture its screen, its fixture host, and the routed runtime script' do
      get '/framework/test/runtime'
      aggregate_failures do
        expect(response.body).to include('data-runtime-test-screen')
        expect(response.body).to include('data-runtime-test-fixture')
        expect(response.body).to include('/__runtime-test__/plugins.js')
      end
    end

    # A Playwright run fulfills that URL itself. Nothing did outside one, so the page
    # 404'd its only script for anyone who opened it by hand.
    it 'resolves the runtime script the fixture links' do
      get '/__runtime-test__/plugins.js'
      expect(response).to have_http_status(:redirect)
    end

    # test/runtime/framework/responsive-variants.spec.js fails the run below 40 probe
    # rows, so a fixture that quietly stops rendering rows cannot pass as green there.
    # The same floor applies here, one HTTP request earlier.
    it 'renders the responsive variant probe rows the gate oracle counts' do
      get '/framework/test/responsive_variants'
      expect(response.body.scan('data-variant-probe').size).to be > 40
    end

    # Every visual case is `page.locator('#<id>')` in the spec file named after the page.
    # Reading the ids from the spec rather than restating them keeps the two sides from
    # drifting apart.
    fixture_paths.grep(%r{/framework/test/visual/}).each do |path|
      fixture = File.basename(path)
      spec_file = Framework::Engine.root.join("test/visual/#{fixture}.spec.js")
      case_ids = spec_file.file? ? spec_file.read[/const cases = \[(.*?)\]/m].to_s.scan(/'([a-z0-9-]+)'/).flatten : []

      it "renders every #{fixture} case its visual spec photographs" do
        get path
        missing = case_ids.reject { |id| response.body.include?(%(id="#{id}")) }

        aggregate_failures do
          expect(case_ids).not_to be_empty, "#{path} has no cases in test/visual/#{fixture}.spec.js"
          expect(response.body).to include('data-visual-ready="true"')
          expect(missing).to be_empty, "#{fixture}.spec.js photographs #{missing.join(', ')}, which the page does not render"
        end
      end
    end
  end

  describe 'example pages' do
    it 'serves the layout examples index' do
      get '/framework/layout_examples'
      expect(response).to have_http_status(:ok)
    end

    example_ids.each do |id|
      it "serves the #{id} example" do
        get "/framework/examples/#{id}"
        aggregate_failures do
          expect(response).to have_http_status(:ok)
          expect(response.media_type).to eq('text/html')
        end
      end
    end

    it 'refuses an example the config does not carry' do
      get '/framework/examples/not_a_plugin'
      expect(response).to have_http_status(:not_found)
    end
  end
end
