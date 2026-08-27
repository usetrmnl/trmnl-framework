# frozen_string_literal: true

require 'fileutils'
require 'yaml'
require_relative '../framework/color_utils'
require_relative '../framework/color_data'
require_relative '../framework/color_manifest'
require_relative '../framework/border_line_specs'
require_relative '../framework/bayer_tiles'
require_relative '../framework/dither_ramps'
require_relative '../framework/themes'

# Standalone port of core's framework:colors tasks. The generator libs are
# Rails-optional (they resolve db/data + tmp relative to the repo root when Rails
# is absent), but these rake wrappers boot Rails anyway: resolved_manifest depends
# on :environment and every color task depends on it. Call the libs directly to skip
# the boot. Output must stay byte-identical to core's
# app/assets/stylesheets/framework/config/_*.scss.
namespace :framework do
  STYLES_DIR = File.expand_path('../../app/assets/stylesheets/framework/config', __dir__)

  desc "Generate resolved color manifest JSON from db/data/framework_colors.yml"
  task resolved_manifest: :environment do
    out_path = Framework::ColorManifest.write_resolved_json
    puts "Generated #{out_path}"
  end

  desc "Generate color tokens SCSS from db/data/framework_colors.yml"
  task color_tokens: [:resolved_manifest] do
    manifest = Framework::ColorManifest.load_resolved_json
    FileUtils.mkdir_p(STYLES_DIR)

    color_entries = manifest['color_palette'].map do |token, hex|
      "'#{token}': #{hex.gsub('"', '')}"
    end
    color_palette_scss = color_entries.join(",\n  ")

    limited_ids_scss = manifest['color_palette_limited_ids'].map { |id| "'#{id}'" }.join(', ')
    grayscale_1bit_ids = manifest['limited_palette_grayscale_1bit_ids'] || %w[3bwr 3bwy 4bwry 6a 7a]
    grayscale_1bit_ids_scss = grayscale_1bit_ids.map { |id| "'#{id}'" }.join(', ')
    preview_limited_white_hex = (manifest['preview_limited_palette_white_hex'] || '#BBBBBB').to_s.gsub('"', '')

    hex_channels = ->(hex) { hex.delete('"#').scan(/../).map { |channel| channel.to_i(16) } }
    channels_hex = ->(channels) { format('#%02X%02X%02X', *channels) }
    mix_channels = ->(from, to, ratio) { from.zip(to).map { |f, t| (f + ((t - f) * ratio)).round } }
    mix_ratio = lambda do |target, from, to|
      ratios = target.zip(from, to).filter_map { |tg, f, t| (tg - f).fdiv(t - f) unless t == f }
      ratios.sum.fdiv(ratios.size).clamp(0.0, 1.0)
    end

    # Preview solids for chromatic stroke vars: invert each step's raw mix
    # ratio (black->hue for shades, hue->white for tints) and reapply it
    # against the preview base hex, the solid analogue of the pixel remap
    # the -preview tile families apply.
    black = [0, 0, 0]
    white = [255, 255, 255]
    # Border-token line specs per variant:
    # ('solid', color) or ('seq', accent, fill, run). Sass renders them as
    # repeating-linear-gradient values so no pattern files are fetched.
    clean_hex = ->(hex) { hex.to_s.gsub('"', '') }
    border_token_lines = [['', '#FFFFFF'], ['-preview', preview_limited_white_hex]].to_h do |suffix, white_hex|
      white_rgb = Framework::ColorUtils.hex_to_rgb(white_hex)
      gray_runs = Framework::BorderLineSpecs.gray_white_runs(manifest['color_palette'], white_rgb)
      entries = ["'black': ('solid', #000000)"]
      gray_runs.each { |token, run| entries << "'#{token}': ('seq', #000000, #{white_hex}, #{run})" }
      entries << "'white': ('solid', #{white_hex})"
      manifest['color_hues'].each do |hue|
        preview_hue = suffix == '-preview' ? (manifest['preview_color_map'] || {})[hue] : nil
        entries << "'#{hue}': ('solid', #{clean_hex.call(preview_hue || manifest['color_palette'].fetch(hue))})"
        manifest['color_shade_steps'].each do |step|
          token_hex = clean_hex.call(manifest['color_palette'].fetch("#{hue}-#{step}"))
          run = Framework::BorderLineSpecs.hue_step_run(step)
          entries << if step <= 40
                       "'#{hue}-#{step}': ('seq', #000000, #{token_hex}, #{run})"
                     else
                       "'#{hue}-#{step}': ('seq', #{token_hex}, #{white_hex}, #{run})"
                     end
        end
      end
      [suffix, entries.join(",\n  ")]
    end

    # The 2-bit rail's token lines. A 2-bit device renders border levels on four
    # tones but used to render token lines as pure black on white, so the same
    # rail disagreed with itself. Each token dithers between the two tones
    # bracketing it, which is where the mid-gray accents come from.
    border_token_lines_2bit = (%w[black] + Framework::ColorUtils::GRAY_TOKENS + %w[white]).map do |token|
      kind, *fields = Framework::BorderLineSpecs.two_bit_gray_line(token)
      "'#{token}': ('#{kind}', #{fields.join(', ')})"
    end.join(",\n  ")

    # Border level lines: the hand-crafted staggered patterns as source-pixel
    # segments. Sass emits both the percentage gradient stops and the SVG-ready
    # renderer program from these exact coordinates. The 1-bit family carries
    # semantic dark/light tokens. Sass
    # resolves them through the --theme-border-line-* chains so themes recolor
    # the patterns without changing their geometry. The 2-bit family stays
    # hex-baked (grayscale devices render theme hues as grays anyway).
    level_entries = lambda do |patterns, color_of|
      patterns.map do |level, spec|
        row = spec[:row]
        if row.uniq.size == 1
          "#{level}: ('solid', #{color_of.call(row.first)})"
        else
          segments = Framework::BorderLineSpecs.row_segments(row).map do |value, seg_start, seg_end|
            "(#{color_of.call(value)}, #{seg_start}, #{seg_end})"
          end
          "#{level}: ('layers', #{spec[:w]}, #{spec[:stagger]}, (#{segments.join(', ')}))"
        end
      end.join(",\n  ")
    end
    border_level_lines = {
      '1bit' => level_entries.call(Framework::BorderLineSpecs::ONE_BIT_LEVEL_PATTERNS,
                                   lambda { |v|
                                     if v.nil?
                                       'transparent'
                                     else
                                       (v.zero? ? 'dark' : 'light')
                                     end
                                   }),
      '2bit' => level_entries.call(Framework::BorderLineSpecs::TWO_BIT_LEVEL_PATTERNS,
                                   ->(v) { format('#%02X%02X%02X', *Framework::BorderLineSpecs::TWO_BIT_LEVEL_COLORS.fetch(v)) })
    }

    # Limited-palette chromatic border lines: rows/cols 0-1 of the palette's
    # Bayer tiles, sliced into gradient stops. The dispatch below mirrors the
    # tile-spec palette loop further down; a change to either branch has to be
    # made in both by hand.
    tile_size = 16
    tile_stops = lambda do |cells|
      pct = ->(i) { format('%.4f', i * 100.0 / cells.length).sub(/\.?0+\z/, '') }
      Framework::BorderLineSpecs.row_segments(cells).map do |hex, seg_start, seg_end|
        "#{hex} #{pct.call(seg_start)}% #{pct.call(seg_end)}%"
      end.join(', ')
    end
    tile_lines = lambda do |pixel_of|
      rows = [0, 1].map { |y| tile_stops.call(Array.new(tile_size) { |x| pixel_of.call(x, y) }) }
      cols = [0, 1].map { |x| tile_stops.call(Array.new(tile_size) { |y| pixel_of.call(x, y) }) }
      "('rows', '#{rows[0]}', '#{rows[1]}', '#{cols[0]}', '#{cols[1]}')"
    end

    preview_palette_ids = (manifest['preview_palette_ids'] || []).map { |id| "color-#{id}" }
    preview_hex_remap = {
      '#FF0000' => (manifest['preview_color_map'] || {})['red'],
      '#FFFF00' => (manifest['preview_color_map'] || {})['yellow'],
      '#00FF00' => (manifest['preview_color_map'] || {})['green'],
      '#0000FF' => (manifest['preview_color_map'] || {})['blue'],
      '#FFFFFF' => (manifest['preview_color_map'] || {})['white']
    }.compact.transform_values { |hex| hex.to_s.upcase }

    # Background/text tile paint: the dither art as ink-cell SVG data URIs plus
    # per-token paint specs. Ink pixels (dark/accent) are baked into each asset;
    # the light tone rides the color longhand, so preview and dark modes recolor
    # shared geometry instead of fetching separate art. Framework::BayerTiles
    # holds the pixel math; the dispatch around it lives here. Spec forms:
    #   ('solid', #hex)              image none, color hex
    #   ('tile', 'asset', #field)    image var(--tile-asset), color = light tone
    #   ('baked', 'asset')           fully-opaque asset (accent-hash art)
    tile_field_marker = :field
    tile_grid = ->(pixel_of) { Array.new(tile_size) { |y| Array.new(tile_size) { |x| pixel_of.call(x, y) } } }
    tile_ink_runs = lambda do |grid, color|
      path = +''
      grid.each_with_index do |row, y|
        x = 0
        while x < tile_size
          if row[x] == color
            width = 1
            width += 1 while x + width < tile_size && row[x + width] == color
            path << "M#{x} #{y}h#{width}v1h-#{width}z"
            x += width
          else
            x += 1
          end
        end
      end
      path
    end
    tile_svg_uri = lambda do |grid|
      color_counts = grid.flatten.tally
      background_rect = ''
      drawn = color_counts.keys - [tile_field_marker]
      unless color_counts.key?(tile_field_marker)
        background = color_counts.max_by { |_color, count| count }.first
        background_rect = "<rect width='16' height='16' fill='#{background}'/>"
        drawn -= [background]
      end
      paths = drawn.map { |color| "<path d='#{tile_ink_runs.call(grid, color)}' fill='#{color}'/>" }.join
      svg = "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' shape-rendering='crispEdges'>" \
            "#{background_rect}#{paths}</svg>"
      "data:image/svg+xml,#{svg.gsub('#', '%23').gsub('<', '%3C').gsub('>', '%3E')}"
    end

    tile_assets = {}
    register_tile = lambda do |name, grid|
      uri = tile_svg_uri.call(grid)
      raise "tile asset #{name} generated with different art" if tile_assets.key?(name) && tile_assets[name] != uri

      tile_assets[name] = uri
      name
    end

    base_color_slugs = { '#FF0000' => 'red', '#FFFF00' => 'yellow', '#00FF00' => 'green',
                         '#0000FF' => 'blue', '#FFA500' => 'orange', '#FFFFFF' => 'white', '#000000' => 'black' }
    preview_color_slugs = preview_hex_remap.filter_map do |raw_hex, preview_hex|
      [preview_hex.to_s, "preview-#{base_color_slugs.fetch(raw_hex)}"] unless preview_hex == raw_hex
    end.to_h
    tile_color_slug = ->(hex) { base_color_slugs[hex.upcase] || preview_color_slugs[hex.upcase] || "c#{hex.delete('#').downcase}" }

    # Grayscale rails. The 1-bit curated art and the 2-bit ink cells never
    # contain white, so raw and preview variants share assets and differ only
    # in the field hex.
    one_bit_gray_specs = lambda do |field_hex|
      entries = { 'black' => "('solid', #000000)" }
      Framework::BayerTiles::ONE_BIT_CURATED_DITHER.each do |token, dither|
        occupancy = Framework::BayerTiles.high_occupancy_grid(dither[:white_count], dither[:phase])
        grid = tile_grid.call(->(x, y) { Framework::BayerTiles.curated_two_tone_pixel(x, y, occupancy, low: '#000000', high: tile_field_marker) })
        asset = register_tile.call("#{token}-1bit", grid)
        entries[token] = "('tile', '#{asset}', #{field_hex})"
      end
      entries['white'] = "('solid', #{field_hex})"
      { 'gray-1' => 'gray-10', 'gray-2' => 'gray-20', 'gray-3' => 'gray-30', 'gray-4' => 'gray-40',
        'gray-5' => 'gray-50', 'gray-6' => 'gray-60', 'gray-7' => 'gray-70' }.each do |legacy, primary|
        entries[legacy] = entries.fetch(primary)
      end
      # The one clump-free tone on this rail: a Bayer threshold at half the
      # matrix is a pure checkerboard, so it reads as a flat mid-tone at
      # backdrop scale where the curated dithers read as stipple. Emitted for
      # every family the rail builds so the screen-backdrop slot has a token to
      # point at (base/_screen-mode-vars.scss) instead of a palette byproduct.
      checker = tile_grid.call(->(x, y) { Framework::BayerTiles.two_color_pixel(x, y, 32, '#000000', tile_field_marker) })
      entries['checker'] = "('tile', '#{register_tile.call('checker-1bit', checker)}', #{field_hex})"
      entries
    end

    two_bit_gray_specs = lambda do |preview_white|
      gray_hex = ->(value) { format('#%02X%02X%02X', value, value, value) }
      remap_white = ->(hex) { preview_white && hex == '#FFFFFF' ? preview_white : hex }
      (%w[black] + Framework::ColorUtils::GRAY_TOKENS + %w[white]).to_h do |token|
        spec = Framework::BayerTiles.two_bit_spec_for_token(token)
        if spec[:solid]
          [token, "('solid', #{remap_white.call(gray_hex.call(spec[:rgb][0]))})"]
        else
          low_hex = gray_hex.call(spec[:low_rgb][0])
          occupancy = Framework::BayerTiles.high_occupancy_grid(spec[:high_count], spec[:phase])
          grid = tile_grid.call(->(x, y) { Framework::BayerTiles.curated_two_tone_pixel(x, y, occupancy, low: low_hex, high: tile_field_marker) })
          asset = register_tile.call("#{token}-2bit", grid)
          [token, "('tile', '#{asset}', #{remap_white.call(gray_hex.call(spec[:high_rgb][0]))})"]
        end
      end
    end

    palette_line_maps = {}
    palette_tile_maps = {}
    [['', false], ['-preview', true]].each do |suffix, preview|
      (manifest['limited_palettes'] || {}).each do |palette_id, palette_colors|
        remap = preview && preview_palette_ids.include?(palette_id) ? preview_hex_remap : {}
        rehex = ->(hex) { remap.fetch(hex.to_s.upcase, hex.to_s.upcase) }
        colors = Array(palette_colors).map(&rehex)
        use_1bit_grayscale = grayscale_1bit_ids.include?(palette_id.delete_prefix('color-'))
        white_hex = if preview && use_1bit_grayscale
                      preview_limited_white_hex
                    else
                      rehex.call('#FFFFFF')
                    end
        entries = []
        # Every shipped limited palette sits on the 1-bit gray rail, so that is the
        # only rail this loop builds; a palette outside the set would need its own
        # gray specs here before it could be listed.
        tile_entries = one_bit_gray_specs.call(white_hex)
        manifest['color_hues'].each do |hue|
          accents = Array(((manifest['hue_to_accents'] || {})[palette_id] || {})[hue]).map(&rehex)
          next if accents.empty?

          if accents.size == 2 && colors.include?(accents[0]) && colors.include?(accents[1])
            color_a, color_b = accents
            hash_slug = "#{tile_color_slug.call(color_a)}-#{tile_color_slug.call(color_b)}"
            entries << "'#{hue}': #{tile_lines.call(->(x, y) { Framework::BayerTiles.two_color_pixel(x, y, 32, color_a, color_b) })}"
            base_asset = register_tile.call("#{hash_slug}-base", tile_grid.call(->(x, y) { Framework::BayerTiles.two_color_pixel(x, y, 32, color_a, color_b) }))
            tile_entries[hue] = "('baked', '#{base_asset}')"
            manifest['color_shade_steps'].each do |step|
              level = Framework::BayerTiles::STEP_TO_BAYER_LEVEL[step]
              next unless level

              dark = step <= 40
              entries << "'#{hue}-#{step}': #{tile_lines.call(->(x, y) { Framework::BayerTiles.three_color_pixel(x, y, level, dark: dark, color_a: color_a, color_b: color_b, white: white_hex) })}"
              tile_entries["#{hue}-#{step}"] = if dark
                                                 asset = register_tile.call("#{hash_slug}-dark-#{step}", tile_grid.call(lambda { |x, y|
                                                   Framework::BayerTiles.three_color_pixel(x, y, level, dark: true, color_a: color_a, color_b: color_b, white: white_hex)
                                                 }))
                                                 "('baked', '#{asset}')"
                                               else
                                                 asset = register_tile.call("#{hash_slug}-light-#{step}", tile_grid.call(lambda { |x, y|
                                                   Framework::BayerTiles.three_color_pixel(x, y, level, dark: false, color_a: color_a, color_b: color_b, white: tile_field_marker)
                                                 }))
                                                 "('tile', '#{asset}', #{white_hex})"
                                               end
            end
          else
            accent = accents.size == 1 ? accents[0] : accents.find { |c| colors.include?(c) }
            next unless accent

            if colors.include?(accent)
              entries << "'#{hue}': ('solid', #{accent})"
              tile_entries[hue] = "('solid', #{accent})"
            end
            manifest['color_shade_steps'].each do |step|
              level = Framework::BayerTiles::STEP_TO_BAYER_LEVEL[step]
              next unless level

              color_a = step <= 40 ? '#000000' : accent
              color_b = step <= 40 ? accent : white_hex
              entries << "'#{hue}-#{step}': #{tile_lines.call(->(x, y) { Framework::BayerTiles.two_color_pixel(x, y, level, color_a, color_b) })}"
              tile_entries["#{hue}-#{step}"] = if step <= 40
                                                 asset = register_tile.call("chromatic-dark-#{step}", tile_grid.call(lambda { |x, y|
                                                   Framework::BayerTiles.two_color_pixel(x, y, level, '#000000', tile_field_marker)
                                                 }))
                                                 "('tile', '#{asset}', #{accent})"
                                               else
                                                 asset = register_tile.call("#{tile_color_slug.call(accent)}-light-#{step}", tile_grid.call(lambda { |x, y|
                                                   Framework::BayerTiles.two_color_pixel(x, y, level, accent, tile_field_marker)
                                                 }))
                                                 "('tile', '#{asset}', #{white_hex})"
                                               end
            end
          end
        end
        palette_line_maps["#{palette_id}#{suffix}"] = entries.join(",\n    ")
        palette_tile_maps["#{palette_id}#{suffix}"] = tile_entries
      end
    end
    border_palette_lines_scss = palette_line_maps.map { |key, body| "'#{key}': (\n    #{body}\n  )" }.join(",\n  ")

    grayscale_tile_maps = {
      'grayscale' => one_bit_gray_specs.call('#FFFFFF'),
      'grayscale-preview' => one_bit_gray_specs.call(preview_limited_white_hex),
      'grayscale--2bit' => two_bit_gray_specs.call(nil),
      'grayscale-preview--2bit' => two_bit_gray_specs.call(preview_limited_white_hex)
    }
    bg_tile_specs_scss = grayscale_tile_maps.merge(palette_tile_maps).map do |family, specs|
      body = specs.map { |token, spec| "'#{token}': #{spec}" }.join(",\n    ")
      "'#{family}': (\n    #{body}\n  )"
    end.join(",\n  ")
    dither_tile_assets_scss = tile_assets.map { |name, uri| "'#{name}': \"#{uri}\"" }.join(",\n  ")

    preview_palette_entries = (manifest['preview_color_map'] || {}).except('white').flat_map do |hue, preview_hex|
      raw_base = hex_channels.call(manifest['color_palette'].fetch(hue))
      preview_base = hex_channels.call(preview_hex)
      step_entries = manifest['color_shade_steps'].map do |step|
        raw_step = hex_channels.call(manifest['color_palette'].fetch("#{hue}-#{step}"))
        dark_side = raw_step.zip(raw_base).all? { |step_channel, base_channel| step_channel <= base_channel }
        ratio = dark_side ? mix_ratio.call(raw_step, black, raw_base) : mix_ratio.call(raw_step, raw_base, white)
        preview_step = dark_side ? mix_channels.call(black, preview_base, ratio) : mix_channels.call(preview_base, white, ratio)
        "'#{hue}-#{step}': #{channels_hex.call(preview_step)}"
      end
      ["'#{hue}': #{preview_hex.gsub('"', '')}"] + step_entries
    end
    preview_color_palette_scss = preview_palette_entries.join(",\n  ")

    # Strokes are the only paint chain that has to be a single solid, so a limited
    # palette resolves each hue to the framework hue nearest the panel accent its
    # dither art already uses. Two-ink blends collapse to the primary accent.
    base_hue_channels = manifest['color_hues'].index_with { |hue| hex_channels.call(manifest['color_palette'].fetch(hue)) }
    nearest_base_hue = lambda do |hex|
      accent = hex_channels.call(hex)
      base_hue_channels.min_by { |_hue, channels| channels.zip(accent).sum { |channel, ink| (channel - ink)**2 } }.first
    end
    palette_hue_accents_scss = (manifest['hue_to_accents'] || {}).map do |palette_id, hue_accents|
      body = hue_accents.map { |hue, accents| "'#{hue}': '#{nearest_base_hue.call(Array(accents).first)}'" }.join(",\n    ")
      "'#{palette_id}': (\n    #{body}\n  )"
    end.join(",\n  ")

    hues_scss = manifest['color_hues'].join(', ')
    steps_scss = manifest['color_shade_steps'].join(', ')
    color_fallback_content = manifest['color_to_gray_fallback'].map { |token, gray| "'#{token}': '#{gray}'" }.join(",\n  ")

    generated = <<~SCSS
      // ============================================
      // TRMNL Framework - Color tokens (GENERATED)
      // ============================================
      // Generated from db/data/framework_colors.yml
      // Regenerate with: rake framework:color_tokens
      // ============================================

      $color-hues: (#{hues_scss});
      $color-shade-steps: (#{steps_scss});

      $color-palette-framework: (
        #{color_palette_scss}
      );

      $color-to-gray-fallback: (
        #{color_fallback_content}
      );

      $color-palette-limited-ids: (#{limited_ids_scss});
      $limited-palette-grayscale-1bit-ids: (#{grayscale_1bit_ids_scss});
      $preview-limited-palette-white-hex: #{preview_limited_white_hex};

      $preview-color-palette: (
        #{preview_color_palette_scss}
      );

      $palette-hue-accents: (
        #{palette_hue_accents_scss}
      );

      $border-token-lines: (
        #{border_token_lines['']}
      );

      $border-token-lines-preview: (
        #{border_token_lines['-preview']}
      );

      $border-token-lines-2bit: (
        #{border_token_lines_2bit}
      );

      $border-level-lines-1bit: (
        #{border_level_lines['1bit']}
      );

      $border-level-lines-2bit: (
        #{border_level_lines['2bit']}
      );

      $border-palette-lines: (
        #{border_palette_lines_scss}
      );

      $dither-tile-assets: (
        #{dither_tile_assets_scss}
      );

      $bg-tile-specs: (
        #{bg_tile_specs_scss}
      );
    SCSS

    out_path = File.join(STYLES_DIR, '_tokens_colors_generated.scss')
    File.write(out_path, generated)
    puts "Generated #{out_path}"
  end

  desc "Generate CSS color variables from db/data/framework_colors.yml"
  task css_variables: [:resolved_manifest] do
    manifest = Framework::ColorManifest.load_resolved_json
    FileUtils.mkdir_p(STYLES_DIR)

    lines = []
    lines << "    // Color palette framework (10 base hues + 10 hues × 14 steps)"
    manifest['color_palette'].each_slice(6) do |slice|
      vars = slice.map { |token, hex| "--#{token}: #{hex}" }.join('; ')
      lines << "    #{vars};"
    end

    generated = <<~SCSS
      // ============================================
      // TRMNL Framework - CSS color variables (GENERATED)
      // ============================================
      // Generated from db/data/framework_colors.yml
      // Regenerate with: rake framework:css_variables
      // ============================================

      :root {
      #{lines.join("\n")}
      }
    SCSS

    out_path = File.join(STYLES_DIR, '_variables_colors.scss')
    File.write(out_path, generated)
    puts "Generated #{out_path}"
  end

  # The one color task with no YAML behind it: the ramps are Bayer math over the
  # constants in Framework::DitherRamps, so this one skips the resolved manifest.
  desc "Generate item-fill dither ramp SCSS from the Bayer threshold map"
  task dither_ramps: :environment do
    FileUtils.mkdir_p(STYLES_DIR)

    ramp_assets_scss = Framework::DitherRamps.rail_uris.map { |rail, uri| "'#{rail}': \"#{uri}\"" }.join(",\n  ")

    generated = <<~SCSS
      // ============================================
      // TRMNL Framework - Item fill dither ramps (GENERATED)
      // ============================================
      // Generated from lib/framework/dither_ramps.rb
      // Regenerate with: rake framework:dither_ramps
      // ============================================

      @use 'tokens' as vars;

      $item-fill-ramp-width: #{Framework::DitherRamps::RAMP_WIDTH}px;
      $item-fill-ramp-height: #{Framework::DitherRamps::RAMP_HEIGHT}px;

      $item-fill-ramp-assets: (
        #{ramp_assets_scss}
      );

      $item-fill-ramp-full: "#{Framework::DitherRamps.full_ramp_value}";

      // The ramp art, then the rail each mode paints it from. Selection is per
      // mode and not per theme: which tones a screen can render is device
      // capability, the same thing the --bg-* rails encode, so a theme names
      // --framework-item-fill-ramp and gets its own screen's art.
      //
      // A fill paints one with:
      //   background-image: var(--framework-item-fill-ramp);
      //   background-size: var(--framework-item-fill-ramp-size);
      //   background-repeat: repeat-y;
      //   background-position: left top;
      @mixin item-fill-ramp-vars {
          .screen {
              @each $rail, $uri in $item-fill-ramp-assets {
                  // Double quotes are load-bearing: the URIs carry raw single quotes, and
                  // Dart Sass 1.94+ splices custom-property text verbatim instead of re-quoting.
                  --framework-item-fill-ramp-\#{$rail}: url("\#{$uri}");
              }
              --framework-item-fill-ramp-full: \#{$item-fill-ramp-full};

              // An unclassed screen makes no device claim, so it takes the most
              // constrained rail: the same reading --framework-bit-depth publishes,
              // and the safe one, because a smooth gradient is what a 1-bit panel
              // cannot render while dithered art reads on every rail.
              --framework-item-fill-ramp: var(--framework-item-fill-ramp-1bit);
              // Natural size over the screen's own transform scale, so one source
              // pixel lands on one device pixel. Anything else resamples pixels the
              // dither already decided and reads as a blur.
              --framework-item-fill-ramp-size: calc(\#{$item-fill-ramp-width} / var(--dither-ratio)) calc(\#{$item-fill-ramp-height} / var(--dither-ratio));
          }

          .screen.screen--2bit {
              --framework-item-fill-ramp: var(--framework-item-fill-ramp-2bit);
          }

          .screen.screen--4bit,
          .screen.screen--8bit,
          .screen.screen--16bit {
              --framework-item-fill-ramp: var(--framework-item-fill-ramp-4bit);
          }

          // Solid-capable rails take the gradient the dithered ones quantize, sized
          // to the box because a gradient has no natural width worth preserving.
          .screen.screen--color-full {
              --framework-item-fill-ramp: var(--framework-item-fill-ramp-full);
              --framework-item-fill-ramp-size: auto;
          }

          // Limited palettes paint their grays on the 1-bit rail, so a palette
          // screen wearing a deeper mode class takes the 1-bit ramp back. Same
          // last-rule-wins ordering _screen-paint-depth-vars relies on.
          @each $palette-id in vars.$color-palette-limited-ids {
              .screen.screen--color-\#{$palette-id} {
                  --framework-item-fill-ramp: var(--framework-item-fill-ramp-1bit);
              }
          }
      }
    SCSS

    out_path = File.join(STYLES_DIR, '_dither_ramps_generated.scss')
    File.write(out_path, generated)
    puts "Generated #{out_path} (#{File.size(out_path)} bytes)"
  end

  desc "Regenerate all framework color artifacts (tokens, CSS variables, dither ramps)"
  task colors: [:color_tokens, :css_variables, :dither_ramps]

  # The docs chrome is Tailwind, and a host cannot rebuild it: the input scans the
  # gem's views and pulls npm plugins. So the gem ships a snapshot of the build,
  # which Framework::Static serves at /framework-docs/tailwind.css wherever the host
  # has no tailwind.css of its own. Refreshed by the release build; run this by hand
  # after a chrome change if you want the snapshot current before a release.
  desc "Refresh the packaged docs chrome CSS from the Tailwind build"
  task docs_chrome: [:environment, 'tailwindcss:build'] do
    built = Rails.root.join('app/assets/builds/tailwind.css')
    abort "No Tailwind build at #{built}. Run bin/setup first." unless built.exist?

    out_path = File.expand_path('../../app/assets/static/docs_chrome.css', __dir__)
    banner = "/*! TRMNL docs chrome. Generated: run `bin/rails framework:docs_chrome`, do not edit. */\n"
    File.write(out_path, banner + built.read)
    puts "Generated #{out_path} (#{File.size(out_path)} bytes)"
  end

  # The v1.2 bundle is compiled by every build path (bin/build, bin/watch-css, the
  # dartsass mapping in the engine) and published by none, so /framework-docs/
  # plugins_legacy.css had nothing behind it in a packaged gem. It ships as a committed
  # snapshot for the same reason the docs chrome does, and is refreshed the same way:
  # by the release build, or by hand after a plugins_legacy.scss change. A stale copy
  # fails spec/assets/stylesheets/framework_legacy_bundle_spec.rb, which compares it
  # against a fresh compile.
  desc "Refresh the packaged v1.2 legacy bundle from the Sass build"
  task legacy_bundle: [:environment, 'dartsass:build'] do
    built = Rails.root.join('app/assets/builds/plugins_legacy.css')
    abort "No legacy bundle at #{built}. Run bin/setup first." unless built.exist?

    out_path = File.expand_path('../../app/assets/static/legacy_bundle.css', __dir__)
    banner = "/*! TRMNL v1.2 bundle. Generated: run `bin/rails framework:legacy_bundle`, do not edit. */\n"
    File.write(out_path, banner + built.read)
    puts "Generated #{out_path} (#{File.size(out_path)} bytes)"
  end

  # What a release publishes as plugins.css, and as the plugins.min.css alias cut from
  # the same bytes. Building it on demand gives the size work a stable input and gives
  # bin/rule-diff, the public-contract spec, and the browser suites a way to reach the
  # served bytes without cutting a release.
  #
  # Prerequisites are the release build's first two steps and not the task itself:
  # framework:docs_chrome and framework:legacy_bundle refresh committed snapshots, and a
  # verification task has no business writing tracked files.
  desc 'Build the processed bundle a release would publish (renamed + minified)'
  task processed_bundle: [:environment, 'framework:colors', 'dartsass:build'] do
    builds_dir = Rails.root.join('app/assets/builds')
    source = builds_dir.join('plugins.css')
    abort "No CSS bundle at #{source}. Run bin/setup first." unless source.exist?

    # The same theme preserve flags Framework::ReleaseTask#process_stylesheet passes: a
    # custom property named by any theme is contract, not plumbing, and stays unrenamed.
    theme_css = Framework::Themes.ids.map { |id| builds_dir.join(Framework::Themes.css_path(id)) }
    missing = theme_css.reject(&:exist?)
    abort "No theme CSS at #{missing.join(', ')}. Run bin/setup first." if missing.any?

    # The released version's published themes ride along, as in the release task: a
    # pinned or cached theme file from that version keeps resolving against this bundle
    # even where the current theme sources no longer name a variable. The engine root
    # comes from __dir__ rather than the engine class, keeping the file loadable
    # outside Rails the way its generator contract requires.
    engine_root = File.expand_path('../..', __dir__)
    released_version = YAML.load_file(File.join(engine_root, 'db/data/framework_versions.yml'))['latest']
    theme_css += Pathname.glob(File.join(engine_root, 'public/css', released_version, 'themes', '*.css')).sort

    out_path = builds_dir.join('plugins.processed.css')
    rename_map_path = builds_dir.join('plugins.processed.rename-map.json')
    command = ['npm', 'run', '--silent', 'process_stylesheets', '--', source.to_s,
               '--output', out_path.to_s, '--rename-map-output', rename_map_path.to_s]
    theme_css.each { |path| command.push('--preserve-variables-from', path.to_s) }

    # From the repo root, where package.json and node_modules are.
    system(*command, chdir: File.expand_path('../..', __dir__), exception: true)

    renamed = JSON.parse(File.read(rename_map_path)).size
    puts "Generated #{out_path} (#{File.size(out_path)} bytes, from #{File.size(source)})"
    puts "Generated #{rename_map_path} (#{renamed} renamed variables)"
  end

  namespace :development do
    desc 'Serve the live local build on all docs pages instead of pinned releases'
    task enable: :environment do
      marker = Rails.root.join('tmp/framework-development.txt')
      FileUtils.mkdir_p(marker.dirname)
      FileUtils.touch(marker)
      puts 'Framework development mode ON. Docs pages, example iframes, and theme URLs now use the live /assets build.'

      # /framework-dev/* answers from the framework checkout's own build output, which is
      # gitignored. A gem installed from a `git:` source or a .gem carries neither builds
      # dir, so dev mode has nothing to serve until someone compiles inside the checkout.
      # Say so here rather than let the pages 404.
      unless Framework::Version.live_build_path('plugins.css')
        warn <<~MISSING
          No live CSS build found. Dev mode needs a compiled framework checkout:
            1. point the Gemfile at a local checkout (gem "trmnl-framework", path: "../trmnl-framework")
            2. run bin/setup (or bin/rails dartsass:build) inside that checkout
          Until then /framework-dev/plugins.css has no file behind it.
        MISSING
      end
    end

    desc 'Serve pinned released bundles on versioned docs pages (default)'
    task disable: :environment do
      FileUtils.rm_f(Rails.root.join('tmp/framework-development.txt'))
      puts 'Framework development mode OFF. Versioned docs pages serve their pinned releases.'
    end

    desc 'Show whether framework development mode is on'
    task status: :environment do
      on = Rails.root.join('tmp/framework-development.txt').exist?
      puts on ? 'Framework development mode: ON' : 'Framework development mode: OFF'
    end
  end

  # The opt-out beside the opt-in above. The framework repo's own docs server serves
  # its live build by default, which is wrong for exactly one job: checking that a
  # freshly cut release renders the way a visitor will see it.
  namespace :release_preview do
    desc 'Serve published releases on every docs page instead of the live build'
    task enable: :environment do
      marker = Rails.root.join(Framework::DocsServingMode::RELEASE_PREVIEW_MARKER)
      FileUtils.mkdir_p(marker.dirname)
      FileUtils.touch(marker)
      puts 'Framework release preview ON. Every docs version serves its published bundle, themes and harness CSS included.'
    end

    desc 'Serve the live build on the current docs version again (default)'
    task disable: :environment do
      FileUtils.rm_f(Rails.root.join(Framework::DocsServingMode::RELEASE_PREVIEW_MARKER))
      puts 'Framework release preview OFF. The current docs version serves the live build again.'
    end

    desc 'Show whether framework release preview is on'
    task status: :environment do
      on = Rails.root.join(Framework::DocsServingMode::RELEASE_PREVIEW_MARKER).exist?
      puts on ? 'Framework release preview: ON' : 'Framework release preview: OFF'
    end
  end

  namespace :release do
    # Fresh tokens + a fresh compile are the only build inputs a release needs here,
    # no full app precompile like core.
    task build: ['framework:colors', 'dartsass:build', 'framework:docs_chrome', 'framework:legacy_bundle']

    # A published version is frozen (RELEASE.md), and `build` writes before the release
    # task ever runs: framework:colors regenerates two tracked SCSS files. So the freeze
    # check is a prerequisite ahead of :build, not just a step inside ReleaseTask#call,
    # where the refusal would arrive with a modified working tree already behind it.
    # One guard task per bump, because the version it checks is the one being cut.
    %w[current major minor patch].each do |bump_type|
      task "verify_#{bump_type}" => :environment do
        Framework::ReleaseTask.new(bump_type).verify_unpublished
      end
    end

    desc 'Re-release the current version of the Framework (update assets only)'
    task current: [:environment, :verify_current, :build] do
      Framework::ReleaseTask.new('current').call
    end

    desc 'Release a new major version of the Framework (X.0.0)'
    task major: [:environment, :verify_major, :build] do
      Framework::ReleaseTask.new('major').call
    end

    desc 'Release a new minor version of the Framework (x.X.0)'
    task minor: [:environment, :verify_minor, :build] do
      Framework::ReleaseTask.new('minor').call
    end

    desc 'Release a new patch version of the Framework (x.x.X)'
    task patch: [:environment, :verify_patch, :build] do
      Framework::ReleaseTask.new('patch').call
    end

    desc 'Build TRMNL.zip and Classic.zip font bundles (overwrites previous output)'
    task fonts: :environment do
      Framework::FontsReleaseTask.new.call
    end
  end
end
