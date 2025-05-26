// ShadowGag - Shared Background Script
// This script works for both Chrome (MV3) and Firefox (MV2) using browser adapters

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

debugLog('Shared background script loaded');

// Browser Adapter - handles browser-specific API differences
const BrowserAdapter = {
  // Detect browser type
  isFirefox: typeof browser !== 'undefined' || navigator.userAgent.includes('Firefox'),
  
  // Icon API adapter
  async setIcon(iconPath) {
    if (this.isFirefox) {
      // Firefox uses browserAction
      return chrome.browserAction.setIcon({ path: iconPath });
    } else {
      // Chrome uses action
      return chrome.action.setIcon({ path: iconPath });
    }
  },
  
  async setTitle(title) {
    if (this.isFirefox) {
      // Firefox uses browserAction
      return chrome.browserAction.setTitle({ title: title });
    } else {
      // Chrome uses action
      return chrome.action.setTitle({ title: title });
    }
  },
  
  // Response format adapter
  formatResponse(data) {
    if (this.isFirefox) {
      // Firefox expects wrapped response
      return { success: true, data: data };
    } else {
      // Chrome expects direct response
      return data;
    }
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
      console.log(`ShadowGag: Successfully updated tab ${gagTab.id}`);
    } catch (error) {
      console.log(`ShadowGag: Could not update tab ${gagTab.id}:`, error);
    }
  }
}

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('ShadowGag: Background received message:', request.action);
  
  if (request.action === 'getSettings') {
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
      
      console.log('ShadowGag: Sending settings to popup/content:', settings);
      // Use browser adapter for response formatting
      sendResponse(BrowserAdapter.formatResponse(settings));
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'saveSettings') {
    console.log('ShadowGag: Saving settings:', request.settings);
    chrome.storage.local.set(request.settings, async () => {
      console.log('ShadowGag: Settings saved successfully');
      
      // Broadcast the change to all 9gag tabs
      await broadcastStateChange(request.settings.enabled);
      
      sendResponse({ success: true });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'toggleEnabled') {
    console.log('ShadowGag: Toggling extension state');
    chrome.storage.local.get(['enabled'], async (result) => {
      const newState = !(result.enabled !== false);
      await setExtensionState(newState);
      await broadcastStateChange(newState);
      sendResponse({ enabled: newState });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'getExtensionState') {
    getExtensionState().then(enabled => {
      sendResponse({ enabled: enabled });
    });
    return true;
  }
  
  if (request.action === 'setExtensionState') {
    // Handle state change request from popup
    setExtensionState(request.enabled).then(() => {
      broadcastStateChange(request.enabled);
      sendResponse({ success: true, enabled: request.enabled });
    });
    return true;
  }
  
  if (request.action === 'contentScriptReady') {
    console.log('ShadowGag: Content script ready, sending current settings');
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
      
      console.log('ShadowGag: Sending initial settings to content script');
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'setEnabled',
        enabled: settings.enabled,
        settings: settings
      });
      
      sendResponse({ success: true });
    });
    return true;
  }
});

// Initialize icon on startup
updateIcon(); 