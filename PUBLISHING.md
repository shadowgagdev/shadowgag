# ShadowGag Extension Publishing Guide

This guide covers everything needed to publish ShadowGag to Chrome Web Store and Firefox Add-ons.

## Distribution Files

The following files are ready for submission:

- **Chrome Web Store**: `dist/shadowgag-chrome-v1.0.0.zip`
- **Firefox Add-ons**: `dist/shadowgag-firefox-v1.0.0.zip`

## Pre-Submission Checklist

### Technical Requirements
- [x] Extension builds successfully for both browsers
- [x] Manifest files are valid (V3 for Chrome, V2 for Firefox)
- [x] All required icons included (16x16, 32x32, 48x48, 128x128)
- [x] Legal disclaimer included in README
- [x] Privacy policy information provided
- [x] No external dependencies or CDN links

### Content Requirements
- [x] Clear description of functionality
- [x] Screenshots prepared (see Screenshots section)
- [x] Appropriate keywords and categories
- [x] Version number set (1.0.1)

## Screenshots Needed

### For Chrome Web Store (1280x800 or 640x400):
1. **Main Interface**: Extension popup showing configuration options
2. **In Action**: 9gag page with comments marked (visible vs shadowbanned)
3. **Custom Functions**: Interface showing custom JavaScript function editor
4. **Settings**: Different marking options displayed

### For Firefox Add-ons (1280x800 recommended):
1. **Extension Popup**: Configuration interface
2. **Working Example**: 9gag comments with shadowban detection
3. **Feature Overview**: Multiple marking styles shown

## Store Listing Information

### Title
**ShadowGag - Shadowban Comment Detector**

### Short Description (132 chars max for Chrome)
**Detects shadowbanned comments on 9gag by comparing visible comments with API responses. Multiple marking styles available.**

### Detailed Description

```
ShadowGag helps you identify shadowbanned comments on 9gag by comparing what you see in your browser with what 9gag's API actually returns.

KEY FEATURES:
• Automatic shadowban detection using API comparison
• Multiple marking styles for visible and shadowbanned comments
• Custom JavaScript functions for personalized styling
• Dark mode compatible design
• Real-time processing of new comments
• No data collection or tracking

MARKING OPTIONS:
• Visible Comments: Subtle borders, badges, or custom styling
• Shadowbanned Comments: Red highlights, warning badges, or custom effects
• Custom Functions: Write your own JavaScript for complete control

PRIVACY & SECURITY:
• All processing happens locally in your browser
• Only reads your username to identify your comments
• No personal data stored or transmitted
• No tracking or analytics
• Open source and transparent

HOW IT WORKS:
1. Detects your 9gag username from the page
2. Fetches comment data via 9gag's public API
3. Compares visible comments with API responses
4. Marks comments based on your chosen style

Perfect for content creators, moderators, and anyone curious about comment visibility on 9gag.

SUPPORT:
If you find this extension useful, consider supporting development at https://ko-fi.com/shadowgag

DISCLAIMER:
This is an unofficial tool not affiliated with 9gag. Use responsibly and in accordance with 9gag's terms of service.
```

### Keywords
- shadowban
- 9gag
- comment detection
- moderation
- content visibility
- social media tools
- comment analysis

### Category
- **Chrome**: Developer Tools / Productivity
- **Firefox**: Developer Tools / Social & Communication

## Chrome Web Store Submission

### Developer Account Requirements
- $5 one-time registration fee
- Valid payment method
- Anonymous developer identity: "ShadowGag Dev"

### Submission Steps
1. **Login** to Chrome Web Store Developer Dashboard
2. **Upload** `dist/shadowgag-chrome-v1.0.1.zip`
3. **Fill Store Listing**:
   - Title: ShadowGag - Shadowban Comment Detector
   - Description: (use detailed description above)
   - Category: Developer Tools
   - Language: English
4. **Upload Screenshots** (1280x800 recommended)
5. **Privacy Practices**:
   - Does NOT collect user data
   - Does NOT use remote code
   - Justify permissions in description
6. **Set Visibility**: Public
7. **Submit for Review**

### Required Permissions Justification
- `activeTab`: To access 9gag pages and analyze comments
- `storage`: To save user preferences locally
- `host permissions for 9gag.com`: To fetch comment data via API

## Firefox Add-ons Submission

### Developer Account Requirements
- Free Mozilla account
- Email verification
- Anonymous developer identity: "ShadowGag Dev"

### Submission Steps
1. **Login** to Firefox Add-on Developer Hub
2. **Upload** `dist/shadowgag-firefox-v1.0.1.zip`
3. **Fill Listing Information**:
   - Name: ShadowGag - Shadowban Comment Detector
   - Summary: (use short description)
   - Description: (use detailed description)
   - Categories: Developer Tools, Social & Communication
4. **Upload Screenshots** (1280x800 recommended)
5. **Set License**: MIT (matches repository)
6. **Privacy Policy**: Link to GitHub repository privacy section
7. **Submit for Review**

### Review Process
- **Automatic Review**: Basic checks (usually minutes)
- **Human Review**: If flagged (can take days/weeks)
- **Common Issues**: API usage, permissions, content policy

## Screenshot Guidelines

### What to Capture
1. **Extension Popup**: Clean interface showing all options
2. **9gag Integration**: Comments clearly marked with different styles
3. **Custom Functions**: Code editor interface with examples
4. **Before/After**: Same page with extension off vs on

### Technical Requirements
- **Chrome**: 1280x800 or 640x400 pixels
- **Firefox**: 1280x800 recommended
- **Format**: PNG or JPEG
- **Quality**: High resolution, clear text
- **Content**: No personal information visible

### Tips for Good Screenshots
- Use 9gag's dark theme for better contrast
- Show multiple comment marking styles
- Include the extension icon in browser toolbar
- Highlight key features with annotations if needed

## Post-Publication

### After Approval
1. **Update README** with store links
2. **Create GitHub Release** with store links
3. **Monitor Reviews** and respond professionally
4. **Track Analytics** (if available)
5. **Plan Updates** based on user feedback

### Maintenance
- **Monitor 9gag Changes**: API updates may break functionality
- **User Support**: Respond to issues and questions
- **Regular Updates**: Bug fixes and feature improvements
- **Store Compliance**: Keep up with policy changes

## Version Updates

### For Future Releases
1. **Update version** in `package.json`
2. **Run build script** to create new packages
3. **Upload to stores** with changelog
4. **Update GitHub release** with new files

### Changelog Format
```
## v1.1.0 - 2024-XX-XX
### Added
- New feature description

### Fixed
- Bug fix description

### Changed
- Improvement description
```

## Support Information

### Contact Methods
- **GitHub Issues**: Primary support channel
- **Ko-fi**: https://ko-fi.com/shadowgag
- **Response Time**: Best effort, no guarantees

### Common User Issues
1. **Extension not working**: Check if logged into 9gag
2. **No comments detected**: Verify on 9gag post page
3. **Custom functions failing**: JavaScript syntax errors
4. **Performance issues**: Too many comments on page

## Legal Considerations

### Terms of Service
- Users must comply with 9gag's ToS
- Extension provided "as is" without warranty
- No liability for account issues or damages

### Intellectual Property
- All 9gag content remains 9gag's property
- Extension code licensed under MIT
- No trademark infringement intended

### Privacy Compliance
- GDPR: No personal data collected
- CCPA: No data sale or sharing
- Local processing only

---

**Ready to publish!**

Both extension packages are built and ready for submission to their respective stores. 