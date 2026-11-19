// On the home feed, clicking a video plays or pauses it in place instead of
// opening the post. Small controls on the video (mute, tags, the player's
// control bar) still work.
(() => {
  'use strict';

  const { pointIsOver } = NoVideoLoop;

  // A clickable element covering less than this share of the video is
  // treated as one of the player's own buttons and left alone.
  const CONTROL_MAX_AREA_RATIO = 0.25;

  // Instagram's feed is "/", Facebook's is "/" or "/home.php".
  const HOME_FEED_PATHS = ['/', '/home.php'];

  const isHomeFeed = () => HOME_FEED_PATHS.includes(location.pathname);

  // Sites layer overlays above the <video>, so the click target is
  // rarely the video itself. Walk up until a video sits under the cursor.
  const findVideoUnder = (target, x, y) => {
    for (let el = target; el && el !== document.body; el = el.parentElement) {
      if (el instanceof HTMLVideoElement) return el;
      for (const video of el.querySelectorAll('video')) {
        if (pointIsOver(video, x, y)) return video;
      }
    }
    return null;
  };

  const area = (el) => {
    const r = el.getBoundingClientRect();
    return r.width * r.height;
  };

  const isPlayerControl = (target, video) => {
    const control = target.closest('button, [role="button"], a[href], input, textarea');
    if (!control || control.contains(video)) return false;
    return area(control) < area(video) * CONTROL_MAX_AREA_RATIO;
  };

  const togglePlayback = (video) => {
    if (!video.paused) {
      video.pause();
      return;
    }
    if (video.duration - video.currentTime < 0.5) video.currentTime = 0;
    video.play().catch(() => {});
  };

  window.addEventListener('click', (e) => {
    if (!isHomeFeed() || e.button !== 0) return;
    const video = findVideoUnder(e.target, e.clientX, e.clientY);
    if (!video || isPlayerControl(e.target, video)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    togglePlayback(video);
  }, true);
})();
