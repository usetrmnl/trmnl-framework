# Columns

The Columns system handles lots of same-type data. You provide the items; it distributes them into columns and manages overflow, so you can display as few or as many items as there are in any given situation. For other layout needs, use Grid or Flex.

Columns go inside Layout. Use them in your plugin markup to organize content into balanced columns.

Same rules apply. Columns go inside Layout, which you provide as part of the full hierarchy.

```
<!-- view view--full (platform-provided) -->
<div class="layout">
  <div class="columns">
    <div class="column">...</div>
    <div class="column">...</div>
  </div>
</div>
<div class="title_bar">...</div>
<!-- /view -->
```

```
<div class="view view--full">
  <div class="layout">
    <div class="columns">
      <div class="column">...</div>
      <div class="column">...</div>
    </div>
  </div>
  <div class="title_bar">...</div>
</div>
```

### When to Use Columns

Use Columns when you have a lot of same-type data to show and you want to display as few or as many items as there are in any given situation. The Columns system takes care of the layout: it distributes content into columns, adapts column count to the available space, and handles overflow when content exceeds the viewport.

#### Variable Data, Automatic Layout

You provide the items; Columns figures out how to fit them. It distributes content into multiple columns based on available screen real estate, adapts column count when the viewport or orientation changes, and works seamlessly with the framework's overflow and clamping systems. Set a maximum column count or let the system choose the best fit.

#### Overflow Handling

When content exceeds the available height, Columns doesn't break or overflow. It gracefully hides items that don't fit and, when configured, adds an "and X more" indicator so users know there's additional content. See the [Overflow](/framework/docs/2.3/overflow) page for details.

#### Item Grouping and Flow

Items can be grouped (for example, by date or category), and the Columns system keeps those groups together as they flow into columns. Group headers stay with their items, so you don't end up with orphaned headings or broken visual hierarchy when space is limited.

#### Compared to Grid and Flex

Choose Columns when you have lists or feeds of same-type items and want the system to handle distribution and overflow. If you need strict grid alignment with fixed column spans, use [Grid](/framework/docs/2.3/grid) . If you need flexible, content-sized row or column arrangements (toolbars, inline groups, etc.), use [Flex](/framework/docs/2.3/flex) .

### Basic Column Layout

The basic column layout is flexible - you can add as many columns as needed depending on your content needs.

Column 1
Item

Item

Item

Item

Column 2
Item

Item

Column 3
Item

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Columns

```
<div class="columns">
  <div class="column">
    Content for column 1
  </div>
  <div class="column">
    Content for column 2
  </div>
  <div class="column">
    Content for column 3
  </div>
</div>
```

 Previous  [ 

## Title Bar

Standardized title bar with plugin information and instance details

 ](/framework/docs/2.3/title_bar)

 Next  [ 

## Mashup

Assemble multiple plugin views into a single interface

 ](/framework/docs/2.3/mashup)

