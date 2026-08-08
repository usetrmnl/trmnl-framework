# Contributing to the TRMNL Framework

Thanks for helping improve the TRMNL design framework. This repo hosts the Sass
source, the terminalize JS runtime, the design tokens, and the documentation site
that renders them.

## Run it locally

You need Ruby 4.0.6 (`.ruby-version`), Bundler, and Node 24.13.0 (`.nvmrc`).
See the Prerequisites and Docker sections in [README.md](README.md) if you are setting
up for the first time.

```bash
bin/setup   # gems, npm, token generation, all CSS builds (required on a fresh checkout)
bin/dev     # server on :3001 plus live Sass/Tailwind rebuild watchers
```

Open <http://localhost:3001/framework> to view the docs.

`bin/dev` is the loop: the server plus the Sass and Tailwind watchers. Docs pages for the
current version serve that live build, so an edit lands on a refresh. The badge in the
docs chrome says which mode a page is in, "Live build" or "Released `<semver>`".

`server/app/assets/builds/` is gitignored, so a fresh checkout must run `bin/setup` (or
`bin/dev`, which builds first) before the docs render correctly. Re-run it after a pull if
the CSS looks stale. [docs/BUILD_AND_SERVING.md](docs/BUILD_AND_SERVING.md) covers the
serving modes, the build outputs, and the troubleshooting list.

## Repo layout

The docs and the framework live in one Rails app, and framework development happens
against the rendered docs pages. See the Layout section in
[README.md](README.md) for the full directory map. The short version:

- `app/assets/stylesheets/framework/` is the Sass design system.
- `app/javascript/` is the JS runtime and the docs harness.
- `app/views/framework/*.html.erb` is one docs page per framework feature.

## Core mandate

CSS is the single source of truth for paint. `TRMNLPaint` reads the live cascade and
converts it. It never re-implements token mappings, adds contrast heuristics, or
invents fallback values in JS. A rendering rule must exist in CSS first, then be
mirrored in JS one to one.

Before adding a pattern, tile, gradient, or one-off variable, check whether the
existing dither/tile system, border pipeline, or theme slots already express it. A
new bespoke mechanism for one call site is almost always wrong.

## Run the tests

The Ruby suite is the broadest one: the SCSS contract specs, the docs pages, the
helpers, and the release pipeline. It compiles the framework Sass once per run, so
expect a couple of minutes:

```bash
bundle exec rspec
```

The source and build contract suites use `node --test`. The third one covers the
rule-level diff that bundle-size work is verified with:

```bash
npm run test:stylesheets
npm run test:scripts
npm run test:rulediff
```

The runtime behavior suite uses Playwright with a local Rails server and Chromium.
Install its browser once, then run the suite headless or with a visible browser:

```bash
npx playwright install chromium
npm run test:runtime
npm run test:runtime:headed
```

Use `npm run test:runtime:ui` for Playwright's test explorer or
`npm run test:runtime:debug` for the inspector. These commands run entirely on your
machine and do not require a hosted Playwright service.

The visual suite compares deterministic CSS and component harnesses against PNG
baselines for your operating system. Run it locally after changing framework styles:

```bash
npm run test:visual
npm run test:visual:headed
```

Use `npm run test:visual:update` only after reviewing an intentional rendering
change. Commit the updated PNGs with the style change.

`npm run test:visual` is the authoritative pixel comparison. Headed Chromium uses a
different rasterization path, so `test:visual:headed` and `test:visual:ui` inspect the
fixtures and browser errors without comparing them to headless PNGs. Use the failure
artifacts from the headless command to review image differences.

Visual baselines are platform-specific because browsers and fonts can render
differently across operating systems. Darwin and Linux PNGs both live under
`test/visual/__screenshots__/`. Local macOS runs use the darwin set; CI compares
against linux. After an intentional rendering change, update the baseline for the
platform you ran on, and if only one of them changed take the other from a CI
failure artifact (`*-actual.png` under `tmp/playwright/visual-results`).

The release suite loads the committed bundles for older versions from the path a pinned
plugin links, and checks that adding a `text--` utility to a `bg--` box changes neither
its declarations nor its pixels. Run it after touching anything under `public/css`:

```bash
npx playwright install chromium firefox
npm run test:release
```

Firefox is in this suite and no other because it paints every background layer with the
first `background-clip` value instead of one per layer, so a bundle can pass in Chromium
and still paint the wrong thing on the browser the render pool uses.

Every pull request runs the contract suites, rubocop, a Sass build that fails on any
undefined reference, a color-tokens job that regenerates the two tracked color SCSS
files and fails on drift, an em-dashes job that greps the tracked tree for the banned
glyph, and the Ruby suite. Run `bundle exec rspec`, `bundle exec rubocop`, and
`bin/check-em-dashes` before pushing.

The Ruby suite runs as five shards behind one required check named `RSpec`, so a red
shard fails the pull request.

A processed-bundle job builds what a release publishes as `plugins.css`: the compiled
bundle minified, with private framework variables renamed and duplicate rule bodies
folded. It checks the public custom-property contract against that output, which no other
job reads. Run it locally with `bundle exec rake framework:processed_bundle` followed by
`bundle exec rspec spec/assets/stylesheets/framework_processed_bundle_spec.rb`.

`PROCESSED_BUNDLE=1` points the browser suites at that same artifact, which is the check
to run before a release re-cut.
[docs/BUILD_AND_SERVING.md](docs/BUILD_AND_SERVING.md) has the commands.

Both browser suites have jobs, skipped while the repo is private. Each one blocks when
it fails. A tag runs the runtime suite against the processed bundle regardless of
repository visibility, so no version publishes without a browser loading the exact bytes
it ships.

## Writing docs copy

Follow the house style in
[.claude/skills/write-docs/SKILL.md](.claude/skills/write-docs/SKILL.md). The
non-negotiables:

- Never use em-dashes. Rewrite with a period, comma, colon, or parentheses.
- Keep paragraphs to 1 to 3 short sentences, one idea per sentence.
- Lead with what the reader can do or what the thing is.
- Demo markup inside a `.screen` uses framework classes only.
- Match the entries already in the file: same voice and structure. Keep feature and release notes to one tight paragraph, benefit-first, stating the win as a concrete contrast (`generated gradients instead of image tiles`).

## What makes a good PR

- Keep it small and focused. One concern per pull request.
- If you add or change a utility, update its docs page and its live example in the
  same change. The docs are the test bench, so a utility without a rendered example
  is incomplete.
- Run `bundle exec rspec`, the two node contract suites, and `bundle exec rubocop`,
  and confirm `bin/build` succeeds before you push.
- No em-dashes in any copy you touch. `bin/check-em-dashes` is the check CI runs.

## Releases

Releases are maintainer-only. Do not run the release tasks as part of a
contribution. Land your change, and a maintainer cuts the release. The tagging and
publishing runbook is [RELEASE.md](RELEASE.md).

The Bundle parity workflow is separate from CI for the same reason. It byte-compares the
committed release bundles against a fresh build of the source, so it runs only when a
change moves `public/css/**` or `public/js/**`, which is what cutting a release does. A
source change on its own never triggers it.
