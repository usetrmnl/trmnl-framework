# Table

The Table system provides structured data presentation with consistent styling and various size options. It's designed to display information in a clear, scannable format while maintaining visual hierarchy.

### Base Structure

Tables are built using standard HTML table elements with additional classes for styling. The base structure includes headers and data cells with consistent spacing and typography.

#### Default Table

The `table` class provides the standard table styling with comfortable spacing and clear visual hierarchy.

| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Row 1, Cell 1 | Row 1, Cell 2 | Row 1, Cell 3 |
| Row 2, Cell 1 | Row 2, Cell 2 | Row 2, Cell 3 |
| Row 3, Cell 1 | Row 3, Cell 2 | Row 3, Cell 3 |

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TableDefault

```
<table class="table">
  <thead>
    <tr>
      <th><span class="title">Header 1</span></th>
      <th><span class="title">Header 2</span></th>
      <th><span class="title">Header 3</span></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="label">Row 1, Cell 1</span></td>
      <td><span class="label">Row 1, Cell 2</span></td>
      <td><span class="label">Row 1, Cell 3</span></td>
    </tr>
  </tbody>
</table>
```

### Size Variants

Tables can be rendered in different sizes to accommodate various use cases and space constraints. Size variants maintain the same structure while adjusting spacing and typography.

#### Condensed Table

Add `table--condensed` for a more compact table with reduced padding and smaller text.

| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Row 1, Cell 1 | Row 1, Cell 2 | Row 1, Cell 3 |
| Row 2, Cell 1 | Row 2, Cell 2 | Row 2, Cell 3 |
| Row 3, Cell 1 | Row 3, Cell 2 | Row 3, Cell 3 |

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TableCondensed

```
<table class="table table--condensed">
  <thead>
    <tr>
      <th><span class="title title--small">Header 1</span></th>
      <th><span class="title title--small">Header 2</span></th>
      <th><span class="title title--small">Header 3</span></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="label label--small">Row 1, Cell 1</span></td>
      <td><span class="label label--small">Row 1, Cell 2</span></td>
      <td><span class="label label--small">Row 1, Cell 3</span></td>
    </tr>
  </tbody>
</table>
```

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
| `--table-tbody-height` | calc(46px \* var(--ui-scale)) | - | - | - |
| `--table-thead-height` | calc(36px \* var(--ui-scale)) | - | - | - |
| Xsmall |
| `--table-xsmall-tbody-height` | calc(22px \* var(--ui-scale)) | - | - | - |
| `--table-xsmall-thead-height` | calc(18px \* var(--ui-scale)) | - | - | - |
| Small |
| `--table-small-tbody-height` | calc(31px \* var(--ui-scale)) | - | - | - |
| `--table-small-thead-height` | calc(24px \* var(--ui-scale)) | - | - | - |
| Large |
| `--table-large-tbody-height` | calc(56px \* var(--ui-scale)) | - | - | - |
| `--table-large-thead-height` | calc(44px \* var(--ui-scale)) | - | - | - |
| Xlarge |
| `--table-xlarge-tbody-height` | calc(72px \* var(--ui-scale)) | - | - | - |
| `--table-xlarge-thead-height` | calc(56px \* var(--ui-scale)) | - | - | - |

 Previous  [ 

## Item

Build standardized list items and content blocks

 ](/framework/docs/1.2/item)

 Next  [ 

## Chart

Visualize data with charts that adapt to the device and theme

 ](/framework/docs/1.2/chart)

