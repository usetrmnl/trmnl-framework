# Text Size

Utility classes for controlling text size. Each class sets the correct font family, size, line-height, and smoothing for the active density tier: pixel bundle on low-density displays, Inter Variable on high-density displays.

### Text Size Utilities

Use `text--{size}` utility classes to set font family, size, line-height, and smoothing in one declaration. Density decides which font family the utility resolves to. On low-density displays, the three smallest sizes use the active pixel-font bundle (Classic NicoPups/NicoClean/BlockKie or TRMNL TRMNL12/16/21). On high-density displays, every text size uses Inter Variable regardless of bundle. Sizes from xlarge onward use Inter Variable on every display, and so does every size when a Scale or Text Scale modifier other than Regular is active, because pixel bundles only render correctly at their native sizes.

**High-density font notice:** This preview is using Inter because the selected device is high-density. Classic and TRMNL pixel bundles still apply on low-density displays; choose a 1x-density model in Device Preview to compare those bundles.

| Class | Size | Line-height | Classic (low-density) | TRMNL (low-density) | High-density |
| --- | --- | --- | --- | --- | --- |
| `text--small` | 12px | 1 | NicoPups @ 16px | TRMNL12 | Inter Variable |
| `text--base` | 16px | 1.25 | NicoClean | TRMNL16 | Inter Variable |
| `text--large` | 21px | 1 | BlockKie @ 26px | TRMNL21 | Inter Variable |
| `text--xlarge` | 26px | 29px | Inter Variable | Inter Variable | Inter Variable |
| `text--xxlarge` | 38px | 42px | Inter Variable | Inter Variable | Inter Variable |
| `text--xxxlarge` | 58px | 70px | Inter Variable | Inter Variable | Inter Variable |
| `text--mega` | 74px | 86px | Inter Variable | Inter Variable | Inter Variable |
| `text--giga` | 96px | 108px | Inter Variable | Inter Variable | Inter Variable |
| `text--tera` | 128px | 128px | Inter Variable | Inter Variable | Inter Variable |
| `text--peta` | 170px | 180px | Inter Variable | Inter Variable | Inter Variable |

#### Small

The `text--small` class. Low-density previews show the active pixel-font bundle where that size supports it; high-density previews show Inter.

The quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dog

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Text SizeSmall

```
<span class="text--small">Regular text</span>
<span class="text--small font--bold">Bold text</span>
```

#### Base

The `text--base` class. Low-density previews show the active pixel-font bundle where that size supports it; high-density previews show Inter.

The quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dog

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Text SizeBase

```
<span class="text--base">Regular text</span>
<span class="text--base font--bold">Bold text</span>
```

#### Large

The `text--large` class. Low-density previews show the active pixel-font bundle where that size supports it; high-density previews show Inter.

The quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dog

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Text SizeLarge

```
<span class="text--large">Regular text</span>
<span class="text--large font--bold">Bold text</span>
```

#### XLarge

The `text--xlarge` class. Low-density previews show the active pixel-font bundle where that size supports it; high-density previews show Inter.

The quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dog

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Text SizeXLarge

```
<span class="text--xlarge">Regular text</span>
<span class="text--xlarge font--bold">Bold text</span>
```

#### XXLarge

The `text--xxlarge` class. Low-density previews show the active pixel-font bundle where that size supports it; high-density previews show Inter.

The quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dog

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Text SizeXXLarge

```
<span class="text--xxlarge">Regular text</span>
<span class="text--xxlarge font--bold">Bold text</span>
```

#### XXXLarge

The `text--xxxlarge` class. Low-density previews show the active pixel-font bundle where that size supports it; high-density previews show Inter.

The quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dog

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Text SizeXXXLarge

```
<span class="text--xxxlarge">Regular text</span>
<span class="text--xxxlarge font--bold">Bold text</span>
```

### Responsive & bit-depth variants

All text size utilities support responsive, orientation, and bit-depth prefixes. Combine them to fine-tune typography across screen sizes and display types.

| Variant | Example | Description |
| --- | --- | --- |
| Responsive | `md:text--large` | Apply at medium breakpoint and up |
| Orientation | `portrait:text--small` | Apply in portrait orientation |
| Bit-depth | `4bit:text--xlarge` | Apply on 4-bit displays only |
| Combined | `md:4bit:text--xxlarge` | Apply at medium breakpoint on 4-bit displays |

```
<span class="text--base md:text--large portrait:text--small">
  Responsive text sizing
</span>
<span class="text--base 4bit:text--xlarge">
  Larger on 4-bit displays
</span>
```

 Previous  [ 

## Font Glyphs

Browse every glyph available in each Framework font bundle

 ](/framework/docs/3.0/font_glyphs)

 Next  [ 

## Text Alignment

Control text alignment with responsive breakpoint, orientation, and bit-depth variants

 ](/framework/docs/3.0/text_alignment)

