# Rich Text

A container for long-form text: paragraphs, headings, lists, and quotes. The framework styles the children of the content block, so text from a feed renders in the framework font without a class on every tag.

### Understanding Richtext Components

The richtext system consists of two key parts working together: the parent `.richtext` container and its natural child `.content`[Content Limiter](/framework/docs/3.4/content_limiter) component.

The parent `.richtext` container is designed for flexibility and can hold any content. It controls the overall placement and spacing of the component within your layout.

The `.content` component is where your actual text content lives. It carries the type styles and the alignment modifiers specific to text.

Rich Text is the one component that takes plain HTML children. A `.content` block styles its children directly, so paragraphs, headings, and lists coming from a feed render in the framework font without a class on every tag. Everywhere else on a screen, use the framework elements ( [Title](/framework/docs/3.4/title) , [Description](/framework/docs/3.4/description) , [Label](/framework/docs/3.4/label) , [Value](/framework/docs/3.4/value) ).

Both components have separate alignment modifiers that serve different purposes. The table below summarizes each modifier:

| Class | Modifiers | Applies To | Controls | Example |
| --- | --- | --- | --- | --- |
| `richtext` | `left`, `center`, `right` | Container (`.richtext`) | Aligns the richtext container within its parent | `richtext--center` |
| `content` | `left`, `center`, `right` | Child content (`.content`) | Aligns the content block within the richtext container | `content--right` |
| `text` | `left`, `center`, `right` | Text elements inside `.content` | Aligns inline text within the content block | `text--center` |

The two levels are independent, so you can place the component one way and align its text another.

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

The Rich Text component offers six size variants: `small`, `base`, `large`, `xlarge`, `xxlarge`, and `xxxlarge`. The `content` class without size modifiers and the `content--base` class produce the same visual result, so use `content--base` when you need to set the base size explicitly in responsive contexts. All size variants support responsive prefixes like `sm:`, `md:`, `lg:`, and `portrait:`.

This is xxxlarge size rich text content.

This is xxlarge size rich text content.

This is xlarge size rich text content.

This is large size rich text content.

This is base size rich text content.

This is small size rich text content.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Rich TextSize Variants

```
<div class="richtext gap--large">
  <!-- XXXLarge Size -->
  <div class="content content--xxxlarge">
    <p>This is xxxlarge size rich text content.</p>
  </div>

  <!-- XXLarge Size -->
  <div class="content content--xxlarge">
    <p>This is xxlarge size rich text content.</p>
  </div>

  <!-- XLarge Size -->
  <div class="content content--xlarge">
    <p>This is xlarge size rich text content.</p>
  </div>

  <!-- Large Size -->
  <div class="content content--large">
    <p>This is large size rich text content.</p>
  </div>

  <!-- Base Size (same as default, useful for responsive) -->
  <div class="content content--base">
    <p>This is base size rich text content.</p>
  </div>

  <!-- Small Size -->
  <div class="content content--small">
    <p>This is small size rich text content.</p>
  </div>
</div>

<!-- Responsive example -->
<div class="richtext gap--large">
  <div class="content content--base lg:content--xxxlarge">
    <p>Base by default, xxxlarge on large screens</p>
  </div>
</div>
```

### Controlling Width

By default, the Rich Text content takes up as much space as it needs and is centered in the layout, expanding up to a maximum width. However, you can precisely control the width of content using Size utility classes [Size](/framework/docs/3.4/size) .

This Rich Text content has a fixed width of 240 pixels using utility classes.

Notice how the text is constrained to this specific width regardless of the container size.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Rich TextFixed Width: 240px

```
<div class="richtext richtext--center gap--large">
  <div class="content w--60 text--center gap">
    <p>This Rich Text content has a fixed width of 240 pixels using utility classes.</p>
    <p>Notice how the text is constrained to this specific width regardless of the container size.</p>
  </div>
</div>
```

You can use any of the Size system's fixed sizes (`w--32`, `w--64`, etc.), arbitrary sizes up to 128px (`w--[120px]`), or responsive sizes (`w--full`, `w--auto`). This flexibility lets you create perfectly sized text blocks for any layout need.

### Responsive Features

The `content` component supports all three responsive systems: size-based, orientation-based, and bit-depth variants. This enables precise control over content text size across different device configurations.

#### Breakpoint Prefixes

Use breakpoint prefixes like `sm:`, `md:`, `lg:` to apply different content sizes per device size class.

Responsive content

Base by default, xxlarge on lg screens

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Rich TextResponsive

```
<!-- Base by default, xxlarge on lg screens -->
<div class="richtext gap--large">
  <div class="content content--base lg:content--xxlarge">
    <p>Responsive content</p>
  </div>
</div>

<!-- Small by default, base on medium+ screens -->
<div class="richtext gap--large">
  <div class="content content--small md:content--base">
    <p>Small by default, base on medium+ screens</p>
  </div>
</div>

<!-- Progressive size scaling -->
<div class="richtext gap--large">
  <div class="content content--small sm:content--base md:content--large lg:content--xxlarge">
    <p>Progressive content sizing</p>
  </div>
</div>
```

#### Orientation and Size+Orientation

Content sizes can adapt to orientation with `portrait:` and `landscape:`, and can be combined with size breakpoints (e.g., `md:portrait:`).

Orientation variant content

Large by default, small in portrait.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Rich TextOrientation

```
<!-- Large by default, small in portrait -->
<div class="richtext gap--large">
  <div class="content content--large portrait:content--small">
    <p>Orientation variant content</p>
  </div>
</div>

<!-- Caption describing the responsive behavior -->
<div class="content content--small">Large by default, small in portrait.</div>
```

#### Bit-Depth Responsive

Use bit-depth prefixes like `1bit:`, `2bit:`, and `4bit:` to optimize content text size for different display color capabilities.

Display optimized content

Large (1bit) → XLarge (2bit) → XXLarge (4bit)

Selective sizing

Base (1bit) → XLarge (4bit)

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Rich TextBit-Depth Responsive

```
<!-- Different content sizes for different bit-depth displays -->
<div class="richtext gap--large">
  <div class="content 1bit:content--large 2bit:content--xlarge 4bit:content--xxlarge">
    <p>Display optimized content</p>
  </div>
</div>

<!-- Selective bit-depth targeting -->
<div class="richtext gap--large">
  <div class="content 1bit:content--base 4bit:content--xlarge">
    <p>Selective sizing</p>
  </div>
</div>
```

#### Combined Responsive Features

Combine multiple responsive systems for highly targeted content sizing. Use size, orientation, and bit-depth modifiers together following the pattern: `size:orientation:bit-depth:content--size`.

Advanced targeting

Complex responsive combinations

Multi-condition content

Multiple responsive conditions

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Rich TextCombined Responsive

```
<!-- Highly targeted responsive combinations -->
<div class="richtext gap--large">
  <div class="content md:portrait:2bit:content--xlarge lg:4bit:content--xxlarge">
    <p>Advanced targeting</p>
  </div>
</div>

<!-- Multiple responsive conditions -->
<div class="richtext gap--large">
  <div class="content sm:1bit:content--large md:portrait:content--base lg:4bit:content--xlarge">
    <p>Multi-condition content</p>
  </div>
</div>
```

### Integration with Content Limiter

The Rich Text component works seamlessly with the Content Limiter utility [Content Limiter](/framework/docs/3.4/content_limiter) to handle overflowing text. When combined, it automatically adjusts text size to fit the available space, which is particularly useful in constrained layouts.

Simply add the `data-content-limiter="true"` attribute to your richtext content element. You can also specify a custom maximum height using the `data-content-max-height` attribute (e.g., `data-content-max-height="140"`).

When `data-content-limiter="true"` is present, the limiter auto-measures the available height in the nearest container and adjusts text to fit. You can override the auto height by specifying `data-content-max-height` with a pixel value.

Automatically resize text when content exceeds height limits

[View Content Limiter Documentation](/framework/docs/3.4/content_limiter)

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

For optimal text rendering on ePaper displays, the Rich Text component can be enhanced with the Pixel Perfect utility [Pixel Perfect](/framework/docs/3.4/pixel_perfect) . This ensures text is rendered with crisp edges by aligning precisely to the pixel grid, preventing blurry or inconsistent text weight.

Simply add the `data-pixel-perfect="true"` attribute to your richtext content element.

Ensure crisp text rendering on 1-bit displays

[View Pixel Perfect Documentation](/framework/docs/3.4/pixel_perfect)

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

## Divider

Create horizontal or vertical dividers between elements

 ](/framework/docs/3.4/divider)

 Next  [ 

## Item

Build standardized list items and content blocks

 ](/framework/docs/3.4/item)

