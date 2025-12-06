# Testing Documentation

This document describes the testing setup for DailyBias, including Visual Regression Testing and Accessibility Testing.

## Visual Regression Testing

Visual regression tests use Playwright to capture screenshots and compare them against baseline images. This ensures that UI changes don't introduce unintended visual regressions.

### Running Visual Regression Tests

```bash
# Run visual regression tests
pnpm e2e:visual

# Update baseline screenshots (when intentional changes are made)
pnpm e2e:visual:update
```

### Test Coverage

- **Page-level snapshots**: All major pages (daily, all, favorites, settings, analytics)
- **Component-level snapshots**: Bias card, navigation components
- **Responsive snapshots**: Mobile (375x667), tablet (768x1024), desktop
- **Theme snapshots**: Light mode and dark mode variants

### Test Files

- `tests/e2e/visual-regression.spec.ts` - Main visual regression test suite

### Configuration

Visual regression settings are configured in `playwright.config.ts`:
- `maxDiffPixels: 100` - Allows small rendering differences
- `threshold: 0.2` - Pixel comparison threshold

## Accessibility Testing

Accessibility tests ensure the application is usable by people with disabilities and complies with WCAG guidelines.

### E2E Accessibility Tests

Uses `@axe-core/playwright` to scan pages for accessibility violations.

```bash
# Run E2E accessibility tests
pnpm test:a11y
```

### Unit-Level Accessibility Tests

Uses `jest-axe` to test individual components for accessibility issues.

```bash
# Run unit-level accessibility tests
pnpm test:a11y:unit
```

### Test Coverage

**E2E Tests** (`tests/e2e/accessibility.spec.ts`):
- Daily page accessibility scan
- All pages accessibility scan
- Settings page accessibility scan
- Analytics page accessibility scan
- ARIA label verification
- Keyboard navigation testing
- Heading hierarchy validation
- Image alt text verification

**Unit Tests** (`__tests__/components/*.a11y.test.tsx`):
- Component-level accessibility scans
- ARIA attribute verification
- Semantic HTML structure validation

### Accessibility Standards

Tests check for compliance with:
- WCAG 2.1 Level A
- WCAG 2.1 Level AA
- Best practices

### Known Exclusions

Some violations are excluded from failing tests (but still logged):
- `aria-allowed-attr` on collapsible triggers (UI library limitation)
- `aria-progressbar-name` (loading indicators, less critical)
- `button-name` (icon-only buttons, can be fixed separately)
- `color-contrast` (design issue, addressed separately)

## CI/CD Integration

Both visual regression and accessibility tests are integrated into the GitHub Actions workflow:

- **Visual Regression Job**: Runs on every push/PR, uploads test results as artifacts
- **Accessibility Job**: Runs E2E and unit-level accessibility tests, uploads results

See `.github/workflows/code-quality.yml` for details.

## Best Practices

1. **Update baselines intentionally**: When making intentional UI changes, update visual regression baselines using `pnpm e2e:visual:update`

2. **Fix accessibility issues**: Address serious accessibility violations before merging PRs

3. **Test locally first**: Run tests locally before pushing to catch issues early

4. **Review test artifacts**: In CI, review uploaded test results to understand failures

## Troubleshooting

### Visual Regression Tests Failing

- Check if changes are intentional - if so, update baselines
- Verify viewport sizes match expected dimensions
- Ensure animations have completed before screenshots

### Accessibility Tests Failing

- Review console output for specific violations
- Check ARIA labels and semantic HTML structure
- Verify keyboard navigation works correctly
- Ensure images have alt text or are marked decorative

