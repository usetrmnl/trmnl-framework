# Prefixed because the engine is not isolated: a bare `ImagesHelper` would claim a
# generic global name in every host. The helper methods themselves are unchanged.
module FrameworkImagesHelper
  # NOTE: a view calling sprite_icon depends on its layout rendering
  # sprite_icon_definitions, which inlines each referenced shared/icons
  # partial once as the <symbol> the <use> stubs point at.
  def sprite_icon(name, classes: nil)
    sprite_icon_names << name
    tag.svg(tag.use(href: "##{sprite_icon_id(name)}"), class: classes.presence || 'h-16 w-16')
  end

  def sprite_icon_names = @sprite_icon_names ||= Set.new

  def sprite_icon_id(name) = "fw-icon-#{name}"

  def sprite_icon_definitions
    return ''.html_safe if sprite_icon_names.empty?

    symbols = sprite_icon_names.sort.map { |name| sprite_icon_symbol(name) }
    tag.svg(safe_join(symbols), xmlns: 'http://www.w3.org/2000/svg', style: 'display: none')
  end

  def sprite_icon_symbol(name)
    source = render(partial: "shared/icons/#{name}", locals: { classes: nil })
    source = source.gsub(/<!--.*?-->/m, '').strip
    root = source[/<svg\b[^>]*>/]
    raise ArgumentError, "shared/icons/#{name} did not render an <svg> root" unless root

    # Strip fixed dimensions along with the class: a <symbol> must size to the
    # <use> site (icons carrying width="32" would clip inside smaller boxes).
    attrs = root.delete_prefix('<svg').delete_suffix('>')
                .sub(/\s*class="[^"]*"/, '')
                .sub(/\s*width="[^"]*"/, '')
                .sub(/\s*height="[^"]*"/, '')
    source.sub(root, %(<symbol id="#{sprite_icon_id(name)}"#{attrs}>)).sub(%r{</svg>\s*\z}m, '</symbol>').html_safe
  end
end
