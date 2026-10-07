# CSS Variables

Some framework CSS variables are yours to use; the rest are internal and can change at any time. This page draws that line, family by family. It also shows how the Paint API, themes, and the Sass source each use the public ones.

### Who Reads, Who Writes

The public `--*` variables are shared ground: Sass writes them, themes change them, and the Paint API reads them.

- **Sass generates them.** The SCSS source emits every variable with its per-device values, and a custom build can extend the set. See [Sass API](/framework/docs/3.4/sass_api) .
- **Themes change them.** A theme picks colors by name through the slot mixins and never writes raw values. See [Themes](/framework/docs/3.4/themes) and [Authoring Themes](/framework/docs/3.4/theme_authoring) .
- **Paint reads them.** TRMNLPaint turns what CSS computed into Fill, BorderFill, and TypeSpec objects for JavaScript. See [Paint API](/framework/docs/3.4/paint_api) .

The palette behind the variables is defined on [Colors](/framework/docs/3.4/colors) . Every variable with its per-mode values is listed on [Tokens](/framework/docs/3.4/tokens) .

### Public Variables

A variable is public unless its name marks it as internal, and a release keeps every public name in every published bundle. Read public variables with `var()` in custom CSS or `cssVar()` in JavaScript, and reference them from theme slots.

- **Palette:** `--black`, `--white`, the `--gray-*` ladder, and one ladder per hue: `--red-*`, `--orange-*`, `--yellow-*`, `--lime-*`, `--green-*`, `--cyan-*`, `--blue-*`, `--violet-*`, `--purple-*`, `--pink-*`.
- **Semantic roles:** the `--color-*` family, which holds the roles (`--color-primary`, `--color-success`, `--color-error`, `--color-warning`) and the palette-mode ids. Hues live in the palette ladders above.
- **Geometry and scale:** `--screen-*`, `--gap-*`, `--rounded-*`, and the resolved `--ui-scale`, `--content-scale`, and `--text-ui-scale` factors.
- **Component tokens:** the families components read, from `--title-bar-*` to `--progress-*`, all listed on [Tokens](/framework/docs/3.4/tokens) .

The `--framework-*` channels get their own section below because the theme layer and the runtime write them.

```
/* Custom plugin CSS: reference public variables freely. */
.stat-card {
  padding: var(--gap);
  border-radius: var(--rounded);
}
```

```
// JavaScript: read the same variable at runtime.
var gap = TRMNLPaint.cssVar("--gap", { el: "my-chart" });
```

### Framework Channels and Slots

The `--framework-*` families carry the current paint between themes, components, and the runtime. They are public names: the minifier renames only the internal families below, so a theme, a plugin stylesheet, or `cssVar()` can read them in any build.

- **Semantic channels:** `--framework-semantic-{channel}-*` for canvas, surface, backdrop, fill-strong, fill-muted, fill-soft, text-primary, text-secondary, text-inverse, stroke-contrast, border-strong, border-muted, and icon. A channel carries its whole paint: backgrounds have `-bg-color` and `-bg-image`, text adds `-text-under` and `-text-clip` to its color and image, and borders carry `-border-color`, `-border-image`, and `-border-size`.
- **Role aliases:** one flat color per role, resolved from the matching channel: `--framework-canvas-bg`, `--framework-surface-bg`, `--framework-backdrop-bg`, `--framework-text-primary`, `--framework-text-secondary`, `--framework-text-inverse`, `--framework-border-strong`, `--framework-border-muted`, `--framework-outline-strong`, `--framework-stroke-contrast`, `--framework-fill-strong`, `--framework-fill-muted`, `--framework-fill-soft`. They drop the dither image, so use them only where a single color is what you want.
- **Component slots:** `--framework-slot-{slot}-*`, one group per component surface (title bar, screen backdrop, item meta, progress, table, label). A slot repaints one surface without moving a whole channel. See [Theme Slots](/framework/docs/3.4/theme_slots) .
- **Chart ramp:** `--framework-chart-series-{i}-color` and `--framework-chart-series-{i}-image` for series indexes 0 to 15, plus `--framework-chart-series-span` for the number of entries JavaScript spreads series across. See [Painting Charts](/framework/docs/3.4/paint_charts) .
- **Border render contract:** `--framework-border-render-*` (`width`, `height`, `view-box`, `stroke`, `path-1`, `path-2`, `color-1`, `color-2`): the SVG drawing instructions the framework declares for each border, which the Paint API copies into charts. See [Painting Borders](/framework/docs/3.4/paint_borders) .
- **Icon source:** `--framework-icon-src` holds the URL an `image--adaptive` element is masked with. The runtime writes it as an inline style, and markup can set it directly. See [Image](/framework/docs/3.4/image) .
- **Typeface:** `--framework-typeface` names the font a `typeface` container puts on its text. Markup sets it. See [Custom Typefaces](/framework/docs/3.4/custom_typefaces) .

Themes write these through the slot mixins, where one call fills a whole channel or slot. Setting a single name by hand leaves the rest of its group behind, so plugin markup sets only `--framework-icon-src` and `--framework-typeface`.

### Internal Variables

Six name families are implementation details. The minified bundle (`plugins.min.css`, the file production serves) renames them to `--_tn*` names. Do not read or set them; they can change or disappear in any release.

- `--_*`: module-private helpers scoped to one component's rules.
- `--framework-internal-*`: plumbing that carries resolved values between framework layers.
- `--tile-*`: the generated dither tile assets.
- `--bline-{n}`: deduplicated border line gradients the border pipeline references.
- `--border-*`: the border pipeline, except the theme-contract names below.
- `--tn-*`: engine plumbing, except `--tn-text-stroke-color`, `--tn-text-stroke-width` and `--tn-text-stroke-radius`, which the runtime reads.

The development build and the readable `plugins.css` keep the source names, so you will see them in devtools. Treat them as off-limits anyway.

### Framework-owned Paint Variables

The `--bg-*` and `--text-*` families keep their names in every build, but the framework's rendering owns them. They encode how each device prints: dithered down to the panel's inks where needed, exact colors on full color.

Three border families survive the rename because the theme contract preserves them: the numbered slots `--border-1-h-*` through `--border-7-v-*`, the `--border-token-*` names a shipped theme references, and `--border-line-dark` / `--border-line-light`. Everything else under `--border-*`, including all the `--border-step-*` names, is renamed in released bundles.

Never set them from a plugin or a theme; the theme linter rejects any theme that tries. To consume the resolved paint from JavaScript, go through [Paint API](/framework/docs/3.4/paint_api) instead of reading them raw.

 Previous  [ 

## Theme Slots

Every part of a screen a theme can recolor, from whole-screen colors down to single components, utilities, borders, and chart series

 ](/framework/docs/3.4/theme_slots)

 Next  [ 

## Colors

Complete palette definition: grayscale, chromatic hues, and semantic roles

 ](/framework/docs/3.4/colors)

