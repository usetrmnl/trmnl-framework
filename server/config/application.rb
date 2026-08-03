# frozen_string_literal: true

require_relative "boot"

require "rails"
require "action_controller/railtie"
require "action_view/railtie"

Bundler.require(*Rails.groups)

require "trmnl/framework"

module FrameworkDocs
  class Application < Rails::Application
    config.load_defaults 8.1

    config.eager_load = false

    # Absolute-URL base for the docs (release download links, anchor copy links).
    config.x.docs_base_url = ENV.fetch("DOCS_BASE_URL", "http://localhost:3001")

    # Host builds dir (dartsass / tailwind write here via Rails.root).
    config.assets.paths << Rails.root.join("app/assets/builds")
  end
end
