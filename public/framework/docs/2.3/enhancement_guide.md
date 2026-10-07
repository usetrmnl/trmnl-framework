# V2 Enhancement Guide

Framework v2 introduces new engines, utilities, and prefixes that let you build layouts that are both adaptive and responsive. Your existing work will continue to work, but by using these enhancements you can create layouts that adjust to device size, orientation, and bit depth.

### 1. Upgrade Your Engines

One of the most impactful enhancements is updating how you use the framework’s engines. These changes make layouts flexible across devices of varying sizes.

- [Overflow](/framework/docs/2.3/overflow) engine: Remove hard-coded values and let the engine calculate available space automatically. Layouts then adapt cleanly to different screen sizes without manual tuning. 
- [Content Limiter](/framework/docs/2.3/content_limiter) engine: Do the same - drop fixed values and allow the engine to determine available space dynamically. 
- [Table Overflow](/framework/docs/2.3/table_overflow) engine: For tables, use the new engine that applies the same logic and automatically adds an “&x more” row when needed. 

### 2. Apply Responsive Prefixes

All layouts in v1 were effectively fixed to a single device frame. With Framework v2, you can extend them using responsive prefixes in three key ways: display size, bit depth, and orientation.

#### Display size

Use size prefixes to define how layouts adapt to small, medium, or large screens. For example, you might render six items in a single row on a small device, but two rows of three items on a larger display. Prefixes can be applied to grids, flex utilities, spacing, and more.

#### Bit depth

Apply bit-depth prefixes to take advantage of devices with higher grayscale capabilities. For example, you can use a subtle gray shade on 4-bit devices while still defining a simpler fallback for 1- or 2-bit displays.

#### Orientation

Orientation prefixes let you prepare your layouts for devices that may be used in landscape or portrait mode. You can adjust grids, flex directions, or spacing rules so the same plugin works cleanly in both orientations.

### 3. Use the New Utilities and Styling Options

Framework v2 comes with new utilities, elements, and components that expand your design options:

- [Aspect Ratio](/framework/docs/2.3/aspect_ratio) utility: Keep images and elements locked to consistent proportions.
- [Rounded](/framework/docs/2.3/rounded) utility: Apply rounded corners to elements.
- [Divider](/framework/docs/2.3/divider) element: Add separators between sections of content.
- [Progress](/framework/docs/2.3/progress) component: Show task or state progress with a built-in component.
- [Item](/framework/docs/2.3/item) component: Now supports meta-emphasis classes, making it easy to highlight or de-emphasize items.
- [Table](/framework/docs/2.3/table) component: New style variants, including small, large, and index tables.

 Previous  [ 

## V2 Upgrade Guide

Steps to upgrade your plugins to Framework v2

 ](/framework/docs/2.3/upgrade_guide)

 Next  [ 

## V2 Troubleshooting

Resolve issues surfaced by v2's stricter markup requirements

 ](/framework/docs/2.3/troubleshooting_guide)

