# Mashup

A Mashup arranges multiple plugin views within a single screen. The mashup modifier (e.g. `mashup--1Lx1R`, `mashup--2x2`) controls how the views are positioned, while each view's own modifier determines how much space it occupies.

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

Mashup modifiers control how [View](/framework/docs/3.0/view) instances are arranged within the screen, while each view's own modifier determines how much space it occupies. The following layouts are available.

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

 Previous  [ 

## Columns

Implement zero-config column layouts for content organization

 ](/framework/docs/3.0/columns)

 Next  [ 

## Title

Style headings with consistent typography

 ](/framework/docs/3.0/title)

