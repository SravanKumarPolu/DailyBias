#!/bin/bash

# Script to ensure ADB is running and stable before Capacitor operations
# This prevents conflicts when Android Studio is also managing ADB

ADB_PATH="${ANDROID_HOME:-$HOME/Library/Android/sdk}/platform-tools/adb"

# Function to check if ADB is responsive
check_adb() {
  local output
  output=$("$ADB_PATH" devices 2>&1)
  # Check if we get a device list or "daemon started" message
  echo "$output" | grep -qE "List of devices|daemon started successfully" && return 0
  return 1
}

# Try to start ADB server (will do nothing if already running)
"$ADB_PATH" start-server >/dev/null 2>&1

# Wait a moment for ADB to stabilize and detect devices
sleep 2

# Check if ADB is responsive - try multiple times
max_attempts=3
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if check_adb; then
    # ADB is working, verify we can see devices
    "$ADB_PATH" devices >/dev/null 2>&1
    exit 0
  fi
  attempt=$((attempt + 1))
  if [ $attempt -lt $max_attempts ]; then
    sleep 1
  fi
done

# If we get here, ADB might need a restart, but be careful not to conflict with Android Studio
# Only restart if absolutely necessary
echo "ADB check failed, but continuing to let Capacitor handle it..."
exit 0

