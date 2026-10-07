# Title

The Title system provides consistent text headings with different size variants. It helps maintain visual hierarchy and readability throughout the interface.

### Base Structure

The Title system offers two primary variations: default and small. These base structures form the foundation for content headings.

#### Default Title

The `title` class creates a standard-sized heading. This is the most common usage for primary content headers.

Default Title

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TitleDefault

```
<span class="title">Default Title</span>
```

#### Small Title

Add `title--small` to create a more compact heading. Useful for secondary headers or where space is limited.

Small Title

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TitleSmall

```
<span class="title title--small">Small Title</span>
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

## Text

Control text color, alignment and formatting

 ](/framework/docs/1.2/text)

 Next  [ 

## Value

Display data values with consistent formatting

 ](/framework/docs/1.2/value)

