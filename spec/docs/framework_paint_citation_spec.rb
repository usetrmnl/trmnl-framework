# frozen_string_literal: true

require 'rails_helper'

# The in-code half of the paint traceability contract. TRMNLPaint's comments and
# docs/PAINT_RULE_TRACEABILITY.md send a reader to the SCSS that declares each
# rule, and that pointer is the evidence behind house rule 1: the adapter mirrors
# the cascade rather than re-deciding it.
#
# Names are the anchors. A mixin keeps its name when the file around it moves; a
# line number does not, and three citations had already drifted onto the wrong
# mixin before this guard existed. So every citation is resolved here against the
# Sass source, and the line-number form is refused outright.
module PaintCitations
  ENGINE_ROOT = Framework::Engine.root
  SCSS_ROOT = ENGINE_ROOT.join('app/assets/stylesheets/framework')
  RUNTIME_JS = ENGINE_ROOT.join('app/javascript/plugin-render/plugins.js')
  TRACEABILITY_DOC = ENGINE_ROOT.join('docs/PAINT_RULE_TRACEABILITY.md')

  # `path/_file.scss`, optionally followed by `:name` for the mixin, function or
  # variable inside it.
  CITATION = %r{([\w.-]+(?:/[\w.-]+)*\.scss)(?::(\$?[\w-]+))?}

  # A pointer that rots: `file.scss:412`, `(lines 58-74)`, `line 4186`.
  LINE_NUMBER_FORMS = [/\.scss:\d/, /\blines?\s+\d/].freeze

  # Tokens in the doc that name neither a file nor an SCSS identifier: renderer
  # option values and property names that happen to sit in a counterpart cell.
  NON_SCSS_TOKENS = ['textOutline:none', 'background-clip:text', 'stroke-dasharray'].freeze

  module_function

  def scss_paths
    @scss_paths ||= Dir.glob(SCSS_ROOT.join('**/*.scss')).map { |path| Pathname.new(path) }
  end

  def scss_source
    @scss_source ||= scss_paths.map(&:read).join("\n")
  end

  # Sass @mixin / @function names, and the file each one is declared in.
  def declarations
    @declarations ||= scss_paths.each_with_object(Hash.new { |hash, key| hash[key] = [] }) do |path, index|
      path.read.scan(/@(?:mixin|function)\s+([\w-]+)/) { |(name)| index[name] << path }
    end
  end

  def sass_variables
    @sass_variables ||= scss_source.scan(/^\s*(\$[\w-]+)\s*:/).flatten.to_set
  end

  # Custom-property names are read from the compiled bundle, not the source: most
  # are emitted through interpolation and exist as a literal name only after Sass
  # has run.
  def custom_properties
    @custom_properties ||= Rails.root.join('app/assets/builds/plugins.css').read
                                .scan(/(--[\w-]+)\s*:/).flatten.to_set
  end

  # Resolve a cited path against the framework Sass root. A bare basename is
  # looked up anywhere in the tree, which is how the comments cite `_gap.scss`.
  def resolve_path(cited)
    relative = cited.delete_prefix('framework/')
    direct = SCSS_ROOT.join(relative)
    return direct if direct.file?
    return nil if relative.include?('/')

    scss_paths.find { |path| path.basename.to_s == relative }
  end

  # A doc token such as `--framework-semantic-*` or
  # `--framework-chart-series-<n>-{color,image}` stands for a family. Expand the
  # three wildcard forms the doc uses into one anchored pattern.
  def token_pattern(token)
    source = token.split(/(\*|<[^>]+>|\{[^}]+\})/).map do |part|
      case part
      when '*' then '[\w-]*'
      when /\A<[^>]+>\z/ then '[\w-]+'
      when /\A\{([^}]+)\}\z/ then "(?:#{Regexp.last_match(1).split(',').map { |option| Regexp.escape(option.strip) }.join('|')})"
      else Regexp.escape(part)
      end
    end.join
    /\A#{source}\z/
  end

  def matches_any?(names, token)
    pattern = token_pattern(token)
    names.any? { |name| pattern.match?(name) }
  end

  # Every citation in the runtime comments, as [path, name-or-nil] pairs. The
  # citations only ever appear in comments, so the whole file is scanned rather
  # than a hand-rolled comment parser.
  def runtime_citations
    @runtime_citations ||= RUNTIME_JS.read.scan(CITATION).uniq
  end

  def lines_citing_scss(text)
    text.lines.each_with_index
        .select { |line, _| line.include?('.scss') }
        .map { |line, index| [index + 1, line.strip] }
  end

  # The counterpart columns: "SCSS counterpart" in the main table and "Where it is
  # declared" in the unexposed-channel table. Both sit at index 2 of a split row.
  def doc_counterpart_tokens
    @doc_counterpart_tokens ||= TRACEABILITY_DOC.read.lines
                                                .select { |line| line.start_with?('|') }
                                                .map { |line| line.split('|').map(&:strip) }
                                                .select { |cells| cells.length >= 5 }
                                                .flat_map { |cells| cells[2].to_s.scan(/`([^`]+)`/).flatten }
                                                .uniq
  end

  # Every backticked token anywhere in the doc that names a Sass file or variable.
  def doc_path_and_variable_tokens
    @doc_path_and_variable_tokens ||= TRACEABILITY_DOC.read.scan(/`([^`]+)`/).flatten.uniq
                                                      .select { |token| token.end_with?('.scss') || token.start_with?('$') }
  end
end

RSpec.describe 'Paint rule citations' do
  before(:all) { FrameworkBuild.sass! }

  describe 'TRMNLPaint comments' do
    it 'cites only SCSS files that exist' do
      missing = PaintCitations.runtime_citations
                              .map(&:first).uniq
                              .reject { |path| PaintCitations.resolve_path(path) }

      expect(missing).to be_empty, "plugins.js cites SCSS files that are not in the tree: #{missing.join(', ')}"
    end

    it 'cites only mixins, functions and variables the cited file declares' do
      unresolved = PaintCitations.runtime_citations.filter_map do |path, name|
        next if name.nil?

        file = PaintCitations.resolve_path(path)
        next "#{path}:#{name} (file missing)" unless file

        body = file.read
        declared = body.match?(/@(?:mixin|function)\s+#{Regexp.escape(name)}\b/) ||
                   body.match?(/^\s*#{Regexp.escape(name)}\s*:/)
        "#{path}:#{name}" unless declared
      end

      expect(unresolved).to be_empty, "plugins.js cites names their file does not declare: #{unresolved.join(', ')}"
    end

    it 'carries no line numbers, which go stale when the SCSS around them moves' do
      offenders = PaintCitations.lines_citing_scss(PaintCitations::RUNTIME_JS.read)
                                .select { |_, line| PaintCitations::LINE_NUMBER_FORMS.any? { |form| form.match?(line) } }

      expect(offenders).to be_empty,
                           "cite the mixin, function or variable name instead: #{offenders.map { |number, line| "plugins.js:#{number} #{line}" }.join(' | ')}"
    end
  end

  describe 'the traceability doc' do
    it 'cites only SCSS files and Sass variables that exist' do
      unresolved = PaintCitations.doc_path_and_variable_tokens.reject do |token|
        if token.end_with?('.scss')
          PaintCitations.resolve_path(token)
        else
          PaintCitations.matches_any?(PaintCitations.sass_variables, token)
        end
      end

      expect(unresolved).to be_empty, "the doc cites Sass sources that do not exist: #{unresolved.join(', ')}"
    end

    it 'names only mixins, functions, custom properties and selectors the SCSS declares' do
      unresolved = PaintCitations.doc_counterpart_tokens.reject do |token|
        next true if PaintCitations::NON_SCSS_TOKENS.include?(token)

        case token
        when /\.scss\z/ then PaintCitations.resolve_path(token)
        when /\A\$/ then PaintCitations.matches_any?(PaintCitations.sass_variables, token)
        when /\A--/ then PaintCitations.matches_any?(PaintCitations.custom_properties, token)
        when /\A[.#]/, /\A\w+\./, /--/ then PaintCitations.scss_source.include?(token)
        when /\A_?[a-z][a-z0-9]*(?:-[a-z0-9]+)*\z/ then PaintCitations.declarations.key?(token)
        else true
        end
      end

      expect(unresolved).to be_empty, "the doc names SCSS the tree does not declare: #{unresolved.join(', ')}"
    end

    it 'carries no line numbers either' do
      offenders = PaintCitations.lines_citing_scss(PaintCitations::TRACEABILITY_DOC.read)
                                .select { |_, line| PaintCitations::LINE_NUMBER_FORMS.any? { |form| form.match?(line) } }

      expect(offenders).to be_empty,
                           "cite the mixin, function or variable name instead: #{offenders.map(&:first).join(', ')}"
    end
  end
end
