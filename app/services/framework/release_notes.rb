# frozen_string_literal: true

require "redcarpet"

module Framework
  class ReleaseNotes
    MARKDOWN = Redcarpet::Markdown.new(
      Redcarpet::Render::HTML.new(hard_wrap: true, escape_html: true),
      fenced_code_blocks: true,
      autolink: true,
      tables: true,
      strikethrough: true,
      no_intra_emphasis: true
    ).freeze

    SAFE_TAGS = %w[p br strong em a code pre ul ol li h1 h2 h3 h4 h5 h6 blockquote table thead tbody tr th td hr].freeze
    SAFE_ATTRS = %w[href].freeze
    SAFE_PROTOCOLS = { "a" => { "href" => %w[http https mailto] } }.freeze

    attr_reader :version, :root_dir

    def initialize(version, root_dir: Framework::Engine.root)
      @version = version.to_s
      @root_dir = Pathname.new(root_dir)
    end

    def exists?
      path.exist?
    end

    def path
      root_dir.join('public', 'framework', 'releases', "#{version}.md")
    end

    def url
      "/framework/releases/#{version}.md"
    end

    def asset(base_url:)
      {
        name: "#{version}.md",
        type: 'markdown',
        variant: 'Release Notes',
        url: url,
        public_url: "#{base_url}#{url}",
        size: exists? ? File.size(path) : nil,
        sha256: exists? ? Digest::SHA256.file(path).hexdigest : nil,
        exists: exists?
      }
    end

    def to_h
      return nil unless exists?

      {
        version: version,
        path: path,
        url: url,
        html: html
      }
    end

    def html
      ActionController::Base.helpers.sanitize(
        MARKDOWN.render(File.read(path)),
        tags: SAFE_TAGS,
        attributes: SAFE_ATTRS,
        protocols: SAFE_PROTOCOLS
      )
    end
  end
end
