# 🔧 Flickering Fix V2 - Critical Updates

## Root Cause (Identified)

The flickering was caused by **constant hash recalculation**:

1. `markAsViewed()` updates `viewedAt` timestamp
2. `progressListHash` includes `Math.floor(p.viewedAt / 1000)` in hash
3. Every time `markAsViewed` updates timestamp, hash changes
4. Hash change → Context re-renders → All consumers re-render → Flickering

## Critical Fixes Applied

### 1. **Stable Hash Without Timestamps** ✅
**File:** `contexts/app-context.tsx`

- **BEFORE:** Hash included `Math.floor(p.viewedAt / 1000)` - changed every second
- **AFTER:** Hash only includes whether bias is viewed (`viewedAt > 0 ? '1' : '0'`)
- Hash now only changes when:
  - New bias is viewed (0 → 1)
  - Mastered status changes
  - Progress list length changes

```typescript
// OLD (caused flickering):
const hash = sorted.map(p => `${p.biasId}:${p.mastered ? '1' : '0'}:${Math.floor(p.viewedAt / 1000)}`).join(',')

// NEW (stable):
const hash = sorted.map(p => `${p.biasId}:${p.mastered ? '1' : '0'}:${p.viewedAt > 0 ? '1' : '0'}`).join(',')
```

### 2. **Prevent Frequent Updates** ✅
**File:** `hooks/use-progress.ts`

- Increased duplicate check window: 5 seconds → **30 seconds**
- Only update state if bias hasn't been viewed OR it's been > 10 seconds
- Skip state update entirely if already viewed recently
- Return early without database call if recently viewed

```typescript
// Only update if not already viewed recently
const recentlyViewed = existing && existing.viewedAt > 0 && (now - existing.viewedAt) < 30000 // 30 seconds

if (recentlyViewed) {
  return Promise.resolve() // Skip entirely
}
```

### 3. **Increased Debounce Times** ✅
**Files:** `app/page.tsx`, `hooks/use-progress.ts`

- `markAsViewed` debounce: 1000ms → **2000ms**
- Background reload debounce: 2000ms → **10000ms (10 seconds)**

### 4. **Smarter State Updates** ✅
**File:** `hooks/use-progress.ts`

- Only update state if bias hasn't been viewed yet OR it's been > 10 seconds
- Return same array reference if no update needed
- Prevents unnecessary re-renders

## Expected Results

✅ **No flickering** - Hash only changes when meaningful data changes  
✅ **No constant updates** - markAsViewed skips if already viewed recently  
✅ **Stable context** - Context only re-renders when hash actually changes  

## Testing

1. **Build and run:**
   ```bash
   pnpm build
   pnpm android:sync
   pnpm android:run
   ```

2. **Test:**
   - Navigate to Bias Daily screen
   - Leave screen idle for 30+ seconds
   - Watch for any flickering or blinking
   - Should see **ZERO flickering** - screen should be completely stable

---

**Critical fixes applied. Hash is now stable and won't change on every markAsViewed call!**

