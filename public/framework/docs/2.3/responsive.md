# Responsive

The Responsive system adapts a layout to the device it renders on. **Size-based** breakpoints follow the size class each device carries, and **Bit-depth** variants follow its color capabilities. Combine them to control how your content appears across TRMNL's range of devices.

## Component Support

Not all framework components support responsive variants. We're trying to keep the framework as minimal as we can while offering the features you need.

This table shows which responsive features each framework component supports. Use this reference to understand what's possible with each component type.

| Component | Size | Orientation | Bit-Depth | Example Usage |
| --- | --- | --- | --- | --- |
| Background | Yes | Yes | | `md:bg--gray-50` |
| Border | No | No | | `border--h-3 (auto adapts)` |
| Text | Yes | Yes | | `lg:2bit:text--center` |
| Visibility | Yes | Yes | Yes | `sm:1bit:hidden` |
| Value | Yes | Yes | No | `md:value--large` |
| Label | Yes | Yes | Yes | `md:portrait:2bit:label--inverted` |
| Spacing | Yes | Yes | No | `md:p--large, lg:m--xlarge, md:portrait:my--24` |
| Layout | Yes | Yes | No | `md:layout--row, lg:layout--col` |
| Gap | Yes | Yes | No | `md:gap--large, lg:gap--xlarge` |
| Flexbox | Yes | Yes | No | `md:flex--center, portrait:flex--col` |
| Rounded | Yes | Yes | No | `md:rounded--large, lg:rounded--xlarge` |
| Size | Yes | Yes | No | `md:w--large, lg:h--full` |
| Grid | Yes | Yes | No | `md:grid--cols-3, md:portrait:col--span-2` |
| Clamp | Yes | Yes | No | `data-clamp-md-portrait="3"` |
| Overflow (Smart columns) | Yes | Yes | No | `data-overflow-max-cols-lg="4"` |

### Legend

Built-in adaptive behavior

 Yes Full support

 No Not supported

## Size-Based Responsive

### How It Works

Each device automatically sets a size class (e.g., `screen--md`) based on its width, activating the appropriate responsive utilities.

The system follows a mobile-first approach. When you use `md:value--large`, it applies on medium screens and larger.

### Basic Usage

Prefix any utility class with a breakpoint name followed by a colon. The style applies at that breakpoint and all larger sizes.

Responsive Value

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ResponsiveSize Based

This example shows progressive sizing: the text starts at regular size, becomes large on medium screens (md:) and larger, then becomes xlarge on large screens (lg:) and larger.

```
<!-- Regular by default, large on medium and above, xlarge on large and above -->
<span class="value md:value--large lg:value--xlarge">
  Responsive Value
</span>
```

### Available Breakpoints

Three standard breakpoints cover all current supported TRMNL devices. Each breakpoint represents a minimum screen width.

| Prefix | Screen Class | Min Width | Example Devices |
| --- | --- | --- | --- |
| `sm:` | `screen--sm` | 600px | Kindle 2024 |
| `md:` | `screen--md` | 800px | TRMNL OG, TRMNL OG V2 |
| `lg:` | `screen--lg` | 1024px | TRMNL V2 |

## Bit-Depth Responsive

### How It Works

Bit-depth responsiveness adapts styles based on the display's color capabilities. Unlike size-based breakpoints, bit-depth variants are not progressive - each variant targets a specific bit-depth only.

When you use `4bit:bg--gray-65`, it applies only on 4-bit screens, not on 1-bit or 2-bit screens.

### Basic Usage

Prefix utilities with bit-depth values to create display-specific styles. This is especially useful for optimizing appearance across monochrome and grayscale screens.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ResponsiveBit Depth

This example demonstrates bit-depth adaptation: the square appears black on 1-bit displays, gray-45 on 2-bit displays, and gray-75 on 4-bit displays. Each bit-depth variant targets only that specific display type.

```
<!-- black on 1-bit, gray-45 on 2-bit, gray-75 on 4-bit screens -->
<div class="h--36 w--36 rounded--large 1bit:bg--black 2bit:bg--gray-45 4bit:bg--gray-75"></div>
```

### Available Bit-Depths

The framework supports three bit-depth variants corresponding to TRMNL's display technologies. Each targets specific color capabilities.

| Prefix | Screen Class | Color Support | Example Devices |
| --- | --- | --- | --- |
| `1bit:` | `screen--1bit` | Monochrome (2 shades) | TRMNL OG |
| `2bit:` | `screen--2bit` | Grayscale (4 shades) | TRMNL OG V2 |
| `4bit:` | `screen--4bit` | Grayscale (16 shades) | TRMNL V2, Kindle 2024 |

## Orientation-Based Responsive

### How It Works

Orientation variants adapt styles based on whether the screen is in landscape or portrait mode. Since landscape is the default, only `portrait:` variants are provided to avoid redundancy.

Portrait variants are particularly useful for layout utilities like Flexbox, where you might want different flex directions or alignments when the screen is rotated.

### Basic Usage

Use the `portrait:` prefix to apply styles only when the screen is in portrait orientation:

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ResponsiveOrientation Based

This example shows orientation-responsive layout: items are arranged in a row by default (landscape), but automatically switch to a column layout when the screen is in portrait orientation using `portrait:flex--col`.

```
<!-- Row layout in landscape, column layout in portrait -->
<div class="flex flex--row portrait:flex--col gap">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Combining All Systems

The responsive system lets you combine size, orientation, and bit-depth variants. This enables highly targeted designs that adapt to screen dimensions, orientation, and color capabilities.

Aa
TRMNL OG

Aa
TRMNL OG V2

Aa
TRMNL V2

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ResponsiveAdvanced Targeting

This advanced example combines size and bit-depth variants to target specific device configurations: `md:1bit:` targets medium+ 1-bit screens, `md:2bit:` targets medium+ 2-bit screens, and `lg:4bit:` targets large+ 4-bit screens.

```
<!-- Simple orientation variant -->
<div class="flex flex--row portrait:flex--col">...</div>

<!-- Size + orientation -->
<div class="text--center md:portrait:text--left">...</div>

<!-- All three combined: size + orientation + bit-depth -->
<div class="flex flex--row md:portrait:4bit:flex--col">
  <!-- Row layout by default -->
  <!-- Column layout on medium+ screens, in portrait, with 4-bit display -->
</div>
```

### Pattern and Order

When combining variants, follow this pattern: `size:orientation:bit-depth:utility`. This order flows from general layout concerns to specific display characteristics.

Each modifier is optional and can be used independently. You might use just `portrait:flex--col` for orientation-specific layouts, or `md:value--large` for size-responsive typography, depending on your design needs.

### Specificity Hierarchy

When multiple responsive variants target the same property, CSS specificity determines which style applies. The framework follows a clear hierarchy: the more modifiers in a class, the higher its specificity.

For example, `portrait:2bit:value--small` will override both `portrait:value--large` and `2bit:value--medium` when all conditions are met, because it has the most specific combination of modifiers.

### Available Combinations

The responsive system supports flexible modifier combinations, allowing you to target specific device configurations. The table below shows all available patterns, from simple single modifiers to complex multi-modifier combinations. Each combination becomes active only when all its conditions are met.

| Pattern | Example | When Active | Use Case |
| --- | --- | --- | --- |
| `size:` | `md:value--large` | Medium screens and larger | Responsive sizing based on screen width |
| `orientation:` | `portrait:flex--col` | Portrait orientation only | Layout adjustments for vertical screens |
| `bit-depth:` | `4bit:bg--gray-75` | 4-bit displays only | Color optimization for specific displays |
| `size:orientation:` | `md:portrait:text--center` | Medium+ screens in portrait | Size-aware orientation layouts |
| `size:bit-depth:` | `lg:2bit:value--xlarge` | Large+ screens with 2-bit display | Display-specific sizing on larger screens |
| `orientation:bit-depth:` | `portrait:2bit:value--small` | Portrait with 2-bit display | Orientation-aware display optimization |
| `size:orientation:bit-depth:` | `md:portrait:4bit:gap--large` | Medium+ screens, portrait, 4-bit display | Highly specific device targeting |

 Previous  [ 

## Aspect Ratio

Maintain consistent proportions for elements regardless of their content

 ](/framework/docs/2.3/aspect_ratio)

 Next  [ 

## Responsive Test

Test responsive utilities and compare SCSS mixins with CSS classes

 ](/framework/docs/2.3/responsive_test)

