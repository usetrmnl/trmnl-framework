# Divider

The Divider element provides a simple, standalone shorthand for horizontal and vertical separators. It draws the same line as the border utilities at level 6, the line the steps 60 and 65 draw.

### Usage

Use `divider` or `divider--h` for horizontal dividers, and `divider--v` for vertical dividers.

The background variants (`divider--on-white`, `divider--on-light`, `divider--on-dark`, `divider--on-black`) are deprecated and will be removed in Framework 4.0. Pick an explicit border level or token instead.

#### Border Shorthand

Use it when you want a one-pixel horizontal or vertical separator without writing a full border utility class.

Horizontal Divider

Equivalent intent: border--h-6

Left

Right

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Divider Border Shorthand

```
<!-- Horizontal shorthand (same rendering intent as border--h-6) -->
<div class="divider"></div>

<!-- Explicit horizontal class -->
<div class="divider--h"></div>

<!-- Vertical shorthand -->
<div class="divider--v"></div>
```

#### Vertical Dividers

Vertical dividers draw the same way as horizontal ones.

Left SideWhite background

Right SideSame divider

Left SideBlack background

Right SideSame divider

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Vertical Dividers

```
<!-- Vertical divider -->
<div class="divider--v"></div>
```

#### Common Usage Patterns

$1,234Revenue

42Orders

$29.38AOV

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Section Separation

```
<!-- Replacing common border--h-x w--full pattern -->
<!-- Old way: -->
<div class="border--h-6 w--full"></div>

<!-- New way: -->
<div class="divider"></div>
```

### Dividers in JavaScript

JavaScript can read the divider line too: `TRMNLPaint.divider({ dir })` returns the level-6 line with the device and the active theme already applied. `applyBorder()` paints the returned `BorderFill` onto a node. Unlike the `.border--*` utilities, a divider paints on the element itself, so that is where the paint is read; see [Painting Borders](/framework/docs/3.4/paint_borders) .

 Previous  [ 

## Description

Format descriptive text with standardized styles

 ](/framework/docs/3.4/description)

 Next  [ 

## Rich Text

Display formatted paragraphs with alignment and size variants

 ](/framework/docs/3.4/rich_text)

