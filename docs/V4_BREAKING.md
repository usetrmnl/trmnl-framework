# Framework 4.0: Deferred Breaking Changes

The theming port (core's `framework/themes` branch) originally shipped four breaking
changes. Three ship in 3.x as deprecated aliases layered on the new internals, with
the breaking removal deferred to 4.0. This file is the checklist for cutting it.
The fourth (drop-shadow ring text strokes) shipped directly in 3.x after all: native
strokes overpaint glyph fills in WebKit (no paint-order support for text), so the
rings are the bugfix, not a breaking change.

Item 4 comes from elsewhere: the dark mode strategy decision of 2026-07-29, which
freezes the `dark:` variant axis in 3.2.x and removes it here. Items 5 through 11
come from the pre-open-source review rounds of 2026-07: shipped surface kept for
compatibility in 3.x, where each change needs the major release.

## 1. Remove numbered border level classes

`border--{h,v}-1` through `-7` are deprecated aliases; the step classes
(`border--{h,v}-10` through `-75`) are the canonical API. Border *levels* stay,
because the divider and table consume them internally.

For 4.0: delete the "Numbered level borders (deprecated)" block in
`app/assets/stylesheets/framework/utilities/_border.scss` (and its now-unused
`@use 'sass:map'`), and drop the deprecation paragraph from
`app/views/framework/border.html.erb`.

## 2. Remove divider background variants

`divider--on-white/light/dark/black` are deprecated aliases mapping to border levels
6/5/3/2. The divider's canonical form is the plain level-6 shorthand.

For 4.0: delete the "Background variants (deprecated)" block in
`app/assets/stylesheets/framework/elements/_divider.scss` and the deprecation
paragraph in `app/views/framework/divider.html.erb`. Leave
`app/views/framework_v2/divider.html.erb` alone: it documents the released 2.3
bundle, which keeps the variants forever.

## 3. Remove bare rich text content selectors

`.trmnl .content` and `.trmnl .content--base` through `--xxxlarge` are deprecated aliases for
the `.richtext`-scoped forms (the rescope keeps rich text's text paint from leaking
to unrelated `.content` elements).

For 4.0: in `app/assets/stylesheets/framework/components/_rich_text.scss`, drop the
bare selector from each dual-emitted `@at-root` list (keep
`.trmnl .richtext .content*`) and the deprecation comment.

## 4. Remove the dark variant axis

The `dark:` prefix tier and the `screen--dark-mode` gate leave at 4.0. The Dark theme
(`screen--theme-dark`, published as `themes/dark-theme.css`) replaces them for a whole
screen, and the `inverse` utility covers a single element. Decided 2026-07-29.

Two things have to be true before anything below is deleted: the Dark theme has shipped
in a 3.2.x release, and core's `dark_mode?` setting applies `screen--theme-dark` instead
of emitting `screen--dark-mode`. Delete the axis before that and
every dark-mode screen on the platform renders light.

Measured on the shipped `public/css/3.2.0/plugins.css`: the axis is 3,380,992 B, 24.7%
of the bundle. Only 5 of its 438 rules carry a dark-exclusive body; the other 433 share
a body with their light or `inverse` counterpart, so almost all of that is selector
text. The 96-combination gate matrix drops to 48.

### 4.1 Emitters

In `app/assets/stylesheets/framework/mixins/_responsive.scss`:

- Delete `generate-dark-first-variants`, the dark tier emitter itself.
- Delete `with-dark-all-variants` and `with-dark-size-and-orientation-variants`. The
  second already has no callers.
- Repoint the 31 `with-dark-all-variants` call sites at the mixin each one wraps,
  `with-all-variants`: `utilities/_font.scss` (20), `utilities/_text.scss` (7),
  `utilities/_background.scss` (3), `utilities/_visibility.scss` (1).

In `app/assets/stylesheets/framework/mixins/_factorized_utilities.scss`:

- Drop the `$include-dark` parameter and its two `@if $include-dark` blocks from
  `_gate-selectors`, `gate-selectors-for-token`, `gate-selectors-for-utility-prefix`,
  and `each-utility-gate`.
- Drop the `$dark` parameter and its branch from `selectors-for-size`.
- Drop the now-meaningless `$include-dark: false` argument in
  `utilities/_spacing.scss`.

In `app/assets/stylesheets/framework/mixins/_selector-helpers.scss`:

- Delete `dark-scope()` and `$theme-exempt`. The exemption exists only to keep dark
  rules off themed screens, so it has no work left once the axis is gone.

In `app/assets/stylesheets/framework/mixins/_screen.scss`:

- Delete `for-dark-mode`, `for-dark-1bit`, `for-dark-2bit`, `for-dark-4bit`, and the
  dark line in the usage comment.

### 4.2 Gate styles

In `app/assets/stylesheets/framework/base/_screen-mode-vars.scss`, 43 selectors carry
`screen--dark-mode`. They come in two shapes and leave differently:

- Dark-paint blocks (`.screen.screen--dark-mode.screen--1bit#{$theme-exempt}` and
  friends) lose their dark selector. The `.inverse` selector beside it stays, because
  the block is what paints an inverted element on a light screen.
- Light-paint blocks lose the `.screen--dark-mode ... .inverse` selector that restores
  light paint inside a dark screen, and the 1-bit backdrop pair collapses: the
  `:not(.screen--dark-mode)` guard and the `gray-75` dark branch become one plain
  `.screen.screen--1bit` rule on `checker`, with the `.inverse` half kept.

In `app/assets/stylesheets/framework/base/_screen.scss`, delete the two
`.screen.screen--dark-mode` blocks (the semantic defaults block and the
`.screen--dark-mode .inverse` light restore). `.screen .inverse` keeps
`_dark-semantic-defaults`.

Also drop the dark note in the `app/assets/stylesheets/framework/index.scss` header,
which tells theme authors `screen--dark-mode` has no effect on a themed screen.

### 4.3 What stays

The dark remap tables and functions are shared with `inverse`, which is the
per-element migration path, so they all stay: `$dark-mode-grayscale-remap`,
`$dark-mode-chromatic-hue-remap` and `$dark-mode-step-mirror` in `config/_tokens.scss`,
`dark-remap-token` and its siblings in `mixins/_background-patterns.scss`,
`dark-remap-border-level` in `mixins/_border-levels.scss`, the `$dark: true` parameters
on the private mixins in `base/_screen-mode-vars.scss`, and `_dark-semantic-defaults`
in `base/_screen.scss`. Renaming them off the word "dark" is optional cleanup, not part
of this removal.

### 4.4 Specs

`spec/assets/stylesheets/framework_responsive_variants_spec.rb` is the gate matrix.
Delete `dark_axis_families` and the two examples that close the axis, drop `dark` from
`gate_token` and from `axis_signature`, and drop the `dark:md:hidden` theme-exemption
assertion in "scopes each gate axis the way the grammar promises".

Five suites copy the same `gate_token` list and each needs the `dark` alternative
removed: `framework_text_paint_scope_spec.rb` (also its `dark:` prefix expectations and
its theme-exemption example), `framework_cascade_weight_spec.rb` (also the `dark:`
entries in its beyond-gate and prefix-shape lists), `framework_arbitrary_value_spec.rb`
(also the example asserting no dark gate leaks onto arbitrary values),
`framework_font_weight_spec.rb` (also its two `dark:` reachability expectations), and
`framework_unbound_utility_token_spec.rb` (comment only).

`framework_inverse_spec.rb` and `framework_pattern_systems_spec.rb` assert on
dark-screen selectors that will no longer exist; both need rewriting onto the `.inverse`
half of the same blocks. The runtime suite
`test/runtime/framework/responsive-variants.spec.js` parses a `dark` token into its gate
model and needs that branch removed.

### 4.5 Docs

- `app/views/framework/responsive.html.erb`: delete the `dark:size:orientation:bit-depth:`
  row from the combination table, the dark-mode paragraph in Pattern and Order, the
  dark-first sentence in the advanced targeting notice, and the legacy notice added in
  3.2.x.
- `app/views/framework/visibility.html.erb`: delete the dark-first prefix section and
  its code sample.
- `app/views/framework/inverse.html.erb`: drop the sentence saying `dark:` utilities
  still require `screen--dark-mode`, and point the reader at the Dark theme instead.
- `app/views/framework/screen.html.erb`: drop `screen--dark-mode` from the modifier
  list and delete the dark mode section with its demo.
- The `dark-mode-notice` block the picker reveals appears on `colors.html.erb`,
  `border.html.erb`, `background.html.erb`, and `text_color.html.erb`. All four go with
  the toggle.
- The "themes are light/dark agnostic" copy is moot once dark is a theme. It appears on
  `themes.html.erb`, `theme_authoring.html.erb` (including the
  `.screen--theme-<id>.screen--dark-mode` code sample), `v3_overview.html.erb`,
  `v3_upgrade_guide.html.erb`, and `v3_enhancement_guide.html.erb`.
- `app/helpers/framework_helper.rb`: the `paint_api` and `v3_enhancement_guide` intro
  paragraphs both list dark mode as a mode the cascade resolves. Reword them onto themes.
- Docs chrome: the screen picker's dark mode toggle
  (`app/javascript/controllers/fancy_screen_picker_controller.js`, including the
  `dark_mode` query parameter, the `dark-mode-notice` reveal, and the theme-active
  disabling), the dark entries in `app/views/framework/responsive_test.html.erb`, and
  the dark baselines in `app/views/framework_tests/visual/`.
- Leave the frozen tracks alone: `app/views/framework_v1`, `framework_v2`,
  `framework_v3_1`, and everything under `public/css/`. Each documents a released
  bundle that keeps the axis forever.

### 4.6 Platform

Core stops emitting `screen--dark-mode` once its per-plugin `dark_mode?` setting applies
`screen--theme-dark` and links the theme stylesheet
(`app/services/plugins/helpers/html_renderable.rb` in core, which already carries a TODO
to move the flag into appearance). That flip is plan phase 4 and ships on core's
schedule, not this one. Pinned plugins are untouched either way: their stylesheet version
still carries the axis, and core still emits the gate for pre-theme versions.

## 5. Unify bare stroke color class semantics

The two stroke families disagree on what a lone color class does. `image-stroke--black`
alone draws the default 1.5px ring, while `text-stroke--black` alone binds its color
variable and draws nothing until `text-stroke` or a width modifier applies the stroke.
Both are faithful to their released 3.1.2 selves (image-stroke shipped as a filter per
class, so every class drew; text-stroke set `-webkit-text-stroke-color`, which draws
nothing at the default zero width), so 3.x keeps both and the two docs pages state the
asymmetry. A second wrinkle is shared: in both families a lone bit-prefixed color class
(`1bit:image-stroke--black`, `1bit:text-stroke--black`) paints standalone on matching
screens.

For 4.0: align on the text-stroke contract, color classes tune and the base or a width
class paints. In `app/assets/stylesheets/framework/utilities/_image_stroke.scss`, build
`$render-selectors` from the base class and `$stroke-sizes` instead of the whole
`mixins.stroke-family-classes` list, and restrict both families' bit-prefixed render
lists the same way. Update the asymmetry notes on
`app/views/framework/text_stroke.html.erb` and `image_stroke.html.erb`, and extend the
"paints from a bit-prefixed stroke class" example in
`spec/assets/stylesheets/framework_responsive_variants_spec.rb` to assert both families'
color classes stay inert. This un-draws a lone `image-stroke--{shade}`, so it belongs in
the 4.0 release notes with the one-line migration: add `image-stroke` beside the shade
class. The other direction (color classes paint in both families) would surface strokes
on every stray color class in existing layouts with no author action, which is why the
inert contract wins.

## 6. Remove the .mashup-cell wrapper from fluid mashups

`mashup-cell` and its twelve placement modifiers (`mashup-cell--col-N`,
`mashup-cell--col-span-N`, `mashup-cell--row-N`, `mashup-cell--row-span-N`, N from 1
to 3) are the core-emitted wrapper between the `mashup--3x3` grid and each plugin view.
The wrapper owns placement, the cell surface, the window frame, and the forced view
fill (the framework's only two `!important` declarations, finding L22). The canonical
4.0 form places views as direct grid children: placement classes ride the view root,
the chrome groups gain `.mashup--3x3 > .view`, and the two suppression blocks that
un-double the frame on the inner view are deleted. The `!important` fill survives on
the new selector; it is what keeps `w--*`/`h--*` from resizing a cell's window.

For 4.0: rewrite the 3x3 block in `app/assets/stylesheets/framework/base/_mashup.scss`,
extend the frame and backdrop groups in `base/_screen.scss` and
`base/_screen-device.scss` (deleting the inner-view suppression rules in both), and
replace `.mashup-cell .title_bar` with `.mashup--3x3 > .view--full .title_bar` in
`base/_title_bar.scss` and `base/_title_bar-device.scss`. Rewrite
`spec/assets/stylesheets/framework_mashup_spec.rb` and the docs assertion in
`spec/requests/framework_docs_spec.rb`. Docs: the Fluid Mashups section of
`app/views/framework/mashup.html.erb` (modifier table plus three demos), the fluid
paragraph in `v3_overview.html.erb`, and the mashup intro in `framework_helper.rb`.
Frozen tracks and `public/css/**` keep the wrapper forever.

Three things have to be true before anything is deleted. Core emits the new shape:
`app/views/mashups/template/3x3.html.erb`, `app/views/plugins/show.html.erb`, and every
per-size view template root that becomes a grid child (about 366 files, including the
error partials and the private plugin markup wrapper). Core bumps
`MINIMUM_3X3_FRAMEWORK_VERSION` (`app/services/mashups/render.rb`) to the first
wrapperless-aware version, so composites dragged onto old bundles by pinned private
members stop selecting CSS that expects the wrapper. And a `mashup-cell` MarkupScan has
measured that no stored user markup carries the class, since the docs published
copy-pasteable wrapper markup from 3.1.5 on. Delete the selectors before those three
land and every fluid mashup on the platform loses placement, surface, and frame.

## 7. Remove gap--space-between

`gap--space-between` renders space-evenly, the opposite of its name: it shipped with
`justify-content: space-evenly` for compatibility and stored plugin layouts depend on
that rendering, so 3.x keeps it as a frozen legacy alias. The honest names already
exist: `gap--auto` is the documented even distribution and `gap--distribute` is the
real space-between.

The class also has a docs surface. `app/views/framework/gap.html.erb` documents it in
a "Legacy: Space Between" section, `app/views/framework/trmnl_x_guide.html.erb` names
it as a legacy alias, and 28 demo blocks across 12 current-track pages use it (chart,
border, description, fit_value, format_value, label, text_color, divider, open_source,
paint_charts, themes), plus `spec/framework_tests/visual/_dashboard.html.erb`.

For 4.0: delete the `.gap--space-between` block in
`app/assets/stylesheets/framework/utilities/_gap.scss` (its emitted variants go with
it), rewrite the two docs paragraphs and repoint every demo block at `gap--auto`,
with the release-notes migration: `gap--auto` for even distribution,
`gap--distribute` for space-between.

## 8. Remove grid--no-gap

`grid--no-gap` duplicates `gap--none` under a grid-specific spelling (`gap: 0` in
`utilities/_grid.scss`), and both compile with full variants, so stored layouts may
carry either. 3.x keeps the duplicate. The Grid page documents it: a "Removing the
Gap" section names the class and its `portrait:grid--no-gap` form, renders it in a
live demo, and publishes it in a copyable snippet.

For 4.0: delete the `grid--no-gap` block in
`app/assets/stylesheets/framework/utilities/_grid.scss`, drop the "Removing the Gap"
section from `app/views/framework/grid.html.erb` or move it onto `gap--none`, and note
the migration (`gap--none`) in the release notes.

## 9. Rename the snake_case half-view family

`view--half_horizontal` and `view--half_vertical`, with their backing
`--half_horizontal-w/-h` and `--half_vertical-w/-h` variables
(`config/_variables_root.scss`, `config/_variables_overrides.scss`), are the only
snake_case names in the public surface. They shipped in every released bundle back to
2.2.0 and the structure page documents them as the mashup slot-size API, so 3.x cannot
touch them. Size-suffix placement also drifts across the variable surface
(`--progress-bar-height-small`, `--table-small-thead-height`,
`--title-bar-small-height` put the size in three different positions).

For 4.0: introduce `view--half-horizontal` and `view--half-vertical` (and kebab
variable twins) as canonical, keep the snake forms as deprecated aliases through the
4.x window, and pick one size-position convention (component, size, part, property)
for any variable the release renames anyway.

## 10. Remove the font-- prefix

Twelve `font--` classes ship as aliases of the canonical `text--` family: the ten size
aliases `font--small` through `font--peta`, plus the weight aliases `font--bold` and
`font--regular`. Each renders exactly like the `text--` class with the same suffix,
variants included. `app/views/framework/text_size.html.erb` already tells readers the
family is removed at 4.0, so the promise is public. Decided 2026-07-28.

For 4.0: delete the `font--` blocks in
`app/assets/stylesheets/framework/utilities/_font.scss`, drop the "Deprecated
font--{size} aliases" section from `app/views/framework/text_size.html.erb` and the
matching note on `app/views/framework/font_weight.html.erb`, with the release-notes
migration: `text--{size}`, `text--bold`, `text--regular`.

## 11. Remove screen--8bit and screen--16bit

`screen--8bit` and `screen--16bit` take the 4-bit display variables and the 4-bit paint
rail while publishing their own number as the depth (`'8bit': 8` and `'16bit': 16` in
`$_screen-paint-depths`, `base/_screen-mode-vars.scss`). No exported device profile or
palette can reach them: every picker-selectable depth is 1, 2, or 4, so the tiers are
reachable only from hand-written markup.
`app/views/framework/rendering_modes.html.erb` already tells authors not to build on
them, which is what makes this a scheduled removal rather than a live surface.

For 4.0: delete the two selectors from `base/_screen.scss` and their blocks and depth
entries in `base/_screen-mode-vars.scss`, drop them from `$grayscale-rail-only` in
`mixins/_selector-helpers.scss`, update
`spec/assets/stylesheets/framework_screen_paint_depth_spec.rb`, and drop the
"Do not build on" paragraph from `app/views/framework/rendering_modes.html.erb`.
Above 16 grays the axis is color, so there is no migration: a panel goes to
`screen--4bit` or to a color palette class.

## Open decisions for 4.0

Not yet decided, but 4.0-shaped, so they live here. The summaries below stand alone.

- **Flex-shrink synonym.** `no-shrink` and `shrink-0` both emit `flex-shrink: 0`
  and both are documented (a docs alias note shipped in 3.2). Decide which name
  survives at 4.0 and remove the other.
- **Scale tier vocabulary.** Screen scale modifiers say `regular` and use disjoint
  tier sets while every utility family says `base`. Decide the one vocabulary and
  whether the three ladders align.
- **Typography ladder collision.** `text--` and `value--` share tier names that map
  to different pixel sizes (docs ladders shipped in 3.2 to disclose it). Deciding a
  fix needs core, because plugin markup uses both families.
- **Dark axis: remove or extract.** Item 4 above removes the `dark:` axis outright.
  A 2026-07-30 proposal instead extracts it into a
  separately linked `plugins-dark.css` module at 4.0 and keeps it as a supported
  authoring feature, mutually exclusive with theming per plugin. Decision
  pending; whichever way it goes, item 4's mechanics are the shared groundwork.

## Release notes

When cutting 4.0, every removal above belongs in the release notes as a breaking
change with its documented migration: the token border classes, explicit border
levels, `.richtext`-scoped content classes, the Dark theme (plus `inverse` for single
elements), the inert stroke color contract, direct-child mashup placement,
`gap--auto`/`gap--distribute`, `gap--none`, the kebab half-view names, the `text--`
size and weight classes that replace the `font--` prefix, and the removal of
`screen--8bit`/`screen--16bit` (no migration: use `screen--4bit` or a color palette).
