/**
 * Framework Example Iframe Bridge
 * Handles communication between iframe examples and parent window
 */

class FrameworkIframeBridge {
  constructor(scopeName) {
    this.scopeName = scopeName;
    this.channel = null;
    this.responseChannel = null;
    this.resizeObserver = null;
    this.initialized = false;

    // Bound window listeners, stored so destroy() can remove the exact
    // references it added (removeEventListener needs the same function object).
    this.onError = null;
    this.onUnhandledRejection = null;
    this.onStats = null;
    this.onLoad = null;
    
    this.init();
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.setupErrorForwarding();
    this.setupScreenPicker();
    this.setupStatsForwarding();
    this.setupResizeObserver();
    this.sendInitialMeasurement();
    this.setupLoadHandler();
  }

  /**
   * Forward JavaScript errors to parent window for debugging
   */
  setupErrorForwarding() {
    try {
      this.onError = (e) => {
        this.postToParent({
          type: 'trmnl:example:error',
          message: String(e?.message || 'error'),
          stack: String(e?.error?.stack || '')
        });
      };
      window.addEventListener('error', this.onError);

      this.onUnhandledRejection = (e) => {
        this.postToParent({
          type: 'trmnl:example:error',
          message: 'unhandledrejection',
          stack: String((e?.reason && e.reason.stack) || e?.reason || '')
        });
      };
      window.addEventListener('unhandledrejection', this.onUnhandledRejection);
    } catch (error) {
      console.warn('Failed to setup error forwarding:', error);
    }
  }

  /**
   * Setup BroadcastChannel communication for screen picker
   */
  setupScreenPicker() {
    // Frozen pages (the archived v1.2 docs) render once and ignore the
    // picker: the legacy engine is not safe to re-run.
    if (window.TRMNL_FROZEN_RUNTIME) return;
    try {
      this.pageId = this.resolveParentPageId();
      this.responseChannelName = `${this.scopeName}_page_${this.pageId}`;
      this.channel = new BroadcastChannel(this.scopeName);

      const applyScreenState = (event) => {
        const data = event?.data || {};
        if (data.type === 'screenChanged') {
          const themeId = this.detectThemeId(data);
          this.applyThemeStylesheet(themeId);
          this.applyScreenClasses(data.screenClasses);
          this.executeTerminalize();
        }
      };

      this.channel.onmessage = applyScreenState;
      this.responseChannel = new BroadcastChannel(this.responseChannelName);
      this.responseChannel.onmessage = applyScreenState;

      // State requests stay on the shared picker channel, but the response is
      // isolated to this parent page. Otherwise every open docs tab and every
      // picker instance can answer, making the active picker oscillate.
      this.channel.postMessage({
        type: 'requestScreenState',
        pageId: this.pageId,
        responseChannel: this.responseChannelName
      });
    } catch (error) {
      console.warn('Failed to setup screen picker:', error);
    }
  }

  resolveParentPageId() {
    const createId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      const parentWindow = window.parent && window.parent !== window ? window.parent : window;
      if (!parentWindow.__trmnlScreenPickerPageId) {
        parentWindow.__trmnlScreenPickerPageId = createId();
      }
      return parentWindow.__trmnlScreenPickerPageId;
    } catch (_) {
      return createId();
    }
  }

  /**
   * Apply CSS classes to screen elements
   */
  applyScreenClasses(classString) {
    if (!classString) return;

    // Iframe docs have no importmap, so the shared rewrite predicate is
    // injected as a classic script (lib/screen_class_sync.js) before this
    // module. Without it, skip the rewrite rather than corrupt the classes.
    const sync = window.TRMNLScreenClassSync;
    if (!sync) {
      console.error('[FrameworkIframeBridge] lib/screen_class_sync.js was not injected; skipping screen class sync');
      return;
    }

    const screens = document.querySelectorAll('.screen');

    screens.forEach((screen) => {
      if (screen.closest('[data-screen-picker-ignore]')) return;
      screen.className = sync.mergeScreenClasses(screen.className, classString);
    });

    // Trigger resize after classes are applied (e.g., portrait/landscape switch)
    // Use requestAnimationFrame to ensure CSS variables have updated
    requestAnimationFrame(() => {
      this.sendResizeMessage();
    });
  }

  detectThemeId(data) {
    const explicitTheme = this.normalizeThemeId(data?.theme);
    if (explicitTheme) return explicitTheme;

    const classString = String(data?.screenClasses || '');
    const match = classString.match(/\bscreen--theme-([a-z0-9-]+)\b/);
    if (!match) return null;
    return this.normalizeThemeId(match[1]);
  }

  normalizeThemeId(theme) {
    const normalized = String(theme || '').trim().toLowerCase();
    if (!normalized || normalized === 'none' || normalized === 'default') return null;
    return normalized;
  }

  readThemeCssUrls() {
    const urls = window.TRMNL_THEME_CSS_URLS;
    if (!urls || typeof urls !== 'object') return {};
    return urls;
  }

  applyThemeStylesheet(themeId) {
    const head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;

    const selector = 'link[data-trmnl-theme-link]';
    const existingLink = head.querySelector(selector);
    if (!themeId) {
      if (existingLink) existingLink.remove();
      return;
    }

    const themeCssUrls = this.readThemeCssUrls();
    const href = themeCssUrls[themeId];
    if (!href) {
      if (existingLink) existingLink.remove();
      return;
    }

    if (existingLink) {
      if (existingLink.getAttribute('href') !== href) {
        existingLink.setAttribute('href', href);
      }
      return;
    }

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    link.setAttribute('data-trmnl-theme-link', 'true');
    head.appendChild(link);
  }

  /**
   * Execute terminalize function if available
   */
  executeTerminalize() {
    try {
      if (window.executeTerminalize) {
        window.executeTerminalize();
      } else if (window.terminalize) {
        window.terminalize();
      }
    } catch (error) {
      console.warn('Failed to execute terminalize:', error);
    }
  }

  /**
   * Forward terminalize stats to parent window
   */
  setupStatsForwarding() {
    try {
      this.onStats = (evt) => {
        this.postToParent({
          type: 'trmnl:terminalize:stats',
          detail: evt.detail
        });

        // Request resize after stats to fit content
        this.sendResizeMessage();
      };
      window.addEventListener('trmnl:terminalize:stats', this.onStats);
    } catch (error) {
      console.warn('Failed to setup stats forwarding:', error);
    }
  }

  /**
   * Setup ResizeObserver to monitor size changes
   */
  setupResizeObserver() {
    try {
      this.resizeObserver = new ResizeObserver(() => {
        this.sendResizeMessage();
      });

      // Observe key elements
      this.resizeObserver.observe(document.documentElement);
      this.resizeObserver.observe(document.body);
      
      const screenEl = document.querySelector('.screen');
      if (screenEl) {
        this.resizeObserver.observe(screenEl);
      }
    } catch (error) {
      console.warn('Failed to setup resize observer:', error);
    }
  }

  /**
   * Calculate and send resize message to parent
   */
  sendResizeMessage() {
    try {
      const dimensions = this.calculateDimensions();

      // Break the resize feedback loop: the parent writes our reported height back
      // onto the <iframe>, which changes documentElement/body size and re-fires the
      // ResizeObserver -> sendResizeMessage -> parent writes again -> ... forever.
      // Our dimensions come from the stable --screen-w/--screen-h CSS vars, so a
      // parent-driven body resize does NOT change them. Only notify the parent when
      // the computed size actually changes; this halts the loop after it converges.
      const last = this._lastSentDimensions;
      if (last && last.width === dimensions.width && last.height === dimensions.height) {
        return;
      }
      this._lastSentDimensions = dimensions;

      this.postToParent({
        type: 'trmnl:example:resize',
        height: dimensions.height,
        width: dimensions.width
      });
    } catch (error) {
      console.warn('Failed to send resize message:', error);
    }
  }

  /**
   * Detect example layout type from mashup class
   * Returns 'half_horizontal', 'half_vertical', 'quadrant', or null
   * More reliable than searching for view classes
   */
  detectExampleLayout() {
    const mashupEl = document.querySelector('.mashup');
    if (!mashupEl) return null;
    
    const mashupClass = Array.from(mashupEl.classList).find(cls => cls.startsWith('mashup--'));
    if (!mashupClass) return null;
    
    // Map mashup classes to view types
    const mashupToView = {
      'mashup--2x2': 'quadrant',
      'mashup--1Lx1R': 'half_vertical',
      'mashup--1Tx1B': 'half_horizontal'
    };
    
    return mashupToView[mashupClass] || null;
  }

  /**
   * Get gap value from mashup element or CSS variable
   * Gap is defined as CSS variable on root and used by mashup via gap: var(--gap)
   */
  getGap() {
    try {
      // Try to get from mashup element first (matches original implementation)
      const mashupEl = document.querySelector('.mashup');
      if (mashupEl) {
        const style = getComputedStyle(mashupEl);
        // Read the computed gap property (resolved from var(--gap) in CSS grid)
        const gapValue = style.gap || style.getPropertyValue('--gap');
        const gap = this.parsePxValue(gapValue);
        if (gap > 0) return gap;
      }
      
      // Read the --gap token straight from the live cascade on :root. The
      // framework defines --gap there, so it resolves whenever the stylesheet
      // is loaded (always true by the time dimensions are measured). No
      // hardcoded fallback: JS must not duplicate a value that lives in CSS.
      const rootStyle = getComputedStyle(document.documentElement);
      return this.parsePxValue(rootStyle.getPropertyValue('--gap'));
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculate dimensions for example layouts accounting for mashup cell spacing (half gap)
   * The iframe needs to be sized to show one cell properly in the mashup grid
   * originalWidth/Height should be the full screen dimensions (--screen-w/--screen-h)
   */
  calculateExampleDimensions(originalWidth, originalHeight, gap) {
    const exampleType = this.detectExampleLayout();
    if (!exampleType) return null;

    const halfGap = gap / 2;

    switch (exampleType) {
      case 'quadrant':
        // Quadrant: half width + half gap, half height + half gap
        return {
          width: (originalWidth / 2) + halfGap,
          height: (originalHeight / 2) + halfGap
        };
      case 'half_horizontal':
        // Half horizontal: full width, half height + half gap
        return {
          width: originalWidth,
          height: (originalHeight / 2) + halfGap
        };
      case 'half_vertical':
        // Half vertical: half width + half gap, full height
        return {
          width: (originalWidth / 2) + halfGap,
          height: originalHeight
        };
      default:
        return null;
    }
  }

  /**
   * Calculate iframe dimensions from screen CSS variables
   * For example layouts, dimensions are calculated to account for mashup cell spacing (half gap)
   * In portrait mode, --screen-w and --screen-h are already swapped by CSS, so we read them directly
   */
  calculateDimensions() {
    const screenEl = document.querySelector('.screen');
    if (!screenEl) {
      return { width: 0, height: 0 };
    }

    const screenStyle = getComputedStyle(screenEl);
    // Read current screen dimensions (already swapped in portrait mode by CSS)
    const screenWidth = this.parsePxValue(screenStyle.getPropertyValue('--screen-w'));
    const screenHeight = this.parsePxValue(screenStyle.getPropertyValue('--screen-h'));

    if (screenWidth <= 0 || screenHeight <= 0) {
      return { width: 0, height: 0 };
    }

    const gap = this.getGap();
    const exampleDims = this.calculateExampleDimensions(screenWidth, screenHeight, gap);

    // Example layout uses calculated dimensions; regular layout uses screen dimensions
    return exampleDims || { width: screenWidth, height: screenHeight };
  }

  /**
   * Parse pixel value from CSS string
   */
  parsePxValue(value) {
    try {
      const trimmed = String(value || '').trim();
      return Math.round(parseFloat(trimmed.replace('px', '')) || 0);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Send initial measurement
   */
  sendInitialMeasurement() {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      this.sendResizeMessage();
    });
  }

  /**
   * Setup load event handler
   */
  setupLoadHandler() {
    this.onLoad = () => {
      // Frozen pages render exactly once: the legacy bundle terminalizes
      // itself on load, and a second run is what the freeze forbids.
      if (!window.TRMNL_FROZEN_RUNTIME) this.executeTerminalize();
      this.sendResizeMessage();
    };
    window.addEventListener('load', this.onLoad, { once: true });
  }

  /**
   * The origin these messages are for. The docs page that built this srcdoc hands its
   * own origin down with the rest of the bridge config, so the browser can refuse the
   * delivery if the frame ever ends up somewhere else.
   */
  parentOrigin() {
    const declared = typeof window.TRMNL_PARENT_ORIGIN === 'string' ? window.TRMNL_PARENT_ORIGIN : '';
    return declared || window.location.origin || '*';
  }

  /**
   * Safe postMessage to parent window
   */
  postToParent(message) {
    try {
      parent.postMessage(message, this.parentOrigin());
    } catch (error) {
      console.warn('Failed to post message to parent:', error);
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    if (this.responseChannel) {
      this.responseChannel.close();
      this.responseChannel = null;
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Remove the window listeners added during setup. removeEventListener only
    // matches when handed the same function reference we stored on add.
    if (this.onError) {
      window.removeEventListener('error', this.onError);
      this.onError = null;
    }
    if (this.onUnhandledRejection) {
      window.removeEventListener('unhandledrejection', this.onUnhandledRejection);
      this.onUnhandledRejection = null;
    }
    if (this.onStats) {
      window.removeEventListener('trmnl:terminalize:stats', this.onStats);
      this.onStats = null;
    }
    if (this.onLoad) {
      window.removeEventListener('load', this.onLoad);
      this.onLoad = null;
    }
    
    this.initialized = false;
  }
}

// Auto-initialize if scopeName is provided via global variable
if (typeof window !== 'undefined' && window.TRMNL_SCOPE_NAME) {
  window.frameworkBridge = new FrameworkIframeBridge(window.TRMNL_SCOPE_NAME);
}

// Export for manual initialization
window.FrameworkIframeBridge = FrameworkIframeBridge;
