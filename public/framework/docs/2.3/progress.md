# Progress

Progress bars and step dots for completion state. The fill renders as a bitmap pattern on 1-bit displays and as a solid color on 4-bit+ displays.

### Progress Bar

Progress bars display continuous progress with a filled track. They support multiple sizes and emphasis levels for different visual weights and contexts.

#### Sizes

Progress bars come in five sizes: xsmall, small, base (default), regular (default, no modifier), and large. Use the `fill` element with inline width styling to set the progress percentage. The `progress-bar--base` modifier explicitly sets the default/regular size and is useful for responsive layouts.

Xsmall Progress25%

Small Progress25%

Base Progress50%

Regular Progress50%

Large Progress75%

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ProgressBar Sizes

```
<!-- Xsmall bar -->
<div class="progress-bar progress-bar--xsmall">
  <div class="content">
    <span class="label label--small">Xsmall Progress</span>
    <span class="value value--xxsmall">25%</span>
  </div>
  <div class="track">
    <div class="fill" style="width: 25%"></div>
  </div>
</div>

<!-- Small bar -->
<div class="progress-bar progress-bar--small">
  <div class="content">
    <span class="label label--small">Small Progress</span>
    <span class="value value--xxsmall">25%</span>
  </div>
  <div class="track">
    <div class="fill" style="width: 25%"></div>
  </div>
</div>

<!-- Base bar (equivalent to default, useful for responsive) -->
<div class="progress-bar progress-bar--base">
  <div class="content">
    <span class="label">Base Progress</span>
    <span class="value value--xxsmall">50%</span>
  </div>
  <div class="track">
    <div class="fill" style="width: 50%"></div>
  </div>
</div>

<!-- Regular bar -->
<div class="progress-bar">
  <div class="content">
    <span class="label">Regular Progress</span>
    <span class="value value--xxsmall">50%</span>
  </div>
  <div class="track">
    <div class="fill" style="width: 50%"></div>
  </div>
</div>

<!-- Large bar -->
<div class="progress-bar progress-bar--large">
  <div class="content">
    <span class="label">Large Progress</span>
    <span class="value value--xxsmall">75%</span>
  </div>
  <div class="track">
    <div class="fill" style="width: 75%"></div>
  </div>
</div>
```

#### Emphasis

Progress bars support three emphasis levels: default, emphasis-2, and emphasis-3 for different visual weights.

Default Emphasis60%

Emphasis 260%

Emphasis 360%

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ProgressBar Emphasis

```
<!-- Default emphasis -->
<div class="progress-bar">
  <div class="content">
    <span class="label">Default Emphasis</span>
    <span class="value value--xxsmall">60%</span>
  </div>
  <div class="track">
    <div class="fill" style="width: 60%"></div>
  </div>
</div>

<!-- Emphasis 2 -->
<div class="progress-bar progress-bar--emphasis-2">
  <div class="content">
    <span class="label">Emphasis 2</span>
    <span class="value value--xxsmall">60%</span>
  </div>
  <div class="track">
    <div class="fill" style="width: 60%"></div>
  </div>
</div>

<!-- Emphasis 3 -->
<div class="progress-bar progress-bar--emphasis-3">
  <div class="content">
    <span class="label">Emphasis 3</span>
    <span class="value value--xxsmall">60%</span>
  </div>
  <div class="track">
    <div class="fill" style="width: 60%"></div>
  </div>
</div>
```

### Progress Dots

Progress dots display discrete steps or stages in a process. They come in five sizes and show different states: filled (completed), current (active), and empty (upcoming).

#### Sizes

Progress dots come in five sizes: xsmall, small, base (default), regular (default, no modifier), and large. Each size maintains the same dot states and functionality. The `progress-dots--base` modifier explicitly sets the default/regular size and is useful for responsive layouts.

Xsmall Progress

Small Progress

Base Progress

Regular Progress

Large Progress

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ProgressDots Sizes

```
<!-- Xsmall dots -->
<div class="progress-dots progress-dots--xsmall">
  <div class="track">
    <div class="dot dot--filled"></div>
    <div class="dot dot--filled"></div>
    <div class="dot dot--current"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>
</div>

<!-- Small dots -->
<div class="progress-dots progress-dots--small">
  <div class="track">
    <div class="dot dot--filled"></div>
    <div class="dot dot--filled"></div>
    <div class="dot dot--current"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>
</div>

<!-- Base dots (equivalent to default, useful for responsive) -->
<div class="progress-dots progress-dots--base">
  <div class="track">
    <div class="dot dot--filled"></div>
    <div class="dot dot--filled"></div>
    <div class="dot dot--current"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>
</div>

<!-- Regular dots -->
<div class="progress-dots">
  <div class="track">
    <div class="dot dot--filled"></div>
    <div class="dot dot--filled"></div>
    <div class="dot dot--current"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>
</div>

<!-- Large dots -->
<div class="progress-dots progress-dots--large">
  <div class="track">
    <div class="dot dot--filled"></div>
    <div class="dot dot--filled"></div>
    <div class="dot dot--current"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>
</div>
```

 Previous  [ 

## Chart

Visualize data with charts that adapt to the device and theme

 ](/framework/docs/2.3/chart)

