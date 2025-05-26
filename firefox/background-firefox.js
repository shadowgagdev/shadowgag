// ShadowGag - Firefox Background Script (Manifest V2)
// This script is specific to Firefox and imports the shared background functionality

// Import shared background script
// Note: Firefox MV2 doesn't use importScripts for background scripts
// Instead, both scripts are loaded via manifest.json

console.log('ShadowGag: Firefox MV2 background script loaded');

// Firefox MV2 specific configurations and polyfills

// Firefox-specific browser API polyfill
if (typeof browser !== 'undefined' && typeof chrome === 'undefined') {
  // Firefox uses 'browser' API, create chrome alias for compatibility
  window.chrome = browser;
}

// Firefox MV2 specific event handlers
chrome.runtime.onStartup.addListener(() => {
  console.log('ShadowGag: Firefox extension startup');
  // Initialize any Firefox-specific startup tasks
});

// Firefox MV2 specific tab handling
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Firefox-specific tab update handling
  if (changeInfo.status === 'complete' && 
      tab.url && 
      tab.url.includes('9gag.com/gag/')) {
    console.log('ShadowGag: Firefox - 9gag tab updated:', tabId);
    // Firefox-specific processing
  }
});

// Firefox MV2 specific browserAction handling
chrome.browserAction.onClicked.addListener((tab) => {
  console.log('ShadowGag: Firefox browserAction clicked');
  // Handle browserAction click if needed
});

// Firefox MV2 specific context menu handling (if needed in future)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('ShadowGag: Firefox context menu clicked:', info.menuItemId);
  // Handle context menu actions
});

// Firefox MV2 specific storage handling optimizations
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('ShadowGag: Firefox storage changed:', changes, namespace);
  // Firefox-specific storage change handling
});

// Firefox MV2 specific error handling
window.addEventListener('error', (event) => {
  console.error('ShadowGag: Firefox background script error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('ShadowGag: Firefox background script unhandled rejection:', event.reason);
});

// Firefox MV2 specific permissions handling
chrome.permissions.onAdded.addListener((permissions) => {
  console.log('ShadowGag: Firefox permissions added:', permissions);
});

chrome.permissions.onRemoved.addListener((permissions) => {
  console.log('ShadowGag: Firefox permissions removed:', permissions);
});

// Firefox-specific WebExtension API optimizations
if (typeof browser !== 'undefined') {
  // Use native Firefox promises instead of callbacks where available
  console.log('ShadowGag: Using native Firefox WebExtension APIs');
} 