// Geometry helpers for placing overlays on videos.
(() => {
  'use strict';

  const { visibleRect, isOverlayButton } = NoVideoLoop;

  const centreOf = (rect) => ({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  });

  const rectContains = (outer, inner, slack = 2) =>
    inner.left >= outer.left - slack && inner.right <= outer.right + slack &&
    inner.top >= outer.top - slack && inner.bottom <= outer.bottom + slack;

  // Share of the element's box, from 0 to 1, that the user can see.
  const visibleShare = (el) => {
    const box = el.getBoundingClientRect();
    const visible = visibleRect(el);
    if (!visible || !box.width || !box.height) return 0;
    return (visible.width * visible.height) / (box.width * box.height);
  };

  // Page elements at a point, topmost first, leaving out our own buttons.
  const pageElementsAt = (x, y) =>
    document.elementsFromPoint(x, y).filter((el) => !isOverlayButton(el));

  // True if the element paints a solid background over its box.
  const isOpaque = (el) => {
    const style = getComputedStyle(el);
    if (style.backgroundImage !== 'none') return true;
    // Computed colours come back as "rgb(r, g, b)" or "rgba(r, g, b, a)".
    const [, , , alpha = 1] = (style.backgroundColor.match(/[\d.]+/g) || [0, 0, 0, 0]).map(Number);
    return alpha >= 0.9;
  };

  // True if something that isn't part of the video's player (a header, a
  // dialog, a comments panel) is on top of the video at this point.
  const isCoveredAt = (video, x, y) => {
    const [top] = pageElementsAt(x, y);
    if (!top || top === video || top.contains(video)) return false;
    // Judge the whole branch the element hangs from, up to where it meets
    // the video's ancestors: a comment's text fits inside the video, but
    // the panel holding it doesn't. A solid background on the way up means
    // it hides the video, which the player's own overlays don't.
    const videoRect = video.getBoundingClientRect();
    let branch = top;
    while (branch.parentElement && !branch.parentElement.contains(video)) {
      if (branch !== top && isOpaque(branch)) return true;
      branch = branch.parentElement;
    }
    return isOpaque(branch) || !rectContains(videoRect, branch.getBoundingClientRect());
  };

  // True if anything is covering the box at its centre or near its corners.
  const isBoxCovered = (video, left, top, size) => {
    const inset = size * 0.15;
    const points = [
      [left + size / 2, top + size / 2],
      [left + inset, top + inset],
      [left + size - inset, top + inset],
      [left + inset, top + size - inset],
      [left + size - inset, top + size - inset],
    ];
    return points.some(([x, y]) => isCoveredAt(video, x, y));
  };

  Object.assign(NoVideoLoop, {
    centreOf, rectContains, visibleShare, pageElementsAt, isCoveredAt, isBoxCovered,
  });
})();
