# Custom Devices

Every device the compile knows about becomes a screen--{name} class, with its dimensions, density, and color depth baked in. Add your own panels through $custom-devices without touching framework source.

### The Device Map

`$devices` in `framework/config/_devices.scss` defines every device profile the framework ships. The map is generated from the platform's device registry (`db/data/framework_devices.yml`), so it is not edited by hand.

Each entry becomes a `screen--<name>` class carrying the device's dimensions and rendering variables. [Screen](/framework/docs/3.4/screen) shows how the class is used in markup. Every profile carries the same schema:

| Key | What it sets |
| --- | --- |
| `screen-w`, `screen-h` | Screen dimensions in CSS pixels. |
| `pixel-ratio` | Physical-to-CSS pixel ratio of the display. |
| `dither-pixel-ratio` | The ratio dither patterns render at, so they stay crisp on high-DPI panels. |
| `ui-scale` | How much the device scales the interface by default. |
| `color-depth` | The grayscale tier: 1, 2, or 4. Full-color profiles carry 12 or 24. |
| `density-tier` | `'1x'` or `'2x'`: picks the pixel-font or vector typography tier. |
| `gap-scale` | Multiplier applied to the gap variables. |
| `size` | `'sm'`, `'md'`, or `'lg'`: the size class the device extends. |

### Configure Your Own

Custom stacks add device profiles without touching framework source: configure `$custom-devices` where you load the framework. Everything the framework generates per device includes your profile, so a configured device behaves exactly like a built-in one.

```
// my-build.scss
@use 'framework' with (
    $custom-devices: (
        'my-panel': (
            'screen-w': 1024px,
            'screen-h': 758px,
            'pixel-ratio': 1.0,
            'dither-pixel-ratio': 1.0,
            'ui-scale': 1.0,
            'color-depth': 2,
            'density-tier': '1x',
            'gap-scale': 1.0,
            'size': 'lg'
        )
    )
);
```

```
<div class="screen screen--my-panel">
  <div class="view view--full">...</div>
</div>
```

Profiles are validated at compile time: a missing key or an invalid `size` or `density-tier` fails the build with a named error. An entry that reuses a built-in device name overrides that device. Compile as usual; see [Compiling the Framework](/framework/docs/3.4/sass_build) .

### What a Profile Generates

- A `screen--<name>` class setting the device variables (`--screen-w`, `--pixel-ratio`, `--color-depth`, ...).
- The size behavior of its `size` class, and the typography tier of its `density-tier`. See [Scale](/framework/docs/3.4/scale) for how density and scale compose.
- The per-device utility rules, like high-DPI outline dots for profiles with a `dither-pixel-ratio` of 2 and up.

The JavaScript runtime reads the same variables at render time; see [Framework Runtime](/framework/docs/3.4/framework_runtime) .

### The Built-in byod Profile

The map ships a generic `byod_custom` profile, so even a released build has a bring-your-own-device class. Apply `screen--byod_custom` for a quick start without compiling anything, then graduate to `$custom-devices` when you need your panel's exact dimensions and depth.

### Where This Applies

[ 

## Screen

 ](/framework/docs/3.4/screen)[ 

## Devices

 ](/framework/docs/3.4/devices)

 Previous  [ 

## Compiling the Framework

Compile plugins.css and the theme stylesheets from source with Dart Sass

 ](/framework/docs/3.4/sass_build)

 Next  [ 

## Sass Mixins

Screen-targeting mixins and scale functions for authoring device-aware SCSS

 ](/framework/docs/3.4/sass_mixins)

