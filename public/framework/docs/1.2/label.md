# Label

The Label system provides various styles for displaying text labels, with options for different visual treatments and sizes. Labels can be used to highlight text, show status, or create visual hierarchy in your interface.

### Label Variants

Labels come in several variants to suit different use cases. Each variant provides a distinct visual style while maintaining consistent spacing and sizing.

#### Default Labels

The base label styles and their variants provide different ways to present text, from solid backgrounds to outlined and underlined versions.

LabelOutline LabelUnderline LabelGray Out LabelInverted Label

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LabelDefault

```
<span class="label">Label</span>
<span class="label label--outline">Outline Label</span>
<span class="label label--underline">Underline Label</span>
<span class="label label--gray-out">Gray Out Label</span>
<span class="label label--inverted">Inverted Label</span>
```

#### Small Labels

Add the `label--small` class to create a more compact version of any label variant.

LabelOutline LabelUnderline LabelGray Out LabelInverted Label

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LabelSmall

```
<span class="label label--small">Label</span>
<span class="label label--small label--outline">Outline Label</span>
<span class="label label--small label--underline">Underline Label</span>
<span class="label label--small label--gray-out">Gray Out Label</span>
<span class="label label--small label--inverted">Inverted Label</span>
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

 ](/framework/docs/1.2/value)

 Next  [ 

## Description

Format descriptive text with standardized styles

 ](/framework/docs/1.2/description)

