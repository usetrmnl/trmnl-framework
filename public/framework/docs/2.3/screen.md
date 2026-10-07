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
| `--ui-scale` | UI scaling factor | 1 |
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

The `screen--dark-mode` modifier inverts the display colors, with special handling for images to maintain their original appearance.

```
<div class="screen screen--dark-mode">
  <!-- Colors are inverted, images preserved -->
</div>
```

#### Backdrop Mashups

By default, mashups display with a white background and bordered views. The `screen--backdrop` modifier changes this to a patterned background (1-bit) or solid gray background (2-bit/4-bit) with plain white views. See the [Outline](/framework/docs/2.3/outline) utility for more details.

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

 Previous  [ 

## Structure

The framework's exact div hierarchy and how Screen, View, Layout, Title Bar, Columns, and Mashup work together

 ](/framework/docs/2.3/structure)

 Next  [ 

## View

Show your plugin in different sizes with Mashup view containers

 ](/framework/docs/2.3/view)

