# frozen_string_literal: true

require 'rails_helper'

# Drift guard for the Color Palettes page. The palette classes and the mixin ids are
# generated from db/data (framework_devices.yml, framework_colors.yml), so a palette
# added or retired there must be reflected in the docs page rather than silently
# leaving readers with a class the framework no longer emits, or one it does emit but
# nothing documents.
RSpec.describe 'Framework Color Palettes docs', type: :request do
  current_version = FrameworkController::CURRENT_DOCS_VERSION

  # Same guard the routing sweep uses: the docs layout links the compiled bundles from
  # app/assets/builds, which is gitignored and empty on a fresh checkout.
  before(:all) { FrameworkBuild.docs_assets! }

  let(:page_body) do
    get "/framework/docs/#{current_version}/color_palettes"
    response.body
  end

  let(:palette_classes) do
    classes = Framework::Devices.palettes.filter_map { |palette| palette['framework_class'] }
    classes.grep(/\Ascreen--color-/).uniq
  end

  it 'documents every palette class the device registry assigns' do
    undocumented = palette_classes.reject { |css_class| page_body.include?(css_class) }
    expect(undocumented).to be_empty
  end

  it 'documents no palette class the device registry does not assign' do
    documented = page_body.scan(/screen--color-[a-z0-9]+/).uniq
    expect(documented - palette_classes).to be_empty
  end

  it 'lists every limited palette id accepted by for-color-palette' do
    missing = Framework::ColorData.color_palette_limited_ids.reject do |id|
      page_body.include?("&#39;#{id}&#39;") || page_body.include?("'#{id}'")
    end
    expect(missing).to be_empty
  end

  it 'names the preview modifiers that repaint a limited palette' do
    aggregate_failures do
      expect(page_body).to include('screen--preview-colors')
      expect(page_body).to include('screen--preview-white-limited')
    end
  end
end
