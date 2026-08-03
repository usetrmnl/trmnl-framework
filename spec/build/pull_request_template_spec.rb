# frozen_string_literal: true

require 'rails_helper'
require 'yaml'

# The checklist a contributor actually sees when opening a pull request has to name the
# checks that decide whether it goes green. It used to ask for two node suites, a Sass
# build and the em-dash script, while the Ruby suite, rubocop and the rule diff gated the
# merge unmentioned, so completing it honestly still left three red checks to discover.
#
# Same contract spec/build/contributing_docs_spec.rb enforces from the other end: that
# one pins the prose against the jobs, this one pins the box list.
RSpec.describe 'the pull request template' do
  root = Framework::Engine.root
  template = File.read(root.join('.github', 'pull_request_template.md'))
  checklist = template[/^## Checklist$(.*)/m, 1].to_s
  ci_yaml = File.read(root.join('.github', 'workflows', 'ci.yml'))

  it 'finds the checklist it checks' do
    expect(checklist).not_to be_empty
  end

  # Derived, not listed: every npm script a CI job runs is one a contributor can run
  # locally, so a new browser or contract job lands here the day its step does.
  ci_npm_scripts = ci_yaml.scan(/npm run (\S+)/).flatten.uniq

  it 'finds the npm scripts ci.yml runs' do
    expect(ci_npm_scripts).not_to be_empty
  end

  ci_npm_scripts.each do |script|
    it "asks for npm run #{script}" do
      expect(checklist).to include("npm run #{script}")
    end
  end

  # The Ruby half. These are commands rather than npm scripts, so they are named here,
  # one per CI job that runs them: rspec (behind the required RSpec check), rubocop, the
  # Sass build, and the em-dash grep.
  ['bundle exec rspec', 'bundle exec rubocop', 'bin/build', 'bin/check-em-dashes'].each do |command|
    it "asks for #{command}" do
      expect(checklist).to include(command)
    end
  end
end
