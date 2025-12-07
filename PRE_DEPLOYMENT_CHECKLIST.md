# Pre-Deployment Checklist for Google Play Store

Use this checklist before deploying to Google Play Store to ensure everything is ready.

## ✅ Configuration Status

### 1. Build Configuration ✓
- [x] Android build configuration validated
- [x] Signing configuration in place
- [x] Version management configured
- [x] Release notes template created

### 2. GitHub Secrets (REQUIRED - Not Yet Configured)
- [ ] `ANDROID_KEYSTORE_BASE64` - Base64 encoded keystore
- [ ] `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- [ ] `ANDROID_KEY_ALIAS` - Key alias (usually "release")
- [ ] `ANDROID_KEY_PASSWORD` - Key password
- [ ] `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` - Service account JSON

**⚠️ CRITICAL**: These secrets MUST be configured before deployment will work.

### 3. Google Play Console Setup (REQUIRED - Not Yet Configured)
- [ ] App created in Google Play Console
- [ ] Package name matches: `com.debiasdaily.app`
- [ ] Service account created and linked
- [ ] Service account has "Release to testing tracks" permission
- [ ] At least one testing track created (internal/alpha/beta)

### 4. Keystore (REQUIRED - Not Yet Created)
- [ ] Release keystore generated
- [ ] Keystore securely backed up
- [ ] Keystore passwords documented securely
- [ ] Keystore encoded to base64 for GitHub secret

## 🧪 Testing Status

### Automated Tests
- [x] Build validation script created
- [x] Android test scripts created
- [x] Mobile emulation tests configured
- [ ] **Run full test suite**: `pnpm test:all`
- [ ] **Run Android tests**: `pnpm android:test`
- [ ] **Validate build**: `pnpm android:check`

### Manual Testing (Recommended)
- [ ] Test app on real Android device
- [ ] Test all core features:
  - [ ] App launches without crash
  - [ ] Daily bias displays correctly
  - [ ] Navigation works (all 6 tabs)
  - [ ] Favorite button works
  - [ ] Settings persist
  - [ ] Data persists after restart
- [ ] Test on multiple Android versions (API 23+)
- [ ] Test on different screen sizes

### Build Verification
- [ ] **Build debug APK**: `pnpm android:build`
- [ ] **Install on device**: `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`
- [ ] **Test debug build** on device
- [ ] **Build release AAB**: `pnpm android:build:aab` (requires keystore)
- [ ] **Verify AAB size** (< 150MB for Play Store)

## 📋 Pre-Deployment Requirements

### Required Files
- [x] `android/app/build.gradle` - Build configuration
- [x] `android/app/src/main/AndroidManifest.xml` - App manifest
- [x] `capacitor.config.ts` - Capacitor configuration
- [x] `android/release-notes/en-US.txt` - Release notes
- [x] GitHub Actions workflows created

### App Store Listing (Google Play Console)
- [ ] App name: "Bias Daily"
- [ ] App description written
- [ ] Screenshots uploaded (required for production)
- [ ] App icon uploaded
- [ ] Privacy policy URL (if required)
- [ ] Content rating completed

### Legal & Compliance
- [ ] Privacy policy created and linked
- [ ] Terms of service (if applicable)
- [ ] Data handling disclosure (if collecting user data)
- [ ] Permissions justified in Play Console

## 🚀 Deployment Steps

### Step 1: Complete Setup (Do First)
1. Generate keystore (if not done)
2. Configure GitHub Secrets
3. Set up Google Play Console
4. Create service account and link it

### Step 2: Test Build Locally
```bash
# Validate configuration
pnpm android:check

# Build and test
pnpm android:build
pnpm android:test

# Install on device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 3: Deploy to Beta
1. Go to GitHub Actions
2. Select "Google Play Beta Deployment"
3. Click "Run workflow"
4. Select track: "beta"
5. Add release notes (or use default)
6. Click "Run workflow"

### Step 4: Verify Deployment
1. Check workflow logs for success
2. Go to Google Play Console
3. Navigate to Testing → Beta
4. Verify new release appears
5. Check version code and name

## ⚠️ Current Status

### ✅ Completed
- Build automation workflows created
- Test scripts created
- Build configuration validated
- Documentation created
- Release notes template ready

### ❌ Not Yet Completed (BLOCKERS)
1. **GitHub Secrets not configured** - Deployment will fail without these
2. **Google Play Console setup** - App must exist in Play Console
3. **Keystore not created** - Cannot sign release builds without keystore
4. **Service account not linked** - Cannot deploy without API access

### ⚠️ Recommended Before Deployment
1. Run full test suite locally
2. Test on real Android device
3. Update release notes with actual changes
4. Complete Play Console app listing

## 🎯 Ready to Deploy?

**Answer these questions:**

1. ✅ Have you generated a keystore? → **NO** (Required)
2. ✅ Have you configured GitHub Secrets? → **NO** (Required)
3. ✅ Have you set up Google Play Console? → **NO** (Required)
4. ✅ Have you tested the app on a real device? → **Not verified**
5. ✅ Have you updated release notes? → **Partially** (Template only)

### Current Status: **NOT READY FOR DEPLOYMENT**

**You need to complete the setup steps first:**
1. Generate keystore
2. Configure GitHub Secrets
3. Set up Google Play Console
4. Test locally

See [GOOGLE_PLAY_BETA_QUICK_START.md](./docs/GOOGLE_PLAY_BETA_QUICK_START.md) for step-by-step instructions.

## 📚 Next Steps

1. **Read Quick Start Guide**: `docs/GOOGLE_PLAY_BETA_QUICK_START.md`
2. **Read Full Setup Guide**: `docs/GOOGLE_PLAY_BETA_SETUP.md`
3. **Generate Keystore**: Follow guide instructions
4. **Configure Secrets**: Add to GitHub repository
5. **Set up Play Console**: Create app and service account
6. **Test Locally**: Build and test on device
7. **Deploy**: Use GitHub Actions workflow

---

**Last Updated**: 2025-01-XX  
**Status**: Automation ready, setup required
