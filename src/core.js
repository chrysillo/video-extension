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
  // Each blocked attribute maps to the elements the user has switched it on
  // for (e.g. with the loop button). Everywhere else it stays off, whatever
  // the page tries.
  const blockedAttributes = new Map();
  const nativeSetters = new Map();

  const isAllowedOn = (media, name) => blockedAttributes.get(name).has(media);

  const origSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    const lower = String(name).toLowerCase();
    if (isMedia(this) && blockedAttributes.has(lower) && !isAllowedOn(this, lower)) {
      if (!isUserToggleable(lower) || !userIsInteracting()) return;
      blockedAttributes.get(lower).add(this);
    }
    return origSetAttribute.call(this, name, value);
  };

  // Put each blocked attribute back to what the user chose for this element.
  const syncAttributes = (media) => {
    for (const name of blockedAttributes.keys()) {
      const wanted = isAllowedOn(media, name);
      if (media.hasAttribute(name) !== wanted) nativeSetters.get(name).call(media, wanted);
    }
  };

  const syncTree = (node) => {
    if (!(node instanceof Element)) return;
    if (isMedia(node)) syncAttributes(node);
    else node.querySelectorAll('video, audio').forEach(syncAttributes);
  };

  // Catches attributes that arrive in parsed HTML or bypass setAttribute.
  const attributeObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes') syncTree(m.target);
      else m.addedNodes.forEach(syncTree);
    }
  });

  // Switch a blocked attribute on or off for one element at the user's request.
  const setAllowed = (media, name, on) => {
    const allowed = blockedAttributes.get(name);
    if (on) allowed.add(media);
    else allowed.delete(media);
    syncAttributes(media);
  };

  // Blocked attributes the page may switch on straight after a click or key
  // press, for players whose own menu lets the user choose (YouTube's loop).
  // The page can always switch these off. `when` limits it to some pages.
  const userToggleable = new Map();
  const allowUserToggle = (name, when = () => true) => {
    userToggleable.set(name, when);
  };
  const isUserToggleable = (name) => userToggleable.has(name) && userToggleable.get(name)();

  // Stop the page setting `name`: the property and attribute stay off
  // unless the user has switched them on for that element.
  const blockMediaAttribute = (name) => {
    const allowed = new WeakSet();
    blockedAttributes.set(name, allowed);
    const desc = Object.getOwnPropertyDescriptor(proto, name);
    nativeSetters.set(name, desc.set);
    Object.defineProperty(proto, name, {
      configurable: true,
      enumerable: desc.enumerable,
      get() {
        return isAllowedOn(this, name);
      },
      set(value) {
        if (!value) {
          if (userToggleable.has(name)) allowed.delete(this);
        } else if (isUserToggleable(name) && userIsInteracting()) {
          allowed.add(this);
        }
        desc.set.call(this, isAllowedOn(this, name));
      },
    });
    attributeObserver.observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [...blockedAttributes.keys()],
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

  // The part of `el` the user can actually see, or null if none of it.
  // Carousels stack their slides in the same place and clip the off-screen
  // ones with `overflow`, so the element's own box isn't enough.
  const visibleRect = (el) => {
    const r = el.getBoundingClientRect();
    let { left, top, right, bottom } = r;
    for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
        return null;
      }
      if (node === el) continue;
      const clipX = style.overflowX !== 'visible';
      const clipY = style.overflowY !== 'visible';
      if (!clipX && !clipY) continue;
      const c = node.getBoundingClientRect();
      if (clipX) {
        left = Math.max(left, c.left);
        right = Math.min(right, c.right);
      }
      if (clipY) {
        top = Math.max(top, c.top);
        bottom = Math.min(bottom, c.bottom);
      }
      if (right <= left || bottom <= top) return null;
    }
    left = Math.max(left, 0);
    top = Math.max(top, 0);
    right = Math.min(right, innerWidth);
    bottom = Math.min(bottom, innerHeight);
    if (right <= left || bottom <= top) return null;
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  };

  // True if the point is on a part of `el` the user can see.
  const pointIsOver = (el, x, y) => {
    const r = visibleRect(el);
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  // Media one of our own buttons has just been asked to play, with the time.
  const requestedPlays = new WeakMap();
  const requestPlay = (media) => {
    requestedPlays.set(media, performance.now());
  };

  // True if the user has just clicked on this video, or pressed a play key
  // while focused on it or its player, or used one of our buttons on it.
  const userWantsToPlay = (media) => {
    const now = performance.now();
    if (now - (requestedPlays.get(media) ?? -Infinity) < INTENT_WINDOW_MS) return true;
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
    allowUserToggle,
    setAllowed,
    userIsInteracting,
    userWantsToPlay,
    requestPlay,
    visibleRect,
    pointIsOver,
  };
})();
