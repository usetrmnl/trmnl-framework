# Visibility

Show or hide an element and set its display type. Hidden and visible controls plus display helpers like flex, grid, and inline, each with responsive and bit-depth variants for device-specific layouts.

## Visibility Across Devices

See how visibility classes behave across different screen sizes. Each column represents a different device size.

Small (600px)
visible md:hidden

Medium (800px)
hidden md:visible lg:hidden

Large (1024px)
hidden lg:visible

```
<!-- Always visible -->
<div class="visible">visible</div>

<!-- Always hidden -->
<div class="hidden">hidden</div>

<!-- Hidden by default, visible on medium+ -->
<div class="hidden md:visible">md:visible</div>

<!-- Visible by default, hidden on medium+ -->
<div class="visible md:hidden">md:hidden</div>

<!-- Visible by default, hidden on large -->
<div class="visible lg:hidden">lg:hidden</div>

<!-- Display as flex on medium+ -->
<div class="hidden md:flex">md:flex</div>

<!-- Display as grid on large screens -->
<div class="hidden lg:grid">lg:grid</div>
```

## Display Utilities

Control how elements are displayed with specific display types. These classes set the CSS `display` property.

| Class | Effect | CSS Output |
| --- | --- | --- |
| `hidden` | Hide element completely | `display: none` |
| `visible` | Display as block element | `display: block` |
| `block` | Display as block element | `display: block` |
| `inline` | Display as inline element | `display: inline` |
| `inline-block` | Display as inline block element | `display: inline-block` |
| `flex` | Display as flex container | `display: flex` |
| `grid` | Display as grid container | `display: grid` |
| `table` | Display as table element | `display: table` |
| `table-row` | Display as table row element | `display: table-row` |

## Responsive Display Control

All display utilities work with responsive prefixes [Responsive](/framework/docs/2.3/responsive) . Size prefixes are mobile-first (apply at that size and larger). You can combine any display utility with responsive breakpoints [Responsive](/framework/docs/2.3/responsive) .

| Example Class | Effect | Active On |
| --- | --- | --- |
| `sm:hidden` | Hide on small screens and larger | All devices (600px+) |
| `md:flex` | Display as flex on medium screens and larger | TRMNL OG, TRMNL V2 (800px+) |
| `lg:grid` | Display as grid on large screens | TRMNL V2 (1024px+) |
| `sm:inline-block` | Display as inline-block on small screens and larger | All devices (600px+) |

```
<!-- Basic responsive display -->
<div class="hidden md:block">Show as block on medium+</div>
<div class="block md:flex">Block by default, flex on medium+</div>
<div class="hidden lg:grid">Show as grid on large screens</div>

<!-- Complex responsive layouts -->
<div class="inline sm:inline-block md:flex lg:grid">
  Changes display type at each breakpoint
</div>

<!-- Hide on mobile, show different layouts -->
<div class="hidden sm:flex md:grid lg:table">
  Different layout per screen size
</div>
```

## Bit-Depth Display Control

All display utilities work with bit-depth prefixes to target specific display capabilities. Perfect for optimizing layouts for different ePaper displays.

| Example Class | Effect | Active On |
| --- | --- | --- |
| `1bit:hidden` | Hide on monochrome displays | TRMNL OG only |
| `2bit:flex` | Display as flex on 4-shade grayscale displays | TRMNL OG V2 only |
| `4bit:grid` | Display as grid on 16-shade grayscale displays | TRMNL V2, Kindle 2024 only |

## Device-Specific Display Control

Combine size and bit-depth prefixes with any display utility to target specific devices precisely. Use the pattern: `size:bit-depth:display`

| Example Class | Target Device | Effect |
| --- | --- | --- |
| `md:1bit:block` | TRMNL OG only | Display as block (800px, monochrome) |
| `md:2bit:flex` | TRMNL OG V2 only | Display as flex (800px, 4-shade grayscale) |
| `lg:4bit:grid` | TRMNL V2 only | Display as grid (1024px, 16-shade grayscale) |
| `sm:4bit:table` | Kindle 2024 only | Display as table (600px, 16-shade grayscale) |

```
<!-- Device-specific layouts -->
<div class="hidden md:1bit:block md:2bit:flex lg:4bit:grid">
  Different display types per device generation
</div>

<!-- Optimize for ePaper performance -->
<div class="table 1bit:block 2bit:flex">
  Simple layouts for lower bit-depth displays
</div>

<!-- Complex responsive + bit-depth targeting -->
<div class="hidden sm:inline md:1bit:block md:2bit:flex lg:4bit:grid">
  Progressive enhancement across all device capabilities
</div>
```

 Previous  [ 

## Responsive Test

Test responsive utilities and compare SCSS mixins with CSS classes

 ](/framework/docs/2.3/responsive_test)

 Next  [ 

## Background

Apply color tokens as backgrounds with bg--{token}

 ](/framework/docs/2.3/background)

