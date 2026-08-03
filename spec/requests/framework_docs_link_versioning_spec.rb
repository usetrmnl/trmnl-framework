# frozen_string_literal: true

require 'rails_helper'

# FrameworkController#default_url_options puts the current track into every URL generated
# while a docs page renders, so links stay on the track the reader is on. Rails cannot
# place that option in the path of a route that has no :version segment, and puts it in
# the query string instead: /framework/examples?version=3.2, which then rode into that
# page's canonical tag and gave the docs a second cache entry for it.
#
# FrameworkRoutesHelper nulls the option for the routes that have no segment for it. The
# check is on the rendered page rather than on the helper, so a new unversioned route
# linked from the docs chrome fails here until it joins that list.
RSpec.describe 'Framework docs link versioning', type: :request do
  before(:all) { FrameworkBuild.docs_assets! }

  # Same-origin hrefs, in document order.
  def linked_hrefs
    response.body.scan(/href="([^"]+)"/i).flatten.select { |href| href.start_with?('/') }
  end

  FrameworkController::SUPPORTED_DOCS_VERSIONS.each do |version|
    it "links no ?version= query from the #{version} docs index" do
      get "/framework/docs/#{version}"
      expect(response).to have_http_status(:ok)

      carrying = linked_hrefs.select { |href| href.include?('version=') }
      expect(carrying).to be_empty, "links carrying the version as a query param: #{carrying.uniq.join(', ')}"
    end
  end

  it 'links the unversioned routes without a query on a docs page' do
    get "/framework/docs/3.1/border"
    expect(response).to have_http_status(:ok)

    aggregate_failures do
      expect(response.body).to include('href="/framework/examples"')
      expect(response.body).to include('href="/framework/releases"')
      expect(linked_hrefs.select { |href| href.include?('version=') }).to be_empty
    end
  end

  it 'keeps docs links on the track being read' do
    get "/framework/docs/3.1/border"

    expect(linked_hrefs).to include('/framework/docs/3.1/rounded')
  end
end
