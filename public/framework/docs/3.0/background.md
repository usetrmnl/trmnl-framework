# Background

Use the color palette defined in [Colors](/framework/docs/3.4/colors). Apply these shades with bg--{token} for backgrounds. On 1-bit displays, grayscale uses dither patterns; on 2-bit and 4-bit+, solid colors render.

### Grayscale

Grayscale background shades only, including the center spacer between 40 and 45.

black

10

15

20

25

30

35

40

45

50

55

60

65

70

75

white

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Grayscale backgrounds

**Dark Mode Notice:** The color palette appears inverted because TRMNL's dark mode inverts the entire screen, except the images.

### Base Colors

Full base palettes for background tokens: grayscale and all chromatic hues with every shade step.

10

15

20

25

30

35

40

base

45

50

55

60

65

70

75

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Base background colors

### Usage

Use the `bg--{shade}` utility classes to apply these background patterns to any element. Grayscale: black, gray-10 through gray-75, and white. Chromatic: `bg--{hue}` (pure color, e.g. bg--red, bg--green) or `bg--{hue}-{step}` (e.g. bg--red-50, bg--blue-40). Semantic: `bg--primary`, `bg--success`, `bg--error`, etc. (see [Colors](/framework/docs/3.4/colors)).

```
<div class="bg--black">Black</div>
<div class="bg--gray-10">Gray 10</div>
<div class="bg--gray-15">Gray 15</div>
<div class="bg--gray-20">Gray 20</div>
<div class="bg--gray-25">Gray 25</div>
<div class="bg--gray-30">Gray 30</div>
<div class="bg--gray-35">Gray 35</div>
<div class="bg--gray-40">Gray 40</div>
<div class="bg--gray-45">Gray 45</div>
<div class="bg--gray-50">Gray 50</div>
<div class="bg--gray-55">Gray 55</div>
<div class="bg--gray-60">Gray 60</div>
<div class="bg--gray-65">Gray 65</div>
<div class="bg--gray-70">Gray 70</div>
<div class="bg--gray-75">Gray 75</div>
<div class="bg--white">White</div>
```

**Device Preview tip:** Use the Device Preview (top right) to switch between grayscale and color palettes. Try Inky Impression 7.3 (color-7a) or Tidbyt (color-24bit) to see chromatic colors. 

#### Chromatic tokens

Use `bg--{hue}-{step}` and `text--{hue}-{step}` for color backgrounds and text.

```
<div class="bg--red">Pure red</div>
<div class="bg--red-50">Red 50</div>
<div class="bg--blue-40">Blue 40</div>
<div class="bg--green-60">Green 60</div>
<div class="text--red-50">Red text</div>
```

#### Semantic tokens

Use `bg--{role}` and `text--{role}` for intent-based colors. Roles: primary, success, error, warning. See [Colors](/framework/docs/3.4/colors) for the full mapping.

```
<div class="bg--primary text--white">Primary</div>
<div class="bg--success text--white">Success</div>
<div class="bg--error text--white">Error</div>
<div class="text--warning">Warning text</div>
```

 Previous  [ 

## Visibility

Control element visibility based on display bit depth

 ](/framework/docs/3.0/visibility)

 Next  [ 

## Border

Draw horizontal and vertical rules on the same shade scale as backgrounds

 ](/framework/docs/3.0/border)

