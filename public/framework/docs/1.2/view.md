# View

The View system provides a consistent container structure for displaying content within the application.

### Base Structure

The Layout element is the core component of every View, providing a consistent container for your content. Views can optionally include a Title Bar for additional context.

#### View with Title Bar

The `view view--full` classes create a full-width view. Also available are `view--half_horizontal, view--half_vertical, view--quadrant`.

When combined with a title bar, it provides context and navigation options. If you're building a screen in the markup editor, _you do not need to wrap your content_ with the `view view--{{size}}` classes. The example code below is sufficient for any layout.

Layout

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TitleInstance

```
<div class="layout">
  <!-- Your content here -->
</div>

<div class="title_bar">
  <img class="image" src="/images/plugins/trmnl--render.svg">
  <span class="title">Title</span>
  <span class="instance">Instance</span>
</div>
```

#### View without Title Bar

For simpler interfaces, you can create a view without a title bar using just the base view classes.

Layout

```
<div class="layout">
  <!-- Your content here -->
</div>
```

### Screen Container Modifiers

The screen container that wraps your views has a no-bleed option that removes padding. This can be controlled through Private and Public Plugin settings, or applied directly in your code when developing locally.

#### No Bleed Modifier

The `screen--no-bleed` modifier removes the default padding around the screen container, allowing content to extend fully to the edges.

Screen No Bleed / Layout

```
<div class="screen screen--no-bleed">
  <div class="view view--full">
    <div class="layout">
      <!-- Your content here -->
    </div>
  </div>
</div>
```

 Previous  [ 

## Pixel Perfect

Ensure text renders with crisp edges by aligning to the pixel grid

 ](/framework/docs/1.2/pixel_perfect)

 Next  [ 

## Layout

Primary container for organizing plugin content

 ](/framework/docs/1.2/layout)

