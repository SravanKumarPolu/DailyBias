#!/bin/bash

# Quick Start Script for Android Development
# This script helps you get started quickly

echo "🚀 DailyBias Android Quick Start"
echo "================================"
echo ""

# Check what's needed
echo "Checking prerequisites..."
echo ""

# Check Java
if java -version 2>&1 | grep -q "version"; then
    echo "✅ Java is installed"
    java -version
else
    echo "❌ Java is NOT installed"
    echo ""
    echo "Would you like to install Java via Homebrew? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Installing Java JDK 17..."
        brew install openjdk@17
        echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
        export JAVA_HOME=$(/usr/libexec/java_home -v 17)
        echo "✅ Java installed! Please restart your terminal or run: source ~/.zshrc"
    fi
fi

echo ""

# Check Android Studio
if [ -d "/Applications/Android Studio.app" ]; then
    echo "✅ Android Studio is installed"
else
    echo "❌ Android Studio is NOT installed"
    echo ""
    echo "Options:"
    echo "1. Install Android Studio (recommended - includes everything)"
    echo "   → Visit: https://developer.android.com/studio"
    echo ""
    echo "2. Use command line tools only (advanced)"
    echo "   → See NEXT_STEPS_GUIDE.md for instructions"
fi

echo ""
echo "================================"
echo ""

# Check if we can build
if [ -f "android/gradlew" ]; then
    echo "✅ Gradle wrapper is ready"
    echo ""
    echo "To build your app:"
    echo "  cd android"
    echo "  ./gradlew assembleDebug"
else
    echo "❌ Gradle wrapper not found"
fi

echo ""
echo "Next steps:"
echo "1. Install Java (if not installed): brew install openjdk@17"
echo "2. Install Android Studio: https://developer.android.com/studio"
echo "3. Sync your project: pnpm android:dev"
echo "4. Build: cd android && ./gradlew assembleDebug"
echo ""
echo "For detailed instructions, see: NEXT_STEPS_GUIDE.md"

