# frozen_string_literal: true

module Framework
  # Registry of publishable framework themes: what the release pipeline ships and the
  # docs picker offers. IDs match themes/<id>-theme.scss and the runtime class
  # .screen--theme-<id>; framework:themes:lint keeps the files and this registry in sync.
  module Themes
    NAMES_BY_ID = {
      'black-and-yellow' => 'Black and Yellow',
      'dark' => 'Dark',
      'white-and-red' => 'White and Red'
    }.freeze

    def self.ids = NAMES_BY_ID.keys

    def self.css_path(id) = "themes/#{id}-theme.css"

    def self.scss_path(id) = "framework/themes/#{id}-theme.scss"

    # [{ id: 'none', name: 'Default' }, ...] for the docs screen picker.
    def self.picker_options
      [{ id: 'none', name: 'Default' }] + NAMES_BY_ID.map { |id, name| { id:, name: } }
    end
  end
end
