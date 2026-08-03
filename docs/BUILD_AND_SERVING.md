# Build and serving

Framework CSS lives in several trees in this repo, and only one of them is the source.
This page names which is which, says what a docs page loads in each serving mode, and
covers the loop you run while working.

The host side of the same story (what a mounting app serves and configures) is
[ENGINE_INTEGRATION.md](ENGINE_INTEGRATION.md).

## Build outputs

| Path | What it is | Written by | Tracked |
| --- | --- | --- | --- |
| `app/assets/stylesheets/` | Sass source: the design system plus the `plugins.scss` and `plugins_legacy.scss` entrypoints | edited by hand | yes |
| `app/javascript/` | JS source. `plugin-render/plugins.js` is the runtime, served as written in development and minified at release time | edited by hand | yes |
| `server/app/assets/builds/` | the live build: `plugins.css`, `plugins_legacy.css`, `themes/<id>-theme.css`, `framework/responsive_test.css`, `tailwind.css` | `bin/watch-css`, `bin/rails dartsass:build`, `bin/rails tailwindcss:build` | no, gitignored |
| `server/app/assets/builds/plugins.processed.css` | the renamed and minified bundle a release publishes as `plugins.min.css`, next to its `plugins.processed.rename-map.json` | `bin/rails framework:processed_bundle` | no, gitignored |
| `public/css/<semver>/`, `public/js/<semver>/` | frozen release artifacts, every published version | the release tasks | yes |
| `public/css/latest/` | a mirror of the newest release, and the fallback source for theme and harness CSS on older docs tracks | the release tasks | yes |
| `app/assets/static/` | committed snapshots of the docs chrome (`docs_chrome.css`) and the v1.2 bundle (`legacy_bundle.css`) | `bin/rails framework:docs_chrome`, `bin/rails framework:legacy_bundle` | yes |
| `dist/` | a clean-compile check, never served | `bin/build` | no, gitignored |
| `app/assets/builds/` (repo root) | a `.keep` and nothing else | nothing in this repo | the `.keep` only |

Rails.root for the docs server is `server/`, so every Rails build task writes into
`server/app/assets/builds/`. That directory is the live build for the docs pages and for
`Framework::Static`, and it is the only one either consults.

The repo-root `app/assets/builds/` is a leftover of the layout before the docs app moved
under `server/`, when Rails.root was the repo root. Nothing has written it since, so it
holds a `.keep` and nothing else. `Framework::Static` and `Framework::Version` used to
list it as a later candidate, which meant a checkout carrying output from that era served
it in preference to the released bundle; they no longer look there, and
`spec/build/repo_hygiene_spec.rb` fails on anything but the `.keep`.

`app/assets/static/` also carries `prism_trmnl.css`, the docs code theme. It is
maintained by hand, not generated.

## Serving modes

A docs page loads a `plugins.css`, a `plugins.js` on the pages that terminalize, the
registered theme stylesheets, and, on the responsive test page, the mixin harness CSS.
Two modes decide where all of those come from.

**Released** is the mode everywhere except this repo's own development server: in
production, in the test environment, and in any host that mounts the gem. Each docs
version serves the published bundle it documents.

**Live build** is the default in this repo in development, for the current docs version
only (`FrameworkController::CURRENT_DOCS_VERSION`, 3.2). No marker file is involved. It
applies whenever the live builds are complete, meaning `server/app/assets/builds/`
carries `plugins.css` and a stylesheet for every registered theme.

Two markers change that:

- `bin/rails framework:release_preview:enable` writes
  `server/tmp/framework-release-preview.txt`. While it exists, the framework repo serves
  released assets for every version, which is how you verify a freshly cut release
  locally. `disable` removes it and `status` prints the current state.
- `bin/rails framework:development:enable` writes `tmp/framework-development.txt` under
  the host's Rails.root. That is the consumer-host opt-in and its semantics are
  unchanged: `Framework::Version.development_mode?` reads it, and `css_url` and `js_url`
  return `/framework-dev/*` so the mother app's plugin renders use the mounted
  checkout's build. See [ENGINE_INTEGRATION.md](ENGINE_INTEGRATION.md).

### Mode matrix

| Mode | Docs version | plugins.css and plugins.js | Theme CSS | responsive_test harness CSS |
| --- | --- | --- | --- | --- |
| Framework repo, development, builds complete | current (3.2) | live build | live build | live build |
| Framework repo, development, builds complete | 3.1, 3.0, 2.3, 1.2 | released | released, `css/latest` fallback | released, `css/latest` fallback |
| Framework repo, development, release preview marker | every version | released | released, `css/latest` fallback | released, `css/latest` fallback |
| Framework repo, development, builds incomplete | every version | released | released, `css/latest` fallback | released, `css/latest` fallback |
| Production, test environment, consumer hosts | every version | released | released, `css/latest` fallback | released, `css/latest` fallback |
| Consumer host with the development marker, host builds complete | current (3.2) | the host's live build | the host's live build | the host's live build |

Older tracks are frozen by design. 3.1, 3.0, 2.3, and 1.2 serve their released assets in
every mode, which is what makes the docs a multi-version test bench rather than five
views of the working tree.

### Telling which mode you are in

In development the docs chrome carries a small mode badge: "Live build" when the page is
serving the live build, "Released `<semver>`" otherwise. It is never rendered outside
development. Boot logs one line saying the same thing, and names the reason when live
serving is off (incomplete builds, or the release preview marker).

Incomplete builds are a fallback, not a failure. A checkout that has never been built
still renders every docs page from the release archive, and the badge and the log line
say why.

## The dev loop

```bash
bin/setup   # once: gems, npm, asset symlinks, color tokens, dartsass, tailwind
bin/dev     # the loop
```

`bin/dev` runs foreman against `Procfile.dev`, which holds three processes:

- **web**: `bin/rails server` on port 3001.
- **css**: `bin/watch-css`, the Dart Sass watcher. It compiles `plugins.scss`,
  `plugins_legacy.scss`, `framework/responsive_test.scss`, and every
  `framework/themes/<id>-theme.scss` into `server/app/assets/builds/`, once at start and
  again on every change.
- **tailwind**: `tailwindcss:watch`, which rebuilds the docs chrome (`tailwind.css`) into
  the same directory.

JS has no build step. `app/javascript` is on the Propshaft load path, so an edit to
`plugin-render/plugins.js` or to a docs Stimulus controller is live on the next browser
refresh.

ERB, helper, and other Ruby edits reload per request in local development. Under Docker
they do not: reloading is off in the container and page caching is on, so restart it
(`bin/docker restart`) after a Ruby edit. The Docker section in
[../README.md](../README.md) has the rest of those commands.

## How a docs page resolves its assets

The version segment in the URL picks both the view set and the released bundle.

| Docs version | View directory | Notes |
| --- | --- | --- |
| 3.2 (current) | `app/views/framework` | the pages under active development |
| 3.1, 3.0 | `app/views/framework_v3_1` | holds only the pages whose 3.2 rewrite diverged; anything absent falls back to `app/views/framework` |
| 2.3 | `app/views/framework_v2` | |
| 1.2 | `app/views/framework_v1` | |

`FrameworkController::DOCS_VIEW_PREFIX_BY_VERSION` is that mapping, and
`SUPPORTED_DOCS_VERSIONS` is the set of version segments the routes accept.

In released mode the controller resolves one semver per track: the newest published
version whose major and minor match the docs version and that has both `plugins.css` and
`plugins.js` on disk. When no version in that minor qualifies, it falls back to the
newest complete version in the same major. So a 3.1 page serves `3.1.8`, a 2.3 page
serves `2.3.7`, and a 1.2 page serves `1.2.0`.

Theme CSS and the responsive_test harness CSS resolve against that same semver, then fall
back to `public/css/latest/`. Releases before 3.2.0 published neither file, so an older
track picks up the newest published copy instead of linking a 404. When neither path has
a file, the page renders without theme styling rather than raising. The v1.2 track keeps
one more fallback: where the release archive carries no complete 1.x bundle, the page
serves the `plugins_legacy` bundle instead, which comes from the live build or, in a host
that has none, from the snapshot `Framework::Static` ships.

## Releases

`rake framework:release:patch` (or `minor`, or `major`) cuts a version.
`rake framework:release:current` re-cuts the unpublished one, which is the task to run
while iterating on a release locally. Each of them regenerates tokens, compiles,
minifies, compresses, zips, publishes the resolved color manifest, and records the version
in `db/data/framework_versions.yml`.

`bin/parity-check` rebuilds the framework the way the release task does and byte-compares
the result against `public/css/latest` and `public/js/latest`, so a stale or hand-edited
bundle fails instead of shipping. It covers the tracked files the rebuild regenerates as
well, and restores them, so running it never leaves a modified tree behind. The Bundle
parity CI job runs it whenever a change touches `public/css/**` or `public/js/**`.

To read a fresh cut the way a consumer will get it, enable the release preview marker and
reload the docs. The full runbook, freeze rules included, is [../RELEASE.md](../RELEASE.md).

### What a release publishes

From the 3.2.0 re-cut on, the released `plugins.css` and `plugins.js` are the processed
bundles: the procss output (minified, with private framework variables renamed) and the
projs output (minified, with the build marker stamped to the version). Every published URL
keeps working and serves the smaller file.

`plugins.css` and `plugins.js` ship readable beside them. They ship as
aliases for URL stability, not as a second build, so a consumer pinned to either name gets
the same bytes. Theme stylesheets and the responsive_test harness stay unprocessed, so
theme source remains readable.

Development is the one mode that serves something else: the live build, which is neither
minified nor renamed. Two checks keep them honest: every pull request asserts the public
custom-property contract on a freshly built processed bundle, and the browser suites load
that same artifact on demand. A processing bug cannot hide behind a check that only ever
saw the live build.

### Compressed serving

A release publishes `.gz` and `.br` siblings next to every bundle, theme stylesheet, and
harness stylesheet it ships. Both are written from Ruby at maximum quality, so re-cutting
identical content reproduces identical archives.

`Framework::Static` negotiates them itself. A request that accepts `br` gets the `.br`
bytes, one that accepts only `gzip` gets the `.gz`, and anything else gets the plain file.
The response carries the plaintext file's `Content-Type` plus `Content-Encoding` and
`Vary: Accept-Encoding`. No host or CDN configuration is involved, and nothing decompresses
at request time.

Versions published before 3.2.0 carry no `.br`, and they never will: released directories
are frozen. Every consumer of the release listings treats the sibling as optional, so those
versions serve and list exactly what they shipped.

Picking the precompressed files up at the usetrmnl.com CDN edge is an ops checklist item,
not a repo change.

### The processed bundle

`bin/rails framework:processed_bundle` produces what a release publishes as
`plugins.css` (and its byte-identical `plugins.min.css` alias), without cutting a
release. It compiles the Sass and runs procss with the same theme preserve flags the
release task passes, leaving `plugins.processed.css` and
`plugins.processed.rename-map.json` in `server/app/assets/builds/`.

Two checks read it. `spec/assets/stylesheets/framework_processed_bundle_spec.rb` asserts
that the public custom-property contract survived the renamer, and skips when the
artifact is absent. `bin/rule-diff` compares two bundles rule by rule: per at-rule
context and per selector, the final property map either matches or it does not. The
Processed bundle CI job runs the build and the spec on every pull request.

```bash
bin/rule-diff before.css after.css \
  --base-rename-map before.rename-map.json \
  --rename-map after.rename-map.json \
  --report tmp/rule-diff
```

Both inputs must be minified the same way, or every value cssnano normalized reports as
a change. Give each renamed side the map it was built with, so the two compare in
original-name space: the private numbering is assignment order, so widening the private
set moves every name after the first new one. The command exits nonzero when a selector
lost its rule or its final map moved, and `--report` writes the detail.

Comma groups and rule order are deliberately invisible to it. The key is one selector in
one at-rule context, and duplicate rules for that selector fold in source order, so a
pass that regroups or moves rules passes as long as every selector still resolves to the
same values.

`PROCESSED_BUNDLE=1` runs the Playwright suites against that artifact instead of the live
build, with the minified runtime alongside it. The visual suite compares the same
committed screenshots either way, so a processed run passes only when the released bytes
paint the same pixels.

```bash
bin/rails framework:processed_bundle
npm run test:runtime:processed
npm run test:visual:processed
```

Run it before a release re-cut rather than on every pull request: the build costs about
90 seconds. The Release workflow runs the runtime half on every tag, so a published
version is never one no browser loaded, and running it locally first is how you find
that out before the tag exists. `test/runtime/release/processed-bundle.spec.js` asserts
in both modes that the browser received the bundle and the runtime its mode names, so a
swap that missed fails instead of reporting parity.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| An SCSS edit does not show on the docs page | Is the page on the current docs version (3.2)? Is `bin/dev` running, so the watcher rebuilt? Does the mode badge say Live build? Is the release preview marker set (`bin/rails framework:release_preview:status`)? Do the files under `server/app/assets/builds/` carry a fresh timestamp? |
| The badge says Released on a 3.2 page in this repo | The live builds are incomplete: `plugins.css` or one theme stylesheet is missing from `server/app/assets/builds/`. Run `bin/setup`, or `bin/dev`, which builds a fresh checkout before it starts. |
| A theme edit is invisible on an older docs page | Working as intended. Older tracks serve their released theme CSS in every mode. Check the change on the 3.2 page. |
| A docs page under Docker keeps showing old content | Page caching is on and code reloading is off in the container. Restart it with `bin/docker restart`. |
