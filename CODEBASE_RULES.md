# ShadowGag Codebase Management Rules

## File Structure & Synchronization

### Critical Rule: Multi-Browser Synchronization
- **ALWAYS** maintain three synchronized versions of `content.js`:
  - Root: `content.js` (main development version)
  - Chrome: `chrome/content.js` (copy of root)
  - Firefox: `firefox/content.js` (copy of root with API fixes)

### Synchronization Process
1. **Edit ONLY the root `content.js`** for all changes
2. **Copy to Chrome**: `cp content.js chrome/content.js`
3. **Copy to Firefox**: `cp content.js firefox/content.js`
4. **Fix Firefox APIs**: Replace `chrome.runtime` → `browser.runtime`, `chrome.storage` → `browser.storage`

### File Organization
```
ShadowGag/
├── content.js              # Main development file
├── manifest.json           # Chrome manifest
├── popup.html             # Extension popup
├── popup.js               # Popup logic
├── background.js          # Background script
├── chrome/
│   ├── content.js         # Chrome-specific copy
│   └── manifest.json      # Chrome manifest
└── firefox/
    ├── content.js         # Firefox-specific copy (with API fixes)
    └── manifest.json      # Firefox manifest
```

## API Compatibility Rules

### Firefox-Specific Requirements
- **NEVER** use `chrome.runtime` in Firefox version
- **ALWAYS** use `browser.runtime` in Firefox version
- **NEVER** use `chrome.storage` in Firefox version  
- **ALWAYS** use `browser.storage` in Firefox version

### API Replacement Pattern
```javascript
// Chrome/Root version
chrome.runtime.sendMessage()
chrome.storage.local.get()

// Firefox version
browser.runtime.sendMessage()
browser.storage.local.get()
```

## Performance & Optimization Rules

### Logging System Rules
- **ALWAYS** use the structured logging system, never raw `console.log`
- **Production Level**: Set `DEBUG_CONFIG.CURRENT_LEVEL = 1` (WARN) for production
- **Development Level**: Set `DEBUG_CONFIG.CURRENT_LEVEL = 3` (DEBUG) for development

### Logging Usage Patterns
```javascript
// Correct
log.error('Critical error:', error);
log.warn('Warning message');
log.info('Important information');
log.debug('Development info');
log.trace('Detailed tracing');

// Incorrect
console.log('ShadowGag:', message);
```

### Performance Optimization Rules
1. **Early Termination**: Always implement early returns when conditions are met
2. **Cache Results**: Cache API responses and DOM queries when possible
3. **Limit Processing**: Set maximum limits on loops and API calls
4. **Avoid Redundancy**: Check if work is already done before starting

### Hot Path Optimization
- **processComment()**: Minimize logging, use trace level only
- **findCommentElementById()**: Cache results, early returns
- **scheduleDelayedCommentProcessing()**: Stop when target found

## URL Change Detection Rules

### Navigation Handling
- **ALWAYS** handle notification navigation (URLs with `cs_comment_id`)
- **ALWAYS** detect post changes during navigation
- **ALWAYS** clear caches when post changes
- **ALWAYS** ensure user detection before processing

### URL Change Pattern
```javascript
// Required flow for comment navigation:
1. Extract targetCommentId from URL
2. Check for post key changes
3. Clear caches if post changed
4. Ensure current user is detected
5. Schedule delayed processing
6. Stop processing when successful
```

## Comment Processing Rules

### User Detection Requirements
- **NEVER** process comments without current user detection
- **ALWAYS** attempt user detection before giving up
- **ALWAYS** start login monitoring if user not found
- **ALWAYS** log clear messages when user detection fails

### Processing Flow
```javascript
// Required processing order:
1. Extract username from comment
2. Check if user matches current user
3. Extract comment ID
4. Check if already processed (early return)
5. Load reply threads if needed
6. Check visibility via API
7. Apply visual indicators
8. Mark as processed
```

## Configuration Capture Rules

### Network Configuration
- **ALWAYS** capture `appId` and `client-version` from network requests
- **ALWAYS** implement fallback mechanisms for configuration capture
- **NEVER** proceed without valid configuration
- **ALWAYS** validate configuration format

### Configuration Validation
```javascript
// Required validation:
- appId: Must match /^a_[a-f0-9]{40}$/
- client-version: Must contain version info or year
```

### Optimization Rules
- **Limit script analysis** to first 10 substantial scripts
- **Limit JSON block analysis** to 5 blocks maximum
- **Early termination** when configuration is complete
- **Cache analyzed content** to avoid re-processing

## Visual Indicator Rules

### Marking System
- **ALWAYS** store original HTML before applying indicators
- **ALWAYS** provide restore functionality
- **ALWAYS** support multiple marking types (badge, border, highlight, custom)
- **ALWAYS** make indicators configurable

### Indicator Types
1. **Badge**: Text overlay with customizable colors
2. **Border**: Left border with customizable width/color
3. **Highlight**: Background color with border
4. **Custom**: User-defined JavaScript code
5. **None**: Clean look, no visual changes

## State Management Rules

### Cache Management
- **ALWAYS** clear caches when post changes
- **ALWAYS** clear caches when user changes
- **NEVER** let caches grow indefinitely
- **ALWAYS** implement cache size limits

### State Synchronization
```javascript
// Required state variables:
- currentUser: Current logged-in user
- postKey: Current post identifier
- targetCommentId: Comment from notification navigation
- processedComments: Set of processed comment IDs
- commentCache: Visibility status cache
```

## Error Handling Rules

### Graceful Degradation
- **ALWAYS** provide fallback mechanisms
- **NEVER** crash on API failures
- **ALWAYS** log errors appropriately
- **ALWAYS** continue operation when possible

### Error Patterns
```javascript
// Correct error handling
try {
  await riskyOperation();
} catch (error) {
  log.error('Operation failed:', error);
  // Fallback mechanism
  return defaultValue;
}

// Incorrect - no fallback
await riskyOperation(); // Can crash extension
```

## API Request Rules

### Request Management
- **ALWAYS** implement request deduplication
- **ALWAYS** limit concurrent requests (max 2)
- **ALWAYS** implement retry mechanisms
- **ALWAYS** respect rate limits with delays

### API Patterns
```javascript
// Required API request pattern:
1. Check cache first
2. Check for pending duplicate requests
3. Implement request queuing
4. Add proper headers (client-version, etc.)
5. Handle errors gracefully
6. Cache successful responses
```

## Testing & Debugging Rules

### Debug Information
- **ALWAYS** include relevant context in log messages
- **ALWAYS** log state changes
- **NEVER** log sensitive user data
- **ALWAYS** use appropriate log levels

### Performance Monitoring
- **ALWAYS** track key metrics (API calls, processing time, cache hits)
- **ALWAYS** log performance summaries
- **ALWAYS** monitor for performance regressions

## Build & Deployment Rules

### Version Management
- **ALWAYS** update all three manifest.json files simultaneously
- **ALWAYS** test in both Chrome and Firefox before release
- **ALWAYS** verify API compatibility

### Release Checklist
1. All three content.js files synchronized
2. Firefox APIs properly replaced
3. Logging level set to production (WARN)
4. Performance optimizations enabled
5. Error handling tested
6. Configuration capture working
7. Notification navigation tested

## Security Rules

### Data Handling
- **NEVER** log sensitive user information
- **ALWAYS** validate API responses
- **NEVER** execute untrusted code (except user custom code with warnings)
- **ALWAYS** sanitize user inputs

### Network Security
- **ALWAYS** use HTTPS for API requests
- **ALWAYS** validate response formats
- **NEVER** trust external data without validation

## Code Quality Rules

### Code Organization
- **ALWAYS** use meaningful class and method names
- **ALWAYS** document complex logic
- **ALWAYS** keep functions focused and small
- **ALWAYS** use consistent naming conventions

### Comments and Documentation
- **ALWAYS** document complex algorithms
- **ALWAYS** explain non-obvious business logic
- **ALWAYS** update comments when code changes
- **NEVER** leave TODO comments in production

## Maintenance Rules

### Regular Maintenance Tasks
1. **Monitor 9gag API changes** - configuration capture may need updates
2. **Update browser compatibility** - test with new browser versions
3. **Performance monitoring** - watch for degradation
4. **User feedback** - monitor for new edge cases

### Code Review Checklist
- All three versions synchronized
- Firefox APIs properly replaced
- Logging levels appropriate
- Performance optimizations in place
- Error handling comprehensive
- State management correct
- Cache management proper
- Security considerations addressed

## CRITICAL REMINDERS

1. **NEVER edit Chrome or Firefox content.js directly** - always edit root first
2. **ALWAYS test notification navigation** - this is the primary use case
3. **ALWAYS verify user detection** - extension is useless without it
4. **ALWAYS check configuration capture** - extension won't work without valid config
5. **ALWAYS test in both browsers** - API differences can break functionality

This document should be updated whenever new patterns or requirements are discovered during development. 