import { Controller } from "@hotwired/stimulus";

// Manages copy and expand/collapse for code examples
export default class extends Controller {
  connect() {
    this.example = this.element;
    this.toggleBtn = this.example.querySelector('.expand-toggle');
    this.expandText = this.toggleBtn ? this.toggleBtn.querySelector('.expand-text') : null;
    this.collapseText = this.toggleBtn ? this.toggleBtn.querySelector('.collapse-text') : null;
    this.codePre = this.example.querySelector('pre');

    this.copyButton = this.example.querySelector('.copy-button');
    this.copyText = this.copyButton ? this.copyButton.querySelector('.copy-text') : null;
    this.copiedText = this.copyButton ? this.copyButton.querySelector('.copied-text') : null;

    if (this.copyButton) {
      this.boundCopy = this.onCopy.bind(this);
      this.copyButton.addEventListener('click', this.boundCopy);
    }

    if (this.toggleBtn) {
      this.boundToggle = this.onToggle.bind(this);
      this.toggleBtn.addEventListener('click', this.boundToggle);

      // Debounced resize listener to recompute overflow
      this.boundResize = this.debounce(() => this.checkOverflow(), 250);
      window.addEventListener('resize', this.boundResize);

      // Observe content size changes (fonts load, responsive wraps, etc.)
      if ('ResizeObserver' in window && this.codePre) {
        this.ro = new ResizeObserver(() => this.checkOverflow());
        this.ro.observe(this.codePre);
      }

      // Initial check after paint
      requestAnimationFrame(() => this.checkOverflow());
    }
  }

  disconnect() {
    if (this.copyButton && this.boundCopy) {
      this.copyButton.removeEventListener('click', this.boundCopy);
    }
    if (this.toggleBtn && this.boundToggle) {
      this.toggleBtn.removeEventListener('click', this.boundToggle);
    }
    if (this.boundResize) {
      window.removeEventListener('resize', this.boundResize);
    }
    if (this.ro) {
      try { this.ro.disconnect(); } catch (_) {}
      this.ro = null;
    }
  }

  onCopy() {
    const codeContent = this.example.querySelector('code')?.textContent || '';
    navigator.clipboard.writeText(codeContent).then(() => {
      if (this.copyText && this.copiedText) {
        this.copyText.hidden = true;
        this.copiedText.hidden = false;
        setTimeout(() => {
          this.copyText.hidden = false;
          this.copiedText.hidden = true;
        }, 5000);
      }
    }).catch((err) => {
      console.error('Could not copy text: ', err);
    });
  }

  onToggle() {
    const isExpanded = this.example.getAttribute('data-expanded') === 'true';
    if (isExpanded) {
      this.example.classList.remove('max-h-96', 'overflow-auto');
      this.example.classList.add('max-h-48', 'overflow-hidden');
      this.example.setAttribute('data-expanded', 'false');
      if (this.expandText) this.expandText.hidden = false;
      if (this.collapseText) this.collapseText.hidden = true;
    } else {
      this.example.classList.remove('max-h-48', 'overflow-hidden');
      this.example.classList.add('max-h-96', 'overflow-auto');
      this.example.setAttribute('data-expanded', 'true');
      if (this.expandText) this.expandText.hidden = true;
      if (this.collapseText) this.collapseText.hidden = false;
    }
    // Re-check after DOM updates
    setTimeout(() => this.checkOverflow(), 0);
  }

  checkOverflow() {
    if (!this.toggleBtn) return;
    const isExpanded = this.example.getAttribute('data-expanded') === 'true';
    if (isExpanded) {
      this.toggleBtn.hidden = false;
    } else {
      const hasOverflow = this.codePre && (this.codePre.scrollHeight > this.example.clientHeight);
      this.toggleBtn.hidden = !hasOverflow;
    }
  }

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}
