# Minimal stand-ins for the two core helpers the ported docs views still call. Both are
# reached from views in this repo; a stand-in nothing calls is a core-only helper that
# does not belong in the gem.
module CoreCompatHelper
  # Core uses the metamagic gem; the harness only needs the title/description assigns
  # that shared/_meta renders.
  def meta(title: nil, description: nil, **)
    @og_title = title if title
    @meta_description = description if description
    nil
  end

  # Core serves plugin icons from its plugin asset host; the harness only needs them for
  # the examples nav, where the manifest supplies absolute URLs instead (see
  # FrameworkHelper#plugin_page_icon). Kept for stray references in ported views.
  #
  # Prefer a same-origin copy under public/images/plugins when one is vendored: the
  # remote host 301-redirects and sends no CORS headers, which breaks CORS-restricted
  # consumers like `image--adaptive` mask recoloring. Serving locally also keeps the
  # docs self-contained. Falls back to the CDN for icons we don't vendor.
  def plugin_image_path(file_name)
    local = Framework.public_root.join('images/plugins', file_name)
    if local.exist?
      "/images/plugins/#{file_name}"
    else
      "https://usetrmnl.com/images/plugins/#{file_name}"
    end
  end
end
