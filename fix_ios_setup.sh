#!/bin/bash

# iOS Setup Fix Script
# This script helps fix iOS development setup

set -e

echo "🔍 Checking iOS setup requirements..."
echo ""

# Check if Xcode is installed
if [ -d "/Applications/Xcode.app" ]; then
    echo "✅ Xcode.app found in /Applications/"
    
    # Check current xcode-select path
    CURRENT_PATH=$(xcode-select -p)
    echo "📍 Current xcode-select path: $CURRENT_PATH"
    
    if [ "$CURRENT_PATH" != "/Applications/Xcode.app/Contents/Developer" ]; then
        echo ""
        echo "🔧 Fixing xcode-select path..."
        sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
        echo "✅ Xcode path updated!"
    else
        echo "✅ Xcode path is correct"
    fi
    
    # Accept license
    echo ""
    echo "📝 Accepting Xcode license..."
    sudo xcodebuild -license accept 2>/dev/null || echo "⚠️  License already accepted or needs manual acceptance"
    
    # Verify xcodebuild works
    echo ""
    echo "🔍 Verifying xcodebuild..."
    XCODE_VERSION=$(xcodebuild -version 2>&1 | head -1)
    echo "✅ $XCODE_VERSION"
    
else
    echo "❌ Xcode.app not found in /Applications/"
    echo ""
    echo "📥 Please install Xcode:"
    echo "   1. Open App Store"
    echo "   2. Search for 'Xcode'"
    echo "   3. Click 'Get' or 'Install'"
    echo "   4. Wait for download (~15 GB, 30-60 minutes)"
    echo "   5. Run this script again"
    exit 1
fi

# Check if CocoaPods is installed
echo ""
echo "🔍 Checking CocoaPods..."
if command -v pod &> /dev/null; then
    POD_VERSION=$(pod --version)
    echo "✅ CocoaPods installed: $POD_VERSION"
else
    echo "❌ CocoaPods not installed"
    echo ""
    echo "📥 Installing CocoaPods..."
    sudo gem install cocoapods
    echo "✅ CocoaPods installed!"
fi

# Install iOS dependencies
echo ""
echo "📦 Installing iOS dependencies..."
cd ios/App
pod install
cd ../..

echo ""
echo "✅ iOS setup complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: pnpm ios:sync"
echo "   2. Run: pnpm ios:open"
echo "   3. In Xcode: Select simulator → Click Run ▶️"

