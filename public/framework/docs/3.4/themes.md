# Themes

Themes are a simple way to visually customize any TRMNL plugin. A theme adjusts the framework's colors (backgrounds, text, borders, chart colors) without touching plugin markup, and gracefully adapts to every supported device, from 1-bit ePaper to full color.

### Usage

Include the theme stylesheet and add `screen--theme-<id>` to your screen element. Theme stylesheets ship with every framework release, next to `plugins.css`.

A theme already decides every color, so `screen--dark-mode` has no effect on a themed screen. A theme that wants its own dark variant can style `.screen--theme-<id>.screen--dark-mode` in its stylesheet.

Monochrome plugin icons follow the theme automatically when they carry the `image--adaptive` class. See [Image](/framework/docs/3.4/image) .

```
<link rel="stylesheet" href="plugins.css">
<link rel="stylesheet" href="themes/black-and-yellow-theme.css">

<div class="screen screen--theme-black-and-yellow">...</div>
```

### Available Themes

The framework ships these themes:

- **Black and Yellow** : `screen--theme-black-and-yellow`
- **Dark** : `screen--theme-dark`
- **White and Red** : `screen--theme-white-and-red`

To see them in action, pick a Style in the screen picker (top right). It applies to every example on the page and persists across pages.

43Sales Calls

7New Clients

4,283Reams Sold

Q4 Paper Quota60%

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)Dunder MifflinSales

### Themes in JavaScript

JavaScript can read everything it needs from a theme's CSS:

- `TRMNLPaint`: reads every color and pattern from the CSS itself, so charts and other JS-drawn visuals follow the active theme. 
- `TRMNLPaint.cssVar()`: reads any `--*` variable a theme sets on the screen. A theme that wants to hand its own values to plugin code declares them; no framework changes needed. 

See [Paint API](/framework/docs/3.4/paint_api) .

### Build Your Own Theme

A theme never changes your markup. The pages below cover the workflow, custom fonts, and every part a theme can recolor.

#### Authoring Themes

The workflow: start from the boilerplate, point each part of the screen at new colors, register the id, and lint.

 Go to [Authoring Themes](/framework/docs/3.4/theme_authoring)

#### Custom Typefaces

Use your own font in a theme, or in one plugin on any screen.

 Go to [Custom Typefaces](/framework/docs/3.4/custom_typefaces)

#### Theme Slots

Every surface a theme can recolor, from semantic colors and components to utilities, borders, and chart series.

 Go to [Theme Slots](/framework/docs/3.4/theme_slots)

### Where This Applies

[ 

## Image

 ](/framework/docs/3.4/image)

 Previous  [ 

## Sass Mixins

Screen-targeting mixins and scale functions for authoring device-aware SCSS

 ](/framework/docs/3.4/sass_mixins)

 Next  [ 

## Authoring Themes

How to build your own theme: start from the boilerplate, map the slots, register the id, and lint

 ](/framework/docs/3.4/theme_authoring)

