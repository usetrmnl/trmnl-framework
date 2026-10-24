# Spacing

Utility classes for margin and padding. They take the Fixed Sizes from the Size page, including decimal steps like 0.5 and 2.5 for the cases where a whole step is too coarse. Arbitrary pixel values and dynamic sizes are not supported.

Spacing uses the Fixed Sizes scale and its pixel values

[View Fixed Sizes](/framework/docs/3.1/size#fixed-sizes)

### Margin Utilities

Control element margins with `{property}--{size}`, where `{size}` is a Fixed Size. Each class supports responsive modifiers for **Size** [Size](/framework/docs/3.1/size) , **Orientation** , and **Size + Orientation** [Responsive](/framework/docs/3.1/responsive) . Any other value, such as `m--[Npx]` or `mx--auto`, does nothing and the element keeps the margin it already had.

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

Control element padding with `{property}--{size}`, where `{size}` is a Fixed Size. Responsive modifiers work the same as for margin. Any other value, such as `pl--[Npx]` or `p--full`, does nothing and the element keeps the padding it already had.

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

 ](/framework/docs/3.1/size)

 Next  [ 

## Gap

Set precise spacing between elements with predefined gap values

 ](/framework/docs/3.1/gap)

