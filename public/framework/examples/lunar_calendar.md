 ![Lunar Calendar](/images/plugins/lunar_calendar.svg) ![Lunar Calendar](/images/plugins/lunar_calendar.svg)

# Lunar Calendar

### Layout Variations

See how this plugin adapts across different mashup views. Each view shows a single instance to demonstrate how the layout responds to available space.

#### Full View

This layout utilizes the full screen space to display comprehensive lunar information. The current phase is prominently featured at the top in a large format, with key metrics (illumination percentage and moon age) displayed alongside. In the middle of the layout there is a complete phase sequence visualization showing all upcoming phases with dates, icons, and names. Larger icon sizes (90px) provide clear visual hierarchy. The bottom section shows the next phase details and upcoming full and new moon dates.

Full MoonCurrent Phase

99.8%Moon Illumination

15.0Lunar Age

Jan 7

Jan 10

Jan 12

Jan 13

Jan 15

Jan 20

Jan 24

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waxing-crescent-3.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-first-quarter.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waxing-gibbous-3.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-full.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waning-gibbous-3.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-third-quarter.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waning-crescent-3.svg)

 Waxing Crescent 

 First Quarter 

 Waxing Gibbous 

 Full Moon 

 Waning Gibbous 

 Third Quarter 

 Waning Crescent 

Waning GibbousNext Phase (January 15)

February 11Next Full Moon

January 28Next New Moon

 ![](/images/plugins/lunar_calendar--render.svg)Lunar CalendarMoon Phases

```
<div class="layout layout--col gap--space-between">
  <div class="grid portrait:grid--cols-8 portrait:gap--xlarge">
    <div class="item col--span-4 portrait:col--span-8">
      <div class="meta"></div>
      <div class="content">
        <span class="value lg:value--xlarge" data-value-fit="true" data-value-fit-max-height="140px">Full Moon</span>
        <span class="label">Current Phase</span>
      </div>
    </div>
    <div class="item col--span-2 portrait:col--span-4">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base">99.8%</span>
        <span class="label">Moon Illumination</span>
      </div>
    </div>
    <div class="item col--span-2 portrait:col--span-4">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base">15.0</span>
        <span class="label">Lunar Age</span>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="flex flex--col w--full gap--large rounded--large">
    <div class="grid grid--row grid--top">
      <div class="flex flex--row flex--center">
        <span class="label label--small ">Jan 7</span>
      </div>
      <div class="flex flex--row flex--center">
        <span class="label label--small ">Jan 10</span>
      </div>
      <div class="flex flex--row flex--center">
        <span class="label label--small ">Jan 12</span>
      </div>
      <div class="flex flex--row flex--center">
        <span class="label label--small label--inverted">Jan 13</span>
      </div>
      <div class="flex flex--row flex--center">
        <span class="label label--small ">Jan 15</span>
      </div>
      <div class="flex flex--row flex--center">
        <span class="label label--small ">Jan 20</span>
      </div>
      <div class="flex flex--row flex--center">
        <span class="label label--small ">Jan 24</span>
      </div>
    </div>
    <div class="grid grid--row grid--center">
      <div class="flex flex--row flex--center">
        <img class="image w--min-[12cqw] h--min-[12cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waxing-crescent-3.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[12cqw] h--min-[12cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-first-quarter.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[12cqw] h--min-[12cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waxing-gibbous-3.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[14cqw] h--min-[14cqw] lg:w--min-[16cqw] lg:h--min-[16cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-full.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[12cqw] h--min-[12cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waning-gibbous-3.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[12cqw] h--min-[12cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-third-quarter.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[12cqw] h--min-[12cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waning-crescent-3.svg">
      </div>
    </div>
    <div class="grid grid--row grid--top">
      <div class="flex flex--row flex--center">
        <span class="label label--small text--center ">Waxing Crescent</span>
      </div>
      <div class="flex flex--row flex--center">
        <span class="label label--small text--center ">First Quarter</span>
      </div>
      <div class="flex flex--row flex--center">
        <span class="label label--small text--center ">Waxing Gibbous</span>
      </div>
      <div class="flex flex--row flex--center">
        <span class="label label--small text--center label--inverted">Full Moon</span>
      </div>
      <div class="flex flex--row flex--center">
        <span class="label label--small text--center ">Waning Gibbous</span>
      </div>
      <div class="flex flex--row flex--center">
        <span class="label label--small text--center ">Third Quarter</span>
      </div>
      <div class="flex flex--row flex--center">
        <span class="label label--small text--center ">Waning Crescent</span>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid portrait:grid--cols-8 portrait:gap--xlarge">
    <div class="item col--span-4 portrait:col--span-8">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base">Waning Gibbous</span>
        <span class="label">Next Phase (January 15)</span>
      </div>
    </div>
    <div class="item col--span-2 portrait:col--span-4">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base">February 11</span>
        <span class="label">Next Full Moon</span>
      </div>
    </div>
    <div class="item col--span-2 portrait:col--span-4">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base">January 28</span>
        <span class="label">Next New Moon</span>
      </div>
    </div>
  </div>
</div>
<div class="title_bar">
  <img class="image image--adaptive" alt="" src="/images/plugins/lunar_calendar--render.svg">
  <span class="title">Lunar Calendar</span>
  <span class="instance">Moon Phases</span>
</div>
```

#### Half Horizontal

This layout splits the screen horizontally into two equal columns. The left column contains key metrics and dates arranged in compact grids, while the right column features the phase sequence visualization. This arrangement prioritizes the visual phase sequence while maintaining access to essential data points. The two-column approach maximizes horizontal space usage.

Full MoonCurrent Phase

Waning GibbousNext (January 15)

99.8%Moon Illumination

15.0Lunar Age

February 11Next Full Moon

January 28Next New Moon

Jan 7

Jan 13

Jan 24

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waxing-crescent-3.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-first-quarter.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waxing-gibbous-3.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-full.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waning-gibbous-3.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-third-quarter.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waning-crescent-3.svg)

Waxing Crescent

Full Moon

Waning Crescent

 ![](/images/plugins/lunar_calendar--render.svg)Lunar CalendarMoon Phases

```
<div class="layout">
  <div class="grid h--full">
    <div class="col col--span-6 h--full gap--space-between">
      <div class="grid grid--cols-2">
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--xsmall lg:value--base" data-value-fit="true">Full Moon</span>
            <span class="label">Current Phase</span>
          </div>
        </div>
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--xsmall lg:value--base">Waning Gibbous</span>
            <span class="label">Next (January 15)</span>
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="grid grid--cols-2">
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--xsmall lg:value--base">99.8%</span>
            <span class="label">Moon Illumination</span>
          </div>
        </div>
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--xsmall lg:value--base">15.0</span>
            <span class="label">Lunar Age</span>
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="grid grid--cols-2">
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--xsmall lg:value--base">February 11</span>
            <span class="label">Next Full Moon</span>
          </div>
        </div>
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--xsmall lg:value--base">January 28</span>
            <span class="label">Next New Moon</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col col--span-6 col--center h--full py--4">
      <div class="flex flex--col gap--distribute w--full h--full">
        <div class="grid grid--row grid--center">
          <div class="flex flex--row flex--left">
            <span class="label label--small">Jan 7</span>
          </div>
          <div class="flex flex--row flex--center">
            <span class="label label--small label--inverted">Jan 13</span>
          </div>
          <div class="flex flex--row flex--right">
            <span class="label label--small">Jan 24</span>
          </div>
        </div>
        <div class="grid grid--row grid--center">
          <div class="flex flex--row flex--center">
            <img class="image w--min-[9cqw] h--min-[9cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waxing-crescent-3.svg">
          </div>
          <div class="flex flex--row flex--center">
            <img class="image w--min-[9cqw] h--min-[9cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-first-quarter.svg">
          </div>
          <div class="flex flex--row flex--center">
            <img class="image w--min-[9cqw] h--min-[9cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waxing-gibbous-3.svg">
          </div>
          <div class="flex flex--row flex--center">
            <img class="image w--min-[13cqw] h--min-[13cqw] lg:w--min-[19cqw] lg:h--min-[19cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-full.svg">
          </div>
          <div class="flex flex--row flex--center">
            <img class="image w--min-[9cqw] h--min-[9cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waning-gibbous-3.svg">
          </div>
          <div class="flex flex--row flex--center">
            <img class="image w--min-[9cqw] h--min-[9cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-third-quarter.svg">
          </div>
          <div class="flex flex--row flex--center">
            <img class="image w--min-[9cqw] h--min-[9cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waning-crescent-3.svg">
          </div>
        </div>
        <div class="grid grid--row grid--center">
          <div class="flex flex--row flex--left">
            <span class="label label--small">Waxing Crescent</span>
          </div>
          <div class="flex flex--row flex--center">
            <span class="label label--small label--inverted">Full Moon</span>
          </div>
          <div class="flex flex--row flex--right">
            <span class="label label--small">Waning Crescent</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="title_bar">
  <img class="image image--adaptive" alt="" src="/images/plugins/lunar_calendar--render.svg">
  <span class="title">Lunar Calendar</span>
  <span class="instance">Moon Phases</span>
</div>
```

#### Half Vertical

This layout uses vertical stacking optimized for narrow vertical space. Key information (current/next phase) is shown at the top in a two-column grid. The phase sequence is displayed in the center with dates, icons, and names, with first, current, and last phases emphasized. Essential metrics (age, illumination) and upcoming dates are shown at the bottom.

Full MoonCurrent Phase

Waning GibbousNext (January 15)

Jan 7

Jan 13

Jan 24

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waxing-crescent-3.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-first-quarter.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waxing-gibbous-3.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-full.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waning-gibbous-3.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-third-quarter.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waning-crescent-3.svg)

Waxing Crescent

Full Moon

Waning Crescent

15.0Lunar Age

99.8%Moon Illumination

February 11Next Full Moon

January 28Next New Moon

 ![](/images/plugins/lunar_calendar--render.svg)Lunar CalendarMoon Phases

```
<div class="layout layout--col gap--space-between">
  <div class="grid grid--cols-2 lg:grid--cols-1 gap--none lg:gap--xlarge">
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--large" data-value-fit="true">Full Moon</span>
        <span class="label">Current Phase</span>
      </div>
    </div>
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base">Waning Gibbous</span>
        <span class="label">Next (January 15)</span>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="flex flex--col gap--xxlarge w--full">
    <div class="grid grid--row grid--center">
      <div class="flex flex--row flex--left">
        <span class="label label--small">Jan 7</span>
      </div>
      <div class="flex flex--row flex--center">
        <span class="label label--small label--inverted">Jan 13</span>
      </div>
      <div class="flex flex--row flex--right">
        <span class="label label--small">Jan 24</span>
      </div>
    </div>
    <div class="grid grid--row grid--center">
      <div class="flex flex--row flex--center">
        <img class="image w--min-[12cqw] h--min-[12cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waxing-crescent-3.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[12cqw] h--min-[12cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-first-quarter.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[12cqw] h--min-[12cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waxing-gibbous-3.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[17cqw] h--min-[17cqw] lg:w--min-[19cqw] lg:h--min-[19cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-full.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[12cqw] h--min-[12cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waning-gibbous-3.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[12cqw] h--min-[12cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-third-quarter.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[12cqw] h--min-[12cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waning-crescent-3.svg">
      </div>
    </div>
    <div class="grid grid--row grid--center">
      <div class="flex flex--row flex--left">
        <span class="label label--small">Waxing Crescent</span>
      </div>
      <div class="flex flex--row flex--center">
        <span class="label label--small label--inverted">Full Moon</span>
      </div>
      <div class="flex flex--row flex--right">
        <span class="label label--small">Waning Crescent</span>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid grid--cols-2">
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base">15.0</span>
        <span class="label">Lunar Age</span>
      </div>
    </div>
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base">99.8%</span>
        <span class="label">Moon Illumination</span>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid grid--cols-2 portrait:grid--cols-1 portrait:gap--xlarge">
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base">February 11</span>
        <span class="label">Next Full Moon</span>
      </div>
    </div>
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base">January 28</span>
        <span class="label">Next New Moon</span>
      </div>
    </div>
  </div>
</div>
<div class="title_bar">
  <img class="image image--adaptive" alt="" src="/images/plugins/lunar_calendar--render.svg">
  <span class="title">Lunar Calendar</span>
  <span class="instance">Moon Phases</span>
</div>
```

#### Quadrant

This layout uses minimal space (one-quarter of the screen) with highly condensed content. The top shows current and next phase in a compact two-column format. The center features a simplified phase sequence visualization with icons only. Essential upcoming dates (full moon, new moon) are shown at the bottom. All elements use smaller sizes (35px icons) to fit the constrained space.

Full MoonCurrent Phase

Waning GibbousNext (January 15)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waxing-crescent-3.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-first-quarter.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waxing-gibbous-3.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-full.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waning-gibbous-3.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-third-quarter.svg)

 ![Moon phase](/images/plugins/lunar_calendar/wi-moon-alt-waning-crescent-3.svg)

February 11Next Full Moon

January 28Next New Moon

 ![](/images/plugins/lunar_calendar--render.svg)Lunar CalendarMoon Phases

```
<div class="layout layout--col gap--space-between">
  <div class="grid grid--cols-2">
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base" data-value-fit="true">Full Moon</span>
        <span class="label">Current Phase</span>
      </div>
    </div>
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base">Waning Gibbous</span>
        <span class="label">Next (January 15)</span>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="w--full">
    <div class="grid grid--row grid--center">
      <div class="flex flex--row flex--center">
        <img class="image w--min-[9cqw] h--min-[9cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waxing-crescent-3.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[9cqw] h--min-[9cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-first-quarter.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[9cqw] h--min-[9cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waxing-gibbous-3.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[13cqw] h--min-[13cqw] lg:w--min-[19cqw] lg:h--min-[19cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-full.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[9cqw] h--min-[9cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waning-gibbous-3.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[9cqw] h--min-[9cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-third-quarter.svg">
      </div>
      <div class="flex flex--row flex--center">
        <img class="image w--min-[9cqw] h--min-[9cqw] lg:w--min-[14cqw] lg:h--min-[14cqw]" alt="Moon phase" src="/images/plugins/lunar_calendar/wi-moon-alt-waning-crescent-3.svg">
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid grid--cols-2">
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base">February 11</span>
        <span class="label">Next Full Moon</span>
      </div>
    </div>
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base">January 28</span>
        <span class="label">Next New Moon</span>
      </div>
    </div>
  </div>
</div>
<div class="title_bar">
  <img class="image image--adaptive" alt="" src="/images/plugins/lunar_calendar--render.svg">
  <span class="title">Lunar Calendar</span>
  <span class="instance">Moon Phases</span>
</div>
```

 Previous  [ 

 ![Todo List](/images/plugins/todo_list.svg) ![Todo List](/images/plugins/todo_list.svg)

## Todo List

Task management interface shown in different layout configurations

 ](/framework/examples/todo_list)

 Next  [ 

 ![Weather](/images/plugins/weather.svg) ![Weather](/images/plugins/weather.svg)

## Weather (WeatherAPI)

Weather conditions and forecasts via WeatherAPI displayed across different layout sizes

 ](/framework/examples/weather?variant=weatherapi)

