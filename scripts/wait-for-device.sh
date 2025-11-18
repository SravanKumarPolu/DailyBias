#!/bin/bash

# Script to wait for an Android device/emulator to be ready

ADB_PATH="${ANDROID_HOME:-$HOME/Library/Android/sdk}/platform-tools/adb"

echo "⏳ Waiting for Android device/emulator to be ready..."
echo "   (This may take 1-2 minutes if the emulator is booting)"

# First, wait for any device to appear (even offline)
echo "   Waiting for emulator to appear..."
max_initial_wait=60
initial_elapsed=0
while [ $initial_elapsed -lt $max_initial_wait ]; do
  if "$ADB_PATH" devices | grep -q "emulator"; then
    echo "   Emulator detected, waiting for it to boot..."
    break
  fi
  sleep 2
  initial_elapsed=$((initial_elapsed + 2))
done

# Now wait for device to be online and fully booted
echo "   Waiting for device to be ready..."
max_boot_wait=180
boot_elapsed=0
check_interval=3

while [ $boot_elapsed -lt $max_boot_wait ]; do
  # Check if device is online
  if "$ADB_PATH" devices | grep -q "device$"; then
    # Device is online, check if it's fully booted
    boot_completed=$("$ADB_PATH" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
    if [ "$boot_completed" = "1" ]; then
      echo "✅ Device is ready and fully booted!"
      "$ADB_PATH" devices
      exit 0
    fi
  fi
  
  # Show progress every 15 seconds
  if [ $((boot_elapsed % 15)) -eq 0 ] && [ $boot_elapsed -gt 0 ]; then
    status=$("$ADB_PATH" devices | grep emulator | awk '{print $2}' || echo "not found")
    echo "   Still booting... (${boot_elapsed}s / ${max_boot_wait}s) - Status: $status"
  fi
  
  sleep $check_interval
  boot_elapsed=$((boot_elapsed + check_interval))
done

# If wait-for-device didn't work, fall back to polling
echo "   Using fallback method..."
max_wait=120  # Maximum wait time in seconds
elapsed=0
check_interval=5

while [ $elapsed -lt $max_wait ]; do
  # Check if device is online
  if "$ADB_PATH" devices | grep -q "device$"; then
    echo "✅ Device is ready!"
    "$ADB_PATH" devices
    exit 0
  fi
  
  # Show progress every 10 seconds
  if [ $((elapsed % 10)) -eq 0 ] && [ $elapsed -gt 0 ]; then
    echo "   Still waiting... (${elapsed}s / ${max_wait}s)"
  fi
  
  sleep $check_interval
  elapsed=$((elapsed + check_interval))
done

echo "❌ Timeout: Device did not become ready within ${max_wait} seconds"
echo "   Current device status:"
"$ADB_PATH" devices
echo ""
echo "💡 Troubleshooting tips:"
echo "   1. Check if the emulator window is visible and booting"
echo "   2. Try restarting the emulator: pkill -9 qemu-system-x86_64 && pnpm android:emulator"
echo "   3. Start the emulator from Android Studio: Tools → Device Manager"
exit 1

