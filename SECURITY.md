# Security Policy

## Supported Versions

We actively support the following versions of ShadowGag:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Considerations

### Data Privacy
- ShadowGag processes data locally in your browser
- No personal data is transmitted to external servers
- Only makes requests to 9gag's public API
- Settings are stored locally using browser storage APIs

### Permissions
The extension requests minimal permissions:
- `storage` - To save user preferences
- `*://*.9gag.com/*` - To access 9gag pages
- `*://comment-cdn.9gag.com/*` - To access 9gag's comment API

### Custom Functions
- Custom JavaScript functions run in a sandboxed environment
- Functions are validated before execution
- Syntax errors are caught and logged
- Functions cannot access sensitive browser APIs

### Content Security Policy
- The extension follows browser security best practices
- No inline scripts or eval() usage
- Proper content security policies in place

## Best Practices for Users

1. **Download from official sources** only (GitHub releases, official browser stores)
2. **Keep the extension updated** to the latest version
3. **Review custom functions** before using them
4. **Report suspicious behavior** via GitHub issues
5. **Use strong passwords** for your 9gag account

## Security Features

- **Input validation** for all user inputs
- **Error handling** to prevent information leakage
- **Minimal permissions** requested
- **Local data processing** only
- **No external dependencies** in production code

## Known Security Considerations

1. **9gag API Changes**: If 9gag changes their API, the extension may need updates
2. **Custom Functions**: User-provided JavaScript code runs with page privileges
3. **Browser Compatibility**: Security features may vary between browsers

## Contact

For security-related questions or concerns:
- **GitHub Issues**: https://github.com/shadowgagdev/shadowgag/issues
- **Email**: shadowgag.dev@proton.me

Thank you for helping keep ShadowGag secure! 