# ShadowGag

A browser extension that detects shadowbanned comments on 9gag by comparing visible comments with API responses.

## Features

- **Automatic Shadowban Detection**: Compares comments visible in the browser with those returned by 9gag's API
- **Comprehensive Marking System**: Multiple ways to mark both visible and shadowbanned comments
- **Custom Functions**: Write your own JavaScript to style comments exactly how you want
- **Dark Mode Compatible**: Designed to work seamlessly with 9gag's dark theme
- **No Emojis**: Clean, professional appearance following 9gag's design principles
- **Real-time Updates**: Automatically processes new comments as they load
- **Cross-browser Support**: Works on both Firefox and Chrome-based browsers

## How It Works

1. **User Detection**: Identifies your username from the page
2. **API Comparison**: Fetches all comments via 9gag's API and compares with visible comments
3. **Shadowban Detection**: Comments visible in DOM but missing from API are likely shadowbanned
4. **Visual Marking**: Applies your chosen marking style to indicate comment status

## Marking Options

### Visible Comments
- **No marking**: Clean look with no visual indicators
- **Subtle border**: Minimal green border on the left
- **Text badge**: Small "VISIBLE" badge
- **Custom function**: Write your own JavaScript styling

### Shadowbanned Comments
- **Red highlight**: Attention-grabbing background and border
- **Red border**: Clean red border on the left
- **Warning badge**: "SHADOWBANNED" text badge
- **Custom function**: Write your own JavaScript styling

### Custom Functions

You can write custom JavaScript functions to style comments exactly how you want. The interface provides:

- **Function Signature**: Shows `function(element) { /* your code here */ }` to clarify the parameter
- **Help Text**: Explains that `element` is the comment DOM element you can modify
- **Example Buttons**: Load predefined examples with one click
- **Enhanced Placeholder**: Shows multiple examples in the textarea

#### Function Parameter
The function receives one parameter:
- `element`: The DOM element of the comment that you can style

#### Available Examples

**For Visible Comments:**
- **Subtle**: Green border with light background
- **Badge**: Adds a "VISIBLE" badge to the comment header
- **Glow**: Subtle glow effect with green border

**For Shadowbanned Comments:**
- **Highlight**: Red background with dimmed appearance
- **Badge**: Adds a "SHADOWBANNED" warning badge
- **Strikethrough**: Strikethrough text with red styling

#### Writing Custom Functions

**Basic styling example:**
```javascript
// Simple border and background
element.style.borderLeft = '3px solid #4caf50';
element.style.backgroundColor = '#1a2a1a';
element.style.paddingLeft = '8px';
```

**Adding custom badges:**
```javascript
// Create and add a custom badge
const badge = document.createElement('span');
badge.textContent = 'CUSTOM';
badge.style.cssText = `
  background: #4caf50;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  margin-right: 8px;
`;
const header = element.querySelector('.ui-comment-header');
if (header) {
  header.insertBefore(badge, header.firstChild);
}
```

**Advanced styling:**
```javascript
// Complex styling with animations
element.style.borderLeft = '4px solid #ff6b6b';
element.style.backgroundColor = '#2a1a1a';
element.style.opacity = '0.7';
element.style.paddingLeft = '8px';
element.style.transition = 'all 0.3s ease';
element.style.borderRadius = '0 4px 4px 0';
```

#### Safety Features
- Functions execute in a sandboxed environment
- Syntax errors are caught and logged to console
- Invalid functions won't break the extension
- Functions are validated before execution

## Installation

### For Users

#### Chrome/Edge/Brave
1. Download the latest release from [GitHub Releases](https://github.com/shadowgagdev/shadowgag/releases)
2. Extract the `shadowgag-chrome-v*.zip` file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the extracted `chrome` directory

#### Firefox
1. Download the latest release from [GitHub Releases](https://github.com/shadowgagdev/shadowgag/releases)
2. Extract the `shadowgag-firefox-v*.zip` file
3. Open Firefox and go to `about:debugging`
4. Click "This Firefox" → "Load Temporary Add-on"
5. Navigate to the extracted `firefox` directory and select `manifest.json`

### For Developers

#### Prerequisites
- Node.js 14+ (for build scripts)
- Git

#### Setup
```bash
git clone https://github.com/shadowgagdev/shadowgag.git
cd shadowgag
npm install  # (optional, no dependencies currently)
```

#### Building
```bash
# Build both Chrome and Firefox versions
npm run build

# Build only Chrome version
npm run build:chrome

# Build only Firefox version
npm run build:firefox

# Build and create distribution packages
npm run build:package

# Build with verbose output
npm run build:verbose
```

#### Testing Your Build
- **Chrome**: Open `chrome://extensions/`, enable Developer mode, click "Load unpacked", select `chrome/` directory
- **Firefox**: Open `about:debugging`, click "This Firefox" → "Load Temporary Add-on", select `firefox/manifest.json`

## Directory Structure

```
ShadowGag/
├── chrome/              # Chrome extension (Manifest V3)
│   ├── manifest.json    # Chrome-specific manifest
│   ├── background-chrome.js # Chrome-specific background script
│   └── [copied shared files during build]
├── firefox/             # Firefox extension (Manifest V2)
│   ├── manifest.json    # Firefox-specific manifest
│   ├── background-firefox.js # Firefox-specific background script
│   └── [copied shared files during build]
├── background.js        # Shared background script functionality
├── content.js           # Shared content script
├── popup.html           # Shared popup interface
├── popup.js             # Shared popup logic
├── styles.css           # Shared styles
├── icons/               # Shared icons
└── [other shared files]
```

The `chrome` and `firefox` directories contain browser-specific files (manifests and background scripts). During the build process, shared files are copied from the root directory to each browser directory, as browser extensions cannot reference files outside their own directory. This maintains clean separation while ensuring the extensions work correctly.

## Configuration

Click the ShadowGag icon in your browser toolbar to open the configuration popup:

1. **Extension Enabled**: Toggle the extension on/off
2. **Visible Comments Marking**: Choose how to mark comments that are visible to others
3. **Shadowbanned Comments Marking**: Choose how to mark shadowbanned comments
4. **Custom Functions**: Write JavaScript code for custom styling

Settings are saved automatically and applied immediately to all open 9gag tabs.

## Privacy & Security

- **No Data Collection**: The extension doesn't collect or transmit any personal data
- **Username Detection Only**: The extension only reads your 9gag username from the page to identify your comments - no other personal data is accessed, stored, or transmitted
- **No Data Storage**: The extension does not store any user data, comments, or personal information (except your local extension settings)
- **No Data Transmission**: Your username and any other data stays entirely within your browser - nothing is sent to external servers
- **Local Processing**: All analysis happens locally in your browser
- **API Calls**: Only makes requests to 9gag's public comment API using standard web requests
- **Custom Functions**: Execute in a sandboxed environment for safety
- **No Tracking**: The extension does not track user behavior, collect analytics, or monitor usage patterns

## Technical Details

- **Manifest V2**: Compatible with both Firefox and Chrome
- **Content Script**: Runs only on 9gag post pages
- **Background Script**: Manages settings and cross-tab communication
- **Storage API**: Saves settings locally in your browser

## Troubleshooting

### Extension Not Working
- Ensure you're logged into 9gag
- Check that you're on a 9gag post page (URL contains `/gag/`)
- Try refreshing the page
- Check browser console for error messages

### Custom Functions Not Working
- Verify JavaScript syntax
- Check browser console for error messages
- Ensure the function doesn't break page layout
- Test with simple styling first

### Comments Not Being Detected
- Wait a few seconds for API calls to complete
- Try scrolling to load more comments
- Check if 9gag has updated their API (extension may need updates)

## Limitations

- Only works on 9gag post pages
- Requires being logged in to 9gag
- May not detect all shadowbanned comments immediately
- API rate limiting may affect performance with many comments

## Contributing

This extension is open source. Feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests
- Improve documentation

## Support Development

Want to buy me a beer? I won't complain...

https://ko-fi.com/shadowgag

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Legal Disclaimer

**IMPORTANT: READ BEFORE USING THIS EXTENSION**

### Not Official 9gag Software
- This extension is **NOT** an official 9gag product or service
- This extension is **NOT** affiliated with, endorsed by, or connected to 9gag in any way
- 9gag has not authorized, sponsored, or approved this extension

### Use at Your Own Risk
- You use this extension entirely **AT YOUR OWN RISK**
- The developer(s) of this extension are **NOT RESPONSIBLE** for any consequences arising from its use, including but not limited to:
  - Account suspension or termination
  - Loss of data or content
  - Violation of 9gag's terms of service
  - Any technical issues or damages
  - Legal consequences

### Third-Party API Usage
- This extension accesses 9gag's public APIs to function
- The extension does not modify, store, or redistribute 9gag's content
- API usage may be subject to rate limiting or changes by 9gag
- 9gag may block or restrict API access at any time without notice

### Intellectual Property
- All 9gag content, trademarks, logos, and intellectual property remain the **exclusive property of 9gag**
- This extension does not claim any ownership over 9gag's content or services
- Users must respect 9gag's intellectual property rights and terms of service

### Terms of Service Compliance
- Users are solely responsible for ensuring their use complies with 9gag's Terms of Service
- Users must comply with all applicable laws and regulations
- The extension developer is not responsible for monitoring or enforcing compliance

### No Warranty
- This extension is provided "AS IS" without any warranties of any kind
- No guarantee is made regarding functionality, accuracy, or reliability
- The extension may stop working at any time due to changes in 9gag's systems

### Privacy and Data
- While this extension processes data locally, users should review 9gag's privacy policy
- Users are responsible for understanding how their data is handled when using 9gag's services

### Limitation of Liability
- In no event shall the extension developer(s) be liable for any direct, indirect, incidental, special, or consequential damages
- This includes damages for loss of profits, data, or other intangible losses

**BY USING THIS EXTENSION, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO THIS DISCLAIMER.** 