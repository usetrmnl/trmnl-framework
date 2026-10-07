 ![Stock Price](/images/plugins/stock_price.svg) ![Stock Price](/images/plugins/stock_price.svg)

# Stock Price

### Layout Variations

See how this plugin adapts across different mashup views. Each view shows a single instance to demonstrate how the layout responds to available space.

#### Full View

AAPLApple Inc.

+0.62%Daily Change

$226.40

MSFTMicrosoft Corporation

+1.23%Daily Change

$420.15

NVDANVIDIA Corporation

-2.87%Daily Change

$128.50

 ![Stock Prices](/images/plugins/stock_price--render.svg)Stock PricesStonks Demo (% Change)

```
<div class="layout layout--col gap--space-between">
  <div class="grid">
    <div class="col--span-2">
      <div class="grid grid--cols-1">
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--small lg:value--large" data-fit-value="true">AAPL</span>
            <span class="label">Apple Inc.</span>
          </div>
        </div>
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--small lg:value--large value--tnums" data-fit-value="true">+0.62%</span>
            <span class="label">Daily Change</span>
          </div>
        </div>
      </div>
    </div>
    <div class="item col--span-4">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xxlarge value--tnums" data-fit-value="true">$226.40</span>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid">
    <div class="col--span-2">
      <div class="grid grid--cols-1">
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--small lg:value--large" data-fit-value="true">MSFT</span>
            <span class="label">Microsoft Corporation</span>
          </div>
        </div>
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--small lg:value--large value--tnums" data-fit-value="true">+1.23%</span>
            <span class="label">Daily Change</span>
          </div>
        </div>
      </div>
    </div>
    <div class="item col--span-4">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xxlarge value--tnums" data-fit-value="true">$420.15</span>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid">
    <div class="col--span-2">
      <div class="grid grid--cols-1">
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--small lg:value--large" data-fit-value="true">NVDA</span>
            <span class="label">NVIDIA Corporation</span>
          </div>
        </div>
        <div class="item">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--small lg:value--large value--tnums" data-fit-value="true">-2.87%</span>
            <span class="label">Daily Change</span>
          </div>
        </div>
      </div>
    </div>
    <div class="item col--span-4">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xxlarge value--tnums" data-fit-value="true">$128.50</span>
      </div>
    </div>
  </div>
</div>
<div class="title_bar">
  <img class="image image--adaptive" alt="Stock Prices" src="/images/plugins/stock_price--render.svg">
  <span class="title">Stock Prices</span>
  <span class="instance">Stonks Demo (% Change)</span>
</div>
```

#### Half Horizontal

AAPL+0.62%

$226.40

MSFT+1.23%

$420.15

NVDA-2.87%

$128.50

 ![Stock Prices](/images/plugins/stock_price--render.svg)Stock PricesStonks Demo (% Change)

```
<div class="layout gap--space-between">
  <div class="columns h-full">
    <div class="column gap--space-between h-full">
      <div class="grid">
        <div class="item col--span-3">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--small lg:value--base" data-fit-value="true">AAPL</span>
            <span class="label">+0.62%</span>
          </div>
        </div>
        <div class="item col--span-6">
          <div class="meta"></div>
          <div class="content">
            <span class="value lg:value--large value--tnums" data-fit-value="true">$226.40</span>
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="grid">
        <div class="item col--span-3">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--small lg:value--base" data-fit-value="true">MSFT</span>
            <span class="label">+1.23%</span>
          </div>
        </div>
        <div class="item col--span-6">
          <div class="meta"></div>
          <div class="content">
            <span class="value lg:value--large value--tnums" data-fit-value="true">$420.15</span>
          </div>
        </div>
      </div>
    </div>
    <div class="column gap--space-between h-full">
      <div class="grid">
        <div class="item col--span-3">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--small lg:value--base" data-fit-value="true">NVDA</span>
            <span class="label">-2.87%</span>
          </div>
        </div>
        <div class="item col--span-6">
          <div class="meta"></div>
          <div class="content">
            <span class="value lg:value--large value--tnums" data-fit-value="true">$128.50</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="title_bar">
  <img class="image image--adaptive" alt="Stock Prices" src="/images/plugins/stock_price--render.svg">
  <span class="title">Stock Prices</span>
  <span class="instance">Stonks Demo (% Change)</span>
</div>
```

#### Half Vertical

AAPLApple Inc.

+0.62%Daily Change

$226.40

MSFTMicrosoft Corporation

+1.23%Daily Change

$420.15

NVDANVIDIA Corporation

-2.87%Daily Change

$128.50

 ![Stock Prices](/images/plugins/stock_price--render.svg)Stock PricesStonks Demo (% Change)

```
<div class="layout layout--col gap--space-between">
  <div class="grid grid--cols-1">
    <div class="grid grid--cols-2">
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--base" data-fit-value="true">AAPL</span>
          <span class="label">Apple Inc.</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--base value--tnums" data-fit-value="true">+0.62%</span>
          <span class="label">Daily Change</span>
        </div>
      </div>
    </div>
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--large lg:value--xlarge value--tnums" data-fit-value="true">$226.40</span>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid grid--cols-1">
    <div class="grid grid--cols-2">
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--base" data-fit-value="true">MSFT</span>
          <span class="label">Microsoft Corporation</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--base value--tnums" data-fit-value="true">+1.23%</span>
          <span class="label">Daily Change</span>
        </div>
      </div>
    </div>
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--large lg:value--xlarge value--tnums" data-fit-value="true">$420.15</span>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid grid--cols-1">
    <div class="grid grid--cols-2">
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--base" data-fit-value="true">NVDA</span>
          <span class="label">NVIDIA Corporation</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--base value--tnums" data-fit-value="true">-2.87%</span>
          <span class="label">Daily Change</span>
        </div>
      </div>
    </div>
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--large lg:value--xlarge value--tnums" data-fit-value="true">$128.50</span>
      </div>
    </div>
  </div>
</div>
<div class="title_bar">
  <img class="image image--adaptive" alt="Stock Prices" src="/images/plugins/stock_price--render.svg">
  <span class="title">Stock Prices</span>
  <span class="instance">Stonks Demo (% Change)</span>
</div>
```

#### Quadrant

AAPL+0.62%

$226.40

MSFT+1.23%

$420.15

NVDA-2.87%

$128.50

 ![Stock Prices](/images/plugins/stock_price--render.svg)Stock PricesStonks Demo (% Change)

```
<div class="layout layout--col gap--space-between">
  <div class="grid">
    <div class="item col--span-3">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base value--tnums" data-fit-value="true">AAPL</span>
        <span class="label">+0.62%</span>
      </div>
    </div>
    <div class="item col--span-6">
      <div class="meta"></div>
      <div class="content">
        <span class="value lg:value--large value--tnums" data-fit-value="true">$226.40</span>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid">
    <div class="item col--span-3">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base value--tnums" data-fit-value="true">MSFT</span>
        <span class="label">+1.23%</span>
      </div>
    </div>
    <div class="item col--span-6">
      <div class="meta"></div>
      <div class="content">
        <span class="value lg:value--large value--tnums" data-fit-value="true">$420.15</span>
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid">
    <div class="item col--span-3">
      <div class="meta"></div>
      <div class="content">
        <span class="value value--xsmall lg:value--base value--tnums" data-fit-value="true">NVDA</span>
        <span class="label">-2.87%</span>
      </div>
    </div>
    <div class="item col--span-6">
      <div class="meta"></div>
      <div class="content">
        <span class="value lg:value--large value--tnums" data-fit-value="true">$128.50</span>
      </div>
    </div>
  </div>
</div>
<div class="title_bar">
  <img class="image image--adaptive" alt="Stock Prices" src="/images/plugins/stock_price--render.svg">
  <span class="title">Stock Prices</span>
  <span class="instance">Stonks Demo (% Change)</span>
</div>
```

 Previous  [ 

 ![Wikipedia Articles](/images/plugins/wikipedia.svg) ![Wikipedia Articles](/images/plugins/wikipedia.svg)

## Wiki Random Article

Random Wikipedia articles displayed in various layout configurations

 ](/framework/examples/wiki_random_article)

 Next  [ 

 ![Reddit](/images/plugins/reddit.svg) ![Reddit](/images/plugins/reddit.svg)

## Reddit

Top posts from favorite subreddits displayed across various layout sizes

 ](/framework/examples/reddit)

