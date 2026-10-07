# Text Stroke

Outline text so it stays legible on a shaded background. Set the stroke width and color with the text stroke utilities.

### Basic Usage

Apply `text-stroke` to outline text. Combine with width and shade modifiers as needed.

| Class | Description |
| --- | --- |
| `text-stroke` | Stroke: outline (default 3.5px, default contrast ink) |
| `text-stroke--{size}` | Stroke width: `small`, `medium`, `large`, `xlarge` |
| `text-stroke--{shade}` | Stroke color: any palette token, from `black` and `white` to `gray-75` and `red-40`. See [Background](/framework/docs/3.4/background) for the shade scale. |

```
<span class="text-stroke">Outlined text</span>
```

### Widths

Preset size modifiers set the stroke width on text. The default stroke is 3.5px in the default contrast ink, with additional options for base (3.5px, equivalent to default), small (2px), medium (4.5px), large (6px), and extra large (7.5px). The `text-stroke--base` modifier explicitly sets the default stroke width and is useful for responsive layouts.

AaNo Stroke

AaSmall

AaBase

AaDefault

AaMedium

AaLarge

AaExtra Large

 ![](/images/plugins/trmnl--render.svg)Text StrokePreset Sizes

```
<span class="value value--large">Aa</span>
<span class="value value--large text-stroke text-stroke--small">Aa</span>
<span class="value value--large text-stroke text-stroke--base">Aa</span>
<span class="value value--large text-stroke">Aa</span>
<span class="value value--large text-stroke text-stroke--medium">Aa</span>
<span class="value value--large text-stroke text-stroke--large">Aa</span>
<span class="value value--large text-stroke text-stroke--xlarge">Aa</span>
```

### Shades

Leave the shade off to stroke with the default contrast ink, which resolves through the theme chain and flips with dark mode. Use the `text-stroke--{shade}` modifier to pin a color instead. The shades are the same palette tokens the background scale uses:

- `text-stroke--black` and `text-stroke--white`.
- `text-stroke--gray-10` through `text-stroke--gray-75`, in steps of five, plus the legacy `gray-1` to `gray-7` aliases.
- Ten hues (red, orange, yellow, lime, green, cyan, blue, violet, purple, pink) as a bare name such as `text-stroke--red` and on the same 10 to 75 steps, so `text-stroke--red-40` works on a color panel.

For the shade scale and how it adapts across bit depths, see [Background](/framework/docs/3.4/background) .

A shade modifier and a width modifier combine: `text-stroke text-stroke--black text-stroke--small` is a 2px black outline. Both take the bit-depth prefixes, so `2bit:text-stroke--gray-30` restyles the outline on 2-bit screens only.

A bare shade class draws nothing: it sets the color and leaves the drawing to `text-stroke` or a width modifier. [Image Stroke](/framework/docs/3.4/image_stroke) differs here, where a lone shade class draws the default ring.

AaNo Stroke

AaSmall

AaBase

AaDefault

AaMedium

AaLarge

AaExtra Large

 ![](/images/plugins/trmnl--render.svg)Text StrokeShades

```
<span class="value value--large text--white">Aa</span>
<span class="value value--large text--white text-stroke text-stroke--small text-stroke--black">Aa</span>
<span class="value value--large text--white text-stroke text-stroke--black">Aa</span>
<span class="value value--large text--white text-stroke text-stroke--medium text-stroke--black">Aa</span>
<span class="value value--large text--white text-stroke text-stroke--large text-stroke--black">Aa</span>
<span class="value value--large text--white text-stroke text-stroke--xlarge text-stroke--black">Aa</span>
```

### How It Renders

The stroke draws as concentric drop-shadow rings, not as native `-webkit-text-stroke`. The ring sits behind the glyph in every browser, so text of any shade takes a stroke.

That includes grayscale text, which the framework paints as a bitmap pattern revealed with `background-clip: text`. Native strokes overpaint a clipped fill; rings do not, so `text--gray-40 text-stroke` keeps both the pattern and the outline.

Before 3.2 the stroke was a native outline and worked only on pure black or white text. Screens pinned to 3.0 or 3.1 still render that way.

 Previous  [ 

## Text Color

Apply grayscale and chromatic color shades to text elements

 ](/framework/docs/3.4/text_color)

 Next  [ 

## Framework Runtime

The JavaScript pass that measures the screen and fits your content into it at render time

 ](/framework/docs/3.4/framework_runtime)

