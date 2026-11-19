// Videos only play after the user clicks them (or presses a play key while
// focused on the player). Scrolling a video into view no longer starts it.
(() => {
  'use strict';

  const { onMediaEvent, addPlayGuard, blockMediaAttribute, userWantsToPlay } = NoVideoLoop;

  // Videos the user started. Cleared on pause so that scrolling away and
  // back doesn't resume playback by itself.
  const userStarted = new WeakSet();

  const isAllowed = (media) => {
    if (userWantsToPlay(media)) userStarted.add(media);
    return userStarted.has(media);
  };

  blockMediaAttribute('autoplay');

  addPlayGuard((media) => {
    if (isAllowed(media)) return;
    return Promise.reject(new DOMException('Autoplay is disabled', 'NotAllowedError'));
  });

  // Backup for playback started by anything other than play().
  onMediaEvent('play', (media) => {
    if (!isAllowed(media)) media.pause();
  });

  onMediaEvent('pause', (media) => userStarted.delete(media));
  onMediaEvent('loadstart', (media) => userStarted.delete(media));
})();
