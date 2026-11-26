// A loop button to the left of the play button of each paused video. Clicking it
// starts the video on loop. The button hides while the video plays and
// comes back when it's paused, unless it's looping.
(() => {
  'use strict';

  const {
    createOverlayButton, watchVideos, centreOf, visibleShare, isBoxCovered,
    playButtonWidth, isUserLooping, startUserLoop,
  } = NoVideoLoop;

  const BUTTON_SIZE = 64;
  const ICON_SIZE = 40;
  // Space between the play button and the loop button.
  const GAP = 24;
  // Assumed play button width when the site's can't be found.
  const FALLBACK_PLAY_BUTTON_WIDTH = 80;
  // Ignore thumbnails and other small previews.
  const MIN_VIDEO_WIDTH = 120;
  // Hides carousel slides that are off to the side or mid-swipe.
  const MIN_VISIBLE_SHARE = 0.5;

  const LOOP_ICON = [
    'M17 1l4 4-4 4',
    'M3 11V9a4 4 0 0 1 4-4h14',
    'M7 23l-4-4 4-4',
    'M21 13v2a4 4 0 0 1-4 4H3',
  ];

  // video -> { button, playButtonWidth }
  const overlays = new Map();

  const overlayFor = (video) => {
    let overlay = overlays.get(video);
    if (!overlay) {
      overlay = {
        button: createOverlayButton({
          size: BUTTON_SIZE,
          iconSize: ICON_SIZE,
          iconPaths: LOOP_ICON,
          label: 'Play on loop',
          onClick: () => startUserLoop(video),
        }),
        playButtonWidth: FALLBACK_PLAY_BUTTON_WIDTH,
      };
      overlays.set(video, overlay);
    }
    return overlay;
  };

  const shouldShow = (video) =>
    video.paused &&
    !isUserLooping(video) &&
    video.getBoundingClientRect().width >= MIN_VIDEO_WIDTH &&
    visibleShare(video) >= MIN_VISIBLE_SHARE;

  // Just left of the play button, kept inside the video.
  const positionFor = (rect, playWidth) => {
    const centre = centreOf(rect);
    return {
      left: Math.max(centre.x - playWidth / 2 - GAP - BUTTON_SIZE, rect.left + GAP),
      top: centre.y - BUTTON_SIZE / 2,
    };
  };

  const render = (video) => {
    if (!shouldShow(video)) {
      overlays.get(video)?.button.hide();
      return;
    }
    const overlay = overlayFor(video);
    // Remembered, since the play button isn't always showing.
    overlay.playButtonWidth = playButtonWidth(video) || overlay.playButtonWidth;

    const { left, top } = positionFor(video.getBoundingClientRect(), overlay.playButtonWidth);
    if (isBoxCovered(video, left, top, BUTTON_SIZE)) {
      overlay.button.hide();
    } else {
      overlay.button.showAt(left, top);
    }
  };

  const forget = (video) => {
    overlays.get(video)?.button.remove();
    overlays.delete(video);
  };

  watchVideos({ render, forget });
})();
