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

#### Single

In the 1x1 layout, one view spans both columns and both rows, so a single plugin fills the mashup. Pair it with `view--full`, which is sized to the same area.

Plugin A

```
<div class="mashup mashup--1x1">
  <div class="view view--full">
    <div class="layout">
      <span class="label">Plugin A</span>
    </div>
  </div>
</div>
```

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

The 2x2 layout places four plugins in two rows of two.

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

The `mashup--3x3` layout arranges [View](/framework/docs/3.4/view) instances on a three by three grid that you carve up yourself. Each `mashup-cell` uses column, row, and span modifiers to set its place. A grid can hold nine equal tiles or a few large regions, and every cell draws its own border and surface at any size.

A view inside a mashup cell always fills the cell, whatever view size class it carries. `w--*` and `h--*` utilities on that view have no effect; size the content inside the view instead.

#### Available Modifiers

Combine one modifier from each group to place a cell. Column, row, and span values range from 1 to 3.

Keep start plus span at 4 or less. The grid is three columns wide, so `mashup-cell--col-2` with `mashup-cell--col-span-3` reaches past the edge and adds an auto-sized fourth column, which re-lays the whole mashup. The same holds for rows.

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
      <div class="layout">
        <span class="label">Plugin A</span>
      </div>
    </div>
  </div>
  <!-- eight more mashup-cell elements (Plugin B through Plugin I) -->
</div>
```

#### Feature and Sidebar

Add `mashup-cell--col-*` and `mashup-cell--row-*` to choose the starting cell. Add the matching `*-span-*` modifiers to span up to three cells in either direction.

Plugin A

Plugin B

Plugin C

Plugin D

```
<div class="mashup mashup--3x3">
  <div class="mashup-cell mashup-cell--col-1 mashup-cell--col-span-2 mashup-cell--row-1 mashup-cell--row-span-3">
    <div class="view view--full">
      <div class="layout">
        <span class="label">Plugin A</span>
      </div>
    </div>
  </div>
  <div class="mashup-cell mashup-cell--col-3 mashup-cell--col-span-1 mashup-cell--row-1 mashup-cell--row-span-1">
    <div class="view view--quadrant">
      <div class="layout">
        <span class="label">Plugin B</span>
      </div>
    </div>
  </div>
  <div class="mashup-cell mashup-cell--col-3 mashup-cell--col-span-1 mashup-cell--row-2 mashup-cell--row-span-1">
    <div class="view view--quadrant">
      <div class="layout">
        <span class="label">Plugin C</span>
      </div>
    </div>
  </div>
  <div class="mashup-cell mashup-cell--col-3 mashup-cell--col-span-1 mashup-cell--row-3 mashup-cell--row-span-1">
    <div class="view view--quadrant">
      <div class="layout">
        <span class="label">Plugin D</span>
      </div>
    </div>
  </div>
</div>
```

#### Banner and Split

Cells span in either direction. This grid runs a full width banner across the top, a two by two block below it, and a tall cell down the right.

Plugin A

Plugin B

Plugin C

```
<div class="mashup mashup--3x3">
  <div class="mashup-cell mashup-cell--col-1 mashup-cell--col-span-3 mashup-cell--row-1 mashup-cell--row-span-1">
    <div class="view view--half_horizontal">
      <div class="layout">
        <span class="label">Plugin A</span>
      </div>
    </div>
  </div>
  <div class="mashup-cell mashup-cell--col-1 mashup-cell--col-span-2 mashup-cell--row-2 mashup-cell--row-span-2">
    <div class="view view--full">
      <div class="layout">
        <span class="label">Plugin B</span>
      </div>
    </div>
  </div>
  <div class="mashup-cell mashup-cell--col-3 mashup-cell--col-span-1 mashup-cell--row-2 mashup-cell--row-span-2">
    <div class="view view--half_vertical">
      <div class="layout">
        <span class="label">Plugin C</span>
      </div>
    </div>
  </div>
</div>
```

#### Title Bars

Add a [Title Bar](/framework/docs/3.4/title_bar) to a cell to label its plugin. Place the `title_bar` as a sibling of `layout` inside the view, the same as a standalone view. Every cell uses the compact title bar, whatever its size, and the layout above shrinks to make room for it.

72°

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Weather

2 PM

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Agenda

Wed 14

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Calendar

84%

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Battery

```
<div class="mashup mashup--3x3">
  <div class="mashup-cell mashup-cell--col-1 mashup-cell--col-span-2 mashup-cell--row-1 mashup-cell--row-span-1">
    <div class="view view--half_horizontal">
      <div class="layout">
        <span class="value">72&deg;</span>
      </div>
      <div class="title_bar">
        <img class="image image--adaptive" src="/images/plugins/trmnl--render.svg">
        <span class="title">Weather</span>
      </div>
    </div>
  </div>
  <div class="mashup-cell mashup-cell--col-3 mashup-cell--col-span-1 mashup-cell--row-1 mashup-cell--row-span-2">
    <div class="view view--half_vertical">
      <div class="layout">
        <span class="value">2 PM</span>
      </div>
      <div class="title_bar">
        <img class="image image--adaptive" src="/images/plugins/trmnl--render.svg">
        <span class="title">Agenda</span>
      </div>
    </div>
  </div>
  <div class="mashup-cell mashup-cell--col-1 mashup-cell--col-span-2 mashup-cell--row-2 mashup-cell--row-span-2">
    <div class="view view--full">
      <div class="layout">
        <span class="value">Wed 14</span>
      </div>
      <div class="title_bar">
        <img class="image image--adaptive" src="/images/plugins/trmnl--render.svg">
        <span class="title">Calendar</span>
      </div>
    </div>
  </div>
  <div class="mashup-cell mashup-cell--col-3 mashup-cell--col-span-1 mashup-cell--row-3 mashup-cell--row-span-1">
    <div class="view view--quadrant">
      <div class="layout">
        <span class="value">84%</span>
      </div>
      <div class="title_bar">
        <img class="image image--adaptive" src="/images/plugins/trmnl--render.svg">
        <span class="title">Battery</span>
      </div>
    </div>
  </div>
</div>
```

### Screen Backdrop Modifier

#### Default vs Backdrop Mashups

By default, a mashup is a white screen with a border around each view. `screen--backdrop` swaps that for a patterned background on 1-bit, or a solid gray field on 2-bit and deeper screens, with plain white views on top.

Plugin A

Plugin B

```
<!-- Default mashup (white background, bordered views) -->
<div class="screen">
  <div class="mashup mashup--1Lx1R">
    <div class="view view--half_vertical">...</div>
    <div class="view view--half_vertical">...</div>
  </div>
</div>

<!-- Backdrop mashup (patterned background) -->
<div class="screen screen--backdrop">
  <div class="mashup mashup--1Lx1R">
    <div class="view view--half_vertical">...</div>
    <div class="view view--half_vertical">...</div>
  </div>
</div>
```

 Previous  [ 

## Columns

Implement zero-config column layouts for content organization

 ](/framework/docs/3.4/columns)

 Next  [ 

## Title

Style headings with consistent typography

 ](/framework/docs/3.4/title)

