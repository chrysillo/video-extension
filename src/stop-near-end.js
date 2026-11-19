// Some players seek back to 0 just before "ended" would fire, so the end is
// never reported. Treat a video as finished once it's within a moment of
// the end. Not used on sites that rely on "ended" for end screens or
// "up next" autoplay.
(() => {
  'use strict';

  const { onMediaEvent, markFinished } = NoVideoLoop;

  const END_MARGIN_SECONDS = 0.3;

  onMediaEvent('timeupdate', (media) => {
    if (media.paused || !Number.isFinite(media.duration) || media.duration <= 1) return;
    if (media.duration - media.currentTime < END_MARGIN_SECONDS) markFinished(media);
  });
})();
