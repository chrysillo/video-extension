// Lets YouTube's own Loop option (right-click the video, then Loop) work.
// Looping is still blocked unless the user has just chosen it, and always
// on Shorts, which loop on their own.
(() => {
  'use strict';

  NoVideoLoop.allowUserToggle('loop', () => !location.pathname.startsWith('/shorts/'));
})();
