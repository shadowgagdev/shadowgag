# ShadowGag - Firefox Extension

This directory contains the Firefox-compatible version of the ShadowGag extension (Manifest V2).

## Installation

### Temporary Installation (for development)
1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to this `firefox` directory and select `manifest.json`
5. The extension should now be installed and active

### Permanent Installation
1. Package the extension as a .xpi file
2. Install through Firefox Add-ons manager

## Files

- `manifest.json` - Firefox Manifest V2 configuration
- `background.js` - Hard link to shared background script (`../background-shared.js`)
- Other files are hard links to shared resources in the parent directory

## Features

- Uses Manifest V2 with background scripts
- Compatible with Firefox's extension architecture
- Shares common code with Chrome version through symbolic links

## Development

When making changes to shared files (content.js, popup.js, popup.html, styles.css), edit them in the parent directory. The changes will automatically be reflected in both Chrome and Firefox versions through hard links.

For Firefox-specific changes, edit the files directly in this directory:
- `manifest.json` - Firefox-specific manifest configuration

The background script is now shared between browsers using a browser adapter pattern. Edit `../background-shared.js` to modify background functionality for both Chrome and Firefox.

## Troubleshooting

If you get an error about "background.service_worker is currently disabled", make sure you're loading the Firefox version (this directory) and not the Chrome version. 