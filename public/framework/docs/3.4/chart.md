# Chart

Plugins can draw charts with any JavaScript charting library. The TRMNLCharts helper supplies the framework's colors, so a chart adapts to the device and themes like the rest of the screen.

### Usage

Any JavaScript library you can load from a CDN can draw charts. The examples below use [Highcharts](https://highcharts.com) and [Chartkick](https://chartkick.com).

Use the `TRMNLCharts` helper for your chart colors. It is bundled in the plugin runtime and reads the right paint from the screen as the chart builds, so a chart follows the device and the active theme like the rest of the screen. The methods below are the ones these examples use; [Painting Charts](/framework/docs/3.4/paint_charts) carries the full list.

- `series(i, n, { el })`: the fill for series _i_ of _n_, correct for the current device, mode, and theme. 
- `applySwatches({ el })`: paints legend markers tagged `data-chart-series="i"` with matching series colors. Add `data-chart-series-count="n"` when the series total differs from the number of marks on screen. 
- `textStyle(role, { el })`: resolves a framework typography role for SVG text. 
- `options({ el })` and `merge()`: the recommended adaptive Highcharts defaults, merged under your overrides. 
- `watch(el, buildFn)`: rebuilds the chart when device, scale, mode, dark mode or theme changes. 
- `paint(token, { el })`: one framework color, as a flat color on solid panels or a dither pattern on 1- and 2-bit screens. 
- `grid({ el, dir })` and `axisLine({ el })`: the grid-line and axis and tick options that `options()` already applies, for an axis you build by hand. 

`{ el }` is the chart container id or element. Omit it on a single-screen plugin.

`TRMNLCharts` is the Highcharts adapter built on `TRMNLPaint`, the framework's public JS paint API. Grid lines and plotted text use the same border and typography systems as the rest of the screen. For anything beyond Highcharts, use TRMNLPaint directly: see [Paint API](/framework/docs/3.4/paint_api) .

On screens that dither, series paints are patterns that Highcharts draws through its pattern-fill module; load `pattern-fill.js` next to `highcharts.js` as the examples do.

Maps follow the same pattern: `TRMNLMaps` composes MapLibre GL JS styles from framework paint over OpenStreetMap vector tiles. See [Map](/framework/docs/3.4/map) .

Highcharts takes sizes as plain numbers, so they do not follow the device scale on their own. Pass heights, spacing, line widths, and label offsets through `TRMNLPaint.px()` inside `TRMNLCharts.watch()`. The watcher rebuilds the chart after a scale change, and the paint API supplies the new numbers.

Set `height: null` in the chart options and the chart expands to fill the available space.

Disable animations, or TRMNL's screenshot service may capture the chart only partially drawn.

These examples load Highcharts and Chartkick from trmnl.com, so they render empty without network. Highcharts is a commercial library that TRMNL licenses, and a custom stack brings its own charting library and license.

#### Line Chart

A line chart tracks a value over time.

25,388Pageviews

4,771Visitors

2.23Mins on Page

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ChartsLine Chart

```
<!-- import Highcharts + Chartkick libraries -->
<script src="https://trmnl.com/js/highcharts/12.3.0/highcharts.js"></script>
<script src="https://trmnl.com/js/chartkick/5.0.1/chartkick.min.js"></script>

<!-- markup with empty, ID'd element for chart injection -->
<div class="view view--full">
  <div class="layout layout--col gap--space-between">
    <div class="grid grid--cols-3">
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--tnums">25,388</span>
          <span class="label">Pageviews</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--tnums">4,771</span>
          <span class="label">Visitors</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--tnums">2.23</span>
          <span class="label">Mins on Page</span>
        </div>
      </div>
    </div>

    <div id="chart-123" class="w--full"></div>
  </div>

  <div class="title_bar">
    <img class="image" src="/images/plugins/simple-analytics--render.svg" alt="Simple Analytics Logo">
    <span class="title">Simple Analytics</span>
    <span class="instance">trmnl.com</span>
  </div>
</div>

<script type="text/javascript">
  var data = [["2024-06-09", 975],["2024-06-10", 840],["2024-06-11", 1004],["2024-06-12", 1308],["2024-06-13", 753],["2024-06-14", 600],["2024-06-15", 710],
              ["2024-06-16", 489],["2024-06-17", 510],["2024-06-18", 590],["2024-06-19", 610],["2024-06-20", 671],["2024-06-21", 512],["2024-06-22", 550],
              ["2024-06-23", 421],["2024-06-24", 315],["2024-06-25", 604],["2024-06-26", 672],["2024-06-27", 601],["2024-06-28", 705],["2024-06-29", 800],
              ["2024-06-30", 912],["2024-07-01", 1503],["2024-07-02", 1273],["2024-07-03", 1250],["2024-07-04", 1198],["2024-07-05", 1005],["2024-07-06", 1300],
              ["2024-07-07", 1103],["2024-07-08", 1004],["2024-07-09", 600]];

  // Wait for Chartkick and the framework TRMNLCharts helper (bundled in the
  // plugin runtime), then read adaptive paint from the live screen.
  function whenReady(cb) {
    var tries = 0;
    (function attempt() {
      if (window.TRMNLCharts && window.Chartkick) return cb();
      if (++tries > 200) return;
      setTimeout(attempt, 50);
    })();
  }

  whenReady(function () {
    var el = "chart-123";
    // watch() rebuilds on device/scale/mode/dark/theme change; series() picks the paint
    // for each plotted line.
    TRMNLCharts.watch(el, function () {
      var px = function (value) { return TRMNLPaint.px(value, { el: el }); };
      var linePaint = TRMNLCharts.series(0, 1, { el: el });
      return new Chartkick.LineChart(el, data, {
        adapter: "highcharts", // chartjs, google, etc available
        prefix: "",
        thousands: ",",
        points: false,
        colors: [linePaint],
        curve: true,
        // options() supplies the adaptive grid + label paint; layer the
        // chart-specific overrides on top with merge().
        library: TRMNLCharts.merge(TRMNLCharts.options({ el: el }), {
          chart: { height: px(260) },
          plotOptions: { series: { lineWidth: px(4) } },
          yAxis: {
            gridLineDashStyle: "shortdot",
            tickAmount: 5
          },
          xAxis: {
            type: "daytime",
            lineWidth: 0,
            gridLineDashStyle: "dot",
            tickWidth: 1,
            tickLength: 0,
            tickPixelInterval: px(120)
          }
        })
      });
    });
  });
</script>
```

#### Multi-Series Line Chart

A multi-series chart compares several lines in one plot. This example plots the current period against the previous one.

$85,240Total Sales

32Pending Orders

 

 Jul 01 - Jul 15 Current

$128AOV

665Fulfilled Orders

 

 Jun 15 - Jun 30 Previous

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ChartsMulti-Series Line Chart

```
<!-- import required libraries -->
<script src="https://trmnl.com/js/highcharts/12.3.0/highcharts.js"></script>
<script src="https://trmnl.com/js/highcharts/12.3.0/highcharts-more.js"></script>
<script src="https://trmnl.com/js/highcharts/12.3.0/pattern-fill.js"></script>

<div class="view view--full">
  <div class="layout layout--col gap--space-between">
    <!-- Optional data metrics displayed above chart -->
    <div class="grid">
      <div class="row">
        <div class="grid">
          <div class="item col--span-2">
            <div class="meta"></div>
            <div class="content">
              <span class="value value--large value--tnums">$85,240</span>
              <span class="label">Total Sales</span>
            </div>
          </div>

          <div class="item col--span-1">
            <div class="meta"></div>
            <div class="content">
              <span class="value value--small value--tnums">32</span>
              <span class="label">Pending Orders</span>
            </div>
          </div>

          <div class="item col--span-1">
            <div class="meta"></div>
            <div class="content">
              <span class="value value--xsmall value--tnums">
                <div class="w--14 h--1.5 mb--2 rounded--full" data-chart-series="0" data-chart-series-count="2"></div>
                Jul 01 - Jul 15
              </span>
              <span class="label">Current</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="border--h-5 w--full"></div>

    <!-- More metrics if needed -->
    <div class="grid">
      <div class="row">
        <div class="grid">
          <div class="item col--span-2">
            <div class="meta"></div>
            <div class="content">
              <span class="value value--tnums">$128</span>
              <span class="label">AOV</span>
            </div>
          </div>

          <div class="item col--span-1">
            <div class="meta"></div>
            <div class="content">
              <span class="value value--small value--tnums">665</span>
              <span class="label">Fulfilled Orders</span>
            </div>
          </div>

          <div class="item col--span-1">
            <div class="meta"></div>
            <div class="content">
              <span class="value value--xsmall value--tnums">
                <div class="w--14 h--1.5 mb--2" data-chart-series="1" data-chart-series-count="2"></div>
                Jun 15 - Jun 30
              </span>
              <span class="label">Previous</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart container with unique ID -->
    <div id="multi-series-chart" class="w--full"></div>

    <script type="text/javascript">
      // Using same date range for both series to ensure proper overlap
      var currentPeriod = [
        ["2024-07-01", 3500], ["2024-07-02", 4200], ["2024-07-03", 3800],
        ["2024-07-04", 5100], ["2024-07-05", 4800], ["2024-07-06", 3600],
        ["2024-07-07", 2900], ["2024-07-08", 4300], ["2024-07-09", 5200],
        ["2024-07-10", 6100], ["2024-07-11", 5700], ["2024-07-12", 4900],
        ["2024-07-13", 5300], ["2024-07-14", 5800], ["2024-07-15", 6500]
      ];

      // Using same date range but different values for comparison
      var previousPeriod = [
        ["2024-07-01", 2800], ["2024-07-02", 3100], ["2024-07-03", 3400],
        ["2024-07-04", 3900], ["2024-07-05", 4500], ["2024-07-06", 4100],
        ["2024-07-07", 3700], ["2024-07-08", 3300], ["2024-07-09", 4200],
        ["2024-07-10", 4800], ["2024-07-11", 5100], ["2024-07-12", 4700],
        ["2024-07-13", 5400], ["2024-07-14", 5800], ["2024-07-15", 5600]
      ];

      var formattedData = [
        { name: "Current", data: currentPeriod },
        { name: "Previous", data: previousPeriod }
      ];

      // Wait for Highcharts and the framework TRMNLCharts helper (bundled in the
      // plugin runtime) before building the chart.
      function whenReady(cb) {
        var tries = 0;
        (function attempt() {
          if (window.TRMNLCharts && window.Highcharts) return cb();
          if (++tries > 200) return;
          setTimeout(attempt, 50);
        })();
      }

      whenReady(function () {
        var el = "multi-series-chart";
        // watch() rebuilds when the screen device/scale/mode/dark/theme changes, re-reading
        // the current paint each time.
        TRMNLCharts.watch(el, function () {
          var px = function (value) { return TRMNLPaint.px(value, { el: el }); };
          // series(i, 2) picks the paint for each line (ink for the first, a
          // legible step toward the background for the second), and
          // applySwatches() paints the matching legend markers.
          var chart = Highcharts.chart(el, TRMNLCharts.merge(TRMNLCharts.options({ el: el }), {
            chart: { type: "spline", height: px(203), spacing: px([10, 10, 5, 10]) },
            series: [{
              data: formattedData[0].data,
              name: formattedData[0].name,
              lineWidth: px(4),
              color: TRMNLCharts.series(0, 2, { el: el }),
              zIndex: 2
            }, {
              data: formattedData[1].data,
              name: formattedData[1].name,
              lineWidth: px(5),
              color: TRMNLCharts.series(1, 2, { el: el }),
              zIndex: 1
            }],
            yAxis: {
              gridLineDashStyle: "shortdot",
              tickAmount: 5
            },
            xAxis: {
              type: "datetime",
              labels: { padding: px(5), y: px(25) },
              lineWidth: 0,
              gridLineDashStyle: "dot",
              tickWidth: 1,
              tickLength: 0,
              tickPixelInterval: px(120)
            }
          }));
          TRMNLCharts.applySwatches({ el: el });
          return chart;
        });
      });
    </script>
  </div>

  <div class="title_bar">
    <img class="image image--adaptive" src="/images/plugins/trmnl--render.svg">
    <span class="title">Charts</span>
    <span class="instance">Multi-Series Line Chart</span>
  </div>
</div>
```

#### Bar Chart

Bar charts compare discrete categories side by side. This example plots four metrics across six months.

$31,883Revenue

$22,910Expenses

$8,990Marketing

$14,930Operations

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ChartsBar Chart

```
<!-- import Highcharts library -->
<script src="https://trmnl.com/js/highcharts/12.3.0/highcharts.js"></script>
<script src="https://trmnl.com/js/highcharts/12.3.0/pattern-fill.js"></script>

<div class="view view--full">
  <div class="layout layout--col gap--space-between">
    <!-- Business metrics displayed above chart -->
    <div class="grid grid--cols-4">
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <div class="w--14 h--1.5 mb--2 rounded--full" data-chart-series="0" data-chart-series-count="4"></div>
          <span class="value value--tnums">$31,883</span>
          <span class="label">Revenue</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <div class="w--14 h--1.5 mb--2" data-chart-series="1" data-chart-series-count="4"></div>
          <span class="value value--tnums">$22,910</span>
          <span class="label">Expenses</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <div class="w--14 h--1.5 mb--2" data-chart-series="2" data-chart-series-count="4"></div>
          <span class="value value--tnums">$8,990</span>
          <span class="label">Marketing</span>
        </div>
      </div>
      <div class="item">
        <div class="meta"></div>
        <div class="content">
          <div class="w--14 h--1.5 mb--2" data-chart-series="3" data-chart-series-count="4"></div>
          <span class="value value--tnums">$14,930</span>
          <span class="label">Operations</span>
        </div>
      </div>
    </div>

    <div class="border--h-5 w--full"></div>

    <!-- Chart container with unique ID -->
    <div id="example-bar-chart" class="w--full"></div>

    <script type="text/javascript">
      // Simplified regional data across four quarters
      var revenueData = [
        ["Jan", 5883],
        ["Feb", 5260],
        ["Mar", 4760],
        ["Apr", 5120],
        ["May", 5540],
        ["Jun", 6320]
      ];

      var expensesData = [
        ["Jan", 3580],
        ["Feb", 3210],
        ["Mar", 3620],
        ["Apr", 3950],
        ["May", 4120],
        ["Jun", 4430]
      ];

      var marketingData = [
        ["Jan", 1120],
        ["Feb", 980],
        ["Mar", 1320],
        ["Apr", 1650],
        ["May", 1820],
        ["Jun", 2100]
      ];

      var operationsData = [
        ["Jan", 2240],
        ["Feb", 2170],
        ["Mar", 2380],
        ["Apr", 2520],
        ["May", 2730],
        ["Jun", 2890]
      ];

      var formattedBarData = [
        { name: "Revenue", data: revenueData },
        { name: "Expenses", data: expensesData },
        { name: "Marketing", data: marketingData },
        { name: "Operations", data: operationsData }
      ];

      // Wait for Highcharts and the framework TRMNLCharts helper (bundled in the
      // plugin runtime) before building the chart.
      function whenReady(cb) {
        var tries = 0;
        (function attempt() {
          if (window.TRMNLCharts && window.Highcharts) return cb();
          if (++tries > 200) return;
          setTimeout(attempt, 50);
        })();
      }

      whenReady(function () {
        var el = "example-bar-chart";
        // series(i, 4) picks the paint for each bar, and applySwatches() paints
        // the matching legend markers, so bars and swatches stay in step on
        // every device and theme.
        TRMNLCharts.watch(el, function () {
          var px = function (value) { return TRMNLPaint.px(value, { el: el }); };
          var chart = Highcharts.chart(el, TRMNLCharts.merge(TRMNLCharts.options({ el: el }), {
            chart: { type: "column", height: px(284), spacing: px([10, 10, 5, 10]) },
            plotOptions: { series: { pointPadding: 0.05, groupPadding: 0.1, borderWidth: 0 } },
            series: [{
              data: formattedBarData[0].data,
              name: formattedBarData[0].name,
              color: TRMNLCharts.series(0, 4, { el: el }),
              zIndex: 4
            }, {
              data: formattedBarData[1].data,
              name: formattedBarData[1].name,
              color: TRMNLCharts.series(1, 4, { el: el }),
              zIndex: 3
            }, {
              data: formattedBarData[2].data,
              name: formattedBarData[2].name,
              color: TRMNLCharts.series(2, 4, { el: el }),
              zIndex: 2
            }, {
              data: formattedBarData[3].data,
              name: formattedBarData[3].name,
              color: TRMNLCharts.series(3, 4, { el: el }),
              zIndex: 1
            }],
            yAxis: {
              gridLineDashStyle: "shortdot",
              tickAmount: 5
            },
            xAxis: {
              type: "category",
              labels: { padding: px(5), y: px(25) },
              lineWidth: 0,
              gridLineDashStyle: "dot",
              tickWidth: 0,
              tickLength: 0
            }
          }));
          TRMNLCharts.applySwatches({ el: el });
          return chart;
        });
      });
    </script>
  </div>
</div>
```

#### Gauge Chart

A gauge shows a single score. This example puts seven daily gauges in a row above one weekly summary gauge.

Monday

Tuesday

Wednesday

Thursday

Friday

Saturday

Sunday

18%REM Sleep

23%Deep Sleep

12mTime to Sleep

7h 32minSleep Duration

8Toss & Turns

0.5%Snoring

 ![TRMNL Logo](/images/plugins/trmnl--render.svg)ChartsGauge Chart

```
<!-- import Highcharts libraries -->
<script src="https://trmnl.com/js/highcharts/12.3.0/highcharts.js"></script>
<script src="https://trmnl.com/js/highcharts/12.3.0/highcharts-more.js"></script>
<script src="https://trmnl.com/js/highcharts/12.3.0/pattern-fill.js"></script>

<div class="view view--full">
  <div class="layout layout--col gap--none">
    <div class="grid grid--cols-7 mb--5">
      <div class="h--32">
        <div id="day_0" class="h--24"></div>
        <span class="description text--center">Monday</span>
      </div>
      <div class="h--32">
        <div id="day_1" class="h--24"></div>
        <span class="description text--center">Tuesday</span>
      </div>
      <div class="h--32">
        <div id="day_2" class="h--24"></div>
        <span class="description text--center">Wednesday</span>
      </div>
      <div class="h--32">
        <div id="day_3" class="h--24"></div>
        <span class="description text--center">Thursday</span>
      </div>
      <div class="h--32">
        <div id="day_4" class="h--24"></div>
        <span class="description text--center">Friday</span>
      </div>
      <div class="h--32">
        <div id="day_5" class="h--24"></div>
        <span class="description text--center">Saturday</span>
      </div>
      <div class="h--32">
        <div id="day_6" class="h--24"></div>
        <span class="description text--center">Sunday</span>
      </div>
    </div>

    <div class="divider"></div>

    <div class="grid">
      <div class="col--span-1 col--center">
        <div id="day_all"></div>
      </div>
      <div class="col--span-1 gap--large">
        <div class="flex flex--col gap--medium w--full flex--center">
          <div class="grid grid--cols-2">
            <div class="item">
            <div class="meta"></div>
            <div class="content">
                <span class="value value--tnums">18%</span>
                <span class="label">REM Sleep</span>
            </div>
          </div>
            <div class="item">
              <div class="meta"></div>
              <div class="content">
                <span class="value value--tnums">23%</span>
                <span class="label">Deep Sleep</span>
        </div>
      </div>
    </div>
          <div class="divider"></div>
          <div class="grid grid--cols-2">
            <div class="item">
              <div class="meta"></div>
              <div class="content">
                <span class="value value--small value--tnums">12m</span>
                <span class="label">Time to Sleep</span>
  </div>
          </div>
            <div class="item">
              <div class="meta"></div>
              <div class="content">
                <span class="value value--small value--tnums">7h 32min</span>
                <span class="label">Sleep Duration</span>
        </div>
          </div>
          </div>
          <div class="divider"></div>
          <div class="grid grid--cols-2">
            <div class="item">
                            <div class="meta"></div>
                            <div class="content">
                <span class="value value--small value--tnums">8</span>
                <span class="label">Toss & Turns</span>
                            </div>
                          </div>
            <div class="item">
              <div class="meta"></div>
              <div class="content">
                <span class="value value--small value--tnums">0.5%</span>
                <span class="label">Snoring</span>
                            </div>
                            </div>
                            </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <script type="text/javascript">
  var dailyScores = [92, 95, 81, 56, 81, 72, 85];
  var weeklyScore = 82;

  function createGauge(score, day, opts) {
    opts ||= {
      big: true,
      height: "80%",
      labels: { distance: 15 },
      rating: textRating(score)
    };

    var el = "day_" + day;
    var px = function (value) { return TRMNLPaint.px(value, { el: el }); };
    var labels = { ...(opts.labels || {}) };
    if (typeof labels.distance === "number") labels.distance = px(labels.distance);
    // options() supplies the adaptive text + axis paint; the gauge-specific config
    // is layered on top with merge(). textStyle() plots the value in the framework
    // .value role (weekly) or text--small (daily gauges).
    return Highcharts.chart(el, TRMNLCharts.merge(TRMNLCharts.options({ el: el }), {
      chart: {
        type: "gauge",
        height: opts.height
      },

      pane: {
        startAngle: -150,
        endAngle: 150,
        background: {
          backgroundColor: "transparent",
          borderWidth: 0
        }
      },

      plotOptions: {
        gauge: {
          animation: false,
          pivot: {
            backgroundColor: "transparent"
          },
          dial: {
            backgroundColor: "transparent",
            baseWidth: 0
          }
        }
      },

      yAxis: {
        min: 0,
        max: 100,
        minorTickInterval: 0,
        tickLength: px(40),
        tickPixelInterval: px(40),
        tickWidth: 0,
        lineWidth: 0,
        gridLineWidth: 0,
        title: {
          text: opts.rating,
          style: TRMNLCharts.textStyle("chart-label", { el: el })
        },
        labels: {
          ...labels,
          style: TRMNLCharts.textStyle("chart-label", { el: el })
        },
        plotBands: [{
          from: 1,
          to: score,
          color: TRMNLCharts.series(0, 2, { el: el }),
          innerRadius: "82%",
          borderRadius: "50%"
        }, {
          from: score + 1,
          to: 100,
          color: TRMNLCharts.series(1, 2, { el: el }),
          innerRadius: "82%",
          borderRadius: "50%"
        }]
      },

      series: [{
        name: "Score",
        data: [score],
        dataLabels: {
          borderWidth: 0,
          style: TRMNLCharts.textStyle(opts.big ? "value" : "chart-label", { el: el })
        }
      }]
    }));
  }

  function textRating(score) {
    if (score <= 50) {
      return "Low";
    } else if (score <= 65) {
      return "Pay Attention";
    } else if (score < 80) {
      return "Fair";
    } else {
      return "Good";
    }
  }

  // Wait for Highcharts + the framework TRMNLCharts helper, then build all gauges
  // and rebuild them whenever the screen device/scale/mode/dark/theme changes.
  function whenReady(cb) {
    var tries = 0;
    (function attempt() {
      if (window.TRMNLCharts && window.Highcharts) return cb();
      if (++tries > 200) return;
      setTimeout(attempt, 50);
    })();
  }

  whenReady(function () {
    // watch() tracks one instance; return a composite whose destroy() tears down
    // every gauge before the next rebuild.
    TRMNLCharts.watch("day_all", function () {
      var charts = [];

      // Small daily gauges (value in the text--small role, no rating label)
      dailyScores.forEach(function (score, idx) {
        charts.push(createGauge(score, idx, {
          big: false,
          labels: { enabled: false },
          rating: null
        }));
      });

      // Main weekly gauge: big=true plots the score in the same .value
      // role as the stat tiles beside it.
      charts.push(createGauge(weeklyScore, "all", {
        big: true,
        height: "80%",
        labels: { distance: 15 },
        rating: textRating(weeklyScore)
      }));

      return { destroy: function () {
        charts.forEach(function (c) { try { c.destroy(); } catch (e) {} });
      } };
    });
  });
</script>
```

 Previous  [ 

## Table

Create data tables optimized for 1-bit rendering

 ](/framework/docs/3.4/table)

 Next  [ 

## Map

Plot locations and routes on a vector map that adapts to the device and theme

 ](/framework/docs/3.4/map)

