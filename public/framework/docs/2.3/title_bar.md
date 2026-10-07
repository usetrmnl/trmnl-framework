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

The Title Bar [Title Bar](/framework/docs/2.3/title_bar) consists of three main elements: an icon [Image](/framework/docs/2.3/image) , a title [Title](/framework/docs/2.3/title) , and an optional instance label [Label](/framework/docs/2.3/label) . These elements are arranged horizontally and automatically spaced.

#### Basic Title Bar

The basic Title Bar includes an icon and title. Use the `title_bar` class [Title Bar](/framework/docs/2.3/title_bar) for the container.

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

### Title Bar in Mashups

When the Title Bar is placed inside a [Mashup](/framework/docs/2.3/mashup) , it automatically receives different styling. Inside a view with a mashup layout (`view--half_vertical`, `view--half_horizontal`, or `view--quadrant`), the title bar uses a reduced height, a smaller icon, and no top or side border radius, with rounded bottom corners only so it aligns with the view's bordered outline.

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
      <img class="image" src="/images/plugins/trmnl--render.svg">
      <span class="title">Calendar</span>
    </div>
  </div>
  <div class="view view--half_vertical">
    <div class="layout">
      <span class="label">Plugin B</span>
    </div>
    <div class="title_bar">
      <img class="image" src="/images/plugins/trmnl--render.svg">
      <span class="title">RSS</span>
    </div>
  </div>
</div>
```

 Previous  [ 

## Layout

Primary container for organizing plugin content

 ](/framework/docs/2.3/layout)

 Next  [ 

## Columns

Implement zero-config column layouts for content organization

 ](/framework/docs/2.3/columns)

