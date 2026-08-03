# frozen_string_literal: true

require 'rails_helper'
require 'json'
require 'yaml'

# .nvmrc is the single Node pin. RELEASE.md counts a pinned Node toolchain as part of the
# byte-for-byte rebuild guarantee, and the version used to be stated four different ways:
# .nvmrc, a looser package.json engines floor, the same literal copied into five workflow
# steps, and a nodesource setup_24.x line in the Dockerfile that installed whatever 24.x
# was current at image build time. Every copy now reads the file or matches it, and this
# is the check that says so.
RSpec.describe 'Node version pins' do
  root = Framework::Engine.root
  pinned = File.read(root.join('.nvmrc')).strip

  # Every setup-node step across every workflow, as [workflow, job, with-hash]. Read once
  # at load time, the way the other file-reading specs in this suite do.
  setup_node_steps = Dir[root.join('.github', 'workflows', '*.yml').to_s].flat_map do |path|
    YAML.load_file(path).fetch('jobs', {}).flat_map do |job_name, job|
      job.fetch('steps', []).filter_map do |step|
        next unless step['uses'].to_s.start_with?('actions/setup-node')

        [File.basename(path), job_name, step.fetch('with', {})]
      end
    end
  end

  it 'pins one exact version in .nvmrc' do
    expect(pinned).to match(/\A\d+\.\d+\.\d+\z/)
  end

  it 'floors the package.json engines range at that version' do
    engines = JSON.parse(File.read(root.join('package.json'))).dig('engines', 'node')
    expect(engines).to eq(">=#{pinned}")
  end

  # npm rewrites the lockfile's root package entry from package.json, so a floor that
  # moves in one and not the other lands as an unattributed diff in the next release.
  it 'floors the lockfile header at the same version' do
    lock = JSON.parse(File.read(root.join('package-lock.json')))
    expect(lock.dig('packages', '', 'engines', 'node')).to eq(">=#{pinned}")
  end

  describe 'the workflows' do
    it 'sets up node somewhere' do
      expect(setup_node_steps).not_to be_empty
    end

    it 'reads .nvmrc in every setup-node step' do
      offenders = setup_node_steps.reject { |_file, _job, with| with['node-version-file'] == '.nvmrc' }
      expect(offenders).to be_empty
    end

    it 'carries no hardcoded node-version literal' do
      offenders = setup_node_steps.select { |_file, _job, with| with.key?('node-version') }
      expect(offenders).to be_empty
    end
  end

  describe 'the Dockerfile' do
    dockerfile = File.read(root.join('Dockerfile'))

    it 'installs the version .nvmrc names' do
      aggregate_failures do
        expect(dockerfile).to include('COPY .nvmrc')
        expect(dockerfile).to include('node-v${node_version}-linux-${node_arch}.tar.xz')
      end
    end
  end

  # The sass-build job compiles through the sass binary the sass-embedded gem ships, and
  # copies the JS runtime with cp. Minification is the step that needs npm, and it runs in
  # the release pipeline, so an npm install here is pure cost on every pull request.
  describe 'the Sass build job' do
    job = YAML.load_file(root.join('.github', 'workflows', 'ci.yml')).fetch('jobs').fetch('sass-build')
    run_steps = job.fetch('steps').filter_map { |step| step['run'] }

    it 'runs bin/build' do
      expect(run_steps).to include('bundle exec bin/build')
    end

    it 'installs no npm dependencies' do
      expect(run_steps.grep(/npm/)).to be_empty
    end

    it 'sets up no node' do
      expect(job.fetch('steps').filter_map { |step| step['uses'] }.grep(/setup-node/)).to be_empty
    end
  end

  # bin/build is the reason the job needs no Node at all: it shells out to sass and cp.
  it 'keeps bin/build free of npm' do
    expect(File.read(root.join('bin', 'build'))).not_to match(/^\s*(npm|npx|node) /)
  end
end
