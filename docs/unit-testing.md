# Unit Testing Guide

This document describes the unit testing setup for the DailyBias web application.

## Overview

We use **Vitest** as our test runner with **React Testing Library** for component testing. All tests are deterministic with fixed time mocking to ensure consistent results across runs.

## Test Stack

- **Vitest** - Fast test runner (Vite-based)
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom Jest DOM matchers
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM environment for tests

## Running Tests

### Local Development (Watch Mode)
```bash
pnpm test
```
Runs tests in watch mode - automatically re-runs when files change.

### CI Mode (Single Run)
```bash
pnpm test:run
```
Runs all tests once and exits. Use this in CI/CD pipelines.

### Test Coverage
```bash
pnpm test:coverage
```
Generates a coverage report showing which code is tested.

### Interactive UI
```bash
pnpm test:ui
```
Launches Vitest UI for an interactive testing experience.

## Test Organization

Tests are located in the `__tests__/` directory, mirroring the source structure:

```
__tests__/
├── components/        # Component tests
├── hooks/            # Hook tests
├── lib/              # Utility/logic tests
└── pages/            # Page component tests
```

## Deterministic Time Mocking

All tests use a **fixed date** to ensure deterministic results:

- **Fixed Date**: `2025-12-05T08:00:00+05:30` (Asia/Kolkata timezone)
- **Fixed Date String**: `2025-12-05`

This ensures that:
- Date-dependent logic (like "bias of the day" selection) produces consistent results
- Tests don't fail due to time-of-day or timezone differences
- Tests can be run at any time and produce identical results

### Using Fixed Time in Tests

The fixed time constants are exported from `vitest.setup.ts`:

```typescript
import { TEST_FIXED_DATE, TEST_FIXED_TIMESTAMP, TEST_FIXED_DATE_STRING } from '@/vitest.setup'

// Use fixed timestamp for Date.now() calls
const progress = {
  viewedAt: TEST_FIXED_TIMESTAMP,
  // ...
}

// Use fixed date string for date-based logic
const bias = getDailyBias(allBiases, TEST_FIXED_DATE_STRING)
```

## Test Patterns

### Logic Tests (Pure Functions)

Test pure utility functions and business logic:

```typescript
import { describe, it, expect } from 'vitest'
import { getDailyBias } from '@/lib/daily-selector'

describe('getDailyBias', () => {
  it('should return a bias deterministically for a date', () => {
    const bias1 = getDailyBias(mockBiases, '2025-12-05')
    const bias2 = getDailyBias(mockBiases, '2025-12-05')
    expect(bias1.id).toBe(bias2.id) // Same date = same bias
  })
})
```

### Component Tests

Test component rendering and user interactions:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BiasCard } from '@/components/bias-card'

describe('BiasCard', () => {
  it('should render bias title', () => {
    render(<BiasCard bias={mockBias} />)
    expect(screen.getByText('Confirmation Bias')).toBeInTheDocument()
  })

  it('should call onToggleFavorite when clicked', async () => {
    const user = userEvent.setup()
    const mockToggle = vi.fn()
    render(<BiasCard bias={mockBias} onToggleFavorite={mockToggle} />)
    
    const favoriteButton = screen.getByLabelText('Add to favorites')
    await user.click(favoriteButton)
    
    expect(mockToggle).toHaveBeenCalledTimes(1)
  })
})
```

### Hook Tests

Test custom React hooks:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce', () => {
  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    )
    
    rerender({ value: 'updated' })
    expect(result.current).toBe('initial') // Still initial
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe('updated')
  })
})
```

## Mocking

### Next.js Mocks

Next.js specific APIs are automatically mocked in `vitest.setup.ts`:
- `next/navigation` (router, pathname, searchParams)
- `next/image` (Image component)

### Browser APIs

Common browser APIs are mocked:
- `localStorage` - Full implementation with isolated storage per test
- `IndexedDB` - Basic mock
- `IntersectionObserver` - Mocked for scroll-based components
- `ResizeObserver` - Mocked for responsive components
- `SpeechSynthesis` - Mocked for voice features

### Custom Mocks

For component-specific dependencies, mock at the test level:

```typescript
vi.mock('@/hooks/use-speech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    stop: vi.fn(),
    isSpeaking: false,
    isEnabled: true,
    isSupported: true,
  }),
}))
```

## Test Guidelines

### What to Test

✅ **Do Test:**
- Pure functions and utility logic
- Component rendering with props
- User interactions (clicks, inputs)
- State changes and side effects
- Edge cases and error handling
- Date/time-dependent logic (with mocked time)

❌ **Don't Test:**
- Implementation details (internal state, private methods)
- Third-party library code
- Styling and CSS (unless behavior-related)
- Integration between multiple systems (use E2E for this)

### Best Practices

1. **Use accessible queries** - Prefer `getByRole`, `getByLabelText`, `getByText` over `getByTestId`
2. **Test behavior, not implementation** - Focus on what users see and do
3. **Keep tests isolated** - Each test should be independent
4. **Use descriptive test names** - "should call onToggleFavorite when favorite button is clicked"
5. **Clean up after tests** - Mocks and timers are automatically cleaned up

### Accessibility Testing

Our tests leverage accessibility attributes (ARIA labels, roles) for reliable selectors:

```typescript
// ✅ Good - uses accessible label
screen.getByLabelText('Add to favorites')

// ✅ Good - uses role
screen.getByRole('button', { name: 'Share' })

// ❌ Avoid - uses implementation detail
screen.getByTestId('favorite-button')
```

## Coverage Goals

Target coverage for critical paths:
- **Logic functions**: 80%+ coverage
- **Components**: Focus on user-facing behavior
- **Hooks**: Test all state transitions and edge cases

## Troubleshooting

### Tests failing due to time

If tests are flaky due to date/time:
- Ensure you're using `TEST_FIXED_TIMESTAMP` instead of `Date.now()`
- Check that `vitest.setup.ts` is properly configured

### Component not rendering

- Verify all required props are provided
- Check if component needs context providers
- Ensure mocks are set up for dependencies

### localStorage not working

- localStorage is automatically cleared between tests
- Use the mocked localStorage in `vitest.setup.ts`

## Running Specific Tests

Run a specific test file:
```bash
pnpm test bias-card.test.tsx
```

Run tests matching a pattern:
```bash
pnpm test --grep "BiasCard"
```

## Continuous Integration

In CI environments, use:
```bash
pnpm test:run
```

This runs all tests once without watch mode, perfect for automated pipelines.

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

