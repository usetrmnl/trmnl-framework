# V3 Overview

Framework v3 introduces a complete color system for ePaper devices. The framework now supports chromatic palettes, semantic color roles, and an extended grayscale scale, while shifting its internal architecture to CSS custom properties for cleaner, smaller stylesheets. Existing markup continues to work without changes.

### Most Important Upgrades

- **Color support:** v3 adds a complete color system with chromatic palettes, semantic color roles, and automatic adaptation to each device's supported palette and bit-depth.
- **Architecture overhaul:** the framework moves from a rules-based selector system to CSS custom properties, greatly reducing combinatorial mode rules while keeping existing class names stable.
- **High-density support:** framework rendering now supports high-density `1bit` and `2bit` output modes.
- **Expanded 1bit grayscale:** the usable `1bit` grayscale palette increases from 7 shades to 14.
- **Raw / Preview simulation:** Device Preview can compare full-bright tokens (Raw) against panel-accurate output that simulates true colors and white point.
- **Text Scale:** [Text Scale](/framework/docs/3.1/text_scale) adjusts every framework font size and pixel line height without applying the same factor to interface geometry or text strokes.
- **Fluid Mashups:** [Mashup](/framework/docs/3.1/mashup) adds a three by three grid with column, row, and span modifiers for custom tilings.

### What's New

- **Chromatic utilities:** `bg--red`, `bg--blue-40`, `text--green-60` and similar classes for all 10 hues and 14 steps.
- **Semantic colors:** `bg--primary`, `text--success`, `label--error`, `bg--warning` - intent-based styling that maps to underlying hues.
- **Colors reference:** new [Colors](/framework/docs/3.1/colors) page documenting the full grayscale, chromatic, and semantic palette.
- **Label color variants:** [Label](/framework/docs/3.1/label) gains `label--primary`, `label--success`, `label--error`, and `label--warning` for colored badges.
- **Closest-hue mapping:** when a selected device cannot render a requested color directly, framework tokens map to the nearest supported hue automatically.
- **Color pattern images:** auto-generated dither patterns for limited-palette devices in `public/images/color-*/`.

### What's Enhanced

- **Background utility:** [Background](/framework/docs/3.1/background) refactored to reference CSS custom properties. Now supports grayscale, chromatic, and semantic tokens in a single class, including high-density `1bit` and `2bit` rendering modes.
- **Text utility:** [Text](/framework/docs/3.1/text_color) follows the same CSS variable pattern, supporting chromatic and semantic text colors alongside grayscale.
- **Border and Outline:** [Border](/framework/docs/3.1/border) and [Outline](/framework/docs/3.1/outline) use shared mixins for DRY, consistent rendering across bit-depths and color palettes, including high-density `1bit` and `2bit` modes.
- **Dark mode:** grayscale tokens invert automatically; chromatic hues stay stable while their lightness steps mirror (light to dark).
- **Progress component:** [Progress](/framework/docs/3.1/progress) updated to render with color palette awareness.

### What's Changed

- **Grayscale scale:** the primary naming convention is now `gray-10` through `gray-75` (14 steps of 5). In `1bit`, the usable grayscale palette expands from 7 shades to 14. The legacy names `gray-1` through `gray-7` remain functional but are deprecated.
- **Rendering model:** mode-dependent styling (bit-depth, dark mode, palette) is driven by CSS custom properties on `.screen` rather than combinatorial selector rules. This is an internal change - existing class names are unaffected.
- **Default font bundle:** Framework 3.1 uses the TRMNL bundle from [Font Family](/framework/docs/3.1/font_family) by default on low-density displays. Add `screen--fonts-classic` to keep the 3.0 Classic typography.

### Start Here

- Upgrading from v2? → [V3 Upgrade Guide](/framework/docs/3.1/v3_upgrade_guide) .
- Looking to use colors and the new palette system? → [V3 Enhancement Guide](/framework/docs/3.1/v3_enhancement_guide) .
- New to the framework? Start with the [Colors](/framework/docs/3.1/colors) reference page.

 Next  [ 

## V3 Upgrade Guide

Steps to upgrade your plugins from Framework v2 to v3

 ](/framework/docs/3.1/v3_upgrade_guide)

