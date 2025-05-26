# AI Assistant Rules for ShadowGag Codebase

## Communication Style Rules

### Formatting and Presentation
- **NEVER** use emojis in any communication, documentation, or code comments
- **ALWAYS** use clear, professional language without decorative elements
- **NEVER** use excessive formatting like multiple exclamation marks or decorative symbols
- **ALWAYS** be direct and concise in explanations
- **NEVER** use phrases like "Great!" "Awesome!" or other enthusiastic expressions

### Code Documentation
- **ALWAYS** write technical, factual comments
- **NEVER** use casual language in code comments
- **ALWAYS** focus on what the code does, not how "cool" or "neat" it is
- **NEVER** add personality or humor to technical documentation

## File Management Rules

### Multi-Browser Synchronization
- **ALWAYS** edit only the root `content.js` file
- **NEVER** edit Chrome or Firefox versions directly
- **ALWAYS** copy root to Chrome: `cp content.js chrome/content.js`
- **ALWAYS** copy root to Firefox: `cp content.js firefox/content.js`
- **ALWAYS** fix Firefox APIs after copying: `chrome.runtime` → `browser.runtime`, `chrome.storage` → `browser.storage`
- **NEVER** forget to synchronize all three versions

### File Editing Sequence
1. Make changes to root `content.js`
2. Test changes thoroughly
3. Copy to `chrome/content.js`
4. Copy to `firefox/content.js`
5. Replace Chrome APIs with browser APIs in Firefox version
6. Verify all three files are synchronized

## Code Quality Rules

### Logging System
- **ALWAYS** use the structured logging system: `log.error()`, `log.warn()`, `log.info()`, `log.debug()`, `log.trace()`
- **NEVER** use `console.log()` directly
- **ALWAYS** set appropriate log levels for production vs development
- **NEVER** leave verbose logging in production code

### Performance Optimization
- **ALWAYS** implement early termination in loops and processing
- **ALWAYS** check if work is already done before starting
- **ALWAYS** cache results when appropriate
- **NEVER** create infinite loops or unbounded processing
- **ALWAYS** limit API calls and script analysis

### Error Handling
- **ALWAYS** provide fallback mechanisms
- **NEVER** let errors crash the extension
- **ALWAYS** log errors appropriately
- **ALWAYS** continue operation when possible

## Browser Extension Specific Rules

### API Compatibility
- **NEVER** use Chrome APIs in Firefox version
- **ALWAYS** use `browser.runtime` instead of `chrome.runtime` in Firefox
- **ALWAYS** use `browser.storage` instead of `chrome.storage` in Firefox
- **NEVER** assume API compatibility between browsers

### Extension Architecture
- **ALWAYS** handle notification navigation (URLs with `cs_comment_id`)
- **ALWAYS** ensure user detection before processing comments
- **ALWAYS** validate configuration capture (appId, client-version)
- **NEVER** process comments without current user context

## Problem-Solving Approach

### Debugging Strategy
- **ALWAYS** check user detection first
- **ALWAYS** verify configuration capture
- **ALWAYS** confirm the user is on a 9gag post page
- **ALWAYS** check console for errors
- **NEVER** assume the obvious cause is correct

### Code Analysis
- **ALWAYS** understand the complete flow before making changes
- **ALWAYS** consider impact on notification navigation
- **ALWAYS** test with actual 9gag notification links
- **NEVER** make changes without understanding dependencies

## Specific Technical Rules

### URL Change Detection
- **ALWAYS** handle post changes during navigation
- **ALWAYS** clear caches when post changes
- **ALWAYS** extract target comment ID from URL hash
- **NEVER** ignore URL change events

### Comment Processing
- **ALWAYS** check if comment is already processed
- **ALWAYS** extract username and compare with current user
- **ALWAYS** validate comment ID extraction
- **NEVER** process comments from other users

### Configuration Management
- **ALWAYS** capture appId and client-version from network requests
- **ALWAYS** validate configuration format
- **NEVER** proceed without valid configuration
- **ALWAYS** implement fallback mechanisms

## Testing Requirements

### Before Any Changes
- **ALWAYS** test notification navigation
- **ALWAYS** test in both Chrome and Firefox
- **ALWAYS** verify user detection works
- **ALWAYS** check configuration capture
- **NEVER** skip browser compatibility testing

### After Changes
- **ALWAYS** verify all three files are synchronized
- **ALWAYS** test the primary use case (notification navigation)
- **ALWAYS** check console for errors
- **ALWAYS** verify performance is not degraded

## Git and Version Control

### Commit Messages
- **ALWAYS** use conventional commit format: `type: description`
- **NEVER** use emojis in commit messages
- **ALWAYS** be descriptive but concise
- **ALWAYS** mention if Firefox APIs were updated

### File Management
- **ALWAYS** commit all three content.js files together
- **NEVER** commit only one version
- **ALWAYS** include documentation updates when relevant

## Communication with Users

### Status Updates
- **ALWAYS** be factual about what was changed
- **NEVER** oversell or use marketing language
- **ALWAYS** mention any limitations or requirements
- **ALWAYS** provide clear next steps

### Problem Reporting
- **ALWAYS** ask for specific error messages
- **ALWAYS** request browser and version information
- **ALWAYS** ask for steps to reproduce
- **NEVER** assume the problem without evidence

## Code Review Standards

### Before Suggesting Changes
- **ALWAYS** understand the existing architecture
- **ALWAYS** consider notification navigation impact
- **ALWAYS** verify browser compatibility
- **NEVER** suggest changes that break multi-browser support

### When Explaining Code
- **ALWAYS** explain the technical reasoning
- **ALWAYS** mention browser compatibility considerations
- **ALWAYS** reference the specific rules that apply
- **NEVER** use subjective language about code quality

## Documentation Standards

### Technical Writing
- **ALWAYS** use precise technical language
- **ALWAYS** include code examples when relevant
- **ALWAYS** mention browser-specific considerations
- **NEVER** use casual or conversational tone

### Rule Updates
- **ALWAYS** update rules when new patterns are discovered
- **ALWAYS** be specific about requirements
- **ALWAYS** include examples of correct and incorrect approaches
- **NEVER** leave rules vague or open to interpretation

## Critical Reminders for AI Assistants

1. **NEVER** edit Chrome or Firefox content.js directly
2. **ALWAYS** test notification navigation after changes
3. **ALWAYS** verify user detection is working
4. **ALWAYS** check configuration capture
5. **ALWAYS** maintain browser compatibility
6. **NEVER** use emojis or casual language
7. **ALWAYS** be precise and technical in communication
8. **NEVER** make assumptions about user environment
9. **ALWAYS** provide complete solutions, not partial fixes
10. **NEVER** skip the file synchronization process

---

These rules must be followed by any AI assistant working on the ShadowGag codebase to ensure consistency, quality, and proper functionality across all supported browsers. 