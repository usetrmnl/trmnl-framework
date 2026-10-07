# Outline

The Outline utility draws a pixel-perfect dotted rounded border on any element. On 1-bit displays it places single-pixel dots at exact integer coordinates with pure CSS gradients; on 2-bit, 4-bit, and full-color displays it draws a standard CSS border with border-radius instead.

### Basic Usage

The outline utility applies a pixel-perfect rounded border to any element. It uses CSS border-image with a 9-slice composite image to ensure crisp rendering on 1-bit displays while maintaining responsiveness across different element sizes.

#### Applying an Outline

Add the `outline` class to any element to give it a pixel-perfect rounded border.

With outline

Without outline

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Outline UtilityDesign System

```
<!-- Add outline to any element -->
<div class="outline">
  Content with pixel-perfect rounded border
</div>
```

### How It Works

The outline utility uses CSS border-image with a 9-slice composite image. This technique allows the corners to remain pixel-perfect while the edges repeat to fill any size container.

#### 9-Slice Border Image

The border image is divided into 9 regions: four corners that stay fixed, four edges that repeat to fill the space, and a center region. This approach ensures the rounded corners render consistently regardless of element dimensions.

```
/* How the CSS works internally */
.outline {
    border: 10px solid transparent;
    border-image-source: url("/images/borders--1bit/outline.png");
    border-image-slice: 10 fill;
    border-image-repeat: repeat;
}
```

### Bit-Depth Behavior

The outline utility adapts to different display bit-depths automatically. On 1-bit displays, it uses the border-image technique for pixel-perfect rendering. On 2-bit and 4-bit displays, it falls back to standard CSS borders with border-radius for smoother rendering.

#### 1-bit Displays

Uses border-image with a dithered 9-slice image for crisp, pixel-perfect corners.

#### 2-bit and 4-bit Displays

Falls back to a standard 1px solid border with 10px border-radius for smoother rendering that takes advantage of the additional grayscale capabilities.

```
/* 1-bit: Uses border-image */
.outline {
    border-image-source: url("/images/borders--1bit/outline.png");
    /* ... */
}

/* 2-bit and 4-bit: Falls back to CSS border */
.screen--2bit .outline,
.screen--4bit .outline {
    border-image: none;
    border: 1px solid var(--black);
    border-radius: 10px;
}
```

### Screen Backdrop Modifier

For mashup layouts, the `screen--backdrop` modifier provides an alternative appearance where views sit on a patterned background instead of having outlined borders.

#### Default vs Backdrop Mashups

By default, mashups use a white background with bordered views for a clean, separated look. The `screen--backdrop` modifier changes this to a patterned background (1-bit) or solid gray background (2-bit/4-bit) with plain white views on top.

Plugin A

Plugin B

```
<!-- Default mashup (white background, bordered views) -->
<div class="screen">
  <div class="mashup mashup--1Lx1R">
    <div class="view view--half_vertical">...</div>
    <div class="view view--half_vertical">...</div>
  </div>
</div>

<!-- Backdrop mashup (patterned background) -->
<div class="screen screen--backdrop">
  <div class="mashup mashup--1Lx1R">
    <div class="view view--half_vertical">...</div>
    <div class="view view--half_vertical">...</div>
  </div>
</div>
```

 Previous  [ 

## Rounded

Control element rounding with predefined values

 ](/framework/docs/2.3/rounded)

 Next  [ 

## Text

Control text color, alignment and formatting

 ](/framework/docs/2.3/text)

