#!/bin/bash

# Check E2E setup and diagnose issues

echo "🔍 Checking E2E test setup..."

# Check if port 3000 is in use
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "⚠️  Port 3000 is already in use"
  echo "   Processes using port 3000:"
  lsof -ti:3000 | xargs ps -p
  echo ""
  echo "   To free the port, run: kill -9 \$(lsof -ti:3000)"
  echo "   Or set SKIP_WEBSERVER=1 to use existing server"
  echo ""
else
  echo "✅ Port 3000 is free"
fi

# Check if dev server responds
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 2 | grep -q "200\|404"; then
  echo "✅ Dev server is already running and responding"
  echo "   You can run: SKIP_WEBSERVER=1 pnpm e2e"
else
  echo "ℹ️  Dev server is not running (this is OK, Playwright will start it)"
fi

# Check Playwright installation
if command -v playwright > /dev/null 2>&1 || [ -d "node_modules/@playwright" ]; then
  echo "✅ Playwright is installed"
else
  echo "❌ Playwright is not installed"
  echo "   Run: pnpm install"
  exit 1
fi

# Check if browsers are installed
if [ -d "node_modules/@playwright/test" ]; then
  echo "✅ Playwright test package found"
  echo ""
  echo "💡 Tips:"
  echo "   - If tests hang, try: SKIP_WEBSERVER=1 pnpm e2e (after starting dev server manually)"
  echo "   - To see verbose output: pnpm e2e --reporter=list"
  echo "   - To run in UI mode: pnpm e2e:ui"
else
  echo "❌ Playwright test package not found"
  echo "   Run: pnpm install"
  exit 1
fi

echo ""
echo "✅ Setup looks good! Try running: pnpm e2e"

