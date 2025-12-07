# Google Play Beta - Quick Start Guide

Get started with automated Google Play Beta testing in 5 minutes.

## 🚀 Quick Setup (5 Steps)

### Step 1: Generate Keystore (if needed)

```bash
keytool -genkey -v -keystore android-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias release
```

**Save these values securely:**
- Keystore password
- Key alias: `release`
- Key password

### Step 2: Encode Keystore

```bash
# macOS
base64 -i android-release-key.jks | pbcopy

# Linux
base64 android-release-key.jks | pbcopy
```

### Step 3: Create Google Play Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable "Google Play Android Developer API"
3. Create service account → Download JSON key
4. In [Google Play Console](https://play.google.com/console):
   - Settings → API access → Link service account
   - Grant "Release to testing tracks" permission

### Step 4: Add GitHub Secrets

Go to: **Repository → Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Value |
|------------|-------|
| `ANDROID_KEYSTORE_BASE64` | (Paste base64 keystore from Step 2) |
| `ANDROID_KEYSTORE_PASSWORD` | (Your keystore password) |
| `ANDROID_KEY_ALIAS` | `release` |
| `ANDROID_KEY_PASSWORD` | (Your key password) |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | (Paste entire JSON file content) |

### Step 5: Deploy to Beta

1. Go to **Actions** tab
2. Select **"Google Play Beta Deployment"**
3. Click **"Run workflow"**
4. Select track: **beta**
5. Click **"Run workflow"**

🎉 Done! Your app will be built and deployed to Google Play Beta.

## 📱 Testing the Build

### Build Locally

```bash
# Debug APK
pnpm android:build

# Release AAB
pnpm android:build:aab
```

### Install on Device

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔍 Verify Setup

```bash
# Validate configuration
bash scripts/validate-android-build.sh

# Run tests
pnpm android:test
```

## 📚 Next Steps

- Read full guide: [GOOGLE_PLAY_BETA_SETUP.md](./GOOGLE_PLAY_BETA_SETUP.md)
- Update release notes: `android/release-notes/en-US.txt`
- Monitor builds: GitHub Actions → Workflow runs

## ❓ Common Issues

**"Keystore not found"**
→ Check `ANDROID_KEYSTORE_BASE64` secret is set

**"API access denied"**
→ Verify service account has permissions in Play Console

**"Build failed"**
→ Check workflow logs in Actions tab

---

**Need help?** See [GOOGLE_PLAY_BETA_SETUP.md](./GOOGLE_PLAY_BETA_SETUP.md) for detailed troubleshooting.
