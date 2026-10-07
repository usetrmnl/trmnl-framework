# Fit Value

Fit text to its container by adjusting font size, weight, and line height. Use it where the space available changes between devices, orientations, or view sizes.

### Basic Usage

To enable automatic text resizing, add the `data-value-fit="true"` attribute to your element. The system adjusts the element's font size and weight to fit the content on a single line within the container width, for both numeric and text values. For multi-line text fitting, see the `data-value-fit-max-height` option below.

 $1,000 Dundies Budget

 $1,000,000 Scott's Tots

 $1,000,000,000 Sabre Revenue

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Fit ValueDunder Mifflin

```
<span class="value value--xxxlarge" data-value-fit="true">$1,000</span>

<span class="value value--xxxlarge" data-value-fit="true">$1,000,000</span>

<span class="value value--xxxlarge" data-value-fit="true">$1,000,000,000</span>
```

### Single-line Text Fitting

Text values are automatically fitted to a single line when using `data-value-fit="true"` without specifying a max height. The system derives the single-line height from the element's computed line-height, then shrinks the font size and weight until the text fits on one line within the container.

 Assistant to the Regional Manager Dwight's Title

 Threat Level Midnight Michael's Film

 World's Best Boss Michael's Mug

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Fit ValueDunder Mifflin

```
<span class="value value--xxxlarge" data-value-fit="true">Assistant to the Regional Manager</span>

<span class="value value--xxxlarge" data-value-fit="true">Threat Level Midnight</span>

<span class="value value--xxxlarge" data-value-fit="true">World&#39;s Best Boss</span>
```

### Multi-line Text Fitting

To allow text to wrap across multiple lines while still fitting within a constrained area, specify a maximum height using the `data-value-fit-max-height` attribute (in pixels). This overrides the default single-line behavior, allowing the text to wrap while ensuring it stays within both width and height constraints through automatic font size and weight adjustments.

 Would I rather be feared or loved? Easy. Both. I want people to be afraid of how much they love me. Michael Scott

 Identity theft is not a joke, Jim! Millions of families suffer every year. Dwight Schrute

 That's what she said. Michael Scott

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Fit ValueDunder Mifflin

```
<span class="value value--xxxlarge" data-value-fit="true" data-value-fit-max-height="340">
  Would I rather be feared or loved? Easy. Both. I want people to be afraid of how much they love me.
</span>

<span class="value value--xxxlarge" data-value-fit="true" data-value-fit-max-height="340">
  Identity theft is not a joke, Jim! Millions of families suffer every year.
</span>

<span class="value value--xxxlarge" data-value-fit="true" data-value-fit-max-height="340">
  That&#39;s what she said.
</span>
```

 Previous  [ 

## Format Value

Format numbers and values with consistent styling

 ](/framework/docs/3.0/format_value)

 Next  [ 

## Content Limiter

Change font size when content overflows to fit within the container

 ](/framework/docs/3.0/content_limiter)

