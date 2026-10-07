# Outline

The Outline utility draws a pixel-perfect dotted rounded border on any element. On 1-bit displays it places single-pixel dots at exact integer coordinates with pure CSS gradients; on 2-bit, 4-bit, and full-color displays it draws a standard CSS border with border-radius instead.

### Basic Usage

#### Applying an Outline

Add the `outline` class to any element to give it a pixel-perfect rounded border.

The class rounds the element itself to 8px, the same curve the dots trace. A card with a background of its own ends on that curve rather than squaring off around the outline.

With outline

Without outline

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Outline UtilityDesign System

```
<!-- Add outline to any element -->
<div class="outline">
  Content with pixel-perfect rounded border
</div>
```

#### Muted Outline

`outline--muted` draws the same edge in a mid gray, quiet enough to sit over detailed content. The gray is dark enough to still print on a 1-bit screen, so the element keeps its edge on every device.

outline

outline--muted

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Outline UtilityMuted

```
<!-- A quieter edge for a card over busy art -->
<div class="outline outline--muted">
  Content with a mid-gray border
</div>
```

### How It Works

The outline draws every dot with CSS backgrounds, 56 layers in total, so each dot lands on an exact pixel. Four edge layers repeat a 1px dot every 4px, and sixteen corner layers place one 1x1px dot each. The remaining 36 are corner fill-ins that stay invisible until a device with a dither pixel ratio of 2 or more turns them on.

`dither-pixel-ratio` is a separate profile field from `pixel-ratio`. TRMNL V2 previews at pixel ratio 1.8 and still renders its art at double density, so it gets the fill-ins.

#### CSS Gradient Dots

The dots are generated gradients, not image files, so they stay on the pixel grid at any element size.

The dot color is looked up in three steps, and the first one set wins: `--framework-semantic-border-strong-border-color`, then `--framework-outline-strong`, then `--framework-border-strong`. A theme sets the first through `theme-slots.semantic-border`, so a theme recolors the outline with no extra assets.

```
/* How the CSS works internally (simplified) */
.outline::after {
    background:
        /* Edges: repeating 1px dot every 4px */
        repeating-linear-gradient(to right, black 0 1px, transparent 1px 4px)
            12px 0 / calc(100% - 24px) 1px no-repeat,
        /* ... 3 more edges ... */
        /* Corners: individual 1x1px dots */
        linear-gradient(black, black) 8px 0 / 1px 1px no-repeat,
        linear-gradient(black, black) 4px 1px / 1px 1px no-repeat,
        /* ... 14 more corner dots ... */
        /* ... 36 high-DPI corner fill-ins ... */
}
```

### Bit-Depth Behavior

#### 1-bit Displays

1-bit displays get the gradient dots. Dark mode works automatically because `--framework-semantic-border-strong-border-color` flips to white.

#### 2-bit, 4-bit, and Full-Color Displays

Draws a standard 1px solid border instead: with real grays or full color available, a smooth line beats dots. Both treatments round on the same 8px curve, scaled by the UI scale.

```
/* 1-bit: CSS gradient dots (via outline-dots mixin) */
.outline::after {
    @include outline-dots;
}

/* 2-bit, 4-bit, and full color: falls back to a CSS border */
.screen--2bit .outline::after,
.screen--4bit .outline::after,
.screen--color-full .outline::after {
    background: none;
    border: 1px solid var(--framework-semantic-border-strong-border-color,
        var(--framework-outline-strong, var(--framework-border-strong)));
    border-radius: calc(8px * var(--ui-scale, 1));
}
```

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| `--rounded-full` | 9999px | - | - | - |
| `--rounded-large` | 20px | - | - | - |
| `--rounded-medium` | 15px | - | - | - |
| `--rounded-none` | 0px | - | - | - |
| `--rounded-small` | 7px | - | - | - |
| `--rounded-xlarge` | 25px | - | - | - |
| `--rounded-xsmall` | 5px | - | - | - |
| `--rounded-xxlarge` | 30px | - | - | - |

 Previous  [ 

## Rounded

Control element rounding with predefined values

 ](/framework/docs/3.4/rounded)

 Next  [ 

## Image

Place images with size, object fit, dithering, inversion, and adaptive icon utilities

 ](/framework/docs/3.4/image)

