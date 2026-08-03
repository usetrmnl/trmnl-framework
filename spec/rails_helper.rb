# frozen_string_literal: true

# Loads the Rails environment for specs. This is a no-database app: ActiveRecord is never
# required (see server/config/application.rb), so there is no schema check, no transactional
# fixtures. Specs exercise the framework's Ruby layer (release pipeline, version/token readers)
# and the docs request stack via the docs server.
require 'spec_helper'

ENV['RAILS_ENV'] ||= 'test'
require_relative '../server/config/environment'

# Guard the core invariant: if a change ever pulls ActiveRecord in, fail loudly here rather
# than let the suite silently grow a database dependency.
abort('ActiveRecord is loaded, but this app has no database. Remove the dependency.') if defined?(ActiveRecord::Base)

require 'rspec/rails'

# Support code every spec may reach for. FrameworkBuild compiles the Sass bundle the
# asset and docs specs read, once per rspec process however many groups ask for it.
Dir[File.expand_path('support/**/*.rb', __dir__)].each { |file| require file }

RSpec.configure do |config|
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
end
