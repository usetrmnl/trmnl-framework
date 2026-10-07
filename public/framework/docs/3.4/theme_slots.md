# Theme Slots

This page lists every slot: each part of a screen a theme can recolor, and the mixin that sets it. A slot takes a framework token, not a raw color, so whatever you map still renders correctly on every device.

### Semantic Channels

Start with the semantic channels: a few lines recolor the whole screen, because every component reads them. The set is fixed:

- Backgrounds: `canvas`, `surface`, `backdrop`, `fill-strong`, `fill-muted`, `fill-soft`
- Text: `text-primary`, `text-secondary`, `text-inverse`
- Stroke: `stroke-contrast`
- Borders: `border-strong`, `border-muted`
- Icon: one global channel for `image--adaptive` icons; it defaults to text-primary. See [Image](/framework/docs/3.4/image) .

- `semantic-bg($semantic, $token)`: sets a background channel to a token. 
- `semantic-text($semantic, $token)`: sets a text channel to a token, with everything text needs (color, dither pattern, clipping). 
- `semantic-stroke($semantic, $token)`: sets the stroke channel to a token. 
- `semantic-border($semantic, $token)`: sets a border channel to a token's fill. 
- `semantic-icon($token)`: optional color for adaptive icons; omit it and icons follow text-primary. 

Every semantic mixin takes `$raw: true`, which writes a plain color and skips device rendering; a theme never needs it. See [Authoring Themes](/framework/docs/3.4/theme_authoring) .

```
@include theme-slots.semantic-bg("canvas", "yellow");
@include theme-slots.semantic-bg("surface", "yellow");
@include theme-slots.semantic-text("text-primary", "black");
@include theme-slots.semantic-text("text-secondary", "yellow-30");
@include theme-slots.semantic-stroke("stroke-contrast", "yellow");
@include theme-slots.semantic-border("border-muted", "yellow-30");
```

### Component Slots

Component slots recolor one surface, like the title bar, without moving a whole channel. Each slot is named after the part it colors and takes one kind of paint. These are the slots components read today:

- Background slots: `screen-backdrop`, `title-bar`, `item-meta`, `item-meta-emphasis-2`, `item-meta-emphasis-3`, `progress-track`, `progress-fill`, `progress-fill-emphasis-2`, `progress-fill-emphasis-3`, `progress-dot`, `progress-dot-current`, `table-meta`, `table-meta-device`, `chip`
- Text slots: `label-gray`, `chip`, `title-bar`, `title-bar-instance`
- Border slots: `table-head-row`, `table-body-row`, `label-underline`

`chip` is two slots for one surface: a solid box with readable text on it, for markers the framework has no component for. Its defaults point at the semantic channels (box from `fill-strong`, text from `text-inverse`), so it follows the theme on its own. Set both halves yourself when the box needs a specific pairing, the way White and Red gives it a white box with red text.

Using the wrong mixin on a slot fails silently. Give a background slot `text-slot` and it writes variables no component reads; nothing on the screen changes.

- `bg-slot($slot, $token)`: a slot's background paint. 
- `text-slot($slot, $token)`: a slot's text paint, dither pattern and clipping included. 
- `border-level-slot($slot, $level, $dir: h)`: sets a slot's border to one of the framework border levels. 
- `border-token-slot($slot, $token, $dir: h)`: sets a slot's border to a token's fill instead of a level. 

Slot values cascade down from the screen, so you can set them again on a component or a state wrapper. On an unthemed screen, `inverse` flips its subtree to the opposite scheme. On a themed screen the subtree keeps the theme's slots; the theme itself restates the slots that should flip, as in the example below.

```
@include theme-slots.bg-slot("title-bar", "yellow-40");
@include theme-slots.bg-slot("progress-fill", "yellow-55");
@include theme-slots.text-slot("label-gray", "yellow-30");
@include theme-slots.border-token-slot("label-underline", "yellow-30");

.screen--theme-example .inverse {
    @include theme-slots.bg-slot("progress-fill", "yellow-20");
}
```

### Title-Bar Inks

The title bar is a paired surface like the chip: a field with inks on it. Its background is the `title-bar` background slot above; four more slots recolor what sits on the field without moving the screen-wide channels. Unset, each falls back to exactly what the bar read before: the title follows `text-primary`, the instance follows the title (then `text-secondary` on 2-bit and up), the icon follows the icon channel, and halos follow `stroke-contrast`.

- `ink-slot($slot, $token)`: a text slot plus the solid companion inherited `color` needs; use it for `title-bar` and `title-bar-instance`. 
- `icon-slot($slot, $token)`: paint for the bar's mask-recolored icon, ahead of the global icon channel. 
- `stroke-slot($slot, $token)`: the halo outline around the bar's glyphs and icon. Point it at the bar's own field tone so outlines separate ink from fill instead of tracking the canvas. 

```
// A black bar with white title and icon.
@include theme-slots.bg-slot("title-bar", "black");
@include theme-slots.ink-slot("title-bar", "white");
@include theme-slots.ink-slot("title-bar-instance", "gray-60");
@include theme-slots.icon-slot("title-bar", "white");
@include theme-slots.stroke-slot("title-bar", "black");
```

### Item Cards

An item is a paired surface, a fill on the card and the ink its content takes over that fill. Set the two together so a theme that darkens the card carries its text with it.

- `item-fill($token)`: the card's background, from a palette token. 
- `item-ink($token)`: the color the card's content takes. It repoints the primary text channel inside the card rather than restating each element, so `label--gray` and its siblings keep working. 
- `item-fill-art($art, $size, $repeat)`: art in place of a token tile. Unset, it takes the generated ordered-dither ramp for the current rail, tiled down the card at its own width. Never scale a ramp: stretching it re-blurs the pixels the dither already decided. 
- `item-border($art)`: the card's edge. Two arts ship, `--framework-item-border-art-outline`, the same drawing [Outline](/framework/docs/3.4/outline) uses, and `--framework-item-border-art-corner-brackets`. The mixin sets the matching corner radius: brackets stay square, dotted outlines keep their drawn curve, and solid outlines follow the theme's corner setting. 

The border art is declared on `.item` itself, because a `var()` inside a custom property resolves on the element that declares it. The card reads it as both a background and a border, and whichever one the art is invalid for drops out, which is how one value covers every bit depth.

For custom art, set `--framework-slot-item-border-radius` on `.item` to control its clipping. Use `0px` for drawings with square corners.

```
// A dithered card with light text and a dotted edge.
@include theme-slots.item-fill("gray-20");
@include theme-slots.item-ink("white");
@include theme-slots.item-fill-art();
@include theme-slots.item-border(var(--framework-item-border-art-outline));
@include theme-slots.spacing-slots($item-padding-x: 12px, $item-padding-y: 8px);
```

### Custom Typefaces

A theme can also give the screen its own font with `theme-slots.typeface($family)`. See [Custom Typefaces](/framework/docs/3.4/custom_typefaces) .

### Structure and Weight

Structure moves through factors: unitless multipliers over the unthemed geometry, so 1 is always the unthemed screen and every device density stays correct underneath. `layout-factors($whitespace, $corners, $title-bar-height, $progress)` takes any subset. Whitespace rides the content scale, so gaps, pads, and table rows breathe together; corners ride every radius, named and component-owned alike (0 squares the screen off); the other two size the title bar with its icon, and the progress bars and dots.

`font-weight-shift($shift)` moves every vector role weight by one signed amount, clamped to renderable weights where it lands. The bitmap bundles carry single-weight faces and ignore it. Explicit utilities (`text--bold`, numeric `rounded--*` values) stay literal: they are a plugin author's stated intent, not a theme default.

`text-modifiers(...)` sets case and tracking per text role, as a `$<role>-transform` and a `$<role>-tracking` pair. The roles are title, value, label and description, the title bar's own title and instance, and table heads and bodies, with table bodies taking tracking alone. Sizes and line heights are deliberately not part of it: those are the device and reader scale axes, and a theme that moved them would fight the reader's own text-scale setting.

`spacing-slots($title-bar-padding, $item-padding-x, $item-padding-y)` sets the padding a theme owns. The title bar takes a factor over the screen gap, where 0 sits its content flush with the edge. The item pair takes literal lengths, because an item pads by nothing unthemed and no factor lifts a value off zero.

Tracking takes whole positive pixels, and the mixin refuses anything else. The bitmap bundles are drawn on the pixel grid, so a fractional advance from an `em` value puts their glyphs off-grid, and a negative one eats sidebearings that are part of the drawing. Adding a whole pixel between letters is the one move that stays on the grid.

```
// Airy, square-cornered, slightly bolder, editorial labels.
@include theme-slots.layout-factors($whitespace: 1.35, $corners: 0);
@include theme-slots.font-weight-shift(100);
@include theme-slots.text-modifiers($label-transform: uppercase, $label-tracking: 1px);
```

### Utility Remaps

Utility remaps recolor the raw palette utilities (`bg--*`, `text--*`, `text-stroke--*`), so markup that says `bg--gray-50` follows the theme without edits.

- `utility-remap-grayscale($to-hue, $side)`: the bulk remap, moving the whole grayscale ladder to a hue; `$side` controls how. 
- `utility-remap-border-grayscale($to-hue, $side)`: the same remap for border lines: their two inks recolor, their patterns keep their shape. 
- `utility-bg($token, $remap-to)` / `utility-text($token, $remap-to)` / `utility-stroke($token, $remap-to)`: remap one utility token, for exceptions on top of a bulk remap. 
- `utility-border-token($level, $dir, $token)`: remap one border level and direction to a token's paint. 
- `utility-border-level($level, $dir, $from-level)`: swap one border level for another level's line art, colors and rendering included. The 2-bit borders need this mixin: their four tones are drawn into the line itself, where no token remap can reach them. Restating a level onto itself is not a no-op: it also pins the two ink colors the level's line draws with. 

The `$side` values: `'dark'` (default) presses the grays into the hue's dark steps 10 to 40, keeps black as ink, and sends white to the hue. `'bright'` presses them into steps 45 to 75, sends black to the hue, and keeps white. `'linear'` maps gray steps to hue steps 1:1.

Strokes are the one exception: whichever token maps to the hue itself keeps a visible stroke, taken from the nearest hue step (45 under bright, 40 under dark, 75 under linear), so outlines never dissolve into the canvas.

Black and Yellow remaps to the dark side, and White and Red remaps to the bright side with one exception, `utility-bg("white", "red")`, so white surfaces turn red while white text stays ink. Dark flips the grayscale token by token with the single-token remaps, and uses `utility-border-level` for the 2-bit borders and for the one level that maps to itself.

```
// White and Red: bright-side remap with one exception.
@include theme-slots.utility-remap-grayscale("red", $side: "bright");
@include theme-slots.utility-remap-border-grayscale("red", $side: "bright");
@include theme-slots.utility-bg("white", "red");
```

### Border Levels and Lines

Border levels are the seven steps the framework draws borders in: 1 is black, 2 through 6 step through the grays (gray-15, gray-30, gray-40, gray-50, gray-65), 7 is white, each with an `h` and a `v` direction. `border-level-slot` sets a component's border to a level; `utility-border-token` recolors a level itself, and `utility-remap-border-grayscale` recolors the two line inks in bulk. See [Border](/framework/docs/3.4/border) and [Divider](/framework/docs/3.4/divider) for how levels render.

Every border slot and remap changes two things at once: the CSS line, and what `TRMNLPaint.border()` and `TRMNLPaint.divider()` hand to JavaScript. Bind a slot to a level and JavaScript gets that level's pattern. Bind it to a token and JavaScript gets a flat line in the token's stroke color, because only levels have patterns.

### The Chart Ramp

`chart-series-ramp($tokens, $span: 6)` sets the colors charts pick their series from: list the tokens in order, strongest contrast against the background first, and series 0 gets the first one. Each entry keeps the token's own rendering, so series dither or paint solid per device. JavaScript spreads series across the first `$span` entries of the list.

A short list is safe. The ramp always has 16 entries; the ones past your last token are cleared instead of keeping the framework's default grays, and `$span` never reaches past your last token.

Charts read the ramp through `TRMNLPaint.series()`; see [Painting Charts](/framework/docs/3.4/paint_charts) and [Chart](/framework/docs/3.4/chart) .

```
@include theme-slots.chart-series-ramp((
    black, yellow-10, yellow-20, yellow-30, yellow-40, yellow-55, yellow-75, yellow
));
```

### Where This Applies

[ 

## Border

 ](/framework/docs/3.4/border)[ 

## Colors

 ](/framework/docs/3.4/colors)[ 

## Title Bar

 ](/framework/docs/3.4/title_bar)[ 

## Label

 ](/framework/docs/3.4/label)[ 

## Item

 ](/framework/docs/3.4/item)[ 

## Table

 ](/framework/docs/3.4/table)[ 

## Progress

 ](/framework/docs/3.4/progress)

 Previous  [ 

## Authoring Themes

How to build your own theme: start from the boilerplate, map the slots, register the id, and lint

 ](/framework/docs/3.4/theme_authoring)

 Next  [ 

## CSS Variables

The CSS variable contract: which families are public, which are internal, and who reads, changes, and generates them

 ](/framework/docs/3.4/variables_api)

