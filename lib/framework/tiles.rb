# frozen_string_literal: true

require "net/http"

module Framework
  # The tile endpoint behind TRMNLMaps. Every host that mounts the engine answers
  # /framework/tiles/{z}/{x}/{y}.mvt by fetching the tile from Framework.tile_source_url and
  # handing the bytes on with the headers a map client and a CDN want: the vector tile content
  # type, the upstream encoding untouched, a day of public cache, an open CORS origin (a
  # screenshot renderer fetches from about:blank). The runtime resolves the endpoint from the
  # page's own origin, so a plugin never names a tile host and the host decides the source.
  module Tiles
    MAX_ZOOM = 14
    TIMEOUT_SECONDS = 8
    CONTENT_TYPE = "application/vnd.mapbox-vector-tile"
    CACHE_CONTROL = "public, max-age=86400"
    # Upstream failures a client should not cache and may retry.
    UPSTREAM_ERRORS = [Timeout::Error, SocketError, SystemCallError, OpenSSL::SSL::SSLError, Net::HTTPBadResponse,
                       Net::ProtocolError, IOError].freeze

    Result = Struct.new(:status, :body, :content_encoding, :etag, keyword_init: true)

    def self.in_range?(zoom, column, row)
      return false unless zoom.between?(0, MAX_ZOOM)

      extent = (1 << zoom) - 1
      column.between?(0, extent) && row.between?(0, extent)
    end

    def self.source_url_for(zoom, column, row)
      Framework.tile_source_url.gsub("{z}", zoom.to_s).gsub("{x}", column.to_s).gsub("{y}", row.to_s)
    end

    # One upstream GET. Accept-Encoding is set by hand so Net::HTTP leaves a gzipped tile as it
    # came (it only decodes what it asked for itself), and the encoding travels with the bytes.
    def self.fetch(zoom, column, row, if_none_match: nil)
      uri = URI.parse(source_url_for(zoom, column, row))
      request = Net::HTTP::Get.new(uri)
      request["User-Agent"] = Framework.tile_source_user_agent
      request["Accept-Encoding"] = "gzip"
      request["If-None-Match"] = if_none_match if if_none_match.present?
      response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https",
                                                     open_timeout: TIMEOUT_SECONDS, read_timeout: TIMEOUT_SECONDS) do |http|
        http.request(request)
      end
      Result.new(status: response.code.to_i, body: response.body.to_s, content_encoding: response["Content-Encoding"],
                 etag: response["ETag"])
    end
  end
end
