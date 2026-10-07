# Visibility

Show or hide an element and set its display type. Hidden and visible controls plus display helpers like flex, grid, and inline, each with responsive and bit-depth variants for device-specific layouts.

## Visibility Across Devices

Every device carries a size class: `sm`, `md`, or `lg`. Each column below targets one of them, so switching the device in the screen picker changes which column has content.

Small (sm)
visible md:hidden

Medium (md)
hidden md:visible lg:hidden

Large (lg)
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
| `inline-grid` | Display as inline grid container | `display: inline-grid` |
| `table` | Display as table element | `display: table` |
| `table-row` | Display as table row element | `display: table-row` |
| `table-cell` | Display as table cell element | `display: table-cell` |

## Responsive Display Control

All display utilities take the size prefixes. They are mobile-first, so a prefix applies on its own size class and every larger one. See [Responsive](/framework/docs/3.0/responsive) for the size class each device carries.

| Example Class | Effect | Active On |
| --- | --- | --- |
| `sm:hidden` | Hide on small screens and larger | sm, md, lg (every device) |
| `md:flex` | Display as flex on medium screens and larger | md, lg |
| `lg:grid` | Display as grid on large screens | lg |
| `sm:inline-block` | Display as inline-block on small screens and larger | sm, md, lg (every device) |

```
<!-- Basic responsive display -->
<div class="hidden md:block">Show as block on medium+</div>
<div class="block md:flex">Block by default, flex on medium+</div>
<div class="hidden lg:inline-grid">Show as inline-grid on large screens</div>

<!-- Complex responsive layouts -->
<div class="inline sm:inline-block md:flex lg:grid">
  Changes display type at each breakpoint
</div>

<!-- Hide on mobile, show different layouts -->
<div class="hidden sm:flex md:grid lg:table">
  Different layout per screen size
</div>

<!-- Table-style structures -->
<div class="table">
  <div class="table-row">
    <div class="table-cell">Cell A</div>
    <div class="table-cell">Cell B</div>
  </div>
</div>
```

## Bit-Depth Display Control

All display utilities take the bit-depth prefixes. These are not progressive the way the size prefixes are: `2bit:` applies on 2-bit screens and nowhere else.

| Example Class | Effect | Active On |
| --- | --- | --- |
| `1bit:hidden` | Hide on monochrome displays | Every 1-bit profile (TRMNL OG, Playdate, Frame, and the color panels that dither to black and white) |
| `2bit:flex` | Display as flex on 4-shade grayscale displays | Every 2-bit profile (TRMNL OG V2, Waveshare 5.8" B/W) |
| `4bit:grid` | Display as grid on 16-shade grayscale displays | Every 4-bit profile (TRMNL V2, Kindle 2024, reMarkable Paper 2, and most Kobo and Inkplate panels) |

## Device-Specific Display Control

Combine a size and a bit-depth prefix on any display utility to narrow the target to one group of panels. Use the pattern `size:bit-depth:display`.

| Example Class | Target Device | Effect |
| --- | --- | --- |
| `md:1bit:block` | 1-bit screens at md or lg (TRMNL OG, Frame) | Display as block |
| `md:2bit:flex` | 2-bit screens at md or lg (TRMNL OG V2, Waveshare 5.8" B/W) | Display as flex |
| `lg:4bit:grid` | 4-bit screens at lg (TRMNL V2, Kindle Scribe, reMarkable Paper 2, and 11 more) | Display as grid |
| `sm:4bit:table` | Every 4-bit screen, since sm is the smallest size class | Display as table |

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

## Dark Mode Display Control

Visibility utilities support dark-first prefixes for screen dark mode targeting. Use `dark:` to show or hide content by screen dark mode. Light-mode behavior is the default state.

```
<!-- Hide only in dark mode -->
<div class="dark:hidden">Dark mode hides this</div>

<!-- Show only in dark mode -->
<div class="hidden dark:block">Dark mode shows this</div>

<!-- Combined targeting -->
<div class="dark:md:portrait:2bit:hidden">
  Hidden on dark medium+ portrait 2-bit screens
</div>
```

 Previous  [ 

## Responsive Test

Test responsive utilities and compare SCSS mixins with CSS classes

 ](/framework/docs/3.0/responsive_test)

 Next  [ 

## Background

Apply color tokens as backgrounds with bg--{token}

 ](/framework/docs/3.0/background)

