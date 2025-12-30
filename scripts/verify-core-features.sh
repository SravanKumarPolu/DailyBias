#!/bin/bash

# Core Features Verification Script
# This script verifies that all core features are intact and working

set -e

echo "🔍 Core Features Verification"
echo "============================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# Function to check if command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}❌ $1 not found${NC}"
        return 1
    fi
    return 0
}

# Function to run test and check result
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

# Check prerequisites
echo "📋 Checking prerequisites..."
check_command "node" || exit 1
check_command "pnpm" || exit 1
echo -e "${GREEN}✅ Prerequisites OK${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Not in project root directory${NC}"
    exit 1
fi

# 1. Type Check
echo "🔷 Type Checking..."
run_test "TypeScript compilation" "pnpm type-check"
echo ""

# 2. Linting
echo "🔷 Linting..."
run_test "ESLint" "pnpm lint"
echo ""

# 3. Unit Tests
echo "🔷 Unit Tests..."
run_test "Unit tests" "pnpm test:run"
echo ""

# 4. Integration Tests
echo "🔷 Integration Tests..."
run_test "Integration tests" "pnpm test:integration"
echo ""

# 5. Build Check
echo "🔷 Build Check..."
run_test "Production build" "pnpm build"
echo ""

# 6. Check Core Files Exist
echo "🔷 Core Files Check..."
check_file() {
    local file="$1"
    local name="$2"
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅ $name exists${NC}"
        return 0
    else
        echo -e "  ${RED}❌ $name missing: $file${NC}"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

check_file "app/page.tsx" "Daily page"
check_file "app/all/page.tsx" "All biases page"
check_file "app/favorites/page.tsx" "Favorites page"
check_file "app/add/page.tsx" "Add custom bias page"
check_file "app/analytics/page.tsx" "Analytics page"
check_file "app/settings/page.tsx" "Settings page"
check_file "app/onboarding/page.tsx" "Onboarding page"
check_file "hooks/use-daily-bias.ts" "Daily bias hook"
check_file "hooks/use-favorites.ts" "Favorites hook"
check_file "hooks/use-biases.ts" "Biases hook"
check_file "hooks/use-settings.ts" "Settings hook"
check_file "hooks/use-progress.ts" "Progress hook"
check_file "lib/daily-selector.ts" "Daily selector"
check_file "lib/db.ts" "Database utilities"
check_file "data/biases.json" "Bias data"
echo ""

# 7. Check Critical Exports
echo "🔷 Critical Exports Check..."
check_export() {
    local file="$1"
    local export_name="$2"
    if grep -q "export.*$export_name" "$file" 2>/dev/null; then
        echo -e "  ${GREEN}✅ $export_name exported from $file${NC}"
        return 0
    else
        echo -e "  ${YELLOW}⚠️  $export_name not found in $file${NC}"
        return 1
    fi
}

check_export "hooks/use-daily-bias.ts" "useDailyBias"
check_export "hooks/use-favorites.ts" "useFavorites"
check_export "hooks/use-biases.ts" "useBiases"
check_export "hooks/use-settings.ts" "useSettings"
check_export "hooks/use-progress.ts" "useProgress"
check_export "lib/daily-selector.ts" "getPersonalizedDailyBias"
echo ""

# Summary
echo "============================"
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✅ All core features verified!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run manual testing: pnpm dev"
    echo "  2. Test on mobile: pnpm mobile:build"
    echo "  3. Run E2E tests: pnpm e2e"
    exit 0
else
    echo -e "${RED}❌ $FAILURES verification(s) failed${NC}"
    echo ""
    echo "Please fix the issues above before proceeding."
    exit 1
fi









