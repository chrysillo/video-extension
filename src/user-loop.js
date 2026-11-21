// Looping the user switches on for a single video (e.g. with the loop
// button). The anti-loop rules still apply to every other video.
(() => {
  'use strict';

  const { onMediaEvent, setAllowed, requestPlay } = NoVideoLoop;

  // Starting to loop this close to the end restarts the video.
  const RESTART_MARGIN_SECONDS = 0.5;
  // Loading that starts this soon after the loop is switched on is the
  // player fetching the video the user asked for, not a new video.
  const START_GRACE_MS = 3000;

  // video -> { src, time } for the videos the user set looping
  const loops = new WeakMap();

  const sourceOf = (video) => video.currentSrc || video.src;

  const isUserLooping = (video) => video.loop;

  const stopUserLoop = (video) => {
    loops.delete(video);
    setAllowed(video, 'loop', false);
  };

  const startUserLoop = (video) => {
    loops.set(video, { src: sourceOf(video), time: performance.now(), started: false });
    setAllowed(video, 'loop', true);
    if (video.ended || video.duration - video.currentTime < RESTART_MARGIN_SECONDS) {
      video.currentTime = 0;
    }
    requestPlay(video);
    // If it doesn't start, switch looping off again so the button comes back.
    video.play().catch(() => {
      if (video.paused) stopUserLoop(video);
    });
  };

  // Players reuse <video> elements; a new video starts with looping off.
  // Playing a video that hasn't loaded yet also fires "loadstart", so keep
  // looping when the source is unchanged or the user has only just asked.
  onMediaEvent('loadstart', (video) => {
    const loop = loops.get(video);
    if (!loop) return;
    const src = sourceOf(video);
    if (src === loop.src) return;
    if (performance.now() - loop.time < START_GRACE_MS) {
      loop.src = src;
      return;
    }
    stopUserLoop(video);
  });

  onMediaEvent('playing', (video) => {
    const loop = loops.get(video);
    if (loop) loop.started = true;
  });

  // Paused before it ever got going (e.g. the site stopped it): looping
  // didn't take, so switch it off and let the button come back.
  onMediaEvent('pause', (video) => {
    if (loops.get(video)?.started === false) stopUserLoop(video);
  });

  Object.assign(NoVideoLoop, { isUserLooping, startUserLoop, stopUserLoop });
})();
