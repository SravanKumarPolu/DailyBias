# Testing System Verification Checklist

## Quick Verification

Run these commands to verify the testing system is working:

```bash
# 1. Unit & Integration Tests
pnpm test:run
# Expected: All tests pass, <30 seconds

# 2. E2E Tests (Chromium)
pnpm e2e --project=chromium
# Expected: All E2E tests pass, <5 minutes

# 3. Accessibility Tests
pnpm test:a11y
# Expected: No serious a11y violations

# 4. Visual Regression
pnpm e2e:visual
# Expected: Visual snapshots match or can be updated

# 5. Mobile Emulation
pnpm e2e --project=mobile-chrome
# Expected: Mobile tests pass

# 6. All Tests
pnpm test:all
# Expected: Unit + Integration + E2E (Chromium + Mobile) pass
```

## Date-Dependent Test Verification

Verify date mocking works correctly:

```bash
# Run a test that uses dates
pnpm test:run __tests__/lib/daily-selector.test.ts

# Check that dates are consistent
# All tests should use 2025-12-05 (fixed date)
```

## CI Workflow Verification

1. Push to a branch or create a PR
2. Check GitHub Actions:
   - `.github/workflows/comprehensive-tests.yml` should run
   - All jobs should pass (or non-blocking jobs may have warnings)

## File Structure Verification

Verify these files exist:

- ✅ `/docs/testing.md` - Testing strategy document
- ✅ `/docs/mobile-testing-checklist.md` - Mobile testing checklist
- ✅ `vitest.setup.ts` - Enhanced with date mocking
- ✅ `tests/e2e/` - All E2E test files
- ✅ `tests/load/load-test.js` - k6 load test
- ✅ `scripts/lighthouse-test.js` - Lighthouse script
- ✅ `scripts/security-check.sh` - Security script
- ✅ `.github/workflows/comprehensive-tests.yml` - CI workflow

## Test Coverage Verification

Check that all 20 testing types are covered:

1. ✅ Unit - `pnpm test:unit`
2. ✅ Integration - `pnpm test:integration`
3. ✅ E2E - `pnpm e2e`
4. ✅ Smoke - `tests/e2e/smoke.spec.ts`
5. ✅ Sanity - `__tests__/sanity-comprehensive.test.tsx`
6. ✅ Regression - `__tests__/regression/`, `tests/e2e/`
7. ✅ UI - `__tests__/ui/`
8. ✅ Visual Regression - `pnpm e2e:visual`
9. ✅ Accessibility - `pnpm test:a11y`
10. ✅ Responsiveness - `tests/e2e/responsive.spec.ts`
11. ✅ Cross-Browser - CI runs on 3 browsers
12. ✅ API - `__tests__/lib/db.test.ts`
13. ✅ Load/Stress - `pnpm test:load`
14. ✅ Security - `pnpm test:security`
15. ✅ Contract - `pnpm type-check`
16. ✅ Mobile - `tests/e2e/mobile-emulation.spec.ts` + Manual
17. ⚠️ Device - Manual only (see checklist)
18. ⚠️ Usability - Manual only
19. ⚠️ Beta - External testing
20. ⚠️ Localization - Manual (i18n not implemented)

## Common Issues & Fixes

### Issue: Tests fail due to date
**Fix:** Ensure `vitest.setup.ts` mocks are active. Check that `getTodayDateString()` is mocked.

### Issue: E2E tests timeout
**Fix:** Increase timeout in `playwright.config.ts` or check web server starts correctly.

### Issue: Visual regression failures
**Fix:** Review screenshots, update if intentional: `pnpm e2e:visual:update`

### Issue: IndexedDB errors
**Fix:** Ensure `fake-indexeddb/auto` is imported first in `vitest.setup.ts`

## Success Criteria

✅ All unit tests pass  
✅ All integration tests pass  
✅ E2E tests pass on Chromium  
✅ Accessibility tests pass  
✅ Visual regression snapshots exist  
✅ Mobile emulation tests pass  
✅ CI workflows run successfully  
✅ Date-dependent tests are deterministic  
✅ Documentation is complete  

## Next Steps After Verification

1. Monitor CI runs for flakiness
2. Review test coverage reports
3. Update visual snapshots if UI changes are intentional
4. Expand test coverage for new features
5. Set up performance budgets

