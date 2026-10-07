# Font Weight

Utility classes for controlling font weight independently of size. Classic ships in a single weight, so `text--bold` is a no-op on low-density Classic; on low-density TRMNL it picks the bundled bold variant; on high-density displays it sets the Inter Variable weight.

### Usage

Use `text--regular` and `text--bold` to control font weight independently of size. Density decides whether the active pixel-font bundle or Inter receives the weight. The bold variant is resolved as follows:

- **Classic** bundle: every font ships in a single weight, so `text--bold` has no visual effect on low-density Classic.
- **TRMNL** bundle: `text--bold` selects the matching **TRMNL12/16/21 Bold** font file at the active size.
- **High-density** displays: both classes simply set the Inter Variable weight to 400 or 700.

The older `font--regular` and `font--bold` spellings still render and are deprecated. See Deprecated weight aliases below.

**High-density font notice:** This preview is using Inter because the selected device is high-density. Classic and TRMNL pixel bundles still apply on low-density displays; choose a 1x-density model in Device Preview to compare those bundles.

| Class | Weight | Classic (low-density) | TRMNL (low-density) | High-density |
| --- | --- | --- | --- | --- |
| `text--regular` | 400 | NicoPups / NicoClean / BlockKie | TRMNL12/16/21 Regular | Inter Variable @ 400 |
| `text--bold` | 700 | No bold variant | TRMNL12/16/21 Bold | Inter Variable @ 700 |

#### Weight comparison · Classic bundle

Each weight shown at every pixel-font size with `screen--fonts-classic` on the screen root. Low-density displays use that bundle; high-density displays use Inter weights instead.

text--small text--regulartext--small text--bold

text--base text--regulartext--base text--bold

text--large text--regulartext--large text--bold

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Font WeightClassic

#### Weight comparison · TRMNL bundle

Each weight shown at every pixel-font size with `screen--fonts-trmnl` on the screen root. Low-density displays use that bundle; high-density displays use Inter weights instead.

text--small text--regulartext--small text--bold

text--base text--regulartext--base text--bold

text--large text--regulartext--large text--bold

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Font WeightTRMNL

```
<span class="text--small text--regular">Small regular</span>
<span class="text--small text--bold">Small bold</span>
<span class="text--base text--regular">Base regular</span>
<span class="text--base text--bold">Base bold</span>
<span class="text--large text--regular">Large regular</span>
<span class="text--large text--bold">Large bold</span>
```

### Responsive & bit-depth variants

Font weight utilities support responsive, orientation, and bit-depth prefixes. Combine them to fine-tune weight across screen sizes and display types.

| Variant | Example | Description |
| --- | --- | --- |
| Responsive | `md:text--bold` | Bold at medium breakpoint and up |
| Orientation | `portrait:text--regular` | Regular weight in portrait orientation |
| Bit-depth | `4bit:text--bold` | Bold on 4-bit displays only |
| Combined | `md:4bit:text--bold` | Bold at medium breakpoint on 4-bit displays |

```
<span class="text--base text--regular 4bit:text--bold">
  Bold only on 4-bit displays
</span>
<span class="text--large text--regular md:text--bold">
  Bold at medium breakpoint and up
</span>
```

### Deprecated weight aliases

Two `font--{weight}` classes ship as aliases of the weight utilities: `font--regular` and `font--bold`. Each renders exactly like the `text--` class with the same suffix, down to the responsive, orientation, and bit-depth variants.

They are deprecated and will be removed in Framework 4.0. Prefer `text--regular` and `text--bold` in new markup. The ten `font--{size}` classes carry the same removal release; see [Text Size](/framework/docs/3.0/text_size) .

```
<!-- Deprecated (but still works) -->
<span class="text--base font--bold">Bold text</span>
<span class="text--base font--regular md:font--bold">Bold at medium breakpoint and up</span>

<!-- Preferred -->
<span class="text--base text--bold">Bold text</span>
<span class="text--base text--regular md:text--bold">Bold at medium breakpoint and up</span>
```

 Previous  [ 

## Font Family

Switch between Classic and TRMNL font bundles per device

 ](/framework/docs/3.0/font_family)

 Next  [ 

## Font Glyphs

Browse every glyph available in each Framework font bundle

 ](/framework/docs/3.0/font_glyphs)

