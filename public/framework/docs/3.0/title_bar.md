# Title Bar

A header strip for a View, holding an icon, a title, and an optional instance label. Place it as a sibling of the Layout, not inside it.

Place Title Bar as a sibling of Layout inside a View. Both `layout` and `title_bar` should be direct children of the view.

Don't nest Title Bar inside Layout. `title_bar` and `layout` must be siblings, not parent and child.

```
<!-- view view--full (platform-provided) -->
<div class="layout">...</div>
<div class="title_bar">...</div>
<!-- /view -->
```

```
<!-- view view--full (platform-provided) -->
<div class="layout">
  <div class="title_bar">...</div>
</div>
<!-- /view -->
```

### Base Structure

The Title Bar [Title Bar](/framework/docs/3.0/title_bar) consists of three main elements: an icon [Image](/framework/docs/3.0/image) , a title [Title](/framework/docs/3.0/title) , and an optional instance label [Label](/framework/docs/3.0/label) . These elements are arranged horizontally and automatically spaced.

#### Basic Title Bar

The basic Title Bar includes an icon and title. Use the `title_bar` class [Title Bar](/framework/docs/3.0/title_bar) for the container.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Basic Title Bar

```
<div class="title_bar">
  <img class="image image--adaptive" src="/images/plugins/trmnl--render.svg">
  <span class="title">Basic Title Bar</span>
</div>
```

#### Title Bar with Instance

Add an instance label using the `instance` class to display additional context.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Title Bar with InstanceProduction

```
<div class="title_bar">
  <img class="image image--adaptive" src="/images/plugins/trmnl--render.svg">
  <span class="title">Title Bar with Instance</span>
  <span class="instance">Production</span>
</div>
```

### Title Bar in Mashups

When the Title Bar is placed inside a [Mashup](/framework/docs/3.0/mashup) , it automatically receives different styling. Inside a view with a mashup layout (`view--half_vertical`, `view--half_horizontal`, or `view--quadrant`), the title bar uses a reduced height, a smaller icon, and no top or side border radius, with rounded bottom corners only so it aligns with the view's bordered outline.

#### Example

The same `title_bar` markup is used; the framework applies the compact styling automatically when the title bar is inside a mashup view.

Plugin A

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Calendar

Plugin B

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)RSS

```
<div class="mashup mashup--1Lx1R">
  <div class="view view--half_vertical">
    <div class="layout">
      <span class="label">Plugin A</span>
    </div>
    <div class="title_bar">
      <img class="image image--adaptive" src="/images/plugins/trmnl--render.svg">
      <span class="title">Calendar</span>
    </div>
  </div>
  <div class="view view--half_vertical">
    <div class="layout">
      <span class="label">Plugin B</span>
    </div>
    <div class="title_bar">
      <img class="image image--adaptive" src="/images/plugins/trmnl--render.svg">
      <span class="title">RSS</span>
    </div>
  </div>
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

 ](/framework/docs/3.0/layout)

 Next  [ 

## Columns

Implement zero-config column layouts for content organization

 ](/framework/docs/3.0/columns)

