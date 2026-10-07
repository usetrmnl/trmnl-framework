# View

A View holds content (e.g. a plugin instance). Single views use `view--full` inside the Screen; multiple views go inside a Mashup, where the view modifier sets each view's share of space and the Mashup modifier sets the arrangement. View and Layout receive calculated dimensions from the device and orientation.

You don't specify the `view`. The markup you write for any plugin layout is automatically wrapped in the appropriate `view` container by the platform.

You provide the `view` yourself. Include the appropriate wrapper in your markup: `view view--full`, `view view--half_vertical`, `view view--half_horizontal`, or `view view--quadrant`.

```
<!-- view view--full (platform-provided) -->
<div class="layout">...</div>
<div class="title_bar">...</div>
<!-- /view -->
```

```
<div class="view view--full">
  <div class="layout">...</div>
  <div class="title_bar">...</div>
</div>
```

### Base Structure

The Layout element [Layout](/framework/docs/3.4/layout) is the core component of every View [View](/framework/docs/3.4/view) , providing a consistent container for your content. Views can optionally include a Title Bar [Title Bar](/framework/docs/3.4/title_bar) for additional context.

There are four view types: `view--full`, `view--half_horizontal`, `view--half_vertical`, and `view--quadrant`. The default full view (`view view--full`) lives directly inside the `screen` div. Other view types must be nested inside a [Mashup](/framework/docs/3.4/mashup) component.

#### With Layout and Title Bar

When combined with a title bar, it provides context and navigation options.

Layout

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TitleInstance

```
<div class="view view--full">
  <div class="layout">
    <!-- Your content here -->
  </div>

  <div class="title_bar">
    <img class="image image--adaptive" src="/images/plugins/trmnl--render.svg" alt="TRMNL Logo">
    <span class="title">Title</span>
    <span class="instance">Instance</span>
  </div>
</div>
```

#### With only Layout

For simpler interfaces, you can create a view without a title bar using just the base view classes.

Layout

```
<div class="view view--full">
  <div class="layout">
    <!-- Your content here -->
  </div>
</div>
```

### Views in Mashups

When multiple plugins share a single screen, each one gets its own view, and those views must be wrapped in a [Mashup](/framework/docs/3.4/mashup) container.

The view modifier (`view--half_vertical`, `view--quadrant`, etc.) determines how much space each plugin gets. The mashup modifier (`mashup--1Lx1R`, `mashup--2x2`, etc.) determines how those views are arranged on screen.

 Previous  [ 

## Rendering Modes

The grayscale tiers and color modes a screen can carry, what each one paints, and the bit depth JavaScript can read

 ](/framework/docs/3.4/rendering_modes)

 Next  [ 

## Layout

Primary container for organizing plugin content

 ](/framework/docs/3.4/layout)

