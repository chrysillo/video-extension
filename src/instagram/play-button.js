// Finds Instagram's play button, which sits over the centre of a paused
// video.
(() => {
  'use strict';

  const { centreOf, pageElementsAt } = NoVideoLoop;

  // How far off-centre the play button's own centre may be.
  const CENTRE_TOLERANCE = 8;
  const MIN_WIDTH = 24;
  // Anything wider than this share of the video is an overlay, not a button.
  const MAX_SHARE_OF_VIDEO = 0.4;

  // Width of the play button over `video`, or 0 if none is showing. Takes
  // the largest small element centred on the video.
  const playButtonWidth = (video) => {
    const rect = video.getBoundingClientRect();
    const centre = centreOf(rect);
    let widest = 0;
    for (const el of pageElementsAt(centre.x, centre.y)) {
      if (el === video) continue;
      const r = el.getBoundingClientRect();
      const c = centreOf(r);
      const centred = Math.abs(c.x - centre.x) < CENTRE_TOLERANCE &&
        Math.abs(c.y - centre.y) < CENTRE_TOLERANCE;
      if (centred && r.width >= MIN_WIDTH && r.width <= rect.width * MAX_SHARE_OF_VIDEO) {
        widest = Math.max(widest, r.width);
      }
    }
    return widest;
  };

  Object.assign(NoVideoLoop, { playButtonWidth });
})();
