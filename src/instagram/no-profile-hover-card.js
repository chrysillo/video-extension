// On the home feed, hovering over an account name no longer pops up the
// profile preview card.
(() => {
  'use strict';

  // First path segments that aren't account names.
  const NOT_PROFILES = new Set([
    'explore', 'reels', 'reel', 'p', 'stories', 'direct', 'accounts', 'tv', 'about', 'legal', 'web',
  ]);

  const isProfileLink = (el) => {
    const link = el.closest('a[href]');
    if (!link) return null;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    return parts.length === 1 && !NOT_PROFILES.has(parts[0]) ? link : null;
  };

  const profileLinkOf = (node) => (node instanceof Element ? isProfileLink(node) : null);

  // React works out "mouse entered X" mostly from the "out" event of the
  // element the mouse left, whose relatedTarget is X, so those have to be
  // stopped too, not just the "over" and "enter" events on the link.
  const stop = (e, link) => {
    link.removeAttribute('title');
    e.stopImmediatePropagation();
  };

  for (const type of ['mouseover', 'pointerover', 'mouseenter', 'pointerenter']) {
    window.addEventListener(type, (e) => {
      if (location.pathname !== '/') return;
      const link = profileLinkOf(e.target);
      if (link) stop(e, link);
    }, true);
  }

  for (const type of ['mouseout', 'pointerout']) {
    window.addEventListener(type, (e) => {
      if (location.pathname !== '/') return;
      const link = profileLinkOf(e.relatedTarget);
      // Moving around inside the same link is fine to let through.
      if (link && !link.contains(e.target)) stop(e, link);
    }, true);
  }
})();
