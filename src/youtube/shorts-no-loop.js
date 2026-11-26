// Shorts replay by seeking back to the start just before the end, so
// "ended" never fires. On Shorts pages only, treat a video as finished once
// it's within a moment of the end, and undo a jump back to the start that
// the user didn't ask for. Regular videos keep "ended" for end screens and
// autoplay.
(() => {
  'use strict';

  const { onMediaEvent, markFinished, userIsInteracting } = NoVideoLoop;

  const END_MARGIN_SECONDS = 0.5;
  const START_MARGIN_SECONDS = 1;

  const onShorts = () => location.pathname.startsWith('/shorts/');

  // video -> last playback position seen
  const lastTime = new WeakMap();

  onMediaEvent('timeupdate', (media) => {
    if (!onShorts()) return;
    const { currentTime, duration } = media;
    const previous = lastTime.get(media);
    lastTime.set(media, currentTime);
    if (!Number.isFinite(duration) || duration <= 1) return;

    // Jumped from near the end back to the start without the user.
    if (previous !== undefined && duration - previous < START_MARGIN_SECONDS + END_MARGIN_SECONDS &&
        currentTime < START_MARGIN_SECONDS && !userIsInteracting()) {
      markFinished(media);
      return;
    }
    if (!media.paused && duration - currentTime < END_MARGIN_SECONDS) markFinished(media);
  });

  // A new Short in the same element starts fresh.
  onMediaEvent('loadstart', (media) => lastTime.delete(media));
})();
