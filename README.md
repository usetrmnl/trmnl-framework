# TRMNL Framework

The TRMNL ePaper design system: Sass source, the terminalize JS runtime, design
tokens, dither-pattern assets, the documentation site, and the release pipeline.
This is what TRMNL plugin screens are built with.

The repo ships a local docs server under `server/`: a minimal Rails app (propshaft +
importmap + dartsass-rails, no database) that compiles the framework and renders its
documentation. Framework development happens against these pages (edit Sass/JS, watch
it rebuild, eyeball the rendered examples), and the docs update in the same change.

## Run it

### Prerequisites (local)

Install these once on your machine:

- **Ruby 4.0.6** (see `.ruby-version`). [ruby-install](https://github.com/postmodern/ruby-install) or [rbenv](https://github.com/rbenv/rbenv) both work. The gem requires `>= 4.0.0` and no 3.x branch is maintained, so Ruby 3.x cannot run this repo or bundle the engine.
- **Bundler** (`gem install bundler` if `bundle` is missing after installing Ruby).
- **Node 24.13.0** (see `.nvmrc`, the version every other pin follows). `nvm use` reads it; [nodejs.org](https://nodejs.org/) or your system package manager work too.

Run `bin/setup` on a fresh checkout (and again after a pull if CSS looks stale).

### Local

```bash
bin/setup   # gems, npm, token generation, ALL CSS builds (required on a fresh checkout)
bin/dev     # server on :3001 + live Sass/Tailwind rebuild watchers
```

Open <http://localhost:3001/framework>.

`bin/dev` is the standard loop: the docs pages for the current version serve the live
build, so a Sass or JS edit lands on a refresh.

### Docker (no local Ruby or Node)

If you do not want to install Ruby and Node on the host, use Docker.

```bash
bin/docker up --build  # build the image (if needed) and start the app
```

Open <http://localhost:3001/framework>.

Useful commands:

```bash
bin/docker run --rm web bin/setup          # rebuild CSS assets after a pull
bin/docker run --rm web bundle exec rspec  # run Rails specs
bin/docker restart                         # pick up docs or other Ruby edits
bin/docker down                            # stop the Docker containers
```

Sass and JS rebuild live. After editing docs pages (`app/views/framework/*.html.erb`) or
other Ruby, restart so the change shows up.

### Serving modes

The current docs version (3.2) serves the **live** build here by default, so unreleased
Sass and JS changes show up on those pages as soon as the watcher finishes. Older tracks
(3.1, 3.0, 2.3, 1.2) always serve their pinned **released** bundles
(`public/css/<semver>/plugins.css`), which is what keeps them a faithful multi-version
test bench. In development the docs chrome carries a badge naming the mode a page is in.

Release preview is the opt-out. It serves the committed release artifacts for every
version, which is how you check a freshly cut release locally:

```bash
bin/rails framework:release_preview:enable    # released bundles everywhere
bin/rails framework:release_preview:disable   # back to the live build on 3.2
bin/rails framework:release_preview:status
```

The `framework:development:*` tasks are the consumer-host story, unchanged: a mother app
that mounts the gem enables them to render plugins against this checkout's build. Nothing
here needs them.

[docs/BUILD_AND_SERVING.md](docs/BUILD_AND_SERVING.md) has the full mode matrix, the build
outputs map, and the dev loop.

## Tests

The test suite checks source contracts, Rails documentation routes, runtime behavior,
and rendered CSS. Run the layer that matches your change, or run all six commands
before opening a pull request.

| Layer | Command | What it checks |
|---|---|---|
| Stylesheet contracts | `npm run test:stylesheets` | Public classes and variables, theme contracts, paint data, and minified CSS invariants |
| Script contracts | `npm run test:scripts` | Runtime syntax, minification, public API names, and the CSS to JavaScript paint boundary |
| Rule diff | `npm run test:rulediff` | The bundle comparison tool that proves a processed bundle resolves to the same values |
| Rails specs | `bundle exec rspec` | Every framework documentation route, versioned bundle selection, examples, and generated endpoints |
| Runtime behavior | `npm run test:runtime` | `terminalize()`, layout engines, readiness, idempotence, `TRMNLPaint`, `TRMNLCharts`, and the minified runtime in Chromium |
| Visual regression | `npm run test:visual` | Paint, borders, components, and representative compositions against platform-specific PNG baselines |

The browser suites need Chromium once per machine:

```bash
npx playwright install chromium
```

Both Playwright suites start a local Rails server and use the live compiled framework
CSS. The runtime harness loads the source or in-memory minified `plugins.js` without
automatic terminalization. The visual harness does not load `plugins.js`, docs chrome,
or remote assets, so screenshot differences stay attributable to CSS and component
markup.

Use the local debugging commands when a browser test fails:

```bash
npm run test:runtime:headed
npm run test:runtime:ui
npm run test:runtime:debug
npm run test:visual:headed
npm run test:visual:ui
```

The headless visual command and visual UI use the authoritative pixel comparison.
Headed Chromium uses a different rasterization path, so only the headed command
inspects fixtures and browser errors without comparing them to the headless PNGs.

Open the visual UI with one spec when you are investigating a focused failure:

```bash
npm run test:visual:ui -- test/visual/borders.spec.js
```

In the visual UI, run the spec or individual test from the left sidebar. Select a
failed test, then click the paperclip beside its red `Expect "toHaveScreenshot..."`
action. The Attachments panel provides Diff, Actual, Expected, Side by side, and
Slider views.

The central browser preview shows only the current rendering, not the comparison.

The error identifies the failed fixture, baseline filename, and changed pixel count.
The image diff localizes the visual change, but it cannot identify the source CSS
selector because screenshot assertions compare rendered pixels rather than code.

Playwright writes traces and failure screenshots under `tmp/playwright/`. Visual
baselines live under `test/visual/__screenshots__/<platform>/`. Update them only after
reviewing an intentional rendering change:

```bash
npm run test:visual:update
```

The GitHub workflow runs the Node contract suites, RSpec, a clean Sass build, and the
browser suites on Linux Chromium against committed Linux visual baselines (darwin PNGs
stay for local macOS runs). No paid visual-testing service is needed.

## Layout

```
app/assets/stylesheets/  Sass source
  plugins.scss             framework entrypoint (@use 'framework'); builds to plugins.css
  plugins_legacy.scss      legacy monolith (v1 docs examples only); the gem carries a
                           built snapshot at app/assets/static/legacy_bundle.css
  framework/               the design system (config, mixins, base, elements, components, utilities, themes)
app/javascript/          JS runtime + docs harness JS
  plugin-render/plugins.js   the terminalize engine (self-contained; published readable as plugins.js, minified as plugins.min.js)
  controllers/               docs Stimulus controllers (examples iframes, sidebars, palette, pickers)
app/controllers, app/views  the docs site (every doc version, releases, examples, /framework/test pages)
app/components/          docs ViewComponents (doc cards, comparisons, code examples, docs refs)
app/helpers/             docs page copy (framework_intro_paragraphs), class-name helpers, demo data
bin/                     setup, dev loop, clean build, byte-parity check, Docker wrappers
config/                  the Rails app; config/routes/framework.rb is the docs routing
db/data/                 token + release data (framework_colors.yml, framework_fonts.yml,
                         framework_versions.yml, framework_devices.yml ← exported by core)
lib/framework/           token generators, Framework::Version, ReleaseTask, FontsReleaseTask
lib/trmnl/framework/     the Rails engine host apps mount (Static, Package, route drawing)
lib/tasks/               framework.rake (tokens + releases), framework_docs.rake (markdown/llms.txt),
                         framework_themes.rake (theme lint)
lib/procss, lib/projs    minify tooling (cssnano+postcss-rename / terser), same as core
lib/rulediff/            rule-level diff of two CSS bundles, the gate for bundle-size work
server/                  the standalone docs server that mounts the engine locally
spec/                    RSpec: docs routes, compiled-CSS contracts, release pipeline, token readers
test/runtime/            Playwright runtime, paint API, chart adapter, and minified smoke tests
test/visual/             Playwright CSS visual specs and platform-specific PNG baselines
public/css, public/js    the published release archive: ALL versions, 0.0.1 → latest
public/framework/        release zips, release notes, per-release resolved color manifests,
                         example_fixtures/ (captured plugin examples); docs/ and examples/
                         hold the generated markdown twins, untracked
public/fonts, public/images  static assets the framework CSS references by absolute path
docs/                    reference docs (color system, paint rule traceability, engine
                         integration, build and serving, the deferred 4.0 removals)
```

## Ownership seams (framework ↔ core)

### Design tokens (colors + fonts): owned here
`db/data/framework_colors.yml` is the source of truth; `rake framework:colors`
regenerates `app/assets/stylesheets/framework/config/_tokens_colors_generated.scss` and
`_variables_colors.scss`. Because core's server-side bitmap/dithering pipeline reads the
same resolved data, every release publishes
`public/framework/colors/<version>/framework_colors.resolved.json`. Core reads it
in-process through `Framework::Colors` from the gem (no host copy).
See [docs/README.md](docs/README.md) for the full color system reference.

### Devices: framework is device-aware; core dictates the set
The framework is **not** device-agnostic: `framework/config/_devices.scss` bakes the
per-device `.screen--<device>` rules into the build. Device specs live in core
(`db/data/device_models.yml`); core exports them here with `rake framework:export_devices`
(in core), which writes both `_devices.scss` and `db/data/framework_devices.yml` (device +
palette + screen-picker payloads + example-plugin identity). The framework cannot invent
devices. Core additionally injects `Screen::DeviceCssVariables` inline on every render
path, so devices added between framework releases still render correctly against older
released bundles.

### Docs examples: fixtures, not live plugins
The `/framework/examples` pages render HTML fixtures captured from core
(`public/framework/example_fixtures/<plugin>/<view>{,.preview}.html` + `common.json`),
so this repo has no Plugin/Demoable/DeviceModel code. Re-capture from core when one of
those nine example plugins changes materially.

## Releases

```bash
rake framework:release:patch    # or minor / major; :current re-releases for local iteration
rake framework:release:fonts    # rebuild the font bundle zips
```

A release needs only this repo: it regenerates tokens, compiles via dartsass, processes the
CSS and JS bundles (cssnano / terser), writes `.gz` and `.br` siblings from Ruby (so
re-releasing identical content is byte-identical), zips, publishes the resolved color
manifest, and appends to `db/data/framework_versions.yml`. Commit everything it prints in "Next steps".
Each release also publishes the registered themes as `public/css/<version>/themes/<id>-theme.css{,.gz,.br}`
(unminified so theme source stays inspectable), and the responsive_test mixin harness as
`public/css/<version>/framework/responsive_test.css{,.gz,.br}`, which the docs page links at the
version whose bundle it compares against. The harness styles that one docs page, so it is
published per version but is not an entry in the release zip.

Every published version is permanent. After the release PR merges, the release commit
gets an annotated `v<version>` tag, and the Release workflow turns the tag into a
GitHub Release carrying the notes and the zip. Published versions are never re-cut; a
fix ships as the next patch. The full runbook, freeze rules included, is
[RELEASE.md](RELEASE.md).

The processing pipeline preserves all class names and every public, runtime, and theme
CSS variable. It shortens explicitly private implementation variables in a reserved
`--_tn*` namespace (`--tile-*`, numeric `--bline-*`, `--framework-internal-*`, `--_*`,
and the internal `--border-*` and `--tn-*` families, keeping the three
`--tn-text-stroke-*` names the runtime reads), and folds rules with identical
declarations into shared selector groups only where the cascade proves the fold
invisible. Registered theme CSS is supplied to the minifier as an additional contract.
The release publishes this processed output as `plugins.min.css`, the file production
serves; `plugins.css` beside it is the readable compiled build, so the two names carry
the conventional pair.

This repo is the publisher of record: `public/css|js/<version>/` carries the full
release archive (0.0.1 → latest) and the docs' releases page is generated by scanning it.

`bin/build` compiles the same entrypoints to `dist/` with core's exact Dart Sass
settings. It is a clean-compile check that CI runs on every pull request, not the release
input: releases read the dartsass-rails output in `server/app/assets/builds/`.

`bin/parity-check` is the byte check on the committed bundles. It rebuilds the framework
the way the release task does and compares the result against `public/css/latest` and
`public/js/latest`, so a stale or hand-edited bundle fails instead of shipping. CI runs it
on changes that touch `public/css/**` or `public/js/**`, which is what cutting a release
does, and on demand from the Actions tab.

## How core consumes this repo

Core is TRMNL's main application (the trmnl.com service). It is private and not part
of this release, and nothing in this repo depends on it at runtime. Core mounts this
gem as a Rails engine and treats it as the single source of truth:

- Gemfile: `gem "trmnl-framework", git: "...", branch: "main"` (or a `path:` checkout).
- `Framework.draw_routes(self)` mounts docs in-process under `/framework*`.
- Released `/css|/js|<semver>/`, fonts, color manifests, and Sass load paths come from
  the gem at runtime (`Framework::Static`). No `framework:fetch`, no host vendoring.
- `rake framework:development:enable` (in core) flips live-build mode so plugin renders
  use this checkout's current CSS/JS.

Upgrade flow: land changes on `main` here → in core `bundle update trmnl-framework` → deploy.

## Docs site notes

- Five doc versions render concurrently (1.2 / 2.3 / 3.0 / 3.1 / 3.2, defaulting to
  3.2). The four older tracks load their released bundle
  (`public/css/<semver>/plugins.css`), which is what makes the docs a faithful
  multi-version test bench; in this repo the 3.2 pages serve the live build instead. The
  resolution rules are in [docs/BUILD_AND_SERVING.md](docs/BUILD_AND_SERVING.md).
- `rake framework:generate_markdown` regenerates the `.md` twins of every docs page plus
  `/llms.txt` and `/llms-full.txt`. Absolute links use `APP_URL` (default
  `https://trmnl.com`).
- The twins land in this repo's `public/` (`public/framework/docs/<version>/`,
  `public/framework/examples/`, `public/llms*.txt`), which is where `Framework::Static`
  serves them from, so a page's Markdown URL resolves in any host that mounts the engine.
- That output is untracked: run the task when you want it locally. trmnl.com serves its
  own generation from core, which stays the production generator until docs cutover.
- `INTERCOM_TOKEN` (optional, maintainers) lets `generate_markdown` fetch the public
  help-center articles and fold them into `/llms.txt` and `/llms-full.txt`. Without it
  the step is skipped and the outputs stay framework-docs-only. The full guide (where
  the token lives, scope, run command) is in [docs/README.md](docs/README.md).
- `DOCS_BASE_URL` sets the absolute base for docs anchor links and release download
  links. The standalone docs server defaults it to `http://localhost:3001`
  (`server/config/application.rb`, which assigns `config.x.docs_base_url`); a host app
  can set either that or `config.trmnl_framework.docs_base_url`. Both feed
  `Framework.docs_base_url`, which every absolute URL in the engine reads.
- The docs site loads from four external origins, all of them in the docs chrome or in a
  demo. Offline, each one degrades on its own page and the rest of the site still works:
  - Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`): Inter and EB Garamond in
    `app/views/layouts/framework.html.erb`, Space Mono through the `@import` at the top of
    `app/assets/tailwind/application.css` (so it is compiled into the shipped
    `tailwind.css`), and Inter again in the srcdoc every demo iframe gets from
    `framework_examples_controller.js`. The docs chrome falls back to system fonts.
    Framework screens use the self-hosted fonts under `public/fonts/` either way.
  - The screen-picker web component (`@trmnl/picker`), pinned to `unpkg.com` in
    `config/importmap.rb`: the device picker stays blank.
  - Highcharts and Chartkick from `trmnl.com`, on the chart page and in the Shopify
    example fixture: those charts render empty. See the License section.
  - opentype.js from jsDelivr on the font glyphs page: the glyph tables stay empty.
- The framework CSS and JS bundles themselves reference no external host. Everything they
  fetch (pattern images, fonts) is served from the same origin as the bundle.
- A host mounting the engine inherits all four. The table in
  [docs/ENGINE_INTEGRATION.md](docs/ENGINE_INTEGRATION.md) names each origin, what loads
  from it, and the CSP directive it needs; the Open Source docs page carries the same list
  for readers of the site.
- View annotations are disabled in development: they break `sprite_icon_symbol`'s
  `</svg>`→`</symbol>` rewrite (kills the whole icon sheet) and would leak into
  generated markdown.

## Contributing

Start with [CONTRIBUTING.md](CONTRIBUTING.md): it covers running the app locally, the
repo layout, the test suites, and what makes a good PR. Report security issues privately
through [SECURITY.md](SECURITY.md) rather than opening a public issue.

Two norms matter most:

- **CSS is the single source of truth for paint.** `TRMNLPaint` reads the live cascade;
  any rendering rule exists in CSS first, then is mirrored 1:1 in JS. See
  [AGENTS.md](AGENTS.md) for the full mandate.
- **Docs copy follows the house style.** Short sentences, no em-dashes, leading with what
  the reader can do, and matching the voice of the entries already in the file. The full guide is
  [.claude/skills/write-docs/SKILL.md](.claude/skills/write-docs/SKILL.md).

## License

MIT. See [LICENSE](LICENSE).

The MIT grant covers the code. Fonts under `public/fonts/` are licensed separately:
the TRMNL pixel fonts by Heavyweight Digital Type Foundry, Inter, and the Nico fonts
ship under the SIL Open Font License 1.1, and BlockKie under CC BY 3.0. Each bundle in
[public/fonts/bundles/](public/fonts/bundles/) carries the full terms in its README,
OFL.txt, and CC-BY-3.0.txt.

Some images are third party too. The Weather Icons glyphs under `public/images/plugins/`
ship under the SIL Open Font License 1.1, and the brand marks the example plugins render
stay the property of their owners.
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) names every file, its owner, and its
terms.

Highcharts is a commercial library that this repo does not contain or distribute. The
chart docs page and the Shopify example fixture load it from `trmnl.com`, where TRMNL
serves it under its own license. That license does not come with this repo:
`TRMNLCharts` is an adapter, so a fork or a custom stack brings its own charting library
and its own license.
