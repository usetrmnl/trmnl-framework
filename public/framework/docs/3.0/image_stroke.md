# Image Stroke

Outline a vector or transparent raster image so it stays legible on a shaded background. Set the stroke width and color with the image stroke utilities.

### Usage

The Image Stroke system includes preset size modifiers that allow you to quickly apply different stroke widths to your images. The default stroke is 1.5px white, with additional options for base (1.5px, equivalent to default), small (1px), medium (2px), large (2.5px), and extra large (3px). The `image-stroke--base` modifier explicitly sets the default stroke width and is useful for responsive layouts.

 ![](/assets/trmnl--glyph-black-4ca602fd.svg)No Stroke

 ![](/assets/trmnl--glyph-black-4ca602fd.svg)Small

 ![](/assets/trmnl--glyph-black-4ca602fd.svg)Base

 ![](/assets/trmnl--glyph-black-4ca602fd.svg)Default

 ![](/assets/trmnl--glyph-black-4ca602fd.svg)Medium

 ![](/assets/trmnl--glyph-black-4ca602fd.svg)Large

 ![](/assets/trmnl--glyph-black-4ca602fd.svg)Extra Large

 ![](/images/plugins/trmnl--render.svg)Image StrokePreset Sizes

```
<img src="/images/trmnl--glyph-black.svg">
<img class="image-stroke image-stroke--small" src="/images/trmnl--glyph-black.svg">
<img class="image-stroke image-stroke--base" src="/images/trmnl--glyph-black.svg">
<img class="image-stroke" src="/images/trmnl--glyph-black.svg">
<img class="image-stroke image-stroke--medium" src="/images/trmnl--glyph-black.svg">
<img class="image-stroke image-stroke--large" src="/images/trmnl--glyph-black.svg">
<img class="image-stroke image-stroke--xlarge" src="/images/trmnl--glyph-black.svg">
```

### Stroke Colors

Use the black modifier for images on dark backgrounds.

 ![](/assets/trmnl--glyph-white-9348e89a.svg)No Stroke

 ![](/assets/trmnl--glyph-white-9348e89a.svg)Small

 ![](/assets/trmnl--glyph-white-9348e89a.svg)Base

 ![](/assets/trmnl--glyph-white-9348e89a.svg)Default

 ![](/assets/trmnl--glyph-white-9348e89a.svg)Medium

 ![](/assets/trmnl--glyph-white-9348e89a.svg)Large

 ![](/assets/trmnl--glyph-white-9348e89a.svg)Extra Large

 ![](/images/plugins/trmnl--render.svg)Image StrokeColor Variants

```
<img src="/images/trmnl--glyph-white.svg">
<img class="image-stroke image-stroke--black image-stroke--small" src="/images/trmnl--glyph-white.svg">
<img class="image-stroke image-stroke--black image-stroke--base" src="/images/trmnl--glyph-white.svg">
<img class="image-stroke image-stroke--black" src="/images/trmnl--glyph-white.svg">
<img class="image-stroke image-stroke--black image-stroke--medium" src="/images/trmnl--glyph-white.svg">
<img class="image-stroke image-stroke--black image-stroke--large" src="/images/trmnl--glyph-white.svg">
<img class="image-stroke image-stroke--black image-stroke--xlarge" src="/images/trmnl--glyph-white.svg">
```

 Previous  [ 

## Image

Place images with size, object fit, dithering, inversion, and adaptive icon utilities

 ](/framework/docs/3.0/image)

 Next  [ 

## Scale

Scale interface to affect content density and readability

 ](/framework/docs/3.0/scale)

