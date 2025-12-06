# Bias Loading Issue in E2E Tests

## Problem

E2E tests are failing because biases aren't loading - the app shows "No bias available" error.

## Root Cause

The issue appears to be that `getCoreBiases()` returns an empty array in the Playwright test environment, even though:
- `data/biases.json` exists and has 50 biases
- The module loads correctly in Node.js
- The date is frozen correctly (2025-12-05)

## Possible Causes

1. **Module Loading Timing**: Next.js modules might not be fully initialized when the app tries to use them
2. **JSON Import Issue**: The `import coreBiasesData from "@/data/biases.json"` might not work correctly in Playwright
3. **Date Freezing Interference**: The date freezing might be interfering with module initialization
4. **React Hydration**: There might be a hydration mismatch causing the app to not load biases

## Current Status

- ✅ Date freezing is working correctly
- ✅ All test files use standardized date (2025-12-05)
- ❌ Biases aren't loading in test environment
- ❌ Tests fail because "No bias available"

## Attempted Fixes

1. Added longer wait times (3 seconds)
2. Added page reload retry logic
3. Added checks for biases availability
4. Increased timeouts

None of these have resolved the issue, suggesting it's a deeper module loading problem.

## Recommendations

1. **Investigate Module Loading**: Check if Next.js is bundling `biases.json` correctly in test environment
2. **Alternative Approach**: Consider loading biases differently in test environment (e.g., via API route or direct import)
3. **Mock Biases**: For E2E tests, consider mocking the biases module to ensure they're always available
4. **Check Next.js Config**: Verify that JSON imports are configured correctly for test environment

## Workaround

For now, tests will fail until the bias loading issue is resolved. The frozen date standardization is complete and working correctly.

