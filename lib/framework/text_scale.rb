# frozen_string_literal: true

module Framework
  # Text Scale levels the docs preview and screen picker offer. Multipliers mirror
  # the framework's $text-scale-values (app/assets/stylesheets/framework/utilities/_text_scale.scss);
  # IDs match the runtime class .screen--text-scale-<id>.
  module TextScale
    MULTIPLIERS = {
      'small' => '0.8',
      'regular' => '1',
      'large' => '1.25',
      'xlarge' => '1.5'
    }.freeze

    def self.options = [['Small', 'small'], ['Regular', 'regular'], ['Large', 'large'], ['X-Large', 'xlarge']]

    def self.ids = options.map { |_, id| id }

    def self.multiplier(id) = MULTIPLIERS.fetch(id)
  end
end
