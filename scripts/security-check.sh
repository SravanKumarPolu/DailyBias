#!/bin/bash

# Security check script for DebiasDaily
# Runs dependency audit, checks security headers, and basic security validations

set -e

echo "🔒 Running security checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any checks fail
FAILED=0

# 1. Dependency audit
echo -e "\n📦 Checking dependencies for vulnerabilities..."
if pnpm audit --audit-level=moderate 2>&1 | grep -q "found"; then
  echo -e "${RED}❌ Found vulnerabilities in dependencies${NC}"
  pnpm audit --audit-level=moderate
  FAILED=1
else
  echo -e "${GREEN}✅ No moderate or high severity vulnerabilities found${NC}"
fi

# 2. Check for known vulnerable packages
echo -e "\n🔍 Checking for known vulnerable packages..."
VULNERABLE_PACKAGES=(
  "node-forge"
  "minimist"
  "glob-parent"
)

for package in "${VULNERABLE_PACKAGES[@]}"; do
  if pnpm list "$package" 2>/dev/null | grep -q "$package"; then
    echo -e "${YELLOW}⚠️  Found potentially vulnerable package: $package${NC}"
    echo -e "   Consider updating or removing if not needed"
  fi
done

# 3. Security headers check (if server is running)
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo -e "\n🌐 Checking security headers..."
  
  HEADERS=$(curl -s -I http://localhost:3000)
  
  # Check for common security headers
  if echo "$HEADERS" | grep -qi "X-Frame-Options"; then
    echo -e "${GREEN}✅ X-Frame-Options header present${NC}"
  else
    echo -e "${YELLOW}⚠️  X-Frame-Options header not found${NC}"
  fi
  
  if echo "$HEADERS" | grep -qi "X-Content-Type-Options"; then
    echo -e "${GREEN}✅ X-Content-Type-Options header present${NC}"
  else
    echo -e "${YELLOW}⚠️  X-Content-Type-Options header not found${NC}"
  fi
  
  if echo "$HEADERS" | grep -qi "Content-Security-Policy"; then
    echo -e "${GREEN}✅ Content-Security-Policy header present${NC}"
  else
    echo -e "${YELLOW}⚠️  Content-Security-Policy header not found${NC}"
  fi
else
  echo -e "\n${YELLOW}⚠️  Server not running on localhost:3000, skipping header checks${NC}"
  echo -e "   Start server with 'pnpm dev' to check headers"
fi

# 4. Check for hardcoded secrets (basic check)
echo -e "\n🔐 Checking for potential hardcoded secrets..."
if grep -r "password.*=.*['\"].*[a-zA-Z0-9]" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | grep -v ".next" | grep -v "test" | head -5; then
  echo -e "${YELLOW}⚠️  Potential hardcoded passwords found (review manually)${NC}"
else
  echo -e "${GREEN}✅ No obvious hardcoded passwords found${NC}"
fi

# 5. Check for console.log in production code (security concern)
echo -e "\n📝 Checking for console.log in production code..."
if grep -r "console\.log" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | grep -v ".next" | grep -v "__tests__" | grep -v "test" | grep -v "scripts" | head -5; then
  echo -e "${YELLOW}⚠️  Found console.log statements (consider removing for production)${NC}"
else
  echo -e "${GREEN}✅ No console.log statements found in production code${NC}"
fi

# Summary
echo -e "\n📊 Security Check Summary"
echo -e "========================"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All critical security checks passed${NC}"
  exit 0
else
  echo -e "${RED}❌ Some security checks failed${NC}"
  exit 1
fi

