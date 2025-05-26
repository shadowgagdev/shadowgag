# Security Policy

## Supported Versions

We actively support the following versions of ShadowGag:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in ShadowGag, please report it responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. **Email us directly** at: [security@shadowgag.example.com] (replace with actual email)
3. **Include the following information**:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if you have one)

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt of your report within 48 hours
- **Investigation**: We'll investigate and validate the vulnerability
- **Timeline**: We aim to provide an initial response within 5 business days
- **Resolution**: Critical vulnerabilities will be addressed within 30 days
- **Credit**: We'll credit you in our security advisories (unless you prefer to remain anonymous)

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
4. **Report suspicious behavior** immediately
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

## Responsible Disclosure

We believe in responsible disclosure and will:
- Work with security researchers to understand and fix vulnerabilities
- Provide credit to researchers who report issues responsibly
- Maintain transparency about security issues and fixes
- Release security updates promptly

## Contact

For security-related questions or concerns:
- Email: [security@shadowgag.example.com] (replace with actual email)
- GitHub: Create a private security advisory

Thank you for helping keep ShadowGag secure! 