# Pixel Perfect

Pixel Perfect aligns text to the pixel grid so it renders with crisp edges. It uses pixel fonts designed for specific sizes, so text stays sharp instead of turning blurry or unevenly bold when a layout is converted to 1-bit for ePaper displays.

### Usage

To enable pixel perfect text rendering, add the `data-pixel-perfect="true"` attribute to your text element.

Pixel Perfect Title

This text is rendered with pixel perfect alignment, ensuring that each line falls exactly on the pixel grid. Depending on the parent width, the system automatically breaks text into lines and adjusts each line's width.

This produces crisp, sharp text edges that renders perfectly in a 1-bit color space.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Pixel PerfectWith Pixel Perfect Applied

```
<span class="title" data-pixel-perfect="true">Pixel Perfect Title</span>
<div class="content" data-pixel-perfect="true">
  <p>This text will be aligned to the pixel grid for crisp rendering.</p>
</div>
```

### Why?

Text rendering on digital displays involves complex anti-aliasing techniques to make text appear smooth at various sizes. This process creates partially opaque pixels (gray pixels) at the edges of characters to create the illusion of smoothness.

When text isn't perfectly aligned to the pixel grid, these anti-aliased pixels can appear inconsistently, particularly with centered text. This is especially problematic for ePaper displays that use a 1-bit color space (just black and white, no grays), where anti-aliased gray pixels are forced to become either fully black or fully white. The result is text that appears randomly bold or distorted in final renders, creating an unprofessional and difficult-to-read presentation.

Our system uses pixel fonts that are specifically designed to work at particular pixel sizes and their multipliers. These fonts are meticulously crafted to perfectly align with the pixel grid, ensuring each character renders with maximum sharpness and clarity. By combining these specialized fonts with our pixel-perfect alignment technique, we achieve optimal text rendering for ePaper displays.

### How It Works

The Pixel Perfect system works by applying the following techniques to elements with `data-pixel-perfect="true"`:

- The system measures the parent element's width to determine whether it's odd or even
- The text content is broken into individual lines
- Each line is wrapped in a span element
- Each span's width is adjusted to match the parent's pattern: even widths for even-width parents, odd widths for odd-width parents

By analyzing the parent container's dimensions and adjusting each line accordingly, the system ensures text falls precisely on the pixel grid. This precise adjustment ensures text is perfectly aligned to the pixel grid, eliminating sub-pixel rendering issues on 1-bit displays.

### Cross-Platform Consistency

Different browsers render text differently across operating systems. For example, Chrome on macOS handles font rendering differently than Chrome on Linux or Windows. This means developers see different results depending on their development environment.

The Pixel Perfect system unifies the developer experience across platforms by enforcing consistent rendering rules regardless of the browser or operating system. This ensures that text renders with the same crispness and weight consistency on the final ePaper display, regardless of where it was developed or previewed.

 Previous  [ 

## Content Limiter

Change font size when content overflows to fit within the container

 ](/framework/docs/3.4/content_limiter)

 Next  [ 

## Paint API

TRMNLPaint: read the exact colors and patterns CSS paints right now, from JavaScript

 ](/framework/docs/3.4/paint_api)

