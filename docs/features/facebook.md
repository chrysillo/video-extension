# Facebook

Applies on `facebook.com` and all its subdomains. Also gets everything in [All sites](all-sites.md).

## No autoplay

- Videos only play after the user clicks on them, presses Space, Enter or K while on the player, or uses one of the extension's buttons. That counts for 1.5 s after the click or key press.
- Scrolling a video into view doesn't start it.
- The page can't set `autoplay` on a video.
- Once the user pauses a video, it doesn't resume by itself, for example when scrolled away and back.
- A new video loaded into the same player needs a new click.
- A blocked `play()` call fails with a `NotAllowedError`, the same error a browser gives when it blocks autoplay.

## Tab always seems visible

- The page is told the tab is always visible (`document.hidden` is `false`, `visibilityState` is `"visible"`).
- The page never hears that the tab was hidden, shown again, frozen or resumed.
- So the feed doesn't refresh when you come back to the tab, and videos keep playing in background tabs.

## Window always seems focused

- `document.hasFocus()` always says `true`.
- The page never hears that the window lost or gained focus, so switching windows doesn't pause videos.
- Focus moving between elements on the page still works as normal.

## Feed videos play in place

- Only on the home feed (`/` and `/home.php`).
- Left-clicking a video plays or pauses it instead of opening the post.
- Clicking a finished video (within 0.5 s of the end) starts it from the beginning.
- The video's own small controls still work: mute, tags, the control bar, links and text boxes. A button counts as a control if it covers less than a quarter of the video.

## Tabs stay loaded

- See [Browser (background)](background.md).
