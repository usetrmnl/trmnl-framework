# Engine integration for trmnl-core (mother app)

The gem is the single source of truth for the framework: docs, runtime classes,
the versioned release archive, fonts, and pattern images. Pin it to `main` and
deploy after `bundle update trmnl-framework`. Do not run `framework:fetch`, and
do not commit copies of any gem-owned tree into the host.

## Requirements

- **Ruby 4.0 or newer** (`required_ruby_version >= 4.0.0`). This is deliberate, not a
  leftover: the framework tracks the Ruby its docs server and release pipeline run on
  (`.ruby-version`), and no 3.x branch is maintained. Bundler refuses to install on
  Ruby 3.x, so check this before adding the gem.
- **Rails 8.1** for `actionpack`, `actionview`, `activesupport`, and `railties`. The
  engine depends on those four rather than the `rails` meta-gem, so mounting it adds no
  ActiveRecord, ActionMailer, ActionCable, or ActiveStorage. A host that wants them
  brings its own.
- **No database.** The reference host runs without one. The gems for the release and
  Markdown pipelines are development-only and are never installed in a host.

## Gemfile

```ruby
gem "trmnl-framework", git: "https://github.com/usetrmnl/trmnl-framework.git", branch: "main"
# Local checkout:
# gem "trmnl-framework", path: "../trmnl-framework"
```

## Routes (config/routes.rb)

```ruby
Framework.draw_routes(self)
```

Do not keep a redirect-only `config/routes/framework.rb`. Helpers stay
unprefixed (`framework_docs_*_path`).

## Host controller API

There is none. The engine asks the host nothing about the visitor: no
`current_user`, no `user_signed_in?`, no admin flag. Docs pages are public and
identical for everyone, so the page cache key is built from the URL, the locale,
the release stamp and the live-build flag alone.

Earlier versions required `current_user` and `user_signed_in?`, and
`Framework::HostCompat` supplied guest defaults for hosts that had neither. Both
are gone. A host that defines those methods keeps them for its own use and the
engine ignores them.

The engine's controllers subclass `::ApplicationController` by default. Point them
somewhere else with:

```ruby
config.trmnl_framework.parent_controller = "Docs::BaseController"
```

Set it in `config/application.rb` (before routes are drawn). Whatever you name is
the only base class involved; the engine adds no concern on top of it.

## Static assets: `Framework::Static` serves everything

The engine inserts `Framework::Static` at the top of the host middleware stack
unconditionally. In every environment it serves, from the gem's `public/`:

- `/css/*` and `/js/*`: every released version plus `latest`
- `/fonts/*`: see Fonts below
- `/images/*`: framework pattern images
- `/framework/colors/*`, `/framework/releases/*`, `/framework/example_fixtures/*`
- `/framework/trmnl-framework--<version>.zip` release downloads
- `/framework-docs/*` (docs chrome) and `/framework-dev/*` (development live build)

A host needs no symlinks, copies, or configuration for correctness: the docs app
under `server/` runs with an empty `public/` and serves every framework asset
through this middleware.

The release publishes a real pair per language: `plugins.css` and `plugins.js` are
the readable builds, and `plugins.min.css` and `plugins.min.js` are the processed
bundles (minified, private framework variables renamed) that
`Framework::Version#css_url` and `#js_url` point production at. A host that pins a
name gets the build that name has always meant.

Themes ship alongside those bundles, and a host links them from
`Framework::Version#theme_css_urls`: a hash of theme id to stylesheet URL, empty for
versions released before themes existed.

`Framework::Static` negotiates the precompressed siblings a release publishes. A
request that accepts `br` gets the `.br` file, one that accepts only `gzip` gets the
`.gz`, and anything else gets the plain file; the response keeps the plaintext
`Content-Type` and gains `Content-Encoding` plus `Vary: Accept-Encoding`. Nothing
compresses at request time, and no host or CDN setting is involved. Versions published
before 3.2.0 carry no `.br`, and those requests fall through to the `.gz` or the plain
file.

The docs chrome is Tailwind, and it resolves the same way. A host that builds
Tailwind links its own digested bundle; a host that never runs it falls back to
`/framework-docs/tailwind.css`, which the gem answers from the snapshot it ships
(`app/assets/static/docs_chrome.css`). So `/framework` renders styled with no
build step and no Tailwind config on the host side. `bin/rails
framework:docs_chrome` refreshes the snapshot from a fresh build; the release
build runs it.

The v1.2 bundle behind `/framework-docs/plugins_legacy.css` works the same way.
No release ever published it, so the gem carries a built snapshot
(`app/assets/static/legacy_bundle.css`) as the last candidate after the live
builds. `bin/rails framework:legacy_bundle` refreshes it, the release build runs
that too, and rspec fails when the snapshot and `plugins_legacy.scss` disagree.

Because the middleware sits ahead of `ActionDispatch::Static`, the gem's file
wins in-process wherever the host and the gem both have one. Keep gem-owned
trees out of the host's `public/` entirely so the two orders (in-process and
nginx, which prefers the host) can never disagree about the same URL.

## Fonts

The gem owns and serves all framework fonts:

- The TRMNL pixel families `TRMNL{12,16,21}-{Regular,Bold}.{woff2,woff,ttf}`
  (v1.002, SIL Open Font License 1.1, copyright Heavyweight Digital Type
  Foundry), plus Inter Variable, NicoClean, NicoPups, and BlockKie.
- Bundle downloads under `/fonts/bundles/<id>/`: the zip, its `README.md` with
  per-font terms, and `OFL.txt`. The trmnl bundle also carries
  `trmnl-fonts--trmnl-only.zip` (the TRMNL families without Inter, plus a
  `README.md` and `OFL.txt` covering just those families), which core's Font
  Family page links as its download. `rake framework:release:fonts` builds both
  archives from `db/data/framework_fonts.yml`.
- `/fonts/CHANGELOG.md`: the per-change record of the v1.001 metric repairs and
  the v1.002 licensing correction.

Framework CSS references fonts by root-relative URL (`/fonts/...`) in every
released version, so the host must serve `/fonts` at the web root. `Framework::Static`
does. Dogicapixel was removed in 3.2.0; bundles 3.1.8 and earlier keep a dead
`@font-face` for it, which browsers never fetch because no rule applies the family.
The docs Releases page carries the same note above the archive, for integrators
pinned to a 3.1.x bundle.

## Third-party origins the docs chrome loads

Mounting the engine makes the browser fetch from four origins the gem does not
control, plus the public map tile endpoint a map fetches by default. The
framework bundles reference no external host apart from that one:
`plugins.css` fetches nothing outside its origin, and `plugins.js` names the
public tile endpoint in `TRMNLMaps.tiles()`, which a plugin reaches only when it
builds a map and names no source of its own. The four below are the docs chrome
and the demos around it; the tiles are covered in their own section.

| Origin | What it loads | Where it comes from | Blocked |
| --- | --- | --- | --- |
| `fonts.googleapis.com`, `fonts.gstatic.com` | Inter and EB Garamond for the docs UI, Space Mono for code, Inter again inside every demo iframe | `app/views/layouts/framework.html.erb`, the `@import` at the top of `app/assets/tailwind/application.css` (so it is baked into the `tailwind.css` the gem ships), and `buildSrcdoc` in `app/javascript/framework_docs/controllers/framework_examples_controller.js` | Docs chrome and demo iframes fall back to system fonts. Framework screens keep the self-hosted `/fonts` families either way. |
| `unpkg.com` | `@trmnl/picker`, the screen-picker web component | `config/importmap.rb` | The device picker stays blank. Every page still renders. |
| `trmnl.com` | Highcharts and Chartkick | The chart docs page and the Shopify example fixture | Those charts render empty. Highcharts is commercial and TRMNL serves it under its own license, so it is not vendorable here. MapLibre GL JS, by contrast, is BSD licensed and vendored: the map demos load it from the engine at `/framework-docs/maplibre-gl-5.24.0.js` and `.css` (`vendor/javascript/`), and the plugin snippets name the same build mirrored beside Highcharts at `trmnl.com/js/maplibre-gl/5.24.0/`. |
| `cdn.jsdelivr.net` | opentype.js | The font glyphs docs page | The glyph tables stay empty. |

Each failure is local to its own page, so a host that blocks all four still
serves every docs page. Under a strict CSP, allow `style-src` and `font-src` for
the two Google Fonts hosts, `script-src` for trmnl.com, unpkg.com and
cdn.jsdelivr.net, and `worker-src blob:` plus `img-src data:` for the MapLibre
worker and pattern images, or accept the degradation above. The engine has no
setting that turns them off.

### Map tiles

A map names no tile host by default: `TRMNLMaps` fetches OpenStreetMap's public
Shortbread endpoint (`vector.openstreetmap.org`) from the page itself, so a
plugin with no source of its own costs the host nothing and `connect-src`
needs that origin. A plugin names its own source with `options({ tiles: { url,
key } })` (a `{z}/{x}/{y}` template, `{key}` filled from the key), and the host
injects one per plugin instance as `window.__TRMNL_MAPS__ = { tiles: { url, key } }`
(or a preset name), which is how a plugin author's key or a user's key from the
plugin settings reaches a map; a source named in code wins over the injected
one. Keys never live in the framework.

The `'trmnl'` preset is TRMNL's own planet on the edge,
`https://maps.trmnl.com/tiles/osm/{z}/{x}/{y}`, so a page offering it needs
`connect-src https://maps.trmnl.com` rather than `'self'`.

The engine also serves `/framework/tiles/{z}/{x}/{y}.mvt` on the page's host
(`connect-src 'self'`) for a host proxying a source of its own.
`FrameworkTilesController` and `Framework::Tiles` answer it by fetching the tile
server-side from `Framework.tile_source_url`, a URL template with `{z}`, `{x}`
and `{y}`, and handing the bytes on with the vector tile content type, the
upstream encoding, a day of public cache and an open CORS origin. Nothing is
stored: no tile data lives in the gem, on disk or in a database. The docs site
uses this preset (its demo iframes set `window.__TRMNL_MAPS__ = { tiles: 'trmnl' }`);
a host's own plugins can, and third-party plugins do not by default.

- `config.trmnl_framework.tile_source_url`, then the `TRMNL_FRAMEWORK_TILE_SOURCE_URL`
  environment variable, then the default: OSMF's Shortbread endpoint,
  `https://vector.openstreetmap.org/shortbread_v1/{z}/{x}/{y}.mvt`.
- `config.trmnl_framework.tile_source_user_agent` names the host to the upstream
  (default `TRMNL Framework tiles (+https://trmnl.com)`).

The default upstream of that endpoint, and the public default the runtime
fetches directly, are the same community server, whose
[usage policy](https://operations.osmfoundation.org/policies/vector/) allows
light use and forbids a fleet; a host that renders many map plugins for devices
points `tile_source_url` at its own Shortbread tile source, or has plugins
bring their own. [MAPS_GO_LIVE.md](MAPS_GO_LIVE.md) is that checklist. Put a
CDN in front of `/framework/tiles/`: devices refetch the same tiles every
refresh, so the cache takes most of the load.

## Runtime

- `Framework::Version` reads `db/data/framework_versions.yml` from the gem.
- `Framework::Colors` reads the latest resolved color manifest from the gem.
- The engine adds the gem's stylesheets to the dartsass load path, but core
  deliberately does not `@use` framework Sass: core styles depend on the
  published CSS contract (modifier classes and custom properties) through its
  `shared/_framework_contract.scss` adapter, enforced by
  `spec/assets/stylesheets/framework_dependency_spec.rb`.
- Dev mode: `rake framework:development:enable` writes
  `tmp/framework-development.txt`; CSS/JS then come from the gem live build.
  `/framework-dev/*` serves the framework checkout's own `server/app/assets/builds`, which is
  gitignored, so this needs a `path:` checkout that has been built (`bin/setup`, or
  `bin/rails dartsass:build`). A `git:` source or an installed gem carries no build
  output and dev mode has nothing to serve; the task warns when it finds none.
- The framework repo's own docs server is the one exception, and only for itself: in
  development it serves the live build for the current docs version with no marker file.
  Host semantics, this marker included, are unchanged. See
  [BUILD_AND_SERVING.md](BUILD_AND_SERVING.md).

Keep core's command-palette / appearance helpers on the gem
(`Framework.docs_base_url`, `Framework.font_family_options`). Do not keep a host
`lib/framework.rb`: Zeitwerk will never load it once the gem has defined
`Framework`. Do not keep a second `lib/framework/version.rb` or
`lib/framework/colors.rb`.

Every absolute docs URL the engine builds (heading anchor links, release download
links) reads `Framework.docs_base_url`, which resolves in this order:

- `config.trmnl_framework.docs_base_url`
- `config.x.docs_base_url` (what the docs server under `server/` sets from `DOCS_BASE_URL`)
- the `framework_docs_url` credential
- `http://localhost:3001` in development, `https://trmnl.com` otherwise

Setting either config key is enough. A host that sets neither gets the last default.

## Markdown docs and llms.txt

Every docs page has a Markdown twin at its own URL plus `.md`, and `/llms.txt` and
`/llms-full.txt` sit at the host root. `Framework::Static` serves all of them out of the
gem's `public/`, so they resolve wherever the engine is mounted.

They are generated, not committed. Run this once per deploy of a new gem version:

```bash
bundle exec rake framework:generate_markdown
```

It writes into `Framework.public_root` (the gem's own `public/`), which means the gem has
to sit somewhere writable; the task aborts with that message if it does not. Until it
runs, the `.md` URLs 404 and the docs chrome's "Copy as Markdown" reports the page as
unavailable rather than copying the error page.

The generator parses and converts HTML, which mounting the engine does not need, so those
two gems are yours to add:

```ruby
gem "nokogiri", require: false
gem "reverse_markdown", "~> 3.0", require: false
```

The task names whichever one is missing and stops before it writes anything.

## What the engine claims in your app

The engine is deliberately not isolated (`engine_name "trmnl-framework"`, no
`isolate_namespace`), so its names land at host level. Check these against your app
before mounting:

- **Controllers**: `FrameworkController`, `FrameworkTestsController`.
- **Helpers**: `FrameworkHelper`, `FrameworkDemoHelper`, `FrameworkImagesHelper`,
  `FrameworkRoutesHelper`, `DocsChromeHelper`, `CoreCompatHelper`. The constant names are
  claimed, the method names are not: the engine hands the host no `app/helpers` path, so
  `helper :all` never finds these and your controllers, mailers and views keep every method
  name they define. The two docs controllers include the modules their own pages call, which
  is the only place engine helpers run. `FrameworkRoutesHelper` redefines the framework route
  helpers that carry no docs version, and now only inside the docs, so a host page that
  renders one of them gets the plain Rails helper.
- **View components**: `AppMenubarComponent`, `CodeExampleComponent`, `DocsRef`,
  `TokensRef`, `FrameworkComparisonComponent`, `FrameworkDocCardComponent`,
  `FrameworkDocsSectionComponent`.
- **Everything else is under `Framework::`**: `Framework::Version`, `Framework::Colors`,
  `Framework::Themes`, `Framework::Devices`, `Framework::MenubarTheme`, and the rest of
  `lib/framework`.
- **View roots**: `app/views/{framework,framework_v1,framework_v2,framework_v3_1,framework_tests,layouts,shared}`.
  The engine claims no `layouts/application.html.erb`: both its controllers name their
  layout, so a host's own application layout is never shadowed. The two docs controllers
  prepend this tree onto their own lookup, so the docs render the chrome shipped beside
  them even where your app has a partial of the same name. `shared/` is where that bites:
  core carries its own `_fancy_screen_picker`, `_menubar_screen_picker` and a copy of
  every `shared/icons` partial, and before the prepend those answered for the docs. Your
  own controllers are untouched, so your copies still render your pages.
- **JS module names**: everything the docs boot for themselves is pinned under
  `framework_docs/`, and the docs layout names `framework_docs/application` as its entry
  point. A host importmap is drawn after the engine's and the later pin wins, so nothing
  bare is safe to share. `plugin-render/*`, `plugin_legacy` and `framework_iframe_bridge`
  stay bare on purpose: those match the names core already pins.
- **URL prefixes**: `/css/`, `/js/`, `/fonts/`, `/images/`, `/framework/`,
  `/framework-docs/`, `/framework-dev/`, plus `llms.txt` and
  `llms-full.txt` at the root. `Framework::Static` is unshifted ahead of
  `ActionDispatch::Static`, so the gem's file wins in-process wherever both have one.

Framework CSS references `/fonts/` and `/images/` by root-relative URL in every released
bundle, so those two prefixes cannot move.

## Docs default version

Engine redirects default to `FrameworkController::CURRENT_DOCS_VERSION` (3.2).
`config/routes/framework.rb` reads that constant, plus `SUPPORTED_DOCS_VERSIONS` for the
version segment constraint and `LEGACY_DOCS_VERSION_ALIASES` for the `/v1`, `/v2`, `/v3`
redirects, so a version bump is a one-line change in the controller.

## Production deploy (nginx offload)

`Framework::Static` already makes every URL correct through Puma. The nginx
fallback exists so plugin renders and font fetches stay off the app server, and
so responses carry cache headers (`Rack::Files` sends none).

One symlink, refreshed after each `bundle install` (do not commit it):

```bash
ln -sfn "$(bundle show trmnl-framework)/public" /home/deploy/trmnl-worker/framework_public
```

nginx serves host `public/` first and falls back to the gem
(see `misc/devops/05_install_nginx` in core for the canonical config):

```nginx
location / {
    try_files $uri $uri/ @framework_gem;
}

location @framework_gem {
    root /home/deploy/trmnl-worker/framework_public;
    expires 1h;
    add_header Cache-Control "public, max-age=3600";
    # CORS headers repeated here; add_header is not inherited once redefined.
    try_files $uri =404;
}
```

nginx does not pick the precompressed siblings up on its own. Turn on `gzip_static`,
and `brotli_static` where the ngx_brotli module is available, in that location, or an
offloaded request gets the plain bundle while the same URL through Puma gets the
compressed one.

Host wins in nginx where both trees have a file, which is the inverse of the
in-process order. That difference is harmless exactly as long as the host tracks
no gem-owned trees; the drift-guard spec in core enforces that.

### What still goes through Rails

- `/framework*` docs routes (dynamic pages, examples index, legacy redirects)
- `/framework-docs/*` on Propshaft static hosts
- `/framework-dev/*` (development mode only)

Anything else that reaches Puma is still served correctly by
`Framework::Static`, just without cache headers.
