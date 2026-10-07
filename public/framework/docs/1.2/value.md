# Value

The Value system provides consistent text styling for displaying numerical and textual values, with various size options and support for tabular numbers. It ensures readability and visual hierarchy across different contexts.

### Size Variants

The Value system offers eight size variants, from XXSmall to XXXLarge, allowing for flexible typography scaling across different use cases. Each size is carefully crafted for optimal readability and visual balance.

#### XXSmall

The `value--xxsmall` class creates the smallest text size, ideal for compact displays and supporting information.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueXXSmall

```
<span class="value value--xxsmall">Example</span>
<span class="value value--xxsmall value--tnums">48,206.62</span>
```

#### XSmall

The `value--xsmall` class provides a size slightly larger than XXSmall, suitable for secondary information and compact interfaces.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueXSmall

```
<span class="value value--xsmall">Example</span>
<span class="value value--xsmall value--tnums">48,206.62</span>
```

#### Small

The `value--small` class creates a size suitable for general body text and regular content.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueSmall

```
<span class="value value--small">Example</span>
<span class="value value--small value--tnums">48,206.62</span>
```

#### Default Size

The base `value` class without size modifiers provides the standard display size.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueDefault

```
<span class="value">Example</span>
<span class="value value--tnums">48,206.62</span>
```

#### Large

The `value--large` class creates emphasized text, suitable for important information and headings.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueLarge

```
<span class="value value--large">Example</span>
<span class="value value--large value--tnums">48,206.62</span>
```

#### XLarge

The `value--xlarge` class provides prominent display text, ideal for section headers and key metrics.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueXLarge

```
<span class="value value--xlarge">Example</span>
<span class="value value--xlarge value--tnums">48,206.62</span>
```

#### XXLarge

The `value--xxlarge` class creates very large display text, perfect for major headings and hero sections.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueXXLarge

```
<span class="value value--xxlarge">Example</span>
<span class="value value--xxlarge value--tnums">48,206.62</span>
```

#### XXXLarge

The `value--xxxlarge` class provides the largest text size, designed for maximum impact in hero sections and key displays.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueXXXLarge

```
<span class="value value--xxxlarge">Example</span>
<span class="value value--xxxlarge value--tnums">48,206.62</span>
```

### Numerical Display

For numerical values, the Value system includes special formatting options to ensure clear and consistent display of numbers, particularly in financial or data-heavy contexts.

#### Tabular Numbers

Add the `value--tnums` modifier to enable tabular numbers, ensuring consistent width for better alignment in tables and lists.

Regular: 48,206.62Tabular: 48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueTabular Numbers

```
<span class="value value--large">Regular: 48,206.62</span>
<span class="value value--large value--tnums">Tabular: 48,206.62</span>
```

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| Base |
| `--value-font-family` | "Inter Variable", Inter | - | #{meta.inspect($family)} | - |
| `--value-font-size` | calc(38px \* var(--text-ui-scale)) | - | calc(38px \* var(--text-ui-scale)) | - |
| `--value-font-smoothing` | auto | - | auto | - |
| `--value-font-weight` | 450 | - | clamp(100, calc(450 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-line-height` | calc(42px \* var(--text-ui-scale)) | - | calc(42px \* var(--text-ui-scale)) | - |
| Xxsmall |
| `--value-xxsmall-font-family` | "NicoClean" | "NicoClean" | #{meta.inspect($family)} | - |
| `--value-xxsmall-font-size` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | - |
| `--value-xxsmall-font-smoothing` | none | none | auto | - |
| `--value-xxsmall-font-weight` | 400 | 400 | clamp(100, calc(700 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-xxsmall-line-height` | calc(16px \* var(--text-ui-scale)) | calc(16px \* var(--text-ui-scale)) | calc(14px \* var(--text-ui-scale)) | - |
| Xsmall |
| `--value-xsmall-font-size` | calc(20px \* var(--text-ui-scale)) | - | calc(20px \* var(--text-ui-scale)) | - |
| `--value-xsmall-font-weight` | 600 | - | clamp(100, calc(600 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-xsmall-line-height` | calc(24px \* var(--text-ui-scale)) | - | calc(24px \* var(--text-ui-scale)) | - |
| Small |
| `--value-small-font-size` | calc(26px \* var(--text-ui-scale)) | - | calc(26px \* var(--text-ui-scale)) | - |
| `--value-small-font-weight` | 500 | - | clamp(100, calc(475 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-small-line-height` | calc(29px \* var(--text-ui-scale)) | - | calc(29px \* var(--text-ui-scale)) | - |
| Large |
| `--value-large-font-size` | calc(58px \* var(--text-ui-scale)) | - | calc(58px \* var(--text-ui-scale)) | - |
| `--value-large-font-weight` | 400 | - | clamp(100, calc(400 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-large-line-height` | calc(70px \* var(--text-ui-scale)) | - | calc(70px \* var(--text-ui-scale)) | - |
| Xlarge |
| `--value-xlarge-font-size` | calc(74px \* var(--text-ui-scale)) | - | calc(74px \* var(--text-ui-scale)) | - |
| `--value-xlarge-font-weight` | 375 | - | clamp(100, calc(375 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-xlarge-line-height` | calc(86px \* var(--text-ui-scale)) | - | calc(86px \* var(--text-ui-scale)) | - |
| Xxlarge |
| `--value-xxlarge-font-size` | calc(96px \* var(--text-ui-scale)) | - | calc(96px \* var(--text-ui-scale)) | - |
| `--value-xxlarge-font-weight` | 350 | - | clamp(100, calc(350 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-xxlarge-line-height` | calc(108px \* var(--text-ui-scale)) | - | calc(108px \* var(--text-ui-scale)) | - |
| Xxxlarge |
| `--value-xxxlarge-font-size` | calc(128px \* var(--text-ui-scale)) | - | calc(128px \* var(--text-ui-scale)) | - |
| `--value-xxxlarge-font-weight` | 300 | - | clamp(100, calc(300 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-xxxlarge-line-height` | calc(128px \* var(--text-ui-scale)) | - | calc(128px \* var(--text-ui-scale)) | - |
| Mega |
| `--value-mega-font-size` | calc(170px \* var(--text-ui-scale)) | - | calc(170px \* var(--text-ui-scale)) | - |
| `--value-mega-font-weight` | 275 | - | clamp(100, calc(275 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-mega-line-height` | calc(180px \* var(--text-ui-scale)) | - | calc(180px \* var(--text-ui-scale)) | - |
| Giga |
| `--value-giga-font-size` | calc(220px \* var(--text-ui-scale)) | - | calc(220px \* var(--text-ui-scale)) | - |
| `--value-giga-font-weight` | 250 | - | clamp(100, calc(250 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-giga-line-height` | calc(230px \* var(--text-ui-scale)) | - | calc(230px \* var(--text-ui-scale)) | - |
| Tera |
| `--value-tera-font-size` | calc(290px \* var(--text-ui-scale)) | - | calc(290px \* var(--text-ui-scale)) | - |
| `--value-tera-font-weight` | 225 | - | clamp(100, calc(225 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-tera-line-height` | calc(300px \* var(--text-ui-scale)) | - | calc(300px \* var(--text-ui-scale)) | - |
| Peta |
| `--value-peta-font-size` | calc(380px \* var(--text-ui-scale)) | - | calc(380px \* var(--text-ui-scale)) | - |
| `--value-peta-font-weight` | 200 | - | clamp(100, calc(200 + var(--framework-font-weight-shift, 0)), 900) | - |
| `--value-peta-line-height` | calc(390px \* var(--text-ui-scale)) | - | calc(390px \* var(--text-ui-scale)) | - |

 Previous  [ 

## Title

Style headings with consistent typography

 ](/framework/docs/1.2/title)

 Next  [ 

## Label

Create clear labels for unified content identification

 ](/framework/docs/1.2/label)

