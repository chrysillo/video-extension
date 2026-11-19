// Double-clicking a post's photo or video no longer likes it. Clicking a
// video twice to play and pause it counts as a double-click.
(() => {
  'use strict';

  const { pointIsOver } = NoVideoLoop;

  // Ignore profile pictures, icons and other small images.
  const MIN_MEDIA_WIDTH = 120;

  // Instagram layers overlays above the media, so look at everything under
  // the cursor rather than just the click target.
  const isOverPostMedia = (x, y) =>
    document.elementsFromPoint(x, y).some((el) =>
      (el instanceof HTMLVideoElement || el instanceof HTMLImageElement) &&
      el.getBoundingClientRect().width >= MIN_MEDIA_WIDTH &&
      pointIsOver(el, x, y));

  window.addEventListener('dblclick', (e) => {
    if (!isOverPostMedia(e.clientX, e.clientY)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);
})();
