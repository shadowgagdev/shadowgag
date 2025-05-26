// ShadowGag - 9gag Shadowban Checker Content Script

// Debug configuration - can be controlled via settings
const DEBUG_CONFIG = {
  ENABLED: true, // Set to false in production
  LEVELS: {
    ERROR: 0,
    WARN: 1, 
    INFO: 2,
    DEBUG: 3,
    TRACE: 4
  },
  CURRENT_LEVEL: 1 // WARN level by default for production
};

// Optimized logging functions
const log = {
  error: (...args) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.CURRENT_LEVEL >= DEBUG_CONFIG.LEVELS.ERROR) {
      console.error('ShadowGag:', ...args);
    }
  },
  warn: (...args) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.CURRENT_LEVEL >= DEBUG_CONFIG.LEVELS.WARN) {
      console.warn('ShadowGag:', ...args);
    }
  },
  info: (...args) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.CURRENT_LEVEL >= DEBUG_CONFIG.LEVELS.INFO) {
      console.log('ShadowGag:', ...args);
    }
  },
  debug: (...args) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.CURRENT_LEVEL >= DEBUG_CONFIG.LEVELS.DEBUG) {
      console.log('ShadowGag:', ...args);
    }
  },
  trace: (...args) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG.CURRENT_LEVEL >= DEBUG_CONFIG.LEVELS.TRACE) {
      console.log('ShadowGag:', ...args);
    }
  }
};

// Legacy debug functions for backward compatibility (will be phased out)
const debugLog = (...args) => {
  log.debug(...args);
};

const debugError = (...args) => {
  log.error(...args);
};

const debugWarn = (...args) => {
  log.warn(...args);
};

debugLog('Content script loaded on:', window.location.href);

// URL Change Detection System - for handling navigation through notifications
class URLChangeDetector {
    constructor() {
        console.log('ShadowGag: URLChangeDetector constructor starting...');
        this.currentURL = window.location.href;
        this.currentHash = window.location.hash;
        this.listeners = [];
        this.isMonitoring = false;
        this.lastHashChangeTime = null;
        this.pendingEvents = []; // Queue events until listeners are ready
        
        console.log('ShadowGag: URLChangeDetector initialized');
    }

    startMonitoring() {
        if (this.isMonitoring) {
            console.log('ShadowGag: URLChangeDetector already monitoring');
            return;
        }

        console.log('ShadowGag: Starting URL change monitoring');
        this.isMonitoring = true;

        // Check if we loaded directly with a comment hash (notification navigation)
        const currentHash = window.location.hash;
        console.log('ShadowGag: URLChangeDetector checking initial hash:', currentHash);
        if (currentHash.includes('cs_comment_id=')) {
            console.log('ShadowGag: Page loaded with comment hash, triggering immediate processing');
            const targetCommentId = this.extractCommentIdFromHash(currentHash);
            console.log('ShadowGag: Extracted target comment ID:', targetCommentId);
            // Delay slightly to ensure DOM is ready
            setTimeout(() => {
                console.log('ShadowGag: Triggering comment navigation for initial load');
                this.notifyURLChange('comment_navigation', {
                    oldHash: '',
                    newHash: currentHash,
                    targetCommentId: targetCommentId,
                    isInitialLoad: true
                });
            }, 100);
        } else {
            console.log('ShadowGag: No comment hash in initial URL');
        }

        // Listen for hash changes (navigation to specific comments)
        window.addEventListener('hashchange', this.handleHashChange.bind(this));
        
        // Listen for popstate events (back/forward navigation)
        window.addEventListener('popstate', this.handlePopState.bind(this));
        
        // Periodically check for URL changes (fallback)
        this.urlCheckInterval = setInterval(() => {
            this.checkForURLChange();
        }, 1000);
    }

    stopMonitoring() {
        if (!this.isMonitoring) {
            return;
        }

        console.log('ShadowGag: Stopping URL change monitoring');
        this.isMonitoring = false;

        window.removeEventListener('hashchange', this.handleHashChange.bind(this));
        window.removeEventListener('popstate', this.handlePopState.bind(this));
        
        if (this.urlCheckInterval) {
            clearInterval(this.urlCheckInterval);
            this.urlCheckInterval = null;
        }
    }

    handleHashChange(event) {
        console.log('ShadowGag: Hash change detected:', event.oldURL, '->', event.newURL);
        this.lastHashChangeTime = Date.now();
        
        const oldHash = new URL(event.oldURL).hash;
        const newHash = new URL(event.newURL).hash;
        
        const oldCommentId = this.extractCommentIdFromHash(oldHash);
        const newCommentId = this.extractCommentIdFromHash(newHash);
        
        // Check if this is navigation to a specific comment
        if (newCommentId) {
            console.log('ShadowGag: Navigation to specific comment detected:', newCommentId);
            this.notifyURLChange('comment_navigation', {
                oldHash,
                newHash,
                oldCommentId,
                targetCommentId: newCommentId,
                isHashChange: true
            });
        } else if (oldCommentId && !newCommentId) {
            console.log('ShadowGag: Navigation away from specific comment');
            this.notifyURLChange('hash_change', {
                oldHash,
                newHash,
                oldCommentId,
                targetCommentId: null
            });
        }
    }

    handlePopState(event) {
        console.log('ShadowGag: Popstate event detected');
        this.checkForURLChange();
    }

    checkForURLChange() {
        const newURL = window.location.href;
        const newHash = window.location.hash;
        
        if (newURL !== this.currentURL || newHash !== this.currentHash) {
            console.log('ShadowGag: URL change detected:', this.currentURL, '->', newURL);
            
            const changeType = this.determineChangeType(this.currentURL, newURL, this.currentHash, newHash);
            
            this.notifyURLChange(changeType, {
                oldURL: this.currentURL,
                newURL: newURL,
                oldHash: this.currentHash,
                newHash: newHash,
                targetCommentId: this.extractCommentIdFromHash(newHash)
            });
            
            this.currentURL = newURL;
            this.currentHash = newHash;
        }
    }

    determineChangeType(oldURL, newURL, oldHash, newHash) {
        // Check if this is navigation to a specific comment
        if (newHash.includes('cs_comment_id=')) {
            return 'comment_navigation';
        }
        
        // Check if this is a page change
        const oldPath = new URL(oldURL).pathname;
        const newPath = new URL(newURL).pathname;
        if (oldPath !== newPath) {
            return 'page_change';
        }
        
        // Hash change only
        if (oldHash !== newHash) {
            return 'hash_change';
        }
        
        return 'url_change';
    }

    extractCommentIdFromHash(hash) {
        const match = hash.match(/cs_comment_id=(c_\d+)/);
        return match ? match[1] : null;
    }

    onURLChange(callback) {
        this.listeners.push(callback);
        
        // Process any pending events when the first listener is registered
        if (this.pendingEvents.length > 0) {
            console.log('ShadowGag: Processing', this.pendingEvents.length, 'pending URL change events');
            this.pendingEvents.forEach(event => {
                try {
                    callback(event.changeType, event.details);
                } catch (error) {
                    console.error('ShadowGag: Error processing pending URL change event:', error);
                }
            });
            this.pendingEvents = []; // Clear pending events
        }
    }

    notifyURLChange(changeType, details) {
        console.log('ShadowGag: Notifying URL change listeners:', changeType, details);
        
        if (this.listeners.length === 0) {
            // No listeners yet, queue the event
            console.log('ShadowGag: No listeners registered, queuing URL change event');
            this.pendingEvents.push({ changeType, details });
            return;
        }
        
        this.listeners.forEach(callback => {
            try {
                callback(changeType, details);
            } catch (error) {
                console.error('ShadowGag: Error in URL change listener:', error);
            }
        });
    }
}

// Login Detection System - must be initialized first
class LoginDetector {
    constructor() {
        console.log('ShadowGag: LoginDetector constructor starting...');
        this.currentUser = null;
        this.listeners = [];
        this.isMonitoring = false;
        this.cookieCheckInterval = null;
        this.userCheckInterval = null;
        this.storageCheckInterval = null;
        this.mutationObserver = null;
        this.lastAuthCookies = this.getAuthCookies();
        this.logoutDetected = false; // Track if logout was detected
        this.lastUserChangeTime = null; // Track last user change time for stability
        this.lastDOMUser = null; // Cache last DOM user detection
        this.lastDOMUserTime = null; // Cache timestamp for DOM user detection
        
        console.log('ShadowGag: LoginDetector initialized');
    }

    // Get current authentication cookies
    getAuthCookies() {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [name, value] = cookie.trim().split('=');
            if (name && (name === 'PHPSESSID' || name === 'session')) {
                acc[name] = value;
            }
            return acc;
        }, {});
        return cookies;
    }

    // Extract user data from various sources
    extractUserFromDOM() {
        // Cache the last found user to avoid rapid changes
        if (this.lastDOMUser && this.lastDOMUserTime && Date.now() - this.lastDOMUserTime < 2000) {
            // Return cached user if found recently (within 2 seconds)
            return this.lastDOMUser;
        }
        
        let foundUser = null;
        
        // Look for avatar-container with /u/username pattern
        const avatarContainers = document.querySelectorAll('a.avatar-container[href*="/u/"]');
        
        for (const container of avatarContainers) {
            const href = container.getAttribute('href');
            if (href) {
                const match = href.match(/\/u\/([^\/\?#]+)/);
                if (match && match[1]) {
                    foundUser = match[1];
                    console.log('ShadowGag: Found user in DOM:', foundUser);
                    break;
                }
            }
        }
        
        // Fallback: look for any /u/ links in navigation areas
        if (!foundUser) {
            const userLinks = document.querySelectorAll('a[href*="/u/"]');
            for (const link of userLinks) {
                const href = link.getAttribute('href');
                if (href) {
                    const match = href.match(/\/u\/([^\/\?#]+)/);
                    if (match && match[1]) {
                        // Check if this link is in a navigation context
                        const isInNav = link.closest('nav, header, .nav, .header, [class*="nav"], [class*="header"], [class*="user"]');
                        if (isInNav) {
                            foundUser = match[1];
                            console.log('ShadowGag: Found user in navigation:', foundUser);
                            break;
                        }
                    }
                }
            }
        }
        
        // Cache the result
        if (foundUser) {
            this.lastDOMUser = foundUser;
            this.lastDOMUserTime = Date.now();
        }
        
        return foundUser;
    }

    // Extract user data from API responses
    extractUserFromApiData(data) {
        try {
            // Check for user data in various API response formats
            if (data && typeof data === 'object') {
                // Format 1: Direct user object
                if (data.user && data.user.username) {
                    return data.user.username;
                }
                
                // Format 2: Data wrapper
                if (data.data && data.data.user && data.data.user.username) {
                    return data.data.user.username;
                }
                
                // Format 3: Payload wrapper
                if (data.payload && data.payload.user && data.payload.user.username) {
                    return data.payload.user.username;
                }
                
                // Format 4: Meta wrapper
                if (data.meta && data.meta.user && data.meta.user.username) {
                    return data.meta.user.username;
                }
                
                // Format 5: Search in nested objects
                const searchForUser = (obj, depth = 0) => {
                    if (depth > 3) return null; // Prevent infinite recursion
                    
                    for (const key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            const value = obj[key];
                            
                            // Check if this is a user object
                            if (value && typeof value === 'object') {
                                if (value.username && typeof value.username === 'string') {
                                    return value.username;
                                }
                                
                                // Recurse into nested objects
                                const nestedResult = searchForUser(value, depth + 1);
                                if (nestedResult) return nestedResult;
                            }
                        }
                    }
                    return null;
                };
                
                const foundUser = searchForUser(data);
                if (foundUser) {
                    return foundUser;
                }
            }
        } catch (error) {
            console.error('ShadowGag: Error extracting user from API data:', error);
        }
        
        return null;
    }

    // Check for user changes
    checkForUserChange() {
        const newUser = this.extractUserFromDOM();
        
        // Check if user changed (including logout: user -> null)
        if (this.currentUser !== newUser) {
            console.log(`[LoginDetector] User changed from "${this.currentUser}" to "${newUser}"`);
            
            // Add stability check - don't change too rapidly
            if (this.lastUserChangeTime && Date.now() - this.lastUserChangeTime < 1000) {
                console.log(`[LoginDetector] User change too rapid, ignoring`);
                return;
            }
            
            // Special handling for logout
            if (this.currentUser && !newUser) {
                console.log(`[LoginDetector] Logout detected: ${this.currentUser} -> logged out`);
                this.logoutDetected = true;
            }
            // Special handling for login
            else if (!this.currentUser && newUser) {
                console.log(`[LoginDetector] Login detected: logged out -> ${newUser}`);
                this.logoutDetected = false;
            }
            
            this.currentUser = newUser;
            this.lastUserChangeTime = Date.now();
            this.notifyUserChange(newUser);
        }
    }

    monitorAuthCookies() {
        const checkCookies = () => {
            const currentCookies = this.getAuthCookies();
            
            // Check for cookie deletion (logout indicators)
            const sessionDeleted = document.cookie.includes('session=deleted');
            const phpSessionDeleted = document.cookie.includes('PHPSESSID=deleted');
            
            if (sessionDeleted || phpSessionDeleted) {
                console.log('[LoginDetector] Logout detected via cookie deletion');
                this.logoutDetected = true;
                // Clear current user immediately on logout
                if (this.currentUser) {
                    console.log(`[LoginDetector] Clearing user due to logout: ${this.currentUser} -> null`);
                    this.currentUser = null;
                    this.notifyUserChange(null);
                }
            }
            
            // Check for significant cookie changes
            const cookiesChanged = JSON.stringify(currentCookies) !== JSON.stringify(this.lastAuthCookies);
            if (cookiesChanged) {
                console.log('[LoginDetector] Auth cookies changed, checking for user change');
                this.lastAuthCookies = currentCookies;
                
                // Delay user check to allow DOM updates
                setTimeout(() => this.checkForUserChange(), 100);
            }
        };

        this.cookieCheckInterval = setInterval(checkCookies, 1000);
    }

    monitorDOMChanges() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }

        this.mutationObserver = new MutationObserver((mutations) => {
            let shouldCheckUser = false;
            
            for (const mutation of mutations) {
                // Check for logout-related DOM changes
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check for login/logout buttons or user menu changes
                            if (node.matches && (
                                node.matches('[data-testid*="login"]') ||
                                node.matches('[data-testid*="logout"]') ||
                                node.matches('[data-testid*="user"]') ||
                                node.matches('.header-user') ||
                                node.matches('.user-menu') ||
                                node.querySelector('[data-testid*="login"]') ||
                                node.querySelector('[data-testid*="logout"]') ||
                                node.querySelector('[data-testid*="user"]') ||
                                node.querySelector('.header-user') ||
                                node.querySelector('.user-menu')
                            )) {
                                shouldCheckUser = true;
                                break;
                            }
                        }
                    }
                }
                
                // Check for attribute changes that might indicate user state changes
                if (mutation.type === 'attributes') {
                    const target = mutation.target;
                    if (target.matches && (
                        target.matches('[data-testid*="user"]') ||
                        target.matches('.header-user') ||
                        target.matches('.user-menu')
                    )) {
                        shouldCheckUser = true;
                    }
                }
                
                if (shouldCheckUser) break;
            }
            
            if (shouldCheckUser) {
                console.log('[LoginDetector] DOM changes detected, checking for user change');
                // Delay to allow DOM to settle
                setTimeout(() => this.checkForUserChange(), 100);
            }
        });

        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'data-testid', 'style']
        });
    }

    monitorStorageChanges() {
        // Listen for localStorage changes
        window.addEventListener('storage', (event) => {
            if (event.key && (event.key.includes('user') || event.key.includes('auth') || event.key.includes('login'))) {
                console.log('[LoginDetector] Storage change detected:', event.key, event.newValue);
                setTimeout(() => this.checkForUserChange(), 500);
            }
        });
        
        // Monitor sessionStorage (requires polling since storage event doesn't fire for same-origin)
        let lastSessionStorage = JSON.stringify(sessionStorage);
        const checkSessionStorage = () => {
            const currentSessionStorage = JSON.stringify(sessionStorage);
            if (currentSessionStorage !== lastSessionStorage) {
                console.log('[LoginDetector] SessionStorage changed');
                lastSessionStorage = currentSessionStorage;
                setTimeout(() => this.checkForUserChange(), 500);
            }
        };
        
        this.storageCheckInterval = setInterval(checkSessionStorage, 2000);
    }

    // Start monitoring for login changes
    startMonitoring() {
        if (this.isMonitoring) return;
        
        console.log('[LoginDetector] Starting monitoring...');
        this.isMonitoring = true;
        
        // Initial user check
        this.checkForUserChange();
        
        // Monitor authentication cookies
        this.monitorAuthCookies();
        
        // Monitor storage changes
        this.monitorStorageChanges();
        
        // Monitor DOM changes
        this.monitorDOMChanges();
        
        // Periodic fallback check
        this.userCheckInterval = setInterval(() => {
            this.monitorAuthCookies();
            this.checkForUserChange();
        }, 5000);
        
        console.log('[LoginDetector] Monitoring started');
    }

    // Stop monitoring
    stopMonitoring() {
        console.log('[LoginDetector] Stopping monitoring');
        this.isMonitoring = false;
        
        if (this.userCheckInterval) {
            clearInterval(this.userCheckInterval);
            this.userCheckInterval = null;
        }
        
        if (this.cookieCheckInterval) {
            clearInterval(this.cookieCheckInterval);
            this.cookieCheckInterval = null;
        }
        
        if (this.storageCheckInterval) {
            clearInterval(this.storageCheckInterval);
            this.storageCheckInterval = null;
        }
        
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
        
        console.log('[LoginDetector] Monitoring stopped');
    }

    // Add listener for user changes
    onUserChange(callback) {
        this.listeners.push(callback);
    }

    // Notify listeners of user change
    notifyUserChange(newUser) {
        console.log('ShadowGag: Notifying user change listeners:', newUser);
        this.listeners.forEach(callback => {
            try {
                callback(newUser);
            } catch (error) {
                console.error('ShadowGag: Error in user change callback:', error);
            }
        });
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Process API response for user data
    processApiResponse(url, responseText) {
        try {
            // Monitor for logout URL access
            if (url.includes('/logout')) {
                console.log('[LoginDetector] Logout URL detected');
                this.logoutDetected = true;
                // Clear user immediately on logout URL access
                if (this.currentUser) {
                    console.log(`[LoginDetector] Clearing user due to logout URL: ${this.currentUser} -> null`);
                    this.currentUser = null;
                    this.notifyUserChange(null);
                }
                return;
            }
            
            const data = JSON.parse(responseText);
            const user = this.extractUserFromApiData(data);
            
            // Only check for logout in specific API endpoints, not comment APIs
            // Comment APIs may have empty opUserId but that doesn't mean logout
            const isUserRelatedAPI = url.includes('/user/') || url.includes('/profile/') || url.includes('/auth/') || url.includes('/login/');
            const isCommentAPI = url.includes('comment-cdn.9gag.com') || url.includes('comment.9gag.com');
            
            // Debug logging for comment APIs
            if (isCommentAPI) {
                console.log('[LoginDetector] Processing comment API response, skipping logout detection');
                // For comment APIs, only look for positive user identification, don't assume logout
                if (user && user !== this.currentUser) {
                    console.log(`[LoginDetector] User detected from comment API: ${user}`);
                    this.currentUser = user;
                    this.logoutDetected = false;
                    this.notifyUserChange(user);
                }
                return; // Exit early for comment APIs
            }
            
            // Check for empty opUserId which indicates logout (only for user-related APIs)
            if (isUserRelatedAPI && data.payload && data.payload.hasOwnProperty('opUserId') && data.payload.opUserId === '') {
                if (this.currentUser && !this.logoutDetected) {
                    console.log('[LoginDetector] Logout detected via empty opUserId in user API response');
                    this.logoutDetected = true;
                    this.currentUser = null;
                    this.notifyUserChange(null);
                    return;
                }
            }
            
            if (user && user !== this.currentUser) {
                console.log(`[LoginDetector] User detected from API: ${user}`);
                this.currentUser = user;
                this.logoutDetected = false; // Reset logout flag on successful user detection
                this.notifyUserChange(user);
            }
        } catch (error) {
            // Silently ignore parsing errors
        }
    }
}

// Initialize login detector early
window.shadowGagLoginDetector = new LoginDetector();

// Early configuration capture system - must be initialized first
class ConfigurationCapture {
    constructor() {
        console.log('ShadowGag: ConfigurationCapture constructor starting...');
        this.appId = null;
        this.clientVersion = null;
        this.listeners = [];
        
        // Immediate debugging - log what's available
        console.log('ShadowGag: Immediate page inspection:');
        console.log('  window._config:', window._config);
        console.log('  window.config:', window.config);
        console.log('  document.readyState:', document.readyState);
        console.log('  script tags count:', document.querySelectorAll('script').length);
        
        // Try to find any obvious config immediately
        if (window._config) {
            console.log('ShadowGag: window._config found:', window._config);
        }
        
        console.log('ShadowGag: ConfigurationCapture properties initialized, calling setupEarlyCapture...');
        this.setupEarlyCapture();
        console.log('ShadowGag: ConfigurationCapture constructor completed');
    }

    setupEarlyCapture() {
        // Listen for network requests to capture client-version header
        this.interceptNetworkRequests();
        
        // Parse embedded configuration from page
        this.parseEmbeddedConfig();
        
        // Watch for dynamic configuration updates
        this.watchForConfigUpdates();
    }

    interceptNetworkRequests() {
        // Override fetch to capture headers AND monitor comment API calls
        // Handle Firefox's read-only fetch property
        try {
            const originalFetch = window.fetch;
            
            // Try to override fetch directly first
            try {
                window.fetch = async (...args) => {
                    return await this.handleFetchRequest(originalFetch, ...args);
                };
            } catch (readOnlyError) {
                console.log('ShadowGag: fetch is read-only, using alternative approach');
                
                // Alternative approach: Use a proxy or wrapper
                const fetchWrapper = async (...args) => {
                    return await this.handleFetchRequest(originalFetch, ...args);
                };
                
                // Store the wrapper for other parts of the extension to use
                window.shadowGagFetch = fetchWrapper;
                
                // Try to intercept at the prototype level
                if (window.Request && window.Request.prototype) {
                    const originalRequestInit = window.Request;
                    window.Request = function(...args) {
                        const request = new originalRequestInit(...args);
                        // Monitor the request
                        if (request.url && request.url.includes('9gag.com')) {
                            console.log('ShadowGag: Detected 9gag request via Request constructor:', request.url);
                        }
                        return request;
                    };
                    // Copy static properties
                    Object.setPrototypeOf(window.Request, originalRequestInit);
                    Object.defineProperty(window.Request, 'prototype', {
                        value: originalRequestInit.prototype,
                        writable: false
                    });
                }
            }
        } catch (error) {
            console.warn('ShadowGag: Could not override fetch, using fallback monitoring:', error);
            // Continue with XMLHttpRequest monitoring only
        }

        // Override XMLHttpRequest to capture headers (this usually works in all browsers)
        try {
            const originalOpen = XMLHttpRequest.prototype.open;
            const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
            const originalSend = XMLHttpRequest.prototype.send;
            
            XMLHttpRequest.prototype.open = function(method, url, ...args) {
                this._shadowgag_url = url;
                this._shadowgag_headers = {};
                this._shadowgag_method = method;
                return originalOpen.apply(this, [method, url, ...args]);
            };
            
            XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
                if (this._shadowgag_headers) {
                    this._shadowgag_headers[name] = value;
                }
                
                if (name.toLowerCase() === 'client-version' && 
                    this._shadowgag_url && 
                    this._shadowgag_url.includes('9gag.com') &&
                    window.shadowGagConfigCapture &&
                    !window.shadowGagConfigCapture.clientVersion) {
                    window.shadowGagConfigCapture.clientVersion = value;
                    console.log('ShadowGag: Captured client-version from XHR:', value);
                    window.shadowGagConfigCapture.notifyListeners();
                }
                return originalSetRequestHeader.apply(this, [name, value]);
            };
            
            XMLHttpRequest.prototype.send = function(...args) {
                // Set up response monitoring
                this.addEventListener('load', () => {
                    if (this._shadowgag_url && this._shadowgag_url.includes('9gag.com')) {
                        this.handleXHRResponse();
                    }
                });
                
                return originalSend.apply(this, args);
            };
            
            // Add response handler to XMLHttpRequest prototype
            XMLHttpRequest.prototype.handleXHRResponse = function() {
                try {
                    if (this.responseText && this._shadowgag_url) {
                        // Process response for user data
                        if (window.shadowGagLoginDetector) {
                            window.shadowGagLoginDetector.processApiResponse(this._shadowgag_url, this.responseText);
                        }
                        
                        // Extract appId from URL if present
                        if (this._shadowgag_url.includes('appId=')) {
                            const match = this._shadowgag_url.match(/appId=([^&]+)/);
                            if (match && window.shadowGagConfigCapture && !window.shadowGagConfigCapture.appId) {
                                window.shadowGagConfigCapture.appId = match[1];
                                console.log('ShadowGag: Captured appId from XHR URL:', match[1]);
                                window.shadowGagConfigCapture.notifyListeners();
                            }
                        }
                        
                        // Monitor comment API calls
                        if (this._shadowgag_url.includes('comment-cdn.9gag.com') && this._shadowgag_url.includes('comment-list.json')) {
                            console.log('ShadowGag: Detected comment API call via XHR:', this._shadowgag_url);
                            
                            try {
                                const data = JSON.parse(this.responseText);
                                // Process new comments after a delay to allow DOM updates
                                if (window.shadowGagChecker) {
                                    setTimeout(() => window.shadowGagChecker.processNewComments(data), 500);
                                } else {
                                    // Store the data for later processing when checker is ready
                                    console.log('ShadowGag: Storing XHR API data for later processing');
                                    if (!window.shadowGagPendingData) {
                                        window.shadowGagPendingData = [];
                                    }
                                    window.shadowGagPendingData.push(data);
                                }
                            } catch (parseError) {
                                console.error('ShadowGag: Error parsing XHR response:', parseError);
                            }
                        }
                        
                        // Monitor new comment creation API calls
                        if (this._shadowgag_url.includes('comment.9gag.com') && this._shadowgag_url.includes('add-comment.json')) {
                            console.log('ShadowGag: Detected new comment creation via XHR:', this._shadowgag_url);
                            
                            try {
                                const data = JSON.parse(this.responseText);
                                if (data.status === 'OK' && data.payload && data.payload.comment) {
                                    console.log('ShadowGag: New comment created successfully via XHR:', data.payload.comment.commentId);
                                    
                                    // Process the new comment after a delay to allow DOM updates
                                    if (window.shadowGagChecker) {
                                        setTimeout(() => window.shadowGagChecker.processNewlyCreatedComment(data.payload.comment), 2000);
                                    } else {
                                        // Store for later processing
                                        if (!window.shadowGagPendingNewComments) {
                                            window.shadowGagPendingNewComments = [];
                                        }
                                        window.shadowGagPendingNewComments.push(data.payload.comment);
                                    }
                                }
                            } catch (parseError) {
                                console.error('ShadowGag: Error parsing XHR new comment response:', parseError);
                            }
                        }
                    }
                } catch (error) {
                    console.error('ShadowGag: Error handling XHR response:', error);
                }
            };
            
        } catch (xhrError) {
            console.error('ShadowGag: Could not override XMLHttpRequest:', xhrError);
        }
    }
    
    async handleFetchRequest(originalFetch, ...args) {
        const [resource, config] = args;
        
        try {
            const response = await originalFetch(...args);
            
            // Extract URL from resource
            let url = '';
            if (typeof resource === 'string') {
                url = resource;
            } else if (resource && resource.url) {
                url = resource.url;
            }
            
            // Extract client-version from headers
            if (config && config.headers && config.headers['client-version'] && 
                url && url.includes('9gag.com') &&
                window.shadowGagConfigCapture &&
                !window.shadowGagConfigCapture.clientVersion) {
                window.shadowGagConfigCapture.clientVersion = config.headers['client-version'];
                console.log('ShadowGag: Captured client-version from fetch:', config.headers['client-version']);
                window.shadowGagConfigCapture.notifyListeners();
            }
            
            // Extract appId from URL if present
            if (url && url.includes('appId=')) {
                const match = url.match(/appId=([^&]+)/);
                if (match && window.shadowGagConfigCapture && !window.shadowGagConfigCapture.appId) {
                    window.shadowGagConfigCapture.appId = match[1];
                    console.log('ShadowGag: Captured appId from fetch URL:', match[1]);
                    window.shadowGagConfigCapture.notifyListeners();
                }
            }
            
            // Only process response body for relevant URLs to avoid unnecessary cloning
            const shouldProcessResponse = url && url.includes('9gag.com') && (
                url.includes('comment-cdn.9gag.com') || 
                url.includes('comment.9gag.com') || 
                window.shadowGagLoginDetector
            );
            
            if (shouldProcessResponse) {
                // Clone response once and read it once
                const clonedResponse = response.clone();
                let responseText = null;
                let responseData = null;
                
                try {
                    responseText = await clonedResponse.text();
                    
                    // Try to parse as JSON if it looks like JSON
                    if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
                        try {
                            responseData = JSON.parse(responseText);
                        } catch (jsonError) {
                            // Not valid JSON, keep as text
                        }
                    }
                } catch (error) {
                    console.error('ShadowGag: Error reading fetch response:', error);
                    return response;
                }
                
                // Process response for user data
                if (window.shadowGagLoginDetector) {
                    // Add debug logging for comment API responses
                    if (url.includes('comment-cdn.9gag.com')) {
                        console.log('ShadowGag: Processing comment API response for user detection');
                    }
                    window.shadowGagLoginDetector.processApiResponse(url, responseText);
                }
                
                // Monitor comment API calls
                if (url.includes('comment-cdn.9gag.com') && url.includes('comment-list.json') && responseData) {
                    console.log('ShadowGag: Detected comment API call via fetch:', url);
                    
                    // Process new comments after a delay to allow DOM updates
                    if (window.shadowGagChecker) {
                        setTimeout(() => window.shadowGagChecker.processNewComments(responseData), 500);
                    } else {
                        // Store the data for later processing when checker is ready
                        console.log('ShadowGag: Storing fetch API data for later processing');
                        if (!window.shadowGagPendingData) {
                            window.shadowGagPendingData = [];
                        }
                        window.shadowGagPendingData.push(responseData);
                    }
                }
                
                // Monitor new comment creation API calls
                if (url.includes('comment.9gag.com') && url.includes('add-comment.json') && responseData) {
                    console.log('ShadowGag: Detected new comment creation via fetch:', url);
                    
                    if (responseData.status === 'OK' && responseData.payload && responseData.payload.comment) {
                        console.log('ShadowGag: New comment created successfully via fetch:', responseData.payload.comment.commentId);
                        
                        // Process the new comment after a delay to allow DOM updates
                        if (window.shadowGagChecker) {
                            setTimeout(() => window.shadowGagChecker.processNewlyCreatedComment(responseData.payload.comment), 2000);
                        } else {
                            // Store for later processing
                            if (!window.shadowGagPendingNewComments) {
                                window.shadowGagPendingNewComments = [];
                            }
                            window.shadowGagPendingNewComments.push(responseData.payload.comment);
                        }
                    }
                }
            }
            
            return response;
        } catch (error) {
            console.error('ShadowGag: Error in fetch handler:', error);
            throw error;
        }
    }

    parseEmbeddedConfig() {
        // Look for window._config or similar embedded configuration
        const checkForConfig = () => {
            console.log('ShadowGag: Checking for embedded configuration...');
            
            // Check window._config
            if (window._config && window._config.config) {
                const config = window._config.config;
                console.log('ShadowGag: Found window._config:', config);
                
                // Extract commentOptions appId
                if (config.commentOptions && config.commentOptions.appId && !this.appId) {
                    this.appId = config.commentOptions.appId;
                    console.log('ShadowGag: Captured appId from window._config:', this.appId);
                    this.notifyListeners();
                }
                
                // Extract client version from app version
                if (config.appVersion && !this.clientVersion) {
                    // Convert app version to client version format
                    this.clientVersion = `${config.appVersion}/web`;
                    console.log('ShadowGag: Derived client-version from appVersion:', this.clientVersion);
                    this.notifyListeners();
                }
            }
            
            // Check for other possible config locations
            const configSources = [
                'window._config',
                'window.config',
                'window.GAG_CONFIG',
                'window.APP_CONFIG',
                'window.INITIAL_STATE',
                'window.__INITIAL_STATE__',
                'window.__CONFIG__'
            ];
            
            for (const source of configSources) {
                try {
                    const configObj = this.getNestedProperty(window, source.replace('window.', ''));
                    if (configObj) {
                        console.log(`ShadowGag: Checking config source: ${source}`, configObj);
                        this.extractConfigFromObject(configObj, source);
                    }
                } catch (error) {
                    // Silently continue to next source
                }
            }

            // Check for script tags containing configuration
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const content = script.textContent || script.innerText;
                if (content) {
                    // Look for various patterns
                    this.extractConfigFromScriptContent(content);
                }
            }
            
            // Check meta tags
            const metaTags = document.querySelectorAll('meta[name*="config"], meta[property*="config"]');
            for (const meta of metaTags) {
                const content = meta.getAttribute('content');
                if (content) {
                    try {
                        const configData = JSON.parse(content);
                        this.extractConfigFromObject(configData, 'meta tag');
                    } catch (error) {
                        // Not JSON, continue
                    }
                }
            }
            
            // Check data attributes on html/body
            const elements = [document.documentElement, document.body];
            for (const element of elements) {
                if (element) {
                    for (const attr of element.attributes) {
                        if (attr.name.startsWith('data-') && attr.value) {
                            try {
                                const configData = JSON.parse(attr.value);
                                this.extractConfigFromObject(configData, `${element.tagName} ${attr.name}`);
                            } catch (error) {
                                // Not JSON, continue
                            }
                        }
                    }
                }
            }
        };

        // Check immediately
        checkForConfig();
        
        // Check again after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkForConfig);
        }
        
        // Check periodically for dynamically loaded config
        const configCheckInterval = setInterval(() => {
            checkForConfig();
            
            // Stop checking once we have both values
            if (this.appId && this.clientVersion) {
                clearInterval(configCheckInterval);
            }
        }, 100);
        
        // Stop checking after 10 seconds (increased from 5)
        setTimeout(() => clearInterval(configCheckInterval), 10000);
    }
    
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }
    
    extractConfigFromObject(configObj, source) {
        if (!configObj || typeof configObj !== 'object') return;
        
        // Recursively search for appId and version info
        const searchKeys = (obj, depth = 0) => {
            if (depth > 5) return; // Prevent infinite recursion
            
            for (const [key, value] of Object.entries(obj)) {
                // Look for appId
                if ((key === 'appId' || key === 'app_id' || key === 'applicationId') && 
                    typeof value === 'string' && value.length > 10 && !this.appId) {
                    this.appId = value;
                    console.log(`ShadowGag: Captured appId from ${source}.${key}:`, value);
                    this.notifyListeners();
                }
                
                // Look for version info
                if ((key === 'appVersion' || key === 'version' || key === 'clientVersion' || key === 'app_version') && 
                    typeof value === 'string' && !this.clientVersion) {
                    // Convert to client version format if needed
                    this.clientVersion = value.includes('/web') ? value : `${value}/web`;
                    console.log(`ShadowGag: Captured client-version from ${source}.${key}:`, this.clientVersion);
                    this.notifyListeners();
                }
                
                // Look for commentOptions
                if (key === 'commentOptions' && value && typeof value === 'object') {
                    if (value.appId && !this.appId) {
                        this.appId = value.appId;
                        console.log(`ShadowGag: Captured appId from ${source}.commentOptions:`, value.appId);
                        this.notifyListeners();
                    }
                }
                
                // Recurse into nested objects
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    searchKeys(value, depth + 1);
                }
            }
        };
        
        searchKeys(configObj);
    }
    
    extractConfigFromScriptContent(content) {
        // Early return if configuration is already complete
        if (this.appId && this.clientVersion) {
            return;
        }
        
        // Only log for very large scripts to reduce noise
        if (content.length > 50000) {
            log.trace(`Analyzing large script (${content.length} chars) for config...`);
        }
        
        // Look for various JSON patterns
        const patterns = [
            // Standard patterns for appId
            /"appId"\s*:\s*"([^"]+)"/g,
            /"app_id"\s*:\s*"([^"]+)"/g,
            /"applicationId"\s*:\s*"([^"]+)"/g,
            /appId\s*:\s*"([^"]+)"/g,
            /app_id\s*:\s*"([^"]+)"/g,
            /"appId"\s*:\s*'([^']+)'/g,
            /appId\s*:\s*'([^']+)'/g,
            
            // Version patterns
            /"appVersion"\s*:\s*"([^"]+)"/g,
            /"version"\s*:\s*"([^"]+)"/g,
            /"clientVersion"\s*:\s*"([^"]+)"/g,
            /appVersion\s*:\s*"([^"]+)"/g,
            /version\s*:\s*"([^"]+)"/g,
            /"client-version"\s*:\s*"([^"]+)"/g,
            
            // Comment options patterns
            /"commentOptions"\s*:\s*\{[^}]*"appId"\s*:\s*"([^"]+)"/g,
            /commentOptions\s*:\s*\{[^}]*appId\s*:\s*"([^"]+)"/g,
            
            // More aggressive appId patterns
            /["']appId["']\s*:\s*["']([a-f0-9_]{20,})["']/gi,
            /appId["']\s*:\s*["']([a-f0-9_]{20,})["']/gi,
            /["']app_id["']\s*:\s*["']([a-f0-9_]{20,})["']/gi,
            
            // Look for patterns like a_1234567890abcdef1234567890abcdef12345678
            /["']?(a_[a-f0-9]{40})["']?/g,
            /appId["\s:=]+([a-f0-9_]{20,})/gi,
            
            // Window config assignments
            /window\._config\s*=\s*\{[^}]*appId["\s:]+([a-f0-9_]{20,})/gi,
            /window\.config\s*=\s*\{[^}]*appId["\s:]+([a-f0-9_]{20,})/gi
        ];
        
        // Extract appId with reduced logging
        if (!this.appId) {
            for (let i = 0; i < 7; i++) { // Check appId patterns
                const pattern = patterns[i];
                const matches = [...content.matchAll(pattern)];
                for (const match of matches) {
                    if (match[1] && match[1].length > 10) {
                        this.appId = match[1];
                        log.info('Captured appId from script content:', this.appId);
                        this.notifyListeners();
                        break;
                    }
                }
                if (this.appId) break;
            }
            
            // Try more aggressive patterns only if still needed
            if (!this.appId) {
                for (let i = 14; i < patterns.length; i++) {
                    const pattern = patterns[i];
                    const matches = [...content.matchAll(pattern)];
                    for (const match of matches) {
                        if (match[1] && match[1].length > 15) {
                            this.appId = match[1];
                            log.info('Captured appId from script content (aggressive):', this.appId);
                            this.notifyListeners();
                            break;
                        }
                    }
                    if (this.appId) break;
                }
            }
            
            // Look for hex strings only as last resort
            if (!this.appId) {
                const hexStrings = content.match(/[a-f0-9_]{30,}/gi);
                if (hexStrings && hexStrings.length > 0) {
                    for (const hexString of hexStrings) {
                        if (hexString.startsWith('a_') && hexString.length > 35) {
                            this.appId = hexString;
                            log.info('Captured appId from hex string:', this.appId);
                            this.notifyListeners();
                            break;
                        }
                    }
                }
            }
        }
        
        // Extract version with better validation
        if (!this.clientVersion) {
            for (let i = 7; i < 13; i++) { // Check version patterns
                const pattern = patterns[i];
                const matches = [...content.matchAll(pattern)];
                for (const match of matches) {
                    if (match[1] && match[1].length > 2) {
                        // Validate that this looks like a real version
                        const version = match[1];
                        if (version.match(/\d+\.\d+/) || version.includes('web') || version.length > 5) {
                            // Convert to client version format
                            this.clientVersion = version.includes('/web') ? version : `${version}/web`;
                            log.info('Derived client-version from script content:', this.clientVersion);
                            this.notifyListeners();
                            break;
                        }
                    }
                }
                if (this.clientVersion) break;
            }
        }
        
        // Early return if configuration is now complete
        if (this.appId && this.clientVersion) {
            return;
        }
        
        // Extract from commentOptions
        if (!this.appId) {
            for (let i = 13; i < 15; i++) {
                const pattern = patterns[i];
                const matches = [...content.matchAll(pattern)];
                for (const match of matches) {
                    if (match[1] && match[1].length > 10) {
                        this.appId = match[1];
                        log.info('Captured appId from script commentOptions:', this.appId);
                        this.notifyListeners();
                        return;
                    }
                }
            }
        }
        
        // Try to extract from large JSON blocks only if still needed
        if ((!this.appId || !this.clientVersion) && content.length > 5000) {
            const jsonBlocks = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
            if (jsonBlocks && jsonBlocks.length > 0) {
                // Limit JSON block analysis
                const blocksToAnalyze = Math.min(jsonBlocks.length, 5);
                for (let i = 0; i < blocksToAnalyze; i++) {
                    const block = jsonBlocks[i];
                    if (block.length > 100) { // Only analyze substantial JSON blocks
                        try {
                            const parsed = JSON.parse(block);
                            this.extractConfigFromObject(parsed, 'script JSON block');
                            if (this.appId && this.clientVersion) break;
                        } catch (error) {
                            // Not valid JSON, continue
                        }
                    }
                }
            }
        }
    }

    watchForConfigUpdates() {
        // Watch for changes to window._config
        let lastConfig = null;
        const checkConfigChanges = () => {
            if (window._config && JSON.stringify(window._config) !== lastConfig) {
                lastConfig = JSON.stringify(window._config);
                this.parseEmbeddedConfig();
            }
        };
        
        setInterval(checkConfigChanges, 500);
        
        // Fallback: If we still don't have config after 3 seconds, try to trigger network activity
        setTimeout(() => {
            if (!this.appId || !this.clientVersion) {
                console.log('ShadowGag: Configuration not found in page source, attempting to trigger network requests...');
                this.triggerNetworkActivity();
            }
        }, 3000);
    }
    
    triggerNetworkActivity() {
        // Try to trigger 9gag to make API calls by interacting with comment elements
        try {
            // Look for comment-related elements that might trigger API calls when clicked
            const commentTriggers = [
                '.comment-list-item',
                '.comment-item',
                '.ui-comment-header',
                '.comment-expand',
                '.load-more-comments',
                '.show-replies',
                '[class*="comment"]',
                '[data-comment-id]'
            ];
            
            for (const selector of commentTriggers) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log(`ShadowGag: Found ${elements.length} elements with selector ${selector}`);
                    
                    // Try to trigger hover/focus events that might load data
                    const firstElement = elements[0];
                    if (firstElement) {
                        // Dispatch various events that might trigger API calls
                        const events = ['mouseenter', 'mouseover', 'focus'];
                        for (const eventType of events) {
                            try {
                                const event = new MouseEvent(eventType, {
                                    view: window,
                                    bubbles: true,
                                    cancelable: true
                                });
                                firstElement.dispatchEvent(event);
                            } catch (error) {
                                // Continue with next event type
                            }
                        }
                    }
                    break; // Only try the first successful selector
                }
            }
            
            // Try to scroll to trigger lazy loading
            const currentScroll = window.scrollY;
            window.scrollBy(0, 100);
            setTimeout(() => {
                window.scrollTo(0, currentScroll); // Restore original position
            }, 500);
            
            // Look for and click any "load more" or "show replies" buttons
            const loadMoreButtons = document.querySelectorAll(
                '.load-more, .show-more, .load-replies, .show-replies, [class*="load"], [class*="more"]'
            );
            
            for (const button of loadMoreButtons) {
                if (button.textContent && 
                    (button.textContent.toLowerCase().includes('load') || 
                     button.textContent.toLowerCase().includes('more') ||
                     button.textContent.toLowerCase().includes('repl'))) {
                    console.log('ShadowGag: Attempting to click load more button:', button.textContent);
                    try {
                        button.click();
                        break; // Only click one button
                    } catch (error) {
                        console.log('ShadowGag: Could not click button:', error);
                    }
                }
            }
            
        } catch (error) {
            console.log('ShadowGag: Error triggering network activity:', error);
        }
    }

    onConfigReady(callback) {
        this.listeners.push(callback);
        
        // If config is already available, call immediately
        if (this.appId && this.clientVersion) {
            callback(this.appId, this.clientVersion);
        }
    }

    notifyListeners() {
        if (this.appId && this.clientVersion) {
            console.log('ShadowGag: Configuration complete - appId:', this.appId, 'client-version:', this.clientVersion);
            this.listeners.forEach(callback => {
                try {
                    callback(this.appId, this.clientVersion);
                } catch (error) {
                    console.error('ShadowGag: Error in config listener:', error);
                }
            });
            this.listeners = []; // Clear listeners after notification
        }
    }

    getConfig() {
        return {
            appId: this.appId,
            clientVersion: this.clientVersion,
            isComplete: !!(this.appId && this.clientVersion)
        };
    }
}

// Initialize configuration capture immediately
console.log('ShadowGag: Creating ConfigurationCapture...');
try {
    window.shadowGagConfigCapture = new ConfigurationCapture();
    console.log('ShadowGag: ConfigurationCapture created successfully');
} catch (error) {
    console.error('ShadowGag: Error creating ConfigurationCapture:', error);
}

// Configuration object for API parameters and other constants
const SHADOWGAG_CONFIG = {
  // API Configuration
  API: {
    // Base URLs
    COMMENT_CDN_BASE: 'https://comment-cdn.9gag.com/v2/cacheable/comment-list.json',
    COMMENT_API_BASE: 'https://comment.9gag.com/v2/add-comment.json',
    
    // Request parameters
    COMMENTS_PER_PAGE: 50,
    MAX_PAGES: 100, // Increased from 10 - safety limit to prevent infinite loops but allow thorough search
    
    // OPTIMIZATION: Early termination settings
    MAX_PAGES_FOR_USER_SEARCH: 50, // Increased from 5 - allow thorough search for user comments
    EARLY_TERMINATION_THRESHOLD: 5, // Increased from 3 - be more patient before giving up
    
    // Request headers (base headers, dynamic ones will be added)
    HEADERS: {
      'Accept': '*/*',
      'Origin': 'https://9gag.com',
      'Referer': 'https://9gag.com/'
    }
  },
  
  // Timing Configuration
  TIMING: {
    API_DELAY: 100, // Delay between API requests (ms)
    DOM_UPDATE_DELAY: 500, // Delay to wait for DOM updates (ms)
    NEW_COMMENT_DELAY: 2000, // Delay for new comment processing (ms)
    RETRY_DELAY: 3000, // Delay for retry attempts (ms)
    MUTATION_OBSERVER_DELAY: 500, // Delay for mutation observer processing (ms)
    
    // OPTIMIZATION: Reduced delays for user-specific operations
    USER_COMMENT_API_DELAY: 50, // Faster delay when searching for specific user comments
  },
  
  // URL Patterns
  URLS: {
    GAG_PATTERN: '/gag/',
    USER_PATTERN: '/u/',
    COMMENT_ID_PARAM: 'cs_comment_id='
  },
  
  // OPTIMIZATION: Performance settings
  PERFORMANCE: {
    ENABLE_OPTIMIZED_LOADING: true, // Use optimized user-first approach
    CACHE_USER_COMMENTS: true, // Cache user comment locations
    LAZY_LOAD_REPLIES: true, // Only load reply threads when needed
    MAX_CONCURRENT_REQUESTS: 2, // Limit concurrent API requests
    UNLIMITED_SEARCH: false, // If true, ignore page limits for 100% accuracy (slower)
  }
};

// Helper function to build API URLs
function buildCommentListUrl(postKey, options = {}) {
  const {
    level = 1,
    commentId = null,
    after = null,
    count = SHADOWGAG_CONFIG.API.COMMENTS_PER_PAGE
  } = options;
  
  // Get APP_ID from network config or configuration capture
  let appId = null;
  if (shadowGagChecker && shadowGagChecker.networkConfig && shadowGagChecker.networkConfig.APP_ID) {
    appId = shadowGagChecker.networkConfig.APP_ID;
  } else if (window.shadowGagConfigCapture) {
    const config = window.shadowGagConfigCapture.getConfig();
    appId = config.appId;
  }
  
  if (!appId) {
    console.warn('ShadowGag: No APP_ID available for API request');
    throw new Error('APP_ID not available - configuration not captured yet');
  }
  
  let url = `${SHADOWGAG_CONFIG.API.COMMENT_CDN_BASE}?appId=${appId}&count=${count}&type=old&level=${level}&url=http://9gag.com/gag/${postKey}&origin=https://9gag.com`;
  
  if (commentId) {
    url += `&commentId=${commentId}`;
  }
  
  if (after) {
    url += `&after=${after}`;
  }
  
  return url;
}

// Helper function to get standard API headers
function getApiHeaders() {
  // Use network config from the checker instance if available
  if (shadowGagChecker && shadowGagChecker.networkConfig) {
    return {
      ...SHADOWGAG_CONFIG.API.HEADERS,
      ...shadowGagChecker.networkConfig.HEADERS
    };
  }
  
  // Fallback to configuration capture system
  if (window.shadowGagConfigCapture) {
    const config = window.shadowGagConfigCapture.getConfig();
    if (config.clientVersion) {
      return {
        ...SHADOWGAG_CONFIG.API.HEADERS,
        'client-version': config.clientVersion
      };
    }
  }
  
  console.warn('ShadowGag: No client-version available for API request');
  throw new Error('client-version not available - configuration not captured yet');
}

// Function to validate configuration and warn about potential issues
function validateConfiguration() {
  const issues = [];
  
  // Get current configuration from capture system
  const config = window.shadowGagConfigCapture ? window.shadowGagConfigCapture.getConfig() : {};
  
  // Log current configuration
  console.log('ShadowGag: Current configuration:', {
    APP_ID: config.appId || 'NOT_CAPTURED',
    CLIENT_VERSION: config.clientVersion || 'NOT_CAPTURED',
    configComplete: config.isComplete
  });
  
  // Check if appId looks valid (should be a long hex string)
  if (config.appId && !config.appId.match(/^a_[a-f0-9]{40}$/)) {
    issues.push(`APP_ID format may be invalid: ${config.appId}`);
  }
  
  // Check if client version looks valid (should be in format like "1.1/web" or contain year)
  if (config.clientVersion) {
    const currentYear = new Date().getFullYear();
    const yearShort = currentYear.toString().slice(2);
    // Accept either year-based versions or simple versions like "1.1/web"
    if (!config.clientVersion.includes(yearShort) && !config.clientVersion.match(/^\d+\.\d+\/web$/)) {
      issues.push(`CLIENT_VERSION may be outdated: ${config.clientVersion}`);
    }
  }
  
  // Check timing values are reasonable
  if (SHADOWGAG_CONFIG.TIMING.API_DELAY < 50) {
    issues.push(`API_DELAY may be too aggressive: ${SHADOWGAG_CONFIG.TIMING.API_DELAY}ms`);
  }
  
  // Warn if configuration is not complete
  if (!config.isComplete) {
    issues.push('Configuration not yet captured from network requests or page data');
  }
  
  if (issues.length > 0) {
    console.warn('ShadowGag: Configuration validation issues:', issues);
  } else {
    console.log('ShadowGag: Configuration validation passed');
  }
  
  return issues;
}

// Set up network monitoring immediately, before any other initialization
console.log('ShadowGag: Setting up early network monitoring...');
let shadowGagChecker = null;

// NOTE: Network monitoring is now handled by ConfigurationCapture class
// Commenting out duplicate monitoring to avoid conflicts

/*
// Override fetch to monitor comment API calls
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  
  // Check if this is a comment API call
  const url = args[0];
  if (typeof url === 'string') {
    // Monitor comment list API calls (existing functionality)
    if (url.includes(SHADOWGAG_CONFIG.API.COMMENT_CDN_BASE.split('?')[0])) {
      console.log('ShadowGag: Detected comment API call:', url);
      
      // Clone response to read it without consuming the original
      const clonedResponse = response.clone();
      try {
        const data = await clonedResponse.json();
        // Process new comments after a delay to allow DOM updates
        // Only if the checker is initialized
        if (shadowGagChecker) {
          setTimeout(() => shadowGagChecker.processNewComments(data), 500); // Reduced from 1000ms
        } else {
          // Store the data for later processing when checker is ready
          console.log('ShadowGag: Storing API data for later processing');
          if (!window.shadowGagPendingData) {
            window.shadowGagPendingData = [];
          }
          window.shadowGagPendingData.push(data);
        }
      } catch (error) {
        console.error('ShadowGag: Error processing API response:', error);
      }
    }
    
    // Monitor new comment creation API calls (new functionality)
    if (url.includes(SHADOWGAG_CONFIG.API.COMMENT_API_BASE)) {
      console.log('ShadowGag: Detected new comment creation:', url);
      
      // Clone response to read it without consuming the original
      const clonedResponse = response.clone();
      try {
        const data = await clonedResponse.json();
        if (data.status === 'OK' && data.payload && data.payload.comment) {
          console.log('ShadowGag: New comment created successfully:', data.payload.comment.commentId);
          
          // Process the new comment after a delay to allow DOM updates
          if (shadowGagChecker) {
            setTimeout(() => shadowGagChecker.processNewlyCreatedComment(data.payload.comment), SHADOWGAG_CONFIG.TIMING.NEW_COMMENT_DELAY);
          } else {
            // Store for later processing
            if (!window.shadowGagPendingNewComments) {
              window.shadowGagPendingNewComments = [];
            }
            window.shadowGagPendingNewComments.push(data.payload.comment);
          }
        }
      } catch (error) {
        console.error('ShadowGag: Error processing new comment creation response:', error);
      }
    }
  }
  
  return response;
};

// Also monitor XMLHttpRequest in case 9gag uses XHR instead of fetch
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

XMLHttpRequest.prototype.open = function(method, url, ...args) {
  this._shadowgag_url = url;
  this._shadowgag_headers = {};
  return originalXHROpen.call(this, method, url, ...args);
};

XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
  if (this._shadowgag_headers) {
    this._shadowgag_headers[name] = value;
  }
  return originalXHRSetRequestHeader.call(this, name, value);
};

// Monitor XHR responses
const originalXHRSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function(...args) {
  return originalXHRSend.call(this, ...args);
};
*/

class ShadowGagChecker {
  constructor() {
    console.log('ShadowGag: ShadowGagChecker constructor starting...');
    this.isEnabled = true;
    this.currentUser = null;
    this.postKey = null;
    this.pageType = null;
    this.targetCommentId = null;
    
    // Comment data storage
    this.allTopLevelComments = new Set();
    this.allRepliesCache = new Map(); // parentCommentId -> Set of reply IDs
    this.loadedReplyThreads = new Set();
    this.processedComments = new Set();
    this.commentCache = new Map(); // commentId -> visibility status
    
    // OPTIMIZATION: Enhanced caching and request management
    this.userCommentCache = new Map(); // postKey -> user comment data
    this.pendingRequests = new Map(); // URL -> Promise (prevent duplicate requests)
    this.requestQueue = []; // Queue for managing concurrent requests
    this.activeRequests = 0;
    
    // OPTIMIZATION: Performance monitoring
    this.performanceMetrics = {
      startTime: Date.now(),
      apiCallCount: 0,
      duplicateRequestsPrevented: 0,
      commentsProcessed: 0,
      userCommentsFound: 0,
      shadowbannedCommentsFound: 0,
      totalDataTransferred: 0, // Approximate bytes
      optimizationSavings: {
        apiCallsSaved: 0,
        timeSaved: 0, // milliseconds
        dataSaved: 0 // bytes
      }
    };
    
    // Settings
    this.settings = {
      visibleMarking: 'badge',
      shadowbannedMarking: 'badge',
      visibleCustomCode: '',
      shadowbannedCustomCode: '',
      
      // Marking colors and styles
      visibleHighlightBorderColor: '#4caf50',
      visibleHighlightBgColor: '#1a2a1a',
      visibleHighlightBorderWidth: '3',
      visibleBorderColor: '#4caf50',
      visibleBorderWidth: '3',
      visibleBadgeText: 'VISIBLE',
      visibleBadgeColor: '#4caf50',
      visibleBadgeTextColor: '#ffffff',
      
      shadowbannedHighlightBorderColor: '#f44336',
      shadowbannedHighlightBgColor: '#2a1a1a',
      shadowbannedHighlightBorderWidth: '3',
      shadowbannedBorderColor: '#f44336',
      shadowbannedBorderWidth: '3',
      shadowbannedBadgeText: 'SHADOWBANNED',
      shadowbannedBadgeColor: '#f44336',
      shadowbannedBadgeTextColor: '#ffffff'
    };
    
    this.mutationObserver = null;
    
    // Register URL change listener immediately to catch notification navigation
    this.registerURLChangeListener();
    
    console.log('ShadowGag: ShadowGagChecker properties initialized, calling init...');
    this.init();
    console.log('ShadowGag: ShadowGagChecker constructor completed');
  }

  // Register URL change listener immediately to catch notification navigation
  registerURLChangeListener() {
    log.debug('Registering URL change listener immediately...');
    
    window.shadowGagURLDetector.onURLChange(async (changeType, details) => {
      log.info('URL change detected:', changeType, details);
      
      // Handle comment navigation
      if (changeType === 'comment_navigation' && details.targetCommentId) {
        log.info('Navigation to specific comment detected:', details.targetCommentId);
        
        // Update our target comment ID
        this.targetCommentId = details.targetCommentId;
        
        // Extract new post key and check for post changes
        const newPostKey = this.extractPostKey();
        const postChanged = newPostKey && newPostKey !== this.postKey;
        
        if (postChanged) {
          log.info(`Post changed during comment navigation from ${this.postKey} to ${newPostKey}`);
          this.postKey = newPostKey;
          
          // Clear caches and remove old indicators
          this.processedComments.clear();
          this.commentCache.clear();
          this.allTopLevelComments.clear();
          this.allRepliesCache.clear();
          this.loadedReplyThreads.clear();
          this.removeAllIndicators();
        }
        
        // Re-identify page type
        this.identifyPageType();
        
        // Ensure current user is detected before processing
        if (!this.currentUser) {
          log.debug('Current user not detected, attempting detection...');
          
          // Try to get current user from login detector
          this.currentUser = window.shadowGagLoginDetector.getCurrentUser();
          
          if (!this.currentUser) {
            log.debug('Starting login monitoring for user detection...');
            // Start login monitoring if not already started
            window.shadowGagLoginDetector.startMonitoring();
            
            // Wait briefly for user detection
            await new Promise(resolve => setTimeout(resolve, 500));
            this.currentUser = window.shadowGagLoginDetector.getCurrentUser();
          }
        }
        
        if (!this.currentUser) {
          log.warn('Cannot process comment - user not logged in or not detected');
          return;
        }
        
        log.info('Current user detected:', this.currentUser);
        
        // Schedule delayed processing for the target comment
        this.scheduleDelayedCommentProcessing(details.targetCommentId, details.isInitialLoad);
      }
      
      // Handle other navigation types
      else if (changeType === 'page_change') {
        log.info('Page navigation detected, reinitializing...');
        
        // Clear current state
        this.processedComments.clear();
        this.commentCache.clear();
        this.removeAllIndicators();
        
        // Re-extract post key
        const newPostKey = this.extractPostKey();
        if (newPostKey && newPostKey !== this.postKey) {
          this.postKey = newPostKey;
          log.info('New post key:', this.postKey);
          
          // Restart processing for new page
          setTimeout(() => {
            this.checkExistingComments();
          }, 1000);
        }
      }
    });
  }

  async init() {
    console.log('ShadowGag: Initializing...');
    
    try {
      // Wait for page to load
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }
      
      // OPTIMIZATION: Use new configuration capture system
      console.log('ShadowGag: Detecting network configuration...');
      try {
        await this.detectNetworkConfig();
      } catch (configError) {
        console.error('ShadowGag: Configuration capture failed:', configError.message);
        console.error('ShadowGag: Extension will not function properly without valid configuration');
        
        // Store the error for potential display to user
        this.configurationError = configError.message;
        
        // Don't proceed with initialization if configuration is missing
        throw new Error(`Configuration capture failed: ${configError.message}`);
      }
      
      // Validate configuration and warn about potential issues
      validateConfiguration();
      
      // Load settings from storage
      await this.loadSettings();
      
      // Get initial state from background script
      try {
        const stateResponse = await browser.runtime.sendMessage({ action: 'getExtensionState' });
        if (stateResponse) {
          this.isEnabled = stateResponse.enabled;
          log.info('Initial state from background:', this.isEnabled);
        }
      } catch (error) {
        log.debug('Could not get initial state from background:', error);
      }
      
      await this.start();
      console.log('ShadowGag: Initialization completed successfully');
      
      // Notify background script that we're ready
      try {
        browser.runtime.sendMessage({ action: 'contentScriptReady' });
      } catch (error) {
        console.log('ShadowGag: Could not notify background script:', error);
      }
      
    } catch (error) {
      console.error('ShadowGag: Initialization failed:', error);
      this.initializationError = error.message;
      
      // If initialization failed due to configuration issues, show a helpful message
      if (error.message.includes('Configuration capture failed')) {
        console.error('ShadowGag: The extension requires valid APP_ID and client-version values from 9gag');
        console.error('ShadowGag: These values are automatically captured from network requests or page data');
        console.error('ShadowGag: Please refresh the page or navigate to a 9gag post with comments');
      }
    }

    // Process any pending API data that was stored before initialization
    if (window.shadowGagPendingData) {
      console.log('ShadowGag: Processing pending API data');
      for (const data of window.shadowGagPendingData) {
        setTimeout(() => this.processNewComments(data), 500); // Reduced from 1000ms
      }
      window.shadowGagPendingData = null;
    }

    // Process any pending new comments that were created before initialization
    if (window.shadowGagPendingNewComments) {
      console.log('ShadowGag: Processing pending new comments');
      for (const commentData of window.shadowGagPendingNewComments) {
        setTimeout(() => this.processNewlyCreatedComment(commentData), 1000); // Reduced from 2000ms
      }
      window.shadowGagPendingNewComments = null;
    }
  }

  // Load settings from storage
  async loadSettings() {
    log.info('Loading settings from storage...');
    
    try {
      const result = await new Promise((resolve) => {
        browser.storage.local.get([
          'enabled',
          'visibleMarking',
          'shadowbannedMarking',
          'visibleCustomCode',
          'shadowbannedCustomCode',
          // New customization options
          'visibleHighlightBorderColor',
          'visibleHighlightBgColor',
          'visibleBorderColor',
          'visibleBorderWidth',
          'visibleBadgeText',
          'visibleBadgeColor',
          'visibleBadgeTextColor',
          'shadowbannedHighlightBorderColor',
          'shadowbannedHighlightBgColor',
          'shadowbannedBorderColor',
          'shadowbannedBorderWidth',
          'shadowbannedBadgeText',
          'shadowbannedBadgeColor',
          'shadowbannedBadgeTextColor',
          'visibleHighlightBorderWidth',
          'shadowbannedHighlightBorderWidth'
        ], resolve);
      });
      
      // Update settings with loaded values or defaults
      this.settings = {
        enabled: result.enabled !== false,
        visibleMarking: result.visibleMarking || 'badge',
        shadowbannedMarking: result.shadowbannedMarking || 'badge',
        visibleCustomCode: result.visibleCustomCode || '',
        shadowbannedCustomCode: result.shadowbannedCustomCode || '',
        // New customization options
        visibleHighlightBorderColor: result.visibleHighlightBorderColor || '#4caf50',
        visibleHighlightBgColor: result.visibleHighlightBgColor || '#1a2a1a',
        visibleBorderColor: result.visibleBorderColor || '#4caf50',
        visibleBorderWidth: result.visibleBorderWidth || '3',
        visibleBadgeText: result.visibleBadgeText || 'VISIBLE',
        visibleBadgeColor: result.visibleBadgeColor || '#4caf50',
        visibleBadgeTextColor: result.visibleBadgeTextColor || '#ffffff',
        shadowbannedHighlightBorderColor: result.shadowbannedHighlightBorderColor || '#f44336',
        shadowbannedHighlightBgColor: result.shadowbannedHighlightBgColor || '#2a1a1a',
        shadowbannedBorderColor: result.shadowbannedBorderColor || '#f44336',
        shadowbannedBorderWidth: result.shadowbannedBorderWidth || '3',
        shadowbannedBadgeText: result.shadowbannedBadgeText || 'SHADOWBANNED',
        shadowbannedBadgeColor: result.shadowbannedBadgeColor || '#f44336',
        shadowbannedBadgeTextColor: result.shadowbannedBadgeTextColor || '#ffffff',
        visibleHighlightBorderWidth: result.visibleHighlightBorderWidth || '3',
        shadowbannedHighlightBorderWidth: result.shadowbannedHighlightBorderWidth || '3'
      };
      
      console.log('ShadowGag: Settings loaded:', this.settings);
      
    } catch (error) {
      console.error('ShadowGag: Error loading settings:', error);
      // Keep default settings on error
    }
  }

  async start() {
    console.log('ShadowGag: Starting ShadowGag checker...');
    
    // Check if we're on a post page
    if (!this.isPostPage()) {
      console.log('ShadowGag: Not on a post page, skipping');
      console.log('ShadowGag: Current URL:', window.location.href);
      console.log('ShadowGag: Current pathname:', window.location.pathname);
      return;
    }
    
    // Step 1: Identify current user using login detector
    this.currentUser = window.shadowGagLoginDetector.getCurrentUser();
    console.log('ShadowGag: Current user from login detector:', this.currentUser);
    
    if (!this.currentUser) {
      console.log('ShadowGag: No user logged in, checking login detector state...');
      console.log('ShadowGag: Login detector initialized:', !!window.shadowGagLoginDetector);
      // Try to get user info directly
      const authCookies = window.shadowGagLoginDetector.getAuthCookies();
      console.log('ShadowGag: Auth cookies found:', !!authCookies);
    }
    
    // Set up login change listener
    window.shadowGagLoginDetector.onUserChange((newUser) => {
      console.log('ShadowGag: User changed from', this.currentUser, 'to', newUser);
      const oldUser = this.currentUser;
      this.currentUser = newUser;
      
      // Only process if this is a meaningful change
      if (oldUser === newUser) {
        console.log('ShadowGag: User change is same as current, ignoring');
        return;
      }
      
      if (newUser) {
        console.log('ShadowGag: User logged in, reprocessing comments...');
        // Clear caches and reprocess
        this.processedComments.clear();
        this.commentCache.clear();
        this.removeAllIndicators();
        
        // Restart the checking process with a delay to avoid rapid re-processing
        setTimeout(() => {
          if (this.currentUser === newUser) { // Double-check user hasn't changed again
            this.checkExistingComments();
          }
        }, 1000);
      } else {
        console.log('ShadowGag: User logged out, clearing indicators...');
        this.removeAllIndicators();
      }
    });
    
    // Start login monitoring
    window.shadowGagLoginDetector.startMonitoring();
    
    if (!this.currentUser) {
      console.log('ShadowGag: No user logged in, extension will not check comments');
      // Still set up mutation observer to detect when user logs in
      this.setupMutationObserver();
      return;
    }
    
    // Step 2: Identify page type
    this.identifyPageType();
    
    // Step 3: Extract post key
    this.postKey = this.extractPostKey();
    if (!this.postKey) {
      console.error('ShadowGag: Could not extract post key');
      return;
    }
    
    console.log('ShadowGag: Post key:', this.postKey);
    console.log('ShadowGag: Page type:', this.pageType);
    console.log('ShadowGag: Target comment ID:', this.targetCommentId);
    
    // Step 4: Check existing comments
    await this.checkExistingComments();
    
    // Step 5: If we have a target comment ID (from notification navigation), 
    // schedule additional processing to catch dynamically loaded content
    if (this.targetCommentId) {
      console.log('ShadowGag: Target comment detected, scheduling delayed processing');
      this.scheduleDelayedCommentProcessing(this.targetCommentId);
    }
    
    // Step 6: Set up mutation observer for new comments
    this.setupMutationObserver();
    
    console.log('ShadowGag: ShadowGag checker started successfully');
  }

  isPostPage() {
    return window.location.pathname.includes('/gag/');
  }

  // Remove the old getCurrentUser method since we now use LoginDetector
  // getCurrentUser() method is now handled by LoginDetector

  identifyPageType() {
    const url = window.location.href;
    const hash = window.location.hash;
    
    // Check if it's a comment URL (has cs_comment_id in hash)
    if (hash.includes(SHADOWGAG_CONFIG.URLS.COMMENT_ID_PARAM)) {
      this.pageType = 'comment';
      const match = hash.match(/cs_comment_id=(c_\d+)/);
      this.targetCommentId = match ? match[1] : null;
    } else {
      this.pageType = 'post';
    }
  }

  extractPostKey() {
    const match = window.location.pathname.match(/\/gag\/([^\/\?]+)/);
    return match ? match[1] : null;
  }

  // Helper to extract parent comment ID from a target comment ID
  extractParentCommentIdFromTarget(targetCommentId) {
    // For comment pages, we need to determine if the target is a top-level comment or a reply
    // If it's a reply, we need to find its parent
    // For now, we'll try to find it in the DOM first, then fall back to API calls
    
    const commentElements = this.findAllComments();
    for (const element of commentElements) {
      const commentId = this.extractCommentId(element);
      if (commentId === targetCommentId) {
        if (element.classList.contains('comment-item--child')) {
          // This is a reply, find its parent
          return this.findParentCommentId(element);
        } else {
          // This is a top-level comment, return its own ID
          return commentId;
        }
      }
    }
    
    // If not found in DOM, assume it's a top-level comment
    return targetCommentId;
  }

  // Step 3: Load all top-level comments from API
  async loadAllTopLevelComments() {
    console.log('ShadowGag: Loading all top-level comments from API...');
    
    try {
      let allComments = [];
      let hasMore = true;
      let after = null;
      let page = 1;
      
      // Respect unlimited search setting
      const unlimitedSearch = SHADOWGAG_CONFIG.PERFORMANCE.UNLIMITED_SEARCH;
      const maxPages = unlimitedSearch ? Infinity : SHADOWGAG_CONFIG.API.MAX_PAGES;
      
      console.log(`ShadowGag: Fallback search mode: ${unlimitedSearch ? 'UNLIMITED (100% accuracy)' : 'LIMITED (faster)'}, max pages: ${maxPages}`);
      
      while (hasMore && page <= maxPages) {
        console.log(`ShadowGag: Loading top-level comments page ${page}...`);
        
        // Build API URL for top-level comments
        const apiUrl = buildCommentListUrl(this.postKey, { level: 1, after });
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: getApiHeaders()
        });

        if (!response.ok) {
          console.error('ShadowGag: API request failed:', response.status);
          break;
        }

        const data = await response.json();
        
        if (data.status !== 'OK') {
          console.error('ShadowGag: API returned error:', data.error);
          break;
        }

        if (data.payload && data.payload.comments) {
          const comments = data.payload.comments;
          allComments = allComments.concat(comments);
          
          console.log(`ShadowGag: Loaded ${comments.length} comments on page ${page}, total: ${allComments.length}`);
          
          // Check if there are more comments
          if (comments.length < SHADOWGAG_CONFIG.API.COMMENTS_PER_PAGE) {
            hasMore = false;
          } else {
            // Get the last comment's ID for pagination
            const lastComment = comments[comments.length - 1];
            after = lastComment.commentId;
          }
        } else {
          hasMore = false;
        }
        
        page++;
        
        // Small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, SHADOWGAG_CONFIG.TIMING.API_DELAY));
      }
      
      // Store all comment IDs for quick lookup
      for (const comment of allComments) {
        if (comment.commentId) {
          this.allTopLevelComments.add(comment.commentId);
        }
      }
      
      console.log(`ShadowGag: Loaded ${allComments.length} total top-level comments from ${page - 1} pages`);
      
      if (!unlimitedSearch && page > maxPages) {
        console.warn('ShadowGag: Fallback search was limited - some comments might exist on later pages. Enable UNLIMITED_SEARCH for 100% accuracy.');
      }
      
    } catch (error) {
      console.error('ShadowGag: Error loading all top-level comments:', error);
    }
  }

  // OPTIMIZED: Load only user comments instead of all comments
  async loadUserCommentsOptimized() {
    console.log('ShadowGag: Loading user comments (optimized approach)...');
    
    try {
      // Step 1: Find all user comments in the DOM first
      const userCommentElements = this.findUserCommentsInDOM();
      
      if (userCommentElements.length === 0) {
        console.log('ShadowGag: No user comments found in DOM');
        this.logPerformanceMetrics();
        return;
      }
      
      console.log(`ShadowGag: Found ${userCommentElements.length} user comments in DOM`);
      
      // Step 2: Group comments by type (top-level vs replies)
      const topLevelComments = [];
      const replyComments = [];
      const parentCommentIds = new Set();
      
      for (const element of userCommentElements) {
        const commentId = this.extractCommentId(element);
        if (!commentId) continue;
        
        if (element.classList.contains('comment-item--child')) {
          // This is a reply
          const parentId = this.findParentCommentId(element);
          if (parentId) {
            replyComments.push({ commentId, parentId, element });
            parentCommentIds.add(parentId);
          }
        } else {
          // This is a top-level comment
          topLevelComments.push({ commentId, element });
        }
      }
      
      // Calculate potential savings compared to loading all comments
      const estimatedTotalComments = SHADOWGAG_CONFIG.API.MAX_PAGES * SHADOWGAG_CONFIG.API.COMMENTS_PER_PAGE;
      const actualCommentsToCheck = topLevelComments.length;
      const estimatedApiCallsSaved = Math.max(0, Math.ceil(estimatedTotalComments / SHADOWGAG_CONFIG.API.COMMENTS_PER_PAGE) - Math.ceil(actualCommentsToCheck / SHADOWGAG_CONFIG.API.COMMENTS_PER_PAGE));
      
      this.performanceMetrics.optimizationSavings.apiCallsSaved += estimatedApiCallsSaved;
      this.performanceMetrics.optimizationSavings.timeSaved += estimatedApiCallsSaved * 200; // Estimate 200ms per API call
      this.performanceMetrics.optimizationSavings.dataSaved += estimatedApiCallsSaved * 25000; // Estimate 25KB per response
      
      console.log(`ShadowGag: Optimization - checking ${actualCommentsToCheck} user comments instead of up to ${estimatedTotalComments} total comments`);
      
      // Step 3: Load only the necessary API data
      
      // For top-level comments, we need to check if they exist in the API
      if (topLevelComments.length > 0) {
        await this.loadSpecificTopLevelComments(topLevelComments.map(c => c.commentId));
      }
      
      // For replies, we only need to load the specific parent threads
      if (parentCommentIds.size > 0) {
        for (const parentId of parentCommentIds) {
          await this.loadAllRepliesForComment(parentId);
        }
      }
      
      console.log(`ShadowGag: Optimized loading completed - checked ${topLevelComments.length} top-level and ${replyComments.length} reply comments`);
      
      // Log performance metrics
      this.logPerformanceMetrics();
      
    } catch (error) {
      console.error('ShadowGag: Error in optimized user comment loading:', error);
      // Fallback to original method
      console.log('ShadowGag: Falling back to original loading method');
      await this.loadAllTopLevelComments();
      this.logPerformanceMetrics();
    }
  }

  // Helper: Find only user comments in the DOM
  findUserCommentsInDOM() {
    const allComments = this.findAllComments();
    const userComments = [];
    
    for (const comment of allComments) {
      const username = this.extractUsernameFromComment(comment);
      if (username === this.currentUser) {
        userComments.push(comment);
      }
    }
    
    return userComments;
  }

  // OPTIMIZATION: Smart request management to prevent duplicate calls
  async makeApiRequest(url, options = {}) {
    // Check if this request is already pending
    if (this.pendingRequests.has(url)) {
      console.log('ShadowGag: Reusing pending request for:', url);
      this.performanceMetrics.duplicateRequestsPrevented++;
      this.performanceMetrics.optimizationSavings.apiCallsSaved++;
      return await this.pendingRequests.get(url);
    }
    
    // Wait if we have too many concurrent requests
    while (this.activeRequests >= SHADOWGAG_CONFIG.PERFORMANCE.MAX_CONCURRENT_REQUESTS) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    this.activeRequests++;
    
    const requestPromise = this.executeApiRequest(url, options);
    this.pendingRequests.set(url, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.activeRequests--;
      this.pendingRequests.delete(url);
    }
  }
  
  async executeApiRequest(url, options = {}) {
    const startTime = Date.now();
    this.performanceMetrics.apiCallCount++;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(),
      ...options
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`API returned error: ${data.error}`);
    }
    
    // Track performance metrics
    const requestTime = Date.now() - startTime;
    const responseSize = JSON.stringify(data).length; // Approximate size
    this.performanceMetrics.totalDataTransferred += responseSize;
    
    console.log(`ShadowGag: API request completed in ${requestTime}ms, size: ${responseSize} bytes`);
    
    return data;
  }

  // OPTIMIZATION: Performance reporting
  logPerformanceMetrics() {
    const totalTime = Date.now() - this.performanceMetrics.startTime;
    const metrics = this.performanceMetrics;
    
    console.log('ShadowGag: Performance Metrics Summary');
    console.log('=====================================');
    console.log(`Total execution time: ${totalTime}ms`);
    console.log(`API calls made: ${metrics.apiCallCount}`);
    console.log(`Duplicate requests prevented: ${metrics.duplicateRequestsPrevented}`);
    console.log(`Comments processed: ${metrics.commentsProcessed}`);
    console.log(`User comments found: ${metrics.userCommentsFound}`);
    console.log(`Shadowbanned comments found: ${metrics.shadowbannedCommentsFound}`);
    console.log(`Total data transferred: ${(metrics.totalDataTransferred / 1024).toFixed(2)} KB`);
    console.log('Optimization Savings:');
    console.log(`  API calls saved: ${metrics.optimizationSavings.apiCallsSaved}`);
    console.log(`  Time saved: ${metrics.optimizationSavings.timeSaved}ms`);
    console.log(`  Data saved: ${(metrics.optimizationSavings.dataSaved / 1024).toFixed(2)} KB`);
    
    // Calculate efficiency metrics
    const efficiency = metrics.userCommentsFound > 0 ? 
      (metrics.userCommentsFound / metrics.commentsProcessed * 100).toFixed(1) : 0;
    console.log(`Processing efficiency: ${efficiency}% (user comments / total processed)`);
    
    if (metrics.apiCallCount > 0) {
      const avgResponseSize = (metrics.totalDataTransferred / metrics.apiCallCount / 1024).toFixed(2);
      console.log(`Average response size: ${avgResponseSize} KB`);
    }
  }

  // OPTIMIZATION: Improved loadSpecificTopLevelComments with early termination
  async loadSpecificTopLevelComments(commentIds) {
    console.log('ShadowGag: Loading specific top-level comments:', commentIds);
    
    if (commentIds.length === 0) {
      return;
    }
    
    try {
      let foundComments = new Set();
      let hasMore = true;
      let after = null;
      let page = 1;
      let pagesWithoutUserComments = 0;
      
      // Determine search limits based on configuration
      const unlimitedSearch = SHADOWGAG_CONFIG.PERFORMANCE.UNLIMITED_SEARCH;
      const maxPages = unlimitedSearch ? Infinity : SHADOWGAG_CONFIG.API.MAX_PAGES_FOR_USER_SEARCH;
      const earlyTerminationThreshold = unlimitedSearch ? Infinity : SHADOWGAG_CONFIG.API.EARLY_TERMINATION_THRESHOLD;
      
      const targetComments = new Set(commentIds);
      
      console.log(`ShadowGag: Search mode: ${unlimitedSearch ? 'UNLIMITED (100% accuracy)' : 'LIMITED (faster)'}, max pages: ${maxPages}`);
      
      while (hasMore && page <= maxPages && foundComments.size < targetComments.size) {
        console.log(`ShadowGag: Loading page ${page} to find specific comments...`);
        
        const apiUrl = buildCommentListUrl(this.postKey, { level: 1, after });
        
        try {
          const data = await this.makeApiRequest(apiUrl);
          
          if (data.payload && data.payload.comments) {
            const comments = data.payload.comments;
            let foundInThisPage = 0;
            
            // Check which of our target comments are in this page
            for (const comment of comments) {
              if (comment.commentId && targetComments.has(comment.commentId)) {
                foundComments.add(comment.commentId);
                this.allTopLevelComments.add(comment.commentId);
                foundInThisPage++;
                console.log('ShadowGag: Found target comment:', comment.commentId);
              }
            }
            
            // Early termination logic (only if not unlimited search)
            if (!unlimitedSearch) {
              if (foundInThisPage === 0) {
                pagesWithoutUserComments++;
                if (pagesWithoutUserComments >= earlyTerminationThreshold) {
                  console.log('ShadowGag: Early termination - no user comments found in recent pages');
                  break;
                }
              } else {
                pagesWithoutUserComments = 0; // Reset counter
              }
            }
            
            // Continue pagination
            if (comments.length < SHADOWGAG_CONFIG.API.COMMENTS_PER_PAGE) {
              hasMore = false;
            } else {
              const lastComment = comments[comments.length - 1];
              after = lastComment.commentId;
            }
          } else {
            hasMore = false;
          }
          
        } catch (error) {
          console.error('ShadowGag: Error loading page', page, ':', error);
          break;
        }
        
        page++;
        
        // Use faster delay for user-specific searches
        await new Promise(resolve => setTimeout(resolve, SHADOWGAG_CONFIG.TIMING.USER_COMMENT_API_DELAY));
      }
      
      // Log results
      const notFound = [...targetComments].filter(id => !foundComments.has(id));
      if (notFound.length > 0) {
        console.log('ShadowGag: Comments not found in API (likely shadowbanned):', notFound);
        if (!unlimitedSearch && page > maxPages) {
          console.warn('ShadowGag: Search was limited - some comments might be on later pages. Enable UNLIMITED_SEARCH for 100% accuracy.');
        }
      }
      
      console.log(`ShadowGag: Found ${foundComments.size}/${targetComments.size} target comments in ${page - 1} pages`);
      
    } catch (error) {
      console.error('ShadowGag: Error loading specific top-level comments:', error);
    }
  }

  // Step 5: Find comments to check
  async checkExistingComments() {
    console.log('ShadowGag: Checking existing comments...');
    
    // Find all comment elements
    const commentElements = this.findAllComments();
    console.log('ShadowGag: Found', commentElements.length, 'comment elements in DOM');
    
    if (commentElements.length === 0) {
      console.log('ShadowGag: No comment elements found - page may not be fully loaded yet');
      return;
    }

    for (const commentElement of commentElements) {
      await this.processComment(commentElement);
    }
    
    console.log('ShadowGag: Finished checking existing comments');
  }

  // OPTIMIZATION: Quick scan to identify user comments without visibility marking
  async quickScanUserComments() {
    console.log('ShadowGag: Quick scanning for user comments...');
    
    // Find all comment elements
    const commentElements = this.findAllComments();
    
    for (const commentElement of commentElements) {
      // Extract username from comment
      const username = this.extractUsernameFromComment(commentElement);
      
      // Only identify user comments, don't do visibility checks yet
      if (username === this.currentUser) {
        const commentId = this.extractCommentId(commentElement);
        if (commentId) {
          console.log('ShadowGag: Identified user comment (quick scan):', commentId);
          // Just mark it as identified, don't process visibility yet
          commentElement.classList.add('shadowgag-user-comment');
        }
      }
    }
    
    console.log('ShadowGag: Quick scan completed');
  }

  findAllComments() {
    // Find all comment elements based on the structure provided
    return document.querySelectorAll('.comment-list-item .comment-item');
  }

  async processComment(commentElement) {
    // Extract username from comment
    const username = this.extractUsernameFromComment(commentElement);
    
    // Track all processed comments
    this.performanceMetrics.commentsProcessed++;
    
    // Only process comments from current user
    if (username !== this.currentUser) {
      return;
    }

    // Track user comments found
    this.performanceMetrics.userCommentsFound++;

    // Extract comment ID
    const commentId = this.extractCommentId(commentElement);
    if (!commentId) {
      log.warn('Could not extract comment ID from element');
      return;
    }

    // Skip if already processed
    if (this.processedComments.has(commentId)) {
      log.trace('Comment already processed:', commentId);
      return;
    }

    log.info('Processing user comment:', commentId);
    
    // If this is a reply, ensure we have loaded the full reply thread
    const isReply = commentElement.classList.contains('comment-item--child');
    if (isReply) {
      const parentCommentId = this.findParentCommentId(commentElement);
      if (parentCommentId && !this.loadedReplyThreads.has(parentCommentId)) {
        log.debug('Loading reply thread for parent:', parentCommentId);
        await this.loadAllRepliesForComment(parentCommentId);
      }
    }
    
    // Check if comment is shadowbanned
    const isVisible = await this.checkCommentVisibility(commentId, commentElement);
    
    // Track shadowbanned comments
    if (!isVisible) {
      this.performanceMetrics.shadowbannedCommentsFound++;
    }
    
    // Add visual indicator (only if extension is enabled)
    if (this.isEnabled) {
      this.addIndicator(commentElement, isVisible);
    }
    
    // Mark as processed
    this.processedComments.add(commentId);
  }

  extractUsernameFromComment(commentElement) {
    const usernameLink = commentElement.querySelector('.ui-comment-header__username');
    if (usernameLink) {
      const href = usernameLink.getAttribute('href');
      if (href) {
        const match = href.match(/\/u\/([^\/\?#]+)/);
        return match ? match[1] : null;
      }
    }
    return null;
  }

  extractCommentId(commentElement) {
    // Look for comment ID in time link href
    const timeLink = commentElement.querySelector('.ui-comment-header__time');
    if (timeLink) {
      const href = timeLink.getAttribute('href');
      if (href) {
        const match = href.match(/cs_comment_id=(c_\d+)/);
        return match ? match[1] : null;
      }
    }
    return null;
  }

  // Step 6: Check if comments are shadowbanned
  async checkCommentVisibility(commentId, commentElement) {
    // Check cache first
    if (this.commentCache.has(commentId)) {
      return this.commentCache.get(commentId);
    }

    try {
      // Determine if this is a top-level comment or reply
      const isReply = commentElement.classList.contains('comment-item--child');
      
      let isVisible;
      
      if (isReply) {
        // For replies, use our pre-loaded reply data
        const parentCommentId = this.findParentCommentId(commentElement);
        if (!parentCommentId) {
          console.log('ShadowGag: Could not find parent comment ID for reply');
          return true; // Default to visible
        }
        
        console.log('ShadowGag: Checking reply visibility for comment:', commentId, 'parent:', parentCommentId);
        
        // Check if we have the reply data cached
        if (this.allRepliesCache.has(parentCommentId)) {
          const replyIds = this.allRepliesCache.get(parentCommentId);
          isVisible = replyIds.has(commentId);
          console.log('ShadowGag: Using cached reply data for visibility check');
        } else {
          // Fallback to API call if we don't have cached data
          console.log('ShadowGag: No cached reply data, making API call');
          await this.loadAllRepliesForComment(parentCommentId);
          
          if (this.allRepliesCache.has(parentCommentId)) {
            const replyIds = this.allRepliesCache.get(parentCommentId);
            isVisible = replyIds.has(commentId);
          } else {
            console.log('ShadowGag: Failed to load reply data, defaulting to visible');
            return true; // Default to visible on error
          }
        }
        
      } else {
        // For top-level comments, check if we have pre-loaded data
        console.log('ShadowGag: Checking top-level comment visibility for:', commentId);
        
        // OPTIMIZATION FIX: If we don't have any top-level comments loaded yet,
        // make a targeted API call to check this specific comment
        if (this.allTopLevelComments.size === 0) {
          console.log('ShadowGag: No top-level comments loaded yet, making targeted API call for:', commentId);
          await this.loadSpecificTopLevelComments([commentId]);
        }
        
        isVisible = this.allTopLevelComments.has(commentId);
      }
      
      // Cache the result
      this.commentCache.set(commentId, isVisible);
      
      console.log('ShadowGag: Comment', commentId, 'visibility:', isVisible);
      return isVisible;
      
    } catch (error) {
      console.error('ShadowGag: Error checking comment visibility:', error);
      return true; // Default to visible on error
    }
  }

  findParentCommentId(replyElement) {
    // Find the parent comment element (the one without --child class)
    let current = replyElement.parentElement;
    while (current) {
      const parentComment = current.querySelector('.comment-item:not(.comment-item--child)');
      if (parentComment) {
        return this.extractCommentId(parentComment);
      }
      current = current.parentElement;
    }
    return null;
  }

  // Step 7: Mark comments with visual indicators
  addIndicator(commentElement, isVisible) {
    console.log('ShadowGag: Adding indicator - isVisible:', isVisible, 'settings:', this.settings);
    
    // Store original HTML if not already stored
    if (!commentElement.dataset.shadowgagOriginalHtml) {
      commentElement.dataset.shadowgagOriginalHtml = commentElement.innerHTML;
      console.log('ShadowGag: Stored original HTML for comment');
    }
    
    // Restore comment to original state before applying new marking
    this.restoreComment(commentElement);
    
    // Re-store the original HTML since restoreComment clears it
    if (!commentElement.dataset.shadowgagOriginalHtml) {
      commentElement.dataset.shadowgagOriginalHtml = commentElement.innerHTML;
    }
    
    // Determine which marking to apply
    const markingType = isVisible ? this.settings.visibleMarking : this.settings.shadowbannedMarking;
    const customCode = isVisible ? this.settings.visibleCustomCode : this.settings.shadowbannedCustomCode;
    
    console.log('ShadowGag: Applying marking type:', markingType, 'for', isVisible ? 'visible' : 'shadowbanned', 'comment');
    
    // Add a class to track that this element has been marked
    commentElement.classList.add('shadowgag-marked');
    commentElement.classList.add(isVisible ? 'shadowgag-visible' : 'shadowgag-shadowbanned');
    
    const markingFunctions = {
      visible: {
        none: (element) => {
          // No marking - clean look
          console.log('ShadowGag: Applied no marking for visible comment');
        },
        highlight: (element, options) => {
          const borderColor = options.borderColor || this.settings.visibleHighlightBorderColor;
          const bgColor = options.bgColor || this.settings.visibleHighlightBgColor;
          const borderWidth = options.borderWidth || this.settings.visibleHighlightBorderWidth;
          element.style.backgroundColor = bgColor;
          element.style.borderLeft = `${borderWidth}px solid ${borderColor}`;
          element.style.paddingLeft = '8px';
          element.style.opacity = '0.9';
          console.log('ShadowGag: Applied highlight marking for visible comment');
        },
        border: (element, options) => {
          const borderColor = options.borderColor || this.settings.visibleBorderColor;
          const borderWidth = options.borderWidth || this.settings.visibleBorderWidth;
          element.style.borderLeft = `${borderWidth}px solid ${borderColor}`;
          element.style.paddingLeft = '8px';
          console.log('ShadowGag: Applied border marking for visible comment');
        },
        badge: (element, options) => {
          const badgeText = options.badgeText || this.settings.visibleBadgeText;
          const badgeColor = options.badgeColor || this.settings.visibleBadgeColor;
          const badgeTextColor = options.badgeTextColor || this.settings.visibleBadgeTextColor;
          this.addBadge(element, badgeText, badgeColor, badgeTextColor);
          console.log('ShadowGag: Applied badge marking for visible comment');
        },
        custom: (element, customCode) => {
          this.executeCustomFunction(element, customCode, 'visible');
        }
      },
      shadowbanned: {
        none: (element) => {
          // No marking - clean look
          console.log('ShadowGag: Applied no marking for shadowbanned comment');
        },
        highlight: (element, options) => {
          const borderColor = options.borderColor || this.settings.shadowbannedHighlightBorderColor;
          const bgColor = options.bgColor || this.settings.shadowbannedHighlightBgColor;
          const borderWidth = options.borderWidth || this.settings.shadowbannedHighlightBorderWidth;
          element.style.backgroundColor = bgColor;
          element.style.borderLeft = `${borderWidth}px solid ${borderColor}`;
          element.style.paddingLeft = '8px';
          element.style.opacity = '0.8';
          console.log('ShadowGag: Applied highlight marking for shadowbanned comment');
        },
        border: (element, options) => {
          const borderColor = options.borderColor || this.settings.shadowbannedBorderColor;
          const borderWidth = options.borderWidth || this.settings.shadowbannedBorderWidth;
          element.style.borderLeft = `${borderWidth}px solid ${borderColor}`;
          element.style.paddingLeft = '8px';
          console.log('ShadowGag: Applied border marking for shadowbanned comment');
        },
        badge: (element, options) => {
          const badgeText = options.badgeText || this.settings.shadowbannedBadgeText;
          const badgeColor = options.badgeColor || this.settings.shadowbannedBadgeColor;
          const badgeTextColor = options.badgeTextColor || this.settings.shadowbannedBadgeTextColor;
          this.addBadge(element, badgeText, badgeColor, badgeTextColor);
          console.log('ShadowGag: Applied badge marking for shadowbanned comment');
        },
        custom: (element, customCode) => {
          this.executeCustomFunction(element, customCode, 'shadowbanned');
        }
      }
    };
    
    const category = isVisible ? 'visible' : 'shadowbanned';
    const markingFunction = markingFunctions[category][markingType];
    
    if (markingFunction) {
      try {
        if (markingType === 'custom') {
          markingFunction(commentElement, customCode);
        } else {
          // Prepare options object with current settings
          const options = this.getMarkingOptions(category, markingType);
          markingFunction(commentElement, options);
        }
      } catch (error) {
        console.error('ShadowGag: Error applying marking:', error);
        // Fallback to default marking
        if (isVisible) {
          // Fallback: no marking for visible
        } else {
          // Fallback: simple border for shadowbanned
          commentElement.style.borderLeft = '3px solid #ff6b6b';
          commentElement.style.paddingLeft = '8px';
        }
      }
    } else {
      console.warn('ShadowGag: Unknown marking type:', markingType);
    }
  }

  // Get marking options based on current settings
  getMarkingOptions(category, markingType) {
    const options = {};
    
    if (category === 'visible') {
      switch (markingType) {
        case 'highlight':
          options.borderColor = this.settings.visibleHighlightBorderColor;
          options.bgColor = this.settings.visibleHighlightBgColor;
          options.borderWidth = this.settings.visibleHighlightBorderWidth;
          break;
        case 'border':
          options.borderColor = this.settings.visibleBorderColor;
          options.borderWidth = this.settings.visibleBorderWidth;
          break;
        case 'badge':
          options.badgeText = this.settings.visibleBadgeText;
          options.badgeColor = this.settings.visibleBadgeColor;
          options.badgeTextColor = this.settings.visibleBadgeTextColor;
          break;
      }
    } else if (category === 'shadowbanned') {
      switch (markingType) {
        case 'highlight':
          options.borderColor = this.settings.shadowbannedHighlightBorderColor;
          options.bgColor = this.settings.shadowbannedHighlightBgColor;
          options.borderWidth = this.settings.shadowbannedHighlightBorderWidth;
          break;
        case 'border':
          options.borderColor = this.settings.shadowbannedBorderColor;
          options.borderWidth = this.settings.shadowbannedBorderWidth;
          break;
        case 'badge':
          options.badgeText = this.settings.shadowbannedBadgeText;
          options.badgeColor = this.settings.shadowbannedBadgeColor;
          options.badgeTextColor = this.settings.shadowbannedBadgeTextColor;
          break;
      }
    }
    
    return options;
  }

  // Add a text badge to the comment
  addBadge(commentElement, text, color, textColor) {
    const badge = document.createElement('span');
    badge.className = `shadowgag-${text.toLowerCase()}-badge`;
    badge.textContent = text;
    badge.style.cssText = `
      display: inline-block;
      background: ${color};
      color: ${textColor};
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: bold;
      margin-right: 8px;
      text-transform: uppercase;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.2;
    `;
    
    // Find the best insertion point
    const header = commentElement.querySelector('.ui-comment-header');
    if (header) {
      const container = header.querySelector('.ui-comment-header__container');
      if (container) {
        const timeElement = container.querySelector('.ui-comment-header__time');
        if (timeElement) {
          // Insert before the time element
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
      commentElement.insertBefore(badge, commentElement.firstChild);
    }
  }

  // Execute custom function safely
  executeCustomFunction(element, customCode, type) {
    if (!customCode || customCode.trim() === '') {
      console.log('ShadowGag: No custom code provided for', type, 'marking');
      return;
    }
    
    try {
      console.log('ShadowGag: Executing custom', type, 'function');
      const func = new Function('element', customCode);
      func(element);
      console.log('ShadowGag: Custom', type, 'function executed successfully');
    } catch (error) {
      console.error('ShadowGag: Error executing custom', type, 'function:', error);
      // Show user-friendly error in console
      console.warn('ShadowGag: Custom function error. Check your JavaScript syntax.');
    }
  }

  async processNewComments(apiData) {
    console.log('ShadowGag: Processing new comments from API response');
    
    // If this is top-level comment data, update our cache
    if (apiData.payload && apiData.payload.comments) {
      for (const comment of apiData.payload.comments) {
        if (comment.commentId) {
          if (comment.level === 1) {
            this.allTopLevelComments.add(comment.commentId);
          } else if (comment.level === 2 && comment.parentCommentId) {
            // This is reply data, update our replies cache
            if (!this.allRepliesCache.has(comment.parentCommentId)) {
              this.allRepliesCache.set(comment.parentCommentId, new Set());
            }
            this.allRepliesCache.get(comment.parentCommentId).add(comment.commentId);
          }
        }
      }
    }
    
    // Detect if this might be a reply thread being loaded
    const url = apiData.url || '';
    if (url.includes('level=2') && url.includes('commentId=')) {
      const parentMatch = url.match(/commentId=([^&]+)/);
      if (parentMatch) {
        const parentCommentId = parentMatch[1];
        console.log('ShadowGag: Detected reply thread loading for parent:', parentCommentId);
        // Load the complete reply thread to ensure we have all data
        if (!this.loadedReplyThreads.has(parentCommentId)) {
          setTimeout(() => this.loadAllRepliesForComment(parentCommentId), 500);
        }
      }
    }
    
    // Wait a bit more for DOM to update
    await new Promise(resolve => setTimeout(resolve, SHADOWGAG_CONFIG.TIMING.DOM_UPDATE_DELAY));
    
    // Find and process any new comments (only if enabled)
    if (this.isEnabled) {
      const commentElements = this.findAllComments();
      
      for (const commentElement of commentElements) {
        const commentId = this.extractCommentId(commentElement);
        if (commentId && !this.processedComments.has(commentId)) {
          await this.processComment(commentElement);
        }
      }
    }
  }

  // Mutation observer for dynamically loaded content
  setupMutationObserver() {
    // Don't create multiple observers
    if (this.mutationObserver) {
      console.log('ShadowGag: Mutation observer already exists');
      return;
    }
    
    console.log('ShadowGag: Setting up enhanced mutation observer');
    this.mutationObserver = new MutationObserver((mutations) => {
      let hasNewComments = false;
      let hasContentChanges = false;
      let targetCommentUpdated = false;
      
      mutations.forEach((mutation) => {
        // Check for new comment elements being added
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if new comment elements were added
            if (node.classList && node.classList.contains('comment-list-item')) {
              hasNewComments = true;
              console.log('ShadowGag: New comment element detected');
            } else if (node.querySelector && node.querySelector('.comment-list-item')) {
              hasNewComments = true;
              console.log('ShadowGag: Container with comment elements detected');
            }
            
            // Check for comment content being populated (text, usernames, etc.)
            if (node.classList && (
                node.classList.contains('ui-comment-content') ||
                node.classList.contains('ui-comment-header') ||
                node.classList.contains('ui-comment-text')
              )) {
              hasContentChanges = true;
              console.log('ShadowGag: Comment content element detected');
            }
            
            // Check if this is our target comment being loaded
            if (this.targetCommentId && node.querySelector) {
              const targetElement = node.querySelector(`[data-comment-id="${this.targetCommentId}"]`) ||
                                   node.querySelector(`[id*="${this.targetCommentId}"]`);
              if (targetElement) {
                targetCommentUpdated = true;
                console.log('ShadowGag: Target comment element detected:', this.targetCommentId);
              }
            }
          }
        });
        
        // Check for attribute changes that might indicate content loading
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          
          // Check if comment content attributes changed
          if (target.classList && target.classList.contains('comment-list-item')) {
            hasContentChanges = true;
            console.log('ShadowGag: Comment element attributes changed');
          }
          
          // Check if this is our target comment
          if (this.targetCommentId && (
              target.getAttribute('data-comment-id') === this.targetCommentId ||
              target.id && target.id.includes(this.targetCommentId)
            )) {
            targetCommentUpdated = true;
            console.log('ShadowGag: Target comment attributes updated:', this.targetCommentId);
          }
        }
        
        // Check for text content changes (comment text being loaded)
        if (mutation.type === 'childList' && mutation.target.classList) {
          if (mutation.target.classList.contains('ui-comment-text') ||
              mutation.target.classList.contains('ui-comment-content')) {
            hasContentChanges = true;
            console.log('ShadowGag: Comment text content changed');
          }
        }
      });
      
      // Process changes if extension is enabled
      if (this.isEnabled) {
        // If target comment was updated, process it immediately
        if (targetCommentUpdated) {
          console.log('ShadowGag: Target comment updated, processing immediately');
          setTimeout(async () => {
            const targetElement = this.findCommentElementById(this.targetCommentId);
            if (targetElement) {
              await this.processComment(targetElement);
            }
            // Also do a broader check
            await this.checkExistingComments();
          }, 100); // Quick response for target comment
        }
        // If new comments or content changes detected
        else if (hasNewComments || hasContentChanges) {
          console.log('ShadowGag: Content changes detected via mutation observer');
          setTimeout(() => this.checkExistingComments(), SHADOWGAG_CONFIG.TIMING.MUTATION_OBSERVER_DELAY);
        }
      }
    });

    // Enhanced observation options to catch more changes
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-comment-id', 'id', 'class'],
      characterData: true // Also observe text changes
    });
  }

  // Toggle extension state
  setEnabled(enabled) {
    console.log('ShadowGag: Setting enabled state to:', enabled);
    this.isEnabled = enabled;
    
    if (!this.isEnabled) {
      // Remove all indicators
      this.removeAllIndicators();
      console.log('ShadowGag: Removed all visual indicators');
    } else {
      // When re-enabling, we need to ensure we have all the necessary data
      console.log('ShadowGag: Re-enabled, performing full check');
      
      setTimeout(async () => {
        try {
          // If we don't have basic data, we need to re-initialize
          if (!this.currentUser || !this.postKey) {
            console.log('ShadowGag: Missing basic data, re-initializing...');
            await this.start();
          } else {
            // We have basic data, but we might need to refresh our comment caches
            console.log('ShadowGag: Refreshing comment data...');
            
            // Clear processed comments to allow re-processing
            this.processedComments.clear();
            
            // Reload top-level comments if we're on a post page
            if (this.pageType === 'post') {
              this.allTopLevelComments.clear();
              await this.loadUserCommentsOptimized();
            }
            
            // If this is a comment page, reload replies for the target comment
            if (this.pageType === 'comment' && this.targetCommentId) {
              const parentCommentId = this.extractParentCommentIdFromTarget(this.targetCommentId);
              if (parentCommentId) {
                this.allRepliesCache.delete(parentCommentId);
                this.loadedReplyThreads.delete(parentCommentId);
                await this.loadAllRepliesForComment(parentCommentId);
              }
            }
            
            // Now check existing comments
            await this.checkExistingComments();
          }
          
          console.log('ShadowGag: Re-enable process completed successfully');
        } catch (error) {
          console.error('ShadowGag: Error during re-enable process:', error);
          // If re-initialization fails, try a simple comment check
          try {
            await this.checkExistingComments();
          } catch (fallbackError) {
            console.error('ShadowGag: Fallback comment check also failed:', fallbackError);
          }
        }
      }, 100);
    }
    
    return this.isEnabled;
  }

  // Method to remove all shadowban indicators
  removeAllIndicators() {
    console.log('ShadowGag: Removing all indicators...');
    
    // Remove all ShadowGag-specific elements (badges, indicators)
    const shadowgagElements = document.querySelectorAll('[class*="shadowgag"]');
    shadowgagElements.forEach(element => {
      // Only remove elements that are clearly our indicators, not comment containers
      if (element.classList.contains('shadowgag-visible-badge') ||
          element.classList.contains('shadowgag-shadowbanned-badge') ||
          element.classList.contains('shadowgag-new-comment-indicator') ||
          element.classList.contains('shadowgag-indicator')) {
        element.remove();
      }
    });
    
    // Restore all marked comments to their original state
    const markedComments = document.querySelectorAll('.shadowgag-marked');
    markedComments.forEach(comment => {
      this.restoreComment(comment);
    });
    
    console.log('ShadowGag: All indicators removed');
  }

  // Process newly created comment from API response
  processNewlyCreatedComment(commentData) {
    if (!this.isEnabled) {
      console.log('ShadowGag: Extension disabled, skipping new comment processing');
      return;
    }

    console.log('ShadowGag: Processing newly created comment:', commentData);
    
    try {
      const commentId = commentData.commentId;
      if (!commentId) {
        console.warn('ShadowGag: No comment ID found in new comment data');
        return;
      }

      // Find the comment element in the DOM
      const commentElement = this.findCommentElementById(commentId);
      if (!commentElement) {
        console.warn('ShadowGag: Could not find DOM element for new comment:', commentId);
        // Try again after a longer delay
        setTimeout(() => {
          const retryElement = this.findCommentElementById(commentId);
          if (retryElement) {
            this.flagNewComment(retryElement, commentData);
          } else {
            console.warn('ShadowGag: Still could not find DOM element for new comment after retry:', commentId);
          }
        }, SHADOWGAG_CONFIG.TIMING.RETRY_DELAY);
        return;
      }

      this.flagNewComment(commentElement, commentData);
      
    } catch (error) {
      console.error('ShadowGag: Error processing newly created comment:', error);
    }
  }

  // Find comment element by comment ID
  findCommentElementById(commentId) {
    log.trace('Searching for comment element with ID:', commentId);
    
    // First, try the same approach as findAllComments() and extractCommentId()
    const allComments = document.querySelectorAll('.comment-list-item .comment-item');
    
    for (const commentElement of allComments) {
      const extractedId = this.extractCommentId(commentElement);
      if (extractedId === commentId) {
        log.trace('Found comment element using extractCommentId approach');
        return commentElement;
      }
    }
    
    // Fallback: Try different selectors that might contain the comment ID
    const selectors = [
      `[data-comment-id="${commentId}"]`,
      `[id*="${commentId}"]`,
      `[class*="${commentId}"]`,
      `.comment[data-id="${commentId}"]`
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        log.trace('Found comment element using selector:', selector);
        return element;
      }
    }

    // If direct selectors don't work, search through all comment elements
    const allCommentElements = document.querySelectorAll('.comment, [class*="comment"], [data-comment-id]');
    for (const comment of allCommentElements) {
      // Check various attributes and text content for the comment ID
      const attributes = ['data-comment-id', 'id', 'data-id', 'class'];
      for (const attr of attributes) {
        const value = comment.getAttribute(attr);
        if (value && value.includes(commentId)) {
          log.trace('Found comment element by attribute search:', attr);
          return comment;
        }
      }
    }

    log.debug('Comment element not found for ID:', commentId);
    return null;
  }

  // Flag a newly created comment
  flagNewComment(commentElement, commentData) {
    console.log('ShadowGag: Flagging newly created comment:', commentData.commentId);
    
    // Add a special class to identify this as a newly created comment
    commentElement.classList.add('shadowgag-new-comment');
    
    // Create and add the new comment indicator
    const indicator = this.createNewCommentIndicator(commentData);
    
    // Find the best place to insert the indicator
    const insertionPoint = this.findIndicatorInsertionPoint(commentElement);
    if (insertionPoint) {
      insertionPoint.appendChild(indicator);
    } else {
      // Fallback: prepend to the comment element
      commentElement.insertBefore(indicator, commentElement.firstChild);
    }

    // Store the comment data for reference
    commentElement.setAttribute('data-shadowgag-new-comment', JSON.stringify({
      commentId: commentData.commentId,
      timestamp: commentData.timestamp || Date.now(),
      flagged: true
    }));
  }

  // Create indicator for newly created comments
  createNewCommentIndicator(commentData) {
    const indicator = document.createElement('div');
    indicator.className = 'shadowgag-new-comment-indicator';
    indicator.style.cssText = `
      display: inline-flex;
      align-items: center;
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
      margin: 2px 4px;
      box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
      border: 1px solid #4CAF50;
      cursor: help;
      z-index: 1000;
      position: relative;
    `;
    
    indicator.innerHTML = `
      <span>NEW</span>
    `;
    
    indicator.title = `New comment created at ${new Date(commentData.timestamp || Date.now()).toLocaleTimeString()}`;
    
    return indicator;
  }

  // Find the best insertion point for indicators
  findIndicatorInsertionPoint(commentElement) {
    // Try to find the comment header where indicators should go
    const header = commentElement.querySelector('.ui-comment-header');
    if (header) {
      const container = header.querySelector('.ui-comment-header__container');
      if (container) {
        return container;
      }
      return header;
    }
    
    // Fallback: look for any header-like element
    const headerLike = commentElement.querySelector('[class*="header"], [class*="meta"], .comment-meta');
    if (headerLike) {
      return headerLike;
    }
    
    // Last resort: return the comment element itself
    return commentElement;
  }

  // Update settings
  updateSettings(newSettings) {
    console.log('ShadowGag: Updating settings:', newSettings);
    const oldSettings = { ...this.settings };
    this.settings = { ...this.settings, ...newSettings };
    
    // If marking settings changed, reprocess all comments
    const markingSettingsChanged = (
      oldSettings.visibleMarking !== this.settings.visibleMarking ||
      oldSettings.shadowbannedMarking !== this.settings.shadowbannedMarking ||
      oldSettings.visibleCustomCode !== this.settings.visibleCustomCode ||
      oldSettings.shadowbannedCustomCode !== this.settings.shadowbannedCustomCode
    );
    
    if (markingSettingsChanged && this.isEnabled) {
      console.log('ShadowGag: Marking settings changed, reprocessing comments');
      this.reprocessAllComments();
    }
  }

  // Reprocess all comments
  reprocessAllComments() {
    console.log('ShadowGag: Reprocessing all comments');
    
    // Remove all existing indicators first
    this.removeAllIndicators();
    
    // Clear processed comments to allow re-processing
    this.processedComments.clear();
    
    // Re-check all comments
    this.checkExistingComments();
  }

  // Restore comment to original state
  restoreComment(commentElement) {
    // Only restore if we have original HTML and the element is marked by us
    if (commentElement.dataset.shadowgagOriginalHtml && commentElement.classList.contains('shadowgag-marked')) {
      // Remove only our badges and indicators, not the entire innerHTML
      const shadowgagElements = commentElement.querySelectorAll('[class*="shadowgag"]');
      shadowgagElements.forEach(el => el.remove());
      
      // Clear our classes and styles
      commentElement.classList.remove('shadowgag-marked', 'shadowgag-visible', 'shadowgag-shadowbanned');
      
      // Reset only the styles we might have added
      const stylesToReset = ['backgroundColor', 'borderLeft', 'paddingLeft', 'opacity'];
      stylesToReset.forEach(style => {
        commentElement.style[style] = '';
      });
    }
  }

  // OPTIMIZATION: Improved reply loading with smart request management
  async loadAllRepliesForComment(parentCommentId) {
    console.log('ShadowGag: Loading all replies for comment:', parentCommentId);
    
    // Check if we've already loaded this thread
    if (this.loadedReplyThreads.has(parentCommentId)) {
      console.log('ShadowGag: Reply thread already loaded for:', parentCommentId);
      return;
    }
    
    // Check cache first if enabled
    if (SHADOWGAG_CONFIG.PERFORMANCE.CACHE_USER_COMMENTS && this.allRepliesCache.has(parentCommentId)) {
      console.log('ShadowGag: Using cached reply data for:', parentCommentId);
      return;
    }
    
    try {
      let allReplies = [];
      let hasMore = true;
      let after = null;
      let page = 1;
      
      // Respect unlimited search setting for replies too
      const unlimitedSearch = SHADOWGAG_CONFIG.PERFORMANCE.UNLIMITED_SEARCH;
      const maxPages = unlimitedSearch ? Infinity : SHADOWGAG_CONFIG.API.MAX_PAGES;
      
      console.log(`ShadowGag: Reply search mode: ${unlimitedSearch ? 'UNLIMITED (100% accuracy)' : 'LIMITED (faster)'}, max pages: ${maxPages}`);
      
      while (hasMore && page <= maxPages) {
        console.log(`ShadowGag: Loading replies page ${page} for comment ${parentCommentId}...`);
        
        // Build API URL for replies
        const apiUrl = buildCommentListUrl(this.postKey, { 
          level: 2, 
          commentId: parentCommentId, 
          after 
        });
        
        try {
          const data = await this.makeApiRequest(apiUrl);
          
          if (data.payload && data.payload.comments) {
            const replies = data.payload.comments;
            allReplies = allReplies.concat(replies);
            
            console.log(`ShadowGag: Loaded ${replies.length} replies on page ${page}, total: ${allReplies.length}`);
            
            // Check if there are more replies
            if (replies.length < SHADOWGAG_CONFIG.API.COMMENTS_PER_PAGE) {
              hasMore = false;
            } else {
              // Get the last reply's ID for pagination
              const lastReply = replies[replies.length - 1];
              after = lastReply.commentId;
            }
          } else {
            hasMore = false;
          }
          
        } catch (error) {
          console.error('ShadowGag: Error loading replies page', page, ':', error);
          break;
        }
        
        page++;
        
        // Use standard delay for reply loading
        await new Promise(resolve => setTimeout(resolve, SHADOWGAG_CONFIG.TIMING.API_DELAY));
      }
      
      // Store all reply IDs for this parent comment
      const replyIds = new Set();
      for (const reply of allReplies) {
        if (reply.commentId) {
          replyIds.add(reply.commentId);
        }
      }
      
      this.allRepliesCache.set(parentCommentId, replyIds);
      this.loadedReplyThreads.add(parentCommentId);
      
      console.log(`ShadowGag: Loaded ${allReplies.length} total replies for comment ${parentCommentId} from ${page - 1} pages`);
      
      if (!unlimitedSearch && page > maxPages) {
        console.warn('ShadowGag: Reply search was limited - some replies might exist on later pages. Enable UNLIMITED_SEARCH for 100% accuracy.');
      }
      
    } catch (error) {
      console.error('ShadowGag: Error loading all replies for comment:', parentCommentId, error);
    }
  }

  async detectNetworkConfig() {
    console.log('ShadowGag: Detecting network configuration...');
    
    // Use the early capture system
    const config = window.shadowGagConfigCapture.getConfig();
    
    if (config.isComplete) {
      console.log('ShadowGag: Using captured configuration');
      this.networkConfig = {
        HEADERS: {
          'client-version': config.clientVersion
        },
        APP_ID: config.appId
      };
      return this.networkConfig;
    }
    
    // If not ready yet, wait for it
    return new Promise((resolve, reject) => {
      window.shadowGagConfigCapture.onConfigReady((appId, clientVersion) => {
        console.log('ShadowGag: Configuration ready via listener');
        this.networkConfig = {
          HEADERS: {
            'client-version': clientVersion
          },
          APP_ID: appId
        };
        resolve(this.networkConfig);
      });
      
      // Timeout - configuration not captured
      setTimeout(() => {
        if (!this.networkConfig) {
          console.error('ShadowGag: Configuration not captured within timeout period');
          console.error('ShadowGag: Extension cannot function without valid APP_ID and client-version');
          reject(new Error('Configuration not captured - APP_ID and client-version not available'));
        }
      }, 5000); // Increased timeout to 5 seconds
    });
  }

  // Schedule delayed comment processing for notification navigation
  scheduleDelayedCommentProcessing(targetCommentId, isInitialLoad = false) {
    log.info('Scheduling delayed processing for target comment:', targetCommentId, 'isInitialLoad:', isInitialLoad);
    
    // Use extended delays for initial loads (notification navigation)
    const delays = isInitialLoad 
      ? [200, 500, 1000, 2000, 3000, 5000, 8000] // Extended delays for initial loads
      : [500, 1000, 2000, 3000, 5000]; // Standard delays for hash changes
    
    let processedSuccessfully = false;
    
    delays.forEach((delay, index) => {
      setTimeout(async () => {
        // Skip if already processed successfully
        if (processedSuccessfully) {
          log.trace(`Skipping delayed processing attempt ${index + 1}/${delays.length} - already processed successfully`);
          return;
        }
        
        log.debug(`Delayed processing attempt ${index + 1}/${delays.length} for comment:`, targetCommentId);
        
        // Check if the target comment is now in the DOM
        const targetElement = this.findCommentElementById(targetCommentId);
        if (targetElement) {
          log.debug('Target comment found in DOM, processing immediately');
          
          // Check if already processed
          if (this.processedComments.has(targetCommentId)) {
            log.trace('Target comment already processed, stopping delayed processing');
            processedSuccessfully = true;
            return;
          }
          
          await this.processComment(targetElement);
          
          // Check if processing was successful
          if (this.processedComments.has(targetCommentId)) {
            log.info('Target comment processed successfully, stopping delayed processing');
            processedSuccessfully = true;
          }
        } else {
          log.debug('Target comment not yet in DOM, running full check');
          // Run a full check to catch any newly loaded comments
          await this.checkExistingComments();
          
          // Check if the target comment was processed during the full check
          if (this.processedComments.has(targetCommentId)) {
            log.info('Target comment processed during full check, stopping delayed processing');
            processedSuccessfully = true;
          }
        }
      }, delay);
    });
  }
}

// Message listener for background script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  log.info('Received message:', request.action);
  
  if (request.action === 'setEnabled') {
    log.info('Set enabled state to:', request.enabled);
    if (window.shadowGagChecker) {
      // Update settings if provided
      if (request.settings) {
        window.shadowGagChecker.updateSettings(request.settings);
      }
      window.shadowGagChecker.setEnabled(request.enabled);
      sendResponse({ success: true, enabled: request.enabled });
    } else {
      sendResponse({ success: false, error: 'Extension not initialized' });
    }
    return true;
  }
  
  if (request.action === 'settingsChanged') {
    log.info('Settings changed:', request.settings);
    if (window.shadowGagChecker) {
      window.shadowGagChecker.updateSettings(request.settings);
      // Re-process all comments to apply new settings
      window.shadowGagChecker.reprocessAllComments();
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Extension not initialized' });
    }
    return true;
  }
  
  if (request.action === 'ping') {
    sendResponse({ success: true, initialized: !!window.shadowGagChecker });
    return true;
  }
});

// Initialize the extension when the page loads - SINGLE INSTANCE ONLY
(async function() {
  console.log('ShadowGag: Content script loaded on', window.location.href);
  
  // Prevent multiple initialization
  if (window.shadowGagInitialized) {
    console.log('ShadowGag: Already initialized, skipping');
    return;
  }
  window.shadowGagInitialized = true;
  
  // Initialize URLChangeDetector early to catch notification navigation
  if (!window.shadowGagURLDetector) {
    console.log('ShadowGag: Initializing URLChangeDetector early...');
    window.shadowGagURLDetector = new URLChangeDetector();
    window.shadowGagURLDetector.startMonitoring();
  }
  
  // Initialize configuration capture first
  if (!window.shadowGagConfigCapture) {
    window.shadowGagConfigCapture = new ConfigurationCapture();
  }
  
  // Initialize login detector
  if (!window.shadowGagLoginDetector) {
    window.shadowGagLoginDetector = new LoginDetector();
  }
  
  try {
    // Create ShadowGagChecker immediately to register URL change listener
    if (!window.shadowGagChecker) {
      console.log('ShadowGag: Creating ShadowGagChecker immediately...');
      const checker = new ShadowGagChecker();
      window.shadowGagChecker = checker;
      console.log('ShadowGag: ShadowGagChecker created successfully');
    } else {
      console.log('ShadowGag: ShadowGagChecker already exists, skipping creation');
    }
  } catch (error) {
    console.error('ShadowGag: Error starting checker:', error);
  }
})();