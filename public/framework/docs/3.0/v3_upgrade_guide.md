# V3 Upgrade Guide

Framework v3 is structurally backward-compatible with v2: your existing class names still compile and render. However, the `1bit` grayscale dither patterns have been rebuilt on a new linear scale, so most shade names now produce different lightness values than they did in v2. Review the migration table below to restore your original look or take advantage of the finer 14-step palette.

### 1-Bit Grayscale Dither Scale

In `1bit` mode, v3 replaces the 7-step non-linear dither scale (12×12&nbsp;px tiles) with a 14-step linear scale (16×16&nbsp;px tiles). Each step now increments by 6.25% white-pixel density. In v2 the 14 extended shade names were rendered in pairs: `gray-15` produced the same pattern as `gray-10`, `gray-25` the same as `gray-20`, and so on. In v3 every shade has its own distinct pattern, so nearly all shades now sit at **different lightness values** than they did in v2.

#### Lightness Shift

The table below shows the white-pixel density each shade produced in v2 `1bit` mode, what it now produces in v3, and which v3 shade to use to restore the original appearance.

| Class | v2 Lightness | v3 Lightness | Shift | Use Instead |
| --- | --- | --- | --- | --- |
| `gray-10` | 
6.25%

 | 
6.25%

 | — | — |
| `gray-15` | 
6.25%

 | 
12.5%

 | +6.25% | `gray-10` |
| `gray-20` | 
12.5%

 | 
18.75%

 | +6.25% | `gray-15` |
| `gray-25` | 
12.5%

 | 
25%

 | +12.5% | `gray-15` |
| `gray-30` | 
25%

 | 
31.25%

 | +6.25% | `gray-25` |
| `gray-35` | 
25%

 | 
37.5%

 | +12.5% | `gray-25` |
| `gray-40` | 
50%

 | 
43.75%

 | −6.25% | `gray-45` |
| `gray-45` | 
50%

 | 
56.25%

 | +6.25% | `gray-40` |
| `gray-50` | 
75%

 | 
62.5%

 | −12.5% | `gray-60` |
| `gray-55` | 
75%

 | 
68.75%

 | −6.25% | `gray-60` |
| `gray-60` | 
87.5%

 | 
75%

 | −12.5% | `gray-70` |
| `gray-65` | 
87.5%

 | 
81.25%

 | −6.25% | `gray-70` |
| `gray-70` | 
93.75%

 | 
87.5%

 | −6.25% | `gray-75` |
| `gray-75` | 
93.75%

 | 
93.75%

 | — | — |

To preserve your v2 look, switch to the shade listed in the “Use Instead” column. To adopt the new linear scale and take advantage of the finer 14-step palette, keep your current class names - they now each produce a unique dither pattern. See the [Colors](/framework/docs/3.0/colors) reference for the full scale.

### CSS Variable Architecture

Under the hood, utilities like [Background](/framework/docs/3.0/background) and [Text](/framework/docs/3.0/text_color) now reference CSS custom properties instead of containing per-mode selector rules.

This is an internal refactor. The class names you use in your markup (`bg--gray-50`, `text--black`, etc.) are unchanged. If you have custom CSS that directly targets framework internals (e.g., overriding `.screen--1bit .bg--gray-3` selectors), you may need to update those overrides to use the new CSS variable approach.

If you use only framework-provided class names, no action is needed. If you have custom CSS overriding framework internals, review the updated [Background](/framework/docs/3.0/background) and [Text](/framework/docs/3.0/text_color) pages for the new variable-based approach.

### Background and Border Rendering Modes

Utility class names are unchanged, but rendering support is broader in v3. Both [Background](/framework/docs/3.0/background) and [Border](/framework/docs/3.0/border) now support high-density `1bit` and `2bit` output modes without markup changes.

### Color Palette on Grayscale Devices

If you adopt the new chromatic color classes (e.g., `bg--red`, `text--blue-40`) in your plugin, they automatically adapt by device capability. On grayscale hardware, colors fall back to perceptually equivalent gray values; on limited-color hardware, unavailable colors map to the closest supported hue. No conditional logic is needed. The framework handles this mapping via perceptual lightness (LAB L\*).

### Raw / Preview Verification

Use the Raw Colors / Preview Colors toggle in Device Preview while upgrading. Raw mode shows full-bright token values; Preview mode simulates panel-accurate output, including true-color behavior and device white point.

### Next Steps

Once you've reviewed the deprecation notes above, head to the [V3 Enhancement Guide](/framework/docs/3.0/v3_enhancement_guide) to learn how to use chromatic colors, semantic roles, and the new label variants in your plugins.

 Previous  [ 

## V3 Overview

What's new in Framework v3: color palette, semantic colors, extended grayscale, and CSS variable architecture

 ](/framework/docs/3.0/v3_overview)

 Next  [ 

## V3 Enhancement Guide

Use chromatic colors, semantic roles, and label variants in your plugins

 ](/framework/docs/3.0/v3_enhancement_guide)

