# frozen_string_literal: true

require 'rails_helper'

# The docs version lived twice: once in FrameworkController's constants and once as the
# literal '3.2' in nine places in config/routes/framework.rb. A bump moved the first and
# left every redirect and every `defaults:` pointing at the old version. The routes file
# reads the constants now, and these examples keep it that way.
RSpec.describe 'Docs routing versions' do
  let(:routes_source) { Framework::Engine.root.join('config/routes/framework.rb').read }

  it 'holds no docs version literal in the routes file' do
    literals = routes_source.scan(/["']\d+\.\d+["']/)

    expect(literals).to be_empty
  end

  it 'routes every supported version to the docs index' do
    recognized = FrameworkController::SUPPORTED_DOCS_VERSIONS.index_with do |version|
      Rails.application.routes.recognize_path("/framework/docs/#{version}")
    end

    aggregate_failures do
      FrameworkController::SUPPORTED_DOCS_VERSIONS.each do |version|
        expect(recognized[version]).to eq(controller: 'framework', action: 'docs_index', version: version)
      end
    end
  end

  it 'leaves a version outside the supported list unrouted' do
    expect { Rails.application.routes.recognize_path('/framework/docs/9.9') }
      .to raise_error(ActionController::RoutingError)
  end

  it 'redirects the bare docs path to the current version' do
    get '/framework/docs'

    expect(response).to redirect_to("/framework/docs/#{FrameworkController::CURRENT_DOCS_VERSION}")
  end

  it 'redirects each legacy version alias to its canonical version' do
    aggregate_failures do
      FrameworkController::LEGACY_DOCS_VERSION_ALIASES.each do |alias_name, canonical|
        get "/framework/docs/#{alias_name}"
        expect(response).to redirect_to("/framework/docs/#{canonical}")
      end
    end
  end

  # The component loops draw one route per page name, and `text` is a component name, so
  # a hand-written `get "/text"` after a loop could only ever be dead: the first matching
  # route wins and the later one never runs. Two of those shipped, reading as intentional
  # behavior. Any path the framework declares twice is that same bug, so guard the shape
  # rather than the two lines.
  it 'declares no framework path twice' do
    seen = Hash.new { |hash, key| hash[key] = 0 }
    Rails.application.routes.routes.each do |route|
      path = route.path.spec.to_s
      next unless path.start_with?('/framework')

      seen[[route.verb.to_s, path]] += 1
    end
    shadowed = seen.select { |_pair, count| count > 1 }.keys

    expect(shadowed).to be_empty, "shadowed by an earlier route: #{shadowed.map { |verb, path| "#{verb} #{path}" }.join(', ')}"
  end
end
