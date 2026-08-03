class DocsRef < ViewComponent::Base
  # rubocop:disable Lint/MissingSuper
  def initialize(page:)
    @page = page.to_s
  end
  # rubocop:enable Lint/MissingSuper
end
