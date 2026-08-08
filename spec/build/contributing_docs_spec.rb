# frozen_string_literal: true

require 'rails_helper'

# CONTRIBUTING is the page a first-time contributor runs before pushing, so the commands
# it lists have to be the ones CI gates on. It used to document the two node suites and
# call CI "the contract suites plus a Sass build", while a required RSpec check ran 528
# examples nobody was told about, plus a rubocop job and a color-token regeneration guard.
RSpec.describe 'CONTRIBUTING' do
  root = Framework::Engine.root
  contributing = File.read(root.join('CONTRIBUTING.md'))

  section = lambda do |heading|
    contributing[/^## #{Regexp.escape(heading)}$(.*?)(?=^## |\z)/m, 1].to_s
  end

  tests_section = section.call('Run the tests')
  pull_request_section = section.call('What makes a good PR')

  it 'finds the sections it checks' do
    aggregate_failures do
      expect(tests_section).not_to be_empty
      expect(pull_request_section).not_to be_empty
    end
  end

  it 'documents the ruby suite where the test commands live' do
    expect(tests_section).to include('bundle exec rspec')
  end

  it 'asks for it in the pull request checklist' do
    expect(pull_request_section).to include('bundle exec rspec')
  end

  # One entry per job in ci.yml, so a job that changes what a contributor has to run
  # locally shows up here rather than as a surprise red check on their first push.
  job_descriptions = {
    'js-tests' => /contract suites/i,
    'rubocop' => /rubocop/i,
    'sass-build' => /Sass build/i,
    'color-tokens' => /color[- ]tokens/i,
    'em-dashes' => /em-dash/i,
    'rspec-shard' => /shards/i,
    'rspec' => /Ruby suite/i,
    'processed-bundle' => /processed[- ]bundle/i,
    'playwright-runtime' => /runtime suite/i,
    'playwright-visual' => /visual suite/i,
    'playwright-release' => /release suite/i
  }.freeze

  job_descriptions.each do |job, pattern|
    it "describes the #{job} job" do
      expect(tests_section).to match(pattern)
    end
  end

  it 'covers every job ci.yml defines' do
    jobs = YAML.load_file(root.join('.github', 'workflows', 'ci.yml')).fetch('jobs').keys
    expect(job_descriptions.keys).to match_array(jobs)
  end
end
