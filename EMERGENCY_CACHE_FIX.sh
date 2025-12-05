#!/bin/bash

# 🔧 Build Cleanup Script
# Run this to clean build artifacts and force a fresh build

echo "🔧 Build Cleanup - Fresh Build"
echo "==============================="
echo ""

# 1. Clean Next.js build
echo "1️⃣  Cleaning Next.js build..."
rm -rf .next
echo "✅ Cleaned .next directory"
echo ""

# 2. Clean output directory
echo "2️⃣  Cleaning output directory..."
rm -rf out
echo "✅ Cleaned out directory"
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
echo ""
echo "✅ Build cleanup complete!"
