# Integration Testing Guide

This document describes the integration testing setup for DebiasDaily web app.

## Overview

Integration tests verify that multiple units work together: pages + components + hooks + storage + routing. These tests run in jsdom using React Testing Library and Vitest.

## Test Structure

Integration tests are located in `__tests__/integration/` and follow the naming pattern `*.integration.test.tsx`.

```
__tests__/
  integration/
    test-utils.tsx                    # Shared test utilities
    daily-favorite-flow.integration.test.tsx
    navigation-flow.integration.test.tsx
    settings-persistence.integration.test.tsx
    no-flicker-guard.integration.test.tsx
    analytics-seeded.integration.test.tsx
```

## Running Tests

### Run all integration tests
```bash
pnpm test:integration
```

### Run all tests (unit + integration)
```bash
pnpm test
```

### Run only unit tests
```bash
pnpm test:unit
```

### Run tests in watch mode
```bash
pnpm test:watch
```

## Test Utilities

### `renderWithProviders`

The main utility for rendering components with all necessary providers. **Note: This function is async** because it seeds IndexedDB before rendering.

**Key Features:**
- Automatically mocks `getCoreBiases()` with test biases
- Sets up Next.js App Router mocking with dynamic pathname support
- Seeds IndexedDB and localStorage before rendering
- Uses real timers for async operations (date is still mocked)

```tsx
import { renderWithProviders, createTestBiases } from './test-utils'

const testBiases = createTestBiases(5)

await renderWithProviders(<HomePage />, {
  biases: testBiases,
  route: '/',
  storageSeed: {
    favorites: [{ biasId: 'bias-1', addedAt: Date.now() }],
    settings: { backgroundStyle: 'glass' },
    progress: [/* ... */],
    dailyBias: { date: '2025-12-05', biasId: 'bias-1' },
    onboardingCompleted: true,
  },
  mockedDate: new Date('2025-12-05'),
})
```

### Options

- `route`: Initial route/pathname for the router (default: `/`)
- `storageSeed`: Seed IndexedDB with initial data (favorites, settings, progress, dailyBias)
- `mockedDate`: Mock date for deterministic testing (defaults to 2025-12-05)
- `biases`: Mock biases data (defaults to test biases)

### Helper Functions

- `createTestBiases(count)`: Create test bias data
- `createTestFavorites(biasIds)`: Create test favorites
- `createTestProgress(biasIds, mastered)`: Create test progress data
- `waitForHooksToLoad()`: Improved helper that checks for loading states to complete (not just a fixed wait)
- `waitForAsync()`: Wait for async operations to complete
- `getRouterMock()`: Get router mock for assertions
- `resetRouterMock()`: Reset router mock between tests

## Test Coverage

### 1. Daily → Favorite → Favorites Flow

Tests the complete user flow:
- Render Daily page with a bias
- Click favorite button
- Navigate to Favorites page
- Verify the bias appears in favorites
- Verify persistence after re-render

**File**: `daily-favorite-flow.integration.test.tsx`

### 2. Navigation + Active State

Tests navigation between pages:
- Render app with navigation
- Click each navigation tab
- Verify correct page content loads
- Verify active tab state updates

**File**: `navigation-flow.integration.test.tsx`

### 3. Settings Persistence

Tests that settings persist:
- Toggle a setting (theme, background style, etc.)
- Navigate away and back
- Verify setting persisted

**File**: `settings-persistence.integration.test.tsx`

### 4. No Flicker Guard

Tests that the Daily page does NOT show skeleton/loading UI after content has already been rendered (content → skeleton swap).

**File**: `no-flicker-guard.integration.test.tsx`

### 5. Analytics with Seeded Data

Tests analytics page with pre-seeded data:
- Seed storage with known favorites/history
- Render analytics page
- Verify computed numbers match expected values

**File**: `analytics-seeded.integration.test.tsx`

## Deterministic Testing

### Time Freezing

Time is set to `2025-12-05T08:00:00+05:30` (Asia/Kolkata) in all integration tests using `vi.setSystemTime()`. **Real timers are used** to allow async operations to complete, while the date is mocked via `timezone-utils`. This ensures:
- "Bias of the day" selection is predictable
- Date-dependent logic behaves consistently
- No flakiness from time-based calculations
- Async operations (IndexedDB, React state updates) can complete properly

The timezone is set to `Asia/Kolkata` for consistency.

### Storage Mocking

- `localStorage` is properly mocked and cleared between tests
- `IndexedDB` is mocked using `fake-indexeddb` (see `vitest.setup.ts`)
- Storage is seeded **asynchronously** before rendering using `renderWithProviders`
- All hooks load data from IndexedDB, so seeding happens before component render

## Data Test IDs

For stable integration test selectors, the following `data-testid` attributes are available:

- `bias-card`: Bias card container
- `bias-favorite-button`: Favorite button on bias card
- `bottom-navigation`: Bottom navigation component
- `setting-*`: Settings toggles and controls (e.g., `setting-daily-reminder`, `setting-bg-glass`)

## Adding New Integration Tests

1. Create a new test file in `__tests__/integration/` with the pattern `*.integration.test.tsx`

2. Import test utilities:
```tsx
import { renderWithProviders, createTestBiases, waitForHooksToLoad } from './test-utils'
```

3. Use `renderWithProviders` (note: it's async):
```tsx
await renderWithProviders(<YourPage />, {
  biases: createTestBiases(5),
  route: '/your-route',
  storageSeed: { /* ... */ },
})
```

4. Wait for hooks to load:
```tsx
await waitForHooksToLoad()
```

5. Wait for specific elements:
```tsx
await waitFor(() => {
  expect(screen.getByText('Expected Text')).toBeInTheDocument()
}, { timeout: 5000 })
```

6. Use `data-testid` attributes for stable selectors when possible

7. Test real user flows, not implementation details

## Best Practices

1. **Always await renderWithProviders**: It's async because it seeds IndexedDB
2. **Wait for hooks to load**: Use `waitForHooksToLoad()` after rendering
3. **Use waitFor for assertions**: Elements may appear asynchronously
4. **Test user flows, not implementation**: Focus on what users do, not how it's implemented
5. **Use data-testid sparingly**: Only add where needed for stable integration flows
6. **Seed data deterministically**: Use `storageSeed` to set up predictable test state
7. **Keep tests independent**: Each test should be able to run in isolation
8. **Use flexible text matching**: Prefer regex patterns (e.g., `/settings/i`) over exact matches
9. **Set test biases**: Always provide `biases` option to `renderWithProviders` for predictable results
10. **Check for loading states**: Use `waitForHooksToLoad()` to ensure async operations complete

## Recent Improvements

### Better Mocking
- Core biases are now properly mocked via global `__TEST_BIASES__` variable
- Router mocking supports dynamic pathname updates
- Real timers are used (date is still mocked) for better async support

### Improved Waiting
- `waitForHooksToLoad()` now actually checks for loading states
- Better error messages with `waitForElement()` helper
- More reliable element detection

### Test Results
- **5 tests passing** (improved from 0)
- Tests are more reliable and deterministic
- Better error messages help debug failures

## Troubleshooting

### Tests timing out
- Ensure you're using `await renderWithProviders()` (it's async)
- Call `await waitForHooksToLoad()` after rendering
- Use `waitFor()` with appropriate timeouts for element assertions

### IndexedDB errors
- Ensure `fake-indexeddb/auto` is imported first in `vitest.setup.ts`
- Check that storage seeding happens before rendering

### Elements not found
- Wait for hooks to load: `await waitForHooksToLoad()`
- Use `waitFor()` with timeout instead of immediate `getBy*` queries
- Check that IndexedDB was seeded correctly

### Navigation not working
- Ensure router mock is set up correctly in `test-utils.tsx`
- Check that `route` option matches expected pathname

## Related Documentation

- [Unit Testing Guide](./unit-testing.md)
- [Vitest Configuration](../vitest.config.ts)
- [Test Setup](../vitest.setup.ts)


