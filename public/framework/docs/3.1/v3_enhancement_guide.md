# V3 Enhancement Guide

Framework v3 opens up the full color spectrum for ePaper plugins. This guide walks through the key enhancements you can adopt, from chromatic backgrounds and text to semantic labels and the extended grayscale.

### 1. Use Chromatic Colors

The framework now provides 10 hues, each with 14 lightness steps. Apply them with the same `bg--` and `text--` prefixes you already know.

- **Base hue:** `bg--red`, `text--blue` - the pure, full-saturation color. 
- **Hue + step:** `bg--red-40`, `text--green-60` - lighter or darker variants using steps 10 (darkest) through 75 (lightest). 
- **Available hues:** red, orange, yellow, lime, green, cyan, blue, violet, purple, pink. 

On grayscale devices, chromatic tokens automatically fall back to perceptually equivalent gray shades. On limited-color panels, unavailable colors map to the closest supported hue automatically, so no conditional markup is needed. See the full palette on the [Colors](/framework/docs/3.1/colors) page.

### 2. Apply Semantic Colors

Semantic roles let you style by intent rather than specific hue. The framework maps each role to an underlying color token that can be themed via CSS variables.

- `bg--primary` / `text--primary` - blue (highlights, accents)
- `bg--success` / `text--success` - green (confirmations, positive states)
- `bg--error` / `text--error` - red (errors, critical states)
- `bg--warning` / `text--warning` - orange (cautions, alerts)

Semantic tokens inherit all device and bit-depth behavior. To override the default mapping, set `--color-primary`, `--color-success`, etc. in your custom CSS.

### 3. Use Label Color Variants

The [Label](/framework/docs/3.1/label) element now supports semantic color variants for colored badges and status indicators.

- `label--primary` - blue label for key information
- `label--success` - green label for positive states
- `label--error` - red label for errors or alerts
- `label--warning` - orange label for cautions

The default filled label (`label--filled`) continues to use black (the darkest shade). The new color variants use semantic color backgrounds while adapting to the current device palette.

### 4. Leverage the Extended Grayscale

The extended scale doubles the available gray shades from 7 to 14, giving you finer control over tonal variation in your layouts. In `1bit` mode, the usable grayscale palette now expands from 7 shades to 14.

- **Old scale:** `gray-1` through `gray-7` (still works, deprecated)
- **New scale:** `gray-10`, `gray-15`, `gray-20`, …, `gray-75`

Intermediate steps like `gray-15`, `gray-25`, and `gray-35` let you create subtler contrasts and more nuanced visual hierarchies, especially on 2-bit and 4-bit displays.

### 5. Use the Raw / Preview Toggle

The device picker now includes a Raw / Preview switch that lets you compare how colors render across different modes.

- **Raw:** shows the full-bright token values, useful for verifying your color choices.
- **Preview:** shows panel-accurate simulation, including device true-color behavior and lowered white points on displays like TRMNL BWRY, so you can see what end users actually see on hardware.

### 6. Target High-Density 1bit / 2bit Rendering

Core utilities now render consistently on high-density ePaper modes. Use the same classes and let the framework adapt to panel capabilities.

- **Background utility:** [Background](/framework/docs/3.1/background) supports high-density `1bit` and `2bit` output in addition to broader color-capable modes.
- **Border utility:** [Border](/framework/docs/3.1/border) supports the same high-density `1bit` and `2bit` rendering behavior for consistent edge contrast.

 Previous  [ 

## V3 Upgrade Guide

Steps to upgrade your plugins from Framework v2 to v3

 ](/framework/docs/3.1/v3_upgrade_guide)

 Next  [ 

## TRMNL X Guide

Framework changes for TRMNL X compatibility

 ](/framework/docs/3.1/trmnl_x_guide)

