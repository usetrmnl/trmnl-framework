# Layout

The Layout system provides flexible containers for organizing content either horizontally or vertically, with various alignment options. It uses CSS Flexbox under the hood to create consistent and responsive layouts.

### Base Structure

The Layout system provides two fundamental ways to organize content: horizontal and vertical arrangements. These base structures are the building blocks for more complex layouts.

#### Row Layout

The `layout layout--row` classes create a horizontal layout. Items are arranged horizontally from left to right, with center alignment as the default positioning.

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LayoutHorizontal

```
<div class="layout layout--row">
  {{ Item 1 }}
  {{ Item 2 }}
  {{ Item 3 }}
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
  {{ Item 1 }}
  {{ Item 2 }}
  {{ Item 3 }}
</div>
```

### Alignment Modifiers

Once you've chosen a base layout structure, you can apply these modifier classes to control how items are aligned within their container. The system provides both directional alignment (top/bottom/left/right) and centering options.

#### Horizontal Alignment

Use `layout--left`, `layout--center-x`, or `layout--right` to control horizontal alignment.

Left

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LayoutLeft Alignment

```
<div class="layout layout--left">
  {{ Item 1 }}
  {{ Item 2 }}
  {{ Item 3 }}
</div>
```

#### Vertical Alignment

Use `layout--top`, `layout--center-y`, or `layout--bottom` to control vertical alignment.

Top

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LayoutTop Alignment

```
<div class="layout layout--row layout--top">
  {{ Item 1 }}
  {{ Item 2 }}
  {{ Item 3 }}
</div>
```

#### Center Alignment

Use `layout--center` to center items both horizontally and vertically, or use `layout--center-x` and `layout--center-y` for individual axis control.

Center

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LayoutCenter Alignment

```
<div class="layout layout--row layout--center">
  {{ Item 1 }}
  {{ Item 2 }}
  {{ Item 3 }}
</div>

<!-- Or with individual axis control -->
<div class="layout layout--row layout--center-x layout--center-y">
  {{ Item 1 }}
  {{ Item 2 }}
  {{ Item 3 }}
</div>
```

### Stretch Modifiers

Stretch modifiers allow you to control how child elements fill the available space within a layout. You can apply these modifiers either to the layout container or to individual child elements.

#### Container Stretch

Use `layout--stretch` to make all children stretch in both directions. You can also use `layout--stretch-x` and `layout--stretch-y` for individual axis control. These modifiers work with both row and column layouts.

#### Row Layout Stretch

Examples of stretch behavior in row layouts. Use `layout--stretch` for both directions, `layout--stretch-x` for horizontal, or `layout--stretch-y` for vertical stretch.

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Row LayoutFull Stretch

```
<div class="layout layout--row layout--stretch">
  {{ Item 1 }}
  {{ Item 2 }}
  {{ Item 3 }}
</div>
```

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Row LayoutHorizontal Stretch

```
<div class="layout layout--row layout--stretch-x">
  {{ Item 1 }}
  {{ Item 2 }}
  {{ Item 3 }}
</div>
```

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Row LayoutVertical Stretch

```
<div class="layout layout--row layout--stretch-y">
  {{ Item 1 }}
  {{ Item 2 }}
  {{ Item 3 }}
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
  {{ Item 1 }}
  {{ Item 2 }}
  {{ Item 3 }}
</div>
```

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Column LayoutHorizontal Stretch

```
<div class="layout layout--col layout--stretch-x">
  {{ Item 1 }}
  {{ Item 2 }}
  {{ Item 3 }}
</div>
```

Item 1

Item 2

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Column LayoutVertical Stretch

```
<div class="layout layout--col layout--stretch-y">
  {{ Item 1 }}
  {{ Item 2 }}
  {{ Item 3 }}
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
  {{ Item 1 }}
  <div class="stretch-x">{{ Stretched Item }}</div>
  {{ Item 3 }}
</div>
```

Item 1

Item 2   
(stretched)

Item 3

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)LayoutColumn + Individual Stretch

```
<div class="layout layout--col">
  {{ Item 1 }}
  <div class="stretch-y">{{ Stretched Item }}</div>
  {{ Item 3 }}
</div>
```

 Previous  [ 

## View

Show your plugin in different sizes with Mashup view containers

 ](/framework/docs/1.2/view)

 Next  [ 

## Title Bar

Standardized title bar with plugin information and instance details

 ](/framework/docs/1.2/title_bar)

