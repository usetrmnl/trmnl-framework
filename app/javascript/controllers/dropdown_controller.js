import { Controller } from "@hotwired/stimulus"
import {
  isCurrentDeviceSwitch,
  submitDeviceSwitchForm
} from "lib/device_switch"

export default class extends Controller {
  static targets = ["menu"]
  static values = {
    hoverDelay: { type: Number, default: 100 },
    nestedHoverDelay: { type: Number, default: 300 },
    closeDelay: { type: Number, default: 300 },
    openOnHover: { type: Boolean, default: false },
    layerZIndex: { type: Number, default: 130 },
    dismissLayer: { type: Boolean, default: true },
    dismissLayerZIndex: { type: Number, default: 120 },
    placement: { type: String, default: "bottom" },
    fitViewport: { type: Boolean, default: false },
    fitViewportMargin: { type: Number, default: 16 },
    fitViewportMin: { type: Number, default: 200 },
    fitViewportBoundary: { type: String, default: "" },
    keepInView: { type: Boolean, default: false },
    currentDeviceId: String
  }

  get slideClass() {
    return this.placementValue === "top" ? 'translate-y-[10px]' : 'translate-y-[-10px]'
  }

  connect() {
    this.menuTarget.classList.remove('hidden');
    this.menuTarget.hidden = true;
    this.menuTarget.classList.add('opacity-0', this.slideClass);
    this.setExpandedState(false);
    this.closeTimeout = null;
    this.openTimeout = null;
    this.hideTimeout = null;
    this.dismissLayerElement = null;
    this.dismissLayerListening = false;
    this.keydownListening = false;
    this.elevatedStackingContexts = [];
    this.isNested = this.checkIfNested();
    this.hoverInteractionsEnabled = this.openOnHoverValue || this.isNested;
    
    // Store bound methods for proper cleanup
    this.boundStartOpenTimer = this.startOpenTimer.bind(this);
    this.boundStartCloseTimer = this.startCloseTimer.bind(this);
    this.boundApplyFitViewport = this.applyFitViewport.bind(this);
    this.boundNudge = this.nudgeIntoViewport.bind(this);
    this.boundDismissFromOutside = this.dismissFromOutside.bind(this);
    this.boundHandleKeydown = this.handleKeydown.bind(this);
    
    document.addEventListener('click', this.closeOnClickOutside);
    if (this.hoverInteractionsEnabled) {
      this.element.addEventListener('mouseenter', this.boundStartOpenTimer);
      this.element.addEventListener('mouseleave', this.boundStartCloseTimer);
    }
  }

  checkIfNested() {
    // Check if this dropdown is inside another dropdown's menu element
    // A nested dropdown will be inside a [data-dropdown-target="menu"] element
    let parent = this.element.parentElement;
    while (parent && parent !== document.body) {
      // Check if we're inside a dropdown menu (but not our own menu)
      if (parent.hasAttribute('data-dropdown-target') && 
          parent.getAttribute('data-dropdown-target') === 'menu' &&
          parent !== this.menuTarget) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  clearOpenTimeout() {
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
      this.openTimeout = null;
    }
  }

  clearCloseTimeout() {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  }

  clearAllTimeouts() {
    this.clearOpenTimeout();
    this.clearCloseTimeout();
    this.clearHideTimeout();
  }

  disconnect() {
    document.removeEventListener('click', this.closeOnClickOutside);
    if (this.hoverInteractionsEnabled) {
      this.element.removeEventListener('mouseenter', this.boundStartOpenTimer);
      this.element.removeEventListener('mouseleave', this.boundStartCloseTimer);
    }
    if (this.boundApplyFitViewport) {
      window.removeEventListener('resize', this.boundApplyFitViewport);
    }
    if (this.boundNudge) {
      window.removeEventListener('resize', this.boundNudge);
    }
    this.#disconnectFitObserver();
    this.clearAllTimeouts();
    this.removeDismissLayer();
    this.removeKeydownListener();
    this.restoreStackingContexts();
  }

  clearHideTimeout() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  startOpenTimer() {
    // Clear any existing close timer
    this.clearCloseTimeout();
    
    // If already open, don't start a new timer
    if (this.element.classList.contains('dropdown-open')) {
      return;
    }
    
    // Use configured delay for nested dropdowns, hoverDelay for non-nested
    const delay = this.isNested ? this.nestedHoverDelayValue : this.hoverDelayValue;
    
    // Start timer to open after delay
    this.openTimeout = setTimeout(() => {
      this.open();
      this.openTimeout = null;
    }, delay);
  }

  open() {
    this.clearAllTimeouts();
    this.element.classList.add('dropdown-open');
    this.elevateStackingContexts();
    this.addDismissLayer();
    this.addKeydownListener();
    this.setExpandedState(true);
    this.menuTarget.hidden = false;
    this.menuTarget.classList.remove('ease-in', 'duration-150');
    this.menuTarget.classList.add('transition', 'ease-out', 'duration-200');
    if (this.fitViewportValue) {
      this.applyFitViewport();
      window.addEventListener('resize', this.boundApplyFitViewport);
      this.#observeFitBoundary();
    }
    if (this.keepInViewValue) {
      this.nudgeIntoViewport();
      window.addEventListener('resize', this.boundNudge);
    }
    void this.menuTarget.offsetWidth;
    this.menuTarget.classList.remove('opacity-0', this.slideClass);
  }

  close() {
    if (this.menuTarget.hidden && !this.hideTimeout) {
      this.removeDismissLayer();
      this.removeKeydownListener();
      return;
    }

    this.clearOpenTimeout();
    this.clearHideTimeout();
    this.removeKeydownListener();
    this.element.classList.remove('dropdown-open');
    this.setExpandedState(false);
    this.menuTarget.classList.remove('ease-out', 'duration-200');
    this.menuTarget.classList.add('transition', 'ease-in', 'duration-150');
    void this.menuTarget.offsetWidth;
    this.menuTarget.classList.add('opacity-0', this.slideClass);
    this.hideTimeout = setTimeout(() => {
      this.menuTarget.hidden = true;
      this.hideTimeout = null;
      this.removeDismissLayer();
      this.restoreStackingContexts();
    }, 150);
    if (this.fitViewportValue) {
      window.removeEventListener('resize', this.boundApplyFitViewport);
      this.#disconnectFitObserver();
      this.menuTarget.style.maxHeight = '';
    }
    if (this.keepInViewValue) {
      window.removeEventListener('resize', this.boundNudge);
      this.menuTarget.style.transform = '';
    }
  }

  addDismissLayer() {
    if (!this.dismissLayerValue || this.isNested) return;

    if (!this.dismissLayerElement) {
      const layer = document.createElement('div');
      layer.setAttribute('aria-hidden', 'true');
      layer.dataset.dropdownDismissLayer = 'true';
      Object.assign(layer.style, {
        position: 'fixed',
        inset: '0',
        zIndex: String(this.dismissLayerZIndexValue),
        background: 'transparent',
        pointerEvents: 'auto'
      });
      layer.addEventListener('pointerdown', this.boundDismissFromOutside);
      layer.addEventListener('click', this.boundDismissFromOutside);
      document.body.appendChild(layer);
      this.dismissLayerElement = layer;
    }

    if (!this.dismissLayerListening) {
      document.addEventListener('pointerdown', this.boundDismissFromOutside, true);
      document.addEventListener('click', this.boundDismissFromOutside, true);
      this.dismissLayerListening = true;
    }
  }

  removeDismissLayer() {
    if (this.dismissLayerListening) {
      document.removeEventListener('pointerdown', this.boundDismissFromOutside, true);
      document.removeEventListener('click', this.boundDismissFromOutside, true);
      this.dismissLayerListening = false;
    }

    if (this.dismissLayerElement) {
      this.dismissLayerElement.removeEventListener('pointerdown', this.boundDismissFromOutside);
      this.dismissLayerElement.removeEventListener('click', this.boundDismissFromOutside);
      this.dismissLayerElement.remove();
      this.dismissLayerElement = null;
    }
  }

  addKeydownListener() {
    if (this.keydownListening) return;

    document.addEventListener('keydown', this.boundHandleKeydown);
    this.keydownListening = true;
  }

  removeKeydownListener() {
    if (!this.keydownListening) return;

    document.removeEventListener('keydown', this.boundHandleKeydown);
    this.keydownListening = false;
  }

  dismissFromOutside(event) {
    if (!this.dismissLayerElement && this.menuTarget.hidden) return;
    if (this.element.contains(event.target)) return;

    if (this.isModalOrPaletteEvent(event.target)) {
      this.close();
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.close();
  }

  isModalOrPaletteEvent(target) {
    if (!(target instanceof Element)) return false;

    return Boolean(
      target.closest('.modal__backdrop') ||
      target.closest('[data-controller~="command-palette"]')
    );
  }

  handleKeydown(event) {
    if (event.key !== 'Escape') return;
    if (this.menuTarget.hidden && !this.hideTimeout) return;

    event.preventDefault();
    event.stopPropagation();
    this.close();
  }

  elevateStackingContexts() {
    if (this.isNested) return;

    this.restoreStackingContexts();

    let parent = this.element.parentElement;
    while (parent && parent !== document.body) {
      const computed = window.getComputedStyle(parent);
      const currentZIndex = Number.parseInt(computed.zIndex, 10);
      const canLift = computed.position !== 'static' &&
        Number.isFinite(currentZIndex) &&
        currentZIndex < this.layerZIndexValue;

      if (canLift) {
        const currentCount = Number.parseInt(parent.dataset.dropdownLayerCount || '0', 10);
        if (currentCount === 0) {
          parent.dataset.dropdownLayerPreviousZIndex = parent.style.zIndex;
        }
        parent.dataset.dropdownLayerCount = String(currentCount + 1);
        parent.style.zIndex = String(this.layerZIndexValue);
        this.elevatedStackingContexts.push(parent);
      }

      parent = parent.parentElement;
    }
  }

  restoreStackingContexts() {
    if (!this.elevatedStackingContexts?.length) return;

    this.elevatedStackingContexts.forEach((element) => {
      const currentCount = Number.parseInt(element.dataset.dropdownLayerCount || '1', 10);
      const nextCount = Math.max(currentCount - 1, 0);

      if (nextCount === 0) {
        element.style.zIndex = element.dataset.dropdownLayerPreviousZIndex || '';
        delete element.dataset.dropdownLayerPreviousZIndex;
        delete element.dataset.dropdownLayerCount;
      } else {
        element.dataset.dropdownLayerCount = String(nextCount);
      }
    });
    this.elevatedStackingContexts = [];
  }

  applyFitViewport() {
    if (!this.hasMenuTarget) return;
    const rect = this.element.getBoundingClientRect();
    const gap = 8;
    const margin = this.fitViewportMarginValue;
    const boundary = this.fitViewportBoundaryValue
      ? document.querySelector(this.fitViewportBoundaryValue)
      : null;
    const boundaryRect = boundary ? boundary.getBoundingClientRect() : null;

    let avail;
    if (this.placementValue === 'top') {
      const ceiling = boundaryRect ? boundaryRect.top : 0;
      avail = rect.top - gap - margin - ceiling;
    } else {
      const floor = boundaryRect ? boundaryRect.bottom : window.innerHeight;
      avail = floor - rect.bottom - gap - margin;
    }

    // When a boundary is provided it owns the min; honor the real available
    // space so the menu never overflows past it. Without a boundary, preserve
    // the legacy min-floor behaviour so other callers are unaffected.
    let maxH = boundary
      ? Math.max(0, avail)
      : Math.max(avail, this.fitViewportMinValue);

    // Respect the CSS-defined max-height as an absolute cap so inline style
    // doesn't grow past what the stylesheet asked for.
    const cssCap = this.#cssMaxHeight();
    if (cssCap != null) maxH = Math.min(maxH, cssCap);

    this.menuTarget.style.maxHeight = `${maxH}px`;
  }

  // Shift an opened menu by the minimum amount needed to keep it fully within the
  // viewport. Covers menus whose static CSS placement would otherwise run off an
  // edge (e.g. a side flyout near the right edge, or a menu opened on a bottom row).
  nudgeIntoViewport() {
    if (!this.hasMenuTarget) return;
    const menu = this.menuTarget;
    const margin = 8;
    // Measure the menu's resting position. The open/close animation transitions both
    // `transform` and the slide's `translate` (Tailwind's `translate-y-*` uses the CSS
    // `translate` property), so we must turn transitions off first; otherwise resetting
    // them merely *starts* an animation and an immediate getBoundingClientRect reads a
    // stale, mid-flight position. With transitions off the resets apply instantly.
    const prevTransition = menu.style.transition;
    menu.style.transition = 'none';
    menu.style.transform = 'none';
    menu.style.translate = 'none';
    const rect = menu.getBoundingClientRect();
    menu.style.translate = '';

    let dx = 0;
    if (rect.right > window.innerWidth - margin) dx = (window.innerWidth - margin) - rect.right;
    if (rect.left + dx < margin) dx = margin - rect.left;

    let dy = 0;
    if (rect.bottom > window.innerHeight - margin) dy = (window.innerHeight - margin) - rect.bottom;
    if (rect.top + dy < margin) dy = margin - rect.top;

    // Apply (or clear) the correction while transitions are still off so it lands
    // instantly. Animating it would leave the menu briefly overflowing, and under
    // load that frame can stretch. Commit with a reflow, then restore transitions so
    // close() still animates.
    menu.style.transform = (dx || dy) ? `translate(${dx}px, ${dy}px)` : '';
    void menu.offsetWidth;
    menu.style.transition = prevTransition;
  }

  #cssMaxHeight() {
    if (this._cssMaxHeight !== undefined) return this._cssMaxHeight;
    // Temporarily clear inline max-height so we read the stylesheet value,
    // not our own previously-written inline value.
    const inline = this.menuTarget.style.maxHeight;
    this.menuTarget.style.maxHeight = '';
    const computed = window.getComputedStyle(this.menuTarget).maxHeight;
    this.menuTarget.style.maxHeight = inline;
    const parsed = parseFloat(computed);
    this._cssMaxHeight = Number.isFinite(parsed) ? parsed : null;
    return this._cssMaxHeight;
  }

  #observeFitBoundary() {
    this.#disconnectFitObserver();
    if (!this.fitViewportBoundaryValue) return;
    if (typeof ResizeObserver === 'undefined') return;
    const boundary = document.querySelector(this.fitViewportBoundaryValue);
    if (!boundary) return;
    this.fitObserver = new ResizeObserver(() => this.applyFitViewport());
    this.fitObserver.observe(boundary);
    this.fitObserver.observe(this.element);
  }

  #disconnectFitObserver() {
    if (this.fitObserver) {
      this.fitObserver.disconnect();
      this.fitObserver = null;
    }
  }

  setExpandedState(isExpanded) {
    const trigger = this.element.querySelector('[data-dropdown-trigger], button[aria-haspopup="true"], button');
    if (!trigger) return;
    trigger.setAttribute('aria-expanded', String(isExpanded));
  }

  startCloseTimer() {
    // Clear any pending open timer
    this.clearOpenTimeout();
    
    this.closeTimeout = setTimeout(() => {
      this.close();
    }, this.closeDelayValue);
  }

  toggle(event) {
    event.preventDefault();
    if (this.menuTarget.hidden) {
      this.open();
    } else {
      this.close();
    }
  }

  toggleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.menuTarget.hidden) {
      this.open();
    } else {
      this.close();
    }
  }

  closeOnClickOutside = (event) => {
    if (!this.element.contains(event.target)) {
      this.close();
    }
  }

  select(event) {
    event.preventDefault();
    const deviceId = event.currentTarget.dataset.deviceId;
    const layout = event.currentTarget.dataset.layout;
    const mashupId = event.currentTarget.dataset.mashupId;
    const playlistId = event.currentTarget.dataset.playlistId;

    this.close();

    if (deviceId) {
      this.switchDevice(deviceId, event.currentTarget.dataset.returnTo || null);
    } else if (layout === "3x3") {
      document.getElementById("mashup_grid_editor_modal")
        ?.dispatchEvent(new CustomEvent("modal:open", { bubbles: true }));
    } else if (layout) {
      this.createMashupLayout(layout);
    } else if (mashupId) {
      this.updateMashup(mashupId, playlistId)
    }
  }

  switchDevice(deviceId, returnTo = null) {
    if (isCurrentDeviceSwitch(deviceId, this.currentDeviceIdValue)) return;

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.element.dataset.dropdownUrl;

    const methodInput = document.createElement('input');
    methodInput.type = 'hidden';
    methodInput.name = '_method';
    methodInput.value = 'post';

    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = 'authenticity_token';
    tokenInput.value = document.querySelector('meta[name="csrf-token"]').content;

    const deviceInput = document.createElement('input');
    deviceInput.type = 'hidden';
    deviceInput.name = 'device_id';
    deviceInput.value = deviceId;

    form.appendChild(methodInput);
    form.appendChild(tokenInput);
    form.appendChild(deviceInput);

    if (returnTo) {
      const returnInput = document.createElement('input');
      returnInput.type = 'hidden';
      returnInput.name = 'return_to';
      returnInput.value = returnTo;
      form.appendChild(returnInput);
    }

    document.body.appendChild(form);
    submitDeviceSwitchForm(form, {
      deviceId,
      currentDeviceId: this.currentDeviceIdValue
    });
  }

  editDevice(event) {
    const deviceId = event.currentTarget.dataset.deviceId;
    window.location.href = `/devices/${deviceId}/edit`;
  }

  addNewDevice(event) {
    event.preventDefault();
    window.location.href = "/devices/new";
  }

  createMashupLayout(layout) {
    fetch('/mashups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || '',
        'Accept': "text/vnd.turbo-stream.html"
      },
      body: JSON.stringify({ 'layout': layout })
    })
    .then(response => response.text())
    .then(html => {
      Turbo.renderStreamMessage(html);
      document.getElementById('add_plugin_modal')?.dispatchEvent(new CustomEvent('modal:open', { bubbles: true }));
    });
  }

  updateMashup(mashupId, playlistId) {
    fetch(`/mashups/${mashupId}/edit?playlist_id=${playlistId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || '',
        'Accept': "text/vnd.turbo-stream.html"
      }
    })
    .then(response => response.text())
    .then(html => {
      Turbo.renderStreamMessage(html);
    });
  }

  identifyDevice(event) {
    event.preventDefault();
    const deviceId = event.currentTarget.dataset.deviceId;
    fetch(`/devices/${deviceId}/identify`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
        'Content-Type': 'application/json',
        'Accept': 'text/vnd.turbo-stream.html'
      }
    })
    .then(response => response.text())
    .then(html => {
      Turbo.renderStreamMessage(html);
      this.close();
    });
  }

  clearPlaylist(event) {
    event.preventDefault();
    const deviceId = event.currentTarget.dataset.deviceId;
    const confirmMessage = event.currentTarget.dataset.confirmMessage;
    this.close();
    if (!confirm(confirmMessage)) return;
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/devices/${deviceId}/clear_playlist`;
    const token = document.createElement('input');
    token.type = 'hidden';
    token.name = 'authenticity_token';
    token.value = document.querySelector('meta[name="csrf-token"]').content;
    form.appendChild(token);
    document.body.appendChild(form);
    form.requestSubmit();
  }

  openCopyPlaylistModal(event) {
    event.preventDefault();
    const sourceDeviceId = event.currentTarget.dataset.sourceDeviceId;
    const modal = document.getElementById('copy-playlist-modal');
    const form = modal.querySelector('form');

    const fromSelect = modal.querySelector('#copy-playlist-from-device');
    fromSelect.value = sourceDeviceId;
    form.action = fromSelect.options[fromSelect.selectedIndex].dataset.copyPath;
    fromSelect.onchange = (e) => {
      form.action = e.target.options[e.target.selectedIndex].dataset.copyPath;
    };

    const toSelect = modal.querySelector('#target_device_id');
    if (toSelect.value === sourceDeviceId) {
      const other = Array.from(toSelect.options).find(o => o.value !== sourceDeviceId);
      if (other) toSelect.value = other.value;
    }

    modal.dispatchEvent(new CustomEvent('modal:open'));
    this.close();
  }
}
