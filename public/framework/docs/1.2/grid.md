# Grid

The Grid system provides a flexible way to create both column-based and row-based layouts. It supports various column counts, column spans, and responsive behaviors to create complex layouts easily.

### Ways to Define the Grid

The grid system provides two ways to define column layouts:

- **Column Count:** Set `grid--cols-{number}` on the parent to create equal-width columns 
- **Column Spans:** Set `col--span-{number}` on individual columns to control their width 

#### Column Count

Use `grid--cols-{number}` to specify any number of columns. Here are examples with 4 and 3 columns:

1/4

1/4

1/4

1/4

1/3

1/3

1/3

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

Use `col--span-{number}` to make a column span multiple grid columns. In a grid row, the sum of all column spans should equal the total number of grid columns. For example, you might have spans of 1 and 2, or spans of 3, 6, and 2.

Span 1

Span 2

Span 3

Span 6

Span 2

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

1

2

3

4

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)GridColumn Layout

```
<div class="grid">
  <div class="col">
    {{ Item }}
    {{ Item }}
    {{ Item }}
    {{ Item }}
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
    {{ Item }}
  </div>
  <div class="col col--center">
    {{ Item }}
  </div>
  <div class="col col--end">
    {{ Item }}
  </div>
</div>
```

### Row Layouts

Use rows to create horizontal layouts within the grid. Rows can be positioned and aligned using modifier classes.

#### Basic Row Layout

Use the `row` class to create horizontal layouts.

1

2

3

4

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)GridRow Layout

```
<div class="grid">
  <div class="row">
    {{ Item }}
    {{ Item }}
    {{ Item }}
    {{ Item }}
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
    {{ Item }}
  </div>
  <div class="row row--center">
    {{ Item }}
  </div>
  <div class="row row--end">
    {{ Item }}
  </div>
</div>
```

 Previous  [ 

## Flex

Arrange elements with flexible layouts and alignment options

 ](/framework/docs/1.2/flex)

 Next  [ 

## Background

Apply color tokens as backgrounds with bg--{token}

 ](/framework/docs/1.2/background)

