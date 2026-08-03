# frozen_string_literal: true

class FrameworkDocCardComponent < ViewComponent::Base
  # rubocop:disable Lint/MissingSuper
  def initialize(icon:, title:, docs_page: nil)
    @icon = icon.to_s
    @title = title
    @docs_page = docs_page&.to_s
  end
  # rubocop:enable Lint/MissingSuper

  def docs_page?
    @docs_page.present?
  end
end
