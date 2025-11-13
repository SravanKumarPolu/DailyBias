# Quick Reference Guide

Quick commands and tips for Bias Daily development.

## 🚀 Most Common Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Production build
pnpm clean:build      # Clean and rebuild

# Native Apps
pnpm android:sync     # Build and sync Android
pnpm ios:sync         # Build and sync iOS
pnpm android:open     # Open Android Studio
pnpm ios:open         # Open Xcode

# Quality Checks
pnpm validate         # Run all checks (type, lint, test)
pnpm type-check       # TypeScript check
pnpm lint             # Lint check
pnpm test             # Run tests

# Diagnostics
pnpm diagnostics      # Run system diagnostics
```

## 📁 Key Files

- `next.config.mjs` - Next.js configuration
- `capacitor.config.ts` - Capacitor/native app config
- `.env.local` - Environment variables
- `package.json` - Dependencies and scripts

## 🔧 Quick Fixes

### Build Issues
```bash
pnpm clean:build
```

### Type Errors
```bash
pnpm type-check
```

### Lint Issues
```bash
pnpm lint:fix
```

### Native App Not Loading
```bash
pnpm build
pnpm android:sync  # or ios:sync
```

### Dependencies Issues
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📱 Platform-Specific

### Android
- Project: `android/`
- Open: `pnpm android:open`
- Sync: `pnpm android:sync`
- Guide: [ANDROID_PUBLISH_GUIDE.md](./ANDROID_PUBLISH_GUIDE.md)

### iOS
- Project: `ios/` (after `npx cap add ios`)
- Open: `pnpm ios:open`
- Sync: `pnpm ios:sync`
- Requires: macOS + Xcode

## 🐛 Troubleshooting

1. **Check diagnostics:**
   ```bash
   pnpm diagnostics
   ```

2. **See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**

3. **Get help:**
   - See [SUPPORT.md](./SUPPORT.md)
   - Check error messages
   - Review console logs

## ✅ Pre-Commit Checklist

- [ ] `pnpm validate` passes
- [ ] Code formatted (`pnpm format`)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Tests pass (if applicable)

## 🚢 Pre-Deployment Checklist

- [ ] `pnpm build` succeeds
- [ ] `pnpm type-check` passes
- [ ] `pnpm lint` passes
- [ ] App works in browser
- [ ] Native apps build successfully
- [ ] Environment variables set
- [ ] No console errors

## 📚 Documentation

- [README.md](./README.md) - Full setup guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [SUPPORT.md](./SUPPORT.md) - Getting help
- [ANDROID_PUBLISH_GUIDE.md](./ANDROID_PUBLISH_GUIDE.md) - Android deployment

---

**Tip:** Run `pnpm diagnostics` first when troubleshooting!

