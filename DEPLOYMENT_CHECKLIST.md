# 🚀 Deployment Checklist - Avoid Cache Issues

**Use this checklist EVERY TIME you deploy to prevent caching problems!**

---

## ✅ Pre-Deployment

### 1. Update Version Number
```json
// public/manifest.json
{
  "version": "1.0.2",  // ← Increment this!
  // ...
}
```

**Version Format:**
- Major changes: `2.0.0`
- New features: `1.1.0`
- Bug fixes: `1.0.1`

### 2. Run Full Build
```bash
cd /Users/sravanpolu/Projects/DailyBias

# Clean build
rm -rf .next

# Validate
pnpm type-check
pnpm lint

# Build
pnpm build

# Test locally
pnpm start
# Visit http://localhost:3000 and test
```

### 3. Check Service Worker
```bash
# Verify new SW files generated
ls -la public/sw.js public/workbox-*.js

# Should show recent timestamp (today's date)
```

### 4. Test PWA Locally
1. Open Chrome DevTools → Application → Service Workers
2. Check "Update on reload"
3. Test your changes
4. Verify new version shows in manifest

---

## 🚀 Deployment

### Option A: Netlify

```bash
# Deploy
pnpm build
netlify deploy --prod

# Or use Git push (if connected)
git add .
git commit -m "feat: update to v1.0.2"
git push origin main
```

### Option B: Vercel

```bash
# Deploy
pnpm build
vercel --prod

# Or use Git push
git push origin main
```

---

## 🧪 Post-Deployment Verification

### 1. Clear Your Cache First
```
Chrome DevTools → Application → Storage → Clear site data
```

### 2. Test Desktop
1. Visit your deployed URL
2. Open DevTools → Application → Service Workers
3. Verify new service worker is active
4. Check Console for any errors
5. Test navigation

### 3. Test Mobile
1. Open in mobile browser (not PWA yet)
2. Clear browser cache/data
3. Visit site
4. Install PWA fresh
5. Test functionality

### 4. Check Manifest
```
DevTools → Application → Manifest
Verify version matches: 1.0.2 (or whatever you set)
```

---

## 🔧 Force Update for Existing Users

### Immediate Fix (Nuclear Option)

If users are STUCK on old version:

```bash
# 1. Increment version
# public/manifest.json: "version": "1.0.3"

# 2. Change start_url to force refresh
# public/manifest.json: "start_url": "/?v=1.0.3"

# 3. Rebuild and deploy
rm -rf .next public/sw.js public/workbox-*.js
pnpm build
# Deploy

# 4. Users must:
#    - Clear browser cache OR
#    - Uninstall PWA and reinstall
```

### Graceful Update (Better)

Add update notification in your app (already configured in `service-worker-registration.tsx`):

Users will see: "Update available! Refresh to get the latest version"

---

## 📋 Troubleshooting

### Problem: Users Still See Old Version

**Solution 1: Clear Everything**
```bash
# In browser console:
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister()
  }
})

# Then refresh
```

**Solution 2: Change Start URL**
```json
// manifest.json
"start_url": "/?cache_bust=20251005"
```

**Solution 3: Force SW Update**
```javascript
// In browser console
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update()
})
```

### Problem: Service Worker Not Updating

**Check:**
1. ✅ Version changed in manifest.json?
2. ✅ New build deployed (check timestamp)?
3. ✅ Service worker files regenerated?
4. ✅ Browser cache cleared?

**Fix:**
```bash
# 1. Remove old service worker files
rm -rf public/sw.js public/workbox-*.js

# 2. Clean build
rm -rf .next
pnpm build

# 3. Verify new files created
ls -la public/sw.js

# 4. Deploy
```

### Problem: Mobile Shows Old, Desktop Shows New

**Cause:** Mobile has PWA installed with old cache

**Fix:**
```
Mobile → Settings → Apps → Bias Daily → Storage → Clear data
Then reinstall PWA
```

---

## 🎯 Best Practices

### 1. **ALWAYS increment version on changes**
```json
"version": "1.0.X"  // X++ every deployment
```

### 2. **Test in incognito first**
```
Before declaring "it works", test in incognito/private mode
```

### 3. **Document what changed**
```bash
git commit -m "feat: new feature - v1.0.3"
```

### 4. **Monitor Service Worker**
```
Keep DevTools → Application → Service Workers open during testing
```

### 5. **Cache Strategies**
- **HTML/Pages**: NetworkFirst (get updates)
- **JS/CSS**: StaleWhileRevalidate (fast + updates)
- **Images**: CacheFirst (rarely change)
- **API**: NetworkFirst (always fresh data)

---

## 📊 Cache Strategy Explained

Our current config (in next.config.mjs):

```javascript
API calls:     NetworkFirst, 5 min cache
HTML pages:    NetworkFirst, 24 hr cache
JS/CSS:        StaleWhileRevalidate, 24 hr
Images:        CacheFirst, 30 days
Everything:    NetworkFirst, 24 hr
```

This means:
- ✅ Users get updates quickly (NetworkFirst)
- ✅ Offline still works (fallback to cache)
- ✅ Images cached longer (rarely change)
- ✅ API always fresh (5 min expiration)

---

## 🚨 Emergency: Users Stuck on Old Version

### Immediate Action Plan

1. **Update version to force refresh**
```json
// manifest.json
"version": "1.0.999",
"start_url": "/?force_update=1"
```

2. **Remove old service worker**
```bash
rm -rf public/sw.js public/workbox-*.js
rm -rf .next
```

3. **Rebuild**
```bash
pnpm build
```

4. **Deploy immediately**
```bash
netlify deploy --prod
# or
vercel --prod
```

5. **Add prominent update banner** (optional)
```tsx
// Add to app/layout.tsx
{isOldVersion && (
  <div className="fixed top-0 z-50 w-full bg-red-500 text-white p-3 text-center">
    🚨 Update Available! Please refresh or reinstall the app.
    <button onClick={() => window.location.reload(true)}>
      Refresh Now
    </button>
  </div>
)}
```

6. **Instruct users**
```
"Settings → Apps → Bias Daily → Clear Data → Reinstall"
or
"Clear browser cache and refresh"
```

---

## ✅ Quick Deployment Commands

### Full Deployment
```bash
# From project root
cd /Users/sravanpolu/Projects/DailyBias

# 1. Update version in manifest.json
# 2. Then run:

pnpm type-check && \
pnpm lint && \
rm -rf .next && \
pnpm build && \
netlify deploy --prod
```

### Quick Deploy (skip checks)
```bash
cd /Users/sravanpolu/Projects/DailyBias
rm -rf .next && pnpm build && netlify deploy --prod
```

### Emergency Deploy (cache bust)
```bash
cd /Users/sravanpolu/Projects/DailyBias

# Update manifest version first!
# Then:

rm -rf .next public/sw.js public/workbox-*.js && \
pnpm build && \
netlify deploy --prod
```

---

## 📱 Testing Checklist

After every deployment, test:

- [ ] Desktop browser (Chrome)
- [ ] Desktop browser (incognito)
- [ ] Mobile browser (Safari/Chrome)
- [ ] Mobile browser (incognito)
- [ ] PWA installed (desktop)
- [ ] PWA installed (mobile)
- [ ] Service worker active
- [ ] No console errors
- [ ] Offline mode works
- [ ] Version number correct

---

## 💡 Pro Tips

1. **Always test in incognito FIRST**
   - Your browser cache can hide issues

2. **Keep DevTools open during deployment**
   - Watch Network and Application tabs

3. **Version everything**
   - Easier to debug "which version has this bug?"

4. **Use query parameters**
   - `?v=1.0.3` forces cache bypass

5. **Monitor user reports**
   - "Still seeing old version?" = caching issue

6. **Document each deployment**
   ```bash
   # Create deployment log
   echo "$(date): Deployed v1.0.3 - Fixed button color" >> DEPLOYMENTS.log
   ```

---

## 🎯 Your Next Deployment

1. **Before:**
   - [ ] Update `manifest.json` version
   - [ ] Run `pnpm validate`
   - [ ] Clean build: `rm -rf .next`
   - [ ] Test locally: `pnpm start`

2. **During:**
   - [ ] Deploy: `netlify deploy --prod`
   - [ ] Wait for build to complete
   - [ ] Check deployment URL

3. **After:**
   - [ ] Clear your cache
   - [ ] Test in incognito
   - [ ] Test on mobile
   - [ ] Verify service worker updated
   - [ ] Test offline mode

---

**Remember:** PWA caching is aggressive by design (for offline support). Always increment version and test thoroughly!
