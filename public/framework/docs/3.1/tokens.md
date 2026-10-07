# Tokens

The Tokens reference lists every Framework CSS variable from `_variables_root.scss` and display overrides in `_variables_overrides.scss`. Use it to understand defaults, 2-bit visual/layout behavior, high-density typography, and 4-bit-and-up scaling.

### How To Read This Table

Each row is a CSS custom property token. `Root` comes from `_variables_root.scss`. `2-bit`, `density 2x`, and `4-bit and up` come from mixins in `_variables_overrides.scss`.

### Palette

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Semantic |
| `--black` | #000000 | - | - | - |
| `--color-error` | var(--red) | - | - | - |
| `--color-primary` | var(--blue) | - | - | - |
| `--color-success` | var(--green) | - | - | - |
| `--color-warning` | var(--orange) | - | - | - |
| `--white` | #FFFFFF | - | - | - |
| Grayscale |
| `--gray-10` | #111111 | - | - | - |
| `--gray-15` | #222222 | - | - | - |
| `--gray-20` | #333333 | - | - | - |
| `--gray-25` | #444444 | - | - | - |
| `--gray-30` | #555555 | - | - | - |
| `--gray-35` | #666666 | - | - | - |
| `--gray-40` | #777777 | - | - | - |
| `--gray-45` | #888888 | - | - | - |
| `--gray-50` | #999999 | - | - | - |
| `--gray-55` | #AAAAAA | - | - | - |
| `--gray-60` | #BBBBBB | - | - | - |
| `--gray-65` | #CCCCCC | - | - | - |
| `--gray-70` | #DDDDDD | - | - | - |
| `--gray-75` | #EEEEEE | - | - | - |
| Legacy Grayscale |
| `--gray-1` | #111111 | - | - | - |
| `--gray-2` | #333333 | - | - | - |
| `--gray-3` | #555555 | - | - | - |
| `--gray-4` | #777777 | - | - | - |
| `--gray-5` | #999999 | - | - | - |
| `--gray-6` | #BBBBBB | - | - | - |
| `--gray-7` | #DDDDDD | - | - | - |

### Scaling

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| `--content-scale` | 1 | - | - | - |
| `--device-ui-scale` | 1 | - | - | - |
| `--modifier-scale` | 1 | - | - | - |
| `--modifier-text-scale` | 1 | - | - | - |
| `--text-ui-scale` | 1 | - | - | - |
| `--ui-scale` | 1 | - | - | - |

### Description

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

### Other

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| `--font-base-font-family` | "NicoClean" | "NicoClean" | #{meta.inspect($family)} | - |
| `--font-base-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | - |
| `--font-base-font-smoothing` | none | none | auto | - |
| `--font-base-line-height` | 1.25 | 1.25 | calc(22px \* var(--text-ui-scale)) | - |
| `--font-giga-font-family` | "Inter Variable", Inter | - | - | - |
| `--font-giga-font-size` | calc(96px \* var(--text-ui-scale)) | - | - | - |
| `--font-giga-font-smoothing` | auto | - | - | - |
| `--font-giga-line-height` | calc(108px \* var(--text-ui-scale)) | - | - | - |
| `--font-large-font-family` | "BlockKie" | "BlockKie" | #{meta.inspect($family)} | - |
| `--font-large-font-size` | calc(26px \* var(--text-ui-scale)) | calc(26px \* var(--text-ui-scale)) | calc(21px \* var(--text-ui-scale)) | - |
| `--font-large-font-smoothing` | none | none | auto | - |
| `--font-large-line-height` | 1 | 1 | 1.2 | - |
| `--font-mega-font-family` | "Inter Variable", Inter | - | - | - |
| `--font-mega-font-size` | calc(74px \* var(--text-ui-scale)) | - | - | - |
| `--font-mega-font-smoothing` | auto | - | - | - |
| `--font-mega-line-height` | calc(86px \* var(--text-ui-scale)) | - | - | - |
| `--font-peta-font-family` | "Inter Variable", Inter | - | - | - |
| `--font-peta-font-size` | calc(170px \* var(--text-ui-scale)) | - | - | - |
| `--font-peta-font-smoothing` | auto | - | - | - |
| `--font-peta-line-height` | calc(180px \* var(--text-ui-scale)) | - | - | - |
| `--font-small-font-family` | "NicoPups" | "NicoPups" | #{meta.inspect($family)} | - |
| `--font-small-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(13px \* var(--text-ui-scale)) | - |
| `--font-small-font-smoothing` | none | none | auto | - |
| `--font-small-line-height` | 1 | 1 | calc(18px \* var(--text-ui-scale)) | - |
| `--font-tera-font-family` | "Inter Variable", Inter | - | - | - |
| `--font-tera-font-size` | calc(128px \* var(--text-ui-scale)) | - | - | - |
| `--font-tera-font-smoothing` | auto | - | - | - |
| `--font-tera-line-height` | calc(128px \* var(--text-ui-scale)) | - | - | - |
| `--font-xlarge-font-family` | "Inter Variable", Inter | - | - | - |
| `--font-xlarge-font-size` | calc(26px \* var(--text-ui-scale)) | - | - | - |
| `--font-xlarge-font-smoothing` | auto | - | - | - |
| `--font-xlarge-line-height` | calc(29px \* var(--text-ui-scale)) | - | - | - |
| `--font-xxlarge-font-family` | "Inter Variable", Inter | - | - | - |
| `--font-xxlarge-font-size` | calc(38px \* var(--text-ui-scale)) | - | - | - |
| `--font-xxlarge-font-smoothing` | auto | - | - | - |
| `--font-xxlarge-line-height` | calc(42px \* var(--text-ui-scale)) | - | - | - |
| `--font-xxxlarge-font-family` | "Inter Variable", Inter | - | - | - |
| `--font-xxxlarge-font-size` | calc(58px \* var(--text-ui-scale)) | - | - | - |
| `--font-xxxlarge-font-smoothing` | auto | - | - | - |
| `--font-xxxlarge-line-height` | calc(70px \* var(--text-ui-scale)) | - | - | - |

### Layout

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| `--full-h` | calc(var(--screen-h) - var(--gap) \* 2) | - | - | - |
| `--full-w` | calc(var(--screen-w) - var(--gap) \* 2) | - | - | - |
| `--half_horizontal-h` | calc((var(--screen-h) - var(--gap) \* 2) / 2 - var(--gap) / 2) | - | - | - |
| `--half_horizontal-w` | calc((var(--screen-w) - var(--gap) \* 2)) | - | - | - |
| `--half_vertical-h` | calc((var(--screen-h) - var(--gap) \* 2)) | - | - | - |
| `--half_vertical-w` | calc((var(--screen-w) - var(--gap) \* 2) / 2 - var(--gap) / 2) | - | - | - |
| `--quadrant-h` | calc((var(--screen-h) - var(--gap) \* 2) / 2 - var(--gap) / 2) | - | - | - |
| `--quadrant-w` | calc((var(--screen-w) - var(--gap) \* 2) / 2 - var(--gap) / 2) | - | - | - |
| `--screen-h` | 480px | - | - | - |
| `--screen-h-original` | 480px | - | - | - |
| `--screen-w` | 800px | - | - | - |
| `--screen-w-original` | 800px | - | - | - |

### Spacing

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| `--gap` | 10px | - | - | - |
| `--gap-large` | 20px | - | - | - |
| `--gap-medium` | 16px | - | - | - |
| `--gap-scale` | 1 | - | - | - |
| `--gap-small` | 7px | - | - | - |
| `--gap-xlarge` | 30px | - | - | - |
| `--gap-xsmall` | 5px | - | - | - |
| `--gap-xxlarge` | 40px | - | - | - |
| `--list-gap-small` | 8px | - | - | - |

### Item

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
| `--item-index-font-family` | "NicoPups" | "NicoPups" | #{meta.inspect($family)} | - |
| `--item-index-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(13px \* var(--text-ui-scale)) | - |
| `--item-index-font-smoothing` | none | none | auto | - |
| `--item-index-font-weight` | 400 | 400 | clamp(100, calc(600 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--item-index-line-height` | 1 | 1 | 1 | - |
| `--item-meta-width` | calc(10px \* var(--ui-scale)) | calc(10px \* var(--ui-scale)) | - | calc(10px \* var(--ui-scale)) |

### Label

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

### Progress

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
| `--progress-bar-height` | calc(24px \* var(--ui-scale)) | - | - | - |
| `--progress-bar-height-large` | calc(32px \* var(--ui-scale)) | - | - | - |
| `--progress-bar-height-small` | calc(12px \* var(--ui-scale)) | - | - | - |
| `--progress-bar-height-xsmall` | calc(6px \* var(--ui-scale)) | - | - | - |
| `--progress-bar-radius` | calc(10px \* var(--ui-scale)) | calc(10px \* var(--ui-scale) \* var(--framework-layout-corner-factor, 1)) | - | calc(10px \* var(--ui-scale) \* var(--framework-layout-corner-factor, 1)) |
| `--progress-dot-size` | calc(16px \* var(--ui-scale)) | - | - | - |
| `--progress-dot-size-large` | calc(20px \* var(--ui-scale)) | - | - | - |
| `--progress-dot-size-small` | calc(12px \* var(--ui-scale)) | - | - | - |
| `--progress-dot-size-xsmall` | calc(8px \* var(--ui-scale)) | - | - | - |

### Rich Text

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
| `--richtext-content-max-width` | calc(640px \* var(--ui-scale)) | - | - | - |
| `--richtext-font-family` | "NicoClean" | "NicoClean" | #{meta.inspect($family)} | - |
| `--richtext-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | - |
| `--richtext-font-smoothing` | none | none | auto | - |
| `--richtext-font-weight` | 400 | 400 | clamp(100, calc(500 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--richtext-line-height` | calc(22px \* var(--text-ui-scale)) | calc(22px \* var(--text-ui-scale)) | calc(22px \* var(--text-ui-scale)) | - |
| Small |
| `--richtext-small-font-family` | "NicoPups" | "NicoPups" | #{meta.inspect($family)} | - |
| `--richtext-small-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(13px \* var(--text-ui-scale)) | - |
| `--richtext-small-font-smoothing` | none | none | auto | - |
| `--richtext-small-font-weight` | 400 | 400 | clamp(100, calc(500 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--richtext-small-line-height` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(18px \* var(--text-ui-scale)) | - |
| Large |
| `--richtext-large-font-family` | "BlockKie" | "BlockKie" | #{meta.inspect($family)} | - |
| `--richtext-large-font-size` | calc(26px \* var(--text-ui-scale)) | calc(26px \* var(--text-ui-scale)) | calc(21px \* var(--text-ui-scale)) | - |
| `--richtext-large-font-smoothing` | none | none | auto | - |
| `--richtext-large-font-weight` | 400 | 400 | clamp(100, calc(500 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--richtext-large-line-height` | 1 | 1 | 1.2 | - |
| Xlarge |
| `--richtext-xlarge-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--richtext-xlarge-font-size` | calc(30px \* var(--text-ui-scale)) | - | calc(30px \* var(--text-ui-scale)) | - |
| `--richtext-xlarge-font-smoothing` | auto | - | auto | - |
| `--richtext-xlarge-font-weight` | 425 | - | clamp(100, calc(425 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--richtext-xlarge-line-height` | 1.2 | - | 1.2 | - |
| Xxlarge |
| `--richtext-xxlarge-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--richtext-xxlarge-font-size` | calc(35px \* var(--text-ui-scale)) | - | calc(35px \* var(--text-ui-scale)) | - |
| `--richtext-xxlarge-font-smoothing` | auto | - | auto | - |
| `--richtext-xxlarge-font-weight` | 400 | - | clamp(100, calc(400 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--richtext-xxlarge-line-height` | 1.2 | - | 1.2 | - |
| Xxxlarge |
| `--richtext-xxxlarge-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--richtext-xxxlarge-font-size` | calc(40px \* var(--text-ui-scale)) | - | calc(40px \* var(--text-ui-scale)) | - |
| `--richtext-xxxlarge-font-smoothing` | auto | - | auto | - |
| `--richtext-xxxlarge-font-weight` | 375 | - | clamp(100, calc(375 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--richtext-xxxlarge-line-height` | 1.2 | - | 1.2 | - |

### Rounded

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| `--rounded` | 10px | - | - | - |
| `--rounded-full` | 9999px | - | - | - |
| `--rounded-large` | 20px | - | - | - |
| `--rounded-medium` | 15px | - | - | - |
| `--rounded-none` | 0px | - | - | - |
| `--rounded-small` | 7px | - | - | - |
| `--rounded-xlarge` | 25px | - | - | - |
| `--rounded-xsmall` | 5px | - | - | - |
| `--rounded-xxlarge` | 30px | - | - | - |

### Table

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
| `--table-tbody-height` | calc(46px \* var(--ui-scale)) | - | - | - |
| `--table-thead-height` | calc(36px \* var(--ui-scale)) | - | - | - |
| Xsmall |
| `--table-xsmall-tbody-height` | calc(22px \* var(--ui-scale)) | - | - | - |
| `--table-xsmall-thead-height` | calc(18px \* var(--ui-scale)) | - | - | - |
| Small |
| `--table-small-tbody-height` | calc(31px \* var(--ui-scale)) | - | - | - |
| `--table-small-thead-height` | calc(24px \* var(--ui-scale)) | - | - | - |
| Large |
| `--table-large-tbody-height` | calc(56px \* var(--ui-scale)) | - | - | - |
| `--table-large-thead-height` | calc(44px \* var(--ui-scale)) | - | - | - |
| Xlarge |
| `--table-xlarge-tbody-height` | calc(72px \* var(--ui-scale)) | - | - | - |
| `--table-xlarge-thead-height` | calc(56px \* var(--ui-scale)) | - | - | - |

### Title Bar

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
| `--title-bar-border-radius` | calc(10px \* var(--ui-scale)) | calc(10px \* var(--ui-scale) \* var(--framework-layout-corner-factor, 1)) | - | calc(10px \* var(--ui-scale) \* var(--framework-layout-corner-factor, 1)) |
| `--title-bar-font-family` | "NicoClean" | "NicoClean" | #{meta.inspect($family)} | - |
| `--title-bar-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | - |
| `--title-bar-font-smoothing` | none | none | auto | - |
| `--title-bar-font-weight` | 400 | 400 | clamp(100, calc(700 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--title-bar-height` | calc(40px \* var(--ui-scale)) | calc(40px \* var(--ui-scale) \* var(--framework-layout-title-bar-height-factor, 1)) | - | calc(40px \* var(--ui-scale) \* var(--framework-layout-title-bar-height-factor, 1)) |
| `--title-bar-image-height` | calc(28px \* var(--ui-scale)) | calc(28px \* var(--ui-scale) \* var(--framework-layout-title-bar-height-factor, 1)) | - | calc(28px \* var(--ui-scale) \* var(--framework-layout-title-bar-height-factor, 1)) |
| `--title-bar-line-height` | 1 | 1 | calc(22px \* var(--text-ui-scale)) | - |
| `--title-bar-padding-top` | calc(5px \* var(--ui-scale)) | calc(5px \* var(--ui-scale)) | 0px | 0px |
| `--title-bar-text-stroke-width` | calc(3.5px \* var(--ui-scale)) | calc(3.5px \* var(--ui-scale)) | calc(2px \* var(--ui-scale)) | calc(2px \* var(--ui-scale)) |
| Small |
| `--title-bar-small-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | - |
| `--title-bar-small-height` | calc(32px \* var(--ui-scale)) | calc(32px \* var(--ui-scale) \* var(--framework-layout-title-bar-height-factor, 1)) | - | calc(32px \* var(--ui-scale) \* var(--framework-layout-title-bar-height-factor, 1)) |
| `--title-bar-small-image-height` | calc(24px \* var(--ui-scale)) | calc(24px \* var(--ui-scale) \* var(--framework-layout-title-bar-height-factor, 1)) | - | calc(24px \* var(--ui-scale) \* var(--framework-layout-title-bar-height-factor, 1)) |

### Title

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

### Value

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
| `--value-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--value-font-size` | calc(38px \* var(--text-ui-scale)) | - | calc(38px \* var(--text-ui-scale)) | - |
| `--value-font-smoothing` | auto | - | auto | - |
| `--value-font-weight` | 450 | - | clamp(100, calc(450 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-line-height` | calc(42px \* var(--text-ui-scale)) | - | calc(42px \* var(--text-ui-scale)) | - |
| Xxsmall |
| `--value-xxsmall-font-family` | "NicoClean" | "NicoClean" | #{meta.inspect($family)} | - |
| `--value-xxsmall-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | - |
| `--value-xxsmall-font-smoothing` | none | none | auto | - |
| `--value-xxsmall-font-weight` | 400 | 400 | clamp(100, calc(700 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-xxsmall-line-height` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(14px \* var(--text-ui-scale)) | - |
| Xsmall |
| `--value-xsmall-font-size` | calc(20px \* var(--text-ui-scale)) | - | calc(20px \* var(--text-ui-scale)) | - |
| `--value-xsmall-font-weight` | 600 | - | clamp(100, calc(600 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-xsmall-line-height` | calc(24px \* var(--text-ui-scale)) | - | calc(24px \* var(--text-ui-scale)) | - |
| Small |
| `--value-small-font-size` | calc(26px \* var(--text-ui-scale)) | - | calc(26px \* var(--text-ui-scale)) | - |
| `--value-small-font-weight` | 500 | - | clamp(100, calc(475 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-small-line-height` | calc(29px \* var(--text-ui-scale)) | - | calc(29px \* var(--text-ui-scale)) | - |
| Large |
| `--value-large-font-size` | calc(58px \* var(--text-ui-scale)) | - | calc(58px \* var(--text-ui-scale)) | - |
| `--value-large-font-weight` | 400 | - | clamp(100, calc(400 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-large-line-height` | calc(70px \* var(--text-ui-scale)) | - | calc(70px \* var(--text-ui-scale)) | - |
| Xlarge |
| `--value-xlarge-font-size` | calc(74px \* var(--text-ui-scale)) | - | calc(74px \* var(--text-ui-scale)) | - |
| `--value-xlarge-font-weight` | 375 | - | clamp(100, calc(375 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-xlarge-line-height` | calc(86px \* var(--text-ui-scale)) | - | calc(86px \* var(--text-ui-scale)) | - |
| Xxlarge |
| `--value-xxlarge-font-size` | calc(96px \* var(--text-ui-scale)) | - | calc(96px \* var(--text-ui-scale)) | - |
| `--value-xxlarge-font-weight` | 350 | - | clamp(100, calc(350 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-xxlarge-line-height` | calc(108px \* var(--text-ui-scale)) | - | calc(108px \* var(--text-ui-scale)) | - |
| Xxxlarge |
| `--value-xxxlarge-font-size` | calc(128px \* var(--text-ui-scale)) | - | calc(128px \* var(--text-ui-scale)) | - |
| `--value-xxxlarge-font-weight` | 300 | - | clamp(100, calc(300 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-xxxlarge-line-height` | calc(128px \* var(--text-ui-scale)) | - | calc(128px \* var(--text-ui-scale)) | - |
| Mega |
| `--value-mega-font-size` | calc(170px \* var(--text-ui-scale)) | - | calc(170px \* var(--text-ui-scale)) | - |
| `--value-mega-font-weight` | 275 | - | clamp(100, calc(275 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-mega-line-height` | calc(180px \* var(--text-ui-scale)) | - | calc(180px \* var(--text-ui-scale)) | - |
| Giga |
| `--value-giga-font-size` | calc(220px \* var(--text-ui-scale)) | - | calc(220px \* var(--text-ui-scale)) | - |
| `--value-giga-font-weight` | 250 | - | clamp(100, calc(250 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-giga-line-height` | calc(230px \* var(--text-ui-scale)) | - | calc(230px \* var(--text-ui-scale)) | - |
| Tera |
| `--value-tera-font-size` | calc(290px \* var(--text-ui-scale)) | - | calc(290px \* var(--text-ui-scale)) | - |
| `--value-tera-font-weight` | 225 | - | clamp(100, calc(225 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-tera-line-height` | calc(300px \* var(--text-ui-scale)) | - | calc(300px \* var(--text-ui-scale)) | - |
| Peta |
| `--value-peta-font-size` | calc(380px \* var(--text-ui-scale)) | - | calc(380px \* var(--text-ui-scale)) | - |
| `--value-peta-font-weight` | 200 | - | clamp(100, calc(200 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-peta-line-height` | calc(390px \* var(--text-ui-scale)) | - | calc(390px \* var(--text-ui-scale)) | - |

 Previous  [ 

## Colors

Complete palette definition: grayscale, chromatic hues, and semantic roles

 ](/framework/docs/3.1/colors)

 Next  [ 

## Inverse

Apply inverse framework colors to an element and its descendants

 ](/framework/docs/3.1/inverse)

