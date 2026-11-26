// Makes the like count ("1,234 likes", "Liked by … and others") unclickable,
// so it no longer opens the list of people who liked the post.
(() => {
  'use strict';

  const LIKES_TEXT = /^(?:[\d.,]+\s*[KkMm]?\s+likes?|liked by\b.*)$/i;

  // How far above the click target to look for the like-count text, and the
  // longest text that can still be just the count rather than a whole post.
  const MAX_DEPTH = 4;
  const MAX_TEXT_LENGTH = 80;

  // Newer layouts show only a bare number beside the heart icon.
  const BARE_COUNT = /^\d[\d.,\s\u00a0\u202f]*\s*[KkMm]?$/;
  const LIKE_ICON = 'svg[aria-label="Like"], svg[aria-label="Unlike"]';
  const OTHER_ICONS = 'svg[aria-label="Comment"], svg[aria-label="Share"], svg[aria-label="Share Post"], svg[aria-label="Repost"], svg[aria-label="Save"], svg[aria-label="Remove"]';

  // A bare number whose closest preceding action icon is the heart, i.e. the
  // count sits right after the Like button, whether or not they share a
  // wrapper with the other action icons.
  const isBareLikeCount = (target) => {
    let el = target;
    while (el && el.textContent.trim().length <= MAX_TEXT_LENGTH && !BARE_COUNT.test(el.textContent.trim())) {
      el = el.parentElement;
      if (!el || el.querySelector('svg')) return false;
    }
    if (!el || el.querySelector('svg')) return false;
    for (let anc = el.parentElement, depth = 0; anc && depth < MAX_DEPTH + 4; anc = anc.parentElement, depth++) {
      const icons = [...anc.querySelectorAll(`${LIKE_ICON}, ${OTHER_ICONS}`)]
        .filter((icon) => icon.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
      if (icons.length) return icons[icons.length - 1].matches(LIKE_ICON);
    }
    return false;
  };

  const isLikeCount = (target) => {
    if (target.closest('a[href*="/liked_by/"]')) return true;
    if (isBareLikeCount(target)) return true;
    for (let el = target, depth = 0; el && depth < MAX_DEPTH; el = el.parentElement, depth++) {
      const text = el.textContent.trim();
      if (text.length > MAX_TEXT_LENGTH) break;
      if (LIKES_TEXT.test(text)) return true;
    }
    return false;
  };

  const block = (e) => {
    if (!(e.target instanceof Element) || !isLikeCount(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  for (const type of ['click', 'pointerup', 'mouseup', 'touchend']) {
    window.addEventListener(type, block, true);
  }

  // Show the normal arrow over the count rather than the pointing hand.
  window.addEventListener('mouseover', (e) => {
    if (!(e.target instanceof Element) || !isLikeCount(e.target)) return;
    for (let el = e.target, depth = 0; el && depth < MAX_DEPTH; el = el.parentElement, depth++) {
      if (el.querySelector('svg')) break;
      el.style.setProperty('cursor', 'default', 'important');
    }
  }, true);
})();
