# Flex

The Flex system provides utility classes for creating flexible layouts using Flexbox. It supports both row and column directions with various alignment, centering, and stretching options.

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
  {{ Item 1 }}
  {{ Item 2 }}
  {{ Item 3 }}
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
  {{ Item 1 }}
  {{ Item 2 }}
  {{ Item 3 }}
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
  {{ Item }}
  {{ Item }}
  {{ Item }}
</div>

<div class="flex flex--row flex--center-x">
  {{ Item }}
  {{ Item }}
  {{ Item }}
</div>

<div class="flex flex--row flex--right">
  {{ Item }}
  {{ Item }}
  {{ Item }}
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
  {{ Item }}
  {{ Item }}
  {{ Item }}
</div>

<div class="flex flex--row flex--center-y">
  {{ Item }}
  {{ Item }}
  {{ Item }}
</div>

<div class="flex flex--row flex--bottom">
  {{ Item }}
  {{ Item }}
  {{ Item }}
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
  {{ Item }}
  {{ Item }}
  {{ Item }}
</div>

<div class="flex flex--col flex--center-x">
  {{ Item }}
  {{ Item }}
  {{ Item }}
</div>

<div class="flex flex--col flex--right">
  {{ Item }}
  {{ Item }}
  {{ Item }}
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
  {{ Item }}
</div>

<div class="flex flex--col flex--center">
  {{ Item }}
</div>

<div class="flex flex--col flex--bottom">
  {{ Item }}
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
  {{ Item }}
  {{ Item }}
  {{ Item }}
</div>

<div class="flex flex--row flex--stretch-x">
  {{ Item }}
  {{ Item }}
  {{ Item }}
</div>

<div class="flex flex--row flex--stretch-y">
  {{ Item }}
  {{ Item }}
  {{ Item }}
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

 Previous  [ 

## Gap

Set precise spacing between elements with predefined gap values

 ](/framework/docs/1.2/gap)

 Next  [ 

## Grid

Create grid layouts with predefined column structures

 ](/framework/docs/1.2/grid)

