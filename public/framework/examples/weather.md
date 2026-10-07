 ![Weather](/images/plugins/weather.svg) ![Weather](/images/plugins/weather.svg)

# Weather

### Layout Variations

See how this plugin adapts across different mashup views. Each view shows a single instance to demonstrate how the layout responds to available space.

#### Full View

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
<div class="layout layout--col gap--space-between">
  <div class="grid grid--cols-6">
    <div class="row row--center col--span-2 portrait:col--span-6 col--end">
      <img class="image--adaptive w--[22cqw] h--auto portrait:w--auto portrait:h--[40cqh] lg:w--[28cqw] lg:h--[28cqw] lg:portrait:w--auto lg:portrait:h--[33cqh]" src="/images/plugins/weather/wi-day-sunny.svg">
    </div>
    <div class="col col--span-2 portrait:col--span-3 col--end">
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xxxlarge lg:value--giga" data-fit-value="true">77°</span>
          <span class="label">Temperature (5:55 PM
)</span>
        </div>
      </div>
    </div>
    <div class="col col--span-2 portrait:col--span-3 col--end gap--medium">
      <div class="item">
        <div class="meta"></div>
        <div class="icon">
          <img class="image--adaptive w--[6cqw] h--[6cqw] portrait:w--[10cqw] portrait:h--[10cqw]" alt="Temperature" src="/images/plugins/weather/wi-thermometer.svg">
        </div>
        <div class="content">
          <span class="value value--xsmall lg:value--large">80°</span>
          <span class="label">Feels Like</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="icon">
          <img class="image--adaptive w--[6cqw] h--[6cqw] portrait:w--[10cqw] portrait:h--[10cqw]" alt="Humidity" src="/images/plugins/weather/wi-raindrops.svg">
        </div>
        <div class="content">
          <span class="value value--xsmall lg:value--large">45%</span>
          <span class="label">Humidity</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="icon">
          <img class="image--adaptive w--[6cqw] h--[6cqw] portrait:w--[10cqw] portrait:h--[10cqw]" src="/images/plugins/weather/wi-day-sunny.svg">
        </div>
        <div class="content">
          <span class="value value--xsmall lg:value--base">Sunny</span>
          <span class="label">Right Now</span>
        </div>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid">
    <div class="col gap--large">
      <div class="grid">
        <div class="item col--span-3 grow">
          <div class="meta"></div>
          <div class="icon">
            <img class="image--adaptive w--[6cqw] h--[6cqw] portrait:w--[10cqw] portrait:h--[10cqw]" alt="Today weather condition" src="/images/plugins/weather/wi-day-cloudy.svg">
          </div>
          <div class="content">
            <span class="value value--xsmall lg:value--base">Partly cloudy</span>
            <span class="label">Jul 9</span>
          </div>
        </div>
        <div class="item col--span-3 grow">
          <div class="meta"></div>
          <div class="icon portrait:hidden">
            <img class="image--adaptive w--[6cqw] h--[6cqw] portrait:w--[10cqw] portrait:h--[10cqw]" alt="UV Index" src="/images/plugins/weather/wi-hot.svg">
          </div>
          <div class="content">
            <span class="value value--xsmall lg:value--base">High (8)</span>
            <span class="label">UV</span>
          </div>
        </div>
        <div class="row col--span-3 grow">
          <div class="item">
            <div class="meta"></div>
            <div class="icon portrait:hidden">
              <img class="image--adaptive w--[6cqw] h--[6cqw] portrait:w--[10cqw] portrait:h--[10cqw]" alt="Temperature" src="/images/plugins/weather/wi-thermometer.svg">
            </div>
            <div class="content">
              <div class="flex flex--row gap--xlarge portrait:gap">
                <div class="content">
                  <span class="value value--xsmall lg:value--base">70°</span>
                  <span class="label">Low</span>
                </div>
                <div class="content">
                  <span class="value value--xsmall lg:value--base">86°</span>
                  <span class="label">High</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="grid">
        <div class="item col--span-3 grow">
          <div class="meta"></div>
          <div class="icon">
            <img class="image--adaptive w--[6cqw] h--[6cqw] portrait:w--[10cqw] portrait:h--[10cqw]" alt="Tomorrow weather condition" src="/images/plugins/weather/wi-day-showers.svg">
          </div>
          <div class="content">
            <span class="value value--xsmall lg:value--base">Light Rain</span>
            <span class="label">Jul 10</span>
          </div>
        </div>
        <div class="item col--span-3 grow">
          <div class="meta"></div>
          <div class="icon portrait:hidden">
            <img class="image--adaptive w--[6cqw] h--[6cqw] portrait:w--[10cqw] portrait:h--[10cqw]" alt="UV Index" src="/images/plugins/weather/wi-hot.svg">
          </div>
          <div class="content">
            <span class="value value--xsmall lg:value--base">Moderate (5)</span>
            <span class="label">UV</span>
          </div>
        </div>
        <div class="row col--span-3 grow">
          <div class="item">
            <div class="meta"></div>
            <div class="icon portrait:hidden">
              <img class="image--adaptive w--[6cqw] h--[6cqw] portrait:w--[10cqw] portrait:h--[10cqw]" alt="Temperature" src="/images/plugins/weather/wi-thermometer.svg">
            </div>
            <div class="content">
              <div class="flex flex--row gap--xlarge portrait:gap">
                <div class="content">
                  <span class="value value--xsmall lg:value--base">65°</span>
                  <span class="label">Low</span>
                </div>
                <div class="content">
                  <span class="value value--xsmall lg:value--base">79°</span>
                  <span class="label">High</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="title_bar">
  <img class="image image--adaptive" alt="" src="/images/plugins/weather--render.svg">
  <h1 class="title">Weather</h1>
  <span class="instance">Las Vegas</span>
</div>
```

#### Half Horizontal

 ![Weather condition](/images/plugins/weather/wi-day-sunny.svg)

77°Temperature5:55 PM

SunnyRight Now

69.5° - 86.2°L/H

High (8)UV

Light RainTomorrow

65.2° - 79.1°L/H

Moderate (5)UV

 ![Weather condition](/images/plugins/weather/wi-day-sunny.svg)

77°5:55 PM

SunnyRight Now

69.5° - 86.2°L/H

High (8)UV

Light RainTomorrow

65.2° - 79.1°L/H

Moderate (5)UV

 ![](/images/plugins/weather--render.svg)
# 5:55 PM
Las Vegas

```
<div class="layout layout--col gap--space-between">
  <div class="grid grid--cols-4 portrait:hidden">
    <div class="row row--center lg:col">
      <img class="image--adaptive w--[22cqw] h--auto portrait:w--auto portrait:h--[20cqh] lg:w--[24cqw] lg:h--[24cqw] lg:portrait:w--auto lg:portrait:h--[18cqh]" alt="Weather condition" src="/images/plugins/weather/wi-day-sunny.svg">
    </div>
    <div class="col">
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xxxlarge lg:value--giga" data-fit-value="true">77°</span>
          <span class="label">Temperature</span>
          <span class="label">5:55 PM</span>
        </div>
      </div>
    </div>
    <div class="col gap--medium">
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--base">Sunny</span>
          <span class="label">Right Now</span>
        </div>
      </div>
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--small">69.5° - 86.2°</span>
          <span class="label">L/H</span>
        </div>
      </div>
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--small">High (8)</span>
          <span class="label">UV</span>
        </div>
      </div>
    </div>
    <div class="col gap--medium">
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--base">Light Rain</span>
          <span class="label">Tomorrow</span>
        </div>
      </div>
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--small">65.2° - 79.1°</span>
          <span class="label">L/H</span>
        </div>
      </div>
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--small">Moderate (5)</span>
          <span class="label">UV</span>
        </div>
      </div>
    </div>
  </div>
  <div class="grid grid--cols-2 landscape:hidden">
    <div class="row row--center">
      <img class="image--adaptive w--[28cqw] h--[28cqw] portrait:w--auto portrait:h--[36cqh] lg:w--[38cqw] lg:h--[38cqw] lg:portrait:w--auto lg:portrait:h--[40cqh]" alt="Weather condition" src="/images/plugins/weather/wi-day-sunny.svg">
    </div>
    <div class="col">
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xxxlarge portrait:value--xxlarge lg:value--giga lg:portrait:value--xxxlarge" data-fit-value="true">77°</span>
          <span class="label">5:55 PM</span>
        </div>
      </div>
    </div>
  </div>
  <div class="divider landscape:hidden"></div>
  <div class="grid grid--cols-2 portrait:gap landscape:hidden">
    <div class="col gap--medium">
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--small lg:value--base">Sunny</span>
          <span class="label">Right Now</span>
        </div>
      </div>
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--base lg:portrait:value--small">69.5° - 86.2°</span>
          <span class="label">L/H</span>
        </div>
      </div>
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--base lg:portrait:value--small">High (8)</span>
          <span class="label">UV</span>
        </div>
      </div>
    </div>
    <div class="col gap--medium">
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--small lg:value--base">Light Rain</span>
          <span class="label">Tomorrow</span>
        </div>
      </div>
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--base lg:portrait:value--small">65.2° - 79.1°</span>
          <span class="label">L/H</span>
        </div>
      </div>
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--base lg:portrait:value--small">Moderate (5)</span>
          <span class="label">UV</span>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="title_bar">
  <img class="image image--adaptive" alt="" src="/images/plugins/weather--render.svg">
  <h1 class="title">5:55 PM</h1>
  <span class="instance">Las Vegas</span>
</div>
```

#### Half Vertical

 ![Weather condition](/images/plugins/weather/wi-day-sunny.svg)

77°Temperature5:55 PM

SunnyRight Now

69.5° - 86.2°L/H

High (8)UV

Light RainTomorrow

65.2° - 79.1°L/H

Moderate (5)UV

 ![](/images/plugins/weather--render.svg)
# 5:55 PM
Las Vegas

```
<div class="layout layout--col gap--space-between">
  <div class="grid grid--cols-2 portrait:grid--cols-1">
    <div class="row row--center">
      <img class="image--adaptive w--[46cqw] h--[46cqw] portrait:w--auto portrait:h--[22cqh] lg:w--[46cqw] lg:h--[46cqw] lg:portrait:w--auto lg:portrait:h--[32cqh]" alt="Weather condition" src="/images/plugins/weather/wi-day-sunny.svg">
    </div>
    <div class="col">
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xxlarge lg:value--giga lg:portrait:value--mega" data-fit-value="true">77°</span>
          <span class="label">Temperature</span>
          <span class="label">5:55 PM</span>
        </div>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid grid--cols-2 portrait:grid--cols-1 portrait:gap">
    <div class="col gap--medium">
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--small lg:value--base">Sunny</span>
          <span class="label">Right Now</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--small lg:portrait:value--small">69.5° - 86.2°</span>
          <span class="label">L/H</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--small lg:portrait:value--small">High (8)</span>
          <span class="label">UV</span>
        </div>
      </div>
    </div>
    <div class="divider landscape:hidden"></div>
    <div class="col gap--medium">
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--small lg:value--base">Light Rain</span>
          <span class="label">Tomorrow</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--small lg:portrait:value--small">65.2° - 79.1°</span>
          <span class="label">L/H</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--small lg:portrait:value--small">Moderate (5)</span>
          <span class="label">UV</span>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="title_bar">
  <img class="image image--adaptive" alt="" src="/images/plugins/weather--render.svg">
  <h1 class="title">5:55 PM</h1>
  <span class="instance">Las Vegas</span>
</div>
```

#### Quadrant

 ![Weather condition](/images/plugins/weather/wi-day-sunny.svg)

SunnyRight Now

77°Temperature

SunnyRight Now

69.5° - 86.2°L/H

High (8)UV

 ![](/images/plugins/weather--render.svg)
# 5:55 PM
Las Vegas

```
<div class="layout">
  <div class="grid grid--cols-2 portrait:grid--cols-1 gap--none lg:portrait:gap">
    <div class="col">
      <div class="row row--center">
        <img class="image--adaptive w--[46cqw] h--auto portrait:w--auto portrait:h--[50cqh] lg:w--[46cqw] lg:h--[46cqw] lg:portrait:w--auto lg:portrait:h--[46cqh]" alt="Weather condition" src="/images/plugins/weather/wi-day-sunny.svg">
      </div>
      <div class="hidden lg:flex lg:portrait:hidden h--full">
        <div class="item grow">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--xsmall lg:value--base">Sunny</span>
            <span class="label hidden lg:visible">Right Now</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col gap lg:portrait:grid lg:portrait:grid--cols-2">
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--large lg:value--xxxlarge" data-fit-value="true">77°</span>
          <span class="label hidden lg:visible">Temperature</span>
        </div>
      </div>
      <div class="visible lg:hidden lg:portrait:flex h--full">
        <div class="item grow">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--xsmall lg:portrait:value--base">Sunny</span>
            <span class="label hidden lg:visible">Right Now</span>
          </div>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xxsmall lg:value--small">69.5° - 86.2°</span>
          <span class="label hidden lg:visible">L/H</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xxsmall lg:value--small">High (8)</span>
          <span class="label hidden lg:visible">UV</span>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="title_bar">
  <img class="image image--adaptive" alt="" src="/images/plugins/weather--render.svg">
  <h1 class="title">5:55 PM</h1>
  <span class="instance">Las Vegas</span>
</div>
```

### Shared

This plugin uses a shared file that contains shared CSS styles and/or JavaScript logic used across all layout variations.

 Previous  [ 

 ![Lunar Calendar](/images/plugins/lunar_calendar.svg) ![Lunar Calendar](/images/plugins/lunar_calendar.svg)

## Lunar Calendar

Lunar phases and moon cycle information shown across different view sizes

 ](/framework/examples/lunar_calendar)

