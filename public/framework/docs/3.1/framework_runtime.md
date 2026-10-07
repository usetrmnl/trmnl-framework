# Framework Runtime

Different devices have different, fixed amounts of screen space. The Framework Runtime fills that space when a plugin layout renders, doing the heavy, repetitive measuring and fitting for you. Expand the "Framework Runtime" panel under any example on this site to see the stats for that render.

### What It Does

It measures the space a layout has and fits the content into it, so nothing needs manual tweaking. Each pass starts by reading the screen's size, orientation, bit depth, and scale, then runs the steps below.

### Runtime Steps

When the runtime runs, it takes these steps in order.

#### Images

Waits for every image to settle, then recolors the adaptive ones for the current mode.

- Holds the pass until images have loaded, so later steps measure real heights
- Repaints `image--adaptive` sources for the current device and theme

 Go to [Image](/framework/docs/3.1/image)

#### Index Widths

Ensures item index badges render at even widths to avoid artifacts.

- Runs once per runtime pass, for indices outside `.columns`
- Runs again inside each `.columns` container after its layout commits
- Skipped on 2-bit and higher, where any width it pinned is cleared

 Go to [Item](/framework/docs/3.1/item)

#### Value Formatting

Formats numbers to fit available space and abbreviates as needed (k, M, B).

- Accepts `data-value-format="true"` or `data-value-type="number"`
- Respects `data-value-locale`
- Works with `data-fit-value` for auto-sizing

 Go to [Format Value](/framework/docs/3.1/format_value)

#### Fit Value

Adjusts font size, line-height, and weight to fit numbers within their containers.

- Minimum font size safeguard (default 8px)
- Accepts `data-fit-value` or `data-value-fit`

 Go to [Fit Value](/framework/docs/3.1/fit_value)

#### Grid Gaps

Tweaks CSS gaps so grid column widths resolve to integer pixels.

- Disable with `data-adjust-grid-gaps="false"`
- Falls back to measuring child positions when `gap` is not explicitly set

 Go to [Grid](/framework/docs/3.1/grid)

#### Column Gaps

Normalizes gaps between `.column` elements so column widths are integers.

- Disable with `data-adjust-column-gaps="false"`
- Runs as a pre-pass for non-overflow columns and a final pass after Overflow

 Go to [Columns](/framework/docs/3.1/columns)

#### Overflow

Tries 1 to N columns off screen, keeps the layout that fits best, then re-clamps text to each real column's width.

- Duplicates group headers across columns when needed
- Optional trailing "and N more" label for hidden items (enable with `data-overflow-counter="true"`)
- Enforces final fit by hiding trailing items if necessary

 Go to [Overflow](/framework/docs/3.1/overflow)

#### Clamp

Clamps text to N lines.

- Word-based ellipsis
- Preserves original text
- Re-clamps when widths change
- Supports responsive data attributes (size/orientation)
- Maps legacy class utilities to `data-clamp`
- Applies outside and inside columns (per-column re-clamp handled by Overflow)

 Go to [Clamp](/framework/docs/3.1/clamp)

#### Table Overflow

Trims table rows that do not fit the space the table has.

- Opt in with `data-table-limit="true"` on the table
- Runs after Clamp, so it measures rows at their final line count

 Go to [Table Overflow](/framework/docs/3.1/table_overflow)

#### Content Limiter

Caps content at an explicit height budget, or at the space it measures as available, and flags small content.

- Set the budget with `data-content-max-height`, otherwise the limiter measures the view's layout
- Adds `content--small`, then sets `data-clamp` and `data-clamp-max-height-px` on the block it has to trim

 Go to [Content Limiter](/framework/docs/3.1/content_limiter)

#### Pixel-Perfect Fonts

Wraps lines in spans and pins them to even or odd pixel widths so they render crisp; scheduled in idle time.

- Skipped on higher bit-depth modes
- Respects centered alignment

 Go to [Pixel Perfect](/framework/docs/3.1/pixel_perfect)

### Driving the Runtime from JavaScript

The runtime starts itself. It runs one pass after the page load event, then runs again whenever a `screen--*` class changes on a `.screen` element. Content injected after that needs an explicit re-run.

#### Functions

- `terminalize()`: runs the full pipeline and returns a Promise that resolves once the screen has settled, including the deferred pixel-perfect pass. Call it after you inject or replace content. 
- `executeTerminalize()`: queues a run two animation frames out instead of starting one immediately. Repeated calls before it fires collapse into a single pass. 
- `markFrameworkReady()`: sets `window.frameworkReady` and dispatches `trmnl:framework:ready` on `window`. A host page calls it once its own setup is done. 

#### Ready Signals

- `window.TRMNL_PLUGINS_READY`: `false` while a pass runs and `true` once it settles. A screenshot service waits for `true` before it captures. 
- `window.frameworkReady`: `false` until `markFrameworkReady()` runs. 
- `window. __TRMNL_BUILD__ `: the build stamp of the loaded `plugins.js`. A released bundle reports its own version (`plugins.js v3.2.0`) and a working checkout reports `plugins.js source`. Read it when an edit does not show up and you suspect a pinned or cached file. 

#### The Stats Event

Every pass dispatches `trmnl:terminalize:stats` on `window`. Its `detail` carries three fields.

- `steps`: every step the pass ran, each with a `name`, a `durationMs`, and its own counters. 
- `engines` and `engineCount`: the subset of steps that changed something. 
- `errors`: present only when an engine threw, as `{ engine, message }` entries. The pass runs the remaining engines and readiness still flips to `true`. 

```
// Re-run after injecting content into a screen.
terminalize().then(function () {
  console.log("screen settled");
});

// Inspect what each pass did.
window.addEventListener("trmnl:terminalize:stats", function (event) {
  console.log(event.detail.engineCount, "engines changed something");
});
```

#### Debug Logging

Set `window. __TRMNL_DEBUG__ = true` before a pass to log what each engine decided. Renders are quiet by default. Engine failures always reach the console, debug flag or not.

`plugins.js` also puts `TRMNLPaint`, `TRMNLCharts` and `TRMNLMaps` on `window`. Those are documented on Paint API .

A pass ends by waiting for every map `TRMNLMaps` has attached to go idle, bounded by `TRMNLMaps.settle()` (6000 ms by default), so `window.TRMNL_PLUGINS_READY` flips after the tiles, the widened lines and the labels have drawn. A host that rescales the screen after the pass, the way a screenshot service sets its capture pixel ratio last, calls `TRMNLMaps.refresh()` and awaits it before it captures.

### Why This Exists

A plugin has to fit its data into a fixed space that changes with the device, orientation, and density. That sounds like responsive web design, but the runtime's tools (column planning, per-column clamping, pixel alignment, value fitting) are built for TRMNL screens specifically.

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| `--content-scale` | 1 | - | - | - |
| `--device-ui-scale` | 1 | - | - | - |
| `--full-h` | calc(var(--screen-h) - var(--gap) \* 2) | - | - | - |
| `--full-w` | calc(var(--screen-w) - var(--gap) \* 2) | - | - | - |
| `--gap-scale` | 1 | - | - | - |
| `--half_horizontal-h` | calc((var(--screen-h) - var(--gap) \* 2) / 2 - var(--gap) / 2) | - | - | - |
| `--half_horizontal-w` | calc((var(--screen-w) - var(--gap) \* 2)) | - | - | - |
| `--half_vertical-h` | calc((var(--screen-h) - var(--gap) \* 2)) | - | - | - |
| `--half_vertical-w` | calc((var(--screen-w) - var(--gap) \* 2) / 2 - var(--gap) / 2) | - | - | - |
| `--modifier-scale` | 1 | - | - | - |
| `--modifier-text-scale` | 1 | - | - | - |
| `--quadrant-h` | calc((var(--screen-h) - var(--gap) \* 2) / 2 - var(--gap) / 2) | - | - | - |
| `--quadrant-w` | calc((var(--screen-w) - var(--gap) \* 2) / 2 - var(--gap) / 2) | - | - | - |
| `--screen-h` | 480px | - | - | - |
| `--screen-h-original` | 480px | - | - | - |
| `--screen-w` | 800px | - | - | - |
| `--screen-w-original` | 800px | - | - | - |
| `--text-ui-scale` | 1 | - | - | - |
| `--ui-scale` | 1 | - | - | - |

 Previous  [ 

## Pixel Perfect

Ensure text renders with crisp edges by aligning to the pixel grid

 ](/framework/docs/3.1/pixel_perfect)

 Next  [ 

## Structure

The framework's exact div hierarchy and how Screen, View, Layout, Title Bar, Columns, and Mashup work together

 ](/framework/docs/3.1/structure)

