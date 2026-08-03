# frozen_string_literal: true

require_relative "lib/trmnl_framework/version"
require_relative "lib/trmnl_framework/package"

Gem::Specification.new do |spec|
  spec.name = "trmnl_framework"
  spec.version = Framework::VERSION
  spec.authors = ["TRMNL"]
  spec.email = ["lucian@trmnl.com"]

  spec.summary = "TRMNL ePaper design system: Sass, terminalize runtime, docs site, and release pipeline"
  spec.description = <<~DESC
    Rails engine that hosts the TRMNL design framework documentation and ships
    versioned plugins.css / plugins.js bundles for the plugin rendering pipeline.
  DESC
  spec.homepage = "https://github.com/usetrmnl/trmnl-framework"
  spec.license = "MIT"
  # Ruby 4.0 by owner decision, not by accident: the framework tracks the Ruby the docs
  # server and the release pipeline run on (.ruby-version), and supporting a 3.x branch
  # is not a commitment this project makes. Stated in README "Requirements" and in
  # docs/ENGINE_INTEGRATION.md so an adopter reads it before bundling.
  spec.required_ruby_version = ">= 4.0.0"

  # Framework::Package builds the same list from git or, in a source tarball with no .git,
  # from the packaged subtrees. spec/lib/framework/package_spec.rb holds the two to each other.
  spec.files = Framework::Package.files

  spec.require_paths = ["lib"]

  # Runtime dependencies are what mounting the engine needs and nothing else. Rails is
  # taken apart on purpose: the engine boots action_controller and action_view only
  # (lib/trmnl_framework/engine.rb), and the reference host runs with no database, so a
  # host adopting a design system should not inherit ActiveRecord, ActionMailer,
  # ActionCable and ActiveStorage with it.
  #
  # The build-only gems (cogger, reverse_markdown, rubyzip, tailwindcss-rails) sit in
  # the Gemfile's development/test group instead. Every one is required lazily at the
  # rake task or release-class seam that uses it, so the engine boots without them.
  spec.add_dependency "actionpack", "~> 8.1"
  spec.add_dependency "actionview", "~> 8.1"
  spec.add_dependency "activesupport", "~> 8.1"
  spec.add_dependency "dartsass-rails", "~> 0.5.1"
  spec.add_dependency "importmap-rails"
  spec.add_dependency "propshaft"
  spec.add_dependency "railties", "~> 8.1"
  spec.add_dependency "redcarpet"
  # A range, not the Gemfile's exact "1.93.3" pin, and deliberately so: byte-parity binds
  # the artifacts committed in this repo (public/css, public/js), which are built here
  # with that pin, not a host's own compile of the Sass sources. 1.101.0 is recorded as
  # byte-identical on those artifacts, so the two versions checked against them agree and
  # a host resolving anywhere in this range is not a parity risk. dartsass-rails already
  # requires ~> 1.63; this entry only raises that floor.
  spec.add_dependency "sass-embedded", "~> 1.93"
  spec.add_dependency "stimulus-rails"
  spec.add_dependency "turbo-rails"
  spec.add_dependency "view_component"
  spec.metadata['rubygems_mfa_required'] = 'true'
end
