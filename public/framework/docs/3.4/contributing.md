# Contributing

Everything you need to make your first contribution to the TRMNL Framework: run it locally, find your way around the code, run the test suites, and open a pull request that lands. Start here, then read CONTRIBUTING.md for the fine print.

### Run It Locally

Clone [github.com/usetrmnl/trmnl-framework](https://github.com/usetrmnl/trmnl-framework). You need Ruby (see `.ruby-version`) and Node (see the `engines` field in `package.json`). Then run two commands.

```
bin/setup # gems, npm, token generation, and every CSS build
bin/dev # server on :3001 with live Sass and Tailwind rebuilds
```

Open `http://localhost:3001/framework` to view the docs. `server/app/assets/builds/` is gitignored, so re-run `bin/setup` after a pull if the CSS looks stale.

### Where Things Live

The framework and its docs share one Rails app. These are the paths you will touch most.

- `app/assets/stylesheets/framework/`: the Sass design system (base, components, utilities, themes, mixins).
- `app/javascript/`: the JavaScript runtime (terminalize, TRMNLPaint, TRMNLCharts, TRMNLMaps) and the docs harness.
- `app/views/framework/*.html.erb`: one docs page per framework feature.
- `app/helpers/framework_helper.rb`: page intro paragraphs and docs helpers.
- `db/data/`: the token and release data (colors, fonts, devices, versions).

The full directory map is in `README.md`. For what this repository is and the rule that shapes it, see [Open Source](/framework/docs/3.4/open_source) .

### The Test Suites

Run the layer that matches your change, or run all of them before opening a pull request.

- `npm run test:stylesheets`: public classes, variables, theme contracts, and the CSS paint data.
- `npm run test:scripts`: runtime syntax, the public API names, and the CSS to JavaScript paint boundary.
- `bundle exec rspec`: the Rails docs routes, versioned bundle selection, and generated endpoints.
- `npm run test:runtime`: terminalize, the layout engines, and the paint API in Chromium.
- `npm run test:visual`: rendered CSS against platform-specific PNG baselines.

The last two use Playwright. Install its browser once per machine.

```
npx playwright install chromium
```

The runtime and visual suites run entirely on your machine. Both also run in CI: Linux Chromium against committed Linux baselines for visuals, and the same runtime checks as a local run.

### Writing Documentation

The docs are the framework's test bench, so most changes touch a docs page. The copy follows a house style.

- Lead with what the reader can do or what the thing is.
- Keep paragraphs to one to three short sentences, one idea each.
- Never use em-dashes. Rewrite with a period, comma, colon, or parentheses.
- Inside a `.screen` demo, use framework classes only (`title`, `description`, `label`, `value`).

The full guide is the write-docs skill under `.claude/skills/write-docs/`.

### What Makes a Good PR

- Keep it small and focused. One concern per pull request.
- Change a utility? Update its docs page and its live example in the same change. A utility without a rendered example is incomplete.
- Run the test suites and confirm `bin/build` succeeds before you push.

Releases are maintainer-only. Land your change, and a maintainer cuts the release. See `CONTRIBUTING.md` for the rest.

### Report Issues and Security

Found a bug? Open a GitHub issue with a minimal reproduction. Ideas and feature requests are welcome as issues too.

Security issues are different. Report them through GitHub's private vulnerability reporting, not a public issue. See `SECURITY.md`.

All participation follows the `CODE_OF_CONDUCT.md`.

 Previous  [ 

## Open Source

What this repository is, how it fits together, and the paint mandate that shapes it

 ](/framework/docs/3.4/open_source)

 Next  [ 

## Size

Define exact width and height dimensions for elements

 ](/framework/docs/3.4/size)

