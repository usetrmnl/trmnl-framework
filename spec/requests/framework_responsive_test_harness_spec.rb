# frozen_string_literal: true

require 'rails_helper'

# The responsive_test page renders every parity row twice: the mixin half is styled by the
# ID rules compiled from framework/responsive_test.scss, the class half by the bundle's
# variant classes. Released docs mode is the default outside development, and its layout
# branch linked the bundle alone. The whole mixin column arrived unstyled, so every row on
# the page read as a mixin/class mismatch, which is the one thing the page exists to disprove.
#
# The check follows the links the page itself renders rather than a fixed URL, so it holds
# for the released copy and for a live build alike. The live-mode matrix lives in
# spec/requests/framework_docs_serving_mode_spec.rb.
RSpec.describe 'Framework responsive_test harness CSS', type: :request do
  # The current version, deliberately: it is the only track that resolves both halves
  # from one release, and the second example below is about exactly that.
  page_path = "/framework/docs/#{FrameworkController::CURRENT_DOCS_VERSION}/responsive_test"

  # One rule from the mixin half of the harness. It is an ID selector, so only
  # responsive_test.css can carry it: the bundle publishes classes and nothing else.
  mixin_rule = '#bg-size-md-mixin'

  # The page renders through the docs layout, which links the compiled tailwind/dartsass
  # bundles from app/assets/builds (gitignored, so empty on a fresh checkout).
  before(:all) { FrameworkBuild.docs_assets! }

  # Same-origin stylesheet hrefs, in document order. The font stylesheet is cross-origin
  # and drops out here; everything else is served by this app.
  def linked_stylesheet_hrefs
    response.body.scan(/<link[^>]*rel="stylesheet"[^>]*>/i)
            .filter_map { |link| link[/href="([^"]+)"/, 1] }
            .select { |href| href.start_with?('/') }
  end

  def fetch_stylesheet(href)
    get href
    response.status == 200 ? response.body : ''
  end

  # Guards the premise: in live-build mode the page links the compiled files instead,
  # and this file would be checking a resolution that was never broken.
  it 'renders the docs in released mode' do
    aggregate_failures do
      expect(Framework::DocsServingMode.current).not_to be_live
      expect(Framework::Version.development_mode?).to be(false)
    end
  end

  it 'links a stylesheet that carries the mixin rules' do
    get page_path
    expect(response).to have_http_status(:ok)

    hrefs = linked_stylesheet_hrefs
    carrying = hrefs.select { |href| fetch_stylesheet(href).include?(mixin_rule) }

    expect(carrying).not_to be_empty,
                            "no stylesheet linked by #{page_path} carries #{mixin_rule}: #{hrefs.join(', ')}"
  end

  # Both halves of a parity row have to come from the same release, or the page compares
  # one release's mixins against another's published bundle and reports the version gap
  # as a defect.
  it 'pins the harness to the release the page links its bundle from' do
    get page_path
    hrefs = linked_stylesheet_hrefs
    semver = hrefs.filter_map { |href| href[%r{\A/css/([^/]+)/plugins(?:\.min)?\.css\z}, 1] }.first

    aggregate_failures do
      expect(semver).to be_present, "#{page_path} links no released bundle: #{hrefs.join(', ')}"
      expect(hrefs).to include("/css/#{semver}/framework/responsive_test.css")
    end
  end

  # A frozen track whose release published no harness has nothing to link. It links none,
  # rather than the css/latest copy from a later release, and the page renders the class
  # half alone: the mixin column is gone along with its heading.
  frozen_versions = FrameworkController::SUPPORTED_DOCS_VERSIONS - [FrameworkController::CURRENT_DOCS_VERSION]
  frozen_versions.each do |version|
    next unless FrameworkController::DOC_GROUPS_BY_VERSION.fetch(version).values.flatten.include?('responsive_test')

    it "links no harness from another release on the #{version} track" do
      get "/framework/docs/#{version}/responsive_test"
      expect(response).to have_http_status(:ok)

      harness = linked_stylesheet_hrefs.grep(%r{/framework/responsive_test\.css\z})
      pinned = harness.grep(%r{\A/css/#{Regexp.escape(version)}\.})

      aggregate_failures do
        expect(harness).to eq(pinned), "#{version} links a harness from another release: #{harness.join(', ')}"
        expect(response.body.include?('SCSS Mixin Result')).to eq(harness.any?)
      end
    end
  end
end
