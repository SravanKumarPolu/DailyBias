# CI/CD Setup Documentation

## Overview

This project now has comprehensive CI/CD pipelines set up using GitHub Actions for continuous integration and Netlify for deployment.

## GitHub Actions Workflows

### 1. Main CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main`, `master`, or `develop` branches
- Pull requests to `main`, `master`, or `develop` branches

**Jobs:**

#### Test Suite
- Type checking with TypeScript
- Linting with ESLint
- Format checking with Prettier
- Unit tests
- Integration tests
- Regression tests
- UI tests
- Test coverage generation (uploaded to Codecov)

#### Build Check
- Full application build
- Verification that build output exists

**Status Badge:**
```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/badge.svg)
```

### 2. Regression & UI Tests (`.github/workflows/test-regression-ui.yml`)

**Triggers:**
- Push to `main`, `master`, or `develop` (only when relevant files change)
- Pull requests to `main`, `master`, or `develop` (only when relevant files change)
- Manual workflow dispatch

**Monitored Paths:**
- `app/**`
- `components/**`
- `hooks/**`
- `__tests__/**`
- `*.config.*`

**Jobs:**

#### Regression Tests
- Runs all regression tests in `__tests__/regression/`

#### UI Tests
- Runs all UI tests in `__tests__/ui/`

#### All Test Suites
- Runs after regression and UI tests pass
- Executes full test suite
- Generates test summary

**Status Badge:**
```markdown
![Regression & UI Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Regression%20%26%20UI%20Tests/badge.svg)
```

### 3. Code Quality (`.github/workflows/code-quality.yml`)

**Triggers:**
- Push to `main`, `master`, or `develop` branches
- Pull requests to `main`, `master`, or `develop` branches
- Manual workflow dispatch

**Jobs:**

#### Lint & Format Check
- ESLint validation
- Prettier format checking
- TypeScript type checking

#### Security Audit
- Dependency security audit
- Known vulnerability scanning

**Status Badge:**
```markdown
![Code Quality](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Code%20Quality/badge.svg)
```

## Netlify Deployment

### Configuration (`netlify.toml`)

**Build Process:**
1. Install dependencies (`pnpm install`)
2. Run all tests (`pnpm test:run`)
3. Build application (`pnpm build`)

**Build Environment:**
- Node.js version: 20
- Package manager: pnpm
- Output directory: `out`

**Features:**
- Automatic deployment on push to connected branch
- Preview deployments for pull requests
- Build optimization with Next.js plugin
- Security headers configured
- PWA manifest support

## Workflow Status

All workflows run automatically on:
- ✅ Push to main branches
- ✅ Pull requests
- ✅ Manual trigger (for regression/UI tests and code quality)

## Test Execution

### Local Testing
```bash
# Run all tests
pnpm test:run

# Run specific test suites
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests only
pnpm test:run __tests__/regression  # Regression tests
pnpm test:run __tests__/ui  # UI tests

# Run with coverage
pnpm test:coverage
```

### CI Testing
Tests run automatically in GitHub Actions:
1. Unit tests
2. Integration tests
3. Regression tests
4. UI tests
5. Coverage generation

## Deployment Process

### Automatic Deployment

1. **Push to Main Branch**
   - GitHub Actions runs full CI pipeline
   - If all tests pass, Netlify builds and deploys
   - If tests fail, deployment is blocked

2. **Pull Request**
   - GitHub Actions runs CI pipeline
   - Netlify creates preview deployment
   - Tests must pass before PR can be merged

### Manual Deployment

You can manually trigger deployments from:
- GitHub Actions (workflow_dispatch)
- Netlify dashboard
- Netlify CLI

## Required Status Checks

For PRs to be merged, the following checks must pass:
- ✅ Type checking
- ✅ Linting
- ✅ Format checking
- ✅ Unit tests
- ✅ Integration tests
- ✅ Regression tests
- ✅ UI tests
- ✅ Build check

## Environment Variables

### GitHub Actions

No environment variables required for testing. All tests use mocked dependencies.

### Netlify

Configure in Netlify dashboard under Site settings → Environment variables:
- `NEXT_PUBLIC_*` variables (if needed for build)
- `NODE_VERSION=20` (already set in netlify.toml)

## Monitoring

### GitHub Actions
- View workflow runs: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
- Check test results in Actions tab
- View test summaries in workflow run details

### Netlify
- View deployments: Netlify dashboard
- Check build logs for any issues
- Monitor deployment status

## Troubleshooting

### Tests Failing in CI

1. **Check workflow logs** in GitHub Actions
2. **Run tests locally** to reproduce:
   ```bash
   pnpm test:run
   ```
3. **Check for environment differences** (Node version, dependencies)
4. **Verify test mocks** are properly configured

### Build Failing in Netlify

1. **Check build logs** in Netlify dashboard
2. **Verify Node version** matches (20.x)
3. **Check for missing dependencies**
4. **Review Next.js build errors**

### Workflow Not Triggering

1. **Check branch names** match workflow triggers
2. **Verify file paths** for path-based triggers
3. **Check GitHub Actions permissions** in repo settings

## Best Practices

1. **Always run tests locally** before pushing
2. **Fix failing tests** before creating PRs
3. **Keep tests updated** as code changes
4. **Review test results** before merging PRs
5. **Monitor CI/CD pipelines** regularly

## Status Badges

Add these badges to your README.md:

```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/badge.svg)
![Regression & UI Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Regression%20%26%20UI%20Tests/badge.svg)
![Code Quality](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Code%20Quality/badge.svg)
![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_SITE_ID/deploy-status)
```

## Summary

✅ **Complete CI/CD Pipeline**
- Automated testing on every push/PR
- Regression and UI test coverage
- Code quality checks
- Security audits
- Automatic deployment to Netlify
- Build verification before deployment

All tests must pass before code can be merged or deployed, ensuring high code quality and preventing regressions.

