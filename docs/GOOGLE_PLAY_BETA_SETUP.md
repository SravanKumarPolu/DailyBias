# Google Play Beta Testing Automation Guide

This guide explains how to set up automated Google Play Beta testing and deployment for the DailyBias Android app.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [GitHub Secrets Configuration](#github-secrets-configuration)
5. [Workflow Usage](#workflow-usage)
6. [Testing Locally](#testing-locally)
7. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The automation system includes:

- **Automated Android Builds**: Builds APK and AAB files on every push
- **Quality Checks**: Runs lint, unit tests, and mobile emulation tests
- **Google Play Beta Deployment**: Automatically deploys to Google Play Beta track
- **Version Management**: Automatically increments version codes

## 📦 Prerequisites

### Required Tools

1. **Android SDK** (for local builds)
   - Android Studio or Android SDK Command Line Tools
   - Java 21 (Temurin)

2. **Google Play Console Access**
   - Google Play Developer account
   - App created in Google Play Console
   - Service account with API access

3. **Keystore for Signing**
   - Release signing keystore file
   - Keystore password, key alias, and key password

### Google Play Console Setup

1. **Create Service Account**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Google Play Android Developer API"
   - Create a service account
   - Download JSON key file
   - Grant service account access in Google Play Console:
     - Go to Settings → API access
     - Link service account
     - Grant "Release to testing tracks" permission

2. **Create App in Play Console**
   - Create app with package name: `com.debiasdaily.app`
   - Set up app store listing (required for first release)
   - Create at least one release track (internal, alpha, or beta)

## 🔧 Initial Setup

### 1. Generate Signing Keystore

If you don't have a keystore yet:

```bash
keytool -genkey -v -keystore android-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias release \
  -storepass <your-keystore-password> \
  -keypass <your-key-password>
```

**Important**: Store the keystore file securely and back it up. If lost, you cannot update your app.

### 2. Encode Keystore for GitHub Secrets

```bash
# Encode keystore to base64
base64 -i android-release-key.jks | pbcopy  # macOS
# or
base64 android-release-key.jks | pbcopy     # Linux
```

### 3. Prepare Release Notes

Create release notes in `android/release-notes/en-US.txt`:

```
What's new in this release:
- Bug fixes and performance improvements
- Enhanced stability and reliability
```

## 🔐 GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

### Required Secrets

1. **ANDROID_KEYSTORE_BASE64**
   - Value: Base64-encoded keystore file content
   - How to get: `base64 android-release-key.jks`

2. **ANDROID_KEYSTORE_PASSWORD**
   - Value: Keystore password
   - Example: `mySecurePassword123`

3. **ANDROID_KEY_ALIAS**
   - Value: Key alias name
   - Example: `release`

4. **ANDROID_KEY_PASSWORD**
   - Value: Key password (can be same as keystore password)
   - Example: `mySecurePassword123`

5. **GOOGLE_PLAY_SERVICE_ACCOUNT_JSON**
   - Value: Full JSON content of service account key file
   - How to get: Copy entire contents of `service-account-key.json`

### Adding Secrets via GitHub CLI (Alternative)

```bash
gh secret set ANDROID_KEYSTORE_BASE64 < <(base64 android-release-key.jks)
gh secret set ANDROID_KEYSTORE_PASSWORD --body "your-password"
gh secret set ANDROID_KEY_ALIAS --body "release"
gh secret set ANDROID_KEY_PASSWORD --body "your-password"
gh secret set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON < service-account-key.json
```

## 🚀 Workflow Usage

### Automated Builds

The `android-build-test.yml` workflow runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual trigger via GitHub Actions UI

**What it does:**
- Builds web assets
- Syncs Capacitor
- Runs Android lint and tests
- Builds debug APK
- Builds release AAB (if on main branch and keystore configured)
- Uploads artifacts

### Google Play Beta Deployment

The `google-play-beta.yml` workflow can be triggered:

1. **Manual Trigger** (Recommended)
   - Go to Actions → Google Play Beta Deployment
   - Click "Run workflow"
   - Select track: `internal`, `alpha`, or `beta`
   - Optionally add release notes
   - Click "Run workflow"

2. **Automatic on Tags**
   - Create a git tag: `git tag v1.0.0`
   - Push tag: `git push origin v1.0.0`
   - Workflow will automatically deploy to beta track

**What it does:**
- Builds release AAB with signing
- Updates version code automatically
- Deploys to selected Google Play track
- Uploads release notes

## 🧪 Testing Locally

### Build APK for Testing

```bash
# Debug APK
pnpm android:build

# Release APK
pnpm android:build:release

# Release AAB (for Play Store)
pnpm android:build:aab
```

### Run Tests Locally

```bash
# Run all Android tests
pnpm android:test

# Run lint only
pnpm android:lint

# Validate everything
pnpm android:validate
```

### Install on Device

```bash
# Install debug APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Or use the helper script
pnpm android:run
```

### Test Build Scripts

```bash
# Build debug APK
bash scripts/android-build.sh --type debug --output apk

# Build release AAB
bash scripts/android-build.sh --type release --output aab

# Clean build
bash scripts/android-build.sh --clean --type release --output aab
```

## 📊 Monitoring Builds

### View Build Status

1. Go to **Actions** tab in GitHub
2. Click on workflow run to see:
   - Build logs
   - Test results
   - Downloadable artifacts (APK/AAB)

### Download Artifacts

1. Go to workflow run
2. Scroll to "Artifacts" section
3. Download:
   - `app-debug-apk`: Debug APK for testing
   - `app-release-aab`: Release AAB for Play Store

## 🐛 Troubleshooting

### Build Failures

**Issue**: "Keystore not found"
- **Solution**: Ensure `ANDROID_KEYSTORE_BASE64` secret is set correctly

**Issue**: "Signing failed"
- **Solution**: Verify all keystore secrets are correct:
  - `ANDROID_KEYSTORE_PASSWORD`
  - `ANDROID_KEY_ALIAS`
  - `ANDROID_KEY_PASSWORD`

**Issue**: "Gradle build failed"
- **Solution**: Check build logs for specific error
- Common issues:
  - Missing dependencies
  - Java version mismatch
  - Android SDK not found

### Deployment Failures

**Issue**: "Google Play API error"
- **Solution**: 
  - Verify service account JSON is correct
  - Check service account has proper permissions in Play Console
  - Ensure app exists in Play Console with correct package name

**Issue**: "Version code already exists"
- **Solution**: The workflow auto-increments version code, but if conflict:
  - Manually update `versionCode` in `android/app/build.gradle`
  - Or delete conflicting version in Play Console

**Issue**: "AAB validation failed"
- **Solution**:
  - Check AAB size (should be < 150MB)
  - Verify all required assets are included
  - Check for ProGuard/R8 issues

### Local Build Issues

**Issue**: "Command not found: gradlew"
- **Solution**: 
  ```bash
  chmod +x android/gradlew
  ```

**Issue**: "Java version mismatch"
- **Solution**: Ensure Java 21 is installed and set as default:
  ```bash
  java -version  # Should show 21.x
  ```

**Issue**: "Capacitor sync failed"
- **Solution**: 
  ```bash
  pnpm build
  npx cap sync android
  ```

## 📝 Best Practices

1. **Version Management**
   - Version name comes from `package.json`
   - Version code auto-increments based on git commits
   - Update `package.json` version for new releases

2. **Testing Before Release**
   - Always test debug APK on real devices
   - Run `pnpm android:validate` before pushing
   - Test on multiple Android versions (API 23+)

3. **Release Notes**
   - Update `android/release-notes/en-US.txt` before each release
   - Add notes for major features and bug fixes

4. **Security**
   - Never commit keystore files to git
   - Rotate keystore passwords periodically
   - Use different keystores for different environments

5. **Monitoring**
   - Check Play Console for crash reports
   - Monitor beta tester feedback
   - Review analytics for usage patterns

## 🔗 Resources

- [Google Play Console](https://play.google.com/console)
- [Google Play Android Developer API](https://developers.google.com/android-publisher)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)

## 📞 Support

If you encounter issues:

1. Check workflow logs in GitHub Actions
2. Review this documentation
3. Check Android build logs
4. Verify all secrets are configured correctly

---

**Last Updated**: 2025-01-XX  
**Maintained By**: Development Team
