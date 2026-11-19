// Round floating buttons drawn over the page. Each one lives in a closed
// shadow root so the site's styles can't reach it, and outside the site's
// own DOM tree so the site's handlers don't fire. Presses on it never reach
// the page.
(() => {
  'use strict';

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`
    button {
      all: unset;
      box-sizing: border-box;
      width: var(--size);
      height: var(--size);
      border-radius: 50%;
      display: grid;
      place-items: center;
      cursor: pointer;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      transition: background-color 0.15s;
    }
    button:hover { background: rgba(0, 0, 0, 0.75); }
    button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
    svg {
      width: var(--icon-size);
      height: var(--icon-size);
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `);

  // A 24x24 line icon from SVG path data. Built with DOM calls rather than
  // innerHTML, which a site's Trusted Types policy may reject.
  const createIcon = (paths) => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    for (const d of paths) {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      svg.append(path);
    }
    return svg;
  };

  // host element -> click handler
  const clickHandlers = new WeakMap();

  const createOverlayButton = ({ size, iconSize, iconPaths, label, onClick }) => {
    const host = document.createElement('div');
    host.style.cssText = `position: fixed; z-index: 2147483647; display: none; ` +
      `--size: ${size}px; --icon-size: ${iconSize}px;`;
    const root = host.attachShadow({ mode: 'closed' });
    root.adoptedStyleSheets = [sheet];

    const button = document.createElement('button');
    button.type = 'button';
    button.title = label;
    button.setAttribute('aria-label', label);
    button.append(createIcon(iconPaths));
    root.append(button);

    document.documentElement.append(host);
    clickHandlers.set(host, onClick);

    return {
      showAt(left, top) {
        host.style.left = `${left}px`;
        host.style.top = `${top}px`;
        host.style.display = 'block';
      },
      hide() {
        host.style.display = 'none';
      },
      remove() {
        host.remove();
      },
    };
  };

  const isOverlayButton = (el) => clickHandlers.has(el);

  // Swallow every part of a press so the site never sees it (press-and-hold
  // pauses Instagram Reels, a click can open the post). Events from inside
  // a shadow root show up with its host as their target.
  for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
    window.addEventListener(type, (e) => {
      const onClick = clickHandlers.get(e.target);
      if (!onClick) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (type === 'click') onClick();
    }, true);
  }

  Object.assign(NoVideoLoop, { createOverlayButton, isOverlayButton });
})();
