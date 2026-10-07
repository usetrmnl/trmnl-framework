# Border

The Border system creates the illusion of grayscale borders through carefully designed dither patterns. When rendered on 1-bit displays, these patterns create varying border intensities using alternating black and white pixels.

### Usage

Apply borders using `border--h-{n}` for horizontal borders and `border--v-{n}` for vertical borders, where n ranges from 1 (lightest) to 7 (darkest).

#### Horizontal Borders

1

2

3

4

5

6

7

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Horizontal Borders

```
<div class="border--h-1">Horizontal Border 1</div>
<div class="border--h-2">Horizontal Border 2</div>
<div class="border--h-3">Horizontal Border 3</div>
<div class="border--h-4">Horizontal Border 4</div>
<div class="border--h-5">Horizontal Border 5</div>
<div class="border--h-6">Horizontal Border 6</div>
<div class="border--h-7">Horizontal Border 7</div>
```

#### Vertical Borders

1

2

3

4

5

6

7

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Vertical Borders

```
<div class="border--v-1">Vertical Border 1</div>
<div class="border--v-2">Vertical Border 2</div>
<div class="border--v-3">Vertical Border 3</div>
<div class="border--v-4">Vertical Border 4</div>
<div class="border--v-5">Vertical Border 5</div>
<div class="border--v-6">Vertical Border 6</div>
<div class="border--v-7">Vertical Border 7</div>
```

 Previous  [ 

## Background

Apply color tokens as backgrounds with bg--{token}

 ](/framework/docs/1.2/background)

 Next  [ 

## Overflow

Handle column items overflow

 ](/framework/docs/1.2/overflow)

