# Fit Value

Fit text to its container by adjusting font size, weight, and line height. Use it where the space available changes between devices, orientations, or view sizes.

### Basic Usage

To enable automatic text resizing, add the `data-value-fit="true"` attribute to your element. For numeric values, this is all you need - the system will automatically adjust the element's font size and weight to fit the container width. Text content requires additional configuration (see Text Fitting below).

 $1,000 XXXLarge

 $1,000,000 XXXLarge

 $1,000,000,000 XXXLarge

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Fit ValueNumber Formatting

```
<span class="value value--xxxlarge" data-value-fit="true">$1,000</span>

<span class="value value--xxxlarge" data-value-fit="true">$1,000,000</span>

<span class="value value--xxxlarge" data-value-fit="true">$1,000,000,000</span>
```

### Text Fitting

When fitting text content, you must specify a maximum height constraint using the `data-value-fit-max-height` attribute (in pixels). This ensures text content stays within both width and height constraints while maintaining readability through automatic font size and weight adjustments.

 Hello. This is a really long headline that will need to adjust significantly to fit within its container space and look good in a layout. XXXLarge

 Hello. This is a medium length headline that fits nicely. XXXLarge

 Hello. XXXLarge

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Fit ValueText Formatting

```
<span class="value value--xxxlarge" data-value-fit="true" data-value-fit-max-height="340">
  Hello. This is a really long headline that will need to adjust significantly to fit within its container space and look good in a layout.
</span>

<span class="value value--xxxlarge" data-value-fit="true" data-value-fit-max-height="340">
  This is a medium length headline that fits nicely.
</span>

<span class="value value--xxxlarge" data-value-fit="true" data-value-fit-max-height="340">
  Hello.
</span>
```

 Previous  [ 

## Format Value

Format numbers and values with consistent styling

 ](/framework/docs/2.3/format_value)

 Next  [ 

## Content Limiter

Change font size when content overflows to fit within the container

 ](/framework/docs/2.3/content_limiter)

