# Structure

Screen, View, Layout, Title Bar, Columns, and Mashup form the fixed hierarchy that defines the display environment. Plugins render their content inside Views. Follow the exact div setup; deviating causes layout and rendering issues.

You don't specify Screen, Mashup, or View. The platform provides them automatically, and you specify the Layout and optionally a Title Bar.

You provide the full hierarchy yourself: Screen, View, Layout, and optionally a Mashup container and a Title Bar.

```
<!-- plugin's view markup -->
<div class="layout">...</div>
<div class="title_bar">...</div>
<!-- /plugin's view markup -->
```

```
<div class="screen">
  <div class="view view--full">
    <div class="layout">...</div>
    <div class="title_bar">...</div>
  </div>
</div>
```

### The Exact Structure

The framework uses a fixed div hierarchy. Each level has a specific role. The canonical structure is:

**Screen** → ( **Mashup** →) **View** → **Layout** (+ optional **Title Bar** )

[Screen](/framework/docs/3.0/screen)--portrait --no-bleed --dark-mode --og --v2 --backdrop

 [Mashup](/framework/docs/3.0/mashup) --1x1 --1Lx1R --1Tx1B --2x2 --1Lx2R --2Lx1R --2Tx1B --1Tx2B --3x3

[View](/framework/docs/3.0/view)--full --half\_vertical --half\_horizontal --quadrant

[Layout](/framework/docs/3.0/layout)--row --col

--left --center-x --right --top --center-y --bottom --center

--stretch --stretch-x --stretch-y

 [Title Bar](/framework/docs/3.0/title_bar) 

### Component Roles

Each foundation component has a specific role. Use them as intended.

#### Screen

Root container. Defines viewport dimensions, padding, and CSS variables that cascade throughout.

 Go to [Screen](/framework/docs/3.0/screen)

#### View

Container for a plugin slot. Size modifiers (`view--full`, `view--half_horizontal`, `view--half_vertical`, `view--quadrant`) set how much space the plugin gets. Non-full views must be nested inside a Mashup.

 Go to [View](/framework/docs/3.0/view)

#### Layout

The content container, exactly one per View. Its direct children are typically Columns, Grid, or Flex, arranged with `layout--row`, `layout--col`, and alignment modifiers. See the Layout page's "What Goes Inside Layout" section for when to use each.

 Go to [Layout](/framework/docs/3.0/layout)

#### Title Bar

Optional. Sibling to Layout within a View. Displays icon, title, and instance label.

 Go to [Title Bar](/framework/docs/3.0/title_bar)

#### Columns

Use _inside_ Layout for column-based content organization.

 Go to [Columns](/framework/docs/3.0/columns)

#### Mashup

Wraps multiple Views and arranges them within the Screen (1Lx1R, 1Tx1B, 2x2, etc.).

 Go to [Mashup](/framework/docs/3.0/mashup)

#### Single View

For a single plugin occupying the full screen:

Layout

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)PluginInstance

```
<div class="screen">
  <div class="view view--full">
    <div class="layout">
      <!-- Your content here -->
    </div>
    <div class="title_bar">...</div>
  </div>
</div>
```

#### Mashup (Multiple Views)

For multiple plugins on one screen, wrap views in a [Mashup](/framework/docs/3.0/mashup) . Each view has exactly one [Layout](/framework/docs/3.0/layout) .

Plugin A

Plugin B

```
<div class="screen">
  <div class="mashup mashup--1Lx1R">
    <div class="view view--half_vertical">
      <div class="layout">...</div>
    </div>
    <div class="view view--half_vertical">
      <div class="layout">...</div>
    </div>
  </div>
</div>
```

 Previous  [ 

## Framework Runtime

The JavaScript pass that measures the screen and fits your content into it at render time

 ](/framework/docs/3.0/framework_runtime)

 Next  [ 

## Screen

Device screen dimensions, orientation, and display properties

 ](/framework/docs/3.0/screen)

