#!/bin/bash
# Quick install script that doesn't wait indefinitely for emulator

set -e

ADB_PATH="${ANDROID_HOME:-$HOME/Library/Android/sdk}/platform-tools/adb"
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK not found. Building first..."
    cd "$(dirname "$0")/.."
    pnpm android:build:apk
    cd - > /dev/null
fi

# Check for devices (quick check, no long wait)
echo "📱 Checking for connected devices..."
DEVICES=$("$ADB_PATH" devices | grep -v "List of devices" | grep -v "^$" | wc -l | tr -d ' ')

if [ "$DEVICES" -eq "0" ]; then
    echo "⚠️  No devices found. Options:"
    echo "   1. Start emulator from Android Studio: Tools → Device Manager → Start"
    echo "   2. Connect a physical device via USB"
    echo "   3. Run: pnpm android:open (opens Android Studio)"
    echo ""
    echo "Once device is ready, run: pnpm android:install"
    exit 1
fi

# Install and launch
echo "📦 Installing APK..."
"$ADB_PATH" install -r "$APK_PATH"

echo "🚀 Launching app..."
"$ADB_PATH" shell am start -n com.dailybias.app/.MainActivity

echo "✅ App installed and launched!"






