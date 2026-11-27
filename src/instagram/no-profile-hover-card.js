// Hovering over an account name anywhere on Instagram no longer pops up the
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
  // The browser's own name tooltip comes from a title on the link or on any
  // element inside it, so those all have to go.
  const stripTitles = (link) => {
    link.removeAttribute('title');
    for (const el of link.querySelectorAll('[title]')) el.removeAttribute('title');
  };

  const stop = (e, link) => {
    stripTitles(link);
    e.stopImmediatePropagation();
  };

  // Strip titles as soon as profile links appear, so no tooltip is ever
  // armed before the first hover event arrives.
  const sweep = (root) => {
    if (!(root instanceof Element)) return;
    const link = isProfileLink(root);
    if (link) stripTitles(link);
    for (const a of root.querySelectorAll('a[href]')) {
      if (isProfileLink(a) === a) stripTitles(a);
    }
  };

  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'attributes') sweep(r.target);
      else for (const n of r.addedNodes) sweep(n);
    }
  }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['title'] });

  for (const type of ['mouseover', 'pointerover', 'mouseenter', 'pointerenter', 'mousemove', 'pointermove']) {
    window.addEventListener(type, (e) => {
      const link = profileLinkOf(e.target);
      if (link) stop(e, link);
    }, true);
  }

  for (const type of ['mouseout', 'pointerout']) {
    window.addEventListener(type, (e) => {
      const link = profileLinkOf(e.relatedTarget);
      // Moving around inside the same link is fine to let through.
      if (link && !link.contains(e.target)) stop(e, link);
    }, true);
  }
})();
