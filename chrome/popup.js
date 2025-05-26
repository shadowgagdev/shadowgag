// ShadowGag Popup Script

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

debugLog('Popup script loaded');

// Color conversion utilities
function rgbaToHex(r, g, b, a = 255) {
  const toHex = (n) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  // Always include alpha channel for 8-digit HEX format
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}

function hexToRgba(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  let r, g, b, a = 255;
  
  if (hex.length === 6) {
    // #rrggbb format
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (hex.length === 8) {
    // #rrggbbaa format
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
    a = parseInt(hex.substr(6, 2), 16);
  } else {
    // Invalid format, return default
    return { r: 0, g: 0, b: 0, a: 255 };
  }
  
  return { r, g, b, a };
}

function getRgbaString(r, g, b, a = 255) {
  // Always return HEX format with alpha channel
  return rgbaToHex(r, g, b, a);
}

// DOM elements
const enabledCheckbox = document.getElementById('enabled');

// Visible marking elements
const visibleMarkingRadios = document.querySelectorAll('input[name="visibleMarking"]');
const visibleCustomFunction = document.getElementById('visible-custom-function');
const visibleCustomCode = document.getElementById('visible-custom-code');
const visiblePreview = document.getElementById('visible-preview');

// Shadowbanned marking elements
const shadowbannedMarkingRadios = document.querySelectorAll('input[name="shadowbannedMarking"]');
const shadowbannedCustomFunction = document.getElementById('shadowbanned-custom-function');
const shadowbannedCustomCode = document.getElementById('shadowbanned-custom-code');
const shadowbannedPreview = document.getElementById('shadowbanned-preview');

// Default settings
const defaultSettings = {
  enabled: true,
  visibleMarking: 'badge',
  shadowbannedMarking: 'badge',
  visibleCustomCode: '',
  shadowbannedCustomCode: '',
  // New customization options
  visibleHighlightBorderColor: '#4caf50',
  visibleHighlightBgColor: '#1a2a1a',
  visibleHighlightBorderWidth: '4',
  visibleBorderColor: '#4caf50',
  visibleBorderWidth: '3',
  visibleBadgeText: 'VISIBLE',
  visibleBadgeColor: '#4caf50',
  visibleBadgeTextColor: '#ffffff',
  shadowbannedHighlightBorderColor: '#ff6b6b',
  shadowbannedHighlightBgColor: '#2a1a1a',
  shadowbannedHighlightBorderWidth: '4',
  shadowbannedBorderColor: '#ff6b6b',
  shadowbannedBorderWidth: '3',
  shadowbannedBadgeText: 'SHADOWBANNED',
  shadowbannedBadgeColor: '#ff6b6b',
  shadowbannedBadgeTextColor: '#ffffff',
  // Performance settings
  advancedPerformance: false,
  performanceMode: 'balanced',
  autoRefreshEnabled: true,
  apiTimeout: 10000,
  checkInterval: 30,
  batchSize: 10,
  cacheDuration: 5,
  maxRetries: 3,
  debugLogging: false,
  aggressiveDetection: false
};

// Marking functions for previews and actual implementation
const markingFunctions = {
  visible: {
    none: (element) => {
      // No marking - clean look
    },
    highlight: (element, options = {}) => {
      const borderColor = options.borderColor || '#4caf50';
      const bgColor = options.bgColor || '#1a2a1a';
      const borderWidth = options.borderWidth || '4';
      element.style.backgroundColor = bgColor;
      element.style.borderLeft = `${borderWidth}px solid ${borderColor}`;
      element.style.paddingLeft = '8px';
      element.style.opacity = '0.9';
    },
    border: (element, options = {}) => {
      const borderColor = options.borderColor || '#4caf50';
      const borderWidth = options.borderWidth || '3';
      element.style.borderLeft = `${borderWidth}px solid ${borderColor}`;
      element.style.paddingLeft = '8px';
    },
    badge: (element, options = {}) => {
      const badgeText = options.badgeText || 'VISIBLE';
      const badgeColor = options.badgeColor || '#4caf50';
      const badgeTextColor = options.badgeTextColor || '#ffffff';
      const badge = document.createElement('span');
      badge.className = 'shadowgag-visible-badge';
      badge.textContent = badgeText;
      badge.style.cssText = `
        display: inline-block;
        background: ${badgeColor};
        color: ${badgeTextColor};
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: bold;
        margin-right: 8px;
        text-transform: uppercase;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.2;
      `;
      const header = element.querySelector('.ui-comment-header');
      if (header) {
        header.insertBefore(badge, header.firstChild);
      }
    },
    custom: (element, customCode) => {
      try {
        const func = new Function('element', customCode);
        func(element);
      } catch (error) {
        console.error('ShadowGag: Error executing custom visible function:', error);
      }
    }
  },
  shadowbanned: {
    none: (element) => {
      // No marking - clean look
    },
    highlight: (element, options = {}) => {
      const borderColor = options.borderColor || '#ff6b6b';
      const bgColor = options.bgColor || '#2a1a1a';
      const borderWidth = options.borderWidth || '4';
      element.style.backgroundColor = bgColor;
      element.style.borderLeft = `${borderWidth}px solid ${borderColor}`;
      element.style.paddingLeft = '8px';
      element.style.opacity = '0.8';
    },
    border: (element, options = {}) => {
      const borderColor = options.borderColor || '#ff6b6b';
      const borderWidth = options.borderWidth || '3';
      element.style.borderLeft = `${borderWidth}px solid ${borderColor}`;
      element.style.paddingLeft = '8px';
    },
    badge: (element, options = {}) => {
      const badgeText = options.badgeText || 'SHADOWBANNED';
      const badgeColor = options.badgeColor || '#ff6b6b';
      const badgeTextColor = options.badgeTextColor || '#ffffff';
      const badge = document.createElement('span');
      badge.className = 'shadowgag-shadowbanned-badge';
      badge.textContent = badgeText;
      badge.style.cssText = `
        display: inline-block;
        background: ${badgeColor};
        color: ${badgeTextColor};
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: bold;
        margin-right: 8px;
        text-transform: uppercase;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.2;
      `;
      const header = element.querySelector('.ui-comment-header');
      if (header) {
        header.insertBefore(badge, header.firstChild);
      }
    },
    custom: (element, customCode) => {
      try {
        const func = new Function('element', customCode);
        func(element);
      } catch (error) {
        console.error('ShadowGag: Error executing custom shadowbanned function:', error);
      }
    }
  }
};

// Show/hide custom function inputs and options
function toggleCustomFunctions() {
  const visibleMarking = document.querySelector('input[name="visibleMarking"]:checked')?.value;
  const shadowbannedMarking = document.querySelector('input[name="shadowbannedMarking"]:checked')?.value;
  
  // Handle visible marking options
  document.getElementById('visible-highlight-options').style.display = visibleMarking === 'highlight' ? 'block' : 'none';
  document.getElementById('visible-border-options').style.display = visibleMarking === 'border' ? 'block' : 'none';
  document.getElementById('visible-badge-options').style.display = visibleMarking === 'badge' ? 'block' : 'none';
  document.getElementById('visible-custom-function').style.display = visibleMarking === 'custom' ? 'block' : 'none';
  
  // Handle shadowbanned marking options
  document.getElementById('shadowbanned-highlight-options').style.display = shadowbannedMarking === 'highlight' ? 'block' : 'none';
  document.getElementById('shadowbanned-border-options').style.display = shadowbannedMarking === 'border' ? 'block' : 'none';
  document.getElementById('shadowbanned-badge-options').style.display = shadowbannedMarking === 'badge' ? 'block' : 'none';
  document.getElementById('shadowbanned-custom-function').style.display = shadowbannedMarking === 'custom' ? 'block' : 'none';
}

// Show/hide performance settings based on advanced toggle
function togglePerformanceSettings() {
  const advancedPerformanceCheckbox = document.getElementById('advanced-performance');
  const simplePerformance = document.getElementById('simple-performance');
  const advancedPerformanceSettings = document.getElementById('advanced-performance-settings');
  
  if (advancedPerformanceCheckbox && simplePerformance && advancedPerformanceSettings) {
    if (advancedPerformanceCheckbox.checked) {
      simplePerformance.style.display = 'none';
      advancedPerformanceSettings.style.display = 'block';
    } else {
      simplePerformance.style.display = 'block';
      advancedPerformanceSettings.style.display = 'none';
    }
  }
}

// Load and display current settings
async function loadSettings() {
  try {
    console.log('ShadowGag: Loading settings...');
    
    // Get settings from storage
    const result = await new Promise((resolve) => {
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
        'shadowbannedBadgeTextColor',
        // Performance settings
        'advancedPerformance',
        'performanceMode',
        'autoRefreshEnabled',
        'apiTimeout',
        'checkInterval',
        'batchSize',
        'cacheDuration',
        'maxRetries',
        'debugLogging',
        'aggressiveDetection'
      ], resolve);
    });
    
    console.log('ShadowGag: Loaded settings from storage:', result);
    
    // Apply settings to UI
    const settings = {
      enabled: result.enabled !== false,
      visibleMarking: result.visibleMarking || defaultSettings.visibleMarking,
      shadowbannedMarking: result.shadowbannedMarking || defaultSettings.shadowbannedMarking,
      visibleCustomCode: result.visibleCustomCode || defaultSettings.visibleCustomCode,
      shadowbannedCustomCode: result.shadowbannedCustomCode || defaultSettings.shadowbannedCustomCode,
      // New customization options
      visibleHighlightBorderColor: result.visibleHighlightBorderColor || defaultSettings.visibleHighlightBorderColor,
      visibleHighlightBgColor: result.visibleHighlightBgColor || defaultSettings.visibleHighlightBgColor,
      visibleHighlightBorderWidth: result.visibleHighlightBorderWidth || defaultSettings.visibleHighlightBorderWidth,
      visibleBorderColor: result.visibleBorderColor || defaultSettings.visibleBorderColor,
      visibleBorderWidth: result.visibleBorderWidth || defaultSettings.visibleBorderWidth,
      visibleBadgeText: result.visibleBadgeText || defaultSettings.visibleBadgeText,
      visibleBadgeColor: result.visibleBadgeColor || defaultSettings.visibleBadgeColor,
      visibleBadgeTextColor: result.visibleBadgeTextColor || defaultSettings.visibleBadgeTextColor,
      shadowbannedHighlightBorderColor: result.shadowbannedHighlightBorderColor || defaultSettings.shadowbannedHighlightBorderColor,
      shadowbannedHighlightBgColor: result.shadowbannedHighlightBgColor || defaultSettings.shadowbannedHighlightBgColor,
      shadowbannedHighlightBorderWidth: result.shadowbannedHighlightBorderWidth || defaultSettings.shadowbannedHighlightBorderWidth,
      shadowbannedBorderColor: result.shadowbannedBorderColor || defaultSettings.shadowbannedBorderColor,
      shadowbannedBorderWidth: result.shadowbannedBorderWidth || defaultSettings.shadowbannedBorderWidth,
      shadowbannedBadgeText: result.shadowbannedBadgeText || defaultSettings.shadowbannedBadgeText,
      shadowbannedBadgeColor: result.shadowbannedBadgeColor || defaultSettings.shadowbannedBadgeColor,
      shadowbannedBadgeTextColor: result.shadowbannedBadgeTextColor || defaultSettings.shadowbannedBadgeTextColor,
      // Performance settings
      advancedPerformance: result.advancedPerformance || defaultSettings.advancedPerformance,
      performanceMode: result.performanceMode || defaultSettings.performanceMode,
      autoRefreshEnabled: result.autoRefreshEnabled || defaultSettings.autoRefreshEnabled,
      apiTimeout: result.apiTimeout || defaultSettings.apiTimeout,
      checkInterval: result.checkInterval || defaultSettings.checkInterval,
      batchSize: result.batchSize || defaultSettings.batchSize,
      cacheDuration: result.cacheDuration || defaultSettings.cacheDuration,
      maxRetries: result.maxRetries || defaultSettings.maxRetries,
      debugLogging: result.debugLogging || defaultSettings.debugLogging,
      aggressiveDetection: result.aggressiveDetection || defaultSettings.aggressiveDetection
    };
    
    enabledCheckbox.checked = settings.enabled;
    
    // Set radio buttons
    const visibleRadio = document.getElementById(`visible-${settings.visibleMarking}`);
    if (visibleRadio) visibleRadio.checked = true;
    
    const shadowbannedRadio = document.getElementById(`shadowbanned-${settings.shadowbannedMarking}`);
    if (shadowbannedRadio) shadowbannedRadio.checked = true;
    
    // Set custom code
    visibleCustomCode.value = settings.visibleCustomCode;
    shadowbannedCustomCode.value = settings.shadowbannedCustomCode;
    
    // Set customization options
    const setColorInputs = (prefix, colorValue) => {
      const rgba = hexToRgba(colorValue || '#000000');
      const rInput = document.getElementById(`${prefix}-r`);
      const gInput = document.getElementById(`${prefix}-g`);
      const bInput = document.getElementById(`${prefix}-b`);
      const aInput = document.getElementById(`${prefix}-a`);
      const hexInput = document.getElementById(`${prefix}-hex`);
      
      if (rInput) rInput.value = rgba.r;
      if (gInput) gInput.value = rgba.g;
      if (bInput) bInput.value = rgba.b;
      if (aInput) aInput.value = rgba.a;
      if (hexInput) hexInput.value = colorValue || '#000000';
    };
    
    const setElementValue = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.value = value;
    };
    
    // Set color inputs
    setColorInputs('visible-highlight-border-color', settings.visibleHighlightBorderColor);
    setColorInputs('visible-highlight-bg-color', settings.visibleHighlightBgColor);
    setColorInputs('visible-border-color', settings.visibleBorderColor);
    setColorInputs('visible-badge-color', settings.visibleBadgeColor);
    setColorInputs('visible-badge-text-color', settings.visibleBadgeTextColor);
    setColorInputs('shadowbanned-highlight-border-color', settings.shadowbannedHighlightBorderColor);
    setColorInputs('shadowbanned-highlight-bg-color', settings.shadowbannedHighlightBgColor);
    setColorInputs('shadowbanned-border-color', settings.shadowbannedBorderColor);
    setColorInputs('shadowbanned-badge-color', settings.shadowbannedBadgeColor);
    setColorInputs('shadowbanned-badge-text-color', settings.shadowbannedBadgeTextColor);
    
    // Set other inputs
    setElementValue('visible-highlight-border-width', settings.visibleHighlightBorderWidth);
    setElementValue('visible-border-width', settings.visibleBorderWidth);
    setElementValue('visible-badge-text', settings.visibleBadgeText);
    setElementValue('shadowbanned-highlight-border-width', settings.shadowbannedHighlightBorderWidth);
    setElementValue('shadowbanned-border-width', settings.shadowbannedBorderWidth);
    setElementValue('shadowbanned-badge-text', settings.shadowbannedBadgeText);
    
    // Set performance settings
    const advancedPerformanceCheckbox = document.getElementById('advanced-performance');
    if (advancedPerformanceCheckbox) {
      advancedPerformanceCheckbox.checked = settings.advancedPerformance;
    }
    
    const performanceModeSelect = document.getElementById('performance-mode');
    if (performanceModeSelect) {
      performanceModeSelect.value = settings.performanceMode;
    }
    
    const autoRefreshCheckbox = document.getElementById('auto-refresh-enabled');
    if (autoRefreshCheckbox) {
      autoRefreshCheckbox.checked = settings.autoRefreshEnabled;
    }
    
    setElementValue('api-timeout', settings.apiTimeout);
    setElementValue('check-interval', settings.checkInterval);
    setElementValue('batch-size', settings.batchSize);
    setElementValue('cache-duration', settings.cacheDuration);
    setElementValue('max-retries', settings.maxRetries);
    
    const debugLoggingCheckbox = document.getElementById('debug-logging');
    if (debugLoggingCheckbox) {
      debugLoggingCheckbox.checked = settings.debugLogging;
    }
    
    const aggressiveDetectionCheckbox = document.getElementById('aggressive-detection');
    if (aggressiveDetectionCheckbox) {
      aggressiveDetectionCheckbox.checked = settings.aggressiveDetection;
    }
    
    // Update UI
    toggleCustomFunctions();
    togglePerformanceSettings();
    
  } catch (error) {
    console.error('ShadowGag: Error loading settings:', error);
  }
}

// Debounced save function to prevent excessive saves
let saveTimeout = null;
function debouncedSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveSettings().catch(error => {
      console.error('ShadowGag: Debounced save failed:', error);
    });
  }, 100); // 100ms delay
}

// Immediate save function for critical changes
function immediateSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  return saveSettings();
}

// Save settings to storage
async function saveSettings() {
  try {
    const getElementValue = (id, defaultValue = '') => {
      const element = document.getElementById(id);
      if (!element) return defaultValue;
      
      if (element.type === 'checkbox') {
        return element.checked;
      } else if (element.type === 'number') {
        return parseInt(element.value) || defaultValue;
      } else {
        return element.value || defaultValue;
      }
    };
    
    // Helper function to get color from RGBA inputs
    const getColorFromInputs = (prefix, defaultColor) => {
      const r = parseInt(document.getElementById(`${prefix}-r`)?.value || '0');
      const g = parseInt(document.getElementById(`${prefix}-g`)?.value || '0');
      const b = parseInt(document.getElementById(`${prefix}-b`)?.value || '0');
      const a = parseInt(document.getElementById(`${prefix}-a`)?.value || '255');
      return getRgbaString(r, g, b, a) || defaultColor;
    };
    
    const settings = {
      enabled: enabledCheckbox.checked,
      visibleMarking: document.querySelector('input[name="visibleMarking"]:checked')?.value || defaultSettings.visibleMarking,
      shadowbannedMarking: document.querySelector('input[name="shadowbannedMarking"]:checked')?.value || defaultSettings.shadowbannedMarking,
      visibleCustomCode: visibleCustomCode.value,
      shadowbannedCustomCode: shadowbannedCustomCode.value,
      visibleHighlightBorderColor: getColorFromInputs('visible-highlight-border-color', defaultSettings.visibleHighlightBorderColor),
      visibleHighlightBgColor: getColorFromInputs('visible-highlight-bg-color', defaultSettings.visibleHighlightBgColor),
      visibleHighlightBorderWidth: getElementValue('visible-highlight-border-width', defaultSettings.visibleHighlightBorderWidth),
      visibleBorderColor: getColorFromInputs('visible-border-color', defaultSettings.visibleBorderColor),
      visibleBorderWidth: getElementValue('visible-border-width', defaultSettings.visibleBorderWidth),
      visibleBadgeText: getElementValue('visible-badge-text', defaultSettings.visibleBadgeText),
      visibleBadgeColor: getColorFromInputs('visible-badge-color', defaultSettings.visibleBadgeColor),
      visibleBadgeTextColor: getColorFromInputs('visible-badge-text-color', defaultSettings.visibleBadgeTextColor),
      shadowbannedHighlightBorderColor: getColorFromInputs('shadowbanned-highlight-border-color', defaultSettings.shadowbannedHighlightBorderColor),
      shadowbannedHighlightBgColor: getColorFromInputs('shadowbanned-highlight-bg-color', defaultSettings.shadowbannedHighlightBgColor),
      shadowbannedHighlightBorderWidth: getElementValue('shadowbanned-highlight-border-width', defaultSettings.shadowbannedHighlightBorderWidth),
      shadowbannedBorderColor: getColorFromInputs('shadowbanned-border-color', defaultSettings.shadowbannedBorderColor),
      shadowbannedBorderWidth: getElementValue('shadowbanned-border-width', defaultSettings.shadowbannedBorderWidth),
      shadowbannedBadgeText: getElementValue('shadowbanned-badge-text', defaultSettings.shadowbannedBadgeText),
      shadowbannedBadgeColor: getColorFromInputs('shadowbanned-badge-color', defaultSettings.shadowbannedBadgeColor),
      shadowbannedBadgeTextColor: getColorFromInputs('shadowbanned-badge-text-color', defaultSettings.shadowbannedBadgeTextColor),
      // Performance settings
      advancedPerformance: getElementValue('advanced-performance', defaultSettings.advancedPerformance),
      performanceMode: getElementValue('performance-mode', defaultSettings.performanceMode),
      autoRefreshEnabled: getElementValue('auto-refresh-enabled', defaultSettings.autoRefreshEnabled),
      apiTimeout: getElementValue('api-timeout', defaultSettings.apiTimeout),
      checkInterval: getElementValue('check-interval', defaultSettings.checkInterval),
      batchSize: getElementValue('batch-size', defaultSettings.batchSize),
      cacheDuration: getElementValue('cache-duration', defaultSettings.cacheDuration),
      maxRetries: getElementValue('max-retries', defaultSettings.maxRetries),
      debugLogging: getElementValue('debug-logging', defaultSettings.debugLogging),
      aggressiveDetection: getElementValue('aggressive-detection', defaultSettings.aggressiveDetection)
    };
    
    console.log('ShadowGag: Saving settings:', settings);
    
    // Use a more reliable storage method
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(settings, () => {
        if (chrome.runtime.lastError) {
          console.error('ShadowGag: Error saving settings:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        
        console.log('ShadowGag: Settings saved successfully');
        
        // Notify all content scripts about the settings change
        try {
          chrome.tabs.query({ url: "*://*.9gag.com/gag/*" }, (tabs) => {
            if (chrome.runtime.lastError) {
              console.log('ShadowGag: Error querying tabs:', chrome.runtime.lastError);
              resolve(); // Still resolve since settings were saved
              return;
            }
            
            tabs.forEach((tab) => {
              chrome.tabs.sendMessage(tab.id, { 
                action: 'settingsChanged',
                settings: settings
              }, (response) => {
                if (chrome.runtime.lastError) {
                  console.log(`ShadowGag: Could not notify tab ${tab.id}:`, chrome.runtime.lastError.message);
                }
              });
            });
            
            resolve();
          });
        } catch (error) {
          console.error('ShadowGag: Error notifying content scripts:', error);
          resolve(); // Still resolve since settings were saved
        }
      });
    });
    
  } catch (error) {
    console.error('ShadowGag: Error saving settings:', error);
    throw error;
  }
}

// Handle extension toggle
enabledCheckbox.addEventListener('change', async () => {
  console.log('ShadowGag: Extension toggle changed to:', enabledCheckbox.checked);
  
  try {
    // Use the background script to handle the state change
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ 
        action: 'setExtensionState',
        enabled: enabledCheckbox.checked
      }, resolve);
    });
    
    if (response && response.success) {
      console.log('ShadowGag: Extension state updated successfully');
    } else {
      console.error('ShadowGag: Failed to update extension state');
    }
    
    // Also save other settings immediately
    await immediateSave();
    
  } catch (error) {
    console.error('ShadowGag: Error updating extension state:', error);
    // Revert checkbox state on error
    enabledCheckbox.checked = !enabledCheckbox.checked;
  }
});

// Handle marking option changes
visibleMarkingRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    toggleCustomFunctions();
    immediateSave(); // Use immediate save for radio button changes
  });
});

shadowbannedMarkingRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    toggleCustomFunctions();
    immediateSave(); // Use immediate save for radio button changes
  });
});

// Handle custom code changes
visibleCustomCode.addEventListener('input', () => {
  debouncedSave(); // Use debounced save for text input
});

shadowbannedCustomCode.addEventListener('input', () => {
  debouncedSave(); // Use debounced save for text input
});

// Handle customization option changes
function setupCustomizationListeners() {
  // Setup color input synchronization
  const setupColorSync = (prefix) => {
    const rInput = document.getElementById(`${prefix}-r`);
    const gInput = document.getElementById(`${prefix}-g`);
    const bInput = document.getElementById(`${prefix}-b`);
    const aInput = document.getElementById(`${prefix}-a`);
    const hexInput = document.getElementById(`${prefix}-hex`);
    
    if (!rInput || !gInput || !bInput || !aInput || !hexInput) return;
    
    // Update hex when RGBA changes
    const updateHexFromRgba = () => {
      const r = parseInt(rInput.value) || 0;
      const g = parseInt(gInput.value) || 0;
      const b = parseInt(bInput.value) || 0;
      const a = parseInt(aInput.value) || 255;
      hexInput.value = rgbaToHex(r, g, b, a);
      immediateSave();
    };
    
    // Update RGBA when hex changes
    const updateRgbaFromHex = () => {
      const hex = hexInput.value;
      if (hex && hex.match(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/)) {
        const rgba = hexToRgba(hex);
        rInput.value = rgba.r;
        gInput.value = rgba.g;
        bInput.value = rgba.b;
        aInput.value = rgba.a;
        immediateSave();
      }
    };
    
    // Add event listeners
    [rInput, gInput, bInput, aInput].forEach(input => {
      input.addEventListener('input', updateHexFromRgba);
      input.addEventListener('change', updateHexFromRgba);
    });
    
    hexInput.addEventListener('input', updateRgbaFromHex);
    hexInput.addEventListener('change', updateRgbaFromHex);
  };
  
  // Setup color synchronization for all color inputs
  const colorPrefixes = [
    'visible-highlight-border-color',
    'visible-highlight-bg-color',
    'visible-border-color',
    'visible-badge-color',
    'visible-badge-text-color',
    'shadowbanned-highlight-border-color',
    'shadowbanned-highlight-bg-color',
    'shadowbanned-border-color',
    'shadowbanned-badge-color',
    'shadowbanned-badge-text-color'
  ];
  
  colorPrefixes.forEach(setupColorSync);
  
  // Handle other input changes (text inputs, number inputs)
  const otherInputs = document.querySelectorAll('.text-option input[type="text"], .text-option input[type="number"]');
  
  otherInputs.forEach(input => {
    input.addEventListener('input', () => {
      immediateSave();
    });
    
    input.addEventListener('blur', () => {
      immediateSave();
    });
  });
}

// Setup performance settings event listeners
function setupPerformanceListeners() {
  // Advanced performance toggle
  const advancedPerformanceCheckbox = document.getElementById('advanced-performance');
  if (advancedPerformanceCheckbox) {
    advancedPerformanceCheckbox.addEventListener('change', () => {
      togglePerformanceSettings();
      immediateSave();
    });
  }
  
  // Performance mode select
  const performanceModeSelect = document.getElementById('performance-mode');
  if (performanceModeSelect) {
    performanceModeSelect.addEventListener('change', () => {
      immediateSave();
    });
  }
  
  // Auto-refresh toggle
  const autoRefreshCheckbox = document.getElementById('auto-refresh-enabled');
  if (autoRefreshCheckbox) {
    autoRefreshCheckbox.addEventListener('change', () => {
      immediateSave();
    });
  }
  
  // Debug logging toggle
  const debugLoggingCheckbox = document.getElementById('debug-logging');
  if (debugLoggingCheckbox) {
    debugLoggingCheckbox.addEventListener('change', () => {
      immediateSave();
    });
  }
  
  // Aggressive detection toggle
  const aggressiveDetectionCheckbox = document.getElementById('aggressive-detection');
  if (aggressiveDetectionCheckbox) {
    aggressiveDetectionCheckbox.addEventListener('change', () => {
      immediateSave();
    });
  }
  
  // Number inputs for advanced settings
  const numberInputs = document.querySelectorAll('#advanced-performance-settings input[type="number"]');
  numberInputs.forEach(input => {
    input.addEventListener('input', () => {
      debouncedSave();
    });
    
    input.addEventListener('blur', () => {
      immediateSave();
    });
  });
}

// Listen for storage changes to keep popup in sync
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    console.log('ShadowGag: Storage changed:', changes);
    
    // Update UI if settings changed externally
    if (changes.enabled && changes.enabled.newValue !== enabledCheckbox.checked) {
      enabledCheckbox.checked = changes.enabled.newValue;
    }
    
    if (changes.visibleMarking) {
      const radio = document.getElementById(`visible-${changes.visibleMarking.newValue}`);
      if (radio) radio.checked = true;
      toggleCustomFunctions();
    }
    
    if (changes.shadowbannedMarking) {
      const radio = document.getElementById(`shadowbanned-${changes.shadowbannedMarking.newValue}`);
      if (radio) radio.checked = true;
      toggleCustomFunctions();
    }
    
    if (changes.visibleCustomCode) {
      visibleCustomCode.value = changes.visibleCustomCode.newValue;
    }
    
    if (changes.shadowbannedCustomCode) {
      shadowbannedCustomCode.value = changes.shadowbannedCustomCode.newValue;
    }
  }
});

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  console.log('ShadowGag: Popup DOM loaded');
  loadSettings();
  setupExampleButtons();
  setupCustomizationListeners();
  setupPerformanceListeners();
  
  // Main settings event listeners
  enabledCheckbox.addEventListener('change', () => {
    immediateSave();
  });
  
  // Radio button listeners
  visibleMarkingRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      toggleCustomFunctions();
      immediateSave();
    });
  });
  
  shadowbannedMarkingRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      toggleCustomFunctions();
      immediateSave();
    });
  });
  
  // Custom code textarea listeners
  visibleCustomCode.addEventListener('input', () => {
    debouncedSave();
  });
  
  visibleCustomCode.addEventListener('blur', () => {
    immediateSave();
  });
  
  shadowbannedCustomCode.addEventListener('input', () => {
    debouncedSave();
  });
  
  shadowbannedCustomCode.addEventListener('blur', () => {
    immediateSave();
  });
  
  // Add beforeunload listener to save any pending changes
  window.addEventListener('beforeunload', () => {
    console.log('ShadowGag: Popup closing, ensuring settings are saved');
    immediateSave();
  });
  
  // Also listen for visibilitychange to catch when popup loses focus
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('ShadowGag: Popup hidden, saving settings');
      immediateSave();
    }
  });
});

// Setup example buttons
function setupExampleButtons() {
  const exampleButtons = document.querySelectorAll('.example-btn');
  
  exampleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-target');
      const example = button.getAttribute('data-example');
      const textarea = document.getElementById(target);
      
      if (textarea && example) {
        const exampleCode = getExampleCode(target, example);
        textarea.value = exampleCode;
        
        // Trigger save
        saveSettings();
        
        // Visual feedback
        button.style.backgroundColor = '#45a049';
        setTimeout(() => {
          button.style.backgroundColor = '#4caf50';
        }, 200);
      }
    });
  });
}

// Get example code based on target and example type
function getExampleCode(target, example) {
  // Get current values from UI inputs
  const getCurrentValue = (id, defaultValue) => {
    const element = document.getElementById(id);
    return element ? element.value : defaultValue;
  };
  
  // Get color from RGBA inputs
  const getCurrentColor = (prefix, defaultColor) => {
    const r = parseInt(getCurrentValue(`${prefix}-r`, '0'));
    const g = parseInt(getCurrentValue(`${prefix}-g`, '0'));
    const b = parseInt(getCurrentValue(`${prefix}-b`, '0'));
    const a = parseInt(getCurrentValue(`${prefix}-a`, '255'));
    return getRgbaString(r, g, b, a) || defaultColor;
  };
  
  const examples = {
    'visible-custom-code': {
      border: `// Border marking using your current settings
element.style.borderLeft = '${getCurrentValue('visible-border-width', '3')}px solid ${getCurrentColor('visible-border-color', '#4caf50')}';
element.style.paddingLeft = '8px';`,
      
      highlight: `// Highlight marking using your current settings
element.style.backgroundColor = '${getCurrentColor('visible-highlight-bg-color', '#1a2a1a')}';
element.style.borderLeft = '${getCurrentValue('visible-highlight-border-width', '4')}px solid ${getCurrentColor('visible-highlight-border-color', '#4caf50')}';
element.style.paddingLeft = '8px';
element.style.opacity = '0.9';`,
      
      badge: `// Text badge marking using your current settings
const badge = document.createElement('span');
badge.className = 'shadowgag-visible-badge';
badge.textContent = '${getCurrentValue('visible-badge-text', 'VISIBLE')}';
badge.style.cssText = \`
  display: inline-block;
  background: ${getCurrentColor('visible-badge-color', '#4caf50')};
  color: ${getCurrentColor('visible-badge-text-color', '#ffffff')};
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  margin-right: 8px;
  text-transform: uppercase;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.2;
\`;

// Find the best insertion point (matches built-in function exactly)
const header = element.querySelector('.ui-comment-header');
if (header) {
  const container = header.querySelector('.ui-comment-header__container');
  if (container) {
    const timeElement = container.querySelector('.ui-comment-header__time');
    if (timeElement) {
      // Insert before the time element (inline with username and time)
      container.insertBefore(badge, timeElement);
    } else {
      // Fallback: prepend to container
      container.insertBefore(badge, container.firstChild);
    }
  } else {
    // Fallback: prepend to header
    header.insertBefore(badge, header.firstChild);
  }
} else {
  // Last resort: prepend to comment element
  element.insertBefore(badge, element.firstChild);
}`
    },
    
    'shadowbanned-custom-code': {
      border: `// Border marking using your current settings
element.style.borderLeft = '${getCurrentValue('shadowbanned-border-width', '3')}px solid ${getCurrentColor('shadowbanned-border-color', '#ff6b6b')}';
element.style.paddingLeft = '8px';`,
      
      highlight: `// Highlight marking using your current settings
element.style.backgroundColor = '${getCurrentColor('shadowbanned-highlight-bg-color', '#2a1a1a')}';
element.style.borderLeft = '${getCurrentValue('shadowbanned-highlight-border-width', '4')}px solid ${getCurrentColor('shadowbanned-highlight-border-color', '#ff6b6b')}';
element.style.paddingLeft = '8px';
element.style.opacity = '0.8';`,
      
      badge: `// Text badge marking using your current settings
const badge = document.createElement('span');
badge.className = 'shadowgag-shadowbanned-badge';
badge.textContent = '${getCurrentValue('shadowbanned-badge-text', 'SHADOWBANNED')}';
badge.style.cssText = \`
  display: inline-block;
  background: ${getCurrentColor('shadowbanned-badge-color', '#ff6b6b')};
  color: ${getCurrentColor('shadowbanned-badge-text-color', '#ffffff')};
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  margin-right: 8px;
  text-transform: uppercase;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.2;
\`;

// Find the best insertion point (matches built-in function exactly)
const header = element.querySelector('.ui-comment-header');
if (header) {
  const container = header.querySelector('.ui-comment-header__container');
  if (container) {
    const timeElement = container.querySelector('.ui-comment-header__time');
    if (timeElement) {
      // Insert before the time element (inline with username and time)
      container.insertBefore(badge, timeElement);
    } else {
      // Fallback: prepend to container
      container.insertBefore(badge, container.firstChild);
    }
  } else {
    // Fallback: prepend to header
    header.insertBefore(badge, header.firstChild);
  }
} else {
  // Last resort: prepend to comment element
  element.insertBefore(badge, element.firstChild);
}`
    }
  };
  
  return examples[target] && examples[target][example] ? examples[target][example] : '';
}

// Export marking functions for use by content script
window.shadowGagMarkingFunctions = markingFunctions;

console.log('ShadowGag: Popup script initialization complete'); 