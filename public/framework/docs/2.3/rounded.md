# Rounded

Utility classes for corner radius. Predefined sizes, per-corner control, and arbitrary pixel values.

### Size Variants

The rounded system includes predefined base sizes and arbitrary pixel values. These standardized radii help maintain consistent corner rounding across your application's components.

#### Base

The base `rounded` class without size modifiers and the `rounded--base` class both produce the same visual result, providing the standard border radius (10px). Use `rounded--base` when you need to explicitly set the base size in responsive contexts. See the [Responsive Rounded](#responsive-rounded) section for examples.

rounded--none

rounded--xsmall

rounded--small

rounded

rounded--medium

rounded--large

rounded--xlarge

rounded--xxlarge

rounded--full

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Predefined RoundedDesign System

```
<!-- Available rounded sizes from sharp to pill -->
<div class="rounded--none">...</div> <!-- 0px -->
<div class="rounded--xsmall">...</div> <!-- 5px -->
<div class="rounded--small">...</div> <!-- 7px -->
<div class="rounded">...</div> <!-- 10px (default) -->
<div class="rounded--base">...</div> <!-- 10px (explicit base) -->
<div class="rounded--medium">...</div> <!-- 15px -->
<div class="rounded--large">...</div> <!-- 20px -->
<div class="rounded--xlarge">...</div> <!-- 25px -->
<div class="rounded--xxlarge">...</div> <!-- 30px -->
<div class="rounded--full">...</div> <!-- 9999px (pill shape) -->

<!-- Or using the base modifier -->
<div class="rounded--base">...</div>
```

#### Arbitrary

Use `rounded--[Npx]` syntax to specify exact pixel values from **0px to 50px**. This works with all rounded utilities, but does not support responsive variants.

rounded--[0px]

rounded--[10px]

rounded--[30px]

rounded--[20px]

rounded--[40px]

rounded--[50px]

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Arbitrary Pixel RoundedDesign System

```
<!-- Custom rounded values from 0px to 50px (no responsive support) -->
<div class="rounded--[0px]">...</div>
<div class="rounded--[10px]">...</div>
<div class="rounded--[20px]">...</div>
<div class="rounded--[30px]">...</div>
<div class="rounded--[40px]">...</div>
<div class="rounded--[50px]">...</div>

<!-- Works with corner-specific too -->
<div class="rounded-t--[16px]">...</div>
```

Arbitrary rounded values using the `rounded--[Npx]` syntax do not support responsive variants. Use predefined rounded classes if you need responsive behavior.

### Corner-Specific Rounding

Apply border radius to specific corners or sides of an element. This allows for more complex shapes and asymmetric designs while maintaining consistency.

#### Individual Corners

Target specific corners with `rounded-{corner}{-size}` where corner can be tl (top-left), tr (top-right), br (bottom-right), or bl (bottom-left).

rounded-tl--large

rounded-tr--large

rounded-bl--large

rounded-br--large

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Corner-Specific RoundingDesign System

#### Side Rounding

Round entire sides with `rounded-{side}{-size}` where side can be t (top), r (right), b (bottom), or l (left).

rounded-t--large

rounded-r--large

rounded-b--large

rounded-l--large

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Side RoundingDesign System

```
<!-- Individual corners -->
<div class="rounded-tl--large">Top left corner</div>
<div class="rounded-tr--large">Top right corner</div>
<div class="rounded-br--large">Bottom right corner</div>
<div class="rounded-bl--large">Bottom left corner</div>

<!-- Entire sides -->
<div class="rounded-t--large">Top corners</div>
<div class="rounded-r--large">Right corners</div>
<div class="rounded-b--large">Bottom corners</div>
<div class="rounded-l--large">Left corners</div>
```

### Responsive Rounded

Rounded utilities support size-based breakpoints, orientation variants, and their combination. Use prefixes like `md:`, `portrait:`, and `md:portrait:` to target conditions.

#### Base Examples

Apply different border radius values at different breakpoints using the size-based responsive system. The framework follows a mobile-first approach where larger breakpoints inherit smaller ones. The `--base` modifier is particularly useful for resetting to the default size at specific breakpoints.

Responsive

Xlarge in landscape, small in portrait

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Responsive RoundedSize-Based

```
<!-- Orientation example -->
<div class="rounded--xlarge portrait:rounded--small">
  Xlarge in landscape, small in portrait
</div>
```

#### Corner-Specific Examples

Corner-specific rounding utilities support responsive variants just like base rounded utilities. Use prefixes like `md:`, `portrait:`, and `md:portrait:` to apply different corner rounding at different breakpoints.

Responsive

Xlarge in landscape, small in portrait

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Responsive Corner RoundingSize-Based

```
<!-- Orientation example -->
<div class="rounded-tl--xlarge portrait:rounded-tl--small">
  Xlarge in landscape, small in portrait
</div>
```

 Previous  [ 

## Border

Draw horizontal and vertical rules on the same shade scale as backgrounds

 ](/framework/docs/2.3/border)

 Next  [ 

## Outline

Draw a pixel-perfect dotted rounded border on any element

 ](/framework/docs/2.3/outline)

