# 🔧 Flickering Fix - Root Cause & Solution

## Root Cause Identified

The flickering was caused by a **cascade of re-renders**:

1. `markAsViewed()` is called when a bias is displayed
2. `markAsViewed()` updates `progressList` state optimistically
3. `progressList.length` is in the context dependencies
4. Context re-renders when `progressList` changes
5. All context consumers re-render (including the entire page)
6. This causes visible flickering on Android

## Fixes Applied

### 1. **Stable ProgressList Hash in Context** ✅
**File:** `contexts/app-context.tsx`

- Created `progressListHash` that only changes when meaningful progress data changes
- Context now depends on hash instead of `progressList.length`
- Prevents re-renders when array reference changes but content is same

```typescript
const progressListHash = useMemo(() => {
  if (progressHook.progressList.length === 0) return '0'
  const sorted = [...progressHook.progressList].sort((a, b) => a.biasId.localeCompare(b.biasId))
  const hash = sorted.map(p => `${p.biasId}:${p.mastered ? '1' : '0'}:${Math.floor(p.viewedAt / 1000)}`).join(',')
  return `${progressHook.progressList.length}-${progressHook.progressList.filter(p => p.mastered).length}-${hash}`
}, [progressHook.progressList])
```

### 2. **Smarter markAsViewed Updates** ✅
**File:** `hooks/use-progress.ts`

- Only update state if value actually changed (prevent unnecessary re-renders)
- Increased duplicate check window from 1 second to 5 seconds
- Made database save non-blocking (doesn't wait for it)
- Increased background reload debounce to 2 seconds

```typescript
// Only update if the value actually changed
const needsUpdate = !existing || existing.viewedAt < now - 1000
if (needsUpdate) {
  setProgressList((prev) => {
    // ... only update if actually changed
    if (existing.viewedAt === now) {
      return prev // No change, return same array reference
    }
    // ... update logic
  })
}
```

### 3. **Increased Debounce Times** ✅
**Files:** `app/page.tsx`, `hooks/use-progress.ts`

- Increased `markAsViewed` debounce from 500ms to 1000ms
- Increased background reload debounce from 1000ms to 2000ms
- Added double-check to prevent duplicate calls

### 4. **More Aggressive Skeleton Prevention** ✅
**File:** `app/page.tsx`

- Once content is shown, never show skeleton again
- Prevents flickering when context re-renders

```typescript
if (hasShownContentRef.current) {
  return false // Never show skeleton again once content has been shown
}
```

## Expected Results

✅ **No flickering** - Screen stays stable when idle  
✅ **No unnecessary re-renders** - Context only re-renders when meaningful data changes  
✅ **Smooth updates** - Progress updates happen in background without blocking UI  

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
   - Should see NO flickering

---

**All flickering fixes applied. Ready for testing!**

