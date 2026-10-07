# Title

Headings for a plugin screen. Five size variants from small to xxlarge, each with responsive prefixes for breakpoints and orientation.

### Size Variations

The Title system offers five size variants: small, base (default), large, xlarge, and xxlarge.

Small TitleBase TitleLarge TitleExtra Large TitleXXL Title

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TitleSize Variations

```
<!-- Small: compact headings for secondary content -->
<span class="title title--small">Small Title</span>

<!-- Base: default size, most common usage -->
<span class="title">Base Title</span>
<span class="title title--base">Base Title</span>

<!-- Large: prominent headers -->
<span class="title title--large">Large Title</span>

<!-- Extra Large: hero sections -->
<span class="title title--xlarge">Extra Large Title</span>

<!-- Extra Extra Large: maximum impact -->
<span class="title title--xxlarge">XXL Title</span>

<!-- Responsive example -->
<span class="title title--small lg:title--base">Small by default, base on large screens</span>
```

### Responsive Titles

The Title system supports responsive variants using breakpoint prefixes.

#### Breakpoint Prefixes

Use breakpoint prefixes like `sm:`, `md:`, `lg:` to apply different sizes at different screen widths.

Responsive TitleSmall by default, xlarge on lg screens

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TitleResponsive

```
<!-- Small by default, xlarge on lg screens -->
<span class="title title--small lg:title--xlarge">
  Responsive Title
</span>

<!-- Caption describing the responsive behavior (optional) -->
<span class="label">Base by default, xlarge on lg screens</span>
```

#### Orientation and Size+Orientation

Title sizes can adapt to orientation with `portrait:` and can be combined with size breakpoints (e.g., `md:portrait:`).

Orientation VariantLarge by default, small in portrait.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TitleOrientation

```
<!-- Large by default, small in portrait -->
<span class="title title--large portrait:title--small">Orientation Variant</span>

<!-- Caption describing the responsive behavior (optional) -->
<span class="label">Large by default, small in portrait.</span>
```

 Previous  [ 

## Mashup

Assemble multiple plugin views into a single interface

 ](/framework/docs/2.3/mashup)

 Next  [ 

## Value

Display data values with consistent formatting

 ](/framework/docs/2.3/value)

