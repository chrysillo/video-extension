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

  // True if something that isn't part of the video's player (a header, a
  // dialog) is on top of the video at this point.
  const isCoveredAt = (video, x, y) => {
    const [top] = pageElementsAt(x, y);
    if (!top || top === video || top.contains(video)) return false;
    return !rectContains(video.getBoundingClientRect(), top.getBoundingClientRect());
  };

  Object.assign(NoVideoLoop, { centreOf, rectContains, visibleShare, pageElementsAt, isCoveredAt });
})();
