# Title Bar

The Title Bar component provides a consistent header for terminal-like interfaces, displaying application information such as icons, titles, and instance details.

### Base Structure

The Title Bar consists of three main elements: an icon, a title, and an optional instance label. These elements are arranged horizontally and automatically spaced.

#### Basic Title Bar

The basic Title Bar includes an icon and title. Use the `title_bar` class for the container.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Basic Title Bar

```
<div class="title_bar">
  <img class="image" src="/images/plugins/trmnl--render.svg">
  <span class="title">Basic Title Bar</span>
</div>
```

#### Title Bar with Instance

Add an instance label using the `instance` class to display additional context.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Title Bar with InstanceProduction

```
<div class="title_bar">
  <img class="image" src="/images/plugins/trmnl--render.svg">
  <span class="title">Title Bar with Instance</span>
  <span class="instance">Production</span>
</div>
```

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
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

 Previous  [ 

## Layout

Primary container for organizing plugin content

 ](/framework/docs/1.2/layout)

 Next  [ 

## Columns

Implement zero-config column layouts for content organization

 ](/framework/docs/1.2/columns)

