#!/bin/bash

# 🔍 Bias Daily Diagnostics Script
# Collects system and project information for troubleshooting

echo "🔍 Bias Daily Diagnostics"
echo "========================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check command availability
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        return 1
    fi
}

# Function to check version
check_version() {
    if command -v $1 &> /dev/null; then
        version=$($1 --version 2>/dev/null | head -n 1)
        echo "  Version: $version"
    fi
}

echo "📋 System Information"
echo "-------------------"
echo "OS: $(uname -s) $(uname -r)"
echo "Architecture: $(uname -m)"
echo ""

echo "🔧 Prerequisites Check"
echo "---------------------"
check_command "node"
check_version "node"
echo ""

check_command "pnpm"
check_version "pnpm"
echo ""

check_command "git"
check_version "git"
echo ""

# Check Node.js version
if command -v node &> /dev/null; then
    node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -ge 20 ]; then
        echo -e "${GREEN}✓${NC} Node.js version is 20+ (required)"
    else
        echo -e "${YELLOW}⚠${NC} Node.js version should be 20+ (current: $(node --version))"
    fi
fi
echo ""

echo "📦 Project Status"
echo "---------------"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json exists"
    echo "  Project: $(grep '"name"' package.json | cut -d'"' -f4)"
    echo "  Version: $(grep '"version"' package.json | cut -d'"' -f4)"
else
    echo -e "${RED}✗${NC} package.json not found"
fi
echo ""

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
    module_count=$(find node_modules -maxdepth 1 -type d | wc -l)
    echo "  Installed packages: $((module_count - 1))"
else
    echo -e "${YELLOW}⚠${NC} node_modules not found - run 'pnpm install'"
fi
echo ""

if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"
    env_vars=$(grep -c "^NEXT_PUBLIC_" .env.local 2>/dev/null || echo "0")
    echo "  Environment variables: $env_vars"
else
    echo -e "${YELLOW}⚠${NC} .env.local not found (optional)"
fi
echo ""

echo "🏗️ Build Status"
echo "--------------"
if [ -d ".next" ]; then
    echo -e "${GREEN}✓${NC} .next directory exists (dev build)"
else
    echo -e "${YELLOW}⚠${NC} .next directory not found (run 'pnpm dev' first)"
fi
echo ""

if [ -d "out" ]; then
    echo -e "${GREEN}✓${NC} out directory exists (production build)"
    file_count=$(find out -type f | wc -l)
    echo "  Files: $file_count"
    
    # Check for service worker files (should not exist)
    if [ -f "out/sw.js" ] || [ -f "out/workbox-*.js" ]; then
        echo -e "${YELLOW}⚠${NC} Service worker files found (should be removed)"
    else
        echo -e "${GREEN}✓${NC} No service worker files (correct)"
    fi
else
    echo -e "${YELLOW}⚠${NC} out directory not found (run 'pnpm build' first)"
fi
echo ""


echo "🔍 Configuration Check"
echo "---------------------"
if [ -f "next.config.mjs" ]; then
    echo -e "${GREEN}✓${NC} next.config.mjs exists"
    if grep -q "output: 'export'" next.config.mjs; then
        echo -e "${GREEN}✓${NC} Static export enabled"
    else
        echo -e "${YELLOW}⚠${NC} Static export may not be enabled"
    fi
    
    if grep -q "next-pwa" next.config.mjs; then
        echo -e "${RED}✗${NC} next-pwa found in config (should be removed)"
    else
        echo -e "${GREEN}✓${NC} No PWA dependencies (correct)"
    fi
else
    echo -e "${RED}✗${NC} next.config.mjs not found"
fi
echo ""

echo "📊 Quick Health Check"
echo "-------------------"
issues=0

# Check for common issues
if [ ! -d "node_modules" ]; then
    echo -e "${RED}✗${NC} Dependencies not installed"
    issues=$((issues + 1))
fi


if [ -f "out/sw.js" ]; then
    echo -e "${YELLOW}⚠${NC} Old service worker files present"
    issues=$((issues + 1))
fi

if [ $issues -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No critical issues found"
else
    echo -e "${YELLOW}⚠${NC} Found $issues issue(s) - review above"
fi
echo ""

echo "💡 Quick Fixes"
echo "-------------"
echo "If issues found, try:"
echo "  1. pnpm install          # Install dependencies"
echo "  2. pnpm clean:build      # Clean and rebuild"
echo "  3. pnpm build            # Build for production"
echo "  4. Check TROUBLESHOOTING.md for more help"
echo ""

echo "✅ Diagnostics complete!"
echo ""
echo "For more help, see:"
echo "  - README.md"
echo "  - TROUBLESHOOTING.md"
echo "  - SUPPORT.md"

