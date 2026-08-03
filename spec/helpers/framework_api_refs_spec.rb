# frozen_string_literal: true

require 'rails_helper'

# Drift guard for the Related APIs registry: every key and target must be a
# live 3.2 docs page, and every non-inline ref must name an excerpt partial
# that exists. Keeps the central mapping honest as pages come and go.
RSpec.describe 'FrameworkHelper::DOC_PAGE_API_REFS' do
  subject(:registry) { FrameworkHelper::DOC_PAGE_API_REFS }

  let(:v3_2_pages) { FrameworkController::DOC_GROUPS_BY_VERSION.fetch('3.2').values.flatten }
  let(:excerpts_dir) { Framework::Engine.root.join('app/views/framework/related_apis') }

  it 'keys every entry by a 3.2 docs page' do
    expect(registry.keys - v3_2_pages).to be_empty
  end

  it 'targets only 3.2 docs pages' do
    targets = registry.values.flatten.map { |ref| ref[:page].to_s }
    expect(targets.uniq - v3_2_pages).to be_empty
  end

  it 'never points a page at itself' do
    self_refs = registry.select { |page, refs| refs.any? { |ref| ref[:page].to_s == page } }
    expect(self_refs.keys).to be_empty
  end

  it 'lists each target at most once per page' do
    registry.each do |page, refs|
      targets = refs.map { |ref| ref[:page] }
      expect(targets).to eq(targets.uniq), "#{page} repeats a target"
    end
  end

  it 'renders every non-inline ref from an existing excerpt partial' do
    registry.each do |page, refs|
      refs.reject { |ref| ref[:inline] }.each do |ref|
        expect(ref[:partial]).to be_present, "#{page} ref to #{ref[:page]} has no partial"
        partial_path = excerpts_dir.join("_#{ref[:partial]}.html.erb")
        expect(partial_path).to exist, "#{page} ref to #{ref[:page]} names missing partial #{ref[:partial]}"
      end
    end
  end

  it 'keeps inline refs bare and locals a hash' do
    registry.each do |page, refs|
      refs.each do |ref|
        if ref[:inline]
          expect(ref).not_to have_key(:partial), "#{page} inline ref to #{ref[:page]} also names a partial"
        end
        expect(ref[:locals]).to be_a(Hash), "#{page} ref to #{ref[:page]} has non-hash locals" if ref.key?(:locals)
      end
    end
  end

  it 'links every excerpt partial to its target page' do
    registry.each do |page, refs|
      refs.reject { |ref| ref[:inline] }.each do |ref|
        source = excerpts_dir.join("_#{ref[:partial]}.html.erb").read
        expect(source).to include("DocsRef.new(page: :#{ref[:page]})"),
                          "#{page} excerpt #{ref[:partial]} does not link its target #{ref[:page]}"
      end
    end
  end
end
