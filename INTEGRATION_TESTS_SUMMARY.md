# Integration Tests Summary

## What Was Implemented

### 1. Test Infrastructure

- **Location**: `__tests__/integration/`
- **Test Utilities**: `test-utils.tsx` - Provides `renderWithProviders` function
- **Setup**: Updated `vitest.setup.ts` to properly use `fake-indexeddb`
- **Configuration**: Updated `vitest.config.ts` with proper timeouts and pool settings

### 2. Test Files Created

1. **`daily-favorite-flow.integration.test.tsx`** - Tests Daily → Favorite → Favorites flow
2. **`navigation-flow.integration.test.tsx`** - Tests navigation between pages
3. **`settings-persistence.integration.test.tsx`** - Tests settings persistence
4. **`no-flicker-guard.integration.test.tsx`** - Tests no flicker behavior
5. **`analytics-seeded.integration.test.tsx`** - Tests analytics with seeded data

### 3. Data Test IDs Added

- `bias-card`: Bias card container
- `bias-favorite-button`: Favorite button
- `bottom-navigation`: Bottom navigation component
- `setting-*`: Settings controls (e.g., `setting-bg-glass`, `setting-daily-reminder`)

### 4. Documentation

- **`docs/integration-testing.md`**: Complete guide on how to write and run integration tests

### 5. Scripts

- `pnpm test:integration`: Run only integration tests
- `pnpm test:unit`: Run only unit tests

## Current Status

**Tests are timing out** - This is likely due to:

1. **Async hook loading**: Components use `useApp()` which loads data from IndexedDB asynchronously
2. **Component complexity**: Pages have complex initialization logic that may need more time
3. **Test environment**: jsdom may need additional configuration for Next.js components

## Next Steps to Fix

### Option 1: Simplify Tests (Recommended)

Create simpler integration tests that:
- Test smaller, isolated flows
- Use mocked hooks instead of real IndexedDB
- Focus on component interactions rather than full page rendering

### Option 2: Fix Async Loading

1. Ensure `AppProvider` properly initializes in test environment
2. Add proper waiting strategies for hook loading
3. Mock hooks at a higher level if needed

### Option 3: Use MSW for API Mocking

If the app makes API calls, use MSW to mock them properly.

## Key Files Changed

1. **`vitest.setup.ts`**: Added `fake-indexeddb/auto` import, fixed SpeechSynthesis mock
2. **`vitest.config.ts`**: Added `testTimeout: 15000`, `pool: 'vmThreads'`, sequential execution
3. **`__tests__/integration/test-utils.tsx`**: Created async `renderWithProviders` utility
4. **`components/bias-card.tsx`**: Added `data-testid` attributes
5. **`components/navigation.tsx`**: Added `data-testid` attribute
6. **`app/settings/page.tsx`**: Added `data-testid` attributes to settings controls
7. **`package.json`**: Added `test:integration` and `test:unit` scripts

## How to Debug

1. Run a single test: `pnpm test:integration daily-favorite-flow`
2. Add console.logs in `renderWithProviders` to see if it completes
3. Check if components are actually rendering by inspecting the DOM
4. Verify IndexedDB is being seeded correctly

## Architecture

```
__tests__/integration/
├── test-utils.tsx              # Shared utilities (renderWithProviders, etc.)
├── daily-favorite-flow.integration.test.tsx
├── navigation-flow.integration.test.tsx
├── settings-persistence.integration.test.tsx
├── no-flicker-guard.integration.test.tsx
└── analytics-seeded.integration.test.tsx
```

## Test Utilities API

```tsx
// Main utility - async because it seeds IndexedDB
await renderWithProviders(<Component />, {
  route: '/',
  storageSeed: {
    favorites: [...],
    settings: {...},
    progress: [...],
    dailyBias: { date: '2025-12-05', biasId: 'bias-1' },
  },
  mockedDate: new Date('2025-12-05'),
  biases: createTestBiases(5),
})

// Helper functions
waitForHooksToLoad()  // Wait for async hooks
createTestBiases(count)
createTestFavorites(biasIds)
createTestProgress(biasIds, mastered)
getRouterMock()
resetRouterMock()
```

## Deterministic Testing

- **Time**: Frozen to `2025-12-05T08:00:00+05:30` (Asia/Kolkata)
- **Timezone**: Consistent `Asia/Kolkata` across all tests
- **Storage**: IndexedDB seeded before rendering
- **Date-dependent logic**: Predictable "bias of the day" selection


