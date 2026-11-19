// Tells the page its tab never stops being visible. Sites check this to
// pause videos in background tabs (Instagram) or to refresh the feed when
// you come back (Facebook).
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

  // These are dispatched on document, so a capture listener on window runs
  // before any of the page's own listeners and can swallow them. "freeze"
  // and "resume" fire when the browser suspends a background tab and wakes
  // it up again.
  for (const type of ['visibilitychange', 'webkitvisibilitychange', 'freeze', 'resume']) {
    window.addEventListener(type, (e) => e.stopImmediatePropagation(), true);
  }
})();
