// Single source of truth for rewriting a screen element's classes when the
// screen picker (or persisted picker state) changes device mode, dark mode,
// or theme. Add any new preserved screen--* modifier HERE and nowhere else.
//
// This file must stay loadable both as an ES module (parent page via
// `import "lib/screen_class_sync"`) and as a classic script (example iframes
// have no importmap, so framework_examples_controller injects it with a plain
// script tag before the iframe bridge). Therefore: no import/export statements;
// consumers read window.TRMNLScreenClassSync.
(function (global) {
  'use strict';

  // screen--* modifiers that survive a picker rewrite (everything else
  // matching screen--* is owned by the picker and gets replaced).
  var PRESERVED_NAMES = ['screen--no-bleed', 'screen--backdrop'];
  var PRESERVED_PREFIXES = ['screen--scale-', 'screen--text-scale-'];

  function isPreservedScreenClass(cls) {
    if (PRESERVED_NAMES.indexOf(cls) !== -1) return true;
    return PRESERVED_PREFIXES.some(function (prefix) { return cls.indexOf(prefix) === 0; });
  }

  // A current class survives the rewrite unless it is a non-preserved
  // screen--* modifier. The bare `screen` base class is dropped here and
  // re-ensured first by merge(), so it can never be lost or duplicated.
  function keepDuringRewrite(cls) {
    if (cls === 'screen') return false;
    if (cls.indexOf('screen--') !== 0) return true;
    return isPreservedScreenClass(cls);
  }

  function toClassList(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    return String(value || '').split(/\s+/).filter(Boolean);
  }

  // Merge a screen element's current className with the picker's incoming
  // classes. Returns the next className string: the base `screen` class,
  // surviving current classes, incoming classes, then extras, deduplicated.
  // A preserved prefix yields when the incoming set carries its own class for
  // that prefix, so a picker-sent modifier replaces the page-authored one
  // instead of accumulating next to it.
  function mergeScreenClasses(currentClassName, incomingClasses, extraClasses) {
    var incoming = toClassList(incomingClasses).filter(function (cls) { return cls !== 'screen'; });
    var incomingPrefixes = PRESERVED_PREFIXES.filter(function (prefix) {
      return incoming.some(function (cls) { return cls.indexOf(prefix) === 0; });
    });
    var kept = toClassList(currentClassName).filter(keepDuringRewrite).filter(function (cls) {
      return !incomingPrefixes.some(function (prefix) { return cls.indexOf(prefix) === 0; });
    });
    var next = ['screen'].concat(kept, incoming, toClassList(extraClasses));
    return Array.from(new Set(next)).join(' ');
  }

  global.TRMNLScreenClassSync = {
    PRESERVED_NAMES: PRESERVED_NAMES,
    PRESERVED_PREFIXES: PRESERVED_PREFIXES,
    isPreservedScreenClass: isPreservedScreenClass,
    keepDuringRewrite: keepDuringRewrite,
    mergeScreenClasses: mergeScreenClasses
  };
})(typeof window !== 'undefined' ? window : globalThis);
