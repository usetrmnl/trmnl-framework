# V3.4 Upgrade Guide

Framework 3.4 is fully backward compatible with 3.0 through 3.3. Existing class names render unchanged, and every new feature (themes, the paint API, adaptive charts, maps, and icons) is opt-in. This guide lists the few things worth reviewing when you upgrade.

### From Framework 3.0 or 3.1

Your plugin looks the same until you opt into new features. Two things are worth reviewing.

- **Numbered border levels are deprecated:** `border--h-1` through `border--h-7` (and vertical counterparts) still render, but will be removed in Framework 4.0. Prefer the shade steps (`border--h-10` to `border--h-75`) in new markup. See [Border](/framework/docs/3.4/border) .
- **Themed screens ignore dark mode:** if you add a `screen--theme-<id>` class, `screen--dark-mode` no longer applies. A theme already decides every color. See [Themes](/framework/docs/3.4/themes) .

### From Framework v2

v3 is backward compatible with v2: your class names still render. One visual change needs review. v3 rebuilt the 1-bit grayscale dither patterns on a 14-step linear scale, so most shade names look lighter or darker than they did in v2.

The full shade-by-shade migration table lives in the [Framework 3.1 upgrade guide](/framework/docs/3.1/v3_upgrade_guide). It lists each shade's v2 and v3 lightness and which v3 shade restores the original look.

### Verifying the Upgrade

Use the Raw / Preview toggle in the screen picker (top right) to compare the raw colors against what the panel will actually show. To check themes, pick a Style in the same picker and confirm your plugin stays legible under each one.

### Next Steps

Head to the [V3.4 Enhancement Guide](/framework/docs/3.4/v3_enhancement_guide) to make your plugin theme-ready and to adopt adaptive charts and icons.

 Previous  [ 

## V3.4 Overview

What's new in Framework 3.4: custom theme fonts and complete card borders

 ](/framework/docs/3.4/v3_overview)

 Next  [ 

## V3.4 Enhancement Guide

Make your plugin theme-ready and adopt adaptive charts, icons, and JS paint

 ](/framework/docs/3.4/v3_enhancement_guide)

