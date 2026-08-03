# Releasing the framework

A release is four things that always move together: a `db/data/framework_versions.yml`
entry, the committed artifacts under `public/`, an annotated `v<version>` git tag, and
a GitHub Release. Releases are maintainer-only (see
[CONTRIBUTING.md](CONTRIBUTING.md)).

## Cut the release

On a branch:

```bash
rake framework:release:patch    # or minor / major
```

The task regenerates tokens, compiles, processes the bundles, compresses, zips, publishes
the resolved color manifest, records the version in `framework_versions.yml`, and bumps
`Framework::VERSION` and `package.json` to match. Re-cutting a version that has no tag
yet moves its `released_at` to the day of the re-cut, so the published date is the date
of the artifacts that ship.

### What the cut publishes

Under `public/css/<version>/` and `public/js/<version>/`:

- `plugins.css` and `plugins.js`: the readable builds. The CSS is the compiled
  stylesheet as written; the JS is the source with its build marker stamped to the
  version.
- `plugins.min.css` and `plugins.min.js`: the processed bundles production serves. The
  CSS is minified with private framework variables renamed and duplicate rule bodies
  folded; the JS is minified with the same stamp.
- `themes/<id>-theme.css` and `framework/responsive_test.css`: copied unprocessed, so
  theme and harness source stays readable.
- A `.gz` and a `.br` sibling for every one of those files, both written from Ruby at
  maximum quality.

`public/css/latest/` and `public/js/latest/` are rebuilt as exact mirrors of the version
directory. The zip, the release notes, and the resolved color manifest ship beside them.
[docs/BUILD_AND_SERVING.md](docs/BUILD_AND_SERVING.md) covers what each artifact is for
and how `Framework::Static` serves it.

Then:

1. Write the release notes in `public/framework/releases/<version>.md`. The task
   creates a TODO template on first run.
2. Run `bundle install`. The gemspec is a path gem, so the version bump makes
   `Gemfile.lock` disagree with it, and CI installs with a frozen lockfile: an
   uncommitted lock fails every Ruby job before a test runs.
3. Commit everything the task lists under "Next steps", plus three files it changes
   without listing them:
   - `Gemfile.lock`, from the step above.
   - `app/assets/static/docs_chrome.css` and `app/assets/static/legacy_bundle.css`, the
     packaged snapshots `framework:release:build` refreshes. Each has a spec that fails
     when it is stale.
4. Open a PR and merge on green CI. A release PR moves `public/css/**` and
   `public/js/**`, so the Bundle parity workflow runs and compares the committed
   bundles against a fresh build of the PR's source.

`rake framework:release_preview:enable` serves the committed release assets on every
local docs page, which is how you check the cut the way a consumer receives it. Without
it the docs server shows the live build for the current version. `disable` puts it back.

## Bundle parity

`bin/parity-check` rebuilds the framework the way the release task does
(`framework:release:build`, then the procss and projs minifiers) and byte-compares the
result against the committed bundles in `public/css/latest` and `public/js/latest`. It
builds one processed artifact per language and compares it against both published names, so
a hand-edited `plugins.min.css` fails exactly like a hand-edited `plugins.css`. It covers
the themes and `framework/responsive_test.css` too, and checks that every `.gz`, and every
`.br` the release published, decompresses to its plaintext sibling, and that `latest` still
mirrors the released version's directory. Any mismatch fails with the list of drifted files.

The rebuild also rewrites four tracked files in place (the two generated color partials and
the two packaged snapshots), so the check compares those against their committed bytes and
then puts them back. It reports drift rather than fixing it, and leaves your working tree
exactly as it found it whether it passes or fails.

Run it before you push a release PR. The
[Bundle parity workflow](.github/workflows/bundle-parity.yml) runs it on pull requests and
pushes that touch `public/css/**` or `public/js/**`, and on demand from the Actions tab.

Leave it off the required checks. `main` carries source ahead of the committed bundles
between a fix landing and the next re-cut, so the check only asks its question when the
bundles themselves move. A tag is the exception: the Release workflow runs the same check
before publishing, because a released version's bundles must match the source it froze.

## Tag and publish

After the release PR merges:

```bash
git checkout main && git pull
git tag -a v<version> -m "Framework <version>"
git push origin v<version>
```

The Release workflow ([.github/workflows/release.yml](.github/workflows/release.yml))
does the rest, and publishes last. It verifies the tag against `Framework::VERSION`,
`framework_versions.yml`, `package.json`, the committed release files, and the zip's own
entry list, then runs the full CI suite and `bin/parity-check` on the tagged commit. It
also runs the runtime suite against the processed bundle in a browser, which is the only
check that can see a cascade-order mistake in the merge pass: the static verifiers are
documented blind to it. Only when all of that is green does it create the GitHub Release,
with the notes file as the body and the release zip attached.

Manual fallback if the workflow is ever unavailable:

```bash
gh release create v<version> public/framework/trmnl-framework--<version>.zip \
  --verify-tag --title "Framework <version>" \
  --notes-file public/framework/releases/<version>.md
```

## The rules

- **One release, one tag, one Release.** Every version in `framework_versions.yml`
  from 3.2.0 on has a matching `v<version>` tag and GitHub Release.
- **Published versions are frozen.** A pushed tag makes a version permanent: never
  re-cut it, never move or delete its tag. A fix ships as the next patch version.
  The release tasks refuse to re-cut a tagged version, and they check the tag before
  the build runs, so a refused re-cut leaves the working tree untouched. The tag
  ruleset blocks tag rewrites on GitHub.
- **`release:current` is for unpublished versions.** It re-cuts the in-progress
  version for local iteration. Once that version's tag exists it refuses to run,
  with one exception:
- **Rebuilding a published version happens from its tag.** `git checkout v<version>`,
  `bin/setup`, `rake framework:release:current` reproduces the published artifacts
  byte-for-byte on any machine in any timezone (pinned Ruby, Node, and Sass, locked
  dependencies, and gzip, brotli and zip written from Ruby with pinned libraries rather
  than from the machine's own tools, with every zip entry stamped at midnight UTC of the
  recorded `released_at`). The npm lockfile is part of that pin: from 3.2.0 on
  the served bundles are cssnano and terser output, so the processing toolchain decides
  their bytes.
  The freeze guard allows this because HEAD is the tagged commit itself, and the date in
  `framework_versions.yml` stays put for the same reason.

## Getting an old version back

- **Use one:** `public/css/<version>/plugins.css` stays served forever, and the zip
  hangs off the version's GitHub Release.
- **Read or fork its source:** `git checkout v<version>`, or download the tag's
  source archive from the Releases page.
- **Fix one after `main` has moved to the next major:** branch from the line's last
  tag (for example `git branch 3.x v3.4.2`), backport, and release from that branch.
  Whether an old line gets fixes is decided per major.

## One-time GitHub setup

Enforcement that lives in repository settings, done once before external
contributions open:

1. **Protect release tags.** Settings → Rules → Rulesets → New tag ruleset, or
   import [.github/rulesets/release-tags.json](.github/rulesets/release-tags.json):
   target tags matching `v*`, enforcement Active, restrict creations, updates, and
   deletions, with a bypass for repository admins (whoever cuts releases).
2. **Protect `main`.** Require a pull request with passing CI before merging.
3. **Immutable releases.** If available on the plan (repository Settings), enable it
   so a published Release's tag and assets cannot be swapped after the fact.
