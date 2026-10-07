# Text Alignment

Utility classes for horizontal text alignment. Left, center, right, and justify, with responsive variants for breakpoints, orientation, and bit-depth.

### Usage

Control text alignment using the alignment utility classes. Options include left, center, right, and justify alignment. See the [Responsive Features](#responsive-text-alignment) section for breakpoint, orientation, and bit-depth variants.

| Class | Description |
| --- | --- |
| `text--left` | Aligns text to the left (default for most elements) |
| `text--center` | Centers text horizontally |
| `text--right` | Aligns text to the right |
| `text--justify` | Justifies text, creating even edges on both sides |

This text is left-aligned. This is the default alignment for most text content.

This text is center-aligned. Useful for headings and important content.

This text is right-aligned. Often used for numerical data or RTL languages.

This text is justified. Creates even text edges on both sides but affects readability. Useful for multi-column text layouts.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TextAlignment

```
<p class="text--left">Left-aligned text</p>
<p class="text--center">Center-aligned text</p>
<p class="text--right">Right-aligned text</p>
<p class="text--justify">Justified text</p>
```

### Responsive Features

Alignment classes support all three responsive systems: size-based breakpoints, orientation-based, and bit-depth variants.

#### Breakpoint Prefixes

Use breakpoint prefixes like `sm:`, `md:`, `lg:` to apply different alignment per device size class.

Responsive alignment

Left by default, center on md+, right on lg+

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Text AlignmentResponsive

```
<!-- Left by default, center on md+, right on lg+ -->
<p class="description text--left md:text--center lg:text--right">Responsive alignment</p>

<!-- Progressive alignment scaling -->
<p class="description text--left sm:text--center md:text--right lg:text--justify">Progressive alignment</p>
```

#### Orientation and Size+Orientation

Text alignment can adapt to orientation with `portrait:` and `landscape:`, and can be combined with size breakpoints (e.g., `md:portrait:`).

Orientation variant

Left by default, center in portrait

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Text AlignmentOrientation

```
<!-- Left by default, center in portrait -->
<p class="description text--left portrait:text--center">Orientation variant</p>

<!-- Combined size and orientation -->
<p class="description text--left md:portrait:text--right">Left by default, right on md+ portrait</p>
```

#### Bit-Depth Responsive

Alignment classes support bit-depth prefixes like `1bit:`, `2bit:`, and `4bit:` to apply different alignment on different display color capabilities.

Bit-depth alignment

Center by default, right on 2-bit screens

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Text AlignmentBit-Depth Responsive

```
<!-- Center by default, right on 2-bit screens -->
<p class="description text--center 2bit:text--right">Bit-depth alignment</p>

<!-- Combined: size + bit-depth -->
<p class="description text--left lg:4bit:text--center">Left by default, center on lg+ 4-bit screens</p>
```

#### Combined Responsive Features

Combine size, orientation, and bit-depth modifiers for alignment. Use the pattern `size:orientation:bit-depth:utility` for highly targeted styling.

```
<!-- Size + orientation + bit-depth -->
<p class="description md:portrait:2bit:text--right">Right on md+ portrait 2-bit screens</p>

<!-- Multiple responsive conditions -->
<p class="description text--left sm:text--center lg:4bit:text--right">Progressive with bit-depth override</p>
```

 Previous  [ 

## Text Scale

Scale all framework typography independently of interface geometry

 ](/framework/docs/3.4/text_scale)

 Next  [ 

## Text Color

Apply grayscale and chromatic color shades to text elements

 ](/framework/docs/3.4/text_color)

