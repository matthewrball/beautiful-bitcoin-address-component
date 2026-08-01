import { JSDOM } from 'jsdom';

// Boots a jsdom window and copies the globals the component touches onto
// the Node global, so bitcoin-address.js (a classic script) runs unmodified.
export function setupDOM() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'https://example.test/',
    pretendToBeVisual: true,
  });
  const { window } = dom;

  // jsdom has no matchMedia; the component only needs a listener-capable stub
  window.matchMedia = function () {
    return {
      matches: false,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    };
  };

  global.window = window;
  global.document = window.document;
  global.HTMLElement = window.HTMLElement;
  global.customElements = window.customElements;
  global.CustomEvent = window.CustomEvent;
  global.MutationObserver = window.MutationObserver;
  global.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  Object.defineProperty(globalThis, 'navigator', {
    value: window.navigator,
    configurable: true,
  });

  return dom;
}
