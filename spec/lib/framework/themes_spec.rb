# frozen_string_literal: true

require 'rails_helper'
require 'rake'
require 'tmpdir'
require 'fileutils'
require 'stringio'

RSpec.describe Framework::Themes do
  # The shipped theme sources live here. Discovery mirrors framework:themes:lint's own glob
  # ([a-z]*-theme.scss), so an underscore partial like _theme-boilerplate.scss is never
  # treated as a publishable theme.
  let(:themes_dir) { Framework::Engine.root.join('app/assets/stylesheets/framework/themes') }
  let(:theme_files) { Dir.glob(themes_dir.join('[a-z]*-theme.scss')) }
  let(:file_ids) { theme_files.map { |path| File.basename(path, '.scss').delete_suffix('-theme') } }

  describe '.ids' do
    it 'registers exactly the ids for which a <id>-theme.scss file exists on disk' do
      expect(described_class.ids).to match_array(file_ids)
    end
  end

  describe '.css_path' do
    it 'points at the published per-theme stylesheet for the id' do
      expect(described_class.css_path('black-and-yellow')).to eq('themes/black-and-yellow-theme.css')
    end
  end

  describe '.scss_path' do
    it 'points at the source SCSS partial for the id' do
      expect(described_class.scss_path('black-and-yellow')).to eq('framework/themes/black-and-yellow-theme.scss')
    end
  end

  describe '.picker_options' do
    it 'offers the default (unthemed) screen as the first option' do
      expect(described_class.picker_options.first).to eq(id: 'none', name: 'Default')
    end
  end

  # framework:themes:lint is the release gate that keeps theme files engine-safe and the
  # registry in sync. It is a rake task with no extracted method, so the behaviour is driven
  # through the task itself: the happy path runs read-only against the shipped files, and the
  # failure paths run against controlled fixtures in a tmpdir (Rails.root stubbed, as in
  # version_spec) so real theme files are never touched.
  describe 'rake framework:themes:lint' do
    before { Rails.application.load_tasks unless Rake::Task.task_defined?('framework:themes:lint') }

    context 'against the shipped theme files' do
      it 'passes without raising' do
        expect { run_lint }.not_to raise_error
      end
    end

    context 'when a theme overrides a protected paint var' do
      it 'fails the lint' do
        with_theme_files('black-and-yellow-theme.scss' => "  --bg-canvas: black;\n") do
          expect { run_lint }.to raise_error(/Protected theme variable overrides/)
        end
      end
    end

    context 'when a theme overrides a root palette var' do
      it 'fails the lint' do
        with_theme_files('black-and-yellow-theme.scss' => "  --gray-10: #ffffff;\n") do
          expect { run_lint }.to raise_error(/Protected theme variable overrides/)
        end
      end
    end

    context 'when the registry and the theme files drift apart' do
      it 'fails the lint' do
        with_theme_files('green-theme.scss' => "// clean\n") do
          expect { run_lint }.to raise_error(/out of sync/)
        end
      end
    end
  end

  # Re-enable and invoke the lint task, swallowing its console report so a failing run still
  # propagates its exception without polluting spec output.
  def run_lint
    original_stdout = $stdout
    $stdout = StringIO.new
    task = Rake::Task['framework:themes:lint']
    task.reenable
    task.invoke
  ensure
    $stdout = original_stdout
  end

  # Point Engine.root at a throwaway tree seeded with the given theme files, so the lint task
  # reads fixtures instead of the real sources. Every registered id gets a clean file first,
  # so a case that exercises one rule is not also tripping the registry check, and registering
  # a new theme never has to be repeated here.
  def with_theme_files(files)
    seeded = described_class.ids.to_h { |id| ["#{id}-theme.scss", "// clean\n"] }.merge(files)

    Dir.mktmpdir do |dir|
      root = Pathname.new(dir)
      seeded_dir = root.join('app/assets/stylesheets/framework/themes')
      FileUtils.mkdir_p(seeded_dir)
      seeded.each { |name, body| File.write(seeded_dir.join(name), body) }
      allow(Framework::Engine).to receive(:root).and_return(root)
      yield
    end
  end
end
