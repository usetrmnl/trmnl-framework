# frozen_string_literal: true

# Plain RSpec configuration, loaded by every run via .rspec. Rails is layered on top in
# spec/rails_helper.rb; keep anything Rails-specific out of this file.
RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups

  config.filter_run_when_matching :focus
  config.disable_monkey_patching!

  # The RSpec half of `forbidOnly` (test/runtime/playwright.config.js:14,
  # test/visual/playwright.config.js:17). A committed `fit`, `fdescribe`, or `:focus`
  # tag narrows the run to that one example and still exits 0, so CI would report a
  # green suite that asserted almost nothing. The filter stays on locally, where
  # focusing is how you work; on CI the run refuses to start.
  config.before(:suite) do
    next unless ENV['CI']
    next unless RSpec.configuration.inclusion_filter.rules.key?(:focus)

    raise 'A focus filter (fit / fdescribe / :focus) is committed. Remove it: CI runs the whole suite.'
  end

  config.order = :random
  Kernel.srand config.seed
end
