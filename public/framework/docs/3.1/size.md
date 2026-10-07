# Size

Utility classes for width and height. Fixed sizes, arbitrary values, dynamic sizes, and container query units, each also available as a min or max constraint and with responsive variants.

## Setting Width and Height

Control element dimensions using fixed sizes from the design scale, arbitrary pixel values, or dynamic sizes that adapt to their container.

### Fixed Sizes

Use predefined size classes from the design scale. Apply `w--{size}` for width and `h--{size}` for height with these size values:

`w/h--0`

`w/h--0.5`

`w/h--1`

`w/h--1.5`

`w/h--2`

`w/h--2.5`

`w/h--3`

`w/h--3.5`

`w/h--4`

`w/h--5`

`w/h--6`

`w/h--7`

`w/h--8`

`w/h--9`

`w/h--10`

`w/h--11`

`w/h--12`

`w/h--14`

`w/h--16`

`w/h--20`

`w/h--24`

`w/h--28`

`w/h--32`

`w/h--36`

`w/h--40`

`w/h--44`

`w/h--48`

`w/h--52`

`w/h--56`

`w/h--60`

`w/h--64`

`w/h--72`

`w/h--80`

`w/h--96`

`0px`

`2px`

`4px`

`6px`

`8px`

`10px`

`12px`

`14px`

`16px`

`20px`

`24px`

`28px`

`32px`

`36px`

`40px`

`44px`

`48px`

`56px`

`64px`

`80px`

`96px`

`112px`

`128px`

`144px`

`160px`

`176px`

`192px`

`208px`

`224px`

`240px`

`256px`

`288px`

`320px`

`384px`

### Arbitrary Sizes

Need a specific dimension? Use arbitrary size classes for precise pixel values with `w--[Npx]` and `h--[Npx]` syntax, where N can be any value from 0 to 128. Responsive prefixes work here (`md:w--[96px]`), unlike the arbitrary values on [Gap](/framework/docs/3.1/gap) and [Rounded](/framework/docs/3.1/rounded) .

`w/h--[60px]`

`w/h--[90px]`

`w/h--[120px]`

`60px`

`90px`

`120px`

### Dynamic Sizes

Use dynamic sizes to set dimensions relative to the container or content. `w--full` and `h--full` set dimensions to 100% of the container, while `w--auto` and `h--auto` let the browser calculate dimensions based on content.

Full Width

Auto Width

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)SizeDynamic Widths

```
<div class="w--full">Full width</div>
<div class="w--auto">Auto width</div>
<div class="h--full">Full height</div>
<div class="h--auto">Auto height</div>
```

### Container Query Sizes

Container query sizes let you size elements as a percentage of the `.layout` container. Use `w--[Ncqw]` for width and `h--[Ncqh]` for height, where N is 0 to 100 (0% to 100% of the layout's dimensions).

This works automatically because `.layout` is configured as a CSS container query context. Any element inside a layout can use these units to size itself relative to the layout's width or height. This is useful for responsive images, flexible columns, or proportional spacing.

For advanced cases where you need to reference a different container (e.g., a specific column), add `style="container-type: size;"` to that element. It must have explicit dimensions set.

`w--[50cqw]`

`w--[75cqw]`

`h--[50cqh]`

`50% container width`

`75% container width`

`50% container height`

```
<div class="view view--full">
  <div class="layout">
    <div class="w--[50cqw]">50% of layout width</div>
    <div class="h--[33cqh]">33% of layout height</div>
  </div>
</div>
```

## Min/Max Dimensions

Control minimum and maximum element dimensions independently using min and max classes. These constraints work with all sizing methods: fixed sizes, arbitrary sizes, container query units, and dynamic sizes.

### Fixed Sizes

Use `w--min-{size}`, `w--max-{size}`, `h--min-{size}`, and `h--max-{size}` to constrain dimensions using fixed size values.

Min Width 72 (288px)

Max Width 32 (128px)

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)SizeFixed Sizes

```
<div class="w--auto w--min-72">Min Width 72 (288px)</div>
<div class="w--full w--max-32">Max Width 32 (128px)</div>
<div class="h--min-72">Min Height 72 (288px)</div>
<div class="h--max-8">Max Height 8 (32px)</div>
```

### Arbitrary Sizes

Use `w--min-[Npx]`, `w--max-[Npx]`, `h--min-[Npx]`, and `h--max-[Npx]` to constrain dimensions using precise pixel values. N can be any value from 0 to 128, the same range as the arbitrary width and height classes.

`w--min-[100px]`

`w--max-[120px]`

`h--min-[50px]`

`h--max-[100px]`

`min-width: 100px`

`max-width: 120px`

`min-height: 50px`

`max-height: 100px`

### Dynamic Sizes

Use `w--min-full`, `w--max-full`, `h--min-full`, `h--max-full`, `w--min-auto`, `w--max-auto`, `h--min-auto`, and `h--max-auto` to constrain dynamic dimensions.

`w--min-full`

`w--max-full`

`h--min-auto`

`h--max-auto`

`min-width: 100%`

`max-width: 100%`

`min-height: auto`

`max-height: none`

### Container Query Sizes

Use `w--min-[Ncqw]`, `w--max-[Ncqw]`, `h--min-[Ncqh]`, and `h--max-[Ncqh]` to constrain dimensions relative to the container.

`w--min-[100cqw]`

`w--max-[50cqw]`

`h--min-[75cqh]`

`h--max-[90cqh]`

`min-width: 100cqw`

`max-width: 50cqw`

`min-height: 75cqh`

`max-height: 90cqh`

## Responsive Sizes

Size utilities support responsive variants, allowing you to set different dimensions at different screen breakpoints. Use the pattern `breakpoint:size-class` to apply sizes conditionally.

### Responsive Examples

Apply different width and height values at different screen sizes using responsive prefixes. The framework follows a mobile-first approach where styles apply to the target breakpoint and larger.

Responsive Width

Responsive Height

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)SizeResponsive Sizes

```
<!-- Width: 8 (32px) by default, 16 (64px) on md and up, 24 (96px) on lg and up -->
<div class="w--8 md:w--16 lg:w--24">Responsive Width</div>

<!-- Height: 8 (32px) by default, 16 (64px) on md and up, 24 (96px) on lg and up -->
<div class="h--8 md:h--16 lg:h--24">Responsive Height</div>

<!-- Min/Max with responsive -->
<div class="w--min-8 md:w--min-16 lg:w--min-24">Responsive Min Width</div>

<!-- Container query units with responsive -->
<div class="w--[25cqw] md:w--[50cqw] lg:w--[75cqw]">Responsive Container Query</div>
```

### Supported Responsive Classes

Responsive variants are available for most size utilities. Use prefixes like `md:`, `portrait:`, and `md:portrait:` to target different breakpoints and orientations.

| Category | Responsive Support | Example Usage |
| --- | --- | --- |
| Fixed Sizes | ✓ Supported | `md:w--16, lg:h--24` |
| Full/Auto Dimensions | ✓ Supported | `md:w--full, lg:h--auto` |
| Min/Max Dimensions | ✓ Supported | `md:w--min-16, lg:h--max-full` |
| Arbitrary Dimensions | ✓ Supported | `md:w--[128px], lg:h--[96px]` |
| Container Query Sizes | ✓ Supported | `md:w--[50cqw], lg:h--[75cqh]` |

 Previous  [ 

## TRMNL X Guide

Framework changes for TRMNL X compatibility

 ](/framework/docs/3.1/trmnl_x_guide)

 Next  [ 

## Spacing

Control element spacing with fixed margin and padding values

 ](/framework/docs/3.1/spacing)

