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

Use breakpoint prefixes like `sm:`, `md:`, `lg:` to apply different sizes per device size class.

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

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
| `--title-font-family` | "BlockKie" | "BlockKie" | #{meta.inspect($family)} | - |
| `--title-font-size` | calc(26px \* var(--text-ui-scale)) | calc(26px \* var(--text-ui-scale)) | calc(21px \* var(--text-ui-scale)) | - |
| `--title-font-smoothing` | none | none | auto | - |
| `--title-font-weight` | 400 | 400 | clamp(100, calc(400 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--title-line-height` | 1 | 1 | 1.2 | - |
| Small |
| `--title-small-font-family` | "NicoClean" | "NicoClean" | #{meta.inspect($family)} | - |
| `--title-small-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | - |
| `--title-small-font-smoothing` | none | none | auto | - |
| `--title-small-font-weight` | 400 | 400 | clamp(100, calc(700 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--title-small-line-height` | 1 | 1 | 1.2 | - |
| Large |
| `--title-large-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--title-large-font-size` | calc(30px \* var(--text-ui-scale)) | - | calc(30px \* var(--text-ui-scale)) | - |
| `--title-large-font-smoothing` | auto | - | auto | - |
| `--title-large-font-weight` | 425 | - | clamp(100, calc(425 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--title-large-line-height` | 1.2 | - | 1.2 | - |
| Xlarge |
| `--title-xlarge-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--title-xlarge-font-size` | calc(35px \* var(--text-ui-scale)) | - | calc(35px \* var(--text-ui-scale)) | - |
| `--title-xlarge-font-smoothing` | auto | - | auto | - |
| `--title-xlarge-font-weight` | 400 | - | clamp(100, calc(400 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--title-xlarge-line-height` | 1.2 | - | 1.2 | - |
| Xxlarge |
| `--title-xxlarge-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--title-xxlarge-font-size` | calc(40px \* var(--text-ui-scale)) | - | calc(40px \* var(--text-ui-scale)) | - |
| `--title-xxlarge-font-smoothing` | auto | - | auto | - |
| `--title-xxlarge-font-weight` | 375 | - | clamp(100, calc(375 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--title-xxlarge-line-height` | 1.2 | - | 1.2 | - |

 Previous  [ 

## Mashup

Assemble multiple plugin views into a single interface

 ](/framework/docs/3.1/mashup)

 Next  [ 

## Value

Display data values with consistent formatting

 ](/framework/docs/3.1/value)

