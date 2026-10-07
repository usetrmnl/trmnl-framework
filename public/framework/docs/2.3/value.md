# Value

Figures and readouts on a plugin screen. Twelve size variants from xxsmall to peta, plus value--tnums for tabular numbers that keep columns aligned.

### Size Variants

The Value system offers twelve size variants, from XXSmall to Peta.

#### XXSmall

The `value--xxsmall` class creates the smallest text size.

Example48,206.62

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueXXSmall

```
<span class="value value--xxsmall">Example</span>
<span class="value value--xxsmall value--tnums">48,206.62</span>
```

#### XSmall

The `value--xsmall` class provides a size slightly larger than XXSmall.

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

Use breakpoint prefixes like `sm:`, `md:`, `lg:` to apply different sizes at different screen widths.

Responsive Value1,234.56

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ValueResponsive

```
<!-- Small by default, large on md screens, xlarge on lg screens -->
<span class="value value--small md:value--large lg:value--xlarge">
  Responsive Value
</span>

<!-- Progressive scaling with screen size -->
<span class="value value--xsmall sm:value--small md:value--medium lg:value--large value--tnums">
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

 Previous  [ 

## Title

Style headings with consistent typography

 ](/framework/docs/2.3/title)

 Next  [ 

## Label

Create clear labels for unified content identification

 ](/framework/docs/2.3/label)

