# Grid

Utility classes for column-based and row-based grids. Set the column count, span cells across columns, and change either at a breakpoint.

### When to Use Grid

Use Grid inside [Layout](/framework/docs/3.4/layout) when you need a strict, grid-based layout. Grid gives you precise control over column count and span, so items align to a consistent rhythm and every element snaps to the same underlying grid.

#### Grid-Based Distribution

You define how many columns the grid has with `grid--cols-{number}`, and you can let individual cells span multiple columns with `col--span-{number}`. The result is a predictable, aligned layout where everything shares the same column structure. Ideal for Swiss-style or editorial designs where visual consistency matters.

#### Multiple Grids and Nesting

You can place multiple Grid components as direct children of Layout; Layout's modifiers (row/col, alignment, stretch) arrange those grids within the available space. Inside each grid cell, you can nest [Flex](/framework/docs/3.4/flex) for row or column flexibility within that cell. For example, a grid cell that stacks items vertically or aligns them horizontally.

#### Compared to Flex and Columns

Choose Grid when you need fixed column structure and spans. If you need content-sized flexibility (items that grow or shrink by content), use Flex. If you have lots of same-type data and want the system to handle column distribution and overflow, use [Columns](/framework/docs/3.4/columns) .

### Related

[Columns](/framework/docs/3.4/columns)[Flex](/framework/docs/3.4/flex)[Gap](/framework/docs/3.4/gap)[Layout](/framework/docs/3.4/layout)

### Ways to Define the Grid

Define a column layout in one of two ways:

- **Column Count:** Set `grid--cols-{number}` on the parent to create equal-width columns 
- **Column Spans:** Set `col--span-{number}` on individual columns to control their width 

#### Column Count

Use `grid--cols-{number}` to set the column count, from 1 to 12. A number above 12 has no class, so the grid keeps its default auto-fit template. Here are examples with 4 and 3 columns:

Col 1/4

Col 1/4

Col 1/4

Col 1/4

Col 1/3

Col 1/3

Col 1/3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)GridColumn Count

```
<div class="grid grid--cols-4">
  <div>1/4</div>
  <div>1/4</div>
  <div>1/4</div>
  <div>1/4</div>
</div>

<div class="grid grid--cols-3">
  <div>1/3</div>
  <div>1/3</div>
  <div>1/3</div>
</div>
```

#### Column Spans

Use `col--span-{number}` to make a column span multiple grid columns, from 1 to 12 like the column count. In a grid row, the sum of all column spans should equal the total number of grid columns. For example, you might have spans of 1 and 2, or spans of 3, 6, and 2.

Col Span 1

Col Span 2

Col Span 3

Col Span 6

Col Span 2

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)GridColumn Spans

```
<div class="grid">
  <div class="col--span-1">Span 1</div>
  <div class="col--span-2">Span 2</div>
</div>

<div class="grid">
  <div class="col--span-3">Span 3</div>
  <div class="col--span-6">Span 6</div>
  <div class="col--span-2">Span 2</div>
</div>
```

### Column Layouts

Use columns to create vertical layouts within the grid. Columns can be positioned and aligned using modifier classes.

#### Basic Column Layout

Use the `col` class to create vertical layouts.

Item 1

Item 2

Item 3

Item 4

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)GridColumn Layout

```
<div class="grid">
  <div class="col">
    <div>Item</div>
    <div>Item</div>
    <div>Item</div>
    <div>Item</div>
  </div>
</div>
```

#### Column Positioning

Use `col--{position}` where position can be `start`, `center`, or `end` to control vertical alignment:

Start

Center

End

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)GridColumn Positioning

```
<div class="grid grid--cols-3">
  <div class="col col--start">
    <div>Item</div>
  </div>
  <div class="col col--center">
    <div>Item</div>
  </div>
  <div class="col col--end">
    <div>Item</div>
  </div>
</div>
```

### Row Layouts

Use rows to create horizontal layouts within the grid. Rows can be positioned and aligned using modifier classes.

#### Basic Row Layout

Use the `row` class to create horizontal layouts.

Item 1

Item 2

Item 3

Item 4

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)GridRow Layout

```
<div class="grid">
  <div class="row">
    <div>Item</div>
    <div>Item</div>
    <div>Item</div>
    <div>Item</div>
  </div>
</div>
```

#### Row Positioning

Use `row--{position}` where position can be `start`, `center`, or `end` to control horizontal alignment:

Start

Center

End

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)GridRow Positioning

```
<div class="grid grid--cols-1">
  <div class="row row--start">
    <div>Item</div>
  </div>
  <div class="row row--center">
    <div>Item</div>
  </div>
  <div class="row row--end">
    <div>Item</div>
  </div>
</div>
```

### Grid Wrapping

Enable responsive wrapping based on a minimum column width using `grid--wrap`. Combine with `grid--min-{size}` to set the minimum track size.

#### Different Minimum Sizes

As the container shrinks, the grid reduces column count to respect the minimum size.

Item 1

Item 2

Item 3

Item 4

Item 5

Item 6

Item 7

Item 8

Item 1

Item 2

Item 3

Item 4

Item 5

Item 6

Item 7

Item 8

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)GridGrid Wrapping

```
<div class="grid grid--wrap grid--min-32">
  <div class="col">Item 1</div>
  <div class="col">Item 2</div>
  <div class="col">Item 3</div>
  <div class="col">Item 4</div>
  <div class="col">Item 5</div>
  <div class="col">Item 6</div>
  <div class="col">Item 7</div>
  <div class="col">Item 8</div>
</div>

<div class="grid grid--wrap grid--min-56">
  <div class="col">Item 1</div>
  <div class="col">Item 2</div>
  <div class="col">Item 3</div>
  <div class="col">Item 4</div>
  <div class="col">Item 5</div>
  <div class="col">Item 6</div>
  <div class="col">Item 7</div>
  <div class="col">Item 8</div>
</div>
```

### Removing the Gap

A grid separates its columns by the screen's gap. Add `grid--no-gap` to close it, so tiles meet edge to edge and read as one band. Size and orientation prefixes work on it like any other grid modifier (`portrait:grid--no-gap`), and a [Gap](/framework/docs/3.4/gap) utility sets a different gap rather than none.

Mon

Tue

Wed

Thu

Mon

Tue

Wed

Thu

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Gridgrid--no-gap

```
<div class="grid grid--cols-4 grid--no-gap">
  <div class="col">Mon</div>
  <div class="col">Tue</div>
  <div class="col">Wed</div>
  <div class="col">Thu</div>
</div>
```

 Previous  [ 

## Flex

Arrange elements with flexible layouts and alignment options

 ](/framework/docs/3.4/flex)

 Next  [ 

## Aspect Ratio

Maintain consistent proportions for elements regardless of their content

 ](/framework/docs/3.4/aspect_ratio)

