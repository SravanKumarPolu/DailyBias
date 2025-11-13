# Support Guide

Getting help with Bias Daily development, deployment, and troubleshooting.

## 🆘 Quick Help

### Before Asking for Help

1. ✅ Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
2. ✅ Review [README.md](./README.md) for setup instructions
3. ✅ Check existing documentation files
4. ✅ Search for similar issues in project history
5. ✅ Verify you're using the latest code

### Common Questions

**Q: How do I set up the project?**
- See [README.md](./README.md) Quick Start section

**Q: How do I build for Android?**
- See [ANDROID_PUBLISH_GUIDE.md](./ANDROID_PUBLISH_GUIDE.md)

**Q: How do I add iOS support?**
- Run `npx cap add ios` then use `pnpm ios:sync`

**Q: Build is failing, what do I do?**
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) Build Issues section

**Q: App shows blank screen?**
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) Runtime Errors section

## 📚 Documentation Resources

### Essential Guides
- **[README.md](./README.md)** - Project overview and setup
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[ANDROID_PUBLISH_GUIDE.md](./ANDROID_PUBLISH_GUIDE.md)** - Android deployment
- **[CLEANUP_COMPLETE.md](./CLEANUP_COMPLETE.md)** - Recent changes summary

### Additional Documentation
- **[ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md)** - Analytics configuration
- **[EMAIL_SETUP.md](./EMAIL_SETUP.md)** - Email feedback setup
- **[IMPLEMENTATION_SAFETY.md](./IMPLEMENTATION_SAFETY.md)** - Safety analysis

## 🔍 Self-Help Steps

### 1. Verify Prerequisites

```bash
# Check Node.js version (20+ required)
node --version

# Check pnpm is installed
pnpm --version

# Verify dependencies are installed
pnpm install
```

### 2. Clean Build

```bash
# Clean everything and rebuild
pnpm clean:build

# For native apps, also sync
pnpm android:sync  # or ios:sync
```

### 3. Check Logs

**Browser Console:**
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

**Terminal/CLI:**
- Check build output for errors
- Look for TypeScript errors
- Check linter warnings

**Native Apps:**
```bash
# Android
adb logcat | grep -i capacitor

# iOS (in Xcode)
# View → Debug Area → Show Debug Area
```

### 4. Verify Configuration

**Environment Variables:**
- Check `.env.local` exists
- Verify variables start with `NEXT_PUBLIC_`
- Restart dev server after changes

**Capacitor Config:**
- Verify `capacitor.config.ts` syntax
- Check `webDir` is `'out'`
- Sync after changes: `npx cap sync`

## 🐛 Debugging Tips

### Enable Debug Logging

**Development Mode:**
- Errors show in console automatically
- Error boundary shows details in dev mode
- Check browser DevTools

**Production Mode:**
- Check browser console for runtime errors
- Use error boundary's "Copy" button for details
- Check network requests in DevTools

### Common Debug Commands

```bash
# Type check
pnpm type-check

# Lint check
pnpm lint

# Run tests
pnpm test

# Validate everything
pnpm validate
```

### Check Build Output

```bash
# Verify build succeeded
pnpm build

# Check output directory
ls -la out/

# Verify static files exist
ls -la out/_next/static/
```

## 📋 Issue Reporting Template

When reporting issues, use this template:

```markdown
## Issue Description
[Brief description of the issue]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., macOS 14.0, Windows 11]
- Node.js: [e.g., v20.10.0]
- pnpm: [e.g., 10.14.0]
- Browser/Device: [e.g., Chrome 120, Android 13]

## Error Messages
[Paste full error message or screenshot]

## Console Logs
[Paste relevant console logs]

## Additional Context
[Any other relevant information]
```

## 🔧 Development Workflow

### Standard Development

```bash
# 1. Start development
pnpm dev

# 2. Make changes
# [Edit files]

# 3. Test changes
# [Check in browser]

# 4. Validate before commit
pnpm validate
```

### Native App Development

```bash
# 1. Make web changes
pnpm dev
# [Test in browser]

# 2. Build for production
pnpm build

# 3. Sync to native
pnpm android:sync  # or ios:sync

# 4. Test in native app
pnpm android:run   # or ios:run
```

## ✅ Pre-Deployment Checklist

Before deploying, verify:

- [ ] `pnpm build` succeeds without errors
- [ ] `pnpm type-check` passes
- [ ] `pnpm lint` passes (or only acceptable warnings)
- [ ] `pnpm test` passes
- [ ] App works in browser
- [ ] Native apps build successfully
- [ ] Environment variables are set correctly
- [ ] Capacitor config is correct
- [ ] No console errors in production build

## 🚀 Deployment Support

### Web Deployment (Netlify)

1. Build locally first:
   ```bash
   pnpm build
   ```
2. Verify `out/` directory has all files
3. Deploy:
   ```bash
   netlify deploy --prod
   ```
4. Check Netlify build logs if issues occur

### Android Deployment

1. Follow [ANDROID_PUBLISH_GUIDE.md](./ANDROID_PUBLISH_GUIDE.md)
2. Build release bundle in Android Studio
3. Verify signing configuration
4. Upload to Play Console

### iOS Deployment

1. Add iOS platform: `npx cap add ios`
2. Build and sync: `pnpm ios:sync`
3. Open in Xcode: `pnpm ios:open`
4. Archive and upload to App Store Connect

## 💡 Best Practices

### Code Quality
- Run `pnpm validate` before committing
- Fix linting issues
- Write meaningful commit messages
- Test changes in both web and native

### Performance
- Monitor bundle size
- Optimize images
- Use code splitting (already configured)
- Test on real devices

### Maintenance
- Keep dependencies updated
- Review security advisories: `pnpm audit`
- Clean build artifacts regularly
- Document new features

## 📞 Getting Additional Help

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Community
- Check project issues/PRs
- Review similar projects
- Search Stack Overflow
- Check framework documentation

## 🎯 Quick Reference

### Most Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm clean:build      # Clean and rebuild

# Native Apps
pnpm android:sync     # Sync Android
pnpm ios:sync         # Sync iOS
pnpm android:open     # Open Android Studio
pnpm ios:open         # Open Xcode

# Quality Checks
pnpm validate         # Run all checks
pnpm type-check       # TypeScript check
pnpm lint             # Lint check
pnpm test             # Run tests
```

### File Locations

- Config: `next.config.mjs`, `capacitor.config.ts`
- Environment: `.env.local`
- Build output: `out/`
- Android project: `android/`
- iOS project: `ios/` (after adding)

---

**Remember:** Most issues can be resolved by:
1. Checking the troubleshooting guide
2. Cleaning and rebuilding
3. Verifying configuration
4. Checking console logs

**Last Updated:** $(date)

