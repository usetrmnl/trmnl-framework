# Border

Draw a horizontal or vertical rule on any element with the border--h and border--v utilities, named on the same 10 to 75 shade scale as backgrounds. On 1-bit displays a step renders as a dither pattern of black and white pixels, so a rule can read as gray. 4-bit and full-color screens draw all 14 steps; everywhere else two neighboring steps share a line.

### Usage

Use `border--h-{step}` and `border--v-{step}` with steps 10 to 75, the same shade scale as backgrounds, plus black and white lines in both directions (`border--h-black`, `border--h-white`, and their `v-` counterparts). Borders render grayscale by default; a theme recolors all of them.

4-bit and full-color screens give each of the 14 steps its own shade. Everywhere else (1-bit, 2-bit, the limited palettes, and screens with no mode class) two neighboring steps share a line, so `border--h-40` and `border--h-45` draw the same line.

Pick steps 10 apart, like 40 and 50, when two lines have to read differently on a 1-bit panel.

The numbered level classes (`border--h-1` through `border--h-7`, and their vertical counterparts) are deprecated and will be removed in Framework 4.0. Use the step classes in new markup.

#### Horizontal Borders

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

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Horizontal Borders

**Dark Mode Notice:** The palette appears inverted because dark mode swaps black and white and mirrors the gray and color ladders. Images are not affected unless they opt in via `image--adaptive`. Themed screens ignore dark mode entirely.

```
<div class="border--h-10">Dark border</div>
<div class="border--h-45">Mid border</div>
<div class="border--h-75">Light border</div>
```

#### Vertical Borders

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

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Vertical Borders

```
<div class="border--v-20">Vertical border</div>
<div class="border--v-65">Vertical border</div>
```

### Themed Borders

Recolor borders from a theme, not with a class: `theme-slots.utility-remap-border-grayscale($hue, $side)` repaints every rule (and `.divider`) in the hue without changing its shape. The `dark` side paints black on the hue, `bright` paints the hue on white. Pick a Style in the screen picker to watch the lines above repaint.

2-bit borders are the exception: their four tones are drawn into the line itself, so a hue remap leaves them black, white, and two grays. That is deliberate: on a 4-tone panel a hue would print as gray anyway.

A theme that wants to change the 2-bit borders swaps levels instead, with `theme-slots.utility-border-level($level, $dir, $from-level)`, the way the shipped Dark theme does. See [Theme Slots](/framework/docs/3.4/theme_slots) .

```
@include theme-slots.utility-remap-border-grayscale("yellow", $side: "dark");
@include theme-slots.utility-remap-border-grayscale("red", $side: "bright");
```

### Black & White Borders

`border--h-black` and `border--h-white` adapt to themes automatically. They read the theme's strongest and softest fill colors, so they stay the darkest and lightest lines whatever the theme.

black

white

black

white

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Black & White Borders

```
<div class="border--h-black">Black border (strongest fill)</div>
<div class="border--h-white">White border (softest fill)</div>
<div class="border--v-black">Black vertical border</div>
<div class="border--v-white">White vertical border</div>
```

### Borders in JavaScript

JavaScript can read the border lines too: `TRMNLPaint.border(spec, { dir })` returns the line for a step, or for `'black'` / `'white'`, with the device and the active theme already applied. `applyBorder()` paints it onto a node. These lines stay visible in every mode, which makes them the reliable source for JS-drawn hairlines like chart grids; see [Painting Borders](/framework/docs/3.4/paint_borders) .

 Previous  [ 

## Background

Apply color tokens as backgrounds with bg--{token}

 ](/framework/docs/3.4/background)

 Next  [ 

## Rounded

Control element rounding with predefined values

 ](/framework/docs/3.4/rounded)

