# frozen_string_literal: true

require 'rails_helper'

# Every class and variable a docs page prints has to exist in the compiled bundle.
#
# The docs are copy-paste material, so an out-of-range arbitrary value (w--[240px], the
# emitter stops at 128) or a renamed variable (var(--color-red-50), the token is --red-50)
# ships a dead snippet that fails silently in a reader's plugin. Both classes of drift are
# invisible to a request spec, which only asserts the page renders.
RSpec.describe 'Framework docs class and variable reference' do
  subject(:css) { FrameworkBuild.plugins_css }

  # Variable families the framework owns and therefore must define. Names outside these
  # prefixes belong to the reader (a theme's own --my-brand-accent, for instance).
  def owned_variable_prefixes
    %w[
      --color- --framework- --screen- --gap- --rounded- --ui- --content- --text- --bg- --border-
      --tn- --device- --gray- --red- --orange- --yellow- --lime- --green- --cyan- --blue- --violet-
      --purple- --pink-
    ]
  end

  # rounded--[Npx] and friends are syntax placeholders in prose, not classes.
  def placeholder_value = /\[N/

  def docs_lines
    Dir.glob(Framework::Engine.root.join('app/views/framework/*.html.erb')).flat_map do |path|
      File.readlines(path, encoding: 'UTF-8').each_with_index.map do |line, index|
        ["#{File.basename(path)}:#{index + 1}", line]
      end
    end
  end

  def css_selector_for(utility_class)
    ".#{utility_class.gsub('[', '\\[').gsub(']', '\\]').gsub(':', '\\:')}"
  end

  it 'emits every arbitrary-value utility class the docs print' do
    missing = docs_lines.flat_map do |where, line|
      line.scan(/(?<![\w-])(?:[a-z0-9]+:)*[a-z][a-z0-9]*(?:-[a-z0-9]+)*--(?:min-|max-)?\[[^\]\s"'<>]+\]/)
          .reject { |token| token.match?(placeholder_value) || token.include?('#{') }
          .reject { |token| css.include?(css_selector_for(token)) }
          .map { |token| "#{where} #{token}" }
    end

    expect(missing).to be_empty
  end

  it 'defines every framework-owned CSS variable the docs reference' do
    defined_names = css.scan(/(--[a-zA-Z0-9_-]+)\s*:/).flatten.uniq

    missing = docs_lines.flat_map do |where, line|
      line.scan(/var\(\s*(--[a-zA-Z0-9_-]+)/).flatten
          .select { |name| name.start_with?(*owned_variable_prefixes) }
          .reject { |name| defined_names.include?(name) }
          .map { |name| "#{where} #{name}" }
    end

    expect(missing).to be_empty
  end
end
