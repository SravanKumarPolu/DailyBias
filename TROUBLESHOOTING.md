# Troubleshooting Guide

Common issues and solutions for Bias Daily development and deployment.

## 🏗️ Build Issues

### Build Fails with TypeScript Errors

**Problem:** TypeScript compilation errors during build

**Solutions:**
```bash
# Check for type errors
pnpm type-check

# Fix common issues
pnpm lint:fix

# Clean and rebuild
pnpm clean:build
```

### Build Output Missing Files

**Problem:** `out/` directory missing or incomplete

**Solutions:**
```bash
# Clean and rebuild
pnpm clean:build

# Verify next.config.mjs has output: 'export'
# Check for any build errors in console
```

### Service Worker Files Still Present

**Problem:** Old PWA service worker files in `out/` directory

**Solutions:**
```bash
# Clean build directory
pnpm clean

# Rebuild (service workers won't be generated)
pnpm build
```

## 📱 Android Issues

### Android Sync Fails

**Problem:** `npx cap sync android` fails

**Solutions:**
```bash
# Ensure build completed successfully
pnpm build

# Check capacitor.config.ts webDir is 'out'
# Verify Android project exists in android/ directory
# Try manual sync
npx cap sync android --force
```

### App Not Loading in Android

**Problem:** Blank screen or app crashes on launch

**Solutions:**
1. Check `capacitor.config.ts`:
   - `webDir` should be `'out'`
   - `appId` should match Android package name
2. Verify build output:
   ```bash
   ls -la out/
   ```
3. Check Android logs:
   ```bash
   adb logcat | grep -i capacitor
   ```
4. Rebuild and sync:
   ```bash
   pnpm android:sync
   ```

### Android Studio Won't Open

**Problem:** `npx cap open android` fails

**Solutions:**
1. Verify Android Studio is installed
2. Check Android project exists:
   ```bash
   ls android/
   ```
3. Try opening manually:
   ```bash
   open android/  # macOS
   # Or open Android Studio and import android/ folder
   ```

### Build Errors in Android Studio

**Problem:** Gradle build fails

**Solutions:**
1. Sync Gradle files in Android Studio
2. Check Java JDK version (17+ required)
3. Clean project: `Build` → `Clean Project`
4. Rebuild: `Build` → `Rebuild Project`
5. Update Capacitor:
   ```bash
   npx cap sync android
   ```

## 🍎 iOS Issues

### iOS Platform Not Found

**Problem:** `npx cap sync ios` fails with "platform not found"

**Solutions:**
```bash
# Add iOS platform first
npx cap add ios

# Then sync
pnpm ios:sync
```

### Xcode Won't Open

**Problem:** `npx cap open ios` fails

**Solutions:**
1. Verify Xcode is installed (macOS only)
2. Check iOS project exists:
   ```bash
   ls ios/
   ```
3. Open manually:
   ```bash
   open ios/App.xcworkspace
   ```

### iOS Build Errors

**Problem:** Xcode build fails

**Solutions:**
1. Clean build folder: `Product` → `Clean Build Folder` (Shift+Cmd+K)
2. Update CocoaPods:
   ```bash
   cd ios/App
   pod install
   ```
3. Sync Capacitor:
   ```bash
   pnpm ios:sync
   ```

## 🌐 Web/Development Issues

### Development Server Won't Start

**Problem:** `pnpm dev` fails

**Solutions:**
```bash
# Check Node.js version (20+ required)
node --version

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check for port conflicts
# Try different port: pnpm dev -p 3001
```

### Hot Reload Not Working

**Problem:** Changes not reflecting in browser

**Solutions:**
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear browser cache
3. Restart dev server:
   ```bash
   # Stop server (Ctrl+C)
   pnpm dev
   ```

### TypeScript Errors in IDE

**Problem:** Red squiggles in VS Code/IDE

**Solutions:**
```bash
# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# Verify tsconfig.json is valid
pnpm type-check
```

## 💾 Data/Storage Issues

### Data Not Persisting

**Problem:** User data (favorites, progress) not saving

**Solutions:**
1. Check browser storage:
   - Open DevTools → Application → IndexedDB
   - Verify database exists
2. Check for errors in console
3. Clear and retry:
   ```javascript
   // In browser console
   indexedDB.deleteDatabase('bias-daily-db')
   // Then refresh page
   ```

### IndexedDB Errors

**Problem:** IndexedDB operations failing

**Solutions:**
1. Check browser support (modern browsers only)
2. Verify storage quota not exceeded
3. Clear browser data and retry
4. Check for CORS issues (shouldn't happen in same origin)

## 🔌 Plugin/Feature Issues

### Capacitor Plugins Not Working

**Problem:** Native features (haptics, etc.) not working

**Solutions:**
1. Sync after adding plugin:
   ```bash
   pnpm install @capacitor/haptics
   npx cap sync android  # or ios
   ```
2. Rebuild native app
3. Check plugin is imported correctly in code

### Analytics Not Working

**Problem:** Plausible analytics not tracking

**Solutions:**
1. Check `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set
2. Verify Plausible script loads (check Network tab)
3. Check browser console for errors
4. Verify domain is added in Plausible dashboard

## 🐛 Runtime Errors

### Error Boundary Triggered

**Problem:** App shows error screen

**Solutions:**
1. Check browser console for error details
2. Copy error details (button in error screen)
3. Check error message for specific issue
4. Try:
   - Reload app
   - Clear cache
   - Check if issue persists
5. Report issue with error details

### Blank Screen on Load

**Problem:** App loads but shows blank screen

**Solutions:**
1. Check browser console for errors
2. Verify JavaScript is enabled
3. Check network tab for failed requests
4. Try different browser
5. Clear cache and cookies
6. Check if issue is device-specific

## 🔐 Environment/Config Issues

### Environment Variables Not Working

**Problem:** `process.env.NEXT_PUBLIC_*` is undefined

**Solutions:**
1. Verify variable starts with `NEXT_PUBLIC_`
2. Restart dev server after adding variables
3. Check `.env.local` file exists and is in root
4. Rebuild for production:
   ```bash
   pnpm build
   ```

### Capacitor Config Not Applied

**Problem:** Changes to `capacitor.config.ts` not reflected

**Solutions:**
1. Sync after changes:
   ```bash
   npx cap sync android  # or ios
   ```
2. Rebuild native app
3. Verify config file syntax is correct

## 📦 Dependency Issues

### Package Installation Fails

**Problem:** `pnpm install` fails

**Solutions:**
```bash
# Clear cache
pnpm store prune

# Remove lock file and reinstall
rm pnpm-lock.yaml
pnpm install

# Check Node.js version
node --version  # Should be 20+
```

### Version Conflicts

**Problem:** Dependency version conflicts

**Solutions:**
```bash
# Update all dependencies
pnpm update

# Check for security issues
pnpm audit

# Fix security issues
pnpm audit fix
```

## 🚀 Deployment Issues

### Netlify Build Fails

**Problem:** Deployment fails on Netlify

**Solutions:**
1. Check build logs for specific error
2. Verify `netlify.toml` configuration
3. Check Node.js version (20+)
4. Test build locally:
   ```bash
   pnpm build
   ```

### Native App Size Too Large

**Problem:** APK/AAB file is very large

**Solutions:**
1. Check bundle size:
   ```bash
   # Analyze bundle
   pnpm build
   # Check out/_next/static/ for large files
   ```
2. Enable code splitting (already configured)
3. Optimize images
4. Remove unused dependencies

## 🆘 Still Having Issues?

1. Check [SUPPORT.md](./SUPPORT.md) for support options
2. Review error messages carefully
3. Check browser/device console logs
4. Verify all prerequisites are installed
5. Try clean rebuild:
   ```bash
   pnpm clean:build
   ```

## 📝 Reporting Issues

When reporting issues, include:
- Error message (full text)
- Steps to reproduce
- Environment (OS, Node version, browser/device)
- Console logs
- Screenshots if applicable

---

**Last Updated:** $(date)

