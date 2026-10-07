# Text Color

Set text color with the text--{token} utilities, on the same scale as the [Colors](/framework/docs/3.4/colors) palette. On 1-bit displays a grayscale token renders as a dither pattern of black and white pixels, so text can read as any shade of gray.

### Usage

Use the `text--{shade}` utility classes to apply text color patterns to any element. The shade comes from one of these schemes (see [Colors](/framework/docs/3.4/colors)):

- **Grayscale:** `text--black`, `text--gray-10` through `text--gray-75`, and `text--white`. 
- **Chromatic:** `text--{hue}` for the pure color, or `text--{hue}-{step}` for a step on that hue's ladder (e.g. text--red-50, text--blue-40). 
- **Semantic:** `text--primary`, `text--success`, `text--error`, and `text--warning`. See [Colors](/framework/docs/3.4/colors) for how each role resolves per device. 
- **Ink roles:** `text--default`, `text--muted`, and `text--inverse` paint the text colors the screen itself uses. A theme recolors them, and they mirror `bg--canvas` and its siblings on [Background](/framework/docs/3.4/background) . 

See the [Responsive Features](#responsive-text-color) section for responsive variants.

### Grayscale

Sixteen grayscale values: black, gray-10 through gray-75, and white.

Aa
black

Aa
gray-10

Aa
gray-15

Aa
gray-20

Aa
gray-25

Aa
gray-30

Aa
gray-35

Aa
gray-40

Aa
gray-45

Aa
gray-50

Aa
gray-55

Aa
gray-60

Aa
gray-65

Aa
gray-70

Aa
gray-75

Aa
white

Aa
black

Aa
gray-10

Aa
gray-15

Aa
gray-20

Aa
gray-25

Aa
gray-30

Aa
gray-35

Aa
gray-40

Aa
gray-45

Aa
gray-50

Aa
gray-55

Aa
gray-60

Aa
gray-65

Aa
gray-70

Aa
gray-75

Aa
white

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Text color shades

**Dark Mode Notice:** The palette appears inverted because dark mode swaps black and white and mirrors the gray and color ladders. Images are not affected unless they opt in via `image--adaptive`. Themed screens ignore dark mode entirely.

```
<div class="text--black">Black text</div>
<div class="text--gray-10">Gray 10 text</div>
<div class="text--gray-15">Gray 15 text</div>
<div class="text--gray-20">Gray 20 text</div>
<div class="text--gray-25">Gray 25 text</div>
<div class="text--gray-30">Gray 30 text</div>
<div class="text--gray-35">Gray 35 text</div>
<div class="text--gray-40">Gray 40 text</div>
<div class="text--gray-45">Gray 45 text</div>
<div class="text--gray-50">Gray 50 text</div>
<div class="text--gray-55">Gray 55 text</div>
<div class="text--gray-60">Gray 60 text</div>
<div class="text--gray-65">Gray 65 text</div>
<div class="text--gray-70">Gray 70 text</div>
<div class="text--gray-75">Gray 75 text</div>
<div class="text--white">White text</div>
```

Switch the screen picker (top right) to a color device (e.g. Inky Impression 7.3, Tidbyt) to see the hue sections below in color.

### Red

Two classes write red text:

- `text--red`: the pure red. 
- `text--red-{step}`: a step on the red ladder (e.g. text--red-50), on the same 10 to 75 scale as grayscale. 

Aa
red-10

Aa
red-15

Aa
red-20

Aa
red-25

Aa
red-30

Aa
red-35

Aa
red-40

Aa
red

Aa
red-45

Aa
red-50

Aa
red-55

Aa
red-60

Aa
red-65

Aa
red-70

Aa
red-75

Aa
red-10

Aa
red-15

Aa
red-20

Aa
red-25

Aa
red-30

Aa
red-35

Aa
red-40

Aa
red

Aa
red-45

Aa
red-50

Aa
red-55

Aa
red-60

Aa
red-65

Aa
red-70

Aa
red-75

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TextRed

```
<div class="text--red-10">Red-10 text</div>
<div class="text--red-15">Red-15 text</div>
<div class="text--red-20">Red-20 text</div>
<div class="text--red-25">Red-25 text</div>
<div class="text--red-30">Red-30 text</div>
<div class="text--red-35">Red-35 text</div>
<div class="text--red-40">Red-40 text</div>
<div class="text--red">Red text</div>
<div class="text--red-45">Red-45 text</div>
<div class="text--red-50">Red-50 text</div>
<div class="text--red-55">Red-55 text</div>
<div class="text--red-60">Red-60 text</div>
<div class="text--red-65">Red-65 text</div>
<div class="text--red-70">Red-70 text</div>
<div class="text--red-75">Red-75 text</div>
```

### Orange

Two classes write orange text:

- `text--orange`: the pure orange. 
- `text--orange-{step}`: a step on the orange ladder (e.g. text--orange-50), on the same 10 to 75 scale as grayscale. 

Aa
orange-10

Aa
orange-15

Aa
orange-20

Aa
orange-25

Aa
orange-30

Aa
orange-35

Aa
orange-40

Aa
orange

Aa
orange-45

Aa
orange-50

Aa
orange-55

Aa
orange-60

Aa
orange-65

Aa
orange-70

Aa
orange-75

Aa
orange-10

Aa
orange-15

Aa
orange-20

Aa
orange-25

Aa
orange-30

Aa
orange-35

Aa
orange-40

Aa
orange

Aa
orange-45

Aa
orange-50

Aa
orange-55

Aa
orange-60

Aa
orange-65

Aa
orange-70

Aa
orange-75

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TextOrange

```
<div class="text--orange-10">Orange-10 text</div>
<div class="text--orange-15">Orange-15 text</div>
<div class="text--orange-20">Orange-20 text</div>
<div class="text--orange-25">Orange-25 text</div>
<div class="text--orange-30">Orange-30 text</div>
<div class="text--orange-35">Orange-35 text</div>
<div class="text--orange-40">Orange-40 text</div>
<div class="text--orange">Orange text</div>
<div class="text--orange-45">Orange-45 text</div>
<div class="text--orange-50">Orange-50 text</div>
<div class="text--orange-55">Orange-55 text</div>
<div class="text--orange-60">Orange-60 text</div>
<div class="text--orange-65">Orange-65 text</div>
<div class="text--orange-70">Orange-70 text</div>
<div class="text--orange-75">Orange-75 text</div>
```

### Yellow

Two classes write yellow text:

- `text--yellow`: the pure yellow. 
- `text--yellow-{step}`: a step on the yellow ladder (e.g. text--yellow-50), on the same 10 to 75 scale as grayscale. 

Aa
yellow-10

Aa
yellow-15

Aa
yellow-20

Aa
yellow-25

Aa
yellow-30

Aa
yellow-35

Aa
yellow-40

Aa
yellow

Aa
yellow-45

Aa
yellow-50

Aa
yellow-55

Aa
yellow-60

Aa
yellow-65

Aa
yellow-70

Aa
yellow-75

Aa
yellow-10

Aa
yellow-15

Aa
yellow-20

Aa
yellow-25

Aa
yellow-30

Aa
yellow-35

Aa
yellow-40

Aa
yellow

Aa
yellow-45

Aa
yellow-50

Aa
yellow-55

Aa
yellow-60

Aa
yellow-65

Aa
yellow-70

Aa
yellow-75

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TextYellow

```
<div class="text--yellow-10">Yellow-10 text</div>
<div class="text--yellow-15">Yellow-15 text</div>
<div class="text--yellow-20">Yellow-20 text</div>
<div class="text--yellow-25">Yellow-25 text</div>
<div class="text--yellow-30">Yellow-30 text</div>
<div class="text--yellow-35">Yellow-35 text</div>
<div class="text--yellow-40">Yellow-40 text</div>
<div class="text--yellow">Yellow text</div>
<div class="text--yellow-45">Yellow-45 text</div>
<div class="text--yellow-50">Yellow-50 text</div>
<div class="text--yellow-55">Yellow-55 text</div>
<div class="text--yellow-60">Yellow-60 text</div>
<div class="text--yellow-65">Yellow-65 text</div>
<div class="text--yellow-70">Yellow-70 text</div>
<div class="text--yellow-75">Yellow-75 text</div>
```

### Lime

Two classes write lime text:

- `text--lime`: the pure lime. 
- `text--lime-{step}`: a step on the lime ladder (e.g. text--lime-50), on the same 10 to 75 scale as grayscale. 

Aa
lime-10

Aa
lime-15

Aa
lime-20

Aa
lime-25

Aa
lime-30

Aa
lime-35

Aa
lime-40

Aa
lime

Aa
lime-45

Aa
lime-50

Aa
lime-55

Aa
lime-60

Aa
lime-65

Aa
lime-70

Aa
lime-75

Aa
lime-10

Aa
lime-15

Aa
lime-20

Aa
lime-25

Aa
lime-30

Aa
lime-35

Aa
lime-40

Aa
lime

Aa
lime-45

Aa
lime-50

Aa
lime-55

Aa
lime-60

Aa
lime-65

Aa
lime-70

Aa
lime-75

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TextLime

```
<div class="text--lime-10">Lime-10 text</div>
<div class="text--lime-15">Lime-15 text</div>
<div class="text--lime-20">Lime-20 text</div>
<div class="text--lime-25">Lime-25 text</div>
<div class="text--lime-30">Lime-30 text</div>
<div class="text--lime-35">Lime-35 text</div>
<div class="text--lime-40">Lime-40 text</div>
<div class="text--lime">Lime text</div>
<div class="text--lime-45">Lime-45 text</div>
<div class="text--lime-50">Lime-50 text</div>
<div class="text--lime-55">Lime-55 text</div>
<div class="text--lime-60">Lime-60 text</div>
<div class="text--lime-65">Lime-65 text</div>
<div class="text--lime-70">Lime-70 text</div>
<div class="text--lime-75">Lime-75 text</div>
```

### Green

Two classes write green text:

- `text--green`: the pure green. 
- `text--green-{step}`: a step on the green ladder (e.g. text--green-50), on the same 10 to 75 scale as grayscale. 

Aa
green-10

Aa
green-15

Aa
green-20

Aa
green-25

Aa
green-30

Aa
green-35

Aa
green-40

Aa
green

Aa
green-45

Aa
green-50

Aa
green-55

Aa
green-60

Aa
green-65

Aa
green-70

Aa
green-75

Aa
green-10

Aa
green-15

Aa
green-20

Aa
green-25

Aa
green-30

Aa
green-35

Aa
green-40

Aa
green

Aa
green-45

Aa
green-50

Aa
green-55

Aa
green-60

Aa
green-65

Aa
green-70

Aa
green-75

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TextGreen

```
<div class="text--green-10">Green-10 text</div>
<div class="text--green-15">Green-15 text</div>
<div class="text--green-20">Green-20 text</div>
<div class="text--green-25">Green-25 text</div>
<div class="text--green-30">Green-30 text</div>
<div class="text--green-35">Green-35 text</div>
<div class="text--green-40">Green-40 text</div>
<div class="text--green">Green text</div>
<div class="text--green-45">Green-45 text</div>
<div class="text--green-50">Green-50 text</div>
<div class="text--green-55">Green-55 text</div>
<div class="text--green-60">Green-60 text</div>
<div class="text--green-65">Green-65 text</div>
<div class="text--green-70">Green-70 text</div>
<div class="text--green-75">Green-75 text</div>
```

### Cyan

Two classes write cyan text:

- `text--cyan`: the pure cyan. 
- `text--cyan-{step}`: a step on the cyan ladder (e.g. text--cyan-50), on the same 10 to 75 scale as grayscale. 

Aa
cyan-10

Aa
cyan-15

Aa
cyan-20

Aa
cyan-25

Aa
cyan-30

Aa
cyan-35

Aa
cyan-40

Aa
cyan

Aa
cyan-45

Aa
cyan-50

Aa
cyan-55

Aa
cyan-60

Aa
cyan-65

Aa
cyan-70

Aa
cyan-75

Aa
cyan-10

Aa
cyan-15

Aa
cyan-20

Aa
cyan-25

Aa
cyan-30

Aa
cyan-35

Aa
cyan-40

Aa
cyan

Aa
cyan-45

Aa
cyan-50

Aa
cyan-55

Aa
cyan-60

Aa
cyan-65

Aa
cyan-70

Aa
cyan-75

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TextCyan

```
<div class="text--cyan-10">Cyan-10 text</div>
<div class="text--cyan-15">Cyan-15 text</div>
<div class="text--cyan-20">Cyan-20 text</div>
<div class="text--cyan-25">Cyan-25 text</div>
<div class="text--cyan-30">Cyan-30 text</div>
<div class="text--cyan-35">Cyan-35 text</div>
<div class="text--cyan-40">Cyan-40 text</div>
<div class="text--cyan">Cyan text</div>
<div class="text--cyan-45">Cyan-45 text</div>
<div class="text--cyan-50">Cyan-50 text</div>
<div class="text--cyan-55">Cyan-55 text</div>
<div class="text--cyan-60">Cyan-60 text</div>
<div class="text--cyan-65">Cyan-65 text</div>
<div class="text--cyan-70">Cyan-70 text</div>
<div class="text--cyan-75">Cyan-75 text</div>
```

### Blue

Two classes write blue text:

- `text--blue`: the pure blue. 
- `text--blue-{step}`: a step on the blue ladder (e.g. text--blue-50), on the same 10 to 75 scale as grayscale. 

Aa
blue-10

Aa
blue-15

Aa
blue-20

Aa
blue-25

Aa
blue-30

Aa
blue-35

Aa
blue-40

Aa
blue

Aa
blue-45

Aa
blue-50

Aa
blue-55

Aa
blue-60

Aa
blue-65

Aa
blue-70

Aa
blue-75

Aa
blue-10

Aa
blue-15

Aa
blue-20

Aa
blue-25

Aa
blue-30

Aa
blue-35

Aa
blue-40

Aa
blue

Aa
blue-45

Aa
blue-50

Aa
blue-55

Aa
blue-60

Aa
blue-65

Aa
blue-70

Aa
blue-75

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TextBlue

```
<div class="text--blue-10">Blue-10 text</div>
<div class="text--blue-15">Blue-15 text</div>
<div class="text--blue-20">Blue-20 text</div>
<div class="text--blue-25">Blue-25 text</div>
<div class="text--blue-30">Blue-30 text</div>
<div class="text--blue-35">Blue-35 text</div>
<div class="text--blue-40">Blue-40 text</div>
<div class="text--blue">Blue text</div>
<div class="text--blue-45">Blue-45 text</div>
<div class="text--blue-50">Blue-50 text</div>
<div class="text--blue-55">Blue-55 text</div>
<div class="text--blue-60">Blue-60 text</div>
<div class="text--blue-65">Blue-65 text</div>
<div class="text--blue-70">Blue-70 text</div>
<div class="text--blue-75">Blue-75 text</div>
```

### Violet

Two classes write violet text:

- `text--violet`: the pure violet. 
- `text--violet-{step}`: a step on the violet ladder (e.g. text--violet-50), on the same 10 to 75 scale as grayscale. 

Aa
violet-10

Aa
violet-15

Aa
violet-20

Aa
violet-25

Aa
violet-30

Aa
violet-35

Aa
violet-40

Aa
violet

Aa
violet-45

Aa
violet-50

Aa
violet-55

Aa
violet-60

Aa
violet-65

Aa
violet-70

Aa
violet-75

Aa
violet-10

Aa
violet-15

Aa
violet-20

Aa
violet-25

Aa
violet-30

Aa
violet-35

Aa
violet-40

Aa
violet

Aa
violet-45

Aa
violet-50

Aa
violet-55

Aa
violet-60

Aa
violet-65

Aa
violet-70

Aa
violet-75

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TextViolet

```
<div class="text--violet-10">Violet-10 text</div>
<div class="text--violet-15">Violet-15 text</div>
<div class="text--violet-20">Violet-20 text</div>
<div class="text--violet-25">Violet-25 text</div>
<div class="text--violet-30">Violet-30 text</div>
<div class="text--violet-35">Violet-35 text</div>
<div class="text--violet-40">Violet-40 text</div>
<div class="text--violet">Violet text</div>
<div class="text--violet-45">Violet-45 text</div>
<div class="text--violet-50">Violet-50 text</div>
<div class="text--violet-55">Violet-55 text</div>
<div class="text--violet-60">Violet-60 text</div>
<div class="text--violet-65">Violet-65 text</div>
<div class="text--violet-70">Violet-70 text</div>
<div class="text--violet-75">Violet-75 text</div>
```

### Purple

Two classes write purple text:

- `text--purple`: the pure purple. 
- `text--purple-{step}`: a step on the purple ladder (e.g. text--purple-50), on the same 10 to 75 scale as grayscale. 

Aa
purple-10

Aa
purple-15

Aa
purple-20

Aa
purple-25

Aa
purple-30

Aa
purple-35

Aa
purple-40

Aa
purple

Aa
purple-45

Aa
purple-50

Aa
purple-55

Aa
purple-60

Aa
purple-65

Aa
purple-70

Aa
purple-75

Aa
purple-10

Aa
purple-15

Aa
purple-20

Aa
purple-25

Aa
purple-30

Aa
purple-35

Aa
purple-40

Aa
purple

Aa
purple-45

Aa
purple-50

Aa
purple-55

Aa
purple-60

Aa
purple-65

Aa
purple-70

Aa
purple-75

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TextPurple

```
<div class="text--purple-10">Purple-10 text</div>
<div class="text--purple-15">Purple-15 text</div>
<div class="text--purple-20">Purple-20 text</div>
<div class="text--purple-25">Purple-25 text</div>
<div class="text--purple-30">Purple-30 text</div>
<div class="text--purple-35">Purple-35 text</div>
<div class="text--purple-40">Purple-40 text</div>
<div class="text--purple">Purple text</div>
<div class="text--purple-45">Purple-45 text</div>
<div class="text--purple-50">Purple-50 text</div>
<div class="text--purple-55">Purple-55 text</div>
<div class="text--purple-60">Purple-60 text</div>
<div class="text--purple-65">Purple-65 text</div>
<div class="text--purple-70">Purple-70 text</div>
<div class="text--purple-75">Purple-75 text</div>
```

### Pink

Two classes write pink text:

- `text--pink`: the pure pink. 
- `text--pink-{step}`: a step on the pink ladder (e.g. text--pink-50), on the same 10 to 75 scale as grayscale. 

Aa
pink-10

Aa
pink-15

Aa
pink-20

Aa
pink-25

Aa
pink-30

Aa
pink-35

Aa
pink-40

Aa
pink

Aa
pink-45

Aa
pink-50

Aa
pink-55

Aa
pink-60

Aa
pink-65

Aa
pink-70

Aa
pink-75

Aa
pink-10

Aa
pink-15

Aa
pink-20

Aa
pink-25

Aa
pink-30

Aa
pink-35

Aa
pink-40

Aa
pink

Aa
pink-45

Aa
pink-50

Aa
pink-55

Aa
pink-60

Aa
pink-65

Aa
pink-70

Aa
pink-75

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)TextPink

```
<div class="text--pink-10">Pink-10 text</div>
<div class="text--pink-15">Pink-15 text</div>
<div class="text--pink-20">Pink-20 text</div>
<div class="text--pink-25">Pink-25 text</div>
<div class="text--pink-30">Pink-30 text</div>
<div class="text--pink-35">Pink-35 text</div>
<div class="text--pink-40">Pink-40 text</div>
<div class="text--pink">Pink text</div>
<div class="text--pink-45">Pink-45 text</div>
<div class="text--pink-50">Pink-50 text</div>
<div class="text--pink-55">Pink-55 text</div>
<div class="text--pink-60">Pink-60 text</div>
<div class="text--pink-65">Pink-65 text</div>
<div class="text--pink-70">Pink-70 text</div>
<div class="text--pink-75">Pink-75 text</div>
```

### Backward Compatibility

For backward compatibility, the original shade names (`gray-1` through `gray-7`) are still supported but deprecated. Each maps to one of the new shade names:

```
<!-- Deprecated (but still works) -->
<div class="text--gray-1">Gray 1 text (deprecated)</div>
<div class="text--gray-2">Gray 2 text (deprecated)</div>

<!-- Preferred (new naming) -->
<div class="text--gray-10">Gray 10 text (preferred)</div>
<div class="text--gray-20">Gray 20 text (preferred)</div>
```

### Responsive Features

Text color classes support size, orientation, and bit-depth variants. Bit-depth prefixes like `1bit:`, `2bit:`, and `4bit:` set the shade for a specific device color depth. The demos above use them together, for example `1bit:text--black 2bit:text--gray-55 4bit:text--gray-60`.

#### Breakpoint Prefixes

Use breakpoint prefixes like `sm:`, `md:`, `lg:` to apply different colors per device size class.

Responsive color

Gray 50 by default, gray 30 on md+

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Text ColorResponsive

```
<!-- Text color: different shades at different breakpoints -->
<span class="value text--gray-50 md:text--gray-30">Responsive color</span>

<!-- Progressive color scaling -->
<span class="value text--gray-70 sm:text--gray-50 md:text--gray-30 lg:text--black">Progressive color</span>

<!-- Chromatic color at breakpoints -->
<span class="value text--red sm:text--blue lg:text--green">Responsive chromatic color</span>
```

#### Orientation and Size+Orientation

Text colors can adapt to orientation with `portrait:` and `landscape:`, and can be combined with size breakpoints (e.g., `md:portrait:`).

```
<!-- Different color in portrait -->
<span class="value text--gray-50 portrait:text--black">Orientation color variant</span>

<!-- Combined size and orientation -->
<span class="value text--gray-50 md:portrait:text--gray-30">Color on md+ portrait</span>
```

### Patterned Ink on a Filled Element

On a screen with no true gray, a gray shade is painted as a pattern clipped to the letters. That pattern uses the element's one background, so a patterned text color and a `bg--{shade}` fill cannot sit on the same element. Put the fill on the box and the text color on an element inside it; black and white never need this, because they are real colors.

```
<!-- Both want the one background -->
<div class="bg--white text--gray-50">Mon 8/3</div>

<!-- Fill on the box, ink on an element inside it -->
<div class="bg--white"><span class="text--gray-50">Mon 8/3</span></div>
```

### Related APIs

#### Reading text paint from JavaScript

The `text(token, { el })` resolver returns the exact paint a `text--{token}` utility would apply, as a canonical Fill read from the live cascade with bit depth, dark mode, and theme resolved. Apply it to canvases, SVGs, or chart options. See [Painting Colors](/framework/docs/3.4/paint_colors) for every resolver and the Fill shape.

```
var fill = TRMNLPaint.text("gray-45", { el: "my-node" });
```

 Previous  [ 

## Text Alignment

Control text alignment with responsive breakpoint, orientation, and bit-depth variants

 ](/framework/docs/3.4/text_alignment)

 Next  [ 

## Text Stroke

Legible text when displayed on shaded backgrounds

 ](/framework/docs/3.4/text_stroke)

