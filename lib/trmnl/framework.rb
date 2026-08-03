# frozen_string_literal: true

require "trmnl/framework/version"
require "trmnl/framework/engine"
require "trmnl/framework/routes"
require "trmnl/framework/static"

module Framework
  # Source of truth for YAML data, Sass, and the release archive.
  def self.data_root = Engine.root

  # Always the gem archive. Hosts serve these URLs via Framework::Static;
  # they never copy public/css|js into the app tree.
  def self.public_root = Engine.root.join("public")

  def self.release_public_root = public_root

  # Local docs server (bin/dev). Not used in production hosts.
  def self.server_builds = Engine.root.join("server/app/assets/builds")

  # Device appearance font bundles (mother-app UI). Override via
  # config.trmnl_framework.font_family_options if the host needs a different set.
  def self.font_family_options
    configured = Rails.application.config.trmnl_framework.font_family_options
    configured.presence || [["TRMNL", "trmnl"], ["Classic", "classic"]]
  end

  def self.font_family_ids = font_family_options.map { |_, id| id }

  # Base class for the engine's controllers. A host that wants the engine on its own
  # base controller (or has no ::ApplicationController at all) sets
  # config.trmnl_framework.parent_controller; the engine's controllers subclass whatever
  # this resolves to, so the host's own filters run around every docs action.
  def self.parent_controller
    Rails.application.config.trmnl_framework.parent_controller.presence || "::ApplicationController"
  end

  def self.parent_controller_class = parent_controller.constantize

  # Where /framework/* redirects and command-palette docs links land.
  # Prefer config.trmnl_framework.docs_base_url, then the host's config.x.docs_base_url,
  # then credentials, then the env default. Every absolute docs URL the engine builds
  # goes through here, so setting either key is enough.
  def self.docs_base_url
    configured = Rails.application.config.trmnl_framework.docs_base_url
    return configured if configured.present?

    host_configured = Rails.application.config.x.docs_base_url
    return host_configured if host_configured.present?

    Rails.application.credentials.framework_docs_url.presence ||
      (Rails.env.development? ? "http://localhost:3001" : "https://trmnl.com")
  end
end
