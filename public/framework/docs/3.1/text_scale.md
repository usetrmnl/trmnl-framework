# Text Scale

Text Scale adjusts every framework font size and pixel line height from one screen modifier. It composes with Scale, so you can change text readability without applying the same factor to interface geometry or text strokes.

### Basic Usage

Add `screen--text-scale-{size}` to the `screen`. Text Scale changes framework typography while [Scale](/framework/docs/3.1/scale) continues to control the rest of the interface.

```
<div class="screen screen--text-scale-large">
  <!-- All framework typography renders at 125%. -->
</div>
```

#### Available Levels

Text Scale uses four factors from 80% to 150%. Each factor applies after device density and [Scale](/framework/docs/3.1/scale) . Every factor except Regular also resolves typography to Inter Variable on low-density displays, because pixel bundles only render correctly at their native sizes.

| Class | Factor | Result |
| --- | --- | --- |
| `screen--text-scale-small` | 0.8 | 80% of the composed text size |
| `screen--text-scale-regular` | 1 | 100% of the composed text size |
| `screen--text-scale-large` | 1.25 | 125% of the composed text size |
| `screen--text-scale-xlarge` | 1.5 | 150% of the composed text size |

### Interactive Preview

Move the slider between the four Text Scale levels. The Weather example updates its framework typography while component dimensions, gaps, and text strokes keep their regular scale.

Aa

Aa

Aa

Aa

 ![](/images/plugins/weather/wi-day-sunny.svg)

77°Temperature (5:55 PM)

 ![Temperature](/images/plugins/weather/wi-thermometer.svg)

80°Feels Like

 ![Humidity](/images/plugins/weather/wi-raindrops.svg)

45%Humidity

 ![](/images/plugins/weather/wi-day-sunny.svg)

SunnyRight Now

 ![Today weather condition](/images/plugins/weather/wi-day-cloudy.svg)

Partly cloudyJul 9

 ![UV Index](/images/plugins/weather/wi-hot.svg)

High (8)UV

 ![Temperature](/images/plugins/weather/wi-thermometer.svg)

70°Low

86°High

 ![Tomorrow weather condition](/images/plugins/weather/wi-day-showers.svg)

Light RainJul 10

 ![UV Index](/images/plugins/weather/wi-hot.svg)

Moderate (5)UV

 ![Temperature](/images/plugins/weather/wi-thermometer.svg)

65°Low

79°High

 ![](/images/plugins/weather--render.svg)
# Weather
Las Vegas

```
<div class="screen screen--text-scale-regular">
  <!-- Replace regular with small, large, or xlarge. -->
</div>
```

### Combining Scale and Text Scale

Scale sets the base size for the whole interface, including component dimensions, spacing, and typography. Text Scale then multiplies only the typography on top of that base while leaving the surrounding geometry unchanged. For example, a 66% Scale combined with a 150% Text Scale produces text at 99% of its original size inside an interface that remains at 66%. Device density is still part of the framework's typography calculation, so Text Scale complements rather than replaces the device's font bundle and density settings.

### Custom Typography

Framework classes scale automatically. Use `--text-ui-scale` for custom CSS that follows framework typography.

```
<style>
  .custom-reading {
    font-size: calc(20px * var(--text-ui-scale, 1));
    line-height: calc(26px * var(--text-ui-scale, 1));
  }
</style>
```

### Related Tokens

These tokens are automatically mapped to this page by token prefix.

| Token | 1-bit | 2-bit | Density 2x | 4-bit and up |
| --- | --- | --- | --- | --- |
| `--content-scale` | 1 | - | - | - |
| `--device-ui-scale` | 1 | - | - | - |
| `--modifier-scale` | 1 | - | - | - |
| `--modifier-text-scale` | 1 | - | - | - |
| `--text-ui-scale` | 1 | - | - | - |
| `--ui-scale` | 1 | - | - | - |

 Previous  [ 

## Text Size

Control text size with utility classes across all display types

 ](/framework/docs/3.1/text_size)

 Next  [ 

## Text Alignment

Control text alignment with responsive breakpoint, orientation, and bit-depth variants

 ](/framework/docs/3.1/text_alignment)

