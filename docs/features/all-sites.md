# All sites

These apply on Facebook, Instagram, YouTube and X, in every frame of the page.

## No looping

- The page can't switch on a video's `loop` setting, whether through the `loop` property, `setAttribute('loop')`, or `loop` in the page's HTML.
- Reading `video.loop` gives `false` unless the user switched looping on for that video.
- If `loop` shows up on a video anyway, it's removed straight away.
- Exceptions: the Instagram loop button and YouTube's own Loop option (see those pages).

## No replay after the end

- A video pauses when it reaches the end.
- After that, the page can't start it again by itself, whether with `play()` or any other way. A blocked `play()` call returns a resolved promise, so the page doesn't report an error.
- The user can still play it again with a click or a key press.
- A video the user set looping keeps looping.
- When a player loads a new video into the same `<video>` element, the new video starts with a clean slate.

## Treat the last moment as the end

Not on YouTube, except Shorts (see [YouTube](youtube.md)).

- Some players jump back to the start just before the end, so the video never reports that it ended.
- A playing video within 0.3 s of its end counts as finished: it pauses and can't replay by itself.
- Videos 1 second long or shorter, and live streams, are left alone.
