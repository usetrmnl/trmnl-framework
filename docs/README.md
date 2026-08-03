# TRMNL Framework

The TRMNL Framework is a CSS/SCSS system for building layouts on ePaper. It provides layout primitives, utilities, and components for grayscale and color-capable devices.

---

## Framework

### Palette System

The framework supports:

- **Grayscale palettes**: 1-bit (black/white), 2-bit (4 shades), and higher bit-depth grayscale devices.
- **Color palettes**: limited palettes (3-7 colors with pattern-based rendering) and full-spectrum color palettes.

**Grayscale palettes** (published in `db/data/framework_devices.yml`):

| ID         | Grays | Bit Depth | Description   |
| ---------- | ----- | --------- | ------------- |
| `bw`       | 2     | 1-bit     | Black & White |
| `gray-4`   | 4     | 2-bit     | 4 Grays       |
| `gray-16`  | 16    | 4-bit     | 16 Grays      |
| `gray-256` | 256   | 8-bit delivery, renders as 4-bit | Smooth Grayscale (device-quantized) |

**Color palettes** (published in `db/data/framework_devices.yml`):

| ID            | Colors                                         | Type          |
| ------------- | ---------------------------------------------- | ------------- |
| `color-3bwr`  | Black, Red, White                              | Limited       |
| `color-3bwy`  | Black, Yellow, White                           | Limited       |
| `color-4bwry` | Black, Red, White, Yellow                      | Limited       |
| `color-6a`    | Red, Green, Blue, Yellow, Black, White         | Limited       |
| `color-7a`    | Black, White, Red, Green, Blue, Yellow, Orange | Limited       |
| `color-12bit` | Full spectrum                                  | Full-spectrum |
| `color-24bit` | Full spectrum                                  | Full-spectrum |

Implementation notes:

- Grayscale palette classes map to `screen--1bit`, `screen--2bit`, or `screen--4bit` (`gray-256` is capped at framework 4-bit classing).
- Limited color palettes map to `screen--color-*` classes.
- Full-spectrum palettes (`color-12bit`, `color-24bit`) use `screen--color-full`.
- **Limited color palettes** (`color-3bwr`, `color-3bwy`, `color-4bwry`, `color-6a`, `color-7a`) use **1-bit grayscale** for gray areas: only black and white are available for gray, so gray tokens use the same curated 1-bit dither as `grayscale/`. See `limited_palette_grayscale_1bit_ids` in `framework_colors.yml` and the `grayscale_bit_depth` field on limited color palettes in `db/data/framework_devices.yml`.

### Data Flow and Source of Truth

**Single source of truth**: `db/data/framework_colors.yml`

Consumed by:

- `lib/tasks/framework.rake` - SCSS token and CSS variable generation
- `lib/framework/color_manifest.rb` - resolved manifest builder, including the color-to-gray fallback mapping

Key YAML keys:

- `color_hues` - canonical base hue order
- `color_shade_steps` - canonical shade-step list used across token generation
- `color_palette` - hue and hue-step token hex values
- `limited_palettes` - palette ID to hex arrays used for limited-palette rendering
- `hue_to_accents` - hue to accent color(s) by limited palette
- `color_palette_limited_ids` - IDs that use limited/patterned rendering
- `limited_palette_grayscale_1bit_ids` - limited palette IDs that use 1-bit grayscale for gray tokens (only black and white available; all of 3bwr, 3bwy, 4bwry, 6a, 7a)
- `preview_limited_palette_white_hex` - effective white used for preview mode on limited 1-bit grayscale palettes

### Theme Authoring (V3 Semantic Smart Slots)

Framework v3 themes must preserve device-capability rendering paths.

- **Allowed in theme files**:
  - Semantic channel refs via mixins (`theme-slots.semantic-bg/text/stroke/border`)
  - Slot token refs via mixins (`theme-slots.bg-slot/text-slot/border-level-slot/border-token-slot`)
  - Utility token remaps via mixins (`theme-slots.utility-bg/text/stroke/border-token` and the bulk `utility-remap-*` helpers)
- **Disallowed in theme files**:
  - Root palette variable overrides (`--white`, `--black`, `--gray-*`, `--color-*`)
  - Protected (framework-owned) paint vars:
  - `--bg-*`
  - `--text-*`
  - `--border-*`

Protected vars are generated in `base/_screen-mode-vars.scss` and drive mode-accurate rendering (1-bit/2-bit dither, limited-palette image families, preview variants, and 4-bit+ solid paths). Overriding them in a theme bypasses device behavior.

Semantic and slot refs compile to framework semantic/slot vars (for example `--framework-semantic-surface-bg-*`, `--framework-slot-item-meta-bg-*`) that components consume. This keeps preview/raw and capability rendering logic in the core engine.

Theme IDs live in `lib/framework/themes.rb` (`Framework::Themes`), the registry the release pipeline and docs picker read. A theme file `themes/<id>-theme.scss` without a registry entry fails the lint.

Starter template for new themes:

- `app/assets/stylesheets/framework/themes/_theme-boilerplate.scss`
- Slot helper mixins: `app/assets/stylesheets/framework/mixins/_theme-slots.scss`

Validate themes with:

```bash
rake framework:themes:lint
```

### Framework Commands

**Rake tasks**

| Task                             | Purpose                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `rake framework:resolved_manifest` | Generate `tmp/framework_colors.resolved.json` (includes the color-to-gray fallback map) |
| `rake framework:color_tokens`    | Generate `_tokens_colors_generated.scss` from `framework_colors.yml` (bakes in the color-to-gray fallback map) |
| `rake framework:css_variables`   | Generate `_variables_colors.scss` (CSS custom properties)                           |
| `rake framework:colors`          | Regenerate all color artifacts (`color_tokens` + `css_variables`)                   |
| `rake framework:themes:lint`     | Lint theme files for protected paint/root palette overrides and registry sync       |
| `rake framework:docs_chrome`     | Refresh `app/assets/static/docs_chrome.css`, the Tailwind snapshot hosts without a build serve |

### Ruby Classes and Methods

- `Framework::ColorData.load` - load `framework_colors.yml`
- `Framework::ColorData.color_hues`, `color_shade_steps`, `color_palette`, `limited_palettes`, `hue_to_accents`, `color_palette_limited_ids`, `limited_palette_grayscale_1bit_ids`, `preview_limited_palette_white_hex` - typed accessors for color data
- `Framework::ColorUtils.lab_l_star`, `l_star_to_gray` - fallback mapping utilities
- `Framework::ColorManifest.compute_color_to_gray_fallback` - build the color-to-gray fallback map baked into the resolved manifest
- `Framework::Devices.palettes` - palette hashes read from the device manifest that core exports to `db/data/framework_devices.yml`
- `framework_palette_options` helper - palette hashes for UI consumers (for example the screen picker), built from `Framework::Devices.palettes`

### Workflow for Palette Changes

When updating `db/data/framework_colors.yml`:

1. Run `rake framework:colors` to regenerate SCSS tokens and CSS variables.
2. Validate generated artifacts before committing.

### Framework Output Artifacts

| Path                                                                    | Description                                                         |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `app/assets/stylesheets/framework/config/_tokens_colors_generated.scss` | SCSS token maps and fallback maps                                   |
| `app/assets/stylesheets/framework/config/_variables_colors.scss`        | CSS custom properties                                               |

Pattern art for released bundles is committed under `public/images/` (grayscale, border,
and `color-*` directories). Released bundles reference it by absolute path; the current
bundle paints the same art from generated gradients and data URIs instead.

### Framework Routes and Compatibility

- Canonical docs routes live under `/framework/docs/:page`.
- Canonical examples routes live under `/framework/examples/:id`.
- Legacy `/framework/:page` routes redirect to `/framework/docs/:page`.
- `/framework/layout_examples` is still available as a legacy examples route.

### Framework Key Files

- `app/services/screen/palette.rb` (in core) - palette class definitions; reads this repo's published `framework_colors.resolved.json`
- [lib/framework/color_data.rb](../lib/framework/color_data.rb) - color data loader/accessors
- [lib/framework/color_utils.rb](../lib/framework/color_utils.rb) - LAB and grayscale mapping helpers
- [db/data/framework_colors.yml](../db/data/framework_colors.yml) - canonical palette data
- [lib/tasks/framework.rake](../lib/tasks/framework.rake) - color token and CSS generation

### Deferred Features

- [4.0 Breaking Changes](V4_BREAKING.md) - deferred removals shipped as deprecated 3.x aliases (numbered borders, divider variants, native-vs-shadow text stroke, bare content selectors)

---

## Framework Documentation

### Overview

Framework documentation tooling renders the live framework docs into prebuilt Markdown and generates `llms.txt` and `llms-full.txt`.

### Documentation Commands

| Task                               | Purpose                                                               |
| ---------------------------------- | --------------------------------------------------------------------- |
| `rake framework:generate_markdown` | Generate prebuilt docs/examples Markdown and `llms*.txt` outputs      |
| `rake framework:add_heading_ids`   | Add `framework_heading(...)` IDs to docs heading markup (maintenance) |

### Documentation Behavior Notes

- `generate_markdown` renders docs and examples for all versions using internal requests with `_raw=1`, then converts HTML to Markdown.
- Output goes to this repo's `public/`, the directory `Framework::Static` serves, so every page's `.md` twin and both `llms*.txt` files resolve in any host that mounts the engine.
- The generated files are untracked. Run the task when you want them locally; core generates and serves the production copies until docs cutover.
- `APP_URL` controls the base URL used in `public/llms.txt` links (defaults to `https://trmnl.com`).
- `INTERCOM_TOKEN` (optional) enables the Intercom help-article fetch. See "Intercom Help Articles (Maintainers)" below for where the token lives and how to run it.
- `llms.txt` indexes the current version's docs pages by category and appends an Instructions section. `llms-full.txt` concatenates the current version's docs Markdown.

### Intercom Help Articles (Maintainers)

`generate_markdown` can enrich `llms.txt` and `llms-full.txt` with TRMNL's public help-center articles. The step is optional: it runs only when a token is present.

**Where the token lives: nowhere in this repo.** The fetch needs an Intercom API access token. It stays in the maintainers' password manager, is passed to one command as an environment variable, and is never committed, written to a file, or needed by contributors.

**Getting a token.** Create it in the Intercom workspace under Settings > Integrations > Developer Hub > your app > Authentication. Scope it read-only to Articles; the task only ever calls `GET https://api.intercom.io/articles`.

**Running the enriched generation:**

```bash
INTERCOM_TOKEN=<paste from the password manager> bundle exec rake framework:generate_markdown
```

**Without the token** the task prints `Skipping Intercom help articles (INTERCOM_TOKEN not set)` and builds both outputs from the framework docs alone. This is the normal path for community checkouts and CI.

**What the token changes.** `llms.txt` gains a `## Help Articles` index and `llms-full.txt` appends each article's Markdown body. The articles themselves are public on the help center; the token only authorizes the API listing at generation time.

### Documentation Outputs

| Path                                      | Description                          |
| ----------------------------------------- | ------------------------------------ |
| `public/framework/docs/{version}/*.md`    | Prebuilt Markdown for docs pages     |
| `public/framework/examples/*.md`          | Prebuilt Markdown for examples pages |
| `public/llms.txt`                         | Index of the current version's docs pages |
| `public/llms-full.txt`                    | Full concatenated docs content for the current version |

### Documentation Key Files

- [lib/tasks/framework_docs.rake](../lib/tasks/framework_docs.rake) - markdown and LLM output generation
- [app/controllers/framework_controller.rb](../app/controllers/framework_controller.rb) - docs/examples page registry and routing actions
- [app/helpers/framework_helper.rb](../app/helpers/framework_helper.rb) - page titles/descriptions used by documentation outputs

