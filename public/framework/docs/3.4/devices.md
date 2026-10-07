# Devices

A device profile makes a screen render true to one panel: its exact dimensions, pixel density, and interface scale. Add one class, screen--{keyname}, and a screen renders with all of it. The profiles come from TRMNL's own device list, so each class matches a real panel.

### What a Device Profile Is

The framework turns each profile into a `screen--<keyname>` class. The class sets the profile as CSS variables on the [Screen](/framework/docs/3.4/screen) element, and everything inside reads them.

On the TRMNL platform you never write this class: the platform renders your layout against each device's own profile. Add it yourself only when you render the screen in your own stack.

| Variable | What it holds |
| --- | --- |
| `--screen-w`, `--screen-h` | The panel's dimensions in CSS pixels. Every view and layout size derives from them. |
| `--pixel-ratio` | Physical-to-CSS pixel ratio. The screen scales by it, so a 2x panel still lays out in CSS pixels. |
| `--dither-pixel-ratio` | The ratio dither patterns render at, so they stay crisp on high-DPI panels. |
| `--device-ui-scale` | The device's own interface scale. It multiplies with the Scale modifier to produce `--ui-scale`. |
| `--gap-scale` | Multiplier on every gap variable, for panels that need tighter or looser spacing than their size class gives. |
| `--device-name` | The profile keyname as a string. |
| `--color-depth` | The profile's depth rating, as metadata. |

`--color-depth` paints nothing. What a screen prints is decided by its mode class, so a profile rated 24 still renders in grayscale the moment it carries a grayscale class. See [Rendering Modes](/framework/docs/3.4/rendering_modes) .

[Tokens](/framework/docs/3.4/tokens) lists these variables with their defaults, next to every other framework token.

```
<!-- TRMNL X: 1040x780 CSS pixels at a 1.8 pixel ratio, 16 grays -->
<div class="screen screen--v2 screen--lg screen--density-2x screen--4bit">
  <div class="view view--full">
    <div class="layout">...</div>
  </div>
</div>
```

### Size and Density

Every profile names a size (`sm`, `md`, or `lg`) and a density tier (`1x` or `2x`). The device class includes both, so their variables come with it.

Keep the size and density classes on the screen anyway: the responsive prefixes and the runtime match those classes. `md:value--large` matches `screen--md`, never the device class that includes it. [Responsive](/framework/docs/3.4/responsive) covers the size grammar.

- `screen--sm`, `screen--md`, `screen--lg`: the breakpoint the device sits at, and the rich text width that goes with it.
- `screen--density-2x`: high-DPI typography, which switches the pixel fonts for Inter Variable. See [Font Family](/framework/docs/3.4/font_family) .
- Low density is the default and needs no class. `screen--density-1x` exists only as a marker; no CSS rule reads it.

Pick the size by the devices you want to hit rather than by a pixel count. A profile's own `--device-ui-scale` and `--gap-scale` handle the fine tuning inside a size.

### Palettes Select the Mode, Not the Geometry

A device lists every palette it can print. The palette chosen for a render decides the mode class; the dimensions stay the device's either way.

[Color Palettes](/framework/docs/3.4/color_palettes) lists the palettes and their classes.

```
<!-- The gray-16 palette: shades paint as solids -->
<div class="screen screen--amazon_kindle_2024 screen--sm screen--density-2x screen--4bit">...</div>

<!-- The bw palette, same device: shades paint as dither patterns -->
<div class="screen screen--amazon_kindle_2024 screen--sm screen--density-2x screen--1bit">...</div>
```

### Rating a Panel

Rate a panel by what the glass can show, not by the format the image arrives in. These are the four hardware classes and the depth each one takes.

| Hardware class | Depth | Palettes it can carry |
| --- | --- | --- |
| Grayscale e-paper | 1, 2, or 4 | By gray levels: 2 levels rate 1, 4 levels rate 2, 16 levels rate 4. Each panel carries the grayscale palettes up to its own level. |
| Limited-color e-paper | 1 | Its own ink set, every smaller ink set it can print, and `bw`. |
| Kaleido-class color e-paper | 12 | `color-12bit`, which renders through `screen--color-full`. |
| LCD, OLED, browser, virtual | 24 | Every palette, including `color-24bit`. These panels can render any mode the framework has. |

Grayscale ratings stop at 4: past 16 grays the next step is color, so a panel rates 12 or 24 instead of a deeper gray.

A smooth 8-bit image on the wire is a delivery format, not a rating. The panel behind it still prints 16 grays, so the screen still renders on `screen--4bit`.

A full-color rating does not lock a device into color. Rate the profile for the glass, then render it with whichever mode class the palette selects.

### The Shipped Device Classes

Every profile in the registry ships a class. Devices with identical dimensions share one: nine of them resolve to `screen--og` or `screen--ogv2`.

| Class | Devices | Size | Depth |
| --- | --- | --- | --- |
| `screen--amazon_kindle_2024` | Amazon Kindle 2024 | sm | 4-bit |
| `screen--amazon_kindle_7` | Amazon Kindle 7 | md | 4-bit |
| `screen--amazon_kindle_oasis_2` | Amazon Kindle Oasis 2 | md | 4-bit |
| `screen--amazon_kindle_paperwhite_6th_gen` | Amazon Kindle PW 6th Gen | md | 4-bit |
| `screen--amazon_kindle_paperwhite_7th_gen` | Amazon Kindle PW 7th Gen | md | 4-bit |
| `screen--amazon_kindle_paperwhite_signature_11th_gen` | Amazon Kindle PW Signature 11th Gen | md | 4-bit |
| `screen--amazon_kindle_scribe` | Amazon Kindle Scribe | lg | 4-bit |
| `screen--amazon_kindle_voyage` | Amazon Kindle Voyage | lg | 4-bit |
| `screen--avalue_epd_42s` | Avalue EPD-42S 42" Display Board | lg | 4-bit |
| `screen--ed133ut2` | ED133UT2 Active Matrix | lg | 4-bit |
| `screen--generic_16_9` | Generic 16:9 Display | md | 4-bit |
| `screen--inkplate_10` | Inkplate 10 | md | 4-bit |
| `screen--inkplate_13_spectra` | Inkplate 13 Spectra | md | 1-bit |
| `screen--inkplate_5_2` | Inkplate 5.2 | lg | 4-bit |
| `screen--inkplate_6_color` | Inkplate 6COLOR | md | 1-bit |
| `screen--inkplate_6_plus` | Inkplate 6 Plus | lg | 4-bit |
| `screen--inky_impression_13_3` | Inky Impression 13.3 | md | 1-bit |
| `screen--inky_impression_7_3` | Inky Impression 7.3 | md | 1-bit |
| `screen--kobo_aura_h2o_2` | Kobo Aura H2O Edition 2 | lg | 4-bit |
| `screen--kobo_aura_hd` | Kobo Aura HD | md | 4-bit |
| `screen--kobo_aura_one` | Kobo Aura One | lg | 4-bit |
| `screen--kobo_forma` | Kobo Forma | lg | 4-bit |
| `screen--kobo_glo` | Kobo Glo | md | 4-bit |
| `screen--kobo_libra_2` | Kobo Libra 2 | md | 4-bit |
| `screen--kobo_sage` | Kobo Sage | lg | 4-bit |
| `screen--kobo_touch` | Kobo Touch | md | 4-bit |
| `screen--m5_paper_s3` | M5PaperS3 | md | 4-bit |
| `screen--nook_simple_touch` | Nook Simple Touch | md | 4-bit |
| `screen--og` | TRMNL OG (B/W/R/Y), Waveshare 7.5" B/W, Waveshare 7.5" B/W/R, Waveshare 7.5" B/W/R/Y | md | 1-bit |
| `screen--ogv2` | Seeed E1001 Monochrome, Seeed E1002, TRMNL OG (2-bit), Waveshare 4.26" (2-bit), Xteink X4 | md | 2-bit |
| `screen--onyx_boox_go_7` | Onyx BOOX Go 7 | lg | 4-bit |
| `screen--onyx_boox_poke_5` | Onyx BOOX Poke 5 | md | 4-bit |
| `screen--palma` | Onyx BOOX Palma | md | 4-bit |
| `screen--remarkable_paper_2` | reMarkable 2 | lg | 4-bit |
| `screen--seeed_e1003` | Seeed E1003 (4-bit) | lg | 4-bit |
| `screen--seeed_e1004` | Seeed E1004 | lg | 1-bit |
| `screen--v2` | TRMNL X | lg | 4-bit |
| `screen--waveshare_5_8_bw` | Waveshare 5.83" (Steam Machine) | md | 2-bit |

### Where Profiles Come From

The framework ships the platform's device list as generated SCSS. A released build carries a class for every device the platform knows; the framework never invents one.

Bring your own panel in one of two ways. Apply `screen--byod_custom`, the generic profile every build ships, or compile the framework with your exact values in `$custom-devices`.

[Custom Devices](/framework/docs/3.4/sass_devices) has the profile schema, the compile-time validation, and what a configured profile generates.

### Related APIs

#### Custom device profiles

Each entry in the device map compiles into a `screen--{name}` class with its dimensions, density, and color depth baked in. Configure `$custom-devices` to produce the same classes for your own panels without touching framework source. See [Custom Devices](/framework/docs/3.4/sass_devices) for the profile schema.

 Previous  [ 

## Screen

Device screen dimensions, orientation, and display properties

 ](/framework/docs/3.4/screen)

 Next  [ 

## Rendering Modes

The grayscale tiers and color modes a screen can carry, what each one paints, and the bit depth JavaScript can read

 ](/framework/docs/3.4/rendering_modes)

