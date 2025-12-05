# Architecture Audit Report

## Executive Summary

This audit identifies architectural issues and provides recommendations for improving code quality, maintainability, and performance.

## Critical Issues

### 1. State Management Complexity
**Location:** `app/page.tsx`, `contexts/app-context.tsx`

**Issues:**
- Overly complex state management with multiple refs and workarounds
- Hash-based memoization to prevent re-renders (indicates architectural problem)
- 550+ lines in single component with complex logic
- Multiple state synchronization mechanisms (refs, memoization, effects)

**Impact:** High - Causes performance issues, flickering, and maintenance burden

**Recommendation:** 
- Extract daily bias selection logic to a custom hook
- Simplify context dependencies
- Use proper state management patterns

### 2. Storage Pattern Inconsistency
**Location:** `lib/storage.ts`, `lib/db.ts`

**Issues:**
- Daily bias cache uses localStorage
- All other data uses IndexedDB
- Inconsistent error handling between storage methods
- No unified storage abstraction

**Impact:** Medium - Makes data management confusing and error-prone

**Recommendation:**
- Consolidate to single storage pattern (IndexedDB)
- Create unified storage abstraction layer

### 3. Excessive ESLint Disables
**Location:** Multiple files (17 instances across 11 files)

**Issues:**
- Many `eslint-disable-next-line react-hooks/exhaustive-deps` comments
- Indicates dependency array problems
- Suggests architectural issues with hook dependencies

**Impact:** Medium - Hides real dependency issues, potential bugs

**Recommendation:**
- Fix root causes of dependency issues
- Remove unnecessary disables
- Use proper dependency arrays

### 4. Complex Component Logic
**Location:** `app/page.tsx`

**Issues:**
- 550+ lines in single component
- Multiple responsibilities (data fetching, state management, rendering)
- Complex memoization and ref management
- Difficult to test and maintain

**Impact:** High - Maintenance burden, testing difficulty

**Recommendation:**
- Extract custom hooks for daily bias logic
- Split into smaller components
- Separate concerns

### 5. Inconsistent Error Handling
**Location:** Multiple files

**Issues:**
- Some errors are logged and swallowed
- Some errors show toasts
- Inconsistent error recovery strategies
- No centralized error handling

**Impact:** Medium - Poor user experience, difficult debugging

**Recommendation:**
- Create error boundary strategy
- Standardize error handling patterns
- Implement proper error recovery

### 6. Type Safety Issues
**Location:** Multiple files

**Issues:**
- Some `any` types or loose typing
- Missing null checks in some places
- Inconsistent type guards

**Impact:** Low-Medium - Potential runtime errors

**Recommendation:**
- Strengthen type definitions
- Add proper type guards
- Enable stricter TypeScript checks

## Medium Priority Issues

### 7. Code Duplication
- Similar patterns in multiple hooks
- Repeated error handling code
- Duplicate state management logic

### 8. Performance Optimizations
- Too many re-renders (addressed with hashes, but indicates problem)
- Large bundle size potential
- Inefficient memoization strategies

### 9. Testing Gaps
- Complex components difficult to test
- No clear separation of concerns
- Missing unit tests for business logic

## Recommendations Priority

1. **High Priority:**
   - Simplify state management in `app/page.tsx`
   - Fix context re-render issues properly
   - Consolidate storage patterns

2. **Medium Priority:**
   - Remove eslint-disable comments by fixing root causes
   - Improve error handling consistency
   - Extract complex logic to hooks

3. **Low Priority:**
   - Improve type safety
   - Reduce code duplication
   - Add comprehensive tests

## Implementation Plan

1. ✅ Create custom hook for daily bias selection
2. ✅ Simplify app context dependencies
3. ✅ Consolidate storage to IndexedDB
4. ✅ Fix dependency arrays properly
5. ✅ Extract complex logic from components
6. ✅ Standardize error handling

## Fixes Applied

### 1. State Management Improvements
- **Created `useDailyBias` hook** - Extracted complex daily bias selection logic from `app/page.tsx`
- **Simplified context dependencies** - Removed hash-based memoization, used proper dependency arrays
- **Reduced `app/page.tsx` from 550+ lines to ~150 lines** - Much more maintainable

### 2. Storage Consolidation
- **Migrated daily bias cache to IndexedDB** - Now consistent with rest of app
- **Maintained localStorage fallback** - For synchronous access during initial render
- **Added migration logic** - Automatically migrates from localStorage to IndexedDB

### 3. Code Quality Improvements
- **Fixed eslint-disable comments** - Removed unnecessary ones, fixed dependency arrays properly
- **Improved error handling** - Created centralized error handling utility
- **Better separation of concerns** - Logic extracted to hooks, components focus on rendering

### 4. Performance Optimizations
- **Proper memoization** - Using stable keys instead of hash workarounds
- **Reduced re-renders** - Fixed context dependencies to prevent unnecessary updates
- **Simplified state management** - Less complex refs and workarounds

## Remaining Recommendations

1. **Type Safety** - Continue strengthening type definitions
2. **Testing** - Add comprehensive tests for new hooks
3. **Documentation** - Document new hooks and patterns
4. **Performance Monitoring** - Add performance metrics to track improvements

