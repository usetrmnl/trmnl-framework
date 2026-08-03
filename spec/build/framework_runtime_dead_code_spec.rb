# frozen_string_literal: true

require 'rails_helper'

# app/javascript/plugin-render/ is the whole shipped runtime, and it has no module
# boundary: every helper is a bare top-level function in one file, so nothing tells a
# reader which of them the engines actually call. Three had no call site at all
# (clampSubtree, resetClampToOriginal, getColumnMetrics), and one of them carried a
# 36-line doc block describing a `data-list-max-columns-md-scale-large` attribute family
# that no code has ever read. On a public repo that block reads as an API contract.
#
# This is the check that says a declared function is a live one. A reference that only
# appears in a comment does not count: the stale "widths used by clampSubtree during
# placement" comment is exactly how one of the three stayed invisible.
RSpec.describe 'Framework runtime dead code' do
  runtime_dir = Framework::Engine.root.join('app', 'javascript', 'plugin-render')
  sources = Dir[runtime_dir.join('*.js').to_s]

  # Comments and JSDoc go first, so only executable text can vouch for a name.
  def self.executable_text(source)
    source
      .gsub(%r{/\*.*?\*/}m, ' ')
      .gsub(%r{^\s*//.*$}, ' ')
      .gsub(%r{([^:\w])//.*$}) { Regexp.last_match(1) }
  end

  it 'reads at least the three runtime sources' do
    expect(sources.map { |path| File.basename(path) })
      .to include('plugins.js', 'dithering.js', 'asset-deduplication.js')
  end

  sources.each do |path|
    describe File.basename(path) do
      source = File.read(path, encoding: 'UTF-8')
      declared = source.scan(/^function\s+([A-Za-z_$][\w$]*)\s*\(/).flatten
      code = executable_text(source)

      it 'calls every top-level function it declares' do
        dead = declared.reject { |name| code.scan(/\b#{Regexp.escape(name)}\b/).length > 1 }

        expect(dead).to be_empty,
                        "declared with no call site outside comments: #{dead.inspect}"
      end

      it 'declares each of those functions once' do
        duplicated = declared.tally.select { |_name, count| count > 1 }.keys

        expect(duplicated).to be_empty
      end
    end
  end
end
