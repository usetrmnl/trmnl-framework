# Sass API

The Sass API is the framework's SCSS source, open since 3.2. These pages cover the build-your-own path: compiling from source, adding device profiles, and using the mixins in your own SCSS. A custom stack can also skip the build entirely and serve an official released build, which is what the TRMNL Platform always does.

The TRMNL Platform serves the framework for you, rendering every plugin against its official builds. Recipes can pin a specific release, and the developer license lets a private plugin do the same.

You choose the framework build your screens load: a released build straight from the releases CDN, or your own build compiled from this SCSS source.

```
<!-- plugins.css (platform-provided) -->
<!-- plugins.js (platform-provided) -->
<div class="screen">...</div>
```

```
<!-- Option 1: serve a released build -->
<link rel="stylesheet" href="https://trmnl.com/css/latest/plugins.css">
<script src="https://trmnl.com/js/latest/plugins.js"></script>

<!-- Option 2: compile and serve your own build -->
<link rel="stylesheet" href="/assets/plugins.css">
<script src="/assets/plugins.js"></script>
```

### The Source at a Glance

Everything compiles from one entrypoint. `plugins.scss` loads the `framework` module (`framework/index.scss`), which loads the configuration, the mixins, and the style layers in a fixed order.

```
// framework/index.scss: configuration and mixins load first,
// then every style lands in a declared cascade layer.
@forward 'config/custom';
@use 'config/tokens' as vars;
@use 'mixins' as mixins;

@layer tn--normalize, tn--elements, tn--components, tn--base,
    tn--device-overrides, tn--themes, tn--utilities;
```

Every rule lands in a `tn--` prefixed cascade layer, so a custom stack can run the framework next to other CSS without specificity fights. The codebase uses the Dart Sass module system throughout: `@use` and `@forward`, never `@import`.

- `config/`: the device map, design-token maps, generated color maps, fonts, and the root CSS variables.
- `mixins/`: screen targeting, theme slots, and the scale functions. This is the consumer-facing Sass surface; see [Sass Mixins](/framework/docs/3.4/sass_mixins) .
- `base/`, `elements/`, `components/`, `utilities/`: the screen scaffolding, text elements, larger components, and utility classes these docs cover page by page.
- `themes/`: standalone theme stylesheets, compiled separately from `plugins.css`. See [Themes](/framework/docs/3.4/themes) .

The source lives at [github.com/usetrmnl/trmnl-framework](https://github.com/usetrmnl/trmnl-framework). For the repository tour, the license, and the release pipeline, see [Open Source](/framework/docs/3.4/open_source) .

### Public and Internal Surface

- **Public:** the `$custom-devices` configuration, the four supported `framework/mixins` families (screen targeting, scale functions, typography, theme slots) named on [Sass Mixins](/framework/docs/3.4/sass_mixins) , the compiled CSS classes, and the public `--*` variables listed on [Tokens](/framework/docs/3.4/tokens) .
- **Internal:** members whose names start with `-` or `_` (private to their module), every other mixin and function that `framework/mixins` forwards, and the paint variables (`--bg-*`, `--text-*`, `--border-*`) the framework's rendering owns. Internal members can change without notice.
- **Generated:** files with a DO NOT EDIT header (the device map, the color maps) regenerate from `db/data/` via rake tasks. Configure or extend them; do not hand-edit them.

Theme stylesheets have their own authoring contract built on the theme-slot mixins; it is documented on [Authoring Themes](/framework/docs/3.4/theme_authoring) and enforced by `rake framework:themes:lint`. Custom fonts use `typography.typeface($family)`, or `theme-slots.typeface($family)` in a theme (Framework 3.4 or later); see [Custom Typefaces](/framework/docs/3.4/custom_typefaces) .

### Go Deeper

#### Compiling the Framework

The toolchain, the entrypoint, themes, the JS runtime, and what to serve.

 Go to [Compiling the Framework](/framework/docs/3.4/sass_build)

#### Custom Devices

The device map schema and the `$custom-devices` configuration for your own panels.

 Go to [Custom Devices](/framework/docs/3.4/sass_devices)

#### Sass Mixins

Screen-targeting mixins and scale functions for authoring device-aware SCSS.

 Go to [Sass Mixins](/framework/docs/3.4/sass_mixins)

### Where This Applies

[ 

## Tokens

 ](/framework/docs/3.4/tokens)

 Previous  [ 

## Painting Typography

Read text roles as TypeSpec objects for custom text and chart labels

 ](/framework/docs/3.4/paint_typography)

 Next  [ 

## Compiling the Framework

Compile plugins.css and the theme stylesheets from source with Dart Sass

 ](/framework/docs/3.4/sass_build)

