# frozen_string_literal: true

require 'rails_helper'
require 'open3'
require 'trmnl_framework/package'

# The repo-level files a public checkout is judged by: the README's orientation map, the
# ignore lists, the license notices on vendored-looking assets, and the house copy rule.
# Every one of them drifts silently. A directory gets deleted and the layout map keeps
# listing it, an internal note keeps shipping in docs/, an ignore file keeps not covering
# .env, and nothing renders differently in any of those cases.
RSpec.describe 'Repo hygiene' do
  root = Framework::Engine.root
  readme = File.read(root.join('README.md'))

  describe 'README layout map' do
    # The Layout section is a fenced block of "path<gap>description" lines. A line at
    # column 0 is a top-level entry and may list two paths ("public/css, public/js"); a
    # line indented two spaces is a child of the last top-level directory; anything
    # indented further is the previous description wrapping.
    def self.layout_paths(block)
      parent = nil

      block.each_line.flat_map do |line|
        indent = line[/\A */].length
        next [] if line.strip.empty? || indent > 2

        entries = line.strip.split(/\s{2,}/, 2).first.to_s.split(',').map(&:strip).reject(&:empty?)
        next entries.map { |entry| "#{parent}#{entry}" } if indent == 2

        parent = entries.first if entries.one? && entries.first.end_with?('/')
        entries
      end
    end

    block = readme[/^## Layout\n+```\n(.*?)^```/m, 1].to_s
    paths = layout_paths(block)

    it 'finds the block it checks' do
      expect(paths.length).to be > 20
    end

    it 'lists only paths that exist' do
      expect(paths.reject { |path| root.join(path).exist? }).to be_empty
    end
  end

  describe 'CI workflow' do
    # A workflow comment that cites a file is a link like any other. The rubocop job's
    # rationale pointed at docs/SPEC_SUITE_PROMPT.md and would have outlived it.
    it 'cites only files that exist' do
      workflow = File.read(root.join('.github/workflows/ci.yml'))
      cited = workflow.scan(%r{\b(?:app|bin|config|db|docs|lib|public|spec|test)/[\w./-]+\.\w+}).uniq

      expect(cited.reject { |path| root.join(path).exist? }).to be_empty
    end
  end

  describe 'ignore files' do
    gitignore = File.read(root.join('.gitignore'))
    dockerignore = File.read(root.join('.dockerignore'))

    it 'ignores local environment files and built gems' do
      expect(gitignore.lines.map(&:chomp)).to include('.env', '.env.*', '*.gem')
    end

    it 'ends with a newline, so appending an entry cannot join it to the last one' do
      aggregate_failures do
        expect(gitignore).to end_with("\n")
        expect(dockerignore).to end_with("\n")
      end
    end

    # prelaunch-briefs/ is the private planning record. It is excluded from the gem
    # (Framework::Package) and from the published snapshot, so it has no business in a
    # Docker build context either.
    it 'keeps the private briefs out of the Docker build context' do
      expect(dockerignore.lines.map(&:chomp)).to include('prelaunch-briefs')
    end
  end

  describe 'build output' do
    # dartsass and Tailwind write to the host's Rails.root, which in this repo is server/.
    # The engine root has an app/assets/builds/ too, from the layout before the docs app
    # moved under server/, and it stopped being a build target the moment it did. Nothing
    # emptied it, and .gitignore covers it, so a checkout from that era kept serving the
    # July compile of a theme set that no longer exists: black-and-orange, comic-sans and
    # yellow-and-red all outlived the sources they came from by weeks.
    #
    # Only .keep belongs here. It is the placeholder the gem ships (Framework::Package)
    # and the one dotfile the packaging filter deliberately keeps.
    it 'leaves nothing but the placeholder in the engine root builds directory' do
      stale = Dir.glob(root.join('app/assets/builds/**/*'), File::FNM_DOTMATCH)
                 .reject { |path| File.basename(path).in?(['.', '..', '.keep']) }
                 .reject { |path| Framework::Package.junk?(path) }
                 .map { |path| Pathname(path).relative_path_from(root).to_s }

      expect(stale).to be_empty,
                       "Stale build output under app/assets/builds/. Nothing writes there; " \
                       "the live build is server/app/assets/builds/. Delete: #{stale.join(', ')}"
    end

    # The set the docs server actually links, so the tripwire above cannot pass by
    # pointing at a directory the build stopped filling too.
    it 'names the live build directory under server/' do
      expect(Framework.server_builds).to eq(root.join('server/app/assets/builds'))
    end
  end

  describe 'third-party notices' do
    # The vendored Prism bundle carries its MIT notice on line 1. prism_trmnl.css reuses
    # Prism's layout block, its token selector set and its `cursor: help` entity rule, so
    # the same notice has to travel with it.
    it 'attributes the derived Prism theme the way the vendored Prism bundle is attributed' do
      vendored = File.open(root.join('vendor/javascript/prism-1.29.0.min.js'), &:readline)
      theme = File.read(root.join('app/assets/static/prism_trmnl.css')).lines.first

      aggregate_failures do
        expect(vendored).to include('MIT License', 'Lea Verou', 'prismjs.com')
        expect(theme).to include('MIT License', 'Lea Verou', 'prismjs.com')
      end
    end
  end

  describe 'house copy rules' do
    # bin/check-em-dashes is the CI job. Running it here means the Ruby suite fails on a
    # new em-dash too, rather than leaving the rule to one job nobody runs locally.
    it 'finds no em-dash outside the allowlist in bin/check-em-dashes' do
      output, status = Open3.capture2e(root.join('bin/check-em-dashes').to_s, chdir: root.to_s)

      expect(status).to be_success, output
    end
  end
end
