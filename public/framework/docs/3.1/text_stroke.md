# Text Stroke

Outline text so it stays legible on a shaded background. Set the stroke width and color with the text stroke utilities.

**Note:** Text Stroke works only on pure black or white text.

[Learn More](#browser-limitations)

### Basic Usage

Apply `text-stroke` to outline text. Combine with width and shade modifiers as needed.

| Class | Description |
| --- | --- |
| `text-stroke` | Stroke: outline (default 3.5px white) |
| `text-stroke--{size}` | Stroke width: `small`, `medium`, `large`, `xlarge` |
| `text-stroke--{shade}` | Stroke color: `black`, `gray-10` … `gray-75`, `white`. See [Background](/framework/docs/3.1/background) for the shade scale. |

```
<span class="text-stroke">Outlined text</span>
```

### Widths

The Text Stroke system includes preset size modifiers that allow you to quickly apply different stroke widths to your text. The default stroke is 3.5px white, with additional options for base (3.5px, equivalent to default), small (2px), medium (4.5px), large (6px), and extra large (7.5px). The `text-stroke--base` modifier explicitly sets the default stroke width and is useful for responsive layouts.

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

Use the `text-stroke--{shade}` modifier to change the stroke color. Choose from sixteen values: black, gray-10 through gray-75, and white. For an overview of the shade scale and how it adapts across bit-depths, see [Background](/framework/docs/3.1/background) .

A shade modifier and a width modifier combine: `text-stroke text-stroke--black text-stroke--small` is a 2px black outline. Both take the bit-depth prefixes, so `2bit:text-stroke--gray-30` restyles the outline on 2-bit screens only.

A bare shade class draws nothing: it sets the color and leaves the drawing to `text-stroke` or a width modifier. [Image Stroke](/framework/docs/3.1/image_stroke) differs here, where a lone shade class draws the default ring.

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

### Browser Limitations

**Text Stroke works only when the text itself is pure black or pure white.** This is due to how browsers render strokes relative to text fills.

We simulate grayscale text by applying hand-crafted bitmap patterns as a background and revealing them with `background-clip: text` (with transparent text color). This makes text appear gray, but under the hood the fill is not a solid color. It is a background image clipped to the text.

The CSS `paint-order` property cannot treat a background as a pass-through fill layer, so only `paint-order: stroke fill;` is effective when the fill is a solid color. Because clipped backgrounds are not considered a fill for paint-order, we cannot stroke around grayscale (background-clipped) text. Use black or white text when you need a stroke.

 Previous  [ 

## Text Color

Apply grayscale and chromatic color shades to text elements

 ](/framework/docs/3.1/text_color)

 Next  [ 

## Overflow

Handle column items overflow

 ](/framework/docs/3.1/overflow)

