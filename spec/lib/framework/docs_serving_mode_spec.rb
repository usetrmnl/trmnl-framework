# frozen_string_literal: true

require 'rails_helper'
require 'fileutils'
require 'tmpdir'

# The host half of the serving contract: which asset set a docs server links, before
# FrameworkController scopes it to a version. Every input is injected, so the whole
# matrix runs from a tmpdir without touching the process environment.
RSpec.describe Framework::DocsServingMode do
  # The framework repo's own server. This is what Rails.root already is under rspec,
  # so the predicate is exercised against the real thing rather than a stand-in.
  let(:repo_server_root) { Framework::Engine.root.join('server') }

  def mode(env: 'development', rails_root: repo_server_root, builds_dir: nil)
    described_class.new(env: ActiveSupport::StringInquirer.new(env), rails_root:, builds_dir:)
  end

  # A builds dir with everything the docs layout links, so live serving is on the table.
  def complete_builds(dir)
    root = Pathname(dir)
    described_class.new(rails_root: root).required_builds.each do |file|
      path = root.join('app/assets/builds', file)
      FileUtils.mkdir_p(path.dirname)
      path.write('/* built */')
    end
    root
  end

  describe 'the framework repo host' do
    it 'serves the live build with no marker file' do
      Dir.mktmpdir do |dir|
        expect(mode(builds_dir: complete_builds(dir).join('app/assets/builds'))).to be_live
      end
    end

    it 'recognises the engine server directory as its own host' do
      expect(mode).to be_framework_repo_host
    end

    it 'does not mistake a consumer host for it' do
      Dir.mktmpdir { |dir| expect(mode(rails_root: Pathname(dir))).not_to be_framework_repo_host }
    end
  end

  # Hosts that mount the gem to read the docs keep the opt-in they have today: they
  # carry no framework checkout to rebuild, so a live bundle there is whatever was
  # last compiled somewhere else.
  describe 'a consumer host' do
    it 'serves released assets without the development marker' do
      Dir.mktmpdir do |dir|
        root = complete_builds(dir)

        aggregate_failures do
          expect(mode(rails_root: root)).not_to be_live
          expect(mode(rails_root: root).reason).to eq(:marker_off)
        end
      end
    end

    it 'serves the live build once the development marker is written' do
      Dir.mktmpdir do |dir|
        root = complete_builds(dir)
        FileUtils.mkdir_p(root.join('tmp'))
        FileUtils.touch(root.join(described_class::DEVELOPMENT_MARKER))

        expect(mode(rails_root: root)).to be_live
      end
    end

    # Framework::Version.development_mode? is the mother app's plugin-view API and
    # resolves this path itself. Both have to name the same file or a host that ran
    # framework:development:enable would get half the switch.
    it 'reads the same marker file Framework::Version does' do
      source = Framework::Engine.root.join('lib/framework/version.rb').read

      expect(source).to include(%("#{described_class::DEVELOPMENT_MARKER}"))
    end
  end

  # Checked ahead of the host question, so it covers the framework repo (where live is
  # the default) and a consumer host that turned live serving on.
  describe 'the release preview opt-out' do
    it 'forces released assets on a host that is otherwise live' do
      Dir.mktmpdir do |dir|
        root = complete_builds(dir)
        FileUtils.mkdir_p(root.join('tmp'))
        FileUtils.touch(root.join(described_class::DEVELOPMENT_MARKER))
        was_live = mode(rails_root: root).live?

        FileUtils.touch(root.join(described_class::RELEASE_PREVIEW_MARKER))

        aggregate_failures do
          expect(was_live).to be(true)
          expect(mode(rails_root: root)).not_to be_live
          expect(mode(rails_root: root).reason).to eq(:release_preview)
          expect(mode(rails_root: root).explanation).to include('framework:release_preview:disable')
        end
      end
    end
  end

  describe 'an incomplete build' do
    it 'names the first missing file rather than serving half a bundle' do
      Dir.mktmpdir do |dir|
        root = complete_builds(dir)
        missing = root.join('app/assets/builds', Framework::Themes.css_path(Framework::Themes.ids.last))
        FileUtils.rm_f(missing)

        incomplete = mode(builds_dir: root.join('app/assets/builds'))

        aggregate_failures do
          expect(incomplete).not_to be_live
          expect(incomplete.reason).to eq(:incomplete_build)
          expect(incomplete.missing_build).to eq(Framework::Themes.css_path(Framework::Themes.ids.last))
          expect(incomplete.explanation).to include('Run bin/dev')
        end
      end
    end

    # The bundle alone used to be the gate, so a tree with plugins.css and nothing else
    # went live and left the layout looking up files that were never compiled.
    it 'requires the harness and every theme, not just the bundle' do
      Dir.mktmpdir do |dir|
        builds = Pathname(dir).join('builds')
        FileUtils.mkdir_p(builds)
        builds.join('plugins.css').write('/* built */')

        expect(mode(builds_dir: builds).reason).to eq(:incomplete_build)
      end
    end

    it 'lists the harness and every registered theme' do
      expect(mode.required_builds).to contain_exactly(
        'plugins.css', 'framework/responsive_test.css', *Framework::Themes.ids.map { |id| Framework::Themes.css_path(id) }
      )
    end
  end

  describe 'outside development' do
    it 'never serves live, whatever is on disk' do
      Dir.mktmpdir do |dir|
        root = complete_builds(dir)
        FileUtils.mkdir_p(root.join('tmp'))
        FileUtils.touch(root.join(described_class::DEVELOPMENT_MARKER))

        aggregate_failures do
          expect(mode(env: 'production', rails_root: root)).not_to be_live
          expect(mode(env: 'test', rails_root: root).reason).to eq(:not_development)
        end
      end
    end
  end

  describe '#build_fingerprint' do
    it 'is nil unless the host serves live, so deployed cache keys keep their shape' do
      expect(described_class.current.build_fingerprint).to be_nil
    end

    it 'moves when a build file is rewritten' do
      Dir.mktmpdir do |dir|
        builds = complete_builds(dir).join('app/assets/builds')
        before = mode(builds_dir: builds).build_fingerprint

        FileUtils.touch(builds.join('plugins.css'), mtime: Time.current.to_time + 60)

        aggregate_failures do
          expect(before).to be_a(Integer)
          expect(mode(builds_dir: builds).build_fingerprint).to be > before
        end
      end
    end
  end
end
