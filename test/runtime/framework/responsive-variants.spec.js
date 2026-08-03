import { expect, test } from '@playwright/test';
import { routeProcessedAssets } from '../../support/processed-bundle.js';

// The compiled-CSS matrix in framework_responsive_variants_spec.rb proves the
// selectors exist. This proves they fire: it drives real screen states in a real
// engine and checks that each variant class takes effect exactly where its gate
// says it should.
//
// /framework/test/responsive_variants renders every responsive_test parity row
// three times against the live build, each in its own screen so nothing shares a
// flex or grid container:
//
//   subject  the markup as authored, carrying the variant class
//   plain    the same markup without it
//   base     the same markup with the variant's unprefixed class instead
//
// `base` is only an oracle for "does this class do anything in this fixture".
// It is not compared against directly: where the unprefixed class collides with
// one already on the element (flex--col against flex--row), source order decides
// and the control stops modelling the variant.
const MATRIX = () => {
  const SIZES = ['sm', 'md', 'lg'];
  const ORIENTATIONS = ['landscape', 'portrait'];
  const BIT_DEPTHS = ['1bit', '2bit', '4bit'];

  // Paint setup that applies whether or not the gate fired. Without a
  // background-image to size or dither, these are inert.
  const INERT = new Set([
    'background-size', 'image-rendering', '-webkit-font-smoothing',
    'perspective-origin', 'transform-origin',
  ]);

  const parseGate = (className) => {
    const parts = className.split(':');
    if (parts.length < 2) return null;
    parts.pop();

    const gate = { size: null, orientation: null, bitDepth: null, dark: false };
    for (const token of parts) {
      if (SIZES.includes(token)) gate.size = token;
      else if (ORIENTATIONS.includes(token)) gate.orientation = token;
      else if (/^[124]bit$/.test(token)) gate.bitDepth = token;
      else if (token === 'dark') gate.dark = true;
      else return null;
    }
    return gate;
  };

  // One state that satisfies the gate, then one flip per axis it constrains.
  const statesFor = (gate) => {
    const on = {
      size: gate.size || 'lg',
      orientation: gate.orientation === 'portrait' ? 'portrait' : 'landscape',
      bitDepth: gate.bitDepth || '1bit',
    };
    const states = [[on, true]];
    if (gate.size && gate.size !== 'sm') {
      states.push([{ ...on, size: SIZES[SIZES.indexOf(gate.size) - 1] }, false]);
    }
    if (gate.orientation) {
      states.push([{ ...on, orientation: on.orientation === 'portrait' ? 'landscape' : 'portrait' }, false]);
    }
    if (gate.bitDepth) {
      states.push([{ ...on, bitDepth: BIT_DEPTHS.find((b) => b !== gate.bitDepth) }, false]);
    }
    return states;
  };

  const styleOf = (element, pseudo) => {
    const computed = getComputedStyle(element, pseudo || null);
    let out = '';
    for (let i = 0; i < computed.length; i += 1) {
      if (!INERT.has(computed[i])) out += `${computed[i]}:${computed.getPropertyValue(computed[i])};`;
    }
    return out;
  };

  // Pseudo-elements matter: label--underline only paints through ::after.
  // Children matter: the layout stretch overrides only touch `> *`.
  const signature = (element) => {
    if (!element) return 'MISSING';
    return [
      styleOf(element),
      styleOf(element, '::after'),
      styleOf(element, '::before'),
      [...element.children].map((child) => styleOf(child)).join('~'),
    ].join('|');
  };

  const pathTo = (element) => {
    const path = [];
    let node = element;
    while (node && !node.classList.contains('screen')) {
      path.unshift([...node.parentElement.children].indexOf(node));
      node = node.parentElement;
    }
    return path;
  };

  const atPath = (container, path) => {
    let node = container.querySelector('.screen');
    for (const index of path) node = node && node.children[index];
    return node;
  };

  const probes = {};
  document.querySelectorAll('[data-variant-probe]').forEach((element) => {
    const probe = (probes[element.dataset.variantProbe] ||= {});
    probe[element.dataset.variantRole] = element;
    probe.className = element.dataset.variantClass;
  });

  const applyState = (state) => {
    document.querySelectorAll('[data-variant-probe] .screen').forEach((screen) => {
      screen.className = `screen screen--og screen--${state.size} screen--${state.bitDepth}`
        + (state.orientation === 'portrait' ? ' screen--portrait' : '');
    });
  };

  const dead = [];
  const leaked = [];
  const inert = [];
  let checks = 0;

  for (const probe of Object.values(probes)) {
    const gate = parseGate(probe.className);
    if (!gate) continue;

    const subject = probe.subject.querySelector(`.${CSS.escape(probe.className)}`);
    if (!subject) {
      dead.push(`${probe.className}: not present in the fixture`);
      continue;
    }
    const path = pathTo(subject);

    for (const [state, gateIsOpen] of statesFor(gate)) {
      applyState(state);
      checks += 1;

      const where = `${probe.className} @ ${state.size}/${state.orientation}/${state.bitDepth}`;
      const subjectStyle = signature(subject);
      const plainStyle = signature(atPath(probe.plain, path));

      if (!gateIsOpen) {
        if (subjectStyle !== plainStyle) leaked.push(where);
      } else if (signature(atPath(probe.base, path)) === plainStyle) {
        inert.push(probe.className);
      } else if (subjectStyle === plainStyle) {
        dead.push(where);
      }
    }
  }

  return { rows: Object.keys(probes).length, checks, dead, leaked, inert: [...new Set(inert)] };
};

test.describe('responsive variant gates', () => {
  test.beforeEach(async ({ page }) => {
    await routeProcessedAssets(page);
  });

  test('each variant class takes effect exactly where its gate opens', async ({ page }) => {
    await page.goto('/framework/test/responsive_variants');
    await expect.poll(() => page.locator('[data-variant-probe]').count()).toBeGreaterThan(0);

    const result = await page.evaluate(MATRIX);

    // Guard against a fixture that silently stops rendering: an empty page would
    // otherwise report zero failures and pass.
    expect(result.rows).toBeGreaterThan(40);
    expect(result.checks).toBeGreaterThan(100);

    expect(result.dead, 'variant classes that did nothing while their gate was open').toEqual([]);
    expect(result.leaked, 'variant classes that applied while their gate was shut').toEqual([]);
  });
});
