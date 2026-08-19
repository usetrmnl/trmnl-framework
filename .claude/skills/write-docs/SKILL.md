---
name: write-docs
description: House style for TRMNL framework documentation copy. Use whenever writing or editing docs pages (app/views/framework/*.html.erb), intro paragraphs in framework_helper.rb, code example captions, or notice boxes.
---

# TRMNL docs writing style

The docs read like a calm engineer explaining a tool: plain, concrete, and short. Every section earns its length. The reference corpus is the intro paragraphs in `app/helpers/framework_helper.rb` and mature pages like `background.html.erb`, `divider.html.erb`, and `columns.html.erb`.

## Match the neighbors

Before you write, read the entries already in the file and copy their voice, structure, and phrasing. Match the doc you are editing, not a generic or personal style. A release note reads like the other release notes; a utility page reads like the other utility pages.

Keep a feature or rebuild entry to one tight paragraph:

- Lead with what it is and what changed, then the benefit.
- State the benefit as a concrete contrast that names the old behavior and the win together: "adapts to the device and every mode it supports, bit depth, dark mode, and themes, instead of carrying its own fixed colors", or "generated gradients instead of image tiles".
- Give outcomes, not mechanism: "fetches no images and stays sharp at any size", not "resolves through the semantic and theme layers".
- Never describe old behavior in terms of a feature that shipped later. A 3.1 utility could not "ignore themes" if themes arrived in 3.2.

Gold standard, a 3.2 release note that does all of the above in one paragraph:

> Border, Outline, Text Stroke, and Image Stroke were rebuilt from the ground up, the same way as the color patterns. Each one now adapts to the device and every mode it supports, bit depth, dark mode, and themes, instead of carrying its own fixed colors. Borders also paint from generated gradients instead of image tiles, so a screen full of them fetches no images and stays sharp at any size.

## Voice

- Lead with what the thing is or what the reader can do. First sentence, no wind-up.
  - Good: "The Divider element provides a simple, standalone shorthand for horizontal and vertical separators."
  - Good: "Use the `bg--{shade}` utility classes to apply these background patterns to any element."
- One idea per sentence. Declarative, present tense, second person for instructions ("Use", "Add", "Include").
- State device behavior concretely: "dither patterns on 1-bit, solids on 4-bit+", never "adapts intelligently across devices".
- No marketing filler (powerful, seamless, elegant, simply, just). No hedging.
- Explain the why in one clause when it changes what the reader does, otherwise skip it.

## Plain words first

The 3.2 readability complaint, and the pattern to rewrite on sight: sentences built from framework vocabulary (semantic channels, slots, token references, the live cascade, canonical Fills) before the reader has plain-language footing.

- Open with a sentence a first-time reader can parse: what the thing is or does, in everyday words.
- Introduce a framework term only where the reader needs it to act, and ground it in the same sentence that introduces it.
- Say what the reader gets before how the framework does it. Internal rationale (why the architecture is shaped this way) stays out of intros entirely.
- Break any sentence that chains three or more clauses, and turn a parenthetical list of three or more items into a bulleted list or its own sentence.
- Keep the concrete device triplets ("dither patterns on 1-bit, solids on full color"); concreteness is not the problem, stacked abstraction is.
- Say the sentence aloud to a colleague who has never read the source. Any term that needs the codebase to parse (the chart ramp, resolvers, rails, the cascade) gets replaced by what it means for the reader.

Before: "Themes are standalone stylesheets that re-point semantic channels, component slots, and utility tokens at different palette tokens."

After: "A theme is a stylesheet you load next to plugins.css to recolor a screen. It swaps the colors the framework classes paint with, so your markup stays exactly as written."

A rewrite can still fail the bar. This one traded one set of insider words for a smaller set and was flagged by a reader anyway:

Still too complex: "The chart resolvers pick evenly spaced series colors from the framework's chart ramp, adjusted to the current device, mode, and theme."

Plain: "These functions pick the colors for a chart. Ask for series 2 of 5 and you get its paint, correct for the current device, mode, and theme."

## Punctuation

- **Never use em-dashes**: no `—`, no `&mdash;`, no ` -- `. Rewrite with a period, comma, colon, or parentheses. This applies to all copy: docs, commit messages, code comments, notices.
- Straight quotes and apostrophes in source are fine; the pages do not require typographic entities.

## Shape

- A paragraph is 1 to 3 short sentences. If the topic needs more, split it: subsection (`framework_heading(4, ...)`), bulleted list, or table.
- Section rhythm: heading, then 1 or 2 sentences of description, then the live example, then the code snippet. Prose supports the example; it never substitutes for it.
- An API surface is a list, never a paragraph. One bullet per method: the signature in `<code>`, then one sentence saying what it returns or does. Parameter detail, return shapes, and edge cases go in the code example or a dedicated subsection, not in the bullet.
- A page section with more than ~6 bullets or ~3 paragraphs needs subsections. Group by what the reader is trying to do (resolve a color, draw a rail, style text), not by internal architecture.
- Notices (`message_warning_classes` / `message_sage_classes`) are for real gotchas only, one or two sentences.

## Anti-patterns (rewrite on sight)

- The API-dump paragraph: a 15-line paragraph chaining every method with semicolons and inline asides. Break it into a lead sentence plus a bullet list.
- Architecture before usage: three paragraphs of philosophy before the first thing the reader can type. Show usage first; keep rationale to a few sentences after it.
- Nested asides: sentences with two or more parenthetical or dash-set clauses. Split them.

## Demo markup

- Everything inside a `.screen` demo uses framework classes: `title`, `description`, `label`, `value`, `item`, `content`, etc. A bare `<p>` or `<span>` without a framework class renders in the docs page font, not the framework font, and breaks the illusion of a device screen.
- Two exceptions. Children of a `.content` block are supported plain HTML (Rich Text styles its own children), and elements that are the API themselves stay plain: `<table>` rows and cells under `.table`, `<img>`, and inline `<svg>`.
- Demos look like a plausible plugin screen, not a component grab-bag. Pick one small coherent scene (a stat row, a schedule, a status card) that exercises what the section documents.
- Keep the `title_bar` with the TRMNL logo (`image image--adaptive`) and a title naming the demo.

## Where copy lives

- Page intros: `framework_intro_paragraphs` in `app/helpers/framework_helper.rb`, keyed by page name. One to three sentences.
- Section copy: inline in `app/views/framework/<page>.html.erb`, in `<p class="<%= framework_section_description_classes %>">`.
- Cross-reference other pages with `<%= render DocsRef.new(page: :page_name) %>`, identifiers with `<code class="<%= framework_section_code_classes %>">`.
