#!/usr/bin/env node

/**
 * Build script for Chrome extension (Manifest V3)
 * Copies shared files to chrome directory since extensions can't reference external files
 */

const fs = require('fs');
const path = require('path');

console.log('Building Chrome extension...');

// Ensure chrome directory exists
const chromeDir = path.join(__dirname, 'chrome');
if (!fs.existsSync(chromeDir)) {
  fs.mkdirSync(chromeDir, { recursive: true });
}

// Files to copy from root to chrome directory
// Note: background.js is not copied for Chrome as background-chrome.js is self-contained
const filesToCopy = [
  'content.js',
  'popup.html',
  'popup.js',
  'styles.css'
];

// Copy shared files
filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(chromeDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file}`);
  } else {
    console.warn(`Warning: ${file} not found in root directory`);
  }
});

// Copy icons directory
const iconsDir = path.join(__dirname, 'icons');
const chromeIconsDir = path.join(chromeDir, 'icons');

if (fs.existsSync(iconsDir)) {
  // Remove existing icons directory in chrome folder
  if (fs.existsSync(chromeIconsDir)) {
    fs.rmSync(chromeIconsDir, { recursive: true, force: true });
  }
  
  // Copy icons directory
  fs.cpSync(iconsDir, chromeIconsDir, { recursive: true });
  console.log('Copied icons directory');
} else {
  console.warn('Warning: icons directory not found');
}

// Verify Chrome manifest exists and is valid
const chromeManifest = path.join(chromeDir, 'manifest.json');
if (!fs.existsSync(chromeManifest)) {
  console.error('Error: Chrome manifest.json not found');
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(chromeManifest, 'utf8'));
} catch (error) {
  console.error('Error: Invalid Chrome manifest.json:', error.message);
  process.exit(1);
}

// Verify it's Manifest V3
if (manifest.manifest_version !== 3) {
  console.error('Error: Chrome manifest must be version 3');
  process.exit(1);
}

// Verify required fields
const requiredFields = ['name', 'version', 'description'];
const missingFields = requiredFields.filter(field => !manifest[field]);

if (missingFields.length > 0) {
  console.error(`Error: Chrome manifest missing required fields: ${missingFields.join(', ')}`);
  process.exit(1);
}

console.log('Chrome manifest validated');
console.log(`   Name: ${manifest.name}`);
console.log(`   Version: ${manifest.version}`);
console.log(`   Manifest Version: ${manifest.manifest_version}`);

// Verify Chrome-specific background script exists
const chromeBackground = path.join(chromeDir, 'background-chrome.js');
if (!fs.existsSync(chromeBackground)) {
  console.error('Error: background-chrome.js not found in chrome directory');
  process.exit(1);
}

// Create/update README for the Chrome build
const chromeReadme = `# ShadowGag - Chrome Extension

This directory contains the Chrome extension build (Manifest V3).

## Installation

1. Open Chrome and go to \`chrome://extensions/\`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this directory

## Files

- \`manifest.json\` - Chrome extension manifest (V3)
- \`background-chrome.js\` - Chrome-specific service worker (self-contained, includes all functionality)
- \`content.js\` - Content script for 9gag pages (copied from root)
- \`popup.html\` - Extension popup interface (copied from root)
- \`popup.js\` - Popup functionality (copied from root)
- \`styles.css\` - Extension styles (copied from root)
- \`icons/\` - Extension icons (copied from root)

## Development

This build is automatically generated from the root directory.
Make changes in the root files, then run \`npm run build:chrome\` to update this build.
Only \`manifest.json\` and \`background-chrome.js\` are Chrome-specific.
`;

fs.writeFileSync(path.join(chromeDir, 'README.md'), chromeReadme);
console.log('Updated Chrome README.md');

console.log('Chrome extension build completed successfully!');
console.log(`Build location: ${chromeDir}`);
console.log('To install: Open chrome://extensions/, enable Developer mode, and click "Load unpacked"'); 