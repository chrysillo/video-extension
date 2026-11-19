// Shared helpers for the feature scripts. Scripts listed together in a
// manifest entry share one global scope, so files loaded after this one
// can use `NoVideoLoop`.
const NoVideoLoop = (() => {
  'use strict';

  const proto = HTMLMediaElement.prototype;
  const isMedia = (node) => node instanceof HTMLMediaElement;

  // Run `handler(media, event)` for a media event anywhere on the page.
  // Media events don't bubble, but they do pass through the capture phase.
  const onMediaEvent = (type, handler) => {
    document.addEventListener(type, (e) => {
      if (isMedia(e.target)) handler(e.target, e);
    }, true);
  };

  // ---- play() guards -------------------------------------------------------
  // A guard receives the media element and returns a promise to hand back
  // instead of playing, or nothing to let playback go ahead.
  const playGuards = [];
  const origPlay = proto.play;
  proto.play = function (...args) {
    for (const guard of playGuards) {
      const blocked = guard(this);
      if (blocked) return blocked;
    }
    return origPlay.apply(this, args);
  };
  const addPlayGuard = (guard) => {
    playGuards.push(guard);
  };

  // ---- Boolean attributes that are forced off ------------------------------
  const blockedAttributes = new Set();

  const origSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    if (isMedia(this) && blockedAttributes.has(String(name).toLowerCase())) return;
    return origSetAttribute.call(this, name, value);
  };

  const stripBlockedAttributes = (node) => {
    if (!(node instanceof Element)) return;
    const media = isMedia(node) ? [node] : node.querySelectorAll('video, audio');
    for (const m of media) {
      for (const name of blockedAttributes) m.removeAttribute(name);
    }
  };

  // Catches attributes that arrive in parsed HTML or bypass setAttribute.
  const attributeObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes') stripBlockedAttributes(m.target);
      else m.addedNodes.forEach(stripBlockedAttributes);
    }
  });

  // Make the `name` property always read false and the attribute impossible to set.
  const blockMediaAttribute = (name) => {
    blockedAttributes.add(name);
    const desc = Object.getOwnPropertyDescriptor(proto, name);
    Object.defineProperty(proto, name, {
      configurable: true,
      enumerable: desc.enumerable,
      get() {
        return false;
      },
      set() {
        desc.set.call(this, false);
      },
    });
    attributeObserver.observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [...blockedAttributes],
    });
  };

  // ---- User intent ---------------------------------------------------------
  // True while the page has transient user activation (a recent click or key).
  const userIsInteracting = () =>
    navigator.userActivation ? navigator.userActivation.isActive : false;

  const INTENT_WINDOW_MS = 1500;
  let lastPointer = null;
  let lastKey = null;

  window.addEventListener('pointerdown', (e) => {
    lastPointer = { x: e.clientX, y: e.clientY, time: performance.now() };
  }, true);
  window.addEventListener('keydown', (e) => {
    if ([' ', 'Enter', 'k', 'K'].includes(e.key)) {
      lastKey = { target: e.target, time: performance.now() };
    }
  }, true);

  const pointIsOver = (el, x, y) => {
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  // True if the user has just clicked on this video, or pressed a play key
  // while focused on it or its player.
  const userWantsToPlay = (media) => {
    const now = performance.now();
    if (lastPointer && now - lastPointer.time < INTENT_WINDOW_MS &&
        pointIsOver(media, lastPointer.x, lastPointer.y)) {
      return true;
    }
    if (lastKey && now - lastKey.time < INTENT_WINDOW_MS) {
      const t = lastKey.target;
      const isPageLevel = t === document.body || t === document.documentElement || t === document;
      if (!isPageLevel && (t.contains(media) || media.contains(t))) return true;
    }
    return false;
  };

  return {
    isMedia,
    onMediaEvent,
    addPlayGuard,
    blockMediaAttribute,
    userIsInteracting,
    userWantsToPlay,
    pointIsOver,
  };
})();
