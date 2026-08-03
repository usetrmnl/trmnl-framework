# frozen_string_literal: true

module Framework
  # Centralizes menubar styling tokens for AppMenubarComponent and DocsChromeHelper.
  # Namespaced because the engine is not isolated: a bare `MenubarTheme` would claim a
  # generic global name in every host, and core already owns one of its own.
  # Tailwind: keep class strings here only if ./lib/**/*.rb is listed in config/tailwind.config.js content.
  # Set @menubar_theme = :framework in framework nav; omit elsewhere for :editor (Visual Editor, markups, etc.).
  class MenubarTheme
    DEFAULT_KEY = :editor

    attr_reader :header_bg, :header_border, :dropdown_trigger, :dropdown_menu, :divider

    def initialize(header_bg:, header_border:, dropdown_trigger:, dropdown_menu:, divider:)
      @header_bg = header_bg
      @header_border = header_border
      @dropdown_trigger = dropdown_trigger
      @dropdown_menu = dropdown_menu
      @divider = divider
    end

    def self.fetch(key)
      registry.fetch(normalize_key(key))
    end

    def self.normalize_key(key)
      k = key&.to_sym
      registry.key?(k) ? k : DEFAULT_KEY
    end

    def self.registry
      @registry ||= {
        editor: new(
          header_bg: "bg-white/60 dark:bg-gray-900/60",
          header_border: "border-b border-gray-200 dark:border-gray-650",
          dropdown_trigger:
            "inline-flex items-center justify-between gap-1.5 min-h-7 py-1 px-2.5 text-xs font-medium tracking-tight rounded-xl " \
            "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 " \
            "border border-gray-100 dark:border-gray-700 text-black dark:text-white " \
            "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 transition duration-150",
          dropdown_menu:
            "absolute mt-1 z-[130] rounded-xl border border-gray-200 dark:border-gray-700 " \
            "bg-white dark:bg-gray-900 shadow-lg p-1.5 space-y-0.5",
          divider: "h-6 w-px bg-gray-200/80 dark:bg-gray-700/80"
        ),
        framework: new(
          header_bg: "bg-gray-100/60 dark:bg-gray-800/60",
          header_border: "border-b border-gray-300 dark:border-gray-650",
          dropdown_trigger:
            "inline-flex items-center justify-between gap-1.5 min-h-7 py-1 px-2.5 text-xs font-medium tracking-tight rounded-xl " \
            "bg-transparent border border-gray-300 hover:bg-gray-200/40 dark:bg-transparent dark:hover:bg-gray-700/50 " \
            "dark:border-gray-650 text-black dark:text-white " \
            "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 transition duration-150",
          dropdown_menu:
            "absolute mt-1 z-[130] rounded-xl border border-gray-300 dark:border-gray-650 " \
            "bg-gray-50 dark:bg-gray-850 p-1.5 space-y-0.5 backdrop-blur-sm",
          divider: "h-6 w-px bg-gray-300 dark:bg-gray-650"
        )
      }.freeze
    end
    private_class_method :registry
  end
end
