# frozen_string_literal: true

require 'rails_helper'

# The Element Sizes grid is hand-written, so this holds it to the compiled bundle in both
# directions: a sample class the CSS drops, or a size the CSS gains in a "not available"
# cell, fails here instead of misleading a plugin author.
RSpec.describe 'Framework docs Element Sizes page', type: :request do
  subject(:page) do
    get "/framework/docs/#{FrameworkController::CURRENT_DOCS_VERSION}/element_sizes"
    response.parsed_body
  end

  let(:css) { FrameworkBuild.plugins_css }

  def emitted?(class_name) = css.match?(/\.#{Regexp.escape(class_name)}(?![\w-])/)

  def classes_at(attribute) = page.css("[#{attribute}]").map { |node| node[attribute] }

  it 'links the framework stylesheet so the samples render at their real size' do
    expect(page.at_css('link[rel="stylesheet"][href*="plugins"]')).to be_present
  end

  it 'shows only size classes the bundle emits' do
    expect(classes_at('data-size-class').reject { |name| emitted?(name) }).to be_empty
  end

  it 'marks as not available only size classes the bundle does not emit' do
    expect(classes_at('data-missing-size-class').select { |name| emitted?(name) }).to be_empty
  end

  it 'fills every cell of the grid' do
    expect(classes_at('data-size-class').size + classes_at('data-missing-size-class').size).to eq(6 * 12)
  end
end
