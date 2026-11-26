# YouTube

Applies on `youtube.com`, `youtube-nocookie.com` and their subdomains, but not YouTube Music (`music.youtube.com`). Also gets everything in [All sites](all-sites.md) except "Treat the last moment as the end".

## Regular videos

- Pages can't switch on looping, and videos pause at the end without replaying by themselves.
- The video still reports that it ended, so end screens and "up next" autoplay keep working.
- YouTube's own Loop option (right-click the video, then Loop) works. Turning it on only counts straight after the user's click or key press. Turning it off always works.

## Shorts

Pages under `/shorts/` only.

- Shorts don't loop. YouTube's Loop option can't turn looping on here.
- Shorts replay by jumping back to the start just before the end, so:
  - a playing Short within 0.5 s of its end counts as finished: it pauses and can't replay by itself;
  - if a Short jumps from its last second back to its first second without the user doing it, it counts as finished and pauses.
- Shorts 1 second long or shorter are left alone.
- A new Short loaded into the same player starts fresh.
