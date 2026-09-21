# frozen_string_literal: true

require "json"
require "net/http"

module Framework
  # Every released css/js/zip is published to a public bucket with an index.json of its keys, so a
  # host mirrors whatever its gem tree lacks. Anonymous reads: no credentials, any host can run it.
  module Releases
    class ShortDownload < StandardError; end

    DEFAULT_URL = "https://trmnl-framework-releases.nyc3.digitaloceanspaces.com"
    INDEX = "index.json"

    def self.url = Rails.application.config.trmnl_framework.releases_url.presence || DEFAULT_URL

    # Downloads every indexed file missing under the mirror and returns the keys it fetched.
    def self.fetch(into: Framework.releases_root.join("public"))
      JSON.parse(get("#{url}/#{INDEX}").tap(&:value).body).reject { |key| into.join(key).file? }.each { |key| download(key, into.join(key)) }
    end

    # identity, or Net::HTTP inflates a .gz sibling on the way down and the mirror serves text as gzip.
    def self.get(url, &) = Net::HTTP.get_response(URI(url), { "Accept-Encoding" => "identity" }, &)

    # Written beside the target and renamed, so a process serving the mirror never sees a partial file.
    def self.download(key, target)
      target.dirname.mkpath
      partial = target.sub_ext("#{target.extname}.partial")
      get("#{url}/#{key}") do |response|
        response.value
        written = partial.open("wb") { |io| response.read_body { |chunk| io.write(chunk) }.then { io.size } }
        raise ShortDownload, "#{key}: #{written} of #{response['Content-Length']} bytes" if written != response["Content-Length"].to_i
      end
      partial.rename(target)
    ensure
      partial.delete if partial&.exist?
    end
  end
end
