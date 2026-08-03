# frozen_string_literal: true

require 'rails_helper'

# The DocsRef chips are written into a page once and rendered on every track that shares
# it. A frozen track that never published the target has no URL for it, and
# framework_page_path answers that track's docs index: a chip labelled "Paint API" whose
# href is /framework/docs/3.0 sends the reader somewhere the label never named.
#
# The component carries no track logic of its own: reachable-or-plain-text and the target
# URL both come from framework_page_reachable? and framework_page_path(version:).
# Rendering every page of every track to read the hrefs back cost ten CI minutes (a docs
# render is about 2.1s on a runner), so the sweep enumerates the DocsRef call sites
# statically across each track's view trees and resolves every one through those same
# helpers. Three rendered pages remain as emission drift guards.
RSpec.describe 'Framework docs cross references', type: :request do
  before(:all) { FrameworkBuild.docs_assets! }

  engine_root = Framework::Engine.root
  chip_call = /DocsRef\.new\(\s*page:\s*(?::([a-z0-9_]+)|(["'])([a-z0-9_]+)\2)/m
  # The doc card wraps a chip and forwards its docs_page:, so card call sites carry the
  # literal the card's internal DocsRef.new(page: @docs_page) receives.
  card_call = /FrameworkDocCardComponent\.new\([^)]*?docs_page:\s*(?::([a-z0-9_]+)|(["'])([a-z0-9_]+)\2)/m
  card_template = 'framework_doc_card_component.html.erb'

  # The trees a track's pages can render templates and partials from. framework_v3_1
  # holds only the pages whose 3.2 rewrite diverged and falls through to framework/, so
  # both trees are in play there. Components can carry chips too.
  trees_by_version = FrameworkController::SUPPORTED_DOCS_VERSIONS.index_with do |version|
    prefix = FrameworkController::DOCS_VIEW_PREFIX_BY_VERSION.fetch(version)
    trees = ["app/views/#{prefix}", 'app/components']
    trees << 'app/views/framework' if prefix == 'framework_v3_1'
    trees
  end

  # [literal [key, file] pairs, total call sites] per tree, scanned once at load.
  scanned = trees_by_version.values.flatten.uniq.index_with do |tree|
    keys = []
    calls = 0
    engine_root.join(tree).glob('**/*.erb').each do |file|
      source = file.read
      keys.concat(source.scan(chip_call).map { |sym, _quote, str| [sym || str, file] })
      keys.concat(source.scan(card_call).map { |sym, _quote, str| [sym || str, file] })
      calls += source.scan('DocsRef.new').size + source.scan('FrameworkDocCardComponent.new').size
      # The card's internal delegation carries no literal of its own; the harvested card
      # call sites represent it.
      calls -= 1 if file.basename.to_s == card_template
    end
    [keys, calls]
  end

  chips_for = ->(version) { trees_by_version.fetch(version).flat_map { |tree| scanned.fetch(tree).first }.uniq }

  # The resolvers the component calls; the request-spec context supplies the engine's
  # route helpers they generate URLs with.
  include FrameworkHelper

  # href of every chip trigger on the page, in document order.
  def chip_hrefs
    response.body.scan(/<a[^>]*data-docs-ref-tooltip-target="trigger"[^>]*>/i)
            .filter_map { |anchor| anchor[/href="([^"]+)"/, 1] }
  end

  it 'scans a chip population, not an empty tree' do
    expect(chips_for.call('3.2').size).to be >= 100
  end

  FrameworkController::SUPPORTED_DOCS_VERSIONS.each do |version|
    it "links no chip to the docs index on the #{version} track" do
      index_path = "/framework/docs/#{version}"

      landing_on_index = chips_for.call(version).filter_map do |key, file|
        next unless framework_page_reachable?(key, version)

        href = framework_page_path(key, version: version)
        "#{file.relative_path_from(engine_root)}: #{key} -> #{href}" if href == index_path
      end

      expect(landing_on_index).to be_empty,
                                  "chips resolving to the #{version} docs index:\n  #{landing_on_index.join("\n  ")}"
    end
  end

  # The scan only sees literal page: arguments. A dynamic call site would dodge the
  # sweep, so its arrival fails here with instructions instead of passing silently.
  it 'finds only literal DocsRef targets in the docs view trees' do
    dynamic = scanned.filter_map do |tree, (keys, calls)|
      "#{tree}: #{calls - keys.size} non-literal DocsRef call(s)" if calls > keys.size
    end

    expect(dynamic).to be_empty,
                       "DocsRef called with a non-literal page:, extend this sweep to cover it:\n  #{dynamic.join("\n  ")}"
  end

  # One rendered page pins the scan to what the component emits: every chip href on the
  # page must come from the resolved universe the sweep checked.
  it 'emits chip hrefs only from the resolved universe on a partial-heavy page' do
    get '/framework/docs/3.2/structure'
    expect(response).to have_http_status(:ok)

    allowed = chips_for.call('3.2')
                       .select { |key, _file| framework_page_reachable?(key, '3.2') }
                       .map { |key, _file| framework_page_path(key, version: '3.2') }
    expect(chip_hrefs).not_to be_empty
    expect(chip_hrefs - allowed).to be_empty
  end

  it 'sends a Text chip to the page that track renamed it to' do
    get '/framework/docs/3.1/v3_upgrade_guide'

    expect(chip_hrefs).to include('/framework/docs/3.1/text_color')
  end

  it 'renders a chip for a page the track never published as plain text' do
    get '/framework/docs/3.0/responsive'

    aggregate_failures do
      expect(response.body).to include('Not documented in Framework 3.0')
      expect(chip_hrefs).not_to include('/framework/docs/3.0')
    end
  end
end
