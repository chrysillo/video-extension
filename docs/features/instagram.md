# Instagram

Applies on `instagram.com` and all its subdomains. Also gets everything in [All sites](all-sites.md).

## Same as Facebook

These work the same way as on [Facebook](facebook.md):

- No autoplay
- Tab always seems visible: videos keep playing in background tabs
- Window always seems focused
- Feed videos play in place (home feed `/` only)
- Tabs stay loaded (see [Browser (background)](background.md))

## Loop button

- A round loop button (64 px, "Play on loop") appears on each paused video, just left of Instagram's play button and kept inside the video.
- Clicking it plays that one video on loop. A video that was at or near its end (within 0.5 s) starts from the beginning.
- The button hides while the video plays, and doesn't come back while it's looping.
- Looping stops when:
  - the player loads a different video into the same element (more than 3 s after the button was clicked);
  - the video doesn't start, or the site pauses it before it gets going. The button then comes back.
- The button doesn't show on:
  - videos narrower than 120 px (thumbnails, previews);
  - videos less than half visible (carousel slides off to the side or mid-swipe);
  - videos where something else covers that spot (a header, a dialog, a comments panel).
- Clicking the button never reaches Instagram, so it doesn't open the post or pause a Reel.
- The site's styles can't change how the button looks.
- If Instagram's play button can't be found, the loop button assumes it's 80 px wide.
- The button stays in place on scroll and resize, and checks again every 0.5 s for videos the site added.

## Whole video shown

- Videos fit inside the post's frame instead of being cropped to fill it.
- Empty space around the video is filled with orange (`#f86d03`).

## Double-click doesn't like

- Double-clicking a post's photo or video doesn't like the post.
- Clicking a video twice to play and pause it doesn't like it either.
- Small images, such as profile pictures and icons (narrower than 120 px), are left alone.

## Like count can't be clicked

- Clicking a post's like count doesn't open the list of people who liked it.
- This covers:
  - links to the likes list (`/liked_by/`);
  - text like "1,234 likes", "1 like", "12.5K likes" or "Liked by … and others";
  - a bare number right after the heart icon, such as "1,234", "12.5K", "3M" or "1 234".
- Mouse, pointer and touch presses on the count are blocked, as well as the click.
- Hovering over the count shows the normal arrow, not the pointing hand.
- Other numbers, such as the comment and share counts, still work.

## No profile card on account names

- On every Instagram page: feed, posts, Reels, Explore, profiles and comments.
- Hovering over an account name doesn't pop up the profile preview card, and doesn't show a tooltip.
- Clicking the name still opens the profile.
- Links that aren't to an account, such as posts, Reels, Explore and messages, are left alone.
