# Image Stroke

Outline a vector or transparent raster image so it stays legible on a shaded background. Set the stroke width and color with the image stroke utilities.

### Usage

Preset size modifiers set the stroke width on an image. The default stroke is 1.5px white, with additional options for base (1.5px, equivalent to default), small (1px), medium (2px), large (2.5px), and extra large (3px). The `image-stroke--base` modifier explicitly sets the default stroke width and is useful for responsive layouts.

Image Stroke is the right tool for photos and multi-color logos that cannot be recolored. It also composes with `image--adaptive`, outlining the recolored shape (see [Image](/framework/docs/3.4/image) ).

 ![](/assets/trmnl--glyph-black-4ca602fd.svg)No Stroke

 ![](/assets/trmnl--glyph-black-4ca602fd.svg)Small

 ![](/assets/trmnl--glyph-black-4ca602fd.svg)Base

 ![](/assets/trmnl--glyph-black-4ca602fd.svg)Default

 ![](/assets/trmnl--glyph-black-4ca602fd.svg)Medium

 ![](/assets/trmnl--glyph-black-4ca602fd.svg)Large

 ![](/assets/trmnl--glyph-black-4ca602fd.svg)Extra Large

 ![](/images/plugins/trmnl--render.svg)Image StrokePreset Sizes

```
<img src="path to image">
<img class="image-stroke image-stroke--small" src="path to image">
<img class="image-stroke image-stroke--base" src="path to image">
<img class="image-stroke" src="path to image">
<img class="image-stroke image-stroke--medium" src="path to image">
<img class="image-stroke image-stroke--large" src="path to image">
<img class="image-stroke image-stroke--xlarge" src="path to image">
```

### Stroke Colors

Use the `image-stroke--{shade}` modifier to change the stroke color, black for images on dark backgrounds. The shades are the same palette tokens the background scale uses:

- `image-stroke--black` and `image-stroke--white`.
- `image-stroke--gray-10` through `image-stroke--gray-75`, in steps of five, plus the legacy `gray-1` to `gray-7` aliases.
- Ten hues (red, orange, yellow, lime, green, cyan, blue, violet, purple, pink) as a bare name such as `image-stroke--red` and on the same 10 to 75 steps, so `image-stroke--red-40` works on a color panel.

For the shade scale and how it adapts across bit depths, see [Background](/framework/docs/3.4/background) .

A shade modifier and a width modifier combine: `image-stroke image-stroke--black image-stroke--small` is a 1px black ring. Both take the bit-depth prefixes, so `2bit:image-stroke--gray-30` restyles the ring on 2-bit screens only.

A shade class also draws on its own: a lone `image-stroke--black` is the default 1.5px ring in black. [Text Stroke](/framework/docs/3.4/text_stroke) differs here, where a shade class only colors a stroke that `text-stroke` or a width modifier applies.

 ![](/assets/trmnl--glyph-white-9348e89a.svg)No Stroke

 ![](/assets/trmnl--glyph-white-9348e89a.svg)Small

 ![](/assets/trmnl--glyph-white-9348e89a.svg)Base

 ![](/assets/trmnl--glyph-white-9348e89a.svg)Default

 ![](/assets/trmnl--glyph-white-9348e89a.svg)Medium

 ![](/assets/trmnl--glyph-white-9348e89a.svg)Large

 ![](/assets/trmnl--glyph-white-9348e89a.svg)Extra Large

 ![](/images/plugins/trmnl--render.svg)Image StrokeColor Variants

```
<img src="path to light image">
<img class="image-stroke image-stroke--black image-stroke--small" src="path to light image">
<img class="image-stroke image-stroke--black image-stroke--base" src="path to light image">
<img class="image-stroke image-stroke--black" src="path to light image">
<img class="image-stroke image-stroke--black image-stroke--medium" src="path to light image">
<img class="image-stroke image-stroke--black image-stroke--large" src="path to light image">
<img class="image-stroke image-stroke--black image-stroke--xlarge" src="path to light image">
```

 Previous  [ 

## Image

Place images with size, object fit, dithering, inversion, and adaptive icon utilities

 ](/framework/docs/3.4/image)

 Next  [ 

## Scale

Scale interface to affect content density and readability

 ](/framework/docs/3.4/scale)

