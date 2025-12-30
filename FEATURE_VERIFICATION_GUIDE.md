# Feature Verification Guide

**Quick Reference:** How to ensure no core features are missing or damaged

---

## 🚀 Quick Start

### Automated Verification
```bash
# Run automated core features verification
pnpm verify:core
```

This script checks:
- ✅ TypeScript compilation
- ✅ Linting
- ✅ Unit tests
- ✅ Integration tests
- ✅ Production build
- ✅ Core files existence
- ✅ Critical exports

### Manual Verification
See [CORE_FEATURES_VERIFICATION.md](./CORE_FEATURES_VERIFICATION.md) for detailed checklist.

---

## 📋 When to Verify

### Before Every Deployment
```bash
# Quick verification
pnpm verify:core

# Full validation
pnpm validate
pnpm e2e
```

### Before Major Changes
1. Run `pnpm verify:core`
2. Check [CORE_FEATURES_VERIFICATION.md](./CORE_FEATURES_VERIFICATION.md)
3. Test manually in browser
4. Test on mobile (if applicable)

### After Refactoring
1. Run all tests: `pnpm test:all`
2. Run E2E tests: `pnpm e2e`
3. Manual smoke test of all pages
4. Verify data persistence

---

## 🎯 Core Features to Always Check

### Critical Path (5 minutes)
1. ✅ Daily bias loads (no flicker)
2. ✅ Favorites work and persist
3. ✅ Custom biases can be created
4. ✅ Settings persist
5. ✅ Navigation works

### Full Check (15 minutes)
1. ✅ All 6 main pages load
2. ✅ Search works on All page
3. ✅ Analytics displays data
4. ✅ Text-to-speech works (if enabled)
5. ✅ App works offline
6. ✅ Data export/import works

---

## 🔧 Troubleshooting

### If Verification Fails

1. **Type errors:**
   ```bash
   pnpm type-check
   # Fix TypeScript errors
   ```

2. **Lint errors:**
   ```bash
   pnpm lint:fix
   # Review and fix remaining issues
   ```

3. **Test failures:**
   ```bash
   pnpm test:run
   # Fix failing tests
   ```

4. **Build errors:**
   ```bash
   pnpm clean:build
   # Check for missing dependencies
   ```

### If Manual Testing Fails

1. Check browser console for errors
2. Check Network tab for failed requests
3. Clear browser cache and localStorage
4. Check IndexedDB in DevTools
5. Review recent changes in git

---

## 📚 Related Documentation

- [CORE_FEATURES_VERIFICATION.md](./CORE_FEATURES_VERIFICATION.md) - Detailed feature checklist
- [TESTING.md](./TESTING.md) - Testing strategy
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

---

## 💡 Tips

1. **Run verification frequently** - Catch issues early
2. **Test on multiple devices** - Mobile and desktop
3. **Test offline** - Ensure offline support works
4. **Check data persistence** - Refresh and verify data persists
5. **Test edge cases** - Empty states, long text, etc.

---

**Remember:** A few minutes of verification can save hours of debugging later!









