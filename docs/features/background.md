# Browser (background)

Runs in the extension's background worker, not on the page.

- Facebook and Instagram tabs are marked so the browser (such as Brave) doesn't unload them in the background to save memory. An unloaded tab reloads when you come back, which looks like the site refreshing itself.
- This is applied:
  - to every open Facebook and Instagram tab when the extension is installed or updated, and when the browser starts;
  - to a tab whenever it goes to a new address or finishes loading on one of those sites.
- Tabs on other sites are left alone.

## Toolbar popup

- Clicking the extension's toolbar icon opens a small popup showing the version.
- Its small reload button (circular arrow) reloads the extension from its folder on disk, so code changes take effect without going to the extensions page.
- Open pages aren't refreshed. They keep the old code until you refresh them yourself.
