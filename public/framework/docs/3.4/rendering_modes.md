# Rendering Modes

A rendering mode is the class that tells a screen what its panel can print. Grayscale panels pick one of three bit-depth classes; color panels pick the class for their palette. Everything else follows that one class, from the dither patterns to the colors JavaScript reads.

### The Three Grayscale Tiers

A grayscale screen carries one tier class. It names how many grays the panel prints, and it decides both how colors paint and a handful of display details.

- `screen--1bit`: every gray token paints as a dither pattern of black and white pixels, borders and text included. This is the baseline the other tiers adjust from.
- `screen--2bit`: tokens still dither, now between four gray tones instead of two. Table and progress sizing follows the interface scale.
- `screen--4bit`: every gray token paints as a solid, and each border step gets its own shade instead of two steps sharing one. The title bar drops the padding adjustment it carries for pixel fonts, and its text stroke thins.

On all three tiers, color tokens fall back to their gray equivalents, so a hue never reaches a panel that cannot print it.

The demo below labels the tier it is rendering on. Switch devices in the Device Preview to see the same screen on each one.

Cold chain1-bit2-bit4-bit

Bay 182%

Bay 264%

Bay 338%

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Rendering ModesGrayscale tiers

```
<!-- Two grays: the fills dither -->
<div class="screen screen--ogv2 screen--2bit">...</div>

<!-- Sixteen grays: the fills paint as solids -->
<div class="screen screen--v2 screen--4bit">...</div>
```

### The Color Modes

A color panel carries a palette class in place of a tier class. Two families cover them.

- One class per limited ink set (`screen--color-3bwr`, `screen--color-3bwy`, `screen--color-4bwry`, `screen--color-6a`, `screen--color-7a`): every framework color, grays included, dithers down to that palette's fixed inks. 
- `screen--color-full` for 12-bit and 24-bit displays: every color paints exactly as defined, with no dithering. 

[Color Palettes](/framework/docs/3.4/color_palettes) lists every palette and the class it maps to.

```
<!-- Seven inks: bg--red-60 dithers between the panel's inks -->
<div class="screen screen--inkplate_6_color screen--color-7a">...</div>

<!-- Full color: bg--red-60 paints that exact hex -->
<div class="screen screen--generic_16_9 screen--color-full">...</div>
```

### How the Runtime Learns the Depth

Each mode class also sets `--framework-bit-depth`, its paint depth as a number. The JavaScript runtime reads that variable and never parses class names, so a palette added in CSS needs no JavaScript change.

| Mode class | Published depth |
| --- | --- |
| No mode class | 1 |
| `screen--1bit` | 1 |
| `screen--2bit` | 2 |
| `screen--4bit` | 4 |
| Any limited palette class | 4 |
| `screen--color-full` | 12 |

The number describes how the screen paints, not the panel's raw capability. A limited palette prints solid inks the way 4-bit prints solid grays, so it reports 4. A screen with no mode class reports 1: an unstated device is treated as the most constrained one.

A screen with two mode classes reports the one that actually painted: `screen--2bit screen--color-7a` paints palette inks and reports 4.

The runtime acts on the number: pixel-perfect fonts switch off at 4 and up, and item indexes stop forcing an even pixel width at 2 and up. See [Framework Runtime](/framework/docs/3.4/framework_runtime) , or [Paint API](/framework/docs/3.4/paint_api) to read the variable from your own JavaScript.

### Where the Numeric Variants Stop

Utility classes take three numeric variant prefixes: `1bit:`, `2bit:`, and `4bit:`. They end at 4-bit because grayscale glass ends at 16 levels, so those three cover every grayscale panel.

No numeric prefix matches a color screen. Target the color modes from SCSS instead, with the `for-color-palette($id)` and `for-color-full` mixins on [Sass Mixins](/framework/docs/3.4/sass_mixins) .

```
<!-- A dense dither needs a lighter shade to stay readable -->
<div class="layout bg--gray-65 2bit:bg--gray-75 4bit:bg--gray-70">...</div>
```

**Do not build on `screen--8bit` or `screen--16bit`.** Both are compatibility aliases scheduled for removal. They render exactly like `screen--4bit`, except they report their own number as the depth instead of 4.

Nothing above 4-bit grayscale needs them: past 16 grays the next step is color, through `screen--color-full`.

[Responsive](/framework/docs/3.4/responsive) covers the full variant grammar, including how bit-depth prefixes combine with breakpoints and orientation.

### Chart Series per Mode

Chart series colors follow the mode too. On grayscale tiers and limited palettes, series start at the screen's ink and step toward the background.

`screen--color-full` uses a set of distinct colors instead: the ink first, then seven hues in a fixed order. A theme's own chart colors still win over both.

[Painting Charts](/framework/docs/3.4/paint_charts) reads these colors from JavaScript, and [Chart](/framework/docs/3.4/chart) covers the markup.

### Related APIs

#### Reading variables from JavaScript

`cssVar(name, { el })` reads any variable on this page back from the live cascade, theme and mode overrides included. The CSS stays the source of truth; nothing is duplicated in JavaScript. See [Paint API](/framework/docs/3.4/paint_api) for the full paint surface.

```
var gap = TRMNLPaint.cssVar("--gap", { el: "my-chart" });
```

 Previous  [ 

## Devices

Device profiles: the geometry, size, and density a screen--{keyname} class carries, and how to rate a panel of your own

 ](/framework/docs/3.4/devices)

 Next  [ 

## View

Show your plugin in different sizes with Mashup view containers

 ](/framework/docs/3.4/view)

