import { expect, test } from '@playwright/test';
import {
  expectNoUnexpectedErrors,
  mountFixture,
  openRuntimePage,
  runtimeSignals,
} from '../support/runtime-page.js';

test('builds stable chart options from paint adapters and deep-merges overrides', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, { html: '<div id="chart-target"></div>' });

  const result = await page.evaluate(() => {
    const charts = window.TRMNLCharts;
    const paint = window.TRMNLPaint;
    const target = document.querySelector('#chart-target');
    const options = charts.options({ el: target });
    const gridH = charts.grid({ el: target, dir: 'h' });
    const gridV = charts.grid({ el: target, dir: 'v' });
    const axisLine = charts.axisLine({ el: target });
    const label = charts.textStyle('chart-label', { el: target });
    const axisTitle = charts.textStyle('label', { el: target });
    const merged = charts.merge(
      {
        chart: { animation: false, spacing: [1, 2] },
        xAxis: { labels: { enabled: true }, categories: ['old'] },
      },
      {
        chart: { height: 120 },
        xAxis: { labels: { style: { color: 'red' } }, categories: ['new'] },
      },
    );

    return {
      highchartsLoaded: typeof window.Highcharts,
      paintDelegates: JSON.stringify(charts.paint('black', { el: target }))
        === JSON.stringify(paint.toHighcharts(paint.bg('black', { el: target }))),
      seriesDelegates: JSON.stringify(charts.series(1, 3, { el: target }))
        === JSON.stringify(paint.toHighcharts(paint.series(1, 3, { el: target }))),
      options: {
        chart: {
          animation: options.chart.animation,
          backgroundColor: options.chart.backgroundColor,
          render: typeof options.chart.events.render,
        },
        titleText: options.title.text,
        credits: options.credits.enabled,
        tooltip: options.tooltip.enabled,
        legend: options.legend.enabled,
        seriesAnimation: options.plotOptions.series.animation,
        mouseTracking: options.plotOptions.series.enableMouseTracking,
        marker: options.plotOptions.series.marker.enabled,
        dataLabelOutline: options.plotOptions.series.dataLabels.style.textOutline,
        xMatches: {
          gridColor: options.xAxis.gridLineColor === gridV.gridLineColor,
          gridWidth: options.xAxis.gridLineWidth === gridV.gridLineWidth,
          gridDash: options.xAxis.gridLineDashStyle === gridV.gridLineDashStyle,
          lineColor: options.xAxis.lineColor === axisLine.lineColor,
          tickColor: options.xAxis.tickColor === axisLine.tickColor,
          label: JSON.stringify(options.xAxis.labels.style) === JSON.stringify(label),
          title: JSON.stringify(options.xAxis.title.style) === JSON.stringify(axisTitle),
        },
        yMatches: {
          gridColor: options.yAxis.gridLineColor === gridH.gridLineColor,
          gridWidth: options.yAxis.gridLineWidth === gridH.gridLineWidth,
          gridDash: options.yAxis.gridLineDashStyle === gridH.gridLineDashStyle,
        },
      },
      merged,
    };
  });

  expect(result.highchartsLoaded).toBe('undefined');
  expect(result.paintDelegates).toBe(true);
  expect(result.seriesDelegates).toBe(true);
  expect(result.options).toEqual({
    chart: { animation: false, backgroundColor: 'transparent', render: 'function' },
    titleText: null,
    credits: false,
    tooltip: false,
    legend: false,
    seriesAnimation: false,
    mouseTracking: false,
    marker: false,
    dataLabelOutline: 'none',
    xMatches: {
      gridColor: true,
      gridWidth: true,
      gridDash: true,
      lineColor: true,
      tickColor: true,
      label: true,
      title: true,
    },
    yMatches: { gridColor: true, gridWidth: true, gridDash: true },
  });
  expect(result.merged).toEqual({
    chart: { animation: false, spacing: [1, 2], height: 120 },
    xAxis: {
      labels: { enabled: true, style: { color: 'red' } },
      categories: ['new'],
    },
  });
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('applies chart swatches and axis paint without loading Highcharts', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, {
    html: `
      <div id="chart-shell">
        <span id="swatch-0" data-chart-series="0" data-chart-series-count="2"></span>
        <span id="swatch-1" data-chart-series="1" data-chart-series-count="2"></span>
        <span id="untouched" style="background-color: rgb(1, 2, 3)"></span>
        <svg xmlns="http://www.w3.org/2000/svg">
          <g id="x-grid"><path class="highcharts-grid-line" stroke-dasharray="2"></path></g>
          <path id="x-line" stroke-dasharray="2"></path>
          <path id="x-tick" stroke-dasharray="2"></path>
          <g id="y-grid"><path class="highcharts-grid-line" stroke-dasharray="2"></path></g>
          <path id="y-line" stroke-dasharray="2"></path>
          <path id="y-tick" stroke-dasharray="2"></path>
        </svg>
      </div>
    `,
  });

  const result = await page.evaluate(() => {
    const charts = window.TRMNLCharts;
    const shell = document.querySelector('#chart-shell');
    charts.applySwatches({ el: shell });
    const options = charts.options({ el: shell });
    const fakeAxis = (prefix) => ({
      gridGroup: { element: document.querySelector(`#${prefix}-grid`) },
      axisLine: { element: document.querySelector(`#${prefix}-line`) },
      ticks: { zero: { mark: { element: document.querySelector(`#${prefix}-tick`) } } },
    });
    options.chart.events.render.call({
      index: 17,
      container: shell,
      xAxis: [fakeAxis('x')],
      yAxis: [fakeAxis('y')],
    });

    const swatch = (id) => {
      const element = document.querySelector(id);
      return {
        color: element.style.backgroundColor,
        image: element.style.backgroundImage,
      };
    };
    const rail = (id) => {
      const element = document.querySelector(id);
      return {
        stroke: element.getAttribute('stroke'),
        dash: element.getAttribute('stroke-dasharray'),
      };
    };
    return {
      swatches: [swatch('#swatch-0'), swatch('#swatch-1')],
      untouched: document.querySelector('#untouched').style.backgroundColor,
      rails: [
        rail('#x-grid .highcharts-grid-line'), rail('#x-line'), rail('#x-tick'),
        rail('#y-grid .highcharts-grid-line'), rail('#y-line'), rail('#y-tick'),
      ],
      patterns: shell.querySelectorAll('defs pattern[id^="trmnl-border-17-"]').length,
    };
  });

  expect(result.swatches.every((swatch) => swatch.color || swatch.image)).toBe(true);
  expect(result.untouched).toBe('rgb(1, 2, 3)');
  expect(result.rails.every((rail) => rail.stroke && rail.dash === null)).toBe(true);
  expect(result.patterns).toBeGreaterThan(0);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});

test('rebuilds and destroys watched charts when the screen signature changes', async ({ page }) => {
  const browserSignals = await openRuntimePage(page);
  await mountFixture(page, { html: '<div id="watched-chart"></div>' });
  await page.evaluate(() => {
    window.__TRMNL_CHART_WATCH__ = { builds: 0, destroys: 0, pixels: [] };
    window.__TRMNL_STOP_CHART_WATCH__ = window.TRMNLCharts.watch('#watched-chart', () => {
      window.__TRMNL_CHART_WATCH__.builds += 1;
      window.__TRMNL_CHART_WATCH__.pixels.push(window.TRMNLPaint.px(40, { el: '#watched-chart' }));
      return {
        destroy() { window.__TRMNL_CHART_WATCH__.destroys += 1; },
      };
    });
  });
  expect(await page.evaluate(() => window.__TRMNL_CHART_WATCH__)).toEqual({
    builds: 1, destroys: 0, pixels: [40],
  });

  await page.locator('[data-runtime-test-screen]').evaluate((screen) => screen.classList.add('screen--dark-mode'));
  await page.waitForFunction(() => window.__TRMNL_CHART_WATCH__.builds === 2);
  expect(await page.evaluate(() => window.__TRMNL_CHART_WATCH__)).toEqual({
    builds: 2, destroys: 1, pixels: [40, 40],
  });

  await page.locator('[data-runtime-test-screen]').evaluate((screen) => screen.classList.add('screen--scale-xlarge'));
  await page.waitForFunction(() => window.__TRMNL_CHART_WATCH__.builds === 3);
  expect(await page.evaluate(() => window.__TRMNL_CHART_WATCH__)).toEqual({
    builds: 3, destroys: 2, pixels: [40, 40, 50],
  });

  await page.locator('[data-runtime-test-screen]').evaluate((screen) => screen.classList.add('screen--text-scale-large'));
  await page.waitForFunction(() => window.__TRMNL_CHART_WATCH__.builds === 4);
  expect(await page.evaluate(() => window.__TRMNL_CHART_WATCH__)).toEqual({
    builds: 4, destroys: 3, pixels: [40, 40, 50, 50],
  });

  // stop() disconnects the observer and destroys the chart it is holding, so nothing is
  // left behind: an orphaned Highcharts instance keeps its DOM, its SVG pattern defs and
  // its own listeners alive.
  await page.evaluate(() => window.__TRMNL_STOP_CHART_WATCH__());
  await page.locator('[data-runtime-test-screen]').evaluate((screen) => screen.classList.add('screen--2bit'));
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await page.evaluate(() => window.__TRMNL_CHART_WATCH__)).toEqual({
    builds: 4, destroys: 4, pixels: [40, 40, 50, 50],
  });

  // Stopping twice must not re-enter destroy on an instance that is already gone.
  await page.evaluate(() => window.__TRMNL_STOP_CHART_WATCH__());
  expect(await page.evaluate(() => window.__TRMNL_CHART_WATCH__.destroys)).toBe(4);
  expectNoUnexpectedErrors(browserSignals, await runtimeSignals(page));
});
