# frozen_string_literal: true

module Framework
  # Sizes the system fonts a browser falls back to for characters the pixel fonts lack (Japanese,
  # Cyrillic, Thai, Vietnamese tone marks...). Emitted by framework.rake font_fallbacks.
  #
  # Each @font-face joins a pixel family under the same name and claims only the codepoints that
  # family has no glyph for, so a pixel glyph is never replaced.
  module FontFallbacks
    FONTS_DIR = File.expand_path('../../public/fonts', __dir__)

    # size-adjust per family, measured on production renders: how much larger a fallback script drew
    # next to this family than next to Latin on a plain page. A family with no entry here has no
    # fallbacks.
    FAMILIES = {
      'NicoClean' => { files: { 'normal' => 'NicoClean-Regular.ttf' }, size_adjust: 100 },
      'NicoPups' => { files: { 'normal' => 'NicoPups-Regular.ttf' }, size_adjust: 80 },
      'BlockKie' => { files: { 'normal' => 'BlockKie.ttf' }, size_adjust: 85 },
      'TRMNL12' => { files: { 'normal' => 'TRMNL12-Regular.ttf', 'bold' => 'TRMNL12-Bold.ttf' }, size_adjust: 85 },
      'TRMNL16' => { files: { 'normal' => 'TRMNL16-Regular.ttf', 'bold' => 'TRMNL16-Bold.ttf' }, size_adjust: 95 },
      'TRMNL21' => { files: { 'normal' => 'TRMNL21-Regular.ttf', 'bold' => 'TRMNL21-Bold.ttf' }, size_adjust: 95 }
    }.freeze

    # Fonts installed on the render boxes, by local() full name then PostScript name. Each is the
    # font Firefox renders the script in today, except DejaVu Sans, which replaces Firefox's serif
    # default. A script with no bold font keeps its regular glyphs in bold text.
    SCRIPTS = {
      'kana' => { ranges: [0x3040..0x30FF, 0x31F0..0x31FF], regular: ['Noto Sans CJK JP', 'NotoSansCJKjp-Regular'], bold: ['Noto Sans CJK JP Bold', 'NotoSansCJKjp-Bold'] },
      'han' => { ranges: [0x3000..0x303F, 0x3400..0x4DBF, 0x4E00..0x9FFF, 0xF900..0xFAFF, 0xFF00..0xFFEF], regular: ['Noto Sans CJK SC', 'NotoSansCJKsc-Regular'], bold: ['Noto Sans CJK SC Bold', 'NotoSansCJKsc-Bold'] },
      'hangul' => { ranges: [0x1100..0x11FF, 0x3130..0x318F, 0xAC00..0xD7AF], regular: ['Noto Sans CJK KR', 'NotoSansCJKkr-Regular'], bold: ['Noto Sans CJK KR Bold', 'NotoSansCJKkr-Bold'] },
      'thai' => { ranges: [0x0E00..0x0E7F], regular: ['Loma'], bold: ['Loma Bold', 'Loma-Bold'] },
      'devanagari' => { ranges: [0x0900..0x097F], regular: ['Lohit Devanagari', 'Lohit-Devanagari'] },
      'bengali' => { ranges: [0x0980..0x09FF], regular: ['Mukti'], bold: ['Mukti Bold', 'muktibold'] },
      'gurmukhi' => { ranges: [0x0A00..0x0A7F], regular: ['Lohit Gurmukhi', 'Lohit-Gurmukhi'] },
      'oriya' => { ranges: [0x0B00..0x0B7F], regular: ['ori1Uni Medium', 'utkal'] },
      'tamil' => { ranges: [0x0B80..0x0BFF], regular: ['Lohit Tamil', 'Lohit-Tamil'] },
      'telugu' => { ranges: [0x0C00..0x0C7F], regular: ['Lohit Telugu', 'Lohit-Telugu'] },
      'kannada' => { ranges: [0x0C80..0x0CFF], regular: ['Lohit Kannada', 'Lohit-Kannada'] },
      'malayalam' => { ranges: [0x0D00..0x0D7F], regular: ['Rachana', 'Rachana-Regular'], bold: ['Rachana-Bold'] },
      # Latin extensions (Vietnamese), Greek, Cyrillic, Armenian, Hebrew, Arabic, Lao, Georgian.
      'dejavu' => {
        ranges: [0x00A0..0x024F, 0x0370..0x06FF, 0x0750..0x077F, 0x0E80..0x0EFF, 0x10A0..0x10FF, 0x1E00..0x1EFF, 0xFB50..0xFDFF, 0xFE70..0xFEFF],
        regular: ['DejaVu Sans', 'DejaVuSans'], bold: ['DejaVu Sans Bold', 'DejaVuSans-Bold']
      }
    }.freeze

    module_function

    def css
      FAMILIES.flat_map do |family, config|
        config[:files].flat_map do |weight, file|
          missing = missing_codepoints(file)
          SCRIPTS.each_value.filter_map { |script| font_face(family, weight, config[:size_adjust], script, missing) }
        end
      end.join("\n")
    end

    def font_face(family, weight, size_adjust, script, missing)
      ranges = unicode_ranges(script[:ranges].flat_map(&:to_a) & missing)
      return if ranges.empty?

      names = (weight == 'bold' && script[:bold]) || script[:regular]
      <<~CSS
        @font-face {
          font-family: '#{family}';
          font-weight: #{weight};
          src: #{names.map { |name| %(local('#{name}')) }.join(', ')};
          size-adjust: #{size_adjust}%;
          unicode-range: #{ranges.join(', ')};
        }
      CSS
    end

    def missing_codepoints(file)
      # Build-only, required here rather than at the top: this file eager-loads into every host.
      require 'ttfunk'

      covered = TTFunk::File.open(File.join(FONTS_DIR, file)).cmap.unicode.first.code_map.reject { |_code, glyph| glyph.zero? }.keys
      SCRIPTS.each_value.flat_map { |script| script[:ranges].flat_map(&:to_a) }.uniq - covered
    end

    def unicode_ranges(codepoints)
      codepoints.sort.slice_when { |a, b| b != a + 1 }.map do |run|
        run.one? ? format('U+%04X', run.first) : format('U+%04X-%04X', run.first, run.last)
      end
    end
  end
end
