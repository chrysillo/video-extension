// Lets YouTube's own Loop option (right-click the video, then Loop) work.
// Looping is still blocked unless the user has just chosen it.
(() => {
  'use strict';

  NoVideoLoop.allowUserToggle('loop');
})();
