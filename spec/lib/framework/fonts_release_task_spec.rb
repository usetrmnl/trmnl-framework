# frozen_string_literal: true

require 'rails_helper'
require 'digest'
require 'tmpdir'
require 'zip'

RSpec.describe Framework::FontsReleaseTask do
  subject(:fonts_release_task) { described_class.new(logger: null_logger, fonts_module: fonts_module) }

  let(:null_logger) { double('logger').as_null_object }

  let(:trmnl_font) do
    {
      family: 'TRMNL16',
      files: ['TRMNL16-Regular.ttf'],
      license: 'SIL Open Font License v1.1',
      license_id: 'ofl',
      copyright: 'Copyright © 2026 Heavyweight Digital Type Foundry s.r.o.'
    }
  end

  let(:shared_font) do
    {
      family: 'Inter Variable',
      files: ['Inter.ttf'],
      license: 'SIL Open Font License v1.1',
      license_id: 'ofl',
      copyright: 'Copyright (c) 2016-2020 The Inter Project Authors'
    }
  end

  let(:fonts_module) { double('Framework::Fonts', shared: [shared_font]) }

  def task_rooted_at(root)
    described_class.new(root_dir: root, logger: null_logger, fonts_module: fonts_module)
  end

  # The default logger is the seam every rake invocation crosses and no other example
  # exercises: cogger arrives via the gemspec, so Bundler never auto-requires it.
  describe 'default logger' do
    it 'builds without an injected logger' do
      expect { described_class.new }.not_to raise_error
    end
  end

  # `render_ofl_notice` produces the standalone OFL.txt shipped with each bundle:
  # one copyright line per OFL font, then the full license text.
  describe '#render_ofl_notice' do
    it 'stacks every OFL copyright line above the license text' do
      notice = fonts_release_task.send(:render_ofl_notice, { fonts: [trmnl_font] })

      expect(notice.lines.first(2).map(&:chomp)).to eq(
        [
          'Copyright © 2026 Heavyweight Digital Type Foundry s.r.o.',
          'Copyright (c) 2016-2020 The Inter Project Authors'
        ]
      )
      expect(notice).to include('SIL OPEN FONT LICENSE Version 1.1')
    end

    context 'when neither the bundle nor the shared fonts are OFL-licensed' do
      let(:fonts_module) { double('Framework::Fonts', shared: []) }

      it 'returns nil so no OFL.txt is emitted' do
        cc_font = trmnl_font.merge(license_id: 'cc-by-3.0')
        expect(fonts_release_task.send(:render_ofl_notice, { fonts: [cc_font] })).to be_nil
      end
    end
  end

  # `build_zip` returns the archive bytes. The zips are tracked multi-megabyte files, so the
  # bytes have to be a function of the fonts and the release date alone: rubyzip's own
  # timestamps (source mtime for added files, wall-clock for streamed ones) survive neither
  # a fresh checkout nor a second run.
  describe '#build_zip' do
    # Rooted at a seeded copy of the fonts yml so the entry timestamps assert a fixed date
    # rather than whatever the repo's fonts release currently records.
    subject(:fonts_release_task) { task_rooted_at(seeded_root) }

    let(:seeded_root) do
      root = Pathname.new(Dir.mktmpdir)
      path = root.join('db', 'data', 'framework_fonts.yml')
      FileUtils.mkdir_p(path.dirname)
      path.write("released_at: 2026-07-25\n")
      root
    end

    after { FileUtils.remove_entry(seeded_root) }

    def zip_bytes(file_paths: [], markdown: '# readme', ofl_notice: 'notice')
      fonts_release_task.send(:build_zip, file_paths: file_paths, markdown: markdown, ofl_notice: ofl_notice)
    end

    # Zip::File.open_buffer returns the buffer, not the block value, so read through a local.
    def read_entries(bytes)
      entries = nil
      Zip::File.open_buffer(StringIO.new(bytes)) { |zip| entries = zip.map { |entry| [entry.name, entry.time] } }
      entries
    end

    def entry_names(bytes) = read_entries(bytes).map(&:first)

    it 'embeds OFL.txt alongside the fonts and readme' do
      Dir.mktmpdir do |dir|
        font_path = Pathname.new(dir).join('TRMNL16-Regular.ttf')
        File.write(font_path, 'stub')

        expect(entry_names(zip_bytes(file_paths: [font_path])))
          .to contain_exactly('TRMNL16-Regular.ttf', 'README.md', 'OFL.txt')
      end
    end

    it 'omits OFL.txt when there is no notice' do
      expect(entry_names(zip_bytes(ofl_notice: nil))).to contain_exactly('README.md')
    end

    it 'sorts the font entries by name' do
      Dir.mktmpdir do |dir|
        paths = %w[Inter.ttf BlockKie.ttf TRMNL16-Regular.ttf].map do |name|
          Pathname.new(dir).join(name).tap { |path| File.write(path, 'stub') }
        end

        expect(entry_names(zip_bytes(file_paths: paths)).first(3))
          .to eq(%w[BlockKie.ttf Inter.ttf TRMNL16-Regular.ttf])
      end
    end

    it 'stamps every entry with midnight UTC of the recorded release date' do
      times = read_entries(zip_bytes).map { |_name, time| time.to_i }
      expect(times).to all(eq(Time.utc(2026, 7, 25).to_i))
    end

    it 'produces identical bytes for identical input' do
      Dir.mktmpdir do |dir|
        font_path = Pathname.new(dir).join('TRMNL16-Regular.ttf')
        File.write(font_path, 'stub')

        expect(zip_bytes(file_paths: [font_path])).to eq(zip_bytes(file_paths: [font_path]))
      end
    end

    # rubyzip records each entry's instant in a UniversalTime extra field, so a stamp
    # built from local midnight would shift with the writer's timezone and the tracked
    # multi-megabyte zips would churn whenever a different machine cut them. zip_timestamp
    # builds the stamp in UTC; CRuby re-reads ENV['TZ'] on every time conversion, so
    # flipping it in-process exercises real timezone-dependent writers.
    it 'produces identical bytes in different writer timezones' do
      utc = with_tz('UTC') { zip_bytes }
      berlin = with_tz('Europe/Berlin') { zip_bytes }
      expect(berlin).to eq(utc)
    end
  end

  # A bundle that names a `fonts_only_zip` publishes a second archive: its own families
  # without the shared high-density face. Core's Font Family page links the trmnl one as
  # its download, and until this task produced it, the committed copy carried an OFL.txt
  # crediting Inter (which it does not ship) and no README at all.
  describe 'fonts-only archive' do
    subject(:fonts_release_task) { task_rooted_at(seeded_root) }

    let(:trmnl_font) do
      {
        family: 'TRMNL16', size: '16px', desc: 'The workhorse font.',
        weights: %w[normal bold], formats: %w[ttf], files: ['TRMNL16-Regular.ttf'],
        designer: 'Heavyweight Digital Type Foundry', designer_url: 'https://heavyweight-type.com',
        license: 'SIL Open Font License v1.1', license_id: 'ofl',
        license_url: 'https://scripts.sil.org/OFL',
        copyright: 'Copyright © 2026 Heavyweight Digital Type Foundry s.r.o.'
      }
    end

    let(:shared_font) do
      {
        family: 'Inter Variable', desc: 'Used on high-density displays.',
        weights: %w[normal], files: ['Inter.ttf'],
        designer: 'Rasmus Andersson', designer_url: 'https://rsms.me/inter',
        license: 'SIL Open Font License v1.1', license_id: 'ofl',
        license_url: 'https://scripts.sil.org/OFL',
        copyright: 'Copyright (c) 2016-2020 The Inter Project Authors'
      }
    end

    let(:bundle) do
      {
        label: 'TRMNL', class_name: 'screen--fonts-trmnl',
        blurb: 'One family, two weights.', fonts: [trmnl_font],
        fonts_only_zip: 'trmnl-fonts--trmnl-only.zip'
      }
    end

    let(:fonts_module) { double('Framework::Fonts', shared: [shared_font], bundle: bundle) }

    # Seeded with the two font binaries and a fixed released_at, so the archives are a
    # function of the fonts data alone the way a real run is.
    let(:seeded_root) do
      root = Pathname.new(Dir.mktmpdir)
      yml = root.join('db', 'data', 'framework_fonts.yml')
      FileUtils.mkdir_p(yml.dirname)
      yml.write("released_at: 2026-07-25\n")
      FileUtils.mkdir_p(root.join('public', 'fonts'))
      %w[TRMNL16-Regular.ttf Inter.ttf].each { |name| root.join('public', 'fonts', name).write('stub') }
      root
    end

    let(:artifacts) { fonts_release_task.send(:render_bundle, :trmnl) }

    after { FileUtils.remove_entry(seeded_root) }

    def entries(bytes)
      read = nil
      Zip::File.open_buffer(StringIO.new(bytes)) do |zip|
        read = zip.to_h { |entry| [entry.name, entry.get_input_stream.read] }
      end
      read
    end

    it 'publishes it alongside the full bundle archive' do
      expect(artifacts.keys)
        .to contain_exactly('README.md', 'OFL.txt', 'trmnl-fonts-bundle--trmnl.zip',
                            'trmnl-fonts--trmnl-only.zip')
    end

    it 'ships the bundle families without the shared high-density face' do
      expect(entries(artifacts['trmnl-fonts--trmnl-only.zip']).keys)
        .to contain_exactly('TRMNL16-Regular.ttf', 'README.md', 'OFL.txt')
    end

    it 'credits only the fonts it ships in its OFL notice' do
      ofl = entries(artifacts['trmnl-fonts--trmnl-only.zip'])['OFL.txt']

      aggregate_failures do
        expect(ofl).to include('Heavyweight Digital Type Foundry')
        expect(ofl).not_to include('The Inter Project Authors')
      end
    end

    # The intro still points at the full bundle as the place Inter comes from, which is
    # why this asserts on the credits rather than on the name.
    it 'documents only the fonts it ships in its README' do
      readme = entries(artifacts['trmnl-fonts--trmnl-only.zip'])['README.md']

      aggregate_failures do
        expect(readme).to include('TRMNL16')
        expect(readme).not_to include('High-density font')
        expect(readme).not_to include('Rasmus Andersson')
        expect(readme).not_to include('Inter.ttf')
      end
    end

    it 'leaves the full bundle archive crediting the shared face' do
      full = entries(artifacts['trmnl-fonts-bundle--trmnl.zip'])

      aggregate_failures do
        expect(full.keys).to include('Inter.ttf')
        expect(full['OFL.txt']).to include('The Inter Project Authors')
        expect(full['README.md']).to include('High-density font')
      end
    end

    context 'when the bundle names no fonts-only archive' do
      let(:bundle) { super().except(:fonts_only_zip) }

      it 'publishes the full bundle and nothing else' do
        expect(artifacts.keys).to contain_exactly('README.md', 'OFL.txt', 'trmnl-fonts-bundle--trmnl.zip')
      end
    end
  end

  # The committed copy is a shipped download: core's Font Family page links it. It went
  # stale precisely because nothing produced it, so this renders it from the fonts data on
  # every run and compares the archive against what is on disk.
  #
  # File bytes, not just contents: zip_timestamp stamps every entry at midnight UTC of the
  # recorded release date, so the archive is a function of the fonts data, the font
  # binaries, and that date alone, and a render on any machine in any timezone must
  # reproduce the committed bytes exactly. This used to be a contents-only compare, because
  # the stamps were built from local midnight and the writer's zone leaked into a
  # UniversalTime extra field. The digest compare keeps a mismatch's failure output at one
  # line instead of two multi-megabyte strings.
  describe 'the committed fonts-only archive' do
    subject(:fonts_release_task) { described_class.new(logger: null_logger) }

    let(:committed) do
      Framework::Engine.root.join('public', 'fonts', 'bundles', 'trmnl', 'trmnl-fonts--trmnl-only.zip')
    end

    let(:rendered) do
      bundle = Framework::Fonts.bundle(:trmnl)
      fonts_release_task.send(:render_fonts_only_zip, bundle).fetch(bundle.fetch(:fonts_only_zip))
    end

    def entry_times(bytes)
      read = nil
      Zip::File.open_buffer(StringIO.new(bytes)) { |zip| read = zip.map { |entry| entry.time.to_i } }
      read
    end

    it 'carries exactly the bytes the task renders from the fonts data' do
      expect(Digest::SHA256.hexdigest(rendered)).to eq(Digest::SHA256.hexdigest(committed.binread))
    end

    it 'stamps every one of its entries at midnight UTC of the recorded release date' do
      date = fonts_release_task.send(:recorded_released_at)
      expect(entry_times(committed.binread).uniq).to eq([Time.utc(date.year, date.month, date.day).to_i])
    end
  end

  # The bundle is only rewritten when its rendered bytes differ from what is on disk, which
  # is what keeps a no-op run from churning the tracked archives and the fonts yml date.
  describe '#bundle_written?' do
    let(:artifacts) { { 'README.md' => '# readme', 'bundle.zip' => 'zip bytes' } }

    def with_bundle_dir(files)
      Dir.mktmpdir do |dir|
        root = Pathname.new(dir)
        bundle_dir = root.join('public', 'fonts', 'bundles', 'trmnl')
        FileUtils.mkdir_p(bundle_dir)
        files.each { |name, contents| bundle_dir.join(name).binwrite(contents) }
        yield task_rooted_at(root)
      end
    end

    it 'is true when every rendered file already matches on disk' do
      with_bundle_dir(artifacts) do |task|
        expect(task.send(:bundle_written?, :trmnl, artifacts)).to be(true)
      end
    end

    it 'is false when a rendered file differs' do
      with_bundle_dir(artifacts.merge('bundle.zip' => 'other bytes')) do |task|
        expect(task.send(:bundle_written?, :trmnl, artifacts)).to be(false)
      end
    end

    it 'is false when a rendered file is missing' do
      with_bundle_dir(artifacts.except('bundle.zip')) do |task|
        expect(task.send(:bundle_written?, :trmnl, artifacts)).to be(false)
      end
    end
  end
end
