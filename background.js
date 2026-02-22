/**
 * fast-access - Background Service Worker
 * Handles toolbar icon click to open a new tab
 */

// When user clicks the extension icon in the toolbar, open a new tab
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({});
});
