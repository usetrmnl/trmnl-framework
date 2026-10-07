# Authoring Themes

Build your own theme by filling in slots: named parts of the screen, like the background, the text, or the title bar, that you point at new colors. This page walks through the workflow: start from the boilerplate, map your slots, register the id, and lint.

### The Contract

A theme picks colors by name, through the theme-slot mixins; it never writes raw color values. Because of that, every color still renders correctly on every device: dithered down to the panel's inks where needed, exact on full color.

- Set the whole screen's colors at once with the semantic channels: `theme-slots.semantic-bg/text/stroke/border`.
- Recolor a single part, like the title bar, with a component slot: `theme-slots.bg-slot/text-slot/border-level-slot/border-token-slot`.
- Recolor what plugins set with `bg--` and `text--` classes through the utility remaps: `theme-slots.utility-*` and the bulk `utility-remap-*` helpers.
- Optionally give icons their own color with `theme-slots.semantic-icon`; without it, `image--adaptive` icons follow the theme's primary text color.
- Pick the colors charts draw their series with: `theme-slots.chart-series-ramp`.
- Pair the title bar's field with its own inks: `theme-slots.ink-slot/icon-slot/stroke-slot`.
- Shape the screen's structure with factors, and its vector weight with one shift: `theme-slots.layout-factors` and `theme-slots.font-weight-shift`.
- Set a custom font with `theme-slots.typeface($family)` (Framework 3.4 or later). See [Custom Typefaces](/framework/docs/3.4/custom_typefaces) .
- Declare nothing outside the contract namespaces (`--framework-*`, `--theme-*`, `--tn-text-stroke-*`). Raw paint, the root palette, geometry, and font metrics are engine- or device-owned; the linter rejects them all.

The full list of channels, slots, and remaps lives on [Theme Slots](/framework/docs/3.4/theme_slots) .

### Start from the Boilerplate

`framework/themes/_theme-boilerplate.scss` is the starting point. A theme is one file: load the theme-slot mixins, declare the framework layer order, open the `tn--themes` layer, and scope every rule to `.trmnl .screen--theme-<name>`.

Keep `@include layers.order;` above the layer block. The browser locks in layer order from the first stylesheet it reads, so without that line a theme loaded before `plugins.css` loses to the framework defaults.

```
@use "../config/layers" as layers;
@use "../mixins/theme-slots" as theme-slots;

@include layers.order;

@layer tn--themes {
    .trmnl .screen--theme-example {
        // 1. Semantic channels: the whole screen in a few lines.
        @include theme-slots.semantic-bg("canvas", "yellow");
        @include theme-slots.semantic-text("text-primary", "black");

        // 2. Component slots: tune specific surfaces.
        @include theme-slots.bg-slot("title-bar", "yellow-40");

        // 3. Utility remaps: re-point the raw bg--/text-- utilities.
        @include theme-slots.utility-remap-grayscale("yellow");

        // Optional: give image--adaptive icons their own paint
        // (they follow text-primary when this is omitted)
        // @include theme-slots.semantic-icon("yellow-20");
    }
}
```

Work in that order: semantic channels first, then component slots, then utility remaps. The shipped themes follow the same order, so read them as worked examples: `black-and-yellow-theme.scss` turns the screen dark, `white-and-red-theme.scss` keeps it bright and makes one targeted utility exception.

### Register and Lint

The file name, the registry id, and the screen class stay in sync: `themes/<id>-theme.scss` registers as `<id>` in `lib/framework/themes.rb` and applies as `screen--theme-<id>`.

`rake framework:themes:lint` enforces the contract on every theme file:

- The theme files on disk match the registry ids.
- Every declared variable lives in a contract namespace: `--framework-*`, `--theme-*`, or `--tn-text-stroke-*`. Paint internals, the root palette, geometry, and font metrics all fail.
- No calls to the deprecated `role-token` helper.

### Compile and Ship

Each theme compiles to its own stylesheet, never into `plugins.css`. It ships as a second `<link>` next to the framework, and the screen opts in with its theme class; see [Themes](/framework/docs/3.4/themes) for usage and [Compiling the Framework](/framework/docs/3.4/sass_build) for the compile command.

### Portable Theme Exports

The TRMNL theme builder offers a ZIP download after you save a theme. Extract the whole ZIP into one directory on your host, load its compiled CSS alongside Framework, and add the manifest's theme class to your screen.

- `theme.css` is the compiled stylesheet you can serve directly.
- `theme.scss` is the editable source; compiling it requires the Framework Sass source.
- `fonts/` contains the selected font files and their license when the theme selects a custom font.
- `manifest.json` names the theme class, stylesheet, and minimum Framework version.

Keep the font directory beside the stylesheet so relative URLs resolve. The theme class activates the selected font, and the exported files work without TRMNL. The SCSS-only download requires you to supply the font files separately.

### Dark Mode

`screen--dark-mode` has no effect on a themed screen: a theme already decides every color, so the framework's own dark rules step aside on their own.

A theme that wants a dark variant styles the combination itself, with the same mixins as the rest of the theme.

```
.trmnl .screen--theme-example.screen--dark-mode {
    @include theme-slots.semantic-bg("canvas", "black");
    @include theme-slots.semantic-bg("surface", "black");
    @include theme-slots.semantic-text("text-primary", "yellow");
}
```

**Do not use `$raw: true` in a theme.** It bypasses device rendering, so the surface paints one flat color instead of dithering down to the panel's inks where needed.

### Expose Values to JavaScript

A theme hands extra values to plugin code through CSS alone: set your own variables on the screen inside the theme namespace (`--theme-<id>-*`), and JavaScript reads them back with `TRMNLPaint.cssVar()`. See [Paint API](/framework/docs/3.4/paint_api) .

### Where This Applies

[ 

## Tokens

 ](/framework/docs/3.4/tokens)

 Previous  [ 

## Themes

Visually customize any plugin with a drop-in stylesheet that recolors the whole screen

 ](/framework/docs/3.4/themes)

 Next  [ 

## Theme Slots

Every part of a screen a theme can recolor, from whole-screen colors down to single components, utilities, borders, and chart series

 ](/framework/docs/3.4/theme_slots)

