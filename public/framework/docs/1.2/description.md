# Description

The Description component provides a standardized way to display descriptive text content with consistent styling.

### Basic Usage

Use the `description` class to style your descriptive text.

This is a sample description text that demonstrates how the Description component renders content.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Description

```
<span class="description">This is a sample description text.</span>
```

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
| `--description-font-family` | "NicoPups" | "NicoPups" | #{meta.inspect($family)} | - |
| `--description-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(13px \* var(--text-ui-scale)) | - |
| `--description-font-smoothing` | none | none | auto | - |
| `--description-font-weight` | 400 | 400 | clamp(100, calc(400 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--description-line-height` | 1 | 1 | 1.2 | - |
| Large |
| `--description-large-font-family` | "NicoClean" | "NicoClean" | #{meta.inspect($family)} | - |
| `--description-large-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | - |
| `--description-large-font-smoothing` | none | none | auto | - |
| `--description-large-font-weight` | 400 | 400 | clamp(100, calc(700 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--description-large-line-height` | 1.25 | 1.25 | 1.2 | - |
| Xlarge |
| `--description-xlarge-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--description-xlarge-font-size` | calc(21px \* var(--text-ui-scale)) | - | calc(21px \* var(--text-ui-scale)) | - |
| `--description-xlarge-font-smoothing` | auto | - | auto | - |
| `--description-xlarge-font-weight` | 500 | - | clamp(100, calc(500 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--description-xlarge-line-height` | 1.2 | - | 1.2 | - |
| Xxlarge |
| `--description-xxlarge-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--description-xxlarge-font-size` | calc(24px \* var(--text-ui-scale)) | - | calc(24px \* var(--text-ui-scale)) | - |
| `--description-xxlarge-font-smoothing` | auto | - | auto | - |
| `--description-xxlarge-font-weight` | 475 | - | clamp(100, calc(475 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--description-xxlarge-line-height` | 1.2 | - | 1.2 | - |

 Previous  [ 

## Label

Create clear labels for unified content identification

 ](/framework/docs/1.2/label)

 Next  [ 

## Text Stroke

Legible text when displayed on shaded backgrounds

 ](/framework/docs/1.2/text_stroke)

