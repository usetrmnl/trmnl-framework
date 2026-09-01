# Map tone: the area-fill ramp, re-derived

Two complaints from the product owner:

1. Water is too light and too close to land in tone, worst on the grayscale
   rails. A Cinque Terre render was indistinguishable land from sea. A Sydney
   Harbour render only worked because of the road texture on the land.
2. Alpine and canyon renders look flat: uniform gray dither, or near-empty
   white.

This document is the whole area-fill ramp re-derived as one design, plus the
patch that implements it, targeted at 3.3.1.

A second round of feedback on that pass moved two more things. The sea it drew
read as too heavy, so water sits one step lighter, on fifty ink points; and
plotted routes and markers did not stand out on a busy map, so their casing and
their default sizes grew (see Markers and routes).

## Read this first: what this does not fix

**It gives landcover differentiation. It does not give relief.**

The tile schema carries no elevation. Probing the live source at eight of the
complained-about coordinates returns exactly the Shortbread 1.0 layer set and
nothing else: no hillshade layer, no contour layer, no DEM, no elevation
attribute on any feature. z15 is a 404 on both sources, so there is no finer
detail to reach for either. No release of this framework can draw a mountain as
a mountain until a second tile source exists.

So, concretely, for the Hallstatt-Dachstein render after this change:

- **What it will look like.** Four separated massings instead of two: the lake
  as a flat mid field, woodland as a distinctly darker gray than the meadow and
  scrub around it, bare rock and scree as their own light tone rather than as
  beach sand, and the unmapped high ground still white. It will read as a
  landcover map of an alpine valley, the way a national park paper map does.
- **What it will not look like.** There will be no shaded slopes, no ridgelines,
  no contour rings, no sense of height. The Dachstein massif will still be a
  flat polygon. A viewer will not be able to tell a plateau from a cliff.

Grand Canyon is the sharper case. Its canyon walls carry almost no landcover
polygons at all, so the canyon stays largely white. Splitting rock out of the
sand group gives the rim and the scree fields a tone, which is an improvement,
but the gorge itself is an absence of data and this change cannot fill it.

Real relief is a separate, larger project, priced at the end of this document.

## The separation matrix

Every area fill is a `bg` slot resolved through the screen's paint rail, so its
printed value is a property of the token. Values come from
`lib/framework/bayer_tiles.rb`, from counting the generated tile art in
`app/assets/stylesheets/framework/config/_tokens_colors_generated.scss` pixel by
pixel, and from `$palette-shades-extended` for the 4-bit solids. They agree.

Core's second quantization (`-monochrome` on 1-bit, `-posterize 4 -dither None`
on 2-bit, `-posterize 16` on 4-bit) already lands on these levels, so the
framework's tile value is the device value.

### The chain that matters: land, rock, open green, woodland, water

Separation between neighbours, as 1-bit ink points and as mean luma out of 255
per rail. Larger is better.

| pair | 3.3.0 1-bit | 3.3.1 1-bit | 3.3.0 2-bit | 3.3.1 2-bit | 3.3.0 4-bit | 3.3.1 4-bit |
| --- | --- | --- | --- | --- | --- | --- |
| land / rock | 6.25 pts (15.9) | **12.5 (31.9)** | 21.2 | **31.9** | 17 | **34** |
| rock / open green | 12.5 (31.9) | **12.5 (31.9)** | 21.2 | 21.2 | 34 | 34 |
| open green / woodland | **0 (0)** | **12.5 (31.9)** | **0** | **53.1** | **0** | **34** |
| woodland / water | 6.25 (15.9) | **12.5 (31.9)** | 10.6 | 10.6 | 17 | 17 |
| land / water | 25 (63.8) | **50 (127.5)** | 53.1 | **116.9** | 68 | **119** |
| open green / water | 6.25 (15.9) | **25 (63.8)** | 10.6 | **63.8** | 17 | **51** |

The chain is even: every gap on the rail that sets the spacing is exactly one
step of twelve and a half points, with none spent and none to spare.

In 3.3.0 woodland and open green were the same slot, hence the zeros.

### The ramp

| slot | token | 1-bit ink | 1-bit luma | 2-bit | 4-bit |
| --- | --- | --- | --- | --- | --- |
| `map-land` | canvas | 0% | 255 | 255 | 255 |
| `map-area` | gray-75 (canvas on 1-bit) | 0 / 6.25% | 255 / 239.1 | 233.8 | 238 |
| `map-sand` | gray-75 | 6.25% | 239.1 | 233.8 | 238 |
| `map-farmland` | gray-70 | 12.5% | 223.1 | 223.1 | 221 |
| `map-site` | gray-70 | 12.5% | 223.1 | 223.1 | 221 |
| `map-rock` | gray-70 | 12.5% | 223.1 | 223.1 | 221 |
| `map-building` | gray-65 | 18.75% | 207.2 | 212.5 | 204 |
| `map-green` | gray-60 | 25% | 191.2 | 201.9 | 187 |
| `map-forest` | gray-50 | 37.5% | 159.4 | 148.8 | 153 |
| `map-water` | gray-45 (checker on 1-bit) | 50% | 127.5 | 138.1 | 136 |
| `map-path` | gray-55 (dashed) | n/a | n/a | n/a | 170 |
| `map-road-minor` | gray-45 | 43.75% | 143.4 | 138.1 | 136 |
| `map-road` | gray-35 | 62.5% | 95.6 | 106.2 | 102 |
| `map-water-line` | gray-30 | 68.75% | 79.7 | 85.0 (solid) | 85 |

Moved: `map-water` gray-60 to gray-45 (the checkerboard on the 1-bit rail),
`map-green` gray-65 to gray-60,
`map-water-line` gray-40 to gray-30, `map-road-minor` gray-50 to gray-45,
`map-path` gray-45 to gray-55. Added: `map-forest` gray-50, `map-rock` gray-70.
Everything else holds still.

### Why this ramp and not another

**The 1-bit rail sets the spacing, not the 2-bit rail.** Its tones are one 8x8
Bayer tile at nested densities: gray-65's twelve ink cells are a strict subset
of gray-60's sixteen, so two fills one step apart differ by four cells in
sixty-four and read as a single field. Twelve and a half ink points is the
smallest step that separates. Everything else follows from that.

**Water lands on fifty ink points, not past them.** The chain land, rock, open
green, woodland, water needs four gaps, which is fifty points exactly, so water
sits there and nowhere lighter. An earlier pass took gray-40 instead, the first
token at or past fifty, and on a panel that read as too heavy a sea. Fifty is
the value the chain asks for, and the extra 6.25 points bought nothing.

**Fifty is the checkerboard on the 1-bit rail and gray-45 on the others.** The
solid rails print gray-45 at 136 and 138.1, so the slot names it. On the 1-bit
rail gray-45 is 43.75%, one step off the woodland, so that rail re-points the
slot at the checkerboard: a Bayer threshold at half the matrix, which the rail
already publishes for the screen backdrop and which is the one tone on it that
does not clump. A checkerboard is its own complement, so the dark ground and
the inverse subtree take the same statement rather than a mirrored one.

**Woodland does not take gray-55, even though gray-55 is the one solid mid level
on 2-bit and would be the prettiest woodland there.** gray-55 is 31.25% on
1-bit, one step off the open green, which is the exact collision this change
exists to remove. The 2-bit rail loses its nicest option so the 1-bit rail keeps
a real gap. gray-55 goes to `map-path` instead, where it costs nothing: a path
is always dashed, and a dashed line takes a flat ink rather than the tile, so
its density never renders on the dither rails.

**Fills that never meet share a step.** Rock and sand, farmland and a school
site. Alpine rock does not appear beside a beach, and a car park does not appear
beside a wheat field, so they can hold the same tone without ever colliding.

**Every remaining tight pair is a line against a fill, not a fill against a
fill.** Lines carry a contrast casing (`mapShapeSpec`, `casing: true`, filled
from `semantic('stroke-contrast')`), which is the framework's own mechanism for
keeping a line legible over any ground. That is where the collisions were put
deliberately.

### Kind regrouping

`MAP_FOREST_KINDS` takes `forest` and `wood` out of `MAP_GREEN_KINDS`, which
kept twenty-two kinds on one tone. `MAP_ROCK_KINDS` takes `bare_rock` and
`scree` out of `MAP_SAND_KINDS`. `shingle` stays with sand and beach, because a
shingle beach is a shore surface and not a mountain face.

Woodland draws whenever the preset asked for green, and rock whenever it asked
for sand. Each is a refinement of a cover the preset already wanted, so the
preset table does not grow a flag.

The data is there. Hallstatt z13 `land` carries forest, grass, residential,
bare_rock, meadow and brownfield; Lake District z13 carries forest, scree, bog,
shingle, quarry and farmyard; Yosemite z14 carries forest, bare_rock, scrub and
grass. The framework was throwing that away.

## Themes

All three shipped themes move, on both their screen block and their inverse
block. The alpine chain holds at 12.5 points or better in every one.

| theme block | land / rock | rock / green | green / woodland | woodland / water |
| --- | --- | --- | --- | --- |
| base | 12.5 | 12.5 | 12.5 | 12.5 |
| dark | 12.5 | 12.5 | 12.5 | 12.5 |
| black-and-yellow, yellow canvas | 12.5 | 25 | 25 | 12.5 |
| black-and-yellow, black ground | 12.5 | 25 | 18.75 | 12.5 |
| white-and-red, red canvas | 43.75 | 12.5 | 18.75 | 25 |
| white-and-red, white ground | 12.5 | 12.5 | 12.5 | 18.75 |

Theme values are read through `$color-to-gray-fallback`, which is what a
grayscale panel actually prints under a hued theme, and through the 85-sum
mirror for the dark axis.

**Dark is now a strict mirror.** Every dark map slot is `85 - base`, so its
separation matrix equals the base's by construction. That required moving
`map-building` from gray-45 to gray-20, the mirror value, which makes dark-theme
buildings dimmer than they are today and removes the file's one deviation from
the mirror its own comment claims. Water mirrors gray-45 onto gray-40 and takes
the checkerboard on the 1-bit rail, where the mirror of fifty points is fifty
points. **Wants a human eye.**

**The two hued themes keep the sea they have**, because neither ramp has a step
to give. On the yellow canvas water is yellow-15, gray-25 on a grayscale panel,
and the next lighter yellow step prints as gray-35, which is the woodland
exactly; on the black ground yellow-35 and yellow-40 print as the same gray, so
a step there is not a step. On the red canvas water is the fill furthest from a
red land that itself prints as gray-40, and one step lighter leaves 6.25 points
between the sea and the shore. On white-and-red's white ground the step lands on
gray-45, 6.25 off its woodland, and the rail's tone at fifty is a gray
checkerboard that would drop the theme's hue on a color panel. The base ramp is
the one with room.

**The yellow ramp is the compressed one.** `$color-to-gray-fallback` gives
yellow about eight distinct grayscale levels for fourteen map roles, so
something has to share. Every fill-against-fill pair is clean, but
`map-water` and `map-road` land on the same tone (yellow-15), so a bridge over
water in that theme rests entirely on the road casing. **Wants a human eye**,
and it is the weakest point in the theme set.

**White-and-red's screen block inverts polarity.** Its canvas is the base red
tint, so the light covers sit above it and water sits below it, at red-30. That
is a deliberate departure from the "areas are bright tints" comment the file
carries, because water has to be the fill furthest from land and on that canvas
the bright side runs out first. **Wants a human eye.**

`_theme-boilerplate.scss` gains `map-forest` and `map-rock` beside the map slots
it already names, so a new external theme covers them from the start.

## The `map-green` narrowing: is a patch the right release?

**Recommendation: yes, 3.3.1 is fine. Ship it.** Three findings behind that.

**Map slots are a public authoring surface, but slot coverage was never a
promise.** `theme_authoring.html.erb` tells authors to "recolor a single part
with a component slot" and points at the theme slots page for the list. The
3.3.0 release notes enumerate the sixteen map slots by name. So the slot *set*
is published. What each slot *covers* appears only as descriptive prose on the
Painting Maps page. The slot contract spec is framed as an internal invariant,
not a guarantee: its own header calls it "the compiled cascade", and it asserts
which token each slot points at, which is framework-internal by definition.

**Graceful degradation is not achievable, and that is a determination rather
than a hedge.** For `map-forest` to inherit an author's `map-green` override, its
declared value would have to reference `--framework-slot-map-green-bg-color`.
CSS custom properties cannot distinguish "the framework set this" from "a theme
set this" on one property, so such a reference makes woodland equal to open
green always, framework default included, which is the feature deleted. The
`var()` fallback fires on unset, not on default. There is no third option short
of inventing a new authoring convention, which is worse than the problem.

**The blast radius is smaller than it looks, because it already exists.** Slot
defaults are emitted as `var(--bg-<token>-color)`, the raw rail, while a theme's
`utility-remap-grayscale` writes `--theme-bg-*`. Slot defaults therefore bypass
the theme remap entirely, which is exactly why the contract spec forces every
shipped theme to restate every themed slot. External themes have no such guard,
and `_theme-boilerplate.scss` names only four map slots. So any theme built from
the shipped boilerplate is already leaving about a dozen map slots on framework
grayscale defaults. Woodland joining that set is a difference of degree.

**On versioning practice**, this repo has already shipped additive public CSS
surface in patch releases: comparing the committed bundles, 3.1.4 to 3.1.5 added
four custom-property names and sixteen class selectors, and 3.1.6 to 3.1.7 added
one selector. Two new slots is smaller than that. There is no written versioning
policy in `RELEASE.md`, `CONTRIBUTING.md` or `AGENTS.md` to contradict it.

The one thing the release notes must say plainly: **if your theme overrides
`map-green`, add `map-forest`; if it overrides `map-sand`, add `map-rock`.**

## Markers and routes

The second complaint: `TRMNLMaps.dot()` and `TRMNLMaps.route()` do not stand out
on a busy map. A map label survives any ground because it carries a contrast
outline; a route and a dot are polygons rather than glyphs, so theirs is the
casing `mapShapeSpec` already builds from `semantic('stroke-contrast')`. The fix
is to give that casing room, not to add a second mechanism.

- The casing was one CSS pixel a side for every shape in the style. A shape spec
  now carries a `casingWidth`, and `route()` and `dot()` pass two, so a style
  line keeps the hairline it had while author content gets a ring that survives
  a dithered ground. A label takes `text-stroke--large`, a three pixel halo on a
  six pixel stroke, which is the proportion two on four keeps.
- A route's default width goes from 3 to 4 and a dot's default radius from 4 to
  5, both still through `px()`, so a scaled screen scales them.
- Width 4 puts a plotted route a step above the widest road the style draws
  (`motorway` at 3), which is where an author's own line belongs.

## Verification

Source-only. Nothing under `public/` changes, so bundle parity is untouched.

- `bundle exec rspec` (the whole suite): **1128 examples, 0 failures.** That
  includes `spec/assets/stylesheets/framework_map_slot_contract_spec.rb`, the
  compiled-cascade contract, which pins the token each slot resolves to on the
  screen, the inverse subtree, the 1-bit rail and every color rail, and which
  fails when any shipped theme leaves a themed slot unrestated. Both new slots
  were added to its `AREA_SLOTS` list, so the theme check covers them, and it
  now pins the 1-bit rail's water to the checkerboard as well.
- `npx playwright test --config test/runtime/playwright.config.js`: **104
  passed.** `test/runtime/paint/maps.spec.js` resolves the slots through the
  live cascade in a browser, shapes them for MapLibre, and now asserts the
  `land-forest` and `land-rock` layers exist, that 1-bit water resolves to the
  same tile the screen backdrop takes, and that 4-bit water prints `#888888`.
- `PROCESSED_BUNDLE=1 npx playwright test --config test/runtime/playwright.config.js`:
  **104 passed**, after `bin/rails framework:processed_bundle`. This is the suite
  that matters for a tile change. The procss minifier rewrites the tile SVGs, and
  the 3.3.0 `imageInk` bug was invisible everywhere else: the live build kept the
  `fill` attribute the processed bundle strips, so every other suite was green
  while devices rendered inkless lines. Run the bundle task first or the
  freshness guard fails before a browser opens.
- `npm run test:visual`: **46 passed, no baseline updates needed.** No visual
  fixture consumes a map slot, so adding two slots moves nothing. That is also
  the gap this change is exposed to, see the risks.
- `npm run test:scripts` (23 passed) includes the `TRMNLMaps` guard that forbids
  probes, computed style and color literals in the map layer. `npm run
  test:stylesheets` (46) and `npm run test:rulediff` (22) pass. `rubocop` clean.

## Risks

**No map is screenshot-tested anywhere.** Every map test in this repo runs
against `installFakeMap`, a stub that records calls. No test loads MapLibre or
rasterizes a tile, and no visual baseline contains a map. Core has no pixel test
either. The evidence for this change is numeric and structural. Get a device
render of Hallstatt, Cinque Terre and Sydney Harbour before tagging.

**A minor road over water is the new tight pair.** Water and `map-road-minor`
are 6.25 ink points apart on 1-bit and share gray-45 outright on 2-bit and
4-bit. This is the old water-against-forest collision, moved deliberately onto a
line: a minor road carries a contrast casing, and a road that crosses water is a
bridge, which paints a `map-building` deck at 18.75% under the crossing first.
Pier and dam lines take the same slot with no casing and sit straight on the
water, so a harbour with piers is the render that proves or disproves it.
Raising the sea to fifty points settles the two pairs the gray-40 pass left
tight: a major road over water goes from 6.25 / 10.6 / 17 to 12.5 / 31.9 / 34,
and the admin boundary, which shared gray-40 with water exactly, comes up to
6.25 / 21.2 / 17. In the black-and-yellow theme water and `map-road` are still
at zero and rest on the casing alone.

**Rivers against lakes hold.** Water against `map-water-line` goes from
31.25 / 79.7 / 85.0 / 68 to 18.75 / 47.8 / 53.1 / 51. On 2-bit the river is a
flat solid 85 against a dithered field rather than two dithers of one pair,
which reads better than the ratio suggests. This is the hazard the 2026-08-27
fix was written for, so it wants a river-through-a-lake render.

**A minor road through woodland** is 6.25 points, casing-mitigated. It was
placed there on purpose: `map-road-minor` moved off gray-50 precisely so it
would not sit at exactly zero against the new woodland fill.

**Buildings against parks** improve from 0 to 6.25 points, because open green
and `map-building` no longer share gray-65. Still tight, still the closest
fill-against-fill pair in the ramp.

**External themes lose woodland and rock coverage.** Covered above. An external
theme that restates `map-green` keeps its color for parks, grass, meadow, scrub
and wetland, and woodland falls to the framework grayscale default, which on a
hued canvas will read as a gray patch. The boilerplate is updated; the release
note has to say it.

**Water is the flattest tone on the 1-bit rail, and the closest to woodland.**
The checkerboard does not clump the way the curated dithers do, so a large sea
reads as one field rather than as stipple, which is what a sea should do. The
cost is that woodland is now one step away rather than one and a half, so a
wooded coast is the case to judge on a real panel. On 2-bit and 4-bit the pair
is 10.6 and 17, the same tightness `map-building` against open green already
carries.

**4-bit and full color.** 4-bit water moves from `#BBBBBB` to `#888888`, three
output levels darker. On the full-color rail water moves from blue-70 to blue-55
and woodland arrives as green-55 against open green at green-70. On the limited
palettes both resolve to an ink tile over white at the named density (on 4bwry,
water becomes a red tile and woodland a yellow one, since neither blue nor green
is printable there), so density separates them where hue cannot. Core's oversize
retry re-quantizes with `-ordered-dither o8x8` and drops 4-bit to four levels,
flattening the whole ramp; that path is unaffected by this change but explains a
posterized-looking large map.

## What real relief would cost

**A raster hillshade. Not recommended.** MapLibre supports `raster-dem` sources
and `hillshade` layers natively, and a free global terrarium tileset exists (AWS
Open Data `elevation-tiles-prod`, z0 to z15). But a hillshade layer is
continuous tone. The framework cannot ordered-dither it, so it would reach the
device as smooth gray and be flattened by `-posterize 4 -dither None` into hard
bands on 2-bit, or error-diffused into noise by `-monochrome` on 1-bit. It also
breaks the core mandate that CSS is the single source of paint. Cheap to build,
wrong for these panels.

**Contour lines. The real option.** A contour is a line, and the shape machinery
already widens a line into a pixel-snapped polygon filled from a slot tile, so
contours would paint exactly like every other framework mark and land crisp on
the grid. The cost is a second vector tileset, not framework code:

- Build contours from a global DEM (Copernicus GLO-30 is open and current) with
  planetiler-contour or tilemaker, at z9 to z14 with an interval that steps with
  zoom. Days of pipeline work, then hours to days of compute per planet build.
- Store and serve it beside the Shortbread planet: a second PMTiles archive on
  R2 or S3 behind the same server, with the same CDN and rate limits. Order of
  tens of GB and a rebuild cadence measured in months, since terrain does not
  change.
- Framework side is small once the source exists: one source entry, one kind
  list, one shape spec, one `map-contour` slot, and a preset flag so only the
  presets that want relief pay the tiles.

That is comparable in effort to standing up the Shortbread source itself, which
is still an open item on the go-live checklist, and it should be scheduled on
its own merits rather than folded into a paint release.

**Or nothing.** Ship the landcover ramp, describe a TRMNL map as a landcover map
rather than a topographic one, and revisit contours when the tile-source work is
already staffed.
