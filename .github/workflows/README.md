# GitHub Actions Workflows

This directory contains all GitHub Actions workflows for CI/CD.

## Workflows

### 1. `ci.yml` - Main CI Pipeline
Runs on every push and pull request. Executes:
- Type checking
- Linting
- Format checking
- All test suites (unit, integration, regression, UI)
- Build verification

### 2. `test-regression-ui.yml` - Regression & UI Tests
Runs when UI/component files change. Focused on:
- Regression tests (critical user flows)
- UI tests (component interactions)
- Only triggers on relevant file changes for efficiency

### 3. `code-quality.yml` - Code Quality Checks
Runs on every push and PR. Checks:
- ESLint compliance
- Code formatting (Prettier)
- TypeScript type safety
- Security audits

## How It Works

1. **Push/PR** → Triggers workflows
2. **Tests Run** → All test suites execute
3. **Quality Checks** → Lint, format, types checked
4. **Results** → Status checks added to PR
5. **Deploy** → Netlify deploys if all checks pass

## Status Checks

PRs require all checks to pass before merging:
- ✅ Type check
- ✅ Lint
- ✅ Format
- ✅ Unit tests
- ✅ Integration tests
- ✅ Regression tests
- ✅ UI tests
- ✅ Build check

## Viewing Results

- Check Actions tab: `https://github.com/YOUR_REPO/actions`
- View workflow runs for each push/PR
- See detailed test results and logs

