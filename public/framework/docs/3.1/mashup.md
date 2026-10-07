# Mashup

A Mashup arranges multiple plugin views within a single screen. A fixed mashup modifier (e.g. `mashup--1Lx1R`, `mashup--2x2`) positions the views, while each view's own modifier sets how much space it occupies. Fluid Mashups use the `mashup--3x3` layout and cell placement modifiers for custom tilings.

You don't specify the Mashup. When you configure multiple plugins on a single screen, the platform provides the appropriate Mashup container automatically.

You provide the Mashup yourself. Include the `mashup` container with the appropriate layout class in your markup (e.g. `mashup--1Lx1R`, `mashup--2x2`).

```
<!-- mashup mashup--1Lx1R (platform-provided) -->
<!-- view view--half_vertical (platform-provided) -->
<div class="layout">...</div>
<div class="title_bar">...</div>
<!-- /view -->
<!-- /mashup -->
```

```
<div class="mashup mashup--1Lx1R">
  <div class="view view--half_vertical">
    <div class="layout">...</div>
    <div class="title_bar">...</div>
  </div>
  <div class="view view--half_vertical">
    <div class="layout">...</div>
    <div class="title_bar">...</div>
  </div>
</div>
```

### Mashup Layouts

Mashup modifiers control how [View](/framework/docs/3.1/view) instances are arranged within the screen, while each view's own modifier determines how much space it occupies. The following layouts are available.

#### 1 Left, 1 Right

In the 1Lx1R layout, the first plugin occupies the left column while the second occupies the right column.

Plugin A

Plugin B

```
<div class="mashup mashup--1Lx1R">
  <div class="view view--half_vertical">
    <div class="layout">
      <span class="label">Plugin A</span>
    </div>
  </div>
  <div class="view view--half_vertical">
    <div class="layout">
      <span class="label">Plugin B</span>
    </div>
  </div>
</div>
```

#### 1 Top, 1 Bottom

In the 1Tx1B layout, one plugin spans the top row while the other occupies the bottom row.

Plugin A

Plugin B

```
<div class="mashup mashup--1Tx1B">
  <div class="view view--half_horizontal">
    <div class="layout">
      <span class="label">Plugin A</span>
    </div>
  </div>
  <div class="view view--half_horizontal">
    <div class="layout">
      <span class="label">Plugin B</span>
    </div>
  </div>
</div>
```

#### 1 Left, 2 Right

In the 1Lx2R layout, one plugin occupies the left column while two plugins stack in the right column.

Plugin A

Plugin B

Plugin C

```
<div class="mashup mashup--1Lx2R">
  <div class="view view--half_vertical">
    <div class="layout">
      <span class="label">Plugin A</span>
    </div>
  </div>
  <div class="view view--quadrant">
    <div class="layout">
      <span class="label">Plugin B</span>
    </div>
  </div>
  <div class="view view--quadrant">
    <div class="layout">
      <span class="label">Plugin C</span>
    </div>
  </div>
</div>
```

#### 2 Left, 1 Right

The 2Lx1R layout stacks two plugins in the left column, with a single plugin in the right column.

Plugin A

Plugin B

Plugin C

```
<div class="mashup mashup--2Lx1R">
  <div class="view view--quadrant">
    <div class="layout">
      <span class="label">Plugin A</span>
    </div>
  </div>
  <div class="view view--quadrant">
    <div class="layout">
      <span class="label">Plugin B</span>
    </div>
  </div>
  <div class="view view--half_vertical">
    <div class="layout">
      <span class="label">Plugin C</span>
    </div>
  </div>
</div>
```

#### 2 Top, 1 Bottom

In the 2Tx1B layout, two plugins are presented side by side in the top row, with a single plugin in the bottom row.

Plugin A

Plugin B

Plugin C

```
<div class="mashup mashup--2Tx1B">
  <div class="view view--quadrant">
    <div class="layout">
      <span class="label">Plugin A</span>
    </div>
  </div>
  <div class="view view--quadrant">
    <div class="layout">
      <span class="label">Plugin B</span>
    </div>
  </div>
  <div class="view view--half_horizontal">
    <div class="layout">
      <span class="label">Plugin C</span>
    </div>
  </div>
</div>
```

#### 1 Top, 2 Bottom

The 1Tx2B layout places one plugin in the top row, with two plugins side by side in the bottom row.

Plugin A

Plugin B

Plugin C

```
<div class="mashup mashup--1Tx2B">
  <div class="view view--half_horizontal">
    <div class="layout">
      <span class="label">Plugin A</span>
    </div>
  </div>
  <div class="view view--quadrant">
    <div class="layout">
      <span class="label">Plugin B</span>
    </div>
  </div>
  <div class="view view--quadrant">
    <div class="layout">
      <span class="label">Plugin C</span>
    </div>
  </div>
</div>
```

#### 2 x 2 Grid

The 2x2 grid arranges four plugins in a grid pattern.

Plugin A

Plugin B

Plugin C

Plugin D

```
<div class="mashup mashup--2x2">
  <div class="view view--quadrant">
    <div class="layout">
      <span class="label">Plugin A</span>
    </div>
  </div>
  <div class="view view--quadrant">
    <div class="layout">
      <span class="label">Plugin B</span>
    </div>
  </div>
  <div class="view view--quadrant">
    <div class="layout">
      <span class="label">Plugin C</span>
    </div>
  </div>
  <div class="view view--quadrant">
    <div class="layout">
      <span class="label">Plugin D</span>
    </div>
  </div>
</div>
```

### Fluid Mashups

The `mashup--3x3` layout arranges [View](/framework/docs/3.1/view) instances on a three by three grid that you carve up yourself. Each `mashup-cell` uses column, row, and span modifiers to set its place. A grid can hold nine equal tiles or a few large regions, and every cell draws its own border and surface at any size.

#### Available Modifiers

Combine one modifier from each group to place a cell. Column, row, and span values range from 1 to 3.

| Class | Description |
| --- | --- |
| `mashup-cell--col-1` | Starts the cell at column 1 |
| `mashup-cell--col-2` | Starts the cell at column 2 |
| `mashup-cell--col-3` | Starts the cell at column 3 |
| `mashup-cell--col-span-1` | Spans 1 column |
| `mashup-cell--col-span-2` | Spans 2 columns |
| `mashup-cell--col-span-3` | Spans 3 columns |
| `mashup-cell--row-1` | Starts the cell at row 1 |
| `mashup-cell--row-2` | Starts the cell at row 2 |
| `mashup-cell--row-3` | Starts the cell at row 3 |
| `mashup-cell--row-span-1` | Spans 1 row |
| `mashup-cell--row-span-2` | Spans 2 rows |
| `mashup-cell--row-span-3` | Spans 3 rows |

#### 3 x 3 Grid

Nine `mashup-cell` elements with no placement fill the grid from left to right, top to bottom, giving an even grid of equal tiles.

Plugin A

Plugin B

Plugin C

Plugin D

Plugin E

Plugin F

Plugin G

Plugin H

Plugin I

```
<div class="mashup mashup--3x3">
  <div class="mashup-cell">
    <div class="view view--quadrant">
      <div class="layout">...</div>
    </div>
  </div>
  <!-- eight more mashup-cell elements -->
</div>
```

#### Spanning Cells and Title Bars

Add `mashup-cell--col-*` and `mashup-cell--row-*` to choose the starting tracks. Add the matching `*-span-*` modifiers to cover up to three tracks in either direction.

Add a [Title Bar](/framework/docs/3.1/title_bar) to label a cell's plugin. Place the `title_bar` as a sibling of `layout` inside the view. Every cell uses the compact title bar, whatever its size, and the layout above shrinks to make room for it.

Plugin A

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Plugin A

Plugin B

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Plugin B

Plugin C

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Plugin C

```
<div class="mashup mashup--3x3">
  <div class="mashup-cell mashup-cell--col-1 mashup-cell--col-span-3 mashup-cell--row-1 mashup-cell--row-span-1">
    <div class="view view--half_horizontal">
      <div class="layout">...</div>
      <div class="title_bar">...</div>
    </div>
  </div>
  <div class="mashup-cell mashup-cell--col-1 mashup-cell--col-span-2 mashup-cell--row-2 mashup-cell--row-span-2">
    <div class="view view--full">
      <div class="layout">...</div>
      <div class="title_bar">...</div>
    </div>
  </div>
  <div class="mashup-cell mashup-cell--col-3 mashup-cell--col-span-1 mashup-cell--row-2 mashup-cell--row-span-2">
    <div class="view view--half_vertical">
      <div class="layout">...</div>
      <div class="title_bar">...</div>
    </div>
  </div>
</div>
```

 Previous  [ 

## Columns

Implement zero-config column layouts for content organization

 ](/framework/docs/3.1/columns)

 Next  [ 

## Title

Style headings with consistent typography

 ](/framework/docs/3.1/title)

