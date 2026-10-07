# Rich Text

The Rich Text component provides a flexible container for displaying text content with consistent styling and layout options. It's commonly used for paragraphs, articles, and other formatted text content that needs to maintain readability and visual hierarchy.

### Understanding Richtext Components

The richtext system consists of two key parts working together: the parent `.richtext` container and its natural child `.content` component.

The parent `.richtext` container is designed for flexibility and can hold any content. It controls the overall placement and spacing of the component within your layout.

The `.content` component is where your actual text content lives. It provides additional styling and formatting options specific to text.

Both components have separate alignment modifiers that serve different purposes:

- `richtext--left/center/right`: Controls how the richtext container is positioned within its parent
- `content--left/center/right`: Controls how the content component is positioned within the richtext container
- `text--left/center/right`: Controls the actual text alignment within the content component

This multi-level alignment system provides maximum flexibility for positioning both the component and its content independently.

### Rich Text Alignment

The Rich Text component can be aligned in three different ways: left, center, or right. Each alignment option provides different text positioning to suit various design needs.

#### Left Aligned

Left alignment is the default and most readable format for longer text content, ideal for paragraphs and articles.

 ![](/assets/trmnl--glyph-black-large-f3c4ad75.svg)

This is an example of left-aligned rich text content. This alignment is generally best for readability with longer paragraphs of text.

Multiple paragraphs will maintain the same alignment, making it easy to read through longer content while maintaining visual consistency.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Rich TextLeft Aligned

```
<div class="richtext richtext--left gap--large">
  <img class="image" src="/assets/trmnl--glyph-black-large.svg">
  <div class="content content--left gap text--left">
    <p>This is an example of left-aligned rich text content.</p>
    <p>Multiple paragraphs will maintain the same alignment.</p>
  </div>
</div>
```

#### Center Aligned

Center alignment is ideal for headings, quotes, or shorter text that needs to be highlighted or visually balanced within the layout.

 ![](/assets/trmnl--glyph-black-large-f3c4ad75.svg)

This is an example of center-aligned rich text content.

Centered text works well for quotes, headings, or highlighted information that needs visual emphasis.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Rich TextCenter Aligned

```
<div class="richtext richtext--center gap--large">
  <img class="image" src="/assets/trmnl--glyph-black-large.svg">
  <div class="content content--center gap text--center">
    <p>This is an example of center-aligned rich text content.</p>
    <p>Centered text works well for quotes or highlighted information.</p>
  </div>
</div>
```

#### Right Aligned

Right alignment is less common but can be useful for specific design scenarios or to create visual tension in layouts.

 ![](/assets/trmnl--glyph-black-large-f3c4ad75.svg)

This is an example of right-aligned rich text content.

Right alignment can be used for captions, sidebars, or to create visual interest through contrasting alignments.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Rich TextRight Aligned

```
<div class="richtext richtext--right gap--large">
  <img class="image" src="/assets/trmnl--glyph-black-large.svg">
  <div class="content content--right gap text--right">
    <p>This is an example of right-aligned rich text content.</p>
    <p>Right alignment can be used for captions or sidebars.</p>
  </div>
</div>
```

### Content Size Variants

The Rich Text component offers different content size variants to accommodate various text hierarchies and emphasis needs.

This is large size rich text content.  
 It uses BlockKie font at 26px for emphasis.

This is the default size for rich text content.  
 It uses NicoClean font at 16px with a line height of 22px.

This is small size rich text content.  
 It uses NicoPups font at 16px with a tighter line height of 16px.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Rich TextSize Variants

```
<div class="richtext gap--large">
  <!-- Large Size -->
  <div class="content content--large">
    <p>This is large size rich text content.<br>
    It uses BlockKie font at 26px for emphasis.</p>
  </div>

  <!-- Default Size -->
  <div class="content">
    <p>This is the default size for rich text content.<br>
    It uses NicoClean font at 16px with line height of 22px.</p>
  </div>

  <!-- Small Size -->
  <div class="content content--small">
    <p>This is small size rich text content.<br>
    It uses NicoPups font at 16px with line height of 16px.</p>
  </div>
</div>
```

### Controlling Width

By default, the Rich Text content takes up as much space as it needs and is centered in the layout, expanding up to a maximum width. However, you can precisely control the width of content using Size utility classes.

Control exact width and height dimensions with size utilities

[View Size Documentation](/framework/docs/1.2/size)

This Rich Text content has a fixed width of 240 pixels using utility classes.

Notice how the text is constrained to this specific width regardless of the container size.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Rich TextFixed Width: 240px

```
<div class="richtext richtext--center gap--large">
  <div class="content w--[240px] text--center gap">
    <p>This Rich Text content has a fixed width of 240 pixels using utility classes.</p>
    <p>Notice how the text is constrained to this specific width regardless of the container size.</p>
  </div>
</div>
```

You can use any of the Size system's fixed sizes (`w--32`, `w--64`, etc.), arbitrary sizes (`w--[250px]`), or responsive sizes (`w--full`, `w--auto`). This flexibility lets you create perfectly sized text blocks for any layout need.

### Integration with Content Limiter

The Rich Text component works seamlessly with the Content Limiter utility to handle overflowing text. When combined, it automatically adjusts text size to fit the available space, which is particularly useful in constrained layouts.

Simply add the `data-content-limiter="true"` attribute to your richtext content element. You can also specify a custom maximum height using the `data-content-max-height` attribute (e.g., `data-content-max-height="140"`).

When `data-content-limiter="true"` is present, the limiter auto-measures the available height in the nearest container and adjusts text to fit. You can override the auto height by specifying `data-content-max-height` with a pixel value.

The Rich Text component with Content Limiter will automatically adjust text size when content exceeds the auto-measured available height. This is particularly useful for views with limited vertical space such as quadrants or half-horizontal layouts.   
  
 Notice how this text is rendered smaller to fit within the quadrant view. Without Content Limiter, this text would overflow the container.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Rich TextWith Content Limiter

```
<div class="richtext richtext--left gap--large">
  <div class="content" data-content-limiter="true">
    <p class="text--left">
      The Rich Text component with Content Limiter will automatically
      adjust text size when content exceeds the height threshold.
      This is particularly useful for views with limited vertical space.
    </p>
  </div>
</div>
```

### Integration with Pixel Perfect

For optimal text rendering on ePaper displays, the Rich Text component can be enhanced with the Pixel Perfect utility. This ensures text is rendered with crisp edges by aligning precisely to the pixel grid, preventing blurry or inconsistent text weight.

Simply add the `data-pixel-perfect="true"` attribute to your richtext content element.

Ensure crisp text rendering on 1-bit displays

[View Pixel Perfect Documentation](/framework/docs/1.2/pixel_perfect)

This text is rendered with pixel perfect alignment, ensuring that each character aligns precisely with the pixel grid. Notice how the text appears crisp and clear with consistent weight.

Pixel Perfect is especially important for ePaper displays that use a 1-bit color space (just black and white), where anti-aliased gray pixels are forced to become either fully black or fully white.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Rich TextWith Pixel Perfect

```
<div class="richtext richtext--left gap">
  <div class="content" data-pixel-perfect="true">
    <p>
      This text is rendered with pixel perfect alignment, ensuring that each character aligns precisely with the pixel grid. Notice how the text appears crisp and clear with consistent weight.
    </p>
  </div>
  <div class="content" data-pixel-perfect="true">
    <p>
      Pixel Perfect is especially important for ePaper displays that use a 1-bit color space (just black and white), where anti-aliased gray pixels are forced to become either fully black or fully white.
    </p>
  </div>
</div>
```

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
| `--richtext-content-max-width` | calc(640px \* var(--ui-scale)) | - | - | - |
| `--richtext-font-family` | "NicoClean" | "NicoClean" | #{meta.inspect($family)} | - |
| `--richtext-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | - |
| `--richtext-font-smoothing` | none | none | auto | - |
| `--richtext-font-weight` | 400 | 400 | clamp(100, calc(500 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--richtext-line-height` | calc(22px \* var(--text-ui-scale)) | calc(22px \* var(--text-ui-scale)) | calc(22px \* var(--text-ui-scale)) | - |
| Small |
| `--richtext-small-font-family` | "NicoPups" | "NicoPups" | #{meta.inspect($family)} | - |
| `--richtext-small-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(13px \* var(--text-ui-scale)) | - |
| `--richtext-small-font-smoothing` | none | none | auto | - |
| `--richtext-small-font-weight` | 400 | 400 | clamp(100, calc(500 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--richtext-small-line-height` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(18px \* var(--text-ui-scale)) | - |
| Large |
| `--richtext-large-font-family` | "BlockKie" | "BlockKie" | #{meta.inspect($family)} | - |
| `--richtext-large-font-size` | calc(26px \* var(--text-ui-scale)) | calc(26px \* var(--text-ui-scale)) | calc(21px \* var(--text-ui-scale)) | - |
| `--richtext-large-font-smoothing` | none | none | auto | - |
| `--richtext-large-font-weight` | 400 | 400 | clamp(100, calc(500 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--richtext-large-line-height` | 1 | 1 | 1.2 | - |
| Xlarge |
| `--richtext-xlarge-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--richtext-xlarge-font-size` | calc(30px \* var(--text-ui-scale)) | - | calc(30px \* var(--text-ui-scale)) | - |
| `--richtext-xlarge-font-smoothing` | auto | - | auto | - |
| `--richtext-xlarge-font-weight` | 425 | - | clamp(100, calc(425 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--richtext-xlarge-line-height` | 1.2 | - | 1.2 | - |
| Xxlarge |
| `--richtext-xxlarge-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--richtext-xxlarge-font-size` | calc(35px \* var(--text-ui-scale)) | - | calc(35px \* var(--text-ui-scale)) | - |
| `--richtext-xxlarge-font-smoothing` | auto | - | auto | - |
| `--richtext-xxlarge-font-weight` | 400 | - | clamp(100, calc(400 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--richtext-xxlarge-line-height` | 1.2 | - | 1.2 | - |
| Xxxlarge |
| `--richtext-xxxlarge-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--richtext-xxxlarge-font-size` | calc(40px \* var(--text-ui-scale)) | - | calc(40px \* var(--text-ui-scale)) | - |
| `--richtext-xxxlarge-font-smoothing` | auto | - | auto | - |
| `--richtext-xxxlarge-font-weight` | 375 | - | clamp(100, calc(375 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--richtext-xxxlarge-line-height` | 1.2 | - | 1.2 | - |

 Previous  [ 

## Image Stroke

Legible images when displayed on shaded backgrounds

 ](/framework/docs/1.2/image_stroke)

 Next  [ 

## Item

Build standardized list items and content blocks

 ](/framework/docs/1.2/item)

