// Keeps overlays on videos up to date. Calls `render(video)` for every
// <video> on the page whenever an overlay might need to move, appear or
// disappear, and `forget(video)` once a video leaves the page.
(() => {
  'use strict';

  const { onMediaEvent } = NoVideoLoop;

  // Sites add videos without scrolling (e.g. on first load), so look again
  // every so often too.
  const REFRESH_INTERVAL_MS = 500;

  // Returns a function that asks for a render on the next frame.
  const watchVideos = ({ render, forget }) => {
    const known = new Set();
    let frame = 0;

    const renderAll = () => {
      frame = 0;
      for (const video of known) {
        if (video.isConnected) continue;
        known.delete(video);
        forget(video);
      }
      for (const video of document.querySelectorAll('video')) {
        known.add(video);
        render(video);
      }
    };

    const scheduleRender = () => {
      if (!frame) frame = requestAnimationFrame(renderAll);
    };

    window.addEventListener('scroll', scheduleRender, { capture: true, passive: true });
    window.addEventListener('resize', scheduleRender, { passive: true });
    setInterval(scheduleRender, REFRESH_INTERVAL_MS);
    for (const type of ['play', 'pause', 'loadstart']) onMediaEvent(type, scheduleRender);

    return scheduleRender;
  };

  Object.assign(NoVideoLoop, { watchVideos });
})();
