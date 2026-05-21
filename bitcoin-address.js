(function() {
  'use strict';

  if (customElements.get('bitcoin-address')) return;

  var COPY_SVG = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4.167 12.5c-.775 0-1.167 0-1.472-.127a1.667 1.667 0 01-.902-.902C1.667 11.167 1.667 10.775 1.667 10V4.333c0-.933 0-1.4.181-1.756.16-.314.415-.569.729-.729.356-.181.823-.181 1.756-.181H10c.775 0 1.167 0 1.471.127.391.17.715.493.902.902.127.305.127.696.127 1.471m-2.333 14.166h5.5c.933 0 1.4 0 1.756-.181.314-.16.569-.415.729-.729.181-.356.181-.823.181-1.756v-5.5c0-.934 0-1.4-.181-1.757a1.667 1.667 0 00-.729-.728c-.356-.182-.823-.182-1.756-.182h-5.5c-.934 0-1.4 0-1.757.182-.314.16-.569.414-.728.728-.182.357-.182.823-.182 1.757v5.5c0 .933 0 1.4.182 1.756.16.314.414.569.728.729.357.181.823.181 1.757.181z" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHECK_SVG = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.667 5L7.5 14.167 3.333 10" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var EYE_SVG = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2.017 10.595c-.114-.18-.17-.27-.202-.409a.994.994 0 010-.372c.032-.139.088-.229.202-.409C2.954 7.921 5.746 4.167 10 4.167s7.046 3.754 7.984 5.238c.113.18.17.27.201.409a.994.994 0 010 .372c-.032.139-.088.229-.201.409C17.046 12.079 14.254 15.833 10 15.833S2.955 12.08 2.017 10.595z" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var EYE_OFF_SVG = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8.952 4.244A7.374 7.374 0 0110 4.167c4.254 0 7.046 3.754 7.983 5.238.114.18.17.27.202.409a.994.994 0 010 .372c-.032.139-.088.229-.202.409-.322.51-.814 1.21-1.47 1.905M5.633 5.633C3.762 6.956 2.504 8.813 2.016 9.586c-.113.18-.17.27-.201.408a.994.994 0 000 .373c.031.138.088.228.201.408C2.954 12.2 5.746 15.953 10 15.953c1.713 0 3.161-.64 4.366-1.587M2.5 2.5l15 15M8.232 8.232A2.5 2.5 0 0010 12.5c.69 0 1.318-.283 1.768-.732" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var TIMING = { animationLock: 350, copyFeedback: 2000 };

  function detectFormat(address) {
    if (address.startsWith('bc1q')) return 'bech32';
    if (address.startsWith('bc1p')) return 'taproot';
    if (address.startsWith('3')) return 'p2sh';
    if (address.startsWith('1')) return 'legacy';
    return 'unknown';
  }

  function isMultiline(address) {
    return address.length > 40;
  }

  function computeTruncated(address) {
    var prefixLen = 6;
    var suffixLen = 6;
    var prefix = address.slice(0, prefixLen);
    var suffix = address.slice(-suffixLen);
    var middle = address.slice(prefixLen, -suffixLen);
    var truncMiddle = middle.slice(0, 3) + '...' + middle.slice(-3);
    return { prefix: prefix, middle: truncMiddle, suffix: suffix };
  }

  function splitIntoGroups(str, size) {
    var groups = [];
    for (var i = 0; i < str.length; i += size) {
      groups.push(str.slice(i, i + size));
    }
    return groups;
  }

  function computeGroups(address, multi) {
    var prefixLen = 6;
    var suffixLen = 6;
    var prefix = address.slice(0, prefixLen);
    var suffix = address.slice(-suffixLen);
    var body = address.slice(prefixLen, -suffixLen);

    if (multi) {
      var mid = Math.ceil(body.length / 2);
      return {
        prefix: prefix,
        line1: splitIntoGroups(body.slice(0, mid), 7),
        line2: splitIntoGroups(body.slice(mid), 7),
        suffix: suffix
      };
    }

    return { prefix: prefix, groups: splitIntoGroups(body, 7), suffix: suffix };
  }

  var STYLES = `
    :host {
      display: block;
      width: 100%;
      max-width: 380px;
      font-family: var(--btc-font-sans, inherit);
      --_text-primary: var(--btc-text-primary, #181d27);
      --_text-secondary: var(--btc-text-secondary, #414651);
      --_text-tertiary: var(--btc-text-tertiary, #535862);
      --_border: var(--btc-border, #d5d7da);
      --_bg-subtle: var(--btc-bg-subtle, #fafafa);
      --_bg-secondary: var(--btc-bg-secondary, #ffffff);
      --_bg-hover: var(--btc-bg-hover, #f9fafb);
      --_success: var(--btc-success, #079455);
      --_icon: var(--btc-icon, #a4a7ae);
      --_icon-success: var(--btc-icon-success, #079455);
      --_shadow-xs: 0 1px 2px rgba(10, 13, 18, 0.05);
      --_radius: 8px;
      --_ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
      --_ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    :host(.dark) {
      --_text-primary: var(--btc-text-primary, #f5f5f6);
      --_text-secondary: var(--btc-text-secondary, #cecfd2);
      --_text-tertiary: var(--btc-text-tertiary, #94969c);
      --_border: var(--btc-border, #333741);
      --_bg-subtle: var(--btc-bg-subtle, #1f242f);
      --_bg-secondary: var(--btc-bg-secondary, #161b26);
      --_bg-hover: var(--btc-bg-hover, #1f242f);
      --_success: var(--btc-success, #47cd89);
      --_icon: var(--btc-icon, #85888e);
      --_icon-success: var(--btc-icon-success, #47cd89);
      --_shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .container { display: flex; flex-direction: column; min-height: 130px; }
    .container.multiline { min-height: 148px; }


    .label {
      font-size: 14px;
      font-weight: 600;
      color: var(--_text-primary);
      line-height: 20px;
      margin-bottom: 6px;
      transition: color 300ms ease;
    }

    .row {
      display: flex;
      border-radius: var(--_radius);
      border: 1px solid var(--_border);
      box-shadow: var(--_shadow-xs);
      overflow: hidden;
      background-color: var(--_bg-subtle);
      transition: border-color 300ms ease;
    }

    .display {
      flex: 1;
      background-color: var(--_bg-subtle);
      padding: 2px 14px 0;
      display: flex;
      align-items: center;
      min-height: 44px;
      position: relative;
      transition: background-color 300ms ease;
    }

    .multiline .display { height: 78px; padding-top: 0; padding-bottom: 0; }
    .multiline .crossfade { height: auto; }
    .multiline .layer--absolute { top: 50%; transform: translateY(-50%); }
    .multiline .layer--visible { animation-duration: 250ms; animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }

    .text {
      font-family: var(--btc-font-mono, ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace);
      font-size: 16px;
      line-height: 1.2;
      background-color: transparent;
    }

    .crossfade { cursor: text; }

    .text--full { white-space: normal; word-break: break-all; line-height: 1.4; }
    .highlight { color: var(--_success); line-height: 1.2; transition: color 300ms ease; }
    .muted { color: var(--_text-tertiary); line-height: 1.2; transition: color 300ms ease; }
    .group { margin-right: 0.25em; }

    @keyframes clip-reveal {
      from { clip-path: inset(0 100% 0 0); }
      to { clip-path: inset(0 0 0 0); }
    }

    .crossfade {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      background-color: transparent;
    }

    .layer {
      background-color: transparent;
      filter: blur(0px);
      transition: opacity 100ms ease-out, filter 100ms ease-out;
    }

    .layer--hidden {
      opacity: 0;
      filter: blur(4px);
      transition: opacity 100ms ease-out, filter 100ms ease-out;
    }

    .layer--absolute {
      position: absolute;
      top: 50%;
      left: 0;
      width: 350px;
      transform: translateY(-50%);
      opacity: 0;
      filter: blur(4px);
      background-color: var(--_bg-subtle) !important;
      will-change: opacity, filter;
      transition: opacity 100ms ease-out, filter 100ms ease-out;
      pointer-events: none;
    }

    .layer--visible { pointer-events: auto; }

    .layer--visible {
      opacity: 1;
      filter: blur(0px);
      animation: clip-reveal 150ms cubic-bezier(0.25, 0, 0.5, 1) both;
    }

    /* Copy button (inline) */
    .copy-inline {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 16px;
      background-color: var(--_bg-subtle);
      border: none;
      border-left: 1px solid var(--_border);
      cursor: pointer;
      -webkit-user-select: none;
      user-select: none;
      transition: opacity 300ms var(--_ease-out-expo), transform 450ms var(--_ease-spring), width 450ms var(--_ease-out-expo), padding 450ms var(--_ease-out-expo), background-color 150ms ease-out;
    }

    .copy-inline * { cursor: pointer; }
    .copy-inline:hover { background-color: var(--_bg-hover); }
    .copy-inline:active { transform: scale(0.97); }

    .copy-inline.hidden {
      visibility: hidden;
      pointer-events: none;
    }

    .copy-inline__text {
      display: inline-block;
      font-size: 16px;
      font-weight: 600;
      color: var(--_text-secondary);
      line-height: 24px;
      padding: 0 2px;
      width: 38px;
      text-align: center;
      transition: color 250ms var(--_ease-out-expo), width 400ms var(--_ease-spring);
    }

    .copy-inline__text.success { color: var(--_success); width: 56px; }

    /* Action buttons */
    .btn-container { position: relative; height: 36px; margin-top: 6px; flex-shrink: 0; }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 12px;
      background-color: var(--_bg-secondary);
      border: 1px solid var(--_border);
      border-radius: var(--_radius);
      box-shadow: var(--_shadow-xs);
      cursor: pointer;
      transition: background-color 150ms ease-out;
    }

    .btn:hover { background-color: var(--_bg-hover); }
    .btn:active { transform: scale(0.97); }
    .btn--full { width: 100%; }
    .btn--flex { flex: 1; }

    .btn__text {
      font-size: 14px;
      font-weight: 600;
      color: var(--_text-secondary);
      line-height: 20px;
      padding: 0 2px;
      transition: color 300ms ease;
    }

    .btn__text--copy { width: 34px; }
    .btn__text--copy.success { width: 48px; color: var(--_success); }
    .btn__icon { flex-shrink: 0; }
    .btn__icon path { stroke: var(--_icon); transition: stroke 300ms ease; }

    .btn-row {
      position: absolute;
      inset: 0;
      display: flex;
      gap: 6px;
      opacity: 0;
      transform: translateY(6px) scale(0.97);
      pointer-events: none;
      transition: opacity 350ms var(--_ease-out-expo), transform 350ms var(--_ease-spring);
    }

    .btn-row.visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }

    .btn-view {
      position: absolute;
      inset: 0;
      transition: opacity 350ms var(--_ease-out-expo), transform 350ms var(--_ease-spring);
    }

    .btn-view.hidden { opacity: 0; transform: translateY(-6px) scale(0.97); pointer-events: none; }

    /* Copy icon animation */
    .copy-icon { position: relative; width: 20px; height: 20px; flex-shrink: 0; }
    .copy-icon svg { position: absolute; inset: 0; }

    .copy-icon .icon-copy {
      opacity: 1;
      transform: scale(1) rotate(0deg);
      transition: opacity 350ms var(--_ease-out-expo) 50ms, transform 500ms var(--_ease-spring) 50ms;
    }
    .copy-icon .icon-copy path { stroke: var(--_icon); }

    .copy-icon .icon-check {
      opacity: 0;
      transform: scale(0.3) rotate(-45deg);
      transition: opacity 300ms var(--_ease-out-expo), transform 400ms var(--_ease-out-expo);
    }
    .copy-icon .icon-check path { stroke: var(--_icon-success); }

    .copy-icon.success .icon-copy {
      opacity: 0 !important;
      transform: scale(0.3) rotate(45deg) !important;
      transition: opacity 300ms var(--_ease-out-expo), transform 400ms var(--_ease-out-expo) !important;
    }
    .copy-icon.success .icon-check {
      opacity: 1 !important;
      transform: scale(1) rotate(0deg) !important;
      transition: opacity 300ms var(--_ease-out-expo) 50ms, transform 500ms var(--_ease-spring) 50ms !important;
    }

    @media (pointer: coarse) { .btn, .copy-inline { min-height: 44px; } }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        filter: none !important;
      }
    }

    @media (max-width: 480px) {
      :host { width: 100%; }
      .text { font-size: 14px; }
      .display { padding: 2px 12px 0; height: 40px; }
      .multiline .display { height: 58px; }
      .copy-inline { padding: 10px 12px; gap: 4px; }
      .copy-inline__text { font-size: 14px; width: 34px; }
      .copy-inline__text.success { width: 52px; }
      .btn { padding: 10px 8px; gap: 4px; }
      .btn__text { font-size: 14px; }
      .btn__icon { width: 18px; height: 18px; }
      .btn-container { height: 40px; }
      .btn__text--copy { width: 34px; }
      .btn__text--copy.success { width: 48px; }
    }
  `;

  function buildCopyIcon(role) {
    return '<span class="copy-icon" data-role="' + role + '">' +
      '<span class="icon-copy">' + COPY_SVG + '</span>' +
      '<span class="icon-check">' + CHECK_SVG + '</span>' +
      '</span>';
  }

  function buildTruncatedHTML(t) {
    return '<span class="highlight">' + t.prefix + '</span>' +
      '<span class="muted">' + t.middle + '</span>' +
      '<span class="highlight">' + t.suffix + '</span>';
  }

  function groupsToHTML(groups) {
    return groups.map(function(g) { return '<span class="group">' + g + '</span>'; }).join('');
  }

  function buildFullHTML(f, multi) {
    var bodyHTML = multi
      ? groupsToHTML(f.line1) + '<br>' + groupsToHTML(f.line2)
      : groupsToHTML(f.groups);

    return '<span class="highlight group">' + f.prefix + '</span>' +
      '<span class="muted">' + bodyHTML + '</span>' +
      '<span class="highlight">' + f.suffix + '</span>';
  }

  class BitcoinAddressElement extends HTMLElement {
    static get observedAttributes() {
      return ['address', 'format', 'label', 'theme'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._expanded = false;
      this._animating = false;
      this._observer = null;
      this._mqListener = null;
    }

    connectedCallback() {
      this._render();
      this._setupTheme();
    }

    disconnectedCallback() {
      if (this._observer) this._observer.disconnect();
      if (this._mqListener) {
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.removeEventListener('change', this._mqListener);
      }
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal !== newVal && this.shadowRoot.querySelector('.container')) {
        this._render();
        this._setupTheme();
      }
    }

    get address() { return this.getAttribute('address') || ''; }
    get format() { return this.getAttribute('format') || 'auto'; }
    get label() { return this.getAttribute('label') || 'Bitcoin address'; }
    get theme() { return this.getAttribute('theme') || 'auto'; }

    _render() {
      var address = this.address;
      if (!address) { this.shadowRoot.innerHTML = ''; return; }

      var fmt = this.format === 'auto' ? detectFormat(address) : this.format;
      var multi = isMultiline(address);
      var trunc = computeTruncated(address);
      var full = computeGroups(address, multi);

      var fullClass = 'text layer layer--absolute' + (multi ? ' text--full' : '');

      this.shadowRoot.innerHTML = '<style>' + STYLES + '</style>' +
        '<div class="container' + (multi ? ' multiline' : '') + '">' +
          '<label class="label">' + this.label + '</label>' +
          '<div class="row">' +
            '<div class="display" data-address="' + address + '">' +
              '<div class="crossfade">' +
                '<span class="text layer" data-role="truncated">' + buildTruncatedHTML(trunc) + '</span>' +
                '<span class="' + fullClass + '" data-role="full">' + buildFullHTML(full, multi) + '</span>' +
              '</div>' +
            '</div>' +
            '<button class="copy-inline" data-action="copy-inline" aria-label="Copy address">' +
              buildCopyIcon('copy-inline') +
              '<span class="copy-inline__text">Copy</span>' +
            '</button>' +
          '</div>' +
          '<div class="btn-container">' +
            '<div class="btn-view" data-role="view-btn">' +
              '<button class="btn btn--full" data-action="toggle">' +
                '<span class="btn__icon">' + EYE_SVG + '</span>' +
                '<span class="btn__text">View full address</span>' +
              '</button>' +
            '</div>' +
            '<div class="btn-row" data-role="btn-row">' +
              '<button class="btn btn--flex" data-action="toggle">' +
                '<span class="btn__icon">' + EYE_OFF_SVG + '</span>' +
                '<span class="btn__text">Hide full address</span>' +
              '</button>' +
              '<button class="btn btn--flex" data-action="copy-bottom" aria-label="Copy address">' +
                buildCopyIcon('copy-bottom') +
                '<span class="btn__text btn__text--copy">Copy</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>';

      this._expanded = false;
      this._animating = false;
      this._bindEvents();
    }

    _bindEvents() {
      var self = this;
      var root = this.shadowRoot;

      root.querySelectorAll('[data-action="toggle"]').forEach(function(btn) {
        btn.addEventListener('click', function() { self._toggle(); });
      });

      root.querySelector('[data-action="copy-inline"]').addEventListener('click', function() {
        self._copy('inline');
      });

      root.querySelector('[data-action="copy-bottom"]').addEventListener('click', function() {
        self._copy('bottom');
      });

      var display = root.querySelector('.display');
      display.addEventListener('click', function(e) {
        if (e.detail >= 3) {
          e.preventDefault();
          var sel = display.getRootNode().getSelection
            ? display.getRootNode().getSelection()
            : window.getSelection();
          var visible = self._expanded
            ? root.querySelector('[data-role="full"]')
            : root.querySelector('[data-role="truncated"]');
          var range = document.createRange();
          range.selectNodeContents(visible);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      });

      self.addEventListener('copy', function(e) {
        e.preventDefault();
        e.clipboardData.setData('text/plain', self.address);
      });
    }

    _toggle() {
      if (this._animating) return;
      this._animating = true;
      this._expanded = !this._expanded;

      var root = this.shadowRoot;
      var truncated = root.querySelector('[data-role="truncated"]');
      var full = root.querySelector('[data-role="full"]');
      var copyInline = root.querySelector('[data-action="copy-inline"]');
      var viewBtn = root.querySelector('[data-role="view-btn"]');
      var btnRow = root.querySelector('[data-role="btn-row"]');

      if (this._expanded) {
        copyInline.classList.add('hidden');
        viewBtn.classList.add('hidden');
        btnRow.classList.add('visible');
        truncated.classList.add('layer--hidden');
        full.classList.add('layer--visible');
      } else {
        copyInline.classList.remove('hidden');
        viewBtn.classList.remove('hidden');
        btnRow.classList.remove('visible');
        truncated.classList.remove('layer--hidden');
        full.classList.remove('layer--visible');
      }

      var self = this;
      setTimeout(function() { self._animating = false; }, TIMING.animationLock);

      this.dispatchEvent(new CustomEvent('bitcoin-address:toggle', {
        bubbles: true,
        detail: { expanded: this._expanded }
      }));
    }

    _copy(location) {
      var self = this;
      var text = this.address;

      var doIt = (navigator.clipboard && navigator.clipboard.writeText)
        ? navigator.clipboard.writeText(text).then(function() { return true; }).catch(function() { return self._fallbackCopy(text); })
        : Promise.resolve(this._fallbackCopy(text));

      doIt.then(function(success) {
        var detail = { address: text, success: success };
        self.dispatchEvent(new CustomEvent('bitcoin-address:copy', { bubbles: true, detail: detail }));

        var root = self.shadowRoot;
        var isInline = location === 'inline';
        var iconEl = root.querySelector('[data-role="copy-' + location + '"].copy-icon');
        var textEl = isInline
          ? root.querySelector('.copy-inline__text')
          : root.querySelector('[data-action="copy-bottom"] .btn__text--copy');

        self._showCopySuccess(iconEl, textEl);
      });
    }

    _fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      try { return document.execCommand('copy'); }
      catch(e) { return false; }
      finally { ta.remove(); }
    }

    _showCopySuccess(iconEl, textEl) {
      iconEl.classList.add('success');
      textEl.classList.add('success');
      textEl.textContent = 'Copied';

      setTimeout(function() {
        textEl.style.opacity = '0';
        textEl.style.transition = 'opacity 200ms ease-out';

        setTimeout(function() {
          iconEl.classList.remove('success');
          textEl.classList.remove('success');
          textEl.textContent = 'Copy';

          requestAnimationFrame(function() {
            textEl.style.opacity = '1';
            textEl.style.transition = 'opacity 300ms ease-in';
          });
        }, 200);
      }, TIMING.copyFeedback);
    }

    _setupTheme() {
      var self = this;
      var theme = this.theme;

      if (theme === 'dark') {
        this.classList.add('dark');
      } else if (theme === 'light') {
        this.classList.remove('dark');
      } else {
        this._syncThemeFromHost();

        if (!this._observer) {
          this._observer = new MutationObserver(function() { self._syncThemeFromHost(); });
          this._observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        }

        if (!this._mqListener) {
          var mq = window.matchMedia('(prefers-color-scheme: dark)');
          this._mqListener = function() { self._syncThemeFromHost(); };
          mq.addEventListener('change', this._mqListener);
        }
      }
    }

    _syncThemeFromHost() {
      var html = document.documentElement;
      var isDark = html.classList.contains('dark') || html.classList.contains('theme--dark');
      this.classList.toggle('dark', isDark);
    }
  }

  customElements.define('bitcoin-address', BitcoinAddressElement);
})();
