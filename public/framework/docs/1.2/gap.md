# Gap

The Gap system provides consistent spacing between elements using CSS gap property. It offers predefined sizes, responsive spacing, and custom values to maintain visual rhythm throughout your interface.

### Base Sizes

The gap system includes seven predefined sizes, from xsmall to xxlarge. These standardized spaces help maintain consistent spacing across your application's grid and flex layouts.

#### Standard Gaps

Use `gap--xsmall` for tight spacing, `gap` for default spacing, and larger variants for more generous spacing needs.

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
<!-- Available gap sizes from smallest to largest -->
<div class="grid grid--col-3 gap--xsmall">...</div>
<div class="grid grid--col-3 gap--small">...</div>
<div class="grid grid--col-3 gap">...</div>
<div class="grid grid--col-3 gap--medium">...</div>
<div class="grid grid--col-3 gap--large">...</div>
<div class="grid grid--col-3 gap--xlarge">...</div>
<div class="grid grid--col-3 gap--xxlarge">...</div>
```

### Distribution Modifiers

Beyond fixed gaps, you can use special modifiers to control how space is distributed between elements. These modifiers are particularly useful for creating flexible, dynamic layouts.

#### Space Between

The `gap--space-between` modifier distributes available space evenly between elements, pushing them to the edges of their container.

gap--space-between

gap--space-between

gap--space-between

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Space Between GapDesign System

```
<!-- Space between elements in a flex container -->
<div class="flex flex--col gap--space-between h-full">
  <div>First item</div>
  <div>Second item</div>
  <div>Third item</div>
</div>
```

### Custom Values

When predefined gaps don't meet your specific needs, you can use custom pixel values. This provides precise control over spacing while maintaining the consistent gap syntax.

#### Arbitrary Pixel Values

Use `gap--[Npx]` syntax to specify exact pixel values. This works with both grid and flex layouts.

gap--[5px]

gap--[5px]

gap--[5px]

gap--[10px]

gap--[10px]

gap--[10px]

gap--[15px]

gap--[15px]

gap--[15px]

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Custom Pixel GapsDesign System

```
<!-- Custom gap values -->
<div class="grid grid--col-3 gap--[5px]">...</div>
<div class="grid grid--col-3 gap--[10px]">...</div>
<div class="grid grid--col-3 gap--[15px]">...</div>

<!-- Works with flex containers too -->
<div class="flex flex--col gap--[20px]">...</div>
```

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

 ](/framework/docs/1.2/spacing)

 Next  [ 

## Flex

Arrange elements with flexible layouts and alignment options

 ](/framework/docs/1.2/flex)

