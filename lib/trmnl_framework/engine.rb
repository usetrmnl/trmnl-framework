# frozen_string_literal: true

require "rails"
require "action_controller/railtie"
require "action_view/railtie"
require "propshaft"
require "importmap-rails"
require "turbo-rails"
require "stimulus-rails"
require "dartsass-rails"
require "view_component"

module Framework
  class Engine < ::Rails::Engine
    # Controllers/helpers keep host-level names (FrameworkController, FrameworkHelper)
    # so mother-app route helpers and plugin locals stay unchanged. Do not isolate.
    engine_name "trmnl_framework"

    config.trmnl_framework = ActiveSupport::OrderedOptions.new
    config.trmnl_framework.parent_controller = "::ApplicationController"
    config.trmnl_framework.docs_base_url = nil
    config.trmnl_framework.font_family_options = nil

    # Zeitwerk-load lib/framework/* (and friends). Engines do not get Application#autoload_lib.
    config.autoload_paths << root.join("lib")
    config.eager_load_paths << root.join("lib")

    initializer "trmnl_framework.ignore_lib_tooling" do
      Rails.autoloaders.main.ignore(
        root.join("lib/tasks"),
        root.join("lib/procss"),
        root.join("lib/projs"),
        root.join("lib/rulediff"),
        root.join("lib/trmnl_framework.rb"),
        root.join("lib/trmnl_framework")
      )
    end

    # One line at boot naming the asset set the docs will link and why, so a page that
    # ignores a Sass edit is diagnosable without reading the controller. Development
    # only: nowhere else can serve anything but the releases.
    initializer "trmnl_framework.docs_serving_mode" do |app|
      next unless Rails.env.development?

      app.config.after_initialize do
        mode = Framework::DocsServingMode.current
        Rails.logger&.info("[trmnl_framework] docs assets: #{mode.explanation}")
      end
    end

    # Serve gem public/ (and docs/dev fallbacks) so hosts never copy release assets.
    initializer "trmnl_framework.static", before: :build_middleware_stack do |app|
      require "trmnl_framework/static" unless defined?(Framework::Static)
      app.middleware.unshift(Framework::Static, root)
    end

    # Sass SOURCE is compiled by dartsass into builds/; only builds are served.
    initializer "trmnl_framework.assets" do |app|
      app.config.assets.excluded_paths << root.join("app/assets/stylesheets")
      app.config.assets.paths << root.join("app/assets/static")
      app.config.assets.paths << root.join("vendor/javascript")
      app.config.assets.paths << root.join("app/javascript")
    end

    initializer "trmnl_framework.importmap", before: "importmap" do |app|
      app.config.importmap.paths << root.join("config/importmap.rb")
      app.config.importmap.cache_sweepers << root.join("app/javascript")
    end

    initializer "trmnl_framework.dartsass" do |app|
      theme_builds = Dir.glob(root.join("app/assets/stylesheets/framework/themes/[a-z]*-theme.scss")).to_h do |path|
        id = File.basename(path, ".scss").delete_suffix("-theme")
        ["framework/themes/#{id}-theme.scss", "themes/#{id}-theme.css"]
      end

      framework_builds = {
        "plugins.scss" => "plugins.css",
        "plugins_legacy.scss" => "plugins_legacy.css",
        "framework/responsive_test.scss" => "framework/responsive_test.css"
      }.merge(theme_builds)

      # dartsass resolves build inputs against the HOST's app/assets/stylesheets, so
      # register a gem build only where the host carries that Sass root. The docs
      # server keeps thin shims for all of them; consumer hosts (core) ship none and
      # serve the released archive, so forcing the mappings there fails the build.
      framework_builds.select! { |input, _output| Rails.root.join("app/assets/stylesheets", input).exist? }

      host_builds = (app.config.dartsass.builds || {}).dup
      # dartsass-rails ships a default application.scss mapping; drop it when the host
      # never created that file (docs server) so builds do not fail on a missing input.
      if host_builds.key?("application.scss") &&
         !Rails.root.join("app/assets/stylesheets/application.scss").exist? &&
         !root.join("app/assets/stylesheets/application.scss").exist?
        host_builds.delete("application.scss")
      end

      # Merge without wiping host-specific bundles (core's plugins/* and system_screens/*).
      # On key collision, keep the host mapping so mother-app Sass roots still win.
      app.config.dartsass.builds = framework_builds.merge(host_builds) { |_key, _gem, host| host }

      # Host plugin/system-screen Sass `@use 'framework/...'` resolves against the gem.
      load_path = "--load-path=#{root.join('app/assets/stylesheets')}"
      options = app.config.dartsass.build_options
      options << load_path unless options.include?(load_path)
    end
  end
end
