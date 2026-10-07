# Compiling the Framework

Compile the framework from source with Dart Sass: one entrypoint, one load path, plus a stylesheet per theme. The result is the same plugins.css the release pipeline produces. You only need a source build when a released one is not enough, for modified source or custom device profiles.

### Toolchain

The framework compiles with Dart Sass; the module system rules out LibSass and node-sass. Releases pin `sass-embedded` 1.93.3 so published artifacts reproduce byte for byte, and any current Dart Sass produces equivalent CSS.

### Compiling plugins.css

Create an entrypoint that loads the framework module, then compile it with the framework source on the load path. `bin/build` in the repository runs exactly this for the released artifacts. Clone the source from [github.com/usetrmnl/trmnl-framework](https://github.com/usetrmnl/trmnl-framework).

```
// my-build.scss
@use 'framework';
```

```
sass --style=compressed --no-source-map \
  --load-path=trmnl-framework/app/assets/stylesheets \
  my-build.scss plugins.css
```

To bake your own device profiles into the build, configure the module at the same `@use` site. See [Custom Devices](/framework/docs/3.4/sass_devices) .

The compiled stylesheet embeds every dither pattern as a data URI, so it is large on disk. Serve it compressed; the release pipeline ships a `.gz` next to every artifact for the same reason. Fonts are the only asset it loads by URL.

### Fonts

Every `@font-face` block in the framework points at a root-relative `/fonts/` URL, so a host has to serve those files. Without them the pixel families fall back to the browser default. Nothing errors, but the type is wrong at every size.

Font URLs resolve against the host that serves the stylesheet, not the page. Link `plugins.css` from the releases CDN and the fonts load from the same host. Serve your own build and you serve `/fonts` with it.

#### What the Host Serves

- `TRMNL12`, `TRMNL16`, and `TRMNL21` in Regular and Bold, each as `.woff2`, `.woff`, and `.ttf` (18 files). 
- `NicoPups-Regular.ttf`, `NicoClean-Regular.ttf`, and `BlockKie.ttf` for the Classic bundle (3 files). 
- `Inter.ttf` and `Inter-Italic.ttf`, which both bundles use on high-density displays (2 files). 

Both bundles download as zips from [Releases](/framework/releases), each with a README of per-font credits and its license text. Extract the font files into the directory the host serves at `/fonts`, and keep the credits and license files with your build. [Font Family](/framework/docs/3.4/font_family) covers which bundle renders what.

The framework release zip holds no fonts. They ship as their own bundles, so a stack assembled from that zip alone renders with no pixel fonts at all.

### Themes

Each theme under `framework/themes/` compiles to its own stylesheet, separate from `plugins.css`, and loads as a second `<link>` next to the framework. Usage is on [Themes](/framework/docs/3.4/themes) ; the authoring contract is on [Authoring Themes](/framework/docs/3.4/theme_authoring) .

```
sass --style=compressed --no-source-map \
  --load-path=trmnl-framework/app/assets/stylesheets \
  trmnl-framework/app/assets/stylesheets/framework/themes/black-and-yellow-theme.scss \
  themes/black-and-yellow-theme.css
```

### The JavaScript Runtime

`plugins.js` is hand-authored and ships verbatim: no bundler, no build step. Copy `app/javascript/plugin-render/plugins.js` next to your compiled CSS and serve both. It provides the render-time engines ( [Framework Runtime](/framework/docs/3.4/framework_runtime) ) and TRMNLPaint ( [Paint API](/framework/docs/3.4/paint_api) ).

### Releases and Minification

The repository's release task compiles, minifies, and precompresses (gzip and brotli) every published version reproducibly; those artifacts are what the releases CDN serves.

Minifying your own build is optional. If you do, keep custom properties intact: the framework's JavaScript reads public `--*` variables at runtime.

 Previous  [ 

## Sass API

The framework SCSS source: architecture, cascade layers, and what a custom stack can build from it

 ](/framework/docs/3.4/sass_api)

 Next  [ 

## Custom Devices

Device profiles and the $custom-devices configuration for custom builds

 ](/framework/docs/3.4/sass_devices)

