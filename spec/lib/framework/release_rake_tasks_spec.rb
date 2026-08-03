# frozen_string_literal: true

require 'rails_helper'
require 'rake'

# The rake entry points are where a re-cut of a frozen version has to be refused. Their
# `build` prerequisite regenerates the tracked color SCSS and recompiles the bundle before
# ReleaseTask#call is ever reached, so a guard that lives only inside the task refuses with
# a modified working tree already behind it. Each bump therefore declares its own guard
# task ahead of :build.
RSpec.describe 'framework:release rake wiring' do
  bump_types = %w[current major minor patch].freeze

  before(:all) do
    Rails.application.load_tasks unless Rake::Task.task_defined?('framework:release:patch')
  end

  bump_types.each do |bump_type|
    describe "framework:release:#{bump_type}" do
      let(:prerequisites) { Rake::Task["framework:release:#{bump_type}"].prerequisites }

      it 'runs its freeze guard before the build' do
        expect(prerequisites.index("verify_#{bump_type}")).to be < prerequisites.index('build')
      end

      it 'boots Rails before the guard that needs it' do
        expect(prerequisites.index('environment')).to be < prerequisites.index("verify_#{bump_type}")
      end
    end
  end

  # The guard tasks are wiring, not entry points: they carry no description so `rake -T`
  # keeps listing the four releases and nothing else.
  describe 'the guard tasks' do
    it 'defines one per bump type' do
      defined = bump_types.select { |bump| Rake::Task.task_defined?("framework:release:verify_#{bump}") }
      expect(defined).to eq(bump_types)
    end
  end
end
