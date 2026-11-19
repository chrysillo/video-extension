// Looping the user switches on for a single video (e.g. with the loop
// button). The anti-loop rules still apply to every other video.
(() => {
  'use strict';

  const { onMediaEvent, setAllowed } = NoVideoLoop;

  // Starting to loop this close to the end restarts the video.
  const RESTART_MARGIN_SECONDS = 0.5;

  const isUserLooping = (video) => video.loop;

  const startUserLoop = (video) => {
    setAllowed(video, 'loop', true);
    if (video.ended || video.duration - video.currentTime < RESTART_MARGIN_SECONDS) {
      video.currentTime = 0;
    }
    video.play().catch(() => {});
  };

  const stopUserLoop = (video) => setAllowed(video, 'loop', false);

  // Players reuse <video> elements; a new video starts with looping off.
  onMediaEvent('loadstart', stopUserLoop);

  Object.assign(NoVideoLoop, { isUserLooping, startUserLoop, stopUserLoop });
})();
