// Tells the page its window never loses focus, so switching to another
// window doesn't pause videos.
(() => {
  'use strict';

  Document.prototype.hasFocus = () => true;

  // Only the window's own focus changes are swallowed. Focus moving between
  // elements on the page passes through window too and is left alone.
  for (const type of ['blur', 'focus']) {
    window.addEventListener(type, (e) => {
      if (e.target === window) e.stopImmediatePropagation();
    }, true);
  }
})();
