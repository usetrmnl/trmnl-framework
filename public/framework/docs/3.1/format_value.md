# Format Value

Format numbers so they fit their container and stay readable. Abbreviations (K, M, B), precision that adjusts to the space, and currency values with the symbol in the right place.

### Basic Usage

To enable automatic value formatting, add the `data-value-format="true"` attribute to your element.

`data-value-type="number"` is an accepted alias for the same opt-in, and only the exact value `number` opts in. The runtime selects both attributes in one pass, so an element carrying either one is formatted the same way and honors the same companion attributes. The examples on this page use `data-value-format`.

2345678XLarge

2345678Regular

2345678Small

456789XLarge

456789Regular

456789Small

34562XLarge

34562Regular

34562Small

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Value FormattingSize Comparison

```
<span class="value value--xlarge value--tnums" data-value-format="true">2345678</span>

<span class="value value--large value--tnums" data-value-format="true">456789</span>

<span class="value value--small value--tnums" data-value-format="true">34562</span>
```

To add a delimiter to large numbers, for example 1234 =\> 1,234, see [custom filters](https://intercom.help/trmnl/en/articles/10347358-custom-plugin-filters).

### Currency Values

Values with currency symbols are automatically formatted while maintaining the symbol placement.

$2345678XLarge

$2345678Regular

$2345678Small

$456789XLarge

$456789Regular

$456789Small

$34562XLarge

$34562Regular

$34562Small

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Value FormattingCurrency Example

```
<span class="value value--xlarge value--tnums" data-value-format="true" data-fit-value="true">$2345678</span>

<span class="value value--large value--tnums" data-value-format="true" data-fit-value="true">$456789</span>

<span class="value value--small value--tnums" data-value-format="true" data-fit-value="true">$34562</span>
```

To add a currency symbol, for example 1234 =\> $1,234, see [custom filters](https://intercom.help/trmnl/en/articles/10347358-custom-plugin-filters).

Supported currency symbols include:

`$`US Dollar

`€`Euro

`£`British Pound

`¥`Japanese Yen / Chinese Yuan

`₴`Ukrainian Hryvnia

`₹`Indian Rupee

`₪`Israeli Shekel

`₩`Korean Won

`₫`Vietnamese Dong

`₱`Philippine Peso

`₽`Russian Ruble

`₿`Bitcoin

### Regional Number Formats

Numbers can be formatted according to different regional standards using the `data-value-locale` attribute.

$123456.78United States (en-US)

$123456.78United States (en-US)

€123456.78German (de-DE)

€123456.78German (de-DE)

€123456.78French (fr-FR)

€123456.78French (fr-FR)

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Value FormattingRegional Formats

```
<span class="value value--xlarge value--tnums" data-value-format="true" data-value-locale="en-US">$123456.78</span>

<span class="value value--large value--tnums" data-value-format="true" data-value-locale="de-DE">€123456.78</span>

<span class="value value--small value--tnums" data-value-format="true" data-value-locale="fr-FR">€123456.78</span>
```

Common locale options include:

`en-US`United States (123,456.78)

`de-DE`German (123.456,78)

`fr-FR`French (123 456,78)

`en-GB`British English (123,456.78)

`ja-JP`Japanese (123,456.78)

If no locale is specified, numbers will be formatted using US format (en-US) by default.

 Previous  [ 

## Clamp

Manage text overflow with single and multi-line truncation

 ](/framework/docs/3.1/clamp)

 Next  [ 

## Fit Value

Automatically resize numbers and values to fit within their containers

 ](/framework/docs/3.1/fit_value)

