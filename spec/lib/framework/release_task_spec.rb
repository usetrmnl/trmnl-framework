# frozen_string_literal: true

require 'rails_helper'
require 'brotli'
require 'digest'
require 'tmpdir'
require 'zip'
require 'zlib'

RSpec.describe Framework::ReleaseTask do
  subject(:release_task) { described_class.new('current', logger: null_logger) }

  # The full release shells out (npm) and writes under public/; these specs cover only the
  # isolatable seams, so the logger is never exercised.
  let(:null_logger) { double('logger').as_null_object }

  # Throwaway repositories are how the tag-driven seams (the freeze guard and the
  # released_at refresh) get exercised against the real `git rev-parse` lookup.
  def git(root, *args)
    Kernel.system('git', '-C', root.to_s, '-c', 'user.name=spec', '-c', 'user.email=spec@example.com',
                  *args, out: File::NULL, err: File::NULL) || raise("git #{args.join(' ')} failed")
  end

  # The default logger is the one seam every rake invocation crosses and no other example
  # exercises (they all inject a null logger). Building it catches a missing require: cogger
  # arrives via the gemspec, so Bundler never auto-requires it.
  describe 'default logger' do
    it 'builds without an injected logger' do
      expect { described_class.new('current') }.not_to raise_error
    end
  end

  # `calculate_new_version` is the isolatable version-computation seam: a pure function of
  # (current version, bump type) with no file writes or shell-outs.
  describe 'version-bump math' do
    context 'with a current bump' do
      it 'keeps the current version' do
        expect(release_task.send(:calculate_new_version, '1.2.3', 'current')).to eq('1.2.3')
      end
    end

    context 'with a patch bump' do
      it 'increments the patch segment' do
        expect(release_task.send(:calculate_new_version, '1.2.3', 'patch')).to eq('1.2.4')
      end
    end

    context 'with a minor bump' do
      it 'increments minor and resets patch to zero' do
        expect(release_task.send(:calculate_new_version, '1.2.3', 'minor')).to eq('1.3.0')
      end
    end

    context 'with a major bump' do
      it 'increments major and resets minor and patch to zero' do
        expect(release_task.send(:calculate_new_version, '1.2.3', 'major')).to eq('2.0.0')
      end
    end

    context 'with an unrecognized bump type' do
      it 'raises an ArgumentError' do
        expect { release_task.send(:calculate_new_version, '1.2.3', 'nonsense') }
          .to raise_error(ArgumentError, /Invalid bump type/)
      end
    end
  end

  # `update_framework_versions` is the versions-file seam: it reads db/data/framework_versions.yml
  # under root_dir, repoints `latest`, appends a dated entry for genuinely new versions, and
  # re-dates an unpublished version it re-cuts (a published one is frozen, so its date stands).
  # Driving it against a Dir.mktmpdir copy keeps the real data file untouched.
  describe 'framework_versions.yml update semantics' do
    # One long-released version whose date predates today, so a wrongly re-stamped
    # released_at would be visible.
    let(:seed_yaml) do
      <<~YAML
        latest: 1.0.0
        versions:
        - number: 1.0.0
          released_at: '2024-01-01'
      YAML
    end

    # Roots a task at a throwaway copy of the versions file and yields it with the file path.
    def with_versions_file(yaml)
      Dir.mktmpdir do |dir|
        root = Pathname.new(dir)
        path = root.join('db', 'data', 'framework_versions.yml')
        FileUtils.mkdir_p(path.dirname)
        path.write(yaml)
        yield described_class.new('current', root_dir: root, logger: null_logger), path
      end
    end

    context 're-releasing an unpublished version' do
      it 'moves released_at to the date of the re-cut' do
        with_versions_file(seed_yaml) do |task, path|
          task.send(:update_framework_versions, '1.0.0')
          entry = YAML.load_file(path)['versions'].find { |v| v['number'] == '1.0.0' }
          expect(entry['released_at']).to eq(Time.zone.today.to_s)
        end
      end

      it 'does not append a duplicate entry' do
        with_versions_file(seed_yaml) do |task, path|
          task.send(:update_framework_versions, '1.0.0')
          numbers = YAML.load_file(path)['versions'].map { |v| v['number'] }
          expect(numbers).to eq(['1.0.0'])
        end
      end
    end

    context 'releasing a version not yet listed' do
      it 'appends the new version to the list' do
        with_versions_file(seed_yaml) do |task, path|
          task.send(:update_framework_versions, '1.1.0')
          numbers = YAML.load_file(path)['versions'].map { |v| v['number'] }
          expect(numbers).to eq(['1.0.0', '1.1.0'])
        end
      end

      it "stamps the new entry with today's date" do
        with_versions_file(seed_yaml) do |task, path|
          task.send(:update_framework_versions, '1.1.0')
          entry = YAML.load_file(path)['versions'].find { |v| v['number'] == '1.1.0' }
          expect(entry['released_at']).to eq(Time.zone.today.to_s)
        end
      end

      it 'repoints latest at the new version' do
        with_versions_file(seed_yaml) do |task, path|
          task.send(:update_framework_versions, '1.1.0')
          expect(YAML.load_file(path)['latest']).to eq('1.1.0')
        end
      end
    end

    # The rebuild-from-tag flow reproduces a frozen release, and release_timestamp stamps
    # every zip entry from released_at, so re-dating a published version would make the
    # rebuild drift from the artifacts the tag published.
    context 'rebuilding a published version from its tag' do
      it 'preserves the stored released_at' do
        Dir.mktmpdir do |dir|
          root = Pathname.new(dir)
          path = root.join('db', 'data', 'framework_versions.yml')
          FileUtils.mkdir_p(path.dirname)
          path.write(seed_yaml)
          git(root, 'init', '-q')
          git(root, 'add', '-A')
          git(root, 'commit', '-q', '-m', 'release')
          git(root, 'tag', '-a', 'v1.0.0', '-m', 'Framework 1.0.0')

          described_class.new('current', root_dir: root, logger: null_logger)
                         .send(:update_framework_versions, '1.0.0')

          entry = YAML.load_file(path)['versions'].find { |v| v['number'] == '1.0.0' }
          expect(entry['released_at']).to eq('2024-01-01')
        end
      end
    end
  end

  # `ensure_version_unpublished` is the freeze seam: a pushed v<version> tag means the
  # version is public and immutable, so a re-cut must be refused unless HEAD is the tagged
  # commit itself (the rebuild-from-tag flow in RELEASE.md). Driving it against throwaway
  # git repositories exercises the real tag lookup.
  describe 'published-version freeze guard' do
    def guard_at(root, version)
      task = described_class.new('current', root_dir: root, logger: null_logger)
      task.instance_variable_set(:@new_version, version)
      task.send(:ensure_version_unpublished)
    end

    context 'when the version has no tag' do
      it 'allows the release' do
        Dir.mktmpdir do |dir|
          root = Pathname.new(dir)
          git(root, 'init', '-q')
          git(root, 'commit', '--allow-empty', '-m', 'release')
          expect { guard_at(root, '9.9.9') }.not_to raise_error
        end
      end
    end

    context 'when the version is tagged and HEAD has moved on' do
      it 'refuses the re-cut' do
        Dir.mktmpdir do |dir|
          root = Pathname.new(dir)
          git(root, 'init', '-q')
          git(root, 'commit', '--allow-empty', '-m', 'release')
          git(root, 'tag', '-a', 'v9.9.9', '-m', 'Framework 9.9.9')
          git(root, 'commit', '--allow-empty', '-m', 'after release')
          expect { guard_at(root, '9.9.9') }.to raise_error(/published and frozen/)
        end
      end
    end

    context 'when HEAD is the tagged commit itself' do
      it 'allows the byte-identical rebuild-from-tag flow' do
        Dir.mktmpdir do |dir|
          root = Pathname.new(dir)
          git(root, 'init', '-q')
          git(root, 'commit', '--allow-empty', '-m', 'release')
          git(root, 'tag', '-a', 'v9.9.9', '-m', 'Framework 9.9.9')
          expect { guard_at(root, '9.9.9') }.not_to raise_error
        end
      end
    end

    context 'outside a git checkout' do
      it 'stays inert rather than blocking gem consumers' do
        Dir.mktmpdir do |dir|
          expect { guard_at(Pathname.new(dir), '9.9.9') }.not_to raise_error
        end
      end
    end
  end

  # The guard is only as good as the point it fires at. Inside `call`, `npm install` is
  # the first step that writes (it rewrites package-lock.json), so the refusal has to land
  # ahead of it; the rake entry points run the same guard ahead of :build, which
  # regenerates the tracked color SCSS. A refusal that arrives after either one leaves a
  # modified working tree behind, which is the opposite of what a freeze guard is for.
  describe 'freeze guard placement' do
    def frozen_release_root(dir)
      root = Pathname.new(dir)
      path = root.join('db', 'data', 'framework_versions.yml')
      FileUtils.mkdir_p(path.dirname)
      path.write("latest: 1.0.0\nversions:\n- number: 1.0.0\n  released_at: '2024-01-01'\n")
      git(root, 'init', '-q')
      git(root, 'add', '-A')
      git(root, 'commit', '-q', '-m', 'release')
      git(root, 'tag', '-a', 'v1.0.0', '-m', 'Framework 1.0.0')
      git(root, 'commit', '-q', '--allow-empty', '-m', 'after release')
      root
    end

    it 'refuses a frozen re-cut before npm rewrites the lockfile' do
      Dir.mktmpdir do |dir|
        task = described_class.new('current', root_dir: frozen_release_root(dir), logger: null_logger)
        npm_ran = false
        allow(task).to receive(:install_npm_dependencies) { npm_ran = true }

        expect { task.call }.to raise_error(/published and frozen/)
        expect(npm_ran).to be(false)
      end
    end

    # The standalone entry point the rake tasks call before the build.
    it 'refuses from verify_unpublished on its own, without a build' do
      Dir.mktmpdir do |dir|
        task = described_class.new('current', root_dir: frozen_release_root(dir), logger: null_logger)

        expect { task.verify_unpublished }.to raise_error(/published and frozen/)
      end
    end

    it 'passes verify_unpublished for a version no tag freezes' do
      Dir.mktmpdir do |dir|
        root = frozen_release_root(dir)
        task = described_class.new('patch', root_dir: root, logger: null_logger)

        expect { task.verify_unpublished }.not_to raise_error
      end
    end
  end

  # `update_gem_version` keeps the gemspec's Framework::VERSION locked to the released
  # framework version; the Release workflow refuses tags where the two disagree. Driven
  # against a seeded copy under a throwaway root so the real constant stays untouched.
  describe 'gem version sync' do
    def with_gem_version_file(contents)
      Dir.mktmpdir do |dir|
        root = Pathname.new(dir)
        path = root.join('lib', 'trmnl_framework', 'version.rb')
        FileUtils.mkdir_p(path.dirname)
        path.write(contents)
        task = described_class.new('current', root_dir: root, logger: null_logger)
        task.instance_variable_set(:@new_version, '9.9.9')
        yield task, path
      end
    end

    it 'rewrites the VERSION constant to the released version' do
      contents = <<~RUBY
        # frozen_string_literal: true

        module Framework
          VERSION = "1.0.0"
        end
      RUBY

      with_gem_version_file(contents) do |task, path|
        task.send(:update_gem_version)
        expect(path.read).to include('VERSION = "9.9.9"')
      end
    end

    it 'raises when the constant is missing rather than releasing out of sync' do
      with_gem_version_file("module Framework\nend\n") do |task, _path|
        expect { task.send(:update_gem_version) }.to raise_error(/VERSION constant not found/)
      end
    end
  end

  # `find_assets` is the input-validation seam: it refuses to release when a compiled bundle is
  # absent. Pointing it at an otherwise-empty tmpdir makes the inputs genuinely missing.
  describe 'build-input validation' do
    def task_rooted_at(root)
      described_class.new('current', root_dir: root, logger: null_logger)
    end

    def write_file(path, contents)
      FileUtils.mkdir_p(path.dirname)
      path.write(contents)
    end

    context 'when the compiled CSS bundle is missing' do
      it 'raises rather than releasing nothing' do
        Dir.mktmpdir do |dir|
          root = Pathname.new(dir)
          allow(Rails).to receive(:root).and_return(root)
          expect { task_rooted_at(root).send(:find_assets) }
            .to raise_error(/CSS bundle not found/)
        end
      end
    end

    context 'when the JS runtime is missing' do
      it 'raises rather than releasing nothing' do
        Dir.mktmpdir do |dir|
          root = Pathname.new(dir)
          write_file(root.join('app', 'assets', 'builds', 'plugins.css'), '/* css */')
          allow(Rails).to receive(:root).and_return(root)
          expect { task_rooted_at(root).send(:find_assets) }
            .to raise_error(/JS runtime not found/)
        end
      end
    end

    context 'when a theme stylesheet is missing' do
      it 'raises rather than releasing nothing' do
        Dir.mktmpdir do |dir|
          root = Pathname.new(dir)
          write_file(root.join('app', 'assets', 'builds', 'plugins.css'), '/* css */')
          write_file(root.join('app', 'javascript', 'plugin-render', 'plugins.js'), '// js')
          allow(Rails).to receive(:root).and_return(root)
          expect { task_rooted_at(root).send(:find_assets) }
            .to raise_error(/Theme CSS not found/)
        end
      end
    end
  end

  # The artifact seam: plugins.css and plugins.js ship as the readable builds, and the
  # .min names carry the processed bundles production serves. The npm processors are
  # stubbed with a writer that exits through a real child process, which keeps cssnano
  # and terser out of the suite while still exercising the pair, gzip, and command
  # wiring.
  describe 'versioned artifact publication' do
    let(:version) { '9.9.9' }
    let(:prior_version) { '9.9.8' }
    let(:processed_css) { '.trmnl{--_tn1:#000}' }
    let(:processed_js) { %(window.__TRMNL_BUILD__='plugins.js v#{version}';) }
    let(:readable_js) { %(window.__TRMNL_BUILD__ = 'plugins.js v#{version}';) }

    def write_file(path, contents)
      FileUtils.mkdir_p(path.dirname)
      path.write(contents)
    end

    # The build inputs find_assets validates: the compiled bundle, the runtime source, one
    # stylesheet per registered theme, and the harness the responsive test page pins.
    def seed_build(root)
      write_file(root.join('app', 'assets', 'builds', 'plugins.css'), '.trmnl { color: black; }')
      write_file(root.join('app', 'javascript', 'plugin-render', 'plugins.js'),
                 %(window.__TRMNL_BUILD__ = 'plugins.js source';))
      Framework::Themes.ids.each do |id|
        write_file(root.join('app', 'assets', 'builds', 'themes', "#{id}-theme.css"), "/* #{id} theme */")
      end
      write_file(root.join('app', 'assets', 'builds', described_class::RESPONSIVE_TEST_CSS), '/* harness */')
    end

    # Stands in for `npm run process_stylesheets|process_scripts`: records the command,
    # writes processed bytes at --output, and exits zero through a real child process,
    # since the task reads $CHILD_STATUS to decide the run succeeded.
    def stub_processors(task, commands)
      allow(task).to receive(:system) do |*command, **|
        commands << command
        output = Pathname.new(command[command.index('--output') + 1])
        FileUtils.mkdir_p(output.dirname)
        content = if command.include?('process_scripts')
                    command.include?('--no-minify') ? readable_js : processed_js
                  else
                    processed_css
                  end
        output.write(content)
        Kernel.system('/bin/sh', '-c', 'exit 0')
      end
    end

    # Runs both publication steps in a throwaway root, yielding it with the processor
    # commands they issued. The prior release's published theme stands in for the
    # frozen contract the CSS processor also preserves.
    def with_published_release
      Dir.mktmpdir do |dir|
        root = Pathname.new(dir)
        seed_build(root)
        write_file(root.join('public', 'css', prior_version, 'themes', 'frozen-theme.css'), '/* frozen theme */')
        allow(Rails).to receive(:root).and_return(root)
        task = described_class.new('current', root_dir: root, logger: null_logger)
        task.instance_variable_set(:@current_version, prior_version)
        task.instance_variable_set(:@new_version, version)
        commands = []
        stub_processors(task, commands)
        task.send(:find_assets)
        task.send(:publish_versioned_stylesheets)
        task.send(:publish_versioned_javascript)
        yield root, commands
      end
    end

    def published_bundles(root)
      described_class::RELEASE_ASSET_NAMES.flat_map do |type, names|
        names.grep_v(/\.(gz|br)\z/).map { |name| root.join('public', type.to_s, version, name) }
      end
    end

    it 'publishes the readable build as plugins.css' do
      with_published_release do |root, _commands|
        expect(root.join('public', 'css', version, 'plugins.css').read).to eq('.trmnl { color: black; }')
      end
    end

    it 'publishes the processed output as plugins.min.css' do
      with_published_release do |root, _commands|
        expect(root.join('public', 'css', version, 'plugins.min.css').read).to eq(processed_css)
      end
    end

    it 'publishes the stamped readable runtime as plugins.js' do
      with_published_release do |root, _commands|
        expect(root.join('public', 'js', version, 'plugins.js').read).to eq(readable_js)
      end
    end

    it 'publishes the minified runtime as plugins.min.js' do
      with_published_release do |root, _commands|
        expect(root.join('public', 'js', version, 'plugins.min.js').read).to eq(processed_js)
      end
    end

    it 'publishes every name the release zip lists' do
      with_published_release do |root, _commands|
        missing = described_class::RELEASE_ASSET_NAMES.flat_map do |type, names|
          names.map { |name| root.join('public', type.to_s, version, name) }
        end.reject(&:exist?)
        expect(missing).to be_empty
      end
    end

    it 'gzips every published bundle to its own bytes' do
      with_published_release do |root, _commands|
        published_bundles(root).each do |bundle|
          expect(Zlib::GzipReader.open("#{bundle}.gz", &:read)).to eq(bundle.read)
        end
      end
    end

    # The CSS pair needs one processor run (the readable primary is a straight copy of
    # the compiled build); the JS pair needs two, because both runtimes carry the stamp.
    it 'runs the CSS processor once and the JS processor twice' do
      with_published_release do |_root, commands|
        expect(commands.count { |command| command.include?('process_stylesheets') }).to eq(1)
        expect(commands.count { |command| command.include?('process_scripts') }).to eq(2)
      end
    end

    it 'hands every registered theme and the prior release themes to the CSS processor as a preserved contract' do
      with_published_release do |root, commands|
        command = commands.find { |candidate| candidate.include?('process_stylesheets') }
        preserved = command.each_cons(2).filter_map { |flag, value| value if flag == '--preserve-variables-from' }
        expect(preserved).to eq(
          Framework::Themes.ids.map { |id| root.join('app', 'assets', 'builds', 'themes', "#{id}-theme.css").to_s } +
          [root.join('public', 'css', prior_version, 'themes', 'frozen-theme.css').to_s]
        )
      end
    end

    # Both runtimes are stamped; only the readable one passes --no-minify.
    it 'asks the JS processor for a stamped pair, one readable and one minified' do
      with_published_release do |_root, commands|
        js_commands = commands.select { |candidate| candidate.include?('process_scripts') }
        readable, minified = js_commands.partition { |candidate| candidate.include?('--no-minify') }

        aggregate_failures do
          expect(readable.size).to eq(1)
          expect(minified.size).to eq(1)
          expect(js_commands).to all(include('--stamp', version))
        end
      end
    end

    it 'publishes the theme and harness stylesheets unprocessed' do
      with_published_release do |root, _commands|
        css_dir = root.join('public', 'css', version)
        theme_id = Framework::Themes.ids.first
        expect(css_dir.join('themes', "#{theme_id}-theme.css").read).to eq("/* #{theme_id} theme */")
        expect(css_dir.join(described_class::RESPONSIVE_TEST_CSS).read).to eq('/* harness */')
      end
    end
  end

  # `build_release_zip` is the isolatable archive writer. Seeding a tmpdir with a tiny file for
  # every computed entry exercises the real rubyzip path without a full release, and lets us
  # assert the archive layout and the byte-for-byte reproducibility the release depends on.
  describe 'release zip' do
    let(:version) { '9.9.9' }
    let(:released_at) { '2025-01-01' }

    def seed_versions_file(root, number, date)
      path = root.join('db', 'data', 'framework_versions.yml')
      FileUtils.mkdir_p(path.dirname)
      path.write({ 'latest' => number, 'versions' => [{ 'number' => number, 'released_at' => date }] }.to_yaml)
    end

    # The entry names the archive must contain, reconstructed from the release constants (kept
    # independent of release_zip_entries so this stays a real contract check).
    def expected_entry_names
      css = described_class::RELEASE_ASSET_NAMES[:css].map { |name| "css/#{name}" }
      js = described_class::RELEASE_ASSET_NAMES[:js].map { |name| "js/#{name}" }
      themes = Framework::Themes.ids.flat_map do |id|
        described_class::THEME_RELEASE_ASSET_SUFFIXES.map { |suffix| "css/themes/#{id}-theme#{suffix}" }
      end
      css + js + themes + [described_class::RELEASE_NOTES_ZIP_ENTRY, described_class::COLOR_MANIFEST_ZIP_ENTRY]
    end

    # Runs the real zip writer in an isolated root seeded with a fixture for every entry plus a
    # versions file (so the entry timestamp is fixed), returning the produced archive path.
    def build_zip(root, content: 'fixture')
      seed_versions_file(root, version, released_at)
      task = described_class.new('current', root_dir: root, logger: null_logger)
      # release_zip_entries answers an array of [name, path] pairs, not a hash, so the
      # each_value this reads like is not available.
      task.send(:release_zip_entries, version).each do |_name, path| # rubocop:disable Style/HashEachMethods
        FileUtils.mkdir_p(path.dirname)
        path.binwrite(content)
      end
      task.send(:build_release_zip, version)
      root.join('public', 'framework', "trmnl-framework--#{version}.zip")
    end

    it 'contains exactly the expected entry set' do
      Dir.mktmpdir do |dir|
        names = Zip::File.open(build_zip(Pathname.new(dir))) { |zip| zip.map(&:name) }
        expect(names).to match_array(expected_entry_names)
      end
    end

    it 're-releasing identical content is byte-identical' do
      first = Dir.mktmpdir { |dir| build_zip(Pathname.new(dir)).binread }
      second = Dir.mktmpdir { |dir| build_zip(Pathname.new(dir)).binread }
      expect(second).to eq(first)
    end

    # rubyzip records each entry's instant in a UniversalTime extra field, so a stamp built
    # from local midnight would shift with the writer's timezone and two machines cutting
    # the same release would disagree on the archive bytes. release_timestamp builds the
    # stamp in UTC; CRuby re-reads ENV['TZ'] on every time conversion, so flipping it
    # in-process exercises real timezone-dependent writers.
    it 'stamps entries at midnight UTC of released_at, in any writer timezone' do
      stamps = %w[UTC Europe/Berlin America/New_York].map do |tz|
        with_tz(tz) do
          Dir.mktmpdir do |dir|
            root = Pathname.new(dir)
            seed_versions_file(root, version, released_at)
            described_class.new('current', root_dir: root, logger: null_logger)
                           .send(:release_timestamp, version).to_i
          end
        end
      end
      expect(stamps.uniq).to eq([Time.utc(2025, 1, 1).to_i])
    end

    it 'produces identical archive bytes in different writer timezones' do
      utc = with_tz('UTC') { Dir.mktmpdir { |dir| build_zip(Pathname.new(dir)).binread } }
      berlin = with_tz('Europe/Berlin') { Dir.mktmpdir { |dir| build_zip(Pathname.new(dir)).binread } }
      expect(berlin).to eq(utc)
    end

    context 'when a required asset is absent' do
      it 'refuses to build a partial archive' do
        Dir.mktmpdir do |dir|
          root = Pathname.new(dir)
          seed_versions_file(root, version, released_at)
          task = described_class.new('current', root_dir: root, logger: null_logger)
          entries = task.send(:release_zip_entries, version)
          entries.each do |_name, path| # rubocop:disable Style/HashEachMethods
            FileUtils.mkdir_p(path.dirname)
            path.binwrite('x')
          end
          FileUtils.rm(entries.first.last)
          expect { task.send(:build_release_zip, version) }.to raise_error(/Missing release asset/)
        end
      end
    end
  end

  # `copy_assets_to_latest` mirrors the new version's directories into public/css|js/latest/.
  # It must rebuild latest/ from scratch: an asset dropped from the release would otherwise
  # survive there as a stale orphan from the previous release.
  describe 'latest/ mirroring' do
    def seed_release_and_stale_latest(root)
      %w[public/css/9.9.9/plugins.css
         public/css/9.9.9/themes/mono-theme.css
         public/js/9.9.9/plugins.js
         public/css/latest/removed.css
         public/css/latest/themes/removed-theme.css
         public/js/latest/removed.js].each do |rel|
        path = root.join(rel)
        FileUtils.mkdir_p(path.dirname)
        path.write('x')
      end
    end

    it 'replaces latest/ with exactly the new release assets' do
      Dir.mktmpdir do |dir|
        root = Pathname.new(dir)
        seed_release_and_stale_latest(root)
        task = described_class.new('current', root_dir: root, logger: null_logger)
        task.instance_variable_set(:@new_version, '9.9.9')
        task.send(:copy_assets_to_latest)

        latest_files = Dir.glob(root.join('public', '{css,js}', 'latest', '**', '*'))
                          .select { |f| File.file?(f) }
                          .map { |f| Pathname.new(f).relative_path_from(root).to_s }
        expect(latest_files).to match_array(
          %w[public/css/latest/plugins.css
             public/css/latest/themes/mono-theme.css
             public/js/latest/plugins.js]
        )
      end
    end
  end

  # `gzip` writes the committed .gz artifacts. It compresses through Ruby's zlib rather than
  # the system binary precisely so the bytes do not depend on which gzip the machine has, and
  # a rebuild-from-tag reproduces the published archives anywhere.
  describe 'gzip' do
    def gzip_to(dir, content)
      source = Pathname.new(dir).join('plugins.css')
      dest = Pathname.new(dir).join('plugins.css.gz')
      source.binwrite(content)
      release_task.send(:gzip, source, dest)
      dest
    end

    it 'writes an archive that decompresses to the source' do
      Dir.mktmpdir do |dir|
        content = '.trmnl { color: black; }' * 500
        expect(Zlib::GzipReader.open(gzip_to(dir, content), &:read)).to eq(content)
      end
    end

    it 'zeroes the header timestamp and stores no filename' do
      Dir.mktmpdir do |dir|
        # Magic, deflate, no flags (so no stored name), mtime 0, XFL 2 for level 9. The
        # tenth byte is the writing OS and is the one field zlib fills in for itself.
        expect(gzip_to(dir, 'compress me').binread[0, 9].unpack('C*'))
          .to eq([0x1f, 0x8b, 0x08, 0x00, 0, 0, 0, 0, 0x02])
      end
    end

    it 'compresses identical content to identical bytes' do
      content = '.trmnl .title { font-size: 24px; }' * 500
      first = Dir.mktmpdir { |dir| gzip_to(dir, content).binread }
      second = Dir.mktmpdir { |dir| gzip_to(dir, content).binread }
      expect(second).to eq(first)
    end

    context 'when the source is missing' do
      it 'raises before writing a truncated archive' do
        Dir.mktmpdir do |dir|
          dest = Pathname.new(dir).join('plugins.css.gz')
          expect { release_task.send(:gzip, Pathname.new(dir).join('absent.css'), dest) }
            .to raise_error(Errno::ENOENT)
          expect(dest).not_to exist
        end
      end
    end
  end

  # `brotli` writes the committed .br artifacts, through the exactly pinned gem for the same
  # reason gzip goes through Ruby's zlib: the bytes are part of a release a rebuild-from-tag
  # has to reproduce anywhere. Quality and window are named at the call, so a library default
  # that moves would move the artifacts silently.
  describe 'brotli' do
    # A fixture small enough to state a digest for, compressed the way the release does it.
    # A different quality, window, or brotli version writes different bytes and fails here,
    # which is the point: re-cutting a published version must not change its .br files.
    let(:fixture) { '.trmnl .title { font-size: 24px; }' * 500 }
    let(:golden_digest) { 'd9c72144702dd59a8acffb4eb45b8283ad7ded152ae7867c38692dcaa884f0fa' }

    def brotli_to(dir, content)
      source = Pathname.new(dir).join('plugins.css')
      dest = Pathname.new(dir).join('plugins.css.br')
      source.binwrite(content)
      release_task.send(:brotli, source, dest)
      dest
    end

    it 'writes an archive that decompresses to the source' do
      Dir.mktmpdir do |dir|
        expect(Brotli.inflate(brotli_to(dir, fixture).binread)).to eq(fixture)
      end
    end

    it 'compresses the fixture to the exact bytes the release is pinned to' do
      Dir.mktmpdir do |dir|
        expect(Digest::SHA256.hexdigest(brotli_to(dir, fixture).binread)).to eq(golden_digest)
      end
    end

    context 'when the source is missing' do
      it 'raises before writing a truncated archive' do
        Dir.mktmpdir do |dir|
          dest = Pathname.new(dir).join('plugins.css.br')
          expect { release_task.send(:brotli, Pathname.new(dir).join('absent.css'), dest) }
            .to raise_error(Errno::ENOENT)
          expect(dest).not_to exist
        end
      end
    end
  end

  # Every published plaintext artifact gets both siblings from one call, so a new artifact
  # cannot end up with half the encodings.
  describe 'compress_siblings' do
    it 'writes a .gz and a .br next to the source' do
      Dir.mktmpdir do |dir|
        source = Pathname.new(dir).join('plugins.min.css')
        source.binwrite('.trmnl{}')
        release_task.send(:compress_siblings, source)

        aggregate_failures do
          expect(Zlib::GzipReader.open("#{source}.gz", &:read)).to eq('.trmnl{}')
          expect(Pathname.new("#{source}.br")).to exist
        end
      end
    end
  end

  # `update_npm_version` keeps package.json and the lockfile header on the released version.
  # Only the header may move: everything from the first "node_modules/" key on is a
  # dependency's own pinned version.
  describe 'npm version sync' do
    let(:manifest) { %({\n  "name": "trmnl-framework",\n  "version": "0.0.0",\n  "private": true\n}\n) }
    let(:lockfile) do
      <<~JSON
        {
          "name": "trmnl-framework",
          "version": "0.0.0",
          "lockfileVersion": 3,
          "packages": {
            "": {
              "name": "trmnl-framework",
              "version": "0.0.0"
            },
            "node_modules/terser": {
              "version": "5.46.1"
            }
          }
        }
      JSON
    end

    def with_npm_files(manifest_contents, lockfile_contents)
      Dir.mktmpdir do |dir|
        root = Pathname.new(dir)
        root.join('package.json').write(manifest_contents)
        root.join('package-lock.json').write(lockfile_contents)
        task = described_class.new('current', root_dir: root, logger: null_logger)
        task.instance_variable_set(:@new_version, '9.9.9')
        yield task, root
      end
    end

    it 'rewrites the manifest version' do
      with_npm_files(manifest, lockfile) do |task, root|
        task.send(:update_npm_version)
        expect(root.join('package.json').read).to include('"version": "9.9.9"')
      end
    end

    it 'rewrites both header versions in the lockfile' do
      with_npm_files(manifest, lockfile) do |task, root|
        task.send(:update_npm_version)
        expect(root.join('package-lock.json').read.scan('"version": "9.9.9"').length).to eq(2)
      end
    end

    it 'leaves dependency versions untouched' do
      with_npm_files(manifest, lockfile) do |task, root|
        task.send(:update_npm_version)
        expect(root.join('package-lock.json').read).to include('"version": "5.46.1"')
      end
    end

    context 'when the header does not carry the expected version fields' do
      it 'raises rather than rewriting the wrong number' do
        with_npm_files(manifest, %({\n  "name": "trmnl-framework",\n  "packages": {}\n}\n)) do |task, _root|
          expect { task.send(:update_npm_version) }.to raise_error(/Expected 2 version field/)
        end
      end
    end
  end

  # The processing steps guard against shipping an unprocessed artifact: each checks
  # $CHILD_STATUS and raises on a non-zero exit. Stubbing `system` to fail (via a trivial
  # `/bin/sh -c exit 1`) fires that guard without invoking the real npm tools.
  describe 'shell-out failure handling' do
    before do
      allow(release_task).to receive(:system) { Kernel.system('/bin/sh', '-c', 'exit 1') }
    end

    context 'when CSS processing exits non-zero' do
      it 'raises rather than publishing the unprocessed bundle' do
        expect { release_task.send(:process_stylesheet, '/nope/plugins.css', '/nope/plugins.out.css') }
          .to raise_error(/CSS processing failed/)
      end
    end

    context 'when JS processing exits non-zero' do
      it 'raises rather than publishing the unprocessed runtime' do
        expect { release_task.send(:process_javascript, '9.9.9', '/nope/plugins.js', '/nope/plugins.out.js') }
          .to raise_error(/JS processing failed/)
      end
    end
  end
end
