# The docs version is a path segment on /framework/docs/:version and nowhere else, but
# FrameworkController#default_url_options feeds it to every URL generated while rendering
# a docs page. Rails puts an option a route cannot place in its path into the query
# string, so /framework/examples came out as /framework/examples?version=3.2, and those
# pages then published that query in their own canonical tag.
#
# These are the framework routes with no :version segment. Nulling the option here scopes
# the controller default to the docs routes without every call site remembering to pass
# `version: nil`; a nil is dropped before the query string is built.
# Guarded by spec/requests/framework_docs_link_versioning_spec.rb.
module FrameworkRoutesHelper
  UNVERSIONED_FRAMEWORK_ROUTES = %w[
    framework
    framework_examples_index
    framework_example_show
    framework_layout_examples
    framework_releases_index
  ].freeze

  UNVERSIONED_FRAMEWORK_ROUTES.each do |route|
    ["#{route}_path", "#{route}_url"].each do |helper|
      define_method(helper) do |*args, **options|
        super(*args, **options, version: nil)
      end
    end
  end
end
