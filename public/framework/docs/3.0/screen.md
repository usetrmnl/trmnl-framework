# Screen

The Screen component is the outermost container that defines the device dimensions and provides global settings for your content.

You don't specify the `screen`. The platform provides the correct `screen` container based on the target device.

You provide the `screen` yourself. Include it with the appropriate device class (`screen--og`, `screen--v2`) and optional modifiers like `screen--portrait`, `screen--no-bleed`, or `screen--dark-mode`.

```
<!-- screen (platform-provided) -->
<!-- view view--full (platform-provided) -->
<div class="layout">...</div>
<div class="title_bar">...</div>
<!-- /view -->
<!-- /screen -->
```

```
<div class="screen">
  <div class="view view--full">
    <div class="layout">...</div>
    <div class="title_bar">...</div>
  </div>
</div>
```

### Base Structure

The Screen component serves as the root container for all content. It establishes the viewport dimensions, padding, and provides CSS variables that cascade throughout the framework.

#### Default Screen

The base `screen` class creates a container with default dimensions (800x480px landscape). It includes padding controlled by the `--gap` variable.

Default Screen

```
<div class="screen">
  <div class="view view--full">
    <div class="layout">
      <!-- Your content here -->
    </div>
  </div>
</div>
```

### CSS Variables

The Screen component provides CSS variables that cascade throughout the framework. These variables automatically recalculate when device variants or orientation modifiers are applied.

#### Available Variables

These variables are set on the `screen` element and available to all nested components.

| Variable | Description | Default Value |
| --- | --- | --- |
| `--screen-w` | Screen width | 800px |
| `--screen-h` | Screen height | 480px |
| `--full-w` | Full width minus padding | `calc(--screen-w - --gap * 2)` |
| `--full-h` | Full height minus padding | `calc(--screen-h - --gap * 2)` |
| `--device-ui-scale` | Device-native UI density factor | 1 |
| `--modifier-scale` | Selected Scale modifier | 1 |
| `--ui-scale` | Composed device and modifier scale for framework UI | 1 |
| `--gap-scale` | Gap scaling factor | 1 |
| `--color-depth` | Display color depth (bits) | 1 |

### Orientation

Screens can be displayed in landscape (default) or portrait orientation.

#### Orientation Toggle

The `screen--portrait` modifier swaps the width and height dimensions. All layout calculations automatically adjust to the new dimensions.

```
<!-- Landscape (default) -->
<div class="screen">
  <!-- 800x480 dimensions -->
</div>

<!-- Portrait orientation -->
<div class="screen screen--portrait">
  <!-- 480x800 dimensions (swapped) -->
</div>
```

### Device Variants

The Screen component supports device-specific configurations that adjust dimensions, scaling, and color depth. These variants ensure content displays correctly across different TRMNL devices.

#### Available Devices

Each device variant sets specific dimensions and scaling factors. Combine with orientation and bit-depth modifiers for complete control.

```
<!-- Original TRMNL -->
<div class="screen screen--og screen--1bit">
  <!-- 800x480, 1-bit depth -->
</div>

<!-- TRMNL V2 -->
<div class="screen screen--v2 screen--4bit">
  <!-- 1040x780, 4-bit depth -->
</div>

<!-- Amazon Kindle 2024 -->
<div class="screen screen--amazon_kindle_2024 screen--4bit">
  <!-- 718x540, 4-bit depth -->
</div>

<!-- Combined modifiers -->
<div class="screen screen--v2 screen--portrait screen--4bit">
  <!-- All modifiers work together -->
</div>
```

### Modifiers

Screen modifiers provide additional control over display properties and behavior.

#### No Bleed Modifier

The screen container that wraps your views has a no-bleed option that removes padding. This can be controlled through Private and Public Plugin settings, or applied directly in your code when developing locally. The `screen--no-bleed` modifier removes the default padding around the screen container, allowing content to extend fully to the edges.

Screen No Bleed / Layout

```
<div class="screen screen--no-bleed">
  <div class="view view--full">
    <div class="layout">
      <!-- Your content here -->
    </div>
  </div>
</div>
```

#### Dark Mode

The `screen--dark-mode` modifier remaps framework color tokens and utility output for dark rendering (background, text, border, and stroke utilities included).

```
<div class="screen screen--dark-mode">
  <!-- Framework tokens/utilities render in dark mode -->
</div>
```

#### Backdrop Mashups

By default, mashups display with a white background and bordered views. The `screen--backdrop` modifier changes this to a patterned background (1-bit) or solid gray background (2-bit/4-bit) with plain white views. See the [Outline](/framework/docs/3.0/outline) utility for more details.

```
<!-- Backdrop mashup (patterned / gray background) -->
<div class="screen screen--backdrop">
  <div class="mashup mashup--1Lx1R">
    <div class="view view--half_vertical">
      <div class="layout">...</div>
    </div>
    <div class="view view--half_vertical">
      <div class="layout">...</div>
    </div>
  </div>
</div>
```

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| `--content-scale` | 1 | - | - | - |
| `--full-h` | calc(var(--screen-h) - var(--gap) \* 2) | - | - | - |
| `--full-w` | calc(var(--screen-w) - var(--gap) \* 2) | - | - | - |
| `--gap-scale` | 1 | - | - | - |
| `--half_horizontal-h` | calc((var(--screen-h) - var(--gap) \* 2) / 2 - var(--gap) / 2) | - | - | - |
| `--half_horizontal-w` | calc((var(--screen-w) - var(--gap) \* 2)) | - | - | - |
| `--half_vertical-h` | calc((var(--screen-h) - var(--gap) \* 2)) | - | - | - |
| `--half_vertical-w` | calc((var(--screen-w) - var(--gap) \* 2) / 2 - var(--gap) / 2) | - | - | - |
| `--quadrant-h` | calc((var(--screen-h) - var(--gap) \* 2) / 2 - var(--gap) / 2) | - | - | - |
| `--quadrant-w` | calc((var(--screen-w) - var(--gap) \* 2) / 2 - var(--gap) / 2) | - | - | - |
| `--screen-h` | 480px | - | - | - |
| `--screen-h-original` | 480px | - | - | - |
| `--screen-w` | 800px | - | - | - |
| `--screen-w-original` | 800px | - | - | - |
| `--ui-scale` | 1 | - | - | - |

 Previous  [ 

## Structure

The framework's exact div hierarchy and how Screen, View, Layout, Title Bar, Columns, and Mashup work together

 ](/framework/docs/3.0/structure)

 Next  [ 

## View

Show your plugin in different sizes with Mashup view containers

 ](/framework/docs/3.0/view)

