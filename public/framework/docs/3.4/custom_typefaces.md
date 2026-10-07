# Custom Typefaces

Use your own font for the framework text. Load the font, name it on any container, and every title, label, value, and description inside switches to it.

### Use Your Own Font

Load the font with `@font-face`, then name it on the element that holds your content. Framework 3.4 or later.

- `typeface` puts your font on every framework text class inside the element. It works on any container: the screen, a view, a layout, or a plain wrapper. 
- `--framework-typeface` names the font: one quoted family name, or a comma-separated list for your own fallbacks. Inter Variable and Inter always follow it, and the text stays on them when the variable is not set. 

```
<style>
  @font-face {
    font-family: "Lexend";
    font-weight: 100 900;
    src: url("https://example.com/fonts/lexend.woff2") format("woff2");
  }
</style>

<div class="view view--full typeface" style="--framework-typeface: 'Lexend'">
  <div class="layout layout--col">
    <span class="title">Today at a glance</span>
    <span class="description">Three meetings, one deadline</span>
  </div>
</div>
```

### Use It From Sass

`typography.typeface($family)` writes the same font rules into your own selector, with the family built in. Pass one quoted family name, or a comma-separated list.

```
@use "framework/mixins/typography";

.my-plugin {
    @include typography.typeface("Lexend");
}
```

A theme sets its font with `theme-slots.typeface($family)`, the same mixin under the theme-slots name. Include it in the theme's layer, and the theme class switches the whole screen to your font.

```
@use "framework/config/layers";
@use "framework/mixins/theme-slots";

@include layers.order;

@font-face {
    font-family: "Example Sans";
    font-weight: 100 900;
    font-style: normal;
    src: url("./fonts/example-sans.woff2") format("woff2");
}

@layer tn--themes {
    .trmnl .screen--theme-example {
        @include theme-slots.typeface("Example Sans");
    }
}
```

See [Authoring Themes](/framework/docs/3.4/theme_authoring) for building and loading a theme.

### Which Font Wins

- A plugin's font, set with the `typeface` class, wins inside its container.
- A theme's font applies everywhere else on the themed screen.
- Without either, the screen uses the device's built-in fonts.

The stylesheets can load in any order.

### What Changes on Each Device

- Every text class uses your font: titles, labels, values, descriptions, the title bar, item indexes, and rich text.
- On 1-bit and other low-density screens, your font also replaces the Classic and TRMNL pixel fonts.
- Text sizes, line heights, and Text Scale do not change. On 1-bit and other low-density screens they are the sizes drawn for the pixel fonts.
- A font wider or taller than the built-in ones can wrap or clip differently at those sizes, so preview it on the devices you target.
- A theme's `theme-slots.font-weight-shift` still moves every weight, as long as your font has the weights to move to.

See [Font Family](/framework/docs/3.4/font_family) for the built-in fonts and when each device uses them.

### Font Files

- The text classes ask for weights from 200 to 700. A variable font that covers that range matches every one of them.
- With separate files per weight, the browser uses the closest weight you declare. Ship at least a regular (400) and a bold (700).
- In a stylesheet you host, point `src` at files beside it with relative URLs, so it works on any host.
- Include the font's license with the files, and use WOFF2 where you can.

### Fonts in JavaScript

`TRMNLPaint.type()` returns your font for any text role, so text you draw yourself matches the screen. Pass an `el` inside a `typeface` container to read that container's font.

Read it again after a theme switch, and wait for `document.fonts.ready` before measuring text. See [Painting Typography](/framework/docs/3.4/paint_typography) .

### Share a Theme With Its Font

A theme with a custom font ships as a folder: the compiled stylesheet with the font files and their license beside it. See the portable exports on [Authoring Themes](/framework/docs/3.4/theme_authoring) .

