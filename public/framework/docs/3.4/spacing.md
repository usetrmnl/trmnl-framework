# Spacing

Utility classes for margin and padding. Fixed steps plus decimal values for the cases where a whole step is too coarse.

Available spacing sizes and their pixel values

[View Size Documentation](/framework/docs/3.4/size)

### Margin Utilities

Control element margins using these utility classes. Each class follows the pattern `{property}--{size}` and supports responsive modifiers for **Size** [Size](/framework/docs/3.4/size) , **Orientation** , and **Size + Orientation** [Responsive](/framework/docs/3.4/responsive) . Margins take a scale token, so an arbitrary `m--[Npx]` value does nothing and the element keeps the margin it already had.

`m--{size}`All sides margin

`mt--{size}`Top margin

`mr--{size}`Right margin

`mb--{size}`Bottom margin

`ml--{size}`Left margin

`mx--{size}`Horizontal margin

`my--{size}`Vertical margin

`md:my--{size}`Size-based example

`portrait:mx--{size}`Orientation-based example

`lg:portrait:mt--{size}`Size + Orientation example

### Padding Utilities

Control element padding using these utility classes. Each class follows the pattern `{property}--{size}`. See [Size](/framework/docs/3.4/size) for sizing tokens, the only values padding takes.

`p--{size}`All sides padding

`pt--{size}`Top padding

`pr--{size}`Right padding

`pb--{size}`Bottom padding

`pl--{size}`Left padding

`px--{size}`Horizontal padding

`py--{size}`Vertical padding

`sm:px--{size}`Size-based example

`portrait:pb--{size}`Orientation-based example

`md:portrait:pt--{size}`Size + Orientation example

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| `--gap-large` | 20px | - | - | - |
| `--gap-medium` | 16px | - | - | - |
| `--gap-small` | 7px | - | - | - |
| `--gap-xlarge` | 30px | - | - | - |
| `--gap-xsmall` | 5px | - | - | - |
| `--gap-xxlarge` | 40px | - | - | - |
| `--list-gap-small` | 8px | - | - | - |

 Previous  [ 

## Size

Define exact width and height dimensions for elements

 ](/framework/docs/3.4/size)

 Next  [ 

## Position

Take an element out of flow and set its distance from each edge of its container

 ](/framework/docs/3.4/position)

