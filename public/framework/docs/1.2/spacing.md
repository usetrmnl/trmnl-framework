# Spacing

The Spacing system provides utility classes for controlling margins and padding. It includes both fixed sizes and decimal values to handle precise spacing needs. Arbitrary pixel values are not supported.

Spacing uses the Fixed Sizes scale and its pixel values

[View Fixed Sizes](/framework/docs/1.2/size#fixed-sizes)

### Margin Utilities

Control element margins using these utility classes. Each class follows the pattern `{property}--{size}`. Use a Fixed Size for `{size}`. Any other value, such as `m--[8px]` or `mx--auto`, does nothing and the element keeps the margin it already had.

`m--{size}`All sides margin

`mt--{size}`Top margin

`mr--{size}`Right margin

`mb--{size}`Bottom margin

`ml--{size}`Left margin

`mx--{size}`Horizontal margin

`my--{size}`Vertical margin

### Padding Utilities

Control element padding using these utility classes. Each class follows the pattern `{property}--{size}`. Use a Fixed Size for `{size}`. Any other value, such as `pl--[8px]` or `p--full`, does nothing and the element keeps the padding it already had.

`p--{size}`All sides padding

`pt--{size}`Top padding

`pr--{size}`Right padding

`pb--{size}`Bottom padding

`pl--{size}`Left padding

`px--{size}`Horizontal padding

`py--{size}`Vertical padding

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

 ](/framework/docs/1.2/size)

 Next  [ 

## Gap

Set precise spacing between elements with predefined gap values

 ](/framework/docs/1.2/gap)

