// Stops Brave unloading Facebook and Instagram tabs in the background to
// save memory. An unloaded tab reloads when you come back to it, which looks
// just like the site refreshing itself.

const SITE_URLS = [
  '*://*.facebook.com/*',
  '*://*.instagram.com/*',
];

const SITE_PATTERN = /^https?:\/\/([^/]+\.)?(facebook|instagram)\.com\//;

const keepLoaded = (tab) => {
  if (tab.autoDiscardable && tab.url && SITE_PATTERN.test(tab.url)) {
    chrome.tabs.update(tab.id, { autoDiscardable: false }).catch(() => {});
  }
};

const keepAllLoaded = async () => {
  const tabs = await chrome.tabs.query({ url: SITE_URLS });
  tabs.forEach(keepLoaded);
};

chrome.runtime.onInstalled.addListener(keepAllLoaded);
chrome.runtime.onStartup.addListener(keepAllLoaded);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') keepLoaded(tab);
});
