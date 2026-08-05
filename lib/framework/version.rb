#
# Represents a bundle of Framework CSS and JS assets for a particular release version.
# It's injected as a `framework` local in all plugin views.
#
# Versions always come from the gem's `db/data/framework_versions.yml`. Released
# `/css|/js/<semver>/` files are served from the gem via Framework::Static.
#
# See `Framework::ReleaseTask` for how new versions are created in this repo.
#
module Framework
  class Version
    include Comparable

    attr_reader :number

    def self.config_path
      Framework.data_root.join("db/data/framework_versions.yml")
    end

    def self.config = @config ||= YAML.load_file(config_path).freeze
    def self.reload! = @config = nil
    def self.version_numbers = config['versions'].map { |v| v['number'] }.freeze

    # returns a format compatible with 'select' plugin field type
    def self.options
      [
        { "Always track latest (currently v#{latest.number})" => 'latest' }
      ] + version_numbers.reverse.map { |number| { "v#{number}" => number } }
    end

    # Host marker (Rails.root), so mother app can toggle live builds independently of the gem.
    def self.development_mode? = Rails.env.development? && Rails.root.join("tmp/framework-development.txt").exist?

    # Live builds are served from the gem at /framework-dev/ (see Framework::Static).
    # Host may also symlink public/framework-dev; prefer that mtime when present.
    def self.development_asset_url(file)
      build = [
        Rails.public_path.join("framework-dev/#{file}"),
        live_build_path(file)
      ].compact.find(&:exist?)

      "/framework-dev/#{file}?v=#{build ? build.mtime.to_i : 0}"
    end

    # Same candidates Framework::Static::DEV_FILES serves, so the mtime this stamps on the
    # URL belongs to the file the request will get. server_builds is the only build target:
    # dartsass writes to the host's Rails.root, never to the engine root's own
    # app/assets/builds/, which stopped being one when the docs app moved under server/.
    def self.live_build_path(file)
      root = Framework::Engine.root
      case file
      when "plugins.css"
        path = Framework.server_builds.join("plugins.css")
        path if path.exist?
      when "plugins.js"
        root.join("app/javascript/plugin-render/plugins.js")
      end
    end

    def self.latest = new(config['latest'])

    def pinned? = @pinned

    def initialize(number)
      if number == 'latest'
        @number = self.class.latest.number
        @pinned = false
      elsif self.class.version_numbers.include?(number)
        @number = number
        @pinned = true
      else
        raise ArgumentError, "unknown Framework version: #{number}"
      end
    end

    def css_url
      return self.class.development_asset_url("plugins.css") if self.class.development_mode?

      "#{asset_host}/css/#{@number}/plugins.min.css"
    end

    def js_url
      return self.class.development_asset_url("plugins.js") if self.class.development_mode?

      "#{asset_host}/js/#{@number}/plugins.min.js"
    end

    # Theme stylesheets this version publishes, keyed by theme id. Empty for versions
    # released before themes existed, so a host can link whatever this returns.
    # Development mode returns the released URLs too: the live build symlinks carry
    # plugins.css and plugins.js only, never themes.
    def theme_css_urls
      return {} unless Framework.public_root.join("css/#{@number}/themes").directory?

      Themes.ids.index_with { |id| "#{asset_host}/css/#{@number}/#{Themes.css_path(id)}" }
    end

    def ==(other) = other.is_a?(self.class) && number == other.number

    def <=>(other)
      return nil unless other.is_a?(self.class)

      Gem::Version.new(number) <=> Gem::Version.new(other.number)
    end

    def as_json(*) = number

    def major = Gem::Version.new(number).segments.first

    private

    def asset_host
      host = Rails.application.config.asset_host
      host.respond_to?(:call) ? host.call(nil) : host
    end
  end
end
