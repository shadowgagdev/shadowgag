# ShadowGag - Chrome Extension

This directory contains the Chrome-compatible version of the ShadowGag extension (Manifest V3).

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this `chrome` directory
4. The extension should now be installed and active

## Files

- `manifest.json` - Chrome Manifest V3 configuration
- `background.js` - Hard link to shared background script (`../background-shared.js`)
- Other files are hard links to shared resources in the parent directory

## Features

- Uses Manifest V3 with service workers
- Compatible with Chrome's latest extension architecture
- Shares common code with Firefox version through symbolic links

## Development

When making changes to shared files (content.js, popup.js, popup.html, styles.css), edit them in the parent directory. The changes will automatically be reflected in both Chrome and Firefox versions through hard links.

For Chrome-specific changes, edit the files directly in this directory:
- `manifest.json` - Chrome-specific manifest configuration

The background script is now shared between browsers using a browser adapter pattern. Edit `../background-shared.js` to modify background functionality for both Chrome and Firefox. 