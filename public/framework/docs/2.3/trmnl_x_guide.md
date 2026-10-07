# TRMNL X Guide

TRMNL X is a larger, 4-bit ePaper display. This guide covers everything that changed in the Framework to support it. Your existing plugins will continue to work, but by adopting these new features you can build layouts that take full advantage of the larger screen, portrait orientation, and expanded grayscale.

### The --base Modifier

Every element and component now supports an explicit `--base` size modifier. It produces the exact same result as using the class without any size modifier, but it lets you **reset to the default size at a specific breakpoint**.

Previously, if you set a smaller size for compact screens, there was no way to undo it at a larger breakpoint. Now you can:

```
<!-- Small title on compact screens, default size on large screens -->
<span class="title title--small lg:title--base">Dashboard</span>

<!-- Extra-small value by default, normal size on medium+ screens -->
<span class="value value--xsmall md:value--base">48,206</span>

<!-- Small gap by default, standard gap on large screens -->
<div class="flex flex--col gap--small lg:gap--base">...</div>
```

The `--base` modifier is available on:

- **Typography:** [Title](/framework/docs/2.3/title) (`title--base`), [Value](/framework/docs/2.3/value) (`value--base`), [Label](/framework/docs/2.3/label) (`label--base`), [Description](/framework/docs/2.3/description) (`description--base`)
- **Rich Text:** [Rich Text](/framework/docs/2.3/rich_text) (`content--base`)
- **Components:** [Table](/framework/docs/2.3/table) (`table--base`), [Progress](/framework/docs/2.3/progress) (`progress-bar--base`, `progress-dots--base`)
- **Utilities:** [Gap](/framework/docs/2.3/gap) (`gap--base`), [Rounded](/framework/docs/2.3/rounded) (`rounded--base`), [Text Stroke](/framework/docs/2.3/text_stroke) (`text-stroke--base`), [Image Stroke](/framework/docs/2.3/image_stroke) (`image-stroke--base`)

### New Larger Typography Sizes

To take full advantage of TRMNL X's larger display, new size tiers have been added across all typography elements. All new sizes support responsive prefixes and render correctly on 2-bit and 4-bit screens.

#### Value

Four new sizes for hero-style numbers and display text. See the [Value](/framework/docs/2.3/value) docs for full details.

```
<span class="value value--mega">42</span> <!-- 170px -->
<span class="value value--giga">42</span> <!-- 220px -->
<span class="value value--tera">42</span> <!-- 290px -->
<span class="value value--peta">42</span> <!-- 380px -->

<!-- Responsive example: xxxlarge on OG, giga on X -->
<span class="value value--xxxlarge lg:value--giga">42</span>
```

#### Title

Three new large sizes for headings. See the [Title](/framework/docs/2.3/title) docs.

```
<span class="title title--large">Heading</span> <!-- 30px -->
<span class="title title--xlarge">Heading</span> <!-- 35px -->
<span class="title title--xxlarge">Heading</span> <!-- 40px -->
```

#### Label, Description, Rich Text

New large sizes for [Label](/framework/docs/2.3/label) (`label--large`, `label--xlarge`, `label--xxlarge`), [Description](/framework/docs/2.3/description) (`description--large`, `description--xlarge`, `description--xxlarge`), and [Rich Text](/framework/docs/2.3/rich_text) content (`content--xlarge`, `content--xxlarge`, `content--xxxlarge`).

### Container Query Units

The [Layout](/framework/docs/2.3/layout) element now establishes a CSS Container Query context, enabling a new set of container-relative sizing utilities. Unlike viewport units, these are relative to the layout's dimensions, so they work correctly inside mashup slots (half vertical, quadrant, etc.) where the available space is a fraction of the full screen.

```
<!-- Width as percentage of the layout container -->
<div class="w--[50cqw]">Half the layout width</div>

<!-- Height as percentage of the layout container -->
<div class="h--[80cqh]">80% of layout height</div>

<!-- Min/max constraints -->
<div class="w--min-[30cqw] w--max-[70cqw]">Constrained width</div>

<!-- Responsive container query units -->
<div class="w--[100cqw] lg:w--[50cqw]">Full width on small, half on large</div>
```

Available utilities: `w--[Ncqw]`, `h--[Ncqh]` (0 to 100), plus `w--min-[Ncqw]`, `w--max-[Ncqw]`, `h--min-[Ncqh]`, `h--max-[Ncqh]`. All support responsive variants. See the [Size](/framework/docs/2.3/size) docs for full details.

### Responsive Arbitrary Sizes

The `w--[Npx]` and `h--[Npx]` utilities now support responsive prefixes. Previously, these were static-only. The maximum value has been reduced from 1000px to 800px. See the [Size](/framework/docs/2.3/size) docs.

```
<!-- Responsive arbitrary sizes -->
<div class="w--[150px] md:w--[250px] lg:w--[400px]">Responsive arbitrary width</div>
<div class="h--[100px] portrait:h--[200px]">Orientation-aware height</div>
```

### Responsive Overflow Columns

The [Overflow](/framework/docs/2.3/overflow) engine now reads responsive data attributes to determine how many columns to generate, based on screen size and orientation. Resolution order (most specific wins): size + portrait, then size, then portrait, then base.

```
<!-- 2 columns on small screens, 3 on large -->
<div class="columns"
     data-overflow-max-cols="2"
     data-overflow-max-cols-lg="3">
  ...
</div>

<!-- Different column counts for portrait orientation -->
<div class="columns"
     data-overflow-max-cols="3"
     data-overflow-max-cols-portrait="1"
     data-overflow-max-cols-lg-portrait="2">
  ...
</div>
```

Supported suffixes: `-sm`, `-md`, `-lg`, `-portrait`, `-sm-portrait`, `-md-portrait`, `-lg-portrait`. The same pattern works for `data-overflow-cols` (fixed column count).

### Layout Improvements

#### Axis-Correct stretch-x / stretch-y

`stretch-x` and `stretch-y` now behave correctly relative to the [Layout](/framework/docs/2.3/layout) direction. In `layout--row`, `stretch-x` grows along the horizontal axis and `stretch-y` stretches vertically. In `layout--col`, the axes are swapped. These utilities also now include `min-width: 0` / `min-height: 0` to prevent flex children from overflowing their containers.

#### Responsive Grid Column Spans

The [Grid](/framework/docs/2.3/grid)`col--span-*` classes now work with all responsive prefixes. Responsive parent variants also work: if the grid itself has a responsive prefix (e.g., `portrait:grid`), nested children resolve correctly.

```
<div class="grid grid--cols-6">
  <div class="col--span-6 lg:col--span-3">Full width on small, half on large</div>
  <div class="col--span-6 lg:col--span-3">Full width on small, half on large</div>
</div>

<!-- Portrait reflow -->
<div class="grid grid--cols-2 portrait:grid--cols-1 portrait:gap">
  <div class="item col--span-2 portrait:col--span-1">...</div>
</div>
```

#### Item Component

The [Item](/framework/docs/2.3/item) component now gives `.icon` elements the same flex styling as `.content`. Items in [Flex](/framework/docs/2.3/flex) row containers automatically stretch to match the tallest sibling, and items in [Grid](/framework/docs/2.3/grid) containers stretch to fill their cell height.

### Gap and Rounded Utilities

#### Gap

New [Gap](/framework/docs/2.3/gap) classes: `gap--base` (explicit base, useful for responsive reset), `gap--auto` (distributes space evenly around items), and `gap--distribute` (first item at start, last at end, space between). Arbitrary gaps now start from `gap--[0px]` (previously 5px). `gap--space-between` remains as a legacy alias.

#### Rounded

New [Rounded](/framework/docs/2.3/rounded) class: `rounded--base` (explicit base, 10px). Arbitrary values now start from `rounded--[0px]` (previously 1px).

### Rich Text Improvements

The [Rich Text](/framework/docs/2.3/rich_text) component has several improvements:

- `content--center` now correctly centers text on 4-bit screens.
- Rich text content max-width is now size-aware and adjusts automatically per screen size (small: 380px, medium: 640px, large: 780px). In portrait orientation, it uses the full screen width.
- All content size variants support responsive prefixes.

```
<div class="richtext">
  <div class="content content--small lg:content--base">
    <p>Small on compact devices, default on large screens</p>
  </div>
</div>
```

### Responsive Clamp

The [Clamp](/framework/docs/2.3/clamp) system now supports the `lg` breakpoint.

```
<!-- 2 lines on small/medium, 4 on large, 1 in portrait -->
<span class="label"
      data-clamp="2"
      data-clamp-lg="4"
      data-clamp-portrait="1">
  Long label text...
</span>
```

Available attributes: `data-clamp`, `data-clamp-sm`, `data-clamp-md`, `data-clamp-lg`, `data-clamp-portrait`, `data-clamp-sm-portrait`, `data-clamp-md-portrait`, `data-clamp-lg-portrait`.

### Landscape Orientation Default

`landscape:` prefixed classes now work correctly even without an explicit `.screen--landscape` class on the screen element. Since landscape is the default orientation, `landscape:` prefixes activate whenever `.screen--portrait` is not present. See the [Responsive](/framework/docs/2.3/responsive) docs.

### Bug Fixes

- **Title bar on 4-bit screens:** Fixed an issue where the background image could bleed through on 4-bit displays. The title bar now explicitly clears the background image before applying the background color.
- **Half horizontal layout height:** The layout height inside half horizontal views was incorrectly using quadrant dimensions. It now correctly uses half horizontal dimensions.
- **Available height computation:** Improved height calculation for elements inside flex column layouts. The engine now sums sibling heights and gaps instead of relying on `getBoundingClientRect()`, which can be inaccurate before layout settles.

### Internal Changes

The following changes are under-the-hood improvements to how the Framework generates its CSS. They don't introduce new classes or markup patterns, but they make the responsive system more robust and maintainable.

- Responsive mixin system refactored to use a shared `parse-selector-components` helper, fixing edge cases with nested selectors.
- New `with-responsive-parent-child-variants` mixin powers responsive grid column spans and flex child utilities.
- New device-specific responsive generators (`responsive-for-bit-depth`, `responsive-orientation-for-bit-depth`) for scoped bit-depth overrides.
- Value and rich text device overrides refactored from manual per-class rules to generated loops.
- `screen--sm`, `screen--md`, and `screen--lg` now apply size-specific CSS variable overrides (previously empty).

 Previous  [ 

## V2 Troubleshooting

Resolve issues surfaced by v2's stricter markup requirements

 ](/framework/docs/2.3/troubleshooting_guide)

 Next  [ 

## Size

Define exact width and height dimensions for elements

 ](/framework/docs/2.3/size)

