# Serves /framework/tiles/{z}/{x}/{y}.mvt, the vector tiles behind TRMNLMaps, from the source
# the host configures (Framework::Tiles). Prefixed like the other engine controllers because the
# engine is not isolated.
class FrameworkTilesController < Framework.parent_controller_class
  def show
    z, x, y = %i[z x y].map { |key| Integer(params.fetch(key), 10) }
    return head :not_found unless Framework::Tiles.in_range?(z, x, y)

    result = Framework::Tiles.fetch(z, x, y, if_none_match: request.headers["If-None-Match"])
    response.headers["Access-Control-Allow-Origin"] = "*"
    respond_with_tile(result)
  rescue *Framework::Tiles::UPSTREAM_ERRORS => e
    Rails.logger.warn("[trmnl-framework] tile #{z}/#{x}/#{y} upstream failed: #{e.class}")
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Cache-Control"] = "no-store"
    head :gateway_timeout
  end

  private

  # 200 hands the bytes on; an empty or missing tile is 204 (a map client draws nothing and raises
  # no error); 304 keeps the client's copy; anything else upstream is a 502 the client may retry.
  def respond_with_tile(result)
    response.headers["ETag"] = result.etag if result.etag.present?
    case result.status
    when 200
      response.headers["Cache-Control"] = Framework::Tiles::CACHE_CONTROL
      response.headers["Content-Encoding"] = result.content_encoding if result.content_encoding.present?
      send_data result.body, type: Framework::Tiles::CONTENT_TYPE, disposition: "inline"
    when 204, 404
      response.headers["Cache-Control"] = Framework::Tiles::CACHE_CONTROL
      head :no_content
    when 304
      head :not_modified
    else
      response.headers["Cache-Control"] = "no-store"
      head :bad_gateway
    end
  end
end
