// Pauses videos when they finish and blocks script-driven restarts (sites
// often replay manually on "ended"). A real click or keypress still lets
// the video play again.
(() => {
  'use strict';

  const { onMediaEvent, addPlayGuard, userIsInteracting } = NoVideoLoop;

  // Videos that have reached the end and shouldn't restart on their own.
  const finished = new WeakSet();

  const markFinished = (media) => {
    finished.add(media);
    if (!media.paused) media.pause();
  };

  addPlayGuard((media) => {
    if (!finished.has(media)) return;
    if (!userIsInteracting()) return Promise.resolve();
    finished.delete(media);
  });

  onMediaEvent('ended', markFinished);

  // Backup for playback started by anything other than play().
  onMediaEvent('play', (media) => {
    if (!finished.has(media)) return;
    if (userIsInteracting()) finished.delete(media);
    else media.pause();
  });

  // Players reuse <video> elements; a new source means a fresh video.
  onMediaEvent('loadstart', (media) => finished.delete(media));

  NoVideoLoop.markFinished = markFinished;
})();
