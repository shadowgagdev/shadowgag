// ShadowGag - Chrome Background Script (Manifest V3)
// This script contains all functionality for Chrome, including shared background logic

console.log('ShadowGag: Chrome MV3 background script loaded');

// Debug logging system
const DEBUG_MODE = false; // Set to false for production
const debugLog = (...args) => {
  if (DEBUG_MODE) {
    console.log('ShadowGag:', ...args);
  }
};
const debugError = (...args) => {
  if (DEBUG_MODE) {
    console.error('ShadowGag:', ...args);
  }
};

debugLog('Chrome background script loaded');

// Browser Adapter - handles browser-specific API differences
const BrowserAdapter = {
  // Detect browser type (always Chrome in this context)
  isFirefox: false,
  
  // Icon API adapter
  async setIcon(iconPath) {
    // Chrome uses action
    return chrome.action.setIcon({ path: iconPath });
  },
  
  async setTitle(title) {
    // Chrome uses action
    return chrome.action.setTitle({ title: title });
  },
  
  // Response format adapter
  formatResponse(data) {
    // Chrome expects direct response
    return data;
  }
};

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('ShadowGag: Extension installed/updated', details.reason);
  
  if (details.reason === 'install') {
    console.log('ShadowGag: First time installation');
    // Set default settings
    chrome.storage.local.set({
      enabled: true,
      visibleMarking: 'badge',
      shadowbannedMarking: 'badge',
      visibleCustomCode: '',
      shadowbannedCustomCode: '',
      // New customization options
      visibleHighlightBorderColor: '#4caf50',
      visibleHighlightBgColor: '#1a2a1a',
      visibleBorderColor: '#4caf50',
      visibleBorderWidth: '3',
      visibleBadgeText: 'VISIBLE',
      visibleBadgeColor: '#4caf50',
      visibleBadgeTextColor: '#ffffff',
      shadowbannedHighlightBorderColor: '#ff6b6b',
      shadowbannedHighlightBgColor: '#2a1a1a',
      shadowbannedBorderColor: '#ff6b6b',
      shadowbannedBorderWidth: '3',
      shadowbannedBadgeText: 'SHADOWBANNED',
      shadowbannedBadgeColor: '#ff6b6b',
      shadowbannedBadgeTextColor: '#ffffff'
    });
  }
});

// Function to get current extension state from storage
async function getExtensionState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['enabled'], (result) => {
      resolve(result.enabled !== false);
    });
  });
}

// Function to update extension state in storage
async function setExtensionState(enabled) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ enabled }, () => {
      console.log('ShadowGag: Extension state updated in storage:', enabled);
      resolve();
    });
  });
}

// Update icon based on current state
async function updateIcon() {
  const enabled = await getExtensionState();
  const iconPath = {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  };
  
  const title = enabled ? 
    'ShadowGag - Active (click to configure)' : 
    'ShadowGag - Inactive (click to configure)';
  
  try {
    // Use browser adapter for cross-browser compatibility
    await BrowserAdapter.setIcon(iconPath);
    await BrowserAdapter.setTitle(title);
    console.log('ShadowGag: Icon updated to:', enabled ? 'active' : 'inactive');
  } catch (error) {
    console.error('ShadowGag: Error updating icon:', error);
  }
}

// Broadcast state change to all 9gag tabs
async function broadcastStateChange(enabled) {
  console.log('ShadowGag: Broadcasting state change to 9gag tabs:', enabled);
  
  // Update icon
  await updateIcon();
  
  // Get all settings to send to content scripts
  const result = await chrome.storage.local.get([
    'enabled', 
    'visibleMarking', 
    'shadowbannedMarking',
    'visibleCustomCode',
    'shadowbannedCustomCode',
    // New customization options
    'visibleHighlightBorderColor',
    'visibleHighlightBgColor',
    'visibleHighlightBorderWidth',
    'visibleBorderColor',
    'visibleBorderWidth',
    'visibleBadgeText',
    'visibleBadgeColor',
    'visibleBadgeTextColor',
    'shadowbannedHighlightBorderColor',
    'shadowbannedHighlightBgColor',
    'shadowbannedHighlightBorderWidth',
    'shadowbannedBorderColor',
    'shadowbannedBorderWidth',
    'shadowbannedBadgeText',
    'shadowbannedBadgeColor',
    'shadowbannedBadgeTextColor'
  ]);

  const settings = {
    enabled: result.enabled !== false,
    visibleMarking: result.visibleMarking || 'badge',
    shadowbannedMarking: result.shadowbannedMarking || 'badge',
    visibleCustomCode: result.visibleCustomCode || '',
    shadowbannedCustomCode: result.shadowbannedCustomCode || '',
    // New customization options
    visibleHighlightBorderColor: result.visibleHighlightBorderColor || '#4caf50',
    visibleHighlightBgColor: result.visibleHighlightBgColor || '#1a2a1a',
    visibleHighlightBorderWidth: result.visibleHighlightBorderWidth || '4',
    visibleBorderColor: result.visibleBorderColor || '#4caf50',
    visibleBorderWidth: result.visibleBorderWidth || '3',
    visibleBadgeText: result.visibleBadgeText || 'VISIBLE',
    visibleBadgeColor: result.visibleBadgeColor || '#4caf50',
    visibleBadgeTextColor: result.visibleBadgeTextColor || '#ffffff',
    shadowbannedHighlightBorderColor: result.shadowbannedHighlightBorderColor || '#ff6b6b',
    shadowbannedHighlightBgColor: result.shadowbannedHighlightBgColor || '#2a1a1a',
    shadowbannedHighlightBorderWidth: result.shadowbannedHighlightBorderWidth || '4',
    shadowbannedBorderColor: result.shadowbannedBorderColor || '#ff6b6b',
    shadowbannedBorderWidth: result.shadowbannedBorderWidth || '3',
    shadowbannedBadgeText: result.shadowbannedBadgeText || 'SHADOWBANNED',
    shadowbannedBadgeColor: result.shadowbannedBadgeColor || '#ff6b6b',
    shadowbannedBadgeTextColor: result.shadowbannedBadgeTextColor || '#ffffff'
  };
  
  // Broadcast to ALL 9gag tabs
  const tabs = await chrome.tabs.query({ url: "*://*.9gag.com/gag/*" });
  console.log(`ShadowGag: Broadcasting to ${tabs.length} 9gag tabs`);
  
  for (const gagTab of tabs) {
    try {
      await chrome.tabs.sendMessage(gagTab.id, { 
        action: 'setEnabled',
        enabled: enabled,
        settings: settings
      });
      console.log(`ShadowGag: Sent settings to tab ${gagTab.id}`);
    } catch (error) {
      console.log(`ShadowGag: Could not send message to tab ${gagTab.id}:`, error.message);
    }
  }
}

// Message handler for popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('ShadowGag: Received message:', request.action);
  
  if (request.action === 'getSettings') {
    // Get all settings and return them
    chrome.storage.local.get([
      'enabled', 
      'visibleMarking', 
      'shadowbannedMarking',
      'visibleCustomCode',
      'shadowbannedCustomCode',
      // New customization options
      'visibleHighlightBorderColor',
      'visibleHighlightBgColor',
      'visibleHighlightBorderWidth',
      'visibleBorderColor',
      'visibleBorderWidth',
      'visibleBadgeText',
      'visibleBadgeColor',
      'visibleBadgeTextColor',
      'shadowbannedHighlightBorderColor',
      'shadowbannedHighlightBgColor',
      'shadowbannedHighlightBorderWidth',
      'shadowbannedBorderColor',
      'shadowbannedBorderWidth',
      'shadowbannedBadgeText',
      'shadowbannedBadgeColor',
      'shadowbannedBadgeTextColor'
    ], (result) => {
      const settings = {
        enabled: result.enabled !== false,
        visibleMarking: result.visibleMarking || 'badge',
        shadowbannedMarking: result.shadowbannedMarking || 'badge',
        visibleCustomCode: result.visibleCustomCode || '',
        shadowbannedCustomCode: result.shadowbannedCustomCode || '',
        // New customization options
        visibleHighlightBorderColor: result.visibleHighlightBorderColor || '#4caf50',
        visibleHighlightBgColor: result.visibleHighlightBgColor || '#1a2a1a',
        visibleHighlightBorderWidth: result.visibleHighlightBorderWidth || '4',
        visibleBorderColor: result.visibleBorderColor || '#4caf50',
        visibleBorderWidth: result.visibleBorderWidth || '3',
        visibleBadgeText: result.visibleBadgeText || 'VISIBLE',
        visibleBadgeColor: result.visibleBadgeColor || '#4caf50',
        visibleBadgeTextColor: result.visibleBadgeTextColor || '#ffffff',
        shadowbannedHighlightBorderColor: result.shadowbannedHighlightBorderColor || '#ff6b6b',
        shadowbannedHighlightBgColor: result.shadowbannedHighlightBgColor || '#2a1a1a',
        shadowbannedHighlightBorderWidth: result.shadowbannedHighlightBorderWidth || '4',
        shadowbannedBorderColor: result.shadowbannedBorderColor || '#ff6b6b',
        shadowbannedBorderWidth: result.shadowbannedBorderWidth || '3',
        shadowbannedBadgeText: result.shadowbannedBadgeText || 'SHADOWBANNED',
        shadowbannedBadgeColor: result.shadowbannedBadgeColor || '#ff6b6b',
        shadowbannedBadgeTextColor: result.shadowbannedBadgeTextColor || '#ffffff'
      };
      
      sendResponse(BrowserAdapter.formatResponse(settings));
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'saveSettings') {
    // Save settings and broadcast to all tabs
    chrome.storage.local.set(request.settings, async () => {
      console.log('ShadowGag: Settings saved:', request.settings);
      
      // Broadcast the change to all 9gag tabs
      await broadcastStateChange(request.settings.enabled);
      
      sendResponse(BrowserAdapter.formatResponse({ success: true }));
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'toggleEnabled') {
    // Toggle enabled state
    chrome.storage.local.get(['enabled'], async (result) => {
      const newEnabled = !result.enabled;
      await setExtensionState(newEnabled);
      await broadcastStateChange(newEnabled);
      
      sendResponse(BrowserAdapter.formatResponse({ enabled: newEnabled }));
    });
    return true; // Keep message channel open for async response
  }
});

// Initialize icon on startup
updateIcon();

// Chrome MV3 specific service worker event handlers
self.addEventListener('install', (event) => {
  console.log('ShadowGag: Chrome service worker installed');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('ShadowGag: Chrome service worker activated');
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// Chrome MV3 specific alarm handling (if needed in future)
// Note: Alarms API requires "alarms" permission in manifest
// chrome.alarms.onAlarm.addListener((alarm) => {
//   console.log('ShadowGag: Chrome alarm triggered:', alarm.name);
//   // Handle any periodic tasks here
// });

// Chrome MV3 specific context menu handling (if needed in future)
chrome.runtime.onStartup.addListener(() => {
  console.log('ShadowGag: Chrome extension startup');
  // Initialize any Chrome-specific startup tasks
  updateIcon();
});

// Chrome MV3 specific tab handling optimizations
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only process 9gag tabs that have completed loading
  if (changeInfo.status === 'complete' && 
      tab.url && 
      tab.url.includes('9gag.com/gag/')) {
    console.log('ShadowGag: 9gag tab updated:', tabId);
    // Could trigger content script injection or state sync here
  }
});

// Chrome MV3 specific error handling
self.addEventListener('error', (event) => {
  console.error('ShadowGag: Chrome service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('ShadowGag: Chrome service worker unhandled rejection:', event.reason);
}); 