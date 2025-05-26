#!/usr/bin/env node

/**
 * Main build script for ShadowGag browser extension
 * Builds both Chrome and Firefox versions and optionally creates distribution packages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldPackage = args.includes('--package') || args.includes('-p');
const chromeOnly = args.includes('--chrome');
const firefoxOnly = args.includes('--firefox');
const verbose = args.includes('--verbose') || args.includes('-v');

console.log('ShadowGag Extension Build Script');
console.log('====================================');

// Helper function for verbose logging
const log = (message) => {
  if (verbose) {
    console.log(message);
  }
};

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 14) {
  console.error('Error: Node.js 14 or higher is required');
  console.error(`   Current version: ${nodeVersion}`);
  process.exit(1);
}

log(`Node.js version: ${nodeVersion}`);

// Verify required files exist
const requiredFiles = [
  'background.js',
  'chrome/background-chrome.js',
  'firefox/background-firefox.js',
  'content.js',
  'popup.html',
  'popup.js',
  'styles.css',
  'package.json'
];

console.log('Checking required files...');
const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(__dirname, file)));

if (missingFiles.length > 0) {
  console.error('Error: Missing required files:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

console.log('All required files found');

// Build Chrome extension
if (!firefoxOnly) {
  console.log('\nBuilding Chrome extension...');
  try {
    execSync('node build-chrome.js', { stdio: verbose ? 'inherit' : 'pipe' });
    console.log('Chrome build completed');
  } catch (error) {
    console.error('Chrome build failed:', error.message);
    process.exit(1);
  }
}

// Build Firefox extension
if (!chromeOnly) {
  console.log('\nBuilding Firefox extension...');
  try {
    execSync('node build-firefox.js', { stdio: verbose ? 'inherit' : 'pipe' });
    console.log('Firefox build completed');
  } catch (error) {
    console.error('Firefox build failed:', error.message);
    process.exit(1);
  }
}

// Create distribution packages if requested
if (shouldPackage) {
  console.log('\nCreating distribution packages...');
  
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Get version from package.json
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const version = packageJson.version;
  
  // Create Chrome package
  if (!firefoxOnly && fs.existsSync(path.join(__dirname, 'chrome'))) {
    try {
      const chromeZip = path.join(distDir, `shadowgag-chrome-v${version}.zip`);
      
      // Use different zip commands based on OS
      const isWindows = process.platform === 'win32';
      
      if (isWindows) {
        // Windows: Use PowerShell Compress-Archive
        const powershellCmd = `Compress-Archive -Path "chrome/*" -DestinationPath "${chromeZip}" -Force`;
        execSync(`powershell -Command "${powershellCmd}"`, { cwd: __dirname });
      } else {
        // Unix/Linux/macOS: Use zip command
        execSync(`zip -r "${chromeZip}" chrome/`, { cwd: __dirname });
      }
      
      console.log(`Chrome package created: ${chromeZip}`);
    } catch (error) {
      console.warn('Warning: Could not create Chrome package:', error.message);
      console.warn('   You may need to install zip utility or use manual packaging');
    }
  }
  
  // Create Firefox package
  if (!chromeOnly && fs.existsSync(path.join(__dirname, 'firefox'))) {
    try {
      const firefoxZip = path.join(distDir, `shadowgag-firefox-v${version}.zip`);
      
      // Use different zip commands based on OS
      const isWindows = process.platform === 'win32';
      
      if (isWindows) {
        // Windows: Use PowerShell Compress-Archive
        const powershellCmd = `Compress-Archive -Path "firefox/*" -DestinationPath "${firefoxZip}" -Force`;
        execSync(`powershell -Command "${powershellCmd}"`, { cwd: __dirname });
      } else {
        // Unix/Linux/macOS: Use zip command
        execSync(`zip -r "${firefoxZip}" firefox/`, { cwd: __dirname });
      }
      
      console.log(`Firefox package created: ${firefoxZip}`);
    } catch (error) {
      console.warn('Warning: Could not create Firefox package:', error.message);
      console.warn('   You may need to install zip utility or use manual packaging');
    }
  }
  
  // Create source package
  try {
    const sourceZip = path.join(distDir, `shadowgag-source-v${version}.zip`);
    const sourceFiles = [
      'background.js',
      'chrome/background-chrome.js',
      'firefox/background-firefox.js',
      'content.js',
      'popup.html',
      'popup.js',
      'styles.css',
      'package.json',
      'README.md',
      'LICENSE',
      'CONTRIBUTING.md',
      'SECURITY.md',
      '.gitignore',
      'build.js',
      'build-chrome.js',
      'build-firefox.js',
      'icons/',
      'chrome/manifest.json',
      'firefox/manifest.json'
    ];
    
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // Windows: Create a temporary list of files and use PowerShell
      const fileList = sourceFiles.filter(file => fs.existsSync(path.join(__dirname, file))).join('", "');
      const powershellCmd = `Compress-Archive -Path "${fileList}" -DestinationPath "${sourceZip}" -Force`;
      execSync(`powershell -Command "${powershellCmd}"`, { cwd: __dirname });
    } else {
      // Unix/Linux/macOS: Use zip command with file list
      const existingFiles = sourceFiles.filter(file => fs.existsSync(path.join(__dirname, file)));
      execSync(`zip -r "${sourceZip}" ${existingFiles.join(' ')}`, { cwd: __dirname });
    }
    
    console.log(`Source package created: ${sourceZip}`);
  } catch (error) {
    console.warn('Warning: Could not create source package:', error.message);
  }
}

// Display build summary
console.log('\nBuild Summary');
console.log('================');

if (!firefoxOnly) {
  const chromeDir = path.join(__dirname, 'chrome');
  if (fs.existsSync(chromeDir)) {
    const chromeFiles = fs.readdirSync(chromeDir).filter(f => !f.startsWith('.')).length;
    console.log(`Chrome extension: ${chromeFiles} files in chrome/`);
  }
}

if (!chromeOnly) {
  const firefoxDir = path.join(__dirname, 'firefox');
  if (fs.existsSync(firefoxDir)) {
    const firefoxFiles = fs.readdirSync(firefoxDir).filter(f => !f.startsWith('.')).length;
    console.log(`Firefox extension: ${firefoxFiles} files in firefox/`);
  }
}

if (shouldPackage) {
  const distDir = path.join(__dirname, 'dist');
  if (fs.existsSync(distDir)) {
    const packages = fs.readdirSync(distDir).filter(file => file.endsWith('.zip'));
    console.log(`Distribution packages: ${packages.length} files in dist/`);
    packages.forEach(pkg => console.log(`   - ${pkg}`));
  }
}

console.log('\nNext steps:');
if (!firefoxOnly) {
  console.log('   Chrome: Open chrome://extensions/, enable Developer mode, click "Load unpacked", select chrome/');
}
if (!chromeOnly) {
  console.log('   Firefox: Open about:debugging, click "This Firefox", click "Load Temporary Add-on", select firefox/manifest.json');
}

if (shouldPackage) {
  console.log('   Distribution: Upload packages from dist/ directory to browser stores');
}

console.log('\nBuild completed successfully!'); 