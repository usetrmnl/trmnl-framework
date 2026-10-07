# Position

Use Position to put one element over another instead of beside it. Offsets on the spacing scale hold it a set distance from the edges of its container, and a short stacking scale says which of two overlapping elements is drawn on top.

Available offset sizes and their pixel values

[View Size Documentation](/framework/docs/3.4/size)

## Relative and Absolute

`relative` marks an element as a container that positioned children are placed against. `absolute` takes a child out of the normal flow, and the offsets below then measure from that container's edges.

`relative`The container the offsets below measure from

`absolute`Takes the element out of flow

## Offsets

`top--`, `right--`, `bottom--` and `left--` each set the distance from one edge, and `inset--` sets all four. The numbers come from the spacing scale [Spacing](/framework/docs/3.4/spacing) , where one step is 4px, so `top--3` is 12px.

There are half steps at the small end, where 0.5, 1.5, 2.5 and 3.5 give 2px, 6px, 10px and 14px, and the scale runs from 0 to 96, or 384px. Nothing outside those steps is a class, so `top--[Npx]` has no effect.

Those pixel values describe a standard device. On one with a larger interface scale the offsets grow with it, the same way padding does [Scale](/framework/docs/3.4/scale) .

`top--{size}`Distance from the top edge

`right--{size}`Distance from the right edge

`bottom--{size}`Distance from the bottom edge

`left--{size}`Distance from the left edge

`inset--{size}`All four edges at once; `inset--0` is full bleed

## Layers

Where two positioned elements overlap, `z--0` through `z--3` say which of them is drawn on top. The scale ends at 3, so nothing a screen positions can cover the title bar.

`z--{0-3}`Which positioned element draws on top

## Responsive

Every class on this page takes a prefix for **Size** [Size](/framework/docs/3.4/size) , **Orientation** , or both [Responsive](/framework/docs/3.4/responsive) . Bit-depth prefixes are not part of the set, because these classes place an element rather than paint it.

`md:top--{size}`Size-based example

`portrait:inset--{size}`Orientation-based example

`lg:portrait:left--{size}`Size + Orientation example

## Out of Flow

Once an element leaves the flow, three things about it change: what measures its text, what decides its width, and what it needs behind it.

[Clamp](/framework/docs/3.4/clamp) , [Fit Value](/framework/docs/3.4/fit_value) , [Content Limiter](/framework/docs/3.4/content_limiter) and [Table Overflow](/framework/docs/3.4/table_overflow) measure elements in normal flow, so they pass a positioned one by. Give it a size, clamp its own text, and read it back on the smallest screen you support.

An element with only `left--` or only `right--` is as wide as its contents. Name both edges and it stretches from one to the other.

An element drawn over other content needs a solid fill: `bg--canvas` or `bg--white`. Every shade between them is a dither pattern on a 1-bit screen, and small text over one is hard to read. Draw its edge with [Outline](/framework/docs/3.4/outline) rather than a shadow, which ePaper renders as a band of dither.

### Card over a full-bleed panel

A panel takes the whole layout here, with one card in its top left corner and another in its bottom right. Each card names a vertical edge and a horizontal edge, and with no second horizontal edge to stretch to, it comes out as wide as its own label.

Depot12 min

Updated 17:04

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)PositionCard over a panel

```
<div class="layout layout--col">
  <div class="relative stretch w--full bg--gray-45">
    <div class="absolute top--3 left--3 z--2 p--2 bg--white outline">
      <span class="label label--small">Depot</span>
      <span class="value value--xsmall value--tnums">12 min</span>
    </div>
    <div class="absolute bottom--3 right--3 z--2 p--2 bg--white outline">
      <span class="label label--small">Updated 17:04</span>
    </div>
  </div>
</div>
```

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| `--content-scale` | 1 | - | - | - |

 Previous  [ 

## Spacing

Control element spacing with fixed margin and padding values

 ](/framework/docs/3.4/spacing)

 Next  [ 

## Gap

Set precise spacing between elements with predefined gap values

 ](/framework/docs/3.4/gap)

