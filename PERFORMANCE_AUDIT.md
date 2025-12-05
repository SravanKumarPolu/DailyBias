# Performance Optimization Audit

**Date:** January 2025  
**Status:** In Progress

## Current Performance Metrics

- **Bundle Size:** 942MB node_modules (large)
- **Code Splitting:** ✅ Configured in next.config.mjs
- **Memoization:** ⚠️ Limited use of React.memo and useMemo
- **Data Fetching:** ⚠️ Some inefficient patterns

## Issues Found

### 1. ⚠️ CRITICAL: Expensive State Loading in AllBiasesPage
**File:** `app/all/page.tsx`

**Issue:** Loading favorite/mastered states for ALL biases on every render
- Makes N async calls (where N = number of biases)
- Runs on every `allBiases` change
- No caching or batching

**Impact:** High - Can cause 50+ async calls on page load

### 2. ⚠️ Missing React.memo on Expensive Components
**Files:**
- `components/bias-card.tsx` - Renders frequently, not memoized
- Other frequently rendered components

**Impact:** Medium - Unnecessary re-renders

### 3. ⚠️ Unmemoized Expensive Calculations
**Files:**
- `app/page.tsx` - Seed calculation on every render
- `app/all/page.tsx` - avgScore calculation not memoized
- `lib/daily-selector.ts` - Personalized bias selection recalculates

**Impact:** Medium - CPU waste on every render

### 4. ⚠️ Inefficient Data Fetching
**File:** `app/all/page.tsx`

**Issue:** 
- Loading states for all biases individually
- No batching or caching
- Runs on every favorites change

**Impact:** High - Network/DB overhead

### 5. ⚠️ Missing Code Splitting
**Files:** Some heavy components not dynamically imported

**Impact:** Low-Medium - Larger initial bundle

### 6. ⚠️ Large Bundle Size
**Issue:** 942MB node_modules suggests large dependencies

**Impact:** Medium - Slower installs, larger bundles

## Fixes Applied

### ✅ 1. Optimized State Loading in AllBiasesPage
**File:** `app/all/page.tsx`

**Changes:**
- Use favorites from context instead of loading individually (eliminates N async calls)
- Only load mastered states for new biases (tracked with ref)
- Batch load mastered states
- Memoize favorites map calculation

**Impact:** Reduced from 50+ async calls to only new biases

### ✅ 2. Added React.memo to BiasCard
**File:** `components/bias-card.tsx`

**Changes:**
- Wrapped BiasCard with React.memo
- Custom comparison function for optimal re-render prevention

**Impact:** Prevents unnecessary re-renders of frequently used component

### ✅ 3. Memoized Expensive Calculations
**Files:**
- `app/page.tsx` - Memoized seed calculation
- `app/all/page.tsx` - Memoized avgScore calculation

**Impact:** Prevents recalculation on every render

### ✅ 4. Optimized Data Fetching
**File:** `app/all/page.tsx`

**Changes:**
- Use context favorites instead of individual calls
- Track loaded bias IDs to avoid redundant calls
- Batch load mastered states

**Impact:** Significant reduction in database calls

### ⏳ 5. Code Splitting
**Status:** Already configured in `next.config.mjs`

### ⏳ 6. Bundle Size
**Status:** Requires dependency audit (future work)

