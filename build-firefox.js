#!/usr/bin/env node

/**
 * Build script for Firefox extension (Manifest V2)
 * Copies shared files to firefox directory since extensions can't reference external files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building Firefox extension...');

// Ensure firefox directory exists
const firefoxDir = path.join(__dirname, 'firefox');
if (!fs.existsSync(firefoxDir)) {
  fs.mkdirSync(firefoxDir, { recursive: true });
}

// Files to copy from root to firefox directory
const filesToCopy = [
  'background.js',
  'content.js',
  'popup.html',
  'popup.js',
  'styles.css'
];

// Copy shared files
filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(firefoxDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file}`);
  } else {
    console.warn(`Warning: ${file} not found in root directory`);
  }
});

// Copy icons directory
const iconsDir = path.join(__dirname, 'icons');
const firefoxIconsDir = path.join(firefoxDir, 'icons');

if (fs.existsSync(iconsDir)) {
  // Remove existing icons directory in firefox folder
  if (fs.existsSync(firefoxIconsDir)) {
    fs.rmSync(firefoxIconsDir, { recursive: true, force: true });
  }
  
  // Copy icons directory
  fs.cpSync(iconsDir, firefoxIconsDir, { recursive: true });
  console.log('Copied icons directory');
} else {
  console.warn('Warning: icons directory not found');
}

// Verify Firefox manifest exists and is valid
const firefoxManifest = path.join(firefoxDir, 'manifest.json');
if (!fs.existsSync(firefoxManifest)) {
  console.error('Error: Firefox manifest.json not found');
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(firefoxManifest, 'utf8'));
} catch (error) {
  console.error('Error: Invalid Firefox manifest.json:', error.message);
  process.exit(1);
}

// Verify it's Manifest V2
if (manifest.manifest_version !== 2) {
  console.error('Error: Firefox manifest must be version 2');
  process.exit(1);
}

// Verify required fields
const requiredFields = ['name', 'version', 'description'];
const missingFields = requiredFields.filter(field => !manifest[field]);

if (missingFields.length > 0) {
  console.error(`Error: Firefox manifest missing required fields: ${missingFields.join(', ')}`);
  process.exit(1);
}

// Check for Firefox-specific fields
if (!manifest.browser_action && !manifest.page_action) {
  console.warn('Warning: Firefox manifest should have browser_action or page_action');
}

console.log('Firefox manifest validated');
console.log(`   Name: ${manifest.name}`);
console.log(`   Version: ${manifest.version}`);
console.log(`   Manifest Version: ${manifest.manifest_version}`);

// Verify Firefox-specific background script exists
const firefoxBackground = path.join(firefoxDir, 'background-firefox.js');
if (!fs.existsSync(firefoxBackground)) {
  console.error('Error: background-firefox.js not found in firefox directory');
  process.exit(1);
}

// Create ZIP file for Firefox submission
function createFirefoxZip() {
  const zipName = `shadowgag-firefox-v${manifest.version}.zip`;
  const zipPath = path.join(__dirname, zipName);
  
  // Remove existing zip if it exists
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  
  try {
    // Use different zip commands based on platform
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // On Windows, use PowerShell to create zip with proper forward slashes
      const powershellCmd = `
        $firefoxDir = "${firefoxDir.replace(/\\/g, '\\\\')}"
        $zipPath = "${zipPath.replace(/\\/g, '\\\\')}"
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::CreateFromDirectory($firefoxDir, $zipPath)
      `.trim();
      
      execSync(`powershell -Command "${powershellCmd}"`, { stdio: 'inherit' });
    } else {
      // On Unix-like systems, use zip command
      execSync(`cd "${firefoxDir}" && zip -r "../${zipName}" .`, { stdio: 'inherit' });
    }
    
    console.log(`Created Firefox ZIP: ${zipName}`);
    console.log(`Location: ${zipPath}`);
    
    // Verify the ZIP was created
    if (fs.existsSync(zipPath)) {
      const stats = fs.statSync(zipPath);
      console.log(`ZIP size: ${(stats.size / 1024).toFixed(1)} KB`);
    }
    
  } catch (error) {
    console.error('Error creating ZIP file:', error.message);
    console.log('You can manually create the ZIP file from the firefox/ directory');
  }
}

// Create/update README for the Firefox build
const firefoxReadme = `# ShadowGag - Firefox Extension

This directory contains the Firefox extension build (Manifest V2).

## Installation

### Temporary Installation (Development)
1. Open Firefox and navigate to \`about:debugging\`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on"
4. Select the \`manifest.json\` file from this directory

### Permanent Installation (Signed)
For permanent installation, the extension needs to be signed by Mozilla.
See: https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/

## Files

- \`manifest.json\` - Firefox extension manifest (V2)
- \`background-firefox.js\` - Firefox-specific background script
- \`background.js\` - Shared background functionality (copied from root)
- \`content.js\` - Content script for 9gag pages (copied from root)
- \`popup.html\` - Extension popup interface (copied from root)
- \`popup.js\` - Popup functionality (copied from root)
- \`styles.css\` - Extension styles (copied from root)
- \`icons/\` - Extension icons (copied from root)

## Development

This build is automatically generated from the root directory.
Make changes in the root files, then run \`npm run build:firefox\` to update this build.
Only \`manifest.json\` and \`background-firefox.js\` are Firefox-specific.

## Web-ext CLI

For advanced development, you can use the web-ext CLI tool:

\`\`\`bash
# Install web-ext globally
npm install -g web-ext

# Run in Firefox (from this directory)
web-ext run

# Build a .zip file for distribution
web-ext build

# Lint the extension
web-ext lint
\`\`\`
`;

fs.writeFileSync(path.join(firefoxDir, 'README.md'), firefoxReadme);
console.log('Updated Firefox README.md');

// Check if web-ext is available and suggest installation
try {
  require.resolve('web-ext');
  console.log('web-ext is available for advanced Firefox development');
} catch (error) {
  console.log('Tip: Install web-ext for advanced Firefox development: npm install -g web-ext');
}

console.log('Firefox extension build completed successfully!');
console.log(`Build location: ${firefoxDir}`);

// Create ZIP file
createFirefoxZip();

console.log('To install: Open about:debugging, click "This Firefox", then "Load Temporary Add-on"'); 