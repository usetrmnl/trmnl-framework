# Layout

The Layout is the content container inside a View, exactly one `layout` per `view`. It arranges content horizontally (`layout--row`) or vertically (`layout--col`), with alignment and stretch modifiers.

Use one `layout` per `view`. Organize content inside it with `flex`, `columns`, or `grid`.

Don't nest `layout` inside `layout`. There should be exactly one `layout` per `view`.

```
<div class="layout">
  <div class="flex flex--row">
    <div>Item 1</div>
    <div>Item 2</div>
  </div>
</div>
```

```
<div class="layout">
  <div class="layout layout--row">
    <div>Item 1</div>
    <div>Item 2</div>
  </div>
</div>
```

### What Goes Inside Layout

Layout is the main content wrapper inside a View. It defines the available space: its height is calculated from the device type, the orientation, and whether a title bar is present. Its direct children are usually Columns, Grid, or Flex.

A direct child can also sit over the layout instead of inside it, with its distance measured from the layout's own edges Position .

#### Three ways to lay out content

#### Grid

Use when you need a strict grid: define column count and spans, so items align to a consistent rhythm. Good for Swiss-style layouts where everything lines up to a fixed grid.

 Go to [Grid](/framework/docs/3.1/grid)

#### Flex

Use when you want flexible arrangements where items size by content (width/height). You can use Flex alone for simpler layouts, or nest it inside Grid for per-cell flexibility.

 Go to [Flex](/framework/docs/3.1/flex)

#### Columns

Use when you have lots of same-type data and want to display as few or as many items as there are, with the Columns system handling the layout. See the Columns page for details.

 Go to [Columns](/framework/docs/3.1/columns)

You can use multiple of each: multiple Columns components, multiple Grids, multiple Flex containers. You can mix them. The Layout modifiers (`layout--row`, `layout--col`, alignment, stretch) control how these direct children are arranged within the Layout space.

1

2

3

4

5

6

7

8

9

10

11

12

#### Nesting

These components can be nested: put a Grid inside Layout, give that Grid a column count, and place Flex containers inside each grid cell. Inside each Flex you then place your actual content (items, text, etc.). Layout arranges the top-level Grid(s); the Grid arranges its cells; the Flex arranges items within each cell.

### Base Structure

Layout arranges content in one of two directions: horizontal or vertical. These base structures are the building blocks for more complex layouts.

#### Row Layout

The `layout layout--row` classes create a horizontal layout. Items are arranged horizontally from left to right, with center alignment as the default positioning.

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LayoutHorizontal

```
<div class="layout layout--row">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

#### Column Layout

The `layout layout--col` classes create a vertical layout. Items are arranged vertically from top to bottom, with center alignment as the default positioning.

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LayoutVertical

```
<div class="layout layout--col">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Alignment Modifiers

Once you've chosen a base layout structure, you can apply these modifier classes to control how items are aligned within their container. Modifiers cover directional alignment (top/bottom/left/right) and centering.

#### Horizontal Alignment

Use `layout--left`, `layout--center-x`, or `layout--right` to control horizontal alignment.

Left

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LayoutLeft Alignment

```
<div class="layout layout--left">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

#### Vertical Alignment

Use `layout--top`, `layout--center-y`, or `layout--bottom` to control vertical alignment.

Top

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LayoutTop Alignment

```
<div class="layout layout--row layout--top">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

#### Center Alignment

Use `layout--center` to center items both horizontally and vertically, or use `layout--center-x` and `layout--center-y` for individual axis control.

Center

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LayoutCenter Alignment

```
<div class="layout layout--row layout--center">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Or with individual axis control -->
<div class="layout layout--row layout--center-x layout--center-y">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

#### Axis Alignment

The modifiers above are screen-directional: `layout--left` means left whether the layout is a row or a column. The modifiers below follow the flex axes instead, so `layout--justify-*` moves items along the layout direction and `layout--align-*` moves them across it.

- `layout--justify-start` / `layout--justify-center` / `layout--justify-end`: position items along the main axis.
- `layout--align-start` / `layout--align-center` / `layout--align-end`: position items across the cross axis.
- `layout--start` / `layout--end`: both axes at once, the corner-anchored counterparts of `layout--center`.

```
<!-- Top-left as a row, top-left as a column too -->
<div class="layout layout--row portrait:layout--col layout--start">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- End of the main axis, centered across the cross axis -->
<div class="layout layout--row layout--justify-end layout--align-center">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Stretch Modifiers

Stretch modifiers allow you to control how child elements fill the available space within a layout. You can apply these modifiers either to the layout container or to individual child elements.

#### Container Stretch

Use `layout--stretch` to make all children stretch in both directions. You can also use `layout--stretch-x` and `layout--stretch-y` for individual axis control. These modifiers work with both row and column layouts.

`layout--stretch-x` and `layout--stretch-y` are screen-directional, so each one swaps its rule between a row and a column. Reach for `layout--stretch-main` (children fill the layout direction) or `layout--stretch-cross` (children fill across it) when you want the axis to follow the layout instead of the screen.

#### Row Layout Stretch

Examples of stretch behavior in row layouts. Use `layout--stretch` for both directions, `layout--stretch-x` for horizontal, or `layout--stretch-y` for vertical stretch.

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Row LayoutFull Stretch

```
<div class="layout layout--row layout--stretch">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Row LayoutHorizontal Stretch

```
<div class="layout layout--row layout--stretch-x">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Row LayoutVertical Stretch

```
<div class="layout layout--row layout--stretch-y">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

#### Column Layout Stretch

Examples of stretch behavior in column layouts. The same modifiers work consistently regardless of layout direction.

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Column LayoutFull Stretch

```
<div class="layout layout--col layout--stretch">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Column LayoutHorizontal Stretch

```
<div class="layout layout--col layout--stretch-x">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Column LayoutVertical Stretch

```
<div class="layout layout--col layout--stretch-y">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

#### Child Element Stretch

Use `stretch-x` and `stretch-y` classes on individual elements to control their stretch behavior within row or column layouts.

Item 1

Item 2 (stretched)

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LayoutRow + Individual Stretch

```
<div class="layout layout--row">
  <div>Item 1</div>
  <div class="stretch-x">Stretched Item</div>
  <div>Item 3</div>
</div>
```

Item 1

Item 2   
(stretched)

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LayoutColumn + Individual Stretch

```
<div class="layout layout--col">
  <div>Item 1</div>
  <div class="stretch-y">Stretched Item</div>
  <div>Item 3</div>
</div>
```

 Previous  [ 

## View

Show your plugin in different sizes with Mashup view containers

 ](/framework/docs/3.1/view)

 Next  [ 

## Title Bar

Standardized title bar with plugin information and instance details

 ](/framework/docs/3.1/title_bar)

