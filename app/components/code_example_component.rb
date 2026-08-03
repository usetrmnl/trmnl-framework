class CodeExampleComponent < ViewComponent::Base
  # rubocop:disable Lint/MissingSuper
  def initialize(demo_code: nil, language: 'html', extra_classes: nil)
    @demo_code = demo_code
    @language = language
    @extra_classes = extra_classes
  end
  # rubocop:enable Lint/MissingSuper

  def formatted_code
    ERB::Util.html_escape(@demo_code).html_safe
  end
end
