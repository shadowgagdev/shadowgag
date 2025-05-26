# ShadowGag Development Quick Reference

## Quick Start Commands

### File Synchronization (After editing root content.js)
```bash
# Copy to Chrome (no changes needed)
cp content.js chrome/content.js

# Copy to Firefox and fix APIs
cp content.js firefox/content.js
# Then manually replace chrome.runtime → browser.runtime, chrome.storage → browser.storage
```

### Git Workflow
```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: description of changes"

# Push to GitHub
git push origin main
```

## Common Development Tasks

### Adding New Features
1. **Edit ONLY** `content.js` (root file)
2. Test the feature thoroughly
3. Run synchronization commands
4. Fix Firefox APIs if needed
5. Test in both browsers
6. Commit changes

### Debugging Issues
1. **Set debug level**: Change `DEBUG_CONFIG.CURRENT_LEVEL = 3` in content.js
2. **Check console**: Look for ShadowGag log messages
3. **Verify user detection**: Ensure `currentUser` is not null
4. **Check configuration**: Verify `appId` and `client-version` are captured
5. **Test notification navigation**: Use actual 9gag notification links

### Performance Optimization
1. **Profile hot paths**: Use browser dev tools
2. **Check API call count**: Monitor network tab
3. **Verify early termination**: Ensure loops exit when conditions met
4. **Monitor cache usage**: Check cache hit rates in logs

## Common Issues & Solutions

### Issue: Extension not working
**Check:**
- User is logged in to 9gag
- Configuration captured (appId, client-version)
- On a 9gag post page
- Console shows no errors

### Issue: Notification navigation not working
**Check:**
- URL contains `cs_comment_id=`
- URLChangeDetector is initialized
- User detection is working
- Target comment exists in DOM

### Issue: Comments not being marked
**Check:**
- Current user matches comment author
- Comment ID extraction working
- API requests succeeding
- Visual indicators enabled

### Issue: Firefox extension broken
**Check:**
- All `chrome.runtime` replaced with `browser.runtime`
- All `chrome.storage` replaced with `browser.storage`
- Firefox manifest.json is correct

## Performance Monitoring

### Key Metrics to Watch
- API calls per comment navigation (should be minimal)
- Processing time for comment detection
- Memory usage growth over time
- Console log volume (should be minimal in production)

### Performance Targets
- **Comment navigation**: < 2 seconds to mark target comment
- **API calls**: < 5 calls per navigation
- **Memory**: No significant leaks over extended use
- **Console logs**: < 10 messages per navigation (production level)

## Testing Checklist

### Before Each Release
- Test notification navigation from 9gag notifications
- Test on posts with many comments
- Test user login/logout scenarios
- Test in both Chrome and Firefox
- Verify performance metrics
- Check console for errors
- Test visual indicator customization

### Test Scenarios
1. **Fresh page load** on 9gag post
2. **Notification click** to specific comment
3. **User logout/login** while extension active
4. **Post navigation** between different posts
5. **Reply thread loading** for nested comments

## Release Process

### Pre-Release
1. Set logging to production level (`CURRENT_LEVEL = 1`)
2. Run full test suite
3. Verify all three files synchronized
4. Check Firefox API compatibility
5. Update version numbers in manifests

### Release Steps
1. Create release branch
2. Final testing
3. Commit release
4. Tag version
5. Create GitHub release
6. Submit to browser stores

## Code Patterns

### Adding New Log Messages
```javascript
// Correct - use appropriate level
log.error('Critical failure:', error);
log.warn('Potential issue detected');
log.info('Important state change');
log.debug('Development information');
log.trace('Detailed execution flow');

// Incorrect - don't use console directly
console.log('ShadowGag:', message);
```

### Adding New Configuration
```javascript
// Add to ConfigurationCapture class
if (data.newConfigValue && !this.newConfigValue) {
  this.newConfigValue = data.newConfigValue;
  log.info('Captured new config value:', this.newConfigValue);
  this.notifyListeners();
}
```

### Adding New Comment Processing
```javascript
// Follow the established pattern
async processNewFeature(commentElement) {
  // 1. Early returns for invalid states
  if (!this.currentUser || !this.isEnabled) return;
  
  // 2. Extract required data
  const commentId = this.extractCommentId(commentElement);
  if (!commentId) return;
  
  // 3. Check cache/processed state
  if (this.processedFeatures.has(commentId)) return;
  
  // 4. Do the work
  const result = await this.doFeatureWork(commentId);
  
  // 5. Update state
  this.processedFeatures.add(commentId);
  
  // 6. Apply visual changes if needed
  if (result && this.isEnabled) {
    this.applyFeatureIndicator(commentElement, result);
  }
}
```

## Debugging Commands

### Browser Console Commands
```javascript
// Check extension state
window.shadowGagChecker

// Check current user
window.shadowGagLoginDetector.getCurrentUser()

// Check configuration
window.shadowGagConfigCapture.getConfig()

// Check URL detector
window.shadowGagURLDetector

// Force comment reprocessing
window.shadowGagChecker.reprocessAllComments()
```

### Useful Breakpoints
- `registerURLChangeListener()` - URL change handling
- `processComment()` - Comment processing
- `checkCommentVisibility()` - API visibility check
- `addIndicator()` - Visual indicator application

## Resources

### 9gag API Endpoints
- Comment list: `https://comment-cdn.9gag.com/v2/cacheable/comment-list.json`
- Add comment: `https://comment.9gag.com/v2/add-comment.json`

### Browser Extension APIs
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/)
- [Firefox WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

### Development Tools
- Chrome DevTools for debugging
- Firefox Developer Tools
- Extension debugging in both browsers

Keep this guide updated as new patterns and workflows are discovered. 