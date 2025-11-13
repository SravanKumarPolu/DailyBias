# Android Publishing Guide for Bias Daily

## Overview
You **DO NOT need a separate project**. Your Next.js web app can be packaged as an Android app using Capacitor, which wraps your web app in a native Android container.

## Prerequisites
1. **Android Studio** - Download from [developer.android.com/studio](https://developer.android.com/studio)
2. **Java Development Kit (JDK)** - Version 17 or higher (usually comes with Android Studio)
3. **Google Play Developer Account** - $25 one-time fee at [play.google.com/console](https://play.google.com/console)

## Step-by-Step Process

### 1. Install Dependencies
First, install the Capacitor packages:

```bash
pnpm install
```

### 2. Build Your Next.js App
Build your web app for production (this creates the `out/` directory with static files):

```bash
pnpm build
```

### 3. Initialize Capacitor (if not already done)
If the Android project doesn't exist yet:

```bash
npx cap add android
```

### 4. Sync with Capacitor
After building, sync your web assets to the Android project:

```bash
pnpm android:sync
```

Or manually:
```bash
npx cap sync android
```

This copies your built web app from `out/` into the Android project.

### 5. Open in Android Studio
```bash
pnpm android:open
```

Or manually:
```bash
npx cap open android
```

This opens your Android project in Android Studio.

### 6. Create a Signing Keystore (For Release Builds)
You need a keystore to sign your app for the Play Store. **⚠️ IMPORTANT: Save this securely!**

**Option A: Using Android Studio (Recommended)**
1. In Android Studio: `Build` → `Generate Signed Bundle / APK`
2. Select `Android App Bundle` (required for Play Store)
3. Click `Create new...` to create a new keystore
4. Fill in:
   - Key store path: Choose a secure location (e.g., `~/dailybias-release-key.jks`)
   - Password: Create a strong password
   - Key alias: `dailybias`
   - Key password: Create another strong password
   - Validity: 25 years (recommended)
   - Certificate information: Fill in your details
5. Click `OK` and save the keystore file securely

**Option B: Using Command Line**
```bash
keytool -genkey -v -keystore dailybias-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias dailybias
```

**⚠️ CRITICAL:** 
- Store your keystore file in a secure, backed-up location
- Never commit the keystore to version control
- You'll need this keystore for ALL future updates
- If you lose it, you cannot update your app on Play Store (must create a new app)

### 7. Configure Signing in Android Studio
1. In Android Studio, go to `File` → `Project Structure` → `Modules` → `app` → `Signing Configs`
2. Click `+` to add a new signing config
3. Name it `release`
4. Fill in:
   - Store File: Path to your keystore
   - Store Password: Your keystore password
   - Key Alias: `dailybias`
   - Key Password: Your key password
5. Go to `Build Types` → `release` → Select your signing config
6. Click `OK`

Alternatively, you can configure it in `android/app/build.gradle` (see below).

### 8. Update App Version
Before each release, update the version in `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        versionCode 2  // Increment by 1 for each release
        versionName "1.0.1"  // User-visible version
    }
}
```

### 9. Build Release Bundle
In Android Studio:
1. `Build` → `Generate Signed Bundle / APK`
2. Select `Android App Bundle`
3. Choose your keystore and enter passwords
4. Select `release` build variant
5. Click `Finish`

The `.aab` file will be in `android/app/release/app-release.aab`

**Or using command line:**
```bash
cd android
./gradlew bundleRelease
```

### 10. Prepare Play Store Assets

#### App Icon
- 512x512px PNG (no transparency)
- You already have: `public/icon-512.jpg` - convert to PNG if needed

#### Screenshots
- Phone: At least 2 screenshots (1080x1920px or higher)
- Tablet (if supporting): At least 2 screenshots
- Create screenshots of your app running on a device/emulator

#### Feature Graphic
- 1024x500px PNG
- Used on Play Store listing page

#### Privacy Policy
- **Required** for Play Store
- Create a privacy policy page on your website
- Add the URL in Play Console

### 11. Create Play Store Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Click `Create app`
3. Fill in:
   - **App name**: Bias Daily
   - **Default language**: English
   - **App type**: App
   - **Free or paid**: Free
4. Complete the app information:
   - Short description (80 characters)
   - Full description (4000 characters)
   - Screenshots
   - Feature graphic
   - App icon
   - Privacy policy URL

### 12. Complete Store Listing Requirements

1. **Content Rating**: Complete the questionnaire
2. **Privacy Policy**: Add your privacy policy URL
3. **Target Audience**: Select appropriate age groups
4. **Data Safety**: Fill out data collection and sharing practices
5. **App Access**: Declare if your app requires special access

### 13. Upload and Publish

1. Go to `Production` → `Create new release`
2. Upload your `.aab` file
3. Add release notes (what's new in this version)
4. Review and click `Save`
5. Click `Review release`
6. If everything looks good, click `Start rollout to Production`

The app will be reviewed by Google (usually 1-7 days) before going live.

## Development Workflow

### Testing on Device
1. Connect Android device via USB
2. Enable USB debugging on device (Settings → Developer options)
3. In Android Studio: Click the Run button (▶️)
   - Or: `pnpm android:run`

### Testing Locally
```bash
# Build web app
pnpm build

# Sync to Android
pnpm android:sync

# Run on device/emulator
pnpm android:run
```

### Updating the App
1. Make changes to your Next.js app
2. `pnpm build`
3. `pnpm android:sync`
4. Test in Android Studio
5. Update version in `android/app/build.gradle`
6. Build release bundle
7. Upload new version to Play Store

## Convenience Scripts

The following scripts have been added to `package.json`:

- `pnpm android:sync` - Build web app and sync to Android
- `pnpm android:open` - Open Android project in Android Studio
- `pnpm android:run` - Run app on connected device/emulator
- `pnpm android:build` - Full workflow: build, sync, and open

## Important Notes

### ✅ Advantages of This Approach
- **Single codebase** - One project for web and Android
- **Easy updates** - Update web, rebuild, sync, publish
- **Native app experience** - Full access to device features via Capacitor
- **No separate Android code** - Pure web app wrapped in native container
- **No breaking changes** - Your web app continues to work exactly as before

### ⚠️ Things to Consider
- **App size** - Next.js apps can be larger than native apps (usually 10-30MB)
- **Performance** - WebView performance vs native (usually fine for most apps)
- **Native features** - Can add Capacitor plugins for native features (camera, notifications, etc.)

### 🔧 Optional: Add Native Features
You can enhance your app with Capacitor plugins:
- Push notifications: `@capacitor/push-notifications`
- Camera: `@capacitor/camera`
- Haptics: `@capacitor/haptics`
- Status bar: `@capacitor/status-bar`
- Share: `@capacitor/share`

Install plugins:
```bash
pnpm add @capacitor/push-notifications
npx cap sync android
```

## Troubleshooting

### Build Errors
- Make sure Java JDK 17+ is installed
- Check Android SDK is properly configured in Android Studio
- Run `npx cap sync android` after any web build changes
- Clean build: In Android Studio, `Build` → `Clean Project`, then `Build` → `Rebuild Project`

### App Not Loading
- Check `capacitor.config.ts` - `webDir` should be `'out'` (for Next.js static export)
- Verify `pnpm build` completed successfully
- Check Android logs: `adb logcat` or Android Studio Logcat
- Ensure `out/` directory exists and contains your built files

### Keystore Issues
- Never lose your keystore file or passwords
- Keep backups in secure location (encrypted cloud storage, password manager)
- If lost, you cannot update your app on Play Store (must create new app with new package name)
- Consider using Google Play App Signing (recommended) - Google manages your signing key

### Static Export Issues
- Your app is already client-side only, so static export is safe
- If you see errors about server-side features, check that you're not using:
  - API routes (`app/api/`)
  - Server Actions
  - `getServerSideProps` or `getStaticProps` (App Router doesn't use these)

### Version Conflicts
- If you see version conflicts, run `npx cap sync android` to update native dependencies
- Check `android/variables.gradle` for SDK versions

## Configuration Files

### capacitor.config.ts
Located at the root of your project. Contains:
- App ID: `com.dailybias.app`
- App name: `Bias Daily`
- Web directory: `out` (Next.js static export output)
- Android scheme: `https`

### android/app/build.gradle
Contains Android-specific configuration:
- `applicationId`: `com.dailybias.app`
- `versionCode`: Increment for each release
- `versionName`: User-visible version
- Signing configuration (for release builds)

## Next Steps

1. ✅ Capacitor config created (`capacitor.config.ts`)
2. ✅ Static export enabled in `next.config.mjs`
3. ✅ Android scripts added to `package.json`
4. ⏭️ Install dependencies: `pnpm install`
5. ⏭️ Build your app: `pnpm build`
6. ⏭️ Sync to Android: `pnpm android:sync`
7. ⏭️ Open in Android Studio: `pnpm android:open`
8. ⏭️ Create keystore and build release bundle
9. ⏭️ Create Play Store listing
10. ⏭️ Upload and publish!

## Resources
- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Capacitor documentation
3. Check Android Studio logs
4. Verify your build completes successfully: `pnpm build`

---

**Remember**: Your web app functionality remains unchanged. Static export only affects how the app is built, not how it runs. All your PWA features, service workers, and offline capabilities will work in the Android app!

