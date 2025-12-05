# E2E Testing Troubleshooting Guide

## Issue: Tests Hang When Running `pnpm e2e`

If your E2E tests appear to hang (no output for several minutes), here are the likely causes and solutions:

### Common Causes

1. **Dev Server Taking Too Long to Start**
   - Next.js dev server can take 1-3 minutes to compile on first run
   - The server needs to compile TypeScript, bundle code, and start up

2. **Port 3000 Already in Use**
   - Another process might be using port 3000
   - Playwright tries to reuse existing servers but might fail if the server isn't responding

3. **Silent Errors**
   - Build errors might not be visible if output is suppressed
   - TypeScript or linting errors can prevent the server from starting

### Solutions

#### Option 1: Run Server Manually (Recommended for Debugging)

1. **Start the dev server in a separate terminal:**
   ```bash
   pnpm dev
   ```
   Wait until you see "Ready" message (usually takes 30-60 seconds)

2. **Run tests with server reuse:**
   ```bash
   SKIP_WEBSERVER=1 pnpm e2e
   ```
   Or use the shortcut:
   ```bash
   pnpm e2e:manual
   ```

#### Option 2: Check What's Happening

1. **Run the diagnostic script:**
   ```bash
   pnpm e2e:check
   ```
   This will check port availability and setup

2. **Kill processes on port 3000 if needed:**
   ```bash
   kill -9 $(lsof -ti:3000)
   ```

3. **Try running with verbose output:**
   ```bash
   pnpm e2e --reporter=list
   ```

#### Option 3: Use UI Mode (Easier Debugging)

```bash
pnpm e2e:ui
```

This opens Playwright's UI where you can see what's happening in real-time.

#### Option 4: Run in Headed Mode (See Browser)

```bash
pnpm e2e:headed
```

This shows the browser while tests run, which helps debug issues.

### Configuration Details

The Playwright config (`playwright.config.ts`) is set to:
- **Timeout**: 180 seconds (3 minutes) for server startup
- **Output**: Shows stdout/stderr in local development
- **Reuse Server**: Reuses existing server if available (not in CI)

### Quick Fixes

**If tests hang:**
1. Press `Ctrl+C` to stop
2. Check if port 3000 is in use: `lsof -ti:3000`
3. Kill processes if needed: `kill -9 $(lsof -ti:3000)`
4. Try manual mode: `SKIP_WEBSERVER=1 pnpm e2e`

**If server won't start:**
1. Check for TypeScript errors: `pnpm type-check`
2. Check for linting errors: `pnpm lint`
3. Try cleaning and rebuilding: `pnpm clean && pnpm build`

### Expected Behavior

- **First run**: Can take 2-3 minutes (compilation + server startup)
- **Subsequent runs**: Should be faster (30-60 seconds) due to caching
- **Output**: You should see compilation progress and "Ready" message

### Still Having Issues?

1. Check the Playwright report: `npx playwright show-report`
2. Check browser console in headed mode
3. Verify Next.js dev server works: `pnpm dev` (in separate terminal)
4. Check Playwright installation: `npx playwright install chromium`

