# TRMNL Framework: agent guide

Rails app hosting the TRMNL design framework and its documentation site.

- Docs pages: `app/views/framework/*.html.erb` (one page per framework feature)
- Page intro paragraphs: centralized in `framework_intro_paragraphs` in `app/helpers/framework_helper.rb`
- Framework CSS: `app/assets/stylesheets/framework/` (`base/`, `components/`, `utilities/`, `themes/`, `mixins/`)
- Framework JS (paint API, charts, runtime): `app/javascript/`

## Core mandates

- **CSS is the single source of truth for paint.** `TRMNLPaint` reads the live cascade and converts it; it never re-implements token mappings, adds contrast heuristics, or invents fallback values in JS. Any rendering rule must exist in CSS first, then be mirrored 1:1.
- **Reuse existing systems.** Before adding a pattern, tile, gradient, or one-off variable, check whether the dither/tile pattern system, border pipeline, or theme slots already express it. A new bespoke mechanism for one call site is almost always wrong.

## Serving modes

- **Dev in this repo serves the live build**, for the current docs version only
  (`FrameworkController::CURRENT_DOCS_VERSION`), from `server/app/assets/builds/`. No
  marker file. `bin/dev` keeps that directory current.
- **Older tracks (3.1, 3.0, 2.3, 1.2) serve `public/css/<semver>/` in every mode.** A Sass
  edit never shows on them, by design.
- `rake framework:release_preview:enable` forces released assets locally. The
  `framework:development:*` tasks are the consumer-host marker and change nothing here.
- Incomplete builds fall back to released assets, and the dev-only badge in the docs
  chrome names the mode. Full reference: `docs/BUILD_AND_SERVING.md`.

## Writing documentation

Follow the docs style guide in `.claude/skills/write-docs/SKILL.md` whenever you write or edit docs copy. The non-negotiables:

- **Never use em-dashes** (`—`, `&mdash;`, `--`). Rewrite the sentence with a period, comma, colon, or parentheses.
- Paragraphs are 1 to 3 short sentences. One idea per sentence. If you need more, add a subsection or a list.
- Lead with what the reader can do or what the thing is. No abstract preamble.
- API surfaces are bulleted lists (signature in `<code>`, one plain sentence), never prose chains.
- Demo markup inside a `.screen` uses framework classes only (`title`, `description`, `label`, `value`, ...). Bare `<p>`/`<span>` tags render in the page font, not the framework font.
- **Match the neighbors.** Read the entries already in the file and copy their voice and structure. Keep feature and release entries to one tight paragraph: what it is, what changed, then the benefit as a concrete contrast (`generated gradients instead of image tiles`). Give outcomes, not mechanism, and never describe old behavior with a feature that shipped later.
