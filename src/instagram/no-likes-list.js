// Makes the like count ("1,234 likes", "Liked by … and others") unclickable,
// so it no longer opens the list of people who liked the post.
(() => {
  'use strict';

  const LIKES_TEXT = /^(?:[\d.,]+\s*[KkMm]?\s+likes?|liked by\b.*)$/i;

  // How far above the click target to look for the like-count text, and the
  // longest text that can still be just the count rather than a whole post.
  const MAX_DEPTH = 4;
  const MAX_TEXT_LENGTH = 80;

  const isLikeCount = (target) => {
    if (target.closest('a[href*="/liked_by/"]')) return true;
    for (let el = target, depth = 0; el && depth < MAX_DEPTH; el = el.parentElement, depth++) {
      const text = el.textContent.trim();
      if (text.length > MAX_TEXT_LENGTH) break;
      if (LIKES_TEXT.test(text)) return true;
    }
    return false;
  };

  window.addEventListener('click', (e) => {
    if (!(e.target instanceof Element) || !isLikeCount(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);
})();
