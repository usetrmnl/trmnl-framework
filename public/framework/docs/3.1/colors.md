# Colors

The Colors system defines the complete palette for the framework: grayscale, chromatic hues, and semantic roles (primary, success, error, warning). Use these tokens with bg--, text--, and other utilities. See Background and Text Color for usage examples.

### Grayscale Palette

The complete range of grayscale shades available in the framework, from pure black to pure white. These tokens use the same lightness scale as chromatic and blend palettes.

black

black

10

gray-10

15

gray-15

20

gray-20

25

gray-25

30

gray-30

35

gray-35

40

gray-40

45

gray-45

50

gray-50

55

gray-55

60

gray-60

65

gray-65

70

gray-70

75

gray-75

white

white

**Dark Mode Notice:** The color palette appears inverted because TRMNL's dark mode inverts the entire screen, except the images.

### Chromatic Palette

The framework offers 10 hues × 14 lightness steps (red, orange, yellow, lime, green, cyan, blue, violet, purple, pink), using the same steps as grayscale (10, 15, 20, …, 75). Select a color device (e.g. Inky Impression 7.3, Tidbyt) from the Device Preview above to see these colors in action. Use the Raw Colors / Preview Colors toggle to compare full-bright tokens vs device-representative rendering.

red

red-10

red-15

red-20

red-25

red-30

red-35

red-40

red

red-45

red-50

red-55

red-60

red-65

red-70

red-75

orange

orange-10

orange-15

orange-20

orange-25

orange-30

orange-35

orange-40

orange

orange-45

orange-50

orange-55

orange-60

orange-65

orange-70

orange-75

yellow

yellow-10

yellow-15

yellow-20

yellow-25

yellow-30

yellow-35

yellow-40

yellow

yellow-45

yellow-50

yellow-55

yellow-60

yellow-65

yellow-70

yellow-75

lime

lime-10

lime-15

lime-20

lime-25

lime-30

lime-35

lime-40

lime

lime-45

lime-50

lime-55

lime-60

lime-65

lime-70

lime-75

green

green-10

green-15

green-20

green-25

green-30

green-35

green-40

green

green-45

green-50

green-55

green-60

green-65

green-70

green-75

cyan

cyan-10

cyan-15

cyan-20

cyan-25

cyan-30

cyan-35

cyan-40

cyan

cyan-45

cyan-50

cyan-55

cyan-60

cyan-65

cyan-70

cyan-75

blue

blue-10

blue-15

blue-20

blue-25

blue-30

blue-35

blue-40

blue

blue-45

blue-50

blue-55

blue-60

blue-65

blue-70

blue-75

violet

violet-10

violet-15

violet-20

violet-25

violet-30

violet-35

violet-40

violet

violet-45

violet-50

violet-55

violet-60

violet-65

violet-70

violet-75

purple

purple-10

purple-15

purple-20

purple-25

purple-30

purple-35

purple-40

purple

purple-45

purple-50

purple-55

purple-60

purple-65

purple-70

purple-75

pink

pink-10

pink-15

pink-20

pink-25

pink-30

pink-35

pink-40

pink

pink-45

pink-50

pink-55

pink-60

pink-65

pink-70

pink-75

**Device Preview tip:** Use the Device Preview (top right) to switch between grayscale and color palettes, then toggle Raw Colors / Preview Colors to compare full-bright and device-accurate previews. Try Inky Impression 7.3 (color-7a) or Tidbyt (color-24bit) to see chromatic colors. 

### Semantic Colors

Semantic color roles map meaning to base hues. Use `bg--primary`, `text--success`, and similar utilities for intent-based styling. These alias underlying tokens (e.g. primary → blue) and inherit all device/bit-depth behavior. Themes can override via `--color-{role}` CSS variables.

Primary

bg--primary

→ blue

Success

bg--success

→ green

Error

bg--error

→ red

Warning

bg--warning

→ orange

| Role | Underlying Token | Use |
| --- | --- | --- |
| primary | `blue` | Main actions, accents |
| success | `green` | Confirmations, positive states |
| error | `red` | Errors, destructive actions |
| warning | `orange` | Cautions, alerts |

### Token Syntax

Apply these color tokens with utility prefixes. The [Background](/framework/docs/3.4/background) page documents `bg--{token}`; the [Text Color](/framework/docs/3.4/text_color) page documents `text--{token}`. Other utilities (border, outline, etc.) may use the same tokens where applicable.

| Utility | Example | Use |
| --- | --- | --- |
| bg-- | `bg--gray-50`, `bg--red-40` | Background colors |
| text-- | `text--gray-50`, `text--blue-60`, `text--success` | Text colors |
| bg-- / text-- (semantic) | `bg--primary`, `text--error`, `text--success` | Semantic roles (primary, success, error, warning) |

**Grayscale:** black, gray-10 through gray-75, white. **Chromatic:** `{hue}` (pure color) or `{hue}-{step}` (e.g. red-50, blue-40). **Blend:** `{colorA}-{colorB}-{step}` (e.g. red-blue-50, green-yellow-25). **Semantic:** `primary`, `success`, `error`, `warning` (alias base hues).

### Backward Compatibility

For backward compatibility, the original shade names (`gray-1` through `gray-7`) are still supported but deprecated. These map to equivalent extended shades:

gray-1 (deprecated)

gray-1

gray-2 (deprecated)

gray-2

gray-3 (deprecated)

gray-3

gray-4 (deprecated)

gray-4

gray-5 (deprecated)

gray-5

gray-6 (deprecated)

gray-6

gray-7 (deprecated)

gray-7

```
<!-- Deprecated (but still works) -->
<div class="bg--gray-1">Gray 1</div>
<div class="bg--gray-2">Gray 2</div>

<!-- Preferred (new naming) -->
<div class="bg--gray-10">Gray 10</div>
<div class="bg--gray-20">Gray 20</div>
```

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Semantic |
| `--black` | #000000 | - | - | - |
| `--color-error` | var(--red) | - | - | - |
| `--color-primary` | var(--blue) | - | - | - |
| `--color-success` | var(--green) | - | - | - |
| `--color-warning` | var(--orange) | - | - | - |
| `--white` | #FFFFFF | - | - | - |
| Grayscale |
| `--gray-10` | #111111 | - | - | - |
| `--gray-15` | #222222 | - | - | - |
| `--gray-20` | #333333 | - | - | - |
| `--gray-25` | #444444 | - | - | - |
| `--gray-30` | #555555 | - | - | - |
| `--gray-35` | #666666 | - | - | - |
| `--gray-40` | #777777 | - | - | - |
| `--gray-45` | #888888 | - | - | - |
| `--gray-50` | #999999 | - | - | - |
| `--gray-55` | #AAAAAA | - | - | - |
| `--gray-60` | #BBBBBB | - | - | - |
| `--gray-65` | #CCCCCC | - | - | - |
| `--gray-70` | #DDDDDD | - | - | - |
| `--gray-75` | #EEEEEE | - | - | - |
| Legacy Grayscale |
| `--gray-1` | #111111 | - | - | - |
| `--gray-2` | #333333 | - | - | - |
| `--gray-3` | #555555 | - | - | - |
| `--gray-4` | #777777 | - | - | - |
| `--gray-5` | #999999 | - | - | - |
| `--gray-6` | #BBBBBB | - | - | - |
| `--gray-7` | #DDDDDD | - | - | - |

 Previous  [ 

## Scale

Scale interface to affect content density and readability

 ](/framework/docs/3.1/scale)

 Next  [ 

## Tokens

Complete CSS variable reference with root defaults, density, and bit-depth overrides

 ](/framework/docs/3.1/tokens)

