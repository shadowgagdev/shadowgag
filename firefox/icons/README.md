# ShadowGag Extension Icons

This directory contains the extension icons for the ShadowGag browser extension.

## Icon Design Concept

The ShadowGag icon uses an **eye theme** that perfectly represents the extension's purpose:

- **Eye Symbol**: Represents "watching" and detecting shadowbans
- **Green Color**: Indicates active detection and positive functionality
- **Clean Design**: Modern, scalable design that works at all sizes
- **9gag Spirit**: Playful yet functional, matching 9gag's aesthetic

### Design Elements

- **Background**: Green circle (#4CAF50) with darker green border (#2E7D32)
- **Eye Shape**: White ellipse with dark green pupil
- **Highlight**: Small white circle for depth and life
- **Active Indicator**: Small green dot (on 32px+ sizes) showing extension is working

## Required Files

- `icon16.png` - 16x16 pixels (browser toolbar)
- `icon32.png` - 32x32 pixels (extension management)
- `icon48.png` - 48x48 pixels (extension management)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Generating PNG Icons

### Method 1: Using the HTML Converter (Recommended)

1. Open `svg_to_png_converter.html` in your browser
2. Click "Download All PNGs" to get all sizes at once
3. Save the downloaded files to this `icons/` folder
4. Replace the existing empty PNG files

### Method 2: Manual Conversion

If you have an SVG to PNG converter tool:

1. Use the SVG files: `icon16.svg`, `icon32.svg`, `icon48.svg`, `icon128.svg`
2. Convert each to PNG format
3. Ensure transparent background is preserved
4. Save with the correct filenames

## Icon Specifications

- **Format**: PNG with transparency
- **Background**: Transparent (works on light and dark browser themes)
- **Scalability**: Optimized for readability at 16x16 pixels
- **Consistency**: All sizes use the same eye theme design
- **Colors**: 9gag-friendly green palette that's professional yet playful

## Design Philosophy

The eye icon communicates the extension's core function immediately:
- **Visibility**: "I can see what others can't"
- **Detection**: "I'm watching for shadowbans"
- **Awareness**: "I help you understand comment visibility"

This aligns perfectly with 9gag's community-focused, transparency-loving culture while maintaining a professional appearance suitable for a browser extension.

## Temporary Solution

Until proper icons are created, browsers will use default extension icons. The extension will still function normally without custom icons.

## Icon Requirements

- **Format**: PNG with transparency
- **Background**: Should work on both light and dark browser themes
- **Scalability**: Should be readable at 16x16 pixels
- **Consistency**: All sizes should use the same design theme 