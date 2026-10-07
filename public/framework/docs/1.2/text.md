# Text

The Text system provides utility classes for controlling text alignment and grayscale shading. These classes help maintain consistent text formatting across your interface.

### Text Shading

Apply grayscale shades to text using the grayscale text utility classes. These use carefully designed dither patterns that create the illusion of different shades of gray when rendered on 1-bit (black and white only) displays.

Aa

black

Aa

gray-1

Aa

gray-2

Aa

gray-3

Aa

gray-4

Aa

gray-5

Aa

gray-6

Aa

gray-7

Aa

white

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TextShading

```
<p class="text--black">Black text</p>
<p class="text--gray-1">Gray-1 text</p>
<p class="text--gray-2">Gray-2 text</p>
<p class="text--gray-3">Gray-3 text</p>
<p class="text--gray-4">Gray-4 text</p>
<p class="text--gray-5">Gray-5 text</p>
<p class="text--gray-6">Gray-6 text</p>
<p class="text--gray-7">Gray-7 text</p>
<p class="text--white">White text</p>
```

### Text Alignment

Control text alignment using the alignment utility classes. Options include left, center, right, and justify alignment.

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

 Previous  [ 

## Mashup

Assemble multiple plugin views into a single interface

 ](/framework/docs/1.2/mashup)

 Next  [ 

## Title

Style headings with consistent typography

 ](/framework/docs/1.2/title)

