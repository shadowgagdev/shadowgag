# Firefox Extension Signing Setup

This guide explains how to set up automatic signing for Firefox extensions using Mozilla's Add-ons (AMO) API.

## Why Sign Extensions?

- **Regular users** can install signed `.xpi` files permanently (no developer mode needed)
- **Automatic updates** work with signed extensions
- **Better user experience** - one-click installation

## Getting AMO API Credentials

1. **Create AMO Account**
   - Go to https://addons.mozilla.org/developers/
   - Sign in or create an account

2. **Get API Credentials**
   - Visit https://addons.mozilla.org/en-US/developers/addon/api/key/
   - Click "Generate new credentials"
   - Copy the **JWT issuer** (looks like `user:12345:67`)
   - Copy the **JWT secret** (long string like `634f34bee43611d2f3c0fd8c...`)

## Setting Up GitHub Secrets

1. **Go to your GitHub repository**
2. **Navigate to Settings → Secrets and variables → Actions**
3. **Add these repository secrets:**
   - `AMO_JWT_ISSUER`: Paste your JWT issuer
   - `AMO_JWT_SECRET`: Paste your JWT secret

## How It Works

Once set up, every time you create a release tag:

1. GitHub Actions builds your extension
2. Creates unsigned ZIP files (for developers)
3. **Automatically signs the Firefox extension** using your AMO credentials
4. Creates a signed `.xpi` file that regular users can install
5. Uploads both versions to the GitHub release

## Manual Signing (Alternative)

If you prefer to sign manually:

1. Install web-ext: `npm install -g web-ext`
2. Sign your extension:
   ```bash
   web-ext sign --channel=unlisted --api-key=YOUR_JWT_ISSUER --api-secret=YOUR_JWT_SECRET --source-dir=firefox
   ```

## User Installation

Regular Firefox users can now:
1. Download the `.xpi` file from your GitHub releases
2. Open Firefox → `about:addons`
3. Click gear icon → "Install Add-on From File"
4. Select the `.xpi` file
5. Extension installs permanently!

## Notes

- Signing is **free** and doesn't require store approval
- Signed extensions work on all Firefox versions
- The extension gets the same permissions as store-distributed extensions
- Users don't need developer mode or technical knowledge 