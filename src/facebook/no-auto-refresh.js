// Stops the feed refreshing itself (and jumping to the top) when you come
// back to the tab. Facebook decides to refresh after the tab has been
// hidden for a while, so the page is told the tab never stops being visible.
(() => {
  'use strict';

  const alwaysVisible = {
    hidden: false,
    webkitHidden: false,
    visibilityState: 'visible',
    webkitVisibilityState: 'visible',
  };

  for (const [name, value] of Object.entries(alwaysVisible)) {
    if (!(name in Document.prototype)) continue;
    Object.defineProperty(Document.prototype, name, {
      configurable: true,
      enumerable: true,
      get: () => value,
    });
  }

  // The event is dispatched on document, so a capture listener on window
  // runs before any of Facebook's own listeners and can swallow it.
  for (const type of ['visibilitychange', 'webkitvisibilitychange']) {
    window.addEventListener(type, (e) => e.stopImmediatePropagation(), true);
  }
})();
