# Contributing to ShadowGag

Thank you for your interest in contributing to ShadowGag! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/shadowgagdev/shadowgag.git
   cd shadowgag
   ```
3. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites
- Node.js 14+ (for build scripts)
- Chrome or Firefox browser for testing

### Project Structure
```
ShadowGag/
├── chrome/              # Chrome extension (Manifest V3)
├── firefox/             # Firefox extension (Manifest V2)
├── background-shared.js # Shared background script
├── content.js           # Shared content script
├── popup.html           # Shared popup interface
├── popup.js             # Shared popup logic
├── styles.css           # Shared styles
└── icons/               # Shared icons
```

### Testing Your Changes

#### Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `chrome` directory

#### Firefox
1. Open `about:debugging`
2. Click "This Firefox" → "Load Temporary Add-on"
3. Select `manifest.json` from the `firefox` directory

## Code Style Guidelines

### JavaScript
- Use modern ES6+ syntax
- Use `const` and `let` instead of `var`
- Use async/await for asynchronous operations
- Add meaningful comments for complex logic
- Use descriptive variable and function names

### CSS
- Use consistent indentation (2 spaces)
- Group related properties together
- Use meaningful class names with `shadowgag-` prefix
- Support dark mode and accessibility features

### HTML
- Use semantic HTML elements
- Ensure accessibility with proper ARIA labels
- Keep markup clean and well-structured

## Debugging

### Enable Debug Mode
Set `DEBUG_MODE = true` in the relevant script files:
- `content.js` - for content script debugging
- `background-shared.js` - for background script debugging
- `popup.js` - for popup debugging

### Common Issues
- **Extension not loading**: Check browser console for errors
- **API calls failing**: Verify 9gag hasn't changed their API
- **Comments not detected**: Check if user is logged in to 9gag

## Submitting Changes

### Before Submitting
1. **Test thoroughly** on both Chrome and Firefox
2. **Check console** for any errors or warnings
3. **Verify** the extension works on different 9gag posts
4. **Update documentation** if needed

### Pull Request Process
1. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "Add feature: description of what you added"
   ```
2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
3. **Create a Pull Request** on GitHub with:
   - Clear title and description
   - Screenshots/GIFs if UI changes
   - Testing instructions
   - Reference to any related issues

### Pull Request Guidelines
- Keep changes focused and atomic
- Include tests if applicable
- Update documentation for new features
- Ensure backward compatibility
- Follow the existing code style

## Reporting Issues

### Bug Reports
Include:
- Browser and version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshots (if applicable)

### Feature Requests
Include:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Mockups or examples (if applicable)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a positive environment

## Questions?

- Open an issue for general questions
- Check existing issues before creating new ones
- Be patient and respectful when asking for help

## License

By contributing to ShadowGag, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 