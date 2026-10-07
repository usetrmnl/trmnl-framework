# Flex

Utility classes for Flexbox layouts. Row and column directions with alignment, centering, and stretching modifiers.

### When to Use Flex

Use Flex inside [Layout](/framework/docs/2.3/layout) when you need flexible row or column arrangements. Flex lets items size by their content: width and height follow what's inside, rather than a fixed grid. It's the right choice when you want natural, content-driven layouts without strict column structure.

#### Content-Based Sizing

Flex items grow and shrink based on their content by default. You can override this with stretch modifiers, grow/shrink utilities, or basis classes. Use Flex when your layout should adapt to the content rather than forcing content into a fixed grid. Examples: toolbars, inline groups of labels and values, or stacks of variable-height cards.

#### Standalone or Nested

You can use Flex alone as the only child of Layout for simpler layouts. You can also nest Flex inside [Grid](/framework/docs/2.3/grid) . Each grid cell can contain a Flex container for row or column flexibility within that cell. And you can nest Flex inside [Columns](/framework/docs/2.3/columns) columns for per-column arrangement.

#### Compared to Grid and Columns

Choose Flex when you need flexible, content-sized layouts. If you need strict column alignment and spans, use Grid. If you have lots of same-type data and want the system to handle column distribution and overflow, use [Columns](/framework/docs/2.3/columns) .

### Base Structure

The Flex system provides two fundamental ways to organize content: horizontal (row) and vertical (column) arrangements. These base structures can be combined with alignment and stretch modifiers for complex layouts.

#### Row Direction

Use `flex flex--row` to create a horizontal layout:

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexRow Direction

```
<div class="flex flex--row">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

#### Column Direction

Use `flex flex--col` to create a vertical layout:

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexColumn Direction

```
<div class="flex flex--col">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Alignment Modifiers

Once you've chosen a base direction, you can apply alignment modifiers to control how items are positioned within their container. The system provides directional alignment (left/right/top/bottom) and centering options.

#### Row Horizontal Alignment

For row layouts, use `flex--left`, `flex--center-x`, or `flex--right` to control horizontal alignment:

Left

Center X

Right

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexRow Horizontal Alignment

```
<div class="flex flex--row flex--left">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>

<div class="flex flex--row flex--center-x">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>

<div class="flex flex--row flex--right">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>
```

#### Row Vertical Alignment

For row layouts, use `flex--top`, `flex--center-y`, or `flex--bottom` to control vertical alignment:

Top

Center Y

Bottom

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexRow Vertical Alignment

```
<div class="flex flex--row flex--top">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>

<div class="flex flex--row flex--center-y">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>

<div class="flex flex--row flex--bottom">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>
```

#### Column Horizontal Alignment

For column layouts, use `flex--left`, `flex--center-x`, or `flex--right` to control horizontal alignment:

Left

Center X

Right

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexColumn Horizontal Alignment

```
<div class="flex flex--col flex--left">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>

<div class="flex flex--col flex--center-x">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>

<div class="flex flex--col flex--right">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>
```

#### Column Vertical Alignment

For column layouts, use `flex--top`, `flex--center-y`, or `flex--bottom` to control vertical alignment:

Top

Center Y

Bottom

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexColumn Vertical Alignment

```
<div class="flex flex--col flex--top">
  <div>Item</div>
</div>

<div class="flex flex--col flex--center">
  <div>Item</div>
</div>

<div class="flex flex--col flex--bottom">
  <div>Item</div>
</div>
```

### Stretch Modifiers

The Flex system provides both container-level and individual item stretch controls. Container modifiers affect all children, while item classes only affect the specific element they're applied to.

#### Container Stretch

Use `flex--stretch`, `flex--stretch-x`, or `flex--stretch-y` to control how children fill the container:

Stretch All

Stretch X

Stretch Y

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexContainer Stretch

```
<div class="flex flex--row flex--stretch">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>

<div class="flex flex--row flex--stretch-x">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>

<div class="flex flex--row flex--stretch-y">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>
```

#### Individual Item Stretch (Row)

Use `stretch`, `stretch-x`, or `stretch-y` on individual items in a row layout:

Stretch

Normal

Stretch

Stretch X

Normal

Stretch X

Stretch Y

Normal

Stretch Y

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexItem Stretch (Row)

```
<div class="flex flex--row">
  <div class="stretch">Stretches in cross-axis</div>
  <div>Normal item</div>
  <div class="stretch">Stretches in cross-axis</div>
</div>

<div class="flex flex--row">
  <div class="stretch-x">Stretches horizontally</div>
  <div>Normal item</div>
  <div class="stretch-x">Stretches horizontally</div>
</div>

<div class="flex flex--row">
  <div class="stretch-y">Stretches vertically</div>
  <div>Normal item</div>
  <div class="stretch-y">Stretches vertically</div>
</div>
```

#### Individual Item Stretch (Column)

Use `stretch`, `stretch-x`, or `stretch-y` on individual items in a column layout:

Stretch

Normal

Stretch

Stretch X

Normal

Stretch X

Stretch Y

Normal

Stretch Y

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexItem Stretch (Column)

```
<div class="flex flex--col">
  <div class="stretch">Stretches in cross-axis</div>
  <div>Normal item</div>
  <div class="stretch">Stretches in cross-axis</div>
</div>

<div class="flex flex--col">
  <div class="stretch-x">Stretches horizontally</div>
  <div>Normal item</div>
  <div class="stretch-x">Stretches horizontally</div>
</div>

<div class="flex flex--col">
  <div class="stretch-y">Stretches vertically</div>
  <div>Normal item</div>
  <div class="stretch-y">Stretches vertically</div>
</div>
```

#### Preventing Item Shrinkage

Use `no-shrink` on flex children to prevent them from shrinking when other items try to take up more space:

Can Shrink

Stretching Content That Pushes Others

Won't Shrink

Stretching Content That Pushes Others

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexPrevent Shrinking

```
<div class="flex flex--row">
  <div class="no-shrink">Maintains its width</div>
  <div class="stretch">Stretches but won't squish the no-shrink item</div>
</div>
```

### Orientation-Responsive Layouts

Flexbox utilities support orientation-responsive variants, allowing you to change layouts when the screen is rotated. This is particularly useful for adapting navigation bars, toolbars, and content grids.

#### Adaptive Direction

Use `portrait:` prefix to change flex direction or alignment when the screen is in portrait orientation. Try rotating the device preview to see the effect.

Nav Item 1

Nav Item 2

Nav Item 3

Row in landscape, column in portrait

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexOrientation Responsive

```
<!-- Navigation that adapts to orientation -->
<div class="flex flex--row portrait:flex--col gap">
  <div class="stretch">Nav Item 1</div>
  <div class="stretch">Nav Item 2</div>
  <div class="stretch">Nav Item 3</div>
</div>

<!-- Combined with size breakpoints -->
<div class="flex flex--col md:flex--row md:portrait:flex--col">
  <!-- Column on small screens -->
  <!-- Row on medium+ landscape screens -->
  <!-- Column on medium+ portrait screens -->
</div>
```

### Extended Directions

In addition to standard directions, Flex supports reverse flow for quick reordering on the main axis. Use `flex--row-reverse` and `flex--col-reverse` to invert visual order without changing the DOM.

#### Row Reverse

A

B

C

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexRow Reverse

```
<div class="flex flex--row-reverse">
  <div>A</div>
  <div>B</div>
  <div>C</div>
</div>
```

#### Column Reverse

1

2

3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexColumn Reverse

```
<div class="flex flex--col-reverse">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>
```

### Wrapping and Multi‑Line Alignment

Control line breaks with `flex--wrap`, `flex--nowrap`, and `flex--wrap-reverse`. When wrapping, use align‑content modifiers to distribute lines: `flex--content-start|center|end|between|around|evenly|stretch`.

#### Wrap vs No‑wrap

Item 1

Item 2

Item 3

Item 4

Item 5

Item 6

Item 1

Item 2

Item 3

Item 4

Item 5

Item 6

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexWrap vs No‑wrap

```
<div class="flex flex--row flex--wrap gap">
  <div>Item 1</div> <div>Item 2</div> <div>Item 3</div>
  <div>Item 4</div> <div>Item 5</div> <div>Item 6</div>
</div>

<div class="flex flex--row flex--nowrap gap">
  <div>Item 1</div> <div>Item 2</div> <div>Item 3</div>
  <div>Item 4</div> <div>Item 5</div> <div>Item 6</div>
</div>
```

#### Wrapping Item Elements

`.item` elements will wrap in flex rows.

Team MeetingWeekly team sync-up

Team MeetingWeekly team sync-up

Team MeetingWeekly team sync-up

Team MeetingWeekly team sync-up

Team MeetingWeekly team sync-up

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexWrapping Items

```
<div class="flex flex--row flex--wrap gap">
  <div class="item w--40">
    <div class="meta"></div>
    <div class="content">
      <span class="title title--small">Team Meeting</span>
      <span class="description">Weekly team sync-up</span>
    </div>
  </div>
  <!-- ... -->
</div>
```

#### Align Content Across Lines

These only apply when wrapping is enabled.

L1

L2

L3

L4

L5

L6

L7

L8

L1

L2

L3

L4

L5

L6

L7

L8

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexAlign Content

```
<div class="flex flex--row flex--wrap flex--content-between gap">
  <!-- multi-line items -->
</div>

<div class="flex flex--row flex--wrap flex--content-center gap">
  <!-- multi-line items -->
</div>
```

### Main‑Axis Distribution

Use `flex--between`, `flex--around`, and `flex--evenly` to control spacing along the main axis. This differs from `gap`, which inserts physical gaps between items.

#### Row Distribution

Start

Middle

End

Around

Evenly

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexRow Distribution

```
<div class="flex flex--row flex--between">...</div>
<div class="flex flex--row flex--around">...</div>
<div class="flex flex--row flex--evenly">...</div>
```

### Item‑Level Controls

Per‑item utilities control alignment and flexing behavior without affecting siblings: self alignment, grow/shrink, flex shorthand, and basis sizing.

#### Self Alignment (align-self)

self--start

self--center

self--end

self--stretch

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexSelf Alignment

```
<div class="flex flex--row h--36">
  <div class="self--start">self--start</div>
  <div class="self--center">self--center</div>
  <div class="self--end">self--end</div>
  <div class="self--stretch">self--stretch</div>
</div>
```

#### Grow/Shrink and Flex Shorthand

grow

shrink-0

flex-none

flex-initial

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexGrow/Shrink & Flex

```
<div class="flex flex--row">
  <div class="grow">grow</div>
  <div class="shrink-0 w--36">shrink-0</div>
  <div class="flex-none w--36">flex-none</div>
  <div class="flex-initial w--36">flex-initial</div>
</div>
```

#### Basis and Order

basis--36

basis--20

basis--24

order--last

order--first

order--2

order---1

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexBasis & Order

```
<div class="flex flex--row">
  <div class="basis--36">basis--36</div>
  <div class="basis--20">basis--20</div>
  <div class="basis--24">basis--24</div>
</div>

<div class="flex flex--row">
  <div class="order--last">order--last</div>
  <div class="order--first">order--first</div>
  <div class="order--2">order--2</div>
  <div class="order---1">order---1</div>
</div>
```

### Inline Flex Containers

Use `inline-flex` for inline‑level flex containers that align alongside text.

Text before

Text after

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)FlexInline Flex

```
<span>Text before</span>
<div class="inline-flex flex--row gap">
  <div>•</div>
  <div>•</div>
</div>
<span>Text after</span>
```

 Previous  [ 

## Gap

Set precise spacing between elements with predefined gap values

 ](/framework/docs/2.3/gap)

 Next  [ 

## Grid

Create grid layouts with predefined column structures

 ](/framework/docs/2.3/grid)

