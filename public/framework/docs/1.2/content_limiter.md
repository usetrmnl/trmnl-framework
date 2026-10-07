# Content Limiter

The Content Limiter system automatically restricts the height of content areas based on the view type, ensuring consistent layouts. When content exceeds the height threshold, it adds a class that makes text smaller, but content might still overflow. It should be used together with the Content component for proper formatting.

### Basic Usage

To enable automatic content limiting, add the `data-content-limiter="true"` attribute to your content element.

Long Content Example `

Contrary to what one might think, the Lorem ipsum text, despite being meaningless, has noble origins.

Objectively composed of unrelated words, Lorem ipsum owes its existence to Marco Tullio Cicerone and to some steps of his De finibus bonorum et malorum (The highest good and the highest evil) written in 45 BC, a classic of Latin literature dating back more than 2000 years ago.

The discovery was made by Richard McClintock , a professor of Latin at Hampden-Sydney College in Virginia, who faced the impetuous recurrence of the dark word consectetur in the text Lorem ipsum researched its origins to identify them in sections 1.10.32 and 1.10.33 of the aforementioned Cicero's philosophical work.

The words taken from one of the dialogues contained in the De finibus are therefore the pieces of the most famous nonsensical text in the world.

A discovery that has given greater importance to the Lorem ipsum which has remained on the crest of the wave since 500, that is when, according to Professor Richard McClintock, its use spread among the printers of the time.

Of course we know that to make it known to most was a publicity of the Sixties, that of the transferable Letraset character sheets: transparent adhesive sheets on which the Lorem ipsum text was imprinted easily transferable on the editorial products before the advent of the computer.

Of course we know that to make it known to most was a publicity of the Sixties, that of the transferable Letraset character sheets: transparent adhesive sheets on which the Lorem ipsum text was imprinted easily transferable on the editorial products before the advent of the computer.

Of course we know that to make it known to most was a publicity of the Sixties, that of the transferable Letraset character sheets: transparent adhesive sheets on which the Lorem ipsum text was imprinted easily transferable on the editorial products before the advent of the computer.

Of course we know that to make it known to most was a publicity of the Sixties, that of the transferable Letraset character sheets: transparent adhesive sheets on which the Lorem ipsum text was imprinted easily transferable on the editorial products before the advent of the computer.

Of course we know that to make it known to most was a publicity of the Sixties, that of the transferable Letraset character sheets: transparent adhesive sheets on which the Lorem ipsum text was imprinted easily transferable on the editorial products before the advent of the computer.

Of course we know that to make it known to most was a publicity of the Sixties, that of the transferable Letraset character sheets: transparent adhesive sheets on which the Lorem ipsum text was imprinted easily transferable on the editorial products before the advent of the computer.

Of course we know that to make it known to most was a publicity of the Sixties, that of the transferable Letraset character sheets: transparent adhesive sheets on which the Lorem ipsum text was imprinted easily transferable on the editorial products before the advent of the computer.

Of course we know that to make it known to most was a publicity of the Sixties, that of the transferable Letraset character sheets: transparent adhesive sheets on which the Lorem ipsum text was imprinted easily transferable on the editorial products before the advent of the computer.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Content LimiterText Exceeding Threshold

Short Content Example

Contrary to what one might think, the Lorem ipsum text, despite being meaningless, has noble origins.   
  
 Objectively composed of unrelated words, Lorem ipsum owes its existence to Marco Tullio Cicerone and to some steps of his De finibus bonorum et malorum (The highest good and the highest evil) written in 45 BC, a classic of Latin literature dating back more than 2000 years ago.   
  
 The discovery was made by Richard McClintock , a professor of Latin at Hampden-Sydney College in Virginia, who faced the impetuous recurrence of the dark word consectetur in the text Lorem ipsum researched its origins to identify them in sections 1.10.32 and 1.10.33 of the aforementioned Cicero's philosophical work.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Content LimiterText Within Threshold

```
<div class="content" data-content-limiter="true">
  <p>Contrary to what one might think, the Lorem ipsum text, despite being meaningless, has noble...</p>
</div>
```

When content exceeds the height threshold (which varies by view type), it will add the `content--small` class to make text smaller. Note that this does not automatically truncate overflowing text. For text truncation with ellipsis, use the [Clamp](/framework/docs/1.2/clamp) component.

### Custom Height Threshold

You can specify a custom maximum height using the `data-content-max-height` attribute.

Custom Height Example

Contrary to what one might think, the Lorem ipsum text, despite being meaningless, has noble origins.   
  
 Objectively composed of unrelated words, Lorem ipsum owes its existence to Marco Tullio Cicerone and to some steps of his De finibus bonorum et malorum (The highest good and the highest evil) written in 45 BC, a classic of Latin literature dating back more than 2000 years ago.

Custom Height Example

Contrary to what one might think, the Lorem ipsum text, despite being meaningless, has noble origins.   
  
 Objectively composed of unrelated words, Lorem ipsum owes its existence to Marco Tullio Cicerone and to some steps of his De finibus bonorum et malorum (The highest good and the highest evil) written in 45 BC, a classic of Latin literature dating back more than 2000 years ago.

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Content LimiterCustom Max Height: 140px

```
<div class="content" data-content-limiter="true" data-content-max-height="140">
  <p>Contrary to what one might think, the Lorem ipsum text, despite being meaningless, has noble...</p>
</div>

<div class="content" data-content-limiter="true" data-content-max-height="140">
  <p>Contrary to what one might think, the Lorem ipsum text, despite being meaningless, has noble...</p>
</div>
```

 Previous  [ 

## Fit Value

Automatically resize numbers and values to fit within their containers

 ](/framework/docs/1.2/fit_value)

 Next  [ 

## Pixel Perfect

Ensure text renders with crisp edges by aligning to the pixel grid

 ](/framework/docs/1.2/pixel_perfect)

