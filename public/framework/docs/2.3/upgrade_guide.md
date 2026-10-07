# V2 Upgrade Guide

Framework v2 builds on everything you've already created, enriching your work while keeping most of your existing logic functional. The only two areas that require your attention are borders and clamping, and both can be addressed with just a few quick changes.

### Borders

Initially, the border utility was designed to work in a 1-bit space on white backgrounds.

We’ve expanded it to adapt across 1, 2, and 4-bit spaces, covering the full grayscale spectrum and working on both light and dark backgrounds. Borders are now versatile and support a range of devices with different display capabilities.

Search your markup for a class name like `border--h-5` and re-evaluate the intensity using the updated [Border](/framework/docs/2.3/border) scale. You may choose a different level (e.g., `border--h-3`) to match the intended appearance.

### Clamping

Previously, [Title](/framework/docs/2.3/title) , [Label](/framework/docs/2.3/label) , and [Description](/framework/docs/2.3/description) were clamped to a single line by default.

We’ve rebuilt the clamp engine in JavaScript at the DOM level, making it more robust and fully integrated with other modulation utilities like [Overflow](/framework/docs/2.3/overflow) . Clamping is no longer enforced automatically - the content is now displayed in its entirety by default. You decide whether clamping is needed and set sensible limits. The legacy `clamp--N` classes remain supported for compatibility, but the new `data-clamp` attribute is the preferred approach going forward.

Search your markup for parts like `<span class="label">` and add the clamping attribute `<span class="label" data-clamp="2">` (or whichever clamp value fits your layout).

### Troubleshooting

Framework v2 is also more precise than earlier versions, which may expose issues if your markup doesn't follow intended usage. If you run into problems beyond borders or clamping, check the [V2 Troubleshooting](/framework/docs/2.3/troubleshooting_guide) for solutions.

### Next Steps

Once you've updated borders and clamping, your project is ready for Framework v2. From here, head to the [V2 Enhancement Guide](/framework/docs/2.3/enhancement_guide) to explore new utilities, components, and techniques for building even more capable interfaces.

 Previous  [ 

## V2 Overview

What's new in Framework v2: utilities, components, and guides

 ](/framework/docs/2.3/v2_overview)

 Next  [ 

## V2 Enhancement Guide

Device, bit-depth, and orientation-responsive patterns for plugins

 ](/framework/docs/2.3/enhancement_guide)

