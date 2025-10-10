#!/bin/bash

# 🚨 Emergency Cache Fix Script
# Run this when users are stuck on old version

echo "🚨 Emergency Cache Fix - Forcing Update"
echo "========================================"
echo ""

# 1. Remove old service worker files
echo "1️⃣  Removing old service worker files..."
rm -rf public/sw.js public/workbox-*.js
echo "✅ Removed old SW files"
echo ""

# 2. Clean Next.js build
echo "2️⃣  Cleaning Next.js build..."
rm -rf .next
echo "✅ Cleaned .next directory"
echo ""

# 3. Update manifest version
echo "3️⃣  Updating manifest version..."
CURRENT_DATE=$(date +%s)
# This will be done manually in manifest.json
echo "⚠️  MANUAL STEP: Update version in public/manifest.json"
echo '   Example: "version": "1.0.'$CURRENT_DATE'"'
echo ""

# 4. Rebuild
echo "4️⃣  Running production build..."
pnpm build
echo "✅ Build complete"
echo ""

# 5. Show next steps
echo "5️⃣  Next steps:"
echo "   1. Verify build succeeded (check above for errors)"
echo "   2. Deploy to production:"
echo "      netlify deploy --prod"
echo "      OR"
echo "      vercel --prod"
echo "   3. Tell users to:"
echo "      - Clear browser cache, OR"
echo "      - Uninstall PWA and reinstall"
echo ""
echo "✅ Cache fix preparation complete!"
