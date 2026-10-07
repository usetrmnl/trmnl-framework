# Gap

Utility classes for the space between the children of a flex, grid, or column container. Predefined sizes, arbitrary values, distribution modifiers, and responsive variants.

### Size Variants

The gap system includes predefined base sizes and arbitrary pixel values. These standardized spaces help maintain consistent spacing across your application's grid and flex layouts.

#### Base

The base `gap` class without size modifiers and the `gap--base` class both produce the same visual result, providing the standard spacing. Use `gap--base` when you need to explicitly set the base size in responsive contexts. See the [Responsive Gaps](#responsive-gap) section for examples.

gap--none

gap--none

gap--none

gap--xsmall

gap--xsmall

gap--xsmall

gap--small

gap--small

gap--small

gap

gap

gap

gap--medium

gap--medium

gap--medium

gap--large

gap--large

gap--large

gap--xlarge

gap--xlarge

gap--xlarge

gap--xxlarge

gap--xxlarge

gap--xxlarge

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Predefined GapsDesign System

```
<!-- Available base gap sizes from smallest to largest -->
<div class="grid grid--cols-3 gap--none">...</div>
<div class="grid grid--cols-3 gap--xsmall">...</div>
<div class="grid grid--cols-3 gap--small">...</div>
<div class="grid grid--cols-3 gap">...</div>
<div class="grid grid--cols-3 gap--medium">...</div>
<div class="grid grid--cols-3 gap--large">...</div>
<div class="grid grid--cols-3 gap--xlarge">...</div>
<div class="grid grid--cols-3 gap--xxlarge">...</div>

<!-- Or using the base modifier -->
<div class="flex flex--col gap--base">...</div>
```

#### Arbitrary

Use `gap--[Npx]` syntax to specify exact pixel values from **0px to 50px**. This works with both grid and flex layouts, but does not support responsive variants.

gap--[0px]

gap--[0px]

gap--[0px]

gap--[10px]

gap--[10px]

gap--[10px]

gap--[30px]

gap--[30px]

gap--[30px]

gap--[50px]

gap--[50px]

gap--[50px]

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Arbitrary Pixel GapsDesign System

```
<!-- Custom gap values from 0px to 50px (no responsive support) -->
<div class="grid grid--cols-3 gap--[0px]">...</div>
<div class="grid grid--cols-3 gap--[10px]">...</div>
<div class="grid grid--cols-3 gap--[30px]">...</div>
<div class="grid grid--cols-3 gap--[50px]">...</div>

<!-- Works with flex containers too -->
<div class="flex flex--col gap--[25px]">...</div>
```

Arbitrary gap values using the `gap--[Npx]` syntax do not support responsive variants. Use predefined gap classes if you need responsive behavior.

### Distribution Modifiers

Beyond fixed gaps, you can use special modifiers to control how space is distributed between elements. These modifiers are particularly useful for creating flexible, dynamic layouts.

#### Auto Distribution

The `gap--auto` modifier distributes available space evenly between elements, including equal spacing at the edges. This uses `justify-content: space-evenly`.

gap--auto

gap--auto

gap--auto

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Auto Distribution GapDesign System

```
<!-- Auto distribution in a flex container -->
<div class="flex flex--col gap--auto h--52">
  <div>...</div>
  <div>...</div>
  <div>...</div>
</div>
```

#### Distribute

The `gap--distribute` modifier places the first item at the start of the container and the last item at the end, with equal spacing between items. This uses `justify-content: space-between`.

gap--distribute

gap--distribute

gap--distribute

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Distribute GapDesign System

```
<!-- Distribute spacing in a flex container -->
<div class="flex flex--col gap--distribute h--52">
  <div>First item (at start)</div>
  <div>Middle item</div>
  <div>Last item (at end)</div>
</div>
```

#### Legacy: Space Between

The `gap--space-between` modifier is maintained for backwards compatibility. It behaves the same as `gap--auto`, using `justify-content: space-evenly`. For the actual `space-between` behavior, use `gap--distribute`.

### Responsive Gaps

Gap utilities support size-based breakpoints, orientation variants, and their combination. Use prefixes like `md:`, `portrait:`, and `md:portrait:` to target conditions.

#### Responsive Gap Examples

Apply different gap values at different breakpoints using the size-based responsive system. The framework follows a mobile-first approach where larger breakpoints inherit smaller ones. The `--base` modifier is particularly useful for resetting to the default size at specific breakpoints.

Responsive Gap

Responsive Gap

Responsive Gap

Small by default, large on md+, xlarge on lg+, medium gap in portrait, xlarge in md+ portrait

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Responsive GapsSize-Based

```
<!-- Size + orientation examples -->
<div class="grid grid--cols-3 gap--small md:gap--large lg:gap--xlarge portrait:gap--medium md:portrait:gap--xlarge">
  <div>...</div>
  <div>...</div>
  <div>...</div>
</div>

<!-- Examples of different responsive patterns -->
<div class="flex flex--col gap md:gap--large portrait:gap--small">...</div>
<div class="grid grid--cols-2 gap--xsmall lg:gap--medium md:portrait:gap--large">...</div>

<!-- Using base modifier to reset to default size at breakpoint -->
<div class="grid grid--cols-3 gap--small lg:gap--base">
  <div>...</div>
  <div>...</div>
  <div>...</div>
</div>
```

Gap utilities only support size-based responsive variants. Bit-depth variants (like `1bit:` or `4bit:`) are not available for gap classes.

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| `--gap-large` | 20px | - | - | - |
| `--gap-medium` | 16px | - | - | - |
| `--gap-small` | 7px | - | - | - |
| `--gap-xlarge` | 30px | - | - | - |
| `--gap-xsmall` | 5px | - | - | - |
| `--gap-xxlarge` | 40px | - | - | - |
| `--list-gap-small` | 8px | - | - | - |

 Previous  [ 

## Spacing

Control element spacing with fixed margin and padding values

 ](/framework/docs/3.0/spacing)

 Next  [ 

## Flex

Arrange elements with flexible layouts and alignment options

 ](/framework/docs/3.0/flex)

