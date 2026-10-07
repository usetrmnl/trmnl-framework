# Sass Mixins

The screen mixins let your own SCSS target the same conditions the responsive utilities do: device size, orientation, and bit depth. The scale functions wrap pixel values so your CSS scales with the device the way framework CSS does.

### Screen Targeting

Load the mixins module and wrap declarations. Each wrapped block applies only on screens that match, using the same grammar as the responsive utility classes ( [Responsive](/framework/docs/3.4/responsive) ). Your build needs the framework source on the load path; see [Compiling the Framework](/framework/docs/3.4/sass_build) .

```
@use 'framework/mixins' as trmnl;

.forecast-tile {
    border: 1px solid var(--black);

    // 1-bit screens: thicker rule so the dithered edge stays legible.
    @include trmnl.for-1bit {
        border-width: 2px;
    }

    // md and larger screens in portrait.
    @include trmnl.screen('md', 'portrait') {
        padding: 20px;
    }
}
```

A mixin wraps the current rule in the matching screen ancestor: the 1-bit block above compiles to `.trmnl .screen--1bit .forecast-tile`.

- `screen($modifiers...)`: one to three modifiers in any order. A size modifier is mobile-first (that size and up). Bit depth accepts `'1bit'` or `'1'`. 
- `screen-only($modifiers...)`: the same grammar with exact size targeting instead of mobile-first. 
- `for-sm` / `for-md` / `for-lg` and their `-only` variants: size shorthands. 
- `for-portrait` / `for-landscape`: orientation shorthands. 
- `for-1bit` / `for-2bit` / `for-4bit`: bit-depth shorthands. 
- `for-dark-mode` and `for-dark-1bit` / `for-dark-2bit` / `for-dark-4bit`: dark-mode targeting. Themed screens are exempt, matching the theme contract on [Themes](/framework/docs/3.4/themes) . 
- `for-color-palette($id)` / `for-color-full`: limited-palette and full-color targeting. The palette ids are `'3bwr'`, `'3bwy'`, `'4bwry'`, `'6a'`, and `'7a'`, each documented on [Color Palettes](/framework/docs/3.4/color_palettes) . 
- `for-density($tier)`: density tier targeting (`'1x'`, `'2x'`). 
- `for-combo` / `for-combo-up` / `for-triple` / `for-triple-up`: target an exact combination directly. `for-combo` takes two modifiers, `for-triple` takes three, and the `-up` variants are mobile-first; `screen()` and `screen-only()` call these for you. 

### Scale Functions

Each function wraps a pixel value in one of the framework's scale variables. Non-px and zero values pass through unchanged; lists are scaled item by item.

- `content-scaled($value)`: multiplies by `--content-scale`. Use for plugin content geometry. 
- `ui-scaled($value)`: multiplies by `--ui-scale`, which includes device density. Use for geometry that should scale like the framework's own components. 
- `text-ui-scaled($value)`: multiplies by `--text-ui-scale`, which includes density, Scale, and Text Scale. Use for typography. 

```
@use 'framework/mixins' as trmnl;

.forecast-tile {
    padding: trmnl.content-scaled(10px);
    // => padding: calc(10px * var(--content-scale, 1));
}
```

### Public Surface

`framework/mixins` forwards every module the framework compiles itself with, which is far more than it supports. Four families are public: their names and signatures hold from one release to the next, and the docs cover them page by page.

- **Screen targeting:** `screen()`, `screen-only()`, and the `for-*` shorthands listed above. 
- **Scale functions:** `content-scaled()`, `ui-scaled()`, `text-ui-scaled()`. 
- **Typography:** the `framework/mixins/typography` module. `typography.typeface($family)` puts your own font on every text role, keeping device sizes and line heights (Framework 3.4 or later). See [Custom Typefaces](/framework/docs/3.4/custom_typefaces) . 
- **Theme slots:** the `framework/mixins/theme-slots` module, documented on [Theme Slots](/framework/docs/3.4/theme_slots) with the authoring contract on [Authoring Themes](/framework/docs/3.4/theme_authoring) . `theme-slots.typeface($family)` is the same typeface mixin for a theme. 

Everything else the module forwards is internal: the selector helpers (`scope-selector`, `generate-screen-utilities`) and the variant emitters (`with-all-variants`, `generate-triple-variants`). The internal set also includes the shared utility emitters, the pattern, border-level, and text-paint helpers, and the `trmnl-namespace` wrapper. They exist to compile the framework's own classes and can change or disappear in any release, with no deprecation notice and no entry in the release notes.

The same split holds inside a public module: a member the docs do not name is internal even when it sits next to one they do. The device configuration is public and documented on [Custom Devices](/framework/docs/3.4/sass_devices) ; the whole SCSS contract is summarized on [Sass API](/framework/docs/3.4/sass_api) .

### Where the Rest Lives

The class-based variants for markup are on [Responsive](/framework/docs/3.4/responsive) , and [Responsive Test](/framework/docs/3.4/responsive_test) renders mixins and classes side by side to prove they produce the same result.

### Where This Applies

[ 

## Responsive

 ](/framework/docs/3.4/responsive)

 Previous  [ 

## Custom Devices

Device profiles and the $custom-devices configuration for custom builds

 ](/framework/docs/3.4/sass_devices)

 Next  [ 

## Themes

Visually customize any plugin with a drop-in stylesheet that recolors the whole screen

 ](/framework/docs/3.4/themes)

