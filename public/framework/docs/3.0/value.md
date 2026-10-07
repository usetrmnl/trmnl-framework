# Value

Figures and readouts on a plugin screen. Twelve size variants from xxsmall to peta, plus value--tnums for tabular numbers that keep columns aligned.

### Size Variants

The Value system offers twelve size variants, from XXSmall to Peta.

#### Size Ladder

Each tier maps to one font size, and that size holds on every device, bit depth, and font bundle. A bare `value` renders at the Base tier. [Scale](/framework/docs/3.0/scale) and Text Scale multiply these sizes from the screen.

| Class | Font size |
| --- | --- |
| `value--xxsmall` | 16px |
| `value--xsmall` | 20px |
| `value--small` | 26px |
| `value--base` | 38px |
| `value--large` | 58px |
| `value--xlarge` | 74px |
| `value--xxlarge` | 96px |
| `value--xxxlarge` | 128px |
| `value--mega` | 170px |
| `value--giga` | 220px |
| `value--tera` | 290px |
| `value--peta` | 380px |

Value and the `text--` utilities share tier names but not sizes. `value--xlarge` is 74px where `text--xlarge` is 26px, and the utility that matches `value--xlarge` is `text--mega`.

#### XXSmall

The `value--xxsmall` class creates the smallest text size.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueXXSmall

```
<span class="value value--xxsmall">Example</span>
<span class="value value--xxsmall value--tnums">48,206.62</span>
```

#### XSmall

The `value--xsmall` class is one step larger than XXSmall.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueXSmall

```
<span class="value value--xsmall">Example</span>
<span class="value value--xsmall value--tnums">48,206.62</span>
```

#### Small

The `value--small` class creates a smaller text size.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueSmall

```
<span class="value value--small">Example</span>
<span class="value value--small value--tnums">48,206.62</span>
```

#### Base

The base `value` class without size modifiers and the `value--base` class both produce the same visual result. See the [Responsive Values](#responsive-values) section for examples.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueBase

```
<span class="value">Example</span>
<span class="value value--tnums">48,206.62</span>

<!-- Or using the base modifier -->
<span class="value value--base">Example</span>
<span class="value value--base value--tnums">48,206.62</span>
```

#### Large

The `value--large` class creates larger text.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueLarge

```
<span class="value value--large">Example</span>
<span class="value value--large value--tnums">48,206.62</span>
```

#### XLarge

The `value--xlarge` class provides larger text.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueXLarge

```
<span class="value value--xlarge">Example</span>
<span class="value value--xlarge value--tnums">48,206.62</span>
```

#### XXLarge

The `value--xxlarge` class creates very large text.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueXXLarge

```
<span class="value value--xxlarge">Example</span>
<span class="value value--xxlarge value--tnums">48,206.62</span>
```

#### XXXLarge

The `value--xxxlarge` class provides very large text.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueXXXLarge

```
<span class="value value--xxxlarge">Example</span>
<span class="value value--xxxlarge value--tnums">48,206.62</span>
```

#### Mega

The `value--mega` class creates extremely large text.

42

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueMega

```
<span class="value value--mega value--tnums">42</span>
```

#### Giga

The `value--giga` class provides massive text.

42

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueGiga

```
<span class="value value--giga value--tnums">42</span>
```

#### Tera

The `value--tera` class creates colossal text.

42

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueTera

```
<span class="value value--tera value--tnums">42</span>
```

#### Peta

The `value--peta` class provides the largest text.

42

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValuePeta

```
<span class="value value--peta value--tnums">42</span>
```

### Numerical Display

The Value system includes special formatting options for numerical values.

#### Tabular Numbers

Add the `value--tnums` modifier to enable tabular numbers.

Regular: 48,206.62Tabular: 48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueTabular Numbers

```
<span class="value value--large">Regular: 48,206.62</span>
<span class="value value--large value--tnums">Tabular: 48,206.62</span>
```

### Responsive Values

The Value system supports responsive variants using breakpoint prefixes.

#### Breakpoint Prefixes

Use breakpoint prefixes like `sm:`, `md:`, `lg:` to apply different sizes per device size class.

Responsive Value1,234.56

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueResponsive

```
<!-- Small by default, large on md screens, xlarge on lg screens -->
<span class="value value--small md:value--large lg:value--xlarge">
  Responsive Value
</span>

<!-- Progressive scaling with screen size -->
<span class="value value--xsmall sm:value--small md:value--base lg:value--large value--tnums">
  1,234.56
</span>

<!-- Using base modifier to reset to default size at breakpoint -->
<span class="value value--small lg:value--base">
  Small by default, base on large screens
</span>
```

#### Orientation and Size+Orientation

Value sizes can adapt to orientation with `portrait:` and can be combined with size breakpoints (e.g., `md:portrait:`).

Orientation Variant42,000.00

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueOrientation

```
<!-- Orientation only: smaller in portrait -->
<span class="value value--large portrait:value--small">Orientation Variant</span>

<!-- Size + orientation: xlarge only on md+ screens in portrait -->
<span class="value value--small md:portrait:value--xlarge value--tnums">42,000.00</span>
```

### Values in JavaScript

The value typography is readable from JS via `TRMNLPaint.type('value', { el })`, which probes the resolved font family, size, weight and line-height from the live cascade (so it follows the active font bundle and density automatically), and `applyType()` writes it onto a node. This is how JS-drawn visuals borrow the same big-number face as `.value` stat tiles (for example the chart gauge’s weekly value). See Painting Typography .

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

 ](/framework/docs/3.0/title)

 Next  [ 

## Label

Create clear labels for unified content identification

 ](/framework/docs/3.0/label)

