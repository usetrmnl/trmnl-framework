# frozen_string_literal: true

class AppMenubarComponent < ViewComponent::Base
  renders_one :left
  renders_one :center
  renders_one :right

  POSITIONS = { relative: :relative, fixed: :fixed }.freeze

  # Full class names so Tailwind JIT can detect them (interpolation is not scanned).
  BACKDROP_BLUR_CLASSES = {
    none: "backdrop-blur-none",
    sm: "backdrop-blur-sm",
    default: "backdrop-blur",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
    :'2xl' => "backdrop-blur-2xl",
    :'3xl' => "backdrop-blur-3xl"
  }.freeze

  def initialize(position: :relative, compact: true, contained: false, theme: nil, blur: :sm)
    super()
    @position = POSITIONS[position] || :relative
    @compact = compact
    @contained = contained
    @theme = theme
    @blur = blur
  end

  def before_render
    key = @theme.nil? ? helpers.menubar_theme_key : Framework::MenubarTheme.normalize_key(@theme)
    @menubar_tokens = Framework::MenubarTheme.fetch(key)
  end

  def header_classes
    [
      "composition-editor-nav",
      position_classes,
      "z-50 flex shrink-0 items-center justify-between",
      @compact ? "gap-3 py-1.5" : "gap-4 py-3",
      @menubar_tokens.header_border,
      @menubar_tokens.header_bg,
      BACKDROP_BLUR_CLASSES.fetch(@blur) { BACKDROP_BLUR_CLASSES[:sm] },
      "px-4"
    ].join(" ")
  end

  private

  def position_classes
    @position == :fixed ? "fixed top-0 left-0 right-0" : "relative"
  end
end
