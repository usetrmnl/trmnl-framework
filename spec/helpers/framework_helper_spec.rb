# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FrameworkHelper, type: :helper do
  describe '#framework_beta_pages' do
    subject(:beta_pages) { helper.framework_beta_pages }

    context 'with 3.1 docs' do
      before { allow(helper).to receive(:current_docs_version).and_return('3.1') }

      it { is_expected.to eq(%w[responsive responsive_test aspect_ratio]) }
    end

    context 'with 3.2 docs' do
      before { allow(helper).to receive(:current_docs_version).and_return('3.2') }

      it { is_expected.to be_empty }
    end

    context 'with 3.0 docs' do
      before { allow(helper).to receive(:current_docs_version).and_return('3.0') }

      it { is_expected.to include('scale') }
      it { is_expected.to include('aspect_ratio') }
    end
  end

  # An intro that carries markup but sits outside FRAMEWORK_INTRO_HTML_SAFE_PAGES is escaped,
  # so the page and every DocsRef tooltip print raw <code> tags. The allowlist is manual, so
  # this guards the direction that breaks a page: markup implies allowlisted.
  describe 'intro paragraph markup' do
    it 'allowlists every intro paragraph that contains HTML' do
      pages_with_markup = helper.framework_intro_paragraphs.select { |_page, text| text.include?('<') }.keys

      expect(pages_with_markup - FrameworkHelper::FRAMEWORK_INTRO_HTML_SAFE_PAGES).to be_empty
    end

    it 'renders the font weight intro markup rather than escaping it' do
      # DocsChromeHelper wraps the paragraph and is not auto-included any more.
      helper.extend(DocsChromeHelper)

      expect(helper.render_framework_intro_paragraph('font_weight')).to include('<code>text--bold</code>')
    end
  end
end
