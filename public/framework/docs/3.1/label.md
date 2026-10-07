# Label

Short captions and status chips for a plugin screen. Five sizes plus style variants (filled, outline, underline, inverted) and semantic variants such as label--success and label--error.

### Size and Style Variants

Labels come in several style variants. Each one combines with any size modifier.

Small

Base

Large

XLarge

XXLarge

Default

Label

Label

Label

Label

Label

Outline

Label

Label

Label

Label

Label

Underline

Label

Label

Label

Label

Label

Gray

Label

Label

Label

Label

Label

Filled

Label

Label

Label

Label

Label

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LabelStyle Variants

```
<!-- Default (plain) -->
<span class="label">Default Label</span>

<!-- Outline: bordered label -->
<span class="label label--outline">Outline Label</span>

<!-- Underline: underlined label -->
<span class="label label--underline">Underline Label</span>

<!-- Gray: muted/secondary label -->
<span class="label label--gray">Gray Label</span>

<!-- Filled: black (darkest) background -->
<span class="label label--filled">Filled</span>

<!-- Semantic: primary, success, error, warning -->
<span class="label label--primary">Primary</span>
<span class="label label--success">Success</span>
<span class="label label--error">Error</span>

<!-- Backwards compatible: label--inverted = label--filled -->
<span class="label label--inverted">Inverted (alias)</span>

<!-- Combine sizes with styles -->
<span class="label label--large label--outline">Large Outline Label</span>
<span class="label label--xlarge label--filled">XLarge Filled Label</span>
```

#### Semantic variants

Use `label--primary`, `label--success`, `label--error`, `label--warning` for intent-based colors. `label--filled` uses black (darkest), success and warning use black text, and warning uses a yellow background. See [Colors](/framework/docs/3.4/colors) for the semantic mapping.

FilledPrimarySuccessErrorWarning

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LabelSemantic Colors

### Text Overflow Behavior

Labels can handle longer text content through natural wrapping or text clamping. Understanding how labels behave with overflow content helps ensure your interface remains readable and visually balanced.

#### Multi-line Wrapping

By default, labels will wrap to multiple lines when content exceeds the available width, maintaining readability for longer text.

Small

Base

Large

Default

This longer label will wrap to multiple lines when it exceeds the width

This longer label will wrap to multiple lines when it exceeds the width

This longer label will wrap to multiple lines when it exceeds the width

Underline

This longer label will wrap to multiple lines when it exceeds the width

This longer label will wrap to multiple lines when it exceeds the width

This longer label will wrap to multiple lines when it exceeds the width

Filled

This longer label will wrap to multiple lines when it exceeds the width

This longer label will wrap to multiple lines when it exceeds the width

This longer label will wrap to multiple lines when it exceeds the width

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LabelMulti-line

```
<!-- Labels with longer text will wrap naturally -->
<span class="label">This longer label will wrap to multiple lines when it exceeds the width</span>
```

#### Text Clamping

Use the framework's `data-clamp` attribute to limit labels to a specific number of lines with ellipsis overflow.

Small

Base

Large

1-line

This is a very long label text that would normally wrap to many lines but demonstrates how clamping behavior works with different variants and line limits to show ellipsis overflow

This is a very long label text that would normally wrap to many lines but demonstrates how clamping behavior works with different variants and line limits to show ellipsis overflow

This is a very long label text that would normally wrap to many lines but demonstrates how clamping behavior works with different variants and line limits to show ellipsis overflow

2-line

This is a very long label text that would normally wrap to many lines but demonstrates how clamping behavior works with different variants and line limits to show ellipsis overflow

This is a very long label text that would normally wrap to many lines but demonstrates how clamping behavior works with different variants and line limits to show ellipsis overflow

This is a very long label text that would normally wrap to many lines but demonstrates how clamping behavior works with different variants and line limits to show ellipsis overflow

Underline 1

This is a very long label text that would normally wrap to many lines but demonstrates how clamping behavior works with different variants and line limits to show ellipsis overflow

This is a very long label text that would normally wrap to many lines but demonstrates how clamping behavior works with different variants and line limits to show ellipsis overflow

This is a very long label text that would normally wrap to many lines but demonstrates how clamping behavior works with different variants and line limits to show ellipsis overflow

Underline 2

This is a very long label text that would normally wrap to many lines but demonstrates how clamping behavior works with different variants and line limits to show ellipsis overflow

This is a very long label text that would normally wrap to many lines but demonstrates how clamping behavior works with different variants and line limits to show ellipsis overflow

This is a very long label text that would normally wrap to many lines but demonstrates how clamping behavior works with different variants and line limits to show ellipsis overflow

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LabelClamped

```
<!-- data-clamp applies to any label size (small, base, large, xlarge, xxlarge) -->

<!-- Single line clamping with data attribute -->
<span class="label" data-clamp="1">
  This text will be clamped to one line
</span>

<!-- Two line clamping -->
<span class="label" data-clamp="2">
  This text will be clamped to exactly two lines with ellipsis
</span>
```

### Responsive Features

Label components support all three responsive systems: size-based, orientation-based, and bit-depth variants. This enables precise control over label appearance across different device configurations.

#### Breakpoint Prefixes

Use breakpoint prefixes like `sm:`, `md:`, `lg:` to apply different sizes and styles per device size class.

Responsive LabelSmall by default, xlarge on lg screens

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LabelResponsive

```
<!-- Small by default, xlarge on lg screens -->
<span class="label label--small lg:label--xlarge">
  Responsive Label
</span>

<!-- Caption describing the responsive behavior (optional) -->
<span class="label label--small">Small by default, xlarge on lg screens</span>

<!-- Using base modifier to reset to default size at breakpoint -->
<span class="label label--small md:label--base">
  Small by default, base on medium+ screens
</span>

<!-- Progressive size scaling -->
<span class="label label--small sm:label--base md:label--large lg:label--xlarge">
  Progressive Label Sizing
</span>
```

#### Orientation and Size+Orientation

Label sizes can adapt to orientation with `portrait:` and can be combined with size breakpoints (e.g., `md:portrait:`).

Orientation VariantLarge by default, small in portrait.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LabelOrientation

```
<!-- Large by default, small in portrait -->
<span class="label label--large portrait:label--small">Orientation Variant</span>

<!-- Caption describing the responsive behavior (optional) -->
<span class="label label--small">Large by default, small in portrait.</span>
```

#### Bit-Depth Responsive

Use bit-depth prefixes like `1bit:`, `2bit:`, and `4bit:` to optimize label appearance for different display color capabilities.

Display OptimizedFilled (1bit) → Outline (2bit) → Underline (4bit)

Selective StylingOutline (1bit) → Gray (4bit)

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LabelBit-Depth Responsive

```
<!-- Different styles for different bit-depth displays -->
<span class="label 1bit:label--filled 2bit:label--outline 4bit:label--underline">
  Display Optimized
</span>

<!-- Selective bit-depth targeting -->
<span class="label 1bit:label--outline 4bit:label--gray">
  Selective Styling
</span>
```

#### Combined Responsive Features

Combine multiple responsive systems for highly targeted label styling. Use size, orientation, and bit-depth modifiers together following the pattern: `size:orientation:bit-depth:utility`.

Advanced TargetingComplex responsive combinations

Multi-ConditionMultiple responsive conditions

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LabelCombined Responsive

```
<!-- Highly targeted responsive combinations -->
<span class="label md:portrait:2bit:label--filled lg:4bit:label--outline">
  Advanced Targeting
</span>

<!-- Multiple responsive conditions -->
<span class="label sm:1bit:label--underline md:portrait:label--outline lg:4bit:label--gray">
  Multi-Condition
</span>
```

### Backward Compatibility

The gray-out label variant has been renamed from `label--gray-out` to `label--gray`. The legacy class name still works and maps to the same bit-depth responsive styling. Prefer the new name going forward.

The inverted label has been renamed to `label--filled` (black background). Use `label--primary`, `label--success`, etc. for semantic colors. `label--inverted` remains as an alias for `label--filled`.

```
<!-- Deprecated (but still works) -->
<span class="label label--gray-out">Gray label (deprecated)</span>
<span class="label label--inverted">Inverted (alias)</span>

<!-- Preferred (new naming) -->
<span class="label label--gray">Gray label (preferred)</span>
<span class="label label--filled">Filled label (preferred)</span>
```

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
| `--label-font-family` | "NicoClean" | "NicoClean" | #{meta.inspect($family)} | - |
| `--label-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | - |
| `--label-font-smoothing` | none | none | auto | - |
| `--label-font-weight` | 400 | 400 | clamp(100, calc(500 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--label-line-height` | 1.25 | 1.25 | 1.25 | - |
| Small |
| `--label-small-font-family` | "NicoPups" | "NicoPups" | #{meta.inspect($family)} | - |
| `--label-small-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(13px \* var(--text-ui-scale)) | - |
| `--label-small-font-smoothing` | none | none | auto | - |
| `--label-small-font-weight` | 400 | 400 | clamp(100, calc(500 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--label-small-line-height` | 1 | 1 | 1 | - |
| Large |
| `--label-large-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--label-large-font-size` | calc(21px \* var(--text-ui-scale)) | - | calc(21px \* var(--text-ui-scale)) | - |
| `--label-large-font-smoothing` | auto | - | auto | - |
| `--label-large-font-weight` | 500 | - | clamp(100, calc(500 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--label-large-line-height` | 1.2 | - | 1.2 | - |
| Xlarge |
| `--label-xlarge-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--label-xlarge-font-size` | calc(26px \* var(--text-ui-scale)) | - | calc(26px \* var(--text-ui-scale)) | - |
| `--label-xlarge-font-smoothing` | auto | - | auto | - |
| `--label-xlarge-font-weight` | 475 | - | clamp(100, calc(475 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--label-xlarge-line-height` | 1.2 | - | 1.2 | - |
| Xxlarge |
| `--label-xxlarge-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--label-xxlarge-font-size` | calc(30px \* var(--text-ui-scale)) | - | calc(30px \* var(--text-ui-scale)) | - |
| `--label-xxlarge-font-smoothing` | auto | - | auto | - |
| `--label-xxlarge-font-weight` | 450 | - | clamp(100, calc(450 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--label-xxlarge-line-height` | 1.2 | - | 1.2 | - |

 Previous  [ 

## Value

Display data values with consistent formatting

 ](/framework/docs/3.1/value)

 Next  [ 

## Description

Format descriptive text with standardized styles

 ](/framework/docs/3.1/description)

