# Aspect Ratio

Hold an element to a fixed width-to-height ratio. The utilities set the native CSS aspect-ratio property, so images, charts, and containers keep their proportions at any screen size.

### Basic Usage

Use predefined aspect ratio classes to constrain element dimensions to specific proportions. These utilities apply the CSS `aspect-ratio` property directly to elements.

1:1

16:9

3:4

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Aspect RatioBasic Usage

```
<!-- Square aspect ratio -->
<div class="aspect--1/1">...</div>

<!-- Widescreen aspect ratio -->
<div class="aspect--16/9">...</div>

<!-- Portrait aspect ratio -->
<div class="aspect--3/4">...</div>
```

### Responsive Behavior

Aspect ratio utilities take the framework's responsive prefixes. A prefixed class overrides the base ratio whenever the screen matches, so one tile can sit square on most screens and go portrait on a tall one.

The prefixes are `sm:`, `md:`, `lg:`, `landscape:`, `portrait:`, and the combined `size:orientation` forms. Aspect ratio carries no bit-depth variants. See [Responsive](/framework/docs/3.1/responsive) for the size class each device carries.

Cover1:1, portrait 3:4

Chart4:3, lg 16:9

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Aspect RatioResponsive Behavior

```
<!-- Square, 3:4 on portrait screens -->
<div class="aspect--1/1 portrait:aspect--3/4">...</div>

<!-- 4:3, widescreen on large screens and up -->
<div class="aspect--4/3 lg:aspect--16/9">...</div>

<!-- Widescreen on large landscape screens only -->
<div class="aspect--1/1 lg:landscape:aspect--16/9">...</div>
```

## Available Aspect Ratios

Complete reference of all available aspect ratio utilities.

| Class | Ratio |
| --- | --- |
| `aspect--auto` | No constraints |
| `aspect--1/1` | 1:1 |
| `aspect--4/3` | 4:3 |
| `aspect--3/2` | 3:2 |
| `aspect--16/9` | 16:9 |
| `aspect--21/9` | 21:9 |
| `aspect--3/4` | 3:4 |
| `aspect--2/3` | 2:3 |
| `aspect--9/16` | 9:16 |
| `aspect--9/21` | 9:21 |

 Previous  [ 

## Grid

Create grid layouts with predefined column structures

 ](/framework/docs/3.1/grid)

 Next  [ 

## Responsive

Adapt styles to the device's size class, orientation, and bit depth using variant prefixes

 ](/framework/docs/3.1/responsive)

