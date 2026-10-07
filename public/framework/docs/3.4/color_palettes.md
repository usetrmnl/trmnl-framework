# Color Palettes

A palette tells a screen which inks its panel can print. Grayscale panels pick from four grayscale palettes, and five limited color palettes dither every framework color down to the panel's fixed inks. On 12-bit and 24-bit panels, screen--color-full paints every color exactly as defined.

### Grayscale Palettes

Each of the four grayscale palettes maps onto a bit-depth class on the [Screen](/framework/docs/3.4/screen) element, so a grayscale screen carries `screen--1bit`, `screen--2bit`, or `screen--4bit` instead of a palette class.

- `bw` (2 levels) renders as `screen--1bit`. Every color renders as a black and white dither pattern.
- `gray-4` (4 grays) renders as `screen--2bit`.
- `gray-16` (16 grays) renders as `screen--4bit`, where the grays paint as solids.
- `gray-256` renders as `screen--4bit` too. It is a delivery format, not a fifth tier.

#### Two Ways to Deliver 16 Levels

`gray-16` and `gray-256` share a class because they share the glass: 16 panel levels either way. They differ in who reduces the image.

- `gray-16`: the platform posterizes and dithers to those 16 levels before it sends the screen.
- `gray-256`: the platform sends a smooth 8-bit PNG and the device quantizes it to its own 16 levels.

The registry name for `gray-256`, Smooth Grayscale (device-quantized), describes that delivery, not 256 displayable grays. Build against `screen--4bit`.

### Color Palette Classes

Every color panel the framework supports has a palette class on the [Screen](/framework/docs/3.4/screen) element. Five classes cover the limited-ink e-paper panels; `screen--color-full` covers displays that render arbitrary color.

A device can support more than one palette. Inky Impression 7.3 carries six: black and white, 7-color, 6-color, 4-ink B/W/R/Y, 3-ink B/W/R, and 3-ink B/W/Y. The selected mode picks the class.

| Class | Inks | Panels |
| --- | --- | --- |
| `screen--color-3bwr` | Black, white, red | Waveshare 7.5" B/W/R |
| `screen--color-3bwy` | Black, white, yellow | No native B/W/Y panel yet, but nine profiles offer it as a mode (Inky Impression 7.3 and 13.3, Seeed E1002 and E1004, and others) |
| `screen--color-4bwry` | Black, white, red, yellow | TRMNL OG (B/W/R/Y), Waveshare 7.5" B/W/R/Y |
| `screen--color-6a` | Black, white, red, green, blue, yellow | Inky Impression 7.3 and 13.3, Seeed E1002 and E1004 |
| `screen--color-7a` | Black, white, red, green, blue, yellow, orange | Inkplate 6COLOR, Inky Impression 7.3 |
| `screen--color-full` | Whatever the display can show | 12-bit and 24-bit displays: Onyx BOOX Nova Air C, Tidbyt |

### Full Color

Two palettes share `screen--color-full`.

- `color-24bit` (16.7 million colors) covers LCD, OLED, browser, and virtual screens. The render ships as lossless sRGB: no remap, no dithering, no posterize.
- `color-12bit` (4096 colors) covers Kaleido-class color e-paper. It shares the class, and the platform posterizes the render to those 4096 colors.

Both report `--framework-bit-depth: 12`, the lower of the two, so code reading the depth never over-promises what a Kaleido panel prints. Every color the framework paints is sRGB.

```
<div class="screen screen--generic_16_9 screen--color-full">
  <div class="view view--full">
    <!-- bg--red-60 is a solid red here, a dither on every limited palette -->
    <div class="layout bg--red-60">
      <span class="title">Delayed</span>
    </div>
  </div>
</div>
```

### Every Palette and Its Class

Every palette maps to one framework class. That class also reports its paint depth as `--framework-bit-depth`, which [Paint API](/framework/docs/3.4/paint_api) reads.

| Palette | Registry name | Framework class | Published depth |
| --- | --- | --- | --- |
| `bw` | Black & White (1-bit) | `screen--1bit` | 1 |
| `gray-4` | 4 Grays (2-bit) | `screen--2bit` | 2 |
| `gray-16` | 16 Grays (4-bit) | `screen--4bit` | 4 |
| `gray-256` | Smooth Grayscale (device-quantized) | `screen--4bit` | 4 |
| `color-3bwr` | Color (3 colors) | `screen--color-3bwr` | 4 |
| `color-3bwy` | Color (3 colors) | `screen--color-3bwy` | 4 |
| `color-4bwry` | Color (4 colors) | `screen--color-4bwry` | 4 |
| `color-6a` | Color (6 colors) | `screen--color-6a` | 4 |
| `color-7a` | Color (7 colors) | `screen--color-7a` | 4 |
| `color-12bit` | Color (4096 colors) | `screen--color-full` | 12 |
| `color-24bit` | Color (16777216 colors) | `screen--color-full` | 12 |

The depth describes how the screen paints, not the panel's raw capability. Limited palettes print solid inks the way 4-bit prints solid grays, so they report 4.

**The numeric variants stop at `4bit:`.** Grayscale glass stops at 16 levels, so `1bit:`, `2bit:`, and `4bit:` cover every grayscale palette. Color has its own classes and no numeric prefix; see [Rendering Modes](/framework/docs/3.4/rendering_modes) .

### How Colors Print per Palette

A limited palette prints solid inks and nothing in between, so the framework dithers every color in the [Colors](/framework/docs/3.4/colors) palette down to the panel's inks. Your markup does not change: the same `bg--` and `text--` utilities print differently per palette.

- **Grays dither in black and white.** On every limited palette, `bg--gray-50` is a 1-bit pattern rather than a solid gray.
- **Hues snap to the closest ink.** On `screen--color-3bwr` every hue prints red, so blue and green stop reading as separate categories. `screen--color-7a` carries its own orange ink.
- **Shade steps dither the ink.** `bg--red-20` mixes red with black and `bg--red-60` mixes red with white, which is how one ink covers a ladder of shades.
- **Full color skips dithering.** `screen--color-full` paints every token as a solid color.

**Device Preview tip:** Pick a color device in the Device Preview (top right) to see the palette applied to every demo on this site.

### Applying a Palette

The palette class sits on the screen, next to the device class; grayscale palettes put their bit-depth class in the same place. Who writes it depends on where the screen renders.

You don't write the palette class. The platform renders your layout against the device's own profile, so one plugin covers 1-bit panels and 7-color panels alike.

You add the palette class to the screen yourself, next to the device class, and the framework repaints every token for that ink set.

```
<!-- Your layout; the platform supplies the screen and its classes -->
<div class="layout">
  <span class="title">Northbound</span>
  <span class="label label--primary">On time</span>
</div>
```

```
<div class="screen screen--inky_impression_7_3 screen--color-7a">
  <div class="view view--full">
    <div class="layout">
      <span class="title">Northbound</span>
      <span class="label label--primary">On time</span>
    </div>
  </div>
</div>
```

### Preview Modes

Panel inks are darker and flatter than the same hex on a monitor. Two modifiers repaint a limited palette with device-accurate values so a preview on a screen matches the print.

- `screen--preview-colors`: swaps the full-bright inks for the muted ones the panel actually prints.
- `screen--preview-white-limited`: mutes white to the panel's off-white. Add it alongside `screen--preview-colors` for panels whose white is not paper white.

The Device Preview's Raw Colors and Preview Colors toggle sets both for you. Rendered output on a device uses neither.

```
<!-- Device-accurate preview of a 6-color panel -->
<div class="screen screen--color-6a screen--preview-colors screen--preview-white-limited">
  ...
</div>
```

### Targeting a Palette in SCSS

Scope your own SCSS to a palette with the same mixins the framework uses. The mixin ids drop the `color-` prefix the class carries: `'3bwr'`, `'3bwy'`, `'4bwry'`, `'6a'`, and `'7a'`.

- `for-color-palette($id)`: scopes to one limited palette.
- `for-color-full`: scopes to full-color displays.
- `for-preview-color-palette($id)`: scopes to the device-accurate preview of one limited palette.
- `for-1bit`, `for-2bit`, `for-4bit`: scope to a grayscale tier.

```
@use 'framework/mixins' as trmnl;

.legend-swatch {
    width: 12px;
    height: 12px;

    // Three-ink panels print every hue in the same accent, so carry the
    // distinction in shape instead of color.
    @include trmnl.for-color-palette('3bwr') {
        border-radius: 50%;
    }

    @include trmnl.for-color-full {
        border-radius: 0;
    }
}
```

The full mixin surface is documented on [Sass Mixins](/framework/docs/3.4/sass_mixins) , and [Custom Devices](/framework/docs/3.4/sass_devices) covers adding a device profile that selects a palette.

### Palettes from JavaScript

TRMNLPaint returns what CSS would paint on the current palette, so JavaScript needs no palette handling of its own. Ask on a 7-color screen and the answer carries that palette's dither; the same call on a full-color screen returns a solid. See [Paint API](/framework/docs/3.4/paint_api) .

 Previous  [ 

## Colors

Complete palette definition: grayscale, chromatic hues, and semantic roles

 ](/framework/docs/3.4/colors)

 Next  [ 

## Tokens

Complete CSS variable reference with root defaults, density, and bit-depth overrides

 ](/framework/docs/3.4/tokens)

